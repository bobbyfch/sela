import {test,expect} from '@playwright/test';
const android='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36';
test('iPad desktop-style signals open mobile Bookshelf',async({browser})=>{
 const context=await browser.newContext({userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15'});await context.addInitScript(()=>Object.defineProperty(navigator,'maxTouchPoints',{get:()=>5}));const page=await context.newPage();await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await expect(page.locator('[data-i18n=title]')).toHaveText('Your little world of stories.');await context.close();
});
test('blocked browser storage shows a basic mobile fallback',async({browser})=>{
 const context=await browser.newContext({userAgent:android});await context.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('Storage blocked');};});const page=await context.newPage();await page.goto('/mobile/');await expect(page.locator('#device-notice')).toContainText('could not initialize');await expect(page.locator('#legacy-mobile')).toBeVisible();await context.close();
});
test('two products and Reader entry point stay usable on desktop',async({page})=>{
 await page.goto('/?geo=off');await expect(page.locator('#products article')).toHaveCount(2);await expect(page.locator('#get-home')).toHaveCount(0);await page.locator('#get-bookshelf').click();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await expect(page.locator('#device-notice')).toBeHidden();expect(await page.locator('#mobile-manifest').getAttribute('href')).toMatch(/^manifest\.webmanifest\?v=[^&]+-[a-f0-9]{12}$/);
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}await page.locator('[data-tab=home]').click();await expect(page.locator('#install-mobile-app')).toHaveCount(0);await expect(page.locator('[data-tab=home]')).toHaveAttribute('aria-current','true');
});
test('public landing and sample shelf follow every app language without layout overflow',async({page})=>{
 await page.goto('/?geo=off');
 const language=page.locator('#language');
 for(const locale of ['ja-JP']){
  await language.selectOption(locale);
  await expect(page.locator('h1[data-i18n=headline]')).not.toHaveText('Your books. Within reach.');
  await expect(page.locator('.sample-gallery h2')).not.toHaveText('Open a book. Try your own.');
  await expect(page.locator('.trial-upload strong')).not.toHaveText('Try your document');
  await expect(page.locator('.product-help h3').first()).not.toHaveText('Install on your device');
 }
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
test('Tailwind page layouts switch at safe widths and preserve the fixed bookshelf navigation',async({page})=>{
 await page.goto('/?geo=off');
 const hero=page.locator('.hero');
 const install=page.locator('#install-viewer');
 for(const [width,heroColumns] of [[390,1],[768,1],[900,1],[901,2],[1440,2]] as const){
  await page.setViewportSize({width,height:900});
  const metrics=await page.evaluate(()=>({
   heroColumns:getComputedStyle(document.querySelector('.hero')!).gridTemplateColumns.split(' ').length,
   playgroundTag:document.querySelector('#install-viewer')!.tagName,
   demoInsideConfig:!!document.querySelector('#install-viewer #demo-mode')&&!!document.querySelector('#install-viewer #playground'),
   setupVisible:document.querySelector('#install-viewer')!.getClientRects().length>0,
   setupColumns:getComputedStyle([...document.querySelector('#install-viewer')!.children].find(element=>element.classList.contains('tw:grid'))!).gridTemplateColumns.split(' ').length,
   productHeights:[...document.querySelectorAll<HTMLElement>('#products article')].map(element=>Math.round(element.getBoundingClientRect().height)),
   overflow:document.documentElement.scrollWidth>innerWidth,
  }));
  expect(metrics.heroColumns,`public hero at ${width}px`).toBe(heroColumns);
  expect(metrics.playgroundTag,`unified Viewer configuration at ${width}px`).toBe('SECTION');
  expect(metrics.demoInsideConfig,`Viewer controls stay together at ${width}px`).toBe(true);
  expect(metrics.setupVisible,`Viewer setup is visible by default at ${width}px`).toBe(true);
  expect(metrics.setupColumns,`Viewer and configuration columns at ${width}px`).toBe(width>=1280?2:1);
  if(width>=1024)expect(Math.max(...metrics.productHeights)-Math.min(...metrics.productHeights),`equal product card heights at ${width}px`).toBeLessThanOrEqual(1);
  expect(metrics.overflow,`public page at ${width}px`).toBe(false);
 }
 await page.goto('/mobile/');
 for(const width of [320,393,1024,1440]){
  await page.setViewportSize({width,height:900});
  await expect.poll(()=>page.locator('.bottom-bar').evaluate(element=>getComputedStyle(element).position)).toBe('fixed');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Reader page at ${width}px`).toBe(true);
 }
});
test('public hero blends with the page, without a floating corner illustration',async({page})=>{
 await page.goto('/?geo=off');
 await expect(page.locator('.hero-mascot')).toHaveCount(0);
 for(const path of ['/site/illustrations/book-cart.webp','/site/illustrations/reading-corner-jakarta.webp']){
  const asset=await page.request.get(path);
  expect(asset.ok(),path).toBe(true);
 }
});
test('public appearance switcher uses aligned filled web icons in every theme and viewport',async({page})=>{
 await page.goto('/?geo=off');
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  const layout=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth>innerWidth,
   controls:[...document.querySelectorAll<HTMLElement>('[data-theme-choice]')].map(el=>({pressed:el.getAttribute('aria-pressed'),width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,icon:el.firstElementChild?.getAttribute('class')})),
   font:document.fonts.check('16px "Phosphor-Fill"')
  }));
  expect(layout.overflow,`public navigation at ${width}px`).toBe(false);
  const target=44;
  expect(layout.controls.map(item=>item.width)).toEqual([target,target,target]);
  expect(layout.controls.every(item=>item.height===target&&item.icon?.includes('ph-'))).toBe(true);
  expect(layout.font).toBe(true);
 }
 for(const theme of ['light','dark','auto'] as const){
  await page.locator(`[data-theme-choice=${theme}]`).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  await expect(page.locator(`[data-theme-choice=${theme}]`)).toHaveAttribute('aria-pressed','true');
 }
});
test('old-browser fallback remains available without OS restrictions',async({browser})=>{
 const context=await browser.newContext({userAgent:android,viewport:{width:320,height:740}});await context.addInitScript(()=>{window.ResizeObserver=undefined;});const page=await context.newPage();await page.goto('/mobile/');await expect(page.locator('#legacy-mobile')).toBeVisible();await expect(page.locator('#mobile-app')).toBeHidden();await context.close();
});

test('mobile bookshelf filters, favorites, views, bottom navigation and separate sample catalog',async({browser})=>{
 const context=await browser.newContext({userAgent:android,viewport:{width:320,height:740},serviceWorkers:'block'});const page=await context.newPage();await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toBeVisible();await expect(page.locator('.home-page .catalog-book')).toHaveCount(1);await page.locator('[data-tab=library]').click();await expect(page.locator('#empty img')).toHaveCount(0);
 await page.locator('#books').setInputFiles([{name:'First.txt',mimeType:'text/plain',buffer:Buffer.from('First mobile book')},{name:'Second.md',mimeType:'text/markdown',buffer:Buffer.from('# Second mobile book')}]);await expect(page.locator('.book')).toHaveCount(2);await expect(page.locator('#books')).toBeEnabled();await page.locator('.shelf-refine').evaluate(el=>{if(!el.hasAttribute('open'))(el.querySelector('.shelf-refine-toggle') as HTMLElement).click();});await page.locator('#format-filter').selectOption('md');await expect(page.locator('.book')).toHaveCount(1);await page.getByRole('button',{name:'Book options: Second',exact:true}).click();await page.locator('.book-actions').getByRole('button',{name:'Favorite',exact:true}).click();await page.locator('.shelf-refine').evaluate(el=>{if(!el.hasAttribute('open'))(el.querySelector('.shelf-refine-toggle') as HTMLElement).click();});await page.locator('#format-filter').selectOption('all');await page.locator('.shelf-refine').evaluate(el=>{if(!el.hasAttribute('open'))(el.querySelector('.shelf-refine-toggle') as HTMLElement).click();});await page.locator('#read-filter').selectOption('favorite');await expect(page.locator('.book')).toHaveCount(1);
 await page.locator('#shelf-view').click();await expect(page.locator('body')).toHaveAttribute('data-shelf-view','list');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('.cover').click();await page.getByRole('dialog',{name:'Book information',exact:true}).getByRole('button',{name:'Read this book',exact:true}).click();await expect(page.locator('.sela-epub article')).toBeVisible();await page.getByRole('button',{name:'Back to library',exact:true}).click();await expect(page.locator('.library-reader-overlay')).toHaveCount(0);await page.locator('[data-tab=settings]').click();await expect(page.locator('.settings-page')).toBeVisible();await page.getByRole('button',{name:'About Sela',exact:true}).click();await expect(page.getByRole('dialog',{name:'About Sela',exact:true})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'About Sela',exact:true})).toBeHidden();await page.reload();await expect(page.locator('.book')).toHaveCount(2);await expect(page.locator('body')).toHaveAttribute('data-shelf-view','list');await context.close();
});
test('Reader clock and coffee pause work without third-party requests',async({page})=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('open-meteo'))requests.push(r.url());});await page.setViewportSize({width:1440,height:900});await page.goto('/mobile/');await expect(page.locator('#clock')).not.toHaveText('--:--');await expect(page.locator('#coffee')).toBeHidden();await expect(page.locator('.home-page')).toHaveAttribute('data-companion','tanuki');await expect(page.locator('.home-reflection')).toBeVisible();expect(requests).toEqual([]);
});

test('closed home sheets stay hidden and offline status stays inside the welcome copy',async({page})=>{
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 const result=await page.evaluate(()=>({closedSheets:[...document.querySelectorAll('dialog:not([open])')].filter(dialog=>getComputedStyle(dialog).display!=='none'||dialog.getClientRects().length>0).length,installActionCount:document.querySelectorAll('#install-mobile-app').length,offlineStatusInsideCopy:document.querySelector('.room-intro>div:first-of-type')?.contains(document.querySelector('#mobile-offline-status'))}));
 expect(result.closedSheets).toBe(0);expect(result.installActionCount).toBe(0);expect(result.offlineStatusInsideCopy).toBe(true);
});

test('reading the Home sample saves it to the private shelf before opening',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await page.locator('.home-page .catalog-book').getByRole('button',{name:'Read sample',exact:true}).click();await expect(page.locator('.library-reader-overlay')).toBeVisible();
 await page.getByRole('button',{name:'Back to library',exact:true}).click();await page.getByRole('button',{name:'Shelf',exact:true}).click();await expect(page.locator('.book')).toHaveCount(1);await expect(page.locator('.book-title')).toHaveText('Yang Tidak Ikut Pulang');
});
