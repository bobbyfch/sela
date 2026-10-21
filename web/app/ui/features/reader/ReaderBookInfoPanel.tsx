import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, SimpleGrid, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { Check, Pencil, X } from 'lucide-react';
import type { LibraryBook } from '../../../../../app/library/models.ts';
import type { BookMetadata } from '../../../../../src/public-api.ts';

const fields: [keyof BookMetadata, string, string, number][] = [
  ['title', 'Title', 'Judul', 500], ['author', 'Author', 'Penulis', 500], ['year', 'Publication year', 'Tahun terbit', 20],
  ['publisher', 'Publisher', 'Penerbit', 500], ['language', 'Language', 'Bahasa', 100], ['isbn', 'ISBN', 'ISBN', 100],
  ['identifier', 'Identifier', 'Identitas', 500], ['series', 'Series', 'Seri', 300], ['edition', 'Edition', 'Edisi', 300],
  ['subjects', 'Subjects', 'Topik', 1000], ['rights', 'Rights', 'Hak penggunaan', 1000],
];

export function ReaderBookInfoPanel({ book, reader, lang, onSave }: { book: LibraryBook; reader: any; lang: 'en' | 'id'; onSave: (metadata: BookMetadata) => Promise<void> }) {
  const initial = useMemo(() => ({ ...book.metadata, title: book.metadata?.title || book.name }), [book.id, book.metadata, book.name]);
  const [values, setValues] = useState<BookMetadata>(initial);
  const [description, setDescription] = useState(initial.description || '');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [pageCount, setPageCount] = useState(book.total || 0);
  const [currentPage, setCurrentPage] = useState(() => Math.max(1, Number(reader.currentPage?.()) || 1));
  const t = (en: string, id: string) => lang === 'id' ? id : en;

  useEffect(() => {
    let active = true;
    void reader.getMetadata().then((metadata: BookMetadata) => {
      if (!active) return;
      setValues(current => ({ ...metadata, ...current, title: current.title || book.name }));
      setPageCount(Number(metadata.pageCount) || reader.totalPages || book.total || 0);
    }).catch(() => {});
    return () => { active = false; };
  }, [reader, book.id]);

  useEffect(() => {
    const refreshPage = () => setCurrentPage(Math.max(1, Number(reader.currentPage?.()) || 1));
    refreshPage();
    reader.addEventListener('pagechange', refreshPage);
    return () => reader.removeEventListener('pagechange', refreshPage);
  }, [reader]);

  const refreshReaderInfo = async () => {
    try { const metadata = await reader.getMetadata(); setPageCount(Number(metadata.pageCount) || reader.totalPages || pageCount); }
    catch { setPageCount(reader.totalPages || pageCount); }
  };
  const save = async () => {
    setBusy(true); setStatus('');
    try {
      const clean: BookMetadata = { ...values, title: (values.title || book.name).trim().slice(0, 500), description: description.trim().slice(0, 4000) };
      for (const [key] of fields) { const value = clean[key]; if (typeof value === 'string') clean[key] = value.trim().slice(0, fields.find(field => field[0] === key)?.[3] || 500) as never; }
      await onSave(clean); setEditing(false); setStatus(t('Book details saved on this device.', 'Detail buku tersimpan di perangkat ini.'));
    } catch (reason) { setStatus(reason instanceof Error ? reason.message : t('Book details could not be saved.', 'Detail buku belum dapat disimpan.')); }
    finally { setBusy(false); }
  };

  return <Stack className="reader-tool-section" gap="md" key={book.id}>
    <div><Text fw={650}>{t('Book information', 'Informasi buku')}</Text><Text size="xs" c="dimmed">{t('Metadata is stored with this book on this device.', 'Metadata tersimpan bersama buku di perangkat ini.')}</Text></div>
    {editing ? <>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">{fields.map(([key, en, id, maxLength]) => <TextInput key={key} label={t(en, id)} value={String(values[key] || '')} maxLength={maxLength} onChange={event => setValues(current => ({ ...current, [key]: event.currentTarget.value }))} />)}</SimpleGrid>
      <Textarea label={t('Description', 'Deskripsi')} value={description} maxLength={4000} minRows={4} autosize onChange={event => setDescription(event.currentTarget.value)} />
      <div className="reader-info-actions"><Button leftSection={<Check size={15} />} onClick={() => void save()} loading={busy}>{t('Save details', 'Simpan detail')}</Button><Button variant="default" leftSection={<X size={15} />} onClick={() => { setValues(initial); setDescription(initial.description || ''); setEditing(false); }}>{t('Cancel', 'Batal')}</Button></div>
    </> : <>
      <dl className="reader-book-info-list">{fields.map(([key, en, id]) => { const value = values[key]; return value ? <div key={key}><dt>{t(en, id)}</dt><dd>{String(value)}</dd></div> : null; })}{description.trim() && <div><dt>{t('Description', 'Deskripsi')}</dt><dd>{description}</dd></div>}<div><dt>{t('File', 'Berkas')}</dt><dd>{(book.format || 'book').toUpperCase()} · {pageCount || book.total || '—'} {t('pages / chapters', 'halaman / bab')}</dd></div><div><dt>{t('File size', 'Ukuran berkas')}</dt><dd>{(book.size / 1048576).toFixed(book.size >= 1048576 ? 1 : 2)} MiB</dd></div><div><dt>{t('Reading position', 'Posisi baca')}</dt><dd>{currentPage}{pageCount || book.total ? ` / ${pageCount || book.total}` : ''}</dd></div></dl>
      <Button variant="default" leftSection={<Pencil size={15} />} onClick={() => setEditing(true)}>{t('Edit information', 'Edit informasi')}</Button>
      <Button variant="subtle" size="compact-sm" onClick={() => void refreshReaderInfo()}>{t('Refresh file details', 'Muat ulang detail berkas')}</Button>
    </>}
    {status && <Alert color="gray" variant="light" role="status">{status}</Alert>}
  </Stack>;
}
