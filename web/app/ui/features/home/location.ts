export type SavedLocation = { name: string; latitude: number; longitude: number; timezone: string };
export type WeatherSnapshot = { current: { temperature_2m: number; weather_code: number; is_day?: number }; timezone: string; at: number };

const locationKey = 'sela-library:weather';
const weatherCodes = new Set([0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]);

export function readSavedLocation(): SavedLocation | null {
  try {
    const value = JSON.parse(localStorage.getItem(locationKey) || 'null');
    if (!value || !Number.isFinite(value.latitude) || !Number.isFinite(value.longitude) || Math.abs(value.latitude) > 90 || Math.abs(value.longitude) > 180) return null;
    return { name: typeof value.name === 'string' ? value.name.slice(0, 180) : '', latitude: value.latitude, longitude: value.longitude, timezone: typeof value.timezone === 'string' ? value.timezone.slice(0, 80) : '' };
  } catch { return null; }
}

export function readWeatherSnapshot(): WeatherSnapshot | null {
  try {
    const value = JSON.parse(localStorage.getItem(locationKey) || 'null');
    if (!value || !Number.isFinite(value.at) || !Number.isFinite(value.current?.temperature_2m) || !Number.isInteger(value.current?.weather_code) || !weatherCodes.has(value.current.weather_code)) return null;
    return { current: { temperature_2m: value.current.temperature_2m, weather_code: value.current.weather_code, is_day: value.current.is_day }, timezone: typeof value.timezone === 'string' ? value.timezone : '', at: value.at };
  } catch { return null; }
}

export function saveSavedLocation(location: SavedLocation) {
  localStorage.setItem(locationKey, JSON.stringify(location));
  document.dispatchEvent(new Event('sela:weather'));
}

export function saveWeatherSnapshot(location: SavedLocation, weather: WeatherSnapshot) {
  try { localStorage.setItem(locationKey, JSON.stringify({ ...location, current: weather.current, timezone: weather.timezone, at: weather.at })); } catch { /* Forecast remains in component state. */ }
  document.dispatchEvent(new Event('sela:weather'));
}

export function clearSavedLocation() {
  try { localStorage.removeItem(locationKey); localStorage.removeItem('sela-library:prayer-times-v1'); } catch { /* In-memory widgets still clear. */ }
  document.dispatchEvent(new Event('sela:weather'));
}

export async function geocodeCity(name: string, language: string, signal: AbortSignal) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('count', '5'); url.searchParams.set('language', language); url.searchParams.set('name', name.trim().slice(0, 100));
  const response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('City search is unavailable.');
  const text = await response.text(); if (text.length > 256 * 1024) throw new Error('City response is too large.');
  const rows = JSON.parse(text).results;
  if (!Array.isArray(rows)) return [];
  return rows.filter((row: any) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude) && Math.abs(row.latitude) <= 90 && Math.abs(row.longitude) <= 180).slice(0, 5).map((row: any) => ({ name: [row.name, row.admin1, row.country].filter(Boolean).join(', ').slice(0, 180), latitude: row.latitude, longitude: row.longitude, timezone: typeof row.timezone === 'string' ? row.timezone.slice(0, 80) : '' } as SavedLocation));
}

export async function fetchWeather(location: SavedLocation, signal: AbortSignal): Promise<WeatherSnapshot> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(location.latitude)); url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('current', 'temperature_2m,weather_code,is_day'); url.searchParams.set('timezone', 'auto');
  const response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('Weather is unavailable.');
  const text = await response.text(); if (text.length > 128 * 1024) throw new Error('Weather response is too large.');
  const data = JSON.parse(text);
  if (!Number.isFinite(data.current?.temperature_2m) || !Number.isInteger(data.current?.weather_code) || !weatherCodes.has(data.current.weather_code) || typeof data.timezone !== 'string') throw new Error('Weather response is incomplete.');
  return { current: data.current, timezone: data.timezone, at: Date.now() };
}

export function localDateInZone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const value = (type: string) => parts.find(part => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}
