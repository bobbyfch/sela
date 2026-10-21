import { useEffect, useState } from 'react';
import { Alert, Button, Group, Modal, NumberInput, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { BookMetadata } from '../../../../../src/public-api.ts';
import type { LibraryBook } from '../../../../../app/library/models.ts';
import { editPersonal, readPersonal } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

type LookupResult = { title?: string; author_name?: string[]; first_publish_year?: number; isbn?: string[] };

export function BookNotesDialog({ book, opened, onClose }: { book: LibraryBook; opened: boolean; onClose: () => void }) {
  const { lang, store } = useWorkspace();
  const [later, setLater] = useState('');
  const [review, setReview] = useState('');
  const [quote, setQuote] = useState('');
  const [volume, setVolume] = useState<number | string>('');
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!opened) return;
    const entry = readPersonal().books[book.id];
    setLater(entry?.later || ''); setReview(entry?.review || ''); setQuote(entry?.quote || '');
    setVolume(entry?.volume ?? ''); setLookup(null); setError('');
  }, [book.id, opened]);

  const save = () => {
    setSaving(true); setError('');
    try {
      editPersonal(data => {
        const current = data.books[book.id] || {};
        const next = { ...current, later: later.trim(), review: review.trim(), quote: quote.trim() };
        if (volume !== '' && Number.isFinite(Number(volume))) next.volume = Math.max(0, Math.min(10000, Math.round(Number(volume))));
        else delete next.volume;
        if (!next.later && !next.review && !next.quote && next.volume == null && !Object.keys(next.marks || {}).length && !next.copies?.length) delete data.books[book.id];
        else data.books[book.id] = next;
      });
      notifications.show({ message: copy(lang, 'Book notes saved on this device.', 'Catatan buku tersimpan di perangkat ini.'), color: 'quill' });
      onClose();
    } catch (reason) { setError(reason instanceof Error ? reason.message : copy(lang, 'Notes could not be saved.', 'Catatan belum bisa disimpan.')); }
    finally { setSaving(false); }
  };

  const findMetadata = async () => {
    setLookupBusy(true); setLookup(null); setError('');
    try {
      const term = book.metadata?.isbn || book.name;
      const response = await fetch(`https://openlibrary.org/search.json?limit=1&q=${encodeURIComponent(term)}`, { credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error(copy(lang, 'Open Library is unavailable right now.', 'Open Library sedang tidak tersedia.'));
      if (Number(response.headers.get('content-length')) > 256 * 1024) throw new Error(copy(lang, 'Metadata response is too large.', 'Respons metadata terlalu besar.'));
      const body = await response.text();
      if (body.length > 256 * 1024) throw new Error(copy(lang, 'Metadata response is too large.', 'Respons metadata terlalu besar.'));
      const payload = JSON.parse(body) as { docs?: LookupResult[] };
      if (!payload.docs?.[0]) throw new Error(copy(lang, 'No matching edition was found.', 'Edisi yang cocok tidak ditemukan.'));
      setLookup(payload.docs[0]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : copy(lang, 'Metadata lookup failed.', 'Pencarian metadata gagal.')); }
    finally { setLookupBusy(false); }
  };

  const applyMetadata = async () => {
    if (!lookup) return;
    const current = book.metadata || {};
    const missing: Partial<BookMetadata> = {};
    if (!current.title && lookup.title) missing.title = lookup.title;
    if (!current.author && lookup.author_name?.[0]) missing.author = lookup.author_name.join(', ');
    if (!current.year && lookup.first_publish_year) missing.year = String(lookup.first_publish_year);
    if (!current.isbn && lookup.isbn?.[0]) missing.isbn = lookup.isbn[0];
    if (!Object.keys(missing).length) { setError(copy(lang, 'Your book already has these details.', 'Metadata buku ini sudah terisi.')); return; }
    try {
      await store.patchBook(book.id, { metadata: { ...current, ...missing } });
      notifications.show({ message: copy(lang, 'Missing details added.', 'Metadata yang kosong berhasil ditambahkan.'), color: 'quill' });
      setLookup(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : copy(lang, 'Book details could not be updated.', 'Metadata buku belum bisa diperbarui.')); }
  };

  const text = (en: string, id: string) => copy(lang, en, id);
  return <Modal opened={opened} onClose={onClose} title={text('Book notes', 'Catatan buku')} centered radius="lg" size="lg">
    <Stack>
      <Text size="sm" c="dimmed">{book.name}</Text>
      {error && <Alert color="red" role="alert">{error}</Alert>}
      <Textarea label={text('A note for later', 'Pesan untuk nanti')} value={later} onChange={event => setLater(event.currentTarget.value)} maxLength={4000} minRows={2} autosize />
      <Textarea label={text('Your impression', 'Kesanmu')} value={review} onChange={event => setReview(event.currentTarget.value)} maxLength={4000} minRows={3} autosize />
      <Textarea label={text('Favorite passage', 'Kutipan favorit')} value={quote} onChange={event => setQuote(event.currentTarget.value)} maxLength={4000} minRows={2} autosize />
      <NumberInput label={text('Series volume (optional)', 'Urutan volume seri (opsional)')} value={volume} onChange={setVolume} min={0} max={10000} allowDecimal={false} />
      <Group justify="space-between" align="center">
        <Button variant="subtle" onClick={() => void findMetadata()} loading={lookupBusy}>{text('Look up edition', 'Cari metadata edisi')}</Button>
        <Group><Button variant="default" onClick={onClose}>{text('Cancel', 'Batal')}</Button><Button onClick={save} loading={saving}>{text('Save notes', 'Simpan catatan')}</Button></Group>
      </Group>
      {lookup && <Alert color="quill" title={text('Review before adding', 'Tinjau sebelum menambahkan')}>
        <Stack gap="xs"><Text size="sm">{[lookup.title, lookup.author_name?.join(', '), lookup.first_publish_year, lookup.isbn?.[0]].filter(Boolean).join(' · ')}</Text><Text size="xs" c="dimmed">{text('Only empty metadata fields will be filled.', 'Hanya metadata yang masih kosong yang akan diisi.')}</Text><Button size="compact-sm" variant="default" onClick={() => void applyMetadata()}>{text('Apply missing details', 'Isi metadata yang kosong')}</Button></Stack>
      </Alert>}
    </Stack>
  </Modal>;
}
