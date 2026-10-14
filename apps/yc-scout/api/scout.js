import {options,createService} from '../lib/scout.js';
const service=createService();
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Use GET.'});}
 let config;try{config=options(new URL(req.url,'https://yc-launch-scout.vercel.app').searchParams);}catch(e){return res.status(400).json({error:e.message});}
 try{const body=await service(config);res.setHeader('Cache-Control',body.stale?'public, s-maxage=60':'public, s-maxage=900, stale-while-revalidate=900');return res.status(200).json(body);}
 catch{res.setHeader('Cache-Control','no-store');return res.status(503).json({error:'Launch sources are temporarily unavailable. Please try again later.'});}
}
