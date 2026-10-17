import {test,expect} from '@playwright/test';

test('calendar controls and backup picker stay aligned from phone to desktop',async({page})=>{
  await page.goto('/mobile/');
  await page.getByRole('button',{name:'Home',exact:true}).click();
  const calendar=page.locator('.home-calendar-widget');
  await expect(calendar).toBeVisible();
  for(const width of [320,360,393,600,768,1366]){
    await page.setViewportSize({width,height:900});
    const metrics=await calendar.locator('.home-widget-heading').evaluate(heading=>{
      const copy=heading.firstElementChild!.getBoundingClientRect();
      const controls=heading.querySelector<HTMLElement>('.home-calendar-controls')!;
      const bounds=heading.getBoundingClientRect(),controlBounds=controls.getBoundingClientRect(),parts=[...controls.children].map(element=>element.getBoundingClientRect());
      const partsOverlap=parts.some((part,index)=>parts.slice(index+1).some(other=>part.left<other.right&&part.right>other.left&&part.top<other.bottom&&part.bottom>other.top));
      return {overlap:copy.left<controlBounds.right&&copy.right>controlBounds.left&&copy.top<controlBounds.bottom&&copy.bottom>controlBounds.top,controlsOutside:controlBounds.left<bounds.left-1||controlBounds.right>bounds.right+1,partsOverlap};
    });
    expect(metrics,`calendar at ${width}px`).toEqual({overlap:false,controlsOutside:false,partsOverlap:false});
  }

  await page.getByRole('button',{name:'Settings',exact:true}).click();
  const restore=page.locator('#restore-library');
  await expect(restore).toBeVisible();
  for(const width of [320,360,393,768,1366]){
    await page.setViewportSize({width,height:900});
    const row=restore.locator('xpath=ancestor::div[contains(@class,"restore-label")]');
    const metrics=await row.evaluate(element=>{
      const row=element.getBoundingClientRect();
      const picker=element.querySelector<HTMLElement>('.restore-file-picker')!.getBoundingClientRect();
      const button=element.querySelector<HTMLElement>('.restore-file-picker-action')!;
      return {width:element.clientWidth,scrollWidth:element.scrollWidth,pickerInside:picker.left>=row.left-1&&picker.right<=row.right+1,buttonOverflow:button.scrollWidth>button.clientWidth+1};
    });
    expect(metrics.scrollWidth,`backup row at ${width}px`).toBeLessThanOrEqual(metrics.width+1);
    expect(metrics.pickerInside,`backup control at ${width}px`).toBe(true);
    expect(metrics.buttonOverflow,`backup label at ${width}px`).toBe(false);
  }
});

test('Tailwind shell keeps the shelf responsive without horizontal overflow',async({page})=>{
  await page.goto('/mobile/');
  await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
  await page.getByRole('button',{name:'Shelf',exact:true}).click();
  await page.locator('#books').setInputFiles([{name:'Responsive layout.txt',mimeType:'text/plain',buffer:Buffer.from('A small book used only to measure the responsive shelf grid.')}]);
  await expect(page.locator('.book')).toHaveCount(1);
  for(const [width,columns] of [[320,2],[393,2],[768,3],[1024,4],[1440,4]] as const){
    await page.setViewportSize({width,height:900});
    const metrics=await page.evaluate(()=>({
      columns:getComputedStyle(document.querySelector('#shelf')!).gridTemplateColumns.split(' ').length,
      overflow:document.documentElement.scrollWidth>innerWidth,
      shellWidth:document.querySelector('#mobile-app')!.getBoundingClientRect().width,
    }));
    expect(metrics.columns,`shelf columns at ${width}px`).toBe(columns);
    expect(metrics.overflow,`page overflow at ${width}px`).toBe(false);
    expect(metrics.shellWidth,`shell width at ${width}px`).toBeLessThanOrEqual(width);
  }
});

test('primary Home and public controls keep comfortable touch sizes without mobile overflow',async({page})=>{
  for(const width of [320,360,393,768,1366]){
    await page.setViewportSize({width,height:900});
    await page.goto('/mobile/');
    await page.getByRole('button',{name:'Home',exact:true}).click();
    const app=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      targets:[...document.querySelectorAll('.home-month-arrow,.home-calendar-day,.home-calendar-view,.focus-controls select,.focus-controls button,.home-install-action,.home-background-picker,.home-water-add,.home-water-undo,.home-page .catalog-info')]
        .filter(element=>element.checkVisibility({checkOpacity:true}))
        .map(element=>{const box=element.getBoundingClientRect();return {width:box.width,height:box.height,minHeight:getComputedStyle(element).minHeight,computedHeight:getComputedStyle(element).height,label:element.getAttribute('aria-label')||element.textContent?.trim()||String(element.className)};})
    }));
    expect(app.overflow,`Reader Home at ${width}px`).toBe(false);
    expect(app.targets.length,`visible Home targets at ${width}px`).toBeGreaterThan(10);
    for(const target of app.targets)expect(target.height,'Home target at '+width+'px: '+JSON.stringify(target)).toBeGreaterThanOrEqual(43.5);

    await page.goto('/');
    const publicPage=await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      targets:[...document.querySelectorAll('[data-theme-choice],#language,.hero-link')]
        .filter(element=>element.checkVisibility({checkOpacity:true}))
        .map(element=>{const box=element.getBoundingClientRect();return {width:box.width,height:box.height,minHeight:getComputedStyle(element).minHeight,computedHeight:getComputedStyle(element).height,label:element.getAttribute('aria-label')||element.textContent?.trim()||String(element.className)};})
    }));
    expect(publicPage.overflow,`public page at ${width}px`).toBe(false);
    expect(publicPage.targets).toHaveLength(5);
    for(const target of publicPage.targets)expect(target.height,`public target at ${width}px`).toBeGreaterThanOrEqual(43.5);
  }
});
