import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
async function routePwaFixture(page,prefix:string){
 await page.route(`**/${prefix}/mobile/pwa.js`,async route=>route.fulfill({contentType:'application/javascript',body:await readFile('mobile/pwa.js','utf8')}));
 await page.route(`**/${prefix}/library/controls.js`,async route=>route.fulfill({contentType:'application/javascript',body:await readFile('library/controls.js','utf8')}));
 await page.route(`**/${prefix}/dist/source/src/i18n.js`,async route=>route.fulfill({contentType:'application/javascript',body:await readFile('dist/source/src/i18n.js','utf8')}));
 await page.route(`**/${prefix}/dist/source/src/locale.js`,async route=>route.fulfill({contentType:'application/javascript',body:await readFile('dist/source/src/locale.js','utf8')}));
}
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
 await context.setOffline(true);await page.reload();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await page.locator('[data-tab=library]').click();await expect(page.locator('.book')).toHaveCount(1);await page.getByRole('button',{name:'Read private-note',exact:true}).click();await expect(page.locator('.sela-epub article')).toContainText('survives offline');
 const keys=await page.evaluate(async()=>{const names=await caches.keys();return(await Promise.all(names.map(async name=>(await(await caches.open(name)).keys()).map(r=>r.url)))).flat();});expect(keys.some(url=>url.includes('private-note')||url.startsWith('blob:'))).toBe(false);
});

test('waiting update requires a safe moment and another window can block activation',async({page})=>{
 await page.route('**/update/mobile/index.html',route=>route.fulfill({contentType:'text/html',body:'<button id="install-mobile-app"></button><p id="mobile-offline-status"></p><button id="check-update"></button><p id="update-status"></p><script type="module" src="./pwa.js"></script>'}));
 await routePwaFixture(page,'update');
 await page.addInitScript(()=>{window.sent=[];window.swEvents={};Object.defineProperty(navigator,'serviceWorker',{value:{controller:{},ready:Promise.resolve({}),addEventListener(name,callback){window.swEvents[name]=callback;},register(){return Promise.resolve({waiting:{postMessage(data){window.sent.push(data);}},addEventListener(){},update(){return Promise.resolve();}});}}});});
 await page.goto('/update/mobile/index.html');await expect(page.locator('.pwa-notice')).toContainText('An update is ready');
 await page.evaluate(()=>{const reader=document.createElement('div');reader.className='library-reader-overlay';document.body.append(reader);});await page.getByRole('button',{name:'Update now',exact:true}).click();await expect(page.locator('.pwa-notice')).toContainText('Close the reader');expect(await page.evaluate(()=>sent)).toEqual([]);
 await page.evaluate(()=>document.querySelector('.library-reader-overlay').remove());await page.getByRole('button',{name:'Update now',exact:true}).click();expect(await page.evaluate(()=>sent)).toEqual([{type:'ACTIVATE_UPDATE'}]);
 await page.evaluate(()=>swEvents.message({data:{type:'UPDATE_BLOCKED'}}));await expect(page.locator('.pwa-notice')).toContainText('Close other Sela windows');await page.getByRole('button',{name:'Later',exact:true}).click();await expect(page.locator('.pwa-notice')).toBeHidden();
});

test('browser install prompt records successful installation and hides future invitations',async({page})=>{
 await page.route('**/install-state/mobile/index.html',route=>route.fulfill({contentType:'text/html',body:'<button id="install-mobile-app">Install</button><p id="mobile-offline-status"></p><script type="module" src="./pwa.js"></script>'}));
 await routePwaFixture(page,'install-state');
 await page.addInitScript(()=>{Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{addEventListener(){},ready:Promise.resolve({}),register(){return Promise.resolve({addEventListener(){},update(){return Promise.resolve();}});}}});});
 await page.goto('/install-state/mobile/index.html');const button=page.locator('#install-mobile-app');await expect(button).toBeVisible();
 await page.evaluate(()=>{const event=new Event('beforeinstallprompt',{cancelable:true}) as Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'}>};event.prompt=async()=>{};event.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(event);});
 await button.click();await expect(button).toBeHidden();expect(await page.evaluate(()=>localStorage.getItem('sela-installed'))).toBe('true');await page.reload();await expect(button).toBeHidden();
});

