// Generated from src/locale.ts by npm run build. Do not edit.
export const APP_LANGUAGES = [
  { locale: "en-US", name: "English", base: "en", country: "US" },
  { locale: "id-ID", name: "Bahasa Indonesia", base: "id", country: "ID" },
  { locale: "ja-JP", name: "\u65E5\u672C\u8A9E", base: "ja", country: "JP" }
];
const byBase = Object.fromEntries(APP_LANGUAGES.map((item) => [item.base, item]));
export function normalizeLocale(value) {
  if (!value) return "en-US";
  const normalized = value.replace("_", "-").toLowerCase();
  const exact = APP_LANGUAGES.find((item) => item.locale.toLowerCase() === normalized);
  if (exact) return exact.locale;
  const base = normalized.split("-")[0];
  return byBase[base]?.locale || "en-US";
}
export function localeBase(value) {
  return normalizeLocale(value).split("-")[0];
}
export function holidayCountry(value) {
  return APP_LANGUAGES.find((item) => item.locale === normalizeLocale(value))?.country || "US";
}
const countryLocales = { ID: "id-ID", JP: "ja-JP" };
export function localeForCountry(country) {
  const code = (country || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? countryLocales[code] || "en-US" : "en-US";
}
