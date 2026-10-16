const DAY=86400000;
const STOP=new Set('a an the and or for with from that this your our their we you us my company companies business businesses product products platform tool tools software service services solution solutions build building helps help make making using use users customer customers new about into can to of in on at is are be as by it its i ai powered online'.split(' '));
// These are explicit related-word groups, not an LLM or a claim of direct competition.
const TOPICS=[
 ['billing','invoice invoices invoicing billing payment payments subscription subscriptions'],
 ['customer support','support helpdesk ticket tickets customer service'],
 ['sales','sales crm prospect prospects lead leads pipeline outreach'],
 ['hiring','hiring recruit recruiting recruitment candidate candidates resume resumes'],
 ['meetings','meeting meetings notes transcription transcript transcripts recording recordings'],
 ['documents','document documents docx pdf editing editor docs writing'],
 ['developer infrastructure','developer developers api apis sdk coding code database databases infrastructure deployment observability'],
 ['security','security secure vulnerability vulnerabilities authentication identity password passwords'],
 ['healthcare','health healthcare medical clinic clinics clinical patient patients doctor doctors'],
 ['education','education learning learn teaching teacher teachers student students tutor tutoring'],
 ['games','game games gaming gamer gamers videogame videogames'],
 ['finance','finance financial accounting bookkeeping tax taxes expense expenses banking bank'],
 ['commerce','shop shopping ecommerce commerce retail retailer retailers checkout store stores'],
 ['climate & energy','climate carbon energy solar battery batteries electricity'],
 ['design','design designer designers figma prototype prototypes prototyping'],
 ['automation','automation automate automated workflow workflows agent agents'],
 ['search & knowledge','search retrieval knowledge rag'],
 ['video & audio','video videos audio podcast podcasts voice speech'],
 ['logistics','logistics shipping delivery warehouse inventory supply chain']
].map(([label,words])=>({label,words:new Set(words.split(' '))}));
export function tokens(value){return [...new Set(String(value).normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}+#]+/gu)||[])].filter(w=>w.length>2&&!STOP.has(w));}
export function options(params){
 const get=k=>String(params.get(k)||'').trim();
 const profile=get('profile'),audience=get('audience'),keywords=get('keywords'),exclude=get('exclude'),name=get('name')||'My company',days=get('days')||'90',source=get('source')||'all',order=get('order')||'relevance',count=get('count')||'6';
 if(profile.length<10||profile.length>300||!tokens(profile+' '+keywords).length)throw new RangeError('Describe your product in 10–300 characters with at least one specific topic.');
 if(audience.length>100||keywords.length>100||exclude.length>100||name.length>40||!['30','90','365'].includes(days)||!['all','show','launch'].includes(source)||!['relevance','latest'].includes(order)||!['3','6','8'].includes(count))throw new RangeError('Use a name up to 40 characters, customer/keyword fields up to 100, 30/90/365 days and 3/6/8 results.');
 if(keywords&&!tokens(keywords).length)throw new RangeError('Must-have keywords need a specific product or customer term.');
 return {name,profile,audience,keywords,exclude,days:Number(days),source,order,count:Number(count)};
}
export function normalizeItem(item,now=Date.now()){
 if(!item||item.deleted||item.dead||item.type!=='story'||!Number.isSafeInteger(item.id)||item.id<=0||!Number.isFinite(item.time)||item.time*1000>now+300000)return null;
 const m=String(item.title||'').match(/^(Launch HN|Show HN):\s*(.{3,300})$/i);if(!m)return null;
 const source=m[1].toLowerCase()==='launch hn'?'Launch HN':'Show HN';
 const title=m[2].replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/<[^>]*>/g,'').trim();
 if(/\b(?:ranks?|ranked)\s+(?:no\.?|#|\d)|\bon clutch\b|\b(?:we're|i'm) hiring\b/i.test(title))return null;
 const batch=source==='Launch HN'?title.match(/\(YC\s+([WSPFX]\d{2})\)/i)?.[1]?.toUpperCase():null;
 return {id:String(item.id),title,source,batch:batch||null,published_at:new Date(item.time*1000).toISOString(),url:`https://news.ycombinator.com/item?id=${item.id}`};
}
export function matchItem(item,config){
 const rawTokens=tokens(item.title),rawSet=new Set(rawTokens),profile=tokens(config.profile),audience=tokens(config.audience),must=tokens(config.keywords),omit=tokens(config.exclude);
 if(omit.some(w=>rawSet.has(w))||must.length&&!must.some(w=>rawSet.has(w)))return null;
 // Feature compatibility ("Windows support") is not customer support.
 const supportContext=/\b(customer support|support (teams?|tickets?|agents?|inbox|desk)|helpdesk|help desk|customer service)\b/i.test(item.title);
 const textTokens=rawTokens.filter(w=>w!=='support'||supportContext),set=new Set(textTokens);
 const direct=profile.filter(w=>set.has(w)),customers=audience.filter(w=>set.has(w)),anchors=must.filter(w=>set.has(w));
 const groups=TOPICS.flatMap(t=>{const a=profile.find(w=>t.words.has(w)),b=textTokens.find(w=>t.words.has(w));return a&&b?[{label:t.label,profile_term:a,launch_term:b}]:[];});
 // AI alone, generic business language, and unrelated recent posts cannot fill an edition.
 const weak=new Set(['automation','automate','automated','workflow','workflows','agent','agents','teams','support']);
 const specific=direct.some(w=>!weak.has(w))||supportContext&&direct.includes('support');
 if(!specific&&!anchors.length&&groups.length<2)return null;
 const score=direct.length*4+customers.length*6+anchors.length*6+groups.length*2;
 if(!score)return null;
 let reason,kind;
 if(customers.length){reason=`Shared customer wording: ${customers.slice(0,2).join(', ')}`;kind='Audience wording';}
 else if(anchors.length){reason=`Required keyword: ${anchors.slice(0,2).join(', ')}`;kind='Keyword match';}
 else if(direct.length){reason=`Shared product wording: ${direct.slice(0,3).join(', ')}`;kind='Product wording';}
 else{reason=`Related topics: ${groups.slice(0,2).map(g=>g.label).join(' + ')}`;kind='Related topics';}
 return {...item,score,reason,kind,evidence:{shared_words:direct,audience_words:customers,required_words:anchors,related_topics:groups}};
}
export function selectMatches(pool,config,now=Date.now()){
 const seen=new Set();
 const matches=[...pool].sort((a,b)=>b.published_at.localeCompare(a.published_at)||Number(b.id)-Number(a.id)).filter(item=>new Date(item.published_at).getTime()>=now-config.days*DAY&&(config.source==='all'||item.source===(config.source==='show'?'Show HN':'Launch HN'))).flatMap(item=>{const m=matchItem(item,config);if(!m)return [];const key=item.title.toLowerCase().replace(/\(yc[^)]*\)/g,'').replace(/[^\p{L}\p{N}]/gu,'');if(seen.has(key))return [];seen.add(key);return [m];});
 matches.sort((a,b)=>(config.order==='relevance'?b.score-a.score:0)||b.published_at.localeCompare(a.published_at)||Number(b.id)-Number(a.id));
 return {matches:matches.slice(0,config.count),total:matches.length};
}
export function searchTerms(config){const words=tokens(config.keywords+' '+config.profile);const priority=['helpdesk','invoicing','invoice','billing','recruitment','transcription','observability','inventory','logistics'];return [...words.filter(w=>priority.includes(w)),...words.filter(w=>!priority.includes(w))].slice(0,2);}
async function jsonFetch(url,fetcher){const res=await fetcher(url,{signal:AbortSignal.timeout(5000),headers:{Accept:'application/json','User-Agent':'Sounds-Like-My-Company/1.0 (https://sounds-like-my-company.vercel.app)'}});if(!res.ok)throw Error('Source unavailable');return res.json();}
export async function loadPool(config,fetcher=fetch,now=Date.now()){
 const terms=searchTerms(config),searches=[];
 if(config.source!=='show')searches.push('https://hn.algolia.com/api/v1/search_by_date?query=Launch%20HN&restrictSearchableAttributes=title&tags=story&hitsPerPage=100&typoTolerance=false');
 if(config.source!=='launch'){
  searches.push('https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&hitsPerPage=100');
  for(const term of terms)searches.push('https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&restrictSearchableAttributes=title&hitsPerPage=60&typoTolerance=false&query='+encodeURIComponent(term));
 }
 const discovered=await Promise.allSettled(searches.map(u=>jsonFetch(u,fetcher)));let failures=discovered.filter(r=>r.status==='rejected'||!Array.isArray(r.value?.hits)).length;
 const ids=[];
 // Round-robin feeds: keyword results and Launch HN get room alongside the busy newest Show HN feed.
 const lists=discovered.map(r=>r.status==='fulfilled'&&Array.isArray(r.value.hits)?r.value.hits.filter(h=>/^(Show|Launch) HN:/i.test(h.title||'')):[]);
 for(let i=0;i<100;i++)for(const list of lists){const id=Number(list[i]?.objectID);if(Number.isSafeInteger(id)&&id>0&&!ids.includes(id))ids.push(id);}
 if(!ids.length)throw Error('No usable launch source');
 const selected=ids.slice(0,100),items=[];let next=0;const deadline=Date.now()+16000;
 await Promise.all(Array.from({length:10},async()=>{while(next<selected.length){if(Date.now()>deadline){failures+=selected.length-next;next=selected.length;break;}const id=selected[next++];try{const item=normalizeItem(await jsonFetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`,fetcher),now);if(item&&Number(item.id)===id)items.push(item);}catch{failures++;}}}));
 if(!items.length)throw Error('Official verification unavailable');
 return {items,partial:failures>0,checked_at:new Date(now).toISOString()};
}
export function createService({fetcher=fetch,clock=Date.now}={}){
 const cache=new Map(),pending=new Map();
 return async config=>{
  const now=clock(),key=JSON.stringify([config.source,searchTerms(config)]);let entry=cache.get(key),pool,stale=false;
  if(entry&&now-entry.at<3600000)pool=entry.pool;
  else{
   if(!pending.has(key)){if(pending.size>=8)throw Error('Busy');pending.set(key,loadPool(config,fetcher,now).then(pool=>{cache.delete(key);cache.set(key,{pool,at:now});while(cache.size>32)cache.delete(cache.keys().next().value);return pool;}).finally(()=>pending.delete(key)));}
   try{pool=await pending.get(key);}catch(e){if(entry&&now-entry.at<DAY){pool=entry.pool;stale=true;}else throw e;}
  }
  return {name:config.name,result_count:config.count,window_days:config.days,order:config.order,checked_at:pool.checked_at,stale,partial:pool.partial,coverage_count:pool.items.length,search_terms:searchTerms(config),...selectMatches(pool.items,config,now)};
 };
}
export function excerpt(value,bytes){let out='';if(Buffer.byteLength(value)<=bytes)return value;for(const c of value){if(Buffer.byteLength(out+c+'…')>bytes)break;out+=c;}return out.trimEnd()+'…';}
export function devicePayload(data){
 return {links_code:data.links_code||null,links_url:data.links_url||null,links_qr_url:data.links_qr_url||null,links_status:data.links_status||null,name:excerpt(data.name,60),result_count:data.result_count||6,window_days:data.window_days,order:data.order,checked_at:data.checked_at,stale:data.stale,partial:data.partial,coverage_count:data.coverage_count,total:data.total,matches:data.matches.map(m=>({title:excerpt(m.title,190),source:m.source,batch:m.batch,published_at:m.published_at.slice(0,10),reason:excerpt(m.reason,110)}))};
}