test('Firefox Windows install help names its native Web Apps route',async({page})=>{
 await page.route('**/firefox-install/mobile/index.html',route=>route.fulfill({contentType:'text/html',body:'<button id="install-mobile-app">Install</button><p id="mobile-offline-status"></p><script type="module" src="./pwa.js"></script>'}));
 await routePwaFixture(page,'firefox-install');
 await page.addInitScript(()=>{Object.defineProperty(navigator,'userAgent',{configurable:true,value:'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0'});Object.defineProperty(navigator,'platform',{configurable:true,value:'Win32'});Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{addEventListener(){},ready:Promise.resolve({}),register(){return Promise.resolve({addEventListener(){},update(){return Promise.resolve();}});}}});});
 await page.goto('/firefox-install/mobile/index.html');await page.getByRole('button',{name:'Install',exact:true}).click();const guide=page.locator('.install-guide');await expect(guide).toContainText('Firefox for Windows 143 or newer (150 or newer when installed from the Microsoft Store)');await expect(guide).toContainText('Detected browser: Firefox · Windows');
});

test('install guidance detects major browser and operating-system combinations',async({page})=>{
 const cases=[
  {id:'chrome-win',ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',platform:'Win32',name:'Chrome · Windows',help:'Install Sela or Install page as app'},
  {id:'edge-mac',ua:'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',platform:'MacIntel',name:'Edge · macOS',help:'choose Apps'},
  {id:'safari-iphone',ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',platform:'iPhone',name:'Safari · iOS',help:'Share menu'},
  {id:'safari-mac',ua:'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',platform:'MacIntel',name:'Safari · macOS',help:'File → Add to Dock'},
  {id:'firefox-windows',ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0',platform:'Win32',name:'Firefox · Windows',help:'Microsoft Store'},
  {id:'firefox-linux',ua:'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0',platform:'Linux x86_64',name:'Firefox · Linux',help:'does not install manifest-based PWAs'},
  {id:'firefox-android',ua:'Mozilla/5.0 (Android 14; Mobile; rv:143.0) Gecko/143.0 Firefox/143.0',platform:'Linux armv8l',name:'Firefox · Android',help:'home-screen shortcut'},
  {id:'samsung-android',ua:'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 SamsungBrowser/25.0 Chrome/130.0.0.0 Mobile Safari/537.36',platform:'Linux armv8l',name:'Samsung Internet · Android',help:'Install app or Add to Home screen'},
  {id:'chromeos',ua:'Mozilla/5.0 (X11; CrOS x86_64 16000.0.0) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',platform:'Linux x86_64',name:'Chrome · ChromeOS',help:'Install Sela or Install page as app'},
 ];
 for(const item of cases){
  await page.route(`**/${item.id}/mobile/index.html`,route=>route.fulfill({contentType:'text/html',body:'<button id="install-mobile-app">Install</button><p id="mobile-offline-status"></p><script type="module" src="./pwa.js"></script>'}));await routePwaFixture(page,item.id);
  await page.addInitScript(({ua,platform})=>{Object.defineProperty(navigator,'userAgent',{configurable:true,value:ua});Object.defineProperty(navigator,'platform',{configurable:true,value:platform});Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{addEventListener(){},ready:Promise.resolve({}),register(){return Promise.resolve({addEventListener(){},update(){return Promise.resolve();}});}}});},item);
  await page.goto(`/${item.id}/mobile/index.html`);await page.getByRole('button',{name:'Install',exact:true}).click();const guide=page.locator('.install-guide');await expect(guide).toContainText('Detected browser: '+item.name);await expect(guide).toContainText(item.help);await page.getByRole('button',{name:'Install Sela · Close'}).click();await expect(guide).toBeHidden();
 }
});
