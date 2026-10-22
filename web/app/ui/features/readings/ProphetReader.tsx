import { useEffect } from 'react';
import { Button, Text, Title } from '@mantine/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { formatRef, readingMinutes, type InstalledProphetPack, type ProphetArticle } from '../../../../../app/library/content-packs.ts';
import { quranSurahName } from '../../../../../app/library/scripture-sources.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import SaveButton from './SaveButton.tsx';

export function ProphetIndex({ pack, articles }: { pack: InstalledProphetPack; articles: ProphetArticle[] }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  return <section aria-labelledby="readings-index-title">
    <Text className="page-eyebrow">{pack.manifest.status === 'pilot' ? t('PILOT EDITION', 'EDISI RINTISAN') : pack.manifest.status === 'draft' ? t('DRAFT · NOT YET REVIEWED', 'DRAF · BELUM DITELAAH') : t('COLLECTION', 'KOLEKSI')} · v{pack.manifest.edition}</Text>
    <Title id="readings-index-title" order={2}>{lang === 'id' ? pack.manifest.title.id : pack.manifest.title.en}</Title>
    <p className="readings-lede">{lang === 'id' ? pack.manifest.description.id : pack.manifest.description.en}</p>
    <ol className="readings-index" aria-label={t('Entries', 'Daftar kisah')}>
      {articles.map(item => <li key={item.slug}><Link to={`/readings/${pack.id}/${item.slug}`}>
        <span className="readings-index-order" aria-hidden="true">{String(item.order).padStart(2, '0')}</span>
        <span className="readings-index-name"><strong>{item.name}</strong><small>{item.lede}</small></span>
        <span className="readings-index-meta" lang="ar" dir="rtl">{item.arabic}</span>
      </Link></li>)}
    </ol>
    <p className="readings-planned">{t('Quran reference links open the Quran reader, which needs an internet connection.', 'Tautan dalil membuka pembaca Al-Qur’an yang membutuhkan koneksi internet.')}</p>
  </section>;
}

export function ProphetArticleView({ pack, article, articles }: { pack: InstalledProphetPack; article: ProphetArticle; articles: ProphetArticle[] }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const navigate = useNavigate();
  const position = articles.findIndex(item => item.slug === article.slug);
  const previous = articles[position - 1];
  const next = articles[position + 1];
  const related = article.related.map(slug => articles.find(item => item.slug === slug)).filter((item): item is ProphetArticle => !!item);
  useEffect(() => { document.querySelector('.readings-screen .faith-reader-body')?.scrollTo({ top: 0, behavior: 'auto' }); }, [article.slug]);
  return <article className="readings-article" lang="id">
    <Text className="page-eyebrow"><Link to={`/readings/${pack.id}`}>{t('ALL ENTRIES', 'SEMUA KISAH')}</Link> · {position + 1} / {articles.length} · {readingMinutes(article)} {t('min read', 'menit baca')}</Text>
    <div className="readings-article-heading"><Title order={2}>{article.name}</Title><span lang="ar" dir="rtl" className="readings-arabic">{article.arabic}</span></div>
    <SaveButton packId={pack.id} itemId={article.slug} />
    <p className="readings-lede">{article.lede}</p>
    {article.sections.map((section, index) => <section key={index} className="readings-section" aria-labelledby={`readings-s${index}`}>
      <h3 id={`readings-s${index}`}>{section.heading}</h3>
      {section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      <p className="readings-refs"><span>{t('Quran references', 'Dalil Al-Qur’an')}</span>
        {section.refs.map(ref => <Link key={`${ref.surah}:${ref.from}-${ref.to ?? ''}`} to={`/faith/quran/${ref.surah}?verse=${ref.from}`}>{formatRef(ref, quranSurahName(ref.surah))}</Link>)}
      </p>
    </section>)}
    {article.notes.length > 0 && <aside className="readings-note" aria-labelledby="readings-notes"><h3 id="readings-notes">{t('SELA notes — interpretation, not scripture', 'Catatan SELA — penafsiran, bukan teks wahyu')}</h3>{article.notes.map((note, index) => <p key={index}>{note}</p>)}</aside>}
    <aside className="readings-accuracy" aria-labelledby="readings-accuracy"><h3 id="readings-accuracy">{t('Accuracy note', 'Catatan keakuratan')}</h3><p>{article.accuracy}</p></aside>
    {related.length > 0 && <p className="readings-related"><span>{t('Related', 'Terkait')}</span>{related.map(item => <Link key={item.slug} to={`/readings/${pack.id}/${item.slug}`}>{item.name}</Link>)}</p>}
    <footer className="faith-reader-controls">
      <Button variant="default" leftSection={<ChevronLeft size={16} />} disabled={!previous} onClick={() => previous && navigate(`/readings/${pack.id}/${previous.slug}`)}>{previous ? previous.name : t('Previous', 'Sebelumnya')}</Button>
      <span className="readings-position">{position + 1} / {articles.length}</span>
      <Button variant="default" rightSection={<ChevronRight size={16} />} disabled={!next} onClick={() => next && navigate(`/readings/${pack.id}/${next.slug}`)}>{next ? next.name : t('Next', 'Berikutnya')}</Button>
    </footer>
  </article>;
}
