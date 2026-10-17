// Generated from app/library/home-atmosphere.ts by npm run build. Do not edit.
import { responseText } from "./network.js";
import { readPersonal, editPersonal } from "./personal-store.js";
import { iconAction, notify } from "./controls.js";
import { APP_LANGUAGES, localeBase, translate } from "../dist/source/src/i18n.js";
import { loadFaithReading } from "./scripture-sources.js";
const reflections = {
  reading: [["A few pages are enough for today.", "Beberapa halaman cukup untuk hari ini."], ["An unfinished book still has a place here.", "Buku yang belum selesai masih punya tempat di sini."], ["Read at your own pace.", "Baca dengan kecepatanmu sendiri."], ["Return to a favorite passage.", "Kembali ke penggalan favoritmu."]],
  calm: [["Leave a little room for quiet.", "Sisakan tempat untuk tenang."], ["Rest is part of reading time.", "Istirahat juga bagian dari membaca."]],
  courage: [["A small beginning is still a beginning.", "Awal kecil tetap sebuah awal."], ["You can begin again without rushing.", "Kamu bisa mulai lagi tanpa terburu-buru."]],
  life: [["Make room for a different point of view.", "Sisakan tempat untuk sudut pandang berbeda."], ["Today need not look like yesterday.", "Hari ini tak harus seperti kemarin."]],
  friendship: [["A shared story opens a conversation.", "Cerita bersama membuka percakapan."], ["Leave a page for someone you care about.", "Sisakan halaman untuk orang yang kamu sayangi."]],
  creativity: [["Let a question stay open a while.", "Biarkan pertanyaan terbuka sebentar."], ["A margin can hold a new idea.", "Tepi halaman bisa menyimpan ide baru."]],
  spiritual: [["Take a quiet moment for gratitude.", "Ambil waktu tenang untuk bersyukur."], ["Give reflection a little space today.", "Beri renungan sedikit ruang hari ini."]]
};
const categoryTerms = {
  reading: { en: "Reading", id: "Membaca", ja: "\u8AAD\u66F8", es: "Lectura", fr: "Lecture", de: "Lesen", pt: "Leitura", zh: "\u9605\u8BFB", ko: "\uB3C5\uC11C" },
  calm: { en: "Peace", id: "Ketenangan", ja: "\u5E73\u548C", es: "Paz", fr: "Paix", de: "Frieden", pt: "Paz", zh: "\u5E73\u9759", ko: "\uD3C9\uD654" },
  courage: { en: "Courage", id: "Keberanian", ja: "\u52C7\u6C17", es: "Valent\xEDa", fr: "Courage", de: "Mut", pt: "Coragem", zh: "\u52C7\u6C14", ko: "\uC6A9\uAE30" },
  life: { en: "Life", id: "Kehidupan", ja: "\u4EBA\u751F", es: "Vida", fr: "Vie", de: "Leben", pt: "Vida", zh: "\u751F\u6D3B", ko: "\uC0B6" },
  friendship: { en: "Friendship", id: "Persahabatan", ja: "\u53CB\u60C5", es: "Amistad", fr: "Amiti\xE9", de: "Freundschaft", pt: "Amizade", zh: "\u53CB\u8C0A", ko: "\uC6B0\uC815" },
  creativity: { en: "Creativity", id: "Kreativitas", ja: "\u5275\u9020\u6027", es: "Creatividad", fr: "Cr\xE9ativit\xE9", de: "Kreativit\xE4t", pt: "Criatividade", zh: "\u521B\u9020\u529B", ko: "\uCC3D\uC758\uC131" },
  spiritual: { en: "Wisdom", id: "Kebijaksanaan", ja: "\u77E5\u6075", es: "Sabidur\xEDa", fr: "Sagesse", de: "Weisheit", pt: "Sabedoria", zh: "\u667A\u6167", ko: "\uC9C0\uD61C" }
};
function appLanguage() {
  return localeBase(document.documentElement.lang || navigator.language || "en");
}
function selectedLanguage() {
  const value = readPersonal().quoteLanguage;
  return value === "auto" ? appLanguage() : value;
}
function cachedRows(topic, language) {
  try {
    const cache = JSON.parse(localStorage.getItem("sela-library:quote-cache") || "null");
    if (topic === "faith" && (cache?.faith !== readPersonal().faith || cache?.date !== (/* @__PURE__ */ new Date()).toISOString().slice(0, 10))) return [];
    return cache?.topic === topic && Array.isArray(cache.rows) ? cache.rows.filter((row) => typeof row.content === "string" && typeof row.author === "string" && (!row.language || row.language === language)) : [];
  } catch {
    return [];
  }
}
async function fetchSourcedQuotes(topic, language) {
  const host = language === "zh" ? "zh" : language, term = categoryTerms[topic]?.[language] || categoryTerms[topic]?.en || categoryTerms.reading[language] || categoryTerms.reading.en, base = `https://${host}.wikiquote.org/w/api.php?`, searchUrl = base + new URLSearchParams({ action: "query", list: "search", srsearch: term, format: "json", origin: "*", srlimit: "5" }), search = await fetch(searchUrl, { signal: AbortSignal.timeout(1e4), credentials: "omit", referrerPolicy: "no-referrer" });
  if (!search.ok) throw Error("Wikiquote unavailable");
  const results = JSON.parse(await responseText(search)), matches = results.query?.search;
  if (!Array.isArray(matches)) return [];
  const rows = [];
  for (const match of matches.slice(0, 4)) {
    if (!match?.pageid) continue;
    const pageUrl = base + new URLSearchParams({ action: "parse", pageid: String(match.pageid), prop: "text", format: "json", origin: "*" }), response = await fetch(pageUrl, { signal: AbortSignal.timeout(1e4), credentials: "omit", referrerPolicy: "no-referrer" });
    if (!response.ok) continue;
    const data = JSON.parse(await responseText(response)), html = data.parse?.text?.["*"];
    if (typeof html !== "string") continue;
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script,style,.navbox,.toc,.mw-editsection").forEach((element) => element.remove());
    let currentAuthor = String(data.parse.title || match.title || ""), currentAuthorUrl = `https://${host}.wikiquote.org/wiki/${encodeURIComponent(currentAuthor.replaceAll(" ", "_"))}`;
    for (const element of [...doc.querySelectorAll("h2,h3,h4,li")]) {
      if (/^H[234]$/.test(element.tagName)) {
        const heading = element.querySelector(".mw-headline")?.textContent || element.textContent || "";
        currentAuthor = heading.replace(/\[edit\]/gi, "").trim() || currentAuthor;
        currentAuthorUrl = `https://${host}.wikiquote.org/wiki/${encodeURIComponent(currentAuthor.replaceAll(" ", "_"))}`;
        continue;
      }
      if (element.parentElement?.closest("li")) continue;
      const content = element.textContent?.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim() || "";
      if (content.length < 30 || content.length > 1e3) continue;
      const cite = element.querySelector("cite"), link = cite?.querySelector('a[href^="/wiki/"]') || element.querySelector('a[href^="/wiki/"]'), author = (cite?.textContent || link?.textContent || currentAuthor).replace(/^\s*[—–-]\s*/, "").trim().slice(0, 100), href = link?.getAttribute("href"), authorUrl = href && /^\/wiki\/[^#?]+$/.test(href) ? `https://${host}.wikiquote.org${href}` : currentAuthorUrl, sourceUrl = `https://${host}.wikiquote.org/wiki/${encodeURIComponent(String(data.parse.title || match.title || "").replaceAll(" ", "_"))}`;
      rows.push({ content, author, language, source: "Wikiquote", sourceUrl: authorUrl || sourceUrl });
      if (rows.length >= 20) break;
    }
    if (rows.length >= 12) break;
  }
  return rows;
}
export function readingNote(t, index = 0) {
  const p = readPersonal(), language = p.quoteLanguage === "auto" ? appLanguage() : p.quoteLanguage, personal = p.quoteTopic === "personal" ? Object.values(p.books).map((book) => book.quote).filter((value) => typeof value === "string" && !!value.trim()) : [];
  if (personal.length) return { quote: personal[Math.abs(index) % personal.length], source: t("From your notebook", "Dari notebook-mu") };
  const rows = cachedRows(p.quoteTopic, language);
  if (rows.length) {
    const row2 = rows[Math.abs(index) % rows.length];
    return { quote: row2.content, source: row2.author, sourceUrl: row2.sourceUrl, portrait: row2.portrait, author: row2.author, row: row2 };
  }
  if (p.quoteTopic === "faith") return p.faith === "none" ? { quote: t("Choose a faith in Settings to see a sourced scripture passage.", "Pilih agama di Pengaturan untuk melihat kutipan kitab suci beserta sumbernya."), source: t("Scripture collection", "Koleksi kitab suci") } : { quote: t("Finding a passage from your selected scripture\u2026", "Mencari kutipan dari kitab pilihanmu\u2026"), source: t("Sourced scripture", "Kitab suci bersumber") };
  const values = reflections[p.quoteTopic] || reflections.reading, row = values[Math.abs(index) % values.length];
  return { quote: translate(row[0], row[1], language), source: "Sela \xB7 " + t("a little reflection", "renungan kecil") };
}
export function mountAtmosphere(home, { t }) {
  const intro = home.querySelector(".room-intro"), greeting = intro.querySelector(".eyebrow");
  void import("./home-world.js").then(({ mountHomeWorld }) => mountHomeWorld(home)).catch(() => {
    home.dataset.world = "fallback";
  });
  const section = document.createElement("section");
  section.className = "home-reflection";
  home.append(section);
  const portrait = document.createElement("img");
  portrait.className = "home-quote-portrait";
  portrait.alt = "";
  portrait.hidden = true;
  portrait.referrerPolicy = "no-referrer";
  const copy = document.createElement("div");
  copy.className = "home-quote-copy";
  const label = document.createElement("small"), quote = document.createElement("p");
  copy.append(label, quote);
  section.append(portrait, copy);
  const actions = document.createElement("div");
  actions.className = "reflection-actions";
  section.append(actions);
  const refresh = iconAction(document.createElement("button"), "refresh", t("Another reading note", "Catatan baca lainnya"));
  refresh.type = "button";
  actions.append(refresh);
  const source = iconAction(document.createElement("button"), "info", t("View quote source", "Lihat sumber kutipan"));
  source.type = "button";
  source.hidden = true;
  actions.append(source);
  let index = 0, quoteRevision = 0;
  const quoteSettings = document.createElement("section");
  quoteSettings.className = "home-quote-settings";
  quoteSettings.setAttribute("aria-label", t("Quote preferences", "Preferensi kutipan"));
  const topicLabel = document.createElement("label");
  topicLabel.className = "home-quote-setting";
  const topicCaption = document.createElement("span");
  topicLabel.append(topicCaption);
  const topic = document.createElement("select");
  topic.setAttribute("aria-label", t("Quote topic", "Topik kutipan"));
  topicLabel.append(topic);
  quoteSettings.append(topicLabel);
  for (const [key, en, id] of [["reading", "Reading", "Membaca"], ["calm", "Calm", "Ketenangan"], ["courage", "Courage", "Semangat"], ["life", "Life", "Kehidupan"], ["friendship", "Friendship", "Persahabatan"], ["creativity", "Creativity", "Kreativitas"], ["spiritual", "Reflection", "Renungan"], ["faith", "Faith & scripture", "Agama & kitab suci"], ["personal", "My passages", "Kutipanku"]]) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = t(en, id);
    topic.append(option);
  }
  topic.value = readPersonal().quoteTopic;
  topic.onchange = () => editPersonal((p) => {
    p.quoteTopic = topic.value;
  });
  const languageLabel = document.createElement("label");
  languageLabel.className = "home-quote-setting";
  const languageCaption = document.createElement("span");
  languageLabel.append(languageCaption);
  const language = document.createElement("select");
  language.setAttribute("aria-label", t("Quote language", "Bahasa kutipan"));
  const auto = document.createElement("option");
  auto.value = "auto";
  auto.textContent = t("App language", "Bahasa app");
  language.append(auto);
  for (const item of APP_LANGUAGES) {
    if (item.base === "en") continue;
    const option = document.createElement("option");
    option.value = item.base;
    option.textContent = item.name;
    language.append(option);
  }
  const englishOption = document.createElement("option");
  englishOption.value = "en";
  englishOption.textContent = "English";
  language.append(englishOption);
  language.value = readPersonal().quoteLanguage;
  language.onchange = () => editPersonal((p) => {
    p.quoteLanguage = language.value;
  });
  languageLabel.append(language);
  quoteSettings.append(languageLabel);
  const searchStatus = document.createElement("p");
  searchStatus.className = "home-quote-status";
  searchStatus.setAttribute("role", "status");
  searchStatus.setAttribute("aria-live", "polite");
  quoteSettings.append(searchStatus);
  const fetchButton = document.createElement("button");
  fetchButton.type = "button";
  fetchButton.className = "home-quote-fetch";
  quoteSettings.append(fetchButton);
  const portraitRequests = /* @__PURE__ */ new Set();
  async function loadPortrait(row, revision) {
    if (!row.author || !row.sourceUrl || row.portrait) return;
    const key = (row.language || "en") + ":" + row.author;
    if (portraitRequests.has(key)) return;
    portraitRequests.add(key);
    try {
      const lang = row.language || "en", url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(row.author.replaceAll(" ", "_"))}`, response = await fetch(url, { signal: AbortSignal.timeout(7e3), credentials: "omit", referrerPolicy: "no-referrer", headers: { Accept: "application/json" } });
      if (!response.ok) return;
      const data = JSON.parse(await responseText(response, 256 * 1024)), portraitUrl = data.thumbnail?.source;
      if (typeof portraitUrl !== "string" || new URL(portraitUrl).hostname !== "upload.wikimedia.org" || !portraitUrl.startsWith("https://")) return;
      row.portrait = portraitUrl;
      const cache = JSON.parse(localStorage.getItem("sela-library:quote-cache") || "null");
      if (cache && Array.isArray(cache.rows)) {
        const target = cache.rows.find((item) => item.content === row.content && item.author === row.author);
        if (target) target.portrait = portraitUrl;
        localStorage.setItem("sela-library:quote-cache", JSON.stringify(cache));
      }
      if (revision === quoteRevision) {
        portrait.src = portraitUrl;
        portrait.alt = row.author;
        portrait.hidden = false;
      }
    } catch {
    }
  }
  async function findMoreQuotes() {
    const p = readPersonal(), language2 = p.quoteLanguage === "auto" ? appLanguage() : p.quoteLanguage;
    if (p.quoteTopic === "faith" || p.quoteTopic === "personal") {
      searchStatus.textContent = p.quoteTopic === "faith" ? t("Scripture passages update automatically from your selected faith.", "Bacaan kitab diperbarui otomatis mengikuti agama pilihanmu.") : t("Your saved notebook passages appear here.", "Kutipan notebook-mu tampil di sini.");
      return;
    }
    fetchButton.disabled = true;
    searchStatus.textContent = t("Looking for sourced quotes\u2026", "Mencari kutipan bersumber\u2026");
    try {
      const rows = await fetchSourcedQuotes(p.quoteTopic, language2);
      if (!rows.length) throw Error("No sourced quote was found");
      localStorage.setItem("sela-library:quote-cache", JSON.stringify({ topic: p.quoteTopic, language: language2, rows }));
      searchStatus.textContent = t("Sourced quotes are ready.", "Kutipan bersumber siap.");
      index = 0;
      localize();
    } catch {
      searchStatus.textContent = t("Wikiquote is unavailable. Offline reflections remain ready.", "Wikiquote belum tersedia. Renungan offline tetap siap.");
      notify(searchStatus.textContent, "info");
    } finally {
      fetchButton.disabled = false;
    }
  }
  fetchButton.onclick = () => void findMoreQuotes();
  function localize() {
    const p = readPersonal(), hour = (/* @__PURE__ */ new Date()).getHours(), english = hour >= 5 && hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night", indonesian = hour >= 5 && hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";
    greeting.textContent = t(english, indonesian);
    home.dataset.companion = p.companion;
    home.dataset.weather = document.documentElement.dataset.weatherStale === "true" ? "neutral" : document.documentElement.dataset.weather || "neutral";
    home.dataset.night = document.documentElement.dataset.weatherNight || String(hour < 6 || hour > 18);
    home.classList.toggle("quiet-scene", p.quiet);
    intro.querySelector("h1").textContent = p.room || t("Your little world of stories.", "Dunia kecil untuk cerita-ceritamu.");
    const note = readingNote(t, index), revision = ++quoteRevision;
    section.hidden = p.quoteTopic === "faith" && p.faith !== "none";
    quote.textContent = note.quote;
    label.textContent = note.source;
    portrait.hidden = true;
    portrait.removeAttribute("src");
    if (note.portrait) {
      portrait.src = note.portrait;
      portrait.alt = note.author || note.source;
      portrait.hidden = false;
    } else if (note.row) void loadPortrait(note.row, revision);
    source.hidden = !note.sourceUrl;
    if (note.sourceUrl) {
      source.onclick = () => window.open(note.sourceUrl, "_blank", "noopener,noreferrer");
      iconAction(source, "info", t("View quote source", "Lihat sumber kutipan"));
    }
    topicCaption.textContent = t("Quote theme", "Tema kutipan");
    languageCaption.textContent = t("Quote language", "Bahasa kutipan");
    topic.value = p.quoteTopic;
    language.value = p.quoteLanguage;
    fetchButton.textContent = t("Find sourced quotes", "Cari kutipan bersumber");
    fetchButton.hidden = p.quoteTopic === "faith" || p.quoteTopic === "personal";
    quoteSettings.classList.toggle("is-faith", p.quoteTopic === "faith");
  }
  refresh.onclick = () => {
    index++;
    localize();
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    quote.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 180 });
  };
  const attemptedQuoteFetches = /* @__PURE__ */ new Set();
  async function ensureQuoteCollection() {
    const p = readPersonal(), language2 = p.quoteLanguage === "auto" ? appLanguage() : p.quoteLanguage, date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), key = p.quoteTopic === "faith" ? `faith|${p.faith}|${language2}|${date}` : p.quoteTopic + "|" + language2;
    if (p.quoteTopic === "personal" || p.quoteTopic === "faith" && p.faith === "none" || cachedRows(p.quoteTopic, language2).length || attemptedQuoteFetches.has(key)) return;
    attemptedQuoteFetches.add(key);
    try {
      if (p.quoteTopic === "faith") {
        const item = await loadFaithReading(p.faith, language2), latest2 = readPersonal(), latestLanguage2 = latest2.quoteLanguage === "auto" ? appLanguage() : latest2.quoteLanguage;
        if (!item || latest2.quoteTopic !== "faith" || latest2.faith !== p.faith || latestLanguage2 !== language2) return;
        const rows2 = [{ content: item.text, author: `${item.reference} \xB7 ${item.attribution}`, language: item.language, source: item.faith, sourceUrl: item.sourceUrl }];
        localStorage.setItem("sela-library:quote-cache", JSON.stringify({ topic: "faith", faith: p.faith, date, language: language2, rows: rows2 }));
        localize();
        return;
      }
      const rows = await fetchSourcedQuotes(p.quoteTopic, language2), latest = readPersonal(), latestLanguage = latest.quoteLanguage === "auto" ? appLanguage() : latest.quoteLanguage;
      if (!rows.length || latest.quoteTopic !== p.quoteTopic || latestLanguage !== language2) return;
      localStorage.setItem("sela-library:quote-cache", JSON.stringify({ topic: p.quoteTopic, language: language2, rows }));
      localize();
    } catch {
    }
  }
  function refreshLocalized() {
    localize();
    void ensureQuoteCollection();
  }
  document.addEventListener("sela:personal", refreshLocalized);
  document.addEventListener("sela:language", refreshLocalized);
  document.querySelector("#default-low-power")?.addEventListener("change", refreshLocalized);
  document.addEventListener("sela:weather", localize);
  localize();
  void ensureQuoteCollection();
  return { localize, quoteSettings };
}
