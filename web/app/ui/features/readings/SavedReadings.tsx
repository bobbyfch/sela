import { useEffect, useState } from 'react';
import { Text, Title } from '@mantine/core';
import { Link } from 'react-router';
import { isProphetPack, isSourcePack, isTextPack, listRecords, type HadithPayload, type PackRecord } from '../../../../../app/library/content-packs.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { savedReadingEntries } from './readings-state.ts';

type Row = { key: string; to: string; title: string; from: string };

function resolve(records: PackRecord[], saved: string[]): Row[] {
  const rows: Row[] = [];
  for (const key of saved) {
    const [packId, itemId] = key.split('/');
    const record = records.find(item => item.id === packId);
    if (isProphetPack(record)) {
      const article = record.payload.articles.find(item => item.slug === itemId);
      if (article) rows.push({ key, to: `/readings/${packId}/${itemId}`, title: article.name, from: record.manifest.title.id });
    } else if (isTextPack(record)) {
      const [workId, sectionId] = itemId.split('.');
      const work = record.payload.works.find(item => item.id === workId);
      const section = work?.sections.find(item => item.id === sectionId);
      if (work && section) rows.push({ key, to: `/readings/${packId}/${workId}/${sectionId}`, title: `${work.title} · ${section.title}`, from: record.manifest.title.id });
    } else if (isSourcePack(record) && record.info.kind === 'hadith-collection') {
      const item = (record.payload as HadithPayload).items.find(row => row.id === itemId);
      if (item) rows.push({ key, to: `/readings/${packId}/${itemId}`, title: item.title, from: record.info.title });
    }
  }
  return rows;
}

export default function SavedReadings() {
  const { lang } = useWorkspace();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    let current = true;
    const refresh = () => {
      const saved = savedReadingEntries();
      if (!saved.length) { setRows([]); return; }
      listRecords().then(records => { if (current) setRows(resolve(records, saved)); }).catch(() => { if (current) setRows([]); });
    };
    refresh();
    document.addEventListener('sela:personal', refresh);
    return () => { current = false; document.removeEventListener('sela:personal', refresh); };
  }, []);
  if (!rows.length) return null;
  return <section className="readings-saved" aria-labelledby="readings-saved-title">
    <Title id="readings-saved-title" order={3}>{copy(lang, 'Saved', 'Tersimpan')}</Title>
    <ul className="readings-saved-list">{rows.map(row => <li key={row.key}><Link to={row.to}><strong>{row.title}</strong><Text component="span" size="xs">{row.from}</Text></Link></li>)}</ul>
  </section>;
}
