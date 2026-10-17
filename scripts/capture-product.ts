/** Repeatable product captures from actual app UI, in a disposable browser context. */
import sharp from 'sharp';
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';

const browser=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{});
await mkdir('site/screenshots',{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:393,height:852},serviceWorkers:'block',locale:'en-US'});
 await page.goto('http://127.0.0.1:4173/app/');await page.locator('#mobile-app[data-ready=true]').waitFor();
 await page.addStyleTag({content:'#status{display:none!important}'});
 await page.getByRole('button',{name:'Save offline',exact:true}).click();await page.evaluate(()=>{const status=document.querySelector<HTMLElement>('#status');if(status){status.textContent='';delete status.dataset.visible;}window.scrollTo(0,0);});await page.locator('.home-world-canvas.is-visible').waitFor({timeout:10000});await page.waitForTimeout(1200);await page.screenshot({path:'site/screenshots/app-home.png',animations:'disabled'});await page.setViewportSize({width:1366,height:768});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(300);await page.screenshot({path:'site/screenshots/app-home-desktop.png',animations:'disabled'});await page.setViewportSize({width:393,height:852});
 await page.getByRole('button',{name:'Shelf',exact:true}).click();await page.locator('.book').first().waitFor();await page.waitForFunction(()=>!(document.querySelector('#books') as HTMLInputElement).disabled);
 await page.locator('#books').setInputFiles(['example/sela.txt','example/sela.md','example/sela.fb2']);
 await page.waitForFunction(()=>document.querySelectorAll('.book').length===4);await page.waitForFunction(()=>document.querySelector<HTMLElement>('#status')?.dataset.visible==='true');await page.evaluate(()=>{const status=document.querySelector<HTMLElement>('#status');if(status){status.textContent='';delete status.dataset.visible;}});
 await page.getByRole('button',{name:'Read Yang Tidak Ikut Pulang',exact:true}).click();await page.locator('.library-reader-overlay').waitFor();await page.getByRole('button',{name:'Back to library',exact:true}).click();await page.locator('.shelf-refine-toggle').click();await page.locator('#sort').selectOption('opened');await page.keyboard.press('Escape');await page.locator('.control-sheet[open]').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('.appearance-materials [data-palette-choice=white]').click();
 await page.getByRole('button',{name:'Shelf',exact:true}).click();
 await sharp(await page.screenshot({animations:'disabled'})).webp({quality:86}).toFile('site/screenshots/app-mobile.webp');
 await page.getByRole('button',{name:'Home',exact:true}).click();await page.evaluate(()=>window.scrollTo(0,0));await page.locator('.home-world-canvas.is-visible').waitFor({timeout:10000});await page.waitForTimeout(1100);await sharp(await page.screenshot({animations:'disabled'})).webp({quality:86}).toFile('site/screenshots/app-mobile.webp');
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('[data-palette-choice=white]').click();await page.evaluate(()=>{window.scrollTo(0,0);document.querySelector('#status').textContent='';});await page.screenshot({path:'site/screenshots/app-palettes.png',animations:'disabled'});
 await page.locator('[data-palette-choice=white]').click();await page.getByRole('button',{name:'Shelf',exact:true}).click();
 await page.setViewportSize({width:1366,height:768});await page.getByRole('button',{name:'Home',exact:true}).click();await page.evaluate(()=>window.scrollTo(0,0));await page.locator('.home-world-canvas.is-visible').waitFor({timeout:10000});await page.waitForTimeout(1100);await page.evaluate(async()=>{const storagePath='/library/storage.js',personalPath='/library/personal-store.js';const books=await(await import(storagePath)).listBooks();const {editPersonal}=await import(personalPath);editPersonal(p=>{p.queue=books.slice(0,2).map(book=>book.id);});});await page.waitForFunction(()=>document.querySelectorAll('.desk-book').length===2);
 await page.setViewportSize({width:1440,height:900});await writeFile('site/screenshots/app-desktop.webp',await sharp(await page.screenshot({animations:'disabled'})).webp({quality:86}).toBuffer());
 await page.goto('http://127.0.0.1:4173/');await sharp(await page.locator('.hero').screenshot({animations:'disabled'})).resize(1200,630,{fit:'contain',background:'#fff'}).png().toFile('site/social-sela.png');await page.screenshot({path:'site/screenshots/public-desktop.png',fullPage:true,animations:'disabled'});
} finally {await browser.close();}
