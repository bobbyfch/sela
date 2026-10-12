// Generated from app/library/storage.ts by npm run build. Do not edit.
import { detectBookFormat } from "./file-format.js";
let pending;
async function database() {
  if (!pending) pending = new Promise((resolve, reject) => {
    const req = indexedDB.open("sela-private-library", 3);
    req.onupgradeneeded = () => {
      for (const [name, key] of [["books", "id"], ["files", "id"], ["collections", "name"], ["assets", "id"]]) if (!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name, { keyPath: key });
    };
    req.onsuccess = () => {
      req.result.onversionchange = () => {
        req.result.close();
        pending = null;
      };
      resolve(req.result);
    };
    req.onerror = () => {
      pending = null;
      reject(req.error);
    };
    req.onblocked = () => {
      pending = null;
      reject(new Error("Close other Sela tabs, then try again."));
    };
  });
  return pending;
}
export async function listBooks() {
  const db = await database();
  return new Promise((resolve, reject) => {
    const r = db.transaction("books").objectStore("books").getAll();
    r.onsuccess = () => resolve(r.result.map((book) => ({ ...book, cover: book.coverBytes ? new Blob([book.coverBytes], { type: book.coverType }) : book.cover })));
    r.onerror = () => reject(r.error);
  });
}
export async function getFile(id) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const r = db.transaction("files").objectStore("files").get(id);
    r.onsuccess = () => resolve(r.result?.bytes ? new Blob([r.result.bytes], { type: r.result.type }) : r.result?.blob);
    r.onerror = () => reject(r.error);
  });
}
export async function getAsset(id) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction("assets").objectStore("assets").get(id);
    request.onsuccess = () => {
      const asset = request.result;
      if (asset?.bytes) return resolve(new Blob([asset.bytes], { type: asset.type || "application/octet-stream" }));
      resolve(asset?.blob);
    };
    request.onerror = () => reject(request.error);
  });
}
export async function setAsset(id, blob) {
  const bytes = blob ? await blob.arrayBuffer() : null, db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("assets", "readwrite"), store = tx.objectStore("assets");
    if (blob) store.put({ id, bytes, type: blob.type, size: blob.size, updated: Date.now() });
    else store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(tx.error || new Error("Could not save this image. Free browser storage and retry."));
  });
}
export async function updateBook(id, values) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("books", "readwrite"), store = tx.objectStore("books"), request = store.get(id);
    let failure;
    request.onsuccess = () => {
      if (!request.result) {
        failure = Error("Book no longer exists on this shelf.");
        tx.abort();
        return;
      }
      const { id: ignored, ...patch } = values;
      store.put({ ...request.result, ...patch });
    };
    tx.oncomplete = resolve;
    tx.onerror = tx.onabort = () => reject(failure || tx.error);
  });
}
export async function writeBook(book, blob, remove = false, bytes) {
  const stored = { ...book };
  if (book.cover) {
    stored.coverBytes = await book.cover.arrayBuffer();
    stored.coverType = book.cover.type;
    delete stored.cover;
  }
  const file = blob ? { id: book.id, bytes: bytes || await blob.arrayBuffer(), type: blob.type } : null;
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["books", "files"], "readwrite");
    if (remove) {
      tx.objectStore("books").delete(book.id);
      tx.objectStore("files").delete(book.id);
    } else {
      tx.objectStore("books").put(stored);
      if (file) tx.objectStore("files").put(file);
    }
    tx.oncomplete = resolve;
    tx.onerror = tx.onabort = () => reject(tx.error || new Error("Local storage failed. Export books or free browser storage."));
  });
}
export async function importBook(file) {
  if (!file.size || file.size > 64 * 1048576) throw Error("Choose a non-empty book up to 64 MiB.");
  const data = await file.arrayBuffer();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", data)), (b) => b.toString(16).padStart(2, "0")).join("");
  const books = await listBooks();
  const existing = books.find((book2) => book2.id === hash);
  if (existing) return { book: existing, duplicate: true };
  const format = await detectBookFormat(file, data);
  const book = { id: hash, name: file.name.replace(/\.[^.]+$/, ""), filename: file.name, format, size: file.size, saved: Date.now(), opened: 0 };
  await writeBook(book, file, false, data);
  return { book, duplicate: false };
}
export async function restoreBooks(records, collections = []) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["books", "files", "collections"], "readwrite");
    for (const name of collections) tx.objectStore("collections").put({ name });
    for (const { book, bytes, type } of records) {
      tx.objectStore("books").put(book);
      tx.objectStore("files").put({ id: book.id, bytes, type });
    }
    tx.oncomplete = resolve;
    tx.onerror = tx.onabort = () => reject(tx.error || new Error("Restore failed; free browser storage and retry."));
  });
}
export function collectionName(value) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 40) throw Error("Use a collection name of 1\u201340 characters.");
  return value.trim();
}
export async function listCollections() {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["books", "collections"]);
    const books = tx.objectStore("books").getAll(), names = tx.objectStore("collections").getAll();
    tx.oncomplete = () => resolve([.../* @__PURE__ */ new Set([...names.result.map((n) => n.name), ...books.result.flatMap((b) => b.tags || [])])].sort((a, b) => a.localeCompare(b)));
    tx.onerror = tx.onabort = () => reject(tx.error);
  });
}
export async function changeCollection({ action, name, next, ids = [], from } = {}) {
  if (!["create", "rename", "delete", "add", "remove", "move", "replace"].includes(action)) throw Error("Invalid collection operation");
  if (action !== "replace") name = collectionName(name);
  if (action === "rename") next = collectionName(next);
  if (action === "move") from = collectionName(from);
  const replacements = action === "replace" ? [...new Set((next || []).map(collectionName))] : [];
  if (replacements.length > 30) throw Error("Choose up to 30 collections per book.");
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["books", "collections"], "readwrite"), books = tx.objectStore("books"), registry = tx.objectStore("collections");
    let failure;
    const all = books.getAll(), known = registry.getAll();
    let ready = 0;
    function update() {
      if (++ready !== 2) return;
      try {
        const names = /* @__PURE__ */ new Set([...known.result.map((n) => n.name), ...all.result.flatMap((b) => b.tags || [])]);
        if (action === "create" && names.has(name) || action === "rename" && name !== next && names.has(next)) throw Error("A collection with that name already exists.");
        if (["rename", "delete"].includes(action) && !names.has(name)) throw Error("Collection no longer exists.");
        const added = ["create", "add", "move"].includes(action) ? [name] : replacements;
        if (names.size <= 200 && (/* @__PURE__ */ new Set([...names, ...added])).size > 200) throw Error("Up to 200 collections are supported.");
        const chosen = new Set(ids);
        if (ids.length && ids.some((id) => !all.result.some((b) => b.id === id))) throw Error("A selected book is no longer on this shelf.");
        for (const book of all.result) {
          const tags = new Set(book.tags || []);
          let changed = false;
          if (action === "rename" && tags.delete(name)) {
            tags.add(next);
            changed = true;
          }
          if (action === "delete" && tags.delete(name)) changed = true;
          if (chosen.has(book.id)) {
            if (action === "replace") {
              tags.clear();
              replacements.forEach((n) => tags.add(n));
              changed = true;
            }
            if (action === "add") {
              tags.add(name);
              changed = true;
            }
            if (action === "remove") changed = tags.delete(name);
            if (action === "move" && tags.delete(from)) {
              tags.add(name);
              changed = true;
            }
          }
          if (tags.size > 30) throw Error("Choose up to 30 collections per book.");
          if (changed) books.put({ ...book, tags: [...tags] });
        }
        if (["create", "add", "move"].includes(action)) registry.put({ name });
        if (action === "replace") replacements.forEach((name2) => registry.put({ name: name2 }));
        if (action === "rename") {
          registry.delete(name);
          registry.put({ name: next });
        }
        if (action === "delete") registry.delete(name);
      } catch (e) {
        failure = e;
        tx.abort();
      }
    }
    all.onsuccess = update;
    known.onsuccess = update;
    tx.oncomplete = resolve;
    tx.onerror = tx.onabort = () => reject(failure || tx.error || Error("Collection could not be saved."));
  });
}
