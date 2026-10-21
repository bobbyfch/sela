import {test,expect,type Page} from '@playwright/test';
import {setTopbarAppearance} from './topbar-helpers.ts';

type WidgetFlags={calendar?:boolean;reflection?:boolean;water?:boolean;history?:boolean;news?:boolean;faith?:boolean;prayer?:boolean;weather?:boolean};

async function openHome(page:Page,options:{language?:'en'|'id';theme?:string;appearance?:'light'|'dark'|'oled';widgets?:WidgetFlags;faith?:string}={}){
 const widgets={calendar:true,reflection:true,water:true,history:false,news:false,faith:false,prayer:false,weather:false,...options.widgets};
 await page.addInitScript(({language,theme,appearance,widgets,faith})=>{
  localStorage.setItem('sela:app:preferences',JSON.stringify({language:language||'en',theme:theme||'vanilla',appearance:appearance||'light',finish:'oak',density:2,defaultTextMode:'scroll',defaultPageMode:'book',widgets}));
  if(faith)localStorage.setItem('sela-library:personal',JSON.stringify({version:1,faith}));
 },{language:options.language,theme:options.theme,appearance:options.appearance,widgets,faith:options.faith});
 await page.route('https://date.nager.at/api/v3/PublicHolidays/**',route=>route.fulfill({json:[]}));
 await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();await expect(page.locator('.home-screen')).toBeVisible();
}

