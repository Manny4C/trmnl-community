import {edit} from '../public/engine.js';
export const CITIES={off:{name:'No weather'},sf:{name:'San Francisco',lat:37.7749,lon:-122.4194},nyc:{name:'New York',lat:40.7128,lon:-74.0060},seattle:{name:'Seattle',lat:47.6062,lon:-122.3321},la:{name:'Los Angeles',lat:34.0522,lon:-118.2437},austin:{name:'Austin',lat:30.2672,lon:-97.7431},chicago:{name:'Chicago',lat:41.8781,lon:-87.6298}};
export const REPOS={node:'nodejs/node',react:'facebook/react',next:'vercel/next.js',off:null};
const HN='https://hacker-news.firebaseio.com/v0/',NWS='https://api.weather.gov';
export function options(p){
 const choice=(key,fallback,allowed)=>{const v=p.get(key)||fallback;if(!allowed.includes(v))throw Error(`Invalid ${key}.`);return v;};
 const mode=choice('mode','balanced',['balanced','builder','quiet']);
 const city=choice('city','off',Object.keys(CITIES)),repo=choice('repo','node',Object.keys(REPOS));
 const cadence=Number(choice('cadence','60',['30','60','120']));
 const timezone=p.get('timezone')||'America/Los_Angeles';if(timezone.length>80)throw Error('Invalid time zone.');
 try{new Intl.DateTimeFormat('en-US',{timeZone:timezone}).format();}catch{throw Error('Use an IANA time zone, such as America/Los_Angeles.');}
 const topics=(p.get('topics')||'').trim();if(topics.length>100)throw Error('Topic words must be at most 100 characters.');
 const words=[...new Set(topics.toLowerCase().match(/[\p{L}\p{N}+#]+/gu)||[])].filter(w=>w.length>1).slice(0,10);
 if(topics&&!words.length)throw Error('Enter at least one topic word with two letters.');
 return {mode,city,repo,cadence,timezone,topics,words};
}
export function clean(s,max=200){return String(s??'').replace(/<[^>]*>/g,' ').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(Math.min(parseInt(n,16),0x10ffff))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Math.min(Number(n),0x10ffff))).replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
export function safeUrl(raw,hosts=null){try{const u=new URL(raw);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&(!hosts||hosts.includes(u.hostname))?u.href:null;}catch{return null;}}
async function json(fetcher,url,headers={}){
 const res=await fetcher(url,{headers:{'User-Agent':'DeskEditor/1.0 (https://github.com/Manny4C/trmnl-community/issues)',Accept:'application/json',...headers},signal:AbortSignal.timeout(5000),redirect:'error'});
 if(!res.ok)throw Error('Source unavailable');
 const reader=res.body?.getReader();if(!reader)return res.json();let chunks=[],size=0;try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1500000){await reader.cancel();throw Error('Source too large');}chunks.push(value);}}finally{reader.releaseLock();}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function loadNews(fetcher,now){
 const ids=await json(fetcher,HN+'topstories.json');if(!Array.isArray(ids))throw Error('Invalid HN index');
 const queue=ids.filter(Number.isSafeInteger).slice(0,24),items=[];let attempted=0,successful=0;
 await Promise.all(Array.from({length:6},async()=>{while(queue.length){const id=queue.shift();attempted++;try{const item=await json(fetcher,`${HN}item/${id}.json`);successful++;if(item?.id!==id||item.type!=='story'||item.dead||item.deleted||!Number.isFinite(item.time)||item.time*1000>now.getTime()+60000||now.getTime()-item.time*1000>72*3600000)continue;const title=clean(item.title,160);if(!title)continue;items.push({id:`hn-${id}`,kind:'story',title,summary:`${Math.max(0,Math.floor(Number(item.score)||0))} points · ${Math.max(0,Math.floor(Number(item.descendants)||0))} comments on Hacker News.`,source:'Hacker News',source_url:`https://news.ycombinator.com/item?id=${id}`,article_url:safeUrl(item.url),published_at:new Date(item.time*1000).toISOString()});}catch{}}}));
 if(successful===0&&attempted)throw Error('HN items unavailable');
 return {cards:items,partial:successful<attempted};
}
export async function loadRelease(fetcher,key){
 const repo=REPOS[key];const r=await json(fetcher,`https://api.github.com/repos/${repo}/releases/latest`,{'X-GitHub-Api-Version':'2022-11-28'});
 const url=safeUrl(r.html_url,['github.com']);if(!url||!new URL(url).pathname.startsWith(`/${repo}/releases/`)||r.draft||r.prerelease||!Number.isFinite(Date.parse(r.published_at)))throw Error('Invalid release');
 return {cards:[{id:`release-${key}-${r.id}`,kind:'release',title:clean(`${repo} · ${r.tag_name}`,140),summary:'A published stable release. Open the maintainer’s release notes for changes and upgrade guidance.',source:'GitHub Releases',source_url:url,published_at:r.published_at}],partial:false};
}
export async function loadForecast(fetcher,key,now){
 const city=CITIES[key];const point=await json(fetcher,`${NWS}/points/${city.lat},${city.lon}`);
 const url=safeUrl(point.properties?.forecast,['api.weather.gov']);if(!url||!new URL(url).pathname.startsWith('/gridpoints/'))throw Error('Invalid forecast URL');
 const forecast=await json(fetcher,url);const period=forecast.properties?.periods?.find(p=>Date.parse(p.startTime)<=now.getTime()&&Date.parse(p.endTime)>now.getTime())||forecast.properties?.periods?.find(p=>Date.parse(p.startTime)>now.getTime());
 const stamp=forecast.properties?.updateTime||forecast.properties?.generatedAt;
 if(!period||!Number.isFinite(Date.parse(stamp))||Date.parse(stamp)>now.getTime()+60000||now.getTime()-Date.parse(stamp)>36*3600000)throw Error('No recent forecast period');
 return {cards:[{id:`weather-${key}-${period.startTime}`,kind:'weather',title:clean(`${city.name} · ${period.temperature}°${period.temperatureUnit} · ${period.shortForecast}`,160),summary:clean(`${period.name}: ${period.detailedForecast}`,300),source:'National Weather Service',source_url:`https://forecast.weather.gov/MapClick.php?lat=${city.lat}&lon=${city.lon}`,published_at:new Date(stamp).toISOString(),expires_at:period.endTime}],partial:false};
}
export async function loadAlerts(fetcher,key,now){
 const city=CITIES[key];const data=await json(fetcher,`${NWS}/alerts/active?point=${city.lat},${city.lon}`);
 if(!Array.isArray(data.features))throw Error('Invalid alert response');
 const cards=data.features.map(f=>f.properties).filter(p=>p&&p.status==='Actual'&&['Severe','Extreme'].includes(p.severity)&&['Observed','Likely'].includes(p.certainty)&&Date.parse(p.effective)<=now.getTime()&&Date.parse(p.expires)>now.getTime()&&(!p.onset||Date.parse(p.onset)<=now.getTime())).sort((a,b)=>(b.severity==='Extreme')-(a.severity==='Extreme')||Date.parse(b.sent)-Date.parse(a.sent)).slice(0,1).map(p=>({id:`alert-${key}-${p.sent}`,kind:'alert',title:clean(p.headline||p.event,160),summary:clean(p.instruction||p.description,300),source:'NWS active alert',source_url:`https://forecast.weather.gov/MapClick.php?lat=${city.lat}&lon=${city.lon}`,published_at:p.sent,expires_at:p.expires}));
 return {cards,partial:false};
}
export function createService({fetcher=fetch,clock=()=>new Date()}={}){
 const cache=new Map(),pending=new Map();
 async function source(key,ttl,staleMs,loader){
  const now=clock(),hit=cache.get(key);if(hit&&now.getTime()-hit.time<ttl)return {...hit.value,checked_at:new Date(hit.time).toISOString(),state:hit.value.partial?'partial':'fresh'};
  if(pending.has(key))return pending.get(key);
  const task=(async()=>{try{const value=await loader(now);const stamp=clock().getTime();cache.set(key,{value,time:stamp});return {...value,checked_at:new Date(stamp).toISOString(),state:value.partial?'partial':'fresh'};}catch{if(hit&&now.getTime()-hit.time<staleMs)return {...hit.value,checked_at:new Date(hit.time).toISOString(),state:'stale'};return {cards:[],checked_at:null,state:'unavailable'};}finally{pending.delete(key);}})();
  pending.set(key,task);return task;
 }
 return async config=>{
  const jobs=[['Hacker News',()=>source('news',10*60000,24*3600000,n=>loadNews(fetcher,n))]];
  if(config.repo!=='off')jobs.push(['GitHub Releases',()=>source(`repo-${config.repo}`,3600000,24*3600000,()=>loadRelease(fetcher,config.repo))]);
  if(config.city!=='off'){jobs.push(['NWS forecast',()=>source(`forecast-${config.city}`,15*60000,3*3600000,n=>loadForecast(fetcher,config.city,n))]);jobs.push(['NWS alerts',()=>source(`alerts-${config.city}`,5*60000,0,n=>loadAlerts(fetcher,config.city,n))]);}
  const loaded=await Promise.all(jobs.map(async([name,fn])=>({name,...await fn()})));
  const now=clock(),candidates=loaded.flatMap(s=>s.cards.map(c=>({...c,checked_at:s.checked_at,stale:s.state==='stale'}))).filter(c=>c.kind!=='release'||Date.parse(c.published_at)<=now.getTime()+60000).filter(c=>c.kind!=='story'||now.getTime()-Date.parse(c.published_at)<=72*3600000).filter(c=>c.kind!=='story'||!config.words.length||config.words.some(w=>(clean(c.title).toLowerCase().match(/[\p{L}\p{N}+#]+/gu)||[]).includes(w)));
  const selection=edit(candidates,config,now);
  return {app:'Desk Editor',checked_at:now.toISOString(),config:{...config,words:undefined},location:CITIES[config.city].name,...selection,candidates,sources:loaded.map(({name,state,checked_at})=>({name,state,checked_at})),partial:loaded.some(s=>s.state!=='fresh'),agent_type:'rules-based; no language model',coverage:'Up to 24 HN front-page items from the last 72 hours; one stable GitHub release; optional US NWS forecast and severe/extreme alerts. Routine cards are original suggestions, not calendar data.'};
 };
}
function byteTrim(value,max){let s=clean(value,1000);while(Buffer.byteLength(s,'utf8')>max)s=s.slice(0,-1);return s;}
export function devicePayload(data){return {checked_at:data.checked_at,phase:data.context.phase,local_day:data.context.day,timezone:data.config.timezone,mode:data.config.mode,location:data.location,next_selection_at:data.next_selection_at,partial:data.partial,cards:data.cards.map(c=>({kind:c.kind,title:byteTrim(c.title,220),summary:byteTrim(c.summary,400),reason:byteTrim(c.reason,220),source:c.source,published_at:c.published_at,checked_at:c.checked_at,stale:c.stale})),source_status:data.sources.map(s=>`${s.name}: ${s.state}`).join(' · ')};}
