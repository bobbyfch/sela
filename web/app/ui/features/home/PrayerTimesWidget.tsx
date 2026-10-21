import { useEffect, useState } from 'react';
import { Alert, Button, Card, Group, Text, Title } from '@mantine/core';
import { readPersonal } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { localDateInZone, readSavedLocation, type SavedLocation } from './location.ts';

type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
type PrayerCache = { date: string; place: string; locationKey: string; timezone: string; timings: Record<PrayerName, string>; fetchedAt: number };
const cacheKey = 'sela-library:prayer-times-v1';
const prayerNames: [PrayerName, string, string][] = [['Fajr', 'Fajr', 'Subuh'], ['Dhuhr', 'Dhuhr', 'Zuhur'], ['Asr', 'Asr', 'Asar'], ['Maghrib', 'Maghrib', 'Magrib'], ['Isha', 'Isha', 'Isya']];

function readCache(): PrayerCache | null {
  try {
    const value = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (!value || typeof value.date !== 'string' || typeof value.place !== 'string' || typeof value.locationKey !== 'string' || typeof value.timezone !== 'string' || !value.timings || !prayerNames.every(([name]) => typeof value.timings[name] === 'string' && Number.isFinite(Date.parse(value.timings[name])))) return null;
    return value;
  } catch { return null; }
}

function keyFor(location: SavedLocation) { return `${location.latitude.toFixed(2)}:${location.longitude.toFixed(2)}`; }

export function PrayerTimesWidget() {
  const { lang } = useWorkspace();
  const [faith, setFaith] = useState(() => readPersonal().faith);
  const [location, setLocation] = useState<SavedLocation | null>(readSavedLocation);
  const [cache, setCache] = useState<PrayerCache | null>(readCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = (en: string, id: string) => copy(lang, en, id);
  const currentDate = cache ? localDateInZone(new Date(), cache.timezone) : '';
  const validCache = !!cache && !!location && cache.locationKey === keyFor(location) && cache.date === currentDate;

  useEffect(() => {
    const personalChange = () => setFaith(readPersonal().faith);
    const locationChange = () => { setLocation(readSavedLocation()); setCache(readCache()); };
    document.addEventListener('sela:personal', personalChange); document.addEventListener('sela:weather', locationChange);
    return () => { document.removeEventListener('sela:personal', personalChange); document.removeEventListener('sela:weather', locationChange); };
  }, []);
  if (faith !== 'islam') return null;

  const load = async () => {
    const chosen = readSavedLocation(); setLocation(chosen); setError('');
    if (!chosen) { document.dispatchEvent(new Event('sela:weather-settings-request')); return; }
    setLoading(true);
    try {
      const timezone = chosen.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
      const date = localDateInZone(new Date(), timezone), [year, month, day] = date.split('-');
      const url = new URL(`https://api.aladhan.com/v1/timings/${day}-${month}-${year}`);
      url.searchParams.set('latitude', String(chosen.latitude)); url.searchParams.set('longitude', String(chosen.longitude));
      url.searchParams.set('method', '20'); url.searchParams.set('school', '0'); url.searchParams.set('iso8601', 'true');
      const response = await fetch(url, { signal: AbortSignal.timeout(12000), credentials: 'omit', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error(t('Prayer times are unavailable.', 'Jadwal salat belum tersedia.'));
      const raw = await response.text(); if (raw.length > 128 * 1024) throw new Error(t('Prayer-time response is too large.', 'Respons jadwal salat terlalu besar.'));
      const data = JSON.parse(raw), timings = data.data?.timings, apiTimezone = data.data?.meta?.timezone;
      if (data.code !== 200 || !timings || typeof apiTimezone !== 'string' || !prayerNames.every(([name]) => typeof timings[name] === 'string' && Number.isFinite(Date.parse(timings[name])))) throw new Error(t('Prayer-time response is incomplete.', 'Respons jadwal salat tidak lengkap.'));
      const next: PrayerCache = { date, place: chosen.name || t('Nearby location', 'Lokasi sekitar'), locationKey: keyFor(chosen), timezone: apiTimezone, timings: Object.fromEntries(prayerNames.map(([name]) => [name, timings[name]])) as Record<PrayerName, string>, fetchedAt: Date.now() };
      try { localStorage.setItem(cacheKey, JSON.stringify(next)); } catch { /* This session can still show the returned times. */ }
      setCache(next);
    } catch (reason) { setError(reason instanceof Error ? reason.message : t('Prayer times are unavailable.', 'Jadwal salat belum tersedia.')); }
    finally { setLoading(false); }
  };

  return <Card className="home-widget-card prayer-times-widget" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('OPTIONAL LOCATION SERVICE', 'LAYANAN LOKASI OPSIONAL')}</Text><Title order={3}>{t('Prayer times', 'Jadwal salat')}</Title><Text size="sm" c="dimmed">{validCache ? cache!.place : location?.name || t('No saved city', 'Belum ada kota tersimpan')}</Text></div>
    {validCache ? <><div className="prayer-times-grid">{prayerNames.map(([name, en, id]) => <div key={name}><span>{t(en, id)}</span><strong>{new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', { timeZone: cache!.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(cache!.timings[name]))}</strong></div>)}</div><Text size="xs" c="dimmed">{t('Estimated using KEMENAG calculation; local mosque schedules may differ.', 'Perkiraan dengan metode KEMENAG; jadwal masjid setempat dapat berbeda.')}</Text></> : <Alert color="gray">{t('Load a daily estimate using your saved city. Coordinates are sent to AlAdhan only when you press the button.', 'Muat perkiraan harian dari kota tersimpan. Koordinat dikirim ke AlAdhan hanya setelah tombol ditekan.')}</Alert>}
    {error && <Alert color="red" role="alert">{error}</Alert>}
    <Group justify="space-between"><Button onClick={() => void load()} loading={loading}>{validCache ? t('Refresh times', 'Perbarui jadwal') : t('Load today’s times', 'Muat jadwal hari ini')}</Button><a href="https://aladhan.com/prayer-times-api" target="_blank" rel="noopener noreferrer">{t('Calculation source', 'Sumber perhitungan')}</a></Group>
  </Card>;
}
