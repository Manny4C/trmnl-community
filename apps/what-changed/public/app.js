import {TOPIC_NAMES as names, validBriefing, savedBriefing, saveBriefing, selectEdition} from './briefing-state.js';
const $ = id => document.getElementById(id);
const REFRESH_INTERVAL = 15 * 60 * 1000;
let requestNumber = 0, activeRequest = null, lastAttempt = 0;
let current = null;
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeUrl(value) {try {const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:'#';}catch{return '#';}}
function readHistory(topic) {try {const value=JSON.parse(localStorage.getItem('what-changed:'+topic)||'{}');return value && typeof value==='object' && !Array.isArray(value)?value:{};}catch{return {};}}
function remember(topic, stories) {try {const history=readHistory(topic);for(const story of stories) history[story.id]=story.fingerprint;localStorage.setItem('what-changed:'+topic,JSON.stringify(Object.fromEntries(Object.entries(history).slice(-60))));}catch{}}
function render(data) {
  const history=readHistory(data.topic);
  const {first,selected,changedCount}=selectEdition(data.stories,history);
  const timestamp=new Date(data.fetched_at);
  const when=timestamp.toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const age=Math.max(0,Math.round((Date.now()-timestamp.getTime())/60000));
  const old=data.stale || age>60;
  $('topic-title').textContent=names[data.topic];
  $('status').className='status'+(old?' error':'');
  $('status').textContent=data.stale?`${data.notice} · Checked ${when}`:first?`Your first ${names[data.topic].toLowerCase()} briefing · Checked ${when}`:`${changedCount?changedCount+' new or updated items':'No new items'} since your previous briefing · Checked ${when}`;
  if(!data.stale && age>60) $('status').textContent+=' · Last source check was over an hour ago';
  if(data.unavailable_sources?.length) $('status').textContent+=' · Some sources are temporarily unavailable';
  $('stories').innerHTML=selected.map(story=>`<article><div class="story-meta"><span class="source">${escape(story.source)}</span><time datetime="${escape(story.published_at)}">${escape(new Date(story.published_at).toLocaleDateString([], {month:'short',day:'numeric'}))}</time>${story.status?'<span class="badge">'+story.status+'</span>':''}</div><h3><a href="${escape(safeUrl(story.url))}" target="_blank" rel="noopener">${escape(story.title)}</a></h3><p>${escape(story.snippet)}</p><a class="story-link" href="${escape(safeUrl(story.url))}" target="_blank" rel="noopener">Read at ${escape(story.source)} ↗</a></article>`).join('');
  $('screen').innerHTML=`<div class="screen-name">WHAT CHANGED?</div><div class="screen-subtitle">${escape(names[data.topic])} · ${data.stale?'Saved briefing':first?'Your first briefing':changedCount?changedCount+' new or updated items':'No new items since previous briefing'}</div>${selected.slice(0,3).map(story=>`<div class="screen-story"><h4>${story.status?'• ':''}${escape(story.title)}</h4><p>${escape(story.snippet.slice(0,95))}</p><p>${escape(story.source)} · ${escape(new Date(story.published_at).toLocaleDateString([], {month:'short',day:'numeric'}))}</p></div>`).join('')}<div class="screen-footer">${escape(names[data.topic])} · Checked ${escape(when)} · ${escape(location.hostname)}</div>`;
  if(!data.stale) remember(data.topic,selected);
}
async function load() {
  const topic=$('topic').value;
  const request=++requestNumber;
  activeRequest?.abort();
  const controller=new AbortController();
  activeRequest=controller;
  const deadline=setTimeout(()=>controller.abort(),20000);
  lastAttempt=Date.now();
  $('endpoint').textContent=location.origin+'/api/briefing?topic='+topic;
  $('copy').textContent='Copy endpoint';
  $('topic-title').textContent=names[topic];
  $('refresh').disabled=true;
  $('status').className='status';
  $('status').textContent='Checking the latest headlines…';
  if(current?.topic!==topic) {
    $('stories').innerHTML='<div class="loading">Finding the latest headlines…</div>';
    $('screen').innerHTML='<div class="screen-placeholder">Loading your briefing…</div>';
  }
  try {
    const response=await fetch('/api/briefing?topic='+topic, {signal:controller.signal});
    if(!response.ok) throw new Error('unavailable');
    const data=await response.json();
    if(request!==requestNumber) return;
    if(!validBriefing(data,topic)) throw new Error('invalid');
    current=data;render(data);
    try {saveBriefing(localStorage,data);} catch {}
  } catch {
    if(request!==requestNumber) return;
    let saved=null;
    try {saved=savedBriefing(localStorage,topic);} catch {}
    if(saved) {current=saved;render(saved);}
    else {
      $('status').className='status error';
      $('status').textContent='We couldn’t refresh this briefing. Please try again in a moment.';
      if(current?.topic!==topic) {
        $('stories').innerHTML='<div class="loading">Headlines are temporarily unavailable.</div>';
        $('screen').innerHTML='<div class="screen-placeholder">Briefing unavailable<br>Please try again later.</div>';
      }
    }
  } finally {
    clearTimeout(deadline);
    if(request===requestNumber) {$('refresh').disabled=false;activeRequest=null;}
  }
}
$('topic').addEventListener('change',load);$('refresh').addEventListener('click',load);
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('endpoint').textContent);$('copy').textContent='Copied';}catch{$('copy').textContent='Select and copy the endpoint above';}});
$('forget').addEventListener('click',()=>{try {for(const topic of Object.keys(names)){localStorage.removeItem('what-changed:'+topic);localStorage.removeItem('what-changed:last:'+topic);}}catch{}if(current)render(current);});
fetch('/release.json').then(r=>r.json()).then(release=>{
  if(release.support_url)$('support').href=release.support_url;
  if(release.recipe_status==='submitted')$('recipe-status').textContent='Submitted to TRMNL for public review. Developer setup is available below while the listing is pending.';
  if(release.recipe_url && release.recipe_status==='approved'){
    $('recipe-link').href=release.recipe_url;
    $('recipe-link').textContent='Install What Changed? ↗';
    $('recipe-status').textContent='Published on TRMNL. Install to receive future updates.';
  }
}).catch(()=>{});
setInterval(()=>{if(!document.hidden && Date.now()-lastAttempt>=REFRESH_INTERVAL)load();},REFRESH_INTERVAL);
document.addEventListener('visibilitychange',()=>{if(!document.hidden && Date.now()-lastAttempt>=REFRESH_INTERVAL)load();});
load();
