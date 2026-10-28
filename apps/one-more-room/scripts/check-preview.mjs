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
 await page.route('https://one-more-room-trmnl.vercel.app/art/**',async route=>{const name=new URL(route.request().url()).pathname.split('/').pop();await route.fulfill({path:'public/art/'+name});});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/');await page.locator('.q-waypoint').first().waitFor();
 await page.getByRole('button',{name:'Ⅱ Pause',exact:true}).click();
 assert.equal(await page.locator('.q-auto').count(),1);
 const turn=await page.locator('.q-header-meta').innerText();await page.getByRole('button',{name:'Next action',exact:false}).click();assert.notEqual(await page.locator('.q-header-meta').innerText(),turn);
 await page.getByRole('button',{name:'Black & white',exact:true}).click();assert.equal(await page.locator('#screen').evaluate(e=>e.classList.contains('q-mono')),true);
 await page.getByRole('button',{name:'Color',exact:true}).click();
 await page.screenshot({path:'artifacts/website-desktop.png',fullPage:true});
 await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
 await page.locator('#screen').screenshot({path:'artifacts/game-full.png'});
 await page.getByRole('button',{name:'Journey log ↗'}).click();assert.ok(await page.locator('#journalEntries li').count()>1);await page.getByRole('button',{name:'Close',exact:true}).last().click();
 const prior=await page.locator('.q-header-meta').innerText();await page.reload();await page.locator('.q-waypoint').first().waitFor();assert.equal(await page.locator('.q-header-meta').innerText(),prior);
 await page.getByRole('button',{name:'New expedition ↺'}).click();await page.locator('#seed').fill('moonwell');await page.locator('#style').selectOption('careful');await page.getByRole('button',{name:'Begin expedition →'}).click();assert.match(await page.locator('#saveNote').innerText(),/moonwell/);
 const choice=page.locator('.q-choice').last();await choice.click();assert.match(await page.locator('.q-header-meta').innerText(),/TURN 2/);
 await page.locator('#mapMode').selectOption('world');assert.equal(await page.locator('.q-atlas-world').count(),1);await page.locator('#mapMode').selectOption('dungeon');assert.equal(await page.locator('.q-atlas-dungeon').count(),1);await page.locator('#mapMode').selectOption('auto');
 results.push({check:'desktop controls, manual action, palette, journal, save/reload, seeded expedition',passed:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/website-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);results.push({check:'390px mobile page has no horizontal overflow',passed:true});
 // Recipe markup now depends on the native Framework runtime. Its old standalone
 // browser-CSS geometry assertions cannot verify the new layouts. Use official
 // TRMNL OG/X previews for native QA; the Node Liquid tests cover content/escaping.
 results.push({check:'native Recipe OG/X visual QA',status:'pending official Framework previews'});
 assert.deepEqual(errors,[]);await writeFile('artifacts/qa.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({checks:results.length,errors,nativeQa:'pending'},null,2));
}finally{await browser.close();}
