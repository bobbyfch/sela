import { useEffect, useState } from 'react';
import { ActionIcon, Button, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { Bookmark, BookmarkCheck, ChevronRight } from 'lucide-react';
import type { ReaderContentItem } from '../../../../../src/public-api.ts';

export function ReaderContentsPanel({ reader, lang }: { reader: any; lang: 'en' | 'id' }) {
  const [contents, setContents] = useState<ReaderContentItem[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const t = (en: string, id: string) => lang === 'id' ? id : en;

  useEffect(() => {
    let live = true;
    const refresh = () => { if (!live) return; setPage(reader.currentPage()); setBookmarks(reader.getBookmarks()); };
    void reader.getContents().then((items: ReaderContentItem[]) => { if (live) setContents(items); }).catch(() => { if (live) setStatus(t('Contents could not be loaded.', 'Daftar isi belum dapat dimuat.')); });
    refresh();
    reader.addEventListener('pagechange', refresh);
    reader.overlay?.addEventListener('sela:bookmarks', refresh);
    return () => { live = false; reader.removeEventListener('pagechange', refresh); reader.overlay?.removeEventListener('sela:bookmarks', refresh); };
  }, [reader, lang]);

  const toggleCurrent = () => {
    try { setBookmarks(reader.toggleBookmark(page)); setStatus(''); }
    catch { setStatus(t('This page could not be bookmarked.', 'Halaman ini belum dapat ditandai.')); }
  };
  const go = (item: ReaderContentItem) => { try { reader.goToContent(item); setStatus(''); } catch { setStatus(t('That location is unavailable.', 'Lokasi itu tidak tersedia.')); } };
  const remove = (markedPage: number) => { try { setBookmarks(reader.toggleBookmark(markedPage)); } catch { setStatus(t('The bookmark could not be removed.', 'Penanda belum dapat dihapus.')); } };

  return <Stack className="reader-tool-section" gap="md">
    <Group justify="space-between" align="center"><div><Text fw={650}>{t('Contents & bookmarks', 'Daftar isi & penanda')}</Text><Text size="xs" c="dimmed">{t(`Page ${page} of ${reader.totalPages || '…'}`, `Halaman ${page} dari ${reader.totalPages || '…'}`)}</Text></div><Button variant={bookmarks.includes(page) ? 'light' : 'default'} leftSection={bookmarks.includes(page) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />} onClick={toggleCurrent}>{bookmarks.includes(page) ? t('Remove bookmark', 'Hapus penanda') : t('Bookmark page', 'Tandai halaman')}</Button></Group>
    <section className="reader-list-section"><Text size="xs" fw={700} className="reader-list-label">{t('BOOKMARKS', 'PENANDA')}</Text>
      {bookmarks.length ? <div className="reader-bookmark-list">{bookmarks.map(markedPage => <Group key={markedPage} justify="space-between" wrap="nowrap" className="reader-bookmark-row"><Button variant="subtle" size="compact-sm" leftSection={<Bookmark size={14} />} onClick={() => reader.goTo(markedPage)}>{t('Page ', 'Halaman ')}{markedPage}</Button><ActionIcon variant="subtle" color="gray" aria-label={t(`Remove bookmark on page ${markedPage}`, `Hapus penanda halaman ${markedPage}`)} onClick={() => remove(markedPage)}><span aria-hidden="true">×</span></ActionIcon></Group>)}</div> : <Text size="sm" c="dimmed">{t('No bookmarks yet.', 'Belum ada halaman bertanda.')}</Text>}
    </section>
    <section className="reader-list-section"><Text size="xs" fw={700} className="reader-list-label">{t('DOCUMENT CONTENTS', 'DAFTAR ISI DOKUMEN')}</Text>
      {contents.length ? <ScrollArea className="reader-contents-list" type="auto"><div className="reader-content-items">{contents.map((item, index) => <Button key={`${item.page}-${index}-${item.title}`} className="reader-content-item" variant="subtle" justify="space-between" fullWidth style={{ paddingInlineStart: `calc(var(--mantine-spacing-sm) + ${Math.min(item.level, 8) * 14}px)` }} rightSection={<><Text span size="xs" c="dimmed">{item.page}</Text><ChevronRight size={14} /></>} onClick={() => go(item)}>{item.title}</Button>)}</div></ScrollArea> : <Text size="sm" c="dimmed">{t('This book has no embedded contents list.', 'Buku ini tidak memiliki daftar isi bawaan.')}</Text>}
    </section>
    {status && <Text size="sm" role="status" c="red">{status}</Text>}
  </Stack>;
}
