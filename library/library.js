// Generated from app/library/library.ts by npm run build. Do not edit.
import { readPersonal } from "./personal-store.js";
import { BOOK_ACCEPT } from "./file-format.js";
import { beginCoverTransition } from "./cover-transition.js";
import { bindReaderHistory } from "./reader-history.js";
import { VERSION } from "./version.js";
import { showCollections } from "./collections.js";
import { showBookInfo } from "./book-info.js";
import { bindBookSelection } from "./shelf-interactions.js";
import { readBookMetadata, epubMetadata, comicMetadata, fb2Metadata, cleanMetadata } from "../dist/js/sela.metadata.js";
import { listBooks, getFile, writeBook, importBook, updateBook, listCollections } from "./storage.js";
import { mountLibraryExperience } from "./library-experience.js";
import { normalizeLocale, localeBase, translate } from "../dist/source/src/i18n.js";
import { notify } from "./controls.js";
import { coverFor } from "./open-catalog.js";
const mobile = document.body.dataset.product === "mobile";
const $ = (selector) => document.querySelector(selector);
let viewer, items = [], urls = [], backup, experience, lang = normalizeLocale(localStorage.getItem("sela:language") || localStorage.getItem("sela-library:language") || navigator.language);
const strings = { autoUpdate: "Periksa rilis GitHub sekali sehari (pemberitahuan saja)", eyebrow: "RUANG KECIL MILIKMU", title: "Ada tempat untuk kembali.", intro: "Buku-bukumu, secangkir hangat, dan waktu yang menjadi milikmu.", add: "Tambah buku", shelf: "Di rakmu", empty: "Sisakan tempat untuk cerita pertama.", drop: "Tarik buku ke sini, atau gunakan tombol +. Berkas tetap di browser ini.", sample: "Temui Bobby dalam Yang Tidak Ikut Pulang", undo: "Urungkan penghapusan", about: "Privasi, pembaruan & kompatibilitas", privacy: "Buku disimpan lokal dalam IndexedDB. Tanpa akun, unggahan, atau pelacakan. Menghapus data browser menghapus rak: simpan berkas asli dan ekspor catatan bacaan.", newtab: "Reader dapat dipasang dari browser pada desktop, tablet atau ponsel. Bookmark atau jadikan URL ini halaman awal browser.", formats: "PDF, EPUB, CBZ dan teks. Narasi memakai suara browser/OS yang tersedia. Dokumen bertulisan dapat dicari; PDF hasil pindai perlu OCR. Reader menyesuaikan desktop, tablet dan ponsel." };
const originals = new Map([...document.querySelectorAll("[data-i18n]")].map((el) => [el, el.textContent]));
const t = (en, id) => translate(en, id, lang);
const paths = { favorite: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z", sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0", moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z", system: "M3 4h18v13H3ZM8 21h8m-4-4v4", finished: "m4 12 5 5L20 6", collection: "M3 7h7l2-3h9v17H3Z", remove: "M5 7h14M9 7V3h6v4M7 7l1 14h8l1-14M10 11v6m4-6v6", rename: "m4 16 12-12 4 4-12 12H4ZM13 7l4 4", info: "M12 11v6m0-10v1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", download: "M12 3v12m-5-5 5 5 5-5M5 21h14" };
function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const p = document.createElementNS(svg.namespaceURI, "path");
  p.setAttribute("d", paths[name]);
  svg.append(p);
  return svg;
}
function button(label, fn, name) {
  const b = document.createElement("button");
  b.type = "button";
  b.title = label;
  b.setAttribute("aria-label", label);
  if (name) b.append(icon(name));
  else b.textContent = label;
  b.onclick = async () => {
    if (b.disabled) return;
    b.disabled = true;
    try {
      await fn();
    } catch (error) {
      status(error.message);
    } finally {
      b.disabled = false;
    }
  };
  return b;
}
function status(message) {
  const tone = /could not|failed|error|unavailable|missing|belum dapat|gagal|hilang/i.test(message) ? "error" : "info";
  notify(message, tone);
}
let visibleLimit = 80, renderKey = "";
const shelfMore = button(t("More books", "Buku lainnya"), () => {
  visibleLimit += 80;
  render();
});
shelfMore.className = "experience-button shelf-more";
shelfMore.hidden = true;
$("#shelf").after(shelfMore);
function localize() {
  $("#check-update").title = t("Check for updates", "Periksa pembaruan");
  $("#check-update").setAttribute("aria-label", $("#check-update").title);
  $("#add-books").title = t("Add books", "Tambah buku");
  $("#add-books").setAttribute("aria-label", $("#add-books").title);
  document.documentElement.lang = lang;
  for (const [el, original] of originals) {
    const key = el.dataset.i18n;
    el.textContent = translate(original, strings[key] || original, lang);
  }
  const language = $("#language");
  language.value = lang;
  language.setAttribute("aria-label", t("Language", "Bahasa"));
  language.title = language.getAttribute("aria-label");
  $("#search").placeholder = t("Find a book", "Cari buku");
  $("#search").setAttribute("aria-label", $("#search").placeholder);
  $("#sort").setAttribute("aria-label", t("Sort books", "Urutkan buku"));
  [t("Newest", "Terbaru"), t("Last read", "Terakhir dibaca"), t("Title", "Judul")].forEach((s, i) => $("#sort").options[i].text = s);
  $("#coffee").setAttribute("aria-label", t("Pour a little coffee", "Tuang sedikit kopi"));
  if (mobile) {
    $("[data-i18n=title]").textContent = t("Your books.", "Buku-bukumu.");
    $("[data-i18n=intro]").textContent = t("Pick up where you left off.", "Lanjutkan dari halaman terakhir.");
    $("[data-i18n=privacy]").textContent = t("Books stay in this browser\u2019s IndexedDB. Clearing site data, uninstalling or browser eviction can remove them. Keep original files.", "Buku disimpan dalam IndexedDB browser ini. Menghapus data situs, uninstall atau eviction dapat menghapusnya. Simpan berkas asli.");
  }
  [t("All books", "Semua buku"), t("Unread", "Belum dibaca"), t("Started", "Mulai dibaca"), t("Favorites", "Favorit")].forEach((label, i) => $("#read-filter").options[i].text = label);
  $("#format-filter").options[0].text = t("All formats", "Semua format");
  $("#format-filter").setAttribute("aria-label", t("Filter format", "Filter format"));
  $("#read-filter").setAttribute("aria-label", t("Filter reading status", "Filter status baca"));
  clock();
  theme();
}
function theme() {
  const choice = localStorage.getItem("sela-library:theme") || "auto";
  document.documentElement.dataset.theme = choice;
  $("#theme").replaceChildren(icon({ auto: "system", light: "sun", dark: "moon" }[choice]));
  $("#theme").title = t("Appearance: ", "Tampilan: ") + choice;
  $("#theme").setAttribute("aria-label", $("#theme").title);
}
document.addEventListener("sela:appearance", theme);
$("#theme").onclick = () => {
  const choices = ["auto", "light", "dark"];
  localStorage.setItem("sela-library:theme", choices[(choices.indexOf(document.documentElement.dataset.theme) + 1) % 3]);
  theme();
  if (viewer?.overlay) viewer.setTheme(document.documentElement.dataset.theme);
};
$("#language").onchange = () => {
  lang = normalizeLocale($("#language").value);
  localStorage.setItem("sela:language", lang);
  localStorage.setItem("sela-library:language", lang);
  localize();
  render();
  experience?.localize();
  document.dispatchEvent(new Event("sela:language"));
};
function clock() {
  const now = /* @__PURE__ */ new Date();
  $("#clock").textContent = new Intl.DateTimeFormat(lang, { hour: "2-digit", minute: "2-digit" }).format(now);
  $("#clock").dateTime = now.toISOString();
  $("#date").textContent = new Intl.DateTimeFormat(lang, { weekday: "short", day: "numeric", month: "long" }).format(now);
}
setInterval(clock, 15e3);
$("#coffee").onclick = () => {
  $("#coffee").classList.toggle("poured");
  status(t("A small pause. Take a sip, stretch, then another page.", "Jeda kecil. Minum, regangkan bahu, lalu satu halaman lagi."));
};
function readingPreset(format) {
  try {
    const key = format === "pdf" ? "document" : format === "cbz" ? "comic" : "novel";
    const p = JSON.parse(localStorage.getItem("sela-library:preset:" + key) || "{}");
    return ["single", "book", "scroll", "webtoon", "manga"].includes(p.mode) ? { mode: p.mode } : {};
  } catch {
    return {};
  }
}
async function openBook(book) {
  for (const dialog of document.querySelectorAll("dialog[open]")) dialog.close();
  if (book.previewFile) {
    viewer?.destroy();
    const { detectBookFormat } = await import("./file-format.js");
    const format = await detectBookFormat(book.previewFile);
    viewer = new Sela({ data: await book.previewFile.arrayBuffer(), format, title: book.name, metadata: book.metadata, appContext: true, persistPreferences: false, theme: document.documentElement.dataset.theme, language: localeBase(lang) === "id" ? "id" : "en", mode: matchMedia("(max-width:767px)").matches ? "single" : "book", onClose: () => void refresh() });
    await viewer.open();
    if (readPersonal().quiet) viewer.overlay?.classList.add("sela-controls-hidden");
    if (mobile) await bindReaderHistory(viewer);
    return;
  }
  viewer?.destroy();
  const source = Array.from(document.querySelectorAll(".select-book")).find((input) => input.dataset.id === book.id)?.closest(".book")?.querySelector(".cover") || null;
  const coverTransition = beginCoverTransition(source);
  try {
    const blob = await getFile(book.id);
    if (!blob) throw new Error(t("Book file is missing. Add the original again.", "Berkas hilang. Tambahkan berkas asli kembali."));
    document.dispatchEvent(new CustomEvent("sela:session-book", { detail: book }));
    book.opened = Date.now();
    await updateBook(book.id, { opened: book.opened });
    const current = book;
    let hadBookMode = false;
    try {
      hadBookMode = !!JSON.parse(localStorage.getItem("sela-library:" + book.id + ":preferences") || "{}").mode;
    } catch {
    }
    viewer = new Sela({ data: await blob.arrayBuffer(), format: book.format, title: book.name, metadata: book.metadata, id: book.id, storagePrefix: "sela-library:", persistPreferences: true, appContext: true, startPage: book.searchPage, ...readingPreset(book.format), mode: readingPreset(book.format).mode || (matchMedia("(max-width:767px)").matches ? "single" : "book"), language: localeBase(lang) === "id" ? "id" : "en", theme: document.documentElement.dataset.theme, soundEnabled: false, paperTexture: true, onClose: () => {
      coverTransition.close();
      void refresh();
    }, onPageChange: ({ page }) => {
      current.progress = page;
      current.total = viewer?.totalPages || current.total;
      void updateBook(current.id, { progress: current.progress, total: current.total }).catch((e) => status(e.message));
    } });
    await viewer.open();
    if (!hadBookMode && readingPreset(book.format).mode) {
      const requested = readingPreset(book.format).mode;
      if (!["epub", "txt", "md", "html", "fb2", "docx", "odt"].includes(book.format) || ["single", "scroll"].includes(requested)) await viewer.setMode(requested);
    }
    if (readPersonal().quiet) viewer.overlay?.classList.add("sela-controls-hidden");
    if (mobile) await bindReaderHistory(viewer);
    coverTransition.ready();
    book.metadata = await viewer.getMetadata();
    await updateBook(book.id, { metadata: book.metadata });
    await refresh();
  } catch (error) {
    coverTransition.cancel();
    throw error;
  }
}
function render() {
  urls.forEach((url) => URL.revokeObjectURL(url));
  urls = [];
  $("#shelf").replaceChildren();
  const needle = $("#search").value.toLocaleLowerCase();
  const readFilter = $("#read-filter").value;
  const selectedTag = $("#tag-filter")?.value || "";
  const sorted = items.filter((b) => (b.name + " " + (b.metadata?.author || "") + " " + (b.tags || []).join(" ")).toLocaleLowerCase().includes(needle) && (!selectedTag || b.tags?.includes(selectedTag)) && ($("#format-filter").value === "all" || b.format === $("#format-filter").value) && (readFilter === "all" || (readFilter === "favorite" ? b.favorite : readFilter === "completed" ? b.completed : readFilter === "opened" ? b.opened && !b.completed : !b.opened && !b.completed))).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || ($("#sort").value === "name" ? a.name.localeCompare(b.name) : (Number(b[$("#sort").value]) || 0) - (Number(a[$("#sort").value]) || 0)));
  $("#empty").hidden = items.length > 0;
  $("#shelf").hidden = !sorted.length;
  const key = JSON.stringify([needle, readFilter, selectedTag, $("#format-filter").value, $("#sort").value]);
  if (key !== renderKey) {
    renderKey = key;
    visibleLimit = 80;
  }
  shelfMore.hidden = sorted.length <= visibleLimit;
  shelfMore.textContent = t("More books", "Buku lainnya") + " \xB7 " + Math.min(visibleLimit, sorted.length) + " / " + sorted.length;
  shelfMore.setAttribute("aria-label", t("More books", "Buku lainnya"));
  for (const book of sorted.slice(0, visibleLimit)) {
    const card = document.createElement("article");
    card.className = "book";
    const cover = button(t("Read ", "Baca ") + book.name, () => openBook(book));
    cover.className = "cover";
    cover.style.setProperty("--cover", ["#c5d8c6", "#edcfbb", "#d8cfe5", "#cfdee2", "#e5ddb8"][parseInt(book.id.slice(0, 2), 16) % 5]);
    const imageSource = URL.createObjectURL(book.cover || coverFor({ id: book.id, title: book.name, author: book.metadata?.author }));
    urls.push(imageSource);
    const img = document.createElement("img");
    img.src = imageSource;
    img.alt = "";
    img.loading = "lazy";
    cover.append(img);
    const title = document.createElement("strong");
    title.textContent = book.name;
    const format = document.createElement("small");
    format.textContent = book.format.toUpperCase();
    cover.append(title, format);
    const meta = document.createElement("div");
    meta.className = "book-meta";
    const size = document.createElement("span");
    size.textContent = `${book.format.toUpperCase()} \xB7 ${(book.size / 1048576).toFixed(1)} MiB`;
    const actions = document.createElement("div");
    actions.className = "book-actions";
    actions.hidden = true;
    const menu = button(t("Book options: ", "Pilihan buku: ") + book.name, () => {
      actions.hidden = !actions.hidden;
      menu.setAttribute("aria-expanded", String(!actions.hidden));
    });
    menu.className = "book-menu";
    menu.textContent = "\u22EF";
    menu.setAttribute("aria-expanded", "false");
    const info = button(t("Book information: ", "Informasi buku: ") + book.name, () => showBookInfo({ title: book.name, ...book.metadata }, { t, format: book.format, onSave: async (value) => {
      book.metadata = { ...book.metadata, ...value };
      if (value.title) book.name = value.title;
      await writeBook(book);
      await refresh();
    } }), "info");
    info.className = "book-info-button";
    const personal = button(t("My book: ", "Bukuku: ") + book.name, () => document.dispatchEvent(new CustomEvent("sela:book-details", { detail: book.id })), "collection");
    personal.className = "personal-book-button";
    meta.append(size, info, menu);
    actions.prepend(personal);
    actions.append(button(book.favorite ? t("Unfavorite", "Hapus favorit") : t("Favorite", "Favoritkan"), async () => {
      book.favorite = !book.favorite;
      await writeBook(book);
      await refresh();
    }, "favorite"), button(t("Rename", "Ganti judul"), async () => {
      const name2 = prompt(t("Book title", "Judul buku"), book.name);
      if (name2?.trim()) {
        book.name = name2.trim().slice(0, 180);
        await writeBook(book);
        await refresh();
      }
    }, "rename"), button(t("Export original", "Ekspor berkas asli"), async () => {
      const file = await getFile(book.id);
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = book.filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
    }, "download"), button(t("Remove", "Keluarkan"), async () => {
      backup = { book, blob: await getFile(book.id) };
      await writeBook(book, null, true);
      await refresh();
      $("#undo").hidden = false;
      status(t("Book removed. You can undo.", "Buku dikeluarkan. Bisa diurungkan."));
    }, "remove"));
    cover.firstChild?.nodeType === Node.TEXT_NODE && cover.firstChild.remove();
    const name = document.createElement("h3");
    name.className = "book-title";
    name.textContent = book.name;
    const select = document.createElement("input");
    select.type = "checkbox";
    select.className = "select-book";
    select.dataset.id = book.id;
    select.setAttribute("aria-label", t("Select ", "Pilih ") + book.name);
    select.checked = experience?.selected.has(book.id) || false;
    bindBookSelection(cover, select);
    actions.append(button(t("Select book", "Pilih buku"), () => {
      select.checked = !select.checked;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }));
    const progress = document.createElement("small");
    progress.className = "book-progress";
    progress.textContent = book.completed ? t("Finished", "Selesai") : book.progress && book.total ? `${Math.round(book.progress / book.total * 100)}%` : book.opened ? t("Reading", "Sedang dibaca") : t("Unread", "Belum dibaca");
    actions.append(button(book.pinned ? t("Unpin book", "Lepas sematan") : t("Pin book", "Sematkan buku"), async () => {
      book.pinned = !book.pinned;
      await writeBook(book);
      await refresh();
    }, "favorite"));
    card.dataset.pinned = String(!!book.pinned);
    actions.append(button(book.completed ? t("Mark unfinished", "Tandai belum selesai") : t("Mark finished", "Tandai selesai"), async () => {
      book.completed = !book.completed;
      await writeBook(book);
      await refresh();
      if (book.completed) document.dispatchEvent(new CustomEvent("sela:book-details", { detail: book.id }));
    }, "finished"), button(t("Edit collections", "Edit koleksi"), () => showCollections({ t, ids: [book.id], onChange: refresh }), "collection"));
    const author = document.createElement("small");
    author.className = "book-author";
    author.textContent = [book.metadata?.author, book.metadata?.year].filter(Boolean).join(" \xB7 ");
    card.append(select, cover, name, author, meta, progress, actions);
    $("#shelf").append(card);
  }
  if (items.length && !sorted.length) status(t("No matching books.", "Tidak ada buku yang cocok."));
  requestAnimationFrame(boards);
  experience?.render(items);
}
function boards() {
  const shelf = $("#shelf");
  shelf.querySelectorAll(".shelf-board").forEach((b) => b.remove());
  if (document.body.dataset.shelfView !== "shelf") return;
  const rows = new Set([...shelf.querySelectorAll(".book")].map((card) => card.offsetTop + card.offsetHeight - 15));
  for (const top of rows) {
    const board = document.createElement("div");
    board.className = "shelf-board";
    board.setAttribute("aria-hidden", "true");
    board.style.top = top + "px";
    shelf.append(board);
  }
}
if (window.ResizeObserver) new ResizeObserver(boards).observe($("#shelf"));
else window.addEventListener("resize", boards);
async function refresh() {
  items = await listBooks();
  const tag = $("#tag-filter");
  if (tag?.value && !(await listCollections()).includes(tag.value)) tag.value = "";
  render();
}
$("#undo").onclick = async () => {
  try {
    if (!backup) return;
    await writeBook(backup.book, backup.blob);
    backup = null;
    $("#undo").hidden = true;
    await refresh();
    status(t("Book restored.", "Buku dikembalikan."));
  } catch (error) {
    status(error.message);
  }
};
$("#search").oninput = render;
$("#sort").onchange = render;
$("#format-filter").onchange = render;
$("#read-filter").onchange = render;
let shelfView = localStorage.getItem("sela-library:view") || "grid";
if (!["shelf", "grid", "list"].includes(shelfView)) shelfView = "grid";
function applyView() {
  document.body.dataset.shelfView = shelfView;
  $("#shelf-view").setAttribute("aria-label", t("Switch shelf view: ", "Ganti tampilan rak: ") + shelfView);
  $("#shelf-view").innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + { shelf: "M3 5h18M3 12h18M3 19h18M5 5v7m5-7v7m5-7v7m5-7v7M6 12v7m5-7v7m5-7v7", grid: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z", list: "M3 5h3v3H3Zm6 1h12M3 11h3v3H3Zm6 1h12M3 17h3v3H3Zm6 1h12" }[shelfView] + '"/></svg>';
  requestAnimationFrame(boards);
}
$("#shelf-view").onclick = () => {
  const views = ["shelf", "grid", "list"];
  shelfView = views[(views.indexOf(shelfView) + 1) % views.length];
  localStorage.setItem("sela-library:view", shelfView);
  applyView();
};
applyView();
document.addEventListener("sela:open-book", (e) => {
  const book = items.find((b) => b.id === e.detail);
  if (book) openBook(book).catch((e2) => status(e2.message));
});
document.addEventListener("sela:continue", () => {
  const latest = [...items].sort((a, b) => (b.opened || 0) - (a.opened || 0))[0];
  if (latest) openBook(latest).catch((e) => status(e.message));
  else status(t("Add a book first.", "Tambahkan buku dahulu."));
});
async function thumbnail(file, book) {
  try {
    if (book.cover && book.metadata) return;
    if (book.format === "pdf") {
      const legacy = !Promise.withResolvers;
      const base = `../dist/vendor/pdfjs/${legacy ? "legacy/" : ""}build/`;
      const lib = await import(base + "pdf.min.mjs");
      lib.GlobalWorkerOptions.workerSrc = new URL(base + "pdf.worker.min.mjs", location.href).href;
      const task = lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, cMapUrl: new URL("../dist/vendor/pdfjs/cmaps/", location.href).href, cMapPacked: true, standardFontDataUrl: new URL("../dist/vendor/pdfjs/standard_fonts/", location.href).href });
      try {
        const pdf = await Promise.race([task.promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Cover timeout")), 15e3))]);
        book.metadata = await readBookMetadata({ pdf, numPages: pdf.numPages }, book.metadata);
        const page = await pdf.getPage(1);
        const raw = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(1, 320 / raw.width, 480 / raw.height) });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        book.cover = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
      } finally {
        await task.destroy();
      }
    } else if (["html", "fb2"].includes(book.format) && file.size <= 16 * 1048576) {
      const doc = new DOMParser().parseFromString(new TextDecoder().decode(await file.arrayBuffer()), book.format === "fb2" ? "application/xml" : "text/html");
      book.metadata = { ...book.format === "fb2" ? fb2Metadata(doc) : cleanMetadata({ title: doc.title, author: doc.querySelector("meta[name=author]")?.content, description: doc.querySelector("meta[name=description]")?.content, language: doc.documentElement.lang }), ...book.metadata };
    } else if (["epub", "cbz"].includes(book.format)) {
      const { extractArchive } = await import("../dist/js/sela.archive.js");
      const files = extractArchive(new Uint8Array(await file.arrayBuffer()));
      let target;
      if (book.format === "cbz") {
        const comic = Object.keys(files).find((k) => /(^|\/)ComicInfo\.xml$/i.test(k));
        if (comic) book.metadata = { ...comicMetadata(new DOMParser().parseFromString(new TextDecoder().decode(files[comic]), "application/xml")), ...book.metadata };
      }
      if (book.format === "cbz") target = Object.keys(files).filter((k) => /\.(jpe?g|png|webp)$/i.test(k)).sort((a, b) => a.localeCompare(b, void 0, { numeric: true }))[0];
      else {
        const xml = new TextDecoder().decode(files["META-INF/container.xml"] || new Uint8Array());
        const doc = new DOMParser().parseFromString(xml, "application/xml");
        const opf = doc.querySelector("rootfile")?.getAttribute("full-path");
        if (opf && files[opf]) {
          const content = new DOMParser().parseFromString(new TextDecoder().decode(files[opf]), "application/xml");
          book.metadata = { ...epubMetadata(content), ...book.metadata };
          const id = [...content.querySelectorAll("meta")].find((m) => m.getAttribute("name") === "cover")?.getAttribute("content");
          const item = [...content.querySelectorAll("item")].find((i) => i.getAttribute("id") === id || i.getAttribute("properties")?.split(/\s+/).includes("cover-image"));
          if (item) {
            const resolved = new URL(item.getAttribute("href"), `https://book.invalid/${opf}`);
            target = decodeURIComponent(resolved.pathname.slice(1));
          }
        }
      }
      if (target && files[target] && /\.(jpe?g|png|webp)$/i.test(target)) book.cover = new Blob([files[target]], { type: /\.png$/i.test(target) ? "image/png" : /\.webp$/i.test(target) ? "image/webp" : "image/jpeg" });
    }
    if (book.cover || book.metadata) {
      const patch = { metadata: book.metadata };
      if (book.cover) {
        patch.coverBytes = await book.cover.arrayBuffer();
        patch.coverType = book.cover.type;
      }
      await updateBook(book.id, patch);
      await refresh();
    }
  } catch {
  }
}
let importing = false;
async function addFiles(files, metadata, cover) {
  if (importing) return;
  if (files.length > 100) {
    status(t("Choose up to 100 books per batch.", "Pilih maksimal 100 buku dalam satu batch."));
    return;
  }
  importing = true;
  $("#books").disabled = true;
  $("#add-books").disabled = true;
  let added = 0, duplicates = 0;
  const errors = [], imported = [];
  try {
    for (const file of [...files].slice(0, 100)) {
      status(t("Adding ", "Menambahkan ") + file.name);
      try {
        const result = await importBook(file);
        if (metadata) {
          result.book.metadata = result.duplicate ? { ...cleanMetadata(metadata), ...result.book.metadata } : { ...result.book.metadata, ...cleanMetadata(metadata) };
          if (cover && (!result.duplicate || !result.book.cover)) result.book.cover = cover;
          await writeBook(result.book);
        }
        imported.push(result.book);
        if (result.duplicate) duplicates++;
        else added++;
        await refresh();
        if (!result.duplicate) await thumbnail(file, result.book);
      } catch (error) {
        errors.push(file.name + ": " + error.message);
      }
    }
    status(`${added} ${t("added", "ditambahkan")} \xB7 ${duplicates} ${t("already on shelf", "sudah di rak")}${errors.length ? " \xB7 " + errors.join(" \xB7 ") : ""}`);
  } finally {
    importing = false;
    $("#books").disabled = false;
    $("#add-books").disabled = false;
    $("#books").value = "";
  }
  return imported;
}
$("#add-books").onclick = () => {
  $("#books").accept = BOOK_ACCEPT;
  $("#books").click();
};
$("#books").accept = BOOK_ACCEPT;
$("#books").onchange = () => {
  $("#books").accept = BOOK_ACCEPT;
  void addFiles($("#books").files);
};
$("#books").addEventListener("cancel", () => $("#books").accept = BOOK_ACCEPT);
export async function receiveFiles(files) {
  const imported = await addFiles(files);
  if (imported?.[0]) try {
    await openBook(imported[0]);
  } catch (error) {
    status(error.message);
  }
  return imported;
}
document.addEventListener("sela:incoming-files", (event) => {
  void receiveFiles(event.detail).catch((error) => status(error.message));
});
for (const event of ["dragenter", "dragover"]) $("#drop-zone").addEventListener(event, (e) => {
  e.preventDefault();
  $("#drop-zone").classList.add("is-dragging");
});
for (const event of ["dragleave", "drop"]) $("#drop-zone").addEventListener(event, (e) => {
  e.preventDefault();
  $("#drop-zone").classList.remove("is-dragging");
  if (event === "drop") addFiles(e.dataTransfer.files);
});
async function addSample(sample) {
  const response = await fetch(sample.url);
  if (!response.ok) throw new Error("Sample unavailable");
  const blob = await response.blob(), type = blob.type || ({ pdf: "application/pdf", epub: "application/epub+zip", cbz: "application/vnd.comicbook+zip" }[sample.format] || "application/octet-stream");
  const imported = await addFiles([new File([blob], sample.title + "." + sample.format, { type })], sample.metadata);
  return imported?.[0];
}
async function readSample(sample, saveFirst = false) {
  if (saveFirst) {
    const book = await addSample(sample);
    if (!book) throw new Error(t("The sample could not be saved to your shelf. Check your connection and available storage.", "Contoh buku belum bisa disimpan ke rak. Periksa koneksi dan ruang penyimpanan."));
    await openBook(book);
    return;
  }
  viewer?.destroy();
  viewer = new Sela({ url: sample.url, format: sample.format, title: sample.title, metadata: sample.metadata, id: sample.id, storagePrefix: "sela-library:", persistPreferences: true, appContext: true, mode: matchMedia("(max-width:767px)").matches ? "single" : "book", language: localeBase(lang) === "id" ? "id" : "en", theme: document.documentElement.dataset.theme, soundEnabled: false });
  await viewer.open();
  if (readPersonal().quiet) viewer.overlay?.classList.add("sela-controls-hidden");
  if (mobile) await bindReaderHistory(viewer);
}
$("#sample").onclick = () => document.dispatchEvent(new Event("sela:browse"));
window.addEventListener("pagehide", () => {
  viewer?.destroy();
  urls.forEach((url) => URL.revokeObjectURL(url));
});
localize();
experience = mountLibraryExperience({ mobile, t, status, refresh, openBook, addSample, readSample, addFiles });
export const libraryReady = refresh();
libraryReady.catch((error) => status(error.message));
console.info("Sela private library \xB7 Bobby Fajar Christian \xB7 https://bobbyfajarc.github.io/ \xB7 https://github.com/bobbyfch/sela");
async function releaseCheck() {
  const button2 = $("#check-update");
  button2.disabled = true;
  $("#update-status").textContent = t("Checking GitHub\u2026", "Memeriksa GitHub\u2026");
  try {
    const current = VERSION;
    const result = await SelaUpdates.check(current);
    $("#update-link").hidden = !result.available;
    $("#update-link").href = result.url;
    const copy = result.available ? t("Sela " + result.version + " is available. Use the update notice when ready; close other Sela windows before applying.", "Sela " + result.version + " tersedia. Gunakan pemberitahuan pembaruan setelah siap; tutup jendela Sela lainnya sebelum menerapkan.") : t("You have the current release (" + current + ").", "Rilis saat ini sudah terpasang (" + current + ").");
    $("#update-status").textContent = copy;
    notify(copy, result.available ? "success" : "info");
  } catch {
    $("#update-status").textContent = t("Could not check. Try again online, or open Releases.", "Belum bisa memeriksa. Coba saat online, atau buka Releases.");
    $("#update-link").hidden = false;
    $("#update-link").href = "https://github.com/bobbyfch/sela/releases/latest";
    notify($("#update-status").textContent, "error");
  } finally {
    button2.disabled = false;
  }
}
$("#check-update").onclick = () => void releaseCheck();
