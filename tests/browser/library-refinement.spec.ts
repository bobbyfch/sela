import {test,expect} from '@playwright/test';

async function start(page){
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'})));
 await page.goto('/app/');
 await expect(page.locator('.sela-app')).toBeVisible();
}

async function importBooks(page){
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles([
  {name:'Alpha.txt',mimeType:'text/plain',buffer:Buffer.from('Alpha original bytes for reading and selection.')},
  {name:'Beta.txt',mimeType:'text/plain',buffer:Buffer.from('Beta original bytes for the second shelf entry.')},
 ]);
 await expect(page.locator('.book-card')).toHaveCount(2);
}

test('shelf filters, grid/list/room views and responsive widths use the React shelf',async({page})=>{
 await start(page);await importBooks(page);await page.goto('/app/#/shelf');
 const search=page.getByRole('textbox',{name:'Search your shelf'});
 await search.fill('Beta');await expect(page.locator('.book-card')).toHaveCount(1);await search.fill('');
 const alpha=page.locator('.book-card').filter({has:page.getByRole('button',{name:'Open Alpha',exact:true})});
 await alpha.getByRole('button',{name:'Book actions',exact:true}).click();await page.getByRole('menuitem',{name:'Mark as finished',exact:true}).click();
 await page.getByRole('combobox',{name:'Filter by reading status'}).click();await page.getByRole('option',{name:'Finished',exact:true}).click();
 await expect(page.locator('.book-card')).toHaveCount(1);await page.getByRole('combobox',{name:'Filter by reading status'}).click();await page.getByRole('option',{name:'All books',exact:true}).click();
 const modes=page.getByRole('radiogroup',{name:'Shelf view'}),labels=page.locator('.shelf-view-toggle label');
 const iconCenters=await labels.evaluateAll(nodes=>nodes.map(label=>{const icon=label.querySelector('svg')!,outer=label.getBoundingClientRect(),inner=icon.getBoundingClientRect();return {x:Math.abs((outer.left+outer.width/2)-(inner.left+inner.width/2)),y:Math.abs((outer.top+outer.height/2)-(inner.top+inner.height/2))};}));
 expect(iconCenters.every(center=>center.x<=1&&center.y<=1)).toBe(true);
  const controlMetrics=await page.locator('.shelf-view-toggle').evaluate(root=>{const box=root.getBoundingClientRect();const items=[...root.querySelectorAll('label')].map(label=>{const rect=label.getBoundingClientRect();return {width:rect.width,height:rect.height};});return {width:box.width,height:box.height,items};});
  expect(controlMetrics.width).toBeCloseTo(140,0);expect(controlMetrics.height).toBeCloseTo(48,0);
  expect(controlMetrics.items).toHaveLength(3);expect(controlMetrics.items.every(item=>item.width>=40&&item.height>=38)).toBe(true);
 await labels.nth(2).click();await expect(page.locator('.book-list')).toBeVisible();
 await labels.nth(1).click();await expect(page.locator('.shelf-room-stage')).toBeVisible();
 await labels.nth(0).click();await expect(page.locator('.book-grid')).toBeVisible();await expect(modes).toBeVisible();
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:820});
  await page.waitForTimeout(200);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px document overflow`).toBe(true);
  const columns=await page.locator('.book-grid').evaluate(root=>getComputedStyle(root).gridTemplateColumns.split(' ').length);
  if(width<=767)expect(columns,`${width}px shelf grid columns`).toBe(2);
  const gridMetrics=await page.locator('.book-grid').evaluate(root=>{const rect=root.getBoundingClientRect();const overflow=[...root.querySelectorAll<HTMLElement>('*')].filter(element=>{const box=element.getBoundingClientRect();return box.right>rect.right+.5||element.scrollWidth>element.clientWidth+1;}).slice(0,12).map(element=>{const box=element.getBoundingClientRect(),style=getComputedStyle(element);return{tag:element.tagName,classes:String(element.className),text:(element.innerText||'').slice(0,50),width:Math.round(box.width),right:Math.round(box.right),scroll:element.scrollWidth,client:element.clientWidth,minWidth:style.minWidth,display:style.display,grid:style.gridTemplateColumns};});return{scroll:root.scrollWidth,client:root.clientWidth,overflow};});if(width<=767)expect(gridMetrics.client,`${width}px shelf content width`).toBeGreaterThan(width*.6);expect(gridMetrics.scroll,`${width}px shelf overflow ${JSON.stringify(gridMetrics)}`).toBeLessThanOrEqual(gridMetrics.client+1);
 }
});

test('Home book cards keep cover proportions and readable room across desktop and mobile',async({page})=>{
 await start(page);
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({name:'A recently added book with a long title.txt',mimeType:'text/plain',buffer:Buffer.from('A short book file used to check the new home shelf layout.')});
 await expect(page.locator('.home-screen')).toBeVisible();
 await expect(page.locator('.topbar-context')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Download & read sample',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Download & add to shelf',exact:true}).first()).toBeVisible();
 const recent=page.locator('.book-carousel .book-card.is-compact').first();await expect(recent).toBeVisible();
 const sampleCover=page.locator('.sela-sample-cover');
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  await page.waitForTimeout(200);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px Home overflow`).toBe(true);
  expect(await page.locator('.sela-sample-card').evaluate(element=>element.scrollWidth<=element.clientWidth+1),`${width}px sample card overflow`).toBe(true);
  const dimensions=await recent.locator('.book-cover').evaluate(element=>{const rect=element.getBoundingClientRect();return {width:rect.width,height:rect.height,aspect:getComputedStyle(element).aspectRatio};});
  expect(dimensions.width/dimensions.height).toBeCloseTo(.71,1);
  const sampleDimensions=await sampleCover.evaluate(element=>{const rect=element.getBoundingClientRect();return {width:rect.width,height:rect.height};});
  expect(sampleDimensions.width/sampleDimensions.height).toBeCloseTo(.71,1);
  expect(await sampleCover.locator('strong').evaluate(element=>element.scrollWidth<=element.clientWidth+1),`${width}px sample cover title overflow`).toBe(true);
  if(width>=768)expect((await recent.boundingBox())!.width,`${width}px Recently added card width`).toBeGreaterThan(280);
 }
 const copyWidth=await recent.locator('.book-card-copy').evaluate(element=>element.getBoundingClientRect().width);
 expect(copyWidth).toBeGreaterThan(100);
});

