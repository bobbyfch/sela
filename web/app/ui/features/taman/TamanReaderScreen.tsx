import { useEffect, useState } from 'react';
import { ActionIcon, Alert, Button, Skeleton, Text, Title } from '@mantine/core';
import { ArrowLeft, BookOpenText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { formatRef, getInstalledPack, readingMinutes, type InstalledPack, type ProphetArticle } from '../../../../../app/library/content-packs.ts';
import { quranSurahName } from '../../../../../app/library/scripture-sources.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { rememberTamanArticle } from './taman-state.ts';

type Load = { state: 'loading' } | { state: 'ready'; pack: InstalledPack } | { state: 'missing' } | { state: 'error'; message: string };

export default function TamanReaderScreen() {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const navigate = useNavigate();
  const [packId, slug] = useLocation().pathname.split('/').filter(Boolean).slice(1);
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    setLoad({ state: 'loading' });
    void getInstalledPack(packId || '').then(pack => { if (current) setLoad(pack ? { state: 'ready', pack } : { state: 'missing' }); })
      .catch(reason => { if (current) setLoad({ state: 'error', message: reason instanceof Error ? reason.message : t('Browser storage is unavailable.', 'Penyimpanan peramban tidak tersedia.') }); });
    return () => { current = false; };
  }, [packId, attempt]);

  const goBack = () => navigate('/discover?lens=taman');
  const pack = load.state === 'ready' ? load.pack : null;
  const articles = pack ? [...pack.payload.articles].sort((a, b) => a.order - b.order) : [];
  const article = slug ? articles.find(item => item.slug === slug) : undefined;
  const title = pack ? (lang === 'id' ? pack.manifest.title.id : pack.manifest.title.en) : t('Reading garden', 'Taman Bacaan');

  useEffect(() => { if (pack && article) rememberTamanArticle(pack.id, article.slug); }, [pack?.id, article?.slug]);

  return <div className="faith-reader-screen taman-screen" aria-label={title}>
    <header className="faith-reader-header">
      <ActionIcon className="faith-reader-back" variant="default" aria-label={t('Back to Discover', 'Kembali ke Jelajah')} onClick={goBack}><ArrowLeft size={18} /></ActionIcon>
      <div className="faith-reader-brand"><Text className="page-eyebrow">SELA · {t('READING GARDEN', 'TAMAN BACAAN')}</Text><Title order={1}>{title}</Title></div>
      <BookOpenText className="faith-reader-mark" size={21} aria-hidden="true" />
    </header>
    <main className="faith-reader-body">
      <div className="faith-reader-content taman-content">
        {load.state === 'loading' && <div role="status" aria-label={t('Opening this collection…', 'Membuka koleksi…')}><Skeleton height={28} width="40%" /><Skeleton mt="md" height={90} radius="lg" /><Skeleton mt="md" height={90} radius="lg" /></div>}
        {load.state === 'error' && <Alert color="red" role="alert" title={t('This collection could not be opened', 'Koleksi belum dapat dibuka')}>{load.message}<br /><Button mt="sm" variant="default" onClick={() => setAttempt(count => count + 1)}>{t('Try again', 'Coba lagi')}</Button></Alert>}
        {load.state === 'missing' && <Alert color="yellow" role="status" title={t('Not downloaded on this device', 'Belum diunduh di perangkat ini')}>{t('Download this collection from Reading garden in Discover, then open it again.', 'Unduh koleksi ini dari Taman Bacaan di Jelajah, lalu buka kembali.')}<br /><Button mt="sm" onClick={goBack}>{t('Go to Reading garden', 'Ke Taman Bacaan')}</Button></Alert>}
        {pack && !slug && <CollectionIndex pack={pack} articles={articles} />}
        {pack && slug && !article && <Alert color="yellow" role="status" title={t('Entry not found', 'Entri tidak ditemukan')}><Link to={`/taman/${pack.id}`}>{t('Back to the index', 'Kembali ke daftar')}</Link></Alert>}
        {pack && article && <Article pack={pack} article={article} articles={articles} />}
      </div>
    </main>
  </div>;
}

