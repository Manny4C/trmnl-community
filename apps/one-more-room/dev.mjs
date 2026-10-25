import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import frame from './api/frame.js';
const root=resolve('public'),port=Number(process.env.PORT||4331);
createServer(async(req,res)=>{
  res.status=n=>(res.statusCode=n,res);res.json=b=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(b));};
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/api/frame')return frame(req,res);
  const file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(!file.startsWith(root+'/'))return res.status(403).end('Forbidden');
  try{res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.json':'application/json','.zip':'application/zip'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.status(404).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('One More Room ready at http://127.0.0.1:'+port));