test('collections can be created, assigned in bulk and used to filter the shelf',async({page})=>{
 await start(page);await importBooks(page);await page.goto('/app/#/shelf');
 await page.getByRole('button',{name:'New collection',exact:true}).click();
 const create=page.getByRole('dialog',{name:'Create a collection',exact:true});
 await create.getByRole('textbox',{name:'Collection name'}).fill('Quiet evenings');await create.getByRole('button',{name:'Create collection',exact:true}).click();
 await expect(page.getByRole('button',{name:'Quiet evenings',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Select books',exact:true}).click();
 const bulk=page.locator('.bulk-selection-panel');await bulk.getByRole('button',{name:'Select all shown',exact:true}).click();
 await bulk.getByRole('button',{name:'Collection',exact:true}).click();
 const assign=page.getByRole('dialog',{name:'Add selected books to a collection',exact:true});
 await assign.getByRole('combobox',{name:'Collection name'}).fill('Quiet evenings');await assign.getByRole('button',{name:'Add books',exact:true}).click();
 await page.getByRole('button',{name:'Quiet evenings',exact:true}).click();await expect(page).toHaveURL(/collection=Quiet%20evenings/);await expect(page.locator('.book-card')).toHaveCount(2);
});

test('batch removal can be undone without losing original book files',async({page})=>{
 await start(page);await importBooks(page);await page.goto('/app/#/shelf');
 await page.getByRole('button',{name:'Select books',exact:true}).click();const bulk=page.locator('.bulk-selection-panel');
 await bulk.getByRole('button',{name:'Select all shown',exact:true}).click();await bulk.getByRole('button',{name:'Remove selected',exact:true}).click();
 const confirm=page.getByRole('dialog',{name:'Remove selected books?',exact:true});await confirm.getByRole('button',{name:'Remove selected',exact:true}).click();
 await expect(page.locator('.book-card')).toHaveCount(0);await page.getByRole('button',{name:'Undo batch removal',exact:true}).click();await expect(page.locator('.book-card')).toHaveCount(2);
 await page.locator('.book-card').getByRole('button',{name:'Open Alpha',exact:true}).click();await expect(page.locator('.reader-body')).toContainText('Alpha original bytes');
});

test('database upgrades preserve v1 book files and collection tags',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'})));
 await page.goto('/');
 await page.evaluate(async()=>{
  await new Promise<void>((resolve,reject)=>{
   const request=indexedDB.open('sela-private-library',1);
   request.onupgradeneeded=()=>{request.result.createObjectStore('books',{keyPath:'id'});request.result.createObjectStore('files',{keyPath:'id'});};
   request.onsuccess=()=>{const db=request.result,tx=db.transaction(['books','files'],'readwrite');
    tx.objectStore('books').put({id:'legacy-book',name:'Old book',filename:'Old book.txt',format:'txt',size:18,saved:1,opened:0,tags:['Legacy']});
    tx.objectStore('files').put({id:'legacy-book',bytes:new TextEncoder().encode('Preserved original').buffer,type:'text/plain'});
    tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
   };request.onerror=()=>reject(request.error);
  });
 });
 await page.goto('/app/#/shelf');await expect(page.locator('.book-card')).toHaveCount(1);
 await page.getByRole('button',{name:'Legacy',exact:true}).click();await expect(page.getByRole('button',{name:'Open Old book',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Open Old book',exact:true}).click();await expect(page.locator('.reader-layout main article')).toContainText('Preserved original');
});

test('pinch batches raster work and cancellation or disposal cannot leave an active gesture',async({page})=>{
 await page.goto('/example/sela.html');
 const result=await page.evaluate(async()=>{
  const {bindZoomGestures}=await import('/dist/source/src/gestures.js'),node=document.createElement('div');document.body.append(node);
  const calls=[];let begun=0,ended=0;const owner={zoom:1,beginGesture(){begun++;},endGesture(){ended++;},setZoom(z,point){this.zoom=z;calls.push({z,point});},panBy(x,y){calls.push({x,y});}};
  const cleanup=bindZoomGestures(node,owner,{});function event(type,id,x,y=100){node.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',clientX:x,clientY:y,bubbles:true,cancelable:true}));}
  event('pointerdown',1,100);event('pointerdown',2,200);for(let x=210;x<=300;x+=10)event('pointermove',2,x);await new Promise(requestAnimationFrame);const first=calls.slice();
  event('pointermove',2,330);event('pointercancel',1,100);await new Promise(requestAnimationFrame);const afterCancel=calls.length;event('pointermove',2,400);await new Promise(requestAnimationFrame);const afterOrphan=calls.length;
  event('pointerdown',3,100);event('pointerdown',4,200);cleanup();event('pointermove',4,400);await new Promise(requestAnimationFrame);return {first,begun,ended,afterCancel,afterOrphan,final:calls.length};
 });
 expect(result.first).toHaveLength(1);expect(result.first[0]).toEqual({z:2,point:{x:200,y:100}});expect(result.afterCancel).toBe(result.afterOrphan);expect(result.final).toBe(result.afterOrphan);expect(result.begun).toBe(result.ended);
});

test('React reading desk saves a selected passage as a local note',async({page})=>{
 await start(page);await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({name:'Passage.txt',mimeType:'text/plain',buffer:Buffer.from('A passage worth keeping in my reading notes.')});
 await page.goto('/app/#/shelf');await page.getByRole('button',{name:'Open Passage',exact:true}).click();const reader=page.locator('.reader-layout');await expect(reader).toBeVisible();
 const text=reader.locator('main article');await expect(text).toContainText('A passage worth keeping');await expect.poll(()=>text.evaluate(element=>element.getRootNode()===document)).toBe(true);
 const textPosition=await reader.locator('.reader-mount').evaluate(async node=>{const {captureTextPosition,restoreTextPosition}=await import('/dist/source/src/preferences.js');const position=captureTextPosition(node as HTMLElement);restoreTextPosition(node as HTMLElement,position);return position;});expect(textPosition.block).toBe(0);
 const contentSelectors=await reader.locator('.sela-epub-chapter > style').evaluate(element=>Array.from((element as HTMLStyleElement).sheet!.cssRules).flatMap(rule=>(rule as CSSStyleRule).selectorText.split(',').map(selector=>selector.trim())));expect(contentSelectors).toContain('.sela-epub-chapter > article h2');expect(contentSelectors).not.toContain('h2');
 await text.evaluate(element=>{const range=document.createRange();range.selectNodeContents(element);const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);});await expect.poll(()=>page.evaluate(()=>window.getSelection()?.toString()||'')).toContain('A passage worth keeping');
 await reader.getByRole('button',{name:'Reading desk',exact:true}).click();const desk=page.getByRole('dialog',{name:'Reading desk',exact:true});await desk.getByRole('tab',{name:'Notes',exact:true}).click();
 const addQuote=desk.getByRole('button',{name:'Add selected quote',exact:true});await expect(addQuote).toBeVisible();await addQuote.click();await expect(desk.getByLabel('Note for this page')).toHaveValue(/A passage worth keeping/);await expect(desk.getByRole('status')).toContainText('Saved on this device.');
});
