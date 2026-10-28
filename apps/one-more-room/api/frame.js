import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export default async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
  const url=new URL(req.url,'https://one-more-room-trmnl.vercel.app'),frame='minute:'+Math.floor(Date.now()/60000);
  // Existing installed transforms retain the small, unchanged frame contract.
  if(url.searchParams.get('story')!=='1')return res.status(200).json({frame,engine:1});
  const pinned=url.searchParams.get('release')||'';
  if(pinned&&!/^[a-z][a-z0-9_-]{0,63}$/.test(pinned))return res.status(400).json({error:'Invalid chapter'});
  try{
    const catalog=JSON.parse(await readFile(new URL('../public/content/catalog.json',import.meta.url),'utf8'));
    const ids=[...new Set([pinned,catalog.latest].filter(Boolean))],packs=[];
    for(const id of ids){const entry=catalog.releases.find(e=>e.id===id);if(!entry)return res.status(404).json({error:'Pinned chapter unavailable; progress must be preserved'});
      if(entry.file!=='packs/'+id+'.json')throw Error('Bad catalog path');
      const raw=await readFile(new URL('../public/content/'+entry.file,import.meta.url));if(createHash('sha256').update(raw).digest('hex')!==entry.sha256)throw Error('Chapter digest mismatch');packs.push(JSON.parse(raw));
    }
    return res.status(200).json({frame,engine:2,story_content:{latest:catalog.latest,packs}});
  }catch{return res.status(503).json({error:'Chapter service unavailable; preserve the last good game'});}
}
