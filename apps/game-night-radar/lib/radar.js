import {createHash} from 'node:crypto';
import {parseApps,gameName} from '../public/catalog.js';
export const ORIGIN='https://game-night-radar.vercel.app',FEED='steam_community_announcements';
const TTL=30*60*1000,STALE=6*60*60*1000,MAX_RESPONSE=256000;
export function options(q){
 const apps=parseApps(q.get('apps')??undefined),days=Number(q.get('days')??30),count=Number(q.get('count')??8),kind=q.get('kind')??'all',format=q.get('format')??'web';
 if(![7,30,90].includes(days))throw Error('Choose a 7, 30 or 90 day window.');
 if(![4,6,8].includes(count))throw Error('Choose 4, 6 or 8 posts.');
 if(!['all','updates','events'].includes(kind))throw Error('Choose all, updates or events.');
 if(!['web','trmnl'].includes(format))throw Error('Unknown response format.');
 const key=createHash('sha256').update(JSON.stringify([apps,days,count,kind])).digest('hex').slice(0,20);
 return {apps,days,count,kind,format,key};
}
const plain=(v,max=130)=>[...String(v??'').replace(/<[^>]*>/g,' ').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim()].slice(0,max).join('');
export function classify(title){if(/\b(patch|hotfix|update|fixes?|version)\b/i.test(title))return 'Update';if(/\b(event|halloween|anniversary|tournament|weekend|season|festival|celebration)\b/i.test(title))return 'Event';return 'News';}
export function parseNews(data,appid,now){
 if(data?.appnews?.appid!==appid||!Array.isArray(data.appnews.newsitems))throw Error('Invalid Steam response.');
 const seen=new Set();return data.appnews.newsitems.slice(0,24).flatMap(item=>{
  if(!item||item.appid!==appid||item.feedname!==FEED||!/^\d{1,22}$/.test(String(item.gid)))return [];
  const gid=String(item.gid),title=plain(item.title),timestamp=Number(item.date)*1000;
  if(!title||!Number.isSafeInteger(item.date)||timestamp<946684800000||timestamp>now+5*60000||seen.has(gid))return [];
  let u;try{u=new URL(item.url);}catch{return [];}
  if(u.protocol!=='https:'||u.username||u.password||u.port||!['steamcommunity.com','store.steampowered.com','steamstore-a.akamaihd.net'].includes(u.hostname))return [];
  if(u.hostname==='steamstore-a.akamaihd.net'&&u.pathname!==`/news/externalpost/${FEED}/${gid}`)return [];
  seen.add(gid);return [{id:appid+':'+gid,gid,appid,game:gameName(appid),title,kind:classify(title),published_at:new Date(timestamp).toISOString(),url:u.href,source:'Steam developer announcement'}];
 });
}
export function createService({fetcher=fetch,now=Date.now}={}){
 const cache=new Map(),pending=new Map();
 const load=async appid=>{
  const t=now(),old=cache.get(appid);
  if(old&&t-old.checked<TTL)return {...old,stale:false};
  if(pending.has(appid))return pending.get(appid);
  const task=(async()=>{try{
   const u=new URL('https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/');u.search=new URLSearchParams({appid:String(appid),count:'24',maxlength:'1',feeds:FEED});
   const r=await fetcher(u,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(9000),redirect:'error'});
   if(!r.ok||Number(r.headers.get('content-length')||0)>MAX_RESPONSE)throw Error('Steam unavailable.');
   const reader=r.body?.getReader();let text='';if(reader){const chunks=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_RESPONSE){await reader.cancel();throw Error('Steam response too large.');}chunks.push(value);}text=new TextDecoder().decode(Buffer.concat(chunks));}else{text=await r.text();if(Buffer.byteLength(text)>MAX_RESPONSE)throw Error('Steam response too large.');}
   const rows=parseNews(JSON.parse(text),appid,t),saved={rows,checked:t};cache.delete(appid);cache.set(appid,saved);if(cache.size>128)cache.delete(cache.keys().next().value);return {...saved,stale:false};
  }catch(e){if(old&&t-old.checked<STALE)return {...old,stale:true};throw e;}finally{pending.delete(appid);}})();pending.set(appid,task);return task;
 };
 return async config=>{
  const t=now(),results=await Promise.allSettled(config.apps.map(load)),unavailable=[],cached=[];let rows=[],sourceTimes=[];
  results.forEach((r,i)=>{if(r.status==='rejected'){unavailable.push(config.apps[i]);return;}rows.push(...r.value.rows);sourceTimes.push(r.value.checked);if(r.value.stale)cached.push(config.apps[i]);});
  if(unavailable.length===config.apps.length)throw Error('Steam announcements are unavailable. Please try again later.');
  rows=rows.filter(r=>Date.parse(r.published_at)>=t-config.days*86400000&&(config.kind==='all'||r.kind===(config.kind==='updates'?'Update':'Event'))).sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at)||a.id.localeCompare(b.id)).slice(0,config.count);
  const body={key:config.key,checked_at:new Date(t).toISOString(),source_checked_at:new Date(Math.min(...sourceTimes)).toISOString(),days:config.days,count:config.count,kind:config.kind,games:config.apps.map(id=>({id,name:gameName(id)})),partial:!!unavailable.length,stale:!!cached.length,unavailable_apps:unavailable,cached_apps:cached,empty:rows.length===0,items:rows,source:'Steam developer announcements',coverage:'Up to 24 recent developer posts per selected game. Labels use title words; an event post is not a verified event start time.'};
  if(config.format!=='trmnl')return body;
  const compact={key:body.key,checked_at:body.checked_at,source_checked_at:body.source_checked_at,days:body.days,count:body.count,kind:body.kind,games:body.games.map(g=>[g.id,g.name]),partial:body.partial,stale:body.stale,unavailable_apps:unavailable,cached_apps:cached,empty:body.empty,rows:rows.map(r=>[r.gid,r.appid,r.title,r.kind,Math.floor(Date.parse(r.published_at)/1000)])};
  for(const max of [100,80,60,40]){compact.rows.forEach(row=>row[2]=plain(row[2],max));if(Buffer.byteLength(JSON.stringify(compact))<=4600)return compact;}
  throw Error('The announcement response exceeded the display budget.');
 };
}
