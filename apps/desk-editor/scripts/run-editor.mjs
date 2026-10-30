import {getPool} from '../lib/editor.js';
import {candidatesForAI,requestBody,reservationFor,reserveBudget} from '../lib/ai-editor.js';
import {githubStore,validLedger} from '../lib/store.js';
import {diagnosticCode} from '../lib/editor-failure.js';
const token=process.env.GITHUB_TOKEN;if(!token)throw Error('Repository workflow credential is required.');
const store=githubStore(token),now=new Date(),runId=process.env.GITHUB_RUN_ID||`manual-${now.toISOString()}`;
let {state,sha}=await store.read();if(!validLedger(state))throw Error('Invalid budget ledger; stopping closed.');
if(state.budget.month===now.toISOString().slice(0,7)&&state.budget.last_run===runId){console.log('Run already reserved; no retry request made.');process.exit(0);}
if(state.status==='credential_unavailable'){console.log('The Vercel editor credential needs replacement and activation; no model request made.');process.exit(0);}
const pool=await getPool();if(pool.stale)throw Error('Live source outage; retaining previous edition.');
const stories=candidatesForAI(pool);if(!stories.length)throw Error('No visual stories.');
const amount=reservationFor(requestBody(stories,now)),budget=reserveBudget(state.budget,amount,now,runId);
if(!budget){state.status='budget_paused';await store.write(state,sha,'Newsflash: monthly budget stopped scheduled editor');console.log('Budget gate closed.');process.exit(0);}
state={...state,status:'editing',budget,last_attempt_at:now.toISOString(),pending_reservation_microusd:amount,pending_source_checked_at:pool.checked_at};sha=await store.write(state,sha,'Newsflash: reserve one bounded AI edit');
const r=await fetch('https://newsflash-trmnl.vercel.app/api/curate',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({run_id:runId,state_sha:sha,stories}),signal:AbortSignal.timeout(120000),redirect:'error'});
if(!r.ok){let failure;try{failure=await r.json();}catch{}const code=diagnosticCode({editorDiagnosticCode:failure?.diagnostic_code});throw Error(`Cloud editor did not complete (${code}); reservation retained, no automatic retry.`);}const result=await r.json();console.log(`AI edition published for ${result.edited_count} stories. Conservative budget reservation $${(amount/1000000).toFixed(5)}. The API key stayed inside Vercel.`);
