import {test,expect} from '@playwright/test';
import {setTopbarAppearance} from './topbar-helpers.ts';
import {readFile} from 'node:fs/promises';
import {readBackupArchive} from '../../dist/js/sela.archive.js';

async function start(page){
 await page.addInitScript(()=>{if(!localStorage.getItem('sela:app:preferences'))localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'}));});
 await page.goto('/app/');
 await expect(page.locator('.sela-app')).toBeVisible();
}

async function importText(page,name,text){
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({name,mimeType:'text/plain',buffer:Buffer.from(text)});
}

test('local books import, search, open, and remain on the shelf after duplicate imports',async({page})=>{
 await start(page);
 await importText(page,'Alpha.txt','Alpha original words stay on this device.');
 await expect(page.locator('.book-card')).toHaveCount(1);
 await importText(page,'Beta.txt','A second book for shelf search.');
 await expect(page.locator('.book-card')).toHaveCount(2);
 await importText(page,'Alpha.txt','Alpha original words stay on this device.');
 await expect(page.locator('.book-card')).toHaveCount(2);
 await page.goto('/app/#/shelf');
 const search=page.getByRole('textbox',{name:'Search your shelf'});
 await search.fill('Beta');
 await expect(page.locator('.book-card')).toHaveCount(1);
 await expect(page.getByRole('button',{name:'Open Beta',exact:true})).toBeVisible();
 await search.fill('');
 await page.getByRole('button',{name:'Open Alpha',exact:true}).click();
 const reader=page.locator('.reader-layout');
 await expect(reader).toBeVisible();
 await expect(reader.locator('.reader-body')).toContainText('Alpha original words');
 await reader.getByRole('button',{name:'Back to shelf',exact:true}).click();
 await expect(reader).toHaveCount(0);
});

test('shelf cards, search and controls fit common phone, tablet and desktop widths',async({page})=>{
 await start(page);
 await importText(page,'First.txt','First book.');
 await importText(page,'Second.txt','Second book.');
 await page.goto('/app/#/shelf');
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:850});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px document overflow`).toBe(true);
  await expect.poll(()=>page.locator('.book-grid').evaluate(element=>element.scrollWidth<=element.clientWidth+1),`${width}px shelf overflow`).toBe(true);
  await expect(page.getByRole('radiogroup',{name:'Shelf view'})).toBeVisible();
 }
});

test('appearance mode and paper theme remain separate preferences',async({page})=>{
 await start(page);
 await page.goto('/app/#/settings/appearance');
 const app=page.locator('.sela-app');
 await expect(app).toHaveAttribute('data-theme','vanilla');
 await setTopbarAppearance(page,'dark');
 await expect(app).toHaveAttribute('data-appearance','dark');
 await expect(app).toHaveAttribute('data-theme','vanilla');
 await page.getByRole('combobox',{name:'Color theme'}).click();
 await page.getByRole('option',{name:'Olive',exact:true}).click();
 await expect(app).toHaveAttribute('data-theme','olive');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela:app:preferences')||'{}'))).toMatchObject({appearance:'dark',theme:'olive'});
});

test('backup export contains the imported book bytes and leaves the shelf intact',async({page})=>{
 await start(page);
 await importText(page,'Local.txt','Backup preserves these original bytes.');
 await page.goto('/app/#/settings/data');
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export backup',exact:true}).click();
 const bytes=await readFile(await(await download).path());
 const entries=readBackupArchive(new Uint8Array(bytes));
 const bookPath=Object.keys(entries).find(path=>path.startsWith('books/'));
 expect(bookPath).toBeTruthy();
 expect(new TextDecoder().decode(entries[bookPath])).toBe('Backup preserves these original bytes.');
 await expect(page.locator('.settings-detail')).not.toHaveAttribute('data-pwa-busy','true');
 await page.goto('/app/#/shelf');
 await expect(page.locator('.book-card')).toHaveCount(1);
});
