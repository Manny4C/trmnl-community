export const CATALOG=[{id:548430,name:'Deep Rock Galactic'},{id:892970,name:'Valheim'},{id:105600,name:'Terraria'}];
export const DEFAULT_APPS=CATALOG.map(g=>g.id);
export const gameName=id=>CATALOG.find(g=>g.id===Number(id))?.name||'Steam app '+id;
export function parseApps(value){
 const raw=String(value??DEFAULT_APPS.join(',')).trim();
 if(!raw||raw.length>1000)throw Error('Choose 1–6 Steam App IDs or Steam store URLs.');
 const parts=raw.split(/[\s,;]+/).filter(Boolean),ids=[];
 if(parts.length>12)throw Error('Follow at most six games.');
 for(let part of parts){
  if(/^https?:\/\//i.test(part)){let u;try{u=new URL(part);}catch{throw Error('Use a Steam store URL or a numeric App ID.');}if(u.hostname!=='store.steampowered.com'||u.username||u.password||u.port)throw Error('Use a store.steampowered.com/app/ URL.');const m=u.pathname.match(/^\/app\/(\d+)(?:\/|$)/);if(!m)throw Error('That Steam URL does not contain an App ID.');part=m[1];}
  if(!/^\d{1,10}$/.test(part)||Number(part)<1||Number(part)>4294967295)throw Error('Steam App IDs must be positive 32-bit numbers.');
  const id=Number(part);if(!ids.includes(id))ids.push(id);
 }
 if(!ids.length||ids.length>6)throw Error('Follow between one and six games.');return ids.sort((a,b)=>a-b);
}
