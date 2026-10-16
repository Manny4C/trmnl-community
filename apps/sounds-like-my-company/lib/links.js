import {createHash} from 'node:crypto';
import {get,put} from '@vercel/blob';
import {options} from './matches.js';
export const ORIGIN='https://sounds-like-my-company.vercel.app';
const ALPHABET='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export function normalizeCode(value){
 const code=String(value||'').replace(/[-\s]/g,'').toUpperCase();
 // Older shared URLs remain valid, but new pages always receive four characters.
 if(!/^[A-Z2-9]{4}$/.test(code)&&!/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{12}$/.test(code))throw new RangeError('Enter the four-character code shown on your TRMNL.');
 return code;
}
export function displayCode(code){code=normalizeCode(code);return code.length===4?code:code.match(/.{4}/g).join('-');}
export function canonical(config){return options(new URLSearchParams(config));}
export function codeFor(config){let n=BigInt('0x'+createHash('sha256').update('sounds-company-links-v1\n'+JSON.stringify(canonical(config))).digest('hex').slice(0,15));let code='';for(let i=0;i<12;i++){code=ALPHABET[Number(n&31n)]+code;n>>=5n;}return code;}
export function shortCodeFor(config,attempt=0){
 config=canonical(config);
 const name=config.name.toUpperCase().replace(/[^A-Z2-9]/g,'');
 if(attempt===0&&name.length>=4)return name.slice(0,4);
 const hash=createHash('sha256').update('sounds-company-short-v1\n'+codeFor(config)+'\n'+attempt).digest();
 return [...hash.subarray(0,4)].map(b=>ALPHABET[b&31]).join('');
}
export function linkInfo(code){code=normalizeCode(code);return {links_code:displayCode(code),links_url:ORIGIN+'/r/'+code,links_qr_url:ORIGIN+'/api/qr?code='+code,links_status:'ready'};}
function pathname(code){code=normalizeCode(code);return (code.length===4?'aliases/':'profiles/')+code+'.json';}
export function blobStore(){return {
 async read(code){const result=await get(pathname(code),{access:'private',useCache:false,abortSignal:AbortSignal.timeout(2000)});if(!result)return null;if(result.statusCode!==200||result.blob.size>8192)throw Error('Profile unavailable.');const text=await new Response(result.stream).text();if(Buffer.byteLength(text)>8192)throw Error('Profile exceeds limit.');return JSON.parse(text);},
 async create(code,record){await put(pathname(code),JSON.stringify(record),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',cacheControlMaxAge:60,abortSignal:AbortSignal.timeout(2000)});return true;}
};}
export function createLinkService({store=blobStore(),clock=Date.now}={}){
 const cache=new Map(),pending=new Map(),saved=new Map();
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function remember(code,config){cache.delete(code);cache.set(code,{config,at:clock()});while(cache.size>128)cache.delete(cache.keys().next().value);return config;}
 async function read(code){
  code=normalizeCode(code);const hit=cache.get(code);if(hit&&clock()-hit.at<3600000)return hit.config;
  const record=await store.read(code);if(!record)return null;const config=canonical(record.config);
  if(code.length===12){if(record.version!==1||codeFor(config)!==code)throw Error('Profile integrity check failed.');}
  else if(record.version!==2||record.profile_id!==codeFor(config)||!Number.isInteger(record.attempt)||record.attempt<0||record.attempt>=16||shortCodeFor(config,record.attempt)!==code)throw Error('Short-code integrity check failed.');
  return remember(code,config);
 }
 async function claim(code,record,config){
  try{if(await store.create(code,record)){remember(code,config);return config;}}
  catch(error){cache.delete(code);const winner=await read(code);if(winner)return winner;throw error;}
  cache.delete(code);const winner=await read(code);if(!winner)throw Error('Code registration did not persist.');return winner;
 }
 async function allocate(config,id){
  const existing=await read(id);
  if(existing&&!equal(existing,config))throw Error('Profile conflict.');
  if(!existing){const winner=await claim(id,{version:1,created_at:new Date(clock()).toISOString(),config},config);if(!equal(winner,config))throw Error('Profile conflict.');}
  for(let attempt=0;attempt<16;attempt++){
   const code=shortCodeFor(config,attempt);let assigned=await read(code);
   if(!assigned)assigned=await claim(code,{version:2,profile_id:id,attempt,created_at:new Date(clock()).toISOString(),config},config);
   if(equal(assigned,config)){const info=linkInfo(code);saved.delete(id);saved.set(id,{info,at:clock()});while(saved.size>128)saved.delete(saved.keys().next().value);return info;}
   // A different profile owns this code. Never overwrite or reassign it.
  }
  throw Error('Could not allocate a free four-character code.');
 }
 async function save(config){config=canonical(config);const id=codeFor(config),hit=saved.get(id);if(hit&&clock()-hit.at<3600000)return hit.info;if(!pending.has(id)){if(pending.size>=8)throw Error('Profile service busy.');pending.set(id,allocate(config,id).finally(()=>pending.delete(id)));}return pending.get(id);}
 return {read,save};
}
export const links=createLinkService();
