import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Liquid} from '../apps/sounds-like-my-company/node_modules/liquidjs/dist/liquid.node.mjs';
import {Window} from '../apps/sounds-like-my-company/node_modules/happy-dom/lib/index.js';
const layouts=['full','half_horizontal','half_vertical','quadrant'];
async function renderer(app){
 const raw=await readFile(`apps/${app}/trmnl/shared.liquid`,'utf8');
 const templates=new Map([...raw.matchAll(/{% template (\w+) %}([\s\S]*?){% endtemplate %}/g)].map(m=>[m[1],m[2]]));
 const common=raw.replace(/{% template \w+ %}[\s\S]*?{% endtemplate %}/g,'');
 const engine=new Liquid({relativeReference:false,fs:{exists:async p=>templates.has(p),existsSync:p=>templates.has(p),readFile:async p=>templates.get(p),readFileSync:p=>templates.get(p),resolve:(root,file)=>file,dirname:()=>'.'}});
 return async(layout,context)=>engine.parseAndRender(common+await readFile(`apps/${app}/trmnl/${layout}.liquid`,'utf8'),context);
}
const hostile='<img src=x onerror=alert(1)>';
const stories=Array.from({length:20},(_,i)=>({title:`Story ${i} ${hostile}`,snippet:'Real source excerpt',source:'Source',published_at:'2026-10-27',change:'NEW'}));
const matches=Array.from({length:8},(_,i)=>({title:`Launch ${i} ${hostile}`,source:'Launch HN',reason:'Shared product wording: agents',published_at:'2026-10-27'}));
for(const [app,rows,context]of [
 ['what-changed',20,{stories,headline_count:20,briefing_label:'First briefing',topic_label:'Public news'}],
 ['sounds-like-my-company',8,{matches,result_count:8,name:'Echo',window_days:90,links_code:'ECHO',links_qr_url:'https://sounds-like-my-company.vercel.app/api/qr?code=ECHO'}],
 ['game-night-radar',8,{items:matches.map(x=>({...x,game:'Game',kind:'Update'})),games:[[1,'Game']],days:30}],
 ['local-morning-brief',6,{city:'San Francisco',items:stories.slice(0,6).map(x=>[x.title,'Agency','Oct 27','Published']),forecast:null,transit_status:'unavailable',alert_status:'unavailable',sources:{}}]
])test(`${app}: every size offers all available rows to native fitting, escapes source text and retains one title bar`,async()=>{
 const render=await renderer(app);
 for(const layout of layouts){
  const html=await render(layout,{...context,checked_at:'2026-10-27T12:00:00Z',fetched_at:'2026-10-27T12:00:00Z'}),w=new Window();
  w.document.body.innerHTML=html;
  assert.equal(w.document.querySelectorAll('.item').length,rows,`${layout} must not discard rows before screen fitting`);
  assert.ok(w.document.querySelector('.columns[data-overflow-counter="true"] > .column'));
  assert.equal(w.document.querySelectorAll('.layout').length,1);
  assert.equal(w.document.querySelectorAll('.title_bar').length,1);
  assert.equal(w.document.querySelectorAll('img[src="x"]').length,0);
  assert.ok(w.document.body.textContent.includes(hostile));
  assert.doesNotMatch(html,/<style|font-family:|opacity:/);
  if(app==='sounds-like-my-company'){
   const qr=w.document.querySelector('img');assert.ok(qr);assert.ok(!qr.classList.contains('image-dither'));assert.ok(qr.classList.contains('w--[82px]'));
  }
  await w.happyDOM.abort();
 }
});
test('Daily headline cap and change/source metadata survive all layouts for 1, 3, 8 and 20 selected stories',async()=>{
 const render=await renderer('what-changed');
 for(const count of [1,3,8,20])for(const layout of layouts){
  const html=await render(layout,{stories,headline_count:count}),w=new Window();w.document.body.innerHTML=html;
  assert.equal(w.document.querySelectorAll('.item').length,count);
  assert.equal(w.document.querySelectorAll('.description').length,count<=8?count:0);
  assert.ok(w.document.body.textContent.includes('NEW'));assert.ok(w.document.body.textContent.includes('Source'));
  await w.happyDOM.abort();
 }
});
test('Shared source, unavailable, cached, and no-match states remain explicit',async()=>{
 const render=await renderer('what-changed');
 for(const layout of layouts){
  assert.match(await render(layout,{stories:[],no_matches:true}),/No matching stories/);
  assert.match(await render(layout,{stories:[],no_matches:false}),/Briefing temporarily unavailable/);
  assert.match(await render(layout,{stories,stale:true,unavailable_sources:['a']}),/CACHED.*PARTIAL/);
 }
 const local=await renderer('local-morning-brief');assert.match(await local('quadrant',{items:[],transit_status:'unavailable',alert_status:'unavailable'}),/NWS alert check unavailable/);
});
