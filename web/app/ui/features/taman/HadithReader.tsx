import { useEffect, useMemo, useState } from 'react';
import { Alert, Anchor, Button, Text, TextInput, Title } from '@mantine/core';
import { ArrowUpRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import type { HadeethRecord, HadithPayload, InstalledSourcePack } from '../../../../../app/library/content-packs.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import SaveButton from './SaveButton.tsx';

const PAGE = 50;
const field = (record: HadeethRecord, name: string): string => typeof record[name] === 'string' ? (record[name] as string) : '';
const list = (record: HadeethRecord, name: string): string[] => Array.isArray(record[name]) ? (record[name] as unknown[]).filter((item): item is string => typeof item === 'string' && !!item.trim()) : [];

/** Index and reader for an installed hadith collection. Text is shown exactly as the publisher supplied it. */
export default function HadithReader({ pack, payload, itemId }: { pack: InstalledSourcePack; payload: HadithPayload; itemId?: string }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const credit = <p className="taman-planned">{t('Source: ', 'Sumber: ')}<Anchor href={pack.info.publisher.url} target="_blank" rel="noopener noreferrer" size="xs">{pack.info.publisher.label} <ArrowUpRight size={11} aria-hidden="true" /></Anchor> · {pack.info.version}. {t('Shown unchanged. Download again from Reading garden to get the publisher’s latest text.', 'Ditampilkan tanpa perubahan. Unduh ulang dari Taman Bacaan untuk mendapat teks terbaru dari penerbit.')}</p>;
  const index = itemId ? payload.items.findIndex(item => item.id === itemId) : -1;
  if (itemId && index < 0) return <Alert color="yellow" role="status" title={t('Hadith not found', 'Hadis tidak ditemukan')}><Link to={`/taman/${pack.id}`}>{t('Back to the index', 'Kembali ke daftar')}</Link></Alert>;
  return index >= 0 ? <Hadeeth pack={pack} items={payload.items} index={index} credit={credit} t={t} /> : <Index pack={pack} items={payload.items} credit={credit} t={t} />;
}

type Translate = (en: string, id: string) => string;

function Index({ pack, items, credit, t }: { pack: InstalledSourcePack; items: HadeethRecord[]; credit: React.ReactNode; t: Translate }) {
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const needle = query.trim().toLowerCase();
  const matches = useMemo(() => needle ? items.filter(item => `${item.title} ${item.hadeeth}`.toLowerCase().includes(needle)) : items, [items, needle]);
  useEffect(() => setShown(PAGE), [needle]);
  return <section aria-labelledby="hadith-index-title">
    <Text className="page-eyebrow">{t('HADITH', 'HADIS')} · {pack.info.version}</Text>
    <Title id="hadith-index-title" order={2}>{pack.info.title}</Title>
    <TextInput className="taman-search" type="search" leftSection={<Search size={16} aria-hidden="true" />} aria-label={t('Search this collection', 'Cari di koleksi ini')} placeholder={t('Search titles and text', 'Cari judul dan teks')} value={query} onChange={event => setQuery(event.currentTarget.value)} />
    <Text size="sm" role="status" mt="xs">{t(`${matches.length} of ${items.length} hadith`, `${matches.length} dari ${items.length} hadis`)}</Text>
    <ol className="taman-index" aria-label={t('Hadith', 'Daftar hadis')}>
      {matches.slice(0, shown).map(item => <li key={item.id}><Link to={`/taman/${pack.id}/${item.id}`}>
        <span className="taman-index-order" aria-hidden="true">{item.id}</span>
        <span className="taman-index-name"><strong>{item.title}</strong><small>{field(item, 'attribution')}{field(item, 'grade') ? ` · ${field(item, 'grade')}` : ''}</small></span>
      </Link></li>)}
    </ol>
    {shown < matches.length && <Button mt="md" variant="default" onClick={() => setShown(count => count + PAGE)}>{t('Show more', 'Tampilkan lagi')}</Button>}
    {!matches.length && <Text role="status" mt="md">{t('No hadith matches that search.', 'Tidak ada hadis yang cocok dengan pencarian itu.')}</Text>}
    {credit}
  </section>;
}

function Hadeeth({ pack, items, index, credit, t }: { pack: InstalledSourcePack; items: HadeethRecord[]; index: number; credit: React.ReactNode; t: Translate }) {
  const navigate = useNavigate();
  const item = items[index], previous = items[index - 1], next = items[index + 1];
  const arabic = field(item, 'hadeeth_ar'), explanation = field(item, 'explanation'), hints = list(item, 'hints'), attribution = field(item, 'attribution'), grade = field(item, 'grade');
  useEffect(() => { document.querySelector('.taman-screen .faith-reader-body')?.scrollTo({ top: 0, behavior: 'auto' }); }, [item.id]);
  return <article className="taman-article" lang="id">
    <Text className="page-eyebrow"><Link to={`/taman/${pack.id}`}>{t('ALL HADITH', 'SEMUA HADIS')}</Link> · {index + 1} / {items.length}</Text>
    <Title order={2}>{item.title}</Title>
    <SaveButton packId={pack.id} itemId={item.id} />
    {arabic && <p className="faith-reader-arabic" lang="ar" dir="rtl">{arabic}</p>}
    <p className="hadith-text">{item.hadeeth}</p>
    <dl className="taman-facts">
      {attribution && <div><dt>{t('Narrated in', 'Diriwayatkan')}</dt><dd>{attribution}</dd></div>}
      {grade && <div><dt>{t('Grade', 'Derajat')}</dt><dd>{grade}</dd></div>}
      <div><dt>{t('Publisher ID', 'ID di penerbit')}</dt><dd>{item.id}</dd></div>
    </dl>
    {explanation && <section className="taman-section"><h3>{t('Explanation from the publisher', 'Penjelasan dari penerbit')}</h3><p className="hadith-text">{explanation}</p></section>}
    {hints.length > 0 && <section className="taman-section"><h3>{t('Lessons from the publisher', 'Faedah dari penerbit')}</h3><ul className="hadith-hints">{hints.map((hint, i) => <li key={i}>{hint}</li>)}</ul></section>}
    {credit}
    <footer className="faith-reader-controls">
      <Button variant="default" leftSection={<ChevronLeft size={16} />} disabled={!previous} onClick={() => previous && navigate(`/taman/${pack.id}/${previous.id}`)}>{t('Previous', 'Sebelumnya')}</Button>
      <span className="taman-position">{index + 1} / {items.length}</span>
      <Button variant="default" rightSection={<ChevronRight size={16} />} disabled={!next} onClick={() => next && navigate(`/taman/${pack.id}/${next.id}`)}>{t('Next', 'Berikutnya')}</Button>
    </footer>
  </article>;
}
