import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
const folder = resolve('.git/sela-extension/chromium');
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const context = await chromium.launchPersistentContext('', {
  headless: true, ...(existsSync(edge) ? { executablePath: edge } : { channel: 'chromium' }),
  args: [`--disable-extensions-except=${folder}`, `--load-extension=${folder}`]
});
try {
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker', { timeout: 15000 });
  const id = new URL(worker.url()).host; const page = await context.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`chrome-extension://${id}/index.html`);
  await page.evaluate(async () => { await FlippyReady; window.reader = new Sela({ url: 'example/limarayamusic.pdf', mode: 'single', language: 'en', soundEnabled: false }); await reader.open(); });
  assert.equal(await page.evaluate(() => reader.totalPages), 8);
  assert(await page.locator('.fb-spane canvas').first().evaluate(canvas => canvas.width > 0));
  await page.evaluate(() => reader.showTools());
  await page.locator('.sela-transcript').filter({ hasText: 'LIMARAYA' }).waitFor();
  await page.evaluate(() => reader.close());
  await page.locator('#pdf-file').setInputFiles(resolve('example/sela.txt'));
  await page.locator('#open-shelf').click(); await page.getByRole('button', { name: 'Save selected book', exact: true }).click();
  await page.locator('.sela-shelf-books article').waitFor();
  await page.reload(); await page.locator('#open-shelf').click(); await page.getByRole('button', { name: 'Read', exact: true }).click();
  await page.locator('.flippy-epub article').filter({ hasText: 'Sela' }).waitFor();
  assert.deepEqual(errors, []); console.log('Chromium development extension: real PDF, tools, saved shelf and reopen passed.');
} finally { await context.close(); }
