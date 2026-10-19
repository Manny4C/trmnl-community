import {db} from '../lib/db.js';import {authorization,seal,open,cookie,setCookie,equal,random,hash,trmnlIdentity,session,requireCsrf} from '../lib/auth.js';import {headers,sameOrigin,error,fail} from '../lib/http.js';import {ORIGIN} from '../lib/game.js';
export function authHandler({database=db,verify=trmnlIdentity,fetcher=fetch,client=()=>process.env.TINY_PLANET_TRMNL_CLIENT_ID,configured=()=>!!process.env.DATABASE_URL}={}){return async function handler(req,res){headers(res);const url=new URL(req.url,ORIGIN),step=url.searchParams.get('step');try{
 if(step==='logout'){if(req.method!=='POST')throw error('Use POST.',405);sameOrigin(req);const sql=database(),s=await session(req,sql);requireCsrf(req,s);await sql`DELETE FROM tp_sessions WHERE id=${hash(s.raw)}`;setCookie(res,'tp_session','',0);return res.status(200).json({connected:false});}
 if(req.method!=='GET')throw error('Use GET.',405);
 const clientId=client();if(!clientId||!configured())throw error('TRMNL sign-in is awaiting app registration and database activation. You can view the preview without connecting.',503);
 if(step!=='callback'){const a=authorization(clientId);setCookie(res,'tp_auth',seal(a.handshake),600);res.setHeader('Location',a.url);return res.status(302).end();}
 const h=open(cookie(req,'tp_auth')),state=url.searchParams.get('state'),code=url.searchParams.get('code');if(h.exp<Date.now()||!equal(h.state,state)||!code||code.length>2048)throw error('The sign-in link expired or did not match. Start again.',400);
 const sql=database(),used=await sql`INSERT INTO tp_oauth_nonces(id,expires_at) VALUES(${hash(state)},now()+interval '10 minutes') ON CONFLICT DO NOTHING RETURNING id`;if(!used.length)throw error('That sign-in was already used. Start again.',400);
 const params=new URLSearchParams({grant_type:'authorization_code',code,redirect_uri:ORIGIN+'/api/auth?step=callback',client_id:clientId,code_verifier:h.verifier});if(process.env.TINY_PLANET_TRMNL_CLIENT_SECRET)params.set('client_secret',process.env.TINY_PLANET_TRMNL_CLIENT_SECRET);
 const r=await fetcher('https://trmnl.com/oidc/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:params,signal:AbortSignal.timeout(10000),redirect:'error'});if(!r.ok)throw error('TRMNL could not complete sign-in. Please start again.',401);const token=await r.json();if(typeof token.access_token!=='string'||!Number.isFinite(token.expires_in)||token.expires_in<60)throw error('TRMNL returned an unusable sign-in.',401);
 const actor=await verify(token.access_token),raw=random(),age=Math.min(7200,Math.floor(token.expires_in)-30),expiry=new Date(Date.now()+age*1000).toISOString();
 await sql`INSERT INTO tp_sessions(id,actor,token,expires_at) VALUES(${hash(raw)},${actor},${seal({access:token.access_token})},${expiry})`;
 await sql`DELETE FROM tp_sessions WHERE expires_at<now()`;await sql`DELETE FROM tp_oauth_nonces WHERE expires_at<now()`;
 setCookie(res,'tp_session',raw,age);res.setHeader('Location',ORIGIN+'/?connected=1#play');return res.status(302).end();
 }catch(e){setCookie(res,'tp_auth','',0);return fail(res,e);}};}
export default authHandler();
