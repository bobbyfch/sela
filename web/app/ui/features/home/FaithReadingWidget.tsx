import { useEffect, useState } from 'react';
import { Alert, Button, Card, Group, Loader, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router';
import { localFaithReading } from '../../../../../app/library/local-faith-readings.ts';
import { loadFaithReading, type FaithId, type FaithReading } from '../../../../../app/library/scripture-sources.ts';
import { readPersonal } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { FaithLibraryBrowser } from './FaithLibraryBrowser.tsx';

const faithLabels: Record<string, [string, string]> = {
  islam: ['Islamic reading', 'Bacaan Islam'], protestantism: ['Bible reading', 'Bacaan Alkitab'], catholicism: ['Catholic Bible reading', 'Bacaan Alkitab Katolik'],
  buddhism: ['Dhamma reading', 'Bacaan Dhamma'], hinduism: ['Bhagavad Gita', 'Bhagavad Gita'], confucianism: ['The Analects', 'Analek'],
};

export function FaithReadingWidget() {
  const { lang } = useWorkspace();
  const navigate = useNavigate();
  const [faith, setFaith] = useState(() => readPersonal().faith);
  const [reading, setReading] = useState<FaithReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = (en: string, id: string) => copy(lang, en, id);

  useEffect(() => {
    const sync = () => setFaith(readPersonal().faith);
    document.addEventListener('sela:personal', sync); return () => document.removeEventListener('sela:personal', sync);
  }, []);
  useEffect(() => {
    if (faith === 'none') { setReading(null); return; }
    const local = localFaithReading(faith as FaithId, new Date());
    setReading(local); setError('');
  }, [faith]);
  if (faith === 'none') return null;

  const load = async () => {
    setLoading(true); setError('');
    const controller = new AbortController();
    try {
      const next = await loadFaithReading(faith as FaithId, lang, new Date(), controller.signal);
      if (next) setReading(next); else setError(t('A sourced reading is not available right now.', 'Bacaan bersumber belum tersedia.'));
    } catch (reason) { setError(reason instanceof Error ? reason.message : t('Reading source is unavailable.', 'Sumber bacaan belum tersedia.')); }
    finally { setLoading(false); }
  };
  return <Card className="home-widget-card faith-reading-widget" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('A READING WITH A SOURCE', 'BACAAN DENGAN SUMBER')}</Text><Title order={3}>{t(...(faithLabels[faith] || ['Daily reading', 'Bacaan harian']))}</Title></div>
    {reading ? <><blockquote className="faith-reading-excerpt" lang={reading.language} dir={reading.direction || 'auto'}>{reading.text}</blockquote><div className="faith-reading-attribution"><strong>{reading.reference}</strong><span>{reading.attribution}{reading.license ? ` · ${reading.license}` : ''}</span></div></> : <Text size="sm" c="dimmed">{t('Load a passage from the selected source when you are ready.', 'Muat bacaan dari sumber pilihan saat kamu siap.')}</Text>}
    {error && <Alert color="yellow" role="status">{error}</Alert>}
    <Group className="faith-reading-actions">{faith === 'islam' ? <Button variant="default" onClick={() => navigate(`/faith/quran/${readPersonal().quranSurah || 1}`)}>{t('Open the Quran', 'Buka Al-Qur’an')}</Button> : <FaithLibraryBrowser faith={faith as FaithId} />}<Button variant="subtle" onClick={() => navigate('/faith/daily')}>{t('Read full passage', 'Baca selengkapnya')}</Button><Button variant="subtle" onClick={() => void load()} disabled={loading}>{loading ? <Loader size={15} /> : t('Refresh source', 'Muat sumber')}</Button></Group>
  </Card>;
}
