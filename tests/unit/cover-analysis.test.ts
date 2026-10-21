import test from 'node:test';
import assert from 'node:assert/strict';
import { coverPixelsNeedFallback } from '../../app/library/cover-analysis.ts';

function solidCover(color: [number, number, number, number], count = 40 * 56) {
  const pixels = new Uint8ClampedArray(count * 4);
  for (let index = 0; index < count; index++) pixels.set(color, index * 4);
  return pixels;
}

test('blank black and transparent cover renders use generated title artwork', () => {
  assert.equal(coverPixelsNeedFallback(solidCover([0, 0, 0, 255])), true);
  assert.equal(coverPixelsNeedFallback(solidCover([0, 0, 0, 0])), true);
  assert.equal(coverPixelsNeedFallback(new Uint8ClampedArray(8)), true);
});

test('dark but detailed cover art remains visible on the shelf', () => {
  const pixels = solidCover([0, 0, 0, 255]);
  for (let index = 0; index < pixels.length / 4; index += 13) pixels.set([244, 237, 217, 255], index * 4);
  assert.equal(coverPixelsNeedFallback(pixels), false);
});

test('opaque colorful and light covers keep their original artwork', () => {
  assert.equal(coverPixelsNeedFallback(solidCover([206, 112, 82, 255])), false);
  assert.equal(coverPixelsNeedFallback(solidCover([245, 243, 234, 255])), false);
});
