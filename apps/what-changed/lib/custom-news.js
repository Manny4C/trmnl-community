import {createHash} from 'node:crypto';
import {compilePrompt,matchScore,containsTerm} from '../public/prompt.js';
import {getSourcePool,cleanText,canonicalUrl,deduplicate} from './news.js';
const cache=new Map(),pending=new Map();
let lastSearchAt=0;
export function parseArticles(data,now=Date.now()) {
  return (Array.isArray(data?.articles)?data.articles:[]).flatMap(a=>{
    const url=canonicalUrl(a.url),title=cleanText(a.title).slice(0,140);
    const date=String(a.seendate||'').replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,'$1-$2-$3T$4:$5:$6Z');
    const time=Date.parse(date);
    if(!url||!title||!Number.isFinite(time)||time>now+3600000||time<now-7*86400000)return [];
    if(/\b(?:fuck\w*|shit|cunt|rape|raped|sexual assault|behead\w*|gore|porn\w*|suicide|torture)\b/i.test(title))return [];
    const source=new URL(url).hostname.replace(/^www\./,'').slice(0,40);
    return [{id:createHash('sha256').update(url).digest('hex').slice(0,12),fingerprint:createHash('sha256').update(title).digest('hex').slice(0,12),title,snippet:'Open the source for the full reporting.',url,source,published_at:new Date(time).toISOString(),time_kind:'indexed'}];
  });
}
export async function getCustomBriefing(prompt,{fetcher=fetch,now=Date.now(),poolFetcher=getSourcePool}={}) {
  const compiled=compilePrompt(prompt);
  const key=createHash('sha256').update(compiled.prompt).digest('hex').slice(0,16);
  const cached=cache.get(key);
  if(cached&&now-cached.at<900000)return cached.body;
  if(pending.has(key))return pending.get(key);
  const work=(async()=>{
    const poolPromise=poolFetcher({fetcher,now}).catch(()=>null);
    let searchOk=false,searchStories=[];
    try {
      // Bound the public search workload; existing source feeds remain available between searches.
      if(now-lastSearchAt<6000)throw new Error('Search cooling down');
      lastSearchAt=now;
      const u=new URL('https://api.gdeltproject.org/api/v2/doc/doc');
      for(const [k,v] of Object.entries({query:compiled.query,mode:'ArtList',maxrecords:'75',format:'json',sort:'DateDesc',timespan:'7d'}))u.searchParams.set(k,v);
      const r=await fetcher(u.href,{signal:AbortSignal.timeout(10000),headers:{'User-Agent':'TheDailyTRMNL/2.0'}});
      if(!r.ok)throw new Error('Search unavailable');
      const text=await r.text();if(text.length>1500000)throw new Error('Response too large');
      const result=JSON.parse(text);
      if(!Array.isArray(result.articles))throw new Error('Search unavailable');
      searchStories=parseArticles(result,now).filter(s=>matchScore(s,{include:[],exclude:compiled.exclude,excludeWords:compiled.excludeWords})>=0);
      searchOk=true;
    } catch {}
    const pool=await poolPromise;
    const feedStories=(pool?.stories||[]).filter(s=>matchScore(s,compiled)>0);
    const ordered=deduplicate([...feedStories,...searchStories].sort((a,b)=>
      matchScore(b,compiled)-matchScore(a,compiled)||Date.parse(b.published_at)-Date.parse(a.published_at)));
    const counts={};const diverse=ordered.filter(s=>{counts[s.source]=(counts[s.source]||0)+1;return counts[s.source]<=3;});
    const representatives=[];
    for(const group of compiled.includeGroups){const candidate=ordered.find(s=>!representatives.includes(s)&&group.some(t=>containsTerm((s.title+' '+s.snippet).toLowerCase(),t)));if(candidate)representatives.push(candidate);}
    const selected=[...representatives,...diverse.filter(s=>!representatives.includes(s)),...ordered.filter(s=>!representatives.includes(s)&&!diverse.includes(s))].slice(0,8);
    if(!selected.length && !searchOk && cached?.body.stories.length && now-cached.at<86400000){
      return {...cached.body,stale:true,unavailable_sources:[...new Set([...(pool?.unavailable_sources||[]),'Global news search'])],notice:'Search coverage is temporarily reduced. Showing the last successful briefing.'};
    }
    const anyLive=searchOk||Boolean(pool&&!pool.stale);
    if(!anyLive) {
      if(cached&&now-cached.at<86400000)return {...cached.body,stale:true,notice:'Sources unavailable. Showing the last successful briefing.'};
      throw new Error('News sources are temporarily unavailable.');
    }
    const unavailable=pool?[...new Set(pool.unavailable_sources||[])]:['News feeds'];
    if(!searchOk)unavailable.push('Global news search');
    const body={topic:'custom',topic_label:'Your brief',feed_key:key,prompt:compiled.prompt,fetched_at:searchOk?new Date(now).toISOString():pool.fetched_at,stale:false,empty:selected.length===0,unavailable_sources:unavailable,stories:selected};
    if(searchStories.length)body.attribution={name:'GDELT Project',url:'https://www.gdeltproject.org/'};
    if(body.empty)body.notice='No matching stories in the available sources. Try a broader topic or fewer exclusions.';
    while(Buffer.byteLength(JSON.stringify(body))>4800&&body.stories.length>1)body.stories.pop();
    if(cache.size>=100)cache.delete(cache.keys().next().value);
    cache.set(key,{at:now,body});return body;
  })();
  pending.set(key,work);
  try{return await work;}finally{pending.delete(key);}
}
