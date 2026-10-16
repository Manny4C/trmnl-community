import {MONTHLY_LIMIT_MICROUSD,MONTHLY_LIMIT_USD} from './budget.js';
const API='https://api.github.com/repos/Manny4C/trmnl-community/contents/newsflash.json';
export function githubStore(token,{fetcher=fetch}={}){
 const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','Content-Type':'application/json'};
 return {
  async read(){const r=await fetcher(API+'?ref=newsflash-data',{headers,signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Cannot read durable editor state.');const f=await r.json();if(!f.content||f.content.length>700000)throw Error('Invalid state file.');return {sha:f.sha,state:JSON.parse(Buffer.from(f.content,'base64').toString())};},
  async write(state,sha,message){const r=await fetcher(API,{method:'PUT',headers,body:JSON.stringify({branch:'newsflash-data',sha,message,content:Buffer.from(JSON.stringify(state,null,2)+'\n').toString('base64')}),signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Atomic state write refused; stopping closed.');const d=await r.json();return d.content.sha;}
 };
}
export function validLedger(state){return !!state?.budget&&/^\d{4}-\d{2}$/.test(state.budget.month)&&state.budget.limit_usd===MONTHLY_LIMIT_USD&&Number.isSafeInteger(state.budget.reserved_microusd)&&state.budget.reserved_microusd>=0&&state.budget.reserved_microusd<=MONTHLY_LIMIT_MICROUSD&&Number.isSafeInteger(state.budget.calls)&&state.budget.calls>=0;}
