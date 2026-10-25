import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {portrait} from '../public/render.js';
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
const artOrigin='https://one-more-room-trmnl.vercel.app';
const atlas=`<div class="q-atlas q-atlas-{{ map_mode }}"><img class="q-map-art image-dither" src="${artOrigin}/art/{% if map_mode == 'world' %}atlas{% else %}dungeon-atlas{% endif %}-v2.jpg" alt="Original fantasy atlas" width="360" height="210"><svg class="q-map" viewBox="{{ map_box | escape }}" aria-label="{{ map_context | escape }}"><path class="q-map-roads" d="{{ map_roads | escape }}"/><path class="q-map-trail" d="{{ map_trail | escape }}"/>{% for point in map_points %}<g class="q-waypoint c{{ point[2] }}" transform="translate({{ point[0] }} {{ point[1] }})">{% if map_mode == 'world' %}<circle class="q-world-node" r="5"/>{% else %}<rect class="q-room-node" x="-11" y="-8" width="22" height="16" rx="2"/>{% endif %}<text class="q-node-glyph" y="3">{% if point[2] == 3 %}◆{% else %}{{ point[4] | escape }}{% endif %}</text>{% if point[3] != '' %}<text class="q-map-label" y="20">{{ point[3] | escape }}</text>{% endif %}</g>{% endfor %}</svg></div>`;
const party=`<div class="q-party">{% for hero in party %}<div class="q-hero">{% case forloop.index0 %}${[0,1,2,3].map(i=>`{% when ${i} %}`+portrait(i)).join('')}{% endcase %}<div><strong>{{ hero.name | escape }}</strong><span>{{ hero.hp }}/{{ hero.max }} HP</span></div><i class="q-hp" style="--hp:{{ hero.hp | times: 100 | divided_by: hero.max }}%"></i></div>{% endfor %}</div>`;
const shared=`<style>${css}</style>
{% template quest_content %}
<article class="quest q-{{ mode | default: 'full' }}">
<header class="q-header"><span class="q-brand text--red 1bit:text--black 2bit:text--black 4bit:text--black">◈ ONE MORE ROOM</span><span class="q-header-meta">{% if status != 'Autopilot' %}{{ status | escape }} · {% endif %}TURN {{ turn }}</span></header>
<div class="q-body"><section class="q-left"><div class="q-chart-head"><div><span class="q-kicker text--red 1bit:text--black 2bit:text--black 4bit:text--black">{{ map_context | escape }}</span><h3>{{ map_title | escape }}</h3></div><span class="q-map-auto">AUTO ZOOM</span></div>${atlas}
<div class="q-legend"><span>◆ Company</span><span>┄ Journey trail</span><span>{{ map_caption | escape }}</span></div>
<div class="q-goal"><div class="q-section"><strong>REKINDLE THE SUN</strong><span>{{ relics }} EMBERS</span></div><p>{{ objective | escape }}</p></div>
<div class="q-story"><div class="q-section"><strong>RECENT JOURNEY</strong><span>FLOOR {{ floor }} · ROOM {{ room }}</span></div><ol>{% for event in recap %}<li>{{ event | escape }}</li>{% endfor %}</ol></div>${party}</section>
<section class="q-right"><div class="q-section"><strong>THE CURRENT SCENE</strong><span>{{ kind | upcase | escape }}</span></div>
{% assign art_key = kind %}{% if safe and kind == 'battle' %}{% assign art_key = 'passage' %}{% elsif safe and kind == 'keeper' %}{% assign art_key = 'shrine' %}{% endif %}
<div class="q-art"><img class="q-scene-image image-dither" src="${artOrigin}/art/{{ art_key }}-v2.jpg" alt="Illustrated {{ kind | escape }} encounter with the Lantern Company" width="1200" height="523"></div>
<h2>{{ title | escape }}</h2><p class="q-narrative">{{ text | escape }}</p><div class="q-roll">{{ roll | escape }}</div>
<div class="q-section q-next"><strong>NEXT ACTION</strong><span>AUTO ON NEXT FRAME</span></div><div class="q-choices">{% for choice in choices %}<div class="q-choice {% if choice.auto %}q-auto bg--yellow 1bit:bg--white 2bit:bg--white 4bit:bg--white text--black{% endif %}"><span class="q-number">{{ forloop.index }}</span><span class="q-choice-text">{{ choice.label | escape }}</span><span class="q-choice-meta">{% if choice.auto %}AUTO →{% else %}{{ choice.actor | escape }}{% endif %}</span></div>{% endfor %}</div><p class="q-scene-location">{{ map_reason | escape }}</p></section></div>
<footer class="q-footer"><span>{% if map_mode == 'world' %}THE WIDER JOURNEY{% else %}{{ theme | escape }}{% endif %} <b>·</b> FLOOR {{ floor }}</span><span>{{ gold }} GOLD <b>·</b> {{ supplies }} SUPPLIES <b>·</b> {{ relics }} EMBERS</span></footer></article>
{% endtemplate %}`;
await writeFile('trmnl/shared.liquid',shared);
const fields=Object.keys(view(newCampaign())).concat('status');
for(const mode of ['full','half_horizontal','half_vertical','quadrant'])await writeFile('trmnl/'+mode+'.liquid',`{% render 'quest_content',mode:'${mode}',${fields.map(k=>k+':'+k).join(',')} %}\n`);
const icon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#fff"/><g fill="none" stroke="#171914" stroke-width="3" stroke-linejoin="round"><path d="M26 20v-7a6 6 0 0 1 12 0v7M17 24l9-5h12l9 5-5 27H22zM17 24h30M23 46h18M28 27v15m8-15v15M20 55h24"/><path d="m32 29 4 8-4 6-4-6z" fill="#e9be40"/></g></svg>`;
await writeFile('trmnl/icon.svg',icon);await writeFile('public/icon.svg',icon);
const priorRelease=JSON.parse(await readFile('public/release.json','utf8'));
await writeFile('public/release.json',JSON.stringify({...priorRelease,updated_on:'2026-10-25',artwork:'ImageGen v2 world/dungeon atlases and seven scenes',automatic_map_camera:true,app:'One More Room',built_on:'2026-10-24',website:'https://one-more-room-trmnl.vercel.app',recipe_id:null,installed:false,submitted:false,approved:false,physical_receipt:false,engine:'procedural',layouts:4},null,2)+'\n');
const setup=await readFile('trmnl/SETUP.md','utf8');
// Plain text is accessible without a JavaScript renderer; keep canonical Markdown in the ZIP.
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await writeFile('public/setup.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>One More Room — TRMNL setup</title><link rel="stylesheet" href="/style.css"></head><body><main class="page"><nav class="masthead"><a class="wordmark" href="/">← ONE MORE ROOM</a><a class="btn" href="/plugin.zip">Download package ↓</a></nav><pre style="font:14px/1.8 monospace;white-space:pre-wrap;overflow-wrap:anywhere;padding:30px 0">${escape(setup)}</pre></main></body></html>`);
await mkdir('artifacts',{recursive:true});
await writeFile('artifacts/example.json',JSON.stringify(view(newCampaign()),null,2));
execFileSync('python3',['-c',`import zipfile,pathlib\nwith zipfile.ZipFile('public/plugin.zip','w',zipfile.ZIP_DEFLATED) as z:\n for p in sorted(pathlib.Path('trmnl').glob('*')):\n  if p.is_file(): z.write(p,'one-more-room/'+p.name)`]);
console.log('Packaged four layouts, shared rules, Serverless transform, configuration and setup.');
