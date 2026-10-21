import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Anchor, Blockquote, Button, Card, Group, Select, Stack, Text, Title } from '@mantine/core';
import { BookOpen, RefreshCw, Sparkles } from 'lucide-react';
import { editPersonal, readPersonal } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { dailyReadingNote, type ReflectionTopic } from '../../quotes.ts';
import { fetchAuthorPortrait, fetchSourcedQuotes, readQuoteCache, type SourcedQuote } from './sourced-quotes.ts';

const topics: { value: string; en: string; id: string }[] = [
  { value: 'reading', en: 'Reading', id: 'Membaca' }, { value: 'calm', en: 'Calm', id: 'Ketenangan' },
  { value: 'courage', en: 'Courage', id: 'Semangat' }, { value: 'life', en: 'Life', id: 'Kehidupan' },
  { value: 'friendship', en: 'Friendship', id: 'Persahabatan' }, { value: 'creativity', en: 'Creativity', id: 'Kreativitas' },
  { value: 'spiritual', en: 'Reflection', id: 'Renungan' }, { value: 'personal', en: 'My passages', id: 'Kutipanku' },
];
type PersonalQuote = { topic: string; content: string; author: string; sourceUrl?: string; portrait?: string };

export function SourcedReflectionWidget() {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [personal, setPersonal] = useState(() => readPersonal());
  const topic = topics.some(item => item.value === personal.quoteTopic) ? personal.quoteTopic : 'reading';
  const language = personal.quoteLanguage === 'auto' ? lang : personal.quoteLanguage;
  const [quotes, setQuotes] = useState<SourcedQuote[]>(() => readQuoteCache(topic, language));
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [portrait, setPortrait] = useState('');
  const localQuote = useMemo<PersonalQuote | null>(() => {
    if (topic !== 'personal') return null;
    const saved = Object.entries(personal.books).flatMap(([bookId, book]) => book.quote?.trim() ? [{ bookId, quote: book.quote.trim() }] : []);
    if (!saved.length) return null;
    const day = Math.floor(Date.now() / 86400000) % saved.length;
    const chosen = saved[day];
    return { topic: 'personal', content: chosen.quote, author: t('From your notebook', 'Dari notebook-mu') };
  }, [personal, topic, lang]);
  const fallback = dailyReadingNote(lang, new Date(), (topic === 'personal' ? 'reading' : topic) as ReflectionTopic);
  const quote = quotes.length ? quotes[index % quotes.length] : null;
  const content = localQuote?.content || quote?.content || fallback;
  const attribution = localQuote?.author || quote?.author || 'Sela · ' + t('a little reflection', 'renungan kecil');

  useEffect(() => {
    const sync = () => setPersonal(readPersonal());
    document.addEventListener('sela:personal', sync);
    return () => document.removeEventListener('sela:personal', sync);
  }, []);
  useEffect(() => {
    setQuotes(readQuoteCache(topic, language));
    setIndex(0); setStatus(''); setPortrait('');
  }, [topic, language]);
  useEffect(() => {
    if (!quote || quote.portrait) { setPortrait(quote?.portrait || ''); return; }
    const controller = new AbortController();
    void fetchAuthorPortrait(quote, controller.signal).then(value => { if (!controller.signal.aborted) setPortrait(value || ''); });
    return () => controller.abort();
  }, [quote]);

  const savePreference = (key: 'quoteTopic' | 'quoteLanguage', value: string) => {
    try { editPersonal(data => { data[key] = value; }); }
    catch { setStatus(t('This preference could not be saved on this device.', 'Preferensi ini belum dapat disimpan di perangkat ini.')); }
  };
  const findQuotes = async () => {
    if (topic === 'personal') return;
    setLoading(true); setStatus(t('Looking for sourced quotes…', 'Mencari kutipan bersumber…'));
    const controller = new AbortController();
    try {
      const rows = await fetchSourcedQuotes(topic as Exclude<ReflectionTopic, 'personal'>, language, controller.signal);
      const latest = readPersonal();
      if (latest.quoteTopic !== topic || (latest.quoteLanguage === 'auto' ? lang : latest.quoteLanguage) !== language) return;
      setQuotes(rows); setIndex(0); setPortrait(''); setStatus(t('Sourced quotes are ready.', 'Kutipan bersumber siap.'));
    } catch (error) { setStatus(error instanceof Error ? t('Wikiquote is unavailable. Your offline reflection is still here.', 'Wikiquote belum tersedia. Renungan offline tetap bisa dibaca.') : t('Wikiquote is unavailable.', 'Wikiquote belum tersedia.')); }
    finally { setLoading(false); }
  };

  return <Card className="reflection-widget" radius="xl" withBorder>
    <Group justify="space-between" align="flex-start"><div><Text className="page-eyebrow">{t('A SMALL REMINDER', 'PENGINGAT KECIL')}</Text><Title order={2}>{t('The reading note', 'Catatan hari ini')}</Title></div><Sparkles size={18} aria-hidden="true" /></Group>
    <Blockquote className="daily-quote" color="quill" icon={<BookOpen size={17} />} cite={attribution}>
      {portrait && <img className="reflection-portrait" src={portrait} alt={attribution} loading="lazy" referrerPolicy="no-referrer" />}
      {content}
      {quote?.sourceUrl && <Anchor className="reflection-source" href={quote.sourceUrl} target="_blank" rel="noopener noreferrer">{t('View quote source', 'Lihat sumber kutipan')}</Anchor>}
    </Blockquote>
    <div className="reflection-controls">
      <Select aria-label={t('Quote topic', 'Topik kutipan')} value={topic} onChange={value => value && savePreference('quoteTopic', value)} data={topics.map(item => ({ value: item.value, label: t(item.en, item.id) }))} allowDeselect={false} />
      <Select aria-label={t('Quote language', 'Bahasa kutipan')} value={personal.quoteLanguage} onChange={value => value && savePreference('quoteLanguage', value)} data={[{ value: 'auto', label: t('App language', 'Bahasa aplikasi') }, { value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }, { value: 'ja', label: '日本語' }]} allowDeselect={false} />
    </div>
    <Group className="reflection-actions" gap="xs">
      <Button variant="default" leftSection={<RefreshCw size={14} />} onClick={() => { if (quotes.length > 1) setIndex(value => (value + 1) % quotes.length); else setIndex(value => value + 1); }}>{t('Another note', 'Catatan lain')}</Button>
      {topic !== 'personal' && <Button variant="subtle" loading={loading} onClick={() => void findQuotes()}>{quotes.length ? t('Refresh sourced quotes', 'Cari kutipan bersumber') : t('Find sourced quotes', 'Cari kutipan bersumber')}</Button>}
      {status && <Text className="reflection-status" size="xs" role="status" aria-live="polite">{status}</Text>}
    </Group>
  </Card>;
}
