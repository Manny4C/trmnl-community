import test from 'node:test';
import assert from 'node:assert/strict';
import {island,practiceMove} from '../public/game.js';
import {planetSVG,evolution} from '../public/planet.js';
import {planetHandler} from '../api/planet.js';
const response=()=>({headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(b){this.body=b;},end(b){this.body=b;}});
test('the 3D world changes when real game tiles grow and orbiting never mutates game state',()=>{
 const s=island(),before=JSON.stringify(s),seed=planetSVG(s),grown=practiceMove(s,'water',3,1);
 assert.notEqual(planetSVG(grown),seed);assert.equal(evolution(grown).groves,3);
 for(const angle of [0,.5,2,Math.PI,5])for(const bw of [false,true]){const svg=planetSVG(s,{angle,bw,interactive:true});assert.ok(!/NaN|Infinity|undefined/.test(svg));assert.match(svg,/<polygon/);}
 assert.equal(JSON.stringify(s),before);
});
test('evolution follows the forest and beacon mission through a new chapter',()=>{
 const s=island();s.tiles=['~~~~~~~~','~BTTTTT~','~TTT#..~','~...#..~','~......~','~~~~~~~~'];
 assert.equal(evolution(s).percent,100);assert.equal(evolution(s).stage,'Ready for the horizon');
 const next=practiceMove(s,'sail',1,1);assert.equal(next.chapter,2);assert.ok(evolution(next).percent<100);assert.notEqual(planetSVG(s),planetSVG(next));
});
test('device image endpoint returns a real PNG in both inks and fails honestly on a world outage',async()=>{
 const s=island(),handler=planetHandler({readWorld:async()=>s});
 const color=response();await handler({method:'GET',url:'/api/planet?v=1'},color);
 assert.equal(color.statusCode,200);assert.equal(color.headers['Content-Type'],'image/png');assert.deepEqual([...color.body.slice(0,8)],[137,80,78,71,13,10,26,10]);
 const bw=response();await handler({method:'GET',url:'/api/planet?ink=bw'},bw);assert.notDeepEqual(color.body,bw.body);
 const fail=response();await planetHandler({readWorld:async()=>{throw Error('offline');}})({method:'GET',url:'/api/planet'},fail);assert.equal(fail.statusCode,503);assert.equal(fail.headers['Cache-Control'],'no-store');
 const post=response();await handler({method:'POST',url:'/api/planet'},post);assert.equal(post.statusCode,405);
});
