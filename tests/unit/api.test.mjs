import test from 'node:test';
import assert from 'node:assert/strict';
import Flippy from '../../src/module.js';
import { safeUrl, documentOptions } from '../../src/pdf-loader.js';

test('ESM import and constructor are safe without a DOM for SSR', async () => {
  const viewer = new Flippy({ pdfUrl: '/protected/ebook/42', mode: 'single' });
  assert.equal(viewer.totalPages, 0);
  assert.equal(viewer.currentPage(), 0);
  viewer.close(); viewer.destroy();
  await assert.rejects(viewer.open(), /requires a browser DOM/);
});
test('invalid modes and schemes fail explicitly', () => {
  assert.throws(() => new Flippy({ mode: 'unknown' }), /mode must/);
  assert.throws(() => new Flippy({ filter: 'unknown' }), /Unknown reading filter/);
  assert.throws(() => new Flippy({ readingDirection: 'unknown' }), /readingDirection/);
  const manga = new Flippy({ mode: 'manga' });
  assert.equal(manga.setFilter('grayscale'), manga);
  assert.equal(manga.options.filter, 'grayscale');
  assert.throws(() => manga.setFilter('url(javascript:bad)'), /Unknown reading filter/);
  assert.throws(() => safeUrl('javascript:alert(1)', 'https://example.com'), /Only HTTP/);
  assert.throws(() => safeUrl('data:text/html,hi', 'https://example.com'), /Only HTTP/);
  assert.equal(safeUrl('/media/ebook/42?token=abc', 'https://example.com'), 'https://example.com/media/ebook/42?token=abc');
});
test('PDF data is copied so PDF.js cannot detach caller-owned bytes', () => {
  const bytes = new Uint8Array([1, 2, 3]);
  const input = documentOptions({ data: bytes, password: 'sample', withCredentials: true, httpHeaders: { Authorization: 'example' } });
  assert.notEqual(input.data.buffer, bytes.buffer);
  input.data[0] = 9;
  assert.equal(bytes[0], 1);
  assert.equal(input.isEvalSupported, false);
  assert.equal(input.password, 'sample');
  assert.equal(input.withCredentials, true);
});
