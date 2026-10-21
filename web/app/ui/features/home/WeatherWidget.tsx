import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ActionIcon, Alert, Button, Card, Group, Modal, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { MapPin, RefreshCw } from 'lucide-react';
import { copy, useWorkspace } from '../../workspace.tsx';
import { clearSavedLocation, fetchWeather, geocodeCity, readSavedLocation, readWeatherSnapshot, saveSavedLocation, saveWeatherSnapshot, type SavedLocation, type WeatherSnapshot } from './location.ts';

function weatherLabel(code: number, lang: 'id' | 'en'): string {
  const labels: Record<number, [string, string]> = { 0: ['Clear sky', 'Cerah'], 1: ['Mostly clear', 'Cerah berawan'], 2: ['Partly cloudy', 'Berawan sebagian'], 3: ['Overcast', 'Mendung'], 45: ['Fog', 'Berkabut'], 48: ['Rime fog', 'Kabut beku'], 51: ['Light drizzle', 'Gerimis ringan'], 53: ['Drizzle', 'Gerimis'], 55: ['Dense drizzle', 'Gerimis lebat'], 61: ['Light rain', 'Hujan ringan'], 63: ['Rain', 'Hujan'], 65: ['Heavy rain', 'Hujan lebat'], 71: ['Light snow', 'Salju ringan'], 73: ['Snow', 'Salju'], 75: ['Heavy snow', 'Salju lebat'], 80: ['Rain showers', 'Hujan singkat'], 81: ['Rain showers', 'Hujan singkat'], 82: ['Heavy showers', 'Hujan lebat'], 95: ['Thunderstorm', 'Badai petir'], 96: ['Thunderstorm', 'Badai petir'], 99: ['Thunderstorm', 'Badai petir'] };
  return labels[code]?.[lang === 'id' ? 1 : 0] || (lang === 'id' ? 'Cuaca berubah' : 'Changing weather');
}

