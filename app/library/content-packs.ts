/**
 * Optional, user-installed content packs for Taman Bacaan.
 * A pack is a small manifest (listed in library/packs/index.json) plus one JSON payload.
 * Install is download -> verify size and SHA-256 -> validate shape -> single IndexedDB commit,
 * so a failed or cancelled install never leaves a half-written pack. Personal shelf data lives in
 * a different database and is never touched here.
 */
export type PackKind = 'editorial-collection';
export type PackStatus = 'pilot' | 'complete';
export interface PackManifest {
  id: string;
  schemaVersion: 1;
  kind: PackKind;
  status: PackStatus;
  category: string;
  language: string;
  title: { id: string; en: string };
  description: { id: string; en: string };
  edition: string;
  itemCount: number;
  plannedItemCount?: number;
  source: { label: string; url: string }[];
  license: { code: string; name: string; noticePath: string };
  payload: { path: string; sha256: string; bytes: number };
}
export interface PackIndex { schemaVersion: 1; packs: PackManifest[] }
export interface ProphetRef { surah: number; from: number; to?: number }
export interface ProphetSection { heading: string; paragraphs: string[]; refs: ProphetRef[] }
export interface ProphetArticle {
  slug: string;
  order: number;
  name: string;
  arabic: string;
  lede: string;
  sections: ProphetSection[];
  notes: string[];
  accuracy: string;
  related: string[];
}
export interface ProphetPayload { schemaVersion: 1; packId: string; articles: ProphetArticle[] }
export interface InstalledPack { id: string; manifest: PackManifest; payload: ProphetPayload; installedAt: number; bytes: number }

const MAX_PAYLOAD_BYTES = 8 * 1024 * 1024;
const MAX_INDEX_BYTES = 256 * 1024;
const idPattern = /^[a-z0-9][a-z0-9-]{2,63}$/;
const slugPattern = /^[a-z0-9][a-z0-9-]{1,40}$/;
const shaPattern = /^[0-9a-f]{64}$/;
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const isText = (value: unknown, max = 4000): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const isCount = (value: unknown, min = 0): value is number => Number.isInteger(value) && Number(value) >= min && Number(value) <= 100000;
const safePath = (value: unknown): value is string => typeof value === 'string' && /^[a-z0-9][a-z0-9._/-]*$/i.test(value) && !value.includes('..') && !value.includes('//');

function fail(what: string): never { throw new TypeError(`Invalid content pack: ${what}.`); }

export function validatePackManifest(value: unknown): PackManifest {
  if (!isRecord(value)) fail('manifest is not an object');
  const { id, schemaVersion, kind, status, category, language, title, description, edition, itemCount, plannedItemCount, source, license, payload } = value;
  if (typeof id !== 'string' || !idPattern.test(id)) fail('id');
  if (schemaVersion !== 1) fail('unsupported schemaVersion');
  if (kind !== 'editorial-collection') fail('kind');
  if (status !== 'pilot' && status !== 'complete') fail('status');
  if (!isText(category, 60) || !isText(language, 12) || !isText(edition, 24)) fail('category, language or edition');
  if (!isRecord(title) || !isText(title.id, 120) || !isText(title.en, 120)) fail('title');
  if (!isRecord(description) || !isText(description.id, 600) || !isText(description.en, 600)) fail('description');
  if (!isCount(itemCount, 1)) fail('itemCount');
  if (plannedItemCount !== undefined && (!isCount(plannedItemCount, itemCount) )) fail('plannedItemCount');
  if (!Array.isArray(source) || !source.length || source.some(row => !isRecord(row) || !isText(row.label, 200) || typeof row.url !== 'string' || !/^https:\/\//.test(row.url))) fail('source');
  if (!isRecord(license) || !isText(license.code, 40) || !isText(license.name, 160) || !safePath(license.noticePath)) fail('license');
  if (!isRecord(payload) || !safePath(payload.path) || typeof payload.sha256 !== 'string' || !shaPattern.test(payload.sha256) || !isCount(payload.bytes, 1) || Number(payload.bytes) > MAX_PAYLOAD_BYTES) fail('payload');
  return value as unknown as PackManifest;
}

export function validatePackIndex(value: unknown): PackIndex {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.packs)) fail('index');
  const packs = value.packs.map(validatePackManifest);
  if (new Set(packs.map(pack => pack.id)).size !== packs.length) fail('duplicate pack ids');
  return { schemaVersion: 1, packs };
}

function validateRef(value: unknown): ProphetRef {
  if (!isRecord(value)) fail('reference');
  const { surah, from, to } = value;
  if (!Number.isInteger(surah) || Number(surah) < 1 || Number(surah) > 114) fail('reference surah');
  if (!Number.isInteger(from) || Number(from) < 1 || Number(from) > 286) fail('reference verse');
  if (to !== undefined && (!Number.isInteger(to) || Number(to) < Number(from) || Number(to) > 286)) fail('reference range');
  return value as unknown as ProphetRef;
}

