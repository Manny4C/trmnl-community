// Data-only chapters. No model calls, dynamic code, or wall-clock player actions.
const STORY_PACKS=new Map();
let LATEST_STORY='';
const storyId=value=>typeof value==='string'&&/^[a-z][a-z0-9_-]{0,63}$/.test(value);
const storyText=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[<>\u0000-\u0008]/.test(value);
const storyIds=(value,max=48)=>Array.isArray(value)&&value.length<=max&&value.every(storyId)&&new Set(value).size===value.length;
export function validateStoryPack(p){
  const errors=[];
  if(!p||p.schema!==1||!storyId(p.id)||!storyText(p.title,64)||!storyText(p.intro,155)||!storyText(p.ending,110))return ['Invalid chapter identity or text'];
  if(!Array.isArray(p.arcs)||!p.arcs.length||p.arcs.length>3||!p.arcs.some(a=>a.required===true))errors.push('A chapter needs 1–3 arcs and a required arc');
  for(const a of p.arcs||[])if(!storyId(a.id)||!storyId(a.starts)||!storyId(a.completes)||typeof a.required!=='boolean')errors.push('Invalid arc');
  if(!Array.isArray(p.cards)||p.cards.length<3||p.cards.length>24)return [...errors,'A pack needs 3–24 cards'];
  if(!p.factIndex||Object.entries(p.factIndex).some(([id,index])=>!storyId(id)||!Number.isInteger(index)||index<0||index>4095)||new Set(Object.values(p.factIndex)).size!==Object.keys(p.factIndex).length)errors.push('Invalid permanent fact registry');
  if(new Set((p.arcs||[]).map(a=>a.id)).size!==(p.arcs||[]).length)errors.push('Duplicate arc identity');
  const ids=new Set();
  for(const c of p.cards){
    if(!storyId(c.id)||ids.has(c.id))errors.push('Duplicate/invalid card ID');ids.add(c.id);
    if(!storyText(c.title,48)||!storyText(c.text,155)||!storyText(c.after,145))errors.push(c.id+': invalid scene text');
    if(!Array.isArray(c.slots)||!c.slots.length||c.slots.some(x=>!['lore','treasure','shrine'].includes(x)))errors.push(c.id+': invalid slot');
    if(!storyIds(c.regions,6)||!storyIds(c.refs,10)||!storyIds(c.requires)||!storyIds(c.forbids)||!storyIds(c.requiresFacts||[])||!storyIds(c.forbidsFacts||[]))errors.push(c.id+': invalid references/conditions');
    if(c.arc&&!p.arcs.some(a=>a.id===c.arc))errors.push(c.id+': unknown arc');
    if(!Array.isArray(c.options)||c.options.length!==3){errors.push(c.id+': three choices required');continue;}
    for(const fact of [...(c.requiresFacts||[]),...(c.forbidsFacts||[]),...c.options.flatMap(o=>[...(o.success?.facts||[]),...(o.setback?.facts||[])])])if(p.factIndex?.[fact]===undefined)errors.push(c.id+': missing permanent fact index');
    if(!c.options.some(o=>[o.success,o.setback].every(r=>(r?.gold||0)>=0&&(r?.supplies||0)>=0)))errors.push(c.id+': at least one affordable approach is required');
    const optionIds=new Set();
    for(const o of c.options){
      if(!storyId(o.id)||optionIds.has(o.id)||!storyText(o.label,34)||!Number.isInteger(o.actor)||o.actor<0||o.actor>3||!Number.isInteger(o.dc)||o.dc<8||o.dc>16||!['brave','careful','kind'].includes(o.approach))errors.push(c.id+': invalid action');optionIds.add(o.id);
      for(const result of [o.success,o.setback]){
        if(!result||!storyText(result.text,159)||!storyIds(result.set||[])||!storyIds(result.facts||[],24))errors.push(c.id+': invalid result');
        if(!Number.isInteger(result?.gold??0)||(result.gold??0) < -5||(result.gold??0)>8||!Number.isInteger(result?.supplies??0)||Math.abs(result.supplies??0)>1||!Number.isInteger(result?.heal??0)||(result.heal??0)<0||(result.heal??0)>6||!Number.isInteger(result?.hurt??0)||(result.hurt??0)<0||(result.hurt??0)>4)errors.push(c.id+': invalid resource effect');
      }
    }
  }
  if(encodeURIComponent(JSON.stringify(p)).replace(/%[A-F\d]{2}/gi,'x').length>24000)errors.push('Pack exceeds 24,000-byte runtime budget');
  return errors;
}
export function installStoryContent({latest,packs}){
  if(!storyId(latest)||!Array.isArray(packs)||packs.length>3)throw Error('Invalid story delivery');
  for(const p of packs){const errors=validateStoryPack(p);if(errors.length)throw Error(errors.join('; '));const existing=STORY_PACKS.get(p.id);if(existing&&JSON.stringify(existing)!==JSON.stringify(p))throw Error('A released chapter changed');}
  if(!packs.some(p=>p.id===latest)&&!STORY_PACKS.has(latest))throw Error('Latest chapter missing');
  const registry=new Map();for(const pack of [...STORY_PACKS.values(),...packs])for(const [id,index]of Object.entries(pack.factIndex)){if(registry.has(id)&&registry.get(id)!==index)throw Error('Permanent fact identity changed');for(const [known,at]of registry)if(at===index&&known!==id)throw Error('Permanent fact index reused');registry.set(id,index);}
  for(const p of packs)STORY_PACKS.set(p.id,JSON.parse(JSON.stringify(p)));LATEST_STORY=latest;
}
export function storyContentSnapshot(pinned=''){return {latest:LATEST_STORY,packs:[...new Set([pinned,LATEST_STORY].filter(Boolean))].map(id=>STORY_PACKS.get(id)).filter(Boolean)};}
export function validStoryState(s){return !s||s.v===1&&storyId(s.release)&&storyIds(s.flags)&&storyIds(s.seen,32)&&typeof s.facts==='string'&&/^[0-9a-f]{0,1024}$/.test(s.facts)&&Array.isArray(s.history)&&s.history.length<=2&&s.history.every(x=>storyText(x,110))&&(!s.scene||storyId(s.scene.id)&&Number.isInteger(s.scene.pos)&&s.scene.pos>=0&&s.scene.pos<24&&Number.isInteger(s.scene.floor)&&s.scene.floor>0);}
export function storyPack(s){return s.story?STORY_PACKS.get(s.story.release):null;}
export function storyRequiredDone(s){const p=storyPack(s);return Boolean(p&&p.arcs.filter(a=>a.required).every(a=>s.story.flags.includes(a.completes)));}
export function storyChapterDone(s){const p=storyPack(s);if(!p)return false;return p.arcs.every(a=>(!a.required&&!s.story.flags.includes(a.starts))||s.story.flags.includes(a.completes));}
export function adoptStoryChapter(s){
  if(!LATEST_STORY)return;
  if(s.story&&(!storyChapterDone(s)||s.story.release===LATEST_STORY))return;
  const prior=s.story,old=storyPack(s),history=prior?[...prior.history,old.ending].slice(-2):[];
  s.story={v:1,release:LATEST_STORY,flags:[],seen:[],facts:prior?.facts||'',history,scene:null};
}
export function storyScene(s){const p=storyPack(s),m=s.story?.scene;return p&&m&&m.floor===s.floor&&m.pos===s.pos?p.cards.find(c=>c.id===m.id):null;}
export function hasStoryFact(s,id){const index=storyPack(s)?.factIndex[id];if(index===undefined)return false;return Boolean(parseInt(s.story.facts[Math.floor(index/4)]||'0',16)&(1<<(index%4)));}
function rememberStoryFact(s,id){const index=storyPack(s).factIndex[id];if(index===undefined)throw Error('Unknown permanent fact');const at=Math.floor(index/4),hex=s.story.facts.padEnd(at+1,'0');s.story.facts=hex.slice(0,at)+(parseInt(hex[at],16)|(1<<(index%4))).toString(16)+hex.slice(at+1);}
export function storyEligible(s,c){
  const m=s.story;
  return c.requires.every(f=>m.flags.includes(f))&&c.forbids.every(f=>!m.flags.includes(f))&&(c.requiresFacts||[]).every(f=>hasStoryFact(s,f))&&(c.forbidsFacts||[]).every(f=>!hasStoryFact(s,f));
}
export function offerStoryScene(s,slot,region,cleared){
  if(!s.story)return;s.story.scene=null;
  const p=storyPack(s);if(!p||cleared)return;
  const requiredDone=p.arcs.filter(a=>a.required).every(a=>s.story.flags.includes(a.completes));
  const eligible=p.cards.filter(c=>c.slots.includes(slot)&&(!c.regions.length||c.regions.includes(region))&&storyEligible(s,c)&&(c.arc||!s.story.seen.includes(c.id))&&!(c.startOptional&&requiredDone));
  const score=c=>c.arc?(p.arcs.find(a=>a.id===c.arc).required?100:s.story.flags.includes(p.arcs.find(a=>a.id===c.arc).starts)?80:40):0;
  eligible.sort((a,b)=>score(b)-score(a)||Number(s.story.seen.includes(a.id))-Number(s.story.seen.includes(b.id))||a.id.localeCompare(b.id));
  if(!eligible.length)return;
  const highest=score(eligible[0]),pool=eligible.filter(c=>score(c)===highest&&!s.story.seen.includes(c.id)),fallback=eligible.filter(c=>score(c)===highest);
  const candidates=pool.length?pool:fallback,index=(s.floor*31+s.pos*17+s.turn)%candidates.length;
  s.story.scene={id:candidates[index].id,pos:s.pos,floor:s.floor};
}
function affordableStoryActions(s,c){return c.options.filter(o=>s.gold>=Math.max(0,-(o.success.gold||0),-(o.setback.gold||0))&&s.supplies>=Math.max(0,-(o.success.supplies||0),-(o.setback.supplies||0)));}
export function storyOptions(s){const c=storyScene(s);if(!c||(s.cleared&(1<<s.pos)))return null;return affordableStoryActions(s,c).map(o=>({id:'story:'+o.id,label:o.label,actor:['Brann','Pip','Mira','Fern'][o.actor],hint:['Might','Finesse','Lore','Instinct'][o.actor]+' · DC '+o.dc}));}
export function automaticStoryOption(s){const c=storyScene(s);if(!c||(s.cleared&(1<<s.pos)))return null;const preferred=s.style==='bold'?'brave':s.style==='careful'?'careful':'kind';const available=affordableStoryActions(s,c);return 'story:'+(available.find(o=>o.approach===preferred)||available[0]).id;}
export function storyAction(s,id){const c=storyScene(s);return c?.options.find(o=>'story:'+o.id===id);}
export function applyStoryOutcome(s,result){
  const scene=storyScene(s);s.story.flags=[...new Set([...s.story.flags,...(result.set||[])])].slice(-48);for(const fact of result.facts||[])rememberStoryFact(s,fact);
  s.story.seen=[...s.story.seen.filter(id=>id!==scene.id),scene.id].slice(-32);
  s.gold=Math.max(0,s.gold+(result.gold||0));s.supplies=Math.max(0,Math.min(9,s.supplies+(result.supplies||0)));
}
