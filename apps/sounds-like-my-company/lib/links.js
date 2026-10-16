import {createHash} from 'node:crypto';
import {get,put} from '@vercel/blob';
import {options} from './matches.js';
export const ORIGIN='https://sounds-like-my-company.vercel.app';
const ALPHABET='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export function normalizeCode(value){const code=String(value||'').replace(/[-\s]/g,'').toUpperCase();if(!/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{12}$/.test(code))throw new RangeError('Enter the 12-character code shown on your TRMNL.');return code;}
export function displayCode(code){return normalizeCode(code).match(/.{4}/g).join('-');}
export function canonical(config){return options(new URLSearchParams(config));}
export function codeFor(config){let n=BigInt('0x'+createHash('sha256').update('sounds-company-links-v1\n'+JSON.stringify(canonical(config))).digest('hex').slice(0,15));let code='';for(let i=0;i<12;i++){code=ALPHABET[Number(n&31n)]+code;n>>=5n;}return code;}
export function linkInfo(code){code=normalizeCode(code);return {links_code:displayCode(code),links_url:ORIGIN+'/r/'+code,links_qr_url:ORIGIN+'/api/qr?code='+code,links_status:'ready'};}
export function blobStore(){return {
 async read(code){const result=await get('profiles/'+normalizeCode(code)+'.json',{access:'private',useCache:false,abortSignal:AbortSignal.timeout(2000)});if(!result)return null;if(result.statusCode!==200||result.blob.size>8192)throw Error('Profile unavailable.');const text=await new Response(result.stream).text();if(Buffer.byteLength(text)>8192)throw Error('Profile exceeds limit.');return JSON.parse(text);},
 async create(code,record){await put('profiles/'+normalizeCode(code)+'.json',JSON.stringify(record),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',cacheControlMaxAge:60,abortSignal:AbortSignal.timeout(2000)});return true;}
};}
export function createLinkService({store=blobStore(),clock=Date.now}={}){
 const cache=new Map(),pending=new Map();
 function remember(code,config){cache.delete(code);cache.set(code,{config,at:clock()});while(cache.size>128)cache.delete(cache.keys().next().value);return config;}
 async function read(code){code=normalizeCode(code);const hit=cache.get(code);if(hit&&clock()-hit.at<3600000)return hit.config;const record=await store.read(code);if(!record)return null;if(record.version!==1)throw Error('Profile version unavailable.');const config=canonical(record.config);if(codeFor(config)!==code)throw Error('Profile integrity check failed.');return remember(code,config);}
 async function save(config){config=canonical(config);const code=codeFor(config);if(!pending.has(code)){if(pending.size>=8)throw Error('Profile service busy.');pending.set(code,(async()=>{const existing=await read(code);if(existing){if(JSON.stringify(existing)!==JSON.stringify(config))throw Error('Code conflict.');return linkInfo(code);}let created;try{created=await store.create(code,{version:1,created_at:new Date(clock()).toISOString(),config});}catch(error){cache.delete(code);const winner=await read(code);if(winner&&JSON.stringify(winner)===JSON.stringify(config))return linkInfo(code);throw error;}if(!created){cache.delete(code);const winner=await read(code);if(!winner||JSON.stringify(winner)!==JSON.stringify(config))throw Error('Code conflict.');}else remember(code,config);return linkInfo(code);})().finally(()=>pending.delete(code)));}return pending.get(code);}
 return {read,save};
}
export const links=createLinkService();
