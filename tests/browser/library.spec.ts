import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test('dedicated room stores and deduplicates books, searches, opens, exports and undoes removal',async({page})=>{
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await expect(page.locator('#clock')).not.toHaveText('--:--');await page.locator('[data-tab=library]').click();
 const file={name:'A quiet book.txt',mimeType:'text/plain',buffer:Buffer.from('Sela: a quiet story to keep offline.')};
 await page.locator('#books').setInputFiles(file);await expect(page.locator('.book')).toHaveCount(1);await expect(page.locator('#books')).toBeEnabled();
 await page.locator('#books').setInputFiles(file);await expect(page.locator('#status')).toContainText('already on shelf');await expect(page.locator('.book')).toHaveCount(1);
 await page.locator('#search').fill('missing');await expect(page.locator('.book')).toHaveCount(0);await page.locator('#search').fill('quiet');await expect(page.locator('.book')).toHaveCount(1);
 await page.getByRole('button',{name:'Book information: A quiet book',exact:true}).first().click();await page.getByRole('dialog',{name:'Book information',exact:true}).getByRole('button',{name:'Read this book',exact:true}).click();await expect(page.locator('.sela-epub article')).toContainText('quiet story');await page.keyboard.press('Escape');await expect(page.locator('.library-reader-overlay')).toHaveCount(0);
 await page.getByRole('button',{name:'Book options: A quiet book',exact:true}).click();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export original',exact:true}).click();expect(await readFile(await(await download).path(),'utf8')).toContain('quiet story');
 await page.getByRole('button',{name:'Remove',exact:true}).click();await expect(page.locator('.book')).toHaveCount(0);await page.locator('#undo').click();await expect(page.locator('.book')).toHaveCount(1);
 await page.reload();await expect(page.locator('.book')).toHaveCount(1);
});

test('library mobile light/dark and Indonesian preserve usable two-column shelf without overflow',async({page})=>{
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await page.locator('[data-tab=library]').click();await page.locator('#books').setInputFiles([{name:'First.txt',mimeType:'text/plain',buffer:Buffer.from('First book')},{name:'Second.txt',mimeType:'text/plain',buffer:Buffer.from('Second book')}]);await expect(page.locator('.book')).toHaveCount(2);
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:844});for(const colorScheme of ['light','dark'] as const){await page.emulateMedia({colorScheme});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const b=await page.locator('.cover').first().boundingBox();expect(b.width).toBeGreaterThan(90);}}
 await page.locator('[data-tab=settings]').click();await page.locator('#language').selectOption('id-ID');await expect(page.locator('html')).toHaveAttribute('lang','id-ID');await expect(page.locator('#mobile-app h1')).toHaveText('Ruang kecil untuk cerita.');
 await page.screenshot({path:'test-results/library-id.png',fullPage:true});
});

test('Home glass header and reading scene stay balanced across screen sizes',async({page})=>{
 await page.goto('/app/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await expect(page.locator('.language-picker')).toBeVisible();
 await expect(page.locator('.home-utility-primary')).toHaveCount(1);await expect(page.locator('.home-utility-secondary')).toHaveCount(1);
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:860});
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));
  const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth,offenders:[...document.querySelectorAll<HTMLElement>('#mobile-app *')].map(element=>({tag:element.tagName,cls:typeof element.className==='string'?element.className:'',right:Math.round(element.getBoundingClientRect().right)})).filter(item=>item.right>innerWidth+1).slice(0,6)}));expect(overflow.scroll<=overflow.viewport,`width ${width}: ${JSON.stringify(overflow)}`).toBe(true);
  const geometry=await page.evaluate(()=>({viewport:innerWidth,header:document.querySelector('.topbar')!.getBoundingClientRect().width,picker:document.querySelector('.language-picker')!.getBoundingClientRect().width,scene:document.querySelector('.room-intro')!.getBoundingClientRect().width}));
  expect(geometry.picker).toBeGreaterThan(0);expect(geometry.scene).toBeLessThanOrEqual(geometry.viewport);expect(geometry.header).toBeGreaterThanOrEqual(geometry.viewport-1);
  if(width===1280){const widgets=await page.evaluate(()=>({calendar:document.querySelector('.home-calendar-widget')!.getBoundingClientRect().height,water:document.querySelector('.home-water-widget')!.getBoundingClientRect().height}));expect(widgets.water).toBeLessThan(widgets.calendar);await page.screenshot({path:'test-results/home-glass-desktop.png',fullPage:true});}
 }
 await page.locator('#language').selectOption('ja-JP');await expect(page.locator('#language-current')).toHaveText('日本語');await expect(page.locator('html')).toHaveAttribute('lang','ja-JP');
});

