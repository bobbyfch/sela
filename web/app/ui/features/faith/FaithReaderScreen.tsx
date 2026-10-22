import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Alert, Anchor, Button, Group, NumberInput, Select, Skeleton, Stack, Text, Title } from '@mantine/core';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpenText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { editPersonal, readPersonal } from '../../../../../app/library/personal-store.ts';
import { localFaithReading } from '../../../../../app/library/local-faith-readings.ts';
import {
  listQuranTranslations, loadFaithReading, loadIslamicReadingCollection, loadQuranSurah,
  quranKemenagSurahUrl, quranSurahCatalog,
  type FaithId, type FaithReading, type IslamicReadingCollection, type QuranSurah,
  type QuranTranslationEdition,
} from '../../../../../app/library/scripture-sources.ts';
import { PROPHET_PASSAGES } from '../../../../../app/library/prophet-passages.ts';
import { installedQuranEditions, installedQuranSurah } from '../../../../../app/library/source-packs.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { ISLAMIC_READING_OPTIONS } from './readings.ts';

function saveQuranPreferences(patch: { quranSurah?: number; quranLanguage?: 'id' | 'en' | 'ja'; quranTranslationKey?: string; quranArabicSize?: number; quranTranslationSize?: number }) {
  try { editPersonal(data => { Object.assign(data, patch); }); } catch { /* Keep the reader usable when local storage is unavailable. */ }
}

export default function FaithReaderScreen() {
  const { lang } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const parts = location.pathname.split('/').filter(Boolean).slice(1);
  const mode = parts[0] || 'home';
  const title = mode === 'quran' ? copy(lang, 'The Quran', 'Al-Qur’an')
    : mode === 'collection' ? copy(lang, 'Daily remembrance', 'Zikir harian')
      : mode === 'stories' ? copy(lang, 'Stories and passages', 'Kisah dan ayat')
        : mode === 'daily' ? copy(lang, 'A reading with a source', 'Bacaan bersumber')
          : copy(lang, 'Faith reading', 'Bacaan Islami');
  const goBack = () => {
    const state = window.history.state as { idx?: number } | null;
    if (Number.isInteger(state?.idx) && Number(state?.idx) > 0) navigate(-1);
    else navigate('/');
  };

  return <div className="faith-reader-screen" aria-label={title}>
    <header className="faith-reader-header" role="banner">
      <ActionIcon className="faith-reader-back" variant="default" aria-label={copy(lang, 'Back to Sela', 'Kembali ke Sela')} onClick={goBack}><ArrowLeft size={18} /></ActionIcon>
      <div className="faith-reader-brand"><Text className="page-eyebrow">SELA · {copy(lang, 'READING ROOM', 'RUANG BACA')}</Text><Title order={1}>{title}</Title></div>
      <BookOpenText className="faith-reader-mark" size={21} aria-hidden="true" />
    </header>
    <nav className="faith-reader-nav" aria-label={copy(lang, 'Reading sections', 'Bagian bacaan')}>
      <button type="button" aria-current={mode === 'quran' ? 'page' : undefined} onClick={() => navigate(`/faith/quran/${readPersonal().quranSurah || 1}`)}>{copy(lang, 'Quran', 'Al-Qur’an')}</button>
      <button type="button" aria-current={mode === 'daily' ? 'page' : undefined} onClick={() => navigate('/faith/daily')}>{copy(lang, 'Daily reading', 'Bacaan harian')}</button>
      <button type="button" aria-current={mode === 'stories' ? 'page' : undefined} onClick={() => navigate('/faith/stories/0')}>{copy(lang, 'Stories', 'Kisah')}</button>
      <button type="button" aria-current={mode === 'collection' ? 'page' : undefined} onClick={() => navigate('/faith/collection/morning-adhkar')}>{copy(lang, 'Remembrance', 'Zikir')}</button>
    </nav>
    {mode === 'quran' && <QuranReader locationSearch={location.search} routeSurah={parts[1]} navigate={navigate} />}
    {mode === 'collection' && <CollectionReader slug={parts[1] || 'morning-adhkar'} navigate={navigate} />}
    {mode === 'stories' && <StoryReader index={Number(parts[1]) || 0} navigate={navigate} />}
    {mode === 'daily' && <DailyReadingReader navigate={navigate} />}
    {mode === 'home' && <FaithReadingHome navigate={navigate} />}
  </div>;
}

