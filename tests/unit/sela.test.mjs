import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Sela, Flippy } from '../../src/module.js';
import { speechChunks } from '../../src/reading-tools.js';
import { safeUrl } from '../../src/pdf-loader.js';

test('Sela is the same SSR-safe constructor as the legacy Flippy API', () => {
  assert.equal(Sela, Flippy);
  for (const format of ['pdf', 'epub', 'cbz', 'djvu', 'txt', 'md', 'html', 'fb2']) assert.equal(new Sela({ format }).options.format, format);
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
  assert.equal(safeUrl('/dist/css/flippy.min.css', 'chrome-extension://own/index.html'), 'chrome-extension://own/dist/css/flippy.min.css');
  assert.equal(safeUrl('/book.epub', 'moz-extension://own/index.html'), 'moz-extension://own/book.epub');
  assert.throws(() => safeUrl('chrome-extension://other/file', 'chrome-extension://own/index.html'));
  assert.throws(() => safeUrl('chrome-extension://own/file', 'https://example.com'));
});
test('optional capabilities keep the core within its declared download budget', async () => {
  const manifest = JSON.parse(await readFile('dist/manifest.json', 'utf8'));
  assert(manifest.assets['dist/js/sela.min.js'].gzip < 26 * 1024);
  assert(manifest.assets['dist/js/sela.tools.js'].gzip < 6 * 1024);
  assert(manifest.assets['dist/js/sela.text.js'].gzip < 4 * 1024);
  const core = await readFile('dist/js/sela.min.js', 'utf8');
  assert(!core.includes('SpeechSynthesisUtterance'));
  assert(!core.includes('indexedDB'));
});
