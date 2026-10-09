import { test, expect } from '@playwright/test';

function pdfBytes(pages = 3) {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>'];
  const ids = Array.from({ length: pages }, (_, i) => 3 + i * 2);
  objects.push(`<< /Type /Pages /Kids [${ids.map(id => `${id} 0 R`).join(' ')}] /Count ${pages} >>`);
  for (let i = 0; i < pages; i++) {
    const content = '0.2 0.6 0.4 rg 20 20 250 380 re f';
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${i % 2 ? 420 : 300} 440] /Resources << >> /Contents ${ids[i] + 1} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  }
  let out = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((obj, i) => { offsets.push(Buffer.byteLength(out)); out += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/test.pdf', route => route.fulfill({ contentType: 'application/pdf', body: pdfBytes() }));
  await page.goto('/');
});

for (const mode of ['book', 'single', 'webtoon', 'manga']) {
  test(`${mode}: ready, actual canvas, navigation, bookmark, close/reopen`, async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.evaluate(async mode => { window.testViewer = new Flippy({ pdfUrl: '/test.pdf', mode, soundEnabled: false, duration: 0 }); await testViewer.open(); }, mode);
    await expect(page.locator('.library-reader-overlay')).toBeVisible();
    await expect.poll(() => page.evaluate(() => testViewer.totalPages)).toBe(3);
    await expect.poll(() => page.evaluate(() => Array.from(testViewer.overlay.querySelectorAll('canvas')).some(canvas => canvas.width > 0 && canvas.getContext('2d').getImageData(30, 30, 1, 1).data[3] > 0))).toBe(true);
    await page.evaluate(() => testViewer.goTo(2));
    await expect(page.locator('.library-reader-page-form input')).toHaveValue('2');
    await page.getByRole('button', { name: 'Tandai halaman ini', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Hapus penanda halaman ini', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Tampilkan penanda dan pratinjau halaman' }).click();
    await expect(page.locator('.library-reader-sidebar')).toBeVisible();
    await page.getByRole('button', { name: 'Tutup pembaca', exact: true }).click();
    await expect(page.locator('.library-reader-overlay')).toHaveCount(0);
    await page.evaluate(async () => { await testViewer.open(); });
    await expect(page.locator('.library-reader-page-form input')).toHaveValue('2');
    await page.evaluate(() => testViewer.close());
    expect(errors).toEqual([]);
  });
}

test('one-page PDF and page input clamp', async ({ page }) => {
  await page.route('**/single.pdf', route => route.fulfill({ contentType: 'application/pdf', body: pdfBytes(1) }));
  await page.evaluate(async () => { window.testViewer = new Flippy({ pdfUrl: '/single.pdf', soundEnabled: false, duration: 0 }); await testViewer.open(); testViewer.next(); testViewer.goTo(99); });
  expect(await page.evaluate(() => testViewer.currentPage())).toBe(1);
  await page.locator('.library-reader-page-form input').fill('0');
  await page.locator('.library-reader-page-form').dispatchEvent('submit');
  await expect(page.locator('.library-reader-page-form input')).toHaveValue('1');
});

test('legacy PDF build is patched and renders', async ({ page }) => {
  await page.evaluate(async () => { window.testViewer = new Flippy({ pdfUrl: '/test.pdf', pdfBuild: 'legacy', soundEnabled: false }); await testViewer.open(); });
  await expect.poll(() => page.evaluate(() => testViewer.totalPages)).toBe(3);
  await expect.poll(() => page.evaluate(() => Array.from(testViewer.overlay.querySelectorAll('canvas')).some(c => c.width > 0))).toBe(true);
});

test('closing during slow PDF load destroys its loading task', async ({ page }) => {
  const state = await page.evaluate(async () => {
    let destroyCalls = 0; let resolvePdf;
    const lib = { getDocument() { return { promise: new Promise(resolve => { resolvePdf = resolve; }), destroy: async () => { destroyCalls++; } }; } };
    const viewer = new Flippy({ pdfUrl: '/test.pdf', pdfjsLib: lib, autoStyles: false });
    const pending = viewer.open().catch(error => error.name);
    await new Promise(resolve => setTimeout(resolve, 50)); viewer.close();
    resolvePdf({ destroy: async () => { destroyCalls++; } });
    const result = await pending;
    await new Promise(resolve => setTimeout(resolve, 50));
    return { result, destroyCalls, overlays: document.querySelectorAll('.library-reader-overlay').length };
  });
  expect(state.result).toBe('AbortError'); expect(state.destroyCalls).toBeGreaterThanOrEqual(1); expect(state.overlays).toBe(0);
});

