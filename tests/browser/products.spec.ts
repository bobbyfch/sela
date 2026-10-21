import {test,expect} from '@playwright/test';
const android='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36';

test('touch-first tablet signals keep the same React app usable',async({browser})=>{
 const context=await browser.newContext({userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15',viewport:{width:1024,height:768}});
 await context.addInitScript(()=>{Object.defineProperty(navigator,'maxTouchPoints',{get:()=>5});localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'}));});
 const page=await context.newPage();await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();await expect(page.locator('.home-screen')).toBeVisible();
 await expect(page.getByRole('button',{name:'Switch to dark mode'})).toBeVisible();await context.close();
});

test('blocked localStorage does not prevent the library shell from mounting',async({browser})=>{
 const context=await browser.newContext({userAgent:android,serviceWorkers:'block'});
 await context.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('Storage blocked');};Storage.prototype.setItem=()=>{throw new Error('Storage blocked');};});
 const page=await context.newPage();const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();await expect(page.getByRole('link',{name:'Rak buku',exact:true})).toBeVisible();
 expect(errors).toEqual([]);await context.close();
});

test('public product CTA opens the single React /app workspace',async({page})=>{
 await page.goto('/?geo=off');await expect(page.locator('#products article')).toHaveCount(2);await expect(page.locator('#get-bookshelf')).toHaveAttribute('href','app/');
 await page.locator('#get-bookshelf').click();await expect(page.locator('.sela-app')).toBeVisible();await expect(page.locator('.home-screen')).toBeVisible();
});

test('public locales and React app language controls update their own visible copy',async({page})=>{
 await page.goto('/?geo=off');const heading=page.locator('.hero-copy h1');const english=await heading.textContent();
 await page.locator('#language').selectOption('id-ID');await expect(page.locator('html')).toHaveAttribute('lang','id-ID');await expect(heading).not.toHaveText(english||'');
 await page.locator('#language').selectOption('ja-JP');await expect(page.locator('html')).toHaveAttribute('lang','ja-JP');
 await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();await page.getByRole('button',{name:'Ganti bahasa',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page.getByRole('link',{name:'My shelf',exact:true})).toBeVisible();
});

test('public and app layouts stay inside common viewport widths',async({page})=>{
 await page.goto('/?geo=off');
 for(const width of [320,390,414,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`public page overflows at ${width}px`).toBe(true);await expect(page.locator('.hero-copy h1')).toBeVisible();}
 await page.goto('/app/#/shelf');
 for(const width of [320,393,768,1024,1440]){await page.setViewportSize({width,height:900});await expect(page.locator('.shelf-screen')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`app overflows at ${width}px`).toBe(true);}
});

test('public hero uses the book still-life artwork without a mascot',async({page})=>{
 await page.goto('/?geo=off');await expect(page.locator('.hero-mascot')).toHaveCount(0);await expect(page.locator('.paper-still-life img')).toBeVisible();
 const image=await page.locator('.paper-still-life img').evaluate((element:HTMLImageElement)=>({complete:element.complete,width:element.naturalWidth,height:element.naturalHeight,fit:getComputedStyle(element).objectFit}));
 expect(image.complete).toBe(true);expect(image.width).toBeGreaterThan(0);expect(image.height).toBeGreaterThan(0);expect(image.fit).not.toBe('fill');
});

test('public appearance switcher keeps aligned 44px icon targets across themes',async({page})=>{
 await page.goto('/?geo=off');
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,controls:[...document.querySelectorAll<HTMLElement>('[data-theme-choice]')].map(el=>({pressed:el.getAttribute('aria-pressed'),width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,icon:el.firstElementChild?.getAttribute('class')})),font:document.fonts.check('16px "Phosphor-Fill"')}));
  expect(layout.overflow,`public nav overflows at ${width}px`).toBe(false);expect(layout.controls.map(item=>item.width)).toEqual([44,44,44]);expect(layout.controls.every(item=>item.height===44&&item.icon?.includes('ph-'))).toBe(true);expect(layout.font).toBe(true);
 }
 for(const theme of ['light','dark','auto'] as const){await page.locator(`[data-theme-choice=${theme}]`).click();await expect(page.locator('html')).toHaveAttribute('data-theme',theme);await expect(page.locator(`[data-theme-choice=${theme}]`)).toHaveAttribute('aria-pressed','true');}
});

test('the React app still opens when ResizeObserver is unavailable',async({page})=>{
 await page.addInitScript(()=>{window.ResizeObserver=undefined;});await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible({timeout:15000});await expect(page.locator('.home-screen')).toBeVisible({timeout:15000});
});

test('mobile shelf keeps personal books separate from discovery',async({browser})=>{
 const context=await browser.newContext({userAgent:android,viewport:{width:320,height:740},serviceWorkers:'block'});const page=await context.newPage();
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'})));
 await page.goto('/app/');await expect(page.locator('.home-screen')).toBeVisible();
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles([{name:'First.txt',mimeType:'text/plain',buffer:Buffer.from('First mobile book')},{name:'Second.txt',mimeType:'text/plain',buffer:Buffer.from('Second mobile book')}]);
 await page.goto('/app/#/shelf');await expect(page.locator('.book-card')).toHaveCount(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/app/#/discover');await expect(page.locator('.catalog-explorer')).toBeVisible();await expect(page.locator('.book-card')).toHaveCount(0);await expect(page.locator('.mobile-dock')).toBeVisible();await context.close();
});

test('Home does not request optional weather until the reader enables it',async({page})=>{
 const requests:string[]=[];page.on('request',request=>{if(request.url().includes('open-meteo'))requests.push(request.url());});
 await page.goto('/app/');await expect(page.locator('.home-screen')).toBeVisible();await expect(page.locator('.weather-widget')).toHaveCount(0);expect(requests).toEqual([]);
});

test('closed UI panels stay hidden and the app does not inject an install prompt',async({page})=>{
 await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
 const result=await page.evaluate(()=>({openDialogs:document.querySelectorAll('dialog[open],[role="dialog"]').length,installInvites:document.querySelectorAll('#install-mobile-app,.install-guide[open]').length}));
 expect(result.openDialogs).toBe(0);expect(result.installInvites).toBe(0);await expect(page.getByRole('button',{name:/install sela/i})).toHaveCount(0);
});

test('reading the Home sample saves it to the private shelf before opening',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'})));await page.goto('/app/');await expect(page.locator('.home-screen')).toBeVisible();
 await page.getByRole('button',{name:/^(?:Download & read sample|Read sample|Unduh & baca contoh|Baca contoh)$/}).click();const reader=page.locator('.reader-layout');await expect(reader).toBeVisible();
 await expect(reader.getByRole('button',{name:'Back to shelf',exact:true})).toBeVisible();await reader.getByRole('button',{name:'Back to shelf',exact:true}).click();
 await page.goto('/app/#/shelf');await expect(page.locator('.book-card')).toHaveCount(1);await expect(page.locator('.book-card')).toContainText('Yang Tidak Ikut Pulang');
});
