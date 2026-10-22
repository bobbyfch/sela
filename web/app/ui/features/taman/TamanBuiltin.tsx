import { Anchor, Badge, Card, Group, Text, Title } from '@mantine/core';
import { ArrowUpRight } from 'lucide-react';
import { copy, useWorkspace } from '../../workspace.tsx';
import { BUILTIN_EDITIONS } from './builtin-editions.ts';
import { FaithLibraryBrowser } from '../home/FaithLibraryBrowser.tsx';

/** Texts already inside the app. Listed here so they are found with the rest of the collections, without a second copy. */
export default function TamanBuiltin({ query }: { query: string }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const needle = query.trim().toLowerCase();
  const rows = BUILTIN_EDITIONS.filter(row => !needle || `${row.title} ${row.edition} ${row.license}`.toLowerCase().includes(needle));
  if (!rows.length) return null;
  return <section className="taman-sources-panel" aria-labelledby="taman-builtin-title">
    <Text className="page-eyebrow">{t('ALREADY IN SELA', 'SUDAH ADA DI SELA')}</Text>
    <Title id="taman-builtin-title" order={2}>{t('Scripture editions that come with the app', 'Edisi kitab suci bawaan aplikasi')}</Title>
    <p className="taman-lede">{t('Nothing to download. Open one to read it in Sela or add it to your shelf.', 'Tidak perlu mengunduh. Buka untuk membacanya di Sela atau menambahkannya ke rakmu.')}</p>
    <div className="taman-grid">
      {rows.map(row => <Card key={row.faith} className="taman-card" withBorder radius="lg" padding="lg" component="article" aria-labelledby={`taman-builtin-${row.faith}`}>
        <Group gap={6} mb={6}><Badge variant="outline" color="gray">{t('Built in', 'Bawaan')}</Badge><Badge variant="outline" color="gray">{t('Works offline', 'Bisa offline')}</Badge></Group>
        <Title id={`taman-builtin-${row.faith}`} order={2}>{row.title}</Title>
        <dl className="taman-facts">
          <div><dt>{t('Edition', 'Edisi')}</dt><dd>{row.edition}</dd></div>
          <div><dt>{t('Contents', 'Isi')}</dt><dd>{t(row.count.en, row.count.id)}</dd></div>
          <div><dt>{t('Licence', 'Lisensi')}</dt><dd>{row.license}</dd></div>
        </dl>
        <p className="taman-sources">{t('Source', 'Sumber')}: <Anchor href={row.source} target="_blank" rel="noopener noreferrer" size="xs">{row.sourceLabel} <ArrowUpRight size={11} aria-hidden="true" /></Anchor></p>
        <Group mt="md"><FaithLibraryBrowser faith={row.faith} /></Group>
      </Card>)}
    </div>
  </section>;
}
