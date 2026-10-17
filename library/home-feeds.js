// Generated from app/library/home-feeds.ts by npm run build. Do not edit.
import { responseText } from "./network.js";
import { localeBase } from "../dist/source/src/i18n.js";
export const HOME_NEWS_TOPICS = ["books", "science", "nature", "art", "technology", "culture"];
export const HOME_NEWS_SOURCES = ["auto", "google", "gdelt", "antara"];
const antaraTopicFeeds = {
  books: { path: "humaniora", label: "Humaniora" },
  science: { path: "tekno", label: "Tekno" },
  nature: { path: "warta-bumi", label: "Warta Bumi" },
  art: { path: "lifestyle", label: "Lifestyle" },
  technology: { path: "tekno", label: "Tekno" },
  culture: { path: "hiburan", label: "Hiburan" }
};
const topicTerms = {
  books: ["buku", "pustaka", "literasi", "sastra", "membaca", "novel", "komik", "penerbit", "perpustakaan", "cerpen", "penulis"],
  science: ["sains", "ilmiah", "riset", "penelitian", "ilmu", "eksperimen", "temuan", "laboratorium", "biologi", "fisika"],
  nature: ["alam", "lingkungan", "hutan", "laut", "satwa", "spesies", "iklim", "bumi", "konservasi", "ekosistem", "polusi", "sampah"],
  art: ["seni", "seniman", "pameran", "museum", "desain", "lukisan", "galeri", "karya", "kreatif", "festival"],
  technology: ["teknologi", "digital", "aplikasi", "ponsel", "internet", "robot", "gadget", "komputer", "siber", "startup", "inovasi"],
  culture: ["budaya", "film", "musik", "konser", "teater", "hiburan", "seni", "festival", "artis", "sinem", "tradisi"]
};
const topicWords = {
  en: { books: ["books", "literature", "publishing"], science: ["science", "research"], nature: ["nature", "wildlife", "climate"], art: ["art", "design", "museum"], technology: ["technology", "innovation"], culture: ["culture", "cinema", "music"] },
  id: { books: ["buku", "sastra", "penerbitan"], science: ["sains", "penelitian"], nature: ["alam", "satwa", "iklim"], art: ["seni", "desain", "museum"], technology: ["teknologi", "inovasi"], culture: ["budaya", "film", "musik"] },
  ja: { books: ["\u672C", "\u6587\u5B66", "\u51FA\u7248"], science: ["\u79D1\u5B66", "\u7814\u7A76"], nature: ["\u81EA\u7136", "\u91CE\u751F\u52D5\u7269", "\u6C17\u5019"], art: ["\u82B8\u8853", "\u30C7\u30B6\u30A4\u30F3", "\u7F8E\u8853\u9928"], technology: ["\u6280\u8853", "\u30A4\u30CE\u30D9\u30FC\u30B7\u30E7\u30F3"], culture: ["\u6587\u5316", "\u6620\u753B", "\u97F3\u697D"] },
  es: { books: ["libros", "literatura", "edici\xF3n"], science: ["ciencia", "investigaci\xF3n"], nature: ["naturaleza", "fauna", "clima"], art: ["arte", "dise\xF1o", "museo"], technology: ["tecnolog\xEDa", "innovaci\xF3n"], culture: ["cultura", "cine", "m\xFAsica"] },
  fr: { books: ["livres", "litt\xE9rature", "\xE9dition"], science: ["science", "recherche"], nature: ["nature", "faune", "climat"], art: ["art", "design", "mus\xE9e"], technology: ["technologie", "innovation"], culture: ["culture", "cin\xE9ma", "musique"] },
  de: { books: ["B\xFCcher", "Literatur", "Verlag"], science: ["Wissenschaft", "Forschung"], nature: ["Natur", "Wildtiere", "Klima"], art: ["Kunst", "Design", "Museum"], technology: ["Technologie", "Innovation"], culture: ["Kultur", "Film", "Musik"] },
  pt: { books: ["livros", "literatura", "publica\xE7\xE3o"], science: ["ci\xEAncia", "pesquisa"], nature: ["natureza", "vida selvagem", "clima"], art: ["arte", "design", "museu"], technology: ["tecnologia", "inova\xE7\xE3o"], culture: ["cultura", "cinema", "m\xFAsica"] },
  zh: { books: ["\u56FE\u4E66", "\u6587\u5B66", "\u51FA\u7248"], science: ["\u79D1\u5B66", "\u7814\u7A76"], nature: ["\u81EA\u7136", "\u91CE\u751F\u52A8\u7269", "\u6C14\u5019"], art: ["\u827A\u672F", "\u8BBE\u8BA1", "\u535A\u7269\u9986"], technology: ["\u79D1\u6280", "\u521B\u65B0"], culture: ["\u6587\u5316", "\u7535\u5F71", "\u97F3\u4E50"] },
  ko: { books: ["\uCC45", "\uBB38\uD559", "\uCD9C\uD310"], science: ["\uACFC\uD559", "\uC5F0\uAD6C"], nature: ["\uC790\uC5F0", "\uC57C\uC0DD\uB3D9\uBB3C", "\uAE30\uD6C4"], art: ["\uC608\uC220", "\uB514\uC790\uC778", "\uBC15\uBB3C\uAD00"], technology: ["\uAE30\uC220", "\uD601\uC2E0"], culture: ["\uBB38\uD654", "\uC601\uD654", "\uC74C\uC545"] }
};
const wikiLanguages = /* @__PURE__ */ new Set(["en", "id", "ja", "es", "fr", "de", "pt", "zh", "ko"]);
const gdeltLanguage = { en: "english", id: "indonesian", ja: "japanese", es: "spanish", fr: "french", de: "german", pt: "portuguese", zh: "chinese", ko: "korean" };
const googleNewsLocale = { en: { hl: "en-US", gl: "US", ceid: "US:en" }, id: { hl: "id", gl: "ID", ceid: "ID:id" }, ja: { hl: "ja", gl: "JP", ceid: "JP:ja" } };
function cacheRead(key, ttl, allowStale = false) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    if (value && Array.isArray(value.items) && (allowStale || Date.now() - value.at < ttl)) return value.items;
  } catch {
  }
  return;
}
function cacheWrite(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), items }));
  } catch {
  }
}
function safeLink(value, hosts) {
  if (typeof value !== "string" || value.length > 2048) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || hosts && !hosts.test(url.hostname)) return;
    return url.href;
  } catch {
    return;
  }
}
function requestSignal(signal) {
  const timeout = AbortSignal.timeout(1e4);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}
