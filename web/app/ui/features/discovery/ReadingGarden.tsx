import { useMemo, useState } from 'react';
import { Anchor, Button, Card, Group, Select, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { ArrowUpRight, BookOpen, Search } from 'lucide-react';
import { Link as RouterLink } from 'react-router';
import { READING_GARDEN_COLLECTIONS, READING_GARDEN_CATEGORIES, type ReadingGardenAvailability, type ReadingGardenCollection } from '../../../../../app/library/reading-garden.ts';
import { FaithLibraryBrowser } from '../home/FaithLibraryBrowser.tsx';
import { copy, useWorkspace } from '../../workspace.tsx';

type GardenFilter = 'all' | ReadingGardenAvailability;

const typeLabels = {
  'sacred-text': ['Sacred text', 'Teks keagamaan'],
  'passage-index': ['Passage index', 'Indeks ayat'],
  catalogue: ['Book catalogue', 'Katalog buku'],
} as const;
const availabilityLabels = {
  bundled: ['Included with app', 'Disertakan bersama app'],
  online: ['Read online', 'Baca online'],
  metadata: ['Metadata only', 'Metadata saja'],
} as const;
const rightsLabels = {
  'public-domain': ['Public domain', 'Domain publik'],
  cc0: ['CC0 1.0', 'CC0 1.0'],
  'edition-terms': ['Edition terms', 'Ketentuan edisi'],
  'sela-editorial': ['SELA editorial', 'Editorial SELA'],
} as const;
const languageLabels: Record<string, [string, string]> = {
  ar: ['Arabic', 'Arab'], id: ['Indonesian', 'Indonesia'], en: ['English', 'Inggris'], ja: ['Japanese', 'Jepang'],
};

function translatedLabel(lang: 'en' | 'id', pair: readonly [string, string]) {
  return copy(lang, pair[0], pair[1]);
}

function localizedCount(lang: 'en' | 'id', item: ReadingGardenCollection) {
  const unit = item.countUnit === 'books' ? copy(lang, 'books', 'kitab')
    : item.countUnit === 'chapters' ? copy(lang, 'chapters', 'bab')
      : item.countUnit === 'surahs' ? copy(lang, 'surahs', 'surah')
        : item.countUnit === 'records' ? copy(lang, 'records', 'data buku')
          : copy(lang, 'passages', 'rujukan');
  return `${item.count} ${unit}`;
}

export function ReadingGarden({ onBrowseClassics }: { onBrowseClassics: () => void }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState<GardenFilter>('all');
  const [language, setLanguage] = useState('all');
  const [contentType, setContentType] = useState('all');
  const [rights, setRights] = useState('all');

  const filtered = useMemo(() => {
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return READING_GARDEN_COLLECTIONS.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (availability !== 'all' && item.availability !== availability) return false;
      if (language !== 'all' && !item.languages.includes(language)) return false;
      if (contentType !== 'all' && item.contentType !== contentType) return false;
      if (rights !== 'all' && item.rights !== rights) return false;
      const haystack = [item.title, item.titleId, item.description, item.descriptionId, item.creator, item.creatorId, item.source, item.sourceId, item.rightsLabel, item.rightsLabelId, item.languages.join(' '), item.edition].filter(Boolean).join(' ').toLocaleLowerCase();
      return terms.every(term => haystack.includes(term));
    });
  }, [query, category, availability, language, contentType, rights]);

  const languageOptions = [...new Set(READING_GARDEN_COLLECTIONS.flatMap(item => item.languages))].sort();
  const resetFilters = () => { setQuery(''); setCategory('all'); setAvailability('all'); setLanguage('all'); setContentType('all'); setRights('all'); };

  return <section className="reading-garden" aria-labelledby="reading-garden-title">
    <header className="reading-garden-intro">
      <div>
        <p className="page-eyebrow">{t('CURATED STARTING POINTS', 'PILIHAN UNTUK MEMULAI')}</p>
        <Title id="reading-garden-title" order={2}>{t('A quiet place to begin.', 'Mulai dari ruang baca yang tenang.')}</Title>
        <Text>{t('Browse editions already included with Sela, follow a cited reading, or check what is only available online.', 'Jelajahi edisi yang sudah disertakan di Sela, buka bacaan dengan rujukan, atau lihat yang hanya tersedia online.')}</Text>
      </div>
      <span className="reading-garden-total">{READING_GARDEN_COLLECTIONS.length} {t('collections', 'koleksi')}</span>
    </header>

    <div className="reading-garden-filters">
      <TextInput className="reading-garden-search" value={query} onChange={event => setQuery(event.currentTarget.value)} leftSection={<Search size={16} />} label={t('Search the reading garden', 'Cari di Taman Bacaan')} placeholder={t('Title, translator, source', 'Judul, penerjemah, sumber')} aria-label={t('Search Taman Bacaan', 'Cari Taman Bacaan')} maxLength={100} />
      <Select label={t('Availability', 'Ketersediaan')} value={availability} onChange={value => setAvailability((value || 'all') as GardenFilter)} data={[{ value: 'all', label: t('Any availability', 'Semua ketersediaan') }, ...(['bundled', 'online', 'metadata'] as const).map(value => ({ value, label: translatedLabel(lang, availabilityLabels[value]) }))]} allowDeselect={false} />
      <Select label={t('Language', 'Bahasa')} value={language} onChange={value => setLanguage(value || 'all')} data={[{ value: 'all', label: t('Any language', 'Semua bahasa') }, ...languageOptions.map(value => ({ value, label: translatedLabel(lang, languageLabels[value] || [value, value]) }))]} allowDeselect={false} />
      <Select label={t('Content type', 'Jenis bacaan')} value={contentType} onChange={value => setContentType(value || 'all')} data={[{ value: 'all', label: t('Any type', 'Semua jenis') }, ...Object.entries(typeLabels).map(([value, label]) => ({ value, label: translatedLabel(lang, label) }))]} allowDeselect={false} />
      <Select label={t('Rights note', 'Catatan hak')} value={rights} onChange={value => setRights(value || 'all')} data={[{ value: 'all', label: t('Any rights note', 'Semua catatan hak') }, ...Object.entries(rightsLabels).map(([value, label]) => ({ value, label: translatedLabel(lang, label) }))]} allowDeselect={false} />
    </div>

    <nav className="reading-garden-categories" aria-label={t('Filter by collection', 'Saring berdasarkan koleksi')}>
      <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{t('All collections', 'Semua koleksi')}</button>
      {READING_GARDEN_CATEGORIES.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{t(item.en, item.idLabel)}</button>)}
    </nav>

    <p className="reading-garden-result-count" role="status" aria-live="polite">{t(`${filtered.length} collections shown`, `${filtered.length} koleksi ditampilkan`)}</p>
    {filtered.length ? <SimpleGrid className="reading-garden-grid" cols={{ base: 1, sm: 2, xl: 3 }} spacing="md">
      {filtered.map(item => <Card className="reading-garden-card" component="article" key={item.id} withBorder radius="lg" padding="lg">
        <div className="reading-garden-card-heading"><span className="reading-garden-mark" aria-hidden="true"><BookOpen size={17} strokeWidth={1.6} /></span><div><Text className="page-eyebrow">{t(item.category === 'faith' ? 'STORIES & FAITH' : item.category === 'wisdom' ? 'WISDOM & PHILOSOPHY' : 'WORLD LITERATURE', item.category === 'faith' ? 'KISAH & KEPERCAYAAN' : item.category === 'wisdom' ? 'FILSAFAT & KEBIJAKSANAAN' : 'SASTRA DUNIA')}</Text><Title order={3}>{t(item.title, item.titleId)}</Title></div></div>
        <Text className="reading-garden-description">{t(item.description, item.descriptionId)}</Text>
        <div className="reading-garden-badges" aria-label={t('Collection details', 'Detail koleksi')}>
          <span>{localizedCount(lang, item)}</span>
          <span>{translatedLabel(lang, availabilityLabels[item.availability])}</span>
          <span>{translatedLabel(lang, typeLabels[item.contentType])}</span>
        </div>
        <dl className="reading-garden-metadata">
          <div><dt>{t('Language', 'Bahasa')}</dt><dd>{item.languages.map(value => translatedLabel(lang, languageLabels[value] || [value, value])).join(', ')}</dd></div>
          {(item.creator || item.creatorId) && <div><dt>{t('Edition / creator', 'Edisi / penyusun')}</dt><dd>{t(item.creator || '', item.creatorId || item.creator || '')}{item.edition ? ` · ${item.edition}` : ''}</dd></div>}
          <div><dt>{t('Rights', 'Hak penggunaan')}</dt><dd>{t(item.rightsLabel, item.rightsLabelId)}</dd></div>
          <div><dt>{t('Source', 'Sumber')}</dt><dd>{t(item.source, item.sourceId)}</dd></div>
        </dl>
        <Text className="reading-garden-access-note">{t(item.accessNote, item.accessNoteId)}</Text>
        <div className="reading-garden-actions">
          {item.faith && <FaithLibraryBrowser faith={item.faith} triggerLabel={[`Browse ${item.title}`, `Jelajahi ${item.titleId}`]} />}
          {item.route && <Button component={RouterLink} to={item.route} variant="default">{item.id === 'prophet-passages' ? t('Browse cited passages', 'Jelajahi ayat rujukan') : t('Open the Quran', 'Buka Al-Qur’an')}</Button>}
          {item.id === 'sela-picks' && <Button onClick={onBrowseClassics} variant="default">{t('Browse 227 titles', 'Jelajahi 227 judul')}</Button>}
          <Anchor className="reading-garden-source-link" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{t('Source & terms', 'Sumber & ketentuan')} <ArrowUpRight size={13} /></Anchor>
        </div>
      </Card>)}
    </SimpleGrid> : <Card className="reading-garden-empty" withBorder radius="lg" padding="lg"><Text fw={600}>{t('No collections match these filters.', 'Tidak ada koleksi yang cocok dengan filter ini.')}</Text><Button variant="subtle" onClick={resetFilters}>{t('Clear search and filters', 'Hapus pencarian dan filter')}</Button></Card>}

    <Text className="reading-garden-footnote">{t('Searches here run on this collection list only. Personal shelf titles stay on this device. Rights and availability apply to the exact edition shown; Project Gutenberg terms vary by country.', 'Pencarian hanya berjalan pada daftar koleksi ini. Judul rak pribadi tetap di perangkatmu. Hak dan ketersediaan berlaku untuk edisi yang dicantumkan; ketentuan Project Gutenberg berbeda menurut negara.')}</Text>
  </section>;
}