test('app topbar language flags stay visible offline and language control remains tappable on compact phones',async({page})=>{
 await page.route('https://flagcdn.com/**',route=>route.abort());
 await page.goto('/app/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await page.locator('[data-tab=library]').click();
 for(const width of [320,360,390,768,1440]){
  await page.setViewportSize({width,height:844});
  const geometry=await page.evaluate(()=>{const picker=document.querySelector<HTMLElement>('.language-picker')!.getBoundingClientRect(),select=document.querySelector<HTMLSelectElement>('#language')!.getBoundingClientRect(),theme=document.querySelector<HTMLButtonElement>('#theme')!.getBoundingClientRect();return {picker:[picker.x,picker.y,picker.width,picker.height],select:[select.x,select.y,select.width,select.height],theme:[theme.width,theme.height],scroll:document.documentElement.scrollWidth,viewport:innerWidth};});
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.viewport);expect(geometry.select[0]).toBeGreaterThanOrEqual(geometry.picker[0]);expect(geometry.select[0]+geometry.select[2]).toBeLessThanOrEqual(geometry.picker[0]+geometry.picker[2]+1);
  if(width<=380){expect(geometry.theme[0]).toBeGreaterThanOrEqual(40);expect(geometry.theme[1]).toBeGreaterThanOrEqual(40);expect(geometry.picker[3]).toBeGreaterThanOrEqual(44);}
  for(const [locale,flag,name,compact] of [['en-US','flag-en.svg','English','EN'],['id-ID','flag-id.svg','Bahasa Indonesia','ID'],['ja-JP','flag-jp.svg','日本語','JA']] as const){
   await page.locator('#language').selectOption(locale);await expect(page.locator('#language-current')).toHaveText(width<=380?compact:name);await expect(page.locator('#language-current')).toHaveAttribute('title',name);await expect(page.locator('html')).toHaveAttribute('lang',locale);await expect(page.locator('#language-flag')).toHaveAttribute('src',new RegExp(flag));await expect.poll(()=>page.locator('#language-flag').evaluate(image=>(image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
 }
});

test('mobile add FAB appears only on the shelf, where adding a book belongs',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/app/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');const fab=page.locator('.mobile-add-fab');
 await expect(fab).toBeHidden();await page.locator('[data-tab=browse]').click();await expect(fab).toBeHidden();await page.locator('[data-tab=settings]').click();await expect(fab).toBeHidden();await page.locator('[data-tab=library]').click();await expect(fab).toBeVisible();
 const geometry=await page.evaluate(()=>{const fab=document.querySelector('.mobile-add-fab')!,empty=document.querySelector('.library .empty-state')||document.querySelector('.library .empty');const a=fab.getBoundingClientRect(),b=empty?.getBoundingClientRect();return{fab:{left:a.left,right:a.right,top:a.top,bottom:a.bottom},empty:b?{left:b.left,right:b.right,top:b.top,bottom:b.bottom}:null,viewport:innerWidth};});
 expect(geometry.fab.right).toBeLessThanOrEqual(geometry.viewport);if(geometry.empty){expect(geometry.fab.top).toBeGreaterThanOrEqual(geometry.empty.bottom-1);}
});

test('desktop shelf keeps a single book compact and the round options button opens a dismissible tray',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/app/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Shelf',exact:true}).click();
 await page.locator('#books').setInputFiles({name:'One book.txt',mimeType:'text/plain',buffer:Buffer.from('A book that should keep its cover size on a wide shelf.')});await expect(page.locator('#shelf .book')).toHaveCount(1);
 const cover=await page.locator('#shelf .cover').boundingBox();expect(cover).not.toBeNull();expect(cover!.width).toBeLessThanOrEqual(241);expect(cover!.height).toBeGreaterThan(300);
 const menu=page.getByRole('button',{name:'Book options: One book',exact:true});await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true');await expect(page.locator('#shelf .book-actions')).toBeVisible();await expect(page.locator('#shelf .book-actions button')).toHaveCount(9);
 await page.keyboard.press('Escape');await expect(page.locator('#shelf .book-actions')).toBeHidden();await expect(menu).toHaveAttribute('aria-expanded','false');
 await page.locator('#language').selectOption('ja-JP',{timeout:5000});await expect(page.locator('#language-current')).toHaveText('日本語');await expect(page.locator('html')).toHaveAttribute('lang','ja-JP');await expect(page.locator('#settings-language')).toHaveValue('ja-JP');
 await page.locator('[data-tab=settings]').click();await page.getByRole('button',{name:'Reading & appearance',exact:true}).click();await page.locator('#settings-language').selectOption('id-ID');await expect(page.locator('#language')).toHaveValue('id-ID');await expect(page.locator('#language-current')).toHaveText('Bahasa Indonesia');await expect(page.locator('html')).toHaveAttribute('lang','id-ID');
 await page.locator('#language').selectOption('en-US');await expect(page.locator('#settings-language')).toHaveValue('en-US');await expect(page.locator('html')).toHaveAttribute('lang','en-US');
 const previous=await page.locator('html').getAttribute('data-theme');await page.locator('#theme').click();await expect.poll(()=>page.locator('html').getAttribute('data-theme')).not.toBe(previous);
});

test('PDF cover is a locally rendered thumbnail and sample has twelve navigable chapters',async({page})=>{
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await page.getByRole('button',{name:'Save offline',exact:true}).click();await page.locator('[data-tab=library]').click();await expect(page.locator('.cover img')).toBeVisible({timeout:30000});await expect(page.locator('#books')).toBeEnabled();
  await page.locator('.cover').click();await page.getByRole('dialog',{name:'Book information',exact:true}).getByRole('button',{name:'Read this book',exact:true}).click();await expect(page.locator('.app-page-seek')).toHaveAttribute('max','50');await page.getByRole('button',{name:'Contents & bookmarks',exact:true}).click();await expect(page.getByRole('button',{name:'12. Sebelum Rekaman Dimulai',exact:true})).toBeVisible();await page.getByRole('button',{name:'12. Sebelum Rekaman Dimulai',exact:true}).click();await expect(page.locator('.app-reading-position output')).toHaveText('46 / 50');
});

test('concurrent inline readers keep page scrolling and scope keyboard navigation to focus',async({page})=>{
 await page.goto('/');await page.locator('.developer-playground').evaluate(el=>(el as HTMLDialogElement).open=true);await page.evaluate(async()=>{await SelaReady;for(const id of ['one','two']){const host=document.createElement('div');host.id=id;host.style.height='520px';document.body.append(host);const r=new Sela({url:'/example/yang-tidak-ikut-pulang.pdf',presentation:'inline',container:host,language:'en',duration:0});window[id]=r;await r.open();}});
 await expect(page.locator('.sela-inline')).toHaveCount(2);expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');await expect(page.locator('#one .sela-inline')).not.toHaveAttribute('aria-modal','true');
 await page.locator('#one .library-reader-close').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#one .library-reader-page-form input')).toHaveValue('2');await expect(page.locator('#two .library-reader-page-form input')).toHaveValue('1');
 await page.locator('#one .library-reader-close').click();await expect(page.locator('#one .sela-inline')).toHaveCount(0);await expect(page.locator('#two .sela-inline')).toHaveCount(1);
});

test('Pages is viewer-only and provides inline presentation',async({page})=>{
 await page.goto('/');await page.locator('.developer-playground').evaluate(el=>(el as HTMLDialogElement).open=true);await expect(page.locator('#open-shelf')).toHaveCount(0);await page.locator('#demo-presentation').selectOption('inline');await page.locator('.launch-reader').click();await expect(page.locator('#embedded-reader .sela-inline')).toBeVisible();expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
});