function QuranReader({ locationSearch, routeSurah, navigate }: { locationSearch: string; routeSurah?: string; navigate: ReturnType<typeof useNavigate> }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const stored = readPersonal();
  const routeNumber = Number(routeSurah);
  const surahNo = Number.isInteger(routeNumber) && routeNumber >= 1 && routeNumber <= 114 ? routeNumber : stored.quranSurah || 1;
  const [language, setLanguage] = useState<'id' | 'en' | 'ja'>(stored.quranLanguage || (lang === 'id' ? 'id' : 'en'));
  const [translationKey, setTranslationKey] = useState(stored.quranTranslationKey || '');
  const [arabicSize, setArabicSize] = useState(stored.quranArabicSize || 32);
  const [translationSize, setTranslationSize] = useState(stored.quranTranslationSize || 18);
  const [translations, setTranslations] = useState<QuranTranslationEdition[]>([]);
  const [translationsReady, setTranslationsReady] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [surah, setSurah] = useState<QuranSurah | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const verseQuery = new URLSearchParams(locationSearch).get('verse');
  const requestedVerse = Number(verseQuery) || 1;
  const [activeVerse, setActiveVerse] = useState(requestedVerse);
  const [jumpVerse, setJumpVerse] = useState<number | string>(requestedVerse);

  const loadOnlineEditions = (signal: AbortSignal) => listQuranTranslations(language, signal).then(rows => {
    if (signal.aborted) return;
    setTranslations(current => [...rows, ...current.filter(saved => !rows.some(row => row.key === saved.key))]);
    setTranslationKey(current => rows.some(row => row.key === current) || current ? current : rows[0]?.key || '');
  });

  useEffect(() => {
    const controller = new AbortController();
    setTranslationsReady(false);
    setSavedOnly(false);
    void installedQuranEditions(language).catch(() => []).then(saved => {
      if (controller.signal.aborted) return;
      if (translationKey && saved.some(row => row.key === translationKey)) { setTranslations(saved); setSavedOnly(true); setTranslationsReady(true); return; }
      return loadOnlineEditions(controller.signal).then(() => { if (!controller.signal.aborted) setTranslationsReady(true); }).catch(reason => {
        if (controller.signal.aborted) return;
        if (saved.length) { setTranslations(saved); setTranslationKey(current => saved.some(row => row.key === current) ? current : saved[0].key); } else setError(reason instanceof Error ? reason.message : t('Translation editions are unavailable.', 'Daftar terjemahan belum tersedia.'));
        setTranslationsReady(true);
      });
    });
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    if (!translationsReady) return;
    const controller = new AbortController();
    setLoading(true); setError(''); setSurah(null);
    void installedQuranSurah(surahNo, translationKey).catch(() => null).then(saved => saved ?? loadQuranSurah(surahNo, language, controller.signal, translationKey || undefined)).then(next => {
      if (controller.signal.aborted) return;
      setSurah(next);
      setTranslationKey(next.translationKey);
      saveQuranPreferences({ quranSurah: next.number, quranLanguage: language, quranTranslationKey: next.translationKey, quranArabicSize: arabicSize, quranTranslationSize: translationSize });
    }).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : t('This surah could not be loaded.', 'Surah ini belum dapat dimuat.'));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [surahNo, language, translationKey, translationsReady]);

  useEffect(() => {
    setJumpVerse(requestedVerse);
    if (!surah) return;
    const targetVerse = Math.max(1, Math.min(surah.verses.length, requestedVerse));
    setActiveVerse(targetVerse);
    if (targetVerse !== requestedVerse) {
      navigate(`/faith/quran/${surah.number}?verse=${targetVerse}`, { replace: true });
      return;
    }
    const readerBody = document.querySelector('.faith-reader-body');
    if (!verseQuery) {
      readerBody?.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    const frame = window.requestAnimationFrame(() => document.getElementById(`faith-verse-${surah.number}-${targetVerse}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    return () => window.cancelAnimationFrame(frame);
  }, [surah, requestedVerse, verseQuery, navigate]);
  useEffect(() => { setJumpVerse(activeVerse); }, [activeVerse]);

  useEffect(() => {
    if (!surah) return;
    const root = document.querySelector('.faith-reader-body');
    if (!root || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const current = visible[0]?.target as HTMLElement | undefined;
      if (current?.dataset.verse) setActiveVerse(Number(current.dataset.verse));
    }, { root, rootMargin: '-12% 0px -68% 0px', threshold: 0 });
    root.querySelectorAll<HTMLElement>('.faith-quran-verse').forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [surah]);

  const goToVerse = (value: number) => {
    if (!surah || !Number.isFinite(value)) return;
    const verse = Math.max(1, Math.min(surah.verses.length, Math.round(value)));
    setActiveVerse(verse);
    setJumpVerse(verse);
    navigate(`/faith/quran/${surah.number}?verse=${verse}`, { replace: true });
  };
  const surahData = useMemo(() => quranSurahCatalog().map(item => ({ value: String(item.number), label: `${String(item.number).padStart(3, '0')} · ${item.name}` })), []);

  return <main className="faith-reader-body quran-reader-page">
    <div className="faith-reader-content">
      <section className="faith-quran-toolbar" aria-label={t('Quran navigation and reading settings', 'Navigasi dan pengaturan bacaan Al-Qur’an')}>
        <Select label={t('Surah', 'Surah')} searchable value={String(surahNo)} onChange={value => value && navigate(`/faith/quran/${value}`)} data={surahData} allowDeselect={false} />
        <Select label={t('Translation', 'Terjemahan')} value={language} onChange={value => { if (value === 'id' || value === 'en' || value === 'ja') { setLanguage(value); setTranslationKey(''); saveQuranPreferences({ quranLanguage: value, quranTranslationKey: '' }); } }} data={[{ value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }, { value: 'ja', label: '日本語' }]} allowDeselect={false} />
        <Select label={t('Edition', 'Edisi')} onDropdownOpen={() => { if (savedOnly) { setSavedOnly(false); void loadOnlineEditions(new AbortController().signal).catch(() => undefined); } }} value={translations.some(row => row.key === translationKey) ? translationKey : translations[0]?.key || null} onChange={value => setTranslationKey(value || '')} data={translations.map(item => ({ value: item.key, label: `${item.title} · ${item.version}` }))} searchable allowDeselect={false} disabled={!translations.length} />
        <div className="faith-type-controls">
          <NumberInput label={t('Arabic size', 'Ukuran Arab')} value={arabicSize} onChange={value => { const next = Math.max(20, Math.min(48, Number(value) || 32)); setArabicSize(next); saveQuranPreferences({ quranArabicSize: next }); }} min={20} max={48} step={2} />
          <NumberInput label={t('Translation size', 'Ukuran terjemahan')} value={translationSize} onChange={value => { const next = Math.max(14, Math.min(28, Number(value) || 18)); setTranslationSize(next); saveQuranPreferences({ quranTranslationSize: next }); }} min={14} max={28} step={1} />
        </div>
      </section>
      {error && <Alert color="red" role="alert" title={t('The reading could not be loaded', 'Bacaan belum dapat dimuat')}>{error}</Alert>}
      {loading && <Stack className="faith-quran-loading"><Skeleton height={32} /><Skeleton height={132} /><Skeleton height={112} /></Stack>}
      {surah && <>
        <header className="faith-quran-heading"><div><Text className="page-eyebrow">{surah.translationTitle} · {surah.version}</Text><Title order={2}>{surah.name}</Title><Text size="sm" c="dimmed">{surah.verses.length} {t('verses', 'ayat')}</Text></div><Anchor href={surah.sourceUrl || quranKemenagSurahUrl(surah.number)} target="_blank" rel="noopener noreferrer">{t('Source and edition', 'Sumber dan edisi')}</Anchor></header>
        <div className="faith-quran-source-note">{t('Translation by', 'Terjemahan oleh')} {surah.translationTitle} · {t('edition', 'edisi')} {surah.version} · {t('Arabic text and translation are shown together.', 'Teks Arab dan terjemahan ditampilkan bersama.')}</div>
        <div className="faith-quran-verses">{surah.verses.map(verse => <article className="faith-quran-verse" id={`faith-verse-${verse.sura}-${verse.aya}`} data-verse={verse.aya} key={`${verse.sura}:${verse.aya}`}>
          <div className="faith-verse-meta"><button type="button" onClick={() => goToVerse(verse.aya)} aria-label={t(`Go to verse ${verse.aya}`, `Buka ayat ${verse.aya}`)}>{surah.number}:{verse.aya}</button><span>{t('VERSE', 'AYAT')}</span></div>
          <p className="faith-reader-arabic" lang="ar" dir="rtl" style={{ fontSize: `${arabicSize}px` }}>{verse.arabic}</p>
          <Text className="faith-reader-translation" style={{ fontSize: `${translationSize}px` }}>{verse.translation}</Text>
          {verse.footnotes && <Text className="faith-reader-footnote" size="xs">{verse.footnotes}</Text>}
        </article>)}</div>
        <footer className="faith-reader-controls faith-quran-controls"><Button className="faith-quran-previous" aria-label={t('Previous verse', 'Ayat sebelumnya')} variant="default" leftSection={<ChevronLeft size={16} />} disabled={activeVerse <= 1} onClick={() => goToVerse(activeVerse - 1)}>{t('Previous verse', 'Ayat sebelumnya')}</Button><div className="faith-jump-control"><NumberInput aria-label={t('Go to verse', 'Lompat ke ayat')} min={1} max={surah.verses.length} value={jumpVerse} onChange={setJumpVerse} hideControls={false} /><Button onClick={() => goToVerse(Number(jumpVerse))}>{t('Go', 'Buka')}</Button><span>{t('of', 'dari')} {surah.verses.length}</span></div><Button className="faith-quran-next" aria-label={t('Next verse', 'Ayat berikutnya')} variant="default" rightSection={<ChevronRight size={16} />} disabled={activeVerse >= surah.verses.length} onClick={() => goToVerse(activeVerse + 1)}>{t('Next verse', 'Ayat berikutnya')}</Button></footer>
      </>}
      {!surah && !loading && !error && <Text c="dimmed">{t('Choose a surah to begin.', 'Pilih surah untuk mulai membaca.')}</Text>}
    </div>
  </main>;
}

function CollectionReader({ slug, navigate }: { slug: string; navigate: ReturnType<typeof useNavigate> }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [collection, setCollection] = useState<IslamicReadingCollection | null>(null);
  const [itemIndex, setItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setCollection(null); setItemIndex(0);
    void loadIslamicReadingCollection(slug, controller.signal).then(next => { if (!controller.signal.aborted) setCollection(next); }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : t('This collection is unavailable.', 'Koleksi ini belum tersedia.')); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [slug]);
  const item = collection?.items[itemIndex];
  const options = ISLAMIC_READING_OPTIONS.map(option => ({ value: option.slug, label: t(option.en, option.id) }));
  return <main className="faith-reader-body"><div className="faith-reader-content faith-collection-content">
    <div className="faith-collection-toolbar"><Select label={t('Collection', 'Koleksi')} value={slug} onChange={value => value && navigate(`/faith/collection/${value}`)} data={options} allowDeselect={false} /><Text className="faith-collection-source">{collection?.sourceNote || t('Arabic, transliteration, meaning and references stay together.', 'Teks Arab, transliterasi, arti dan rujukan ditampilkan bersama.')}</Text></div>
    {error && <Alert color="red" role="alert">{error}</Alert>}
    {loading && <Stack><Skeleton height={40} /><Skeleton height={180} /><Skeleton height={110} /></Stack>}
    {collection && item && <>
      <header className="faith-passage-heading"><div><Text className="page-eyebrow">{t('SOURCE-IDENTIFIED READING', 'BACAAN DENGAN SUMBER')}</Text><Title order={2}>{lang === 'id' ? collection.arabicName || collection.name : collection.name}</Title></div><Text>{itemIndex + 1} / {collection.items.length}</Text></header>
      <article className="faith-passage">
        <Text className="page-eyebrow">{item.title || item.reference}</Text>
        <p className="faith-reader-arabic" lang="ar" dir="rtl">{item.arabic}</p>
        {item.transliteration && <p className="faith-transliteration">{item.transliteration}</p>}
        <Text className="faith-reader-translation">{item.meaning}</Text>
        <div className="faith-passage-citation"><strong>{item.reference}</strong>{item.repeat && <span>{item.repeat}</span>}{item.grade && <span>{item.grade}</span>}{item.note && <p>{item.note}</p>}</div>
      </article>
      <footer className="faith-reader-controls"><Button variant="default" leftSection={<ChevronLeft size={16} />} disabled={itemIndex <= 0} onClick={() => setItemIndex(index => Math.max(0, index - 1))}>{t('Previous', 'Sebelumnya')}</Button><Anchor href={collection.sourceUrl} target="_blank" rel="noopener noreferrer">{t('Read source notes', 'Lihat sumber')}</Anchor><Button variant="default" rightSection={<ChevronRight size={16} />} disabled={itemIndex >= collection.items.length - 1} onClick={() => setItemIndex(index => Math.min(collection.items.length - 1, index + 1))}>{t('Next', 'Berikutnya')}</Button></footer>
    </>}
  </div></main>;
}

function StoryReader({ index, navigate }: { index: number; navigate: ReturnType<typeof useNavigate> }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const safeIndex = Math.max(0, Math.min(PROPHET_PASSAGES.length - 1, index));
  const story = PROPHET_PASSAGES[safeIndex];
  if (!story) return null;
  return <main className="faith-reader-body"><article className="faith-reader-content faith-story-content">
    <Text className="page-eyebrow">{t('QURAN-BASED STORY NOTE', 'CATATAN KISAH BERDASARKAN AL-QUR’AN')}</Text>
    <Title order={2}>{lang === 'id' ? story.indonesian : story.english}</Title>
    <Text className="faith-story-reference">{story.reference}</Text>
    <p className="faith-story-copy">{lang === 'id' ? story.storyId : story.storyEn}</p>
    <div className="faith-story-actions"><Button leftSection={<BookOpenText size={16} />} onClick={() => navigate(`/faith/quran/${story.surah}?verse=${story.verse}`)}>{t('Open cited verses', 'Buka ayat rujukan')}</Button><Button variant="default" onClick={() => navigate('/shelf?tab=faith')}>{t('Full stories of the 25 prophets', 'Kisah lengkap 25 nabi')}</Button><span>{safeIndex + 1} / {PROPHET_PASSAGES.length}</span></div>
    <footer className="faith-reader-controls"><Button variant="default" leftSection={<ChevronLeft size={16} />} disabled={safeIndex <= 0} onClick={() => navigate(`/faith/stories/${safeIndex - 1}`)}>{t('Previous story', 'Kisah sebelumnya')}</Button><Button variant="default" rightSection={<ChevronRight size={16} />} disabled={safeIndex >= PROPHET_PASSAGES.length - 1} onClick={() => navigate(`/faith/stories/${safeIndex + 1}`)}>{t('Next story', 'Kisah berikutnya')}</Button></footer>
  </article></main>;
}

function DailyReadingReader({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [reading, setReading] = useState<FaithReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const faith = readPersonal().faith;
  useEffect(() => {
    if (faith !== 'none') setReading(localFaithReading(faith as FaithId, new Date()));
    else setReading(null);
  }, [faith]);
  const refresh = async () => {
    if (faith === 'none') return;
    const controller = new AbortController();
    setLoading(true); setError('');
    try { const next = await loadFaithReading(faith as FaithId, lang, new Date(), controller.signal); if (next) setReading(next); else setError(t('A sourced reading is not available right now.', 'Bacaan bersumber belum tersedia.')); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t('The reading source is unavailable.', 'Sumber bacaan belum tersedia.')); }
    finally { setLoading(false); }
  };
  return <main className="faith-reader-body"><article className="faith-reader-content faith-daily-content">
    <Text className="page-eyebrow">{t('A READING WITH A SOURCE', 'BACAAN DENGAN SUMBER')}</Text>
    <Title order={2}>{reading?.reference || t('A moment to read', 'Waktu untuk membaca')}</Title>
    {reading ? <><blockquote lang={reading.language} dir={reading.direction || 'auto'}>{reading.text}</blockquote><div className="faith-passage-citation"><strong>{reading.reference}</strong><span>{reading.attribution}{reading.license ? ` · ${reading.license}` : ''}</span>{reading.note && <p>{reading.note}</p>}<Anchor href={reading.sourceUrl} target="_blank" rel="noopener noreferrer">{t('Open source', 'Buka sumber')}</Anchor></div></> : <Text c="dimmed">{t('Choose a faith in Settings to see a reading from a named source.', 'Pilih keyakinan di Pengaturan untuk melihat bacaan dengan sumber yang jelas.')}</Text>}
    {error && <Alert color="yellow" role="status">{error}</Alert>}
    <Group className="faith-daily-actions"><Button loading={loading} onClick={() => void refresh()}>{t('Load a sourced reading', 'Muat bacaan bersumber')}</Button>{faith === 'islam' && <Button variant="default" onClick={() => navigate(`/faith/quran/${readPersonal().quranSurah || 1}`)}>{t('Open the Quran', 'Buka Al-Qur’an')}</Button>}</Group>
  </article></main>;
}

function FaithReadingHome({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  return <main className="faith-reader-body"><div className="faith-reader-content faith-reader-home">
    <Text className="page-eyebrow">{t('READ AT YOUR OWN PACE', 'BACA DENGAN RITMEMU')}</Text>
    <Title order={2}>{t('Choose a reading', 'Pilih bacaan')}</Title>
    <div className="faith-reader-choices">
      <button type="button" onClick={() => navigate(`/faith/quran/${readPersonal().quranSurah || 1}`)}><span>01</span><strong>{t('The Quran', 'Al-Qur’an')}</strong><small>{t('Choose a surah, translation and verse.', 'Pilih surah, terjemahan dan ayat.')}</small><ChevronRight size={18} /></button>
      <button type="button" onClick={() => navigate('/faith/daily')}><span>02</span><strong>{t('Daily reading', 'Bacaan harian')}</strong><small>{t('Read a passage with its source and edition.', 'Baca teks beserta sumber dan edisinya.')}</small><ChevronRight size={18} /></button>
      <button type="button" onClick={() => navigate('/faith/stories/0')}><span>03</span><strong>{t('Stories and verses', 'Kisah dan ayat')}</strong><small>{t('Read a short note, then open its cited verses.', 'Baca ringkasan, lalu buka ayat rujukannya.')}</small><ChevronRight size={18} /></button>
      <button type="button" onClick={() => navigate('/faith/collection/morning-adhkar')}><span>04</span><strong>{t('Daily remembrance', 'Zikir harian')}</strong><small>{t('Move through Arabic, transliteration and meaning.', 'Baca teks Arab, transliterasi dan artinya.')}</small><ChevronRight size={18} /></button>
    </div>
  </div></main>;
}
