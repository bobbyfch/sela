import {test,expect} from '@playwright/test';
test('app reader owns its chrome, settings, modes and palettes at phone, tablet and desktop sizes',async({page})=>{
 test.setTimeout(90_000);
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));await page.route(/^https:\/\/proxy\.cors\.dev\/https:\/\/www\.theguardian\.com\//,route=>route.fulfill({contentType:'application/rss+xml',body:'<rss><channel/></rss>'}));
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true',{timeout:15000});
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Reading & appearance',exact:true}).click();await page.getByRole('button',{name:'Sakura',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-palette','sakura');
 await page.reload();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await expect(page.locator('html')).toHaveAttribute('data-palette','sakura');
 await page.getByRole('button',{name:'Read sample',exact:true}).click();const app=page.locator('[data-product-reader=app]');await expect(app).toBeVisible({timeout:15000});expect(requests.some(url=>url.endsWith('/library/reader-shell.js'))).toBe(false);expect(requests.filter(url=>url.endsWith('/dist/js/sela.app.js'))).toHaveLength(1);
 await expect(app.locator('.library-reader-header')).toHaveCount(0);await expect(app.locator('.library-reader-footer')).toHaveCount(0);await expect(app.locator('.app-reading-title')).toContainText('Yang Tidak Ikut Pulang');
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});await expect(app.locator('.app-reading-top')).toBeVisible();expect(await app.evaluate(el=>el.scrollWidth<=innerWidth)).toBe(true);}
 await app.getByRole('button',{name:'Next page',exact:true}).click();await expect(app.locator('.app-reading-position output')).toHaveText('2 / 50');
 await app.getByRole('button',{name:'Bookmark page',exact:true}).click();await expect(app.getByRole('button',{name:'Bookmark page',exact:true})).toHaveAttribute('aria-pressed','true');
 await app.getByRole('button',{name:'Reader settings',exact:true}).click();await expect(app.locator('.reader-audio-card')).toBeVisible();await expect(app.locator('.reader-room-card')).toBeVisible();await expect(app.locator('.reader-audio-card details,.reader-room-card details')).toHaveCount(0);await expect(app.locator('.reader-audio-card [aria-pressed]')).toHaveCount(4);await expect(app.locator('.reader-room-card [data-ambience]')).toHaveCount(4);await app.locator('[aria-label="Reading mode"] [data-choice="webtoon"]').click();await expect(page.locator('.app-reading-position output')).toHaveText('2 / 50');await expect(app.locator('.sela-webtoon')).toBeVisible();
 await app.locator('[aria-label="Page fit"] [data-choice="width"]').click();await app.getByRole('button',{name:'Samudra',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-palette','ocean');
 await page.keyboard.press('Escape');await expect(app.locator('.app-reading-settings').first()).toBeHidden();await expect(app).toBeVisible();
 await app.getByRole('button',{name:'Contents & bookmarks',exact:true}).click();await expect(app.getByRole('tab',{name:'Contents',exact:true})).toHaveAttribute('aria-selected','true');await expect(app.getByRole('button',{name:'12. Sebelum Rekaman Dimulai',exact:true})).toBeVisible();
 await expect(app.getByRole('button',{name:'Bookmarked page 2',exact:true})).toBeVisible();
 await app.getByRole('button',{name:'Close tools',exact:true}).click();await app.getByRole('button',{name:'Back to library',exact:true}).click();await expect(app).toHaveCount(0);expect(errors).toEqual([]);
 await page.goto('/?geo=off');await page.locator('.trial-book').click();await expect(page.locator('.library-reader-header')).toHaveCount(0);await expect(page.locator('.app-reading-top')).toBeVisible();
});
test('reader translation payload loads only for a supported non-English app language',async({page})=>{
 const requests=[];page.on('request',request=>requests.push(request.url()));
 await page.route('https://api.github.com/search/repositories?**',route=>route.fulfill({json:{total_count:1,items:[{id:1,name:'Japanese-Book',description:'A Translation Sample by A Writer is a Project Gutenberg book, now on Github.',default_branch:'main',owner:{login:'GITenberg'}}]}}));
 await page.route('https://api.github.com/repos/GITenberg/Japanese-Book/contents/',route=>route.fulfill({json:[{type:'file',name:'1.txt',download_url:'https://raw.githubusercontent.com/GITenberg/Japanese-Book/main/1.txt'}]}));
 await page.route('https://raw.githubusercontent.com/GITenberg/Japanese-Book/main/1.txt',route=>route.fulfill({body:'A Japanese reader translation sample.'}));
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await page.locator('[data-tab=settings]').click();await page.locator('#language').selectOption('ja-JP');
 await page.locator('[data-tab=browse]').click();await page.locator('.open-catalog').getByRole('button',{name:'GITenberg',exact:true}).click();await expect(page.locator('.open-book-cover').first()).toHaveAttribute('aria-label',/A Translation Sample$/);await page.locator('.open-book-cover').click();await page.locator('.control-sheet[open] .book-detail-read').click();
 const app=page.locator('[data-product-reader=app]');await expect(app).toBeVisible({timeout:15000});
 await expect.poll(()=>requests.some(url=>url.endsWith('/dist/js/sela.locales.js'))).toBe(true);
 await app.getByRole('button',{name:'読書設定',exact:true}).click();await app.locator('.app-advanced').click();await expect(app.locator('.sela-tools')).toContainText('目次');
 await expect(app.locator('.sela-notice')).not.toHaveText('Using English translations.');
 await app.getByRole('button',{name:'本棚に戻る',exact:true}).click();
});
