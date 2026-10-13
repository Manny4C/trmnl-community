const $ = id => document.getElementById(id);
const names = {technology:'Technology',business:'Business',world:'World',science:'Science'};
let current = null;
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeUrl(value) {try {const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:'#';}catch{return '#';}}
function readHistory(topic) {try {return JSON.parse(localStorage.getItem('what-changed:'+topic)||'{}');}catch{return {};}}
function remember(topic, stories) {try {const history=readHistory(topic);for(const story of stories) history[story.id]=story.fingerprint;localStorage.setItem('what-changed:'+topic,JSON.stringify(Object.fromEntries(Object.entries(history).slice(-60))));}catch{}}
function render(data) {
  const history=readHistory(data.topic);
  const first=!Object.keys(history).length;
  const changes=data.stories.map(story=>({...story,status:first?'':!history[story.id]?'NEW':history[story.id]!==story.fingerprint?'UPDATED':''}));
  const fresh=changes.filter(x=>x.status);
  const selected=[...fresh,...changes.filter(x=>!x.status)].slice(0,5);
  const when=new Date(data.fetched_at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
  $('topic-title').textContent=names[data.topic];
  $('status').className='status'+(data.stale?' error':'');
  $('status').textContent=data.stale?data.notice:first?`Your first ${names[data.topic].toLowerCase()} briefing · Checked ${when}`:`${fresh.length?fresh.length+' new or updated items':'No new items'} since your previous briefing · Checked ${when}`;
  if(data.unavailable_sources?.length) $('status').textContent+=' · Some sources are temporarily unavailable';
  $('stories').innerHTML=selected.map(story=>`<article><div class="story-meta"><span class="source">${escape(story.source)}</span><time datetime="${escape(story.published_at)}">${escape(new Date(story.published_at).toLocaleDateString([], {month:'short',day:'numeric'}))}</time>${story.status?'<span class="badge">'+story.status+'</span>':''}</div><h3><a href="${escape(safeUrl(story.url))}" target="_blank" rel="noopener">${escape(story.title)}</a></h3><p>${escape(story.snippet)}</p><a class="story-link" href="${escape(safeUrl(story.url))}" target="_blank" rel="noopener">Read at ${escape(story.source)} ↗</a></article>`).join('');
  $('screen').innerHTML=`<div class="screen-name">WHAT CHANGED?</div><div class="screen-subtitle">${escape(names[data.topic])} · ${first?'Your first briefing':fresh.length?fresh.length+' new or updated items':'No new items since previous briefing'}</div>${selected.slice(0,3).map(story=>`<div class="screen-story"><h4>${story.status?'• ':''}${escape(story.title)}</h4><p>${escape(story.snippet.slice(0,95))}</p><p>${escape(story.source)} · ${escape(new Date(story.published_at).toLocaleDateString([], {month:'short',day:'numeric'}))}</p></div>`).join('')}<div class="screen-footer">${escape(names[data.topic])} · Checked ${escape(when)} · ${escape(location.hostname)}</div>`;
  if(!data.stale) remember(data.topic,selected);
}
async function load() {
  const topic=$('topic').value;
  $('endpoint').textContent=location.origin+'/api/briefing?topic='+topic;
  $('refresh').disabled=true;
  $('status').textContent='Checking the latest headlines…';
  try {
    const response=await fetch('/api/briefing?topic='+topic, {signal:AbortSignal.timeout(20000)});
    if(!response.ok) throw new Error('unavailable');
    const data=await response.json();
    if(!Array.isArray(data.stories)||!data.stories.length) throw new Error('empty');
    current=data;render(data);
  } catch {
    $('status').className='status error';
    $('status').textContent='We couldn’t refresh this briefing. Please try again in a moment.';
    if(current?.topic!==topic) {$('stories').innerHTML='<div class="loading">Headlines are temporarily unavailable.</div>';$('screen').innerHTML='<div class="screen-placeholder">Briefing unavailable<br>Please try again later.</div>';}
  } finally {$('refresh').disabled=false;}
}
$('topic').addEventListener('change',load);$('refresh').addEventListener('click',load);
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('endpoint').textContent);$('copy').textContent='Copied';}catch{$('copy').textContent='Select and copy the endpoint above';}});
$('forget').addEventListener('click',()=>{try {for(const topic of Object.keys(names))localStorage.removeItem('what-changed:'+topic);}catch{}if(current)render(current);});
fetch('/release.json').then(r=>r.json()).then(release=>{if(release.support_url)$('support').href=release.support_url;if(release.recipe_url){$('recipe-link').href=release.recipe_url;$('recipe-link').textContent='Install What Changed? ↗';$('recipe-status').textContent=release.recipe_status==='approved'?'Published on TRMNL. Install to receive future updates.':'Submitted to TRMNL for review. You can use developer setup below while the public listing is pending.';}}).catch(()=>{});
load();
