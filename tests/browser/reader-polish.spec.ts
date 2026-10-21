import {test,expect} from '@playwright/test';

test('React Reading desk exposes local audio and generated ambience as separate controls',async({page})=>{
 const external:string[]=[];page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).origin!=='http://127.0.0.1:4173')external.push(request.url());});
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'})));
 await page.route('https://date.nager.at/api/v3/PublicHolidays/**',route=>route.fulfill({json:[]}));
 await page.goto('/app/');await page.getByRole('button',{name:/^(?:Download & read sample|Read sample|Unduh & baca contoh|Baca contoh)$/}).click();
 const reader=page.locator('.reader-layout');await expect(reader).toBeVisible();await reader.getByRole('button',{name:'Reading desk',exact:true}).click();
 const desk=page.getByRole('dialog',{name:'Reading desk',exact:true});await desk.getByRole('tab',{name:'Audio',exact:true}).click();
 const audio=desk.locator('.reader-audio-player');await expect(audio).toHaveCount(0);
 const wav=Buffer.alloc(16044);wav.write('RIFF');wav.writeUInt32LE(16036,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(16000,40);
 await desk.locator('input[type="file"][accept*="audio"]').setInputFiles({name:'quiet.wav',mimeType:'audio/wav',buffer:wav});
 await expect(desk.locator('.reader-audio-player')).toBeVisible();await expect(desk.locator('.reader-audio-player')).toHaveJSProperty('paused',true);
 await expect(desk.getByRole('button',{name:'Rain',exact:true})).toBeVisible();await expect(desk.getByRole('button',{name:'Waves',exact:true})).toBeVisible();expect(external.filter(url=>/audio|music|spotify/i.test(url))).toEqual([]);
 await page.keyboard.press('Escape');await expect(desk).toBeHidden();await expect(reader).toBeVisible();await reader.getByRole('button',{name:'Back to shelf',exact:true}).click();await expect(reader).toHaveCount(0);
});

test('React text reading remains usable as Home widgets are changed in settings',async({page})=>{
 await page.addInitScript(()=>{if(!localStorage.getItem('sela:app:preferences'))localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',appearance:'light',theme:'vanilla'}));});
 await page.setViewportSize({width:390,height:844});await page.goto('/app/');
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({name:'Light-page.txt',mimeType:'text/plain',buffer:Buffer.from('This page should remain readable.\n\nThe text stays on this device.')});
 await page.goto('/app/#/shelf');await page.locator('.book-cover-button').click();const reader=page.locator('.reader-layout');await expect(reader).toBeVisible();await expect(reader.locator('.reader-body')).toContainText('This page should remain readable.');
 for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});expect(await reader.evaluate(element=>element.scrollWidth<=element.clientWidth+1),`reader overflows at ${width}px`).toBe(true);}
 await reader.getByRole('button',{name:'Back to shelf',exact:true}).click();await page.goto('/app/#/settings/appearance');
 const calendar=page.getByRole('switch',{name:'Reading calendar'});await calendar.uncheck();await page.goto('/app/');await expect(page.locator('.calendar-widget')).toHaveCount(0);
 await page.reload();await page.goto('/app/#/settings/appearance');await expect(page.getByRole('switch',{name:'Reading calendar'})).not.toBeChecked();
});
