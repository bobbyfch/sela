import { test, expect } from '@playwright/test';

// Runs in the chromium-pwa project (real service worker). The pack lives in IndexedDB, so it must
// stay readable after a cold offline reload of the installed shell.
test('an installed Taman Bacaan pack opens after an offline reload with the real service worker', async ({ page, context }) => {
  test.setTimeout(90000);
  await page.addInitScript(() => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en' })));
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/sela/app/');
  await expect(page.locator('.sela-app')).toBeVisible();
  await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistration('/sela/app/'))?.active?.state || '')).toBe('activated');
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL || '')).toContain('/sela/app/sw.js');

  await page.goto('/sela/app/#/discover?lens=taman');
  const card = page.getByRole('article', { name: /Stories of the 25 Prophets/ });
  await card.getByRole('button', { name: 'Download for offline' }).click();
  await expect(card.getByRole('button', { name: 'Read' })).toBeVisible();

  await context.setOffline(true);
  await page.goto('/sela/app/#/taman/sela-prophets-id-v1/musa');
  await page.reload();
  await expect(page.getByRole('heading', { level: 2, name: 'Nabi Musa' })).toBeVisible();
  await context.setOffline(false);
  expect(pageErrors).toEqual([]);
});
