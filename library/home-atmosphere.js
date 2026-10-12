// Generated from app/library/home-atmosphere.ts by npm run build. Do not edit.
import { responseText } from "./network.js";
import { readPersonal, editPersonal } from "./personal-store.js";
import { iconAction, bottomSheet, notify } from "./controls.js";
const reflections = {
  reading: [["A few pages are enough for today.", "Beberapa halaman cukup untuk hari ini."], ["An unfinished book still has a place here.", "Buku yang belum selesai masih punya tempat di sini."], ["Read at your own pace.", "Baca dengan kecepatanmu sendiri."], ["Return to a favorite passage.", "Kembali ke penggalan favoritmu."]],
  calm: [["Leave a little room for quiet.", "Sisakan tempat untuk tenang."], ["Rest is part of reading time.", "Istirahat juga bagian dari membaca."]],
  courage: [["A small beginning is still a beginning.", "Awal kecil tetap sebuah awal."], ["You can begin again without rushing.", "Kamu bisa mulai lagi tanpa terburu-buru."]],
  life: [["Make room for a different point of view.", "Sisakan tempat untuk sudut pandang berbeda."], ["Today need not look like yesterday.", "Hari ini tak harus seperti kemarin."]],
  friendship: [["A shared story opens a conversation.", "Cerita bersama membuka percakapan."], ["Leave a page for someone you care about.", "Sisakan halaman untuk orang yang kamu sayangi."]],
  creativity: [["Let a question stay open a while.", "Biarkan pertanyaan terbuka sebentar."], ["A margin can hold a new idea.", "Tepi halaman bisa menyimpan ide baru."]],
  spiritual: [["Take a quiet moment for gratitude.", "Ambil waktu tenang untuk bersyukur."], ["Give reflection a little space today.", "Beri renungan sedikit ruang hari ini."]]
};
export function readingNote(t, index = 0) {
  const p = readPersonal(), personal = p.quoteTopic === "personal" ? Object.values(p.books).map((book) => book.quote).filter((value) => typeof value === "string" && !!value.trim()) : [];
  if (personal.length) return { quote: personal[Math.abs(index) % personal.length], source: t("From your notebook", "Dari notebook-mu") };
  try {
    const cache = JSON.parse(localStorage.getItem("sela-library:quote-cache") || "null"), language = p.quoteLanguage === "auto" ? (document.documentElement.lang || "en").split("-")[0] : p.quoteLanguage, rows2 = cache?.topic === p.quoteTopic && Array.isArray(cache.rows) ? cache.rows.filter((row2) => typeof row2.content === "string" && typeof row2.author === "string" && (!row2.language || row2.language === language)) : [];
    if (rows2.length) {
      const row2 = rows2[Math.abs(index) % rows2.length];
      return { quote: row2.content, source: row2.author + " \xB7 " + (row2.source || "Quotable") };
    }
  } catch {
  }
  const rows = reflections[p.quoteTopic] || reflections.reading, row = rows[Math.abs(index) % rows.length];
  return { quote: p.quoteLanguage === "en" ? row[0] : p.quoteLanguage === "id" ? row[1] : t(row[0], row[1]), source: "Sela \xB7 " + t("a little reflection", "renungan kecil") };
}
export function mountAtmosphere(home, { t }) {
  const intro = home.querySelector(".room-intro"), greeting = intro.querySelector(".eyebrow");
  void import("./home-world.js").then(({ mountHomeWorld }) => mountHomeWorld(home)).catch(() => {
    home.dataset.world = "fallback";
  });
  const section = document.createElement("section");
  section.className = "home-reflection";
  home.append(section);
  const copy = document.createElement("div"), label = document.createElement("small"), quote = document.createElement("p");
  copy.append(label, quote);
  section.append(copy);
  const actions = document.createElement("div");
  actions.className = "reflection-actions";
  section.append(actions);
  const refresh = iconAction(document.createElement("button"), "refresh", t("Another reading note", "Catatan baca lainnya"));
  refresh.type = "button";
  actions.append(refresh);
  const filter = iconAction(document.createElement("button"), "filter", t("Quote themes", "Tema kutipan"));
  filter.type = "button";
  actions.append(filter);
  let index = 0, remote = [];
  try {
    const cache = JSON.parse(localStorage.getItem("sela-library:quote-cache") || "null");
    if (cache?.topic === readPersonal().quoteTopic && Array.isArray(cache.rows)) remote = cache.rows.slice(0, 20).filter((q) => typeof q.content === "string" && typeof q.author === "string");
  } catch {
  }
  function localize() {
    iconAction(refresh, "refresh", t("Another reading note", "Catatan baca lainnya"));
    iconAction(filter, "filter", t("Quote themes", "Tema kutipan"));
    const p = readPersonal(), hour = (/* @__PURE__ */ new Date()).getHours(), english = hour >= 5 && hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night", indonesian = hour >= 5 && hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";
    greeting.textContent = t(english, indonesian);
    home.dataset.companion = p.companion;
    home.dataset.weather = document.documentElement.dataset.weatherStale === "true" ? "neutral" : document.documentElement.dataset.weather || "neutral";
    home.dataset.night = document.documentElement.dataset.weatherNight || String(hour < 6 || hour > 18);
    home.classList.toggle("quiet-scene", p.quiet);
    intro.querySelector("h1").textContent = p.room || t("Make yourself at home.", "Selamat datang di ruangmu.");
    const note = readingNote(t, index);
    quote.textContent = note.quote;
    label.textContent = note.source;
  }
  refresh.onclick = () => {
    index++;
    localize();
    quote.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: matchMedia("(prefers-reduced-motion:reduce)").matches ? 0 : 180 });
  };
  filter.onclick = () => {
    const body = document.createElement("div"), topic = document.createElement("select");
    topic.setAttribute("aria-label", t("Quote topic", "Topik kutipan"));
    for (const [key, en, id] of [["reading", "Reading", "Membaca"], ["calm", "Calm", "Ketenangan"], ["courage", "Courage", "Semangat"], ["life", "Life", "Kehidupan"], ["friendship", "Friendship", "Persahabatan"], ["creativity", "Creativity", "Kreativitas"], ["spiritual", "Reflection", "Renungan"], ["personal", "My passages", "Kutipanku"]]) {
      const o = document.createElement("option");
      o.value = key;
      o.textContent = t(en, id);
      topic.append(o);
    }
    topic.value = readPersonal().quoteTopic;
    topic.onchange = () => {
      remote = [];
      editPersonal((p) => {
        p.quoteTopic = topic.value;
      });
    };
    body.append(topic);
    const language = document.createElement("select");
    language.setAttribute("aria-label", t("Quote language", "Bahasa kutipan"));
    for (const [key, name] of [["auto", t("App language", "Bahasa app")], ["id", "Indonesia"], ["en", "English"]]) {
      const o = document.createElement("option");
      o.value = key;
      o.textContent = name;
      language.append(o);
    }
    language.value = readPersonal().quoteLanguage;
    language.onchange = () => editPersonal((p) => {
      p.quoteLanguage = language.value;
    });
    body.append(language);
    const online = document.createElement("button");
    online.type = "button";
    online.textContent = t("Load Quotable quotes online", "Muat kutipan Quotable online");
    body.append(online);
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    body.append(status);
    online.onclick = async () => {
      online.disabled = true;
      try {
        const tag = { reading: "literature", calm: "wisdom", courage: "inspirational", life: "life", friendship: "friendship", creativity: "creativity" }[topic.value] || "wisdom";
        const r = await fetch("https://api.quotable.io/quotes?limit=20&tags=" + encodeURIComponent(tag), { signal: AbortSignal.timeout(1e4) });
        if (!r.ok) throw Error();
        remote = (JSON.parse(await responseText(r, 128 * 1024)).results?.filter((q) => typeof q.content === "string" && q.content.length <= 1e3 && typeof q.author === "string") || []).map((q) => ({ ...q, language: "en" }));
        if (!remote.length) throw Error();
        localStorage.setItem("sela-library:quote-cache", JSON.stringify({ topic: topic.value, rows: remote.slice(0, 20) }));
        status.textContent = t("English quotes loaded.", "Kutipan English dimuat.");
        localize();
      } catch {
        status.textContent = t("Provider unavailable. Local reflections remain ready.", "Provider belum tersedia. Renungan offline tetap siap.");
        notify(status.textContent, "error");
      } finally {
        online.disabled = false;
      }
    };
    const wiki = document.createElement("button");
    wiki.type = "button";
    wiki.textContent = t("Discover sourced Wikiquote passages", "Temukan kutipan bersumber Wikikutip");
    body.append(wiki);
    wiki.onclick = async () => {
      wiki.disabled = true;
      try {
        const lang = language.value === "auto" ? document.documentElement.lang : language.value;
        const term = { reading: "Reading", life: "Life", friendship: "Friendship", courage: "Courage", calm: "Peace", creativity: "Creativity", spiritual: "Wisdom" }[topic.value] || "Reading";
        const url = "https://" + (lang === "id" ? "id" : "en") + ".wikiquote.org/w/api.php?" + new URLSearchParams({ action: "parse", page: lang === "id" ? { Reading: "Membaca", Life: "Kehidupan", Friendship: "Persahabatan", Courage: "Keberanian", Peace: "Perdamaian", Creativity: "Kreativitas", Wisdom: "Kebijaksanaan" }[term] : term, prop: "text", format: "json", origin: "*" });
        const response = await fetch(url, { signal: AbortSignal.timeout(1e4) });
        const data = JSON.parse(await responseText(response));
        if (!data.parse?.text?.["*"]) throw Error("Page unavailable");
        const doc = new DOMParser().parseFromString(data.parse.text["*"], "text/html");
        doc.querySelectorAll("script,style,.navbox,.toc,.mw-editsection").forEach((e) => e.remove());
        remote = [...doc.querySelectorAll("li")].filter((e) => !e.parentElement.closest("li") && e.textContent.length >= 30 && e.textContent.length <= 1e3).slice(0, 20).map((e) => ({ content: e.textContent.trim(), author: data.parse.title, language: lang === "id" ? "id" : "en", source: "Wikiquote \xB7 " + (lang === "id" ? "Indonesia" : "English") }));
        if (!remote.length) throw Error("No passages");
        localStorage.setItem("sela-library:quote-cache", JSON.stringify({ topic: topic.value, rows: remote }));
        status.textContent = t("Source excerpts loaded; attributions remain in the passage.", "Penggalan sumber dimuat; atribusi tetap di penggalan.");
        localize();
      } catch {
        status.textContent = t("Wikiquote unavailable. Offline reflections remain ready.", "Wikikutip belum tersedia. Renungan offline tetap siap.");
        notify(status.textContent, "error");
      } finally {
        wiki.disabled = false;
      }
    };
    for (const [name, url] of [["Wikikutip", "https://id.wikiquote.org/"], ["ZenQuotes", "https://zenquotes.io/"]]) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = name;
      body.append(a);
    }
    const modal = bottomSheet(t("Quote themes", "Tema kutipan"), body);
    modal.element.addEventListener("close", () => modal.destroy(), { once: true });
    modal.open();
  };
  document.addEventListener("sela:personal", localize);
  document.querySelector("#default-low-power")?.addEventListener("change", localize);
  document.addEventListener("sela:weather", localize);
  localize();
  return { localize };
}
