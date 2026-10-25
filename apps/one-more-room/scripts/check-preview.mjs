import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {Liquid} from 'liquidjs';
import assert from 'node:assert/strict';
import {newCampaign,advance,view} from '../public/game.js';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
const results=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1300},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/');await page.locator('.q-tile').first().waitFor();
 await page.getByRole('button',{name:'Ⅱ Pause',exact:true}).click();
 assert.equal(await page.locator('.q-auto').count(),1);
 const turn=await page.locator('.q-header-meta').innerText();await page.getByRole('button',{name:'Next action',exact:false}).click();assert.notEqual(await page.locator('.q-header-meta').innerText(),turn);
 await page.getByRole('button',{name:'Black & white',exact:true}).click();assert.equal(await page.locator('#screen').evaluate(e=>e.classList.contains('q-mono')),true);
 await page.getByRole('button',{name:'Color',exact:true}).click();
 await page.screenshot({path:'artifacts/website-desktop.png',fullPage:true});
 await page.locator('#screen').screenshot({path:'artifacts/game-full.png'});
 await page.getByRole('button',{name:'Journey log ↗'}).click();assert.ok(await page.locator('#journalEntries li').count()>1);await page.getByRole('button',{name:'Close',exact:true}).last().click();
 const prior=await page.locator('.q-header-meta').innerText();await page.reload();await page.locator('.q-tile').first().waitFor();assert.equal(await page.locator('.q-header-meta').innerText(),prior);
 await page.getByRole('button',{name:'New expedition ↺'}).click();await page.locator('#seed').fill('moonwell');await page.locator('#style').selectOption('careful');await page.getByRole('button',{name:'Begin expedition →'}).click();assert.match(await page.locator('#saveNote').innerText(),/moonwell/);
 const choice=page.locator('.q-choice').last();await choice.click();assert.match(await page.locator('.q-header-meta').innerText(),/TURN 2/);
 results.push({check:'desktop controls, manual action, palette, journal, save/reload, seeded expedition',passed:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/website-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);results.push({check:'390px mobile page has no horizontal overflow',passed:true});
 // Verify actual Liquid output at native pixel dimensions without touching user browser/app state.
 const raw=await readFile('trmnl/shared.liquid','utf8'),templates=new Map([...raw.matchAll(/{% template (\w+) %}([\s\S]*?){% endtemplate %}/g)].map(m=>[m[1],m[2]]));
 const common=raw.replace(/{% template \w+ %}[\s\S]*?{% endtemplate %}/g,'');
 const liquid=new Liquid({relativeReference:false,fs:{exists:async p=>templates.has(p),existsSync:p=>templates.has(p),readFile:async p=>templates.get(p),readFileSync:p=>templates.get(p),resolve:(r,f)=>f,dirname:()=>'.'}});
 let state=newCampaign('lantern');for(let i=0;i<8;i++)state=advance(state);
 for(const [layout,w,h]of [['full',800,480],['half_horizontal',800,240],['half_vertical',400,480],['quadrant',400,240]])for(const palette of ['color','bw']){
  const html=await liquid.parseAndRender(common+await readFile('trmnl/'+layout+'.liquid','utf8'),{...view(state),status:'Autopilot'});
  await page.setViewportSize({width:w,height:h});await page.setContent('<style>html,body{margin:0;width:100%;height:100%}.native{width:100%;height:100%}</style><div class="native '+(palette==='bw'?'screen--1bit':'screen--color-red-yellow')+'">'+html+'</div>');
  const geometry=await page.evaluate(()=>Object.fromEntries(['.quest','.q-body','.q-left','.q-right','.q-party','.q-choices'].map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return [s,{x:r.x,y:r.y,width:r.width,height:r.height,scroll:e.scrollHeight,client:e.clientHeight}];})));
  results.push({layout,palette,geometry});
  for(const side of ['.q-left','.q-right'])assert.ok(geometry[side].scroll-geometry[side].client<=1,layout+' '+side+' content clipped');
  await page.screenshot({path:'artifacts/native-'+layout+'-'+palette+'.png'});
 }
 const samples=new Map();let campaign=newCampaign('long winter');for(let i=0;i<500;i++){campaign=advance(campaign);const v=view(campaign),key=v.kind+':'+v.safe;if(!samples.has(key)||samples.get(key).text.length<v.text.length)samples.set(key,v);}
 const fitting=[];
 for(const [kind,v]of samples)for(const [layout,w,h]of [['full',800,480],['half_horizontal',800,240],['half_vertical',400,480],['quadrant',400,240]]){
  const html=await liquid.parseAndRender(common+await readFile('trmnl/'+layout+'.liquid','utf8'),{...v,status:'Autopilot'});
  await page.setViewportSize({width:w,height:h});await page.setContent('<style>html,body{margin:0;width:100%;height:100%}.native{width:100%;height:100%}</style><div class="native">'+html+'</div>');
  const overflow=await page.evaluate(()=>[...document.querySelectorAll('.q-left,.q-right')].map(el=>el.scrollHeight-el.clientHeight));
  if(overflow.some(n=>n>1))fitting.push({kind,layout,overflow});
 }
 results.push({check:'all room types, longest scene text, all four dimensions',samples:samples.size*4,clipped:fitting});
 assert.deepEqual(fitting,[],'room types must fit their frame');
 assert.deepEqual(errors,[]);await writeFile('artifacts/qa.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({checks:results.length,errors,geometry:results.filter(r=>r.geometry).map(r=>({layout:r.layout,palette:r.palette,leftOverflow:r.geometry['.q-left'].scroll-r.geometry['.q-left'].client,rightOverflow:r.geometry['.q-right'].scroll-r.geometry['.q-right'].client}))},null,2));
}finally{await browser.close();}
