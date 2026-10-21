import {test,expect} from '@playwright/test';
test.use({serviceWorkers:'allow'});
async function waitForAppWorker(page){
 await page.evaluate(async()=>{
  await navigator.serviceWorker.ready;
  if(!navigator.serviceWorker.controller)await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}));
 });
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
}
test('PWA receives shared files locally, acknowledges successful imports and keeps originals offline',async({page,browserName,context})=>{
 test.skip(browserName!=='chromium','Native share target is a Chromium capability');await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();await waitForAppWorker(page);
 const result=await page.evaluate(async()=>{const form=new FormData();form.append('books',new File(['Shared locally, not uploaded to a server.'],'shared.txt',{type:'text/plain'}));const response=await fetch('./share',{method:'POST',body:form});return {status:response.status,url:response.url};});expect(result.url).toContain('incoming=1');
 await page.goto(result.url);await expect(page.locator('.reader-body')).toContainText('Shared locally');await page.getByRole('button',{name:'Kembali ke rak'}).click();await page.getByRole('link',{name:'Rak buku'}).first().click();await expect(page.locator('.book-card')).toHaveCount(1);
 const pending=await page.evaluate(()=>new Promise(resolve=>{const req=indexedDB.open('sela-incoming',1);req.onsuccess=()=>{const db=req.result,r=db.transaction('files').objectStore('files').get('pending');r.onsuccess=()=>{resolve(r.result);db.close();};};}));expect(pending).toBeUndefined();
 await context.setOffline(true);await page.reload();await page.goto('/app/#/shelf');await page.locator('.book-cover-button').click();await expect(page.locator('.reader-body')).toContainText('Shared locally');
});
test('malformed shared files do not create books and show an actionable message',async({page,browserName})=>{
 test.skip(browserName!=='chromium','Native share target is a Chromium capability');await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();await waitForAppWorker(page);
 await page.evaluate(async()=>{const form=new FormData();form.append('books','not a file');await fetch('./share',{method:'POST',body:form});});await page.goto('/app/?incoming=error');await expect(page.locator('#app-offline-status')).toContainText(/Could not receive|belum dapat diterima/);await page.goto('/app/#/shelf');await expect(page.locator('.book-card')).toHaveCount(0);
});

test('consecutive shares queue separately without overwriting unread originals',async({page,browserName})=>{
 test.skip(browserName!=='chromium','Native share target is a Chromium capability');await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();await waitForAppWorker(page);
 const urls=await page.evaluate(async()=>{const urls=[];for(const name of ['first','second']){const form=new FormData();form.append('books',new File([name+' shared original'],name+'.txt',{type:'text/plain'}));urls.push((await fetch('./share',{method:'POST',body:form})).url);}return urls;});expect(urls[0]).not.toBe(urls[1]);
 for(const url of urls){await page.goto(url);await expect(page.locator('.reader-body')).toContainText('shared original');await page.getByRole('button',{name:'Kembali ke rak'}).click();}
 await page.goto('/app/#/shelf');await expect(page.locator('.book-card')).toHaveCount(2);
});
