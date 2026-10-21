import { test, expect } from '@playwright/test';

test('installed app opens and resumes a bookmarked book offline without clearing shelf data', async ({ page, context }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en', appearance: 'light', theme: 'vanilla' }));
  });

  await page.goto('/app/');
  await expect(page.locator('.sela-app')).toBeVisible();
  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration('/app/');
    return registration?.active?.state || '';
  })).toBe('activated');
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL || '')).toContain('/app/sw.js');

  await page.getByRole('button', { name: /^(?:Download & read sample|Read sample)$/ }).click();
  const reader = page.locator('.reader-layout');
  await expect(reader.locator('.reader-chrome-top')).toBeVisible({ timeout: 20000 });
  await reader.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(reader.getByRole('spinbutton', { name: 'Current page' })).toHaveValue('2');
  await reader.getByRole('button', { name: 'Bookmark page', exact: true }).click();
  await expect(reader.getByRole('button', { name: 'Remove bookmark', exact: true })).toHaveAttribute('aria-pressed', 'true');

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.reader-chrome-top')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.reader-body')).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'Current page' })).toHaveValue('2');
  await expect(page.getByRole('button', { name: 'Remove bookmark', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(pageErrors).toEqual([]);
});
