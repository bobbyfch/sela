import {test,expect} from '@playwright/test';
test('app reader owns its chrome, settings, modes and palettes at phone, tablet and desktop sizes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Rose',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-palette','rose');
 await page.reload();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await expect(page.locator('html')).toHaveAttribute('data-palette','rose');
 await page.getByRole('button',{name:'Read sample',exact:true}).click();const app=page.locator('[data-product-reader=app]');await expect(app).toBeVisible();
 await expect(app.locator('.library-reader-header')).toBeHidden();await expect(app.locator('.library-reader-footer')).toBeHidden();await expect(app.locator('.app-reading-title')).toContainText('Yang Tidak Ikut Pulang');
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});await expect(app.locator('.app-reading-top')).toBeVisible();expect(await app.evaluate(el=>el.scrollWidth<=innerWidth)).toBe(true);}
 await app.getByRole('button',{name:'Next page',exact:true}).click();await expect(app.locator('.app-reading-position output')).toHaveText('2 / 50');
 await app.getByRole('button',{name:'Bookmark page',exact:true}).click();await expect(app.getByRole('button',{name:'Bookmark page',exact:true})).toHaveAttribute('aria-pressed','true');
 await app.getByRole('button',{name:'Reader settings',exact:true}).click();await app.getByLabel('Reading mode',{exact:true}).selectOption('webtoon');await expect(app.locator('.app-reading-position output')).toHaveText('2 / 50');await expect(app.locator('.flippy-webtoon')).toBeVisible();
 await app.getByLabel('Page fit',{exact:true}).selectOption('width');await app.getByRole('button',{name:'Paper',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-palette','paper');
 await page.keyboard.press('Escape');await expect(app.locator('.app-reading-settings')).toBeHidden();await expect(app).toBeVisible();
 await app.getByRole('button',{name:'Contents & bookmarks',exact:true}).click();await expect(app.getByRole('tab',{name:'Contents',exact:true})).toHaveAttribute('aria-selected','true');await expect(app.getByRole('button',{name:'12. Sebelum Rekaman Dimulai',exact:true})).toBeVisible();
 await expect(app.getByRole('button',{name:'Bookmarked page 2',exact:true})).toBeVisible();
 await app.locator('.app-tools-close').click();await app.getByRole('button',{name:'Back to library',exact:true}).click();await expect(app).toHaveCount(0);expect(errors).toEqual([]);
 await page.goto('/?geo=off');await page.locator('.trial-book').click();await expect(page.locator('.library-reader-header')).toBeVisible();await expect(page.locator('.app-reading-top')).toHaveCount(0);
});
