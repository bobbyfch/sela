import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Text, TextInput, Title } from '@mantine/core';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { sectionMinutes, type InstalledTextPack, type TextSection, type TextWork } from '../../../../../app/library/content-packs.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import EntryTools from './EntryTools.tsx';
import SaveButton from './SaveButton.tsx';
import { rememberReadingEntry } from './readings-state.ts';

const PAGE = 100;

export default function TextReader({ pack, workId, sectionId }: { pack: InstalledTextPack; workId?: string; sectionId?: string }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const work = workId ? pack.payload.works.find(item => item.id === workId) : undefined;
  const section = work && sectionId ? work.sections.find(item => item.id === sectionId) : undefined;
  if (workId && !work) return <Alert color="yellow" role="status" title={t('Work not found', 'Karya tidak ditemukan')}><Link to={`/readings/${pack.id}`}>{t('Back to the list', 'Kembali ke daftar')}</Link></Alert>;
  if (work && sectionId && !section) return <Alert color="yellow" role="status" title={t('Section not found', 'Bagian tidak ditemukan')}><Link to={`/readings/${pack.id}/${work.id}`}>{t('Back to the contents', 'Kembali ke daftar isi')}</Link></Alert>;
  if (work && section) return <SectionView pack={pack} work={work} section={section} />;
  if (work) return <WorkContents pack={pack} work={work} />;
  return <Works pack={pack} />;
}

function Works({ pack }: { pack: InstalledTextPack }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const works = useMemo(() => pack.payload.works.filter(work => !needle || `${work.title} ${work.subtitle ?? ''} ${work.author ?? ''}`.toLowerCase().includes(needle)), [pack, needle]);
  return <section aria-labelledby="readings-works-title">
    <Text className="page-eyebrow">{t('EDITION', 'EDISI')} · {pack.manifest.edition}</Text>
    <Title id="readings-works-title" order={2}>{lang === 'id' ? pack.manifest.title.id : pack.manifest.title.en}</Title>
    <p className="readings-lede">{lang === 'id' ? pack.manifest.description.id : pack.manifest.description.en}</p>
    {pack.payload.works.length > 8 && <TextInput className="readings-search" type="search" leftSection={<Search size={16} aria-hidden="true" />} aria-label={t('Search this edition', 'Cari di edisi ini')} placeholder={t('Search titles', 'Cari judul')} value={query} onChange={event => setQuery(event.currentTarget.value)} />}
    <ol className="readings-index" aria-label={t('Works', 'Karya')}>
      {works.map((work, index) => <li key={work.id}><Link to={`/readings/${pack.id}/${work.id}`}>
        <span className="readings-index-order" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className="readings-index-name"><strong>{work.title}</strong><small>{[work.author, work.subtitle, t(`${work.sections.length} sections`, `${work.sections.length} bagian`)].filter(Boolean).join(' · ')}</small></span>
      </Link></li>)}
    </ol>
    {!works.length && <Text role="status" mt="md">{t('No work matches that search.', 'Tidak ada karya yang cocok dengan pencarian itu.')}</Text>}
    <p className="readings-planned">{t('License', 'Lisensi')}: {pack.manifest.license.name}. {pack.manifest.source.map(source => source.label).join(', ')}.</p>
  </section>;
}

function WorkContents({ pack, work }: { pack: InstalledTextPack; work: TextWork }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const needle = query.trim().toLowerCase();
  const sections = useMemo(() => work.sections.filter(section => !needle || section.title.toLowerCase().includes(needle)), [work, needle]);
  useEffect(() => setShown(PAGE), [needle, work.id]);
  return <section aria-labelledby="readings-contents-title">
    <Text className="page-eyebrow"><Link to={`/readings/${pack.id}`}>{t('ALL WORKS', 'SEMUA KARYA')}</Link></Text>
    <Title id="readings-contents-title" order={2}>{work.title}</Title>
    {(work.author || work.subtitle) && <p className="readings-lede">{[work.author, work.subtitle].filter(Boolean).join(' · ')}</p>}
    {work.sections.length > 12 && <TextInput className="readings-search" type="search" leftSection={<Search size={16} aria-hidden="true" />} aria-label={t('Search the contents', 'Cari di daftar isi')} placeholder={t('Search section titles', 'Cari judul bagian')} value={query} onChange={event => setQuery(event.currentTarget.value)} />}
    <ol className="readings-index" aria-label={t('Contents', 'Daftar isi')}>
      {sections.slice(0, shown).map(section => <li key={section.id}><Link to={`/readings/${pack.id}/${work.id}/${section.id}`}>
        <span className="readings-index-name"><strong>{section.title}</strong></span>
      </Link></li>)}
    </ol>
    {shown < sections.length && <Button mt="md" variant="default" onClick={() => setShown(count => count + PAGE)}>{t('Show more', 'Tampilkan lagi')}</Button>}
    {!sections.length && <Text role="status" mt="md">{t('No section matches that search.', 'Tidak ada bagian yang cocok dengan pencarian itu.')}</Text>}
  </section>;
}

function SectionView({ pack, work, section }: { pack: InstalledTextPack; work: TextWork; section: TextSection }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const navigate = useNavigate();
  const index = work.sections.findIndex(item => item.id === section.id);
  const previous = work.sections[index - 1];
  const next = work.sections[index + 1];
  useEffect(() => { rememberReadingEntry(pack.id, `${work.id}/${section.id}`); }, [pack.id, work.id, section.id]);
  useEffect(() => { document.querySelector('.readings-screen .faith-reader-body')?.scrollTo({ top: 0, behavior: 'auto' }); }, [work.id, section.id]);
  const go = (target?: TextSection) => target && navigate(`/readings/${pack.id}/${work.id}/${target.id}`);
  return <article className="readings-article" lang={pack.manifest.language}>
    <Text className="page-eyebrow"><Link to={`/readings/${pack.id}/${work.id}`}>{work.title}</Link> · {index + 1} / {work.sections.length} · {sectionMinutes(section)} {t('min read', 'menit baca')}</Text>
    <Title order={2}>{section.title}</Title>
    <SaveButton packId={pack.id} itemId={`${work.id}.${section.id}`} />
    <div className="readings-text">
      {section.verses?.map(verse => <p key={verse.n} className="readings-verse"><span className="readings-verse-n" aria-label={t(`Verse ${verse.n}`, `Ayat ${verse.n}`)}>{verse.n}</span>{verse.text}</p>)}
      {section.paragraphs?.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
    </div>
    <p className="readings-planned">{pack.manifest.edition} · {pack.manifest.license.name}</p>
    <EntryTools packId={pack.id} itemId={`${work.id}.${section.id}`} />
    <footer className="faith-reader-controls">
      <Button variant="default" leftSection={<ChevronLeft size={16} />} disabled={!previous} onClick={() => go(previous)}>{t('Previous', 'Sebelumnya')}</Button>
      <span className="readings-position">{index + 1} / {work.sections.length}</span>
      <Button variant="default" rightSection={<ChevronRight size={16} />} disabled={!next} onClick={() => go(next)}>{t('Next', 'Berikutnya')}</Button>
    </footer>
  </article>;
}
