// Generated from app/library/reader-shell.ts by npm run build. Do not edit.
import { animatePanel, controlIcon, notify } from "./controls.js";
import { openDictionary } from "./dictionary.js";
import { mountAudio } from "./audio.js";
import { mountPalettes, applyPalette, getPaletteDefinition } from "./themes.js";
import { renderBookInfo } from "./book-info.js";
import { mountReaderProfiles } from "./reader-profiles.js";
import { mountSharePanel } from "./share-card.js";
import { translate } from "../dist/source/src/i18n.js";
import { mountQuranReader } from "./quran-reader.js";
const paths = { back: "m14 5-7 7 7 7M7 12h14", contents: "M4 5h16M4 12h16M4 19h16", search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0", settings: "M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-8 0v6", sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0", help: "M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 4m0 4v1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", rotate: "M3 10a9 9 0 0 1 15-6l3 3m-6 0h6V1M21 14a9 9 0 0 1-15 6l-3-3m6 0H3v6", previews: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z", prev: "m15 5-7 7 7 7", next: "m9 5 7 7-7 7", mark: "M6 3h12v18l-6-4-6 4Z", voice: "M9 4a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3", close: "m6 6 12 12M18 6 6 18", minus: "M5 12h14", plus: "M12 5v14M5 12h14", share: "M12 16V3m-4 4 4-4 4 4M5 12v9h14v-9", info: "M12 11v6m0-10v1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", full: "M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6" };
export function configureLibraryReader(reader, { mobile, viewer = false, language = "en" } = {}) {
  const overlay = reader.overlay;
  if (!overlay || !mobile || overlay.dataset.productReader === "app") return;
  const state = reader._reader.getState(), shell = overlay.querySelector(".library-reader-shell"), host = overlay.querySelector(".library-reader-book"), tools = overlay.querySelector(".sela-tools");
  overlay.dataset.productReader = "app";
  overlay.dataset.oled = document.documentElement.dataset.oled || "false";
  if (!viewer) {
    state.options.theme = document.documentElement.dataset.theme || "auto";
    reader.options.theme = state.options.theme;
    overlay.dataset.selaTheme = state.options.theme;
  }
  const paletteTarget = viewer ? overlay : document.documentElement;
  if (viewer) applyPalette(reader.options.palette, paletteTarget);
  const metadata = () => reader.getMetadata().catch(() => ({ title: state.options.title || "", pageCount: reader.totalPages }));
  const t = (en, id) => translate(en, id, language);
  const el = (tag, cls, parent) => {
    const n = document.createElement(tag);
    n.className = cls || "";
    parent?.append(n);
    return n;
  };
  const button = (icon, en, id, parent, fn) => {
    const b = el("button", "app-reader-icon", parent);
    b.type = "button";
    b.title = t(en, id);
    b.setAttribute("aria-label", b.title);
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + paths[icon] + '"/></svg>';
    b.onclick = fn;
    return b;
  };
  const controls = state.controls;
  const top = el("header", "app-reading-top reader-narrow-toolbar");
  shell.prepend(top);
  const close = button("back", "Back to library", "Kembali ke rak", top, () => reader.close());
  close.classList.add("library-reader-close");
  const title = el("div", "app-reading-title", top);
  const paletteMark = el("span", "app-reading-theme-mark", title);
  paletteMark.setAttribute("aria-hidden", "true");
  el("strong", "", title).textContent = state.options.title || t("Your book", "Buku kamu");
  const fullscreenButton = button("full", "Fullscreen", "Layar penuh", top, fullscreen);
  fullscreenButton.classList.add("app-reading-fullscreen");
  const quranCandidate = reader.options?.metadata?.quran || reader.book?.quranMetadata, quran = quranCandidate && Number.isInteger(quranCandidate.surah) && quranCandidate.surah >= 1 && quranCandidate.surah <= 114 && Number.isInteger(quranCandidate.verseCount) && quranCandidate.verseCount >= 1 && quranCandidate.verseCount <= 286 && /^[a-z0-9_]{1,80}$/.test(String(quranCandidate.translationKey || "")) && ["id", "en", "ja"].includes(quranCandidate.language) ? quranCandidate : null;
  if (quran) mountQuranReader(overlay, top, reader, quran, t);
  const dock = el("footer", "app-reading-dock", shell);
  dock.append(controls.pageForm);
  controls.pageForm.querySelector("button").innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + paths.next + '"/></svg>';
  controls.pageForm.querySelector("button").setAttribute("aria-label", t("Next or go to page", "Lanjut atau buka halaman"));
  const position = el("div", "app-reading-position", dock), counter = el("output", "", position), seek = el("input", "app-page-seek", position);
  seek.type = "range";
  seek.min = "1";
  seek.setAttribute("aria-label", t("Reading position", "Posisi bacaan"));
  seek.onchange = () => reader.goTo(Number(seek.value));
  const actions = el("nav", "app-reading-actions", dock);
  actions.setAttribute("aria-label", t("Reader navigation", "Navigasi bacaan"));
  const drawer = el("section", "app-reading-settings", shell);
  drawer.hidden = true;
  drawer.setAttribute("aria-label", t("Reader settings", "Pengaturan reader"));
  const drawerTop = el("div", "app-drawer-heading", drawer);
  el("h2", "", drawerTop).textContent = t("Reading", "Bacaan");
  let returnFocus = null;
  function dismiss() {
    drawer.hidden = true;
    infoPanel.hidden = true;
    sharePanel.panel.hidden = true;
    controls.previews.hidden = true;
    tools.hidden = true;
    overlay.classList.remove("app-panel-open");
    returnFocus?.focus();
  }
  state.hideTools = dismiss;
  const originalShowTools = state.showTools;
  state.showTools = () => {
    overlay.classList.add("app-panel-open");
    overlay.classList.remove("sela-controls-hidden");
    return originalShowTools();
  };
  state.onPreviewNavigate = dismiss;
  button("close", "Close panel", "Tutup panel", drawerTop, dismiss);
  function openSettings(event) {
    if (!drawer.hidden) {
      dismiss();
      return;
    }
    dismiss();
    tools.hidden = true;
    drawer.hidden = false;
    overlay.classList.add("app-panel-open");
    overlay.classList.remove("sela-controls-hidden");
    returnFocus = event.currentTarget;
    drawerTop.querySelector("button").focus();
  }
  const notice = el("p", "app-reader-status", drawer);
  notice.setAttribute("role", "status");
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (shell.requestFullscreen) await shell.requestFullscreen({ navigationUI: "hide" });
      else overlay.classList.toggle("sela-controls-hidden");
    } catch {
      notice.textContent = t("Fullscreen is unavailable in this browser.", "Layar penuh belum tersedia di browser ini.");
      notify(notice.textContent, "error");
    }
  }
  function refreshMarks() {
    let saved = tools.querySelector(".app-saved-marks");
    if (!saved) {
      saved = el("section", "app-saved-marks");
      tools.querySelector('.sela-tool-panel[id$="-contents"]').prepend(saved);
    }
    const key2 = [...state.marks].sort((a, b) => a - b).join(",");
    if (saved.dataset.marks === key2) return;
    saved.dataset.marks = key2;
    saved.replaceChildren();
    saved.hidden = false;
    {
      el("h3", "", saved).textContent = t("Your bookmarks", "Penandamu");
      const list = el("div", "", saved);
      for (const page of [...state.marks].sort((a, b) => a - b)) {
        const jump = el("button", "app-bookmark-jump tw:min-w-0 tw:max-w-full tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap", list);
        jump.type = "button";
        let ribbon = "";
        if (!viewer) try {
          ribbon = JSON.parse(localStorage.getItem("sela-library:personal") || "{}").books?.[state.options.id]?.marks?.[page] || "";
        } catch {
        }
        jump.textContent = String(page) + (ribbon ? " \xB7 " + String(ribbon).slice(0, 120) : "");
        jump.setAttribute("aria-label", t("Bookmarked page ", "Halaman bertanda ") + page);
        jump.onclick = () => {
          state.navigate(page);
          dismiss();
        };
      }
      if (!state.marks.length) el("p", "", saved).textContent = t("Tap the bookmark icon to keep a page.", "Ketuk ikon penanda untuk menyimpan halaman.");
    }
  }
  async function openTools(tab, event) {
    if (!tools.hidden && tools.querySelector("[aria-selected=true]")?.getAttribute("aria-controls")?.endsWith("-" + tab)) {
      dismiss();
      return;
    }
    dismiss();
    returnFocus = event.currentTarget;
    drawer.hidden = true;
    overlay.classList.add("app-panel-open");
    overlay.classList.remove("sela-controls-hidden");
    try {
      const service = await reader.showTools();
      if (!overlay.isConnected) return;
      service.selectTab(tab);
      const selected = tools.querySelector(".sela-selection-actions");
      if (selected && !selected.querySelector("[data-dictionary]")) {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.dictionary = "";
        b.textContent = t("Dictionary", "Kamus");
        b.setAttribute("aria-label", t("Dictionary & translation", "Kamus & terjemahan"));
        b.onpointerdown = (e) => e.preventDefault();
        b.onclick = () => openDictionary(window.getSelection()?.toString() || "", t);
        selected.append(b);
      }
      refreshMarks();
      tools.querySelector("[aria-selected=true]")?.focus();
    } catch (e) {
      if (overlay.isConnected) {
        drawer.hidden = false;
        notice.textContent = e.message;
      }
    }
  }
  button("contents", "Contents & bookmarks", "Daftar isi & penanda", top, (e) => openTools("contents", e));
  button("search", "Search book", "Cari dalam buku", top, (e) => openTools("search", e));
  button("settings", "Reader settings", "Pengaturan reader", top, openSettings);
  button("prev", "Previous page", "Halaman sebelumnya", actions, () => reader.prev());
  const bookmark = button("mark", "Bookmark page", "Tandai halaman", actions, () => {
    controls.bookmark.click();
    sync();
  });
  button("voice", "Read aloud", "Baca bersuara", actions, (e) => openTools("voice", e));
  const shareButton = button("share", "Screenshot & quote", "Screenshot & kutipan", actions, (e) => {
    if (!sharePanel.panel.hidden) {
      dismiss();
      return;
    }
    openShare(e.currentTarget);
  });
  function openShare(trigger, quote) {
    dismiss();
    returnFocus = trigger;
    sharePanel.panel.hidden = false;
    overlay.classList.add("app-panel-open");
    overlay.classList.remove("sela-controls-hidden");
    sharePanel.panel.querySelector("button").focus();
    void sharePanel.open(quote);
  }
  button("next", "Next page", "Halaman berikutnya", actions, () => reader.next());
  function select(en, id, choices, value, fn) {
    const label = el("label", "app-reading-field", drawer);
    el("span", "", label).textContent = t(en, id);
    const input = el("select", "", label);
    input.setAttribute("aria-label", t(en, id));
    for (const [v, english, indonesian] of choices) {
      const opt = el("option", "", input);
      opt.value = v;
      opt.textContent = t(english, indonesian);
    }
    input.value = value;
    input.onchange = async () => {
      input.disabled = true;
      notice.textContent = "";
      try {
        await fn(input.value);
      } catch (e) {
        notice.textContent = e.message;
      } finally {
        input.disabled = false;
        sync();
      }
    };
    return input;
  }
  function choiceGrid(en, id, choices, value, fn, descriptions = []) {
    const field = el("fieldset", "tw:border-0 tw:p-0", drawer);
    const legend = el("legend", "tw:mb-2 tw:text-xs tw:font-semibold tw:text-sela-muted", field);
    legend.textContent = t(en, id);
    const grid = el("div", "tw:grid tw:grid-cols-3 tw:gap-2", field);
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", legend.textContent);
    const pathsByChoice = { single: "M5 3h14v18H5zM8 7h8M8 11h8", book: "M3 5q5-3 9 1v15q-4-4-9-1zM21 5q-5-3-9 1v15q4-4 9-1z", manga: "M5 4h14v16H5zM9 12h6m-3-3v6", scroll: "M6 4h12M6 10h12M6 16h12M6 21h12", webtoon: "M7 3h10v18H7zM10 7h4m-4 4h4m-4 4h4", page: "M6 3h12v18H6zM9 7h6", width: "M3 6h18v12H3zM6 10h12", original: "M5 3h14v18H5zM3 3v4m18-4v4M3 17v4m18-4v4" };
    const items = [];
    for (let i = 0; i < choices.length; i++) {
      const [v, english, indonesian] = choices[i], button2 = el("button", "tw:flex tw:min-h-12 tw:min-w-0 tw:flex-row tw:items-center tw:justify-start tw:gap-2 tw:rounded-xl tw:border tw:border-sela-line tw:bg-sela-surface/80 tw:px-3 tw:py-2 tw:text-left tw:text-xs tw:transition hover:tw:border-sela-accent/60 focus-visible:tw:outline-2 focus-visible:tw:outline-sela-accent aria-pressed:tw:border-sela-accent aria-pressed:tw:bg-sela-accent/10", grid);
      button2.type = "button";
      button2.dataset.choice = v;
      button2.setAttribute("aria-pressed", String(v === value));
      const mark = el("span", "tw:grid tw:size-6 tw:place-items-center tw:rounded-lg tw:bg-sela-accent/10 tw:text-sela-accent", button2), svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.7");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.setAttribute("aria-hidden", "true");
      const path = document.createElementNS(svg.namespaceURI, "path");
      path.setAttribute("d", pathsByChoice[v] || paths.previews);
      svg.append(path);
      mark.append(svg);
      const title2 = el("span", "tw:max-w-full tw:truncate tw:font-semibold tw:text-sela-ink", button2);
      title2.textContent = t(english, indonesian);
      if (descriptions[i]) {
        const detail = el("span", "tw:text-[10px] tw:leading-4 tw:text-sela-muted", button2);
        detail.textContent = t(descriptions[i][0], descriptions[i][1]);
      }
      button2.onclick = async () => {
        button2.disabled = true;
        notice.textContent = "";
        try {
          await fn(v);
          input.value = v;
          sync();
        } catch (error) {
          notice.textContent = error.message;
        } finally {
          button2.disabled = false;
        }
      };
      items.push(button2);
    }
    const input = { get value() {
      return grid.querySelector("[aria-pressed=true]")?.dataset.choice || value;
    }, set value(next) {
      for (const button2 of items) button2.setAttribute("aria-pressed", String(button2.dataset.choice === next));
    } };
    return input;
  }
  const infoPanel = el("section", "app-reading-settings app-info-panel", shell);
  infoPanel.hidden = true;
  infoPanel.setAttribute("aria-label", t("Book information", "Informasi buku"));
  const infoTop = el("div", "app-drawer-heading", infoPanel);
  el("h2", "", infoTop).textContent = t("Book information", "Informasi buku");
  button("close", "Close panel", "Tutup panel", infoTop, dismiss);
  const infoBody = el("div", "", infoPanel);
  const utilities = el("div", "app-reading-utilities", drawer);
  button("back", "Previous position", "Posisi sebelumnya", utilities, () => reader.back());
  button("rotate", "Rotate screen", "Putar layar", utilities, () => controls.rotate.click()).disabled = controls.rotate.disabled;
  button("help", "Keyboard shortcuts", "Pintasan keyboard", utilities, () => controls.help.click());
  const download = controls.download;
  download.className = "app-reader-icon";
  download.setAttribute("aria-label", t("Download original", "Unduh berkas asli"));
  download.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg>';
  utilities.append(download);
  button("info", "Book information", "Informasi buku", utilities, async (e) => {
    dismiss();
    returnFocus = e.currentTarget;
    infoPanel.hidden = false;
    overlay.classList.add("app-panel-open");
    renderBookInfo(infoBody, await metadata(), t, state.options.format);
    infoTop.querySelector("button").focus();
  });
  const disposeAudio = mountAudio(reader, drawer, t);
  button("search", "Dictionary & translation", "Kamus & terjemahan", utilities, () => openDictionary(window.getSelection()?.toString() || "", t));
  const sharePanel = mountSharePanel(reader, shell, { t, metadata, dismiss, palette: () => paletteTarget.dataset.palette });
  const shareQuote = (e) => {
    if (typeof e.detail === "string" && e.detail.trim()) openShare(shareButton, e.detail);
  };
  overlay.addEventListener("sela:share-quote", shareQuote);
  const dictionaryEvent = (e) => openDictionary(String(e.detail || ""), t);
  overlay.addEventListener("sela:dictionary", dictionaryEvent);
  const finishPanels = [drawer, infoPanel, sharePanel.panel, controls.previews, tools].map(animatePanel);
  const textBook = !!reader.book.getText;
  const previews = controls.previews;
  const previewTop = el("div", "app-drawer-heading");
  previews.prepend(previewTop);
  el("h2", "", previewTop).textContent = t("Pages & bookmarks", "Halaman & penanda");
  button("close", "Close previews", "Tutup pratinjau", previewTop, dismiss);
  button("previews", "Page previews", "Pratinjau halaman", top, (e) => {
    if (!previews.hidden) {
      dismiss();
      return;
    }
    dismiss();
    returnFocus = e.currentTarget;
    overlay.classList.add("app-panel-open");
    state.showPreviews();
    previewTop.querySelector("button").focus();
  });
  const modes = textBook ? [["single", "Chapter", "Bab"], ["scroll", "Continuous", "Berkelanjutan"]] : [["single", "Single page", "Satu halaman"], ["book", "Spread", "Dua halaman"], ["manga", "Manga \xB7 RTL", "Manga \xB7 kanan ke kiri"], ["scroll", "Vertical \xB7 gaps", "Vertikal \xB7 bercelah"], ["webtoon", "Webtoon \xB7 seamless", "Webtoon \xB7 tanpa celah"]];
  const followAppearanceKey = viewer ? "sela-viewer:follow-app-appearance" : "sela-library:reader-follow-appearance";
  let followAppearance = !viewer;
  try {
    const saved = localStorage.getItem(followAppearanceKey);
    if (saved !== null) followAppearance = saved === "true";
  } catch {
  }
  let followAppearanceInput;
  function persistFollowAppearance() {
    try {
      localStorage.setItem(followAppearanceKey, String(followAppearance));
    } catch {
    }
  }
  function syncAppAppearance() {
    if (!followAppearance) return;
    const requested = document.documentElement.dataset.theme || "auto", theme = ["auto", "light", "dark"].includes(requested) ? requested : "auto";
    state.options.theme = theme;
    reader.options.theme = theme;
    overlay.dataset.selaTheme = theme;
    applyPalette(overlay.dataset.palette || "white", overlay);
    themeButton?.querySelector("path")?.setAttribute("d", appearanceIcon());
    themeButton?.setAttribute("aria-label", t("Appearance: ", "Tampilan: ") + theme);
  }
  const appearanceIcon = () => overlay.dataset.selaTheme === "dark" ? "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z" : overlay.dataset.selaTheme === "auto" ? "M3 4h18v13H3ZM8 21h8m-4-4v4" : paths.sun;
  const themeButton = button("sun", "Cycle appearance", "Ganti tampilan", top, () => {
    const values = ["auto", "light", "dark"];
    state.options.theme = values[(values.indexOf(overlay.dataset.selaTheme) + 1) % 3];
    reader.options.theme = state.options.theme;
    overlay.dataset.selaTheme = state.options.theme;
    applyPalette(overlay.dataset.palette || "white", overlay);
    if (!viewer && followAppearance) {
      document.documentElement.dataset.theme = state.options.theme;
      try {
        localStorage.setItem("sela-library:theme", state.options.theme);
      } catch {
      }
      document.dispatchEvent(new Event("sela:appearance"));
    } else if (viewer && followAppearance) {
      followAppearance = false;
      followAppearanceInput.checked = false;
      persistFollowAppearance();
    }
    themeButton.querySelector("path").setAttribute("d", appearanceIcon());
    themeButton.setAttribute("aria-label", t("Appearance: ", "Tampilan: ") + state.options.theme);
  });
  themeButton.setAttribute("aria-label", t("Appearance: ", "Tampilan: ") + overlay.dataset.selaTheme);
  themeButton.querySelector("path").setAttribute("d", appearanceIcon());
  const followRow = el("label", "tw:my-1 tw:flex tw:min-h-12 tw:items-center tw:justify-between tw:gap-3 tw:rounded-xl tw:border tw:border-sela-line tw:bg-sela-surface/75 tw:px-3 tw:py-2", drawer), followCopy = el("span", "tw:grid tw:gap-0.5", followRow);
  el("strong", "tw:text-xs tw:font-semibold tw:text-sela-ink", followCopy).textContent = t("Follow app appearance", "Ikuti tampilan aplikasi");
  el("small", "tw:text-[10px] tw:leading-4 tw:text-sela-muted", followCopy).textContent = t("Keep this reader in sync with the app theme.", "Selaraskan tampilan reader dengan tema aplikasi.");
  followAppearanceInput = el("input", "tw:size-5 tw:shrink-0 tw:accent-sela-accent", followRow);
  followAppearanceInput.type = "checkbox";
  followAppearanceInput.checked = followAppearance;
  followAppearanceInput.setAttribute("aria-label", t("Follow app appearance", "Ikuti tampilan aplikasi"));
  followAppearanceInput.onchange = () => {
    followAppearance = followAppearanceInput.checked;
    persistFollowAppearance();
    if (followAppearance) syncAppAppearance();
  };
  document.addEventListener("sela:appearance", syncAppAppearance);
  syncAppAppearance();
  themeButton.querySelector("path").setAttribute("d", appearanceIcon());
  const disposeProfiles = mountReaderProfiles(drawer, state, { t, onApplied: sync });
  const mode = choiceGrid("Reading mode", "Mode baca", modes, state.options.mode, (v) => reader.setMode(v), textBook ? [["For book chapters", "Untuk bab buku"], ["One long page", "Satu halaman panjang"]] : [["A page at a time", "Satu halaman setiap kali"], ["Two pages together", "Dua halaman berdampingan"], ["Right-to-left reading", "Membaca kanan ke kiri"], ["Vertical with page gaps", "Vertikal dengan jarak"], ["Long, seamless comic", "Komik panjang tanpa celah"]]);
  const fitSelect = !textBook ? choiceGrid("Page fit", "Ukuran halaman", [["page", "Fit screen", "Pas layar"], ["width", "Fit width", "Pas lebar"], ["original", "Original size", "Ukuran asli"]], state.options.fit || "page", (v) => reader.setFit(v), [["Use the available height", "Gunakan tinggi layar"], ["Use the available width", "Gunakan lebar layar"], ["Keep the source size", "Pertahankan ukuran asli"]]) : null;
  const zoom = el("div", "app-reading-zoom", drawer);
  button("minus", "Zoom out", "Perkecil", zoom, () => reader.zoomOut());
  el("span", "", zoom).textContent = t("Zoom", "Zoom");
  button("plus", "Zoom in", "Perbesar", zoom, () => reader.zoomIn());
  const ranges = [];
  function range(en, id, key2, min, max, step, fallback) {
    const label = el("label", "app-reading-field", drawer);
    el("span", "", label).textContent = t(en, id);
    const input = el("input", "", label);
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = state.options[key2] ?? fallback;
    input.setAttribute("aria-label", t(en, id));
    input.oninput = () => reader.setTypography({ [key2]: Number(input.value) });
    ranges.push({ input, key: key2, fallback });
  }
  range("Brightness", "Kecerahan", "brightness", 0.35, 1.25, 0.05, 1);
  if (textBook) {
    range("Font size", "Ukuran teks", "fontSize", 12, 36, 1, 18);
    range("Line spacing", "Jarak baris", "lineHeight", 1.2, 2.4, 0.1, 1.7);
  } else range("Crop margins", "Pangkas tepi", "cropMargin", 0, 15, 1, 0);
  const pageFilter = select("Page filter", "Filter halaman", [["none", "Original", "Asli"], ["grayscale", "Black & white", "Hitam putih"], ["sepia", "Sepia", "Sepia"], ["invert", "Inverted", "Terbalik"], ["contrast", "High contrast", "Kontras tinggi"], ["warm", "Warm", "Hangat"], ["cool", "Cool", "Sejuk"], ["night", "Night", "Malam"], ["paper", "Paper", "Kertas"], ["soft", "Soft", "Lembut"], ["saturated", "Vivid", "Pekat"], ["lowblue", "Amber", "Amber"]], state.options.filter || "none", (v) => reader.setFilter(v));
  const pageSurface = select("Page material", "Material halaman", [["smooth", "Smooth paper", "Kertas halus"], ["rough", "Deckled paper", "Kertas bertekstur"], ["vellum", "Soft vellum", "Kertas buram"], ["lined", "Ruled paper", "Kertas bergaris"], ["laid", "Laid paper", "Kertas serat silang"], ["woven", "Woven paper", "Kertas tenun"]], state.options.pageSurface || (state.options.paperTexture ? "vellum" : "smooth"), (value) => state.setPreferences({ pageSurface: value }));
  const advanced = el("button", "app-advanced", drawer);
  advanced.type = "button";
  advanced.textContent = t("All reading tools", "Semua alat baca");
  advanced.onclick = (e) => openTools("appearance", e);
  const sound = select("Page sound", "Suara halaman", [["off", "Off", "Mati"], ["on", "On", "Aktif"]], state.sound ? "on" : "off", (v) => {
    if (state.sound !== (v === "on")) controls.sound.click();
  });
  overlay.addEventListener("sela:sound", () => sound.value = state.sound ? "on" : "off");
  const keep = el("label", "app-reading-field", drawer);
  el("span", "", keep).textContent = t("Keep screen awake", "Jaga layar menyala");
  const awake = el("input", "", keep);
  awake.type = "checkbox";
  awake.disabled = !navigator.wakeLock;
  awake.setAttribute("aria-label", t("Keep screen awake", "Jaga layar menyala"));
  let lock = null, disposed = false;
  async function release() {
    const current = lock;
    lock = null;
    await current?.release().catch(() => {
    });
  }
  async function acquire() {
    if (!awake.checked || document.visibilityState !== "visible" || disposed) return;
    try {
      const result = await navigator.wakeLock.request("screen");
      if (disposed || !awake.checked) {
        await result.release();
        return;
      }
      lock = result;
      result.addEventListener("release", () => {
        if (lock === result) lock = null;
      });
    } catch {
      awake.checked = false;
      notice.textContent = t("Screen wake lock unavailable.", "Penjaga layar belum tersedia.");
      notify(notice.textContent, "error");
    }
  }
  awake.onchange = () => awake.checked ? acquire() : release();
  const visibility = () => document.hidden ? release() : acquire();
  document.addEventListener("visibilitychange", visibility);
  const palettes = el("div", "app-reader-palettes", drawer);
  el("h3", "", palettes).textContent = t("App palette", "Palet aplikasi");
  const updatePalette = mountPalettes(palettes, t, paletteTarget);
  const syncPalette = () => {
    const key2 = paletteTarget.dataset.palette || "white";
    if (!viewer) applyPalette(key2, overlay);
    const definition = getPaletteDefinition(key2);
    paletteMark.replaceChildren(controlIcon(definition.motif));
    paletteMark.title = t(definition.en, definition.id);
    updatePalette();
  };
  palettes.addEventListener("click", (event) => {
    if (event.target.closest("[data-palette-choice]")) syncPalette();
  });
  syncPalette();
  document.addEventListener("sela:palette", syncPalette);
  function sync() {
    if (tools.querySelector(".app-saved-marks")) refreshMarks();
    if (reader.book) reader.book.toggleFullscreen = fullscreen;
    const page = reader.currentPage(), total = reader.totalPages, label = state.pageLabels?.[page - 1];
    counter.textContent = (label && label !== String(page) ? label + " \xB7 " : "") + page + " / " + total;
    seek.max = String(total);
    seek.value = String(page);
    mode.value = state.options.mode;
    if (fitSelect) fitSelect.value = state.options.fit || "page";
    for (const item of ranges) item.input.value = state.options[item.key] ?? item.fallback;
    overlay.dataset.readingDirection = state.options.mode === "manga" ? "rtl" : "ltr";
    pageFilter.value = state.options.filter || "none";
    pageSurface.value = state.options.pageSurface || (state.options.paperTexture ? "vellum" : "smooth");
    bookmark.setAttribute("aria-pressed", controls.bookmark.getAttribute("aria-pressed") || "false");
  }
  const internalBookmark = controls.bookmark;
  internalBookmark?.addEventListener("click", sync);
  host.addEventListener("flipbook:pagechange", sync);
  host.addEventListener("flipbook:ready", sync);
  overlay.addEventListener("sela:preferences", sync);
  overlay.addEventListener("sela:bookmarks", sync);
  sync();
  if (state.options.presentation !== "inline") host.focus();
  const key = (e) => {
    const nativeDialog = document.querySelector("dialog[open]");
    if (nativeDialog && !(nativeDialog.classList.contains("book-info-dialog") && nativeDialog.dataset.closing === "true")) return;
    if (e.key !== "Escape" || !overlay.isConnected) return;
    if (overlay.querySelector(".sela-shortcuts:not([hidden]),.sela-tools:not([hidden]),.sela-footnote[open]")) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!drawer.hidden || !tools.hidden || !infoPanel.hidden || !sharePanel.panel.hidden || !previews.hidden) {
      dismiss();
      return;
    }
    reader.close();
  };
  document.addEventListener("keydown", key, true);
  const measure = () => overlay.dataset.compact = String(shell.clientWidth < 600);
  const sizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
  sizeObserver?.observe(shell);
  window.addEventListener("resize", measure);
  measure();
  const credit = el("a", "sela-credit", drawer);
  credit.textContent = "Sela Books \xB7 \xA9 " + (/* @__PURE__ */ new Date()).getFullYear();
  credit.href = "https://github.com/bobbyfch/sela";
  credit.target = "_blank";
  credit.rel = "noopener noreferrer";
  function dispose() {
    finishPanels.forEach((f) => f());
    disposeAudio();
    disposeProfiles();
    sizeObserver?.disconnect();
    window.removeEventListener("resize", measure);
    if (disposed) return;
    disposed = true;
    internalBookmark?.removeEventListener("click", sync);
    overlay.removeEventListener("sela:share-quote", shareQuote);
    overlay.removeEventListener("sela:dictionary", dictionaryEvent);
    void release();
    document.removeEventListener("sela:palette", syncPalette);
    document.removeEventListener("sela:appearance", syncAppAppearance);
    document.removeEventListener("keydown", key, true);
    document.removeEventListener("visibilitychange", visibility);
    cleanup.disconnect();
    reader.removeEventListener("close", dispose);
  }
  const cleanup = new MutationObserver(() => {
    if (!overlay.isConnected) dispose();
  });
  cleanup.observe(document.body, { childList: true });
  reader.addEventListener("close", dispose, { once: true });
}
