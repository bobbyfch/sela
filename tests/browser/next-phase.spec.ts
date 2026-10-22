import {test,expect} from '@playwright/test';
import {readBackupArchive,createBackupArchive} from '../../dist/js/sela.archive.js';
import {readFile} from 'node:fs/promises';
test('closing keyboard help keeps manual zoom instead of refitting the inner reading area',async({page})=>{
 await page.goto('/?geo=off');await page.evaluate(async()=>{await SelaReady;window.panelReader=new Sela({url:'/example/yang-tidak-ikut-pulang.pdf',mode:'book',fit:'page',duration:0,language:'en',id:'panel-zoom-test'});await panelReader.open();});
 await page.getByRole('button',{name:'Reader settings',exact:true}).click();await page.getByRole('button',{name:'Keyboard shortcuts',exact:true}).click();await expect(page.locator('.sela-shortcuts')).toBeVisible();await page.waitForTimeout(100);
 await page.getByRole('button',{name:'Keyboard shortcuts',exact:true}).click();await page.evaluate(()=>panelReader.setZoom(1.5));await page.waitForTimeout(250);
 expect(await page.locator('.fb-stage').evaluate(el=>el.style.transform)).toContain('scale(1.5)');
});
test('a delayed initial resize notification preserves manual zoom; real resize still fits',async({page})=>{
 await page.addInitScript(()=>{
  const Native=ResizeObserver;
  window.ResizeObserver=class {
    declare observer: any;

   constructor(callback){let first=true;this.observer=new Native(entries=>{if(first){first=false;setTimeout(()=>callback(entries),500);}else callback(entries);});}
   observe(...args){this.observer.observe(...args);}
   unobserve(...args){this.observer.unobserve(...args);}
   disconnect(){this.observer.disconnect();}
  };
 });
 await page.goto('/?geo=off');await page.evaluate(async()=>{await SelaReady;window.resizeReader=new Sela({url:'/example/yang-tidak-ikut-pulang.pdf',mode:'book',fit:'page',duration:0,id:'resize-zoom-test'});await resizeReader.open();resizeReader.zoomIn();});
 await expect.poll(()=>page.locator('.fb-stage').evaluate(el=>el.style.transform)).toContain('scale(1.5)');
 await page.waitForTimeout(800);expect(await page.locator('.fb-stage').evaluate(el=>el.style.transform)).toContain('scale(1.5)');
 await page.setViewportSize({width:600,height:740});await expect.poll(()=>page.locator('.fb-stage').evaluate(el=>el.style.transform)).toContain('scale(1)');
});

test('center taps toggle controls without turning pages and low power respects reduced motion',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?geo=off');
 await page.evaluate(async()=>{await SelaReady;window.r=new Sela({url:'/example/yang-tidak-ikut-pulang.pdf',mode:'single',language:'en',duration:0,paperTexture:true});await r.open();r.goTo(5);});
 const host=page.locator('.library-reader-book');const box=await host.boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
 await expect(page.locator('.library-reader-overlay')).toHaveClass(/sela-controls-hidden/);await expect(page.locator('.library-reader-page-form input')).toHaveValue('5');
 await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await expect(page.locator('.library-reader-overlay')).not.toHaveClass(/sela-controls-hidden/);
 await page.evaluate(()=>r.showTools());await page.getByRole('tab',{name:'Appearance',exact:true}).click();const power=page.getByRole('checkbox',{name:'Low power',exact:false});await power.check();expect(await page.evaluate(()=>r.book.opts.maxCanvasPixels)).toBe(1000000);await expect(page.locator('.library-reader-overlay')).toHaveAttribute('data-paper','false');await power.uncheck();expect(await page.evaluate(()=>r.book.opts.duration)).toBe(0);
});

test('text highlights survive reopening and typography keeps the selected paragraph in view',async({page})=>{
 await page.route('**/highlight.html',r=>r.fulfill({contentType:'text/html',body:'<h1>Reading</h1>'+Array.from({length:60},(_,i)=>`<p>Paragraph ${i}: a quiet passage to remember.</p>`).join('')}));
 await page.goto('/?geo=off');await page.evaluate(async()=>{await SelaReady;window.r=new Sela({url:'/highlight.html',id:'highlights-test',mode:'single',language:'en',persistPreferences:true});await r.open();await r.showTools();});
 await page.getByRole('tab',{name:'Document text',exact:true}).click();await expect(page.locator('.sela-transcript')).toContainText('Paragraph 20');
 await page.locator('.sela-transcript').evaluate(el=>{const node=el.firstChild,start=node.textContent.indexOf('Paragraph 20');const range=document.createRange();range.setStart(node,start);range.setEnd(node,start+12);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);el.dispatchEvent(new PointerEvent('pointerup'));});
 await page.getByRole('button',{name:'Highlight selected text',exact:true}).click();await expect(page.locator('.sela-epub-chapter mark')).toHaveText('Paragraph 20');
 await page.evaluate(()=>{const host=r.book.container,paragraph=host.querySelector('.sela-epub-chapter').shadowRoot.querySelectorAll('p')[20];host.scrollTop+=paragraph.getBoundingClientRect().top-host.getBoundingClientRect().top;r.setTypography({fontSize:25,lineHeight:2});});
 const position=await page.locator('.sela-epub-chapter').evaluate(el=>el.shadowRoot.querySelectorAll('p')[20].getBoundingClientRect().top-el.parentElement.getBoundingClientRect().top);expect(Math.abs(position)).toBeLessThan(60);
 await page.evaluate(async()=>{r.close();await r.open();});await expect(page.locator('.sela-epub-chapter mark')).toHaveText('Paragraph 20');
 expect(await page.evaluate(()=>r.options.fontSize)).toBe(25);
});

