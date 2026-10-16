import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import handler from './api/editor.js';
const root = resolve('public');
createServer(async (req,res) => {
  res.status = code => {res.statusCode = code; return res;};
  res.setHeader('Cache-Control', 'no-store');
  res.json = object => {res.setHeader('Cache-Control', 'no-store');res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(object));};
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/api/editor') return handler(req,res);
  const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
  if (!file.startsWith(root + '/')) {res.statusCode=403; return res.end();}
  try {
    const data = await readFile(file);
    res.setHeader('Content-Type', {'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.json':'application/json'}[extname(file)] || 'text/plain');
    res.end(data);
  } catch {res.statusCode=404;res.end('Not found');}
}).listen(Number(process.env.PORT || 4320), '127.0.0.1', () => console.log('Desk Editor ready at http://127.0.0.1:'+Number(process.env.PORT || 4320)));
