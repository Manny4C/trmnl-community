import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {validateStoryPack} from '../public/campaign.js';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const catalog=await read('public/content/catalog.json'),canon=await read('campaign/canon.json'),errors=[];
const refs=new Set([...canon.regions,...canon.people,...canon.factions].map(x=>x.id)),facts=new Set(canon.earned_fact_ids),releaseIds=new Set();
function reachable(p){
  const states=new Map(),edges=new Map(),queue=[{flags:[],facts:[]}],key=s=>JSON.stringify([s.flags.slice().sort(),s.facts.slice().sort()]);
  const allowed=(s,c)=>c.requires.every(x=>s.flags.includes(x))&&c.forbids.every(x=>!s.flags.includes(x))&&(c.requiresFacts||[]).every(x=>s.facts.includes(x))&&(c.forbidsFacts||[]).every(x=>!s.facts.includes(x));
  const done=s=>p.arcs.every(a=>(!a.required&&!s.flags.includes(a.starts))||s.flags.includes(a.completes));
  states.set(key(queue[0]),queue[0]);
  for(const s of queue){const id=key(s),next=new Set();edges.set(id,next);const requiredDone=p.arcs.filter(a=>a.required).every(a=>s.flags.includes(a.completes));
    for(const c of p.cards.filter(c=>c.arc&&allowed(s,c)&&!(c.startOptional&&requiredDone)))for(const o of c.options)for(const r of [o.success,o.setback]){
      const n={flags:[...new Set([...s.flags,...(r.set||[])])],facts:[...new Set([...s.facts,...(r.facts||[])])]},k=key(n);next.add(k);if(!states.has(k)){states.set(k,n);queue.push(n);}
    }
    if(states.size>10000)throw Error(p.id+': story graph too large for the simple campaign model');
  }
  const winning=new Set([...states].filter(([,s])=>done(s)).map(([k])=>k));let changed=true;while(changed){changed=false;for(const [id,next]of edges)if(!winning.has(id)&&[...next].some(x=>winning.has(x))){winning.add(id);changed=true;}}
  if(!winning.size)errors.push(p.id+': required ending is unreachable');
  if(winning.size!==states.size)errors.push(p.id+': a started/required story can deadlock');
  return states.size;
}
if(catalog.schema!==1||!Array.isArray(catalog.releases))throw Error('Invalid content catalog');
let total=0;for(const entry of catalog.releases){
  if(releaseIds.has(entry.id)||entry.file!=='packs/'+entry.id+'.json')errors.push('Invalid/duplicate catalog entry '+entry.id);releaseIds.add(entry.id);
  const raw=await readFile('public/content/'+entry.file),hash=createHash('sha256').update(raw).digest('hex'),p=JSON.parse(raw);
  if(hash!==entry.sha256||p.id!==entry.id)errors.push(entry.id+': catalog hash/identity mismatch');
  const schema=validateStoryPack(p);errors.push(...schema.map(e=>entry.id+': '+e));if(schema.length)continue;
  for(const c of p.cards){for(const id of [...c.refs,...c.regions])if(!refs.has(id))errors.push(c.id+': unknown canon '+id);for(const id of [...(c.requiresFacts||[]),...(c.forbidsFacts||[]),...c.options.flatMap(o=>[...(o.success.facts||[]),...(o.setback.facts||[])])])if(!facts.has(id))errors.push(c.id+': unknown earned fact '+id);}
  for(const [id,index]of Object.entries(p.factIndex))if(canon.earned_fact_ids[index]!==id)errors.push(p.id+': permanent fact index changed');
  const localFlags=new Set(p.cards.flatMap(c=>c.options.flatMap(o=>[...(o.success.set||[]),...(o.setback.set||[])])));if(localFlags.size>48)errors.push(p.id+': too many chapter flags');
  total+=reachable(p);console.log(p.id+': '+p.cards.length+' cards, '+Buffer.byteLength(JSON.stringify(p))+' runtime bytes, coherent arc graph');
}
if(!releaseIds.has(catalog.latest))errors.push('Latest release missing');
let priorCanon;try{priorCanon=JSON.parse(execFileSync('git',['show','HEAD:apps/one-more-room/campaign/canon.json'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));}catch{}
for(const [index,id]of (priorCanon?.earned_fact_ids||[]).entries())if(canon.earned_fact_ids[index]!==id)errors.push('Established permanent fact registry changed');
let previous;try{previous=JSON.parse(execFileSync('git',['show','HEAD:apps/one-more-room/public/content/catalog.json'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));}catch{}
for(const prior of previous?.releases||[]){const now=catalog.releases.find(r=>r.id===prior.id);if(!now||now.sha256!==prior.sha256||now.file!==prior.file)errors.push(prior.id+': an already committed release was changed or removed');}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Campaign validation passed; '+total+' reachable obligation states checked.');
