import {test,expect} from '@playwright/test';

const longTitle='The Reader’s Guide to a Very Long and Wonderfully Detailed Journey Through the Hidden Libraries of the World';
const longAuthor='Alexandria van der Waal-Smith, Professor Emerita of Comparative Literature and Keeper of the Northern Archive';

test('Explore cards stay readable and controls stay inside the layout at every viewport and color scheme',async({page})=>{
 await page.route('https://api.github.com/search/repositories?**',route=>route.fulfill({json:{total_count:100,items:Array.from({length:24},(_,index)=>({id:index+1,name:`book-${index+1}`,description:`${index===0?longTitle:`A Bookshop Story ${index+1}`} by ${index===0?longAuthor:`Writer ${index+1}`} is a Project Gutenberg book, now on Github.`,default_branch:'master',owner:{login:'GITenberg'}}))}}));
 await page.goto('/mobile/');
 await page.getByRole('button',{name:'Explore',exact:true}).click();
 const catalog=page.locator('.open-catalog');
 await catalog.getByRole('button',{name:'For you',exact:true}).click();
 await expect(catalog.locator('.open-book')).toHaveCount(24);
 await expect(catalog.getByRole('button',{name:'More books'})).toBeVisible();await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});

 for(const colorScheme of ['light','dark'] as const){
  await page.emulateMedia({colorScheme});
  for(const width of [320,360,393,600,768,1024,1280,1600]){
   await page.setViewportSize({width,height:900});
   const metrics=await page.evaluate(()=>{
    const root=document.querySelector<HTMLElement>('.browse-page')!;
    const catalog=root.querySelector<HTMLElement>('.open-catalog')!;
    const grid=catalog.querySelector<HTMLElement>('.open-results')!;
    const cards=[...grid.querySelectorAll<HTMLElement>('.open-book')];
    const overlaps=cards.flatMap(card=>{
     const title=card.querySelector('h3')!.getBoundingClientRect();
     const info=card.querySelector('.explore-info')!.getBoundingClientRect();
     return title.left<info.right&&title.right>info.left&&title.top<info.bottom&&title.bottom>info.top?[card.querySelector('h3')!.textContent]:[];
    });
    const controls=[...catalog.querySelectorAll<HTMLElement>('form input,form button,.catalog-actions button,.catalog-actions a,.open-catalog>button:not(.catalog-source-chip),.open-catalog>a')].filter(element=>element.getClientRects().length);
    const textNodes=[...catalog.querySelectorAll<HTMLElement>('.open-book h3,.open-book p,.open-book small,[role=status],.open-catalog>small,.catalog-source-chip')].filter(element=>element.getClientRects().length);
    const nav=document.querySelector<HTMLElement>('.bottom-bar')?.getBoundingClientRect();
    const navOverlaps=window.innerWidth<600&&nav?(()=>{const previousY=window.scrollY,actions=[...catalog.querySelectorAll<HTMLElement>('.catalog-actions,.discovery-results-section button')].filter(element=>element.getClientRects().length),overlaps=[];for(const [index,element]of actions.entries()){element.scrollIntoView({block:'center',inline:'nearest'});const action=element.getBoundingClientRect(),bar=document.querySelector<HTMLElement>('.bottom-bar')!.getBoundingClientRect();if(action.left<bar.right&&action.right>bar.left&&action.top<bar.bottom&&action.bottom>bar.top)overlaps.push({label:element.getAttribute('aria-label')||element.textContent?.trim(),index,action:{top:action.top,bottom:action.bottom,left:action.left,right:action.right},nav:{top:bar.top,bottom:bar.bottom},scrollY:window.scrollY,viewport:innerHeight});}window.scrollTo(0,previousY);return overlaps;})():[];
    return {pageWidth:document.documentElement.clientWidth,pageScrollWidth:document.documentElement.scrollWidth,sectionWidth:root.clientWidth,sectionScrollWidth:root.scrollWidth,catalogWidth:catalog.clientWidth,catalogScrollWidth:catalog.scrollWidth,gridWidth:grid.clientWidth,gridScrollWidth:grid.scrollWidth,columns:getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length,cardCount:cards.length,overlaps,navOverlaps,textOverflows:textNodes.filter(element=>element.scrollWidth>element.clientWidth+1).map(element=>element.textContent),controlOverflows:controls.filter(element=>!(element instanceof HTMLInputElement)&&element.scrollWidth>element.clientWidth+1).map(element=>({label:element.getAttribute('aria-label')||element.textContent,scrollWidth:element.scrollWidth,clientWidth:element.clientWidth})),controlOutside:controls.filter(element=>{const rect=element.getBoundingClientRect(),bounds=catalog.getBoundingClientRect();return rect.left<bounds.left-1||rect.right>bounds.right+1;}).map(element=>element.getAttribute('aria-label')||element.textContent)};
   });
   expect(metrics.pageScrollWidth,`${colorScheme} ${width}px page overflow`).toBeLessThanOrEqual(metrics.pageWidth+1);
   expect(metrics.sectionScrollWidth,`${colorScheme} ${width}px Explore section overflow`).toBeLessThanOrEqual(metrics.sectionWidth+1);
   expect(metrics.catalogScrollWidth,`${colorScheme} ${width}px catalog overflow`).toBeLessThanOrEqual(metrics.catalogWidth+1);
   expect(metrics.gridScrollWidth,`${colorScheme} ${width}px results overflow`).toBeLessThanOrEqual(metrics.gridWidth+1);
   expect(metrics.columns,`${colorScheme} ${width}px excessive columns`).toBeLessThanOrEqual(width>=1280?5:width>=1000?4:width>=640?3:2);
   expect(metrics.overlaps,`${colorScheme} ${width}px title/info overlap`).toEqual([]);
   expect(metrics.navOverlaps,`${colorScheme} ${width}px actions covered by bottom navigation`).toEqual([]);
   expect(metrics.textOverflows,`${colorScheme} ${width}px text overflow`).toEqual([]);
   expect(metrics.controlOverflows,`${colorScheme} ${width}px clipped controls`).toEqual([]);
   expect(metrics.controlOutside,`${colorScheme} ${width}px controls outside catalog`).toEqual([]);
  }
 }
});

