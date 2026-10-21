import {options,createService} from '../lib/radar.js';
const service=createService();
export function handlerFor(load=service){return async(req,res)=>{
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Use GET.'});}
 let config;try{config=options(new URL(req.url,'https://game-night-radar.vercel.app').searchParams);}catch(e){return res.status(400).json({error:e.message});}
 try{const body=await load(config);res.setHeader('Cache-Control',body.stale||body.partial?'public, s-maxage=60, max-age=0':'public, s-maxage=600, max-age=0');return res.status(200).json(body);}catch{return res.status(503).json({error:'Steam announcements are unavailable. Please try again later.'});}
};}
export default handlerFor();
