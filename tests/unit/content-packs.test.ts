import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { QURAN_VERSE_COUNTS as VERSES } from '../../app/library/quran-structure.ts';
import { PACK_FAITHS, packUrl, readingMinutes, sectionMinutes, validatePackIndex, validatePackManifest, validatePayload, validateProphetPayload, validateTextPayload, type PackManifest, type ProphetPayload, type TextPayload } from '../../app/library/content-packs.ts';

const index = validatePackIndex(JSON.parse(await readFile('library/packs/index.json', 'utf8')));
const payloads = new Map<string, { text: string; json: unknown }>();
for (const pack of index.packs) {
  const text = await readFile(`library/packs/${pack.payload.path}`, 'utf8');
  payloads.set(pack.id, { text, json: JSON.parse(text) });
}
const manifest = index.packs.find(pack => pack.id === 'sela-prophets-id-v1') as PackManifest;
const payload = payloads.get(manifest.id)!.json as ProphetPayload;
const textPacks = index.packs.filter(pack => pack.kind === 'text-collection');

test('verse-count table is the complete Quran', () => {
  assert.equal(VERSES.length, 114);
  assert.equal(VERSES.reduce((sum, count) => sum + count, 0), 6236);
});

test('every published pack matches its payload bytes and checksum exactly', () => {
  assert.ok(index.packs.length >= 9);
  for (const pack of index.packs) {
    const bytes = Buffer.from(payloads.get(pack.id)!.text, 'utf8');
    assert.equal(pack.payload.bytes, bytes.length, pack.id);
    assert.equal(pack.payload.sha256, createHash('sha256').update(bytes).digest('hex'), pack.id);
  }
  assert.doesNotMatch(JSON.stringify(index), /TO_BE_COMPUTED|REVIEW_PER_CONTENT/);
});

test('every pack names a tradition, a licence notice that exists, and valid sources', async () => {
  for (const pack of index.packs) {
    assert.ok(pack.faiths.every(faith => (PACK_FAITHS as readonly string[]).includes(faith)), pack.id);
    await access(pack.license.noticePath);
    assert.ok(pack.source.every(source => source.url.startsWith('https://')), pack.id);
    validatePayload(payloads.get(pack.id)!.json, pack);
  }
  for (const faith of PACK_FAITHS) assert.ok(index.packs.some(pack => pack.faiths.includes(faith)), `no downloadable reading for ${faith}`);
});

test('prophet payload cites only verses that exist', () => {
  validateProphetPayload(payload, manifest);
  for (const article of payload.articles) for (const section of article.sections) for (const ref of section.refs) {
    const last = VERSES[ref.surah - 1];
    assert.ok(ref.from <= last && (ref.to ?? ref.from) <= last, `${article.slug} cites ${ref.surah}:${ref.from}-${ref.to ?? ''} but surah ${ref.surah} has ${last} verses`);
  }
});

