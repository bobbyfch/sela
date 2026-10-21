import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { readBackupArchive } from '../../dist/js/sela.archive.js';
import { readStoredBooks } from './library-helpers.ts';

test('React shelf pinning, selection, favorites and backup preserve the original books', async ({ page, browser }) => {
  await page.addInitScript(() => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en' })));
  await page.goto('/app/');
  await page.getByLabel('Choose book files').setInputFiles([
    { name: 'Alpha.txt', mimeType: 'text/plain', buffer: Buffer.from('Alpha original.') },
    { name: 'Zulu.txt', mimeType: 'text/plain', buffer: Buffer.from('Zulu original.') },
  ]);
  await page.getByRole('link', { name: 'My shelf', exact: true }).click();
  await expect(page.locator('.book-card')).toHaveCount(2);
  const sort = page.getByRole('combobox', { name: 'Sort books', exact: true });
  await sort.click(); await page.getByRole('option', { name: 'Title A–Z', exact: true }).click();
  await expect(page.locator('.book-title-button').first()).toHaveText('Alpha');
  const zulu = page.locator('.book-card').filter({ hasText: 'Zulu' });
  await zulu.getByRole('button', { name: 'Book actions', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Pin to top', exact: true }).click();
  await sort.click(); await page.getByRole('option', { name: 'Pinned first', exact: true }).click();
  await expect(page.locator('.book-title-button').first()).toHaveText('Zulu');

  await page.getByRole('button', { name: 'Select books', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Select Alpha', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Select Zulu', exact: true }).check();
  await expect(page.locator('.bulk-selection-panel')).toContainText('2 selected');
  await page.locator('.bulk-selection-panel').getByRole('button', { name: 'Favorite', exact: true }).click();
  const status = page.getByRole('combobox', { name: 'Filter by reading status', exact: true });
  await status.click(); await page.getByRole('option', { name: 'Favorites', exact: true }).click();
  await expect(page.locator('.book-card')).toHaveCount(2);

  await page.goto('/app/#/settings/data');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup', exact: true }).click();
  const bytes = await readFile(await (await downloadPromise).path());
  const archive = readBackupArchive(new Uint8Array(bytes));
  const manifest = JSON.parse(new TextDecoder().decode(archive['sela.json']));
  expect(manifest.books).toHaveLength(2);
  expect(manifest.books.find(book => book.metadata.name === 'Zulu').metadata.pinned).toBe(true);
  expect(manifest.books.every(book => book.metadata.favorite)).toBe(true);

  const restoredContext = await browser.newContext();
  try {
    const restored = await restoredContext.newPage();
    await restored.addInitScript(() => localStorage.setItem('sela:app:preferences', JSON.stringify({ language: 'en' })));
    await restored.goto('/app/#/settings/data');
    await restored.locator('.settings-detail input[type="file"]').setInputFiles({ name: 'sela-backup.zip', mimeType: 'application/zip', buffer: bytes });
    await expect(restored.getByText('2 books added; 0 existing books kept.', { exact: true })).toBeVisible();
    const saved = await readStoredBooks(restored);
    expect(saved.sort((a, b) => a.name.localeCompare(b.name)).map(({ name, text, pinned, favorite }) => ({ name, bytes: text, pinned, favorite }))).toEqual([
      { name: 'Alpha', bytes: 'Alpha original.', pinned: false, favorite: true },
      { name: 'Zulu', bytes: 'Zulu original.', pinned: true, favorite: true },
    ]);
  } finally { await restoredContext.close(); }
});
