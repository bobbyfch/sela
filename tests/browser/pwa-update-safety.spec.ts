import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {readBackupArchive} from '../../dist/js/sela.archive.js';

async function start(page){
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'})));
 await page.goto('/app/');
 await expect(page.locator('.sela-app')).toBeVisible();
}

async function addTextBook(page,name:string,text:string){
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({name,mimeType:'text/plain',buffer:Buffer.from(text)});
 await expect(page.locator('.book-card')).toHaveCount(1);
}

async function settingsData(page){
 await page.goto('/app/#/settings/data');
 await expect(page.locator('.settings-detail')).toBeVisible();
}

async function mockWaitingUpdate(page){
 await page.addInitScript(()=>{
  window.updateMessages=[];
  Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{
   controller:null,
   ready:Promise.resolve(),
   register:async()=>({waiting:{postMessage(message){window.updateMessages.push(message);}},update:async()=>{},addEventListener(){}}),
   addEventListener(){},
  }});
 });
}

test('app update waits for restore validation, then preserves the original shelf files',async({page})=>{
 await mockWaitingUpdate(page);
 await start(page);
 await addTextBook(page,'Backup.txt','An original to preserve.');
 await settingsData(page);
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export backup',exact:true}).click();
 const bytes=await readFile(await(await download).path());
 const originalArchive=readBackupArchive(new Uint8Array(bytes));
 const originalBookPath=Object.keys(originalArchive).find(path=>path.startsWith('books/'))!;
 const originalBookBytes=Buffer.from(originalArchive[originalBookPath]);
 await page.evaluate(()=>{
  const digest=crypto.subtle.digest.bind(crypto.subtle);
  crypto.subtle.digest=(...args)=>new Promise((resolve,reject)=>{window.finishBackupValidation=()=>digest(...args).then(resolve,reject);});
 });
 await page.locator('.settings-detail input[type="file"]').setInputFiles({name:'backup.zip',mimeType:'application/zip',buffer:Buffer.from(bytes)});
 await expect(page.getByRole('button',{name:'Restore backup or transfer'})).toBeDisabled();
 await expect(page.locator('.settings-detail')).toHaveAttribute('data-pwa-busy','true');
 await expect.poll(()=>page.evaluate(()=>typeof window.finishBackupValidation)).toBe('function');
 await expect(page.locator('.pwa-notice')).toBeVisible();
 await page.getByRole('button',{name:'Update now',exact:true}).click();
 expect(await page.evaluate(()=>window.updateMessages.filter(message=>message.type==='ACTIVATE_UPDATE'))).toEqual([]);
 await expect(page.locator('.pwa-notice')).toContainText('active action');
 await page.evaluate(()=>window.finishBackupValidation());
 await expect(page.getByRole('button',{name:'Restore backup or transfer'})).toBeEnabled();
 await expect(page.locator('.settings-detail')).not.toHaveAttribute('data-pwa-busy','true');
 await page.getByRole('button',{name:'Update now',exact:true}).click();
 expect(await page.evaluate(()=>window.updateMessages.filter(message=>message.type==='ACTIVATE_UPDATE'))).toEqual([{type:'ACTIVATE_UPDATE'}]);
 await page.getByRole('button',{name:'Later',exact:true}).click();
 await settingsData(page);
 const restoredDownload=page.waitForEvent('download');
 await page.getByRole('button',{name:'Export backup',exact:true}).click();
 const restoredBytes=await readFile(await(await restoredDownload).path());
 const restoredArchive=readBackupArchive(new Uint8Array(restoredBytes));
 expect(Buffer.from(restoredArchive[originalBookPath])).toEqual(originalBookBytes);
});

for(const action of ['Export backup','Share backup'])test(`app update waits while ${action.toLowerCase()} reads original book bytes`,async({page})=>{
 await mockWaitingUpdate(page);
 await page.addInitScript(()=>Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false}));
 await start(page);
 await addTextBook(page,'Original.txt','Keep the backup operation uninterrupted.');
 await settingsData(page);
 await page.evaluate(()=>{
  const read=Blob.prototype.arrayBuffer;
  Blob.prototype.arrayBuffer=function(){return new Promise((resolve,reject)=>{window.releaseBackupRead=()=>read.call(this).then(resolve,reject);});};
 });
 const actionButton=page.getByRole('button',{name:action,exact:true});
 await actionButton.click();
 await expect(actionButton).toBeDisabled();
 await expect(page.locator('.settings-detail')).toHaveAttribute('data-pwa-busy','true');
 await expect.poll(()=>page.evaluate(()=>typeof window.releaseBackupRead)).toBe('function');
 await expect(page.locator('.pwa-notice')).toBeVisible();
 await page.getByRole('button',{name:'Update now',exact:true}).click();
 expect(await page.evaluate(()=>window.updateMessages.filter(message=>message.type==='ACTIVATE_UPDATE'))).toEqual([]);
 await page.evaluate(()=>window.releaseBackupRead());
 await expect(actionButton).toBeEnabled();
 await expect(page.locator('.settings-detail')).not.toHaveAttribute('data-pwa-busy','true');
 await page.getByRole('button',{name:'Update now',exact:true}).click();
 expect(await page.evaluate(()=>window.updateMessages.filter(message=>message.type==='ACTIVATE_UPDATE'))).toEqual([{type:'ACTIVATE_UPDATE'}]);
});
