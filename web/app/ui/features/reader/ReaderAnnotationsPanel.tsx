import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, FileButton, Group, Stack, Text, Textarea } from '@mantine/core';
import { Download, Highlighter, Quote, Upload } from 'lucide-react';
import type { ReaderAnnotations } from '../../../../../src/public-api.ts';

function validRecord(value: unknown, totalPages: number, kind: 'notes' | 'highlights') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  if (entries.length > 2000) return false;
  return entries.every(([rawPage, content]) => {
    const page = Number(rawPage);
    if (!Number.isInteger(page) || page < 1 || page > totalPages) return false;
    if (kind === 'notes') return typeof content === 'string' && content.length <= 10000;
    return Array.isArray(content) && content.length <= 100 && content.every(item => typeof item === 'string' && item.length <= 10000);
  });
}

export function ReaderAnnotationsPanel({ reader, title, lang, selectedText = '' }: { reader: any; title: string; lang: 'en' | 'id'; selectedText?: string }) {
  const [page, setPage] = useState(1);
  const [note, setNote] = useState('');
  const [annotations, setAnnotations] = useState<ReaderAnnotations>(() => reader.getAnnotations());
  const [selected, setSelected] = useState(() => selectedText.slice(0, 10000));
  const [status, setStatus] = useState('');
  const t = (en: string, id: string) => lang === 'id' ? id : en;
  const pageHighlights = useMemo(() => annotations.highlights[String(page)] || [], [annotations, page]);

  useEffect(() => {
    const refresh = () => { const current = reader.currentPage(), data = reader.getAnnotations(); setPage(current); setAnnotations(data); setNote(data.notes[String(current)] || ''); setStatus(''); };
    const pageChanged = () => { refresh(); setSelected(''); };
    const selectionChange = () => { const value = window.getSelection()?.toString().trim().slice(0, 10000) || ''; if (value) setSelected(value); };
    refresh(); reader.addEventListener('pagechange', pageChanged); reader.overlay?.addEventListener('sela:annotations', refresh); document.addEventListener('selectionchange', selectionChange);
    return () => { reader.removeEventListener('pagechange', pageChanged); reader.overlay?.removeEventListener('sela:annotations', refresh); document.removeEventListener('selectionchange', selectionChange); };
  }, [reader]);

  const saveNote = (value: string) => {
    setNote(value);
    try { const next = reader.setNote(page, value); setAnnotations(next); setStatus(t('Saved on this device.', 'Tersimpan di perangkat ini.')); }
    catch { setStatus(t('This note could not be saved.', 'Catatan ini belum dapat disimpan.')); }
  };
  const saveHighlight = () => {
    if (!selected) return;
    try { const next = reader.setHighlights(page, [...new Set([...pageHighlights, selected])].slice(0, 100)); setAnnotations(next); setSelected(''); setStatus(t('Passage highlighted.', 'Penggalan disorot.')); }
    catch { setStatus(t('This passage could not be highlighted.', 'Penggalan ini belum dapat disorot.')); }
  };
  const saveQuote = () => { if (selected) { const next = `${note}${note.trim() ? '\n\n' : ''}“${selected}”`.slice(0, 10000); saveNote(next); } };
  const removeHighlight = (index: number) => {
    try { const next = reader.setHighlights(page, pageHighlights.filter((_, item) => item !== index)); setAnnotations(next); }
    catch { setStatus(t('The highlight could not be removed.', 'Sorotan belum dapat dihapus.')); }
  };
  const exportData = () => {
    try {
      const payload = { version: 1, title, marks: reader.getBookmarks(), notes: annotations.notes, highlights: annotations.highlights };
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'sela-reading-notes.json'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(t('Notes and bookmarks exported.', 'Catatan dan penanda diekspor.'));
    } catch { setStatus(t('The reading notes could not be exported.', 'Catatan baca belum dapat diekspor.')); }
  };
  const importData = async (file: File | null) => {
    if (!file) return;
    try {
      if (file.size > 1_048_576) throw new Error(t('The file must be 1 MiB or smaller.', 'Ukuran file maksimal 1 MiB.'));
      const data = JSON.parse(await file.text());
      if (data?.version !== 1 || !Array.isArray(data.marks) || data.marks.length > 2000 || data.marks.some((value: unknown) => !Number.isInteger(value) || Number(value) < 1 || Number(value) > reader.totalPages) || !validRecord(data.notes, reader.totalPages, 'notes') || (data.highlights !== undefined && !validRecord(data.highlights, reader.totalPages, 'highlights'))) throw new Error(t('This notes file is not valid for this book.', 'File catatan ini tidak sesuai atau rusak.'));
      reader.setBookmarks([...new Set([...reader.getBookmarks(), ...data.marks])]);
      const current = reader.getAnnotations();
      for (const [at, value] of Object.entries(data.notes) as [string, string][]) reader.setNote(Number(at), value);
      for (const [at, quotes] of Object.entries(data.highlights || {}) as [string, string[]][]) reader.setHighlights(Number(at), [...new Set([...(current.highlights[at] || []), ...quotes])].slice(0, 100));
      const next = reader.getAnnotations(); setAnnotations(next); setNote(next.notes[String(reader.currentPage())] || ''); setStatus(t('Notes and bookmarks imported.', 'Catatan dan penanda diimpor.'));
    } catch (error) { setStatus(error instanceof Error ? error.message : t('The file could not be imported.', 'File belum dapat diimpor.')); }
  };

  return <Stack className="reader-tool-section" gap="md">
    <div><Text fw={650}>{t('Notes & highlights', 'Catatan & sorotan')}</Text><Text size="xs" c="dimmed">{t(`Page ${page} · changes are saved locally`, `Halaman ${page} · perubahan tersimpan lokal`)}</Text></div>
    <Textarea label={t('Note for this page', 'Catatan untuk halaman ini')} value={note} maxLength={10000} minRows={5} autosize maxRows={12} onChange={event => saveNote(event.currentTarget.value)} />
    {selected ? <Group gap="xs" className="reader-selection-actions"><Button size="compact-sm" variant="default" leftSection={<Quote size={14} />} onMouseDown={event => event.preventDefault()} onClick={saveQuote}>{t('Add selected quote', 'Simpan kutipan pilihan')}</Button><Button size="compact-sm" variant="default" leftSection={<Highlighter size={14} />} onMouseDown={event => event.preventDefault()} onClick={saveHighlight}>{t('Highlight selection', 'Sorot pilihan')}</Button></Group> : <Text size="xs" c="dimmed">{t('Select text in a text book to save it as a quote or highlight.', 'Pilih teks di buku untuk menyimpannya sebagai kutipan atau sorotan.')}</Text>}
    <section className="reader-list-section"><Text size="xs" fw={700} className="reader-list-label">{t('HIGHLIGHTS ON THIS PAGE', 'SOROTAN HALAMAN INI')}</Text>{pageHighlights.length ? <div className="reader-highlight-list">{pageHighlights.map((quote, index) => <div className="reader-highlight-row" key={`${quote}-${index}`}><Text size="sm">{quote}</Text><Button size="compact-xs" variant="subtle" color="gray" onClick={() => removeHighlight(index)}>{t('Remove', 'Hapus')}</Button></div>)}</div> : <Text size="sm" c="dimmed">{t('No saved highlights on this page.', 'Belum ada sorotan tersimpan di halaman ini.')}</Text>}</section>
    <Group gap="xs" className="reader-annotation-actions"><Button variant="default" leftSection={<Download size={15} />} onClick={exportData}>{t('Export notes', 'Ekspor catatan')}</Button><FileButton onChange={file => void importData(file)} accept=".json,application/json">{({ onClick }) => <Button variant="default" leftSection={<Upload size={15} />} onClick={onClick}>{t('Import notes', 'Impor catatan')}</Button>}</FileButton></Group>
    <Text size="xs" c="dimmed">{t('Notes, highlights and bookmarks stay in this browser and are included in reading-notes exports.', 'Catatan, sorotan dan penanda tersimpan di browser ini dan masuk dalam ekspor catatan baca.')}</Text>
    {status && <Alert color="gray" variant="light" role="status">{status}</Alert>}
  </Stack>;
}
