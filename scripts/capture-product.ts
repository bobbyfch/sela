/** Capture the public page and the single Mantine app from a disposable browser context. */
import sharp from 'sharp';
import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{});
const baseUrl=(process.env.SELA_BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
await mkdir('site/screenshots',{recursive:true});
async function assertNoHorizontalOverflow(page,label){const size=await page.evaluate(()=>({viewport:window.innerWidth,document:document.documentElement.scrollWidth}));if(size.document>size.viewport)throw new Error(`${label} overflows horizontally: ${size.document}px > ${size.viewport}px`);}
try {
 const page=await browser.newPage({viewport:{width:1440,height:960},serviceWorkers:'block',locale:'en-US'});
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({theme:'vanilla',language:'en',finish:'oak',density:2,widgets:{calendar:true,reflection:true},defaultTextMode:'scroll',defaultPageMode:'book'})));
 await page.goto(`${baseUrl}/app/`);await page.locator('#sela-root .sela-app').waitFor();
 const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Add books'}).click();await (await chooser).setFiles(['example/sela.md','example/yang-tidak-ikut-pulang.epub']);
 await page.locator('.book-card').first().waitFor();await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
 await page.evaluate(()=>document.querySelector<HTMLButtonElement>('.mantine-Notification-closeButton')?.click());
 await page.screenshot({path:'site/screenshots/app-home-desktop.png',animations:'disabled'});
 await sharp(await page.screenshot({animations:'disabled'})).webp({quality:86}).toFile('site/screenshots/app-desktop.webp');
 await page.locator('.book-title-button').filter({hasText:'yang-tidak-ikut-pulang'}).first().click();
 await page.locator('.library-reader-close').waitFor({state:'visible'});
 await page.waitForFunction(()=>!document.querySelector('.reader-loading'));
 await page.waitForTimeout(450);
 await assertNoHorizontalOverflow(page,'Desktop reader');
 await page.screenshot({path:'site/screenshots/app-reader-desktop.png',animations:'disabled'});
 await page.setViewportSize({width:393,height:852});
 await assertNoHorizontalOverflow(page,'Mobile reader');
 await page.screenshot({path:'site/screenshots/app-reader-mobile.png',animations:'disabled'});
 await page.locator('.library-reader-close').click();
 await page.waitForURL('**/#/shelf');
 await page.setViewportSize({width:1440,height:960});
 const routes=[['My shelf','app-shelf-desktop.png'],['Discover','app-explore-desktop.png'],['Reading log','app-progress-desktop.png'],['Settings','app-settings-desktop.png']] as const;
 for(const [label,file] of routes){await page.getByRole('link',{name:label,exact:true}).first().click();await page.locator('.page-title').waitFor();await page.evaluate(()=>window.scrollTo(0,0));await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});await assertNoHorizontalOverflow(page,`Desktop ${label}`);await page.screenshot({path:`site/screenshots/${file}`,animations:'disabled'});if(label==='My shelf'){await page.locator('.shelf-view-toggle label').nth(1).click();await page.locator('.shelf-room canvas').waitFor({state:'visible'});await page.waitForTimeout(900);await assertNoHorizontalOverflow(page,'Desktop bookshelf');await page.screenshot({path:'site/screenshots/app-shelf-room-desktop.png',animations:'disabled'});await page.locator('.shelf-view-toggle label').nth(0).click();}}
 await page.locator('.settings-row').first().click();await page.locator('.settings-detail').waitFor();await page.screenshot({path:'site/screenshots/app-appearance-desktop.png',animations:'disabled'});
 await page.getByRole('button',{name:'Back',exact:true}).click();await page.locator('.settings-row').first().click();await page.getByRole('combobox',{name:'Reading room theme'}).click();await page.getByRole('option',{name:'Cocoa paper'}).click();await page.screenshot({path:'site/screenshots/app-palettes.png',animations:'disabled'});await page.getByRole('button',{name:'Back',exact:true}).click();await page.getByRole('link',{name:'Today',exact:true}).first().click();
 await page.setViewportSize({width:393,height:852});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'site/screenshots/app-home.png',animations:'disabled'});
 await assertNoHorizontalOverflow(page,'Mobile Today');
 await sharp(await page.screenshot({animations:'disabled'})).webp({quality:86}).toFile('site/screenshots/app-mobile.webp');
 await page.locator('.mobile-dock').getByRole('link',{name:'My shelf',exact:true}).click();await page.evaluate(()=>window.scrollTo(0,0));await assertNoHorizontalOverflow(page,'Mobile shelf');await page.screenshot({path:'site/screenshots/app-shelf-mobile.png',animations:'disabled'});await page.locator('.shelf-view-toggle label').nth(1).click();await page.locator('.shelf-room canvas').waitFor({state:'visible'});await page.waitForTimeout(900);await assertNoHorizontalOverflow(page,'Mobile bookshelf');await page.screenshot({path:'site/screenshots/app-shelf-room-mobile.png',animations:'disabled'});
 for(const [label,route,file] of [['Discover','discover','app-explore-mobile.png'],['Reading log','progress','app-progress-mobile.png'],['Settings','settings','app-settings-mobile.png']] as const){await page.locator('.mobile-dock').getByRole('link',{name:label,exact:true}).click();await page.waitForFunction(value=>location.hash.includes(value),route);await page.evaluate(()=>window.scrollTo(0,0));await page.locator('.page-title').waitFor();await assertNoHorizontalOverflow(page,`Mobile ${label}`);await page.screenshot({path:`site/screenshots/${file}`,animations:'disabled'});}
 await page.goto(`${baseUrl}/`);await page.locator('.hero').waitFor();await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
 await sharp(await page.locator('.hero').screenshot({animations:'disabled'})).resize(1200,630,{fit:'contain',background:'#fff'}).png().toFile('site/social-sela.png');
 await page.screenshot({path:'site/screenshots/public-home-desktop.png',animations:'disabled'});await page.screenshot({path:'site/screenshots/public-desktop.png',fullPage:true,animations:'disabled'});
} finally {await browser.close();}
