// Generated from app/library/quran-reader.ts by npm run build. Do not edit.
import { quranSceneBackgroundForSurah, QURAN_STUDY_SOURCES, listQuranTranslations, quranKemenagSurahUrl, quranSurahCatalog } from "./scripture-sources.js";
export function mountQuranReader(overlay, top, reader, metadata, t) {
  const menu = document.createElement("div");
  menu.className = "app-quran-menu";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "app-reader-icon app-quran-trigger";
  trigger.setAttribute("aria-label", t("Open Quran settings", "Buka pengaturan Al-Qur\u2019an"));
  trigger.title = trigger.getAttribute("aria-label") || "";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-haspopup", "true");
  trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.8c2.8-1.1 5.6-.8 8 1v14c-2.4-1.8-5.2-2.1-8-1zm16 0c-2.8-1.1-5.6-.8-8 1v14c2.4-1.8 5.2-2.1 8-1z"/><path d="M6.5 8.1c1.6-.4 3.1-.2 4.5.5m-4.5 2c1.6-.4 3.1-.2 4.5.5m6-3c-1.6-.4-3.1-.2-4.5.5m4.5 2c-1.6-.4-3.1-.2-4.5.5"/></svg>';
  const nav = document.createElement("section");
  nav.className = "app-quran-navigation";
  nav.id = "sela-quran-controls";
  nav.tabIndex = -1;
  nav.hidden = true;
  nav.setAttribute("aria-label", t("Quran reader controls", "Pengaturan pembaca Al-Qur\u2019an"));
  trigger.setAttribute("aria-controls", nav.id);
  menu.append(trigger, nav);
  const setOpen = (open, restoreFocus = false) => {
    nav.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", t(open ? "Close Quran settings" : "Open Quran settings", open ? "Tutup pengaturan Al-Qur\u2019an" : "Buka pengaturan Al-Qur\u2019an"));
    trigger.title = trigger.getAttribute("aria-label") || "";
    if (restoreFocus) trigger.focus();
  };
  const toggle = () => setOpen(nav.hidden !== false);
  const outside = (event) => {
    if (!menu.contains(event.target)) setOpen(false);
  };
  const keydown = (event) => {
    if (event.key === "Escape" && !nav.hidden) {
      event.preventDefault();
      setOpen(false, true);
    }
  };
  trigger.addEventListener("click", toggle);
  document.addEventListener("pointerdown", outside);
  document.addEventListener("keydown", keydown);
  let disposed = false, removalObserver;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    removalObserver?.disconnect();
    trigger.removeEventListener("click", toggle);
    document.removeEventListener("pointerdown", outside);
    document.removeEventListener("keydown", keydown);
    menu.remove();
  };
  const heading = document.createElement("div");
  heading.className = "app-quran-heading";
  const mark = document.createElement("span");
  mark.className = "app-quran-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3.5 5.2c3.1-.9 6-.5 8.5 1.3v13c-2.5-1.8-5.4-2.2-8.5-1.3zm17 0c-3.1-.9-6-.5-8.5 1.3v13c2.5-1.8 5.4-2.2 8.5-1.3z"/><path d="M6.2 8.2c1.7-.3 3.2 0 4.5.7v1.7c-1.3-.7-2.8-1-4.5-.7zm11.6 0c-1.7-.3-3.2 0-4.5.7v1.7c1.3-.7 2.8-1 4.5-.7z"/></svg>';
  const title = document.createElement("div");
  title.className = "app-quran-heading-copy";
  const titleText = document.createElement("strong");
  titleText.textContent = t("Reading the Quran", "Membaca Al-Qur\u2019an");
  const subtitle = document.createElement("span");
  subtitle.textContent = t("Choose a surah, verse, and translation", "Pilih surat, ayat, dan terjemahan");
  title.append(titleText, subtitle);
  heading.append(mark, title);
  const close = document.createElement("button");
  close.type = "button";
  close.className = "app-quran-close";
  close.setAttribute("aria-label", t("Close panel", "Tutup panel"));
  close.title = close.getAttribute("aria-label") || "";
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  close.onclick = () => setOpen(false, true);
  heading.append(close);
  nav.append(heading);
  const form = document.createElement("form");
  form.className = "app-quran-navigation-row";
  nav.append(form);
  const field = (name, labelText, control, extra = "") => {
    const wrap = document.createElement("label");
    wrap.className = `app-quran-field ${extra}`;
    const caption = document.createElement("span");
    caption.textContent = labelText;
    wrap.append(caption, control);
    form.append(wrap);
    return wrap;
  };
  const surah = document.createElement("select");
  surah.setAttribute("aria-label", t("Surah", "Surat"));
  for (const item of quranSurahCatalog()) {
    const option = document.createElement("option");
    option.value = String(item.number);
    option.textContent = `${item.number}. ${item.name}`;
    surah.append(option);
  }
  surah.value = String(metadata.surah);
  field("surah", t("Surah", "Surat"), surah, "app-quran-surah-field");
  const verse = document.createElement("input");
  verse.type = "number";
  verse.inputMode = "numeric";
  verse.min = "1";
  verse.max = String(metadata.verseCount);
  verse.step = "1";
  verse.value = String(metadata.startVerse);
  verse.setAttribute("aria-label", t("Verse number", "Nomor ayat"));
  field("verse", t("Verse", "Ayat"), verse, "app-quran-verse-field");
  const language = document.createElement("select");
  language.setAttribute("aria-label", t("Translation language", "Bahasa terjemahan"));
  for (const [code, name] of [["id", "Bahasa Indonesia"], ["en", "English"], ["ja", "\u65E5\u672C\u8A9E"]]) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    language.append(option);
  }
  language.value = metadata.language;
  field("language", t("Language", "Bahasa"), language, "app-quran-language-field");
  const edition = document.createElement("select");
  edition.setAttribute("aria-label", t("Translation edition", "Edisi terjemahan"));
  field("edition", t("Translation", "Terjemahan"), edition, "app-quran-edition-field");
  const go = document.createElement("button");
  go.type = "submit";
  go.className = "app-quran-go";
  go.textContent = t("Go", "Buka");
  form.append(go);
  const display = document.createElement("div");
  display.className = "app-quran-display-settings";
  display.setAttribute("aria-label", t("Text size", "Ukuran teks"));
  nav.append(display);
  const study = document.createElement("section");
  study.className = "app-quran-study-links";
  study.setAttribute("aria-labelledby", "sela-quran-study-heading");
  const studyHeading = document.createElement("strong");
  studyHeading.className = "app-quran-study-heading";
  studyHeading.id = "sela-quran-study-heading";
  studyHeading.textContent = t("Study this surah", "Pelajari surat ini");
  study.append(studyHeading);
  const studyList = document.createElement("div");
  studyList.className = "app-quran-study-list";
  study.append(studyList);
  const studyItems = [
    { label: t("Surah name, revelation period, Latin and tafsir \xB7 Kemenag", "Nama surat, periode pewahyuan, Latin & tafsir \xB7 Kemenag"), url: () => quranKemenagSurahUrl(Number(surah.value)) },
    { label: t("Meanings of all surah names \xB7 LPMQ", "Makna nama seluruh surat \xB7 LPMQ"), url: () => QURAN_STUDY_SOURCES.surahNames },
    { label: t("Revelation periods: Makki and Madani \xB7 LPMQ", "Periode pewahyuan: Makki dan Madani \xB7 LPMQ"), url: () => QURAN_STUDY_SOURCES.revelationPeriod },
    { label: t("Asbabun Nuzul \xB7 LPMQ", "Asbabun Nuzul \xB7 LPMQ"), url: () => QURAN_STUDY_SOURCES.asbabunNuzul },
    { label: t("Stories of prophets before Ibrahim \xB7 LPMQ", "Kisah nabi sebelum Ibrahim \xB7 LPMQ"), url: () => QURAN_STUDY_SOURCES.prophetStories },
    { label: t("Prophethood in the Quran \xB7 LPMQ", "Kenabian dalam Al-Qur\u2019an \xB7 LPMQ"), url: () => QURAN_STUDY_SOURCES.prophethood },
    { label: t("Color tajwid and Latin guide \xB7 Juz Amma", "Panduan tajwid warna dan Latin \xB7 Juz Amma"), url: () => QURAN_STUDY_SOURCES.tajweedLatinJuzAmma }
  ];
  const currentStudyLink = studyItems[0];
  for (const item of studyItems) {
    const link = document.createElement("a");
    link.className = "app-quran-study-link";
    link.href = item.url();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.label;
    studyList.append(link);
  }
  const studyNote = document.createElement("small");
  studyNote.className = "app-quran-study-note";
  studyNote.textContent = t("Color tajwid PDF covers Juz Amma. Official tafsir and Latin text open on the Kemenag site.", "PDF tajwid warna khusus Juz Amma. Tafsir resmi dan tulisan Latin dibuka di situs Kemenag.");
  study.append(studyNote);
  nav.append(study);
  const status = document.createElement("span");
  status.className = "app-quran-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  nav.append(status);
  const article = reader.book?.article, scene = article?.querySelector("#quran-reading-scene"), root = article?.getRootNode();
  if (scene && root instanceof ShadowRoot && !root.querySelector("[data-sela-quran-scene-style]")) {
    const style = document.createElement("style");
    style.dataset.selaQuranSceneStyle = "";
    style.textContent = `#quran-reading-scene{box-sizing:border-box;min-height:clamp(150px,24vw,230px);display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:.35rem;margin:0 0 1rem;padding:clamp(1.25rem,4vw,2rem);overflow:hidden;border:1px solid color-mix(in srgb,#4f9baa 22%,transparent);border-radius:26px;background-color:color-mix(in srgb,currentColor 4%,transparent);background-image:linear-gradient(90deg,#f7fdff12,#f7fdff8c),${quranSceneBackgroundForSurah(Number(scene.dataset.surah) || 1)};background-position:center;background-size:cover;color:#294d58}#quran-reading-scene>span:first-child{margin:0;font:700 .7rem/1.3 system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;opacity:.72}#quran-reading-scene>strong{max-width:28ch;font:600 clamp(1.2rem,3vw,1.8rem)/1.25 system-ui,sans-serif;overflow-wrap:anywhere}#quran-reading-scene>span:last-child{font:500 .82rem/1.4 system-ui,sans-serif;opacity:.8}.quran-verse{box-sizing:border-box;padding:1.25rem 1.5rem;margin:1rem 0;border:1px solid color-mix(in srgb,currentColor 13%,transparent);border-radius:22px;background-color:color-mix(in srgb,currentColor 3%,transparent);background-image:linear-gradient(110deg,color-mix(in srgb,currentColor 2%,transparent),color-mix(in srgb,#9bdae3 12%,transparent));box-shadow:0 8px 24px #2d66850c}`;
    root.append(style);
  }
  let currentLanguage = metadata.language, currentEdition = metadata.translationKey, arabicSize = metadata.arabicSize, translationSize = metadata.translationSize, editionRequest = 0;
  const pushPreferences = () => overlay.dispatchEvent(new CustomEvent("sela:quran-preferences", { bubbles: true, detail: { language: currentLanguage, translationKey: currentEdition, surah: Number(surah.value), verse: Number(verse.value) || 1, arabicSize, translationSize } }));
  const resizeText = () => {
    const article2 = reader.book?.article;
    if (!article2) return;
    article2.querySelectorAll(".quran-arabic").forEach((element) => element.style.fontSize = `${arabicSize}px`);
    article2.querySelectorAll(".quran-translation").forEach((element) => element.style.fontSize = `${translationSize}px`);
  };
  const sizeControl = (key, labelText, initial, min, max) => {
    let value = initial;
    const group = document.createElement("div");
    group.className = "app-quran-size-control";
    const label = document.createElement("span");
    label.textContent = labelText;
    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "\u2212";
    down.setAttribute("aria-label", key === "arabic" ? t("Decrease Arabic text size", "Kecilkan teks Arab") : t("Decrease translation text size", "Kecilkan teks terjemahan"));
    const output = document.createElement("output");
    output.setAttribute("aria-live", "polite");
    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "+";
    up.setAttribute("aria-label", key === "arabic" ? t("Increase Arabic text size", "Besarkan teks Arab") : t("Increase translation text size", "Besarkan teks terjemahan"));
    const paint = () => {
      output.textContent = `${value}px`;
      down.disabled = value <= min;
      up.disabled = value >= max;
    };
    const changed = (amount) => {
      value = Math.max(min, Math.min(max, value + amount));
      if (key === "arabic") arabicSize = value;
      else translationSize = value;
      paint();
      resizeText();
      pushPreferences();
    };
    down.onclick = () => changed(-2);
    up.onclick = () => changed(2);
    group.append(label, down, output, up);
    display.append(group);
    paint();
    return { get value() {
      return value;
    } };
  };
  sizeControl("arabic", t("Arabic", "Arab"), arabicSize, 20, 48);
  sizeControl("translation", t("Translation", "Terjemahan"), translationSize, 14, 28);
  const keepCurrentEdition = () => {
    edition.replaceChildren();
    const option = document.createElement("option");
    option.value = currentEdition;
    option.textContent = [metadata.translationTitle, metadata.version && `v${metadata.version}`].filter(Boolean).join(" \xB7 ") || currentEdition;
    edition.append(option);
    edition.value = currentEdition;
  };
  keepCurrentEdition();
  async function loadEditions(targetLanguage, preferred = currentEdition) {
    const request = ++editionRequest;
    currentLanguage = targetLanguage;
    language.value = targetLanguage;
    edition.disabled = true;
    go.disabled = true;
    status.textContent = t("Loading translations\u2026", "Memuat terjemahan\u2026");
    try {
      const editions = await listQuranTranslations(targetLanguage);
      if (request !== editionRequest) return;
      edition.replaceChildren();
      for (const item of editions) {
        const option = document.createElement("option");
        option.value = item.key;
        option.textContent = `${item.title} \xB7 v${item.version}`;
        edition.append(option);
      }
      const chosen = editions.find((item) => item.key === preferred) || editions[0];
      if (!chosen) throw Error(t("No translation editions were returned.", "Tidak ada edisi terjemahan yang tersedia."));
      edition.value = chosen.key;
      currentEdition = chosen.key;
      edition.disabled = false;
      go.disabled = false;
      status.textContent = editions.length > 1 ? t("Choose a source edition, then open the selected passage.", "Pilih edisi sumber, lalu buka bacaan yang dipilih.") : t("Source edition ready.", "Edisi sumber siap.");
    } catch (error) {
      if (request !== editionRequest) return;
      keepCurrentEdition();
      edition.disabled = false;
      go.disabled = false;
      status.textContent = error instanceof Error ? error.message : t("Translations are temporarily unavailable.", "Terjemahan belum tersedia sementara.");
    }
  }
  language.onchange = () => void loadEditions(language.value, "");
  edition.onchange = () => {
    currentEdition = edition.value;
  };
  surah.onchange = () => {
    verse.value = "1";
    if (Number(surah.value) === metadata.surah) verse.max = String(metadata.verseCount);
    else verse.removeAttribute("max");
    const link = studyList.firstElementChild;
    if (link && currentStudyLink) link.href = currentStudyLink.url();
  };
  form.onsubmit = (event) => {
    event.preventDefault();
    const targetSurah = Number(surah.value), targetVerse = Number(verse.value);
    if (!Number.isInteger(targetVerse) || targetVerse < 1) {
      verse.reportValidity();
      return;
    }
    if (targetSurah === metadata.surah && targetVerse > metadata.verseCount && currentEdition === metadata.translationKey && currentLanguage === metadata.language) {
      verse.reportValidity();
      return;
    }
    if (targetSurah === metadata.surah && currentEdition === metadata.translationKey && currentLanguage === metadata.language) {
      const anchor = `quran-verse-${targetVerse}`;
      if (!reader.book?.article?.querySelector(`#${anchor}`)) {
        status.textContent = t("That verse is not available in this edition.", "Ayat itu tidak tersedia pada edisi ini.");
        return;
      }
      reader.book.goToLocation({ anchor });
      metadata.startVerse = targetVerse;
      pushPreferences();
      return;
    }
    go.disabled = true;
    status.textContent = t("Opening the selected passage\u2026", "Membuka bacaan pilihan\u2026");
    const complete = (error) => {
      go.disabled = false;
      status.textContent = error instanceof Error ? error.message : t("Passage opened.", "Bacaan dibuka.");
    };
    overlay.dispatchEvent(new CustomEvent("sela:quran-navigate", { bubbles: true, detail: { surah: targetSurah, verse: targetVerse, language: currentLanguage, translationKey: currentEdition, arabicSize, translationSize, complete } }));
  };
  top.append(menu);
  removalObserver = new MutationObserver(() => {
    if (!overlay.isConnected) cleanup();
  });
  removalObserver.observe(document.documentElement, { childList: true, subtree: true });
  resizeText();
  if (metadata.startVerse > 1) requestAnimationFrame(() => reader.book?.goToLocation({ anchor: `quran-verse-${metadata.startVerse}` }));
  void loadEditions(metadata.language, metadata.translationKey);
  return cleanup;
}
