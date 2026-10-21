// Generated from app/library/backup.ts by npm run build. Do not edit.
import { readPersonal, validatePersonal, savePersonal } from "./personal-store.js";
import { readProfiles, validateProfiles, mergeProfiles, writeProfiles } from "../dist/js/sela.profiles.js";
import { cleanMetadata } from "../dist/js/sela.metadata.js";
import { listBooks, getFile, restoreBooks, listCollections, collectionName, updateBook } from "./storage.js";
const prefix = "sela-library:";
const encoder = new TextEncoder();
const formats = ["pdf", "epub", "cbz", "txt", "md", "html", "fb2", "docx", "odt"];
const readingKeys = ["page", "marks", "notes", "location", "preferences", "highlights"];
function isRecord(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function presets() {
  const result = {};
  for (const key of ["novel", "document", "comic"]) try {
    const p = JSON.parse(localStorage.getItem(prefix + "preset:" + key) || "{}");
    if (["single", "book", "scroll", "webtoon", "manga"].includes(p.mode)) result[key] = { mode: p.mode };
  } catch {
  }
  return result;
}
export async function exportLibrary() {
  const { createBackupArchive } = await import("../dist/js/sela.archive.js");
  const entries = {}, books = [];
  let total = 0;
  for (const book of await listBooks()) {
    const file = await getFile(book.id);
    if (!file) throw Error("Missing book: " + book.name);
    if ((total += file.size) > 120 * 1048576) throw Error("Backup supports up to 120 MiB of book files per export. Export originals individually for a larger shelf.");
    entries[`books/${book.id}.${book.format}`] = new Uint8Array(await file.arrayBuffer());
    const { cover, coverBytes, coverType, ...metadata } = book;
    const reading = {};
    for (const suffix of readingKeys) {
      const value = localStorage.getItem(prefix + book.id + ":" + suffix);
      if (value !== null) reading[suffix] = value;
    }
    books.push({ metadata, reading });
  }
  const preferences = localStorage.getItem(prefix + "preferences");
  if (books.length > 200) throw Error("Backup supports up to 200 books per archive.");
  entries["sela.json"] = encoder.encode(JSON.stringify({ type: "sela-library", version: 1, books, preferences, collections: await listCollections(), profiles: readProfiles(), personal: readPersonal(), presets: presets() }));
  if (entries["sela.json"].length > 8 * 1048576) throw Error("Reading metadata exceeds 8 MiB. Export notes separately.");
  return new Blob([new Uint8Array(createBackupArchive(entries))], { type: "application/zip" });
}
function validateReading(reading) {
  if (!reading || typeof reading !== "object" || Array.isArray(reading)) throw Error("Invalid reading data");
  const result = {};
  for (const [key, value] of Object.entries(reading)) {
    if (!readingKeys.includes(key) || typeof value !== "string" || value.length > 1048576) throw Error("Invalid reading data");
    const data = JSON.parse(value);
    if (key === "page" && (!Number.isInteger(data) || data < 1)) throw Error("Invalid page");
    if (key === "marks" && (!Array.isArray(data) || data.length > 2e3 || data.some((n) => !Number.isInteger(n) || n < 1))) throw Error("Invalid bookmarks");
    if (["notes", "location", "preferences", "highlights"].includes(key) && (!data || typeof data !== "object" || Array.isArray(data))) throw Error("Invalid reading data");
    if (key === "highlights") {
      const entries = Object.entries(data);
      if (entries.length > 2e3 || entries.some(([page, quotes]) => !Number.isInteger(+page) || +page < 1 || !Array.isArray(quotes) || quotes.length > 100 || quotes.some((q) => typeof q !== "string" || q.length > 1e4))) throw Error("Invalid highlights");
    }
    if (key === "notes") {
      const notes = Object.entries(data);
      if (notes.length > 2e3 || notes.some(([page, note]) => !Number.isInteger(+page) || +page < 1 || typeof note !== "string" || note.length > 1e4)) throw Error("Invalid notes");
    }
    result[key] = value;
  }
  return result;
}
export async function restoreLibrary(file) {
  if (file.size > 128 * 1048576) throw Error("Backup exceeds 128 MiB");
  const { readBackupArchive } = await import("../dist/js/sela.archive.js");
  const entries = readBackupArchive(new Uint8Array(await file.arrayBuffer()));
  if (!entries["sela.json"] || entries["sela.json"].length > 8 * 1048576) throw Error("Invalid Sela backup");
  const manifest = JSON.parse(new TextDecoder().decode(entries["sela.json"]));
  if (manifest.type !== "sela-library" || manifest.version !== 1 || !Array.isArray(manifest.books) || manifest.books.length > 200) throw Error("Invalid Sela backup");
  const existing = new Set((await listBooks()).map((book) => book.id)), seen = /* @__PURE__ */ new Set(), records = [], reading = [], conflicts = [];
  for (const item of manifest.books) {
    if (!isRecord(item) || !isRecord(item.metadata)) throw Error("Invalid book metadata");
    const b = item.metadata;
    if (typeof b.id !== "string" || !/^[a-f0-9]{64}$/.test(b.id) || seen.has(b.id) || typeof b.format !== "string" || !formats.includes(b.format) || typeof b.name !== "string" || b.name.length > 180 || typeof b.filename !== "string" || b.filename.length > 255) throw Error("Invalid book metadata");
    seen.add(b.id);
    const bytes = entries[`books/${b.id}.${b.format}`];
    if (!bytes || !bytes.length) throw Error("Missing book file");
    const bookBytes = new Uint8Array(bytes);
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bookBytes)), (n) => n.toString(16).padStart(2, "0")).join("");
    if (hash !== b.id) throw Error("Book integrity check failed");
    const validated = validateReading(item.reading);
    if (existing.has(b.id)) {
      if (Object.keys(validated).length) conflicts.push({ id: b.id, name: b.name, reading: validated, progress: Number.isFinite(+b.progress) ? +b.progress : 0, total: Number.isFinite(+b.total) ? +b.total : 0 });
      continue;
    }
    const book = { id: b.id, format: b.format, filename: b.filename, name: b.name, size: bytes.length, saved: Number(b.saved) || Date.now(), opened: Number(b.opened) || 0, favorite: !!b.favorite, completed: !!b.completed, didNotFinish: b.didNotFinish === true && !b.completed, tags: Array.isArray(b.tags) ? b.tags.filter((t) => typeof t === "string").slice(0, 30).map((t) => t.slice(0, 40)) : [] };
    book.metadata = cleanMetadata(b.metadata);
    book.progress = Math.max(0, Number(b.progress) || 0);
    book.total = Math.max(0, Number(b.total) || 0);
    book.pinned = !!b.pinned;
    records.push({ book, bytes: bookBytes.buffer, type: "application/octet-stream" });
    reading.push({ id: b.id, values: validated });
  }
  let defaults = null;
  if (manifest.preferences !== null && manifest.preferences !== void 0) {
    if (typeof manifest.preferences !== "string" || manifest.preferences.length > 1e4) throw Error("Invalid defaults");
    const parsed = JSON.parse(manifest.preferences);
    if (!isRecord(parsed)) throw Error("Invalid defaults");
    defaults = parsed;
  }
  const collections = manifest.collections === void 0 ? [] : manifest.collections;
  if (!Array.isArray(collections) || collections.length > 6200) throw Error("Invalid collections");
  const validatedCollections = [...new Set(collections.map(collectionName))];
  const profiles = manifest.profiles === void 0 ? null : mergeProfiles(readProfiles(), validateProfiles(manifest.profiles));
  const groupPresets = manifest.presets === void 0 ? {} : manifest.presets;
  if (!isRecord(groupPresets) || Object.entries(groupPresets).some(([key, p]) => !["novel", "document", "comic"].includes(key) || !isRecord(p) || !["single", "book", "scroll", "webtoon", "manga"].includes(p.mode))) throw Error("Invalid reading presets");
  const personal = manifest.personal ? validatePersonal(manifest.personal) : null;
  await restoreBooks(records, validatedCollections);
  let readingSaved = true;
  try {
    for (const [key, p] of Object.entries(groupPresets)) if (!localStorage.getItem(prefix + "preset:" + key)) localStorage.setItem(prefix + "preset:" + key, JSON.stringify({ mode: p.mode }));
    if (personal) {
      const local = readPersonal();
      savePersonal({ ...personal, books: { ...personal.books, ...local.books }, queue: [.../* @__PURE__ */ new Set([...local.queue, ...personal.queue])], sessions: [...new Map([...personal.sessions, ...local.sessions].map((s) => [s.at + ":" + s.book, s])).values()], room: local.room || personal.room });
    }
    if (profiles) writeProfiles(profiles);
    for (const entry of reading) for (const [suffix, value] of Object.entries(entry.values)) localStorage.setItem(prefix + entry.id + ":" + suffix, value);
    if (defaults && !localStorage.getItem(prefix + "preferences")) localStorage.setItem(prefix + "preferences", JSON.stringify(defaults));
  } catch {
    readingSaved = false;
  }
  return { added: records.length, kept: existing.size, readingSaved, conflicts };
}
export async function mergeRemoteReading(conflict) {
  if (!/^[a-f0-9]{64}$/.test(conflict.id) || !(await listBooks()).some((b) => b.id === conflict.id)) throw Error("Book no longer exists");
  const remote = validateReading(conflict.reading), base = prefix + conflict.id + ":", writes = {}, personal = readPersonal(), record = personal.books[conflict.id] ||= {}, copies = [...record.copies || []];
  function local(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(base + key) || "null") ?? fallback;
    } catch {
      throw Error("Local reading data needs a backup before merging");
    }
  }
  if (remote.notes) {
    const ours = local("notes", {}), theirs = JSON.parse(remote.notes);
    if (!ours || typeof ours !== "object" || Array.isArray(ours)) throw Error("Invalid local notes");
    const merged = { ...ours };
    for (const [page, text] of Object.entries(theirs)) {
      if (!Object.hasOwn(ours, page)) merged[page] = text;
      else if (ours[page] !== text && !copies.some((c) => c.page === +page && c.text === text)) copies.push({ page: +page, text, at: Date.now() });
    }
    if (copies.length > 50 || Object.keys(merged).length > 2e3) throw Error("Too many note conflicts; keep the remote ZIP and merge notes manually");
    writes.notes = JSON.stringify(merged);
  }
  if (remote.marks) {
    const ours = local("marks", []);
    if (!Array.isArray(ours)) throw Error("Invalid local bookmarks");
    const merged = [.../* @__PURE__ */ new Set([...ours, ...JSON.parse(remote.marks)])];
    if (merged.length > 2e3) throw Error("Too many bookmarks");
    writes.marks = JSON.stringify(merged.sort((a, b) => a - b));
  }
  if (remote.highlights) {
    const ours = local("highlights", {}), theirs = JSON.parse(remote.highlights);
    if (!ours || typeof ours !== "object" || Array.isArray(ours)) throw Error("Invalid local highlights");
    const merged = { ...ours };
    for (const [page, quotes] of Object.entries(theirs)) {
      const old = ours[page] || [];
      if (!Array.isArray(old)) throw Error("Invalid local highlights");
      merged[page] = [.../* @__PURE__ */ new Set([...old, ...quotes])];
      if (merged[page].length > 100) throw Error("Too many highlights on page " + page);
    }
    if (Object.keys(merged).length > 2e3) throw Error("Too many highlight pages");
    writes.highlights = JSON.stringify(merged);
  }
  if (remote.page) writes.page = remote.page;
  if (remote.location) writes.location = remote.location;
  record.copies = copies;
  personal.books[conflict.id] = record;
  savePersonal(personal);
  for (const [key, value] of Object.entries(writes)) localStorage.setItem(base + key, value);
  await updateBook(conflict.id, { progress: conflict.progress, total: conflict.total });
}