test('Explore source sheet keeps OPDS dropdowns, inputs, and long saved-catalog names within the sheet',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela-library:catalogs',JSON.stringify([{name:'A very long saved catalog name that must wrap or clip safely',url:'https://catalog.example/opds'}])));
 await page.goto('/mobile/');
 await page.getByRole('button',{name:'Explore',exact:true}).click();
 const catalog=page.locator('.open-catalog');
 for(const [width,colorScheme] of [[320,'light'],[393,'dark'],[768,'light'],[1280,'dark']] as const){
  await page.setViewportSize({width,height:760});
  await page.emulateMedia({colorScheme});
  await catalog.locator('.catalog-source-chip').click();
  const sheet=page.locator('.control-sheet[open]');
  await expect(sheet).toBeVisible();
  const source=sheet.getByLabel('Book source',{exact:true});
  const saved=sheet.getByLabel('My saved catalogs',{exact:true});
  if(await source.inputValue()!=='opds')await source.selectOption('opds');
  await expect(saved.locator('option[value="https://catalog.example/opds"]')).toHaveText('A very long saved catalog name that must wrap or clip safely');
  await sheet.getByLabel('OPDS catalog URL',{exact:true}).fill('https://catalog.example/opds');
  await sheet.getByLabel('Catalog name',{exact:true}).fill('A catalog with a name long enough to wrap without breaking the sheet');
  await sheet.getByRole('button',{name:'Save catalog',exact:true}).scrollIntoViewIfNeeded();
  const metrics=await sheet.evaluate(element=>{
   const bounds=element.getBoundingClientRect();
   const controls=[...element.querySelectorAll<HTMLElement>('input,select,button')].filter(control=>control.getClientRects().length);
   const nonTextControls=controls.filter(control=>!(control instanceof HTMLInputElement));
   return {width:element.clientWidth,scrollWidth:element.scrollWidth,controlOverflows:nonTextControls.filter(control=>control.scrollWidth>control.clientWidth+1).map(control=>control.getAttribute('aria-label')||control.textContent),outside:controls.filter(control=>{const rect=control.getBoundingClientRect();return rect.left<bounds.left-1||rect.right>bounds.right+1;}).map(control=>control.getAttribute('aria-label')||control.textContent)};
  });
  expect(metrics.scrollWidth,`${colorScheme} ${width}px source sheet overflow`).toBeLessThanOrEqual(metrics.width+1);
  expect(metrics.controlOverflows,`${colorScheme} ${width}px clipped sheet controls`).toEqual([]);
  expect(metrics.outside,`${colorScheme} ${width}px controls outside sheet`).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
 }
});

