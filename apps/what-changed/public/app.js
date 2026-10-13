import {validBriefing,savedBriefing,saveBriefing,selectEdition} from './briefing-state.js';
import {PRESETS,DEFAULT_PROMPT,buildPrompt,normalizePrompt,compilePrompt} from './prompt.js';
const $=id=>document.getElementById(id),INTERVAL=900000;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeUrl(s){try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)?u.href:'#';}catch{return '#';}}
let preferences={ai_technology:'include'},activePrompt=DEFAULT_PROMPT,current=null,requestNumber=0,controller=null,lastAttempt=0;
try {const saved=JSON.parse(localStorage.getItem('daily-trmnl:choices'));if(saved){preferences=Object.fromEntries(PRESETS.map(p=>[p.id,['include','exclude'].includes(saved.preferences?.[p.id])?saved.preferences[p.id]:'off']));$('custom-prompt').value=String(saved.additions||'').slice(0,400);$('local-place').value=String(saved.location||'').slice(0,80);}}catch{}
$('presets').innerHTML=PRESETS.map(p=>`<div class="preset" data-state="${preferences[p.id]||'off'}"><label for="choice-${p.id}">${escape(p.name)}</label><select id="choice-${p.id}" data-preset="${p.id}" aria-label="${escape(p.name)} preference"><option value="off">Leave out</option><option value="include" ${preferences[p.id]==='include'?'selected':''}>Include</option><option value="exclude" ${preferences[p.id]==='exclude'?'selected':''}>Exclude</option></select></div>`).join('');
function draft(){return buildPrompt(preferences,$('custom-prompt').value,$('local-place').value);}
function updateDraft(){
  $('generated-prompt').textContent=draft()||'Choose an interest or write your prompt above.';
  $('location-row').hidden=!['include','exclude'].includes(preferences.local_news);
  $('draft-notice').textContent=normalizePrompt(draft())!==activePrompt?'Generate your feed to apply these choices.':'';
  $('copy-prompt').textContent='Copy prompt for TRMNL';
  $('form-error').textContent='';
  for(const p of PRESETS)$('choice-'+p.id).closest('.preset').dataset.state=preferences[p.id]||'off';
}
for(const select of document.querySelectorAll('[data-preset]'))select.addEventListener('change',()=>{preferences[select.dataset.preset]=select.value;updateDraft();});
$('custom-prompt').addEventListener('input',updateDraft);$('local-place').addEventListener('input',updateDraft);
$('clear-choices').addEventListener('click',()=>{preferences={};for(const s of document.querySelectorAll('[data-preset]'))s.value='off';updateDraft();});
async function feedKey(prompt){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(normalizePrompt(prompt)));return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,16);}
function readHistory(key){try{const v=JSON.parse(localStorage.getItem('what-changed:'+key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}}
function remember(data,selected){try{const seen=readHistory(data.feed_key);for(const s of selected)seen[s.id]=s.fingerprint;localStorage.setItem('what-changed:'+data.feed_key,JSON.stringify(Object.fromEntries(Object.entries(seen).slice(-60))));}catch{}}
function boundProfiles(key){try{const prior=JSON.parse(localStorage.getItem('daily-trmnl:profiles')||'[]');const keys=[...prior.filter(k=>k!==key),key];while(keys.length>8){const old=keys.shift();localStorage.removeItem('what-changed:'+old);localStorage.removeItem('what-changed:last:'+old);}localStorage.setItem('daily-trmnl:profiles',JSON.stringify(keys));}catch{}}
function render(data){
  const {first,selected,changedCount}=selectEdition(data.stories,readHistory(data.feed_key));
  const when=new Date(data.fetched_at).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const old=data.stale||Date.now()-Date.parse(data.fetched_at)>3600000;
  $('topic-title').textContent='Your brief';
  $('status').className='status'+(old?' error':'');
  $('status').textContent=data.empty?data.notice:data.stale?`${data.notice} · Checked ${when}`:first?`Your first customized briefing · Checked ${when}`:`${changedCount?changedCount+' new or updated items':'No new items'} since your previous briefing · Checked ${when}`;
  if(data.unavailable_sources?.includes('Global news search'))$('status').textContent+=' · Global search is temporarily unavailable';
  else if(data.unavailable_sources?.length)$('status').textContent+=' · Some sources are temporarily unavailable';
  if(data.empty){$('stories').innerHTML='<div class="loading">No matching stories yet. Try a broader prompt or fewer exclusions.</div>';$('screen').innerHTML='<div class="screen-name">THE DAILY TRMNL</div><div class="screen-placeholder">No matching stories yet.<br>Try a broader news prompt.</div>';return;}
  $('stories').innerHTML=selected.map(s=>`<article><div class="story-meta"><span class="source">${escape(s.source)}</span><time datetime="${escape(s.published_at)}">${s.time_kind==='indexed'?'Indexed ':''}${escape(new Date(s.published_at).toLocaleDateString([], {month:'short',day:'numeric'}))}</time>${s.status?'<span class="badge">'+s.status+'</span>':''}</div><h3><a href="${escape(safeUrl(s.url))}" target="_blank" rel="noopener">${escape(s.title)}</a></h3><p>${escape(s.snippet)}</p><a class="story-link" href="${escape(safeUrl(s.url))}" target="_blank" rel="noopener">Read at ${escape(s.source)} ↗</a></article>`).join('');
  $('screen').innerHTML=`<div class="screen-name">THE DAILY TRMNL</div><div class="screen-subtitle">${data.stale?'Saved briefing':first?'Your first briefing':changedCount?changedCount+' new or updated items':'No new items since previous briefing'}</div>${selected.slice(0,3).map(s=>`<div class="screen-story"><h4>${s.status?'• ':''}${escape(s.title)}</h4><p>${escape(s.snippet.slice(0,95))}</p><p>${escape(s.source)} · ${escape(new Date(s.published_at).toLocaleDateString([], {month:'short',day:'numeric'}))}</p></div>`).join('')}<div class="screen-footer">Checked ${escape(when)} · the-daily-trmnl.vercel.app</div>`;
  if(!data.stale){remember(data,selected);boundProfiles(data.feed_key);}
}
async function load(prompt=activePrompt){
  const id=++requestNumber;controller?.abort();controller=new AbortController();const signal=controller.signal;
  const timeout=setTimeout(()=>controller?.signal===signal&&controller.abort(),25000);
  lastAttempt=Date.now();activePrompt=normalizePrompt(prompt);
  const key=await feedKey(activePrompt);if(id!==requestNumber){clearTimeout(timeout);return;}
  $('endpoint').textContent='https://the-daily-trmnl.vercel.app/api/briefing?'+new URLSearchParams({prompt:activePrompt});
  $('copy').textContent='Copy endpoint';$('refresh').disabled=true;$('generate').disabled=true;
  $('status').className='status';$('status').textContent='Finding headlines for your prompt…';
  if(current?.feed_key!==key){$('stories').innerHTML='<div class="loading">Finding your news…</div>';$('screen').innerHTML='<div class="screen-placeholder">Building your briefing…</div>';}
  try {
    const response=await fetch('/api/briefing?'+new URLSearchParams({prompt:activePrompt}),{signal});
    const data=await response.json();if(id!==requestNumber)return;
    if(!response.ok)throw new Error(data.error||'unavailable');
    if(!validBriefing(data,'custom')||data.feed_key!==key)throw new Error('Invalid response');
    current=data;render(data);try{saveBriefing(localStorage,data);}catch{}
  }catch(error){
    if(id!==requestNumber)return;
    let saved=null;try{saved=savedBriefing(localStorage,key);}catch{}
    if(saved){current=saved;render(saved);}
    else{$('status').className='status error';$('status').textContent='This briefing couldn’t refresh. Please try again shortly.';if(current?.feed_key!==key){$('stories').innerHTML='<div class="loading">Sources are temporarily unavailable.</div>';$('screen').innerHTML='<div class="screen-placeholder">Briefing unavailable<br>Please try again later.</div>';}}
  }finally{clearTimeout(timeout);if(id===requestNumber){$('refresh').disabled=false;$('generate').disabled=false;controller=null;}updateDraft();}
}
$('feed-form').addEventListener('submit',e=>{e.preventDefault();try{if(['include','exclude'].includes(preferences.local_news)&&!$('local-place').value.trim())throw new Error('Add a city or area for local news.');const prompt=compilePrompt(draft()).prompt;try{localStorage.setItem('daily-trmnl:choices',JSON.stringify({preferences,additions:$('custom-prompt').value,location:$('local-place').value}));}catch{}load(prompt);}catch(error){$('form-error').textContent=error.message;}});
$('refresh').addEventListener('click',()=>load());
$('copy-prompt').addEventListener('click',async()=>{try{const prompt=compilePrompt(draft()).prompt;await navigator.clipboard.writeText(prompt);$('copy-prompt').textContent='Prompt copied';}catch(e){$('form-error').textContent=e.message;}});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('endpoint').textContent);$('copy').textContent='Copied';}catch{$('copy').textContent='Select and copy the endpoint above';}});
$('forget').addEventListener('click',()=>{try{for(const key of Object.keys(localStorage))if(key.startsWith('what-changed:')||key==='daily-trmnl:profiles')localStorage.removeItem(key);}catch{}if(current)render(current);});
fetch('/release.json').then(r=>r.json()).then(release=>{if(release.support_url)$('support').href=release.support_url;if(release.recipe_status==='submitted'){$('recipe-status').textContent='The Daily TRMNL Recipe is submitted for public review. Its install link will appear here after approval. Developer setup is available below.';$('recipe-link').removeAttribute('href');$('recipe-link').setAttribute('aria-disabled','true');$('recipe-link').textContent='Recipe awaiting approval';}if(release.recipe_url&&release.recipe_status==='approved'){$('recipe-link').removeAttribute('aria-disabled');$('recipe-link').href=release.recipe_url;$('recipe-link').textContent='Install The Daily TRMNL ↗';$('recipe-status').textContent='Published on TRMNL. Paste your prompt to customize your feed.';}}).catch(()=>{});
setInterval(()=>{if(!document.hidden&&Date.now()-lastAttempt>=INTERVAL)load();},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastAttempt>=INTERVAL)load();});
updateDraft();const initial=draft();try{activePrompt=compilePrompt(initial).prompt;}catch{activePrompt=DEFAULT_PROMPT;}load();
