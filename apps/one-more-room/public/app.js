import {newCampaign,advance,view,validCampaign,automatic,escapeHTML as e} from './game.js';
import {renderScreen} from './render.js';
import {refreshStoryContent} from './campaign-client.js';
const $=id=>document.getElementById(id),KEY='one-more-room:v1';
let state,history=[],playing=true,seconds=15,remaining=15,layout='full',mono=false,mapMode='auto',storageOK=true;
try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&validCampaign(saved.state)){state=saved.state;history=Array.isArray(saved.history)?saved.history.filter(h=>h&&Number.isInteger(h.turn)&&typeof h.text==='string').slice(-120):[];mono=saved.mono===true;mapMode=['auto','world','dungeon'].includes(saved.mapMode)?saved.mapMode:'auto';layout=['full','half_horizontal','half_vertical','quadrant'].includes(saved.layout)?saved.layout:'full';seconds=[15,30,60].includes(saved.seconds)?saved.seconds:15;playing=saved.playing!==false;}}catch{storageOK=false;}
await refreshStoryContent(state?.story?.release||'');
// A second tab may have progressed while the chapter files were loading.
try{const newer=JSON.parse(localStorage.getItem(KEY)||'null');if(newer&&validCampaign(newer.state)&&JSON.stringify(newer.state)!==JSON.stringify(state)){state=newer.state;history=Array.isArray(newer.history)?newer.history.filter(h=>h&&Number.isInteger(h.turn)&&typeof h.text==='string').slice(-120):[];playing=false;}}catch{}
if(!state){state=newCampaign();state=advance(state);history=[{turn:0,text:state.log[0]},{turn:state.turn,text:state.last}];}
remaining=seconds;
function save(){try{localStorage.setItem(KEY,JSON.stringify({state,history,mono,layout,mapMode,seconds,playing}));storageOK=true;}catch{storageOK=false;}$('saveNote').textContent=storageOK?'Saved in this browser · '+(view(state).chapter_title?view(state).chapter_title+' · ':'')+'seed “'+state.seed+'” · choose a different action anytime.':'Storage unavailable: this expedition lasts for this tab only.';}
function status(){const running=playing&&!document.hidden;$('pause').textContent=playing?'Ⅱ Pause':'▷ Resume';$('playStatus').textContent=playing?'AUTOPILOT ON':'AUTOPILOT PAUSED';$('liveDot').classList.toggle('paused',!running);$('frameLabel').textContent=!playing?'YOU CHOOSE THE PACE':document.hidden?'PAUSED WHILE AWAY':'NEXT FRAME IN '+remaining+'s';}
function render(persist=true){
  $('screen').classList.toggle('q-mono',mono);$('screen').innerHTML=renderScreen(view(state,mapMode),{layout,mapMode});$('device').className='device '+layout;$('layout').value=layout;$('mapMode').value=mapMode;$('speed').value=String(seconds);
  $('color').classList.toggle('active',!mono);$('mono').classList.toggle('active',mono);$('color').setAttribute('aria-pressed',String(!mono));$('mono').setAttribute('aria-pressed',String(mono));status();if(persist)save();
}
let advancing=false;
async function next(choice=null){
  if(advancing)return;advancing=true;const startingState=state;
  try{if((choice||automatic(state))==='descend'){await refreshStoryContent(state.story?.release||'');}if(state!==startingState)return;state=advance(state,choice);history.push({turn:state.turn,text:state.last});history=history.slice(-120);remaining=seconds;render();$('announcement').textContent='Turn '+state.turn+'. '+state.last;}
  catch(err){$('saveNote').textContent=err.message;}finally{advancing=false;}
}
$('screen').addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(button)next(button.dataset.action);});
$('next').addEventListener('click',()=>next());
$('pause').addEventListener('click',()=>{playing=!playing;remaining=seconds;status();save();});
$('speed').addEventListener('change',event=>{seconds=Number(event.target.value);remaining=seconds;status();save();});
$('mapMode').addEventListener('change',event=>{mapMode=event.target.value;render();});
$('layout').addEventListener('change',event=>{layout=event.target.value;render();});
for(const [id,value]of [['color',false],['mono',true]])$(id).addEventListener('click',()=>{mono=value;render();});
$('new').addEventListener('click',()=>{$('seed').value=state.seed;$('style').value=state.style;$('newDialog').showModal();});
$('newForm').addEventListener('submit',event=>{event.preventDefault();state=newCampaign($('seed').value,$('style').value);state=advance(state);history=[{turn:0,text:state.log[0]},{turn:state.turn,text:state.last}];remaining=seconds;$('newDialog').close();render();});
$('journal').addEventListener('click',()=>{const v=view(state);$('journalSummary').textContent='Floor '+state.floor+' · '+state.relics+' embers · '+state.turn+' actions. '+v.summary;$('journalEntries').innerHTML=history.map(h=>'<li value="'+h.turn+'">'+e(h.text)+'</li>').join('');$('journalDialog').showModal();});
for(const b of document.querySelectorAll('[data-close]'))b.addEventListener('click',()=>$(b.dataset.close).close());
document.addEventListener('visibilitychange',()=>{remaining=seconds;status();if(!document.hidden)refreshStoryContent(state.story?.release||'');});
setInterval(()=>{if(!document.hidden)refreshStoryContent(state.story?.release||'');},600000);
setInterval(()=>{if(!playing||document.hidden||document.querySelector('dialog[open]'))return;if(--remaining<=0)next();else status();},1000);
// A second tab adopts newer saves instead of repeatedly overwriting the expedition.
window.addEventListener('storage',event=>{if(event.key!==KEY||!event.newValue)return;try{const saved=JSON.parse(event.newValue);if(validCampaign(saved.state)){state=saved.state;history=Array.isArray(saved.history)?saved.history.filter(h=>h&&Number.isInteger(h.turn)&&typeof h.text==='string').slice(-120):[];playing=false;remaining=seconds;render(false);$('saveNote').textContent='Updated from another tab. Autopilot paused here to keep one journey.';}}catch{}});
render();
