import {test,expect} from '@playwright/test';
test.use({serviceWorkers:'allow'});
test('PWA caches the shell and text adapter but never user documents',async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Service-worker offline scenario is verified on Chromium');await page.goto('/?geo=off');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
 await page.locator('#pdf-file').setInputFiles({name:'private-note.txt',mimeType:'text/plain',buffer:Buffer.from('This local note must never enter the asset cache.')});await page.locator('.launch-reader').click();await expect(page.locator('.flippy-epub article')).toContainText('This local note');await page.keyboard.press('Escape');
 await expect.poll(()=>page.evaluate(async()=>{const keys=await caches.keys();return keys.some(key=>key.startsWith('sela-viewer-'));})).toBe(true);
 await context.setOffline(true);await page.reload();await page.locator('#pdf-file').setInputFiles({name:'offline.txt',mimeType:'text/plain',buffer:Buffer.from('Local offline reading works.')});await page.locator('.launch-reader').click();await expect(page.locator('.flippy-epub article')).toContainText('offline reading');
 const keys=await page.evaluate(async()=>{const names=await caches.keys();return (await Promise.all(names.map(async name=>(await (await caches.open(name)).keys()).map(r=>r.url)))).flat();});expect(keys.some(url=>url.includes('private-note')||url.startsWith('blob:')||url.includes('/extension/'))).toBe(false);
});
