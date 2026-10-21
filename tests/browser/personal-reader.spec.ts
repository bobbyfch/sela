import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

async function start(page){
 await page.addInitScript(()=>localStorage.setItem('sela:app:preferences',JSON.stringify({language:'en',theme:'vanilla',appearance:'light'})));
 await page.setViewportSize({width:393,height:852});await page.goto('/app/');await expect(page.locator('.sela-app')).toBeVisible();await page.addStyleTag({content:'.sela-shell, .sela-shell * { transition: none !important; }'});
}
async function importText(page,name='alpha.txt',text='A quiet chapter with a special chrysanthemum.'){
 await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({name,mimeType:'text/plain',buffer:Buffer.from(text)});
 await page.goto('/app/#/shelf');await expect(page.locator('.book-card')).toHaveCount(1);
}
async function openReader(page){
 await page.locator('.book-cover-button').first().click();await expect(page.locator('.reader-layout')).toBeVisible();
}

test('React app screens remain responsive from phone through desktop',async({page})=>{
 await start(page);
 const routes=[['/app/#/','.home-screen'],['/app/#/shelf','.shelf-screen'],['/app/#/discover','.catalog-explorer'],['/app/#/progress','.progress-screen'],['/app/#/settings','.settings-screen'],['/app/#/settings/library','.settings-detail']];
 for(const [url,selector] of routes){
  await page.goto(url);await expect(page.locator(selector)).toBeVisible();
  for(const width of [320,393,600,768,1024,1366,1440]){
  await page.setViewportSize({width,height:900});
  const metrics=await page.evaluate(()=>{const viewport=innerWidth,measure=(element:HTMLElement)=>{const rect=element.getBoundingClientRect(),style=getComputedStyle(element);return{tag:element.tagName,classes:String(element.className),text:(element.innerText||"").slice(0,70),scroll:element.scrollWidth,client:element.clientWidth,right:Math.round(rect.right),width:Math.round(rect.width),position:style.position,display:style.display,grid:style.gridTemplateColumns,flex:style.flexDirection,minWidth:style.minWidth,whiteSpace:style.whiteSpace};};const overflow=[...document.querySelectorAll<HTMLElement>("body *")].filter(element=>{const rect=element.getBoundingClientRect(),style=getComputedStyle(element);return element.getClientRects().length&&style.visibility!=="hidden"&&!element.closest(".visually-hidden, .sr-only, [aria-hidden=\"true\"]")&&rect.right>viewport+.25;}).map(measure).sort((a,b)=>b.right-a.right).slice(0,20);const overlay=[...document.querySelectorAll<HTMLElement>(".app-drop-overlay, .app-drop-overlay .mantine-Dropzone-root, .app-drop-overlay .mantine-Dropzone-inner, .app-drop-overlay .app-drop-prompt")].map(element=>{const rect=element.getBoundingClientRect(),style=getComputedStyle(element),parent=element.parentElement,parentRect=parent?.getBoundingClientRect();return{classes:String(element.className),rect:{left:Math.round(rect.left),right:Math.round(rect.right),width:Math.round(rect.width)},position:style.position,left:style.left,right:style.right,transform:style.transform,width:style.width,maxWidth:style.maxWidth,display:style.display,alignSelf:style.alignSelf,justifySelf:style.justifySelf,opacity:style.opacity,parent:parent?{classes:String(parent.className),left:Math.round(parentRect!.left),right:Math.round(parentRect!.right),width:Math.round(parentRect!.width)}:null};});return{viewport,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,scrollX,overlay,overflow};});
  expect(metrics.bodyWidth,`${url} body overflows at ${width}px: ${JSON.stringify(metrics)}`).toBeLessThanOrEqual(metrics.viewport);expect(metrics.documentWidth,`${url} document overflows beyond clipped assistive content at ${width}px: ${JSON.stringify(metrics)}`).toBeLessThanOrEqual(metrics.viewport+1);expect(metrics.overflow,`${url} visible content overflows at ${width}px: ${JSON.stringify(metrics)}`).toEqual([]);
}
 }
});

