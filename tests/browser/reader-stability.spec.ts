import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {unzipSync,zipSync,strToU8} from 'fflate';

test('Android-style unnamed EPUB imports by contents and deduplicates renamed originals',async({page})=>{
 await page.goto('/mobile/');await expect(page.locator('#mobile-app')).toHaveAttribute('data-ready','true');await page.locator('[data-tab=library]').click();
 const buffer=await readFile('example/yang-tidak-ikut-pulang.epub');
 await page.locator('#books').setInputFiles({name:'Download',mimeType:'application/octet-stream',buffer});await expect(page.locator('.book')).toHaveCount(1);await expect(page.locator('#books')).toBeEnabled();
 await page.locator('#books').setInputFiles({name:'NOVEL.EPUB',mimeType:'',buffer});await expect(page.locator('#status')).toContainText('already on shelf');await expect(page.locator('.book')).toHaveCount(1);
 await page.locator('.cover').click();await page.getByRole('dialog',{name:'Book information',exact:true}).getByRole('button',{name:'Read this book',exact:true}).click();await expect(page.locator('.sela-epub-chapter:not([hidden])')).toBeVisible();await page.getByRole('button',{name:'Back to library',exact:true}).click();await expect(page.locator('.library-reader-overlay')).toHaveCount(0);
 await page.locator('#books').setInputFiles({name:'broken.epub',mimeType:'application/epub+zip',buffer:Buffer.from('not a zip')});await expect(page.locator('#status')).toContainText('broken.epub');await expect(page.locator('.book')).toHaveCount(1);
});
test('DOCX and ODT provide safe reflow text while preserving their original files',async({page})=>{
 await page.goto('/mobile/');await page.locator('[data-tab=library]').click();
 const docx=zipSync({'[Content_Types].xml':strToU8('<Types/>'),'word/document.xml':strToU8('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Office chapter</w:t></w:r></w:p><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Readable DOCX text.</w:t></w:r></w:p></w:body></w:document>')});
 const odt=zipSync({mimetype:strToU8('application/vnd.oasis.opendocument.text'),'content.xml':strToU8('<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:text><text:h text:outline-level="1">ODT chapter</text:h><text:p>Readable ODT text.</text:p></office:text></office:body></office:document-content>')});
 await page.locator('#books').setInputFiles([{name:'Document.docx',mimeType:'',buffer:Buffer.from(docx)},{name:'Document.odt',mimeType:'',buffer:Buffer.from(odt)}]);await expect(page.locator('.book')).toHaveCount(2);await expect(page.locator('#books')).toBeEnabled();
 for(const format of ['docx','odt']){await page.locator('.shelf-refine').evaluate(el=>{if(!el.hasAttribute('open'))(el.querySelector('.shelf-refine-toggle') as HTMLElement).click();});await page.locator('#format-filter').selectOption(format);await expect(page.locator('.book')).toHaveCount(1);await page.locator('.cover').click();await page.getByRole('dialog',{name:'Book information',exact:true}).getByRole('button',{name:'Read this book',exact:true}).click();await expect(page.locator('.sela-epub article')).toContainText('Readable '+format.toUpperCase()+' text.');await expect(page.locator('.sela-epub article')).toContainText('Original layout');await page.getByRole('button',{name:'Back to library',exact:true}).click();await expect(page.locator('.library-reader-overlay')).toHaveCount(0);await expect(page.locator('.library-reader-overlay')).toHaveCount(0);await expect(page.getByRole('dialog',{name:'Book information',exact:true})).toHaveCount(0);}
});

