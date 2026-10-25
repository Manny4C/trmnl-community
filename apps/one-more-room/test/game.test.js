import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {newCampaign,advance,view,options,automatic,dungeon,validCampaign,seedText} from '../public/game.js';

test('a new seed creates a connected 24-room dungeon with a reachable keeper',()=>{
 for(let i=0;i<80;i++){const m=dungeon('map '+i,i+1),seen=new Set([0]),queue=[0];for(const p of queue)for(const n of m.links[p]){assert.ok(m.links[n].includes(p));assert.ok([1,6].includes(Math.abs(n-p)));if(!seen.has(n)){seen.add(n);queue.push(n);}}assert.equal(seen.size,24);assert.notEqual(m.gate,0);assert.equal(m.kinds[m.gate],6);}
});
test('seeds are normalized and deterministic; new seeds create different paths',()=>{
 assert.equal(seedText('<script>" A! '),'script A');assert.equal(seedText('★'),'lantern');assert.equal(seedText('z'.repeat(80)).length,32);
 assert.deepEqual(dungeon('moonwell',8),dungeon('moonwell',8));assert.notDeepEqual(dungeon('moonwell',8),dungeon('lantern',8));
 let a=newCampaign('moonwell'),b=newCampaign('moonwell');for(let i=0;i<150;i++){a=advance(a);b=advance(b);}assert.deepEqual(a,b);
});
test('every fresh frame resolves exactly one action; duplicates, older tokens and long absences do not create extra actions',()=>{
 const a=newCampaign();const b=advance(a,null,'minute:1000');assert.equal(a.turn,0);assert.equal(b.turn,1);
 assert.deepEqual(advance(b,null,'minute:1000'),b);assert.deepEqual(advance(b,null,'minute:999'),b);
 const c=advance(b,null,'minute:90000');assert.equal(c.turn,2);assert.notEqual(c.last,b.last);
});
test('manual choices are validated and produce different campaign consequences',()=>{
 let s=newCampaign('manual');for(let i=0;i<100&&options(s).length<2;i++)s=advance(s);
 const o=options(s);assert.ok(o.length>=2);assert.notDeepEqual(advance(s,o[0].id),advance(s,o[1].id));assert.throws(()=>advance(s,'move:999'),/no longer available/);
});
test('autopilot continues through floors and remains within health, resource and memory bounds',()=>{
 for(const style of ['balanced','bold','careful'])for(const seed of ['lantern','moonwell','fern','briar','starlight','a long winter']){
  let s=newCampaign(seed,style);for(let i=0;i<1200;i++){const before=s.turn;s=advance(s);assert.equal(s.turn,before+1);assert.ok(validCampaign(s),seed+' at '+i);assert.ok(options(s).some(o=>o.id===automatic(s)));assert.ok(s.log.length<=6);assert.equal(s.visited&(1<<s.pos),1<<s.pos);}
  assert.ok(s.floor>5,seed+' must progress, not stall');assert.equal(s.relics,s.floor-1);
 }
});
test('downed heroes must be helped up before they can act',()=>{
 let s=newCampaign('rescue');for(let i=0;i<1000;i++){s=advance(s);if(!s.enemy)continue;s.hp[0]=0;const o=options(s);assert.ok(!o.some(x=>x.id==='strike'));assert.ok(o.some(x=>x.id==='revive:0'));const rescued=advance(s,'revive:0');assert.equal(rescued.hp[0],4);assert.match(rescued.last,/Nobody gets left behind/);return;}assert.fail('no battle found');
});
test('a defeated company recovers without erasing the floor or abandoning the journey',()=>{
 let s=newCampaign('resilience');for(let i=0;i<500;i++){s=advance(s);if(!s.enemy)continue;s.hp=[1,0,0,0];s.rng=1;for(let j=0;j<20;j++){const next=advance(s);if(next.last.includes('lantern flared')){assert.equal(next.pos,0);assert.ok(next.hp.every(h=>h>0));assert.equal(next.floor,s.floor);assert.equal(next.gold,Math.floor(s.gold/2));assert.ok(validCampaign(next));return;}s.hp=[1,0,0,0];s=next;}}assert.fail('retreat not reached');
});
test('save/restore is complete, malformed saves are rejected',()=>{
 let s=newCampaign('save');for(let i=0;i<90;i++)s=advance(s);assert.deepEqual(advance(JSON.parse(JSON.stringify(s))),advance(s));
 for(const patch of [{hp:[-1,1,1,1]},{floor:0},{pos:24},{log:['x'.repeat(200)]},{rng:0},{roll:null},{visited:16777216},{style:'unknown'}])assert.equal(validCampaign({...s,...patch}),false);
});
const code=await readFile(new URL('../trmnl/transform.js',import.meta.url),'utf8');
const context=vm.createContext({});vm.runInContext(code,context);const run=input=>JSON.parse(JSON.stringify(context.run(input)));
test('Serverless state is per installation and a failed poll preserves the campaign',()=>{
 const one=run({frame:'minute:100'}),two=run({frame:'minute:101',trmnl:{state:one.trmnl_state}});
 assert.equal(one.turn,1);assert.equal(two.turn,2);assert.equal(run({frame:'minute:101',trmnl:{state:two.trmnl_state}}).turn,2);
 assert.equal(run({frame:'minute:100',trmnl:{state:two.trmnl_state}}).turn,2);
 const outage=run({trmnl:{state:two.trmnl_state}});assert.equal(outage.turn,2);assert.equal(outage.trmnl_state,undefined);assert.match(outage.status,/Waiting/);
 assert.equal(run({frame:'minute:102'}).turn,1);
});
test('changing instinct preserves progress; changing the seed starts a new expedition',()=>{
 let result=run({frame:'minute:1'});result=run({frame:'minute:2',trmnl:{state:result.trmnl_state,plugin_settings:{custom_fields_values:{party_style:'careful'}}}});assert.equal(result.turn,2);assert.equal(result.trmnl_state.style,'careful');
 const changed=run({frame:'minute:3',trmnl:{state:result.trmnl_state,plugin_settings:{custom_fields_values:{campaign_seed:'fresh'}}}});assert.equal(changed.turn,1);assert.equal(changed.seed,'fresh');
});
test('long-lived Serverless output fits both the standard data budget and Saved State budget',()=>{
 let max=0,maxState=0;for(const seed of ['lantern','the longest permitted seed abcdef','moonwell']){
  let state;for(let i=1;i<=700;i++){const out=run({frame:'minute:'+i,trmnl:{state,plugin_settings:{custom_fields_values:{campaign_seed:seed}}}});state=out.trmnl_state;const merged={...out};delete merged.trmnl_state;
   max=Math.max(max,Buffer.byteLength(JSON.stringify(merged)));maxState=Math.max(maxState,Buffer.byteLength(JSON.stringify(state)));
   assert.ok(Buffer.byteLength(JSON.stringify(merged))<4800);assert.ok(Buffer.byteLength(JSON.stringify(state))<7800);
  }
 }console.log('Maximum merge bytes: '+max+'; maximum saved-state bytes: '+maxState);
});
test('map visibility does not reveal unexplored room contents',()=>{
 const v=view(newCampaign());assert.equal(v.cells.filter(c=>c[0]===3).length,1);assert.ok(v.cells.some(c=>c[0]===0));for(const c of v.cells)if(c[0]<2)assert.equal(c[1],'?');
});
test('automatic atlas camera pulls back at milestones and focuses on dungeon encounters',()=>{
 let s=newCampaign('atlas');assert.equal(view(s).map_mode,'world');
 let encounter,keeper;for(let i=0;i<600;i++){s=advance(s);const v=view(s);assert.equal(v.map_points.filter(p=>p[2]===3).length,1);if(v.map_mode==='dungeon'&&!v.safe&&!encounter)encounter=JSON.parse(JSON.stringify(s));if(v.kind==='keeper'&&v.safe){keeper=s;break;}}
 assert.ok(encounter);assert.equal(view(encounter).map_mode,'dungeon');assert.equal(view(encounter,'world').map_mode,'world');assert.equal(view(newCampaign(),'dungeon').map_mode,'dungeon');
 assert.match(view(encounter).map_context,/encounter/);assert.ok(keeper);assert.equal(view(keeper).map_mode,'world');const next=advance(keeper,'descend');assert.equal(view(next).map_mode,'world');assert.equal(next.floor,keeper.floor+1);
 const saved=JSON.stringify(encounter);view(encounter,'world');view(encounter,'dungeon');assert.equal(JSON.stringify(encounter),saved,'changing camera never makes a move or mutates a save');
});
test('dungeon camera follows the party and reveals only visited landmarks',()=>{
 let s=newCampaign('camera'),boxes=new Set();for(let i=0;i<150;i++){s=advance(s);const v=view(s,'dungeon'),box=v.map_box.split(' ').map(Number);assert.ok(box.every(Number.isFinite));assert.ok(box[0]>=0&&box[1]>=0);assert.ok(box[0]+box[2]<=361&&box[1]+box[3]<=211);boxes.add(v.map_box);assert.equal(v.map_points[s.pos][2],3);for(const p of v.map_points)if(p[2]===0)assert.equal(p[3],'');assert.ok(v.recap.every(l=>l.length<=98));}assert.ok(boxes.size>4);
});
