import {edit} from './engine.js';
const $=id=>document.getElementById(id),form=$('settings');let data=null,controller=null,sequence=0;
const date=v=>v?new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'Not applicable';
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function config(){return new URLSearchParams(new FormData(form));}
function stamp(c){return c.stale?'CACHED · '+date(c.checked_at):c.kind==='routine'?'Original routine suggestion':c.source+' · '+(c.published_at?new Date(c.published_at).toLocaleDateString():date(c.checked_at));}
function screenCard(c,lead){const a=el('article',undefined,lead?'lead':'');a.append(el('div',(lead?'LEAD / ':'')+c.kind.toUpperCase()+(c.stale?' · CACHED':''),'kicker'),el('h3',c.title),el('p',c.summary,'summary'),el('p',c.reason,'why'),el('p',stamp(c),'card-meta'));return a;}
function render(){if(!data)return;const demo=$('demo-time').value;const selection=demo==='live'?data:edit(data.candidates,data.config,new Date(data.checked_at),Number(demo));const cards=selection.cards;
 $('screen-context').textContent=selection.context.phase.toUpperCase()+' / '+data.config.mode.toUpperCase()+(demo==='live'?'':' / TIME DEMO');
 $('screen-time').textContent=new Intl.DateTimeFormat('en-US',{timeZone:data.config.timezone,hour:'2-digit',minute:'2-digit'}).format(new Date(data.checked_at))+(data.partial?' · PARTIAL':'');
 $('screen-body').replaceChildren();if(cards[0])$('screen-body').append(screenCard(cards[0],true));if(cards.length>1){const supporting=el('div',undefined,'supporting');cards.slice(1).forEach(c=>supporting.append(screenCard(c,false)));$('screen-body').append(supporting);}
 $('decisions').replaceChildren();cards.forEach((c,i)=>{const a=el('article',undefined,'decision');a.append(el('span',(i?'SUPPORTING CARD':'THE LEAD')+' / '+c.kind.toUpperCase()+(c.stale?' · CACHED':''),'tag'),el('h3',c.title),el('p',c.summary),el('p',c.reason,'reason'),el('p',`Published: ${date(c.published_at)}\nChecked: ${date(c.checked_at)}`,'date'));if(c.source_url){const link=el('a','Open the source ↗');link.href=c.source_url;link.target='_blank';link.rel='noopener noreferrer';a.append(link);} $('decisions').append(a);});
 $('live-badge').textContent=demo!=='live'?'/ TIME-OF-DAY DEMO':data.partial?'/ PARTIAL SOURCES':'/ LIVE SOURCE EDITION';
 const next=date(data.next_selection_at);$('status').textContent=(demo!=='live'?'Time demo using the fetched snapshot. ':'')+`Checked ${date(data.checked_at)}. Next selection window ${next}. `+(data.partial?'Some sources are cached, partial or unavailable; inspect the notebook below. ':'')+'Device changes appear at its next successful refresh.';
 $('sources').replaceChildren();data.sources.forEach(s=>{const row=el('div',undefined,'source-row');row.append(el('strong',s.name),el('span',s.state.toUpperCase()+' · '+(s.checked_at?date(s.checked_at):'No successful check')));$('sources').append(row);});
}
async function refresh(){const seq=++sequence;controller?.abort();controller=new AbortController();const p=config();$('status').textContent='Checking sources and editing the next edition…';form.querySelector('button').disabled=true;
 try{const response=await fetch('/api/editor?'+p,{signal:controller.signal});const body=await response.json();if(!response.ok)throw Error(body.error||'The editor is unavailable.');if(seq!==sequence)return;data=body;$('demo-time').value='live';render();$('poll-url').textContent=location.origin+'/api/editor?'+p+'&format=trmnl';history.replaceState(null,'','?'+p+'#studio');try{localStorage.setItem('desk-editor-settings',p.toString());}catch{}}
 catch(e){if(e.name==='AbortError'||seq!==sequence)return;$('status').textContent=e.message+(data?' The screen still shows the dated previous snapshot.':' Please retry in a moment.');$('live-badge').textContent='/ UPDATE FAILED';}
 finally{if(seq===sequence)form.querySelector('button').disabled=false;}
}
form.addEventListener('submit',e=>{e.preventDefault();refresh();});$('layout').addEventListener('change',()=>{$('screen').className='screen '+$('layout').value;});$('demo-time').addEventListener('change',render);
$('copy-url').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('poll-url').textContent);$('copy-url').textContent='Copied';}catch{$('copy-url').textContent='Select and copy the URL above';}});
let saved;try{saved=location.search.length>1?location.search:localStorage.getItem('desk-editor-settings');}catch{saved=location.search;}
if(saved){const p=new URLSearchParams(saved);for(const [key,value]of p){const field=form.elements.namedItem(key);if(field&&value.length<=100&&(!(field instanceof HTMLSelectElement)||[...field.options].some(o=>o.value===value)))field.value=value;}}
fetch('/release.json').then(r=>r.json()).then(r=>{if(r.recipe_status==='submitted')$('recipe-status').textContent='Website live. Recipe submitted and awaiting TRMNL’s human review.';if(r.recipe_status==='approved'&&r.recipe_url?.startsWith('https://trmnl.com/')){$('recipe-status').textContent='The Recipe is approved and ready to install.';const a=el('a','Install the public Recipe ↗','button');a.href=r.recipe_url;$('recipe-status').after(a);}}).catch(()=>{});
refresh();setInterval(()=>{if(!document.hidden)refresh();},10*60000);
