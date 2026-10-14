import {createHash} from 'node:crypto';
export const SECTORS={all:'All sectors',ai:'AI & agents',developer:'Developer tools',robotics:'Robotics & hardware',health:'Health & biotech',finance:'Finance & insurance',business:'Business software',climate:'Climate & energy',consumer:'Consumer & games'};
const RULES={ai:/\b(ai|llm|agents?|inference|machine learning|neural)\b/i,developer:/\b(api|code|coding|developer|software development|mcp|database|infrastructure|sandboxes|open.source)\b/i,robotics:/\b(robot|robotics|humanoid|hardware|physical world|manufactur|drone|sensor)/i,health:/\b(health|medical|biotech|peptide|glp.1|doctor|patient|drug|clinical|hospital)/i,finance:/\b(financ|bank|insurance|payment|trading|accounting|tax|investment|credit)/i,business:/\b(company|companies|business|sales|support|customer|enterprise|recruit|hiring|workflow|document|docx)/i,climate:/\b(climate|energy|carbon|battery|solar|electric|sustainab)/i,consumer:/\b(game|gaming|consumer|travel|shopping|music|video|food|social|fitness)/i};
export function options(params){
 const get=k=>String(params.get(k)||'').trim();
 const sector=get('sector')||'all',batch=get('batch').toUpperCase(),days=get('days')||'90',mode=get('mode')||'latest',q=get('q');
 if(!Object.hasOwn(SECTORS,sector)||!['30','90','365'].includes(days)||!['latest','discover'].includes(mode)||batch&&!/^[WSPFX]\d{2}$/.test(batch)||q.length>80)throw new RangeError('Choose a supported sector, 30/90/365 days, latest/discover, and an optional batch such as S26. Search is limited to 80 characters.');
 return {sector,batch,days:Number(days),mode,q};
}
export function normalizeItem(item,now=Date.now()){
 if(!item||item.deleted||item.dead||item.type!=='story'||!Number.isSafeInteger(item.id)||item.id<=0||!Number.isFinite(item.time))return null;
 const m=String(item.title||'').match(/^Launch HN:\s*(.{1,80}?)\s*\(YC\s+([WSPFX]\d{2})\)\s*[-–—:]\s*(.{1,220})$/i);
 if(!m||item.time*1000>now+300000)return null;
 const name=m[1].trim(),description=m[3].trim();
 return {id:String(item.id),name,batch:m[2].toUpperCase(),description,published_at:new Date(item.time*1000).toISOString(),url:`https://news.ycombinator.com/item?id=${item.id}`,sectors:Object.entries(RULES).filter(([,r])=>r.test(description)).map(([k])=>k)};
}
export function selectCompanies(items,config,now=Date.now()){
 let companies=items.filter(c=>new Date(c.published_at).getTime()>=now-config.days*86400000&&(!config.batch||c.batch===config.batch)&&(config.sector==='all'||c.sectors.includes(config.sector))&&(!config.q||`${c.name} ${c.description}`.toLowerCase().includes(config.q.toLowerCase()))).sort((a,b)=>b.published_at.localeCompare(a.published_at)||Number(b.id)-Number(a.id));
 const total=companies.length;
 if(config.mode==='discover'){
  const day=new Date(now).toISOString().slice(0,10);
  companies=companies.map(c=>({c,h:createHash('sha256').update(day+':'+c.id).digest('hex')})).sort((a,b)=>a.h.localeCompare(b.h)).map(x=>x.c);
 }
 return {companies:companies.slice(0,6),total};
}
export async function jsonFetch(url,fetcher=fetch){
 const response=await fetcher(url,{signal:AbortSignal.timeout(6000),headers:{'Accept':'application/json','User-Agent':'YC-Scout/1.0 (https://yc-launch-scout.vercel.app)'}});
 if(!response.ok)throw new Error('Source unavailable');
 return response.json();
}
export async function loadPool(fetcher=fetch,now=Date.now()){
 // Search discovers IDs only. Every displayed title, batch and timestamp comes from the official HN API.
 const search=await jsonFetch('https://hn.algolia.com/api/v1/search_by_date?query=Launch%20HN&restrictSearchableAttributes=title&tags=story&hitsPerPage=200&typoTolerance=false',fetcher);
 if(!Array.isArray(search.hits))throw new Error('Invalid search response');
 const ids=[...new Set(search.hits.filter(h=>/^Launch HN:.*\(YC\s+[WSPFX]\d{2}\)/i.test(h.title||'')).map(h=>Number(h.objectID)).filter(id=>Number.isSafeInteger(id)&&id>0))].slice(0,80);
 if(!ids.length)throw new Error('Launch source returned no valid IDs');
 const companies=[];let failures=0,next=0;const deadline=Date.now()+18000;
 await Promise.all(Array.from({length:Math.min(10,ids.length)},async()=>{
  while(next<ids.length){if(Date.now()>deadline){failures+=ids.length-next;next=ids.length;break;}const id=ids[next++];try{const item=await jsonFetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`,fetcher);const c=normalizeItem(item,now);if(c&&Number(c.id)===id)companies.push(c);}catch{failures++;}}
 }));
 if(!companies.length)throw new Error('Official HN verification unavailable');
 return {companies,partial:failures>0,verified_at:new Date(now).toISOString()};
}
export function createService({fetcher=fetch,clock=Date.now}={}){
 let cache=null,pending=null;
 return async config=>{
  const now=clock();let stale=false,pool;
  if(cache&&now-cache.at<3600000)pool=cache.pool;
  else{
   if(!pending)pending=loadPool(fetcher,now).then(p=>{cache={pool:p,at:now};return p;}).finally(()=>{pending=null;});
   try{pool=await pending;}catch(error){if(cache&&now-cache.at<24*3600000){pool=cache.pool;stale=true;}else throw error;}
  }
  const {companies,total}=selectCompanies(pool.companies,config,now);
  const result={name:'YC Scout',config,filter_label:`${SECTORS[config.sector]}${config.batch?' · '+config.batch:''} · ${config.days}d`,mode_label:config.mode==='discover'?'Daily discovery':'Latest launches',edition_day:new Date(now).toISOString().slice(0,10),fetched_at:pool.verified_at,stale,partial:pool.partial,empty:total===0,total,coverage_count:pool.companies.length,companies};
  while(Buffer.byteLength(JSON.stringify(result))>4700&&result.companies.length>1)result.companies.pop();
  return result;
 };
}
