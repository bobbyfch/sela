// Generated from app/library/personal-store.ts by npm run build. Do not edit.
export const PERSONAL_KEY = "sela-library:personal";
export function emptyPersonal() {
  return { version: 1, room: "", companion: "tanuki", faith: "none", gender: "unspecified", quiet: false, hidden: [], queue: [], books: {}, racks: [], sessions: [], quoteTopic: "reading", quoteLanguage: "auto", quranTranslationKey: "", quranSurah: 1, quranVerse: 1, quranArabicSize: 32, quranTranslationSize: 18 };
}
export function validatePersonal(value) {
  const result = emptyPersonal();
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Invalid personal data");
  const data = value;
  if (data.version !== 1) throw Error("Unsupported personal data version");
  for (const key of ["room", "quoteTopic", "quoteLanguage"]) if (typeof data[key] === "string") result[key] = data[key].slice(0, 80);
  if (result.quoteLanguage !== "auto" && !["id", "en", "ja"].includes(result.quoteLanguage)) result.quoteLanguage = "auto";
  if (typeof data.quranTranslationKey === "string" && /^[a-z0-9_]{1,80}$/.test(data.quranTranslationKey)) result.quranTranslationKey = data.quranTranslationKey;
  if (["id", "en", "ja"].includes(data.quranLanguage)) result.quranLanguage = data.quranLanguage;
  if (Number.isInteger(data.quranSurah) && data.quranSurah >= 1 && data.quranSurah <= 114) result.quranSurah = data.quranSurah;
  if (Number.isInteger(data.quranVerse) && data.quranVerse >= 1 && data.quranVerse <= 286) result.quranVerse = data.quranVerse;
  if (Array.isArray(data.readingsSaved)) {
    const saved = data.readingsSaved.filter((id) => typeof id === "string" && /^[a-z0-9][a-z0-9-]{2,63}\/[a-z0-9]{1,40}(?:[-.][a-z0-9]{1,40})*$/.test(id));
    if (saved.length) result.readingsSaved = [...new Set(saved)].slice(0, 500);
  }
  if (data.readingsLast && typeof data.readingsLast === "object" && !Array.isArray(data.readingsLast)) {
    const last = Object.fromEntries(Object.entries(data.readingsLast).filter(([pack, item]) => /^[a-z0-9][a-z0-9-]{2,63}$/.test(pack) && typeof item === "string" && /^[a-z0-9]{1,40}(?:[-./][a-z0-9]{1,40})*$/.test(item)).slice(0, 100));
    if (Object.keys(last).length) result.readingsLast = last;
  }
  if (Number.isFinite(data.quranArabicSize)) result.quranArabicSize = Math.max(20, Math.min(48, Math.round(data.quranArabicSize)));
  if (Number.isFinite(data.quranTranslationSize)) result.quranTranslationSize = Math.max(14, Math.min(28, Math.round(data.quranTranslationSize)));
  const companions = { fox: "fox", tanuki: "tanuki", crane: "crane", rabbit: "rabbit", plant: "plant", cat: "tanuki", hamster: "tanuki", owl: "crane", turtle: "tanuki", "red-panda": "tanuki", penguin: "crane", shiba: "tanuki", fawn: "rabbit" };
  if (typeof data.companion === "string" && companions[data.companion]) result.companion = companions[data.companion];
  const faithAliases = { none: "none", islam: "islam", christianity: "protestantism", protestantism: "protestantism", catholicism: "catholicism", buddhism: "buddhism", hinduism: "hinduism", confucianism: "confucianism" };
  if (typeof data.faith === "string" && faithAliases[data.faith]) result.faith = faithAliases[data.faith];
  if (["unspecified", "woman", "man", "nonbinary", "another"].includes(data.gender)) result.gender = data.gender;
  result.quiet = data.quiet === true;
  if (Number.isFinite(data.weeklyTarget) && data.weeklyTarget >= 0 && data.weeklyTarget <= 6e3) result.weeklyTarget = Math.round(data.weeklyTarget);
  result.hidden = Array.isArray(data.hidden) ? data.hidden.filter((x) => ["quote", "timer", "rediscover"].includes(x)).slice(0, 10) : [];
  result.queue = Array.isArray(data.queue) ? [...new Set(data.queue.filter((x) => typeof x === "string" && /^[a-f0-9]{64}$/.test(x)))].slice(0, 100) : [];
  if (data.books && typeof data.books === "object" && !Array.isArray(data.books)) for (const [id, item] of Object.entries(data.books).slice(0, 2e3)) {
    if (!/^[a-f0-9]{64}$/.test(id) || !item || typeof item !== "object") continue;
    const source = item, book = {};
    for (const key of ["later", "review", "quote"]) if (typeof source[key] === "string") book[key] = source[key].slice(0, 4e3);
    if (Number.isFinite(source.volume) && source.volume >= 0) book.volume = source.volume;
    book.marks = {};
    if (source.marks && typeof source.marks === "object") {
      for (const [page, text] of Object.entries(source.marks).slice(0, 2e3)) if (/^[1-9]\d{0,6}$/.test(page) && typeof text === "string") book.marks[page] = text.slice(0, 120);
    }
    if (Array.isArray(source.copies)) book.copies = source.copies.filter((c) => c && Number.isInteger(c.page) && c.page > 0 && typeof c.text === "string" && Number.isFinite(c.at)).slice(-50).map((c) => ({ page: c.page, text: c.text.slice(0, 1e4), at: c.at }));
    result.books[id] = book;
  }
  result.racks = Array.isArray(data.racks) ? data.racks.filter((r) => r && typeof r.name === "string" && typeof r.rule === "string").slice(0, 100).map((r) => ({ name: r.name.slice(0, 40), rule: r.rule.slice(0, 150), description: String(r.description || "").slice(0, 500), badge: String(r.badge || "").slice(0, 12) })) : [];
  result.sessions = Array.isArray(data.sessions) ? data.sessions.filter((s) => s && typeof s.book === "string" && Number.isFinite(s.at) && Number.isFinite(s.seconds) && s.seconds >= 0 && s.seconds <= 86400).slice(-2e3).map((s) => ({ book: /^[a-f0-9]{64}$/.test(s.book) ? s.book : "", at: Math.max(0, s.at), seconds: Math.round(s.seconds) })) : [];
  return result;
}
export function readPersonal() {
  try {
    return validatePersonal(JSON.parse(localStorage.getItem(PERSONAL_KEY) || "null"));
  } catch {
    return emptyPersonal();
  }
}
export function savePersonal(data) {
  const valid = validatePersonal(data);
  localStorage.setItem(PERSONAL_KEY, JSON.stringify(valid));
  document.dispatchEvent(new Event("sela:personal"));
  return valid;
}
export function editPersonal(change) {
  const data = readPersonal();
  change(data);
  return savePersonal(data);
}
export function matchesRack(book, rule) {
  const [key, ...rest] = rule.split(":");
  const value = rest.join(":").toLowerCase();
  switch (key) {
    case "unread":
      return !book.opened && !book.completed && !book.didNotFinish;
    case "reading":
      return !!book.opened && !book.completed && !book.didNotFinish;
    case "finished":
      return !!book.completed;
    case "didNotFinish":
      return !!book.didNotFinish;
    case "favorite":
      return !!book.favorite;
    case "recent":
      return !!book.opened && Date.now() - book.opened < Number(value) * 864e5;
    case "collection":
      return (book.tags || []).includes(rest.join(":"));
    case "format":
      return book.format === value;
    case "language":
      return String(book.metadata?.language || "").toLowerCase().startsWith(value);
    case "series":
      return String(book.metadata?.series || "").toLowerCase() === value;
    default:
      return false;
  }
}
