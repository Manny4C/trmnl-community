import {createService} from '../lib/matches.js';
import {links,canonical,linkInfo} from '../lib/links.js';
export function linksHandler({profiles=links,service=createService()}={}){return async(req,res)=>{
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Use GET or POST.'});}
 if(req.method==='GET'){
  let code;try{code=linkInfo(new URL(req.url,'https://sounds-like-my-company.vercel.app').searchParams.get('code')).links_code;}catch(e){return res.status(400).json({error:e.message});}
  try{const config=await profiles.read(code);if(!config)return res.status(404).json({error:'Code not found. Check the code on your screen or create your page below.'});const info=code.replace(/-/g,'').length===4?linkInfo(code):await profiles.save(config);const data=await service(config);return res.status(200).json({config,...data,...info});}catch{return res.status(503).json({error:'Your saved page is temporarily unavailable. Your code has not changed. Try again shortly.'});}
 }
 let config;try{if(typeof req.body!=='object'||req.body===null||Array.isArray(req.body)||Buffer.byteLength(JSON.stringify(req.body))>4000)throw Error('Send your public company settings.');config=canonical(req.body);}catch(e){return res.status(400).json({error:e.message});}
 try{return res.status(200).json(await profiles.save(config));}catch{return res.status(503).json({error:'Could not save your links page. Please try again shortly.'});}
};}
export default linksHandler();
