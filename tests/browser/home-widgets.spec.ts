import {test,expect} from '@playwright/test';

test('Home calendar follows saved reading sessions and water count stays private on this device',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.clock.install();
 await page.route('https://date.nager.at/api/v3/PublicHolidays/**',route=>route.fulfill({json:[]}));
 await page.addInitScript(()=>{
  const now=new Date(),at=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12).getTime();
  localStorage.setItem('sela-library:personal',JSON.stringify({version:1,room:'',companion:'cat',quiet:false,hidden:[],queue:[],books:{},racks:[],sessions:[{book:'',at,seconds:600}],quoteTopic:'reading',quoteLanguage:'auto'}));
 });
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 const today=await page.evaluate(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');});
 const day=page.locator(`.home-calendar-day[data-date="${today}"]`);await expect(day).toHaveClass(/has-reading/);await day.click();await expect(page.locator('.home-calendar-detail')).toContainText('10 min');
 const calendar=page.locator('.home-calendar-widget');await expect(calendar.locator('.home-calendar-day')).toHaveCount(7);await calendar.getByRole('button',{name:'Show the whole month'}).click();expect(await calendar.locator('.home-calendar-day').count()).toBeGreaterThanOrEqual(28);await calendar.getByRole('button',{name:'Show this week'}).click();await expect(calendar.locator('.home-calendar-day')).toHaveCount(7);
 const water=page.locator('.home-water-widget');await expect(water.locator('.home-water-value')).toHaveText('0');await water.getByRole('button',{name:'Add a glass'}).click();await expect(water.locator('.home-water-value')).toHaveText('1');const tomorrow=await page.evaluate(()=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(0,1,0,0);return d.toISOString();});await page.clock.setSystemTime(new Date(tomorrow));await water.getByRole('button',{name:'Add a glass'}).click();await expect(water.locator('.home-water-value')).toHaveText('1');
 await page.reload();await expect(page.locator('.home-water-value')).toHaveText('1');await page.locator('.home-water-undo').click();await expect(page.locator('.home-water-value')).toHaveText('0');
 const currentMonth=await calendar.locator('.home-calendar-month').textContent();await calendar.getByRole('button',{name:'Previous month'}).click();const previousMonth=await calendar.locator('.home-calendar-month').textContent();expect(previousMonth).not.toBe(currentMonth);await calendar.getByRole('button',{name:'Next month'}).click();await expect(calendar.locator('.home-calendar-month')).toHaveText(currentMonth);
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  for(const colorScheme of ['light','dark'] as const){await page.emulateMedia({colorScheme});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  const bounds=await page.locator('.home-page .home-widget-card').evaluateAll(cards=>cards.map(card=>{const r=card.getBoundingClientRect();return {left:r.left,right:r.right};}));for(const box of bounds){expect(box.left).toBeGreaterThanOrEqual(-1);expect(box.right).toBeLessThanOrEqual(width+1);}
 }
});

test('calendar fetches localized public holidays for the selected language region',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.clock.install({time:new Date('2026-01-12T12:00:00+09:00')});
 const requests:string[]=[];await page.route('https://date.nager.at/api/v3/PublicHolidays/**',async route=>{const url=new URL(route.request().url());requests.push(url.pathname);const country=url.pathname.split('/').pop();const holidays=country==='JP'?[{date:'2026-01-12',localName:'成人の日',name:'Coming of Age Day',countryCode:'JP',fixed:false,global:true,counties:null,launchYear:null,types:['Public']}]:country==='ID'?[{date:'2026-01-16',localName:'Isra Mi’raj',name:'Isra and Mi\'raj',countryCode:'ID',fixed:false,global:true,counties:null,launchYear:null,types:['Public']}]:[];await route.fulfill({json:holidays});});
 await page.addInitScript(()=>localStorage.setItem('sela-library:language','ja-JP'));
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 const japanese=page.locator('.home-calendar-day[data-date="2026-01-12"]');await expect(japanese).toHaveClass(/has-holiday/);await expect(japanese).toHaveAttribute('title','成人の日');await japanese.click();await expect(page.locator('.home-calendar-detail')).toContainText('祝日 · 成人の日');expect(requests).toContain('/api/v3/PublicHolidays/2026/JP');
 await page.locator('[data-tab=settings]').click();await page.locator('#language').selectOption('id-ID');await page.locator('[data-tab=home]').click();const indonesian=page.locator('.home-calendar-day[data-date="2026-01-16"]');await expect(indonesian).toHaveClass(/has-holiday/);await expect(indonesian).toHaveAttribute('title','Isra Mi’raj');await indonesian.click();await expect(page.locator('.home-calendar-detail')).toContainText('Libur nasional · Isra Mi’raj');expect(requests).toContain('/api/v3/PublicHolidays/2026/ID');
});