test('Explore keeps the responsive shelf and full-grid controls available across visits',async({page})=>{
 await page.route('https://api.github.com/search/repositories?**',route=>route.fulfill({json:{total_count:40,items:Array.from({length:24},(_,index)=>({id:index+1,name:`classic-${index+1}`,description:`An open classic ${index+1} by Author ${index+1}`,default_branch:'master',owner:{login:'GITenberg'}}))}}));
 await page.setViewportSize({width:1440,height:900});await page.goto('/app/');await page.getByRole('button',{name:'Explore',exact:true}).click();const results=page.locator('.open-results');
 await page.locator('.open-catalog').getByRole('button',{name:'For you',exact:true}).click();
 await expect(page.locator('.browse-page .catalog-list')).toHaveCount(0);
 await expect(page.locator('.browse-page')).toContainText('Books from open shelves');
 await expect(results).not.toHaveAttribute('data-view-mode');await expect(results.locator('.open-book')).toHaveCount(24);await expect.poll(()=>results.locator('.open-book-cover img').evaluateAll(images=>images.filter(image=>image instanceof HTMLImageElement&&image.complete&&image.naturalWidth>0).length)).toBe(24);expect(await results.evaluate(element=>getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length)).toBe(5);await expect(results.locator('.open-book-cover')).toHaveCount(24);await expect(results.locator('.open-book-copy').first()).toBeVisible();await expect(page.getByRole('button',{name:'Grid view',exact:true})).toHaveCount(0);
 await page.reload();await page.getByRole('button',{name:'Explore',exact:true}).click();
 await expect(page.locator('.open-results .open-book-cover')).toHaveCount(32);
 await page.locator('.open-catalog').getByRole('button',{name:'For you',exact:true}).click();
 await expect(results.locator('.open-book-cover')).toHaveCount(24);
});

test('Long book titles and information actions fit the detail sheet on narrow screens',async({page})=>{
 await page.route('https://api.github.com/search/repositories?**',route=>route.fulfill({json:{total_count:1,items:[{id:1,name:'long-title-book',description:`${longTitle} by ${longAuthor} is a Project Gutenberg book, now on Github.`,default_branch:'master',owner:{login:'GITenberg'}}]}}));
 await page.goto('/mobile/');
 await page.getByRole('button',{name:'Explore',exact:true}).click();
 const catalog=page.locator('.open-catalog');
 await catalog.getByRole('button',{name:'For you',exact:true}).click();
 await expect(catalog.locator('.open-book')).toHaveCount(1);
 for(const [width,colorScheme] of [[320,'light'],[393,'dark'],[1280,'light']] as const){
  await page.setViewportSize({width,height:852});
  await page.emulateMedia({colorScheme});
  await catalog.getByRole('button',{name:'Open book details: '+longTitle}).click();
  const sheet=page.locator('.control-sheet[open]');
  await expect(sheet).toBeVisible();
  const metrics=await sheet.evaluate(element=>{
   const bounds=element.getBoundingClientRect();
   const title=element.querySelector<HTMLElement>('.control-sheet-header>h2')!;
   const close=element.querySelector<HTMLElement>('.control-sheet-header>.icon-action')!.getBoundingClientRect();
   const titleRect=title.getBoundingClientRect();
   const text=[...element.querySelectorAll<HTMLElement>('.personal-sheet h3,.personal-sheet p,.personal-sheet small')];
   const actions=[...element.querySelectorAll<HTMLElement>('.personal-sheet>button,.personal-sheet>a')];
   return {width:element.clientWidth,scrollWidth:element.scrollWidth,titleOverflows:title.scrollWidth>title.clientWidth+1,textOverflows:text.filter(node=>node.scrollWidth>node.clientWidth+1).map(node=>node.textContent),headerOverlap:titleRect.left<close.right&&titleRect.right>close.left&&titleRect.top<close.bottom&&titleRect.bottom>close.top,actionsOutside:actions.filter(action=>{const rect=action.getBoundingClientRect();return rect.left<bounds.left-1||rect.right>bounds.right+1;}).map(action=>action.getAttribute('aria-label')||action.textContent)};
  });
  expect(metrics.scrollWidth,`${colorScheme} ${width}px detail sheet overflow`).toBeLessThanOrEqual(metrics.width+1);
  expect(metrics.titleOverflows,`${colorScheme} ${width}px long heading overflow`).toBe(false);
  expect(metrics.textOverflows,`${colorScheme} ${width}px detail text overflow`).toEqual([]);
  expect(metrics.headerOverlap,`${colorScheme} ${width}px title overlaps close button`).toBe(false);
  expect(metrics.actionsOutside,`${colorScheme} ${width}px detail actions outside dialog`).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
 }
});
