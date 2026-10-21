import {test,expect} from '@playwright/test';
import {openSettingsCategory} from './settings-helpers.ts';

async function start(page){
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'})));
 await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
}
async function settleLayout(page){
 await page.evaluate(async()=>{
  const frame=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
  await frame();await frame();
  const running=Array.from(document.querySelectorAll('*')).flatMap(element=>Array.from(element.getAnimations())).filter(animation=>animation.playState==='running');
  if(running.length)await Promise.all(running.map(animation=>animation.finished.catch(()=>undefined)));
 });
}

test('reading calendar and backup actions stay inside their panels across widths',async({page})=>{
 await start(page);const calendar=page.locator('.calendar-widget');await expect(calendar).toBeVisible();
 for(const width of [320,360,393,600,768,1366]){
  await page.setViewportSize({width,height:900});await settleLayout(page);
  const metrics=await calendar.evaluate(element=>{const card=element.getBoundingClientRect(),controls=element.querySelector('.app-calendar-controls')!.getBoundingClientRect();return {overflow:element.scrollWidth>element.clientWidth+1,controlsInside:controls.left>=card.left&&controls.right<=card.right+1,documentOverflow:document.documentElement.scrollWidth>innerWidth};});
  expect(metrics.overflow,`calendar overflow at ${width}px ${JSON.stringify(metrics)}`).toBe(false);expect(metrics.controlsInside).toBe(true);expect(metrics.documentOverflow).toBe(false);
 }
 await openSettingsCategory(page,'Backup & data');const panel=page.locator('.settings-panel').filter({has:page.getByRole('button',{name:'Restore a backup',exact:true})});
 const restore=page.getByRole('button',{name:'Restore a backup',exact:true});await expect(restore).toBeVisible();
 for(const width of [320,360,393,768,1366]){
  await page.setViewportSize({width,height:900});await settleLayout(page);
  const metrics=await panel.evaluate(element=>({overflow:element.scrollWidth>element.clientWidth+1,buttonInside:(()=>{const panel=element.getBoundingClientRect(),button=element.querySelector('button')!.getBoundingClientRect();return button.left>=panel.left-1&&button.right<=panel.right+1;})()}));
  expect(metrics.overflow,`backup panel overflow at ${width}px`).toBe(false);expect(metrics.buttonInside,`backup button containment at ${width}px`).toBe(true);
 }
});

test('React shelf stays responsive without horizontal overflow',async({page})=>{
 await start(page);
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({name:'Responsive layout.txt',mimeType:'text/plain',buffer:Buffer.from('A small book used only to measure the responsive shelf grid.')});
 await page.goto('/app/#/shelf');await expect(page.locator('.book-card')).toHaveCount(1);
 for(const width of [320,393,768,1024,1440]){
  await page.setViewportSize({width,height:900});await settleLayout(page);
  const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,shellWidth:document.querySelector('.sela-app')!.getBoundingClientRect().width,shelfOverflow:(()=>{const grid=document.querySelector('.book-grid')!;return grid.scrollWidth>grid.clientWidth+1;})()}));
  expect(metrics.overflow,`document overflow at ${width}px`).toBe(false);expect(metrics.shelfOverflow,`shelf overflow at ${width}px`).toBe(false);expect(metrics.shellWidth,`shell width at ${width}px`).toBeLessThanOrEqual(width);
 }
});

test('Home and public touch controls stay visible without mobile overflow',async({page})=>{
 for(const width of [320,360,393,768,1366]){
  await page.setViewportSize({width,height:900});await start(page);
  const app=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,targets:[...document.querySelectorAll('.topbar-actions .glass-control,.mobile-dock a')].filter(element=>element.checkVisibility()).map(element=>({height:element.getBoundingClientRect().height,label:element.getAttribute('aria-label')||element.textContent?.trim()}))}));
  expect(app.overflow,`app overflow at ${width}px`).toBe(false);expect(app.targets.length,`touch controls at ${width}px`).toBeGreaterThanOrEqual(2);
  for(const target of app.targets)expect(target.height,`app target at ${width}px ${target.label}`).toBeGreaterThanOrEqual(36);
  await page.goto('/');
  const publicPage=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,targets:[...document.querySelectorAll('.public-theme-choice,.public-language-picker,.hero .install-button')].filter(element=>element.checkVisibility()).map(element=>({height:element.getBoundingClientRect().height,label:element.getAttribute('aria-label')||element.textContent?.trim()}))}));
  expect(publicPage.overflow,`public overflow at ${width}px`).toBe(false);expect(publicPage.targets.length).toBeGreaterThanOrEqual(5);
  for(const target of publicPage.targets)expect(target.height,`public target at ${width}px ${target.label}`).toBeGreaterThanOrEqual(40);
 }
});
