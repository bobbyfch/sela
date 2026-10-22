/**
 * Install Quran editions (QuranEnc) and hadith collections (HadeethEnc) straight from the publisher.
 * Both publishers allow re-use only if the text is unchanged, credited, versioned and kept current.
 * Sela therefore never hosts a copy: the reader's browser downloads the publisher's response, checks it
 * against known structure, stores it verbatim, and offers an Update button that downloads it again.
 * Nothing is saved unless every request succeeds.
 */
import { getRecord, isSourcePack, listRecords, putRecord, readLimited, type HadeethRecord, type HadithPayload, type InstalledSourcePack, type QuranEditionPayload, type SourcePackInfo } from './content-packs.ts';
import { QURAN_VERSE_COUNTS, QURAN_VERSE_TOTAL } from './quran-structure.ts';
import { quranSurahName, type QuranSurah, type QuranTranslationEdition } from './scripture-sources.ts';

const QURANENC = 'https://quranenc.com/api/v1';
const HADEETHENC = 'https://hadeethenc.com/api/v1';
const WORKERS = 4;
const RETRIES = 2;
const MAX_RESPONSE = 4 * 1024 * 1024;
const MAX_HADITH_PACK = 40 * 1024 * 1024;
const keyPattern = /^[a-z0-9_]{1,80}$/;
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): string => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  let last: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    if (signal?.aborted) throw new DOMException('Download cancelled.', 'AbortError');
    try {
      const response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer', headers: { Accept: 'application/json' } });
      return JSON.parse(new TextDecoder().decode(await readLimited(response, MAX_RESPONSE, signal)));
    } catch (reason) {
      if (signal?.aborted) throw reason;
      last = reason;
      await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw last instanceof Error ? last : new Error('The source could not be reached.');
}

/** Run `work` over `items` with a small fixed pool, stopping at the first failure. */
async function pool<T, R>(items: readonly T[], work: (item: T, index: number) => Promise<R>, done?: (finished: number) => void): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0, finished = 0, failure: unknown;
  await Promise.all(Array.from({ length: Math.min(WORKERS, items.length) }, async () => {
    while (!failure) {
      const index = next++;
      if (index >= items.length) return;
      try { results[index] = await work(items[index], index); done?.(++finished); } catch (reason) { failure ??= reason; }
    }
  }));
  if (failure) throw failure;
  return results;
}

// ---- Quran editions -------------------------------------------------------------------------------------------

export async function listQuranEditions(signal?: AbortSignal): Promise<SourcePackInfo[]> {
  const data = await getJson(`${QURANENC}/translations/list/id`, signal);
  const rows = isRecord(data) && Array.isArray(data.translations) ? data.translations : [];
  const editions = rows.flatMap((row): SourcePackInfo[] => {
    if (!isRecord(row) || !keyPattern.test(text(row.key)) || text(row.language_iso_code).toLowerCase() !== 'id') return [];
    const key = text(row.key);
    return [{ id: `quranenc-${key}`, kind: 'quran-edition', title: text(row.title) || key, description: text(row.description), language: 'id', version: text(row.version) || 'unversioned', itemCount: QURAN_VERSE_TOTAL, publisher: { label: 'QuranEnc.com', url: `https://quranenc.com/en/browse/${key}` }, remoteKey: key }];
  });
  if (!editions.length) throw new Error('QuranEnc lists no Indonesian edition right now.');
  return editions;
}

function checkSurah(number: number, data: unknown): QuranEditionPayload['surahs'][number] {
  const rows = isRecord(data) && Array.isArray(data.result) ? data.result : [];
  const verses = rows.map(row => isRecord(row) ? { aya: Number(row.aya), arabic: text(row.arabic_text), translation: text(row.translation), footnotes: text(row.footnotes) } : { aya: 0, arabic: '', translation: '', footnotes: '' });
  const expected = QURAN_VERSE_COUNTS[number - 1];
  if (verses.length !== expected || verses.some((verse, index) => verse.aya !== index + 1 || !verse.arabic || !verse.translation)) throw new Error(`Surah ${number} from the source does not have the expected ${expected} verses, so nothing was saved.`);
  return { number, verses };
}

export async function installQuranEdition(info: SourcePackInfo, signal?: AbortSignal, onProgress?: (done: number, total: number) => void): Promise<InstalledSourcePack> {
  if (info.kind !== 'quran-edition' || !keyPattern.test(info.remoteKey)) throw new TypeError('Not a Quran edition.');
  const numbers = Array.from({ length: 114 }, (_, index) => index + 1);
  const surahs = await pool(numbers, async number => checkSurah(number, await getJson(`${QURANENC}/translation/sura/${info.remoteKey}/${number}`, signal)), done => onProgress?.(done, 114));
  const payload: QuranEditionPayload = { schemaVersion: 1, key: info.remoteKey, language: info.language, surahs };
  if (surahs.reduce((sum, surah) => sum + surah.verses.length, 0) !== QURAN_VERSE_TOTAL) throw new Error('The edition is incomplete, so nothing was saved.');
  const record: InstalledSourcePack = { id: info.id, info, payload, installedAt: Date.now(), bytes: JSON.stringify(payload).length };
  await putRecord(record);
  return record;
}

