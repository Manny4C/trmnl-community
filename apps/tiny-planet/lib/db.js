import {neon} from '@neondatabase/serverless';
let cached;
export function db(){if(!process.env.DATABASE_URL)throw Object.assign(Error('The shared planet is awaiting database activation.'),{status:503});return cached??=neon(process.env.DATABASE_URL);}
export async function world(sql=db()){const [row]=await sql`SELECT state, COALESCE((SELECT jsonb_agg(e) FROM (SELECT turn,action,x,y,kind,message,chapter,day,created_at FROM tp_moves ORDER BY turn DESC LIMIT 12) e),'[]'::jsonb) AS events FROM tp_world WHERE id=1`;if(!row)throw Error('Planet not initialized');return {...row.state,groves:row.state.tiles.join('').split('T').length-1,events:row.events,checked_at:new Date().toISOString()};}
