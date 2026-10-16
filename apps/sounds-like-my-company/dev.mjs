import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import handler from './api/matches.js';
import linksHandler from './api/links.js';
import qrHandler from './api/qr.js';
const root = resolve('public');
createServer(async (req,res) => {
  res.status = code => {res.statusCode = code; return res;};
  res.setHeader('Cache-Control', 'no-store');
  res.json = object => {res.setHeader('Cache-Control', 'no-store');res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(object));};
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/api/matches') return handler(req,res);
  if (path === '/api/qr') return qrHandler(req,res);
  if (path === '/api/links') {if(req.method==='POST'){let body='';for await(const chunk of req){body+=chunk;if(body.length>4000){res.statusCode=413;return res.end();}}try{req.body=JSON.parse(body);}catch{res.statusCode=400;return res.end();}}return linksHandler(req,res);}
  const file = resolve(root, '.' + (path === '/' || /^\/r\/[^/]+$/.test(path) ? '/index.html' : path));
  if (!file.startsWith(root + '/')) {res.statusCode=403; return res.end();}
  try {
    const data = await readFile(file);
    res.setHeader('Content-Type', {'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.json':'application/json'}[extname(file)] || 'text/plain');
    res.end(data);
  } catch {res.statusCode=404;res.end('Not found');}
}).listen(Number(process.env.PORT || 4319), '127.0.0.1', () => console.log('Sounds Like My Company ready at http://127.0.0.1:'+Number(process.env.PORT || 4319)));
