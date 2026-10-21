import { useState } from 'react';
import { Badge, Button, Card, Group, Text, Title } from '@mantine/core';
import { ArrowDownToLine, BookOpen, LoaderCircle } from 'lucide-react';
import { importBook, writeBook } from '../../../../../app/library/storage.ts';
import type { BookMetadata } from '../../../../../src/public-api.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { useNavigate } from 'react-router';

const title = 'Yang Tidak Ikut Pulang';
const metadata: BookMetadata = {
  title, author: 'Bobby Fajar Christian', year: '2026', publisher: 'Sela · sample edition', language: 'id', pageCount: 50,
  description: 'A return to an old house, a recording that should not exist, and the people left between memory and distance.',
  rights: 'CC BY 4.0',
};
export function SelaSampleCard() {
  const { lang, store, announce } = useWorkspace();
  const navigate = useNavigate();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [busy, setBusy] = useState(false);
  const existing = store.books.find(book => book.metadata?.title === title || book.filename === `${title}.pdf`);

  const getSample = async () => {
    const url = new URL('../example/yang-tidak-ikut-pulang.pdf', window.location.href);
    if (url.origin !== window.location.origin) throw new Error(t('The sample must come from this Sela site.', 'Contoh harus berasal dari situs Sela ini.'));
    const response = await fetch(url.href, { credentials: 'same-origin', referrerPolicy: 'same-origin' });
    const size = Number(response.headers.get('content-length'));
    if (!response.ok) throw new Error(t('The sample could not be downloaded.', 'Contoh buku belum dapat diunduh.'));
    if (Number.isFinite(size) && size > 64 * 1024 * 1024) throw new Error(t('This sample exceeds the 64 MB book limit.', 'Ukuran contoh melebihi batas 64 MB.'));
    const blob = await response.blob();
    if (!blob.size || blob.size > 64 * 1024 * 1024) throw new Error(t('The sample file is empty or too large.', 'File contoh kosong atau terlalu besar.'));
    return new File([blob], `${title}.pdf`, { type: 'application/pdf' });
  };

  const getSampleCover = async () => {
    const url = new URL('../example/story/cover.jpg', window.location.href);
    if (url.origin !== window.location.origin) throw new Error(t('The sample cover must come from this Sela site.', 'Sampul contoh harus berasal dari situs Sela ini.'));
    const response = await fetch(url.href, { credentials: 'same-origin', referrerPolicy: 'same-origin' });
    if (!response.ok) throw new Error(t('The sample cover could not be loaded.', 'Sampul contoh belum dapat dimuat.'));
    const blob = await response.blob();
    if (!blob.size || blob.size > 5 * 1024 * 1024 || !blob.type.startsWith('image/')) throw new Error(t('The sample cover is empty or invalid.', 'Sampul contoh kosong atau tidak valid.'));
    return blob;
  };

  const ensureSaved = async () => {
    let book = existing;
    if (!book) {
      const result = await importBook(await getSample());
      book = { ...result.book, name: title, metadata };
    }
    if (!book.cover) {
      try { book = { ...book, cover: await getSampleCover() }; } catch { /* Keep the generated cover fallback if the optional art is unavailable. */ }
      await writeBook(book);
    }
    await store.refresh();
    return book;
  };
  const save = async (open: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const book = await ensureSaved();
      announce(t('Sample downloaded and added to your shelf.', 'Contoh buku diunduh dan disimpan ke rak.'));
      if (open) navigate(`/read/${book.id}`);
    } catch (reason) {
      announce(reason instanceof Error ? reason.message : t('The sample could not be saved.', 'Contoh buku belum bisa disimpan.'));
    } finally { setBusy(false); }
  };

  return <Card className="sela-sample-card" radius="xl" withBorder>
    <div className="sela-sample-cover" aria-hidden="true"><span>SELA · SHORT FICTION</span><strong>Yang Tidak<br />Ikut Pulang</strong><i /><small>BOBBY FAJAR CHRISTIAN</small></div>
    <div className="sela-sample-copy">
      <Text className="page-eyebrow">{t('A PLACE TO BEGIN', 'MULAI DARI SINI')}</Text>
      <Title order={2}>{title}</Title>
      <Text>{t('A return to an old house, a recording that should not exist, and the people left between memory and distance.', 'Kepulangan ke rumah lama, sebuah rekaman yang seharusnya tidak ada, dan orang-orang yang tertinggal di antara ingatan dan jarak.')}</Text>
      <Group gap="xs"><Badge variant="light" color="quill">{t('50 pages', '50 halaman')}</Badge><Badge variant="light" color="quill">PDF</Badge><Badge variant="light" color="quill">CC BY 4.0</Badge></Group>
      <Group className="sela-sample-actions" gap="xs"><Button leftSection={busy ? <LoaderCircle className="spin" size={16} /> : <BookOpen size={16} />} loading={busy} onClick={() => void save(true)}>{existing ? t('Read sample', 'Baca contoh') : t('Download & read sample', 'Unduh & baca contoh')}</Button><Button variant="default" leftSection={<ArrowDownToLine size={15} />} loading={busy} disabled={!!existing} onClick={() => void save(false)}>{existing ? t('Already on shelf', 'Sudah ada di rak') : t('Download & add to shelf', 'Unduh & simpan ke rak')}</Button></Group>
    </div>
  </Card>;
}