function CollectionIndex({ pack, articles }: { pack: InstalledPack; articles: ProphetArticle[] }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const planned = pack.manifest.plannedItemCount;
  return <section aria-labelledby="taman-index-title">
    <Text className="page-eyebrow">{pack.manifest.status === 'pilot' ? t('PILOT EDITION', 'EDISI RINTISAN') : t('COLLECTION', 'KOLEKSI')} · v{pack.manifest.edition}</Text>
    <Title id="taman-index-title" order={2}>{lang === 'id' ? pack.manifest.title.id : pack.manifest.title.en}</Title>
    <p className="taman-lede">{lang === 'id' ? pack.manifest.description.id : pack.manifest.description.en}</p>
    <ol className="taman-index" aria-label={t('Entries', 'Daftar kisah')}>
      {articles.map(item => <li key={item.slug}><Link to={`/taman/${pack.id}/${item.slug}`}>
        <span className="taman-index-order" aria-hidden="true">{String(item.order).padStart(2, '0')}</span>
        <span className="taman-index-name"><strong>{item.name}</strong><small>{item.lede}</small></span>
        <span className="taman-index-meta" lang="ar" dir="rtl">{item.arabic}</span>
      </Link></li>)}
    </ol>
    <p className="taman-planned">{t('Quran reference links open the Quran reader, which needs an internet connection.', 'Tautan dalil membuka pembaca Al-Qur’an yang membutuhkan koneksi internet.')}</p>
    {planned && planned > articles.length && <p className="taman-planned">{t(`${articles.length} of ${planned} entries are written so far. The rest will appear only after their Quran references are checked.`, `Baru ${articles.length} dari ${planned} kisah yang tersedia. Sisanya akan muncul setelah rujukan ayatnya diperiksa.`)}</p>}
  </section>;
}

function Article({ pack, article, articles }: { pack: InstalledPack; article: ProphetArticle; articles: ProphetArticle[] }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const navigate = useNavigate();
  const position = articles.findIndex(item => item.slug === article.slug);
  const previous = articles[position - 1];
  const next = articles[position + 1];
  const related = article.related.map(slug => articles.find(item => item.slug === slug)).filter((item): item is ProphetArticle => !!item);
  useEffect(() => { document.querySelector('.taman-screen .faith-reader-body')?.scrollTo({ top: 0, behavior: 'auto' }); }, [article.slug]);
  return <article className="taman-article" lang="id">
    <Text className="page-eyebrow"><Link to={`/taman/${pack.id}`}>{t('ALL ENTRIES', 'SEMUA KISAH')}</Link> · {position + 1} / {articles.length} · {readingMinutes(article)} {t('min read', 'menit baca')}</Text>
    <div className="taman-article-heading"><Title order={2}>{article.name}</Title><span lang="ar" dir="rtl" className="taman-arabic">{article.arabic}</span></div>
    <p className="taman-lede">{article.lede}</p>
    {article.sections.map((section, index) => <section key={index} className="taman-section" aria-labelledby={`taman-s${index}`}>
      <h3 id={`taman-s${index}`}>{section.heading}</h3>
      {section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      <p className="taman-refs"><span>{t('Quran references', 'Dalil Al-Qur’an')}</span>
        {section.refs.map(ref => <Link key={`${ref.surah}:${ref.from}-${ref.to ?? ''}`} to={`/faith/quran/${ref.surah}?verse=${ref.from}`}>{formatRef(ref, quranSurahName(ref.surah))}</Link>)}
      </p>
    </section>)}
    {article.notes.length > 0 && <aside className="taman-note" aria-labelledby="taman-notes"><h3 id="taman-notes">{t('SELA notes — interpretation, not scripture', 'Catatan SELA — penafsiran, bukan teks wahyu')}</h3>{article.notes.map((note, index) => <p key={index}>{note}</p>)}</aside>}
    <aside className="taman-accuracy" aria-labelledby="taman-accuracy"><h3 id="taman-accuracy">{t('Accuracy note', 'Catatan keakuratan')}</h3><p>{article.accuracy}</p></aside>
    {related.length > 0 && <p className="taman-related"><span>{t('Related', 'Terkait')}</span>{related.map(item => <Link key={item.slug} to={`/taman/${pack.id}/${item.slug}`}>{item.name}</Link>)}</p>}
    <footer className="faith-reader-controls">
      <Button variant="default" leftSection={<ChevronLeft size={16} />} disabled={!previous} onClick={() => previous && navigate(`/taman/${pack.id}/${previous.slug}`)}>{previous ? previous.name : t('Previous', 'Sebelumnya')}</Button>
      <span className="taman-position">{position + 1} / {articles.length}</span>
      <Button variant="default" rightSection={<ChevronRight size={16} />} disabled={!next} onClick={() => next && navigate(`/taman/${pack.id}/${next.slug}`)}>{next ? next.name : t('Next', 'Berikutnya')}</Button>
    </footer>
  </article>;
}
