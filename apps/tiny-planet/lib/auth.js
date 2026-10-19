import {randomBytes,createHash,createHmac,createCipheriv,createDecipheriv,timingSafeEqual} from 'node:crypto';
import {db} from './db.js';import {error} from './http.js';import {ORIGIN} from './game.js';
export const hash=s=>createHash('sha256').update(s).digest('hex');
const key=()=>{const value=process.env.TINY_PLANET_SESSION_SECRET;if(!value||value.length<40)throw error('Sign-in is awaiting secure configuration.',503);return createHash('sha256').update(value).digest();};
export const random=()=>randomBytes(32).toString('base64url');
export function seal(obj){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv);const data=Buffer.concat([cipher.update(JSON.stringify(obj)),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64url');}
export function open(value){try{const b=Buffer.from(value,'base64url'),c=createDecipheriv('aes-256-gcm',key(),b.subarray(0,12));c.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([c.update(b.subarray(28)),c.final()]).toString());}catch{throw error('Sign in again to continue.',401);}}
export function cookie(req,name='tp_session'){return String(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1)||'';}
export function setCookie(res,name,value,age){res.setHeader('Set-Cookie',`${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`);}
export function equal(a,b){return typeof a==='string'&&typeof b==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));}
export const csrf=raw=>createHmac('sha256',key()).update('csrf:'+raw).digest('base64url');
export async function trmnlIdentity(token,fetcher=fetch){
 const request=async path=>{const r=await fetcher('https://trmnl.com/api/'+path,{headers:{Authorization:'Bearer '+token,Accept:'application/json'},signal:AbortSignal.timeout(10000),redirect:'error'});if(!r.ok)throw error(r.status===401||r.status===403?'TRMNL access expired or was revoked. Connect again.':'TRMNL verification is unavailable. No move was made.',r.status===401||r.status===403?401:503);return r.json();};
 const me=await request('me'),devices=await request('devices');const id=me.data?.id;
 if(!['string','number'].includes(typeof id)||!String(id).match(/^[\w-]{1,100}$/))throw error('TRMNL account verification did not return a valid identity.',403);
 if(!Array.isArray(devices.data)||!devices.data.some(d=>d&&Number.isSafeInteger(d.id)&&d.id>0))throw error('A connected TRMNL device is required to move.',403);
 return hash('trmnl-user:'+id);
}
export async function session(req,sql=db()){const raw=cookie(req);if(!/^[\w-]{40,60}$/.test(raw))throw error('Connect your TRMNL account to move.',401);const [s]=await sql`SELECT actor,token,expires_at FROM tp_sessions WHERE id=${hash(raw)} AND expires_at>now()`;if(!s)throw error('Your sign-in expired. Connect with TRMNL again.',401);return {...s,raw,access:open(s.token).access};}
export function requireCsrf(req,s){if(!equal(req.headers['x-csrf-token'],csrf(s.raw)))throw error('Refresh this page before making a move.',403);}
export function authorization(clientId){const state=random(),verifier=random(),url=new URL('https://trmnl.com/oidc/authorize');url.search=new URLSearchParams({client_id:clientId,response_type:'code',redirect_uri:ORIGIN+'/api/auth?step=callback',scope:'read profile',state,code_challenge:Buffer.from(hash(verifier),'hex').toString('base64url'),code_challenge_method:'S256'});return {url:String(url),handshake:{state,verifier,exp:Date.now()+600000}};}
