// Generated from app/library/library-experience.ts by npm run build. Do not edit.
import { VERSION } from "./version.js";
import { mountAdvanced } from "./advanced.js";
import { mountPersonal } from "./personal.js";
import { showBookInfo } from "./book-info.js";
import { samples } from "./catalog.js";
import { writeBook, getFile, listCollections } from "./storage.js";
import { showCollections, mountShelfControls } from "./collections.js";
import { mountPalettes, mountOledToggle, initializePalette } from "./themes.js";
import { mountReadingDesk } from "./reading-desk.js";
import { mountWeather } from "./weather.js";
import { mountAtmosphere, readingNote } from "./home-atmosphere.js";
import { mountHomeWidgets } from "./home-widgets.js";
import { animateDialog, controlIcon, iconAction } from "./controls.js";
const $ = (s) => document.querySelector(s);
const paths = { home: "m3 11 9-8 9 8v10H3Zm6 10v-8h6v8", shelf: "M4 3v18m5-18v18m5-18v18m4-17 3 16M2 21h20", browse: "M3 4h7a3 3 0 0 1 3 3v14a5 5 0 0 0-5-2H3Zm18 0h-5a3 3 0 0 0-3 3v14a5 5 0 0 1 5-2h3Z", settings: "M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-8 0v6", plus: "M12 4v16M4 12h16" };
function svg(name) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  node.setAttribute("viewBox", "0 0 24 24");
  node.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(node.namespaceURI, "path");
  path.setAttribute("d", paths[name]);
  node.append(path);
  return node;
}
export function mountLibraryExperience({ mobile, t, status, refresh, openBook, readSample, addSample, addFiles }) {
  if (mobile) initializePalette();
  const selected = /* @__PURE__ */ new Set();
  let items = [], busy = false, page = "home", onlineCatalog, glassNavigation;
  const labels = [], recentUrls = [];
  const el = (tag2, className, parent) => {
    const node = document.createElement(tag2);
    if (className) node.className = className;
    if (parent) parent.append(node);
    return node;
  };
  const text = (node, en, id) => {
    labels.push({ node, en, id });
    node.textContent = t(en, id);
    return node;
  };
  const actionIcons = { "Read sample": "read", "Save offline": "download", "Book information": "info", "Download full backup": "download", "Share backup": "share", "Protect offline storage": "shield", "Favorite": "favorite", "Finished": "check", "Collection": "collection", "Remove selected": "remove", "Select all shown": "check", "Clear": "close", "Reset defaults": "undo", "Undo batch removal": "undo", "Device picker fallback": "storage" };
  const action = (en, id, fn, parent) => {
    const b = el("button", "experience-button", parent);
    b.type = "button";
    const name = actionIcons[en];
    if (parent.closest?.(".settings-page")) {
      b.classList.add("settings-action-row");
      const lead = el("span", "settings-leading-icon", b);
      lead.append(controlIcon(name || "sparkles"));
      const label = el("span", "settings-action-label", b);
      text(label, en, id);
      const trail = el("span", "settings-trailing-icon", b);
      trail.append(controlIcon("chevron"));
    } else if (name) {
      iconAction(b, name, t(en, id));
      labels.push({ node: b, en, id, icon: name });
    } else text(b, en, id);
    b.onclick = () => Promise.resolve(fn()).catch((e) => status(e.message));
    return b;
  };
  function settingsRow(parent, icon, en, id, descriptionEn, descriptionId, control, tag2 = "div") {
    const row = el(tag2, "settings-row", parent);
    const lead = el("span", "settings-leading-icon", row);
    lead.append(controlIcon(icon));
    const copy = el("span", "settings-row-copy", row);
    text(el("strong", "", copy), en, id);
    text(el("small", "", copy), descriptionEn, descriptionId);
    const slot = el("span", "settings-row-control", row);
    slot.append(control);
    return row;
  }
  function decorateSettingsLink(link, icon) {
    const current = link.textContent || "", tracked = labels.find((item) => item.node === link);
    link.classList.add("settings-action-row");
    link.replaceChildren(controlIcon(icon));
    const label = el("span", "settings-action-label", link);
    label.textContent = current;
    if (tracked) tracked.node = label;
    link.append(controlIcon("chevron"));
  }
  function decorateSettingsHeading(card, icon) {
    const heading = card.querySelector(":scope>h3");
    if (!heading || heading.dataset.settingsDecorated) return;
    const current = heading.textContent || "", label = labels.find((item) => item.node === heading);
    heading.classList.add("settings-card-heading");
    heading.dataset.settingsDecorated = "true";
    heading.replaceChildren();
    const lead = el("span", "settings-section-icon", heading);
    lead.append(controlIcon(icon));
    const title = el("span", "settings-heading-label", heading);
    title.textContent = current;
    if (label) label.node = title;
  }
  const main = $("main");
  const intro = $(".room-intro"), library = $(".library"), info = $(".library-info");
  const home = el("section", "app-page home-page tw:relative tw:isolate tw:min-w-0 tw:px-4 tw:py-5 tw:sm:px-6 tw:sm:py-7 tw:lg:px-9 tw:lg:py-9");
  home.dataset.page = "home";
  main.insertBefore(home, library);
  if (mobile) {
    home.append(intro);
    const welcome = intro.querySelector(":scope > div:first-of-type");
    const install = intro.querySelector("#install-mobile-app");
    const offline = intro.querySelector("#mobile-offline-status");
    if (welcome) {
      if (install) welcome.append(install);
      if (offline) welcome.append(offline);
    }
  } else home.hidden = true;
  const continueSection = el("section", "continue-section", home);
  text(el("h2", "", continueSection), "Continue reading", "Lanjut membaca");
  const continueList = el("div", "continue-list", continueSection);
  const homeCatalog = el("section", "catalog-section home-sample-section", home);
  text(el("h2", "", homeCatalog), "A little book to start", "Bacaan kecil untuk memulai");
  const browse = el("section", "app-page browse-page", main);
  browse.dataset.page = "browse";
  text(el("h2", "tw:mb-1 tw:text-2xl tw:font-bold tw:tracking-tight tw:text-sela-ink", browse), "Explore", "Jelajah");
  text(el("p", "section-description tw:mb-5 tw:max-w-2xl tw:text-sm tw:leading-6 tw:text-sela-muted", browse), "Find a book for today, browse new releases, or let Sela surprise you.", "Temukan bacaan hari ini, jelajahi rilisan baru, atau biarkan Sela memberi kejutan.");
  function catalog(parent, saveBeforeRead = false) {
    const list = el("div", "catalog-list tw:grid tw:w-full tw:grid-cols-1 tw:gap-4", parent);
    for (const sample of samples) {
      const card = el("article", "catalog-book tw:relative tw:grid tw:min-w-0 tw:grid-cols-[80px_minmax(0,1fr)] tw:items-center tw:gap-4 tw:rounded-3xl tw:border tw:border-sela-line tw:bg-sela-surface/90 tw:p-4 tw:shadow-sm tw:md:max-w-[720px] tw:md:grid-cols-[112px_minmax(0,1fr)] tw:md:gap-5 tw:md:p-5", list);
      const image = el("img", "tw:aspect-[2/3] tw:w-full tw:shrink-0 tw:rounded-2xl tw:object-cover tw:shadow-md", card);
      image.src = sample.cover;
      image.alt = "";
      image.loading = "lazy";
      const copy = el("div", "tw:flex tw:min-w-0 tw:flex-col tw:items-start", card);
      el("h3", "tw:mb-1 tw:break-words tw:text-base tw:font-bold tw:leading-snug tw:tracking-tight tw:text-sela-ink tw:md:text-lg", copy).textContent = sample.title;
      const meta = el("small", "catalog-meta tw:text-xs tw:text-sela-muted", copy);
      meta.textContent = [sample.metadata?.author, sample.metadata?.year].filter(Boolean).join(" \xB7 ");
      action("Book information", "Informasi buku", () => showBookInfo(sample.metadata, { t, format: sample.format }), copy).classList.add("catalog-info");
      const description = el("p", "tw:my-1 tw:text-sm tw:leading-6 tw:text-sela-muted", copy);
      labels.push({ node: description, en: sample.description.en, id: sample.description.id });
      description.textContent = t(sample.description.en, sample.description.id);
      const actions = el("div", "catalog-actions tw:col-span-2 tw:mt-2 tw:flex tw:w-full tw:flex-nowrap tw:items-center tw:gap-2 tw:md:col-span-1", copy), read = action("Read sample", "Baca contoh", () => readSample(sample, saveBeforeRead), actions), save = action("Save offline", "Simpan offline", () => addSample(sample), actions);
      for (const button of [read, save]) button.classList.add("tw:w-auto", "tw:min-w-0", "tw:flex-1", "tw:whitespace-nowrap");
      read.classList.add("tw:md:w-fit", "tw:md:min-w-28", "tw:md:flex-none", "tw:md:px-4");
      save.classList.add("tw:md:w-fit", "tw:md:flex-none");
    }
    return list;
  }
  catalog(homeCatalog, true);
  const online = el("section", "open-catalog tw:min-w-0 tw:space-y-4 tw:md:space-y-5", browse);
  const onlineHeading = el("h3", "tw:mb-0 tw:text-lg tw:font-semibold tw:tracking-tight tw:text-sela-ink", online);
  text(onlineHeading, "Books from open shelves", "Buku dari rak terbuka");
  let loadingCatalog = false;
  async function discover() {
    if (onlineCatalog || loadingCatalog) return;
    loadingCatalog = true;
    try {
      const { mountDiscovery } = await import("./discovery.js");
      onlineCatalog = mountDiscovery(online, { t, status, addFiles, openBook });
    } finally {
      loadingCatalog = false;
    }
  }
  const empty = $("#empty");
  empty.querySelector("img").replaceWith(svg("browse"));
  $("#sample").hidden = true;
  const settings = el("section", "app-page settings-page", main);
  settings.dataset.page = "settings";
  text(el("h2", "", settings), "Settings", "Pengaturan");
  let settingsQuoteIndex = Math.floor(Math.random() * 1e4), settingsGreeting, settingsQuote, settingsQuoteSource;
  function updateSettingsWelcome() {
    if (!mobile || !settingsGreeting) return;
    const hour = (/* @__PURE__ */ new Date()).getHours(), english = hour >= 5 && hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night", indonesian = hour >= 5 && hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";
    settingsGreeting.textContent = t(english, indonesian);
    const note = readingNote(t, settingsQuoteIndex);
    settingsQuote.textContent = "\u201C" + note.quote + "\u201D";
    settingsQuoteSource.textContent = note.source;
  }
  if (mobile) {
    const welcome = el("section", "settings-welcome", settings), identity = el("div", "settings-welcome-identity", welcome), avatar = el("span", "settings-avatar", identity);
    avatar.setAttribute("aria-hidden", "true");
    avatar.append(controlIcon("read"));
    const copy = el("div", "settings-welcome-copy", identity);
    text(el("small", "settings-eyebrow", copy), "YOUR READING SPACE", "RUANG BACA PRIBADIMU");
    settingsGreeting = el("h3", "", copy);
    const subtitle = el("p", "", copy);
    text(subtitle, "A little space to make reading feel like yours.", "Ruang kecil untuk mengatur bacaan dengan caramu.");
    const reflection = el("details", "settings-welcome-reflection", welcome), reflectionHeading = el("summary", "", reflection);
    text(reflectionHeading, "A thought for today", "Renungan hari ini");
    const noteCopy = el("div", "", reflection);
    settingsQuote = el("p", "", noteCopy);
    settingsQuoteSource = el("span", "settings-quote-source", noteCopy);
    const another = el("button", "settings-quote-refresh", reflection);
    another.type = "button";
    iconAction(another, "refresh", t("Another quote", "Kutipan lainnya"));
    another.onclick = () => {
      settingsQuoteIndex++;
      updateSettingsWelcome();
      settingsQuote.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: matchMedia("(prefers-reduced-motion:reduce)").matches ? 0 : 180 });
    };
    updateSettingsWelcome();
    document.addEventListener("sela:personal", updateSettingsWelcome);
    document.addEventListener("sela:quote-source", updateSettingsWelcome);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) updateSettingsWelcome();
    });
    const appearance = el("section", "settings-card appearance-settings", settings);
    text(el("h3", "", appearance), "Language & display", "Bahasa & tampilan");
    for (const [id, en, ind, subEn, subId, icon] of [["language", "Language", "Bahasa", "Set the language for Sela.", "Atur bahasa untuk Sela.", "journal"], ["check-update", "Updates", "Pembaruan", "Check for a newer version.", "Periksa versi terbaru.", "refresh"]]) {
      const control = id === "language" ? (() => {
        const topbar = document.querySelector("#language"), clone = topbar.cloneNode(true);
        clone.id = "settings-language";
        clone.className = "settings-language-control";
        clone.addEventListener("change", () => {
          topbar.value = clone.value;
          topbar.dispatchEvent(new Event("change", { bubbles: true }));
        });
        topbar.addEventListener("change", () => {
          clone.value = topbar.value;
        });
        return clone;
      })() : document.getElementById(id);
      settingsRow(appearance, icon, en, ind, subEn, subId, control);
    }
    mountOledToggle(appearance, t);
    const install = document.getElementById("install-mobile-app");
    if (install) {
      install.classList.add("home-install-action");
      install.replaceChildren(controlIcon("download"));
      const label = el("span", "", install);
      text(label, "Install Sela on this device", "Pasang Sela di perangkat ini");
    }
    info.open = false;
  }
  if (mobile) {
    const palette = el("section", "settings-card appearance-materials", settings);
    text(el("h3", "", palette), "Color palettes", "Palet warna");
    const sync = mountPalettes(palette, t);
    document.addEventListener("sela:palette", sync);
  }
  const defaults = el("section", "settings-card", settings);
  text(el("h3", "", defaults), "Reading defaults", "Default bacaan");
  const about = el("section", "settings-card app-about", settings), aboutTrigger = el("button", "settings-action-row app-about-trigger", about);
  aboutTrigger.type = "button";
  aboutTrigger.setAttribute("aria-haspopup", "dialog");
  const aboutLead = el("span", "settings-leading-icon", aboutTrigger);
  aboutLead.append(controlIcon("info"));
  const aboutLabel = el("span", "settings-action-label", aboutTrigger);
  text(aboutLabel, "About Sela", "Tentang Sela");
  const aboutDialog = el("dialog", "control-sheet about-sheet", document.body);
  aboutDialog.setAttribute("aria-labelledby", "about-title");
  const aboutHeader = el("header", "control-sheet-header", aboutDialog), aboutHeading = el("h2", "", aboutHeader);
  aboutHeading.id = "about-title";
  text(aboutHeading, "About Sela", "Tentang Sela");
  const aboutClose = el("button", "icon-action", aboutHeader);
  aboutClose.type = "button";
  iconAction(aboutClose, "close", t("Close", "Tutup"));
  aboutClose.onclick = () => aboutDialog.close();
  const aboutContent = el("div", "about-dialog-content", aboutDialog), aboutIdentity = el("div", "about-identity", aboutContent), aboutMark = el("span", "about-app-mark", aboutIdentity), aboutLogo = el("img", "", aboutMark);
  aboutLogo.alt = "";
  aboutLogo.src = new URL(document.querySelector(".brand-logo")?.getAttribute("src") || "../logo.svg", document.baseURI).href;
  const aboutName = el("div", "about-identity-copy", aboutIdentity);
  text(el("strong", "", aboutName), "Sela Books", "Sela Books");
  text(el("small", "", aboutName), "Your personal bookshelf", "Perpustakaan pribadimu");
  const version = el("span", "about-version", aboutIdentity);
  version.textContent = "v" + (window.Sela?.version || VERSION);
  text(el("p", "about-description", aboutContent), "A quiet little home for your books, notes, and reading time.", "Ruang hangat untuk buku, catatan, dan waktu membacamu.");
  const creator = el("section", "about-detail", aboutContent);
  text(el("small", "", creator), "MADE WITH CARE BY", "DIBUAT DENGAN HATI OLEH");
  const author = el("a", "about-author", creator);
  author.href = "https://bobbyfch.github.io/";
  author.target = "_blank";
  author.rel = "noopener noreferrer";
  text(author, "Bobby Fajar Christian", "Bobby Fajar Christian");
  const links = el("div", "about-links", aboutContent);
  const addProfileLink = (label, url, idLabel = label) => {
    const link = el("a", "about-link", links);
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(controlIcon("share"));
    text(el("span", "", link), label, idLabel);
  };
  addProfileLink("GitHub", "https://github.com/bobbyfch");
  addProfileLink("Instagram", "https://www.instagram.com/bobbyfch/");
  addProfileLink("Threads", "https://www.threads.com/@bobby.fch");
  addProfileLink("LinkedIn", "https://id.linkedin.com/in/bobbyfajarc");
  const license = el("a", "about-link", links);
  license.href = "https://github.com/bobbyfch/sela/blob/main/LICENSE";
  license.target = "_blank";
  license.rel = "noopener noreferrer";
  license.append(controlIcon("journal"));
  text(el("span", "", license), "MIT license", "Lisensi MIT");
  const notices = el("a", "about-link", links);
  notices.href = "https://github.com/bobbyfch/sela/blob/main/THIRD_PARTY_NOTICES.md";
  notices.target = "_blank";
  notices.rel = "noopener noreferrer";
  notices.append(controlIcon("info"));
  text(el("span", "", notices), "Third-party licenses", "Lisensi pihak ketiga");
  const feedback = el("a", "about-link", links);
  feedback.href = "https://github.com/bobbyfch/sela/issues/new";
  feedback.target = "_blank";
  feedback.rel = "noopener noreferrer";
  feedback.append(controlIcon("share"));
  text(el("span", "", feedback), "Send feedback", "Kirim masukan");
  const aboutInfo = el("section", "library-info", aboutContent);
  text(el("h3", "library-info-title", aboutInfo), "Privacy, updates & compatibility", "Privasi, pembaruan & kompatibilitas");
  for (const child of Array.from(info.children)) if (!(child instanceof HTMLElement && child.tagName === "SUMMARY")) aboutInfo.append(child);
  info.remove();
  animateDialog(aboutDialog);
  aboutTrigger.onclick = () => {
    aboutTrigger.focus();
    aboutDialog.showModal();
  };
  document.addEventListener("sela:show-about", () => {
    if (!aboutDialog.open) aboutDialog.showModal();
  });
  let savedDefaults = {};
  try {
    savedDefaults = JSON.parse(localStorage.getItem("sela-library:preferences") || "{}");
  } catch {
  }
  const defaultModeLabel = el("label", "settings-row", defaults);
  const modeLead = el("span", "settings-leading-icon", defaultModeLabel);
  modeLead.append(controlIcon("read"));
  const modeCopy = el("span", "settings-row-copy", defaultModeLabel);
  text(el("strong", "", modeCopy), "Default reading mode", "Mode baca default");
  text(el("small", "", modeCopy), "Choose how new books open.", "Pilih cara buku baru dibuka.");
  const defaultMode = el("select", "", defaultModeLabel);
  defaultMode.id = "default-reading-mode";
  defaultMode.setAttribute("aria-label", t("Default reading mode", "Mode baca default"));
  for (const [value, en, id] of [["single", "Single page", "Satu halaman"], ["book", "Book spread", "Buku"], ["scroll", "Continuous scroll", "Gulir berkelanjutan"], ["webtoon", "Webtoon", "Webtoon"], ["manga", "Manga RTL", "Manga RTL"]]) {
    const opt = el("option", "", defaultMode);
    opt.value = value;
    text(opt, en, id);
  }
  defaultMode.value = savedDefaults.mode || (mobile ? "single" : "book");
  defaultMode.onchange = () => {
    savedDefaults.mode = defaultMode.value;
    localStorage.setItem("sela-library:preferences", JSON.stringify(savedDefaults));
  };
  const powerLabel = el("label", "settings-row", defaults), powerLead = el("span", "settings-leading-icon", powerLabel);
  powerLead.append(controlIcon("battery"));
  const powerCopy = el("span", "settings-row-copy", powerLabel);
  text(el("strong", "", powerCopy), "Low power reader", "Reader hemat daya");
  text(el("small", "", powerCopy), "Reduce motion and background effects.", "Kurangi gerakan dan efek latar.");
  const power = el("input", "", powerLabel);
  power.type = "checkbox";
  power.id = "default-low-power";
  power.checked = !!savedDefaults.lowPower;
  power.onchange = () => {
    savedDefaults.lowPower = power.checked;
    localStorage.setItem("sela-library:preferences", JSON.stringify(savedDefaults));
  };
  action("Reset defaults", "Reset default", () => {
    localStorage.removeItem("sela-library:preferences");
    savedDefaults = {};
    defaultMode.value = mobile ? "single" : "book";
    power.checked = false;
    status(t("Reading defaults reset. Per-book settings are kept.", "Default bacaan direset. Pengaturan per buku tetap tersimpan."));
  }, defaults);
  const data = el("section", "settings-card", settings);
  text(el("h3", "", data), "Books & storage", "Buku & penyimpanan");
  const storage = el("p", "storage-usage", data);
  storage.id = "storage-usage";
  storage.setAttribute("role", "status");
  async function estimate() {
    try {
      if (!navigator.storage?.estimate) {
        storage.textContent = t("Storage estimate unavailable.", "Perkiraan penyimpanan tidak tersedia.");
        return;
      }
      const result = await navigator.storage.estimate();
      const persistent = await navigator.storage.persisted?.();
      storage.textContent = `${((result.usage || 0) / 1048576).toFixed(1)} MiB / ${((result.quota || 0) / 1048576).toFixed(0)} MiB \xB7 ${persistent ? t("persistent", "persisten") : t("browser managed", "dikelola browser")}`;
    } catch {
      storage.textContent = t("Storage estimate unavailable.", "Perkiraan penyimpanan tidak tersedia.");
    }
  }
  action("Protect offline storage", "Lindungi penyimpanan offline", async () => {
    const allowed = await navigator.storage?.persist?.();
    status(allowed ? t("Persistent storage enabled. Still keep a backup.", "Penyimpanan persisten aktif. Tetap simpan backup.") : t("Browser manages storage. Keep a backup.", "Penyimpanan dikelola browser. Simpan backup."));
    await estimate();
  }, data);
  text(el("p", "section-description", data), "Backup includes original files, collections, progress, notes and bookmarks. Up to 120 MiB of book files per archive. Restore adds new books and keeps existing books and notes.", "Backup menyertakan berkas asli, koleksi, progres, catatan, dan penanda. Maksimal 120 MiB berkas per arsip. Restore menambahkan buku baru dan mempertahankan buku serta catatan yang sudah ada.");
  action("Device picker fallback", "Fallback pemilih perangkat", () => {
    const picker = document.querySelector("#books");
    picker.accept = "";
    picker.click();
  }, data);
  text(el("small", "", data), "Use if your device hides a supported book. Contents are still validated.", "Gunakan jika perangkat menyembunyikan buku yang didukung. Isi tetap divalidasi.");
  const exportButton = action("Download full backup", "Unduh backup lengkap", async () => {
    if (busy) return;
    busy = true;
    exportButton.disabled = true;
    try {
      status(t("Preparing backup\u2026", "Menyiapkan backup\u2026"));
      const { exportLibrary } = await import("./backup.js");
      const blob = await exportLibrary();
      const url = URL.createObjectURL(blob);
      const a = el("a");
      a.href = url;
      a.download = "sela-library-backup.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e4);
      status(t("Backup downloaded. Keep it somewhere safe.", "Backup diunduh. Simpan di tempat aman."));
    } finally {
      busy = false;
      exportButton.disabled = false;
    }
  }, data);
  exportButton.id = "export-library";
  const restoreLabel = el("div", "restore-label settings-row", data), restoreLead = el("span", "settings-leading-icon", restoreLabel);
  restoreLead.append(controlIcon("cloud"));
  const restoreCopy = el("span", "settings-row-copy", restoreLabel);
  text(el("strong", "", restoreCopy), "Restore backup", "Pulihkan backup");
  text(el("small", "", restoreCopy), "Choose a Sela backup ZIP.", "Pilih ZIP backup Sela.");
  const restorePicker = el("label", "restore-file-picker", restoreLabel);
  const restoreAction = el("span", "restore-file-picker-action", restorePicker);
  restoreAction.append(controlIcon("download"));
  text(el("span", "", restoreAction), "Choose file", "Pilih berkas");
  const restore = el("input", "restore-file-input", restorePicker);
  restore.id = "restore-library";
  restore.type = "file";
  restore.accept = ".zip,application/zip";
  restore.setAttribute("aria-label", t("Choose a Sela backup ZIP", "Pilih ZIP backup Sela"));
  restore.onchange = async () => {
    if (busy || !restore.files[0]) return;
    busy = true;
    restore.disabled = true;
    try {
      const { restoreLibrary } = await import("./backup.js");
      const result = await restoreLibrary(restore.files[0]);
      await refresh();
      await estimate();
      status(result.added + " " + t("books restored.", "buku dipulihkan.") + (result.readingSaved ? "" : t(" Reading data could not be saved; keep this backup.", " Data bacaan belum tersimpan; pertahankan backup ini.")));
    } catch (e) {
      status(e.message);
    } finally {
      restore.value = "";
      restore.disabled = false;
      busy = false;
    }
  };
  const cloud = el("section", "settings-card backup-sharing", settings);
  text(el("h3", "", cloud), "Keep a backup", "Simpan cadangan");
  text(el("p", "section-description", cloud), "Download your backup, or share it with an app on your device. No account setup needed.", "Unduh cadangan, atau bagikan ke aplikasi di perangkatmu. Tanpa pengaturan akun.");
  let preparedBackup = null;
  const share = action("Share backup", "Bagikan backup", async () => {
    if (busy) return;
    busy = true;
    share.disabled = true;
    const fallback = () => status(t("Sharing files is unavailable. Download the backup above, then upload it to your cloud storage.", "Berbagi berkas belum didukung. Unduh backup di atas lalu unggah ke penyimpanan cloud."));
    try {
      if (preparedBackup) {
        const file2 = preparedBackup;
        preparedBackup = null;
        await navigator.share({ files: [file2], title: "Sela backup" });
        status(t("Backup shared.", "Backup dibagikan."));
        return;
      }
      const { exportLibrary } = await import("./backup.js");
      const blob = await exportLibrary();
      const file = new File([blob], "sela-library-backup.zip", { type: "application/zip" });
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        preparedBackup = file;
        status(t("Backup ready. Tap Share backup again to choose your cloud app.", "Backup siap. Ketuk Bagikan backup lagi untuk memilih app cloud."));
      } else fallback();
    } catch (e) {
      if (e.name === "AbortError") return;
      if (["NotAllowedError", "SecurityError", "NotSupportedError"].includes(e.name)) fallback();
      else throw e;
    } finally {
      busy = false;
      share.disabled = false;
    }
  }, cloud);
  share.id = "share-library";
  const controls = $(".shelf-controls");
  const tag = el("select", "", controls);
  tag.id = "tag-filter";
  tag.setAttribute("aria-label", t("Filter collections", "Filter koleksi"));
  tag.onchange = refresh;
  if (mobile) iconAction($("#shelf-view"), "collection", t("Switch shelf view", "Ganti tampilan rak"));
  const shelfControls = mountShelfControls({ t, controls, onCollections: () => showCollections({ t, onChange: refresh }).catch((e) => status(e.message)) });
  const completed = el("option", "", $("#read-filter"));
  completed.value = "completed";
  text(completed, "Finished", "Selesai");
  for (const format of ["docx", "odt"]) {
    const option = el("option", "", $("#format-filter"));
    option.value = format;
    option.textContent = format.toUpperCase();
  }
  const bulk = el("div", "bulk-actions", library);
  library.insertBefore(bulk, $("#shelf"));
  const count = el("output", "", bulk);
  action("Select all shown", "Pilih yang ditampilkan", () => {
    for (const box of document.querySelectorAll(".select-book")) {
      box.checked = true;
      selected.add(box.dataset.id);
    }
    updateSelection();
  }, bulk);
  action("Clear", "Batal", () => {
    selected.clear();
    document.querySelectorAll(".select-book").forEach((b) => b.checked = false);
    updateSelection();
  }, bulk);
  async function changeSelected(fn) {
    for (const book of items.filter((b) => selected.has(b.id))) {
      fn(book);
      await writeBook(book);
    }
    await refresh();
  }
  action("Favorite", "Favorit", () => changeSelected((b) => b.favorite = true), bulk);
  action("Finished", "Selesai", () => changeSelected((b) => b.completed = true), bulk);
  action("Collection", "Koleksi", () => showCollections({ t, ids: [...selected], onChange: refresh }), bulk);
  const deleteButton = action("Remove selected", "Keluarkan pilihan", async () => {
    const chosen = items.filter((b) => selected.has(b.id));
    if (!chosen.length || !confirm(t(`Remove ${chosen.length} books from this shelf?`, `Keluarkan ${chosen.length} buku dari rak ini?`))) return;
    removed = [];
    for (const book of chosen) {
      const blob = await getFile(book.id);
      removed.push({ book, blob });
      await writeBook(book, null, true);
    }
    selected.clear();
    undoBulk.hidden = false;
    await refresh();
  }, bulk);
  let removed = [];
  const undoBulk = action("Undo batch removal", "Urungkan penghapusan batch", async () => {
    for (const entry of removed) await writeBook(entry.book, entry.blob);
    removed = [];
    undoBulk.hidden = true;
    await refresh();
  }, main);
  undoBulk.hidden = true;
  function updateSelection() {
    document.body.dataset.selecting = String(selected.size > 0);
    count.textContent = selected.size + " " + t("selected", "dipilih");
    deleteButton.disabled = !selected.size;
  }
  $("#shelf").addEventListener("change", (event) => {
    if (!event.target.matches(".select-book")) return;
    const id = event.target.dataset.id;
    if (event.target.checked) selected.add(id);
    else selected.delete(id);
    updateSelection();
  });
  const sections = { home, library, browse, settings };
  library.dataset.page = "library";
  library.classList.add("app-page");
  function navigate(value) {
    if (!sections[value]) return;
    page = value;
    for (const [name, node] of Object.entries(sections)) node.hidden = mobile && name !== value;
    document.body.dataset.page = value;
    document.dispatchEvent(new CustomEvent("sela:navigation-change", { detail: value }));
    if (mobile) {
      document.querySelectorAll(".bottom-bar button").forEach((b) => b.setAttribute("aria-current", String(b.dataset.tab === value)));
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    if (value === "settings") {
      void estimate();
      updateSettingsWelcome();
    }
    if (value === "browse") {
      if (onlineCatalog) onlineCatalog.shuffle();
      else void discover().catch((e) => status(e.message));
    }
  }
  if (mobile) {
    const nav = $(".bottom-bar");
    document.dispatchEvent(new CustomEvent("sela:navigation-mount", { detail: { nav, navigate, translate: t } }));
    navigate("home");
  } else {
    home.remove();
    browse.classList.add("desktop-catalog");
    settings.classList.add("desktop-settings");
  }
  document.addEventListener("sela:browse", () => {
    if (mobile) navigate("browse");
    else browse.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  });
  const desk = mobile ? mountReadingDesk(home, { t, navigate, filter: (value) => {
    $("#read-filter").value = value;
    $("#search").value = "";
    $("#format-filter").value = "all";
    tag.value = "";
    refresh();
  } }) : null;
  const weather = mobile ? mountWeather(intro.querySelector(".ritual"), { t }) : null;
  const atmosphere = mobile ? mountAtmosphere(home, { t }) : null;
  const homeWidgets = mobile ? mountHomeWidgets({ t, openBook }) : null;
  const advanced = mountAdvanced(settings, { t, openBook, status });
  const personal = mountPersonal({ home, settings, library, t, refresh, openBook, navigate });
  const homeShortcuts = mobile ? el("section", "home-shortcuts tw:my-1 tw:min-w-0") : null;
  if (homeShortcuts) {
    const personalize = el("button", "home-personalize-link tw:inline-flex tw:min-h-11 tw:items-center tw:gap-2 tw:rounded-full tw:border tw:border-sela-line/80 tw:bg-sela-surface/65 tw:px-4 tw:text-sm tw:font-semibold tw:text-sela-ink tw:transition hover:tw:border-sela-accent/50 hover:tw:bg-sela-surface", homeShortcuts);
    personalize.type = "button";
    personalize.append(controlIcon("sliders"));
    text(el("span", "", personalize), "Make this space yours", "Atur ruang & bacaan");
    personalize.onclick = () => navigate("settings");
  }
  if (mobile) {
    const stats = home.querySelector(".reading-summary");
    if (stats) {
      const summaryCard = el("section", "settings-card settings-summary-card", settings);
      text(el("h3", "", summaryCard), "Reading time", "Waktu membaca");
      summaryCard.append(stats);
    }
    const routine = el("section", "settings-card home-routine-settings", settings);
    text(el("h3", "", routine), "Home & daily rhythm", "Beranda & rutinitas harian");
    const routineIntro = el("p", "settings-card-intro", routine);
    text(routineIntro, "Choose what appears on Home and set gentle daily habits.", "Atur isi Beranda dan kebiasaan harian dengan santai.");
    if (homeWidgets?.waterSettings) routine.append(homeWidgets.waterSettings);
    if (atmosphere?.quoteSettings) routine.append(atmosphere.quoteSettings);
    settings.append(about);
    for (const card of Array.from(settings.querySelectorAll(":scope>.settings-card"))) {
      const title = card.querySelector(":scope>h3")?.textContent || "", icon = card.classList.contains("appearance-settings") ? "sun" : card.classList.contains("app-about") ? "info" : card.classList.contains("backup-sharing") ? "cloud" : card.classList.contains("personal-settings") ? "person" : title.includes("palette") || title.includes("Palet") ? "palette" : title.includes("storage") || title.includes("penyimpanan") ? "storage" : title.includes("Reading time") || title.includes("Waktu membaca") ? "clock" : title.includes("Home &") || title.includes("Beranda &") ? "person" : title.includes("Connections") || title.includes("Koneksi") ? "sliders" : "read";
      decorateSettingsHeading(card, icon);
    }
    updateSettingsWelcome();
  }
  if (mobile) {
    const queue = home.querySelector(".personal-desk"), focus = home.querySelector(".focus-card"), quote = home.querySelector(".home-reflection");
    home.replaceChildren(intro, ...homeShortcuts ? [homeShortcuts] : [], continueSection, homeCatalog, ...quote ? [quote] : [], ...queue ? [queue] : [], ...homeWidgets ? [homeWidgets.section] : []);
    const ritual = intro.querySelector(".ritual");
    if (focus && ritual) ritual.append(focus);
  }
  if (mobile) {
    const directCards = () => Array.from(settings.querySelectorAll(":scope > .settings-card"));
    const findCard = (predicate) => directCards().find((card) => predicate(card)) || null;
    const byTitle = (pattern) => findCard((card) => pattern.test(card.querySelector(":scope > h3")?.textContent || ""));
    const groups = [
      { title: ["Reading & appearance", "Tampilan & bacaan"], description: ["Language, colors, and reading behavior.", "Bahasa, warna, dan cara membaca."], icon: "sun", cards: [findCard((card) => card.classList.contains("appearance-settings")), findCard((card) => card.classList.contains("appearance-materials")), byTitle(/Reading defaults|Default bacaan/i)] },
      { title: ["Your library & data", "Rak dan data pribadimu"], description: ["Manage your books, backups, and connections.", "Kelola buku, cadangan, dan koneksi."], icon: "storage", cards: [byTitle(/Books & storage|Buku & penyimpanan/i), findCard((card) => card.classList.contains("backup-sharing")), byTitle(/Connections|Koneksi/i)] },
      { title: ["Your space & routine", "Ruang dan rutinitas"], description: ["Make Sela feel right for your day.", "Atur Sela agar pas dengan harimu."], icon: "person", cards: [findCard((card) => card.classList.contains("personal-settings")), findCard((card) => card.classList.contains("settings-summary-card")), findCard((card) => card.classList.contains("home-routine-settings"))] },
      { title: ["About Sela", "Tentang Sela"], description: ["Version, project details, and the people behind Sela.", "Versi, detail proyek, dan orang di balik Sela."], icon: "info", cards: [findCard((card) => card.classList.contains("app-about"))] }
    ];
    const wrapper = el("div", "settings-groups", settings);
    const moved = /* @__PURE__ */ new Set();
    for (const group of groups) {
      const cards = group.cards.filter((card) => !!card && !moved.has(card));
      if (!cards.length) continue;
      const section = el("section", "settings-group", wrapper), heading = el("header", "settings-group-heading", section), mark = el("span", "settings-group-icon", heading);
      mark.setAttribute("aria-hidden", "true");
      mark.append(controlIcon(group.icon));
      const copy = el("div", "settings-group-copy", heading);
      text(el("h3", "", copy), ...group.title);
      text(el("p", "", copy), ...group.description);
      const grid = el("div", "settings-group-grid", section);
      for (const card of cards) {
        moved.add(card);
        grid.append(card);
      }
    }
    const ungrouped = directCards().filter((card) => !moved.has(card));
    if (ungrouped.length) {
      const section = el("section", "settings-group", wrapper), heading = el("header", "settings-group-heading", section), mark = el("span", "settings-group-icon", heading);
      mark.setAttribute("aria-hidden", "true");
      mark.append(controlIcon("sliders"));
      const copy = el("div", "settings-group-copy", heading);
      text(el("h3", "", copy), "More settings", "Pengaturan lainnya");
      text(el("p", "", copy), "Other tools for your reading space.", "Alat lain untuk ruang bacamu.");
      const grid = el("div", "settings-group-grid", section);
      for (const card of ungrouped) grid.append(card);
    }
  }
  window.addEventListener("pagehide", () => recentUrls.forEach(URL.revokeObjectURL), { once: true });
  let collectionRun = 0;
  function lastTrace(book) {
    try {
      const text2 = JSON.parse(localStorage.getItem("sela-library:" + book.id + ":notes") || "{}")[book.progress];
      return typeof text2 === "string" ? text2.slice(0, 120) : "";
    } catch {
      return "";
    }
  }
  function render(books) {
    for (let i = labels.length - 1; i >= 0; i--) if (!labels[i].node.isConnected) labels.splice(i, 1);
    items = books;
    bulk.hidden = !items.length;
    for (const id of selected) if (!items.some((b) => b.id === id)) selected.delete(id);
    updateSelection();
    const choice = tag.value;
    tag.replaceChildren();
    text(el("option", "", tag), "All collections", "Semua koleksi");
    tag.options[0].value = "";
    for (const name of [...new Set(items.flatMap((b) => b.tags || []))].sort()) {
      const opt = el("option", "", tag);
      opt.value = name;
      opt.textContent = name;
    }
    if ([...tag.options].some((o) => o.value === choice)) tag.value = choice;
    const run = ++collectionRun;
    void listCollections().then((names) => {
      if (run !== collectionRun) return;
      const latest = tag.value;
      for (const name of names) if (![...tag.options].some((o) => o.value === name)) {
        const opt = el("option", "", tag);
        opt.value = name;
        opt.textContent = name;
      }
      if ([...tag.options].some((o) => o.value === latest)) tag.value = latest;
    }).catch((e) => status(e.message));
    recentUrls.forEach(URL.revokeObjectURL);
    recentUrls.length = 0;
    continueList.replaceChildren();
    const recent = items.filter((b) => b.opened && !b.completed).sort((a, b) => b.opened - a.opened).slice(0, 4);
    for (const book of recent) {
      const b = el("button", "experience-button recent-book", continueList);
      b.type = "button";
      b.onclick = () => openBook(book).catch((e) => status(e.message));
      b.setAttribute("aria-label", t("Continue ", "Lanjutkan ") + book.name);
      if (book.cover) {
        const img = el("img", "", b);
        const url = URL.createObjectURL(book.cover);
        recentUrls.push(url);
        img.src = url;
        img.alt = "";
      } else b.append(svg("browse"));
      const copy = el("span", "", b);
      el("strong", "", copy).textContent = book.name;
      const trace = el("small", "last-trace", copy);
      trace.textContent = lastTrace(book);
      const p = el("small", "", copy);
      p.textContent = book.progress && book.total && ["pdf", "epub", "cbz", "djvu"].includes(book.format) ? Math.round(book.progress / book.total * 100) + "%" : t("Continue", "Lanjutkan");
    }
    continueSection.hidden = !recent.length;
    personal?.render(items);
    desk?.render(items);
    void estimate();
  }
  function localize() {
    document.dispatchEvent(new Event("sela:navigation-localize"));
    shelfControls.localize();
    advanced?.localize();
    personal?.localize();
    desk?.localize();
    weather?.localize();
    atmosphere?.localize();
    homeWidgets?.localize();
    onlineCatalog?.localize();
    if (mobile) {
      const link = homeShortcuts?.querySelector("button");
      if (link) {
        const copy = link.querySelector("span");
        if (copy) copy.textContent = t("Make this space yours", "Atur ruang & bacaan");
      }
    }
    document.dispatchEvent(new Event("sela:palette"));
    for (const item of labels) {
      if (!item.node.isConnected) continue;
      if (item.icon) {
        iconAction(item.node, item.icon, t(item.en, item.id));
        continue;
      }
      if (item.aria) item.node.setAttribute("aria-label", t(item.en, item.id));
      else item.node.textContent = t(item.en, item.id);
    }
    tag.setAttribute("aria-label", t("Filter collections", "Filter koleksi"));
    defaultMode.setAttribute("aria-label", t("Default reading mode", "Mode baca default"));
    if (mobile) {
      document.querySelector(".bottom-bar").setAttribute("aria-label", t("Bookshelf navigation", "Navigasi Bookshelf"));
      updateSettingsWelcome();
    }
    void estimate();
  }
  localize();
  return { selected, render, localize, navigate };
}
