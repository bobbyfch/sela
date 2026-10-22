import { Anchor, Card, Group, Text, Title } from '@mantine/core';
import type { PackFaith } from '../../../../../app/library/content-packs.ts';
import { ArrowUpRight } from 'lucide-react';
import { copy, useWorkspace } from '../../workspace.tsx';
import { BUILTIN_EDITIONS } from './builtin-editions.ts';
import { FaithLibraryBrowser } from '../home/FaithLibraryBrowser.tsx';

export default function BuiltinEditions({ faith, query }: { faith: PackFaith; query: string }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const needle = query.trim().toLowerCase();
  const rows = BUILTIN_EDITIONS.filter(row => row.faith === faith && (!needle || `${row.title} ${row.edition} ${row.license}`.toLowerCase().includes(needle)));
  if (!rows.length) return null;
  return <section className="readings-sources-panel" aria-labelledby="readings-builtin-title">
    <Text className="page-eyebrow">{t('ALREADY IN SELA', 'SUDAH ADA DI SELA')}</Text>
    <Title id="readings-builtin-title" order={2}>{t('Scripture editions that come with the app', 'Edisi kitab suci bawaan aplikasi')}</Title>
    <p className="readings-lede">{t('Nothing to download. Open one to read it in Sela or add it to your shelf.', 'Tidak perlu mengunduh. Buka untuk membacanya di Sela atau menambahkannya ke rakmu.')}</p>
    <div className="readings-grid">
      {rows.map(row => <Card key={row.faith} className="readings-card" withBorder radius="lg" padding="lg" component="article" aria-labelledby={`readings-builtin-${row.faith}`}>
        <Group gap={6} mb={6}><span className="readings-badge">{t('Built in', 'Bawaan')}</span><span className="readings-badge">{t('Works offline', 'Bisa offline')}</span></Group>
        <Title id={`readings-builtin-${row.faith}`} order={3}>{row.title}</Title>
        <dl className="readings-facts">
          <div><dt>{t('Edition', 'Edisi')}</dt><dd>{row.edition}</dd></div>
          <div><dt>{t('Contents', 'Isi')}</dt><dd>{t(row.count.en, row.count.id)}</dd></div>
          <div><dt>{t('Licence', 'Lisensi')}</dt><dd>{row.license}</dd></div>
        </dl>
        <p className="readings-sources">{t('Source', 'Sumber')}: <Anchor href={row.source} target="_blank" rel="noopener noreferrer" size="xs">{row.sourceLabel} <ArrowUpRight size={11} aria-hidden="true" /></Anchor></p>
        <Group mt="md"><FaithLibraryBrowser faith={row.faith} /></Group>
      </Card>)}
    </div>
  </section>;
}
