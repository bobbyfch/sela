import {test,expect} from '@playwright/test';

test('React reader chrome, reading modes and desk stay usable across phone, tablet and desktop',async({page})=>{
 const errors:string[]=[];
 const requests:string[]=[];
 let stage='app load';
 page.on('pageerror',error=>errors.push(`${stage}: ${error.message}\n${error.stack||''}`));
 page.on('request',request=>requests.push(request.url()));
 await page.addInitScript(()=>{if(!localStorage.getItem('sela:app:preferences'))localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'}));});
 await page.goto('/app/');
 await expect(page.locator('.sela-app')).toBeVisible();
 await page.getByRole('link',{name:'Settings',exact:true}).click();
 await page.getByRole('button',{name:/Appearance & shelf/}).click();
 await expect(page.getByRole('combobox',{name:'Color theme'})).toHaveValue('Vanilla');
 await page.getByRole('combobox',{name:'Color theme'}).click();
 await page.getByRole('option',{name:'Olive',exact:true}).click();
 await expect(page.locator('.sela-app')).toHaveAttribute('data-theme','olive');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela:app:preferences')||'{}').theme)).toBe('olive');
 await page.reload();
 await expect(page.locator('.sela-app')).toHaveAttribute('data-theme','olive');
 await page.goto('/app/#/');
 await page.getByRole('button',{name:/^(?:Download & read sample|Read sample|Unduh & baca contoh|Baca contoh)$/}).click();
 const reader=page.locator('.reader-layout');
 await expect(reader).toBeVisible({timeout:15000});
 expect(requests.some(url=>url.endsWith('/library/reader-shell.js'))).toBe(false);
  await expect(reader.locator('.reader-chrome-top')).toBeVisible({timeout:15000});
 await expect(reader.locator('.reader-chrome-bottom')).toBeVisible();
 await expect(reader.getByRole('button',{name:'Reading desk',exact:true})).toBeVisible();
 for(const width of [320,768,1440]){
  stage=`viewport ${width}px`;
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px page overflow`).toBe(true);
  expect(await reader.evaluate(element=>element.scrollWidth<=element.clientWidth+1),`${width}px reader overflow`).toBe(true);
 }
 stage='page navigation';
 await reader.getByRole('button',{name:'Next page',exact:true}).click();
 await expect(reader.getByRole('spinbutton',{name:'Current page'})).toHaveValue('2');
 await reader.getByRole('button',{name:'Bookmark page',exact:true}).click();
 await expect(reader.getByRole('button',{name:'Remove bookmark',exact:true})).toHaveAttribute('aria-pressed','true');
 stage='open reading desk';
 await reader.getByRole('button',{name:'Reading desk',exact:true}).click();
 stage='reading desk';
 const desk=page.getByRole('dialog',{name:'Reading desk',exact:true});
 await expect(desk).toBeVisible();
 await expect(desk.getByRole('tab',{name:'Layout',exact:true})).toHaveAttribute('aria-selected','true');
 stage='select reading mode';
 await desk.getByRole('combobox',{name:'Reading mode'}).click();
 await page.getByRole('option',{name:'Webtoon',exact:true}).click();
 await expect(desk.getByRole('combobox',{name:'Reading mode'})).toHaveValue('Webtoon');
 stage='open contents tab';
 await desk.getByRole('tab',{name:'Contents',exact:true}).click();
 await expect(desk.getByRole('tabpanel',{name:'Contents'})).toBeVisible();
 stage='close reading desk';
 await page.keyboard.press('Escape');
 await expect(desk).toBeHidden();
 await expect(reader).toBeVisible();
 await reader.getByRole('button',{name:'Back to shelf',exact:true}).click();
 stage='close reader';
 await expect(reader).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('reader chrome and reading desk follow the supported Indonesian app language',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'id'})));
 await page.goto('/app/');
 await expect(page.locator('.sela-app')).toBeVisible();
 await expect(page.getByRole('link',{name:'Rak buku',exact:true})).toBeVisible();
 await page.getByRole('button',{name:/^(?:Unduh & baca contoh|Baca contoh)$/}).click();
 const reader=page.locator('.reader-layout');
 await expect(reader).toBeVisible({timeout:15000});
 await expect(reader.getByRole('button',{name:'Kembali ke rak',exact:true})).toBeVisible();
 await reader.getByRole('button',{name:'Meja baca',exact:true}).click();
 const desk=page.getByRole('dialog',{name:'Meja baca',exact:true});
 await expect(desk).toBeVisible();
 await expect(desk.getByRole('tab',{name:'Tata letak',exact:true})).toBeVisible();
 await expect(desk.getByRole('tab',{name:'Daftar isi',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(desk).toBeHidden();
 await reader.getByRole('button',{name:'Kembali ke rak',exact:true}).click();
 await expect(reader).toHaveCount(0);
});


test('reader shows a recoverable error and retries a failed SDK request', async ({ page }) => {
  let requests = 0;
  await page.route('**/dist/js/sela.esm.js', async route => {
    requests += 1;
    await route.fulfill({ status: 503, contentType: 'text/plain', body: 'Reader engine temporarily unavailable' });
  });
  await page.goto('/app/');
  await expect(page.locator('.sela-app')).toBeVisible();
  await page.getByRole('button', { name: /^(?:Download & read sample|Read sample|Unduh & baca contoh|Baca contoh)$/ }).click();
  const error = page.locator('.reader-error');
  await expect(error).toBeVisible();
  await expect(error).toContainText('The reader engine took too long to load');
  await expect(error.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
  expect(requests).toBeGreaterThan(0);
  await page.unroute('**/dist/js/sela.esm.js');
  await error.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.locator('.reader-chrome-top')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.reader-error')).toHaveCount(0);
});
