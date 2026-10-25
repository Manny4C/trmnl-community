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
  return {links,gate,kinds,theme,names:Array.from({length:24},(_,i)=>ROOMS[(hash(seed+':room:'+floor+':'+i))%ROOMS.length])};
}
function validCampaign(s){
  return !!s&&s.v===1&&typeof s.seed==='string'&&s.seed===seedText(s.seed)&&Number.isInteger(s.rng)&&s.rng>0&&s.rng<=4294967295&&
    Number.isInteger(s.turn)&&s.turn>=0&&s.turn<1e9&&Number.isInteger(s.floor)&&s.floor>=1&&s.floor<1e6&&
    Number.isInteger(s.pos)&&s.pos>=0&&s.pos<24&&Array.isArray(s.hp)&&s.hp.length===4&&s.hp.every((n,i)=>Number.isInteger(n)&&n>=0&&n<=HEROES[i].max+2*level(s))&&
    ['visited','cleared','gold','supplies','relics','enemy','turnsHere'].every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<1e9)&&
    s.visited<16777216&&s.cleared<16777216&&s.supplies<=9&&s.enemy<=100&&typeof s.frame==='string'&&s.frame.length<=80&&
    ['balanced','bold','careful'].includes(s.style)&&Array.isArray(s.log)&&s.log.length<=6&&s.log.every(l=>typeof l==='string'&&l.length<=190)&&typeof s.last==='string'&&s.last.length<=190&&typeof s.roll==='string'&&s.roll.length<=190;
}
function level(s){return Math.min(12,Math.floor((s.floor-1)/2));}
function maxHP(s,i){return HEROES[i].max+2*level(s);}
function note(s,text){s.last=text.slice(0,190);s.log.push(s.last);s.log=s.log.slice(-6);}
function newCampaign(seed='lantern',style='balanced'){
  const s={v:1,seed:seedText(seed),style:['balanced','bold','careful'].includes(style)?style:'balanced',rng:hash(seedText(seed)+':party'),turn:0,floor:1,pos:0,visited:1,cleared:1,hp:HEROES.map(h=>h.max),gold:12,supplies:3,relics:0,enemy:0,turnsHere:0,frame:'',log:[],last:'',roll:''};
  note(s,'The Lantern Company entered the underworld to rekindle the stolen sun.');return s;
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
function options(s){return baseOptions(s).map(o=>{const who=HEROES.findIndex(h=>h.name===o.actor);return who>=0&&s.hp[who]===0?{id:'revive:'+who,label:'Help '+o.actor+' back to their feet',actor:'Party',hint:'Recover 4 HP'}:o;});}
function automatic(s){
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
  const list=options(s),id=choice??automatic(s);if(!list.some(o=>o.id===id))throw new Error('That action is no longer available');
  s.turn++;s.turnsHere++;s.frame=frame===null?'browser:'+s.turn:String(frame).slice(0,80);s.roll='';
  const map=dungeon(s.seed,s.floor),kind=map.kinds[s.pos],done=bit(s.cleared,s.pos);
  if(id.startsWith('revive:')){
    const who=Number(id.split(':')[1]);s.hp[who]=4;note(s,'The company helped '+HEROES[who].name+' back to their feet. Nobody gets left behind.');
  }else if(id.startsWith('move:')){
    const next=Number(id.split(':')[1]),known=bit(s.visited,next);s.pos=next;s.visited|=1<<next;s.turnsHere=0;s.enemy=bit(s.cleared,next)?0:([1,6].includes(map.kinds[next])?threat(s,map):0);
    note(s,known?'The company retraced its steps to '+map.names[next]+'.':pick(s,['Fern lifted the lantern.','Brann pushed the door open.','Pip found a narrow way through.','Mira followed a thread of light.'])+' '+map.names[next]+' lay beyond.');
  }else if(id==='descend'){
    s.floor++;s.pos=0;s.visited=1;s.cleared=1;s.enemy=0;s.turnsHere=0;s.supplies=Math.min(9,s.supplies+2);heal(s,6);
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
    s.hp=s.hp.map((_,i)=>Math.ceil(maxHP(s,i)*0.65));s.gold=Math.floor(s.gold/2);s.pos=0;s.enemy=0;s.turnsHere=0;
    note(s,'The lantern flared and carried everyone to the entrance. Half their gold was lost; their journey continues.');
  }
  return s;
}
function view(s){
  const map=dungeon(s.seed,s.floor),kind=map.kinds[s.pos],done=bit(s.cleared,s.pos),auto=automatic(s);
  let text,title=map.names[s.pos];
  if(s.pos===0){title=map.theme[0];text='Beyond the lantern, '+map.theme[1]+'. Somewhere below waits '+map.theme[2]+'. The company chooses a path.';}
  else if(kind===1||kind===6){const foe=kind===6?map.theme[3]:FOES[hash(s.seed+':foe:'+s.floor+':'+s.pos)%FOES.length];title=done?'A light in the dark':foe;text=done?(kind===6?'The keeper falls silent. An ember of the stolen sun floats above the stairs. A deeper floor waits.':'The foe is gone. The lantern reveals another path through the quiet chamber.'):(kind===6?'The keeper guards an ember of the stolen sun. An old oath binds it to this room.':'A '+foe.toLowerCase()+' steps into the lantern light. The company closes ranks.')+' '+(s.enemy||threat(s,map))+' HP remaining.';}
  else if(kind===2)text=done?'The trap is spent. Beyond it, the corridor bends into darkness.':'A wire glints at ankle height. Inside the walls, something begins to tick. The company pauses at the threshold.';
  else if(kind===3)text=done?'The old inscription has given up its secrets. The party carries its story onward.':'A sun is carved into the stone. Beneath it, an inscription remembers '+map.theme[4]+'.';
  else if(kind===4)text=done?'The chest is empty. Its treasures are safely stowed; the lantern points onward.':'A sealed coffer rests beneath a weathered statue. A tiny light leaks through the keyhole. Nothing else in the room moves.';
  else text=done?'The shrine fades to a gentle glow. Rested or wiser, the company prepares to leave.':'Warm light gathers around a forgotten shrine. For the first time in hours, this place feels safe.';
  const visible=map.links.reduce((mask,neighbors,i)=>bit(s.visited,i)?neighbors.reduce((m,n)=>m|(1<<n),mask):mask,s.visited);
  // Compact tuple cells: [status (0 fog, 1 frontier, 2 visited, 3 current), glyph, exits N/E/S/W bit mask].
  const cells=map.links.map((ns,i)=>[i===s.pos?3:bit(s.visited,i)?2:bit(visible,i)?1:0,i===s.pos?'◆':bit(s.visited,i)?(bit(s.cleared,i)&&i!==map.gate?'·':GLYPHS[map.kinds[i]]):'?',ns.reduce((m,n)=>m|(n===i-6?1:n===i+1?2:n===i+6?4:8),0)]);
  return {turn:s.turn,floor:s.floor,seed:s.seed,theme:map.theme[0],title,text,kind:KINDS[kind],safe:done,cells,room:s.pos+1,explored:Array.from({length:24},(_,i)=>bit(s.visited,i)).filter(Boolean).length,
    party:s.hp.map((hp,i)=>({name:HEROES[i].name,role:HEROES[i].role,hp,max:maxHP(s,i)})),gold:s.gold,supplies:s.supplies,relics:s.relics,
    summary:s.relics?'The company has recovered '+s.relics+' ember fragment'+(s.relics===1?'':'s')+' of the stolen sun. The next keeper waits below.':'Four heroes seek the fragments of the stolen sun. Their lantern is the last light in the underworld.',
    log:s.log.slice(-3),last:s.last,roll:s.roll||'The lantern remembers. The journey continues.',choices:options(s).map(o=>({...o,auto:o.id===auto})),autoLabel:options(s).find(o=>o.id===auto)?.label||'Continue'};
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function run(input) {
  input=input||{};
  const fields=input.trmnl?.plugin_settings?.custom_fields_values||{};
  const seed=seedText(fields.campaign_seed??input.seed??'lantern');
  const style=['balanced','bold','careful'].includes(fields.party_style)?fields.party_style:'balanced';
  const prior=input.trmnl?.state;
  let state=validCampaign(prior)&&prior.seed===seed?JSON.parse(JSON.stringify(prior)):newCampaign(seed,style);
  state.style=style;
  // A failed/empty poll must never erase a campaign or fabricate another turn.
  if(typeof input.frame!=='string'||!/^minute:\d{1,14}$/.test(input.frame))return {...view(state),status:'Waiting for a fresh frame'};
  state=advance(state,null,input.frame);
  return {...view(state),status:'Autopilot',trmnl_state:state};
}