test('custom narration requires online opt-in and aborts its request when the reader closes',async({page})=>{
 await page.goto('/?geo=off');await page.evaluate(async()=>{await SelaReady;window.adapterCalls=[];window.r=new Sela({url:'/example/sela.html',language:'en',speechAdapter:async(text,options)=>{adapterCalls.push({text,options});return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError'))));}});await r.open();await r.showTools();});
 await page.getByRole('tab',{name:'Read aloud',exact:true}).click();expect(await page.evaluate(()=>adapterCalls.length)).toBe(0);
 await page.getByRole('checkbox',{name:'Local voices only',exact:true}).uncheck();const adapter=await page.getByRole('combobox',{name:'Narration voice',exact:true}).locator('option').allTextContents();const index=adapter.findIndex(v=>v.includes('Sela custom adapter'));expect(index).toBeGreaterThanOrEqual(0);
 await page.getByRole('combobox',{name:'Narration voice',exact:true}).selectOption(String(index));await page.getByRole('button',{name:'Listen',exact:true}).click();await expect.poll(()=>page.evaluate(()=>adapterCalls.length)).toBe(1);
 await page.getByRole('button',{name:'Close tools',exact:true}).click();await expect(page.locator('.sela-speech-mini')).toBeVisible();
 await page.evaluate(()=>r.close());expect(await page.evaluate(()=>adapterCalls[0].options.signal.aborted)).toBe(true);
});

test('PDF mode changes reuse the loaded document and preserve page and preferences',async({page})=>{
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().endsWith('yang-tidak-ikut-pulang.pdf'))requests.push(r.url());});
 await page.goto('/?geo=off');await page.evaluate(async()=>{await SelaReady;window.r=new Sela({url:'/example/yang-tidak-ikut-pulang.pdf',id:'mode-test',mode:'single',language:'en',persistPreferences:true,duration:0});await r.open();r.goTo(12);});
 await expect(page.locator('.library-reader-page-form input')).toHaveValue('12');
 for(const mode of ['scroll','webtoon','manga','book','single']){
  await page.evaluate(mode=>r.setMode(mode),mode);await expect(page.locator('.library-reader-page-form input')).toHaveValue('12');
  expect(await page.evaluate(()=>r.totalPages)).toBe(50);
 }
 expect(requests).toHaveLength(1);await page.evaluate(()=>r.setFit('width'));
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('sela:mode-test:preferences')).fit)).toBe('width');
 await page.evaluate(()=>r.close());expect(errors).toEqual([]);
});

test('complete backup restores original bytes and reading data while keeping existing books',async({page,browser})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'})));
 await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({name:'Backup.txt',mimeType:'text/plain',buffer:Buffer.from('Original private text')});await expect(page.locator('.book-card')).toHaveCount(1);
 await page.goto('/app/#/settings/data');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export backup',exact:true}).click();
 const download=await downloadPromise,archive=readBackupArchive(new Uint8Array(await readFile(await download.path())));
 const bookPath=Object.keys(archive).find(name=>name.startsWith('books/'));
 expect(bookPath).toBeTruthy();expect(new TextDecoder().decode(archive[bookPath!])).toBe('Original private text');
 const restoreContext=await browser.newContext();
 const restorePage=await restoreContext.newPage();
 await restorePage.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'})));
 await restorePage.goto('/app/#/settings/data');
 await restorePage.locator('.settings-detail input[type="file"]').setInputFiles(await download.path());
 await expect(restorePage.getByText('1 books added; 0 existing books kept.')).toBeVisible();
 await restorePage.goto('/app/#/shelf');await expect(restorePage.locator('.book-card')).toHaveCount(1);
 await restorePage.locator('.book-cover-button').click();
 await expect(restorePage.locator('.reader-body')).toContainText('Original private text');
 await restoreContext.close();
});

test('tampered backup is rejected before changing the shelf',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'})));
 await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({name:'Safe.txt',mimeType:'text/plain',buffer:Buffer.from('Keep this')});await expect(page.locator('.book-card')).toHaveCount(1);
 await page.goto('/app/#/settings/data');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export backup',exact:true}).click();
 const download=await downloadPromise,entries=readBackupArchive(new Uint8Array(await readFile(await download.path())));
 const name=Object.keys(entries).find(item=>item.startsWith('books/'));
 expect(name).toBeTruthy();entries[name!]=new TextEncoder().encode('Tampered');
 await page.locator('.settings-detail input[type="file"]').setInputFiles({name:'tampered.zip',mimeType:'application/zip',buffer:Buffer.from(createBackupArchive(entries))});
 await expect(page.getByText(/integrity/i)).toBeVisible();await page.goto('/app/#/shelf');await expect(page.locator('.book-card')).toHaveCount(1);
});

test('mobile routes keep the private shelf separate from discovery and settings',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'})));
 await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();await expect(page.locator('.home-screen')).toBeVisible();
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({name:'My book.txt',mimeType:'text/plain',buffer:Buffer.from('My private book')});
 await page.goto('/app/#/shelf');await expect(page.locator('.book-card')).toHaveCount(1);await expect(page.locator('.book-card')).toContainText('My book');
 await page.goto('/app/#/discover?view=sources');await expect(page.locator('.catalog-explorer')).toBeVisible();await expect(page.locator('.catalog-source-card')).toHaveCount(9);await expect(page.getByRole('textbox',{name:'Search books'})).toBeVisible();
 await page.goto('/app/#/settings/data');await expect(page.locator('.settings-detail')).toBeVisible();await expect(page.getByRole('button',{name:'Export backup',exact:true})).toBeVisible();
 for(const width of [320,393,768,1440]){await page.setViewportSize({width,height:740});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px route overflow`).toBe(true);}
});
