// Generated from app/library/content-packs.ts by npm run build. Do not edit.
const MAX_PAYLOAD_BYTES = 8 * 1024 * 1024;
const MAX_INDEX_BYTES = 256 * 1024;
const idPattern = /^[a-z0-9][a-z0-9-]{2,63}$/;
const slugPattern = /^[a-z0-9][a-z0-9-]{1,40}$/;
const shaPattern = /^[0-9a-f]{64}$/;
const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const isText = (value, max = 4e3) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const isCount = (value, min = 0) => Number.isInteger(value) && Number(value) >= min && Number(value) <= 1e5;
const safePath = (value) => typeof value === "string" && /^[a-z0-9][a-z0-9._/-]*$/i.test(value) && !value.includes("..") && !value.includes("//");
function fail(what) {
  throw new TypeError(`Invalid content pack: ${what}.`);
}
export function validatePackManifest(value) {
  if (!isRecord(value)) fail("manifest is not an object");
  const { id, schemaVersion, kind, status, category, language, title, description, edition, itemCount, plannedItemCount, source, license, payload } = value;
  if (typeof id !== "string" || !idPattern.test(id)) fail("id");
  if (schemaVersion !== 1) fail("unsupported schemaVersion");
  if (kind !== "editorial-collection") fail("kind");
  if (status !== "pilot" && status !== "draft" && status !== "complete") fail("status");
  if (!isText(category, 60) || !isText(language, 12) || !isText(edition, 24)) fail("category, language or edition");
  if (!isRecord(title) || !isText(title.id, 120) || !isText(title.en, 120)) fail("title");
  if (!isRecord(description) || !isText(description.id, 600) || !isText(description.en, 600)) fail("description");
  if (!isCount(itemCount, 1)) fail("itemCount");
  if (plannedItemCount !== void 0 && !isCount(plannedItemCount, itemCount)) fail("plannedItemCount");
  if (!Array.isArray(source) || !source.length || source.some((row) => !isRecord(row) || !isText(row.label, 200) || typeof row.url !== "string" || !/^https:\/\//.test(row.url))) fail("source");
  if (!isRecord(license) || !isText(license.code, 40) || !isText(license.name, 160) || !safePath(license.noticePath)) fail("license");
  if (!isRecord(payload) || !safePath(payload.path) || typeof payload.sha256 !== "string" || !shaPattern.test(payload.sha256) || !isCount(payload.bytes, 1) || Number(payload.bytes) > MAX_PAYLOAD_BYTES) fail("payload");
  return value;
}
export function validatePackIndex(value) {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.packs)) fail("index");
  const packs = value.packs.map(validatePackManifest);
  if (new Set(packs.map((pack) => pack.id)).size !== packs.length) fail("duplicate pack ids");
  return { schemaVersion: 1, packs };
}
function validateRef(value) {
  if (!isRecord(value)) fail("reference");
  const { surah, from, to } = value;
  if (!Number.isInteger(surah) || Number(surah) < 1 || Number(surah) > 114) fail("reference surah");
  if (!Number.isInteger(from) || Number(from) < 1 || Number(from) > 286) fail("reference verse");
  if (to !== void 0 && (!Number.isInteger(to) || Number(to) < Number(from) || Number(to) > 286)) fail("reference range");
  return value;
}
export function validateProphetPayload(value, manifest) {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.packId !== manifest.id || !Array.isArray(value.articles)) fail("payload shape");
  if (value.articles.length !== manifest.itemCount) fail(`expected ${manifest.itemCount} articles, found ${value.articles.length}`);
  const slugs = /* @__PURE__ */ new Set();
  for (const article of value.articles) {
    if (!isRecord(article) || typeof article.slug !== "string" || !slugPattern.test(article.slug) || slugs.has(article.slug)) fail("article slug");
    slugs.add(article.slug);
    if (!Number.isInteger(article.order) || !isText(article.name, 80) || !isText(article.arabic, 80) || !isText(article.lede, 600) || !isText(article.accuracy, 1200)) fail(`article ${article.slug} fields`);
    if (!Array.isArray(article.sections) || !article.sections.length) fail(`article ${article.slug} sections`);
    for (const section of article.sections) {
      if (!isRecord(section) || !isText(section.heading, 160) || !Array.isArray(section.paragraphs) || !section.paragraphs.length || section.paragraphs.some((text) => !isText(text, 2400))) fail(`article ${article.slug} section`);
      if (!Array.isArray(section.refs) || !section.refs.length) fail(`article ${article.slug} section without a Quran reference`);
      section.refs.forEach(validateRef);
    }
    if (!Array.isArray(article.notes) || article.notes.some((text) => !isText(text, 1200)) || !Array.isArray(article.related)) fail(`article ${article.slug} notes`);
  }
  for (const article of value.articles) if (article.related.some((slug) => !slugs.has(slug))) fail(`article ${article.slug} links to a missing entry`);
  return value;
}
export function packUrl(path, baseUrl = document.baseURI) {
  if (!safePath(path)) fail("path");
  return new URL(`../library/packs/${path}`, new URL("./", baseUrl));
}
export async function readLimited(response, limit, signal, onProgress) {
  if (!response.ok) throw new Error(`The content server answered ${response.status}.`);
  const declared = Number(response.headers.get("content-length"));
  if (declared > limit) throw new Error("This file is larger than the size the manifest allows.");
  const reader = response.body?.getReader();
  if (!reader) {
    const bytes2 = new Uint8Array(await response.arrayBuffer());
    if (bytes2.length > limit) throw new Error("This file is larger than the size the manifest allows.");
    return bytes2;
  }
  const chunks = [];
  let received = 0;
  for (; ; ) {
    if (signal?.aborted) {
      await reader.cancel();
      throw new DOMException("Download cancelled.", "AbortError");
    }
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    if (received > limit) {
      await reader.cancel();
      throw new Error("This file is larger than the size the manifest allows.");
    }
    chunks.push(value);
    onProgress?.(received);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}
export async function sha256Hex(bytes) {
  if (!globalThis.crypto?.subtle) throw new Error("This browser cannot verify downloads here. Open Sela over HTTPS and try again.");
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
export async function fetchPackIndex(signal) {
  const response = await fetch(packUrl("index.json"), { signal, cache: "no-cache", credentials: "omit", referrerPolicy: "no-referrer", headers: { Accept: "application/json" } });
  const bytes = await readLimited(response, MAX_INDEX_BYTES, signal);
  return validatePackIndex(JSON.parse(new TextDecoder().decode(bytes)));
}
export async function downloadPack(manifest, signal, onProgress) {
  const response = await fetch(packUrl(manifest.payload.path), { signal, cache: "no-cache", credentials: "omit", referrerPolicy: "no-referrer", headers: { Accept: "application/json" } });
  const bytes = await readLimited(response, manifest.payload.bytes, signal, (received) => onProgress?.(received, manifest.payload.bytes));
  if (bytes.length !== manifest.payload.bytes) throw new Error("The download is incomplete or changed since the catalogue was published. Try again later.");
  if (await sha256Hex(bytes) !== manifest.payload.sha256) throw new Error("The download does not match its published checksum, so it was discarded.");
  return { payload: validateProphetPayload(JSON.parse(new TextDecoder().decode(bytes)), manifest), bytes: bytes.length };
}
const DB_NAME = "sela-content-packs";
const STORE = "packs";
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Browser storage is unavailable."));
    request.onblocked = () => reject(new Error("Close other Sela tabs and try again."));
  });
}
function run(mode, work) {
  return openDatabase().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = work(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(request.result);
    };
    tx.onerror = tx.onabort = () => {
      db.close();
      reject(tx.error || new Error("Not enough browser storage. Free some space and try again."));
    };
  }));
}
export async function installPack(manifest, signal, onProgress) {
  const { payload, bytes } = await downloadPack(manifest, signal, onProgress);
  const record = { id: manifest.id, manifest, payload, installedAt: Date.now(), bytes };
  await putRecord(record);
  return record;
}
export const putRecord = (record) => run("readwrite", (store) => store.put(record));
export const listRecords = () => run("readonly", (store) => store.getAll());
export const getRecord = (id) => run("readonly", (store) => store.get(id));
export const isEditorial = (record) => !!record && "manifest" in record;
export const isSourcePack = (record) => !!record && "info" in record;
export const listInstalledPacks = async () => (await listRecords()).filter(isEditorial);
export const getInstalledPack = async (id) => {
  const record = await getRecord(id);
  return isEditorial(record) ? record : void 0;
};
export const removePack = (id) => run("readwrite", (store) => store.delete(id));
export function packUpdateAvailable(installed, listed) {
  return installed.manifest.payload.sha256 !== listed.payload.sha256;
}
export function readingMinutes(article) {
  const words = [article.lede, ...article.sections.flatMap((section) => section.paragraphs), ...article.notes].join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
export function formatRef(ref, surahName) {
  return `${surahName} ${ref.surah}:${ref.from}${ref.to && ref.to !== ref.from ? `\u2013${ref.to}` : ""}`;
}
