import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveReaderSdkUrl } from '../../web/app/ui/reader-sdk.ts';

test('reader SDK stays inside the GitHub Pages repository subpath', () => {
  assert.equal(
    resolveReaderSdkUrl('https://bobbyfch.github.io/sela/app/?from=home#/read/abc').href,
    'https://bobbyfch.github.io/sela/dist/js/sela.esm.js',
  );
});

test('reader SDK resolves correctly at a root hosted app and a local subpath', () => {
  assert.equal(resolveReaderSdkUrl('http://localhost:4173/app/').href, 'http://localhost:4173/dist/js/sela.esm.js');
  assert.equal(resolveReaderSdkUrl('http://localhost:4173/sela/app/index.html#/read/abc').href, 'http://localhost:4173/sela/dist/js/sela.esm.js');
});
