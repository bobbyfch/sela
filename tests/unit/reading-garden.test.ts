import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { READING_GARDEN_COLLECTIONS } from '../../app/library/reading-garden.ts';
import { PROPHET_PASSAGES } from '../../app/library/prophet-passages.ts';
import { quranSurahCatalog } from '../../app/library/scripture-sources.ts';

async function json(path: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>;
}

test('Taman Bacaan counts, rights notes, and cache states match shipped source assets', async () => {
  const byId = new Map(READING_GARDEN_COLLECTIONS.map(item => [item.id, item]));
  assert.equal(byId.get('quran-enc')?.count, quranSurahCatalog().length);
  assert.equal(byId.get('quran-enc')?.availability, 'online');
  assert.equal(byId.get('quran-enc')?.rights, 'edition-terms');

  assert.equal(byId.get('prophet-passages')?.count, PROPHET_PASSAGES.length);
  assert.equal(byId.get('prophet-passages')?.availability, 'bundled');
  assert.ok(PROPHET_PASSAGES.every(item => item.reference && item.storyId));

  const cacheableAssets = (JSON.parse(await readFile('offline-assets.json', 'utf8')) as { allowed: string[] }).allowed;
  assert.ok(cacheableAssets.includes('library/prophet-passages.js'));
  const editions = [
    ['world-english-bible', 'library/assets/faith-bible-web.json', 'books', 66, 'Public domain'],
    ['douay-rheims', 'library/assets/faith-bible-dra.json', 'books', 73, 'Public domain'],
    ['dhammapada-sujato', 'library/assets/faith-dhammapada.json', 'chapters', 26, 'CC0 1.0'],
    ['song-celestial', 'library/assets/faith-bhagavad-gita.json', 'chapters', 18, 'Public domain'],
    ['analects-legge', 'library/assets/faith-analects.json', 'books', 20, 'Public domain'],
  ] as const;

  for (const [id, path, collectionKey, count, license] of editions) {
    const item = byId.get(id);
    assert.ok(item, `${id} should be listed`);
    assert.equal(item.count, count);
    assert.equal(item.availability, 'bundled');
    assert.ok(item.rightsLabel.includes(license), `${id} should display its source license`);
    const data = await json(path);
    const records = data[collectionKey];
    assert.ok(Array.isArray(records), `${path} should have ${collectionKey}`);
    assert.equal(records.length, count, `${path} ${collectionKey} count`);
    assert.ok(cacheableAssets.includes(path), `${path} should be cached after a successful PWA fetch`);
  }

  const picks = byId.get('sela-picks');
  assert.equal(picks?.count, 227);
  assert.equal(picks?.availability, 'metadata');
  assert.equal(picks?.rights, 'public-domain');
  const catalog = JSON.parse(await readFile('library/public-books.json', 'utf8')) as unknown;
  assert.ok(Array.isArray(catalog));
  assert.equal(catalog.length, 227);
});
