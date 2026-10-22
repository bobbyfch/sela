import { useEffect, useRef, useState } from 'react';
import { ActionIcon, Button, Group, Text, Textarea, Title } from '@mantine/core';
import { Quote, Trash2 } from 'lucide-react';
import { copy, useWorkspace } from '../../workspace.tsx';
import { addReadingQuote, readingNote, readingQuotes, removeReadingQuote, setReadingNote, type ReadingQuote } from './readings-state.ts';

const selectedText = (): string => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return '';
  const container = document.querySelector('.readings-screen .faith-reader-content');
  return container && container.contains(selection.anchorNode) && container.contains(selection.focusNode) ? selection.toString().trim() : '';
};

export default function EntryTools({ packId, itemId }: { packId: string; itemId: string }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [note, setNote] = useState(() => readingNote(packId, itemId));
  const [quotes, setQuotes] = useState<ReadingQuote[]>(() => readingQuotes(packId, itemId));
  const [selection, setSelection] = useState('');
  const [status, setStatus] = useState('');
  const timer = useRef<number>(0);

  useEffect(() => {
    setNote(readingNote(packId, itemId));
    setQuotes(readingQuotes(packId, itemId));
    setStatus('');
  }, [packId, itemId]);

  useEffect(() => {
    const update = () => setSelection(selectedText());
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const saveNote = (value: string) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setReadingNote(packId, itemId, value); setStatus(t('Saved on this device', 'Tersimpan di perangkat ini')); }, 500);
  };

  const keepSelection = () => {
    addReadingQuote(packId, itemId, selection);
    setQuotes(readingQuotes(packId, itemId));
    window.getSelection()?.removeAllRanges();
    setSelection('');
  };

  return <section className="readings-tools" aria-labelledby={`readings-tools-${itemId}`}>
    <Title id={`readings-tools-${itemId}`} order={3}>{t('Your notes', 'Catatanmu')}</Title>
    <Textarea
      label={t('Note for this entry', 'Catatan untuk bagian ini')}
      description={t('Kept on this device and included in your backup.', 'Tersimpan di perangkat ini dan ikut dalam cadanganmu.')}
      autosize minRows={2} maxRows={10} maxLength={4000}
      value={note}
      onChange={event => { setNote(event.currentTarget.value); setStatus(''); saveNote(event.currentTarget.value); }}
    />
    <Text size="xs" role="status" className="readings-tools-status">{status}</Text>
    <Group gap="xs" className="readings-quote-bar">
      <Button variant="default" leftSection={<Quote size={16} aria-hidden="true" />} disabled={!selection} onPointerDown={event => event.preventDefault()} onClick={keepSelection}>{t('Save selected text as a quote', 'Simpan teks terpilih sebagai kutipan')}</Button>
      {!selection && <Text size="xs" c="dimmed">{t('Select some text above first.', 'Pilih teks di atas lebih dulu.')}</Text>}
    </Group>
    {quotes.length > 0 && <ul className="readings-quotes" aria-label={t('Saved quotes', 'Kutipan tersimpan')}>
      {quotes.map(quote => <li key={quote.at}>
        <blockquote>{quote.text}</blockquote>
        <ActionIcon variant="subtle" color="red" size={44} aria-label={t('Remove this quote', 'Hapus kutipan ini')} onClick={() => { removeReadingQuote(quote); setQuotes(readingQuotes(packId, itemId)); }}><Trash2 size={16} /></ActionIcon>
      </li>)}
    </ul>}
  </section>;
}
