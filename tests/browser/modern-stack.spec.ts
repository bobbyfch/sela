import {test,expect} from '@playwright/test';

test('capsule navigation stays within mobile safe areas, supports keyboard, themes and reduced motion',async({page})=>{
  await page.setViewportSize({width:393,height:852});await page.goto('/mobile/');
  await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
  const nav=page.locator('.glass-navigation');await expect(nav).toBeVisible();
  for(const theme of ['light','dark']){
    await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
    const bounds=await nav.boundingBox();expect(bounds!.x).toBeGreaterThan(0);expect(bounds!.x+bounds!.width).toBeLessThan(393);expect(bounds!.y+bounds!.height).toBeLessThan(852);
    await nav.getByRole('button',{name:'Shelf',exact:true}).click();await expect(page.locator('body')).toHaveAttribute('data-page','library');
    await nav.getByRole('button',{name:'Shelf',exact:true}).press('ArrowRight');await expect(nav.getByRole('button',{name:'Explore',exact:true})).toBeFocused();
    await nav.getByRole('button',{name:'Home',exact:true}).click();
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>nav.locator('.glass-navigation-indicator').evaluate(el=>getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.setViewportSize({width:1440,height:900});await expect(nav).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const bounds=await nav.boundingBox(),indicator=await nav.locator('.glass-navigation-indicator').boundingBox();
  expect(indicator!.width).toBeGreaterThan(bounds!.width*.75);expect(indicator!.height).toBeLessThan(bounds!.height/2);
});

test('binary sources emit compatible lifecycle events and cancel delayed Blob initialization',async({page})=>{
  await page.goto('/?geo=off');
  const result=await page.evaluate(async()=>{
    await SelaReady;
    const bytes=await(await fetch('/example/yang-tidak-ikut-pulang.pdf')).arrayBuffer();
    const viewer=new Sela({mode:'single',duration:0});const events: string[]=[];
    for(const name of ['loading','ready','documentLoaded','pagechange','pageChanged','progressChanged','destroyed'] as const)viewer.on(name,()=>events.push(name));
    await viewer.open(new File([bytes],'book.pdf'));viewer.goTo(3);viewer.setTheme('dark');
    if(viewer.overlay?.dataset.selaTheme!=='dark')throw Error('Theme did not reach the viewer');
    viewer.close();await viewer.open();
    const host=document.createElement('div');host.style.cssText='width:400px;height:320px';document.body.append(host);
    await viewer.mount(host);if(!host.contains(viewer.overlay))throw Error('Mount did not attach to the host');viewer.destroy();host.remove();
    const slow=new Blob([bytes]);let release: (data:ArrayBuffer)=>void;
    slow.arrayBuffer=()=>new Promise(resolve=>release=resolve);
    const cancelled=new Sela({duration:0});const opening=cancelled.open(slow);cancelled.close();release!(bytes);
    const error=await opening.then(()=>'',error=>error.name);cancelled.destroy();
    return {events,error,overlays:document.querySelectorAll('.library-reader-overlay').length};
  });
  for(const event of ['ready','documentLoaded','pagechange','pageChanged','progressChanged','destroyed'])expect(result.events).toContain(event);
  expect(result.error).toBe('AbortError');expect(result.overlays).toBe(0);
});

test('cover snapshots finish or cancel without duplicating the viewer and respect reduced motion',async({page})=>{
  await page.setViewportSize({width:393,height:852});await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
  await page.getByRole('button',{name:'Save offline',exact:true}).click();
  await page.locator('.bottom-bar').getByRole('button',{name:'Shelf',exact:true}).click();await page.locator('.cover').first().click();
  await expect(page.locator('.library-reader-overlay')).toHaveCount(1);await expect(page.locator('.cover-transition')).toHaveCount(0);
  await page.getByRole('button',{name:'Back to library',exact:true}).click();await expect(page.locator('.cover-transition')).toHaveCount(0);await expect(page.locator('.library-reader-overlay')).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.cover').first().click();await expect(page.locator('.cover-transition')).toHaveCount(0);await expect(page.locator('.library-reader-overlay')).toHaveCount(1);
});

test('app browser back closes the reader and rapid reopen keeps one history owner',async({page})=>{
  await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
  await page.getByRole('button',{name:'Read sample',exact:true}).click();await expect(page.locator('.library-reader-overlay')).toHaveCount(1);
  await expect.poll(()=>page.evaluate(()=>!!history.state?.selaReader)).toBe(true);
  await page.goBack();await expect(page.locator('.library-reader-overlay')).toHaveCount(0);await expect(page.locator('#mobile-app')).toBeVisible();
  await page.getByRole('button',{name:'Continue Yang Tidak Ikut Pulang',exact:true}).click();await expect(page.locator('.library-reader-overlay')).toHaveCount(1);
  await page.getByRole('button',{name:'Back to library',exact:true}).click();
  await page.getByRole('button',{name:'Continue Yang Tidak Ikut Pulang',exact:true}).click();await expect(page.locator('.library-reader-overlay')).toHaveCount(1);
  await expect.poll(()=>page.evaluate(()=>!!history.state?.selaReader)).toBe(true);await page.goBack();await expect(page.locator('.library-reader-overlay')).toHaveCount(0);
});
