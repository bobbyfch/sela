import {chromium} from '@playwright/test';
import {mkdtemp,readFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const profile=await mkdtemp(join(tmpdir(),'sela-extension-test-'));
const extension=resolve('.git/sela-extension/chromium-newtab');
const context=await chromium.launchPersistentContext(profile,{headless:true,...(existsSync(edge)?{executablePath:edge}:{channel:'chromium'}),args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
try{
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const id=new URL(worker.url()).host;
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`chrome-extension://${id}/extension/library.html`);
 await page.locator('#books').setInputFiles([{name:'Offline story.pdf',mimeType:'application/pdf',buffer:await readFile('example/yang-tidak-ikut-pulang.pdf')},{name:'A second book.txt',mimeType:'text/plain',buffer:Buffer.from('A story beside another story.')}]);
 await page.locator('.cover img').waitFor();await page.waitForFunction(()=>!document.querySelector('#books').disabled);assert.equal(await page.locator('.book').count(),2);
 await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'Read Offline story',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.library-reader-footer input[type=range]')?.max==='50');
 await page.getByRole('button',{name:'Reading tools',exact:true}).click();await page.getByRole('button',{name:'12. Sebelum Rekaman Dimulai',exact:true}).waitFor();
 await page.getByRole('button',{name:'Close reader',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await page.locator('#language').click();await page.locator('#theme').click();await page.locator('#theme').click();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await mkdir('.git/sela-proof',{recursive:true});await page.screenshot({path:'.git/sela-proof/library-mobile.png',fullPage:true});
 await page.setViewportSize({width:1360,height:900});await page.screenshot({path:'.git/sela-proof/library-desktop.png',fullPage:true});
 const tab=await context.newPage();await tab.goto('chrome://newtab/');await tab.locator('#shelf').waitFor();assert(new URL(tab.url()).host===id);assert.equal(await tab.locator('.book').count(),2);
 assert.deepEqual(errors,[]);console.log('PASS actual extension: bundled CSP, local PDF/text import, real covers, offline reload/read/tools, saved shelf, mobile dark/ID and new-tab override.');
}finally{await context.close();}
// Keep the disposable profile path separate from user browser data; OS temporary cleanup owns it.
