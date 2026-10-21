import {test,expect} from '@playwright/test';
import {setTopbarAppearance} from './topbar-helpers.ts';
import {VERSION} from '../../app/library/version.ts';
test('icon tabs, keyboard navigation and appearance API remain usable on mobile',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto('/?geo=off');await page.evaluate(async()=>{await SelaReady;window.r=new Sela({url:'/example/sela.html',language:'en',mode:'single'});await r.open();await r.showTools();});
 await expect(page.getByRole('tab')).toHaveCount(7);await page.getByRole('tab',{name:'Contents',exact:true}).press('ArrowRight');await expect(page.getByRole('tab',{name:'Find in book',exact:true})).toBeFocused();
 await page.getByRole('tab',{name:'Appearance',exact:true}).click();await expect(page.getByRole('combobox',{name:'Page filter',exact:true}).locator('option')).toHaveCount(12);
 await page.getByRole('combobox',{name:'Page filter',exact:true}).selectOption('night');await page.evaluate(()=>r.setBrightness(.6).setDim(true));
 await expect(page.locator('.library-reader-overlay')).toHaveAttribute('data-dim','true');
 const filter=await page.locator('.sela-epub-chapter').first().evaluate(el=>getComputedStyle(el).filter);expect(filter).toContain('brightness(0.42)');expect(filter).toContain('invert(0.9)');
 await page.evaluate(()=>r.setFilter('none').setBrightness(1).setDim(false));await expect(page.locator('.library-reader-overlay')).toHaveAttribute('data-dim','false');
 const box=await page.locator('.sela-tools').boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(320);
});
test('Reader update button shows the incoming and installed versions and handles offline',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en'})));await page.goto('/app/#/settings/data');await expect(page.locator('.sela-app')).toBeVisible();
 const status=page.locator('.update-panel-status');await expect(page.locator('.update-version')).toHaveText(VERSION);await expect(status).toContainText('Updates are checked when Sela opens');
 await page.evaluate(()=>{(window as Window&{updateCheckEvents?:number}).updateCheckEvents=0;document.addEventListener('sela:check-update',()=>{const target=window as Window&{updateCheckEvents?:number};target.updateCheckEvents=(target.updateCheckEvents||0)+1;});});
 await page.getByRole('button',{name:'Check for updates',exact:true}).click();await expect.poll(()=>page.evaluate(()=> (window as Window&{updateCheckEvents?:number}).updateCheckEvents)).toBe(1);
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('sela:update-status',{detail:{message:'App checked. Updates appear when a new shell is ready.',tone:'success',checking:false}})));await expect(status).toContainText('App checked. Updates appear when a new shell is ready.');
});

test('all paper palettes remain selectable in light, dark and OLED app appearances',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',theme:'vanilla',appearance:'light'})));
 await page.goto('/app/#/settings/appearance');await expect(page.locator('.sela-app')).toBeVisible();
 const themes=['vanilla','olive','parchment','mist','stone','oat','cocoa','ivory'];
 const appearances=['light','dark','oled'];
 const values=await page.evaluate(async({themes,appearances})=>{
  const app=document.querySelector<HTMLElement>('.sela-app')!;
  const rows:{theme:string;appearance:string;paper:string;ink:string;accent:string;dark:boolean}[]=[];
  for(const theme of themes)for(const appearance of appearances){
   app.dataset.theme=theme;app.dataset.appearance=appearance;
   document.documentElement.dataset.appTheme=theme;document.documentElement.dataset.appAppearance=appearance;
   await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
   const style=getComputedStyle(app),probe=document.createElement('i');probe.style.backgroundColor='var(--color-paper)';probe.style.color='var(--color-accent)';app.append(probe);
   rows.push({theme,appearance,paper:getComputedStyle(probe).backgroundColor,ink:style.getPropertyValue('--color-ink').trim(),accent:getComputedStyle(probe).color,dark:style.colorScheme==='dark'});probe.remove();
  }
  return rows;
 },{themes,appearances});
 expect(values).toHaveLength(24);
 for(const appearance of appearances){
  const rows=values.filter(row=>row.appearance===appearance);
  expect(rows.every(row=>row.dark===(appearance!=='light'))).toBe(true);
  expect(new Set(rows.map(row=>row.accent)).size).toBeGreaterThanOrEqual(6);
  if(appearance==='light')expect(new Set(rows.map(row=>row.paper)).size).toBe(8);
  if(appearance==='dark')expect(new Set(rows.map(row=>row.paper)).size).toBe(8);
  if(appearance==='oled')expect(rows.every(row=>row.paper==='rgb(0, 0, 0)')).toBe(true);
 }
});

test('theme picker previews each tint and loading skeletons follow the active palette',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',theme:'vanilla',appearance:'light'})));
 await page.goto('/app/#/settings/appearance');await expect(page.locator('.sela-app')).toBeVisible();
 const picker=page.getByRole('combobox',{name:'Color theme'});
 await expect(picker).toBeVisible({timeout:15000});await expect(picker).toHaveValue('Vanilla');await picker.click();
 const porcelain=page.getByRole('option',{name:'Porcelain',exact:true});
 await expect(porcelain.locator('.theme-color-swatch')).toHaveAttribute('data-theme','ivory');
 expect(await porcelain.locator('.theme-color-swatch').evaluate(element=>getComputedStyle(element).backgroundImage)).toContain('linear-gradient');
 await porcelain.click();
 const app=page.locator('.sela-app');await expect(app).toHaveAttribute('data-theme','ivory');
 const readSkeleton=()=>page.evaluate(()=>{
  const app=document.querySelector<HTMLElement>('.sela-app')!;
  const skeleton=document.createElement('div');skeleton.className='mantine-Skeleton-root m_18320242';skeleton.dataset.visible='';app.append(skeleton);
  const probe=document.createElement('i');probe.style.backgroundColor='var(--color-paper-soft)';app.append(probe);
  const before=getComputedStyle(skeleton,'::before').backgroundColor;
  const after=getComputedStyle(skeleton,'::after').backgroundColor;
  const expected=getComputedStyle(probe).backgroundColor;
  skeleton.remove();probe.remove();return {before,after,expected};
 });
 let shades=await readSkeleton();expect(shades.before).toBe(shades.expected);
 await setTopbarAppearance(page,'dark');await expect(app).toHaveAttribute('data-appearance','dark');
 shades=await readSkeleton();expect(shades.before).toBe(shades.expected);expect(shades.after).not.toBe(shades.before);
 await setTopbarAppearance(page,'light');await setTopbarAppearance(page,'dark');
 await page.getByRole('radiogroup',{name:'Appearance mode'}).getByText('OLED',{exact:true}).click();await expect(app).toHaveAttribute('data-appearance','oled');
 shades=await readSkeleton();expect(shades.before).toBe(shades.expected);expect(shades.after).not.toBe(shades.before);
 const oledSurface=await app.evaluate(element=>({image:getComputedStyle(element).backgroundImage,color:getComputedStyle(element).backgroundColor}));
 expect(oledSurface).toEqual({image:'none',color:'rgb(0, 0, 0)'});
 await picker.click();
 await expect(page.getByRole('option',{name:'Porcelain',exact:true}).locator('.theme-color-swatch')).toBeVisible();
});
