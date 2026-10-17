import {test,expect} from '@playwright/test';
test('Explore groups free books and formats without fake Show all controls or page overflow',async({page})=>{
 await page.setViewportSize({width:320,height:850});await page.route('https://api.github.com/search/repositories?**',route=>route.fulfill({json:{total_count:0,items:[]}}));await page.route(url=>url.hostname==='openlibrary.org'&&url.pathname==='/subjects/romance.json',route=>route.fulfill({json:{work_count:1,works:[]}}));await page.goto('/app/');await page.getByRole('button',{name:'Explore',exact:true}).click();const catalog=page.locator('.open-catalog');
 await expect(catalog.locator('.discovery-browse-sections h3')).toHaveText(['Curated shelves','Formats & genres']);await expect(catalog.locator('.discovery-browse-sections > section')).toHaveCount(2);await expect(catalog.locator('.discovery-browse-sections > section').first().locator('.discovery-category').first()).toHaveAttribute('aria-label','Free eBooks');await expect(catalog.locator('.discovery-categories')).toHaveCount(0);await expect(catalog.getByRole('button',{name:'Show all',exact:true})).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await catalog.getByRole('button',{name:'Romance',exact:true}).click();await expect(catalog.locator('.discovery-category[aria-pressed="true"]')).toHaveText('Romance');await expect(catalog.locator('.discovery-results-heading')).toHaveText('Romance');
});
test('Explore searches outside the bundled classics and imports directly into Sela',async({page})=>{
 const queries=[];
 await page.route('https://api.github.com/search/repositories?**',route=>{queries.push(new URL(route.request().url()).searchParams.get('q'));return route.fulfill({json:{total_count:25,items:[{id:123,name:'New-Book_123',description:'New Book by A Real Author is a Project Gutenberg book, now on Github.',default_branch:'master',owner:{login:'GITenberg'}}]}});});
 await page.route('https://api.github.com/repos/GITenberg/New-Book_123/contents/',route=>route.fulfill({json:[{type:'file',name:'123.txt',download_url:'https://raw.githubusercontent.com/GITenberg/New-Book_123/master/123.txt'}]}));
 await page.route('https://raw.githubusercontent.com/GITenberg/New-Book_123/master/123.txt',route=>route.fulfill({body:'Chapter One\n\nA newly discovered book, read inside Sela.'}));
 await page.goto('/mobile/');await page.getByRole('button',{name:'Explore',exact:true}).click();const catalog=page.locator('.open-catalog');await catalog.getByRole('button',{name:'For you',exact:true}).click();await expect(catalog.locator('.open-book-cover').first()).toHaveAttribute('aria-label','Open book details: New Book');await catalog.locator('.open-book-cover').click();const detail=page.locator('.control-sheet[open]');await expect(detail.locator('.control-sheet-header h2')).toHaveText('New Book');await expect(detail.locator('.book-detail-overview')).toBeVisible();await expect(detail.locator('.book-detail-actions')).toBeVisible();await expect.poll(()=>detail.locator('.book-detail-cover-frame img').evaluate(image=>image instanceof HTMLImageElement&&image.naturalWidth>0)).toBe(true);await detail.locator('.control-sheet-header button').click();await expect(page.locator('.control-sheet[open]')).toHaveCount(0);
 for(const viewport of [{width:320,height:720},{width:393,height:852},{width:768,height:1024},{width:1440,height:900}]){await page.setViewportSize(viewport);await catalog.locator('.open-book-cover').click();const dialog=page.locator('.control-sheet[open]');await expect(dialog).toBeVisible();const geometry=await dialog.evaluate(element=>{const read=element.querySelector('.book-detail-read').getBoundingClientRect(),save=element.querySelector('.book-detail-save').getBoundingClientRect(),body=element.querySelector('.personal-sheet');return {readTop:read.top,saveTop:save.top,scrollWidth:body.scrollWidth,clientWidth:body.clientWidth,dialogWidth:element.getBoundingClientRect().width};});expect(Math.abs(geometry.readTop-geometry.saveTop)).toBeLessThan(1);expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth+1);expect(geometry.dialogWidth).toBeLessThanOrEqual(viewport.width);await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);}
 await page.setViewportSize({width:1280,height:720});
 await catalog.getByRole('searchbox').fill('New Book');await catalog.getByRole('button',{name:'Search',exact:true}).click();await expect.poll(()=>queries.length).toBe(2);expect(queries[1]).toContain('New Book user:GITenberg');
 await expect(catalog.getByRole('button',{name:'More books'})).toBeVisible();await catalog.locator('.open-book-cover').click();await page.locator('.control-sheet[open] .personal-sheet').getByRole('button',{name:'Read',exact:true}).click();await expect(page.locator('.sela-epub article')).toContainText('newly discovered');
 await page.getByRole('button',{name:'Back to library',exact:true}).click();await page.getByRole('button',{name:'Shelf',exact:true}).click();await expect(page.locator('#shelf .book')).toHaveCount(0);await page.getByRole('button',{name:'Explore',exact:true}).click();await catalog.locator('.open-book-cover').click();await page.locator('.control-sheet[open] .personal-sheet').getByRole('button',{name:'Save offline',exact:true}).click();await page.getByRole('button',{name:'Shelf',exact:true}).click();await expect(page.locator('#shelf .book')).toHaveCount(1);
});
test('Wikisource loads chapter text in Sela and keeps credits without executing publisher markup',async({page})=>{
 await page.route('https://id.wikisource.org/w/api.php?**',route=>{const p=new URL(route.request().url()).searchParams;const json=p.get('list')==='categorymembers'?{query:{categorymembers:[{pageid:10,title:'Buku Nusantara'}]}}:p.get('list')==='allpages'?{query:{allpages:[{pageid:11,title:'Buku Nusantara/1'}]}}:{parse:{text:{'*':p.get('pageid')==='10'?'<p>Pembukaan cerita</p><script>window.badWiki=true</script>':'<h2>Bab satu</h2><p>Kelanjutan cerita</p>'}}};return route.fulfill({json});});
 await page.goto('/mobile/');await page.getByRole('button',{name:'Explore',exact:true}).click();const catalog=page.locator('.open-catalog');await page.locator('.catalog-source-chip').click();await page.getByLabel('Book source',{exact:true}).selectOption('wikisource');await page.keyboard.press('Escape');await expect(page.locator('.control-sheet[open]')).toHaveCount(0);await expect(catalog.locator('.open-book')).toHaveCount(1);await catalog.locator('.open-book-cover').click();await page.locator('.control-sheet[open] .personal-sheet').getByRole('button',{name:'Read',exact:true}).click();await expect(page.locator('.sela-epub article')).toContainText('Kelanjutan cerita');await expect(page.locator('.sela-epub article')).toContainText('CC BY-SA');expect(await page.evaluate(()=>window.badWiki)).toBeUndefined();
});
test('OPDS 1 and 2 expose open acquisitions inside Sela, excluding buy and lending links',async({page})=>{
 const feeds={
  '/atom':'<feed xmlns="http://www.w3.org/2005/Atom"><title>Library</title><entry><id>one</id><title>Open story</title><author><name>A Writer</name></author><link rel="http://opds-spec.org/acquisition/open-access" type="text/plain" href="/book.txt"/></entry><entry><title>Paid book</title><link rel="http://opds-spec.org/acquisition/buy" type="application/epub+zip" href="/pay"/></entry></feed>',
  '/json':JSON.stringify({metadata:{title:'Library'},publications:[{metadata:{title:'Open story',author:[{name:'A Writer'}]},links:[{rel:'http://opds-spec.org/acquisition/open-access',type:'text/plain',href:'/book.txt'}]},{metadata:{title:'Borrowed'},links:[{rel:'http://opds-spec.org/acquisition/borrow',type:'application/epub+zip',href:'/loan'}]}]})};
 await page.route('https://catalog.example/**',route=>route.fulfill({body:feeds[new URL(route.request().url()).pathname]||'A free book from a personal catalog.'}));
 await page.goto('/mobile/');await page.getByRole('button',{name:'Explore',exact:true}).click();const catalog=page.locator('.open-catalog');await page.locator('.catalog-source-chip').click();await page.getByLabel('Book source',{exact:true}).selectOption('opds');await page.keyboard.press('Escape');await expect(page.locator('.control-sheet[open]')).toHaveCount(0);
 for(const path of ['/atom','/json']){await page.locator('.catalog-source-chip').click();await page.getByLabel('OPDS catalog URL',{exact:true}).fill('https://catalog.example'+path);await page.getByRole('button',{name:'Search this catalog',exact:true}).click();await expect(catalog.locator('.open-book')).toHaveCount(1);await expect(catalog.getByRole('button',{name:'More books'})).toBeHidden();await catalog.locator('.open-book-cover').click();await expect(page.locator('.control-sheet[open] .control-sheet-header h2')).toHaveText('Open story');await page.keyboard.press('Escape');}
 await catalog.locator('.open-book-cover').click();await page.locator('.control-sheet[open] .personal-sheet').getByRole('button',{name:'Read',exact:true}).click();await expect(page.locator('.sela-epub article')).toContainText('personal catalog');
});

