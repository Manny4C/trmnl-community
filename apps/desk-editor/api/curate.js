import {githubStore} from '../lib/store.js';
import {curate} from '../lib/curator.js';
import {callEditor} from '../lib/ai-editor.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Scheduled editor endpoint; use POST.'});}
 const match=String(req.headers.authorization||'').match(/^Bearer (\S+)$/);if(!match)return res.status(401).json({error:'Repository workflow authorization required.'});
 if(!process.env.NEWSFLASH_OPENAI_API_KEY)return res.status(503).json({error:'Editor credential not configured.'});
 try{let payload=req.body;if(Buffer.isBuffer(payload)||typeof payload==='string'){if(Buffer.byteLength(payload)>64000)throw Error();payload=JSON.parse(payload.toString());}if(Buffer.byteLength(JSON.stringify(payload||{}))>64000)throw Error();
 const result=await curate(payload,{store:githubStore(match[1]),editor:body=>callEditor(body,process.env.NEWSFLASH_OPENAI_API_KEY)});return res.status(200).json(result);
 }catch{return res.status(503).json({error:'Editor could not complete. Check its durable state; no automatic retry.'});}
}
