import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { QURAN_VERSE_COUNTS as VERSES } from '../../app/library/quran-structure.ts';
import { packUrl, readingMinutes, validatePackIndex, validatePackManifest, validateProphetPayload, type PackManifest, type ProphetPayload } from '../../app/library/content-packs.ts';

const index = validatePackIndex(JSON.parse(await readFile('library/packs/index.json', 'utf8')));
const manifest = index.packs[0] as PackManifest;
const payloadText = await readFile(`library/packs/${manifest.payload.path}`, 'utf8');
const payload = JSON.parse(payloadText) as ProphetPayload;

test('verse-count table is the complete Quran', () => {
  assert.equal(VERSES.length, 114);
  assert.equal(VERSES.reduce((sum, count) => sum + count, 0), 6236);
});

test('published index matches the payload bytes and checksum exactly', () => {
  const bytes = Buffer.from(payloadText, 'utf8');
  assert.equal(manifest.payload.bytes, bytes.length);
  assert.equal(manifest.payload.sha256, createHash('sha256').update(bytes).digest('hex'));
  assert.doesNotMatch(JSON.stringify(index), /TO_BE_COMPUTED|REVIEW_PER_CONTENT/);
});

test('payload validates against its manifest and every Quran reference exists', () => {
  validateProphetPayload(payload, manifest);
  for (const article of payload.articles) for (const section of article.sections) for (const ref of section.refs) {
    const last = VERSES[ref.surah - 1];
    assert.ok(ref.from <= last && (ref.to ?? ref.from) <= last, `${article.slug} cites ${ref.surah}:${ref.from}-${ref.to ?? ''} but surah ${ref.surah} has ${last} verses`);
  }
});

test('draft entries are honest about scope and label interpretation separately from scripture', () => {
  assert.equal(manifest.status, 'draft');
  assert.equal(manifest.itemCount, 25);
  assert.equal(payload.articles.length, 25);
  assert.deepEqual(payload.articles.map(article => article.order), Array.from({ length: 25 }, (_, index) => index + 1));
  for (const article of payload.articles) {
    assert.match(article.accuracy, /belum ditelaah ulama/);
    assert.ok(article.notes.every(note => note.startsWith('Catatan SELA (bukan wahyu)')), article.slug);
    assert.ok(readingMinutes(article) >= 1);
  }
});

test('validation rejects a tampered or incomplete pack', () => {
  assert.throws(() => validatePackManifest({ ...manifest, payload: { ...manifest.payload, sha256: 'abc' } }), /payload/);
  assert.throws(() => validatePackManifest({ ...manifest, payload: { ...manifest.payload, path: '../secret.json' } }), /payload/);
  assert.throws(() => validatePackManifest({ ...manifest, source: [{ label: 'x', url: 'http://insecure.example' }] }), /source/);
  assert.throws(() => validateProphetPayload({ ...payload, articles: payload.articles.slice(1) }, manifest), /expected 25 articles/);
  assert.throws(() => validateProphetPayload({ ...payload, packId: 'other-pack' }, manifest), /payload shape/);
  const noRefs = structuredClone(payload); noRefs.articles[0].sections[0].refs = [];
  assert.throws(() => validateProphetPayload(noRefs, manifest), /without a Quran reference/);
  const badRef = structuredClone(payload); badRef.articles[0].sections[0].refs[0] = { surah: 115, from: 1 };
  assert.throws(() => validateProphetPayload(badRef, manifest), /reference surah/);
  const brokenLink = structuredClone(payload); brokenLink.articles[0].related = ['missing'];
  assert.throws(() => validateProphetPayload(brokenLink, manifest), /missing entry/);
});

test('pack URLs stay inside the deployed project path', () => {
  assert.equal(packUrl('index.json', 'https://bobbyfch.github.io/sela/app/').href, 'https://bobbyfch.github.io/sela/library/packs/index.json');
  assert.equal(packUrl('prophets-id-v1.json', 'http://127.0.0.1:4173/app/index.html#/discover').pathname, '/library/packs/prophets-id-v1.json');
  assert.throws(() => packUrl('../app/sw.js', 'https://example.com/app/'), /path/);
});
