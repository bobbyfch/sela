import { test, expect } from '@playwright/test';
import { zipSync, strToU8 } from 'fflate';
import { readFile } from 'node:fs/promises';

test('story card opens reader; upload, live mode/filter/gap and global shortcuts',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('.developer-playground').evaluate(el=>el.open=true);
  await page.locator('.trial-book[data-story-open]').click();
  await expect(page.locator('.library-reader-overlay')).toBeVisible();
  await expect(page.locator('.app-page-seek')).toBeEnabled();
  await page.getByRole('button',{name:'Back to library',exact:true}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.library-reader-page-form input')).toHaveValue('2');
  await page.keyboard.press('?');await expect(page.locator('.flippy-shortcuts')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.locator('.flippy-shortcuts')).toBeHidden();
  await expect(page.locator('.library-reader-overlay')).toBeVisible();
  await page.keyboard.press('+');
  await expect.poll(()=>page.locator('.fb-stage').evaluate(el=>el.style.transform)).toContain('scale(1.5)');
  await page.keyboard.press('0');await expect.poll(()=>page.locator('.fb-stage').evaluate(el=>el.style.transform)).toContain('scale(1)');
  await page.getByRole('button',{name:'Reader settings',exact:true}).click();
  await page.getByLabel('Reading mode',{exact:true}).selectOption('webtoon');
  await expect(page.locator('.flippy-webtoon')).toBeVisible();
  await expect(page.locator('.app-page-seek')).toBeEnabled();
  await page.getByLabel('Page filter',{exact:true}).selectOption('grayscale');
  await expect.poll(()=>page.locator('.flippy-webtoon-page canvas').first().evaluate(el=>getComputedStyle(el).filter)).toBe('grayscale(1) brightness(1)');
  await page.getByRole('button',{name:'Close panel',exact:true}).filter({visible:true}).click();
  const positions=await page.locator('.flippy-webtoon-page').evaluateAll(nodes=>nodes.slice(0,2).map(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom})));
  expect(Math.abs(positions[1].top-positions[0].bottom)).toBeLessThan(1);
  await page.keyboard.press('Escape');await expect(page.locator('.library-reader-overlay')).toHaveCount(0);await page.locator('#pdf-file').setInputFiles({name:'story.epub',mimeType:'application/epub+zip',buffer:await readFile('example/yang-tidak-ikut-pulang.epub')});
  await expect(page.locator('#file-name')).toContainText('story.epub');await page.locator('.launch-reader').click();
  await expect(page.locator('.flippy-epub')).toBeVisible();await expect(page.locator('.app-page-seek')).toHaveAttribute('max','12');
  await expect(page.locator('.library-reader-overlay a[download]')).toHaveAttribute('download','story.epub');
  await page.keyboard.press('Escape');await page.locator('#clear-file').click();await expect(page.locator('.file-selection')).toBeHidden();
  expect(errors).toEqual([]);
});

test('EPUB sanitized selectable text, chapter links, font zoom and no PDF engine',async({page})=>{
  const pdfRequests=[];page.on('request',r=>{if(r.url().includes('vendor/pdfjs'))pdfRequests.push(r.url());});
  const sample=await readFile('example/yang-tidak-ikut-pulang.epub');
  await page.goto('/');await page.locator('.developer-playground').evaluate(el=>el.open=true);await page.evaluate(async()=>{await FlippyReady;window.r=new Flippy({url:'/example/yang-tidak-ikut-pulang.epub',mode:'single'});await r.open();});
  await expect(page.locator('.flippy-epub-chapter:not([hidden]) h1').last()).toHaveText('1. Kunci Cadangan');
  await page.evaluate(()=>r.showTools());
  await page.getByRole('button',{name:'2. Pukul Empat Lewat Empat',exact:true}).click();
  await expect(page.locator('.flippy-epub-chapter:not([hidden]) h1')).toHaveText('2. Pukul Empat Lewat Empat');
  await page.evaluate(()=>r.setZoom(1.5));
  expect(await page.locator('.flippy-epub-chapter').nth(1).locator('article').evaluate(el=>getComputedStyle(el).fontSize)).toBe('28.5px');
  expect(pdfRequests).toEqual([]);await page.evaluate(()=>r.close());
  const {unzipSync}=await import('fflate');const files=unzipSync(sample);files['OEBPS/chapter0.xhtml']=strToU8('<html><body><h1>Safe text</h1><script>window.pwned=1</script><img src="https://evil.invalid/x" onerror="alert(1)"><iframe src="https://evil.invalid"></iframe><a href="javascript:alert(1)">blocked</a></body></html>');
  await page.route('**/unsafe.epub',route=>route.fulfill({body:Buffer.from(zipSync(files))}));
  await page.evaluate(async()=>{window.r=new Flippy({url:'/unsafe.epub',format:'epub'});await r.open();});
  const content=page.locator('.flippy-epub-chapter').first();await expect(content.locator('script,iframe')).toHaveCount(0);await expect(content.locator('img')).not.toHaveAttribute('src',/evil/);await expect(content.locator('a')).not.toHaveAttribute('href',/javascript/);
  expect(await page.evaluate(()=>window.pwned)).toBeUndefined();
});

