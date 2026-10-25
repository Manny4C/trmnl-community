import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Liquid} from 'liquidjs';
import {Window} from 'happy-dom';
import {newCampaign,advance,view} from '../public/game.js';
import {renderScreen} from '../public/render.js';
const root=new URL('../',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
test('browser renderer contains equal map/story and scene/choices areas, with one automatic action',()=>{
 const w=new Window();w.document.body.innerHTML=renderScreen(view(advance(newCampaign())));
 assert.equal(w.document.querySelectorAll('.q-body>section').length,2);assert.equal(w.document.querySelectorAll('.q-waypoint').length,view(advance(newCampaign())).map_points.length);assert.equal(w.document.querySelectorAll('.q-hero').length,4);assert.equal(w.document.querySelectorAll('.q-auto').length,1);assert.ok(w.document.querySelector('.q-art img[src="/art/shrine-v2.webp"]'));w.happyDOM.abort();
});
test('story and choice text are escaped before rendering',()=>{
 const w=new Window(),v=view(newCampaign());v.title='<img src=x onerror=bad()>';v.log=['<script>bad()</script>'];v.recap=v.log;v.choices[0].label='<img src=x>';
 w.document.body.innerHTML=renderScreen(v);assert.equal(w.document.querySelectorAll('script,img[src="x"]').length,0);assert.match(w.document.body.textContent,/<img/);w.happyDOM.abort();
});
test('all four Liquid layouts render current state and explicit monochrome accent fallbacks',async()=>{
 const raw=await read('trmnl/shared.liquid'),templates=new Map([...raw.matchAll(/{% template (\w+) %}([\s\S]*?){% endtemplate %}/g)].map(m=>[m[1],m[2]]));
 const common=raw.replace(/{% template \w+ %}[\s\S]*?{% endtemplate %}/g,'');
 const engine=new Liquid({relativeReference:false,fs:{exists:async p=>templates.has(p),existsSync:p=>templates.has(p),readFile:async p=>templates.get(p),readFileSync:p=>templates.get(p),resolve:(r,f)=>f,dirname:()=>'.'}});
 let s=newCampaign();for(let i=0;i<6;i++)s=advance(s);
 for(const layout of ['full','half_horizontal','half_vertical','quadrant']){
  const html=await engine.parseAndRender(common+await read('trmnl/'+layout+'.liquid'),{...view(s),status:'Autopilot'}),w=new Window();w.document.body.innerHTML=html;
  assert.equal(w.document.querySelectorAll('.q-waypoint').length,view(s).map_points.length);assert.equal(w.document.querySelectorAll('.q-hero').length,4);assert.equal(w.document.querySelectorAll('.q-auto').length,1);assert.equal(w.document.querySelectorAll('.q-art img.image-dither').length,1);assert.ok(w.document.body.textContent.includes(view(s).title));assert.ok(w.document.body.textContent.includes(view(s).recap.at(-1)));
  for(const el of w.document.querySelectorAll('.text--red,.bg--yellow'))for(const depth of ['1bit','2bit','4bit'])assert.ok(el.classList.contains(depth+':text--black')||el.classList.contains(depth+':bg--white'));
  w.happyDOM.abort();
 }
 assert.match(common,/screen--1bit/);assert.match(common,/screen--color|screen--4bit/);
});
