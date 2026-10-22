import { useEffect, useState } from 'react';
import { Text, Title } from '@mantine/core';
import { Link } from 'react-router';
import { isProphetPack, isSourcePack, isTextPack, listRecords, type HadithPayload, type PackRecord } from '../../../../../app/library/content-packs.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { allReadingNotes, allReadingQuotes, savedReadingEntries } from './readings-state.ts';

type Row = { key: string; to: string; title: string; from: string };
type Mark = { id: string; to: string; title: string; text: string; kind: 'note' | 'quote' };

function resolve(records: PackRecord[], keys: string[]): Row[] {
  const rows: Row[] = [];
  for (const key of keys) {
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

const snippet = (text: string) => text.length > 140 ? `${text.slice(0, 137)}…` : text;

export default function SavedReadings() {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [rows, setRows] = useState<Row[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);

  useEffect(() => {
    let current = true;
    const refresh = () => {
      const saved = savedReadingEntries();
      const notes = allReadingNotes();
      const quotes = allReadingQuotes();
      const keys = [...new Set([...saved, ...Object.keys(notes), ...quotes.map(quote => quote.key)])];
      if (!keys.length) { setRows([]); setMarks([]); return; }
      listRecords().then(records => {
        if (!current) return;
        const resolved = resolve(records, keys);
        const byKey = new Map(resolved.map(row => [row.key, row]));
        setRows(saved.map(key => byKey.get(key)).filter((row): row is Row => !!row));
        const found: Mark[] = [];
        for (const [key, text] of Object.entries(notes)) { const row = byKey.get(key); if (row) found.push({ id: `note-${key}`, to: row.to, title: row.title, text, kind: 'note' }); }
        for (const quote of quotes) { const row = byKey.get(quote.key); if (row) found.push({ id: `quote-${quote.key}-${quote.at}`, to: row.to, title: row.title, text: quote.text, kind: 'quote' }); }
        setMarks(found);
      }).catch(() => { if (current) { setRows([]); setMarks([]); } });
    };
    refresh();
    document.addEventListener('sela:personal', refresh);
    return () => { current = false; document.removeEventListener('sela:personal', refresh); };
  }, []);

  if (!rows.length && !marks.length) return null;
  return <>
    {rows.length > 0 && <section className="readings-saved" aria-labelledby="readings-saved-title">
      <Title id="readings-saved-title" order={3}>{t('Saved', 'Tersimpan')}</Title>
      <ul className="readings-saved-list">{rows.map(row => <li key={row.key}><Link to={row.to}><strong>{row.title}</strong><Text component="span" size="xs">{row.from}</Text></Link></li>)}</ul>
    </section>}
    {marks.length > 0 && <section className="readings-saved" aria-labelledby="readings-marks-title">
      <Title id="readings-marks-title" order={3}>{t('Notes and quotes', 'Catatan dan kutipan')}</Title>
      <ul className="readings-marks">{marks.map(mark => <li key={mark.id}><Link to={mark.to}><Text component="span" size="xs">{mark.kind === 'note' ? t('Note', 'Catatan') : t('Quote', 'Kutipan')} · {mark.title}</Text><span>{snippet(mark.text)}</span></Link></li>)}</ul>
    </section>}
  </>;
}
