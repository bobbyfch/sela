import {test,expect} from '@playwright/test';
import {setTopbarAppearance} from './topbar-helpers.ts';


const paletteKeys=['white','forest','sakura','ocean','lavender','citrus','senja','arunika','oled'];

test('every palette changes viewer controls and motif without losing responsive fit',async({page})=>{
 test.setTimeout(180_000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/?geo=off');
 await page.locator('.trial-book').click();
 const reader=page.locator('[data-product-reader="app"]');
 await expect(reader).toBeVisible();
 await reader.getByRole('button',{name:'Reader settings',exact:true}).click();
 await expect(reader.locator('.app-reader-palettes [data-palette-choice]')).toHaveCount(paletteKeys.length);

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
   expect(accents.size).toBe(paletteKeys.length);
   expect(motifs.size).toBe(6);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
 expect(errors).toEqual([]);
});

test('topbar light/dark control preserves the selected paper theme',async({page})=>{
 await page.goto('/app/#/settings/appearance');
 const app=page.locator('.sela-app');
 await expect(app).toBeVisible();
 await expect(app).toHaveAttribute('data-theme','vanilla');
 await expect(app).toHaveAttribute('data-appearance','light');
 await setTopbarAppearance(page,'dark');
 await expect(app).toHaveAttribute('data-appearance','dark');
 await expect(app).toHaveAttribute('data-theme','vanilla');
 await page.getByRole('combobox',{name:'Tema warna'}).click();
 await page.getByRole('option',{name:'Zaitun'}).click();
 await expect(app).toHaveAttribute('data-theme','olive');
 await setTopbarAppearance(page,'light');
 await expect(app).toHaveAttribute('data-appearance','light');
 await expect(app).toHaveAttribute('data-theme','olive');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('sela:app:preferences')||'{}'));
 expect(stored.theme).toBe('olive');
 expect(stored.appearance).toBe('light');
});
