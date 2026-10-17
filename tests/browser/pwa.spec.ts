import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
async function routePwaFixture(page,prefix:string){
 await page.route(`**/${prefix}/mobile/pwa.js`,async route=>route.fulfill({contentType:'application/javascript',body:await readFile('mobile/pwa.js','utf8')}));
 await page.route(`**/${prefix}/library/controls.js`,async route=>route.fulfill({contentType:'application/javascript',body:await readFile('library/controls.js','utf8')}));
 await page.route(`**/${prefix}/dist/source/src/i18n.js`,async route=>route.fulfill({contentType:'application/javascript',body:await readFile('dist/source/src/i18n.js','utf8')}));
 await page.route(`**/${prefix}/dist/source/src/locale.js`,async route=>route.fulfill({contentType:'application/javascript',body:await readFile('dist/source/src/locale.js','utf8')}));
 await page.route(`**/${prefix}/library/version.js`,async route=>route.fulfill({contentType:'application/javascript',body:await readFile('library/version.js','utf8')}));
}
test('public and installed app manifests point to refreshed Sela artwork',async({page})=>{
 const revision='0.9.0-beta.4';
 await page.goto('/');
 await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href',`favicon.svg?v=${revision}`);
 await expect(page.locator('a.brand img')).toHaveAttribute('src',`logo.svg?v=${revision}`);
 await page.goto('/app/');
 await expect(page.locator('.brand-logo')).toHaveAttribute('src',`../logo.svg?v=${revision}`);
 for(const manifestPath of ['/manifest.webmanifest','/app/manifest.webmanifest','/mobile/manifest.webmanifest']){
  const response=await page.request.get(`${manifestPath}?v=${revision}`);
  expect(response.ok(),`${manifestPath} should be available`).toBeTruthy();
  const manifest=await response.json();
  expect(manifest.icons).toHaveLength(3);
  for(const icon of manifest.icons){
   expect(icon.src).toContain(`?v=${revision}`);
   const image=await page.request.get(new URL(icon.src,response.url()).href);
   expect(image.ok(),`${manifestPath} icon ${icon.sizes} should be available`).toBeTruthy();
   expect(image.headers()['content-type']).toContain('image/png');
  }
 }
});
test.use({serviceWorkers:'allow',userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36'});
test('mobile PWA registration stays within its project subfolder',async({page})=>{
 await page.route('**/nested/mobile/index.html',route=>route.fulfill({contentType:'text/html',body:'<button id="install-mobile-app"></button><p id="mobile-offline-status"></p><script type="module" src="./pwa.js"></script>'}));
 await routePwaFixture(page,'nested');
 await page.addInitScript(()=>{window.SelaPlatform={mobile:true} as typeof SelaPlatform;Object.defineProperty(navigator,'serviceWorker',{value:{addEventListener(){},ready:Promise.resolve({}),register(url,options){window.registration={url:String(url),scope:options.scope};return Promise.resolve({addEventListener(){},update(){return Promise.resolve();}});}}});});
 await page.goto('/nested/mobile/index.html');await expect(page.locator('#mobile-offline-status')).toContainText('Bookshelf ready');
 expect(await page.evaluate(()=>window.registration)).toEqual({url:'http://127.0.0.1:4173/nested/mobile/sw.js',scope:'http://127.0.0.1:4173/nested/mobile/'});
});
test('mobile app persists local books offline outside service-worker caches',async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Service-worker offline scenario is verified on Chromium');await page.goto('/mobile/');await expect(page.locator('#mobile-offline-status')).toContainText('Bookshelf ready');await page.reload();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await page.locator('[data-tab=library]').click();
 await page.locator('#books').setInputFiles({name:'private-note.txt',mimeType:'text/plain',buffer:Buffer.from('Local mobile note survives offline.')});await expect(page.locator('.book')).toHaveCount(1);await expect(page.locator('#books')).toBeEnabled();
 await context.setOffline(true);await page.reload();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await page.locator('[data-tab=library]').click();await expect(page.locator('.book')).toHaveCount(1);await page.locator('.cover').click();await page.getByRole('dialog',{name:'Book information',exact:true}).getByRole('button',{name:'Read this book',exact:true}).click();await expect(page.locator('.sela-epub article')).toContainText('survives offline');
 const keys=await page.evaluate(async()=>{const names=await caches.keys();return(await Promise.all(names.map(async name=>(await(await caches.open(name)).keys()).map(r=>r.url)))).flat();});expect(keys.some(url=>url.includes('private-note')||url.startsWith('blob:'))).toBe(false);
});

test('update notice names both the ready version and the installed version',async({page})=>{
 await page.route('**/update/mobile/index.html',route=>route.fulfill({contentType:'text/html',body:'<p id="mobile-offline-status"></p><button id="check-update"></button><p id="update-status"></p><script type="module" src="./pwa.js"></script>'}));
 await routePwaFixture(page,'update');
 await page.addInitScript(()=>{window.sent=[];window.swEvents={};Object.defineProperty(navigator,'serviceWorker',{value:{controller:{},ready:Promise.resolve({}),addEventListener(name,callback){window.swEvents[name]=callback;},register(){return Promise.resolve({waiting:{postMessage(data,ports){window.sent.push(data);if(data.type==='GET_VERSION')ports?.[0]?.postMessage({type:'SELA_VERSION',version:'0.9.0-beta.5'});}},addEventListener(){},update(){return Promise.resolve();}});}}});});
 await page.goto('/update/mobile/index.html');await expect(page.locator('.pwa-notice')).toContainText('Sela 0.9.0-beta.5 is ready');await expect(page.locator('.pwa-notice')).toContainText('Installed version: 0.9.0-beta.4');await expect.poll(()=>page.evaluate(()=>sent.filter(message=>message.type==='GET_VERSION').length)).toBe(1);
 await page.evaluate(()=>{const reader=document.createElement('div');reader.className='library-reader-overlay';document.body.append(reader);});await page.getByRole('button',{name:'Update now',exact:true}).click();await expect(page.locator('.pwa-notice')).toContainText('Close the reader');expect(await page.evaluate(()=>sent.filter(message=>message.type==='ACTIVATE_UPDATE'))).toEqual([]);
 await page.evaluate(()=>document.querySelector('.library-reader-overlay').remove());await page.getByRole('button',{name:'Update now',exact:true}).click();await expect.poll(()=>page.evaluate(()=>sent.filter(message=>message.type==='ACTIVATE_UPDATE').length)).toBe(1);
 await page.evaluate(()=>swEvents.message({data:{type:'UPDATE_BLOCKED'}}));await expect(page.locator('.pwa-notice')).toContainText('Close other Sela windows');await page.getByRole('button',{name:'Later',exact:true}).click();await expect(page.locator('.pwa-notice')).toBeHidden();
});

test('the mobile app does not add its own install invitation or intercept the browser prompt',async({page})=>{
 await page.route('**/install-state/mobile/index.html',route=>route.fulfill({contentType:'text/html',body:'<main><h1>Sela Books</h1><p id="mobile-offline-status"></p><script type="module" src="./pwa.js"></script></main>'}));
 await routePwaFixture(page,'install-state');
 await page.addInitScript(()=>{Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{addEventListener(){},ready:Promise.resolve({}),register(){return Promise.resolve({addEventListener(){},update(){return Promise.resolve();}});}}});});
 await page.goto('/install-state/mobile/index.html');
 await expect(page.getByRole('button',{name:/install/i})).toHaveCount(0);await expect(page.getByText(/pasang sela di perangkat ini/i)).toHaveCount(0);await expect(page.locator('.pwa-notice:visible,.install-guide:visible')).toHaveCount(0);
 const prevented=await page.evaluate(()=>{const event=new Event('beforeinstallprompt',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;});expect(prevented).toBe(false);
});