export async function installedQuranEditions(language?: string): Promise<QuranTranslationEdition[]> {
  return (await listRecords()).filter(isSourcePack).filter(pack => pack.info.kind === 'quran-edition' && (!language || pack.info.language === language))
    .map(pack => ({ key: pack.info.remoteKey, title: pack.info.title, version: pack.info.version, language: pack.info.language, description: pack.info.description }));
}

/** An installed edition as a QuranSurah, so the existing reader can use it with no network request. */
export async function installedQuranSurah(number: number, key?: string): Promise<QuranSurah | null> {
  if (!key || !keyPattern.test(key) || !Number.isInteger(number) || number < 1 || number > 114) return null;
  const record = await getRecord(`quranenc-${key}`);
  if (!isSourcePack(record) || record.info.kind !== 'quran-edition') return null;
  const payload = record.payload as QuranEditionPayload;
  const surah = payload.surahs.find(item => item.number === number);
  if (!surah) return null;
  return { number, name: quranSurahName(number), translationKey: key, translationTitle: record.info.title, version: record.info.version, language: record.info.language, sourceUrl: `https://quranenc.com/en/browse/${key}/${number}`, verses: surah.verses.map(verse => ({ sura: number, aya: verse.aya, arabic: verse.arabic, translation: verse.translation, footnotes: verse.footnotes })) };
}

// ---- Hadith collections ---------------------------------------------------------------------------------------

export async function listHadithCollections(signal?: AbortSignal): Promise<SourcePackInfo[]> {
  const data = await getJson(`${HADEETHENC}/categories/list/?language=id`, signal);
  const fetched = new Date().toISOString().slice(0, 10);
  const rows = Array.isArray(data) ? data : [];
  const collections = rows.flatMap((row): SourcePackInfo[] => {
    if (!isRecord(row) || row.parent_id !== null || !/^\d{1,6}$/.test(text(row.id)) || !Number(row.hadeeths_count)) return [];
    const id = text(row.id);
    return [{ id: `hadeethenc-id-${id}`, kind: 'hadith-collection', title: text(row.title), description: 'Hadis berterjemah Indonesia dari HadeethEnc, lengkap dengan derajat, rujukan, dan penjelasannya.', language: 'id', version: `diunduh ${fetched}`, itemCount: Number(row.hadeeths_count), publisher: { label: 'HadeethEnc.com', url: 'https://hadeethenc.com/id/home' }, remoteKey: id }];
  });
  if (!collections.length) throw new Error('HadeethEnc lists no collection right now.');
  return collections;
}

export async function installHadithCollection(info: SourcePackInfo, signal?: AbortSignal, onProgress?: (done: number, total: number) => void): Promise<InstalledSourcePack> {
  if (info.kind !== 'hadith-collection' || !/^\d{1,6}$/.test(info.remoteKey)) throw new TypeError('Not a hadith collection.');
  const ids: string[] = [];
  for (let page = 1; ; page++) {
    const data = await getJson(`${HADEETHENC}/hadeeths/list/?language=id&category_id=${info.remoteKey}&page=${page}&per_page=1000`, signal);
    if (!isRecord(data) || !Array.isArray(data.data)) throw new Error('HadeethEnc returned an unexpected list, so nothing was saved.');
    ids.push(...data.data.map(row => isRecord(row) ? text(row.id) : '').filter(id => /^\d{1,8}$/.test(id)));
    const last = isRecord(data.meta) ? Number(data.meta.last_page) : 1;
    if (page >= last || page >= 20) break;
  }
  const unique = [...new Set(ids)];
  if (!unique.length) throw new Error('HadeethEnc returned no hadith for this collection.');
  let bytes = 0;
  const items = await pool(unique, async id => {
    const row = await getJson(`${HADEETHENC}/hadeeths/one/?language=id&id=${id}`, signal);
    if (!isRecord(row) || text(row.id) !== id || !text(row.title) || !text(row.hadeeth)) throw new Error(`Hadith ${id} came back incomplete, so nothing was saved.`);
    const { translations: _languages, ...content } = row;
    bytes += JSON.stringify(content).length;
    if (bytes > MAX_HADITH_PACK) throw new Error('This collection is larger than Sela will store on this device.');
    return content as HadeethRecord;
  }, done => onProgress?.(done, unique.length));
  const payload: HadithPayload = { schemaVersion: 1, categoryId: info.remoteKey, language: info.language, fetchedAt: new Date().toISOString(), items };
  const record: InstalledSourcePack = { id: info.id, info: { ...info, itemCount: items.length, version: `diunduh ${payload.fetchedAt.slice(0, 10)}` }, payload, installedAt: Date.now(), bytes };
  await putRecord(record);
  return record;
}

export const installSourcePack = (info: SourcePackInfo, signal?: AbortSignal, onProgress?: (done: number, total: number) => void) =>
  info.kind === 'quran-edition' ? installQuranEdition(info, signal, onProgress) : installHadithCollection(info, signal, onProgress);
export const listInstalledSourcePacks = async (): Promise<InstalledSourcePack[]> => (await listRecords()).filter(isSourcePack);
export const getInstalledSourcePack = async (id: string): Promise<InstalledSourcePack | undefined> => { const record = await getRecord(id); return isSourcePack(record) ? record : undefined; };

/** The publisher has a different version than the stored copy. Hadith have no version, so they are never "outdated" by label. */
export const sourcePackOutdated = (installed: InstalledSourcePack, listed: SourcePackInfo): boolean => installed.info.kind === 'quran-edition' && installed.info.version !== listed.version;