test('Home and its reading widgets fit from phone through desktop widths',async({page})=>{
 await openHome(page);
 await expect(page.locator('.calendar-widget')).toBeVisible();await expect(page.locator('.water-widget')).toBeVisible();await expect(page.locator('.reflection-widget')).toBeVisible();
 for(const width of [320,360,390,640,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  await expect.poll(()=>page.locator('.mantine-AppShell-main').evaluate(element=>Number.parseFloat(getComputedStyle(element).paddingInlineStart))).toBe(width<768?0:256);
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const shell=await page.locator('.home-screen').boundingBox();expect(shell?.x).toBeGreaterThanOrEqual(-1);expect((shell?.x||0)+(shell?.width||0)).toBeLessThanOrEqual(width+1);
  const cards=await page.locator('.calendar-widget,.water-widget,.reflection-widget').evaluateAll(elements=>elements.map(element=>{const box=element.getBoundingClientRect();return{left:box.left,right:box.right,width:box.width};}));
  for(const card of cards){expect(card.width).toBeGreaterThan(0);expect(card.left).toBeGreaterThanOrEqual(-1);expect(card.right).toBeLessThanOrEqual(width+1);}
 }
});

test('topbar display menu changes appearance without changing the paper palette',async({page})=>{
 await openHome(page,{theme:'olive',appearance:'light'});
 const app=page.locator('.sela-app');
 await expect(page.getByRole('button',{name:'Display settings',exact:true})).toBeVisible();
 await setTopbarAppearance(page,'dark');await expect(app).toHaveAttribute('data-appearance','dark');await expect(app).toHaveAttribute('data-theme','olive');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela:app:preferences')||'{}'))).toMatchObject({appearance:'dark',theme:'olive'});
 await setTopbarAppearance(page,'light');await expect(app).toHaveAttribute('data-appearance','light');await expect(app).toHaveAttribute('data-theme','olive');
});

test('Islamic tools explain their preference gate and appear after the user selects Islam',async({page})=>{
 await openHome(page,{faith:'none',widgets:{faith:true,prayer:true}});
 const prompt=page.locator('.faith-tools-prompt');await expect(prompt).toBeVisible();
 await expect(prompt).toContainText('Quran, daily readings & prayer times');
 await prompt.getByRole('button',{name:'Choose reading sources'}).click();
 await expect(page).toHaveURL(/settings\/library/);
 const source=page.getByRole('combobox',{name:'Daily reflection source'});await source.click();await page.getByRole('option',{name:'Islam',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela-library:personal')||'{}').faith)).toBe('islam');
 await page.goBack();
 await expect(page.locator('.faith-reading-widget')).toBeVisible();
 await expect(page.locator('.islamic-reading-shortcuts')).toBeVisible();
 await expect(page.locator('.prayer-times-widget')).toBeVisible();
 await expect(page.locator('.prayer-times-widget').getByRole('button',{name:'Load today’s times'})).toBeVisible();
});

test('prayer city setup works with Weather turned off and waits for an explicit time request',async({page})=>{
 const prayerRequests:string[]=[];
 const geocodingRequests:string[]=[];
 await page.route(url=>url.origin==='https://geocoding-api.open-meteo.com'&&url.pathname==='/v1/search',route=>{geocodingRequests.push(route.request().url());return route.fulfill({json:{results:[{name:'Jakarta',admin1:'DKI Jakarta',country:'Indonesia',latitude:-6.2,longitude:106.8,timezone:'Asia/Jakarta'}]}});});
 await page.route('https://api.aladhan.com/v1/timings/**',route=>{prayerRequests.push(route.request().url());return route.fulfill({json:{code:200,data:{timings:{Fajr:'2026-10-21T04:00:00+07:00',Dhuhr:'2026-10-21T11:45:00+07:00',Asr:'2026-10-21T15:00:00+07:00',Maghrib:'2026-10-21T17:45:00+07:00',Isha:'2026-10-21T19:00:00+07:00'},meta:{timezone:'Asia/Jakarta'}}}});});
 await openHome(page,{faith:'islam',widgets:{faith:true,prayer:true,weather:false}});
 const prayer=page.locator('.prayer-times-widget');await expect(prayer).toBeVisible();await expect(page.locator('.weather-widget')).toHaveCount(0);
 await prayer.getByRole('button',{name:'Load today’s times'}).click();
 const locationDialog=page.getByRole('dialog');await expect(locationDialog.getByRole('heading',{name:'Choose a city'})).toBeVisible();
 await locationDialog.getByRole('textbox',{name:'Find a city'}).fill('Jakarta');await locationDialog.getByRole('button',{name:'Search',exact:true}).click();
 await expect.poll(()=>geocodingRequests.length).toBe(1);
 const city=locationDialog.getByRole('button',{name:'Jakarta, DKI Jakarta, Indonesia'});await expect(city).toBeVisible();await city.click();await expect(locationDialog).toBeHidden();
 expect(prayerRequests).toHaveLength(0);
 await prayer.getByRole('button',{name:'Load today’s times'}).click();await expect(prayer.locator('.prayer-times-grid')).toBeVisible();
 expect(prayerRequests).toHaveLength(1);const request=new URL(prayerRequests[0]);expect(request.searchParams.get('latitude')).toBe('-6.2');expect(request.searchParams.get('longitude')).toBe('106.8');
 await expect(prayer.locator('.prayer-times-grid')).toContainText('04:00');
});

test('water tracker applies an optional AKG guide, custom goal and undo locally',async({page})=>{
 await openHome(page);const water=page.locator('.water-widget');await expect(water.locator('.water-widget-total strong')).toHaveText('0 mL');
 await water.getByRole('button',{name:'Add one glass'}).click();await expect(water.locator('.water-widget-total strong')).toHaveText('250 mL');
 await water.getByRole('button',{name:'Optional goal settings'}).click();
 const guide=water.getByRole('combobox',{name:'Goal guide'});await guide.click();await page.getByRole('option',{name:'Indonesia AKG · men · 19–64'}).click();
 const goal=water.getByLabel('Daily goal (mL)');await expect(goal).toHaveValue('2500');await expect(water.locator('.water-widget-progress')).toContainText('250 / 2500 mL');
 await goal.fill('500');await goal.press('Tab');await expect(water.locator('.water-widget-progress')).toContainText('250 / 500 mL');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela-library:water-glasses')||'{}'))).toMatchObject({glasses:1,goalMl:500,goalGuide:'custom'});
 await water.getByRole('button',{name:'Undo one glass'}).click();await expect(water.locator('.water-widget-total strong')).toHaveText('0 mL');
});

test('reading calendar switches between month and a seven-day week',async({page})=>{
 await openHome(page);const calendar=page.locator('.calendar-widget');await expect(calendar.getByRole('heading',{name:'Reading calendar'})).toBeVisible();
 await calendar.getByText('Week',{exact:true}).click();await expect(calendar.getByRole('radio',{name:'Week'})).toBeChecked();await expect(calendar.locator('.app-calendar-week-day')).toHaveCount(7);
 const selected=calendar.locator('.app-calendar-week-day.is-selected');await expect(selected).toHaveCount(1);await calendar.getByRole('button',{name:'Next week'}).click();await expect(calendar.locator('.app-calendar-week-day')).toHaveCount(7);
 await calendar.getByText('Month',{exact:true}).click();await expect(calendar.getByRole('radio',{name:'Month'})).toBeChecked();await expect(calendar.locator('.home-reading-calendar')).toBeVisible();await expect(calendar.getByRole('link',{name:'Holiday source: Nager.Date'})).toHaveAttribute('href','https://date.nager.at/');
});

test('reading note keeps its source controls and stores the selected topic',async({page})=>{
 await openHome(page);const reflection=page.locator('.reflection-widget');await expect(reflection.locator('blockquote.daily-quote')).toBeVisible();
 await reflection.getByRole('combobox',{name:'Quote topic'}).click();await page.getByRole('option',{name:'Calm'}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela-library:personal')||'{}').quoteTopic)).toBe('calm');
 await expect(reflection.getByRole('button',{name:'Find sourced quotes'})).toBeVisible();await reflection.getByRole('button',{name:'Another note'}).click();await expect(reflection.locator('blockquote.daily-quote')).toBeVisible();
});

test('enabled news and history widgets use isolated, attributed sources',async({page})=>{
 const requests:string[]=[];
 await page.route('https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/**',route=>{requests.push(route.request().url());return route.fulfill({json:{selected:[{year:1969,text:'A small step that changed the world.',pages:[{title:'Apollo 11',content_urls:{desktop:{page:'https://en.wikipedia.org/wiki/Apollo_11'}}}]}]}});});
 await page.route('https://proxy.cors.dev/https://www.theguardian.com/**',route=>{const url=route.request().url();requests.push(url);const science=url.includes('/science/rss');const topic=science?'science':'books';return route.fulfill({contentType:'application/rss+xml',body:`<rss><channel><item><title>${science?'A science report':'A books feature'}</title><link>https://www.theguardian.com/${topic}/2026/oct/14/story</link><description>A sourced report.</description></item></channel></rss>`});});
 await openHome(page,{widgets:{history:true,news:true}});const history=page.locator('.home-feed-widget').filter({has:page.getByRole('heading',{name:'On this day'})}),news=page.locator('.home-feed-widget').filter({has:page.getByRole('heading',{name:'Reading around'})});
 await expect(history.getByRole('link',{name:'A small step that changed the world.'})).toHaveAttribute('href','https://en.wikipedia.org/wiki/Apollo_11');
 await expect(news.getByRole('link',{name:'A books feature'})).toHaveAttribute('href','https://www.theguardian.com/books/2026/oct/14/story');
 await news.getByRole('combobox',{name:'News topic',exact:true}).click();await page.getByRole('option',{name:'Science'}).click();await expect(news.getByRole('link',{name:'A science report'})).toBeVisible();await expect(news).not.toContainText('A books feature');
 expect(requests.some(url=>url.includes('wikipedia.org/api/rest_v1/feed/onthisday/'))).toBe(true);expect(requests.some(url=>url.includes('/science/rss'))).toBe(true);
});
