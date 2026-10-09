import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test('dedicated room stores and deduplicates books, searches, opens, exports and undoes removal',async({page})=>{
 await page.goto('/extension/library.html');
 await expect(page.locator('#clock')).not.toHaveText('--:--');
 const file={name:'A quiet book.txt',mimeType:'text/plain',buffer:Buffer.from('Sela: a quiet story to keep offline.')};
 await page.locator('#books').setInputFiles(file);await expect(page.locator('.book')).toHaveCount(1);await expect(page.locator('#books')).toBeEnabled();
 await page.locator('#books').setInputFiles(file);await expect(page.locator('#status')).toContainText('already on shelf');await expect(page.locator('.book')).toHaveCount(1);
 await page.locator('#search').fill('missing');await expect(page.locator('.book')).toHaveCount(0);await page.locator('#search').fill('quiet');await expect(page.locator('.book')).toHaveCount(1);
 await page.getByRole('button',{name:'Read A quiet book',exact:true}).click();await expect(page.locator('.flippy-epub article')).toContainText('quiet story');await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Book options: A quiet book',exact:true}).click();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export original',exact:true}).click();expect(await readFile(await(await download).path(),'utf8')).toContain('quiet story');
 await page.getByRole('button',{name:'Remove',exact:true}).click();await expect(page.locator('.book')).toHaveCount(0);await page.locator('#undo').click();await expect(page.locator('.book')).toHaveCount(1);
 await page.reload();await expect(page.locator('.book')).toHaveCount(1);
});

test('library mobile light/dark and Indonesian preserve usable two-column shelf without overflow',async({page})=>{
 await page.goto('/extension/library.html');await page.locator('#books').setInputFiles([{name:'First.txt',mimeType:'text/plain',buffer:Buffer.from('First book')},{name:'Second.txt',mimeType:'text/plain',buffer:Buffer.from('Second book')}]);await expect(page.locator('.book')).toHaveCount(2);
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:844});for(const colorScheme of ['light','dark']){await page.emulateMedia({colorScheme});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const b=await page.locator('.cover').first().boundingBox();expect(b.width).toBeGreaterThan(90);}}
 await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','id');await expect(page.locator('h1')).toHaveText('Ada tempat untuk kembali.');
 await page.screenshot({path:'test-results/library-id.png',fullPage:true});
});

test('PDF cover is a locally rendered thumbnail and sample has eight navigable chapters',async({page})=>{
 await page.goto('/extension/library.html');await page.locator('#sample').click();await expect(page.locator('.cover img')).toBeVisible({timeout:30000});await expect(page.locator('#books')).toBeEnabled();
  await page.locator('.cover').click();await expect(page.locator('.library-reader-footer input[type=range]')).toHaveAttribute('max','33');await page.getByRole('button',{name:'Reading tools',exact:true}).click();await expect(page.getByRole('button',{name:'8. Sebentar Sebelum Pulang',exact:true})).toBeVisible();await page.getByRole('button',{name:'8. Sebentar Sebelum Pulang',exact:true}).click();await expect(page.locator('.library-reader-page-form input')).toHaveValue('28');
});

test('concurrent inline readers keep page scrolling and scope keyboard navigation to focus',async({page})=>{
 await page.goto('/');await page.evaluate(async()=>{await SelaReady;for(const id of ['one','two']){const host=document.createElement('div');host.id=id;host.style.height='520px';document.body.append(host);const r=new Sela({url:'/example/sebentar-sebelum-pulang.pdf',presentation:'inline',container:host,language:'en',duration:0});window[id]=r;await r.open();}});
 await expect(page.locator('.sela-inline')).toHaveCount(2);expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');await expect(page.locator('#one .sela-inline')).not.toHaveAttribute('aria-modal','true');
 await page.locator('#one .library-reader-close').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#one .library-reader-page-form input')).toHaveValue('2');await expect(page.locator('#two .library-reader-page-form input')).toHaveValue('1');
 await page.locator('#one .library-reader-close').click();await expect(page.locator('#one .sela-inline')).toHaveCount(0);await expect(page.locator('#two .sela-inline')).toHaveCount(1);
});

test('Pages is viewer-only and provides inline presentation',async({page})=>{
 await page.goto('/');await expect(page.locator('#open-shelf')).toHaveCount(0);await page.locator('#demo-presentation').selectOption('inline');await page.locator('.launch-reader').click();await expect(page.locator('#embedded-reader .sela-inline')).toBeVisible();expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
});
