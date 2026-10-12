import {test,expect} from '@playwright/test';
test.use({serviceWorkers:'allow'});
test('PWA receives shared files locally, acknowledges successful imports and keeps originals offline',async({page,browserName,context})=>{
 test.skip(browserName!=='chromium','Native share target is a Chromium capability');await page.goto('/mobile/');await expect(page.locator('#mobile-offline-status')).toContainText('Bookshelf ready');await page.reload();
 const result=await page.evaluate(async()=>{const form=new FormData();form.append('books',new File(['Shared locally, not uploaded to a server.'],'shared.txt',{type:'text/plain'}));const response=await fetch('./share',{method:'POST',body:form});return {status:response.status,url:response.url};});expect(result.url).toContain('incoming=1');
 await page.goto(result.url);await expect(page.locator('.sela-epub article')).toContainText('Shared locally');await page.getByRole('button',{name:'Back to library'}).click();await page.getByRole('button',{name:'Shelf',exact:true}).click();await expect(page.locator('.book')).toHaveCount(1);
 const pending=await page.evaluate(()=>new Promise(resolve=>{const req=indexedDB.open('sela-incoming',1);req.onsuccess=()=>{const db=req.result,r=db.transaction('files').objectStore('files').get('pending');r.onsuccess=()=>{resolve(r.result);db.close();};};}));expect(pending).toBeUndefined();
 await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'Shelf',exact:true}).click();await page.locator('.cover').click();await expect(page.locator('.sela-epub article')).toContainText('Shared locally');
});
test('malformed shared files do not create books and show an actionable message',async({page,browserName})=>{
 test.skip(browserName!=='chromium','Native share target is a Chromium capability');await page.goto('/mobile/');await expect(page.locator('#mobile-offline-status')).toContainText('Bookshelf ready');await page.reload();
 await page.evaluate(async()=>{const form=new FormData();form.append('books','not a file');await fetch('./share',{method:'POST',body:form});});await page.goto('/mobile/?incoming=error');await expect(page.locator('#mobile-offline-status')).toContainText('Could not receive');await page.getByRole('button',{name:'Shelf',exact:true}).click();await expect(page.locator('.book')).toHaveCount(0);
});

test('consecutive shares queue separately without overwriting unread originals',async({page,browserName})=>{
 test.skip(browserName!=='chromium','Native share target is a Chromium capability');await page.goto('/mobile/');await expect(page.locator('#mobile-offline-status')).toContainText('Bookshelf ready');await page.reload();
 const urls=await page.evaluate(async()=>{const urls=[];for(const name of ['first','second']){const form=new FormData();form.append('books',new File([name+' shared original'],name+'.txt',{type:'text/plain'}));urls.push((await fetch('./share',{method:'POST',body:form})).url);}return urls;});expect(urls[0]).not.toBe(urls[1]);
 for(const url of urls){await page.goto(url);await expect(page.locator('.sela-epub article')).toContainText('shared original');await page.getByRole('button',{name:'Back to library'}).click();}
 await page.getByRole('button',{name:'Shelf',exact:true}).click();await expect(page.locator('.book')).toHaveCount(2);
});
