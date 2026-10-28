import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {newCampaign,view} from '../public/game.js';
const engine=(await readFile('public/game.js','utf8')).replace(/^export /gm,'');
const transform=engine+`\nfunction run(input) {
  input=input||{};
  const fields=input.trmnl?.plugin_settings?.custom_fields_values||{};
  const seed=seedText(fields.campaign_seed??input.seed??'lantern');
  const style=['balanced','bold','careful'].includes(fields.party_style)?fields.party_style:'balanced';
  const prior=input.trmnl?.state;
  let state=validCampaign(prior)&&prior.seed===seed?JSON.parse(JSON.stringify(prior)):newCampaign(seed,style);
  state.style=style;
  // A failed/empty poll must never erase a campaign or fabricate another turn.
  if(typeof input.frame!=='string'||!/^minute:\\d{1,14}$/.test(input.frame))return {...view(state),status:'Waiting for a fresh frame'};
  state=advance(state,null,input.frame);
  return {...view(state),status:'Autopilot',trmnl_state:state};
}\n`;
await writeFile('trmnl/transform.js',transform);
// trmnl/shared.liquid is the canonical native Framework template. Do not replace it with browser CSS.
const fields=Object.keys(view(newCampaign())).concat('status');
for(const mode of ['full','half_horizontal','half_vertical','quadrant'])await writeFile('trmnl/'+mode+'.liquid',`{% render 'quest_content',mode:'${mode}',${fields.map(k=>k+':'+k).join(',')} %}\n`);
const icon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#fff"/><g fill="none" stroke="#171914" stroke-width="3" stroke-linejoin="round"><path d="M26 20v-7a6 6 0 0 1 12 0v7M17 24l9-5h12l9 5-5 27H22zM17 24h30M23 46h18M28 27v15m8-15v15M20 55h24"/><path d="m32 29 4 8-4 6-4-6z" fill="#e9be40"/></g></svg>`;
await writeFile('trmnl/icon.svg',icon);await writeFile('public/icon.svg',icon);
const priorRelease=JSON.parse(await readFile('public/release.json','utf8'));
await writeFile('public/release.json',JSON.stringify({...priorRelease,updated_on:'2026-10-27',artwork:'ImageGen v2 world/dungeon atlases and seven scenes',automatic_map_camera:true,app:'One More Room',built_on:'2026-10-24',website:'https://one-more-room-trmnl.vercel.app',recipe_id:null,installed:false,submitted:false,approved:false,physical_receipt:false,engine:'procedural',layouts:4},null,2)+'\n');
const setup=await readFile('trmnl/SETUP.md','utf8');
// Plain text is accessible without a JavaScript renderer; keep canonical Markdown in the ZIP.
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await writeFile('public/setup.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>One More Room — TRMNL setup</title><link rel="stylesheet" href="/style.css"></head><body><main class="page"><nav class="masthead"><a class="wordmark" href="/">← ONE MORE ROOM</a><a class="btn" href="/plugin.zip">Download package ↓</a></nav><pre style="font:14px/1.8 monospace;white-space:pre-wrap;overflow-wrap:anywhere;padding:30px 0">${escape(setup)}</pre></main></body></html>`);
await mkdir('artifacts',{recursive:true});
await writeFile('artifacts/example.json',JSON.stringify(view(newCampaign()),null,2));
execFileSync('python3',['-c',`import zipfile,pathlib\nwith zipfile.ZipFile('public/plugin.zip','w',zipfile.ZIP_DEFLATED) as z:\n for p in sorted(pathlib.Path('trmnl').glob('*')):\n  if p.is_file(): z.write(p,'one-more-room/'+p.name)`]);
console.log('Packaged four layouts, shared rules, Serverless transform, configuration and setup.');
