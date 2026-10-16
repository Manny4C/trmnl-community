import {XMLParser,XMLValidator} from 'fast-xml-parser';
import {createHash} from 'node:crypto';
export const INTERESTS={technology:'Technology',ai:'AI & breakthroughs',gaming:'Video games',baseball:'Baseball',basketball:'Basketball',ev:'Tesla & electric cars',creators:'New video drops',space:'Space & science'};
const youtube=(id,name,channel,interests)=>({id,name,url:`https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`,interests,kind:'video',links:['www.youtube.com','youtube.com'],images:['i.ytimg.com','i1.ytimg.com','i2.ytimg.com','i3.ytimg.com','i4.ytimg.com']});
export const FEEDS=[
 youtube('mlb','MLB','UCoLrcjPV5PbUrUyXq5mjc_A',['baseball']),
 youtube('nba','NBA','UCWJ2lWNubArHWmf3FIHbfcQ',['basketball']),
 youtube('tesla','Tesla','UC5WjFrtBdufl6CZojX3D8dQ',['ev','technology']),
 youtube('mkbhd','Marques Brownlee','UCBJycsmduvYEL83R_U4JriQ',['creators','technology']),
 youtube('nintendo','Nintendo','UCGIY_O-8vW4rfX98KlMkvRg',['gaming']),
 youtube('xbox','Xbox','UCjBp_7RuDBUYbd1LegWEJ8g',['gaming']),
 youtube('playstation','PlayStation','UC-2Y8dQb0S6DtpxNgAKoJKA',['gaming']),
 youtube('openai','OpenAI','UCXZCJLdBC09xxGZ6gcdrc6A',['ai']),
 youtube('deepmind','Google DeepMind','UCP7jMXSY2xbc3KCAE0MHQ-A',['ai']),
 {id:'google-ai',name:'Google AI',url:'https://blog.google/innovation-and-ai/technology/ai/rss/',interests:['ai','technology'],kind:'article',links:['blog.google'],images:['storage.googleapis.com','blog.google']},
 {id:'nvidia',name:'NVIDIA',url:'https://blogs.nvidia.com/feed/',interests:['ai','technology','gaming'],kind:'article',links:['blogs.nvidia.com'],images:['blogs.nvidia.com','www.nvidia.com']},
 {id:'nasa',name:'NASA',url:'https://www.nasa.gov/feed/',interests:['space'],kind:'article',links:['www.nasa.gov','nasa.gov'],images:['www.nasa.gov','nasa.gov','images-assets.nasa.gov','science.nasa.gov']}
];
const parser=new XMLParser({ignoreAttributes:false,processEntities:true,htmlEntities:true});
const list=v=>v===undefined?[]:Array.isArray(v)?v:[v];
export function clean(s,max=200){if(s&&typeof s==='object')s=s['#text']||'';return String(s??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
export function safeUrl(raw,hosts){try{const u=new URL(String(raw));if(u.protocol!=='https:'||u.username||u.password||u.port||u.href.length>1200||!hosts.includes(u.hostname))return null;if(u.hostname==='storage.googleapis.com'&&!u.pathname.startsWith('/gweb-uniblog-publish-prod/'))return null;return u.href;}catch{return null;}}
export function options(p){
 const raw=p.get('interests')??'technology,ai,gaming,baseball,ev,creators,space';
 const interests=[...new Set(raw.split(',').map(x=>x.trim()).filter(Boolean))];
 if(!interests.length||interests.length>8||interests.some(x=>!INTERESTS[x]))throw Error('Choose one or more supported interests.');
 const follow=clean(p.get('follow')||'',101);if(follow.length>100)throw Error('Follow words must be 100 characters or fewer.');
 const words=[...new Set(follow.toLowerCase().match(/[\p{L}\p{N}+#]+/gu)||[])].filter(w=>w.length>1).slice(0,12);
 if(follow&&!words.length)throw Error('Use at least one follow word with two letters.');
 const hours=Number(p.get('hours')||48);if(![24,48,72].includes(hours))throw Error('Choose 24, 48 or 72 hours.');
 return {interests,follow,words,hours};
}
function imageFor(entry,feed){
 const group=entry['media:group']||{},content=entry['content:encoded']||entry.content||entry.description||entry.summary||'';
 const html=typeof content==='object'?content['#text']||'':String(content);
 const images=[...list(group['media:thumbnail']),...list(entry['media:content']),...list(entry['media:thumbnail']),...list(entry.enclosure).filter(x=>String(x['@_type']).startsWith('image/'))].map(x=>({url:x?.['@_url'],width:Number(x?.['@_width'])||0}));
 for(const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi))images.push({url:match[1].replace(/&amp;/g,'&'),width:0});
 for(const item of images.sort((a,b)=>b.width-a.width)){const url=safeUrl(item.url,feed.images);if(!url||/avatar|author|logo|icon|\/150[/?]|w=150\b/i.test(url))continue;return {url,kind:feed.kind==='video'?'video_thumbnail':'publisher_image',credit:feed.name,caption:feed.kind==='video'?`${feed.name} video preview thumbnail`:`Image supplied with this ${feed.name} story`,width:item.width};}
 return null;
}
export function parseFeed(xml,feed,now=Date.now()){
 if(xml.length>1500000||/<!DOCTYPE|<!ENTITY/i.test(xml)||XMLValidator.validate(xml)!==true)throw Error('Invalid source feed.');
 const data=parser.parse(xml);const entries=list(data.feed?.entry||data.rss?.channel?.item);
 return entries.flatMap(e=>{
  const title=clean(e.title,180);let link=e.link;if(Array.isArray(link))link=link.find(l=>l['@_rel']==='alternate')||link[0];if(link&&typeof link==='object')link=link['@_href'];
  const url=safeUrl(link,feed.links),stamp=Date.parse(e.pubDate||e.published||e.updated||'');
  const image=imageFor(e,feed);if(!title||!url||!image||!Number.isFinite(stamp)||stamp>now+60000||now-stamp>72*3600000)return [];
  if(/\b(?:gore|behead\w*|porn\w*|sexual assault|suicide)\b/i.test(title))return [];
  return [{id:createHash('sha256').update(url).digest('hex').slice(0,16),title,url,source:feed.name,source_id:feed.id,kind:feed.kind,interests:feed.interests,published_at:new Date(stamp).toISOString(),excerpt:clean(e.description||e.summary||'',180),image}];
 }).slice(0,18);
}
async function text(fetcher,url){
 const r=await fetcher(url,{headers:{'User-Agent':'Newsflash/2.0 (https://github.com/Manny4C/trmnl-community/issues)'},signal:AbortSignal.timeout(7000),redirect:'error'});if(!r.ok)throw Error('Source unavailable');
 const reader=r.body?.getReader();if(!reader){const s=await r.text();if(s.length>1500000)throw Error('Source too large');return s;}
 const chunks=[];let size=0;try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1500000){await reader.cancel();throw Error('Source too large');}chunks.push(value);}}finally{reader.releaseLock();}return Buffer.concat(chunks).toString('utf8');
}
export function createPool({fetcher=fetch,clock=()=>Date.now()}={}){
 let cache=null,pending=null;
 return async()=>{const now=clock();if(cache&&now-cache.at<10*60000)return cache.body;if(pending)return pending;
 pending=(async()=>{const replies=await Promise.all(FEEDS.map(async feed=>{try{return {name:feed.name,id:feed.id,ok:true,stories:parseFeed(await text(fetcher,feed.url),feed,now)};}catch{return {name:feed.name,id:feed.id,ok:false,stories:[]};}}));
 const successful=replies.filter(r=>r.ok);if(!successful.length){if(cache&&now-cache.at<6*3600000)return {...cache.body,stale:true};throw Error('News sources are unavailable.');}
 const ids=new Set(),stories=replies.flatMap(r=>r.stories).sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at)).filter(s=>{if(ids.has(s.id))return false;ids.add(s.id);return true;});
 const body={checked_at:new Date(now).toISOString(),stale:false,stories,sources:replies.map(({name,id,ok,stories})=>({name,id,ok,count:stories.length})),unavailable_sources:replies.filter(r=>!r.ok).map(r=>r.name)};cache={at:now,body};return body;})().finally(()=>{pending=null;});return pending;};
}
export const getPool=createPool();
export function fallbackScore(s,now){const age=Math.max(0,(now-Date.parse(s.published_at))/3600000);return 35+Math.max(0,24-age)*.5+(/\b(?:world series|walk.off|wins? championship|unveils?|launch|event|introducing|announces?|breakthrough|finals|first ever)\b/i.test(s.title)?12:0)-(/\b(?:behind the scenes|shorts|weekly|recap|podcast|shop|sale)\b/i.test(s.title)?8:0);}
export function select(pool,config,editor,now=Date.now()){
 const editedAt=Date.parse(editor?.snapshot?.generated_at||''),freshEditor=Number.isFinite(editedAt)&&editedAt<=now+60000&&now-editedAt<=6*3600000;
 const decisions=new Map(freshEditor?(editor.snapshot.decisions||[]).map(d=>[d.id,d]):[]);
 const matches=pool.stories.filter(s=>s.interests.some(t=>config.interests.includes(t))&&now-Date.parse(s.published_at)<=config.hours*3600000&&Date.parse(s.published_at)<=now+60000).filter(s=>!config.words.length||config.words.some(w=>(`${s.title} ${s.excerpt}`.toLowerCase().match(/[\p{L}\p{N}+#]+/gu)||[]).includes(w)));
 const ranked=matches.map(s=>{const d=decisions.get(s.id);const ai=d&&Number.isFinite(d.importance)&&d.importance>=0&&d.importance<=100&&typeof d.reason==='string';return {...s,importance:ai?d.importance:fallbackScore(s,now),selection_method:ai?'ai':'freshness_fallback',reason:ai?clean(d.reason,160):'Selected by freshness and event wording while this story awaits AI review.',ai_edited_at:ai?editor.snapshot.generated_at:null};}).sort((a,b)=>b.importance-a.importance||Date.parse(b.published_at)-Date.parse(a.published_at)||a.id.localeCompare(b.id));
 // Image-led ranking never substitutes unrelated stock art for the selected source story.
 const lead=ranked[0]||null;return {lead,alternatives:ranked.slice(1,7),candidate_count:matches.length,ai_status:editor?.status==='budget_paused'?'budget_paused':freshEditor?'ready':editor?.snapshot?'stale':editor?.status||'awaiting_api_key',ai_generated_at:freshEditor?editor.snapshot.generated_at:null};
}
let editorCache=null,editorPending=null;
export async function getEditor({fetcher=fetch,clock=()=>Date.now()}={}){
 const now=clock();if(editorCache&&now-editorCache.at<5*60000)return editorCache.value;if(editorPending)return editorPending;
 editorPending=(async()=>{try{const r=await fetcher('https://raw.githubusercontent.com/Manny4C/trmnl-community/newsflash-data/newsflash.json',{signal:AbortSignal.timeout(4000),redirect:'error'});if(!r.ok)throw Error();const s=await r.text();if(s.length>500000)throw Error();const value=JSON.parse(s);editorCache={at:now,value};return value;}catch{return editorCache?.value||{status:'awaiting_api_key',snapshot:null};}})().finally(()=>{editorPending=null;});return editorPending;
}
export async function getFlash(config,{poolFetcher=getPool,editorFetcher=getEditor,now=Date.now()}={}){
 const [pool,editor]=await Promise.all([poolFetcher(),editorFetcher()]);const selection=select(pool,config,editor,now);
 return {app:'Newsflash',checked_at:pool.checked_at,served_at:new Date(now).toISOString(),stale:pool.stale,config:{interests:config.interests,follow:config.follow,hours:config.hours},...selection,unavailable_sources:pool.unavailable_sources,sources:pool.sources,budget:editor?.budget?{month:editor.budget.month,limit_usd:5,reserved_usd:editor.budget.reserved_microusd/1000000}:null,coverage:'A bounded visual feed of selected official sports, technology, AI, games, car and space publishers/channels; not all world news. A video thumbnail is not claimed to be the decisive frame.'};
}
function bytes(s,max){const chars=Array.from(clean(s,1500));while(Buffer.byteLength(chars.join(''))>max)chars.pop();return chars.join('');}
export function devicePayload(d){const l=d.lead;return {app:'Newsflash',checked_at:d.checked_at,stale:d.stale,partial:d.unavailable_sources.length>0,ai_status:d.ai_status,ai_generated_at:d.ai_generated_at,empty:!l,headline:l?bytes(l.title,360):'No visual story matches yet.',reason:l?bytes(l.reason,300):'Try broader interests, fewer follow words, or a wider news window.',source:l?.source||'Newsflash',published_at:l?.published_at||null,source_url:l?.url||null,image_url:l?.image.url||null,image_kind:l?.image.kind||null,image_credit:l?.image.credit||null,image_caption:l?bytes(l.image.caption,200):null,selection_method:l?.selection_method||'none'};}