test('prophet entries are honest about scope and label interpretation separately from scripture', () => {
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

test('text collections have unique ids, real text, and the licences they claim', () => {
  assert.ok(textPacks.length >= 8);
  for (const pack of textPacks) {
    const data = payloads.get(pack.id)!.json as TextPayload;
    assert.equal(data.works.length, pack.itemCount, pack.id);
    for (const work of data.works) {
      assert.ok(work.sections.length > 0, `${pack.id}/${work.id}`);
      for (const section of work.sections) {
        const text = [...(section.paragraphs ?? []), ...(section.verses ?? []).map(verse => verse.text)].join(' ');
        assert.ok(text.length > 20, `${pack.id}/${work.id}/${section.id} is empty`);
        assert.doesNotMatch(text, /Project Gutenberg|\*\*\* ?START|\*\*\* ?END/i, `${pack.id}/${work.id}/${section.id} still has Gutenberg boilerplate`);
        assert.ok(sectionMinutes(section) >= 1);
      }
    }
  }
  const licences = Object.fromEntries(textPacks.map(pack => [pack.id, pack.license.code]));
  assert.equal(licences['sela-tsi-id'], 'CC-BY-SA-4.0');
  assert.equal(licences['sela-suttas-en'], 'CC0-1.0');
  assert.equal(licences['sela-sa-id'], 'CC0-1.0');
});

test('the Indonesian Bible keeps its attribution and every New Testament book', async () => {
  const bible = payloads.get('sela-tsi-id')!.json as TextPayload;
  const ids = bible.works.map(work => work.id);
  for (const book of ['mat', 'mrk', 'luk', 'jhn', 'act', 'rom', 'rev']) assert.ok(ids.includes(book), book);
  assert.equal(bible.works.length, 48);
  const notice = await readFile('licenses/sela-tsi-NOTICE.md', 'utf8');
  assert.match(notice, /Albata/);
  assert.match(notice, /Creative Commons Attribution-ShareAlike 4\.0/);
});

test('validation rejects a tampered or incomplete pack', () => {
  assert.throws(() => validatePackManifest({ ...manifest, payload: { ...manifest.payload, sha256: 'abc' } }), /payload/);
  assert.throws(() => validatePackManifest({ ...manifest, payload: { ...manifest.payload, path: '../secret.json' } }), /payload/);
  assert.throws(() => validatePackManifest({ ...manifest, source: [{ label: 'x', url: 'http://insecure.example' }] }), /source/);
  assert.throws(() => validatePackManifest({ ...manifest, faiths: ['jedi'] }), /faiths/);
  assert.throws(() => validatePackManifest({ ...manifest, faiths: [] }), /faiths/);
  assert.throws(() => validateProphetPayload({ ...payload, articles: payload.articles.slice(1) }, manifest), /expected 25 articles/);
  assert.throws(() => validateProphetPayload({ ...payload, packId: 'other-pack' }, manifest), /payload shape/);
  const noRefs = structuredClone(payload); noRefs.articles[0].sections[0].refs = [];
  assert.throws(() => validateProphetPayload(noRefs, manifest), /without a Quran reference/);
  const badRef = structuredClone(payload); badRef.articles[0].sections[0].refs[0] = { surah: 115, from: 1 };
  assert.throws(() => validateProphetPayload(badRef, manifest), /reference surah/);
  const brokenLink = structuredClone(payload); brokenLink.articles[0].related = ['missing'];
  assert.throws(() => validateProphetPayload(brokenLink, manifest), /missing entry/);
});

test('text payload validation rejects empty, duplicated and malformed content', () => {
  const pack = textPacks.find(item => item.id === 'sela-sa-id') as PackManifest;
  const data = payloads.get(pack.id)!.json as TextPayload;
  assert.throws(() => validateTextPayload({ ...data, works: [] }, pack), /expected 1 works/);
  const empty = structuredClone(data); empty.works[0].sections[0] = { id: 'x1', title: 'Empty' };
  assert.throws(() => validateTextPayload(empty, pack), /has no text/);
  const duplicate = structuredClone(data); duplicate.works[0].sections[1].id = duplicate.works[0].sections[0].id;
  assert.throws(() => validateTextPayload(duplicate, pack), /section/);
  const badId = structuredClone(data); badId.works[0].id = '../etc';
  assert.throws(() => validateTextPayload(badId, pack), /work/);
});

test('pack URLs stay inside the deployed project path', () => {
  assert.equal(packUrl('index.json', 'https://bobbyfch.github.io/sela/app/').href, 'https://bobbyfch.github.io/sela/library/packs/index.json');
  assert.equal(packUrl('prophets-id-v1.json', 'http://127.0.0.1:4173/app/index.html#/discover').pathname, '/library/packs/prophets-id-v1.json');
  assert.throws(() => packUrl('../app/sw.js', 'https://example.com/app/'), /path/);
});