test('Explore adds live community trends, genre shelves, and a safe shopping handoff',async({page})=>{
 await page.route('https://api.github.com/search/repositories?**',route=>route.fulfill({json:{total_count:0,items:[]}}));
 await page.route(url=>url.hostname==='openlibrary.org'&&['/trending/daily.json','/subjects/fantasy.json'].includes(url.pathname),route=>{
  const path=new URL(route.request().url()).pathname;
  if(path==='/trending/daily.json')return route.fulfill({json:{works:[{key:'/works/OL101W',title:'A Current Favorite',author_name:['Reader One'],cover_i:123,first_publish_year:2024},{key:'/works/OL102W',title:'Another Current Favorite',author_name:['Reader Two'],cover_i:124,first_publish_year:2023}]}});
  return route.fulfill({json:{work_count:200,works:[{key:'/works/OL201W',title:'The Fantasy Shelf',authors:[{name:'A. Writer'}],cover_id:456,first_publish_year:2020}]}});
 });
 await page.goto('/mobile/');await page.getByRole('button',{name:'Explore',exact:true}).click();
 const catalog=page.locator('.open-catalog');
 await catalog.getByRole('button',{name:'Top reads',exact:true}).click();
 await expect(catalog.locator('.open-book h3').first()).toHaveText('A Current Favorite');
 await expect(catalog.locator('.discovery-category[aria-pressed=true]')).toHaveAttribute('aria-label','Top reads');
 await catalog.locator('.open-book-cover').first().click();
 const detail=page.locator('.control-sheet[open] .personal-sheet');
 const shop=detail.getByRole('link',{name:'Find places to buy A Current Favorite'});
 await expect(shop).toHaveAttribute('href',/google\.com\/search\?tbm=shop/);
 await expect(detail).toContainText('Sela does not process purchases');await page.keyboard.press('Escape');
 await catalog.getByRole('button',{name:'Fantasy',exact:true}).click();
 await expect(catalog.locator('.open-book h3').first()).toHaveText('The Fantasy Shelf');
 await expect(catalog.locator('.discovery-category[aria-pressed=true]')).toHaveAttribute('aria-label','Fantasy');
});

