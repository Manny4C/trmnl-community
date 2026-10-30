import {Resvg} from '@resvg/resvg-js';
import {world} from '../lib/db.js';
import {planetSVG} from '../public/planet.js';
import {headers,fail} from '../lib/http.js';
export function planetHandler({readWorld=world}={}){return async function(req,res){
 headers(res);if(req.method!=='GET')return res.status(405).json({error:'Use GET.'});
 try{const s=await readWorld(),url=new URL(req.url,'https://local');
 const svg=planetSVG(s,{angle:-.18+Math.sin(s.turn*.19)*.12,device:true,bw:url.searchParams.get('ink')==='bw'});
 const png=new Resvg(svg,{background:'white',fitTo:{mode:'width',value:1280}}).render().asPng();
 res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','public, max-age=60, s-maxage=60');return res.status(200).end(png);
 }catch(e){return fail(res,e);}
 };}
export default planetHandler();
