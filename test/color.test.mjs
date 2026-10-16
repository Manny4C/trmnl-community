import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Liquid} from '../apps/sounds-like-my-company/node_modules/liquidjs/dist/liquid.node.mjs';
import {Window} from '../apps/sounds-like-my-company/node_modules/happy-dom/lib/index.js';
const apps=['what-changed','yc-scout','sounds-like-my-company','desk-editor'];
const layouts=['full','half_horizontal','half_vertical','quadrant'];
const context={headline:'A real source headline',source:'Launch HN',reason:'Shared wording: agents',name:'Echo',profile:'Public managed agents',result_count:6,window_days:90,order:'latest',checked_at:'2026-10-16T18:00:00Z',fetched_at:'2026-10-16T18:00:00Z',mode_label:'Latest launches',filter_label:'All sectors',headline_count:20,density:'dense',column_rows:10,briefing_label:'Your first briefing',topic_label:'Custom news',total:10,selection_method:'ai',image_url:'https://example.com/source.jpg',image_caption:'Credited source image',image_credit:'Source',links_code:'ECHO',links_url:'https://sounds-like-my-company.vercel.app/r/ECHO',links_qr_url:'https://sounds-like-my-company.vercel.app/api/qr?code=ECHO',stories:Array.from({length:20},(_,i)=>({title:`Headline ${i+1}`,snippet:'Extra detail',source:'Source',change:'NEW',published_at:'2026-10-16'})),companies:Array.from({length:10},(_,i)=>({name:`Company ${i+1}`,description:'Public product description',batch:'F26',published_at:'2026-10-16'})),matches:Array.from({length:8},(_,i)=>({title:`Launch ${i+1}`,source:i%2?'Show HN':'Launch HN',reason:'Shared wording: agents',published_at:'2026-10-16'}))};
for(const app of apps)test(`${app}: every layout retains readable content and explicit grayscale accent fallbacks`,async()=>{
 const raw=await readFile(`apps/${app}/trmnl/shared.liquid`,'utf8');
 const templates=new Map([...raw.matchAll(/{% template (\w+) %}([\s\S]*?){% endtemplate %}/g)].map(m=>[m[1],m[2]]));
 const common=raw.replace(/{% template \w+ %}[\s\S]*?{% endtemplate %}/g,'');
 const engine=new Liquid({relativeReference:false,fs:{exists:async p=>templates.has(p),existsSync:p=>templates.has(p),readFile:async p=>templates.get(p),readFileSync:p=>templates.get(p),resolve:(root,file)=>file,dirname:()=>'.'}});
 for(const layout of layouts){
  const markup=await readFile(`apps/${app}/trmnl/${layout}.liquid`,'utf8');
  const html=await engine.parseAndRender(common+markup,context);
  const w=new Window();w.document.body.innerHTML=html;
  const accents=[...w.document.querySelectorAll('[class]')].filter(el=>el.classList.contains('text--red')||el.classList.contains('bg--red')||el.classList.contains('bg--yellow'));
  assert.ok(accents.length>0,`${layout} has color accents`);
  for(const el of accents){for(const depth of ['1bit','2bit','4bit']){const classes=el.classList;assert.ok(classes.contains(`${depth}:text--black`)||classes.contains(`${depth}:bg--black`)||classes.contains(`${depth}:bg--white`),`${layout}: ${el.className} missing ${depth} fallback`);}if(el.classList.contains('bg--yellow'))assert.ok(el.classList.contains('text--black'),'yellow never carries low-contrast white text');}
  if(app==='what-changed'){assert.equal(w.document.querySelectorAll('.wc-card').length,layout==='full'?20:layout==='quadrant'?1:2);assert.ok(w.document.body.textContent.includes('NEW'));}
  if(app==='yc-scout')assert.equal(w.document.querySelectorAll('.sc-card').length,layout==='full'?10:layout==='quadrant'?1:2);
  if(app==='sounds-like-my-company'){assert.ok(w.document.body.textContent.includes('ECHO'));for(const img of w.document.querySelectorAll('img'))assert.ok(!img.classList.contains('image-dither'),'QR must not be dithered');}
  if(app==='desk-editor'){assert.ok(w.document.querySelector('img.image-dither'),'source photo adapts to device palette');assert.ok(w.document.body.textContent.includes(context.headline));}
  w.happyDOM.abort();
 }
});
for(const app of ['what-changed','yc-scout'])test(`${app}: palette toggle changes only preview colors and survives a content rerender`,async()=>{
 const w=new Window({url:'https://preview.example'});w.document.body.innerHTML=await readFile(`apps/${app}/public/index.html`,'utf8');
 const style=w.document.createElement('style');style.textContent=await readFile(`apps/${app}/public/style.css`,'utf8');w.document.head.append(style);
 w.eval(await readFile(`apps/${app}/public/palette.js`,'utf8'));
 const select=w.document.getElementById('ink'),screen=w.document.getElementById('screen');
 const heading=screen.querySelector(app==='what-changed'?'.screen-name':'.screen-head strong');
 const color=w.getComputedStyle(heading).color;assert.equal(color,'#d52f22');
 select.value='bw';select.dispatchEvent(new w.Event('change'));assert.match(w.getComputedStyle(heading).color,/^(#000|rgb\(0, 0, 0\))$/);
 screen.className='screen full';assert.equal(screen.dataset.ink,'bw');assert.match(w.getComputedStyle(heading).color,/^(#000|rgb\(0, 0, 0\))$/);
 select.value='color';select.dispatchEvent(new w.Event('change'));assert.equal(w.getComputedStyle(heading).color,color);
 w.happyDOM.abort();
});

for(const app of ['sounds-like-my-company','desk-editor'])test(`${app}: B&W preview retains black accents and readable photo/QR treatment`,async()=>{
 const w=new Window();w.document.body.innerHTML=await readFile(`apps/${app}/public/index.html`,'utf8');
 const style=w.document.createElement('style');style.textContent=await readFile(`apps/${app}/public/style.css`,'utf8');w.document.head.append(style);
 const screen=w.document.getElementById('screen');
 if(app==='desk-editor'){
  const heading=screen.querySelector('.screen-footer strong');assert.equal(w.getComputedStyle(heading).color,'#d52f22');
  screen.classList.add('mono');assert.equal(w.getComputedStyle(heading).color,'#000');
  assert.match(w.getComputedStyle(screen.querySelector('img')).filter,/grayscale\(1\)/);
 }else{
  screen.dataset.ink='bw';assert.equal(w.getComputedStyle(screen).getPropertyValue('--radar-red').trim(),'#000');
  assert.equal(w.getComputedStyle(screen).getPropertyValue('--radar-yellow').trim(),'#fff');
 }
 w.happyDOM.abort();
});
