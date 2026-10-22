import {test,expect} from '@playwright/test';
import {openSettingsCategory} from './settings-helpers.ts';
import {VERSION} from '../../app/library/version.ts';

test('topbar icons remain centered and collection dialogs return keyboard focus',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'})));
 await page.setViewportSize({width:393,height:852});await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
 for(const width of [320,393,768,1440]){
  await page.setViewportSize({width,height:852});
  const buttons=page.locator('.topbar-actions .glass-control');
  for(let index=0;index<await buttons.count();index++){
   const button=buttons.nth(index);if(!(await button.isVisible()))continue;
   const icon=button.locator('svg,.topbar-flag');await expect(icon).toHaveCount(1);
   const centered=await button.evaluate(element=>{const button=element.getBoundingClientRect(),icon=element.querySelector('svg,.topbar-flag')!.getBoundingClientRect();return Math.abs(button.left+button.width/2-icon.left-icon.width/2)<1&&Math.abs(button.top+button.height/2-icon.top-icon.height/2)<1;});
   expect(centered,`topbar icon centered at ${width}px`).toBe(true);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`topbar overflow at ${width}px`).toBe(true);
 }
 await page.goto('/app/#/shelf');const trigger=page.getByRole('button',{name:'New collection',exact:true});await trigger.click();
 const dialog=page.getByRole('dialog',{name:'Create a collection',exact:true});await dialog.getByRole('textbox',{name:'Collection name'}).fill('Focus test');await page.keyboard.press('Escape');
 await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();
});

test('large shelves render in batches and search finds books beyond the visible batch',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'})));
 await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
 await page.evaluate(async()=>{
  const request=indexedDB.open('sela-private-library',3),db=await new Promise<IDBDatabase>((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  await new Promise<void>((resolve,reject)=>{const tx=db.transaction('books','readwrite');for(let i=0;i<1000;i++)tx.objectStore('books').put({id:i.toString(16).padStart(64,'0'),name:'Book '+String(i).padStart(4,'0'),filename:'book.txt',format:'txt',size:64,saved:i,tags:[]});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
 });
 await page.reload();await page.goto('/app/#/shelf');await expect(page.locator('.book-card')).toHaveCount(80);await page.getByRole('button',{name:/More books/}).click();await expect(page.locator('.book-card')).toHaveCount(160);
 const search=page.getByRole('textbox',{name:'Search your shelf'});await search.fill('Book 0912');await expect(page.locator('.book-card')).toHaveCount(1);await expect(page.getByRole('button',{name:'Open Book 0912',exact:true})).toBeVisible();
 await search.fill('');await expect(page.locator('.book-card')).toHaveCount(80);
});

test('app themes stay separate from Reader materials and About details stay readable',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'})));
 await page.setViewportSize({width:393,height:852});await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
 await openSettingsCategory(page,'Appearance & shelf');const app=page.locator('.sela-app');await expect(app).toHaveAttribute('data-theme','vanilla');
 await expect(page.locator('.room-material-picker')).toHaveCount(0);await page.getByRole('combobox',{name:'Color theme'}).click();await page.getByRole('option',{name:'Cocoa',exact:true}).click();await expect(app).toHaveAttribute('data-theme','cocoa');
 for(const width of [320,393,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`appearance overflow at ${width}px`).toBe(true);}
 await page.goto('/app/#/settings');const about=page.locator('.about-sela-card');await expect(about).toBeVisible();await expect(about).toContainText(VERSION);await expect(about).toContainText('Bobby Fajar Christian');
 await expect(about.getByRole('link',{name:'GitHub'})).toHaveAttribute('href','https://github.com/bobbyfch/sela');await expect(about.getByRole('link',{name:'Third-party notices'})).toHaveAttribute('rel','noopener noreferrer');
});

test('SDK host commands and diagnostics expose no document secrets',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{const {default:Sela}=await import('/dist/js/sela.esm.js');const {mountReaderCommands,mountReaderDebug}=await import('/dist/js/sela.host.js');const viewer=new Sela({url:'/private.pdf?token=secret',httpHeaders:{Authorization:'secret'}});let ran=0;const container=document.createElement('section');document.body.append(container);const commands=mountReaderCommands(viewer,container,[{id:'annotate',label:'Annotate',run:()=>{ran++;}}]);const debug=mountReaderDebug(viewer,container);container.querySelector('button')!.click();viewer.dispatchEvent(new CustomEvent('error',{detail:{error:new Error('secret')}}));const safe=!container.textContent!.includes('secret');viewer.destroy();commands();debug();const remaining=container.children.length;container.remove();return {safe,ran,remaining};});expect(result).toEqual({safe:true,ran:1,remaining:0});
});

test('legacy SDK palette aliases resolve to their current paper colors',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{const {default:Sela}=await import('/dist/js/sela.esm.js');const values:Record<string,string[]>={};for(const palette of ['walnut','oak','linen'] as const){const viewer=new Sela({format:'txt',palette,theme:'light',persistPreferences:false});await viewer.open(new Blob(['A quiet material test.']));values[palette]=[viewer.overlay!.dataset.palette,getComputedStyle(viewer.overlay!).getPropertyValue('--bg').trim(),getComputedStyle(viewer.overlay!).getPropertyValue('--accent').trim()];viewer.destroy();}return values;});
 expect(result).toEqual({walnut:['senja','#f2eee4','#754e3d'],oak:['forest','#f2eee4','#586044'],linen:['ocean','#f2eee4','#4f6765']});
});
