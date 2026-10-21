import { useEffect, useState } from 'react';
import { Alert, Button, Card, Group, Select, Stack, Text, Title } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { loadIslamicReadingCollection, type IslamicReadingCollection } from '../../../../../app/library/scripture-sources.ts';
import { PROPHET_PASSAGES } from '../../../../../app/library/prophet-passages.ts';
import { readPersonal } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

const adhkar = [
  ['waking-up', 'Waking up', 'Saat bangun'], ['morning-adhkar', 'Morning remembrance', 'Zikir pagi'], ['after-salah', 'After prayer', 'Setelah salat'],
  ['evening-adhkar', 'Evening remembrance', 'Zikir petang'], ['before-sleep', 'Before sleep', 'Sebelum tidur'],
  ['quranic-duas', 'Quranic supplications', 'Doa dari Al-Qur’an'], ['travel', 'Travel', 'Perjalanan'],
] as const;

export function IslamicReadingShelf() {
  const { lang } = useWorkspace();
  const [slug, setSlug] = useState<string>('morning-adhkar');
  const [collection, setCollection] = useState<IslamicReadingCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [islamic, setIslamic] = useState(() => readPersonal().faith === 'islam');
  const t = (en: string, id: string) => copy(lang, en, id);
  useEffect(() => { const sync = () => setIslamic(readPersonal().faith === 'islam'); document.addEventListener('sela:personal', sync); return () => document.removeEventListener('sela:personal', sync); }, []);
  if (!islamic) return null;
  const load = async () => {
    setLoading(true); setError('');
    try { setCollection(await loadIslamicReadingCollection(slug)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t('This reading is unavailable.', 'Bacaan ini belum tersedia.')); }
    finally { setLoading(false); }
  };

  return <div className="islamic-reading-shelf">
    <Card className="home-widget-card" withBorder radius="xl" padding="lg">
      <div><Text className="page-eyebrow">{t('QURAN-BASED STORY NOTES', 'KISAH BERDASARKAN AL-QUR’AN')}</Text><Title order={3}>{t('Stories and passages', 'Kisah dan ayat')}</Title><Text size="sm" c="dimmed">{t('Short Quran-based summaries with references. They are not complete biographies or a dated history.', 'Ringkasan berdasarkan Al-Qur’an beserta rujukan. Isinya bukan biografi lengkap atau kronologi bertanggal.')}</Text></div>
      <Carousel slideSize={{ base: '90%', sm: '62%', md: '48%' }} slideGap="sm" withControls emblaOptions={{ loop: false, dragFree: true, align: 'start' }} aria-label={t('Prophet stories carousel', 'Carousel kisah para nabi')}>
        {PROPHET_PASSAGES.map((story, index) => <Carousel.Slide key={`${story.surah}:${story.verse}:${story.english}`}><article className="prophet-story-card"><Text className="prophet-story-index">{String(index + 1).padStart(2, '0')} · {story.arabic}</Text><Title order={4}>{lang === 'id' ? story.indonesian : story.english}</Title><Text className="prophet-story-ref">{story.reference}</Text><Text className="prophet-story-copy">{lang === 'id' ? story.storyId : story.storyEn}</Text><Button variant="subtle" onClick={() => document.dispatchEvent(new CustomEvent('sela:quran-navigate', { detail: { surah: story.surah, verse: story.verse } }))}>{t('Open cited verses', 'Buka ayat rujukan')}</Button></article></Carousel.Slide>)}
      </Carousel>
    </Card>
    <Card className="home-widget-card adhkar-widget" withBorder radius="xl" padding="lg">
      <div><Text className="page-eyebrow">{t('SOURCE-IDENTIFIED COLLECTION', 'KOLEKSI BERSUMBER')}</Text><Title order={3}>{t('Daily remembrance', 'Zikir harian')}</Title><Text size="sm" c="dimmed">{t('Choose a collection. Its Arabic text, translation and references are loaded only after you ask.', 'Pilih koleksi. Teks Arab, terjemahan dan rujukan dimuat hanya setelah kamu menekan tombol.')}</Text></div>
      <Group align="end"><Select style={{ flex: '1 1 220px' }} label={t('Collection', 'Koleksi')} value={slug} onChange={value => setSlug(value || 'morning-adhkar')} data={adhkar.map(([value, en, id]) => ({ value, label: t(en, id) }))} allowDeselect={false} /><Button onClick={() => void load()} loading={loading}>{collection ? t('Load again', 'Muat lagi') : t('Load collection', 'Muat koleksi')}</Button></Group>
      {error && <Alert color="red" role="alert">{error}</Alert>}
      {collection && <><Group justify="space-between"><div><Title order={4}>{lang === 'id' ? collection.arabicName || collection.name : collection.name}</Title><Text size="xs" c="dimmed">{collection.sourceNote}</Text></div><a href={collection.sourceUrl} target="_blank" rel="noopener noreferrer">{t('Source', 'Sumber')}</a></Group><Stack gap="sm" className="adhkar-items">{collection.items.slice(0, 5).map((item, index) => <article key={`${item.reference}:${index}`}><span>{String(index + 1).padStart(2, '0')}</span><h4>{item.title || item.reference}</h4><p lang="ar" dir="rtl">{item.arabic}</p>{item.transliteration && <Text size="sm">{item.transliteration}</Text>}<Text>{item.meaning}</Text><small>{[item.reference, item.repeat, item.grade].filter(Boolean).join(' · ')}</small>{item.note && <small>{item.note}</small>}</article>)}</Stack></>}
    </Card>
  </div>;
}
