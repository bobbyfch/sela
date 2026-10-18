// Generated from app/library/home-feeds.ts by npm run build. Do not edit.
import { responseText } from "./network.js";
import { localeBase } from "../dist/source/src/i18n.js";
export const HOME_NEWS_TOPICS = ["books", "science", "nature", "art", "technology", "culture"];
export const HOME_NEWS_SOURCES = ["auto", "antara", "guardian"];
const guardianTopicFeeds = { books: "books", science: "science", nature: "environment", art: "artanddesign", technology: "technology", culture: "culture" };
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
const wikiLanguages = /* @__PURE__ */ new Set(["en", "id", "ja", "es", "fr", "de", "pt", "zh", "ko"]);
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
export function buildGuardianNewsUrl(topic) {
  if (!HOME_NEWS_TOPICS.includes(topic)) throw new TypeError("Unsupported news topic.");
  return `https://proxy.cors.dev/https://www.theguardian.com/${guardianTopicFeeds[topic]}/rss`;
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
export function parseGuardianRss(xml) {
  if (typeof xml !== "string" || xml.length > 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(xml)) return [];
  const items = [];
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item\s*>/gi)) {
    const row = match[1], title = stripMarkup(rssTag(row, "title")), url = safeLink(rssTag(row, "link"), /^(?:www\.)?theguardian\.com$/);
    if (!title || !url) continue;
    const description = stripMarkup(rssTag(row, "description")).slice(0, 500), date = rssTag(row, "pubDate");
    const enclosure = /<enclosure\b[^>]*\burl\s*=\s*(["'])(.*?)\1[^>]*>/i.exec(row)?.[2] || /<(?:[\w.-]+:)?(?:content|thumbnail)\b[^>]*\burl\s*=\s*(["'])(.*?)\1[^>]*>/i.exec(row)?.[2];
    const image = safeLink(enclosure ? decodeXml(enclosure) : "", /^(?:i\.guim\.co\.uk|media\.theguardian\.com)$/);
    items.push({ title: title.slice(0, 300), description: description || void 0, url, source: "The Guardian", date: date || void 0, image });
    if (items.length === 12) break;
  }
  return items;
}
async function loadGuardianNews(topic, signal) {
  const response = await fetch(buildGuardianNewsUrl(topic), { signal: requestSignal(signal), headers: { Accept: "application/rss+xml, application/xml, text/xml" }, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) throw Error(`The Guardian feed returned ${response.status}`);
  return parseGuardianRss(await responseText(response, 1024 * 1024));
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
function filterAntaraTopics(items, topics) {
  const selected = topics.filter((topic) => HOME_NEWS_TOPICS.includes(topic));
  if (!selected.length) return [];
  return items.filter((item) => {
    const text = `${item.title} ${item.description || ""}`.toLocaleLowerCase("id");
    return selected.some((topic) => topicTerms[topic].some((term) => text.includes(term)));
  });
}
export async function loadTopicNews(selectedTopic, language, signal, source = "auto", onProgress) {
  if (!HOME_NEWS_SOURCES.includes(source)) source = "auto";
  const topic = HOME_NEWS_TOPICS.includes(selectedTopic) ? selectedTopic : "books";
  const key = `sela-home:news:${localeBase(language)}:${topic}${source === "auto" ? "" : `:${source}`}`;
  const cached = cacheRead(key, 15 * 60 * 1e3);
  if (cached) return cached;
  const lang = localeBase(language), failures = [];
  if (source === "antara" && lang !== "id") throw new Error("ANTARA is available when the app language is Indonesian.");
  const providers = source === "auto" ? lang === "id" ? ["antara", "guardian"] : ["guardian"] : source === "antara" ? ["antara", "guardian"] : lang === "id" ? ["guardian", "antara"] : ["guardian"];
  for (const provider of providers) {
    let items = [];
    try {
      if (provider === "antara") {
        items = await loadAntaraTopics([topic], signal);
        if (!items.length) items = filterAntaraTopics(await loadAntaraNews("terkini", signal), [topic]).slice(0, 8);
      } else items = await loadGuardianNews(topic, signal);
    } catch (error) {
      if (signal?.aborted) throw error;
      failures.push(error);
      continue;
    }
    if (items.length) {
      cacheWrite(key, items);
      onProgress?.(items);
      return items;
    }
  }
  if (signal?.aborted) throw signal.reason || new DOMException("The operation was aborted.", "AbortError");
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
  const source = value === "google" || value === "gdelt" ? "auto" : HOME_NEWS_SOURCES.includes(value) ? value : "auto";
  try {
    localStorage.setItem(HOME_NEWS_SOURCE_KEY, source);
  } catch {
  }
  return source;
}
