import { useEffect, useState } from 'react';
import { Alert, Button, Group, Modal, NumberInput, ScrollArea, Select, Skeleton, Stack, Text, Title } from '@mantine/core';
import { editPersonal, readPersonal } from '../../../../../app/library/personal-store.ts';
import { listQuranTranslations, loadQuranSurah, quranSurahCatalog, QURAN_STUDY_SOURCES, type QuranSurah, type QuranTranslationEdition } from '../../../../../app/library/scripture-sources.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

export function QuranReaderPanel() {
  const { lang } = useWorkspace();
  const [opened, setOpened] = useState(false);
  const [surahNo, setSurahNo] = useState(() => readPersonal().quranSurah || 1);
  const [language, setLanguage] = useState<'id' | 'en' | 'ja'>(() => readPersonal().quranLanguage || (lang === 'id' ? 'id' : 'en'));
  const [translationKey, setTranslationKey] = useState(() => readPersonal().quranTranslationKey || '');
  const [arabicSize, setArabicSize] = useState(() => readPersonal().quranArabicSize || 32);
  const [translationSize, setTranslationSize] = useState(() => readPersonal().quranTranslationSize || 18);
  const [translations, setTranslations] = useState<QuranTranslationEdition[]>([]);
  const [surah, setSurah] = useState<QuranSurah | null>(null);
  const [visible, setVisible] = useState(30);
  const [requestedVerse, setRequestedVerse] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = (en: string, id: string) => copy(lang, en, id);

  useEffect(() => {
    const open = () => { setRequestedVerse(null); setOpened(true); };
    const navigateTo = (event: Event) => {
      const detail = (event as CustomEvent<{ surah?: number; verse?: number }>).detail;
      if (!Number.isInteger(detail?.surah) || Number(detail?.surah) < 1 || Number(detail?.surah) > 114) return;
      const verse = Number.isInteger(detail.verse) && Number(detail.verse) > 0 ? Number(detail.verse) : null;
      setSurahNo(Number(detail.surah)); setRequestedVerse(verse); setSurah(null); setOpened(true);
    };
    document.addEventListener('sela:quran-open', open); document.addEventListener('sela:quran-navigate', navigateTo);
    return () => { document.removeEventListener('sela:quran-open', open); document.removeEventListener('sela:quran-navigate', navigateTo); };
  }, []);
  useEffect(() => {
    if (!opened) return;
    const controller = new AbortController(); setError('');
    void listQuranTranslations(language, controller.signal).then(rows => { setTranslations(rows); if (!translationKey && rows[0]) setTranslationKey(rows[0].key); }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : t('Translation list is unavailable.', 'Daftar terjemahan belum tersedia.')); });
    return () => controller.abort();
  }, [opened, language]);

  const savePrefs = (patch: { quranSurah?: number; quranLanguage?: 'id' | 'en' | 'ja'; quranTranslationKey?: string; quranArabicSize?: number; quranTranslationSize?: number }) => {
    try { editPersonal(data => { Object.assign(data, patch); }); } catch { /* The reader still works for this session. */ }
  };
  const load = async () => {
    setLoading(true); setError(''); setSurah(null); setVisible(30);
    const controller = new AbortController();
    try { const next = await loadQuranSurah(surahNo, language, controller.signal, translationKey || undefined); setSurah(next); setVisible(Math.min(next.verses.length, Math.max(30, (requestedVerse || 1) + 5))); savePrefs({ quranSurah: surahNo, quranLanguage: language, quranTranslationKey: next.translationKey, quranArabicSize: arabicSize, quranTranslationSize: translationSize }); setTranslationKey(next.translationKey); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t('This surah could not be loaded.', 'Surah ini belum dapat dimuat.')); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!surah || !requestedVerse) return;
    const frame = window.requestAnimationFrame(() => document.getElementById(`quran-verse-${surah.number}-${requestedVerse}`)?.scrollIntoView({ block: 'center' }));
    return () => window.cancelAnimationFrame(frame);
  }, [surah, requestedVerse]);

  return <Modal opened={opened} onClose={() => setOpened(false)} title={t('Quran reader', 'Pembaca Al-Qur’an')} centered radius="lg" size="xl">
    <Stack>
      <Text size="sm" c="dimmed">{t('Choose a surah and translation. The selected edition and source remain visible with the text.', 'Pilih surah dan terjemahan. Edisi dan sumber pilihan akan selalu ditampilkan bersama teks.')}</Text>
      <div className="quran-reader-controls"><Select label={t('Surah', 'Surah')} searchable value={String(surahNo)} onChange={value => { const next = Number(value) || 1; setSurahNo(next); setRequestedVerse(null); savePrefs({ quranSurah: next }); }} data={quranSurahCatalog().map(item => ({ value: String(item.number), label: `${String(item.number).padStart(3, '0')} · ${item.name}` }))} allowDeselect={false} /><Select label={t('Translation language', 'Bahasa terjemahan')} value={language} onChange={value => { if (value === 'id' || value === 'en' || value === 'ja') { setLanguage(value); setTranslationKey(''); savePrefs({ quranLanguage: value, quranTranslationKey: '' }); } }} data={[{ value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }, { value: 'ja', label: '日本語' }]} allowDeselect={false} /><Select label={t('Edition', 'Edisi')} value={translationKey} onChange={value => setTranslationKey(value || '')} data={translations.map(item => ({ value: item.key, label: `${item.title} · ${item.version}` }))} searchable allowDeselect={false} /></div>
      <div className="quran-reader-controls quran-reader-type"><NumberInput label={t('Arabic size', 'Ukuran Arab')} value={arabicSize} onChange={value => { const next = Math.max(20, Math.min(48, Number(value) || 32)); setArabicSize(next); savePrefs({ quranArabicSize: next }); }} min={20} max={48} step={2} /><NumberInput label={t('Translation size', 'Ukuran terjemahan')} value={translationSize} onChange={value => { const next = Math.max(14, Math.min(28, Number(value) || 18)); setTranslationSize(next); savePrefs({ quranTranslationSize: next }); }} min={14} max={28} step={1} /><Button onClick={() => void load()} loading={loading}>{t('Load surah', 'Muat surah')}</Button></div>
      {error && <Alert color="red" role="alert">{error}</Alert>}
      {loading && <Stack><Skeleton height={60} /><Skeleton height={60} /><Skeleton height={60} /></Stack>}
      {surah && <><Group justify="space-between" align="flex-start"><div><Text className="page-eyebrow">{surah.translationTitle} · {surah.version}</Text><Title order={3}>{surah.name}</Title><Text size="xs" c="dimmed">{surah.verses.length} {t('verses', 'ayat')}</Text></div><a href={surah.sourceUrl || QURAN_STUDY_SOURCES.kemenagSurah + surah.number} target="_blank" rel="noopener noreferrer">{t('Source and edition', 'Sumber dan edisi')}</a></Group><ScrollArea className="quran-verse-scroll" offsetScrollbars><Stack gap="sm">{surah.verses.slice(0, visible).map(verse => <article id={`quran-verse-${verse.sura}-${verse.aya}`} data-quran-verse={verse.aya} className="quran-verse" key={`${verse.sura}:${verse.aya}`}><span>{verse.aya}</span><p lang="ar" dir="rtl" style={{ fontSize: `${arabicSize}px` }}>{verse.arabic}</p><Text style={{ fontSize: translationSize }}>{verse.translation}</Text>{verse.footnotes && <Text size="xs" c="dimmed">{verse.footnotes}</Text>}</article>)}</Stack>{visible < surah.verses.length && <Button className="quran-more-verses" variant="default" onClick={() => setVisible(value => Math.min(surah!.verses.length, value + 30))}>{t('Show more verses', 'Tampilkan ayat lain')}</Button>}</ScrollArea></>}
    </Stack>
  </Modal>;
}
