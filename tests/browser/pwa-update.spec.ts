import { test, expect, type Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function waitForAppWorker(page: Page) {
  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration('/app/');
    return registration?.active?.state || '';
  })).toBe('activated');
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL || '')).toContain('/app/sw.js');
}

async function activeWorkerVersion(page: Page): Promise<string> {
  return page.evaluate(() => new Promise<string>((resolve, reject) => {
    const worker = navigator.serviceWorker.controller;
    if (!worker) { reject(new Error('No active service worker')); return; }
    const channel = new MessageChannel();
    const timeout = window.setTimeout(() => {
      channel.port1.close();
      reject(new Error('Service worker version request timed out'));
    }, 3000);
    channel.port1.onmessage = event => {
      window.clearTimeout(timeout);
      channel.port1.close();
      resolve(typeof event.data?.version === 'string' ? event.data.version : '');
    };
    worker.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
  }));
}

test('a real service-worker update preserves local books and the new shell opens offline', async ({ page, context }) => {
  test.setTimeout(90000);
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const workerPath = resolve('app/sw.js');
  const originalWorker = await readFile(workerPath, 'utf8');
  const versionMatch = originalWorker.match(/\bAPP_VERSION\s*=\s*["']([^"']+)["']/);
  const cacheMatch = originalWorker.match(/\bCACHE\s*=\s*["']([^"']+)["']/);
  expect(versionMatch, 'built worker must contain an app version').not.toBeNull();
  expect(cacheMatch, 'built worker must contain its cache name').not.toBeNull();
  const oldVersion = versionMatch![1];
  const oldCache = cacheMatch![1];
  const nextVersion = oldVersion + '-pwa-test';
  const nextCache = oldCache + '-pwa-test';
  const updatedWorker = originalWorker
    .replace(/(\bAPP_VERSION\s*=\s*["'])[^"']+(["'])/, `$1${nextVersion}$2`)
    .replace(/(\bCACHE\s*=\s*["'])[^"']+(["'])/, `$1${nextCache}$2`);
  expect(updatedWorker).not.toBe(originalWorker);
  let workerChanged = false;

  try {
    await page.goto('/app/');
    await expect(page.locator('.sela-app')).toBeVisible();
    await waitForAppWorker(page);
    expect(await activeWorkerVersion(page)).toBe(oldVersion);

    await page.locator('.sela-app input[type="file"][accept*=".txt"]').setInputFiles({
      name: 'pwa-update-note.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This local book remains after the service worker update.'),
    });
    await expect(page.locator('.book-card')).toHaveCount(1);

    await writeFile(workerPath, updatedWorker, 'utf8');
    workerChanged = true;
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration('/app/');
      if (!registration) throw new Error('Sela app service worker was not registered');
      await registration.update();
    });
    const notice = page.locator('.pwa-notice');
    await expect(notice).toContainText('Sela ' + nextVersion + ' is ready', { timeout: 30000 });
    await expect(notice).toContainText('Installed: ' + oldVersion);
    expect(await activeWorkerVersion(page)).toBe(oldVersion);

    await notice.getByRole('button', { name: 'Update now', exact: true }).click();
    await expect.poll(() => activeWorkerVersion(page), { timeout: 30000 }).toBe(nextVersion);
    await expect(page.locator('.book-card')).toHaveCount(1);

    const cacheNames = await page.evaluate(() => caches.keys());
    expect(cacheNames).toContain(nextCache);
    expect(cacheNames).not.toContain(oldCache);

    await context.setOffline(true);
    await page.goto('/app/#/shelf');
    await expect(page.locator('.book-card')).toHaveCount(1);
    await page.locator('.book-cover-button').click();
    await expect(page.locator('.reader-body')).toContainText('remains after the service worker update');
    expect(pageErrors).toEqual([]);
  } finally {
    await context.setOffline(true).catch(() => {});
    if (workerChanged) await writeFile(workerPath, originalWorker, 'utf8');
  }
});
