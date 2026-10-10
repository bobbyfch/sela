import {test,expect} from '@playwright/test';
const android='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36';
test('mobile appearance lives in settings and cloud sharing has a truthful fallback',async({browser})=>{
 const c=await browser.newContext({userAgent:android,viewport:{width:320,height:740},serviceWorkers:'block'});const page=await c.newPage();
 await page.addInitScript(()=>{Object.defineProperty(navigator,'canShare',{value:()=>false,configurable:true});});await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await expect(page.locator('.topbar #theme')).toHaveCount(0);await expect(page.locator('#theme')).toBeHidden();
 await page.getByRole('button',{name:'Settings',exact:true}).click();await expect(page.locator('#theme')).toBeVisible();await expect(page.locator('#language')).toBeVisible();
 await page.locator('#theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'Share backup',exact:true}).click();await expect(page.locator('#status')).toContainText('Download the backup');
 await expect(page.locator('.cloud-backup a')).toHaveCount(2);
 await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','id');await expect(page.locator('.settings-page h2')).toHaveText('Pengaturan');
 await page.locator('[data-tab=home]').click();await expect(page.locator('#theme')).toBeHidden();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/reader-mobile-home.png',fullPage:true});await c.close();
});
test('reader-first landing keeps the cover demo, local file picker and product order',async({page})=>{
 await page.goto('/?geo=off');await expect(page.locator('#products article').first()).toHaveAttribute('id','install-mobile');
 await expect(page.locator('.reader-illustration img')).toBeVisible();await expect(page.locator('.trial-upload')).toBeVisible();
 await page.locator('#pdf-file').setInputFiles({name:'my.txt',mimeType:'text/plain',buffer:Buffer.from('A local book')});await expect(page.locator('#file-name')).toContainText('my.txt');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.locator('.trial-book').click();await expect(page.locator('.library-reader-overlay')).toBeVisible();
});

