// Generated from app/library/discovery.ts by npm run build. Do not edit.
import { catalogSources } from "./external-catalogs.js";
import { node, fetchFile } from "./network.js";
import { coverFor } from "./open-catalog.js";
import { searchBooks, acquireBook } from "./book-sources.js";
import { bottomSheet, iconAction, notify } from "./controls.js";
import { catalogCoverUrl } from "./covers.js";
export function mountDiscovery(parent, { t, status, addFiles, openBook }) {
  const description = node(parent, "p", t("Discover open books. Read here or keep an offline copy.", "Temukan buku terbuka. Baca di sini atau simpan offline."));
  const form = node(parent, "form"), source = node(form, "select");
  source.setAttribute("aria-label", t("Book source", "Sumber buku"));
  for (const [value, label] of catalogSources) {
    const option = node(source, "option", label);
    option.value = value;
  }
  source.value = document.documentElement.lang === "id" ? "wikisource" : "gitenberg";
  const address = node(form, "input");
  address.type = "url";
  address.hidden = address.disabled = true;
  address.placeholder = "https://\u2026/opds";
  address.setAttribute("aria-label", t("OPDS catalog URL", "URL katalog OPDS"));
  try {
    address.value = localStorage.getItem("sela-opds-url") || "";
  } catch {
  }
  const query = node(form, "input");
  query.type = "search";
  query.maxLength = 100;
  query.placeholder = t("Search titles or authors", "Cari judul atau penulis");
  query.setAttribute("aria-label", query.placeholder);
  const submit = node(form, "button", t("Search", "Cari"));
  submit.type = "submit";
  iconAction(submit, "search", t("Search", "Cari"));
  const feedback = node(parent, "p");
  feedback.setAttribute("role", "status");
  const viewToolbar = node(parent, "div", "", "open-view-toolbar");
  viewToolbar.setAttribute("role", "group");
  viewToolbar.setAttribute("aria-label", t("Explore view", "Tampilan jelajah"));
  let viewMode = "bookshelf";
  try {
    viewMode = localStorage.getItem("sela-library:explore-view") === "grid" ? "grid" : "bookshelf";
  } catch {
  }
  const viewButtons = /* @__PURE__ */ new Map();
  for (const [value, icon, labelEn, labelId] of [["bookshelf", "shelf", "Bookshelf view", "Tampilan rak"], ["grid", "grid", "Grid view", "Tampilan kisi"]]) {
    const button = node(viewToolbar, "button");
    button.type = "button";
    button.className = "open-view-toggle";
    iconAction(button, icon, t(labelEn, labelId));
    button.setAttribute("aria-pressed", String(value === viewMode));
    button.onclick = () => {
      viewMode = value;
      results.dataset.viewMode = value;
      try {
        localStorage.setItem("sela-library:explore-view", value);
      } catch {
      }
      for (const [key, item] of viewButtons) item.setAttribute("aria-pressed", String(key === value));
    };
    viewButtons.set(value, button);
  }
  const results = node(parent, "div", "", "open-results");
  results.dataset.viewMode = viewMode;
  const more = node(parent, "button", t("More books", "Buku lainnya"));
  more.type = "button";
  more.hidden = true;
  const sourceLink = node(parent, "a", t("Visit this source", "Kunjungi sumber"));
  sourceLink.target = "_blank";
  sourceLink.rel = "noopener noreferrer";
  sourceLink.hidden = true;
  const terms = node(parent, "small", t("Open editions vary in completeness and copyright by country. Source credits remain in each book. Public APIs may limit requests.", "Kelengkapan edisi dan hak cipta berbeda menurut sumber dan negara. Kredit tetap disertakan. API publik dapat membatasi permintaan."));
  let controller, timer, page = 1, continuation, books = [], urls = [], imageObservers = [], destroyed = false, sequence = 0;
  function render() {
    imageObservers.forEach((observer) => observer.disconnect());
    imageObservers = [];
    urls.forEach(URL.revokeObjectURL);
    urls = [];
    results.replaceChildren();
    for (const book of books) {
      const card = node(results, "article", "", "open-book"), cover = coverFor(book), fallback = URL.createObjectURL(cover), remote = catalogCoverUrl(book.coverUrl);
      urls.push(fallback);
      const coverButton = node(card, "button", "", "open-book-cover");
      coverButton.type = "button";
      coverButton.setAttribute("aria-label", t("Open book details: ", "Buka detail buku: ") + book.title);
      const image = node(coverButton, "img");
      image.src = fallback;
      image.alt = "";
      image.loading = "eager";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      if (remote) {
        let requested = false;
        const requestRemote = () => {
          if (requested) return;
          requested = true;
          image.src = remote;
        };
        if ("IntersectionObserver" in window) {
          const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.target === image && entry.isIntersecting)) {
              observer.disconnect();
              requestRemote();
            }
          }, { rootMargin: "240px 0px" });
          observer.observe(image);
          imageObservers.push(observer);
        } else image.addEventListener("load", requestRemote, { once: true });
        image.onerror = () => {
          if (image.src !== fallback) image.src = fallback;
        };
      }
      const copy = node(card, "div", "", "open-book-copy"), heading = node(copy, "div", "", "open-book-heading"), title = node(heading, "h4", book.title);
      title.title = book.title;
      const details = node(heading, "button");
      details.type = "button";
      iconAction(details, "info", t("Book information", "Informasi buku"));
      details.className = "explore-info icon-action";
      node(copy, "p", book.author);
      node(copy, "small", book.genre + (book.language ? " \xB7 " + book.language.toUpperCase() : ""));
      const actions = node(copy, "div", "", "catalog-actions");
      const openDetails = () => {
        const body = document.createElement("div");
        body.className = "personal-sheet";
        const coverImage = node(body, "img");
        coverImage.src = image.src;
        coverImage.alt = "";
        coverImage.loading = "lazy";
        coverImage.referrerPolicy = "no-referrer";
        coverImage.style.cssText = "max-width:110px;justify-self:center";
        node(body, "h3", book.title);
        node(body, "p", book.author || t("Author not provided", "Penulis belum tersedia"));
        node(body, "p", book.description || book.genre || "");
        node(body, "small", book.rights || t("Check this edition\u2019s rights at the source.", "Periksa hak penggunaan edisi di sumber."));
        node(body, "small", book.source || source.value);
        for (const action of actions.querySelectorAll("button,a")) {
          const clone = action.cloneNode(true);
          if (action instanceof HTMLButtonElement) clone.onclick = () => {
            modal.close();
            action.click();
          };
          body.append(clone);
        }
        const modal = bottomSheet(book.title, body);
        modal.element.addEventListener("close", () => modal.destroy(), { once: true });
        modal.open();
      };
      details.onclick = openDetails;
      coverButton.onclick = openDetails;
      if (book.external && !book.url && !book.pageid) {
        const link = node(actions, "a", t("View edition", "Lihat edisi"));
        const url = new URL(book.external);
        if (url.protocol === "https:") {
          link.href = url.href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        continue;
      }
      if (book.navigation) {
        const browse = node(actions, "button", t("Open collection", "Buka koleksi"));
        browse.type = "button";
        browse.onclick = () => {
          address.value = book.navigation;
          void load();
        };
        continue;
      }
      const read = node(actions, "button", t("Read", "Baca")), save = node(actions, "button", t("Save offline", "Simpan offline"));
      read.type = save.type = "button";
      iconAction(read, "read", t("Read", "Baca"));
      iconAction(save, "download", t("Save offline", "Simpan offline"));
      async function acquire(open) {
        read.disabled = save.disabled = true;
        const request = new AbortController(), timeout = setTimeout(() => request.abort(), 12e4);
        feedback.textContent = t("Preparing this edition\u2026", "Menyiapkan edisi ini\u2026");
        try {
          const file = book.url ? await fetchFile(book.url, book.title + "." + (book.format || "txt"), { signal: request.signal, headers: book.source === "opds" ? authHeaders(book.url) : {} }) : await acquireBook(book, { signal: request.signal });
          if (book.format) {
            const { detectBookFormat } = await import("./file-format.js");
            if (await detectBookFormat(file) !== book.format) throw Error("Downloaded content does not match the catalog format.");
          }
          if (open) {
            await openBook({ previewFile: file, format: book.format, name: book.title, metadata: { title: book.title, author: book.author, rights: book.rights } });
            feedback.textContent = t("Preview \xB7 download to keep on your shelf.", "Pratinjau \xB7 unduh untuk menyimpan di rak.");
            return;
          }
          const added = await addFiles([file], { title: book.title, author: book.author, year: book.year, language: book.language, publisher: book.genre, rights: book.rights, description: book.description || book.genre }, cover);
          if (!added?.length) throw Error(t("Import did not finish.", "Impor belum selesai."));
          if (open) await openBook(added[0]);
          feedback.textContent = t("Saved to your shelf.", "Tersimpan di rakmu.");
        } catch (e) {
          feedback.textContent = t("Could not open this edition. ", "Edisi belum dapat dibuka. ") + (e.name === "AbortError" ? t("Download timed out. Try again.", "Unduhan terlalu lama. Coba lagi.") : e.message);
          status(feedback.textContent);
        } finally {
          clearTimeout(timeout);
          read.disabled = save.disabled = false;
        }
      }
      read.onclick = () => void acquire(true);
      save.onclick = () => void acquire(false);
    }
  }
  async function load(append = false) {
    sourceLink.hidden = true;
    clearTimeout(timer);
    controller?.abort();
    controller = new AbortController();
    const request = controller, current = ++sequence, timeout = setTimeout(() => request.abort(), 2e4);
    submit.disabled = more.disabled = true;
    feedback.textContent = t("Finding books\u2026", "Mencari buku\u2026");
    if (!append) {
      page = 1;
      continuation = void 0;
    }
    try {
      let data;
      if (source.value === "local") {
        const response = await fetch(new URL("./public-books.json", import.meta.url), { signal: controller.signal });
        if (!response.ok) throw Error("Collection unavailable");
        const all = await response.json(), needle = query.value.toLocaleLowerCase();
        data = { books: all.filter((b) => (b.title + " " + b.author + " " + b.genre).toLocaleLowerCase().includes(needle)), next: false };
      } else if (source.value === "opds") {
        const { opdsBooks } = await import("./opds.js");
        data = await opdsBooks(append ? continuation : address.value, { query: query.value.trim(), signal: controller.signal, headers: authHeaders(append ? continuation : address.value) });
        try {
          localStorage.setItem("sela-opds-url", address.value);
        } catch {
        }
      } else data = await searchBooks({ source: source.value, query: query.value.trim(), page, continuation, signal: controller.signal });
      if (current !== sequence || destroyed) return;
      books = append ? [...books, ...data.books.filter((b) => !books.some((old) => old.id === b.id))] : data.books;
      continuation = data.continuation;
      more.hidden = !data.next;
      feedback.textContent = books.length + " " + t("books shown", "buku ditampilkan") + (data.total != null ? " \xB7 " + data.total + " " + t("found", "ditemukan") : "");
      render();
    } catch (e) {
      if (current !== sequence || destroyed) return;
      feedback.textContent = t("Source unavailable. Retry or choose Selected classics.", "Sumber belum tersedia. Coba lagi atau pilih Selected classics.") + (source.value === "opds" ? " " + t("Catalog must allow browser access (CORS), with HTTPS. Optional credentials stay in this session.", "Katalog harus mengizinkan akses browser (CORS), menggunakan HTTPS. Kredensial opsional hanya untuk sesi ini.") : "");
      notify(feedback.textContent, "error");
      sourceLink.href = { wikisource: "https://id.wikisource.org/", gitenberg: "https://github.com/GITenberg", gutendex: "https://www.gutenberg.org/", openlibrary: "https://openlibrary.org/", doab: "https://directory.doabooks.org/", standard: "https://standardebooks.org/" }[source.value] || (source.value.startsWith("wiki-") ? "https://" + source.value.slice(5) + ".wikisource.org/" : source.value === "opds" ? address.value : "");
      try {
        const u = new URL(sourceLink.href);
        if (u.protocol !== "https:" || u.username || u.password) sourceLink.removeAttribute("href");
      } catch {
        sourceLink.removeAttribute("href");
      }
      sourceLink.hidden = !sourceLink.getAttribute("href");
      more.hidden = true;
      if (!append) {
        books = [];
        render();
      }
    } finally {
      clearTimeout(timeout);
      if (current === sequence) {
        submit.disabled = more.disabled = false;
      }
    }
  }
  form.onsubmit = (e) => {
    e.preventDefault();
    void load();
  };
  source.onchange = () => {
    address.hidden = address.disabled = source.value !== "opds";
    if (source.value !== "opds" || address.value) void load();
    else {
      clearTimeout(timer);
      controller?.abort();
      sequence++;
      submit.disabled = more.disabled = false;
      books = [];
      render();
      feedback.textContent = t("Paste an open OPDS catalog URL, then Search.", "Tempel URL katalog OPDS terbuka, lalu Cari.");
      more.hidden = true;
    }
  };
  query.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void load(), 900);
  };
  more.onclick = () => {
    page++;
    void load(true);
  };
  const chip = node(form, "button", source.selectedOptions[0]?.textContent || "Sources");
  chip.type = "button";
  chip.className = "catalog-source-chip";
  const sourceBody = document.createElement("div");
  sourceBody.className = "catalog-source-options";
  sourceBody.append(source, address);
  const profiles = node(sourceBody, "select");
  profiles.setAttribute("aria-label", t("My saved catalogs", "Katalog tersimpanku"));
  function readProfiles() {
    try {
      const rows = JSON.parse(localStorage.getItem("sela-library:catalogs") || "[]");
      return Array.isArray(rows) ? rows.filter((r) => r && typeof r.name === "string" && typeof r.url === "string").slice(0, 30) : [];
    } catch {
      return [];
    }
  }
  function renderProfiles() {
    profiles.replaceChildren();
    node(profiles, "option", t("Saved catalogs", "Katalog tersimpan")).value = "";
    for (const p of readProfiles()) node(profiles, "option", p.name).value = p.url;
  }
  renderProfiles();
  profiles.onchange = () => {
    if (!profiles.value) return;
    source.value = "opds";
    address.value = profiles.value;
    source.dispatchEvent(new Event("change"));
  };
  const name = node(sourceBody, "input");
  name.placeholder = t("Catalog name", "Nama katalog");
  name.maxLength = 40;
  name.setAttribute("aria-label", name.placeholder);
  const saveProfile = node(sourceBody, "button", t("Save catalog", "Simpan katalog"));
  saveProfile.type = "button";
  saveProfile.onclick = () => {
    try {
      const u = new URL(address.value);
      if (u.protocol !== "https:" || u.username || u.password || !name.value.trim()) throw Error("Use a valid HTTPS catalog URL and give it a name.");
      const rows = readProfiles().filter((p) => p.url !== u.href);
      rows.push({ name: name.value.trim(), url: u.href });
      localStorage.setItem("sela-library:catalogs", JSON.stringify(rows.slice(-30)));
      renderProfiles();
      notify(t("Catalog saved on this device.", "Katalog tersimpan di perangkat ini."), "success");
    } catch (e) {
      feedback.textContent = e.message;
      notify(e.message, "error");
    }
  };
  const username = node(sourceBody, "input"), password = node(sourceBody, "input");
  username.placeholder = t("Username \xB7 optional", "Username \xB7 opsional");
  username.setAttribute("aria-label", username.placeholder);
  password.type = "password";
  password.placeholder = t("Password \xB7 session only", "Password \xB7 sesi ini saja");
  password.setAttribute("aria-label", password.placeholder);
  let authOrigin = "";
  const rememberOrigin = () => {
    try {
      authOrigin = new URL(address.value).origin;
    } catch {
      authOrigin = "";
    }
  };
  username.addEventListener("input", rememberOrigin);
  password.addEventListener("input", rememberOrigin);
  function authHeaders(target = address.value) {
    let same = false;
    try {
      same = !!authOrigin && new URL(target).origin === authOrigin;
    } catch {
    }
    return same && (username.value || password.value) ? { Authorization: "Basic " + btoa(unescape(encodeURIComponent(username.value + ":" + password.value))) } : {};
  }
  const find = node(sourceBody, "button", t("Search this catalog", "Cari katalog ini"));
  find.type = "button";
  find.onclick = () => {
    sourceSheet.close();
    void load();
  };
  const sourceSheet = bottomSheet(t("Book sources", "Sumber buku"), sourceBody);
  chip.onclick = () => sourceSheet.open();
  source.addEventListener("change", () => {
    chip.textContent = source.selectedOptions[0].textContent;
  });
  void load();
  window.addEventListener("pagehide", () => {
    destroyed = true;
    controller?.abort();
    clearTimeout(timer);
    urls.forEach(URL.revokeObjectURL);
    sourceSheet.destroy();
  }, { once: true });
  return { localize() {
    description.textContent = t("Discover open books. Read here or keep an offline copy.", "Temukan buku terbuka. Baca di sini atau simpan offline.");
    query.placeholder = t("Search titles or authors", "Cari judul atau penulis");
    query.setAttribute("aria-label", query.placeholder);
    source.setAttribute("aria-label", t("Book source", "Sumber buku"));
    iconAction(submit, "search", t("Search", "Cari"));
    more.textContent = t("More books", "Buku lainnya");
    render();
  } };
}
