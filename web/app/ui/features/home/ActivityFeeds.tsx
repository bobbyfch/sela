import { useEffect, useState } from 'react';
import { ActionIcon, Anchor, Badge, Card, Group, MultiSelect, Select, Skeleton, Stack, Text, Title, Tooltip } from '@mantine/core';
import { RefreshCw } from 'lucide-react';
import { HOME_NEWS_TOPICS, loadOnThisDay, loadTopicNews, readNewsSource, readNewsTopics, saveNewsSource, saveNewsTopics, type HomeFeedItem, type HomeNewsSource, type HomeNewsTopic } from '../../../../../app/library/home-feeds.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

const topicLabels: Record<HomeNewsTopic, [string, string]> = {
  books: ['Books & literature', 'Buku & sastra'], science: ['Science', 'Sains'], nature: ['Nature & climate', 'Alam & iklim'],
  art: ['Art & design', 'Seni & desain'], technology: ['Technology', 'Teknologi'], culture: ['Culture & film', 'Budaya & film'],
};

function FeedRows({ items, lang }: { items: HomeFeedItem[]; lang: 'id' | 'en' }) {
  const t = (en: string, id: string) => copy(lang, en, id);
  return <Stack gap="xs" className="home-feed-rows">{items.slice(0, 5).map((item, index) => <article className={`home-feed-item${item.image ? ' has-image' : ''}`} key={`${item.url}:${index}`}>
    {item.image && <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" />}
    <div><Anchor href={item.url} target="_blank" rel="noopener noreferrer" className="home-feed-title">{item.title}</Anchor>{item.description && item.description !== item.title && <Text size="xs" c="dimmed">{item.description}</Text>}<div className="home-feed-meta"><Badge variant="light" color="quill">{item.source || t('Source', 'Sumber')}</Badge>{item.year && <span>{item.year}</span>}{item.date && <span>{item.date}</span>}</div></div>
  </article>)}</Stack>;
}

export function OnThisDayWidget() {
  const { lang } = useWorkspace();
  const [items, setItems] = useState<HomeFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const t = (en: string, id: string) => copy(lang, en, id);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    void loadOnThisDay(lang, new Date(), controller.signal).then(setItems).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : t('History feed is unavailable.', 'Riwayat belum tersedia.')); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [lang, refresh]);
  return <Card className="home-widget-card home-feed-widget" withBorder radius="xl" padding="lg"><Group justify="space-between"><div><Text className="page-eyebrow">{t('A WINDOW INTO THE PAST', 'JENDELA KE MASA LALU')}</Text><Title order={3}>{t('On this day', 'Hari ini dalam sejarah')}</Title></div><Tooltip label={t('Refresh', 'Perbarui')} withArrow><ActionIcon variant="subtle" aria-label={t('Refresh history', 'Perbarui sejarah')} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16} /></ActionIcon></Tooltip></Group>
    {loading ? <Stack><Skeleton height={46} /><Skeleton height={46} /><Skeleton height={46} /></Stack> : error ? <Text size="sm" c="red">{error}</Text> : items.length ? <FeedRows items={items} lang={lang} /> : <Text size="sm" c="dimmed">{t('No entries were returned for today.', 'Belum ada catatan untuk tanggal hari ini.')}</Text>}
  </Card>;
}

export function BookNewsWidget() {
  const { lang } = useWorkspace();
  const [topics, setTopics] = useState<HomeNewsTopic[]>(readNewsTopics);
  const [topic, setTopic] = useState<HomeNewsTopic>(topics[0] || 'books');
  const [source, setSource] = useState<HomeNewsSource>(readNewsSource);
  const [items, setItems] = useState<HomeFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const t = (en: string, id: string) => copy(lang, en, id);
  useEffect(() => {
    const controller = new AbortController();
    const safeSource = lang !== 'id' && source === 'antara' ? 'auto' : source;
    if (safeSource !== source) setSource(safeSource);
    setLoading(true); setError('');
    void loadTopicNews(topic, lang, controller.signal, safeSource).then(setItems).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : t('News is unavailable.', 'Berita belum tersedia.')); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [lang, topic, source, refresh]);
  const setSelectedTopics = (values: string[]) => {
    const saved = saveNewsTopics(values); setTopics(saved);
    if (!saved.includes(topic)) setTopic(saved[0]);
  };
  return <Card className="home-widget-card home-feed-widget" withBorder radius="xl" padding="lg"><Group justify="space-between" align="flex-start"><div><Text className="page-eyebrow">{t('FROM OPEN NEWS SOURCES', 'DARI SUMBER BERITA TERBUKA')}</Text><Title order={3}>{t('Reading around', 'Kabar bacaan')}</Title></div><Tooltip label={t('Refresh', 'Perbarui')} withArrow><ActionIcon variant="subtle" aria-label={t('Refresh news', 'Perbarui berita')} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16} /></ActionIcon></Tooltip></Group>
    <div className="home-news-controls"><Select aria-label={t('News topic', 'Topik berita')} value={topic} onChange={value => setTopic((value || 'books') as HomeNewsTopic)} data={topics.map(value => ({ value, label: t(...topicLabels[value]) }))} allowDeselect={false} /><Select aria-label={t('News source', 'Sumber berita')} value={source} onChange={value => { const next = saveNewsSource(value); setSource(next); }} data={[{ value: 'auto', label: t('Automatic source', 'Sumber otomatis') }, ...(lang === 'id' ? [{ value: 'antara', label: 'ANTARA' }] : []), { value: 'guardian', label: 'The Guardian' }]} allowDeselect={false} /></div>
    <MultiSelect aria-label={t('Saved news topics', 'Topik berita tersimpan')} value={topics} onChange={setSelectedTopics} data={HOME_NEWS_TOPICS.map(value => ({ value, label: t(...topicLabels[value]) }))} maxValues={4} label={t('Topics to keep', 'Topik pilihan')} placeholder={t('Choose up to four topics', 'Pilih hingga empat topik')} />
    {loading ? <Stack><Skeleton height={46} /><Skeleton height={46} /></Stack> : error ? <Text size="sm" c="red">{error}</Text> : items.length ? <FeedRows items={items} lang={lang} /> : <Text size="sm" c="dimmed">{t('No stories are available for this topic right now.', 'Belum ada berita untuk topik ini.')}</Text>}
  </Card>;
}
