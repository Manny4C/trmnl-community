import {getPool} from '../lib/editor.js';
import {MODEL,candidatesForAI,requestBody,reservationFor,reserveBudget,parseDecisions,callEditor} from '../lib/ai-editor.js';
const token=process.env.GITHUB_TOKEN,key=process.env.NEWSFLASH_OPENAI_API_KEY;
const repo='Manny4C/trmnl-community',branch='newsflash-data',path='newsflash.json';
if(!token)throw Error('GitHub workflow credential is required.');
const api=`https://api.github.com/repos/${repo}/contents/${path}`;
async function read(){const r=await fetch(api+'?ref='+branch,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Cannot read durable Newsflash state; stopping closed.');const file=await r.json();return {sha:file.sha,state:JSON.parse(Buffer.from(file.content,'base64').toString())};}
async function write(state,sha,message){const r=await fetch(api,{method:'PUT',headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify({branch,sha,message,content:Buffer.from(JSON.stringify(state,null,2)+'\n').toString('base64')}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Atomic state write failed; no model call will be attempted or retried.');const result=await r.json();return result.content.sha;}
const now=new Date(),runId=process.env.GITHUB_RUN_ID||`manual-${now.toISOString()}`;
let {state,sha}=await read();
if(!state.budget||!/^\d{4}-\d{2}$/.test(state.budget.month)||state.budget.limit_usd!==5||!Number.isSafeInteger(state.budget.reserved_microusd)||state.budget.reserved_microusd<0||!Number.isSafeInteger(state.budget.calls)||state.budget.calls<0)throw Error('Missing or invalid durable budget ledger; stopping closed.');
if(state.budget.month===now.toISOString().slice(0,7)&&state.budget.last_run===runId){console.log('This run already reserved its request; no retry call made.');process.exit(0);}
if(!key){state.status='awaiting_api_key';state.last_attempt_at=now.toISOString();await write(state,sha,'Newsflash: awaiting editor credential');console.log('AI activation pending; no model request made.');process.exit(0);}
const pool=await getPool();if(pool.stale)throw Error('Live feeds unavailable; keep prior AI snapshot.');
const stories=candidatesForAI(pool);if(!stories.length)throw Error('No visual stories available.');
const body=requestBody(stories,now),amount=reservationFor(body);const budget=reserveBudget(state.budget,amount,now,runId);
if(!budget){state.status='budget_paused';state.last_attempt_at=now.toISOString();await write(state,sha,'Newsflash: monthly budget gate stopped editor');console.log('Budget gate closed; no model request made.');process.exit(0);}
// Persist the conservative charge BEFORE the only paid request. CAS and workflow concurrency fail closed.
state={...state,status:'editing',budget,last_attempt_at:now.toISOString()};sha=await write(state,sha,'Newsflash: reserve bounded AI editor request');
try{const response=await callEditor(body,key);const decisions=parseDecisions(response,stories);state={...state,status:'ready',snapshot:{generated_at:new Date().toISOString(),model:MODEL,decisions,source_checked_at:pool.checked_at},last_success_at:new Date().toISOString()};await write(state,sha,'Newsflash: publish current grounded AI decisions');console.log(`AI edition published for ${decisions.length} visual stories. Budget reservation $${(amount/1000000).toFixed(5)}.`);}
catch{state.status='editor_unavailable';await write(state,sha,'Newsflash: editor unavailable; retain dated snapshot');throw Error('AI edit failed; previous snapshot retained, reservation retained, no automatic retry.');}