test('obfuscated EPUB fonts are accepted but encrypted chapters are rejected',async({page})=>{
 const files=unzipSync(await readFile('example/yang-tidak-ikut-pulang.epub'));
 const opfName=Object.keys(files).find(name=>name.endsWith('.opf'));
 const opf=new TextDecoder().decode(files[opfName]);files[opfName]=strToU8(opf.replace('</manifest>','<item id="font" href="font.otf" media-type="font/otf"/></manifest>'));files['OEBPS/font.otf']=new Uint8Array([0,1,2]);
 const encryption=uri=>strToU8(`<encryption xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><EncryptedData xmlns="http://www.w3.org/2001/04/xmlenc#"><EncryptionMethod Algorithm="http://www.idpf.org/2008/embedding"/><CipherData><CipherReference URI="${uri}"/></CipherData></EncryptedData></encryption>`);
 files['META-INF/encryption.xml']=encryption('OEBPS/font.otf');await page.route('**/font.epub',route=>route.fulfill({body:Buffer.from(zipSync(files))}));
 await page.goto('/');await page.evaluate(async()=>{await SelaReady;window.reader=new Sela({url:'/font.epub',format:'epub'});await reader.open();});await expect(page.locator('.sela-epub-chapter').first()).toBeAttached();await page.evaluate(()=>reader.destroy());
 files['META-INF/encryption.xml']=encryption('OEBPS/chapter0.xhtml');await page.route('**/encrypted.epub',route=>route.fulfill({body:Buffer.from(zipSync(files))}));
 await page.evaluate(async()=>{window.reader=new Sela({url:'/encrypted.epub',format:'epub'});try{await reader.open();}catch(e){window.epubError=e.message;}});await expect.poll(()=>page.evaluate(()=>window.epubError)).toContain('Encrypted/DRM');
});
test('EPUB footnote opens a popup and Escape returns to the same chapter',async({page})=>{
 const files=unzipSync(await readFile('example/yang-tidak-ikut-pulang.epub'));files['OEBPS/chapter0.xhtml']=strToU8('<html xmlns:epub="http://www.idpf.org/2007/ops"><body><h1>With a note</h1><p>Read the <a href="#note" epub:type="noteref">footnote</a>.</p><aside id="note"><p>Extra context without leaving your place.</p></aside></body></html>');await page.route('**/notes.epub',route=>route.fulfill({body:Buffer.from(zipSync(files))}));
 await page.goto('/');await page.evaluate(async()=>{await SelaReady;window.r=new Sela({url:'/notes.epub',format:'epub',mode:'single',language:'en'});await r.open();});await page.getByRole('link',{name:'footnote',exact:true}).click();await expect(page.getByRole('dialog',{name:'Footnote',exact:true})).toContainText('Extra context');await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Footnote',exact:true})).toHaveCount(0);await expect(page.locator('.library-reader-overlay')).toBeVisible();await expect(page.getByRole('link',{name:'footnote',exact:true})).toBeFocused();
});

test('manga to Webtoon clears RTL and zoom keeps old canvas until replacement is rendered',async({page})=>{
 await page.goto('/');await page.evaluate(async()=>{await SelaReady;window.reader=new Sela({url:'/example/yang-tidak-ikut-pulang.pdf',mode:'manga',duration:0});await reader.open();});
 await expect(page.locator('.fb-rtl')).toHaveCount(1);
 await page.evaluate(()=>reader.setMode('webtoon'));await expect(page.locator('.sela-webtoon')).toBeVisible();await expect(page.locator('.fb-rtl')).toHaveCount(0);
 const first=page.locator('.sela-webtoon-page canvas').first();await expect.poll(()=>first.evaluate(c=>(c as HTMLCanvasElement).width)).toBeGreaterThan(0);
 await page.evaluate(()=>{const canvas=document.querySelector('.sela-webtoon-page canvas');window.previousCanvas=canvas;reader.setZoom(1.5);window.oldCanvasSurvived=(canvas as HTMLCanvasElement).width>0&&canvas.isConnected;});expect(await page.evaluate(()=>window.oldCanvasSurvived)).toBe(true);
 await expect.poll(()=>page.evaluate(()=>document.querySelector('.sela-webtoon-page canvas')!==window.previousCanvas)).toBe(true);
 expect(await first.evaluate(c=>getComputedStyle(c).scale)).not.toBe('-1 1');
 await page.evaluate(()=>reader.setMode('book'));await expect(page.locator('.fb-root')).toBeVisible();await page.evaluate(()=>reader.setMode('webtoon'));await expect(page.locator('.fb-rtl')).toHaveCount(0);
});
