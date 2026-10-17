// Generated from app/library/scripture-sources.ts by npm run build. Do not edit.
import { responseText } from "./network.js";
const quranApi = "https://quranenc.com/api/v1";
export const QURAN_STUDY_SOURCES = {
  kemenagSurah: "https://quran.kemenag.go.id/quran/per-ayat/surah/",
  surahNames: "https://pustakalajnah.kemenag.go.id/detail/165",
  revelationPeriod: "https://pustakalajnah.kemenag.go.id/detail/95",
  asbabunNuzul: "https://pustakalajnah.kemenag.go.id/detail/93",
  prophetStories: "https://pustakalajnah.kemenag.go.id/detail/35",
  prophethood: "https://pustakalajnah.kemenag.go.id/detail/66",
  tajweedLatinJuzAmma: "https://quran.kemenag.go.id/assets/files/Juz-Amma-Metode-Tilawah.pdf",
  kemenagApi: "https://quran-api.lpmqkemenag.id/"
};
export function quranKemenagSurahUrl(number, verseCount) {
  if (!Number.isInteger(number) || number < 1 || number > 114) throw new RangeError("Choose a surah from 1 to 114.");
  const range = Number.isInteger(verseCount) && Number(verseCount) > 0 ? `?from=1&to=${Math.min(286, Number(verseCount))}` : "";
  return `${QURAN_STUDY_SOURCES.kemenagSurah}${number}${range}`;
}
function localeBase(value) {
  const language = String(value || "en").trim().toLowerCase().split(/[-_]/, 1)[0];
  return /^[a-z]{2,3}$/.test(language) ? language : "en";
}
const surahNames = ["Al-F\u0101ti\u1E25ah", "Al-Baqarah", "\u0100li \u02BFImr\u0101n", "An-Nis\u0101\u02BE", "Al-M\u0101\u02BEidah", "Al-An\u02BF\u0101m", "Al-A\u02BFr\u0101f", "Al-Anf\u0101l", "At-Tawbah", "Y\u016Bnus", "H\u016Bd", "Y\u016Bsuf", "Ar-Ra\u02BFd", "Ibr\u0101h\u012Bm", "Al-\u1E24ijr", "An-Na\u1E25l", "Al-Isr\u0101\u02BE", "Al-Kahf", "Maryam", "\u1E6C\u0101h\u0101", "Al-Anbiy\u0101\u02BE", "Al-\u1E24ajj", "Al-Mu\u02BEmin\u016Bn", "An-N\u016Br", "Al-Furq\u0101n", "Ash-Shu\u02BFar\u0101\u02BE", "An-Naml", "Al-Qa\u1E63a\u1E63", "Al-\u02BFAnkab\u016Bt", "Ar-R\u016Bm", "Luqm\u0101n", "As-Sajdah", "Al-A\u1E25z\u0101b", "Saba\u02BE", "F\u0101\u1E6Dir", "Y\u0101-S\u012Bn", "A\u1E63-\u1E62\u0101ff\u0101t", "\u1E62\u0101d", "Az-Zumar", "Gh\u0101fir", "Fu\u1E63\u1E63ilat", "Ash-Sh\u016Br\u0101", "Az-Zukhruf", "Ad-Dukh\u0101n", "Al-J\u0101thiyah", "Al-A\u1E25q\u0101f", "Mu\u1E25ammad", "Al-Fat\u1E25", "Al-\u1E24ujur\u0101t", "Q\u0101f", "Adh-Dh\u0101riy\u0101t", "A\u1E6D-\u1E6C\u016Br", "An-Najm", "Al-Qamar", "Ar-Ra\u1E25m\u0101n", "Al-W\u0101qi\u02BFah", "Al-\u1E24ad\u012Bd", "Al-Muj\u0101dilah", "Al-\u1E24ashr", "Al-Mumta\u1E25anah", "A\u1E63-\u1E62aff", "Al-Jumu\u02BFah", "Al-Mun\u0101fiq\u016Bn", "At-Tagh\u0101bun", "A\u1E6D-\u1E6Cal\u0101q", "At-Ta\u1E25r\u012Bm", "Al-Mulk", "Al-Qalam", "Al-\u1E24\u0101qqah", "Al-Ma\u02BF\u0101rij", "N\u016B\u1E25", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiy\u0101mah", "Al-Ins\u0101n", "Al-Mursal\u0101t", "An-Naba\u02BE", "An-N\u0101zi\u02BF\u0101t", "\u02BFAbasa", "At-Takw\u012Br", "Al-Infi\u1E6D\u0101r", "Al-Mu\u1E6Daffif\u012Bn", "Al-Inshiq\u0101q", "Al-Bur\u016Bj", "A\u1E6D-\u1E6C\u0101riq", "Al-A\u02BFl\u0101", "Al-Gh\u0101shiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "A\u1E0D-\u1E0Cu\u1E25\u0101", "Ash-Shar\u1E25", "At-T\u012Bn", "Al-\u02BFAlaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-\u02BF\u0100diy\u0101t", "Al-Q\u0101ri\u02BFah", "At-Tak\u0101thur", "Al-\u02BFA\u1E63r", "Al-Humazah", "Al-F\u012Bl", "Quraysh", "Al-M\u0101\u02BF\u016Bn", "Al-Kawthar", "Al-K\u0101fir\u016Bn", "An-Na\u1E63r", "Al-Masad", "Al-Ikhl\u0101\u1E63", "Al-Falaq", "An-N\u0101s"];
const quranPatternSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><g fill="none" stroke="#48a5c5" stroke-opacity=".22" stroke-width="1.4"><path d="M96 12 108 42 138 30 126 60 156 72 126 84 138 114 108 102 96 132 84 102 54 114 66 84 36 72 66 60 54 30 84 42Z"/><path d="M96 35 103 65 133 72 103 79 96 109 89 79 59 72 89 65Z"/><circle cx="96" cy="72" r="18"/><path d="M0 0 18 18 0 36M192 0l-18 18 18 18M0 192l18-18L0 156m192 36-18-18 18-18"/></g></svg>';
export const QURAN_PATTERN_BACKGROUND = `url("data:image/svg+xml,${encodeURIComponent(quranPatternSvg)}")`;
const quranSceneSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="520" viewBox="0 0 1440 520"><defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e8f7ff"/><stop offset=".58" stop-color="#d9f0f1"/><stop offset="1" stop-color="#cce9ed"/></linearGradient><linearGradient id="arch" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f8fdff"/><stop offset="1" stop-color="#d3edf0"/></linearGradient><pattern id="tile" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M32 5 39 24 59 32 39 40 32 59 25 40 5 32 25 24Z" fill="none" stroke="#65aaba" stroke-opacity=".16" stroke-width="1.4"/><circle cx="32" cy="32" r="7" fill="none" stroke="#65aaba" stroke-opacity=".13"/></pattern></defs><rect width="1440" height="520" rx="40" fill="url(#sky)"/><path d="M0 390Q260 315 505 392T1015 386 1440 350V520H0Z" fill="#b9e0dd" opacity=".7"/><path d="M250 520V246C250 109 388 28 526 28s276 81 276 218v274Z" fill="url(#arch)" stroke="#8dc5cf" stroke-opacity=".45" stroke-width="8"/><path d="M308 520V260c0-106 98-178 218-178s218 72 218 178v260Z" fill="url(#tile)"/><path d="M0 488H1440" stroke="#73aeb7" stroke-opacity=".22" stroke-width="3"/><g fill="#fff" opacity=".72"><circle cx="1080" cy="115" r="9"/><circle cx="1190" cy="188" r="6"/><circle cx="1015" cy="260" r="5"/><circle cx="1325" cy="92" r="7"/></g><g fill="none" stroke="#5a9eaa" stroke-opacity=".28" stroke-width="3"><path d="M985 444q34-60 68 0m-34-2v-54m260 56q-32-50-64 0m32-2v-46"/><path d="M1053 387q20-24 38-4m-106 0q-20-24-38-4m346 10q-18-21-34-4m-224 10q18-22 36-5"/></g><path d="M1050 494h310" stroke="#53909b" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/></svg>';
export const QURAN_SCENE_BACKGROUND = `url("data:image/svg+xml,${encodeURIComponent(quranSceneSvg)}")`;
export function quranSurahName(number) {
  return Number.isInteger(number) && number >= 1 && number <= surahNames.length ? surahNames[number - 1] : `Surah ${number}`;
}
export function quranSurahCatalog() {
  return surahNames.map((name, index) => ({ number: index + 1, name }));
}
async function getJson(url, signal, maxBytes = 4 * 1024 * 1024) {
  const response = await fetch(url, { signal: signal || AbortSignal.timeout(15e3), headers: { Accept: "application/json" }, credentials: "omit", referrerPolicy: "no-referrer" });
  if (!response.ok) throw Error(`Scripture source returned ${response.status}`);
  return JSON.parse(await responseText(response, maxBytes));
}
function asText(value, max = 12e3) {
  return typeof value === "string" ? value.slice(0, max) : "";
}
function stripTags(value) {
  return value.replace(/<[^>]{0,2000}>/g, " ").replace(/\s+/g, " ").trim();
}
function todayNumber(date) {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 864e5);
}
function dailyIndex(date, length, offset = 0) {
  return length ? (todayNumber(date) + offset) % length : 0;
}
function responseRows(value) {
  return Array.isArray(value) ? value : Array.isArray(value?.result) ? value.result : Array.isArray(value?.translations) ? value.translations : Array.isArray(value?.data) ? value.data : [];
}
const preferredTranslations = { id: "indonesian_affairs", en: "english_saheeh", ja: "japanese_saeedsato" };
export async function listQuranTranslations(language, signal) {
  const lang = localeBase(language), supported = ["id", "en", "ja"].includes(lang) ? lang : "en";
  const rows = responseRows(await getJson(`${quranApi}/translations/list/${encodeURIComponent(supported)}?localization=${encodeURIComponent(supported)}`, signal, 1024 * 1024));
  const editions = rows.filter((row) => String(row?.language_iso_code || "").toLowerCase() === supported && typeof row?.key === "string" && /^[a-z0-9_]+$/.test(row.key)).map((row) => ({ key: String(row.key), title: asText(row.title) || supported.toUpperCase(), version: asText(row.version) || "source version not provided", language: supported, description: asText(row.description, 1e3) }));
  if (!editions.length) throw Error(`QuranEnc has no available translation editions for ${supported.toUpperCase()} right now.`);
  const preferred = preferredTranslations[supported];
  return editions.sort((a, b) => Number(b.key === preferred) - Number(a.key === preferred) || a.title.localeCompare(b.title));
}
async function quranTranslation(language, signal, translationKey) {
  const editions = await listQuranTranslations(language, signal), lang = editions[0].language;
  if (translationKey) {
    const selected = editions.find((edition) => edition.key === translationKey);
    if (!selected) throw Error(`The selected Quran edition is not available in ${lang.toUpperCase()}. Choose another translation.`);
    return selected;
  }
  const preferred = editions.find((edition) => edition.key === preferredTranslations[lang]);
  return preferred || editions[0];
}
export async function loadQuranSurah(number, language, signal, translationKey) {
  if (!Number.isInteger(number) || number < 1 || number > 114) throw new RangeError("Choose a surah from 1 to 114.");
  const translation = await quranTranslation(language, signal, translationKey);
  const data = await getJson(`${quranApi}/translation/sura/${encodeURIComponent(translation.key)}/${number}`, signal, 4 * 1024 * 1024);
  const rows = responseRows(data), verses = rows.map((row) => ({ sura: Number(row.sura) || number, aya: Number(row.aya) || 0, arabic: asText(row.arabic_text), translation: asText(row.translation), footnotes: asText(row.footnotes) })).filter((row) => row.aya > 0 && !!row.translation);
  if (!verses.length) throw Error("The Quran edition returned no readable verses.");
  return { number, name: surahNames[number - 1], translationKey: translation.key, translationTitle: translation.title, version: translation.version, language: translation.language, verses, sourceUrl: `https://quranenc.com/en/browse/${encodeURIComponent(translation.key)}/${number}` };
}
async function quranOfTheDay(language, date, signal) {
  const day = todayNumber(date), sura = 1 + Math.abs(day) % 114, result = await loadQuranSurah(sura, language, signal), verse = result.verses[Math.abs(Math.floor(day / 114)) % result.verses.length];
  const publisher = result.language === "id" ? "Kementerian Agama RI \xB7 QuranEnc" : "QuranEnc \xB7 " + result.translationTitle, quranTitle = result.language === "ja" ? "\u30AF\u30EB\u30A2\u30FC\u30F3" : result.language === "en" ? "The Quran" : "Al-Qur\u2019an";
  return { faith: "islam", title: quranTitle + " \xB7 " + result.name, text: verse.translation, reference: `Surah ${result.number}:${verse.aya}`, attribution: `${publisher} \xB7 v${result.version}`, sourceUrl: result.sourceUrl, language: result.language };
}
const bibleReferences = ["John 3:16", "Psalm 23:1", "Matthew 5:9", "Romans 12:12", "Philippians 4:6"];
async function christianReading(date, signal, faith = "christianity") {
  const ref = bibleReferences[dailyIndex(date, bibleReferences.length)], data = await getJson(`https://bible-api.com/${encodeURIComponent(ref)}?translation=web`, signal, 256 * 1024), text = asText(data.text).trim();
  if (!text) throw Error("The Bible source returned an empty passage.");
  return { faith, title: "Bible reading", text, reference: asText(data.reference) || ref, attribution: "World English Bible \xB7 Public Domain \xB7 eBible.org \xB7 English text", sourceUrl: "https://ebible.org/engwebp/", language: "en" };
}
const torahReferences = ["Genesis 1:1", "Psalms 23:1", "Deuteronomy 6:4", "Proverbs 3:5"];
async function jewishReading(date, signal) {
  const ref = torahReferences[dailyIndex(date, torahReferences.length)], data = await getJson(`https://www.sefaria.org/api/v3/texts/${encodeURIComponent(ref)}?version=hebrew&return_format=text_only`, signal, 512 * 1024), version = responseRows(data?.versions)[0], license = asText(version?.license);
  if (!version || !license || /NC|not verified|unknown/i.test(license)) throw Error("This Sefaria text version has no reusable license metadata.");
  const raw = Array.isArray(version.text) ? version.text.join(" ") : version.text, text = stripTags(asText(raw));
  if (!text) throw Error("The Sefaria source returned no readable text.");
  const versionTitle = asText(version.versionTitle) || "Hebrew source text";
  return { faith: "judaism", title: "Tanakh reading", text, reference: ref, attribution: `Sefaria \xB7 ${versionTitle} \xB7 ${license}`, sourceUrl: `https://www.sefaria.org/${encodeURIComponent(ref.replaceAll(" ", "."))}`, language: "he", license, direction: "rtl" };
}
async function buddhistReading(date, signal) {
  const rows = responseRows(await getJson("https://suttacentral.net/api/epigraphs", signal, 1024 * 1024));
  const candidates = rows.filter((row2) => typeof row2?.uid === "string" && /\/sujato(?:#|$)/.test(row2.uid) && typeof row2?.epigraph === "string" && row2.epigraph.trim());
  if (!candidates.length) throw Error("No verified CC0 SuttaCentral passages are available right now.");
  const row = candidates[dailyIndex(date, candidates.length)], uid = asText(row.uid), reference = uid.split("/")[0];
  return { faith: "buddhism", title: "Dhamma reading", text: asText(row.epigraph), reference, attribution: "SuttaCentral \xB7 Bhikkhu Sujato \xB7 CC0", sourceUrl: `https://suttacentral.net/${uid.split("#")[0]}`, language: uid.split("/")[1] || "en" };
}
const gitaReferences = [[2, 47], [2, 48], [4, 7], [4, 8], [6, 5]];
async function hinduReading(language, date, signal) {
  const [chapter, verse] = gitaReferences[dailyIndex(date, gitaReferences.length)], url = `https://vedicscriptures.github.io/slok/${chapter}/${verse}`, data = await getJson(url, signal, 256 * 1024), text = asText(data.slok);
  if (!text) throw Error("The Bhagavad Gita source returned no Sanskrit verse.");
  const english = localeBase(language) === "en" ? asText(data.siva?.et) : "";
  return { faith: "hinduism", title: "Bhagavad Gita", text: english || text, reference: `${chapter}.${verse}`, attribution: english ? "Bhagavad Gita API \xB7 Swami Sivananda English rendering" : "Bhagavad Gita API \xB7 Sanskrit source text", sourceUrl: url, language: english ? "en" : "sa" };
}
async function sikhReading(signal) {
  const data = await getJson("https://api.banidb.com/v2/random/1", signal, 512 * 1024), rows = responseRows(data?.verses), text = rows.map((row) => asText(row?.verse?.unicode || row?.verse?.gurmukhi)).filter(Boolean).join("\n");
  if (!text) throw Error("BaniDB returned no original Gurmukhi lines.");
  const info = data.shabadInfo || {}, reference = [info.source?.english, info.pageNo ? "Ang " + info.pageNo : ""].filter(Boolean).join(" \xB7 ");
  return { faith: "sikhism", title: "Gurbani reading", text, reference: reference || "Sri Guru Granth Sahib Ji", attribution: "BaniDB \xB7 original Gurmukhi text", sourceUrl: "https://www.banidb.com/", language: "pa" };
}
export function faithSource(faith) {
  switch (faith) {
    case "confucianism":
      return "https://ctext.org/analects/xue-er?if=en";
    case "islam":
      return "https://quranenc.com/en/home/api/";
    case "catholicism":
      return "https://bible-api.alkitab.or.id/";
    case "protestantism":
    case "christianity":
      return "https://ebible.org/engwebp/";
    case "hinduism":
      return "https://vedicscriptures.github.io/";
    case "buddhism":
      return "https://suttacentral.net/api/docs/index.html";
    case "judaism":
      return "https://developers.sefaria.org/reference/get-v3-texts";
    case "sikhism":
      return "https://api.banidb.com/v2/api-docs/";
    default:
      return "https://quranenc.com/en/home/api/";
  }
}
export async function loadFaithReading(faith, language, date = /* @__PURE__ */ new Date(), signal) {
  switch (faith) {
    case "islam":
      return quranOfTheDay(language, date, signal);
    case "christianity":
      return christianReading(date, signal);
    case "protestantism":
      return christianReading(date, signal, "protestantism");
    case "catholicism":
      return null;
    case "judaism":
      return jewishReading(date, signal);
    case "buddhism":
      return buddhistReading(date, signal);
    case "hinduism":
      return hinduReading(language, date, signal);
    case "sikhism":
      return sikhReading(signal);
    case "confucianism":
      return null;
    default:
      return null;
  }
}
const islamicReadingSlugs = /* @__PURE__ */ new Set(["waking-up", "morning-adhkar", "after-salah", "evening-adhkar", "before-sleep", "quranic-duas", "home", "food-drink", "travel"]);
export async function loadIslamicReadingCollection(slug, signal) {
  if (!islamicReadingSlugs.has(slug)) throw new RangeError("Choose an available daily Islamic reading.");
  const sourceUrl = `https://buruja.com/api/v1/adhkar/${slug}.json`, data = await getJson(sourceUrl, signal, 768 * 1024), rawItems = Array.isArray(data?.items) ? data.items : [];
  const items = rawItems.slice(0, 64).map((row) => ({ title: asText(row.title, 200), arabic: asText(row.arabic, 12e3), transliteration: asText(row.translit, 4e3), meaning: asText(row.en, 12e3), reference: asText(row.ref, 1e3), repeat: asText(row.repeat, 100), grade: asText(row.grade, 200), note: asText(row.note, 2e3) })).filter((row) => !!row.arabic && !!row.meaning);
  if (!items.length) throw Error("The daily reading source returned no complete Arabic and English passages.");
  return { slug, name: asText(data.name, 200) || slug, arabicName: asText(data.arabic_name, 200), title: asText(data.title, 500) || asText(data.name, 200) || slug, sourceNote: asText(data.source_note, 500), items, sourceUrl };
}
export async function openIslamicReadingInSela(slug, title, openBook, uiLanguage = "en", signal) {
  const collection = await loadIslamicReadingCollection(slug, signal), lang = localeBase(uiLanguage), copy = lang === "id" ? { meaning: "Makna bahasa Inggris", transliteration: "Transliterasi", source: "Rujukan", repeat: "Ulangan", note: "Catatan", sourceLine: "Sumber dan teks asli" } : lang === "ja" ? { meaning: "\u82F1\u8A9E\u306E\u610F\u5473", transliteration: "\u7FFB\u5B57", source: "\u51FA\u5178", repeat: "\u56DE\u6570", note: "\u6CE8\u8A18", sourceLine: "\u51FA\u5178\u3068\u539F\u6587" } : { meaning: "English meaning", transliteration: "Transliteration", source: "Reference", repeat: "Repeat", note: "Note", sourceLine: "Source and original text" };
  const rows = collection.items.map((item, index) => `<article class="adhkar-entry"><p class="entry-index">${String(index + 1).padStart(2, "0")}</p><h2>${escapeHtml(item.title || item.reference || collection.name)}</h2><p class="arabic" lang="ar" dir="rtl">${escapeHtml(item.arabic)}</p>${item.transliteration ? `<p class="transliteration"><b>${escapeHtml(copy.transliteration)}:</b> ${escapeHtml(item.transliteration)}</p>` : ""}<p class="meaning" lang="en"><b>${escapeHtml(copy.meaning)}:</b> ${escapeHtml(item.meaning)}</p><p class="reference">${item.reference ? `<b>${escapeHtml(copy.source)}:</b> ${escapeHtml(item.reference)}` : ""}${item.repeat ? ` \xB7 <b>${escapeHtml(copy.repeat)}:</b> ${escapeHtml(item.repeat)}` : ""}${item.grade ? ` \xB7 ${escapeHtml(item.grade)}` : ""}</p>${item.note ? `<p class="note"><b>${escapeHtml(copy.note)}:</b> ${escapeHtml(item.note)}</p>` : ""}</article>`).join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="author" content="Sela Books"><title>${escapeHtml(title)}</title><style>:root{color-scheme:light dark}*{box-sizing:border-box}body{max-width:54rem;margin:0 auto;padding:clamp(1rem,4vw,2.5rem);font:400 1rem/1.75 system-ui,sans-serif;color:inherit}.adhkar-scene{display:grid;min-height:clamp(150px,24vw,230px);align-content:end;gap:.45rem;margin-bottom:1.25rem;padding:clamp(1.25rem,4vw,2rem);border:1px solid color-mix(in srgb,#50a5c7 28%,transparent);border-radius:28px;background-color:#eaf7fc;background-image:linear-gradient(90deg,#f7fcffbb,#eefaff78),${QURAN_SCENE_BACKGROUND};background-position:center;background-size:cover;color:#294d58}.kicker{font-size:.72rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;opacity:.72}.adhkar-scene h1{max-width:24ch;margin:0;font-size:clamp(1.35rem,3vw,2rem);line-height:1.25}.source{margin:.2rem 0 0;font-size:.78rem;line-height:1.5;opacity:.78}.source a{color:inherit}.adhkar-entry{margin:1rem 0;padding:clamp(1rem,3vw,1.5rem);border:1px solid color-mix(in srgb,currentColor 14%,transparent);border-radius:24px;background-color:color-mix(in srgb,currentColor 3%,transparent);background-image:linear-gradient(110deg,color-mix(in srgb,#91dce8 8%,transparent),transparent 72%),${QURAN_PATTERN_BACKGROUND};background-size:auto,192px 192px}.entry-index{margin:0;color:#5c91a1;font:700 .72rem/1 system-ui,sans-serif;letter-spacing:.1em}.adhkar-entry h2{margin:.5rem 0;font-size:1.12rem}.arabic{margin:1rem 0;text-align:center;font:400 clamp(1.5rem,4vw,2.2rem)/2 "Noto Naskh Arabic","Amiri",serif}.transliteration,.meaning{white-space:pre-wrap}.reference,.note{font-size:.82rem;line-height:1.55;opacity:.76}.note{margin-bottom:0}.source a:focus-visible{outline:2px solid currentColor;outline-offset:3px}@media(prefers-color-scheme:dark){.adhkar-scene{background-image:linear-gradient(90deg,#243846d9,#293d4ab8),${QURAN_SCENE_BACKGROUND};color:#f3f9fb}.adhkar-entry{background-color:color-mix(in srgb,currentColor 5%,transparent)}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}</style></head><body><main><header class="adhkar-scene"><span class="kicker">Sela \xB7 Daily remembrance</span><h1>${escapeHtml(title)}</h1><p class="source">${escapeHtml(collection.arabicName)} \xB7 ${collection.items.length} passages \xB7 <a href="${escapeHtml(collection.sourceUrl)}">${escapeHtml(copy.sourceLine)} \xB7 Buruja</a></p></header>${rows}</main></body></html>`;
  const file = new File([html], `islamic-${slug}.html`, { type: "text/html" });
  await openBook({ previewFile: file, format: "html", name: title, metadata: { title, author: "Buruja Content API", language: "en", rights: "Buruja Content API; preserve each Quran and hadith attribution", description: collection.sourceUrl, faith: "islam" } });
  return collection;
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
export function faithReadingHtml(title, rows, attribution, language = "en") {
  const body = rows.map((row) => `<section><h2>${escapeHtml(row.reference)}</h2><p dir="${row.direction === "rtl" ? "rtl" : "auto"}">${escapeHtml(row.text)}</p></section>`).join("\n");
  return `<!doctype html><html lang="${escapeHtml(language)}"><head><meta charset="utf-8"><meta name="author" content="Sela Books"><title>${escapeHtml(title)}</title></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(attribution)}</p>${body}</body></html>`;
}
function quranReadingHtml(title, surah, arabicSize, translationSize, startVerse) {
  const verses = surah.verses.map((verse) => `<article id="quran-verse-${verse.aya}" class="quran-verse"><h2>${verse.sura}:${verse.aya}</h2><p class="quran-arabic" lang="ar" dir="rtl">${escapeHtml(verse.arabic)}</p><p class="quran-translation" lang="${escapeHtml(surah.language)}" dir="auto">${escapeHtml(verse.translation)}</p>${verse.footnotes ? `<small class="quran-footnotes">${escapeHtml(verse.footnotes)}</small>` : ""}</article>`).join("\n");
  const copy = surah.language === "id" ? { learn: "Sumber belajar resmi", latin: "Latin, terjemahan dan tafsir surat ini \xB7 Qur\u2019an Kemenag", names: "Makna nama seluruh surat \xB7 LPMQ", revelation: "Periode pewahyuan Makki dan Madani \xB7 LPMQ", asbab: "Asbabun Nuzul \xB7 LPMQ", prophets: "Kisah para nabi pra-Ibrahim \xB7 LPMQ", prophethood: "Kenabian dalam Al-Qur\u2019an \xB7 LPMQ", tajweed: "Tajwid warna dan transliterasi Latin \xB7 Juz Amma", scope: "Buku tajwid ini khusus Juz Amma." } : surah.language === "ja" ? { learn: "\u4FE1\u983C\u3067\u304D\u308B\u5B66\u7FD2\u8CC7\u6599", latin: "\u3053\u306E\u7AE0\u306E\u30E9\u30C6\u30F3\u6587\u5B57\u8868\u8A18\u30FB\u7FFB\u8A33\u30FB\u6CE8\u91C8 \xB7 \u30AF\u30EB\u30A2\u30FC\u30F3\u30FB\u30A4\u30F3\u30C9\u30CD\u30B7\u30A2\u5B97\u6559\u7701", names: "\u5168\u30B9\u30FC\u30E9\u540D\u306E\u610F\u5473 \xB7 LPMQ", revelation: "\u5553\u793A\u306E\u6642\u671F\uFF1A\u30DE\u30C3\u30AB\u30FB\u30DE\u30C7\u30A3\u30FC\u30CA \xB7 LPMQ", asbab: "\u5553\u793A\u306E\u80CC\u666F \xB7 LPMQ", prophets: "\u30A4\u30D6\u30E9\u30FC\u30D2\u30FC\u30E0\u4EE5\u524D\u306E\u9810\u8A00\u8005\u306E\u7269\u8A9E \xB7 LPMQ", prophethood: "\u30AF\u30EB\u30A2\u30FC\u30F3\u306B\u304A\u3051\u308B\u9810\u8A00 \xB7 LPMQ", tajweed: "\u30AB\u30E9\u30FC\u30BF\u30B8\u30E5\u30A6\u30A3\u30FC\u30C9\u3068\u30E9\u30C6\u30F3\u8868\u8A18 \xB7 \u30B8\u30E5\u30BA\u30FB\u30A2\u30F3\u30DE", scope: "\u30AB\u30E9\u30FC\u30BF\u30B8\u30E5\u30A6\u30A3\u30FC\u30C9\u8CC7\u6599\u306F\u30B8\u30E5\u30BA\u30FB\u30A2\u30F3\u30DE\u306E\u307F\u3067\u3059\u3002" } : { learn: "Verified study sources", latin: "Latin transliteration, translation and tafsir for this surah \xB7 Kemenag", names: "Meanings of all surah names \xB7 LPMQ", revelation: "Revelation periods: Makki and Madani \xB7 LPMQ", asbab: "Asbabun Nuzul \xB7 LPMQ", prophets: "Stories of prophets before Ibrahim \xB7 LPMQ", prophethood: "Prophethood in the Quran \xB7 LPMQ", tajweed: "Color tajwid and Latin guide \xB7 Juz Amma", scope: "This color tajwid guide covers Juz Amma only." };
  const studyLinks = [{ label: copy.latin, url: quranKemenagSurahUrl(surah.number, surah.verses.length) }, { label: copy.names, url: QURAN_STUDY_SOURCES.surahNames }, { label: copy.revelation, url: QURAN_STUDY_SOURCES.revelationPeriod }, { label: copy.asbab, url: QURAN_STUDY_SOURCES.asbabunNuzul }, { label: copy.prophets, url: QURAN_STUDY_SOURCES.prophetStories }, { label: copy.prophethood, url: QURAN_STUDY_SOURCES.prophethood }, { label: copy.tajweed, url: QURAN_STUDY_SOURCES.tajweedLatinJuzAmma }].map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} \u2197</a>`).join("");
  const studies = `<aside class="quran-study-links" aria-labelledby="quran-study-heading"><h2 id="quran-study-heading">${escapeHtml(copy.learn)}</h2><div>${studyLinks}</div><p>${escapeHtml(copy.scope)}</p></aside>`;
  return `<!doctype html><html lang="${escapeHtml(surah.language)}"><head><meta charset="utf-8"><meta name="author" content="Sela Books"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>
body{max-width:48rem;margin:0 auto;padding:clamp(1rem,4vw,2.5rem);line-height:1.7;color:inherit}
.quran-reading-scene{box-sizing:border-box;min-height:clamp(150px,24vw,230px);display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:.35rem;margin:0 0 1rem;padding:clamp(1.25rem,4vw,2rem);overflow:hidden;border:1px solid color-mix(in srgb,#4f9baa 22%,transparent);border-radius:26px;background-color:color-mix(in srgb,currentColor 4%,transparent);background-image:linear-gradient(90deg,color-mix(in srgb,#f7fdff 10%,transparent),color-mix(in srgb,#f7fdff 55%,transparent)),${QURAN_SCENE_BACKGROUND};background-position:center;background-size:cover;color:#294d58}
.quran-scene-kicker{margin:0;font:700 .7rem/1.3 system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;opacity:.72}.quran-scene-title{max-width:28ch;font:600 clamp(1.2rem,3vw,1.8rem)/1.25 system-ui,sans-serif;overflow-wrap:anywhere}.quran-scene-reference{font:500 .82rem/1.4 system-ui,sans-serif;opacity:.8}
.quran-source{font-size:.8rem;line-height:1.5;opacity:.8;margin:0 0 1.25rem}
.quran-study-links{display:grid;gap:.6rem;margin:1.25rem 0;padding:1rem;border:1px solid color-mix(in srgb,currentColor 13%,transparent);border-radius:18px;background:color-mix(in srgb,currentColor 3%,transparent)}.quran-study-links h2{margin:0;font:650 .95rem/1.4 system-ui,sans-serif}.quran-study-links>div{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:.5rem}.quran-study-links a{display:flex;min-height:42px;align-items:center;padding:.55rem .75rem;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:12px;color:inherit;font:600 .8rem/1.45 system-ui,sans-serif;text-decoration:none}.quran-study-links a:hover,.quran-study-links a:focus-visible{border-color:#4f9baa;color:#347d8b}.quran-study-links p{margin:0;font:400 .72rem/1.5 system-ui,sans-serif;opacity:.68}
.quran-verse{padding:1.25rem 1.5rem;margin:1rem 0;border:1px solid color-mix(in srgb,currentColor 13%,transparent);border-radius:22px;background-color:color-mix(in srgb,currentColor 3%,transparent);background-image:linear-gradient(110deg,color-mix(in srgb,currentColor 2%,transparent),color-mix(in srgb,#9bdae3 12%,transparent)),${QURAN_PATTERN_BACKGROUND};background-repeat:no-repeat,repeat;background-size:cover,192px 192px;box-shadow:0 8px 24px #2d66850c}.quran-verse h2{font:600 .8rem/1.4 system-ui,sans-serif;opacity:.7}.quran-arabic{font-family:"Noto Naskh Arabic","Amiri",serif;font-size:${arabicSize}px;line-height:2.1;text-align:center;margin:1rem 0 1.5rem}.quran-translation{font-family:system-ui,sans-serif;font-size:${translationSize}px;line-height:1.8;white-space:pre-wrap}.quran-footnotes{display:block;font:400 .8rem/1.6 system-ui,sans-serif;opacity:.68;margin-top:.75rem}
</style></head><body><main data-quran-surah="${surah.number}" data-quran-translation-key="${escapeHtml(surah.translationKey)}" data-quran-language="${escapeHtml(surah.language)}" data-quran-start-verse="${startVerse}" data-quran-verse-count="${surah.verses.length}" data-quran-arabic-size="${arabicSize}" data-quran-translation-size="${translationSize}"><section id="quran-reading-scene" aria-label="${escapeHtml(title)}"><span class="quran-scene-kicker">${surah.language === "ja" ? "\u30AF\u30EB\u30A2\u30FC\u30F3\u306E\u8AAD\u66F8" : surah.language === "en" ? "A quiet moment with the Quran" : "Waktu tenang bersama Al-Qur\u2019an"}</span><strong class="quran-scene-title">${escapeHtml(surah.name)}</strong><span class="quran-scene-reference">${surah.number} \xB7 ${surah.verses.length} ${surah.language === "ja" ? "\u7BC0" : surah.language === "en" ? "verses" : "ayat"}</span></section><h1>${escapeHtml(title)}</h1><p class="quran-source">${escapeHtml(surah.translationTitle)} \xB7 version ${escapeHtml(surah.version)} \xB7 QuranEnc \xB7 <a href="https://quranenc.com/en/home/api/">Source and translation terms</a></p>${studies}${verses}</main></body></html>`;
}
export async function openQuranInSela(number, language, openBook, signal, options = {}) {
  const surah = await loadQuranSurah(number, language, signal, options.translationKey), title = `Al-Qur\u2019an \xB7 ${surah.name}`;
  const arabicSize = Math.max(20, Math.min(48, Math.round(options.arabicSize || 32))), translationSize = Math.max(14, Math.min(28, Math.round(options.translationSize || 18)));
  const attribution = `${surah.translationTitle} \xB7 version ${surah.version} \xB7 QuranEnc \xB7 https://quranenc.com/en/home/api/`;
  const startVerse = Math.max(1, Math.min(surah.verses.length, Math.round(options.verse || 1)));
  const file = new File([quranReadingHtml(title, surah, arabicSize, translationSize, startVerse)], `quran-${number}.html`, { type: "text/html" });
  await openBook({ previewFile: file, format: "html", name: title, metadata: { title, author: surah.translationTitle, language: surah.language, rights: `QuranEnc \xB7 ${surah.version}`, description: attribution, quran: { surah: surah.number, translationKey: surah.translationKey, translationTitle: surah.translationTitle, version: surah.version, language: surah.language, startVerse, verseCount: surah.verses.length, arabicSize, translationSize } } });
  return surah;
}
export async function openFaithReadingInSela(reading, openBook) {
  const title = `${reading.title} \xB7 ${reading.reference}`, file = new File([faithReadingHtml(title, [{ reference: reading.reference, text: reading.text, direction: reading.direction }], reading.attribution, reading.language)], `scripture-${reading.faith}.html`, { type: "text/html" });
  await openBook({ previewFile: file, format: "html", name: title, metadata: { title, author: reading.attribution, language: reading.language, rights: reading.license || reading.attribution, description: reading.sourceUrl } });
}