test('CBZ actual raster pages in book and seamless webtoon',async({page})=>{
  await page.goto('/');await page.locator('.developer-playground').evaluate(el=>el.open=true);await page.evaluate(async()=>{await FlippyReady;window.r=new Flippy({url:'/example/yang-tidak-ikut-pulang.cbz',mode:'book',duration:0});await r.open();});
  expect(await page.evaluate(()=>r.totalPages)).toBe(4);
  await expect.poll(()=>page.locator('.fb-sheet canvas').first().evaluate(c=>c.width>0&&c.getContext('2d').getImageData(20,20,1,1).data[3]>0)).toBe(true);
  await page.evaluate(async()=>{r.close();window.r=new Flippy({url:'/example/yang-tidak-ikut-pulang.cbz',mode:'webtoon'});await r.open();r.goTo(2);});
  await expect(page.locator('.library-reader-page-form input')).toHaveValue('2');
});

test('DjVu real optional GPL decoder and worker, without PDF.js download',async({page})=>{
  test.setTimeout(60000);const requests=[];page.on('request',r=>requests.push(r.url()));await page.goto('/');await page.locator('.developer-playground').evaluate(el=>el.open=true);
  await page.locator('#sample').selectOption('djvu');await page.locator('.launch-reader').click();
  await expect(page.locator('.app-page-seek')).toHaveAttribute('max','1',{timeout:30000});
  await expect.poll(()=>page.locator('.fb-sheet canvas').first().evaluate(c=>c.width>0&&c.getContext('2d').getImageData(20,20,1,1).data[3]>0)).toBe(true);
  expect(requests.some(url=>url.includes('vendor/pdfjs'))).toBe(false);
});

test('wheel zoom, touch pinch and cancellation leave no active pointer state',async({page})=>{
  await page.goto('/');await page.locator('.developer-playground').evaluate(el=>el.open=true);await page.evaluate(async()=>{await FlippyReady;window.r=new Flippy({url:'/example/yang-tidak-ikut-pulang.pdf',mode:'webtoon'});await r.open();});
  const root=page.locator('.flippy-webtoon');
  await root.dispatchEvent('wheel',{deltaY:-80,ctrlKey:true});expect(await page.evaluate(()=>r.zoom)).toBeGreaterThan(1);
  await page.evaluate(()=>r.setZoom(1));
  await root.dispatchEvent('pointerdown',{pointerId:11,pointerType:'touch',clientX:100,clientY:100});
  await root.dispatchEvent('pointerdown',{pointerId:12,pointerType:'touch',clientX:200,clientY:100});
  await root.dispatchEvent('pointermove',{pointerId:12,pointerType:'touch',clientX:280,clientY:100});
  expect(await page.evaluate(()=>r.zoom)).toBeGreaterThan(1);
  await root.dispatchEvent('pointercancel',{pointerId:11,pointerType:'touch'});await root.dispatchEvent('pointerup',{pointerId:12,pointerType:'touch'});
  await page.evaluate(()=>r.close());await expect(page.locator('.library-reader-overlay')).toHaveCount(0);
});

test('mobile live settings stay in viewport; book zoom and editable shortcuts',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/');await page.locator('.developer-playground').evaluate(el=>el.open=true);await page.locator('.trial-book[data-story-open]').click();
  await expect(page.locator('.app-page-seek')).toBeEnabled();
  await page.getByRole('button',{name:'Reader settings',exact:true}).click();
  const panel=await page.locator('.app-reading-settings').first().boundingBox();expect(panel.x).toBeGreaterThanOrEqual(0);expect(panel.x+panel.width).toBeLessThanOrEqual(375);expect(panel.y+panel.height).toBeLessThanOrEqual(812);
  await page.screenshot({path:'test-results/mobile-live-settings.png'});
  await page.getByRole('button',{name:'Close panel',exact:true}).filter({visible:true}).click();
  await page.locator('.fb-root').dispatchEvent('wheel',{deltaY:-80,ctrlKey:true});expect(await page.evaluate(()=>document.querySelector('.fb-stage').style.transform)).not.toContain('scale(1)');
  const field=page.locator('.library-reader-page-form input');await field.focus();await page.keyboard.press('End');await expect(field).toHaveValue('1');
  await page.locator('.fb-root').focus();await page.keyboard.press('0');await page.keyboard.press('+');expect(await page.locator('.fb-stage').evaluate(el=>el.style.transform)).toContain('scale(1.5)');
});

test('invalid archives and missing EPUB spine fail explicitly',async({page})=>{
  await page.goto('/');await page.locator('.developer-playground').evaluate(el=>el.open=true);
  const {unzipSync}=await import('fflate');const files=unzipSync(await readFile('example/yang-tidak-ikut-pulang.epub'));delete files['OEBPS/chapter0.xhtml'];
  await page.route('**/missing.epub',route=>route.fulfill({body:Buffer.from(zipSync(files))}));
  await expect(page.evaluate(async()=>{await FlippyReady;const r=new Flippy({url:'/missing.epub'});try{await r.open();return 'unexpected';}catch(e){return e.message;}finally{r.close();}})).resolves.toMatch(/missing chapter/);
  await page.route('**/unsafe.cbz',route=>route.fulfill({body:Buffer.from(zipSync({'../escape.jpg':strToU8('invalid')}))}));
  await expect(page.evaluate(async()=>{const r=new Flippy({url:'/unsafe.cbz'});try{await r.open();return 'unexpected';}catch(e){return e.message;}finally{r.close();}})).resolves.toMatch(/Unsafe archive path/);
});
