import {test,expect} from '@playwright/test';
test('closing keyboard help keeps manual zoom instead of refitting the inner reading area',async({page})=>{
 await page.goto('/?geo=off');await page.evaluate(async()=>{await SelaReady;window.panelReader=new Sela({url:'/example/yang-tidak-ikut-pulang.pdf',mode:'book',fit:'page',duration:0,language:'en',id:'panel-zoom-test'});await panelReader.open();});
 await page.getByRole('button',{name:'Reader settings',exact:true}).click();await page.getByRole('button',{name:'Keyboard shortcuts',exact:true}).click();await expect(page.locator('.flippy-shortcuts')).toBeVisible();await page.waitForTimeout(100);
 await page.getByRole('button',{name:'Keyboard shortcuts',exact:true}).click();await page.evaluate(()=>panelReader.setZoom(1.5));await page.waitForTimeout(250);
 expect(await page.locator('.fb-stage').evaluate(el=>el.style.transform)).toContain('scale(1.5)');
});
test('a delayed initial resize notification preserves manual zoom; real resize still fits',async({page})=>{
 await page.addInitScript(()=>{
  const Native=ResizeObserver;
  window.ResizeObserver=class {
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
 await page.getByRole('button',{name:'Highlight selected text',exact:true}).click();await expect(page.locator('.flippy-epub-chapter mark')).toHaveText('Paragraph 20');
 await page.evaluate(()=>{const host=r.book.container,paragraph=host.querySelector('.flippy-epub-chapter').shadowRoot.querySelectorAll('p')[20];host.scrollTop+=paragraph.getBoundingClientRect().top-host.getBoundingClientRect().top;r.setTypography({fontSize:25,lineHeight:2});});
 const position=await page.locator('.flippy-epub-chapter').evaluate(el=>el.shadowRoot.querySelectorAll('p')[20].getBoundingClientRect().top-el.parentElement.getBoundingClientRect().top);expect(Math.abs(position)).toBeLessThan(60);
 await page.evaluate(async()=>{r.close();await r.open();});await expect(page.locator('.flippy-epub-chapter mark')).toHaveText('Paragraph 20');
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
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('flippy:mode-test:preferences')).fit)).toBe('width');
 await page.evaluate(()=>r.close());expect(errors).toEqual([]);
});

test('complete backup restores original bytes and reading data while keeping existing books',async({page})=>{
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await page.locator('#books').setInputFiles({name:'Backup.txt',mimeType:'text/plain',buffer:Buffer.from('Original private text')});await expect(page.locator('.book')).toHaveCount(1);
 const result=await page.evaluate(async()=>{
  const storage=await import('/library/storage.js'),backup=await import('/library/backup.js');
  const [book]=await storage.listBooks();book.tags=['Favorites'];book.completed=true;book.progress=3;book.total=8;await storage.writeBook(book);
  const key='sela-library:'+book.id;localStorage.setItem(key+':notes',JSON.stringify({1:'A saved quote'}));localStorage.setItem(key+':marks','[1]');localStorage.setItem(key+':page','1');
  const archive=await backup.exportLibrary();await storage.writeBook(book,null,true);localStorage.removeItem(key+':notes');
  const first=await backup.restoreLibrary(archive);const restored=(await storage.listBooks())[0];const original=await(await storage.getFile(book.id)).text();
  localStorage.setItem(key+':notes',JSON.stringify({1:'Newer note'}));const second=await backup.restoreLibrary(archive);
  return {first,restored,original,second,note:JSON.parse(localStorage.getItem(key+':notes'))};
 });
 expect(result.first.added).toBe(1);expect(result.restored.tags).toEqual(['Favorites']);expect(result.restored.completed).toBe(true);expect(result.restored.progress).toBe(3);expect(result.original).toBe('Original private text');expect(result.second.added).toBe(0);expect(result.note[1]).toBe('Newer note');
});

test('tampered backup is rejected before changing the shelf',async({page})=>{
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await page.locator('#books').setInputFiles({name:'Safe.txt',mimeType:'text/plain',buffer:Buffer.from('Keep this')});await expect(page.locator('.book')).toHaveCount(1);
 const result=await page.evaluate(async()=>{
  const backup=await import('/library/backup.js'),zip=await import('/dist/js/sela.archive.js'),storage=await import('/library/storage.js');
  const archive=await backup.exportLibrary(),entries=zip.readBackupArchive(new Uint8Array(await archive.arrayBuffer()));const name=Object.keys(entries).find(n=>n.startsWith('books/'));entries[name]=new TextEncoder().encode('Tampered');
  try{await backup.restoreLibrary(new Blob([zip.createBackupArchive(entries)]));return null;}catch(e){return {error:e.message,count:(await storage.listBooks()).length};}
 });expect(result.error).toContain('integrity');expect(result.count).toBe(1);
});

test('mobile screens separate personal books and samples with usable themes and collections',async({browser})=>{
 const context=await browser.newContext({userAgent:'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36',viewport:{width:320,height:740},serviceWorkers:'block'}),page=await context.newPage();
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await expect(page.locator('.home-page')).toBeVisible();await expect(page.locator('.library')).toBeHidden();
 await page.getByRole('button',{name:'Shelf',exact:true}).click();await expect(page.locator('#empty')).toBeVisible();await expect(page.locator('#empty img')).toHaveCount(0);
 await page.locator('#books').setInputFiles({name:'My book.txt',mimeType:'text/plain',buffer:Buffer.from('My private book')});await expect(page.locator('.book')).toHaveCount(1);
 await page.locator('.select-book').check();await page.locator('.bulk-actions').getByRole('button',{name:'Finished',exact:true}).click();await page.locator('#read-filter').selectOption('completed');await expect(page.locator('.book')).toHaveCount(1);
 await page.getByRole('button',{name:'Explore',exact:true}).click();await expect(page.locator('.browse-page .catalog-book')).toHaveCount(1);await expect(page.locator('.library')).toBeHidden();
 await page.getByRole('button',{name:'Settings',exact:true}).click();await expect(page.locator('#export-library')).toBeVisible();
 for(const scheme of ['light','dark']){await page.emulateMedia({colorScheme:scheme});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.screenshot({path:'test-results/mobile-settings-new.png',fullPage:true});
 await page.getByRole('button',{name:'Home',exact:true}).click();await page.locator('.home-page .catalog-book').getByRole('button',{name:'Read sample',exact:true}).click();await expect(page.locator('.app-page-seek')).toBeVisible();
 await page.getByRole('button',{name:'Reader settings',exact:true}).click();await page.getByRole('combobox',{name:'Reading mode',exact:true}).selectOption('webtoon');await expect(page.locator('.flippy-webtoon')).toBeVisible();await expect(page.locator('.app-page-seek')).toBeVisible();await context.close();
});
