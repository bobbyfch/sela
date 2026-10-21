import {test,expect} from '@playwright/test';

async function start(page){
 await page.addInitScript(()=>{if(!localStorage.getItem('sela:app:preferences'))localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'}));});
 await page.goto('/app/#/discover');
 await expect(page.locator('.catalog-explorer')).toBeVisible();
}

test('Discover explains its nine sources and adapts the source-specific controls',async({page})=>{
 await page.route('**/w/api.php?**',route=>route.fulfill({json:{query:{categorymembers:[]}}}));
 await start(page);
 await expect(page.getByRole('heading',{name:'Find your next read.'})).toBeVisible();
 await expect(page.locator('.catalog-source-card')).toHaveCount(9);
 const wiki=page.locator('.catalog-source-card').filter({hasText:'Wikisource'});
 await wiki.click();
 await expect(wiki).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('combobox',{name:'Edition language'})).toBeVisible();
 await page.getByRole('combobox',{name:'Edition language'}).click();
 await page.getByRole('option',{name:'Javanese'}).click();
 await expect(page.getByRole('combobox',{name:'Edition language'})).toHaveValue('Javanese');
 await expect(page.getByRole('textbox',{name:'Search books'})).toBeVisible();
});

test('OPDS catalogs save only a named HTTPS address and keep credentials in the session',async({page})=>{
 await page.route('https://catalog.example/**',route=>route.fulfill({status:200,body:'<feed xmlns="http://www.w3.org/2005/Atom"><title>Reading room</title></feed>',headers:{'access-control-allow-origin':'*','content-type':'application/atom+xml'}}));
 await start(page);
 await page.locator('.catalog-source-card').filter({hasText:'My OPDS catalog'}).click();
 await page.getByLabel('OPDS catalog URL',{exact:true}).fill('https://catalog.example/opds');
 await page.getByLabel('Catalog name',{exact:true}).fill('Weekend reading');
 await page.getByLabel('Username · optional',{exact:true}).fill('private-user');
 await page.getByLabel('Password · session only',{exact:true}).fill('private-password');
 await page.getByRole('button',{name:'Save catalog',exact:true}).click();
 await expect(page.locator('.opds-profiles')).toContainText('Weekend reading');
 const saved=await page.evaluate(()=>localStorage.getItem('sela-library:catalogs')||'');
 expect(saved).toContain('Weekend reading');
 expect(saved).toContain('https://catalog.example/opds');
 expect(saved).not.toContain('private-user');
 expect(saved).not.toContain('private-password');
});

test('cover click opens a sourced book detail with description, edition ISBNs and shop search',async({page})=>{
 const coverRequests:string[]=[];
 page.on('request',request=>{if(new URL(request.url()).hostname==='covers.openlibrary.org')coverRequests.push(request.url());});
 await page.route('https://covers.openlibrary.org/**',route=>route.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/XioAAAAASUVORK5CYII=','base64')}));
 await page.route('https://openlibrary.org/search.json?**',route=>route.fulfill({json:{docs:[{key:'/works/OL250123W',title:'The Little Prince',author_name:['Antoine de Saint-Exupéry'],first_publish_year:1943,language:['eng'],subject:['Fiction'],cover_i:123}],numFound:1}}));
 await page.route('https://openlibrary.org/works/OL250123W.json',route=>route.fulfill({json:{description:{value:'A pilot meets a young prince from a distant asteroid.'}}}));
 await page.route('https://openlibrary.org/works/OL250123W/editions.json**',route=>route.fulfill({json:{entries:[{key:'/books/OL1M',title:'The Little Prince',publishers:['Reynal & Hitchcock'],publish_date:'1943',isbn_10:['0156012197'],isbn_13:['9780156012195'],number_of_pages:96}]}}));
 await start(page);
 await page.locator('.catalog-source-card').filter({hasText:'Open Library'}).click();
 const search=page.getByRole('textbox',{name:'Search books'});await search.fill('The Little Prince');
 const result=page.locator('.catalog-result-card').filter({hasText:'The Little Prince'}).first();await expect(result).toBeVisible();
 const resultCover=result.locator('.catalog-result-cover img');await expect(resultCover).toHaveAttribute('src',/123-M\.jpg\?default=false/);
 const quality=page.getByRole('radiogroup',{name:'Cover image size'});await quality.getByText('HD',{exact:true}).click();
 await expect(resultCover).toHaveAttribute('src',/123-L\.jpg\?default=false/);
 expect(await page.evaluate(()=>localStorage.getItem('sela:app:cover-quality'))).toBe('hd');
 await result.getByRole('button',{name:'Open details for The Little Prince'}).click();
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 expect(await dialog.evaluate(element=>{const rect=element.getBoundingClientRect();return rect.left>=0&&rect.right<=innerWidth+1&&rect.top>=0&&rect.bottom<=innerHeight+1;})).toBe(true);
 await expect(dialog.locator('.catalog-detail-cover img')).toHaveAttribute('src',/123-L\.jpg\?default=false/);
 await expect(dialog).toContainText('A pilot meets a young prince from a distant asteroid.');
 await expect(dialog).toContainText('ISBN-13 9780156012195');await expect(dialog).toContainText('ISBN-10 0156012197');
 const shop=dialog.getByRole('link',{name:'Search shop listings'});await expect(shop).toHaveAttribute('href',/tbm=shop/);await expect(shop).toHaveAttribute('target','_blank');
 const downloadPromise=page.waitForEvent('download');await dialog.getByRole('button',{name:'Download cover · HD'}).click();const download=await downloadPromise;
 expect(download.suggestedFilename()).toMatch(/-HD\.png$/);expect(coverRequests.at(-1)).toMatch(/123-L\.jpg\?default=false/);
 await page.setViewportSize({width:393,height:852});await expect(dialog).toBeVisible();
 expect(await dialog.evaluate(element=>{const rect=element.getBoundingClientRect();return rect.left>=0&&rect.right<=innerWidth+1&&rect.top>=0&&rect.bottom<=innerHeight+1;})).toBe(true);
 expect(await dialog.locator('.catalog-detail-cover').evaluate(cover=>{const frame=cover.getBoundingClientRect(),image=cover.querySelector('img');if(!image)return true;const rect=image.getBoundingClientRect();return rect.left>=frame.left-1&&rect.top>=frame.top-1&&rect.right<=frame.right+1&&rect.bottom<=frame.bottom+1;})).toBe(true);
 await expect(dialog.getByRole('heading',{name:'About this book'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await dialog.press('Escape');await expect(dialog).toBeHidden();
});
