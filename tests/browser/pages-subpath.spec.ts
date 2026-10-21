import { test, expect } from '@playwright/test';

test('public demo sample PDF stays within the GitHub Pages /sela base', async ({ page }) => {
  const pageErrors: string[] = [];
  const relevantRequests: string[] = [];
  const failedLocalAssets: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => relevantRequests.push(request.url()));
  page.on('response', response => {
    const url = new URL(response.url());
    if (/^\/sela\/(?:dist|example)\//.test(url.pathname) && !response.ok()) {
      failedLocalAssets.push(`${response.status()} ${url.pathname}`);
    }
  });

  await page.goto('/sela/#samples-title');
  await expect(page.locator('#sample')).toBeVisible();
  await page.locator('.developer-playground').evaluate(element => { (element as HTMLDialogElement).open = true; });
  await page.locator('#sample').selectOption('pdf');
  await page.locator('.launch-reader').click();
  await expect.poll(async () => (await page.locator('#status').textContent()) || '', { timeout: 30000 }).toContain('pages');

  expect(new URL(page.url()).pathname).toBe('/sela/');
  const paths = relevantRequests.map(url => new URL(url).pathname);
  expect(paths).toContain('/sela/dist/js/sela.compat.js');
  expect(paths.some(path => path.startsWith('/sela/dist/vendor/pdfjs/'))).toBe(true);
  expect(paths.some(path => path.startsWith('/sela/example/'))).toBe(true);
  expect(paths.filter(path => /\/(?:dist|example)\//.test(path)).every(path => path.startsWith('/sela/'))).toBe(true);
  expect(failedLocalAssets).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('app opens its sample PDF with the ESM SDK and lazy assets under /sela', async ({ page }) => {
  const pageErrors: string[] = [];
  const relevantRequests: string[] = [];
  const failedLocalAssets: string[] = [];
  await page.addInitScript(() => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en' })));
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => relevantRequests.push(request.url()));
  page.on('response', response => {
    const url = new URL(response.url());
    if (/^\/sela\/(?:app|dist|example)\//.test(url.pathname) && !response.ok()) {
      failedLocalAssets.push(`${response.status()} ${url.pathname}`);
    }
  });

  await page.goto('/sela/app/');
  await expect(page.locator('.sela-app')).toBeVisible();
  await page.getByRole('button', { name: 'Download & read sample', exact: true }).click();
  const reader = page.locator('.reader-layout');
  await expect(reader).toBeVisible({ timeout: 30000 });
  await expect(reader.locator('.reader-chrome-top')).toBeVisible({ timeout: 30000 });

  const paths = relevantRequests.map(url => new URL(url).pathname);
  expect(paths).toContain('/sela/dist/js/sela.esm.js');
  expect(paths.some(path => path.startsWith('/sela/app/chunks/'))).toBe(true);
  expect(paths.some(path => path.startsWith('/sela/dist/vendor/pdfjs/'))).toBe(true);
  expect(paths.some(path => path.startsWith('/sela/example/'))).toBe(true);
  expect(paths.filter(path => /\/(?:app|dist|example)\//.test(path)).every(path => path.startsWith('/sela/'))).toBe(true);
  expect(failedLocalAssets).toEqual([]);
  expect(pageErrors).toEqual([]);
});
