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
  await page.evaluate(async()=>{await document.fonts.ready;});
  const metrics=await page.evaluate(()=>{
   const section=document.querySelector<HTMLElement>('.catalog-explorer')!;
   const measure=(element:HTMLElement)=>{const style=getComputedStyle(element),rect=element.getBoundingClientRect();return {tag:element.tagName,classes:String(element.className),text:(element.innerText||'').slice(0,75),scroll:element.scrollWidth,client:element.clientWidth,rectWidth:Math.round(rect.width),left:Math.round(rect.left),right:Math.round(rect.right),display:style.display,flexDirection:style.flexDirection,minWidth:style.minWidth,width:style.width,whiteSpace:style.whiteSpace,overflowWrap:style.overflowWrap};};
   const overflow=[...section.querySelectorAll<HTMLElement>('*')].filter(element=>element.scrollWidth>element.clientWidth+1).map(measure).sort((a,b)=>(b.scroll-a.scroll)-(a.scroll-b.scroll)).slice(0,18);
   const headings=[...section.querySelectorAll<HTMLElement>('.catalog-section-heading')].map(element=>({heading:measure(element),children:[...element.children].map(child=>measure(child as HTMLElement))}));
   return {page:document.documentElement.scrollWidth,viewport:innerWidth,section:section.scrollWidth,sectionWidth:section.clientWidth,headings,overflow,cards:[...document.querySelectorAll<HTMLElement>('.catalog-source-card,.catalog-result-card')].filter(element=>element.getClientRects().length).map(element=>({right:Math.round(element.getBoundingClientRect().right),width:Math.round(element.getBoundingClientRect().width)}))};
  });
  expect(metrics.page,width+'px document overflow '+JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.viewport+1);
  expect(metrics.section,width+'px Discover overflow '+JSON.stringify(metrics)).toBeLessThanOrEqual(metrics.sectionWidth+1);
  expect(metrics.cards.every(card=>card.width>0&&card.right<=width+1),width+'px card outside viewport').toBe(true);
 }
});
