import {test,expect} from '@playwright/test';
const android='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36';

test('mobile appearance and backup share fallback use the current settings screens',async({browser})=>{
 const context=await browser.newContext({userAgent:android,viewport:{width:320,height:740},serviceWorkers:'block'});const page=await context.newPage();
 await page.addInitScript(()=>{localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'}));Object.defineProperty(navigator,'canShare',{value:()=>false,configurable:true});});
 await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
 await page.getByRole('button',{name:'Switch to dark mode'}).click();await expect(page.locator('.sela-app')).toHaveAttribute('data-appearance','dark');
 await page.goto('/app/#/settings/appearance');await expect(page.getByRole('combobox',{name:'Color theme'})).toBeVisible();
 await page.goto('/app/#/settings/data');const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Share backup',exact:true}).click();
 const download=await downloadPromise;expect(download.suggestedFilename()).toMatch(/^sela-library-.*\.zip$/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});

test('public page offers the local file trial and remains readable at phone and desktop widths',async({page})=>{
 await page.goto('/?geo=off');await expect(page.locator('.hero-copy h1')).toBeVisible();await expect(page.locator('.paper-still-life img')).toBeVisible();await expect(page.locator('.trial-upload')).toBeVisible();
 await page.locator('#pdf-file').setInputFiles({name:'my.txt',mimeType:'text/plain',buffer:Buffer.from('A local book')});await expect(page.locator('#file-name')).toContainText('my.txt');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`public page overflows at ${width}px`).toBe(true);}
});

test('dark app appearance opens a readable React reader with controls visible',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',theme:'vanilla',appearance:'dark'})));
 await page.setViewportSize({width:1440,height:900});await page.goto('/app/');await expect(page.locator('.sela-app')).toHaveAttribute('data-appearance','dark');
 await page.getByRole('button',{name:/^(?:Download & read sample|Read sample|Unduh & baca contoh|Baca contoh)$/}).click();const reader=page.locator('.reader-layout');await expect(reader).toBeVisible();
 await expect(reader.locator('.reader-chrome-top')).toBeVisible();await expect(reader.locator('.reader-chrome-bottom')).toBeVisible();await expect(reader.getByRole('button',{name:'Reading desk',exact:true})).toBeVisible();
 await expect(reader.locator('.reader-body')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