export function validateProphetPayload(value: unknown, manifest: PackManifest): ProphetPayload {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.packId !== manifest.id || !Array.isArray(value.articles)) fail('payload shape');
  if (value.articles.length !== manifest.itemCount) fail(`expected ${manifest.itemCount} articles, found ${value.articles.length}`);
  const slugs = new Set<string>();
  for (const article of value.articles) {
    if (!isRecord(article) || typeof article.slug !== 'string' || !slugPattern.test(article.slug) || slugs.has(article.slug)) fail('article slug');
    slugs.add(article.slug);
    if (!Number.isInteger(article.order) || !isText(article.name, 80) || !isText(article.arabic, 80) || !isText(article.lede, 600) || !isText(article.accuracy, 1200)) fail(`article ${article.slug} fields`);
    if (!Array.isArray(article.sections) || !article.sections.length) fail(`article ${article.slug} sections`);
    for (const section of article.sections) {
      if (!isRecord(section) || !isText(section.heading, 160) || !Array.isArray(section.paragraphs) || !section.paragraphs.length || section.paragraphs.some(text => !isText(text, 2400))) fail(`article ${article.slug} section`);
      if (!Array.isArray(section.refs) || !section.refs.length) fail(`article ${article.slug} section without a Quran reference`);
      section.refs.forEach(validateRef);
    }
    if (!Array.isArray(article.notes) || article.notes.some(text => !isText(text, 1200)) || !Array.isArray(article.related)) fail(`article ${article.slug} notes`);
  }
  for (const article of value.articles as ProphetArticle[]) if (article.related.some(slug => !slugs.has(slug))) fail(`article ${article.slug} links to a missing entry`);
  return value as unknown as ProphetPayload;
}

/** Resolve a pack file against the deployed app so GitHub Pages sub-paths keep working. */
export function packUrl(path: string, baseUrl: string | URL = document.baseURI): URL {
  if (!safePath(path)) fail('path');
  return new URL(`../library/packs/${path}`, new URL('./', baseUrl));
}

async function readLimited(response: Response, limit: number, signal?: AbortSignal, onProgress?: (received: number) => void): Promise<Uint8Array> {
  if (!response.ok) throw new Error(`The content server answered ${response.status}.`);
  const declared = Number(response.headers.get('content-length'));
  if (declared > limit) throw new Error('This file is larger than the size the manifest allows.');
  const reader = response.body?.getReader();
  if (!reader) { const bytes = new Uint8Array(await response.arrayBuffer()); if (bytes.length > limit) throw new Error('This file is larger than the size the manifest allows.'); return bytes; }
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    if (signal?.aborted) { await reader.cancel(); throw new DOMException('Download cancelled.', 'AbortError'); }
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    if (received > limit) { await reader.cancel(); throw new Error('This file is larger than the size the manifest allows.'); }
    chunks.push(value);
    onProgress?.(received);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('This browser cannot verify downloads here. Open Sela over HTTPS and try again.');
  const digest = await crypto.subtle.digest('SHA-256', bytes as BufferSource);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function fetchPackIndex(signal?: AbortSignal): Promise<PackIndex> {
  const response = await fetch(packUrl('index.json'), { signal, cache: 'no-cache', credentials: 'omit', referrerPolicy: 'no-referrer', headers: { Accept: 'application/json' } });
  const bytes = await readLimited(response, MAX_INDEX_BYTES, signal);
  return validatePackIndex(JSON.parse(new TextDecoder().decode(bytes)));
}

/** Download, verify and validate a payload. Throws before anything is stored. */
export async function downloadPack(manifest: PackManifest, signal?: AbortSignal, onProgress?: (received: number, total: number) => void): Promise<{ payload: ProphetPayload; bytes: number }> {
  const response = await fetch(packUrl(manifest.payload.path), { signal, cache: 'no-cache', credentials: 'omit', referrerPolicy: 'no-referrer', headers: { Accept: 'application/json' } });
  const bytes = await readLimited(response, manifest.payload.bytes, signal, received => onProgress?.(received, manifest.payload.bytes));
  if (bytes.length !== manifest.payload.bytes) throw new Error('The download is incomplete or changed since the catalogue was published. Try again later.');
  if (await sha256Hex(bytes) !== manifest.payload.sha256) throw new Error('The download does not match its published checksum, so it was discarded.');
  return { payload: validateProphetPayload(JSON.parse(new TextDecoder().decode(bytes)), manifest), bytes: bytes.length };
}

const DB_NAME = 'sela-content-packs';
const STORE = 'packs';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Browser storage is unavailable.'));
    request.onblocked = () => reject(new Error('Close other Sela tabs and try again.'));
  });
}
function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(db => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = work(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Not enough browser storage. Free some space and try again.')); };
  }));
}

export async function installPack(manifest: PackManifest, signal?: AbortSignal, onProgress?: (received: number, total: number) => void): Promise<InstalledPack> {
  const { payload, bytes } = await downloadPack(manifest, signal, onProgress);
  const record: InstalledPack = { id: manifest.id, manifest, payload, installedAt: Date.now(), bytes };
  await run('readwrite', store => store.put(record));
  return record;
}
export const listInstalledPacks = (): Promise<InstalledPack[]> => run('readonly', store => store.getAll() as IDBRequest<InstalledPack[]>);
export const getInstalledPack = (id: string): Promise<InstalledPack | undefined> => run('readonly', store => store.get(id) as IDBRequest<InstalledPack | undefined>);
export const removePack = (id: string): Promise<undefined> => run('readwrite', store => store.delete(id) as IDBRequest<undefined>);

/** Newer catalogue edition than the installed copy. */
export function packUpdateAvailable(installed: InstalledPack, listed: PackManifest): boolean {
  return installed.manifest.payload.sha256 !== listed.payload.sha256;
}

export function readingMinutes(article: ProphetArticle): number {
  const words = [article.lede, ...article.sections.flatMap(section => section.paragraphs), ...article.notes].join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
export function formatRef(ref: ProphetRef, surahName: string): string {
  return `${surahName} ${ref.surah}:${ref.from}${ref.to && ref.to !== ref.from ? `–${ref.to}` : ''}`;
}
