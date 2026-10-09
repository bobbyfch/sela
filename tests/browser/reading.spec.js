import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('manga arrows, left navigation and filters preserve PDF pixels', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await window.FlippyReady;
    window.reader = new Flippy({ pdfUrl: '/example/yang-tidak-ikut-pulang.pdf', mode: 'manga', duration: 0, soundEnabled: false });
    await reader.open();
  });
  await expect(page.locator('.fb-rtl')).toBeVisible();
  const left = await page.locator('.fb-nav-next').boundingBox();
  const right = await page.locator('.fb-nav-prev').boundingBox();
  expect(left.x).toBeLessThan(right.x);
  await page.locator('.fb-root').focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => page.evaluate(() => reader.currentPage())).toBe(2);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => page.evaluate(() => reader.currentPage())).toBe(1);
  await page.locator('.fb-nav-next').click();
  await expect.poll(() => page.evaluate(() => reader.currentPage())).toBe(2);
  await page.locator('.flippy-filter').selectOption('grayscale');
  await expect.poll(() => page.locator('.fb-sheet canvas').first().evaluate(c => getComputedStyle(c).filter)).toBe('grayscale(1) brightness(1)');
  await page.evaluate(() => reader.setFilter('sepia'));
  await expect(page.locator('.flippy-filter')).toHaveValue('sepia');
  expect(await page.locator('.fb-sheet canvas').first().evaluate(c => getComputedStyle(c).scale)).toBe('-1 1');
  await page.evaluate(() => { reader.goTo(4); reader.setFilter('none'); });
  await page.screenshot({ path: 'test-results/manga-spread.png' });
  // The mirrored hot-right zone is physically on the left. A tap advances.
  await page.evaluate(() => reader.goTo(1));
  await page.locator('.fb-hot-right').click();
  await expect.poll(() => page.evaluate(() => reader.currentPage())).toBe(2);
  await page.evaluate(() => reader.goTo(1));
  await expect.poll(() => page.evaluate(() => reader.book.anim === null)).toBe(true);
  // Returning to the cover recenters the stage through a CSS transition.
  // Hover waits for the hit zone to settle before measuring mouse coordinates.
  await page.locator('.fb-hot-right').hover();
  const zone = await page.locator('.fb-hot-right').boundingBox();
  const book = await page.locator('.fb-book').boundingBox();
  await page.mouse.move(zone.x + zone.width / 2, zone.y + zone.height / 2);
  await page.mouse.down();
  await expect.poll(() => page.evaluate(() => !!reader.book.drag)).toBe(true);
  // Cross the book midpoint; completion must not depend on event delivery speed.
  await page.mouse.move(book.x + book.width - 10, zone.y + zone.height / 2, { steps: 20 });
  expect(await page.evaluate(() => reader.book.drag.p)).toBeGreaterThan(0.5);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => reader.currentPage())).toBe(2);
});

test('site language/theme persistence, responsive layout and metadata', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-language-choice=id]').click();
  await expect(page.locator('[data-language-choice=id]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await expect(page.locator('h1')).toContainText('Lebih banyak membaca');
  await page.locator('[data-theme-choice=dark]').click();
  await page.reload();
  await expect(page.locator('#language')).toHaveValue('id');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.screenshot({ path: 'test-results/site-desktop-dark-id.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator('[data-theme-choice=light]').click();
  await page.locator('[data-language-choice=en]').click();
  await expect(page.locator('[data-language-choice=en]')).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/site-mobile-light-en.png', fullPage: true });
  expect(await page.locator('link[rel=canonical]').getAttribute('href')).toBe('https://bobbyfch.github.io/sela/');
  const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(schema.softwareVersion).toBe('1.2.0');
  await page.locator('[data-theme-choice=auto]').click();
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(23, 35, 29)');
});

test('compatibility entry avoids modern bundle on missing browser capabilities', async ({ page, browserName }) => {
  const modern=[];
  page.on('request', req => { if (req.url().endsWith('/flippy.min.js')) modern.push(req.url()); });
  await page.addInitScript(() => { window.ResizeObserver = undefined; });
  await page.goto('/');
  expect(await page.evaluate(() => Flippy.supported)).toBe(false);
  expect(modern).toEqual([]);
  await expect(page.locator('a[href="example/yang-tidak-ikut-pulang.pdf"]').first()).toBeVisible();
  await expect(page.locator('[data-mode]')).toHaveCount(4);
  await page.route('**/example/yang-tidak-ikut-pulang.pdf', async route => route.fulfill({
    contentType: 'application/pdf',
    headers: { 'Content-Disposition': 'attachment; filename="limaraya.pdf"' },
    body: await readFile('example/yang-tidak-ikut-pulang.pdf')
  }));
  const original = page.waitForRequest(request => request.url().endsWith('/example/yang-tidak-ikut-pulang.pdf') && request.isNavigationRequest());
  const downloaded = browserName !== 'webkit' ? page.waitForEvent('download') : null;
  await page.locator('[data-mode=book]').click();
  expect((await original).resourceType()).toBe('document');
  if(downloaded)expect((await downloaded).suggestedFilename()).toBe('limaraya.pdf');
});

test('web component destroys viewer on disconnect and reconnects once', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const {registerFlippyElement}=await import('/examples/web-component.js'); registerFlippyElement();
    window.element=document.createElement('flippy-reader'); element.setAttribute('src','/example/yang-tidak-ikut-pulang.pdf'); document.body.appendChild(element);
    await element.viewer.open();
    element.remove(); document.body.appendChild(element);
  });
  await expect(page.locator('.library-reader-overlay')).toHaveCount(0);
  await expect(page.locator('flippy-reader button')).toHaveCount(1);
});
