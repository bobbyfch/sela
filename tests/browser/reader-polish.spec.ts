import {test,expect} from '@playwright/test';

test('reader audio, ambience, theme sync, and accessible controls work as separate tools',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('https://api.gdeltproject.org/**',route=>route.fulfill({json:{articles:[]}}));
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');
 await page.getByRole('button',{name:'Read sample',exact:true}).click();
 const reader=page.locator('[data-product-reader=app]');await expect(reader).toBeVisible({timeout:15000});
 await reader.getByRole('button',{name:'Reader settings',exact:true}).click();
 const audio=reader.locator('.reader-audio-card'),room=reader.locator('.reader-room-card');
 await expect(audio).toBeVisible();await expect(room).toBeVisible();await expect(reader.locator('.reader-audio-card details,.reader-room-card details')).toHaveCount(0);
 await expect(audio.locator('audio')).toHaveAttribute('preload','metadata');
 await expect(room.locator('[data-ambience]')).toHaveCount(4);
 const chooser=audio.getByLabel('Choose an audio file');
 await chooser.setInputFiles({name:'quiet.wav',mimeType:'audio/wav',buffer:Buffer.from('RIFF\0\0\0\0WAVEfmt ')});
 await expect(audio).toContainText('quiet.wav');
 const rain=room.locator('[data-ambience=rain]'),waves=room.locator('[data-ambience=waves]');
 await rain.click();
 if(await page.evaluate(()=>typeof AudioContext==='function')){
  const state=await rain.getAttribute('aria-pressed');
  if(state==='true'){await waves.click();await expect(rain).toHaveAttribute('aria-pressed','false');await expect(waves).toHaveAttribute('aria-pressed','true');}
 }
 const follow=reader.getByLabel('Follow app appearance',{exact:true});await expect(follow).toBeChecked();
 await page.evaluate(()=>{localStorage.setItem('sela-library:theme','dark');document.documentElement.dataset.theme='dark';document.dispatchEvent(new Event('sela:appearance'));});await expect(reader).toHaveAttribute('data-sela-theme','dark');
 await follow.uncheck();await page.evaluate(()=>{localStorage.setItem('sela-library:theme','light');document.documentElement.dataset.theme='light';document.dispatchEvent(new Event('sela:appearance'));});await expect(reader).toHaveAttribute('data-sela-theme','dark');
 const names=await reader.locator('button:visible').evaluateAll(buttons=>buttons.map(button=>({name:(button.getAttribute('aria-label')||button.getAttribute('title')||button.textContent||'').trim(),disabled:(button as HTMLButtonElement).disabled})));
 expect(names.filter(button=>!button.name),JSON.stringify(names)).toEqual([]);
 const deadLinks=await reader.locator('a[href=""],a[href="#"]').evaluateAll(links=>links.map(link=>({href:link.getAttribute('href'),text:link.textContent,html:link.outerHTML})));
 expect(deadLinks,JSON.stringify(deadLinks)).toEqual([]);expect(errors).toEqual([]);
 await reader.getByRole('button',{name:'Back to library',exact:true}).click();await expect(reader).toHaveCount(0);
});

test('HTML reading pages use the white light surface and Home sections persist',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.addInitScript(()=>{document.documentElement.dataset.theme='light';});
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true',{timeout:15000});
 await page.locator('#books').setInputFiles({name:'Light-page.txt',mimeType:'text/plain',buffer:Buffer.from('This page should be white.\n\nThe text stays readable.')});
 await page.getByRole('button',{name:'Shelf',exact:true}).click();await page.locator('.cover').click();const bookInfo=page.getByRole('dialog',{name:'Book information',exact:true});await expect(bookInfo).toBeVisible();await bookInfo.getByRole('button',{name:'Read this book',exact:true}).click();
 const reader=page.locator('[data-product-reader=app]'),chapter=reader.locator('.sela-epub-chapter:not([hidden])').first();await expect(chapter).toBeVisible();
 expect(await chapter.evaluate(element=>getComputedStyle(element).backgroundColor)).toBe('rgb(255, 255, 255)');
 for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await reader.evaluate(element=>element.scrollWidth<=innerWidth)).toBe(true);}
 await reader.getByRole('button',{name:'Back to library',exact:true}).click();await page.getByRole('button',{name:'Settings',exact:true}).click();
 const starter=page.getByRole('checkbox',{name:/Starter books/});await starter.uncheck();await page.getByRole('button',{name:'Home',exact:true}).click();await expect(page.locator('.home-sample-section')).toBeHidden();
 await page.getByRole('button',{name:'Settings',exact:true}).click();await expect(starter).not.toBeChecked();await starter.check();await page.getByRole('button',{name:'Home',exact:true}).click();await expect(page.locator('.home-sample-section')).toBeVisible();
 await page.reload();await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await expect(page.locator('.home-sample-section')).toBeVisible();
});
