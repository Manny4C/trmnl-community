import {options,createService,devicePayload} from '../lib/matches.js';
const service=createService();
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Use GET.'});}
 let config,format;try{const p=new URL(req.url,'https://sounds-like-my-company.vercel.app').searchParams;config=options(p);format=p.get('format');}catch(e){return res.status(400).json({error:e.message});}
 try{const data=await service(config);return res.status(200).json(format==='trmnl'?devicePayload(data):data);}
 catch{return res.status(503).json({error:'Launch sources are temporarily unavailable. Retry in a few minutes.'});}
}
