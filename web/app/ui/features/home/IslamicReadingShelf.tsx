import { useEffect, useState } from 'react';
import { Button, Card, Group, Select, Text, Title } from '@mantine/core';
import { ArrowUpRight, BookOpenText, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router';
import { PROPHET_PASSAGES } from '../../../../../app/library/prophet-passages.ts';
import { readPersonal } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { ISLAMIC_READING_OPTIONS } from '../faith/readings.ts';

export function IslamicReadingShelf() {
  const { lang } = useWorkspace();
  const navigate = useNavigate();
  const [collection, setCollection] = useState('morning-adhkar');
  const [islamic, setIslamic] = useState(() => readPersonal().faith === 'islam');
  const t = (en: string, id: string) => copy(lang, en, id);
  const story = PROPHET_PASSAGES[0];

  useEffect(() => {
    const sync = () => setIslamic(readPersonal().faith === 'islam');
    document.addEventListener('sela:personal', sync);
    return () => document.removeEventListener('sela:personal', sync);
  }, []);
  if (!islamic) return null;

  return <Card className="home-widget-card islamic-reading-shortcuts" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('READING & REFLECTION', 'BACAAN & RENUNGAN')}</Text><Title order={3}>{t('A little reading for today', 'Bacaan untuk hari ini')}</Title><Text size="sm" c="dimmed">{t('Open a dedicated reader for Quran verses, source-based passages and daily remembrance.', 'Buka ruang baca khusus untuk ayat Al-Qur’an, bacaan bersumber, dan zikir harian.')}</Text></div>
    {story && <button className="faith-story-teaser" type="button" onClick={() => navigate('/faith/stories/0')}>
      <span className="faith-story-teaser-icon"><ScrollText size={17} /></span>
      <span><strong>{lang === 'id' ? story.indonesian : story.english}</strong><small>{story.reference}</small></span>
      <ArrowUpRight size={15} aria-hidden="true" />
    </button>}
    <div className="faith-collection-shortcut">
      <Select label={t('Daily remembrance', 'Zikir harian')} value={collection} onChange={value => value && setCollection(value)} data={ISLAMIC_READING_OPTIONS.map(option => ({ value: option.slug, label: t(option.en, option.id) }))} allowDeselect={false} />
      <Button leftSection={<BookOpenText size={15} />} onClick={() => navigate(`/faith/collection/${collection}`)}>{t('Open reader', 'Buka bacaan')}</Button>
    </div>
  </Card>;
}
