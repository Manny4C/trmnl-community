import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validBriefing, savedBriefing, saveBriefing, selectEdition, MAX_SAVED_AGE} from '../public/briefing-state.js';
const stories=Array.from({length:8},(_,i)=>({id:'id'+i,fingerprint:'v1',title:'Story '+i,snippet:'Excerpt',source:'Test',url:'https://example.com/'+i,published_at:new Date().toISOString()}));
const data=()=>({topic:'technology',fetched_at:new Date().toISOString(),stories,stale:false});
test('Saved fallback preserves timestamp, expires, and cannot cross topics',()=>{
  const values=new Map(), storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
  const initial=data();saveBriefing(storage,initial);
  const fallback=savedBriefing(storage,'technology');
  assert.equal(fallback.stale,true);assert.equal(fallback.fetched_at,initial.fetched_at);
  assert.equal(savedBriefing(storage,'science'),null);
  assert.equal(savedBriefing(storage,'technology',Date.now()+MAX_SAVED_AGE+1000),null);
  saveBriefing(storage,{...initial,stale:true,stories:[]});
  assert.equal(savedBriefing(storage,'technology').stories.length,8);
});
test('Malformed and mismatched responses are rejected',()=>{
  assert.equal(validBriefing(data(),'science'),false);
  assert.equal(validBriefing({...data(),stories:[{title:'Missing fields'}]},'technology'),false);
  assert.equal(validBriefing({...data(),fetched_at:'bad'},'technology'),false);
  assert.equal(savedBriefing({getItem:()=>'{bad'},'technology'),null);
});
test('Change counts describe displayed stories and previously unseen items rotate next',()=>{
  const first=selectEdition(stories,{},5);assert.equal(first.first,true);assert.equal(first.changedCount,0);
  const history=Object.fromEntries(first.selected.map(s=>[s.id,s.fingerprint]));
  const next=selectEdition(stories,history,5);assert.equal(next.changedCount,3);assert.equal(next.selected[0].id,'id5');
  const updated=selectEdition([{...stories[0],fingerprint:'v2'}],history);assert.equal(updated.selected[0].status,'UPDATED');
});
