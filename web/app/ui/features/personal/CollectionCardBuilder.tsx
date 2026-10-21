import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Checkbox, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import type { LibraryBook } from '../../../../../app/library/models.ts';
import { readPersonal } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

export function CollectionCardBuilder({ books }: { books: LibraryBook[] }) {
  const { lang, store } = useWorkspace();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [collection, setCollection] = useState('desk');
  const [title, setTitle] = useState('');
  const [hideTitles, setHideTitles] = useState(false);
  const [error, setError] = useState('');
  const [personalRevision, setPersonalRevision] = useState(0);
  const t = (en: string, id: string) => copy(lang, en, id);
  const choices = useMemo(() => collection === 'desk'
    ? readPersonal().queue.map(id => books.find(book => book.id === id)).filter((book): book is LibraryBook => !!book)
    : books.filter(book => book.tags?.includes(collection)), [books, collection, personalRevision]);

  useEffect(() => { const sync = () => setPersonalRevision(value => value + 1); document.addEventListener('sela:personal', sync); return () => document.removeEventListener('sela:personal', sync); }, []);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const app = document.querySelector<HTMLElement>('.sela-app') || document.body;
    const styles = getComputedStyle(app);
    const paper = styles.getPropertyValue('--color-paper').trim() || 'transparent';
    const raised = styles.getPropertyValue('--color-paper-raised').trim() || paper;
    const ink = styles.getPropertyValue('--color-ink').trim() || 'currentColor';
    const muted = styles.getPropertyValue('--color-muted').trim() || ink;
    const jacketInk = styles.getPropertyValue('--color-jacket-ink').trim() || ink;
    const jackets = ['--cover-one', '--cover-two', '--cover-three', '--cover-four', '--cover-five', '--cover-six'].map(name => styles.getPropertyValue(name).trim()).filter(Boolean);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = paper; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = ink; context.font = `500 40px ${styles.getPropertyValue('--font-display') || 'Georgia'}`;
    context.fillText((title.trim() || t('My reading shelf', 'Rak bacaku')).slice(0, 36), 36, 58, 468);
    context.fillStyle = muted; context.font = '500 13px system-ui';
    context.fillText(`${choices.length} ${t('books', 'buku')} · SELA BOOKS`, 36, 82);
    const tileW = 136, tileH = 164, gap = 18, cols = 3, startY = 112;
    const visible = choices.slice(0, 9);
    visible.forEach((book, index) => {
      const x = 36 + (index % cols) * (tileW + gap), y = startY + Math.floor(index / cols) * (tileH + 26);
      context.fillStyle = raised; context.fillRect(x, y, tileW, tileH);
      context.strokeStyle = styles.getPropertyValue('--color-rule').trim() || 'transparent'; context.strokeRect(x, y, tileW, tileH);
      if (book.cover) {
        void createImageBitmap(book.cover).then(bitmap => {
          if (cancelled) { bitmap.close(); return; }
          const scale = Math.min((tileW - 12) / bitmap.width, (tileH - 12) / bitmap.height);
          const width = bitmap.width * scale, height = bitmap.height * scale;
          context.drawImage(bitmap, x + (tileW - width) / 2, y + (tileH - height) / 2, width, height); bitmap.close();
        }).catch(() => undefined);
      } else {
        const palette = Math.abs([...book.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 6;
        context.fillStyle = jackets[palette % Math.max(jackets.length, 1)] || raised; context.fillRect(x + 8, y + 8, tileW - 16, tileH - 16);
        context.fillStyle = jacketInk; context.font = '600 12px system-ui';
        const lines = book.name.match(/.{1,18}(?:\s|$)/g)?.slice(0, 5) || [book.name.slice(0, 18)];
        lines.forEach((line, row) => context.fillText(line.trim(), x + 18, y + 48 + row * 17, tileW - 36));
      }
      if (!hideTitles) { context.fillStyle = ink; context.font = '600 11px system-ui'; context.fillText(book.name.slice(0, 22), x, y + tileH + 16, tileW); }
    });
    return () => { cancelled = true; };
  }, [choices, hideTitles, title, lang]);

  const download = () => {
    setError('');
    const canvas = canvasRef.current;
    if (!canvas || !choices.length) { setError(t('Add books to this collection first.', 'Tambahkan buku ke koleksi ini terlebih dahulu.')); return; }
    canvas.toBlob(blob => {
      if (!blob) { setError(t('The image could not be created.', 'Gambar belum dapat dibuat.')); return; }
      const url = URL.createObjectURL(blob), anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'sela-reading-shelf.png'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    }, 'image/png');
  };

  return <Card className="settings-panel personal-tools-card collection-card-builder" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('KEEP A SMALL RECORD', 'SIMPAN KENANGAN KECIL')}</Text><Title order={2}>{t('Collection card', 'Kartu koleksi')}</Title><Text>{t('Make a private, shareable snapshot of a reading desk or one of your collections.', 'Buat gambar koleksi yang bisa kamu simpan atau bagikan.')}</Text></div>
    {error && <Alert color="yellow" role="alert">{error}</Alert>}
    <Stack gap="sm"><Select label={t('Books to include', 'Buku yang disertakan')} value={collection} onChange={value => setCollection(value || 'desk')} data={[{ value: 'desk', label: t('Reading desk', 'Meja baca') }, ...store.collections.map(name => ({ value: name, label: name }))]} allowDeselect={false} /><TextInput label={t('Card title', 'Judul kartu')} value={title} onChange={event => setTitle(event.currentTarget.value)} maxLength={36} /><Checkbox checked={hideTitles} onChange={event => setHideTitles(event.currentTarget.checked)} label={t('Hide book titles for privacy', 'Sembunyikan judul buku demi privasi')} /><Text size="xs" c="dimmed">{t(`${Math.min(choices.length, 9)} of ${choices.length} books appear in the card.`, `Buku yang tampil: ${Math.min(choices.length, 9)} dari ${choices.length}.`)}</Text><Group><Button onClick={download} disabled={!choices.length}>{t('Download PNG', 'Unduh PNG')}</Button></Group></Stack>
    <div className="collection-card-preview"><canvas ref={canvasRef} width={540} height={700} aria-label={t('Collection card preview', 'Pratinjau kartu koleksi')} /></div>
  </Card>;
}