test('paper themes, OLED appearance and reading room finish remain separate settings',async({page})=>{
 await start(page);await page.goto('/app/#/settings/appearance');const app=page.locator('.sela-app');
 await expect(app).toHaveAttribute('data-theme','vanilla');
 const picker=page.getByRole('combobox',{name:'Color theme'});
 for(const [theme,label] of [['olive','Olive'],['parchment','Parchment'],['mist','Mist'],['stone','Stone'],['oat','Oat'],['cocoa','Cocoa'],['ivory','Porcelain'],['vanilla','Vanilla']]){
  await picker.click();await page.getByRole('option',{name:label,exact:true}).click();await expect(app).toHaveAttribute('data-theme',theme);
 }
 const appearance=page.locator('.settings-panel').filter({hasText:'Set your reading room'});
 await appearance.getByText('Dark',{exact:true}).click();await expect(app).toHaveAttribute('data-appearance','dark');await expect(app).toHaveAttribute('data-theme','vanilla');
 await appearance.getByText('OLED',{exact:true}).click();await expect(app).toHaveAttribute('data-appearance','oled');
 await appearance.getByText('Light',{exact:true}).click();await expect(app).toHaveAttribute('data-appearance','light');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela:app:preferences')||'{}'))).toMatchObject({theme:'vanilla',appearance:'light'});
});

test('reading-room name and optional photo background persist and can be reset',async({page})=>{
 await start(page);await page.goto('/app/#/settings/library');const panel=page.locator('.reading-space-settings');
 await panel.getByLabel('Room name').fill('Weekend reading room');
 await panel.locator('input[type="file"]').setInputFiles({name:'room.png',mimeType:'image/png',buffer:await readFile('site/icon-512.png')});
 await expect(panel.locator('.reading-space-preview')).toBeVisible();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela-library:personal')||'{}').room)).toBe('Weekend reading room');
 await page.goto('/app/#/');await expect(page.locator('.home-screen')).toHaveAttribute('data-custom-background','true');await expect(page.locator('.home-screen')).toContainText('Weekend reading room');
 await page.goto('/app/#/settings/library');await page.getByRole('button',{name:'Restore paper background',exact:true}).click();
 await page.goto('/app/#/');await expect(page.locator('.home-screen')).not.toHaveAttribute('data-custom-background','true');
});

test('book notes and reading desk stay private and survive navigation',async({page})=>{
 await start(page);await importText(page);
 await page.getByRole('button',{name:'Book actions',exact:true}).click();await page.getByRole('menuitem',{name:'Book notes & metadata',exact:true}).click();
 const notes=page.getByRole('dialog',{name:'Book notes',exact:true});await notes.getByLabel('A note for later').fill('Read this on Sunday');await notes.getByLabel('Your impression').fill('A warm chapter');await notes.getByLabel('Favorite passage').fill('The quiet garden');await notes.getByRole('button',{name:'Save notes',exact:true}).click();await expect(notes).toBeHidden();
 await page.locator('.book-card').getByRole('button',{name:'Book actions',exact:true}).click();await page.getByRole('menuitem',{name:'Add to reading desk',exact:true}).click();
 await page.goto('/app/#/');await expect(page.locator('.reading-desk-section')).toContainText('alpha');
 await page.goto('/app/#/progress');await expect(page.locator('.notebook-section')).toContainText('A warm chapter');
});

test('Explore results stay separate from the personal shelf until saved',async({page})=>{
 await start(page);await page.goto('/app/#/discover');await expect(page.locator('.catalog-source-card')).toHaveCount(9);
 await expect(page.locator('.catalog-result-card').first()).toBeVisible();
 await expect(page.locator('.catalog-result-actions').getByRole('button',{name:'Download & add to shelf',exact:true}).first()).toBeVisible();
 await expect(page.locator('.book-card')).toHaveCount(0);
});

test('local book search finds text without sending the private query to a service',async({page})=>{
 const outbound:string[]=[];page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).origin!=='http://127.0.0.1:4173')outbound.push(request.url()+' '+(request.postData()||''));});
 await start(page);await importText(page);await page.goto('/app/#/settings/library');
 const panel=page.locator('.settings-panel').filter({hasText:'Search inside my library'});
 await panel.getByLabel('Words to find').fill('chrysanthemum');await panel.getByRole('button',{name:'Search books',exact:true}).click();
 await expect(panel.locator('.library-search-results')).toContainText('special chrysanthemum');
 expect(outbound.some(value=>decodeURIComponent(value).toLowerCase().includes('chrysanthemum'))).toBe(false);
});

