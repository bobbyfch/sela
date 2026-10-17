import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Sela } from '../../src/module.ts';
import { speechChunks } from '../../src/reading-tools.ts';
import { safeUrl } from '../../src/pdf-loader.ts';

test('Sela exposes an SSR-safe constructor', () => {
  assert.equal(typeof Sela, 'function');
  for (const format of ['pdf', 'epub', 'cbz', 'djvu', 'txt', 'md', 'html', 'fb2'] as const) assert.equal(new Sela({ format }).options.format, format);
});
test('speech chunks bound utterance length and preserve words without punctuation', () => {
  const text = ('A quiet interval in a busy world. ' + 'word '.repeat(200)).repeat(5);
  const chunks = speechChunks(text); assert(chunks.length > 10);
  assert(chunks.every(chunk => chunk.length > 0 && chunk.length <= 240));
  assert.equal(chunks.join(' ').replace(/\s+/g, ' ').trim(), text.trim());
  assert.equal(speechChunks('字'.repeat(1000)).join(''), '字'.repeat(1000));
  assert.deepEqual(speechChunks('   \n'), []);
});
test('extension assets are allowed only within the currently running extension', () => {
  assert.equal(safeUrl('/dist/css/sela.min.css', 'chrome-extension://own/index.html'), 'chrome-extension://own/dist/css/sela.min.css');
  assert.equal(safeUrl('/book.epub', 'moz-extension://own/index.html'), 'moz-extension://own/book.epub');
  assert.throws(() => safeUrl('chrome-extension://other/file', 'chrome-extension://own/index.html'));
  assert.throws(() => safeUrl('chrome-extension://own/file', 'https://example.com'));
});
test('optional capabilities keep the core within its declared download budget', async () => {
  const manifest = JSON.parse(await readFile('dist/manifest.json', 'utf8'));
  assert(manifest.assets['dist/js/sela.min.js'].gzip < 30 * 1024); // Optional locale loading stays out of the default viewer payload.
  assert(manifest.assets['dist/js/sela.tools.js'].gzip < 10.5 * 1024); // Lazy reader includes page-material choices.
  assert(manifest.assets['dist/js/sela.locales.js'].gzip < 53 * 1024); // Japanese reader labels stay optional and load on demand.
  // The optional text adapter sanitizes scripture markup and applies bounded reader font choices.
  assert(manifest.assets['dist/js/sela.text.js'].gzip < 5.25 * 1024); // Host-bundler directives and constrained Quran presentation.
  const core = await readFile('dist/js/sela.min.js', 'utf8');
  assert(!core.includes('SpeechSynthesisUtterance'));
  assert(!core.includes('indexedDB'));
  assert(!core.includes('A little space to make reading feel like yours.'));
});
