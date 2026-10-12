import { test, expect } from '@playwright/test';
import { zipSync } from 'fflate';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';

test('ZIP adapters use a disposable worker and reject unsafe entries before rendering', async ({ page }) => {
  await page.goto('/?geo=off');
  const workerUrls: string[] = [];
  page.on('worker', worker => workerUrls.push(worker.url()));
  const unsafe = Buffer.from(zipSync({ '..\\escape.txt': new Uint8Array([1]) })).toString('base64');
  const message = await page.evaluate(async encoded => {
    await SelaReady;
    const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const viewer = new Sela({ format: 'cbz', mode: 'single' });
    try { await viewer.open(bytes); return 'unexpected success'; }
    catch (error) { return error instanceof Error ? error.message : String(error); }
    finally { viewer.destroy(); }
  }, unsafe);
  expect(message).toContain('Unsafe archive path');
  expect(workerUrls.some(url => url.endsWith('/sela.archive-worker.js'))).toBe(true);
  await expect.poll(() => page.workers().length).toBe(0);
  expect(await page.locator('.library-reader-overlay').count()).toBe(0);
});

test('cross-origin CDN archive workers use a disposable local wrapper', async ({ page }) => {
  const server = createServer(async (request, response) => {
    const name = new URL(request.url!, 'http://localhost').pathname;
    if (!['/dist/js/sela.archive.js', '/dist/js/sela.archive-worker.js'].includes(name)) {
      response.writeHead(404).end(); return;
    }
    try {
      response.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/javascript' });
      response.end(await readFile('.' + name));
    } catch { response.end(); }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await page.goto('/?geo=off');
    const workerUrls: string[] = [];
    page.on('worker', worker => workerUrls.push(worker.url()));
    const origin = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;
    const bytes = Buffer.from(zipSync({ 'hello.txt': new TextEncoder().encode('hello') })).toString('base64');
    const result = await page.evaluate(async ({ origin, bytes }) => {
      const archive = await import(origin + '/dist/js/sela.archive.js');
      const files = await archive.extractArchiveAsync(Uint8Array.from(atob(bytes), char => char.charCodeAt(0)));
      return new TextDecoder().decode(files['hello.txt']);
    }, { origin, bytes });
    expect(result).toBe('hello');
    expect(workerUrls.some(url => url.startsWith('blob:'))).toBe(true);
    await expect.poll(() => page.workers().length).toBe(0);
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});
