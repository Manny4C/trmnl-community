import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {newCampaign,view} from '../public/game.js';
const storyEngine=(await readFile('public/campaign.js','utf8')).replace(/^export /gm,'');
const engine=storyEngine+'\n'+(await readFile('public/game.js','utf8')).replace(/^import .*from '\.\/campaign\.js';\n/m,'').replace(/^export /gm,'');
const transform=engine+`\nfunction run(input) {
  input=input||{};
  const remembered={...(input.trmnl?.previous_merge_variables||{})};delete remembered.trmnl_state;
  const fields=input.trmnl?.plugin_settings?.custom_fields_values||{};
  const seed=seedText(fields.campaign_seed??input.seed??'lantern');
  const style=['balanced','bold','careful'].includes(fields.party_style)?fields.party_style:'balanced';
  const prior=input.trmnl?.state;
  try{if(input.story_content)installStoryContent(input.story_content);}catch{return {...remembered,status:'Chapter content unavailable; progress preserved'};}
  let state=validCampaign(prior)&&prior.seed===seed?JSON.parse(JSON.stringify(prior)):newCampaign(seed,style);
  state.style=style;
  // A failed/empty poll must never erase a campaign or fabricate another turn.
  if(typeof input.frame!=='string'||!/^minute:\\d{1,14}$/.test(input.frame))return {...(Object.keys(remembered).length?remembered:view(state)),status:'Waiting for a fresh frame'};
  if(state.story&&!storyPack(state))return {...(Object.keys(remembered).length?remembered:view(state)),status:'Pinned chapter unavailable; progress preserved'};
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
await writeFile('public/release.json',JSON.stringify({...priorRelease,updated_on:priorRelease.updated_on??'2026-10-28',artwork:'ImageGen v2 world/dungeon atlases and seven scenes',automatic_map_camera:true,app:'One More Room',built_on:'2026-10-24',website:'https://one-more-room-trmnl.vercel.app',recipe_id:priorRelease.recipe_id??null,installed:priorRelease.installed??false,submitted:priorRelease.submitted??false,approved:priorRelease.approved??false,physical_receipt:priorRelease.physical_receipt??false,engine:'procedural',layouts:4},null,2)+'\n');
const setup=await readFile('trmnl/SETUP.md','utf8');
// Plain text is accessible without a JavaScript renderer; keep canonical Markdown in the ZIP.
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await writeFile('public/setup.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>One More Room — TRMNL setup</title><link rel="stylesheet" href="/style.css"></head><body><main class="page"><nav class="masthead"><a class="wordmark" href="/">← ONE MORE ROOM</a><a class="btn" href="/plugin.zip">Download package ↓</a></nav><pre style="font:14px/1.8 monospace;white-space:pre-wrap;overflow-wrap:anywhere;padding:30px 0">${escape(setup)}</pre></main></body></html>`);
const canon=JSON.parse(await readFile('campaign/canon.json','utf8')),catalog=JSON.parse(await readFile('public/content/catalog.json','utf8'));
const latestPack=JSON.parse(await readFile('public/content/packs/'+catalog.latest+'.json','utf8'));
const cards=(title,rows)=>`<section class="how"><div><span class="step">${escape(title)}</span></div>${rows.map(([name,text])=>`<div><h3>${escape(name)}</h3><p>${escape(text)}</p></div>`).join('')}</section>`;
await writeFile('public/world.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The world of One More Room</title><link rel="stylesheet" href="/style.css"></head><body><main class="page"><nav class="masthead"><a class="wordmark" href="/">← ONE MORE ROOM</a><span class="eyebrow">THE WORLD NOTEBOOK</span></nav><section class="intro"><div><span class="eyebrow">THE LANTERN COMPANY</span><h1>A world worth<br><em>remembering.</em></h1><p>Four heroes carry one lantern into a world that still needs ordinary care.<br>The road, its people, and the promises you keep can matter again.</p></div></section><section class="install"><div><span class="eyebrow">CURRENT WEB CHAPTER</span><h2>${escape(latestPack.title)}</h2><p>${escape(latestPack.intro)}</p><p>New material is written on Mondays. Your party finishes its current chapter and any side story it accepted before moving into a newer one.</p></div><a class="btn btn-ink" href="/">Follow the company →</a></section>${cards('PLACES ON THE ATLAS',canon.regions.map(r=>[r.name,'An established region of the underworld, with its own keepers, people and unfinished work.']))}${cards('PEOPLE TO REMEMBER',canon.people.map(p=>[p.name,p.goal+'.']))}${cards('WHAT KEEPS THE STORY TOGETHER',[['Promises survive','A short recap does not erase a favor or a choice. Earned facts carry forward.'],['Small actions matter','Look, talk, help, repair, cross, rest or fight. A setback can still open the next step.'],['The world has limits','Messages need routes, people know only what they can learn, and a new week does not rewrite your party\'s past.']])}<footer class="site-footer"><span>Original world and weekly chapters · Web content available now</span><a href="/">Return to the adventure ↗</a></footer></main></body></html>`);
const release=JSON.parse(await readFile('public/release.json','utf8'));Object.assign(release,{campaign_content_release:catalog.latest,campaign_schedule:'Mondays at 10:00 America/Los_Angeles',native_campaign_bridge_status:release.native_campaign_bridge_status||'prepared_not_saved'});await writeFile('public/release.json',JSON.stringify(release,null,2)+'\n');

await mkdir('artifacts',{recursive:true});
await writeFile('artifacts/example.json',JSON.stringify(view(newCampaign()),null,2));
execFileSync('python3',['-c',`import zipfile,pathlib\nwith zipfile.ZipFile('public/plugin.zip','w',zipfile.ZIP_DEFLATED) as z:\n for p in sorted(pathlib.Path('trmnl').glob('*')):\n  if p.is_file(): z.write(p,'one-more-room/'+p.name)`]);
console.log('Packaged four layouts, shared rules, Serverless transform, configuration and setup.');
