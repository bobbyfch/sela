import { useEffect, useState } from 'react';
import { ActionIcon, Alert, Button, Skeleton, Text, Title } from '@mantine/core';
import { ArrowLeft, BookOpenText } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { getRecord, isProphetPack, isSourcePack, isTextPack, type HadithPayload, type InstalledProphetPack, type InstalledSourcePack, type InstalledTextPack } from '../../../../../app/library/content-packs.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import HadithReader from './HadithReader.tsx';
import { ProphetArticleView, ProphetIndex } from './ProphetReader.tsx';
import TextReader from './TextReader.tsx';
import { rememberReadingEntry } from './readings-state.ts';

type Load =
  | { state: 'loading' }
  | { state: 'prophets'; pack: InstalledProphetPack }
  | { state: 'text'; pack: InstalledTextPack }
  | { state: 'hadith'; pack: InstalledSourcePack }
  | { state: 'missing' }
  | { state: 'error'; message: string };

export default function ReadingsScreen() {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const navigate = useNavigate();
  const [packId, first, second] = useLocation().pathname.split('/').filter(Boolean).slice(1);
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    setLoad({ state: 'loading' });
    getRecord(packId || '').then(record => {
      if (!current) return;
      if (isProphetPack(record)) setLoad({ state: 'prophets', pack: record });
      else if (isTextPack(record)) setLoad({ state: 'text', pack: record });
      else if (isSourcePack(record) && record.info.kind === 'hadith-collection') setLoad({ state: 'hadith', pack: record });
      else if (isSourcePack(record)) navigate('/faith/quran/1', { replace: true });
      else setLoad({ state: 'missing' });
    }).catch(reason => { if (current) setLoad({ state: 'error', message: reason instanceof Error ? reason.message : t('Browser storage is unavailable.', 'Penyimpanan peramban tidak tersedia.') }); });
    return () => { current = false; };
  }, [packId, attempt]);

  const goBack = () => navigate('/shelf?tab=faith');
  const articles = load.state === 'prophets' ? [...load.pack.payload.articles].sort((a, b) => a.order - b.order) : [];
  const article = load.state === 'prophets' && first ? articles.find(item => item.slug === first) : undefined;
  const title = load.state === 'prophets' || load.state === 'text' ? (lang === 'id' ? load.pack.manifest.title.id : load.pack.manifest.title.en) : load.state === 'hadith' ? load.pack.info.title : t('Faith readings', 'Bacaan agama');

  useEffect(() => { if (load.state === 'prophets' && article) rememberReadingEntry(load.pack.id, article.slug); }, [load.state, article?.slug]);

  return <div className="faith-reader-screen readings-screen" aria-label={title}>
    <header className="faith-reader-header" role="banner">
      <ActionIcon className="faith-reader-back" variant="default" aria-label={t('Back to Faith readings', 'Kembali ke Bacaan agama')} onClick={goBack}><ArrowLeft size={18} /></ActionIcon>
      <div className="faith-reader-brand"><Text className="page-eyebrow">SELA · {t('FAITH READINGS', 'BACAAN AGAMA')}</Text><Title order={1}>{title}</Title></div>
      <BookOpenText className="faith-reader-mark" size={21} aria-hidden="true" />
    </header>
    <main className="faith-reader-body">
      <div className="faith-reader-content readings-content">
        {load.state === 'loading' && <div role="status" aria-label={t('Opening this reading…', 'Membuka bacaan…')}><Skeleton height={28} width="40%" /><Skeleton mt="md" height={90} radius="lg" /><Skeleton mt="md" height={90} radius="lg" /></div>}
        {load.state === 'error' && <Alert color="red" role="alert" title={t('This reading could not be opened', 'Bacaan belum dapat dibuka')}>{load.message}<br /><Button mt="sm" variant="default" onClick={() => setAttempt(count => count + 1)}>{t('Try again', 'Coba lagi')}</Button></Alert>}
        {load.state === 'missing' && <Alert color="yellow" role="status" title={t('Not downloaded on this device', 'Belum diunduh di perangkat ini')}>{t('Download it from the Faith tab on your shelf, then open it again.', 'Unduh dari tab Agama di rak bukumu, lalu buka kembali.')}<br /><Button mt="sm" onClick={goBack}>{t('Go to Faith readings', 'Ke Bacaan agama')}</Button></Alert>}
        {load.state === 'hadith' && <HadithReader pack={load.pack} payload={load.pack.payload as HadithPayload} itemId={first} />}
        {load.state === 'text' && <TextReader pack={load.pack} workId={first} sectionId={second} />}
        {load.state === 'prophets' && !first && <ProphetIndex pack={load.pack} articles={articles} />}
        {load.state === 'prophets' && first && !article && <Alert color="yellow" role="status" title={t('Entry not found', 'Entri tidak ditemukan')}><Link to={`/readings/${load.pack.id}`}>{t('Back to the index', 'Kembali ke daftar')}</Link></Alert>}
        {load.state === 'prophets' && article && <ProphetArticleView pack={load.pack} article={article} articles={articles} />}
      </div>
    </main>
  </div>;
}