test('missing PDF offers direct fallback and viewer can be retried', async ({ page }) => {
  const error = await page.evaluate(async () => {
    window.testViewer = new Flippy({ pdfUrl: '/missing.pdf', soundEnabled: false });
    try { await testViewer.open(); } catch (error) { return error.message; }
  });
  expect(error).toBeTruthy();
  await expect(page.locator('.library-reader-fallback a')).toBeVisible();
  await page.evaluate(async () => { testViewer.options.pdfUrl = '/test.pdf'; await testViewer.open(); });
  await expect(page.locator('.library-reader-overlay')).toHaveCount(1);
  expect(await page.evaluate(() => testViewer.totalPages)).toBe(3);
});

test('light/dark/mobile/reduced motion and focus restoration', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const theme of ['light', 'dark']) {
    await page.locator('[data-mode="book"]').focus();
    await page.evaluate(async theme => { window.testViewer = new Flippy({ pdfUrl: '/test.pdf', theme, soundEnabled: false }); await testViewer.open(); }, theme);
    await expect(page.locator('.library-reader-overlay')).toHaveAttribute('data-flippy-theme', theme);
    expect(await page.evaluate(() => testViewer.book.mode)).toBe('single');
    expect(await page.evaluate(() => testViewer.book.opts.duration)).toBe(0);
    expect(await page.evaluate(() => testViewer.overlay.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/mobile-${theme}.png` });
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-mode="book"]')).toBeFocused();
  }
});

test('ESM entry is usable in browser without globals', async ({ page }) => {
  const pages = await page.evaluate(async () => {
    const { default: Flippy } = await import('/dist/js/sela.esm.js');
    const viewer = new Flippy({ pdfUrl: '/test.pdf', mode: 'single', soundEnabled: false }); await viewer.open();
    const count = viewer.totalPages; viewer.close(); return count;
  });
  expect(pages).toBe(3);
});

test('private endpoint headers, binary data, and host style isolation', async ({ page }) => {
  let auth;
  await page.route('**/private/ebook/42', route => {
    auth = route.request().headers()['authorization'];
    return route.fulfill({ contentType: 'application/pdf', body: pdfBytes(2) });
  });
  await page.addStyleTag({ content: '*{box-sizing:border-box;border:0 solid}button,input,select{font:inherit;background:transparent;color:inherit;padding:0}svg{display:block}h2{margin:0;font-size:inherit}footer{max-width:500px;margin:auto;flex-direction:column}' });
  await page.evaluate(async () => {
    window.testViewer = new Flippy({ pdfUrl: '/private/ebook/42', httpHeaders: { Authorization: 'Bearer fixture' }, soundEnabled: false, theme: 'light' });
    await testViewer.open();
  });
  expect(auth).toBe('Bearer fixture');
  const buttonWidth = await page.getByRole('button', { name: 'Tutup pembaca', exact: true }).evaluate(el => el.getBoundingClientRect().width);
  expect(buttonWidth).toBeGreaterThanOrEqual(38);
  const footerDifference = await page.evaluate(() => Math.abs(document.querySelector('.library-reader-footer').getBoundingClientRect().width - document.querySelector('.library-reader-shell').getBoundingClientRect().width));
  expect(footerDifference).toBeLessThan(1);
  await page.evaluate(() => testViewer.close());
  const result = await page.evaluate(async bytes => {
    const data = new Uint8Array(bytes);
    const viewer = new Flippy({ data, id: 'binary-fixture', soundEnabled: false });
    await viewer.open(); const result = { pages: viewer.totalPages, originalBytes: data.byteLength, hiddenDownload: viewer.overlay.querySelector('a[download]').hidden };
    viewer.close(); return result;
  }, Array.from(pdfBytes(2)));
  expect(result.pages).toBe(2); expect(result.originalBytes).toBeGreaterThan(0); expect(result.hiddenDownload).toBe(true);
});

test('demo loads no PDF engine until opened and renders the real sample', async ({ page }) => {
  const requests = []; page.on('request', request => requests.push(request.url()));
  await page.reload();
  expect(requests.some(url => url.includes('/vendor/pdfjs/'))).toBe(false);
  await page.getByRole('button', { name: /01 \/ BOOK/ }).click();
  await expect(page.locator('.library-reader-footer input[type=range]')).toBeEnabled();
  await expect.poll(() => page.locator('.library-reader-book canvas').evaluateAll(canvases => canvases.some(c => c.width > 0))).toBe(true);
  await page.screenshot({ path: 'test-results/desktop-real-pdf.png' });
});
