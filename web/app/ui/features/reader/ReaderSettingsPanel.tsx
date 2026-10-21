import { useEffect, useState } from 'react';
import { Alert, Button, Group, Select, Slider, Stack, Switch, Text } from '@mantine/core';
import { ArrowDownToLine, BookOpen, Maximize, RotateCw, Search, Volume2 } from 'lucide-react';
import { isReflowableBookFormat } from '../../../../../app/library/reader-modes.ts';

const filters = [
  ['none', 'Original', 'Asli'], ['grayscale', 'Black & white', 'Hitam putih'], ['sepia', 'Sepia', 'Sepia'], ['invert', 'Inverted', 'Terbalik'],
  ['contrast', 'High contrast', 'Kontras tinggi'], ['warm', 'Warm', 'Hangat'], ['cool', 'Cool', 'Sejuk'], ['night', 'Night', 'Malam'],
  ['paper', 'Paper', 'Kertas'], ['soft', 'Soft', 'Lembut'], ['saturated', 'Vivid', 'Pekat'], ['lowblue', 'Amber', 'Amber'],
 ] as const;
const surfaces = [['smooth', 'Smooth paper', 'Kertas halus'], ['rough', 'Deckled paper', 'Kertas bertekstur'], ['vellum', 'Soft vellum', 'Kertas buram'], ['lined', 'Ruled paper', 'Kertas bergaris'], ['laid', 'Laid paper', 'Kertas serat silang'], ['woven', 'Woven paper', 'Kertas tenun']] as const;
const textModes = [['single', 'One chapter', 'Satu bab'], ['scroll', 'Continuous scroll', 'Gulir berkelanjutan']] as const;
const pageModes = [['single', 'Single page', 'Satu halaman'], ['book', 'Two-page spread', 'Dua halaman'], ['scroll', 'Vertical scroll', 'Gulir vertikal'], ['webtoon', 'Webtoon', 'Webtoon'], ['manga', 'Manga · right to left', 'Manga · kanan ke kiri']] as const;
const fits = [['page', 'Fit screen', 'Pas layar'], ['width', 'Fit width', 'Pas lebar'], ['original', 'Original size', 'Ukuran asli']] as const;
const fonts = [['serif', 'Serif', 'Serif'], ['sans', 'Sans serif', 'Sans serif'], ['mono', 'Monospace', 'Monospace'], ['opendyslexic', 'OpenDyslexic', 'OpenDyslexic']] as const;

type Choice = readonly [string, string, string];
const localize = (value: string, lang: 'en' | 'id') => { const item = [...filters, ...surfaces, ...textModes, ...pageModes, ...fits, ...fonts].find(row => row[0] === value); return item ? item[lang === 'id' ? 2 : 1] : value; };

