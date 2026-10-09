import { test, expect } from '@playwright/test';
import { zipSync, unzipSync, strToU8 } from 'fflate';
import { readFile } from 'node:fs/promises';

function outlinePdf() {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R /Outlines 7 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 400] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 400] /Resources << /Font << /F1 5 0 R >> >> /Contents 9 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length 51 >>\nstream\nBT /F1 16 Tf 30 350 Td (A quiet interval) Tj ET\nendstream',
    '<< /Type /Outlines /First 8 0 R /Last 8 0 R /Count 1 >>',
    '<< /Title (Second chapter) /Parent 7 0 R /Dest [4 0 R /Fit] >>',
    '<< /Length 51 >>\nstream\nBT /F1 16 Tf 30 350 Td (The story continues) Tj ET\nendstream'
  ];
  let pdf = '%PDF-1.4\n', offsets = [0];
  objects.forEach((obj, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  return Buffer.from(pdf + `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
}
async function ready(page, config) {
  await page.goto('/');
  await page.evaluate(async config => { await FlippyReady; window.r = new Sela({ language: 'en', duration: 0, soundEnabled: false, ...config }); await r.open(); }, config);
}

test('PDF embedded bookmark, selectable transcript, search, notes round trip and lazy tools', async ({ page }) => {
  const requests = []; page.on('request', r => requests.push(r.url()));
  await page.route('**/outline.pdf', route => route.fulfill({ contentType: 'application/pdf', body: outlinePdf() }));
  await ready(page, { url: '/outline.pdf', mode: 'single', id: 'outline-fixture' });
  expect(requests.some(url => url.includes('sela.tools'))).toBe(false);
  await page.keyboard.press('Control+f');
  await expect(page.getByRole('searchbox', { name: 'Search text', exact: true })).toBeFocused();
  await expect(page.locator('.sela-transcript')).toContainText('A quiet interval');
  await page.getByRole('tab',{name:'Contents',exact:true}).click();
  await page.getByRole('button', { name: 'Second chapter', exact: true }).click();
  await expect(page.locator('.library-reader-page-form input')).toHaveValue('2');
  await page.getByRole('tab',{name:'Find in book',exact:true}).click();
  await page.getByRole('searchbox', { name: 'Search text', exact: true }).fill('quiet');
  await page.getByRole('button', { name: 'Find', exact: true }).click();
  await expect(page.locator('.sela-search-results button')).toHaveCount(1);
  await page.locator('.sela-search-results button').click();
  await expect(page.locator('.library-reader-page-form input')).toHaveValue('1');
  await page.getByRole('tab',{name:'Your notes',exact:true}).click();
  await page.getByRole('textbox', { name: 'Note for this page / chapter', exact: true }).fill('A note to keep.');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export notes & bookmarks', exact: true }).click();
  const notes = JSON.parse(await readFile(await (await download).path(), 'utf8')); expect(notes.notes['1']).toBe('A note to keep.');
  await page.getByLabel('Import notes & bookmarks').setInputFiles({ name: 'notes.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ version: 1, marks: [2], notes: { '1': 'Imported note' } })) });
  await expect(page.getByRole('textbox', { name: 'Note for this page / chapter', exact: true })).toHaveValue('Imported note');
  await page.keyboard.press('Escape'); await expect(page.locator('.sela-tools')).not.toBeVisible();
  await expect(page.locator('.library-reader-page-form input')).toBeVisible();
  await page.evaluate(() => r.close()); await expect(page.locator('.sela-tools')).toHaveCount(0);
});

test('EPUB nav anchors and footnotes survive sanitization', async ({ page }) => {
  const files = unzipSync(await readFile('example/yang-tidak-ikut-pulang.epub'));
  files['OEBPS/chapter0.xhtml'] = strToU8('<html><body><h1>Start</h1><p><a href="#note">A footnote</a></p><div style="height:2000px">Long content</div><h2 id="note">The note</h2><p>The ending.</p></body></html>');
  files['OEBPS/nav.xhtml'] = strToU8('<html xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol><li><a href="chapter0.xhtml#note">A nested note</a><ol><li><a href="chapter1.xhtml">Next chapter</a></li></ol></li></ol></nav></body></html>');
  await page.route('**/anchors.epub', route => route.fulfill({ body: Buffer.from(zipSync(files)) }));
  await ready(page, { url: '/anchors.epub', mode: 'single' }); await page.evaluate(() => r.showTools());
  await page.getByRole('button', { name: 'A nested note', exact: true }).click();
  await expect(page.locator('.flippy-epub-chapter:not([hidden]) h2')).toHaveAttribute('id', 'note');
  await page.getByRole('button', { name: 'Next chapter', exact: true }).click();
  await expect(page.locator('.library-reader-page-form input')).toHaveValue('2');
  expect(await page.evaluate(() => r.getText())).toContain('2. Pukul Empat Lewat Empat\n');
});

for (const format of ['txt', 'md', 'html', 'fb2']) test(`${format}: reflow, outline and no PDF/ZIP decoder`, async ({ page }) => {
  const requests = []; page.on('request', r => requests.push(r.url())); await ready(page, { url: `/example/sela.${format}` });
  await expect(page.locator('.flippy-epub article')).toContainText('Sela');
  await page.evaluate(() => r.showTools()); await expect(page.locator('.sela-transcript')).toContainText('Sela');
  expect(requests.some(url => /vendor\/pdfjs|flippy.archive/.test(url))).toBe(false);
});

test('HTML strips active content, external resources and handlers', async ({ page }) => {
  await page.route('**/unsafe.html', route => route.fulfill({ body: '<h1>Safe</h1><p>Readable</p><script>alert(1)</script><img src="https://evil.invalid/x"><a href="javascript:alert(1)" onclick="alert(1)">bad</a><iframe src="https://evil.invalid"></iframe>' }));
  await ready(page, { url: '/unsafe.html' });
  const article = page.locator('.flippy-epub article'); await expect(article.locator('script,img,iframe,[onclick]')).toHaveCount(0); await expect(article.locator('a')).not.toHaveAttribute('href');
});

test('TTS asynchronous voices, local preference, pause/resume, page change and close cancel', async ({ page }) => {
  await page.addInitScript(() => {
    window.ttsCalls = []; window.fakeVoices = [];
    class Speech extends EventTarget { getVoices() { return fakeVoices; } speak(u) { window.spoken = u; ttsCalls.push(['speak', u.text, u.voice.localService]); } cancel() { ttsCalls.push(['cancel']); } pause() { ttsCalls.push(['pause']); } resume() { ttsCalls.push(['resume']); } }
    Object.defineProperty(window, 'speechSynthesis', { value: new Speech(), configurable: true });
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  });
  await ready(page, { url: '/example/yang-tidak-ikut-pulang.epub', mode: 'single' }); await page.evaluate(() => r.showTools());
  await page.getByRole('tab',{name:'Read aloud',exact:true}).click(); await expect(page.getByRole('button', { name: 'Listen', exact: true })).toBeDisabled();
  await page.evaluate(() => { fakeVoices = [{ name: 'Local Indonesian', lang: 'id-ID', localService: true }, { name: 'Remote', lang: 'en-US', localService: false }]; speechSynthesis.dispatchEvent(new Event('voiceschanged')); });
  await expect(page.getByRole('combobox', { name: 'Narration voice', exact: true }).locator('option')).toHaveCount(1);
  await page.getByRole('button', { name: 'Listen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => ttsCalls.filter(c => c[0] === 'speak').length)).toBe(1);
  expect(await page.evaluate(() => spoken.text.length)).toBeLessThanOrEqual(240);
  await page.getByRole('button', { name: 'Pause', exact: true }).click(); await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.evaluate(() => r.goTo(2)); expect(await page.evaluate(() => ttsCalls.at(-1)[0])).toBe('cancel');
  await page.getByRole('button', { name: 'Listen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => ttsCalls.filter(c => c[0] === 'speak').length)).toBe(2);
  await page.evaluate(() => r.close()); expect(await page.evaluate(() => ttsCalls.at(-1)[0])).toBe('cancel');
});

test('unavailable TTS degrades; mobile tools and rotation denial remain readable', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }));
  await page.setViewportSize({ width: 375, height: 812 }); await ready(page, { url: '/example/yang-tidak-ikut-pulang.pdf', mode: 'book' });
  await expect(page.locator('.fb-book')).toHaveClass(/fb-single-mode/);
  await page.evaluate(() => r.showTools()); await page.getByRole('tab',{name:'Read aloud',exact:true}).click(); await expect(page.getByRole('button', { name: 'Listen', exact: true })).toBeDisabled();
  const bounds = await page.locator('.sela-tools').boundingBox(); expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(375);
  await page.getByRole('button', { name: 'Reading tools', exact: true }).click(); await page.evaluate(() => r.goTo(5));
  await page.setViewportSize({ width: 1000, height: 600 }); await expect(page.locator('.fb-book')).not.toHaveClass(/fb-single-mode/);
  await page.setViewportSize({ width: 375, height: 812 }); await expect(page.locator('.library-reader-page-form input')).toHaveValue('5');
});