function weatherMood(code: number): string {
  if (code === 0) return 'sunny';
  if (code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  return 'cloudy';
}

export function WeatherWidget({ settingsOnly = false }: { settingsOnly?: boolean }) {
  const { lang } = useWorkspace();
  const [location, setLocation] = useState<SavedLocation | null>(readSavedLocation);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(readWeatherSnapshot);
  const [open, setOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [cities, setCities] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const t = (en: string, id: string) => copy(lang, en, id);

  useEffect(() => {
    const sync = () => { setLocation(readSavedLocation()); setWeather(readWeatherSnapshot()); };
    const openSettings = () => setOpen(true);
    document.addEventListener('sela:weather', sync);
    document.addEventListener('sela:weather-settings-request', openSettings);
    return () => { document.removeEventListener('sela:weather', sync); document.removeEventListener('sela:weather-settings-request', openSettings); };
  }, []);

  useEffect(() => {
    if (settingsOnly) { controllerRef.current?.abort(); setWeather(readWeatherSnapshot()); return; }
    if (!location) { setWeather(null); return; }
    let stopped = false;
    const refresh = async (force = false) => {
      const cached = readWeatherSnapshot();
      if (!force && cached && Date.now() - cached.at < 30 * 60 * 1000) { setWeather(cached); return; }
      controllerRef.current?.abort(); const controller = new AbortController(); controllerRef.current = controller;
      setLoading(true); setError('');
      try { const next = await fetchWeather(location, controller.signal); if (stopped) return; setWeather(next); saveWeatherSnapshot(location, next); }
      catch (reason) { if (!stopped && !controller.signal.aborted) setError(reason instanceof Error ? reason.message : t('Weather is unavailable. Saved data remains visible.', 'Cuaca belum tersedia. Data lama tetap ditampilkan.')); }
      finally { if (!stopped) setLoading(false); }
    };
    void refresh();
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30 * 60 * 1000);
    const visibility = () => { if (!document.hidden) void refresh(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { stopped = true; controllerRef.current?.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', visibility); };
  }, [location?.latitude, location?.longitude, location?.name, location?.timezone, refreshKey, settingsOnly]);

  const chooseLocation = (next: SavedLocation) => {
    try { saveSavedLocation(next); setLocation(next); setWeather(null); setCities([]); setMessage(''); setError(''); setOpen(false); }
    catch { setError(t('Location could not be saved on this device.', 'Lokasi belum bisa disimpan di perangkat ini.')); }
  };
  const searchCity = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage(''); setError('');
    try { const rows = await geocodeCity(cityQuery, lang, AbortSignal.timeout(12000)); setCities(rows); setMessage(rows.length ? t('Choose a city from the list.', 'Pilih kota dari daftar.') : t('No city found for that name.', 'Kota tidak ditemukan.')); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t('City search is unavailable.', 'Pencarian kota belum tersedia.')); }
    finally { setLoading(false); }
  };
  const useNearby = () => {
    if (!navigator.geolocation) { setError(t('Location is not available in this browser.', 'Lokasi tidak tersedia di browser ini.')); return; }
    setLoading(true); setError(''); setMessage(t('Waiting for your permission…', 'Menunggu izin lokasi…'));
    navigator.geolocation.getCurrentPosition(position => {
      chooseLocation({ name: t('Nearby location', 'Lokasi sekitar'), latitude: position.coords.latitude, longitude: position.coords.longitude, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '' });
      setLoading(false);
    }, reason => { setLoading(false); setMessage(''); setError(reason.code === 1 ? t('Location permission was declined. You can choose a city instead.', 'Izin lokasi ditolak. Kamu bisa memilih kota.') : t('Could not read your location. Choose a city instead.', 'Lokasi tidak tersedia. Silakan pilih kota.')); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 30 * 60 * 1000 });
  };
  const turnOff = () => { clearSavedLocation(); setLocation(null); setWeather(null); setOpen(false); };
  const displayLocation = location?.name || t('Saved city', 'Kota tersimpan');
  return <>
    {!settingsOnly && <Card className="home-widget-card weather-widget" data-weather={weather ? weatherMood(weather.current.weather_code) : 'neutral'} withBorder radius="xl" padding="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap"><div><Text className="page-eyebrow">{t('A LOCAL GLANCE', 'SEKILAS DI SEKITAR')}</Text><Title order={3}>{t('Weather', 'Cuaca')}</Title><Text size="sm" c="dimmed">{location ? displayLocation : t('No location is saved.', 'Belum ada lokasi tersimpan.')}</Text></div><Tooltip label={t('Weather settings', 'Pengaturan cuaca')} withArrow><ActionIcon variant="subtle" aria-label={t('Weather settings', 'Pengaturan cuaca')} onClick={() => setOpen(true)}><MapPin size={16} /></ActionIcon></Tooltip></Group>
      {weather ? <div className="weather-current"><strong>{Math.round(weather.current.temperature_2m)}°C</strong><span>{weatherLabel(weather.current.weather_code, lang)}</span><small>{location?.name === t('Nearby location', 'Lokasi sekitar') ? t('Nearby', 'Sekitar sini') : displayLocation}{Date.now() - weather.at > 30 * 60 * 1000 ? ` · ${t('last updated', 'data terakhir')}` : ''}</small></div> : <Text size="sm" c="dimmed">{location ? t('Forecast will appear here.', 'Prakiraan akan muncul di sini.') : t('Choose a city or use your location when you are ready.', 'Pilih kota atau gunakan lokasi setelah kamu siap.')}</Text>}
      {error && <Alert color="yellow" role="status">{error}</Alert>}{loading && <Text size="xs" c="dimmed" role="status">{message || t('Updating forecast…', 'Memperbarui prakiraan…')}</Text>}
      <Group justify="space-between"><Button variant="default" size="compact-sm" onClick={() => setOpen(true)}>{location ? t('Change location', 'Ganti lokasi') : t('Choose a city', 'Pilih kota')}</Button>{location && <Tooltip label={t('Refresh forecast', 'Perbarui prakiraan')} withArrow><ActionIcon variant="subtle" aria-label={t('Refresh forecast', 'Perbarui prakiraan')} loading={loading} onClick={() => setRefreshKey(value => value + 1)}><RefreshCw size={15} /></ActionIcon></Tooltip>}</Group>
    </Card>}
    <Modal opened={open} onClose={() => setOpen(false)} title={settingsOnly ? t('Choose a city', 'Pilih kota') : t('Weather location', 'Lokasi cuaca')} centered radius="lg" withinPortal portalProps={{ target: '.sela-app' }}>
      <Stack><Text size="sm" c="dimmed">{settingsOnly ? t('Choose a city for prayer-time estimates. The city stays on this device and is used only when you request a schedule.', 'Pilih kota untuk perkiraan jadwal salat. Kota tersimpan di perangkat ini dan hanya digunakan saat kamu meminta jadwal.') : t('Your chosen coordinates are sent to Open-Meteo for forecasts and remain saved on this device.', 'Koordinat pilihan dikirim ke Open-Meteo untuk prakiraan dan tetap tersimpan di perangkat ini.')}</Text><form onSubmit={searchCity} className="weather-city-form"><TextInput label={t('Find a city', 'Cari kota')} value={cityQuery} onChange={event => setCityQuery(event.currentTarget.value)} maxLength={100} placeholder={t('City name', 'Nama kota')} /><Button type="submit" loading={loading} disabled={!cityQuery.trim()}>{t('Search', 'Cari')}</Button></form>{message && <Text size="sm" role="status">{message}</Text>}{cities.map(city => <Button key={`${city.latitude}:${city.longitude}`} variant="default" justify="space-between" onClick={() => chooseLocation(city)}>{city.name}</Button>)}{error && <Alert color="red" role="alert">{error}</Alert>}<Text size="xs" c="dimmed">{t('Your browser will ask before sharing location. Nearby coordinates are sent to Open-Meteo for the forecast and saved only on this device.', 'Browser akan meminta izin sebelum memakai lokasi. Koordinat lokasi sekitar dikirim ke Open-Meteo untuk prakiraan dan hanya disimpan di perangkat ini.')}</Text><Group justify="space-between"><Button variant="subtle" onClick={useNearby} loading={loading}>{t('Use my location', 'Gunakan lokasiku')}</Button>{location && <Button variant="subtle" color="gray" onClick={turnOff}>{t('Remove saved location', 'Hapus lokasi tersimpan')}</Button>}</Group></Stack>
    </Modal>
  </>;
}