export function ReaderSettingsPanel({ reader, format, lang, onReaderPanel, onShowPreviews }: { reader: any; format: string; lang: 'en' | 'id'; onReaderPanel: (tab: string) => void; onShowPreviews: () => void }) {
  const [, setRevision] = useState(0);
  const [status, setStatus] = useState('');
  const [keepAwake, setKeepAwake] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [followAppTheme, setFollowAppTheme] = useState(() => { try { return localStorage.getItem('sela-library:reader-follow-appearance') !== 'false'; } catch { return true; } });
  const t = (en: string, id: string) => lang === 'id' ? id : en;
  const options = reader?.options || {};
  const textBook = isReflowableBookFormat(format);
  const choices = (rows: readonly Choice[]) => rows.map(([value, en, id]) => ({ value, label: t(en, id) }));
  const update = (action: () => unknown) => {
    try { action(); setRevision(value => value + 1); setStatus(''); }
    catch (reason) { setStatus(reason instanceof Error ? reason.message : t('This setting is unavailable.', 'Pengaturan ini belum tersedia.')); }
  };

  useEffect(() => {
    if (!followAppTheme) return;
    const app = document.querySelector<HTMLElement>('.sela-app');
    if (!app) return;
    const apply = () => update(() => reader.setTheme(app.dataset.appearance === 'light' ? 'light' : 'dark'));
    const observer = new MutationObserver(apply);
    observer.observe(app, { attributes: true, attributeFilter: ['data-appearance'] });
    apply();
    return () => observer.disconnect();
  }, [followAppTheme, reader]);

  useEffect(() => {
    if (!keepAwake || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | undefined;
    let stopped = false;
    const acquire = async () => {
      if (document.visibilityState !== 'visible' || stopped) return;
      try { lock = await navigator.wakeLock.request('screen'); if (stopped) await lock.release(); }
      catch { if (!stopped) { setKeepAwake(false); setStatus(t('Screen wake lock is unavailable.', 'Layar tidak bisa dikunci tetap menyala.')); } }
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') void acquire(); else { void lock?.release(); lock = undefined; } };
    void acquire(); document.addEventListener('visibilitychange', onVisibility);
    return () => { stopped = true; document.removeEventListener('visibilitychange', onVisibility); void lock?.release(); };
  }, [keepAwake]);

  const toggleOrientation = async () => {
    try {
      if (rotated) { await screen.orientation?.unlock?.(); setRotated(false); }
      else if (document.fullscreenElement && screen.orientation?.lock) { await screen.orientation.lock('landscape'); setRotated(true); }
      else { reader.toggleFullscreen(); setStatus(t('Enter fullscreen first to lock the screen orientation.', 'Aktifkan layar penuh dulu untuk mengunci orientasi layar.')); }
    } catch { setStatus(t('Orientation lock is not available on this device.', 'Kunci orientasi tidak tersedia di perangkat ini.')); }
  };

  return <Stack className="reader-tool-section" gap="md">
    <div><Text fw={650}>{t('Reading layout', 'Tata letak bacaan')}</Text><Text size="xs" c="dimmed">{t('Changes are saved with this book on this device.', 'Perubahan tersimpan bersama buku ini di perangkat ini.')}</Text></div>
    <div className="reader-settings-grid">
      <Select label={t('Reading mode', 'Mode baca')} value={options.mode || (textBook ? 'scroll' : 'book')} data={choices(textBook ? textModes : pageModes)} allowDeselect={false} onChange={value => value && update(() => reader.setMode(value))} />
      {!textBook && <Select label={t('Page fit', 'Ukuran halaman')} value={options.fit || 'page'} data={choices(fits)} allowDeselect={false} onChange={value => value && update(() => reader.setFit(value))} />}
      <Select label={t('Page filter', 'Filter halaman')} value={options.filter || 'none'} data={choices(filters)} allowDeselect={false} onChange={value => value && update(() => reader.setFilter(value))} />
      <Select label={t('Page material', 'Material halaman')} value={options.pageSurface || (options.paperTexture ? 'vellum' : 'smooth')} data={choices(surfaces)} allowDeselect={false} onChange={value => value && update(() => reader.setTypography({ pageSurface: value }))} />
      {textBook && <Select label={t('Text typeface', 'Jenis huruf')} value={options.fontFamily || 'serif'} data={choices(fonts)} allowDeselect={false} onChange={value => value && update(() => reader.setTypography({ fontFamily: value }))} />}
    </div>
    {textBook && <div className="reader-slider-grid"><label><Text size="xs" fw={600}>{t('Font size', 'Ukuran teks')} · {options.fontSize || 19}px</Text><Slider min={12} max={36} step={1} value={options.fontSize || 19} onChange={value => update(() => reader.setTypography({ fontSize: value }))} thumbLabel={t('Font size', 'Ukuran teks')} /></label><label><Text size="xs" fw={600}>{t('Line spacing', 'Jarak baris')} · {(options.lineHeight || 1.8).toFixed(1)}</Text><Slider min={1.2} max={2.4} step={0.1} value={options.lineHeight || 1.8} onChange={value => update(() => reader.setTypography({ lineHeight: value }))} thumbLabel={t('Line spacing', 'Jarak baris')} /></label></div>}
    <label className="reader-slider-field"><Text size="xs" fw={600}>{t('Page brightness', 'Kecerahan halaman')} · {Math.round((options.brightness ?? 1) * 100)}%</Text><Slider min={0.35} max={1.25} step={0.05} value={options.brightness ?? 1} onChange={value => update(() => reader.setBrightness(value))} thumbLabel={t('Page brightness', 'Kecerahan halaman')} /></label>
    <div className="reader-settings-grid"><Select label={t('Reader appearance', 'Tampilan reader')} value={options.theme || 'light'} data={[{ value: 'auto', label: t('System', 'Sistem') }, { value: 'light', label: t('Light', 'Terang') }, { value: 'dark', label: t('Dark', 'Gelap') }]} allowDeselect={false} disabled={followAppTheme} onChange={value => value && update(() => reader.setTheme(value))} /></div>
    <div className="reader-settings-switches"><Switch label={t('Follow app theme', 'Ikuti tema aplikasi')} checked={followAppTheme} onChange={event => { const checked = event.currentTarget.checked; setFollowAppTheme(checked); try { localStorage.setItem('sela-library:reader-follow-appearance', String(checked)); } catch { /* This preference is optional. */ } }} /><Switch label={t('Dim reader controls', 'Redupkan kontrol reader')} checked={!!options.dim} onChange={event => update(() => reader.setDim(event.currentTarget.checked))} /><Switch label={t('Page turn sound', 'Suara membalik halaman')} checked={reader.soundEnabled !== false} onChange={event => update(() => reader.setSoundEnabled(event.currentTarget.checked))} /><Switch label={t('Keep screen awake', 'Jaga layar tetap menyala')} disabled={!('wakeLock' in navigator)} checked={keepAwake} onChange={event => setKeepAwake(event.currentTarget.checked)} /></div>
    <Group gap="xs" className="reader-tool-actions"><Button variant="default" leftSection={<BookOpen size={15} />} onClick={() => onReaderPanel('contents')}>{t('Contents & bookmarks', 'Daftar isi & penanda')}</Button><Button variant="default" leftSection={<Search size={15} />} onClick={() => onReaderPanel('search')}>{t('Search this book', 'Cari di buku')}</Button><Button variant="default" leftSection={<Volume2 size={15} />} onClick={() => onReaderPanel('audio')}>{t('Read aloud', 'Baca bersuara')}</Button><Button variant="default" leftSection={<BookOpen size={15} />} onClick={onShowPreviews}>{t('Page previews', 'Pratinjau halaman')}</Button><Button variant="default" leftSection={<ArrowDownToLine size={15} />} onClick={() => reader.downloadOriginal()}>{t('Download original', 'Unduh berkas asli')}</Button><Button variant="default" leftSection={<Maximize size={15} />} onClick={() => reader.toggleFullscreen()}>{t('Fullscreen', 'Layar penuh')}</Button><Button variant="default" leftSection={<RotateCw size={15} />} onClick={() => void toggleOrientation()}>{t('Rotate screen', 'Putar layar')}</Button><Button variant="default" onClick={() => reader.back()}>{t('Previous position', 'Posisi sebelumnya')}</Button></Group>
    {status && <Alert color="yellow" variant="light" role="status">{status}</Alert>}
  </Stack>;
}
