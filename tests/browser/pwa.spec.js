import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test.use({serviceWorkers:'allow'});
test('PWA registration stays within a project subfolder',async({page})=>{
 await page.route('**/nested/reader/index.html',route=>route.fulfill({contentType:'text/html',body:'<button id="install-app" hidden></button><p id="offline-status"></p><script type="module" src="./site/pwa.js"></script>'}));
 await page.route('**/nested/reader/site/pwa.js',async route=>route.fulfill({contentType:'application/javascript',body:await readFile('site/pwa.js','utf8')}));
 await page.addInitScript(()=>Object.defineProperty(navigator,'serviceWorker',{value:{ready:Promise.resolve({}),register(url,options){window.registration={url:String(url),scope:options.scope};return Promise.resolve({addEventListener(){}});}}}));
 await page.goto('/nested/reader/index.html');
 await expect(page.locator('#offline-status')).toContainText('Viewer ready');
 expect(await page.evaluate(()=>window.registration)).toEqual({url:'http://127.0.0.1:4173/nested/reader/sela-sw.js',scope:'http://127.0.0.1:4173/nested/reader/'});
});
test('PWA caches the shell and text adapter but never user documents',async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Service-worker offline scenario is verified on Chromium');await page.goto('/?geo=off');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
 await page.locator('#pdf-file').setInputFiles({name:'private-note.txt',mimeType:'text/plain',buffer:Buffer.from('This local note must never enter the asset cache.')});await page.locator('.launch-reader').click();await expect(page.locator('.flippy-epub article')).toContainText('This local note');await page.keyboard.press('Escape');
 await expect.poll(()=>page.evaluate(async()=>{const keys=await caches.keys();return keys.some(key=>key.startsWith('sela-viewer-'));})).toBe(true);
 await context.setOffline(true);await page.reload();await page.locator('#pdf-file').setInputFiles({name:'offline.txt',mimeType:'text/plain',buffer:Buffer.from('Local offline reading works.')});await page.locator('.launch-reader').click();await expect(page.locator('.flippy-epub article')).toContainText('offline reading');
 const keys=await page.evaluate(async()=>{const names=await caches.keys();return (await Promise.all(names.map(async name=>(await (await caches.open(name)).keys()).map(r=>r.url)))).flat();});expect(keys.some(url=>url.includes('private-note')||url.startsWith('blob:')||url.includes('/extension/'))).toBe(false);
});
