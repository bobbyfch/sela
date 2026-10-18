import {test,expect} from '@playwright/test';
import {openSettingsCategory} from './settings-helpers.ts';

const paletteKeys=['white','forest','sakura','ocean','lavender','citrus','senja','arunika'];

test('every palette changes viewer controls and motif without losing responsive fit',async({page})=>{
 test.setTimeout(180_000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/?geo=off');
 await page.locator('.trial-book').click();
 const reader=page.locator('[data-product-reader="app"]');
 await expect(reader).toBeVisible();
 await reader.getByRole('button',{name:'Reader settings',exact:true}).click();
 await expect(reader.locator('.app-reader-palettes [data-palette-choice]')).toHaveCount(8);

 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const colorScheme of ['light','dark'] as const){
   await page.emulateMedia({colorScheme});
   const accents=new Set<string>(),motifs=new Set<string>();
   for(const key of paletteKeys){
    const choice=reader.locator(`.app-reader-palettes [data-palette-choice="${key}"]`);
    const expected=await choice.evaluate(button=>getComputedStyle(button).getPropertyValue('--palette-choice-accent').trim());
    const expectedColor=await choice.evaluate(button=>{const probe=document.createElement('i');probe.style.color=getComputedStyle(button).getPropertyValue('--palette-choice-accent').trim();document.body.append(probe);const color=getComputedStyle(probe).color;probe.remove();return color;});
    await expect(choice.locator('.palette-swatch svg')).toHaveCount(1);
    await choice.click();
    await expect(choice.locator('.palette-swatch svg')).toHaveCount(1);
    await expect(reader).toHaveAttribute('data-palette',key);
    await expect(choice).toHaveAttribute('aria-pressed','true');
    const current=await reader.evaluate(element=>({
     accent:getComputedStyle(element).getPropertyValue('--accent').trim(),
     viewerAccent:getComputedStyle(element).getPropertyValue('--sela-accent').trim(),
     soft:getComputedStyle(element).getPropertyValue('--palette-soft').trim(),
     markerColor:getComputedStyle(element.querySelector('.app-reading-theme-mark')!).color,
     motif:element.querySelector('.app-reading-theme-mark path')?.getAttribute('d')||''
    }));
    expect(current.accent).toBe(expected);
    expect(current.viewerAccent).toBe(expected);
    expect(current.markerColor).toBe(expectedColor);
    expect(current.soft).not.toBe('');
    expect(current.motif).not.toBe('');
    accents.add(current.accent);motifs.add(current.motif);
   }
   expect(accents.size).toBe(8);
   expect(motifs.size).toBe(8);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
 expect(errors).toEqual([]);
});

test('home illustration keeps its wide composition and reflects palette, daypart, and weather',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/app/');
 await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 const stage=page.locator('.home-world-stage'),art=stage.locator('.home-world-art');
 await expect(stage.locator('.home-world-doodle svg')).toHaveCount(1);
 await page.locator('html').evaluate(element=>element.setAttribute('data-theme','light'));
 const lightFilter=await art.evaluate(element=>getComputedStyle(element).filter);
 await page.locator('html').evaluate(element=>element.setAttribute('data-theme','dark'));
 const darkFilter=await art.evaluate(element=>getComputedStyle(element).filter);
 expect(lightFilter).not.toBe(darkFilter);
 expect(darkFilter).toContain('brightness(0.88)');
 await page.locator('html').evaluate(element=>element.setAttribute('data-theme','light'));
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:900});
  const layout=await stage.evaluate(element=>({
   width:element.getBoundingClientRect().width,
   height:element.getBoundingClientRect().height,
   ratio:getComputedStyle(element).aspectRatio,
   fit:getComputedStyle(element.querySelector('img')!).objectFit
  }));
  expect(layout.fit).toBe('cover');
  expect(layout.width/layout.height).toBeGreaterThan(1.72);
  expect(layout.width/layout.height).toBeLessThan(1.83);
  expect(layout.ratio).not.toBe('auto');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await openSettingsCategory(page,'Reading & appearance');
 await page.locator('.app-palette-picker [data-palette-choice="sakura"]').click();
 await expect(stage).toHaveAttribute('data-palette','sakura');
 await page.locator('[data-tab="home"]').click();
 const daypartFilter=await art.evaluate(element=>getComputedStyle(element).getPropertyValue('--world-filter-time'));
 await stage.evaluate(element=>{element.dataset.daypart='sunset';element.dataset.weather='rain';});
 await expect.poll(()=>art.evaluate(element=>getComputedStyle(element).filter)).toContain('sepia');
 const atmosphere=await art.evaluate(element=>({filter:getComputedStyle(element).filter,weather:(element.parentElement as HTMLElement).dataset.weather}));
 expect(daypartFilter).toContain('saturate');
 expect(atmosphere.weather).toBe('rain');
 expect(atmosphere.filter).toContain('sepia');
});

test('home illustration adopts a palette chosen while its companion atlas loads',async({page})=>{
 let releaseAtlas=()=>{};
 let notifyAtlasRequest=()=>{};
 const atlasRequested=new Promise<void>(resolve=>{notifyAtlasRequest=resolve;});
 const atlasGate=new Promise<void>(resolve=>{releaseAtlas=resolve;});
 await page.route('**/sela-companions-3d.webp',async route=>{notifyAtlasRequest();await atlasGate;await route.continue();});
 try{
  await page.goto('/app/',{waitUntil:'commit'});
  const stage=page.locator('.home-world-stage');
  const home=page.locator('.home-page');
  await expect(stage).toBeAttached();
  const initialization=await Promise.race([
   atlasRequested.then(()=> 'atlas'),
   expect.poll(()=>home.getAttribute('data-world')).toBe('art-only').then(()=> 'art-only')
  ]);
 await openSettingsCategory(page,'Reading & appearance');
  await expect(page.locator('.app-palette-picker [data-palette-choice="sakura"]')).toBeVisible();
  await page.locator('.app-palette-picker [data-palette-choice="sakura"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-palette','sakura');
  await expect(stage).toHaveAttribute('data-palette','sakura');
  expect(['atlas','art-only']).toContain(initialization);
  releaseAtlas();
 }finally{releaseAtlas();}
});

test('art-only Home fallback keeps its palette when WebGL is unavailable',async({page})=>{
 await page.addInitScript(()=>{
  const canvas=HTMLCanvasElement.prototype as any;
  const getContext=canvas.getContext;
  canvas.getContext=function(type:string,...args:any[]){return type==='webgl2'||type==='webgl'||type==='experimental-webgl'?null:getContext.call(this,type,...args);};
 });
 await page.goto('/app/');
 await expect(page.locator('.home-page')).toHaveAttribute('data-world','art-only');
 const stage=page.locator('.home-world-stage');
  await openSettingsCategory(page,'Reading & appearance');
 await page.locator('.app-palette-picker [data-palette-choice="sakura"]').click();
 await expect(page.locator('html')).toHaveAttribute('data-palette','sakura');
 await expect(stage).toHaveAttribute('data-palette','sakura');
 await expect(stage).toHaveAttribute('data-daypart',/^(morning|day|sunset|night)$/);
 await page.locator('html').evaluate(element=>{element.setAttribute('data-weather','rain');document.dispatchEvent(new Event('sela:weather'));});
 await expect(stage).toHaveAttribute('data-weather','rain');
 await expect.poll(()=>stage.locator('.home-world-art').evaluate(element=>getComputedStyle(element).getPropertyValue('--world-filter-weather'))).toContain('saturate');
});