test('personal reading preferences persist locally without changing the paper palette',async({page})=>{
 await start(page);await page.goto('/app/#/settings/library');const panel=page.locator('.personal-tools-card').filter({hasText:'A reading practice that fits you'});
 await panel.getByRole('combobox',{name:'Gender preference (optional)'}).click();await page.getByRole('option',{name:'Woman',exact:true}).click();
 await panel.getByRole('combobox',{name:'Daily reflection source'}).click();await page.getByRole('option',{name:'Islam',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela-library:personal')||'{}'))).toMatchObject({gender:'woman',faith:'islam'});
 await expect(page.locator('.sela-app')).toHaveAttribute('data-theme','vanilla');await page.reload();await expect(page.locator('.sela-app')).toHaveAttribute('data-theme','vanilla');
});

test('WebDAV conditional writes protect remote backups and keep passwords out of storage',async({page})=>{
 let headers:Record<string,string>={};await page.route('https://sync.example/**',route=>{headers=route.request().headers();return route.fulfill({status:412});});
 await start(page);await importText(page);await page.goto('/app/#/settings/library');const panel=page.locator('.settings-panel').filter({hasText:'OPTIONAL PRIVATE SYNC'});
 await panel.getByLabel('Backup file URL').fill('https://sync.example/sela.zip');await panel.getByLabel('Username (optional)').fill('private-user');await panel.getByLabel('Password (session only)').fill('PRIVATE_SESSION_PASSWORD');
 await panel.getByRole('button',{name:'Push backup safely',exact:true}).click();await expect(panel).toContainText('remote backup changed');
 expect(headers['if-none-match']).toBe('*');expect(await page.evaluate(()=>JSON.stringify(localStorage))).not.toContain('PRIVATE_SESSION_PASSWORD');
});

test('Reader dictionary stays local until an explicit online translation action',async({page})=>{
 await page.route('https://api.mymemory.translated.net/**',route=>route.fulfill({json:{responseData:{translatedText:'krisan'}}}));
 const requests:string[]=[];page.on('request',request=>{if(request.url().includes('mymemory'))requests.push(request.url());});
 await start(page);await importText(page);await openReader(page);await page.getByRole('button',{name:'Reading desk',exact:true}).click();
 const desk=page.getByRole('dialog',{name:'Reading desk',exact:true});await desk.getByRole('tab',{name:'Words',exact:true}).click();
 const words=desk.locator('.reader-tool-section');await words.getByRole('button',{name:'Load dictionary JSON',exact:true}).click();
 await page.locator('input[type="file"][accept*="application/json"]').setInputFiles({name:'words.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({chrysanthemum:'krisan'}))});
 await words.getByLabel('Word or passage').fill('chrysanthemum');await words.getByRole('button',{name:'Look up locally',exact:true}).click();await expect(words).toContainText('krisan');expect(requests).toHaveLength(0);
 await words.getByRole('combobox',{name:'Translation direction'}).click();await page.getByRole('option',{name:'English → Indonesia',exact:true}).click();await words.getByRole('button',{name:'Translate online',exact:true}).click();await expect(words).toContainText('krisan');await expect.poll(()=>requests.length).toBe(1);
});

test('Reader narration uses installed voices and the audio panel has no autoplay',async({page})=>{
 await start(page);await importText(page);await openReader(page);await page.getByRole('button',{name:'Reading desk',exact:true}).click();
 const desk=page.getByRole('dialog',{name:'Reading desk',exact:true});await desk.getByRole('tab',{name:'Audio',exact:true}).click();
 await expect(desk.getByText('Audio & room atmosphere')).toBeVisible();await expect(desk.getByText('Read aloud')).toBeVisible();
 const narration=desk.locator('.reader-narration-panel');await narration.getByRole('switch',{name:'Local voices only'}).check();await expect(narration.getByRole('switch',{name:'Local voices only'})).toBeChecked();
 await expect(desk.locator('audio')).toHaveCount(0);
});

test('reading presets save per format and retain a book-specific mode',async({page})=>{
 await start(page);await page.goto('/app/#/settings/library');const panel=page.locator('.settings-panel').filter({hasText:'Reading presets'});
 await panel.getByRole('combobox',{name:'Novel and text'}).click();await page.getByRole('option',{name:'Single page',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sela-library:preset:novel')||'{}').mode)).toBe('single');
 await page.reload();await expect(panel.getByRole('combobox',{name:'Novel and text'})).toHaveValue('Single page');
});

test('About Sela keeps social links distinct, labeled and visible on narrow screens',async({page})=>{
 await start(page);await page.goto('/app/#/settings');const about=page.locator('.about-sela-card');await expect(about).toBeVisible();
 for(const brand of ['GitHub','Instagram','Threads','LinkedIn']){const link=about.getByRole('link',{name:brand,exact:true});await expect(link).toBeVisible();await expect(link.locator('svg.social-brand-icon')).toHaveCount(1);}
 for(const width of [320,393,768,1440]){await page.setViewportSize({width,height:850});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`About overflows at ${width}px`).toBe(true);}
});
