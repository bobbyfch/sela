import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test.use({serviceWorkers:'allow',userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36'});
test('mobile PWA registration stays within its project subfolder',async({page})=>{
 await page.route('**/nested/mobile/index.html',route=>route.fulfill({contentType:'text/html',body:'<button id="install-mobile-app"></button><p id="mobile-offline-status"></p><script type="module" src="./pwa.js"></script>'}));
 await page.route('**/nested/mobile/pwa.js',async route=>route.fulfill({contentType:'application/javascript',body:await readFile('mobile/pwa.js','utf8')}));
 await page.addInitScript(()=>{window.SelaPlatform={mobile:true};Object.defineProperty(navigator,'serviceWorker',{value:{ready:Promise.resolve({}),register(url,options){window.registration={url:String(url),scope:options.scope};return Promise.resolve({});}}});});
 await page.goto('/nested/mobile/index.html');await expect(page.locator('#mobile-offline-status')).toContainText('Bookshelf ready');
 expect(await page.evaluate(()=>window.registration)).toEqual({url:'http://127.0.0.1:4173/nested/mobile/sw.js',scope:'http://127.0.0.1:4173/nested/mobile/'});
});
test('mobile app persists local books offline outside service-worker caches',async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Service-worker offline scenario is verified on Chromium');await page.goto('/mobile/');await expect(page.locator('#mobile-offline-status')).toContainText('Bookshelf ready');await page.reload();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await page.locator('[data-tab=library]').click();
 await page.locator('#books').setInputFiles({name:'private-note.txt',mimeType:'text/plain',buffer:Buffer.from('Local mobile note survives offline.')});await expect(page.locator('.book')).toHaveCount(1);await expect(page.locator('#books')).toBeEnabled();
 await context.setOffline(true);await page.reload();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await page.locator('[data-tab=library]').click();await expect(page.locator('.book')).toHaveCount(1);await page.getByRole('button',{name:'Read private-note',exact:true}).click();await expect(page.locator('.flippy-epub article')).toContainText('survives offline');
 const keys=await page.evaluate(async()=>{const names=await caches.keys();return(await Promise.all(names.map(async name=>(await(await caches.open(name)).keys()).map(r=>r.url)))).flat();});expect(keys.some(url=>url.includes('private-note')||url.startsWith('blob:'))).toBe(false);
});
