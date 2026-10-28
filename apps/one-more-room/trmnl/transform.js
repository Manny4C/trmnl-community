// Data-only chapters. No model calls, dynamic code, or wall-clock player actions.
const STORY_PACKS=new Map();
let LATEST_STORY='';
const storyId=value=>typeof value==='string'&&/^[a-z][a-z0-9_-]{0,63}$/.test(value);
const storyText=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[<>\u0000-\u0008]/.test(value);
const storyIds=(value,max=48)=>Array.isArray(value)&&value.length<=max&&value.every(storyId)&&new Set(value).size===value.length;
function validateStoryPack(p){
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
function installStoryContent({latest,packs}){
  if(!storyId(latest)||!Array.isArray(packs)||packs.length>3)throw Error('Invalid story delivery');
  for(const p of packs){const errors=validateStoryPack(p);if(errors.length)throw Error(errors.join('; '));const existing=STORY_PACKS.get(p.id);if(existing&&JSON.stringify(existing)!==JSON.stringify(p))throw Error('A released chapter changed');}
  if(!packs.some(p=>p.id===latest)&&!STORY_PACKS.has(latest))throw Error('Latest chapter missing');
  const registry=new Map();for(const pack of [...STORY_PACKS.values(),...packs])for(const [id,index]of Object.entries(pack.factIndex)){if(registry.has(id)&&registry.get(id)!==index)throw Error('Permanent fact identity changed');for(const [known,at]of registry)if(at===index&&known!==id)throw Error('Permanent fact index reused');registry.set(id,index);}
  for(const p of packs)STORY_PACKS.set(p.id,JSON.parse(JSON.stringify(p)));LATEST_STORY=latest;
}
function storyContentSnapshot(pinned=''){return {latest:LATEST_STORY,packs:[...new Set([pinned,LATEST_STORY].filter(Boolean))].map(id=>STORY_PACKS.get(id)).filter(Boolean)};}
function validStoryState(s){return !s||s.v===1&&storyId(s.release)&&storyIds(s.flags)&&storyIds(s.seen,32)&&typeof s.facts==='string'&&/^[0-9a-f]{0,1024}$/.test(s.facts)&&Array.isArray(s.history)&&s.history.length<=2&&s.history.every(x=>storyText(x,110))&&(!s.scene||storyId(s.scene.id)&&Number.isInteger(s.scene.pos)&&s.scene.pos>=0&&s.scene.pos<24&&Number.isInteger(s.scene.floor)&&s.scene.floor>0);}
function storyPack(s){return s.story?STORY_PACKS.get(s.story.release):null;}
function storyChapterDone(s){const p=storyPack(s);if(!p)return false;return p.arcs.every(a=>(!a.required&&!s.story.flags.includes(a.starts))||s.story.flags.includes(a.completes));}
function adoptStoryChapter(s){
  if(!LATEST_STORY)return;
  if(s.story&&(!storyChapterDone(s)||s.story.release===LATEST_STORY))return;
  const prior=s.story,old=storyPack(s),history=prior?[...prior.history,old.ending].slice(-2):[];
  s.story={v:1,release:LATEST_STORY,flags:[],seen:[],facts:prior?.facts||'',history,scene:null};
}
function storyScene(s){const p=storyPack(s),m=s.story?.scene;return p&&m&&m.floor===s.floor&&m.pos===s.pos?p.cards.find(c=>c.id===m.id):null;}
function hasStoryFact(s,id){const index=storyPack(s)?.factIndex[id];if(index===undefined)return false;return Boolean(parseInt(s.story.facts[Math.floor(index/4)]||'0',16)&(1<<(index%4)));}
function rememberStoryFact(s,id){const index=storyPack(s).factIndex[id];if(index===undefined)throw Error('Unknown permanent fact');const at=Math.floor(index/4),hex=s.story.facts.padEnd(at+1,'0');s.story.facts=hex.slice(0,at)+(parseInt(hex[at],16)|(1<<(index%4))).toString(16)+hex.slice(at+1);}
function storyEligible(s,c){
  const m=s.story;
  return c.requires.every(f=>m.flags.includes(f))&&c.forbids.every(f=>!m.flags.includes(f))&&(c.requiresFacts||[]).every(f=>hasStoryFact(s,f))&&(c.forbidsFacts||[]).every(f=>!hasStoryFact(s,f));
}
function offerStoryScene(s,slot,region,cleared){
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
function storyOptions(s){const c=storyScene(s);if(!c||(s.cleared&(1<<s.pos)))return null;return affordableStoryActions(s,c).map(o=>({id:'story:'+o.id,label:o.label,actor:['Brann','Pip','Mira','Fern'][o.actor],hint:['Might','Finesse','Lore','Instinct'][o.actor]+' · DC '+o.dc}));}
function automaticStoryOption(s){const c=storyScene(s);if(!c||(s.cleared&(1<<s.pos)))return null;const preferred=s.style==='bold'?'brave':s.style==='careful'?'careful':'kind';const available=affordableStoryActions(s,c);return 'story:'+(available.find(o=>o.approach===preferred)||available[0]).id;}
function storyAction(s,id){const c=storyScene(s);return c?.options.find(o=>'story:'+o.id===id);}
function applyStoryOutcome(s,result){
  const scene=storyScene(s);s.story.flags=[...new Set([...s.story.flags,...(result.set||[])])].slice(-48);for(const fact of result.facts||[])rememberStoryFact(s,fact);
  s.story.seen=[...s.story.seen.filter(id=>id!==scene.id),scene.id].slice(-32);
  s.gold=Math.max(0,s.gold+(result.gold||0));s.supplies=Math.max(0,Math.min(9,s.supplies+(result.supplies||0)));
}

// Shared, deterministic rules for the browser and the TRMNL Serverless bundle.
// Original procedural fiction. No model service, secret or paid API is used.
const HEROES = [
  {name:'Brann',role:'Guardian',max:26,skill:4,stat:'Might'},
  {name:'Pip',role:'Rogue',max:18,skill:5,stat:'Finesse'},
  {name:'Mira',role:'Mage',max:18,skill:5,stat:'Lore'},
  {name:'Fern',role:'Ranger',max:22,skill:4,stat:'Instinct'}
];
const THEMES = [
  ['The Sunken Abbey','water drips upward','the drowned bell','Bellkeeper','a choir of lost names'],
  ['The Briar Archive','roots thread the stone','a living book','Thorn Warden','the forest before it burned'],
  ['The Clockwork Crypt','brass gears turn in silence','an unwound heart','Brass Sentinel','a promise made to time'],
  ['The Glass Catacombs','light bends around corners','a broken mirror','Glass Widow','a kingdom trapped in reflection'],
  ['The Ember Observatory','ash falls like snow','a fallen star','Ash Astronomer','the night the sun disappeared'],
  ['The Hollow Orchard','silver fruit hums softly','a sleeping seed','Root King','the first tree beneath the world']
];
const REGION_IDS=['abbey','briar','clockwork','glass','ember','orchard'];
const ROOMS = ['Flooded Vestry','Whispering Hall','Broken Reliquary','Moss Stair','Silent Gallery','Lantern Vault','Pilgrim Cell','Salt Library','Moon Well','Crooked Chapel','Dust Chamber','Hidden Nursery','Oath Room','Echo Bridge','Watch Post','Ivory Passage','Star Garden','Raven Niche','Candle Court','Bone Workshop','Sunken Study','Hushed Crossing','Winding Landing','Last Threshold'];
const FOES = ['Lantern Wisp','Hollow Knight','Ink Familiar','Briar Hound','Clockwork Spider','Candle Shade','Paper Drake','Salt Revenant'];
const GLYPHS = ['·','!','^','?','$','+','▼'];
const KINDS = ['passage','battle','trap','lore','treasure','shrine','keeper'];
function seedText(value) { return String(value ?? 'lantern').normalize('NFKC').replace(/[^a-zA-Z0-9 _-]/g,'').trim().slice(0,32) || 'lantern'; }
function hash(value) { let n=2166136261;for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0 || 1; }
function random(source) { let n=source.rng>>>0;n^=n<<13;n^=n>>>17;n^=n<<5;source.rng=n>>>0;return source.rng/4294967296; }
function pick(source,list){return list[Math.floor(random(source)*list.length)];}
function die(source,sides=20){return 1+Math.floor(random(source)*sides);}
function bit(mask,index){return Boolean(mask & (1<<index));}
function adj(index){return [index>=6?index-6:-1,index%6<5?index+1:-1,index<18?index+6:-1,index%6>0?index-1:-1].filter(i=>i>=0);}
function dungeon(seed,floor){
  const source={rng:hash(seed+':floor:'+floor)},links=Array.from({length:24},()=>[]),seen=new Set([0]),stack=[0];
  while(stack.length){const here=stack.at(-1),next=adj(here).filter(i=>!seen.has(i));if(!next.length){stack.pop();continue;}const n=pick(source,next);links[here].push(n);links[n].push(here);seen.add(n);stack.push(n);}
  const distance=Array(24).fill(-1),queue=[0];distance[0]=0;
  for(const p of queue)for(const n of links[p])if(distance[n]<0){distance[n]=distance[p]+1;queue.push(n);}
  const gate=distance.indexOf(Math.max(...distance)),theme=THEMES[hash(seed+':theme:'+floor)%THEMES.length];
  const kinds=Array.from({length:24},(_,i)=>i===0?0:i===gate?6:pick(source,[1,1,2,3,3,4,4,5]));
  return {links,gate,kinds,theme,region:REGION_IDS[hash(seed+':theme:'+floor)%THEMES.length],names:Array.from({length:24},(_,i)=>ROOMS[(hash(seed+':room:'+floor+':'+i))%ROOMS.length])};
}
function validCampaign(s){
  return !!s&&s.v===1&&typeof s.seed==='string'&&s.seed===seedText(s.seed)&&Number.isInteger(s.rng)&&s.rng>0&&s.rng<=4294967295&&
    Number.isInteger(s.turn)&&s.turn>=0&&s.turn<1e9&&Number.isInteger(s.floor)&&s.floor>=1&&s.floor<1e6&&
    Number.isInteger(s.pos)&&s.pos>=0&&s.pos<24&&Array.isArray(s.hp)&&s.hp.length===4&&s.hp.every((n,i)=>Number.isInteger(n)&&n>=0&&n<=HEROES[i].max+2*level(s))&&
    ['visited','cleared','gold','supplies','relics','enemy','turnsHere'].every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<1e9)&&
    s.visited<16777216&&s.cleared<16777216&&s.supplies<=9&&s.enemy<=100&&typeof s.frame==='string'&&s.frame.length<=80&&
    ['balanced','bold','careful'].includes(s.style)&&Array.isArray(s.log)&&s.log.length<=6&&s.log.every(l=>typeof l==='string'&&l.length<=190)&&typeof s.last==='string'&&s.last.length<=190&&typeof s.roll==='string'&&s.roll.length<=190&&validStoryState(s.story);
}
function level(s){return Math.min(12,Math.floor((s.floor-1)/2));}
function maxHP(s,i){return HEROES[i].max+2*level(s);}
function note(s,text){s.last=text.slice(0,190);s.log.push(s.last);s.log=s.log.slice(-6);}
function newCampaign(seed='lantern',style='balanced'){
  const s={v:1,seed:seedText(seed),style:['balanced','bold','careful'].includes(style)?style:'balanced',rng:hash(seedText(seed)+':party'),turn:0,floor:1,pos:0,visited:1,cleared:1,hp:HEROES.map(h=>h.max),gold:12,supplies:3,relics:0,enemy:0,turnsHere:0,frame:'',log:[],last:'',roll:''};
  note(s,'The Lantern Company entered the underworld to rekindle the stolen sun.');adoptStoryChapter(s);return s;
}
function route(s,map){
  const queue=[[s.pos]],seen=new Set([s.pos]);
  while(queue.length){const path=queue.shift(),p=path.at(-1);if(p!==s.pos&&!bit(s.cleared,p))return path[1];for(const n of map.links[p])if(!seen.has(n)){seen.add(n);queue.push([...path,n]);}}
  return map.links[s.pos][0];
}
function threat(s,map){return map.kinds[s.pos]===6?10+Math.min(12,s.floor)*2:5+Math.min(10,s.floor);}
function wounded(s){return s.hp.reduce((a,h,i)=>a+(maxHP(s,i)-h),0);}
function baseOptions(s){
  const map=dungeon(s.seed,s.floor),kind=map.kinds[s.pos],done=bit(s.cleared,s.pos);
  if(done&&s.pos===map.gate)return [{id:'descend',label:'Take the stairs below',actor:'Party',hint:'A new floor'},{id:'camp',label:'Rest before descending',actor:'Fern',hint:s.supplies?'1 supply':'Catch your breath'},{id:'reflect',label:'Read the recovered fragment',actor:'Mira',hint:'Remember the quest'}];
  if(done){const target=route(s,map);return [...map.links[s.pos]].sort((a,b)=>(a===target?-1:b===target?1:Number(bit(s.cleared,a))-Number(bit(s.cleared,b)))).slice(0,3).map(n=>({id:'move:'+n,label:bit(s.visited,n)?'Return to '+map.names[n]:'Explore '+(['north','east','south','west'][n===s.pos-6?0:n===s.pos+1?1:n===s.pos+6?2:3]),actor:'Party',hint:bit(s.cleared,n)?'Mapped passage':'Unexplored'}));}
  if(kind===1||kind===6)return [{id:'strike',label:'Hold the line and strike',actor:'Brann',hint:'Might · DC '+(kind===6?14:11)},{id:'flank',label:'Slip behind the enemy',actor:'Pip',hint:'Finesse · DC '+(kind===6?15:13)},{id:'spell',label:kind===6?'Unbind the keeper’s oath':'Cast a lantern spell',actor:'Mira',hint:'Lore · DC '+(kind===6?15:12)}];
  if(kind===2)return [{id:'disarm',label:'Disarm the hidden mechanism',actor:'Pip',hint:'Finesse · DC 12'},{id:'leap',label:'Lead everyone across',actor:'Fern',hint:'Instinct · DC 13'},{id:'ward',label:'Shield the party with light',actor:'Mira',hint:'Lore · DC 14'}];
  if(kind===3)return [{id:'decipher',label:'Read the forgotten inscription',actor:'Mira',hint:'Lore · DC 11'},{id:'trace',label:'Follow the old tracks',actor:'Fern',hint:'Instinct · DC 12'},{id:'oath',label:'Speak the guardian’s oath',actor:'Brann',hint:'Might · DC 13'}];
  if(kind===4)return [{id:'search',label:'Search for hidden treasure',actor:'Pip',hint:'Finesse · DC 11'},{id:'listen',label:'Listen before opening it',actor:'Fern',hint:'Instinct · DC 12'},{id:'ritual',label:'Lift the seal with a ritual',actor:'Mira',hint:'Lore · DC 13'}];
  return [{id:'rest',label:'Share supplies and recover',actor:'Fern',hint:s.supplies?'1 supply · heal all':'No supplies · small recovery'},{id:'offering',label:'Leave an offering of gold',actor:'Brann',hint:s.gold>=5?'5 gold · heal all':'Small recovery'},{id:'commune',label:'Ask the shrine for guidance',actor:'Mira',hint:'Lore · DC 10'}];
}
function options(s){return (storyOptions(s)||baseOptions(s)).map(o=>{const who=HEROES.findIndex(h=>h.name===o.actor);return who>=0&&s.hp[who]===0?{id:'revive:'+who,label:'Help '+o.actor+' back to their feet',actor:'Party',hint:'Recover 4 HP'}:o;});}
function automatic(s){
  const storyAuto=automaticStoryOption(s);if(storyAuto){const available=options(s);return available.some(o=>o.id===storyAuto)?storyAuto:available[0].id;}
  const o=options(s),map=dungeon(s.seed,s.floor),kind=map.kinds[s.pos];
  if(bit(s.cleared,s.pos))return s.pos===map.gate&&wounded(s)>30&&s.supplies?o[1].id:o[0].id;
  if(kind===5){const preferred=wounded(s)>10?'rest':'commune';return o.some(a=>a.id===preferred)?preferred:o[0].id;}
  if(kind===1||kind===6){const preferred=s.style==='bold'?'strike':s.style==='careful'?'spell':s.turn%3===0?'flank':'strike';return o.some(a=>a.id===preferred)?preferred:o.find(a=>!a.id.startsWith('revive:'))?.id||o[0].id;}
  return o[0].id;
}
function heal(s,amount){s.hp=s.hp.map((h,i)=>Math.min(maxHP(s,i),h+amount));}
function hurt(s,amount){let candidates=s.hp.map((h,i)=>h>0?i:-1).filter(i=>i>=0);if(!candidates.length)return;const i=pick(s,candidates);s.hp[i]=Math.max(0,s.hp[i]-amount);return HEROES[i].name;}
function check(s,who,dc){const roll=die(s),bonus=HEROES[who].skill+Math.floor(level(s)/3),ok=roll===20||(roll!==1&&roll+bonus>=dc);s.roll=HEROES[who].name+' · d20 '+roll+' + '+bonus+' = '+(roll+bonus)+' / DC '+dc+' · '+(ok?'SUCCESS':'SETBACK');return {ok,roll};}
function advance(previous,choice=null,frame=null){
  if(!validCampaign(previous))throw new Error('Invalid campaign state');
  const s=JSON.parse(JSON.stringify(previous));
  if(frame!==null&&(String(frame).slice(0,80)===s.frame||(/^minute:\d+$/.test(String(frame))&&/^minute:\d+$/.test(s.frame)&&Number(String(frame).slice(7))<=Number(s.frame.slice(7)))))return s;
  if(s.story&&!storyPack(s))throw Error('This chapter is unavailable. Your progress is safe; retry when its content returns.');
  const list=options(s),id=choice??automatic(s);if(!list.some(o=>o.id===id))throw new Error('That action is no longer available');
  s.turn++;s.turnsHere++;s.frame=frame===null?'browser:'+s.turn:String(frame).slice(0,80);s.roll='';
  const map=dungeon(s.seed,s.floor),kind=map.kinds[s.pos],done=bit(s.cleared,s.pos);
  if(id.startsWith('story:')){
    const action=storyAction(s,id),{ok}=check(s,action.actor,action.dc),result=ok?action.success:action.setback;
    applyStoryOutcome(s,result);if(result.heal)heal(s,result.heal);if(result.hurt)hurt(s,result.hurt);s.cleared|=1<<s.pos;note(s,result.text);
  }else if(id.startsWith('revive:')){
    const who=Number(id.split(':')[1]);s.hp[who]=4;note(s,'The company helped '+HEROES[who].name+' back to their feet. Nobody gets left behind.');
  }else if(id.startsWith('move:')){
    const next=Number(id.split(':')[1]),known=bit(s.visited,next);s.pos=next;s.visited|=1<<next;s.turnsHere=0;s.enemy=bit(s.cleared,next)?0:([1,6].includes(map.kinds[next])?threat(s,map):0);
    offerStoryScene(s,KINDS[map.kinds[next]],map.region,bit(s.cleared,next));
    note(s,known?'The company retraced its steps to '+map.names[next]+'.':pick(s,['Fern lifted the lantern.','Brann pushed the door open.','Pip found a narrow way through.','Mira followed a thread of light.'])+' '+map.names[next]+' lay beyond.');
  }else if(id==='descend'){
    s.floor++;s.pos=0;s.visited=1;s.cleared=1;s.enemy=0;s.turnsHere=0;s.supplies=Math.min(9,s.supplies+2);heal(s,6);adoptStoryChapter(s);
    note(s,'Fragment '+s.relics+' lit the way down. The company reached '+dungeon(s.seed,s.floor).theme[0]+'.');
  }else if(id==='reflect'){
    heal(s,1);note(s,'Mira read the ember: “'+pick(s,['No dawn is lost while someone carries its light.','The sun remembers every name.','Below the last door, morning is waiting.','A small flame can wake a sleeping world.'])+'”');
  }else if(id==='camp'){
    const supply=s.supplies>0;if(supply)s.supplies--;heal(s,supply?10:2);note(s,'Fern made camp by the stairs. The company recovered '+(supply?'over shared rations.':'with a short breather.'));
  }else if(kind===1||kind===6){
    const who=id==='strike'?0:id==='flank'?1:2,dc=kind===6?(id==='strike'?14:15):(id==='strike'?11:id==='flank'?13:12),{ok,roll}=check(s,who,dc);
    const foe=kind===6?map.theme[3]:FOES[hash(s.seed+':foe:'+s.floor+':'+s.pos)%FOES.length];
    s.enemy=s.enemy||threat(s,map);const damage=ok?(roll===20?8:die(s,6)+3):1;s.enemy=Math.max(0,s.enemy-damage);
    if(!s.enemy){s.cleared|=1<<s.pos;s.gold+=kind===6?20:5;if(kind===6){s.relics++;heal(s,4);}note(s,HEROES[who].name+' '+(ok?'broke':'wore down')+' the '+foe+'. '+(kind===6?'An ember fragment woke. The stairs opened.':'The passage is safe. +5 gold.'));}
    else{const target=hurt(s,ok?die(s,3):die(s,4)+2);note(s,HEROES[who].name+(ok?' struck':' pressed forward')+' for '+damage+'. The '+foe+' answered; '+target+' took the blow.');}
  }else if(kind===2){
    const who=id==='disarm'?1:id==='leap'?3:2,{ok}=check(s,who,id==='disarm'?12:id==='leap'?13:14);s.cleared|=1<<s.pos;
    if(ok){s.gold+=3;note(s,HEROES[who].name+' stilled the '+pick(s,['singing tripwire','falling stones','needlework lock','clockwork snare'])+'. Everyone crossed safely.');}
    else{const target=hurt(s,die(s,4)+2);note(s,'The mechanism snapped before '+HEROES[who].name+' could stop it. '+target+' was hurt, but the way is open.');}
  }else if(kind===3){
    const who=id==='decipher'?2:id==='trace'?3:0,{ok}=check(s,who,id==='decipher'?11:id==='trace'?12:13);s.cleared|=1<<s.pos;
    note(s,ok?HEROES[who].name+' uncovered '+map.theme[4]+'. '+pick(s,['The keeper is bound by a forgotten oath.','An ember fragment lies beyond the keeper.','Someone carried a lantern here before them.','The stolen sunlight is still alive below.']):'The meaning escaped '+HEROES[who].name+', but a sun-shaped mark pointed deeper.');if(ok)s.supplies=Math.min(9,s.supplies+1);
  }else if(kind===4){
    const who=id==='search'?1:id==='listen'?3:2,{ok}=check(s,who,id==='search'?11:id==='listen'?12:13);s.cleared|=1<<s.pos;
    const gold=ok?die(s,10)+5:2;s.gold+=gold;if(ok)s.supplies=Math.min(9,s.supplies+1);
    note(s,HEROES[who].name+' found '+gold+' gold'+(ok?' and a bundle of rations':' beneath a broken seal')+'. '+pick(s,['Pip promised to share. Eventually.','Brann checked that everyone had eaten.','The lantern burned a little brighter.','Fern tucked away a curious silver feather.']));
  }else if(kind===5){
    s.cleared|=1<<s.pos;
    if(id==='commune'){const {ok}=check(s,2,10);heal(s,ok?8:3);note(s,ok?'The shrine answered Mira with a warm light. Old wounds closed.':'The shrine stayed silent. The company rested beneath its gentle glow.');}
    else {const paid=id==='rest'?s.supplies>0:s.gold>=5;if(paid){if(id==='rest')s.supplies--;else s.gold-=5;}heal(s,paid?10:3);note(s,'The company rested at the '+pick(s,['moss-covered','candlelit','sun-carved','forgotten'])+' shrine. '+(paid?'Shared hope restored their strength.':'They caught their breath.'));}
  }
  if(s.hp.every(h=>h===0)){
    s.hp=s.hp.map((_,i)=>Math.ceil(maxHP(s,i)*0.65));s.gold=Math.floor(s.gold/2);s.pos=0;s.enemy=0;s.turnsHere=0;if(s.story)s.story.scene=null;
    note(s,'The lantern flared and carried everyone to the entrance. Half their gold was lost; their journey continues.');
  }
  return s;
}
function chart(s,map,cells,requested='auto'){
  const complete=bit(s.cleared,map.gate),mode=requested==='world'||requested==='dungeon'?requested:(s.pos===0||s.turn<=1||complete?'world':'dungeon');
  const curve=points=>points.length?'M'+points[0].join(',')+points.slice(1).map((p,i)=>{const a=points[i];return 'Q'+Math.round((a[0]+p[0])/2)+','+a[1]+' '+p.join(',');}).join(''):'';
  if(mode==='world'){
    const chapter=Math.floor((s.floor-1)/6),step=(s.floor-1)%6,places=[[75,165],[140,151],[106,97],[188,57],[260,118],[303,55]],regions=['The Lantern Marches','The Hollow Reaches','The Ashen Frontier','The Sunless Vale'];
    const points=places.map((p,i)=>[...p,i===step?3:i<step?2:0,i<=step?dungeon(s.seed,chapter*6+i+1).theme[0].replace(/^The /,''):'',String(chapter*6+i+1)]);
    return {map_mode:mode,map_title:regions[chapter%regions.length],map_context:'World · chapter '+(chapter+1),map_reason:complete?'Ember recovered · onward to the next dungeon':s.pos===0?'A new leg of the journey':'The journey begins',map_box:'0 0 360 210',map_points:points,map_roads:curve(places.slice(step,Math.min(6,step+2))),map_trail:curve(places.slice(0,step+1)),map_caption:Math.min(6,Math.max(0,s.relics-chapter*6))+'/6 dungeons · '+s.relics+' embers'};
  }
  const points=cells.map((c,i)=>{const j=hash(s.seed+':chart:'+s.floor+':'+i);return [28+(i%6)*60+(j%13)-6,28+Math.floor(i/6)*51+(Math.floor(j/13)%11)-5,c[0],i===s.pos?'Company':i===0?'Entrance':i===map.gate&&c[0]>=2?'Keeper':'',c[1]];});
  const segments=[];for(let i=0;i<24;i++)if(bit(s.visited,i))for(const n of map.links[i])if(n>i&&bit(s.visited,n))segments.push(curve([[points[i][0],points[i][1]],[points[n][0],points[n][1]]]));
  const queue=[[0]],seen=new Set([0]);let route=[0];while(queue.length){const path=queue.shift(),p=path.at(-1);if(p===s.pos){route=path;break;}for(const n of map.links[p])if(!seen.has(n)){seen.add(n);queue.push([...path,n]);}}
  const active=!bit(s.cleared,s.pos),known=points.filter(p=>p[2]>0),xs=known.map(p=>p[0]),ys=known.map(p=>p[1]);
  let width=active?245:Math.max(155,Math.max(...xs)-Math.min(...xs)+50,(Math.max(...ys)-Math.min(...ys)+42)*360/210);width=Math.min(360,width);
  const height=width*210/360,cx=active?points[s.pos][0]:(Math.min(...xs)+Math.max(...xs))/2,cy=active?points[s.pos][1]:(Math.min(...ys)+Math.max(...ys))/2;
  const x=Math.round(Math.max(0,Math.min(360-width,cx-width/2))),y=Math.round(Math.max(0,Math.min(210-height,cy-height/2)));
  return {map_mode:mode,map_title:map.theme[0],map_context:active?'Dungeon · encounter detail':'Dungeon · explored route',map_reason:map.names[s.pos]+' · room '+(s.pos+1),map_box:[x,y,Math.round(width),Math.round(height)].join(' '),map_points:points,map_roads:segments.join(''),map_trail:curve(route.map(i=>[points[i][0],points[i][1]])),map_caption:'',};
}
function view(s,mapMode='auto'){
  const map=dungeon(s.seed,s.floor),kind=map.kinds[s.pos],done=bit(s.cleared,s.pos),auto=automatic(s);
  let text,title=map.names[s.pos];
  if(s.pos===0){title=map.theme[0];text='Beyond the lantern, '+map.theme[1]+'. Somewhere below waits '+map.theme[2]+'. The company chooses a path.';}
  else if(kind===1||kind===6){const foe=kind===6?map.theme[3]:FOES[hash(s.seed+':foe:'+s.floor+':'+s.pos)%FOES.length];title=done?'A light in the dark':foe;text=done?(kind===6?'The keeper falls silent. An ember of the stolen sun floats above the stairs. A deeper floor waits.':'The foe is gone. The lantern reveals another path through the quiet chamber.'):(kind===6?'The keeper guards an ember of the stolen sun. An old oath binds it to this room.':'A '+foe.toLowerCase()+' steps into the lantern light. The company closes ranks.')+' '+(s.enemy||threat(s,map))+' HP remaining.';}
  else if(kind===2)text=done?'The trap is spent. Beyond it, the corridor bends into darkness.':'A wire glints at ankle height. Inside the walls, something begins to tick. The company pauses at the threshold.';
  else if(kind===3)text=done?'The old inscription has given up its secrets. The party carries its story onward.':'A sun is carved into the stone. Beneath it, an inscription remembers '+map.theme[4]+'.';
  else if(kind===4)text=done?'The chest is empty. Its treasures are safely stowed; the lantern points onward.':'A sealed coffer rests beneath a weathered statue. A tiny light leaks through the keyhole. Nothing else in the room moves.';
  else text=done?'The shrine fades to a gentle glow. Rested or wiser, the company prepares to leave.':'Warm light gathers around a forgotten shrine. For the first time in hours, this place feels safe.';
  const chapter=storyPack(s),scene=storyScene(s);
  if(chapter&&s.pos===0){title=storyChapterDone(s)?'A promise kept':chapter.title;text=storyChapterDone(s)?chapter.ending:chapter.intro;}
  if(scene){title=scene.title;text=done?scene.after:scene.text;}
  const visible=map.links.reduce((mask,neighbors,i)=>bit(s.visited,i)?neighbors.reduce((m,n)=>m|(1<<n),mask):mask,s.visited);
  // Compact tuple cells: [status (0 fog, 1 frontier, 2 visited, 3 current), glyph, exits N/E/S/W bit mask].
  const cells=map.links.map((ns,i)=>[i===s.pos?3:bit(s.visited,i)?2:bit(visible,i)?1:0,i===s.pos?'◆':bit(s.visited,i)?(bit(s.cleared,i)&&i!==map.gate?'·':GLYPHS[map.kinds[i]]):'?',ns.reduce((m,n)=>m|(n===i-6?1:n===i+1?2:n===i+6?4:8),0)]);
  const explored=Array.from({length:24},(_,i)=>bit(s.visited,i)).filter(Boolean).length,atlas=chart(s,map,cells,mapMode);
  if(atlas.map_mode==='dungeon')atlas.map_caption=explored+'/24 rooms mapped · floor '+s.floor;
  return {turn:s.turn,floor:s.floor,seed:s.seed,theme:map.theme[0],title,text,kind:KINDS[kind],safe:done,cells,room:s.pos+1,explored,...atlas,
    chapter_title:chapter?.title||'',chapter_complete:chapter?storyChapterDone(s):false,
    objective:chapter?(storyChapterDone(s)?'Carry the light onward. The road remembers.':'Restore the sun. Keep the road and its promises.'):done&&s.pos===map.gate?'Carry the ember into the next dungeon':'Find the keeper. Recover an ember of the sun.',
    party:s.hp.map((hp,i)=>({name:HEROES[i].name,role:HEROES[i].role,hp,max:maxHP(s,i)})),gold:s.gold,supplies:s.supplies,relics:s.relics,
    summary:s.relics?'The company has recovered '+s.relics+' ember fragment'+(s.relics===1?'':'s')+' of the stolen sun. The next keeper waits below.':'Four heroes seek the fragments of the stolen sun. Their lantern is the last light in the underworld.',
    recap:s.log.slice(-2).map(l=>{const arrival=l.match(/(?:^|\. )([^.!?]+) lay beyond\.$/);const first=arrival?'Reached '+arrival[1]+'.':l.split(/(?<=[.!?])\s+/)[0];return first.length>98?first.slice(0,95).replace(/\s+\S*$/,'')+'…':first;}),log:s.log.slice(-3),last:s.last,roll:s.roll||'The lantern remembers. The journey continues.',choices:options(s).map(o=>({...o,auto:o.id===auto})),autoLabel:options(s).find(o=>o.id===auto)?.label||'Continue'};
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function run(input) {
  input=input||{};
  const remembered={...(input.trmnl?.previous_merge_variables||{})};delete remembered.trmnl_state;
  const fields=input.trmnl?.plugin_settings?.custom_fields_values||{};
  const seed=seedText(fields.campaign_seed??input.seed??'lantern');
  const style=['balanced','bold','careful'].includes(fields.party_style)?fields.party_style:'balanced';
  const prior=input.trmnl?.state;
  try{if(input.story_content)installStoryContent(input.story_content);}catch{return {...remembered,status:'Chapter content unavailable; progress preserved'};}
  let state=validCampaign(prior)&&prior.seed===seed?JSON.parse(JSON.stringify(prior)):newCampaign(seed,style);
  state.style=style;
  // A failed/empty poll must never erase a campaign or fabricate another turn.
  if(typeof input.frame!=='string'||!/^minute:\d{1,14}$/.test(input.frame))return {...(Object.keys(remembered).length?remembered:view(state)),status:'Waiting for a fresh frame'};
  if(state.story&&!storyPack(state))return {...(Object.keys(remembered).length?remembered:view(state)),status:'Pinned chapter unavailable; progress preserved'};
  state=advance(state,null,input.frame);
  return {...view(state),status:'Autopilot',trmnl_state:state};
}
