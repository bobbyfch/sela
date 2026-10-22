import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { packUrl, readingMinutes, validatePackIndex, validatePackManifest, validateProphetPayload, type PackManifest, type ProphetPayload } from '../../app/library/content-packs.ts';

// Hafs verse counts, used only to prove that every cited verse exists.
const VERSES = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

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

test('pilot entries are honest about scope and label interpretation separately from scripture', () => {
  assert.equal(manifest.status, 'pilot');
  assert.ok((manifest.plannedItemCount ?? 0) > manifest.itemCount);
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
  assert.throws(() => validateProphetPayload({ ...payload, articles: payload.articles.slice(1) }, manifest), /expected 5 articles/);
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
