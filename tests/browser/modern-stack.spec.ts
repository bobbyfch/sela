import {test,expect} from '@playwright/test';
import {setTopbarAppearance} from './topbar-helpers.ts';

test('mobile dock stays in safe areas, routes by keyboard and follows appearance preferences',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'})));
  await page.setViewportSize({width:393,height:852});await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
  const dock=page.getByRole('navigation',{name:'App tabs'});await expect(dock).toBeVisible();
  const bounds=await dock.boundingBox();expect(bounds!.x).toBeGreaterThan(0);expect(bounds!.x+bounds!.width).toBeLessThan(393);expect(bounds!.y+bounds!.height).toBeLessThan(852);
  const shelf=dock.getByRole('link',{name:'My shelf',exact:true});await shelf.focus();await expect(shelf).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('.shelf-screen')).toBeVisible();
  await setTopbarAppearance(page,'dark');await expect(page.locator('.sela-app')).toHaveAttribute('data-appearance','dark');
  await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>dock.evaluate(element=>{const value=getComputedStyle(element).transitionDuration,amount=Number.parseFloat(value);return value.endsWith('ms')?amount:amount*1000;})).toBeLessThanOrEqual(0.01);
  await page.setViewportSize({width:1440,height:900});await expect(page.locator('.app-sidebar')).toBeVisible();await expect(dock).toBeHidden();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
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

test('sample and shelf opens keep one React reader with normal or reduced motion',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'})));
  await page.setViewportSize({width:393,height:852});await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
  await page.getByRole('button',{name:/^(?:Download & read sample|Read sample|Unduh & baca contoh|Baca contoh)$/}).click();const reader=page.locator('.reader-layout');await expect(reader).toBeVisible();
  await expect(reader).toHaveCount(1);await expect(reader.getByRole('button',{name:'Reading desk',exact:true})).toBeVisible();
  await reader.getByRole('button',{name:'Back to shelf',exact:true}).click();await expect(reader).toHaveCount(0);
  await page.goto('/app/#/');await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:/^(?:Download & read sample|Read sample|Unduh & baca contoh|Baca contoh)$/}).click();await expect(reader).toBeVisible();await expect(reader).toHaveCount(1);
});

test('app browser back closes the reader and rapid reopen keeps one history owner',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'})));
  await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();
  await page.getByRole('button',{name:/^(?:Download & read sample|Read sample|Unduh & baca contoh|Baca contoh)$/}).click();const reader=page.locator('.reader-layout');await expect(reader).toBeVisible();await expect(page).toHaveURL(/#\/read\//);
  await page.goBack();await expect(reader).toHaveCount(0);await expect(page.locator('.sela-app')).toBeVisible();
  await page.goto('/app/#/shelf');await page.getByRole('button',{name:'Open Yang Tidak Ikut Pulang',exact:true}).click();await expect(reader).toHaveCount(1);
  await page.goBack();await expect(reader).toHaveCount(0);await expect(page.locator('.shelf-screen')).toBeVisible();
  await page.getByRole('button',{name:'Open Yang Tidak Ikut Pulang',exact:true}).click();await expect(reader).toHaveCount(1);
  await expect(page.locator('.reader-layout')).toHaveCount(1);await page.goBack();await expect(reader).toHaveCount(0);
});
