import { useMemo, useState } from 'react';
import { Button, Card, Group, Text, Title } from '@mantine/core';
import { ArrowRight, Shuffle } from 'lucide-react';
import type { LibraryBook } from '../../../../../app/library/models.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

export function RediscoverWidget({ books, onOpen }: { books: LibraryBook[]; onOpen: (book: LibraryBook) => void }) {
  const { lang } = useWorkspace();
  const [round, setRound] = useState(0);
  const book = useMemo(() => {
    if (!books.length) return null;
    const candidates = [...books].sort((a, b) => a.opened - b.opened || a.saved - b.saved);
    const pool = candidates.slice(0, Math.min(candidates.length, Math.max(1, Math.ceil(candidates.length * 0.55))));
    return pool[(round + Math.floor(Date.now() / 86400000)) % pool.length];
  }, [books, round]);
  if (!book) return null;
  return <Card className="rediscover-card" withBorder radius="xl" padding="lg">
    <Group justify="space-between" align="flex-start"><div><Text className="page-eyebrow">{copy(lang, 'A BOOK TO RETURN TO', 'BUKU UNTUK DITEMUI LAGI')}</Text><Title order={3}>{copy(lang, 'Rediscover a book', 'Temukan kembali')}</Title></div><button type="button" className="rediscover-shuffle" onClick={() => setRound(value => value + 1)} aria-label={copy(lang, 'Choose another book', 'Pilih buku lain')}><Shuffle size={15} /></button></Group>
    <button type="button" className="rediscover-book" onClick={() => onOpen(book)} aria-label={copy(lang, `Open ${book.name}`, `Buka ${book.name}`)}>
      <span className="rediscover-jacket" data-format={(book.format || 'book').toLowerCase()}><BookGlyph /><small>{(book.format || 'BOOK').toUpperCase()}</small></span>
      <span className="rediscover-book-copy"><strong>{book.name}</strong><small>{book.metadata?.author || copy(lang, 'From your shelf', 'Dari rak bukumu')}</small><span>{book.completed ? copy(lang, 'Read again', 'Baca lagi') : book.opened ? copy(lang, 'Pick up where you left off', 'Lanjutkan dari halaman terakhir') : copy(lang, 'An unread story on your shelf', 'Cerita yang belum dibaca')}</span></span>
    </button>
    <Button variant="subtle" rightSection={<ArrowRight size={14} />} onClick={() => onOpen(book)}>{copy(lang, 'Open this book', 'Buka buku ini')}</Button>
  </Card>;
}

function BookGlyph() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h6.2A2.8 2.8 0 0 1 13 7.3v13a2.4 2.4 0 0 0-2.4-2.4H4zM20 4.5h-4.2A2.8 2.8 0 0 0 13 7.3v13a2.4 2.4 0 0 1 2.4-2.4H20z" /></svg>; }
