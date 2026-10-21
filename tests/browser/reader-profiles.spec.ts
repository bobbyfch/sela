import { test, expect } from '@playwright/test';
import { setTopbarAppearance } from './topbar-helpers.ts';
import { readFile } from 'node:fs/promises';
import { createBackupArchive, readBackupArchive } from '../../dist/js/sela.archive.js';

async function openTextProfiles(page) {
  await page.addInitScript(() => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en' })));
  await page.goto('/app/');
  await expect(page.locator('.sela-app')).toBeVisible();
  await page.getByLabel('Choose book files').setInputFiles({ name: 'Profile.txt', mimeType: 'text/plain', buffer: Buffer.from('The original text remains intact.\n\nA second paragraph.') });
  await page.getByRole('link', { name: 'My shelf', exact: true }).click();
  await expect(page.locator('.book-card')).toHaveCount(1);
  await page.locator('.book-title-button').click();
  await expect(page.locator('.reader-chrome-top')).toBeVisible();
  await page.getByRole('button', { name: 'Reading desk', exact: true }).click();
  await page.getByRole('tab', { name: 'Profiles', exact: true }).click();
}

async function openBackupSettings(page) {
  await page.goto('/app/');
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: /Backup & data/ }).click();
  await expect(page.getByRole('button', { name: 'Export backup', exact: true })).toBeVisible();
}

test('Reader profiles apply, save, update, confirm deletion and preserve the source book', async ({ page }) => {
  await openTextProfiles(page);
  await expect(page.locator('.reader-profile-card')).toHaveCount(5);
  const reader = page.locator('.library-reader-overlay');
  await page.locator('.reader-profile-card').filter({ hasText: 'Night' }).getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(reader).toHaveAttribute('data-dim', 'true');
  await expect(reader).toHaveCSS('--sela-page-filter', 'sepia(.5) saturate(.6)');

  await page.getByLabel('Name this profile', { exact: true }).fill('Quiet pages');
  await page.getByRole('button', { name: 'Save current settings', exact: true }).click();
  const saved = page.locator('.reader-profile-saved').filter({ hasText: 'Quiet pages' });
  await expect(saved).toBeVisible();
  await page.locator('.reader-profile-card').filter({ hasText: 'Study' }).getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(reader).toHaveAttribute('data-dim', 'false');
  await saved.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(reader).toHaveAttribute('data-dim', 'true');

  await page.getByRole('tab', { name: 'Layout', exact: true }).click();
  const fontSize = page.getByRole('slider', { name: 'Font size', exact: true });
  await fontSize.focus(); await page.keyboard.press('ArrowRight');
  const updatedSize = Number(await fontSize.getAttribute('aria-valuenow'));
  await page.getByRole('tab', { name: 'Profiles', exact: true }).click();
  await page.getByRole('button', { name: 'Update selected', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sela-library:profiles') || '[]').find(profile => profile.name === 'Quiet pages')?.values.fontSize)).toBe(updatedSize);

  await saved.getByRole('button', { name: 'Delete Quiet pages', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirm delete Quiet pages', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm delete Quiet pages', exact: true }).click();
  await expect(page.locator('.reader-profile-saved').filter({ hasText: 'Quiet pages' })).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.reader-chrome-top')).toBeVisible();
  await page.getByRole('button', { name: 'Reading desk', exact: true }).click();
  await page.getByRole('tab', { name: 'Profiles', exact: true }).click();
  await expect(page.locator('.reader-profile-card')).toHaveCount(5);
  expect(await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('sela-private-library', 3);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const files = await new Promise<Array<{ bytes?: ArrayBuffer; blob?: Blob }>>((resolve, reject) => {
      const request = db.transaction('files', 'readonly').objectStore('files').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    const [stored] = files;
    return stored?.bytes ? new TextDecoder().decode(stored.bytes) : await stored?.blob?.text();
  })).toContain('The original text remains intact.');
});

test('Reader profiles are backed up and malformed profiles are rejected before books are written', async ({ page, browser }) => {
  await openTextProfiles(page);
  await page.locator('.reader-profile-card').filter({ hasText: 'Night' }).getByRole('button', { name: 'Apply', exact: true }).click();
  await page.getByLabel('Name this profile', { exact: true }).fill('Everyday');
  await page.getByRole('button', { name: 'Save current settings', exact: true }).click();
  await openBackupSettings(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup', exact: true }).click();
  const bytes = await readFile(await (await downloadPromise).path());
  const entries = readBackupArchive(new Uint8Array(bytes));
  const manifest = JSON.parse(new TextDecoder().decode(entries['sela.json']));
  expect(manifest.profiles).toContainEqual(expect.objectContaining({ name: 'Everyday' }));

  const restoredContext = await browser.newContext();
  try {
    const restored = await restoredContext.newPage();
    await restored.addInitScript(() => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en' })));
    await openBackupSettings(restored);
    await restored.locator('.settings-detail input[type="file"]').setInputFiles({ name: 'profiles.zip', mimeType: 'application/zip', buffer: bytes });
    await expect(restored.getByText('1 books added; 0 existing books kept.', { exact: true })).toBeVisible();
    expect(await restored.evaluate(() => JSON.parse(localStorage.getItem('sela-library:profiles') || '[]')[0].name)).toBe('Everyday');
  } finally { await restoredContext.close(); }

  const invalidEntries = { ...entries };
  const invalidManifest = { ...manifest, profiles: [{ name: 'Bad', values: { brightness: null } }] };
  invalidEntries['sela.json'] = new TextEncoder().encode(JSON.stringify(invalidManifest));
  const invalidBackup = Buffer.from(createBackupArchive(invalidEntries));
  const emptyContext = await browser.newContext();
  try {
    const empty = await emptyContext.newPage();
    await empty.addInitScript(() => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en' })));
    await openBackupSettings(empty);
    await empty.locator('.settings-detail input[type="file"]').setInputFiles({ name: 'invalid-profiles.zip', mimeType: 'application/zip', buffer: invalidBackup });
    await expect(empty.getByText(/no supported reading settings/i)).toBeVisible();
    expect(await empty.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('sela-private-library', 3);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const count = await new Promise<number>((resolve, reject) => {
        const request = db.transaction('books', 'readonly').objectStore('books').count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      db.close();
      return count;
    })).toBe(0);
  } finally { await emptyContext.close(); }
});

test('topbar appearance changes do not replace the selected paper theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en', theme: 'olive', appearance: 'light' })));
  await page.goto('/app/');
  await expect(page.locator('.sela-app')).toBeVisible();
  const app = page.locator('.sela-app');
  await expect(app).toHaveAttribute('data-theme', 'olive');
  await setTopbarAppearance(page, 'dark');
  await expect(app).toHaveAttribute('data-appearance', 'dark');
  await expect(app).toHaveAttribute('data-theme', 'olive');
  await setTopbarAppearance(page, 'light');
  await expect(app).toHaveAttribute('data-appearance', 'light');
  await expect(app).toHaveAttribute('data-theme', 'olive');
});
