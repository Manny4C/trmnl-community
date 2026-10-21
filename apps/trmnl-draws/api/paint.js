import {CANVAS_FORMAT} from '../public/pixels.js';
import {db} from '../lib/db.js';import {session,requireCsrf,trmnlIdentity} from '../lib/auth.js';import {validatePaint} from '../lib/game.js';import {headers,sameOrigin,body,error,fail} from '../lib/http.js';
export function paintHandler({database=db,readSession=session,verify=trmnlIdentity}={}){return async(req,res)=>{headers(res);if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});try{sameOrigin(req);if(!String(req.headers['content-type']||'').startsWith('application/json'))throw error('Use JSON.',415);const raw=body(req),b=validatePaint(raw),sql=database(),s=await readSession(req,sql);requireCsrf(req,s);if(await verify(s.access)!==s.actor)throw error('TRMNL identity changed. Connect again.',403);if(raw.canvas_format!==CANVAS_FORMAT){
 // Old tabs may only confirm an already-saved nonce; their old coordinates can NEVER
 // create new placements in the native canvas. This also resolves uncertain retries.
 const [prior]=await sql`SELECT version,actor,pixels FROM td_edits WHERE nonce=${b.nonce}`;
 if(prior&&prior.actor===s.actor&&Array.isArray(prior.pixels)&&prior.pixels.length===b.pixels.length&&prior.pixels.every((p,i)=>['x','y','color','expected'].every(k=>p[k]===b.pixels[i][k]))){
 const [usage]=await sql`SELECT used FROM td_usage WHERE actor=${s.actor} AND day=(now() AT TIME ZONE 'UTC')::date`;
 return res.status(200).json({accepted:true,duplicate:true,version:Number(prior.version),placed:prior.pixels.length,remaining:10-(usage?.used||0)});
 }
 return res.status(409).json({code:'canvas_changed',error:'The canvas is now 800 × 480. Reload this page before drafting new pixels. This old request was not saved or charged.'});
 }const [r]=await sql`SELECT td_paint(${s.actor},${JSON.stringify(b.pixels)}::jsonb,${b.nonce},${s.entry_day}::date,${CANVAS_FORMAT}) AS result`;return res.status(200).json(r.result);}catch(e){return fail(res,e);}};}
export default paintHandler();
