import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test.use({serviceWorkers:'allow',userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36'});
test('mobile PWA registration stays within its project subfolder',async({page})=>{
 await page.route('**/nested/mobile/index.html',route=>route.fulfill({contentType:'text/html',body:'<button id="install-mobile-app"></button><p id="mobile-offline-status"></p><script type="module" src="./pwa.js"></script>'}));
 await page.route('**/nested/mobile/pwa.js',async route=>route.fulfill({contentType:'application/javascript',body:await readFile('mobile/pwa.js','utf8')}));
 await page.addInitScript(()=>{window.SelaPlatform={mobile:true};Object.defineProperty(navigator,'serviceWorker',{value:{addEventListener(){},ready:Promise.resolve({}),register(url,options){window.registration={url:String(url),scope:options.scope};return Promise.resolve({addEventListener(){},update(){return Promise.resolve();}});}}});});
 await page.goto('/nested/mobile/index.html');await expect(page.locator('#mobile-offline-status')).toContainText('Bookshelf ready');
 expect(await page.evaluate(()=>window.registration)).toEqual({url:'http://127.0.0.1:4173/nested/mobile/sw.js',scope:'http://127.0.0.1:4173/nested/mobile/'});
});
test('mobile app persists local books offline outside service-worker caches',async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Service-worker offline scenario is verified on Chromium');await page.goto('/mobile/');await expect(page.locator('#mobile-offline-status')).toContainText('Bookshelf ready');await page.reload();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await page.locator('[data-tab=library]').click();
 await page.locator('#books').setInputFiles({name:'private-note.txt',mimeType:'text/plain',buffer:Buffer.from('Local mobile note survives offline.')});await expect(page.locator('.book')).toHaveCount(1);await expect(page.locator('#books')).toBeEnabled();
 await context.setOffline(true);await page.reload();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await page.locator('[data-tab=library]').click();await expect(page.locator('.book')).toHaveCount(1);await page.getByRole('button',{name:'Read private-note',exact:true}).click();await expect(page.locator('.sela-epub article')).toContainText('survives offline');
 const keys=await page.evaluate(async()=>{const names=await caches.keys();return(await Promise.all(names.map(async name=>(await(await caches.open(name)).keys()).map(r=>r.url)))).flat();});expect(keys.some(url=>url.includes('private-note')||url.startsWith('blob:'))).toBe(false);
});

test('waiting update requires a safe moment and another window can block activation',async({page})=>{
 await page.route('**/update/mobile/index.html',route=>route.fulfill({contentType:'text/html',body:'<button id="install-mobile-app"></button><p id="mobile-offline-status"></p><button id="check-update"></button><p id="update-status"></p><script type="module" src="./pwa.js"></script>'}));
 await page.route('**/update/mobile/pwa.js',async route=>route.fulfill({contentType:'application/javascript',body:await readFile('mobile/pwa.js','utf8')}));
 await page.addInitScript(()=>{window.sent=[];window.swEvents={};Object.defineProperty(navigator,'serviceWorker',{value:{controller:{},ready:Promise.resolve({}),addEventListener(name,callback){window.swEvents[name]=callback;},register(){return Promise.resolve({waiting:{postMessage(data){window.sent.push(data);}},addEventListener(){},update(){return Promise.resolve();}});}}});});
 await page.goto('/update/mobile/index.html');await expect(page.locator('.pwa-notice')).toContainText('An update is ready');
 await page.evaluate(()=>{const reader=document.createElement('div');reader.className='library-reader-overlay';document.body.append(reader);});await page.getByRole('button',{name:'Update now',exact:true}).click();await expect(page.locator('.pwa-notice')).toContainText('Close the reader');expect(await page.evaluate(()=>sent)).toEqual([]);
 await page.evaluate(()=>document.querySelector('.library-reader-overlay').remove());await page.getByRole('button',{name:'Update now',exact:true}).click();expect(await page.evaluate(()=>sent)).toEqual([{type:'ACTIVATE_UPDATE'}]);
 await page.evaluate(()=>swEvents.message({data:{type:'UPDATE_BLOCKED'}}));await expect(page.locator('.pwa-notice')).toContainText('Close other Sela windows');await page.getByRole('button',{name:'Later',exact:true}).click();await expect(page.locator('.pwa-notice')).toBeHidden();
});