function todayKey(date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}
export async function loadOnThisDay(language, date = /* @__PURE__ */ new Date(), signal) {
  const lang = localeBase(language), key = `sela-home:on-this-day:${lang}:${date.getMonth() + 1}-${date.getDate()}`;
  const cached = cacheRead(key, 24 * 60 * 60 * 1e3);
  if (cached) return cached;
  const candidates = lang === "id" ? ["id"] : [.../* @__PURE__ */ new Set([wikiLanguages.has(lang) ? lang : "en", "en"])], day = todayKey(date);
  for (const candidate of candidates) {
    try {
      const response = await fetch(`https://${candidate}.wikipedia.org/api/rest_v1/feed/onthisday/selected/${day}`, { signal: requestSignal(signal), headers: { Accept: "application/json" }, credentials: "omit", referrerPolicy: "no-referrer" });
      if (!response.ok) continue;
      const data = JSON.parse(await responseText(response, 1024 * 1024));
      const rows = Array.isArray(data.selected) ? data.selected : Array.isArray(data.events) ? data.events : [];
      const items = rows.slice(0, 8).map((row) => {
        const page = Array.isArray(row.pages) ? row.pages[0] : void 0;
        const url = safeLink(page?.content_urls?.desktop?.page, new RegExp(`^(?:${candidate}\\.)?wikipedia\\.org$`)) || safeLink(page?.url, new RegExp(`^(?:${candidate}\\.)?wikipedia\\.org$`));
        if (!url || typeof row.text !== "string" || !row.text.trim()) return;
        const image = safeLink(page?.thumbnail?.source, /^(?:upload|upload\.wikimedia)\.org$/);
        return { title: row.text.trim().slice(0, 500), description: page?.title, url, source: "Wikimedia", image, year: Number.isInteger(row.year) ? row.year : void 0 };
      }).filter((item) => !!item);
      if (items.length) {
        cacheWrite(key, items);
        return items;
      }
    } catch (error) {
      if (signal?.aborted) throw error;
    }
  }
  return cacheRead(key, 0, true) || [];
}
export function buildNewsUrl(topics, language) {
  const lang = localeBase(language), dictionary = topicWords[lang] || topicWords.en, selected = topics.filter((topic) => HOME_NEWS_TOPICS.includes(topic));
  const words = [...new Set((selected.length ? selected : ["books", "science", "nature"]).flatMap((topic) => dictionary[topic]))].slice(0, 18);
  const query = `(${words.map((word) => word.replace(/["\\()]/g, " ").trim()).filter(Boolean).join(" OR ")}) sourcelang:${gdeltLanguage[lang] || "english"}`;
  return "https://api.gdeltproject.org/api/v2/doc/doc?" + new URLSearchParams({ query, mode: "artlist", format: "json", maxrecords: "8", timespan: "7d", sort: "HybridRel" });
}
export function buildGoogleNewsUrl(topics, language) {
  const lang = localeBase(language), config = googleNewsLocale[lang in googleNewsLocale ? lang : "en"], selected = topics.filter((topic) => HOME_NEWS_TOPICS.includes(topic));
  const words = [...new Set((selected.length ? selected : ["books", "science", "nature"]).flatMap((topic) => (topicWords[lang] || topicWords.en)[topic]))].slice(0, 8);
  const feed = new URL(lang === "id" ? "https://news.google.com/rss" : "https://news.google.com/rss/search");
  if (lang !== "id") feed.searchParams.set("q", words.join(" OR "));
  feed.searchParams.set("hl", config.hl);
  feed.searchParams.set("gl", config.gl);
  feed.searchParams.set("ceid", config.ceid);
  return "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed.href);
}
function decodeXml(value) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&#x([\da-f]+);/gi, (_m, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/&#(\d+);/g, (_m, num) => String.fromCodePoint(Number(num))).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}
function rssTag(xml, name) {
  const tag = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`<(?:(?:[\\w.-]+):)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:(?:[\\w.-]+):)?${tag}\\s*>`, "i").exec(xml);
  return match ? decodeXml(match[1]).trim() : "";
}
function stripMarkup(value) {
  return value.replace(/<[^>]{0,1000}>/g, " ").replace(/\s+/g, " ").trim();
}
export function parseAntaraRss(xml) {
  if (typeof xml !== "string" || xml.length > 2 * 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(xml)) return [];
  const items = [];
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item\s*>/gi)) {
    const row = match[1], title = stripMarkup(rssTag(row, "title")), url = safeLink(rssTag(row, "link"), /^www\.antaranews\.com$/);
    if (!title || !url) continue;
    const source = safeLink(rssTag(row, "source"), /^www\.antaranews\.com$/), description = stripMarkup(rssTag(row, "description")).slice(0, 500);
    const enclosure = /<enclosure\b[^>]*\burl\s*=\s*(["'])(.*?)\1[^>]*>/i.exec(row)?.[2] || /<(?:[\w.-]+:)?(?:content|thumbnail)\b[^>]*\burl\s*=\s*(["'])(.*?)\1[^>]*>/i.exec(row)?.[2];
    const image = safeLink(enclosure ? decodeXml(enclosure) : "", /^(?:cdn|img)\.antaranews\.com$/);
    const date = rssTag(row, "pubDate");
    items.push({ title: title.slice(0, 300), description, url, source: source || "ANTARA", date: date || void 0, image });
    if (items.length === 12) break;
  }
  return items;
}
export function parseGoogleNews(value, topics = HOME_NEWS_TOPICS, language = "en") {
  const root = value, rows = Array.isArray(root?.items) ? root.items : [], lang = localeBase(language), terms = (topics.length ? topics : ["books", "science", "nature"]).flatMap((topic) => (topicWords[lang] || topicWords.en)[topic]).map((term) => term.toLocaleLowerCase(lang));
  const items = [];
  for (const row of rows.slice(0, 10)) {
    if (!row || typeof row !== "object") continue;
    const entry = row, rawTitle = typeof entry.title === "string" ? stripMarkup(decodeXml(entry.title)).trim() : "";
    const match = rawTitle.match(/\s[-–—]\s([^\s].*)$/), publisher = match?.[1]?.trim() || "", title = (match ? rawTitle.slice(0, match.index) : rawTitle).trim(), url = safeLink(entry.link, /^(?:news\.)?google\.com$/);
    if (!title || !url) continue;
    const rawDescription = typeof entry.description === "string" ? stripMarkup(decodeXml(entry.description)).trim() : "";
    if (lang === "id" && terms.length && !terms.some((term) => `${title} ${rawDescription}`.toLocaleLowerCase(lang).includes(term))) continue;
    const enclosure = entry.enclosure && typeof entry.enclosure === "object" ? entry.enclosure.link : void 0;
    const image = safeLink(entry.thumbnail) || safeLink(enclosure) || void 0;
    items.push({ title: title.slice(0, 300), description: rawDescription.slice(0, 500) || void 0, url, source: typeof entry.author === "string" && entry.author.trim() ? entry.author.trim().slice(0, 100) : publisher.slice(0, 100) || "Google News", date: typeof entry.pubDate === "string" ? entry.pubDate : void 0, image });
  }
  return items;
}
async function loadGoogleNews(topics, language, signal) {
  const response = await fetch(buildGoogleNewsUrl(topics, language), { signal: requestSignal(signal), headers: { Accept: "application/json" }, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) throw Error(`Google News RSS bridge returned ${response.status}`);
  const data = JSON.parse(await responseText(response, 1024 * 1024));
  if (data?.status !== "ok") throw Error("Google News RSS bridge returned an unavailable feed.");
  return parseGoogleNews(data, topics, language);
}
async function loadAntaraNews(feed = "terkini", signal) {
  const allowed = /* @__PURE__ */ new Set(["terkini", "humaniora", "tekno", "warta-bumi", "lifestyle", "hiburan"]);
  if (!allowed.has(feed)) throw new TypeError("Unsupported ANTARA news feed.");
  const key = `sela-home:news:antara:${feed}`, cached = cacheRead(key, 15 * 60 * 1e3);
  if (cached) return cached;
  const response = await fetch(`https://www.antaranews.com/rss/${feed}.xml`, { signal: requestSignal(signal), headers: { Accept: "application/rss+xml, application/xml, text/xml" }, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) throw Error(`ANTARA feed returned ${response.status}`);
  const label = feed === "terkini" ? "Terkini" : Object.values(antaraTopicFeeds).find((row) => row.path === feed)?.label || feed;
  const items = parseAntaraRss(await responseText(response, 2 * 1024 * 1024)).map((item) => ({ ...item, source: `ANTARA \xB7 ${label}` }));
  cacheWrite(key, items);
  return items;
}
async function loadAntaraTopics(topics, signal) {
  const selected = topics.filter((topic) => HOME_NEWS_TOPICS.includes(topic));
  const grouped = /* @__PURE__ */ new Map();
  for (const topic of selected) {
    const feed = antaraTopicFeeds[topic], group = grouped.get(feed.path);
    if (group) group.topics.push(topic);
    else grouped.set(feed.path, { ...feed, topics: [topic] });
  }
  const feeds = [...grouped.values()];
  const results = await Promise.allSettled(feeds.map((feed) => loadAntaraNews(feed.path, signal)));
  const seen = /* @__PURE__ */ new Set(), items = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      const text = `${item.title} ${item.description || ""}`.toLocaleLowerCase("id");
      if (!feeds[i].topics.some((topic) => topicTerms[topic].some((term) => text.includes(term)))) continue;
      const key = item.url || item.title.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(item);
    }
  }
  return items.sort((a, b) => (Date.parse(b.date || "") || 0) - (Date.parse(a.date || "") || 0)).slice(0, 8);
}
async function loadGdeltNews(topics, language, signal) {
  const response = await fetch(buildNewsUrl(topics, language), { signal: requestSignal(signal), headers: { Accept: "application/json" }, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) throw Error(`News source returned ${response.status}`);
  const data = JSON.parse(await responseText(response, 1024 * 1024));
  return (Array.isArray(data.articles) ? data.articles : []).slice(0, 8).map((row) => {
    const url = safeLink(row.url);
    if (!url || typeof row.title !== "string" || !row.title.trim()) return;
    return { title: row.title.trim().slice(0, 300), url, source: typeof row.domain === "string" ? row.domain.slice(0, 100) : "News", date: typeof row.seendate === "string" ? row.seendate : void 0, image: safeLink(row.socialimage) };
  }).filter((item) => !!item);
}
function newsTimestamp(value) {
  if (!value) return 0;
  const gdelt = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec(value);
  if (gdelt) return Date.UTC(Number(gdelt[1]), Number(gdelt[2]) - 1, Number(gdelt[3]), Number(gdelt[4]), Number(gdelt[5]), Number(gdelt[6]));
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
function mergeNewsSources(results) {
  const merged = /* @__PURE__ */ new Map();
  let order = 0;
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      const titleKey = item.title.toLocaleLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
      const key = titleKey || item.url.toLocaleLowerCase(), existing = merged.get(key);
      if (existing) {
        if (!existing.item.image && item.image) existing.item.image = item.image;
        if (!existing.item.description && item.description) existing.item.description = item.description;
        if (!existing.item.date && item.date) existing.item.date = item.date;
        continue;
      }
      const priority = item.source?.startsWith("ANTARA") ? 0 : item.url.startsWith("https://news.google.com/") ? 1 : 2;
      merged.set(key, { item: { ...item }, order: order++, priority });
    }
  }
  return [...merged.values()].sort((a, b) => newsTimestamp(b.item.date) - newsTimestamp(a.item.date) || a.priority - b.priority || a.order - b.order).slice(0, 12).map((entry) => entry.item);
}
function filterAntaraTopics(items, topics) {
  const selected = topics.filter((topic) => HOME_NEWS_TOPICS.includes(topic));
  if (!selected.length) return [];
  return items.filter((item) => {
    const text = `${item.title} ${item.description || ""}`.toLocaleLowerCase("id");
    return selected.some((topic) => topicTerms[topic].some((term) => text.includes(term)));
  });
}
export async function loadTopicNews(topics, language, signal, source = "auto", onProgress) {
  if (!HOME_NEWS_SOURCES.includes(source)) source = "auto";
  const key = `sela-home:news:${localeBase(language)}:${[...topics].sort().join(",")}${source === "auto" ? "" : `:${source}`}`;
  const cached = cacheRead(key, 15 * 60 * 1e3);
  if (cached) return cached;
  const lang = localeBase(language);
  let items = [];
  let failures = [];
  if (source === "google" || source === "gdelt") {
    try {
      items = source === "google" ? await loadGoogleNews(topics, language, signal) : await loadGdeltNews(topics, language, signal);
    } catch (error) {
      if (signal?.aborted) throw error;
      failures = [error];
    }
  } else if (source === "antara") {
    if (lang !== "id") throw new Error("ANTARA is available when the app language is Indonesian.");
    try {
      items = await loadAntaraTopics(topics, signal);
      if (!items.length) items = filterAntaraTopics(await loadAntaraNews("terkini", signal), topics).slice(0, 8);
    } catch (error) {
      if (signal?.aborted) throw error;
      failures = [error];
    }
  } else {
    let publishProgress = function() {
      if (!onProgress) return;
      const settled = [];
      for (let index = 0; index < tasks.length; index++) {
        const result = progress.get(index);
        if (result) settled.push(result);
      }
      const partial = mergeNewsSources(settled);
      if (partial.length) onProgress(partial);
    };
    const tasks = [];
    if (lang === "id") tasks.push(loadAntaraTopics(topics, signal));
    tasks.push(loadGoogleNews(topics, language, signal), loadGdeltNews(topics, language, signal));
    const progress = /* @__PURE__ */ new Map();
    const results = await Promise.all(tasks.map((task, index) => task.then(
      (value) => {
        const result = { status: "fulfilled", value };
        progress.set(index, result);
        publishProgress();
        return result;
      },
      (reason) => {
        const result = { status: "rejected", reason };
        progress.set(index, result);
        publishProgress();
        return result;
      }
    )));
    failures = results.filter((result) => result.status === "rejected").map((result) => result.reason);
    items = mergeNewsSources(results);
    if (!items.length && lang === "id") {
      try {
        items = filterAntaraTopics(await loadAntaraNews("terkini", signal), topics).slice(0, 8);
      } catch (error) {
        if (signal?.aborted) throw error;
      }
    }
  }
  if (signal?.aborted) throw signal.reason || new DOMException("The operation was aborted.", "AbortError");
  if (items.length) {
    cacheWrite(key, items);
    return items;
  }
  const stale = cacheRead(key, 0, true);
  if (stale?.length) return stale;
  if (failures.length) throw failures[0];
  return [];
}
export function readNewsTopics() {
  try {
    const value = JSON.parse(localStorage.getItem("sela-home:news-topics") || "null");
    if (Array.isArray(value)) {
      const valid = value.filter((item) => typeof item === "string" && HOME_NEWS_TOPICS.includes(item));
      if (valid.length) return [...new Set(valid)].slice(0, 4);
    }
  } catch {
  }
  return ["books", "science", "nature"];
}
export function saveNewsTopics(value) {
  const valid = Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === "string" && HOME_NEWS_TOPICS.includes(item)))].slice(0, 4) : [];
  const result = valid.length ? valid : ["books", "science", "nature"];
  try {
    localStorage.setItem("sela-home:news-topics", JSON.stringify(result));
  } catch {
  }
  return result;
}
const HOME_NEWS_SOURCE_KEY = "sela-home:news-source";
export function readNewsSource() {
  try {
    const value = localStorage.getItem(HOME_NEWS_SOURCE_KEY);
    if (HOME_NEWS_SOURCES.includes(value)) return value;
  } catch {
  }
  return "auto";
}
export function saveNewsSource(value) {
  const source = HOME_NEWS_SOURCES.includes(value) ? value : "auto";
  try {
    localStorage.setItem(HOME_NEWS_SOURCE_KEY, source);
  } catch {
  }
  return source;
}
