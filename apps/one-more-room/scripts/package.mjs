import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sceneSVG,portrait} from '../public/render.js';
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
const css=await readFile('public/screen.css','utf8');
const art=`{% if safe and kind == 'battle' %}${sceneSVG('passage')}{% elsif safe and kind == 'keeper' %}${sceneSVG('shrine')}{% else %}{% case kind %}`+['passage','battle','keeper','trap','treasure','lore','shrine'].map(k=>`{% when '${k}' %}`+sceneSVG(k)).join('')+`{% endcase %}{% endif %}`;
const shared=`<style>${css}</style>
{% template quest_content %}
<article class="quest q-{{ mode | default: 'full' }}">
<header class="q-header"><span class="q-brand text--red 1bit:text--black 2bit:text--black 4bit:text--black">◈ ONE MORE ROOM</span><span class="q-header-meta">{% if status != 'Autopilot' %}{{ status | escape }} · {% endif %}TURN {{ turn }}</span></header>
<div class="q-body"><section class="q-left"><div class="q-section"><strong>THE JOURNEY</strong><span>FLOOR {{ floor }} · {{ explored }}/24 ROOMS</span></div>
<div class="q-map">{% for cell in cells %}<div class="q-tile c{{ cell[0] }} e{{ cell[2] }}"><b class="north"></b><b class="east"></b><b class="south"></b><b class="west"></b><span>{{ cell[1] | escape }}</span></div>{% endfor %}</div>
<div class="q-legend"><span>◆ Party</span><span>· Explored</span><span>? Unknown</span><span>▼ Keeper</span></div>
<div class="q-story"><div class="q-section"><strong>THE STORY SO FAR</strong><span>{{ relics }} EMBERS</span></div><p class="q-summary">{{ summary | escape }}</p><ol>{% assign recent = log | slice: -2, 2 %}{% for event in recent %}<li>{{ event | escape }}</li>{% endfor %}</ol></div></section>
<section class="q-right"><div class="q-section"><strong>ROOM {{ room }}</strong><span>{{ theme | upcase | escape }}</span></div><div class="q-art">${art}</div><h2>{{ title | escape }}</h2><p class="q-narrative">{{ text | escape }}</p><div class="q-roll">{{ roll | escape }}</div>
<div class="q-section q-next"><strong>NEXT ACTION</strong><span>AUTO ON NEXT FRAME</span></div><div class="q-choices">{% for choice in choices %}<div class="q-choice {% if choice.auto %}q-auto bg--yellow 1bit:bg--white 2bit:bg--white 4bit:bg--white text--black{% endif %}"><span class="q-number">{{ forloop.index }}</span><span class="q-choice-text">{{ choice.label | escape }}</span><span class="q-choice-meta">{% if choice.auto %}AUTO →{% else %}{{ choice.actor | escape }}{% endif %}</span></div>{% endfor %}</div>
<div class="q-party">{% for hero in party %}<div class="q-hero">{% case forloop.index0 %}${[0,1,2,3].map(i=>`{% when ${i} %}`+portrait(i)).join('')}{% endcase %}<div><strong>{{ hero.name | escape }}</strong><span>{{ hero.hp }}/{{ hero.max }} HP</span></div><i class="q-hp" style="--hp:{{ hero.hp | times: 100 | divided_by: hero.max }}%"></i></div>{% endfor %}</div></section></div>
<footer class="q-footer"><span>FLOOR {{ floor }} <b>·</b> {{ theme | escape }}</span><span>{{ gold }} GOLD <b>·</b> {{ supplies }} SUPPLIES <b>·</b> {{ relics }} EMBERS</span></footer></article>
{% endtemplate %}`;
await writeFile('trmnl/shared.liquid',shared);
for(const mode of ['full','half_horizontal','half_vertical','quadrant'])await writeFile('trmnl/'+mode+'.liquid',`{% render 'quest_content',mode:'${mode}',turn:turn,floor:floor,explored:explored,cells:cells,relics:relics,summary:summary,log:log,room:room,theme:theme,kind:kind,safe:safe,title:title,text:text,roll:roll,choices:choices,party:party,gold:gold,supplies:supplies,status:status %}\n`);
const icon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#fff"/><g fill="none" stroke="#171914" stroke-width="3" stroke-linejoin="round"><path d="M26 20v-7a6 6 0 0 1 12 0v7M17 24l9-5h12l9 5-5 27H22zM17 24h30M23 46h18M28 27v15m8-15v15M20 55h24"/><path d="m32 29 4 8-4 6-4-6z" fill="#e9be40"/></g></svg>`;
await writeFile('trmnl/icon.svg',icon);await writeFile('public/icon.svg',icon);
await writeFile('public/release.json',JSON.stringify({app:'One More Room',built_on:'2026-10-24',website:'https://one-more-room-trmnl.vercel.app',recipe_id:null,installed:false,submitted:false,approved:false,physical_receipt:false,engine:'procedural',layouts:4},null,2)+'\n');
const setup=await readFile('trmnl/SETUP.md','utf8');
// Plain text is accessible without a JavaScript renderer; keep canonical Markdown in the ZIP.
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await writeFile('public/setup.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>One More Room — TRMNL setup</title><link rel="stylesheet" href="/style.css"></head><body><main class="page"><nav class="masthead"><a class="wordmark" href="/">← ONE MORE ROOM</a><a class="btn" href="/plugin.zip">Download package ↓</a></nav><pre style="font:14px/1.8 monospace;white-space:pre-wrap;overflow-wrap:anywhere;padding:30px 0">${escape(setup)}</pre></main></body></html>`);
await mkdir('artifacts',{recursive:true});
await writeFile('artifacts/example.json',JSON.stringify(view(newCampaign()),null,2));
execFileSync('python3',['-c',`import zipfile,pathlib\nwith zipfile.ZipFile('public/plugin.zip','w',zipfile.ZIP_DEFLATED) as z:\n for p in sorted(pathlib.Path('trmnl').glob('*')):\n  if p.is_file(): z.write(p,'one-more-room/'+p.name)`]);
console.log('Packaged four layouts, shared rules, Serverless transform, configuration and setup.');
