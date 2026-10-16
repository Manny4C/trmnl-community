import {options,getFlash,devicePayload} from '../lib/editor.js';
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Use GET.'});}
 let config,format;try{const p=new URL(req.url,'https://newsflash-trmnl.vercel.app').searchParams;config=options(p);format=p.get('format');}catch(e){return res.status(400).json({error:e.message});}
 try{const d=await getFlash(config);return res.status(200).json(format==='trmnl'?devicePayload(d):d);}catch{return res.status(503).json({error:'The visual news sources are unavailable. Please retry shortly.'});}
}
