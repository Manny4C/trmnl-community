import {installStoryContent,storyContentSnapshot} from './campaign.js';
const CACHE='one-more-room:chapters:v1';
async function fetchJSON(path,raw=false){const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),4000);try{const res=await fetch(path,{cache:'no-store',signal:abort.signal});if(!res.ok)throw Error('Chapter unavailable');return raw?await res.text():await res.json();}finally{clearTimeout(timer);}}
export async function refreshStoryContent(pinned=''){
  try{const cached=JSON.parse(localStorage.getItem(CACHE)||'null');if(cached)installStoryContent(cached);}catch{}
  try{
    const catalog=await fetchJSON('/content/catalog.json');if(catalog.schema!==1||!Array.isArray(catalog.releases))throw Error('Invalid catalog');
    const ids=[...new Set([pinned,catalog.latest].filter(Boolean))];
    const packs=await Promise.all(ids.map(async id=>{const entry=catalog.releases.find(e=>e.id===id);if(!entry||entry.file!=='packs/'+id+'.json'||!/^[a-f0-9]{64}$/.test(entry.sha256))throw Error('Pinned chapter missing');const raw=await fetchJSON('/content/'+entry.file,true),digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)))].map(n=>n.toString(16).padStart(2,'0')).join('');if(digest!==entry.sha256)throw Error('Chapter digest changed');return JSON.parse(raw);}));
    installStoryContent({latest:catalog.latest,packs});try{localStorage.setItem(CACHE,JSON.stringify(storyContentSnapshot(pinned)));}catch{}
    return true;
  }catch{return false;}
}
