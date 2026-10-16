import QRCode from 'qrcode';
import {linkInfo} from '../lib/links.js';
export default async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');res.statusCode=405;return res.end();}
 let url;try{url=linkInfo(new URL(req.url,'https://sounds-like-my-company.vercel.app').searchParams.get('code')).links_url;}catch{res.statusCode=400;return res.end('Invalid links code.');}
 const png=await QRCode.toBuffer(url,{type:'png',errorCorrectionLevel:'M',scale:2,margin:4,color:{dark:'#000000',light:'#ffffff'}});
 res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','public, max-age=86400, immutable');res.end(png);
}
