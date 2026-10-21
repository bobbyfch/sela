import {test,expect} from '@playwright/test';

test('Discover source cards, search and results stay inside phone, tablet and desktop widths',async({page})=>{
 await page.addInitScript(()=>{if(!localStorage.getItem('sela:app:preferences'))localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'}));});
 await page.route('**/w/api.php?**',route=>route.fulfill({json:{query:{categorymembers:[]}}}));
 await page.goto('/app/#/discover');
 const discover=page.locator('.catalog-explorer');
 await expect(discover).toBeVisible();
 await expect(discover.locator('.catalog-source-card')).toHaveCount(9);
 for(const width of [320,360,393,600,768,1024,1280,1600]){
  await page.setViewportSize({width,height:900});
  await expect.poll(()=>page.locator('.mantine-AppShell-main').evaluate(element=>Number.parseFloat(getComputedStyle(element).paddingInlineStart))).toBe(width<768?0:256);
  await expect.poll(()=>page.evaluate(()=>document.fonts.ready.then(()=>document.documentElement.scrollWidth<=innerWidth))).toBe(true);
  const metrics=await page.evaluate(()=>{const section=document.querySelector<HTMLElement>('.catalog-explorer')!;return {page:document.documentElement.scrollWidth,viewport:innerWidth,section:section.scrollWidth,sectionWidth:section.clientWidth,cards:[...document.querySelectorAll<HTMLElement>('.catalog-source-card,.catalog-result-card')].filter(element=>element.getClientRects().length).map(element=>({right:Math.round(element.getBoundingClientRect().right),width:Math.round(element.getBoundingClientRect().width)})),overflow:[...section.querySelectorAll<HTMLElement>('*')].filter(element=>element.scrollWidth>element.clientWidth+1).map(element=>({tag:element.tagName,classes:String(element.className),scroll:element.scrollWidth,client:element.clientWidth,width:Math.round(element.getBoundingClientRect().width),right:Math.round(element.getBoundingClientRect().right),text:(element.innerText||'').slice(0,70)})).slice(0,16)};});
  expect(metrics.page,`${width}px document overflow ${JSON.stringify(metrics)}`).toBeLessThanOrEqual(metrics.viewport+1);
  expect(metrics.section,`${width}px Discover overflow ${JSON.stringify(metrics)}`).toBeLessThanOrEqual(metrics.sectionWidth+1);
  expect(metrics.cards.every(card=>card.width>0&&card.right<=width+1),`${width}px card outside viewport`).toBe(true);
 }
});