test('Explore keeps book details visible, adds Google Books releases with a real buy link, and offers Surprise me',async({page})=>{
 const googleOrders:string[]=[];
 await page.route('https://api.github.com/search/repositories?**',route=>route.fulfill({json:{total_count:0,items:[]}}));
 await page.route('https://www.googleapis.com/books/v1/volumes?**',route=>{
  const url=new URL(route.request().url());googleOrders.push(url.searchParams.get('orderBy')||'');expect(url.searchParams.get('printType')).toBe('books');
  return route.fulfill({json:{totalItems:1,items:[{id:'fresh-1',volumeInfo:{title:'A Fresh New Release',authors:['A Writer'],publishedDate:'2026-10',language:'en',imageLinks:{thumbnail:'https://books.google.com/books/content?id=fresh-cover&printsec=frontcover&img=1&zoom=1&source=gbs_api'},infoLink:'https://books.google.com/books?id=fresh-1'},saleInfo:{saleability:'FOR_SALE',buyLink:'https://books.google.com/books?id=fresh-1&buy=1'}}]}});
 });
 await page.goto('/app/');await page.getByRole('button',{name:'Explore',exact:true}).click();
 const catalog=page.locator('.open-catalog');
 await catalog.getByRole('button',{name:'New releases',exact:true}).click();
 await expect.poll(()=>googleOrders).toContain('newest');
 await expect(catalog.locator('.open-book-cover').first()).toHaveAttribute('aria-label','Open book details: A Fresh New Release');
 await expect(catalog.locator('.open-book-copy').first()).toBeVisible();
 const coverBox=await catalog.locator('.open-book-cover').first().boundingBox();expect(coverBox).not.toBeNull();expect(Math.abs(coverBox!.width/coverBox!.height-2/3)).toBeLessThan(.02);
 await catalog.locator('.open-book-cover').click();
 const detail=page.locator('.control-sheet[open] .personal-sheet');
 await expect(detail.getByRole('link',{name:'Find places to buy A Fresh New Release'})).toHaveAttribute('href','https://books.google.com/books?id=fresh-1&buy=1');
 await page.keyboard.press('Escape');
 const before=await catalog.locator('.discovery-category[aria-pressed=true]').textContent();
 await catalog.getByRole('button',{name:'Surprise me',exact:true}).click();
 await expect.poll(()=>catalog.locator('.discovery-category[aria-pressed=true]').textContent()).not.toBe(before);
 await expect(catalog.locator('.discovery-view-mode')).toHaveCount(0);
});

test('Explore shuffles the current bookshelf each time its tab is opened',async({page})=>{
 await page.route('https://api.github.com/search/repositories?**',route=>route.fulfill({json:{total_count:12,items:Array.from({length:12},(_,index)=>({id:index+1,name:`shuffle-${index+1}`,description:`A Book ${index+1} by Writer ${index+1}`,default_branch:'main',owner:{login:'GITenberg'}}))}}));
 await page.goto('/mobile/');await page.getByRole('button',{name:'Explore',exact:true}).click();await page.locator('.open-catalog').getByRole('button',{name:'For you',exact:true}).click();
 const results=page.locator('.open-results');await expect(results.locator('.open-book')).toHaveCount(12);
 const first=await results.locator('.open-book h3').first().textContent();
 await page.getByRole('button',{name:'Shelf',exact:true}).click();await page.getByRole('button',{name:'Explore',exact:true}).click();
 await expect.poll(()=>results.locator('.open-book h3').first().textContent()).not.toBe(first);
});
