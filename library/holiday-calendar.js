// Generated from app/library/holiday-calendar.ts by npm run build. Do not edit.
const CACHE_PREFIX = "sela-library:public-holidays:v1:";
const WEEK = 7 * 24 * 60 * 60 * 1e3;
const memory = /* @__PURE__ */ new Map();
function valid(value) {
  if (!Array.isArray(value) || value.length > 120) return false;
  return value.every((item) => item && typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && typeof item.name === "string" && item.name.length <= 180 && typeof item.localName === "string" && item.localName.length <= 180 && typeof item.countryCode === "string" && Array.isArray(item.types));
}
function read(key) {
  const inMemory = memory.get(key);
  if (inMemory) return inMemory;
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    if (value && Number.isFinite(value.savedAt) && valid(value.holidays)) return value;
  } catch {
  }
  return void 0;
}
function save(key, holidays) {
  const value = { savedAt: Date.now(), holidays };
  memory.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
  return value;
}
export async function loadPublicHolidays(year, country, fetcher = fetch) {
  if (!Number.isInteger(year) || year < 1970 || year > 2100 || !/^[A-Z]{2}$/.test(country)) throw new TypeError("Invalid holiday calendar region");
  const key = CACHE_PREFIX + country + ":" + year, cached = read(key);
  if (cached && Date.now() - cached.savedAt < WEEK) return { country, year, holidays: cached.holidays, cached: true, stale: false };
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 1e4);
  try {
    const response = await fetcher(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`, { signal: controller.signal, credentials: "omit", referrerPolicy: "no-referrer" });
    if (!response.ok) throw new Error(`Holiday service returned ${response.status}`);
    const body = await response.json();
    if (!valid(body)) throw new Error("Holiday service returned invalid data");
    const holidays = body.filter((item) => item.global || !item.counties).map((item) => ({ date: item.date, localName: item.localName.trim().slice(0, 180), name: item.name.trim().slice(0, 180), countryCode: item.countryCode, global: !!item.global, types: item.types.filter((type) => typeof type === "string").slice(0, 8) })).sort((a, b) => a.date.localeCompare(b.date));
    const saved = save(key, holidays);
    return { country, year, holidays: saved.holidays, cached: false, stale: false };
  } catch (error) {
    if (cached) return { country, year, holidays: cached.holidays, cached: true, stale: true };
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
