import { useEffect, useState } from 'react';
import { Text, Title } from '@mantine/core';
import { Link } from 'react-router';
import { isEditorial, isSourcePack, listRecords, type HadithPayload, type PackRecord } from '../../../../../app/library/content-packs.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { savedTamanEntries } from './taman-state.ts';

type Row = { key: string; to: string; title: string; from: string };

function resolve(records: PackRecord[], saved: string[]): Row[] {
  const rows: Row[] = [];
  for (const key of saved) {
    const [packId, itemId] = key.split('/');
    const record = records.find(item => item.id === packId);
    if (isEditorial(record)) {
      const article = record.payload.articles.find(item => item.slug === itemId);
      if (article) rows.push({ key, to: `/taman/${packId}/${itemId}`, title: article.name, from: record.manifest.title.id });
    } else if (isSourcePack(record) && record.info.kind === 'hadith-collection') {
      const item = (record.payload as HadithPayload).items.find(row => row.id === itemId);
      if (item) rows.push({ key, to: `/taman/${packId}/${itemId}`, title: item.title, from: record.info.title });
    }
  }
  return rows;
}

/** Entries the reader saved, listed only when the pack that holds them is installed. */
export default function TamanSaved() {
  const { lang } = useWorkspace();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    let current = true;
    const refresh = () => { const saved = savedTamanEntries(); if (!saved.length) { setRows([]); return; } void listRecords().then(records => { if (current) setRows(resolve(records, saved)); }).catch(() => { if (current) setRows([]); }); };
    refresh();
    document.addEventListener('sela:personal', refresh);
    return () => { current = false; document.removeEventListener('sela:personal', refresh); };
  }, []);
  if (!rows.length) return null;
  return <section className="taman-saved" aria-labelledby="taman-saved-title">
    <Title id="taman-saved-title" order={2}>{copy(lang, 'Saved', 'Tersimpan')}</Title>
    <ul className="taman-saved-list">{rows.map(row => <li key={row.key}><Link to={row.to}><strong>{row.title}</strong><Text component="span" size="xs">{row.from}</Text></Link></li>)}</ul>
  </section>;
}
