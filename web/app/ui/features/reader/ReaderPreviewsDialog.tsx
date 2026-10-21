import { useEffect, useMemo, useRef, useState } from 'react';
import { ActionIcon, Badge, Button, Group, Modal, ScrollArea, SegmentedControl, Text, TextInput } from '@mantine/core';
import { Bookmark, ChevronLeft, ChevronRight, LoaderCircle, Search } from 'lucide-react';
import type { ReaderContentItem } from '../../../../../src/public-api.ts';

type PreviewKind = 'pdf' | 'text' | 'page';

function PreviewCard({ reader, page, kind, title, current, marked, lang, onOpen }: {
  reader: any; page: number; kind: PreviewKind; title?: string; current: boolean; marked: boolean; lang: 'en' | 'id'; onOpen: (page: number) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [url, setUrl] = useState('');
  const [snippet, setSnippet] = useState('');
  const [loading, setLoading] = useState(kind === 'pdf' || kind === 'text');
  const [failed, setFailed] = useState(false);
  const t = (en: string, id: string) => lang === 'id' ? id : en;

  useEffect(() => {
    let live = true;
    let objectUrl = '';
    let requested = false;
    const load = async () => {
      if (requested || !live) return;
      requested = true;
      try {
        if (kind === 'pdf') {
          const blob: Blob | null = await reader.getPageThumbnail(page, 210);
          if (!blob) throw new Error('Thumbnail unavailable');
          objectUrl = URL.createObjectURL(blob);
          if (live) setUrl(objectUrl);
        } else if (kind === 'text') {
          const text = await reader.getText(page);
          if (live) setSnippet(String(text || '').replace(/\s+/gu, ' ').trim().slice(0, 260));
        }
      } catch (error) {
        if ((error as Error)?.name !== 'AbortError' && live) setFailed(true);
      } finally { if (live) setLoading(false); }
    };
    const target = ref.current;
    if (!target) return;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); void load(); } }, { rootMargin: '180px' });
      observer.observe(target);
      return () => { live = false; observer.disconnect(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }
    void load();
    return () => { live = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [reader, page, kind]);

  return <button ref={ref} type="button" className={`reader-preview-card${current ? ' is-current' : ''}`} aria-current={current ? 'page' : undefined} aria-label={`${t('Open page', 'Buka halaman')} ${page}${title ? ` · ${title}` : ''}`} onClick={() => onOpen(page)}>
    <span className={`reader-preview-art reader-preview-${kind}`}>
      {url ? <img src={url} alt="" loading="lazy" /> : snippet ? <span className="reader-preview-excerpt">{snippet}</span> : loading ? <LoaderCircle className="spin" size={18} aria-label={t('Preparing preview', 'Menyiapkan pratinjau')} /> : <span className="reader-preview-fallback">{failed ? t('Preview unavailable', 'Pratinjau tidak tersedia') : title || t('Page', 'Halaman')}</span>}
      {marked && <Badge className="reader-preview-bookmark" size="xs" leftSection={<Bookmark size={11} />}>{t('Saved', 'Ditandai')}</Badge>}
    </span>
    <span className="reader-preview-caption"><strong>{title || `${t('Page', 'Halaman')} ${page}`}</strong><small>{page === reader.currentPage() ? t('Current position', 'Posisi sekarang') : ''}</small></span>
  </button>;
}

export function ReaderPreviewsDialog({ opened, onClose, reader, format, lang }: { opened: boolean; onClose: () => void; reader: any; format: string; lang: 'en' | 'id' }) {
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [contents, setContents] = useState<ReaderContentItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [start, setStart] = useState(1);
  const [query, setQuery] = useState('');
  const t = (en: string, id: string) => lang === 'id' ? id : en;
  const textBook = ['epub', 'txt', 'md', 'html', 'fb2', 'docx', 'odt'].includes(String(format).toLowerCase());
  const kind: PreviewKind = textBook ? 'text' : String(format).toLowerCase() === 'pdf' ? 'pdf' : 'page';
  const windowSize = total > 160 ? 48 : Math.max(1, total);

  useEffect(() => {
    if (!opened) return;
    const refresh = () => { const page = reader.currentPage() || 1; setCurrent(page); setTotal(reader.totalPages || 0); setBookmarks(reader.getBookmarks()); };
    refresh();
    void reader.getContents().then((items: ReaderContentItem[]) => setContents(items)).catch(() => setContents([]));
    reader.addEventListener('pagechange', refresh);
    reader.overlay?.addEventListener('sela:bookmarks', refresh);
    return () => { reader.removeEventListener('pagechange', refresh); reader.overlay?.removeEventListener('sela:bookmarks', refresh); };
  }, [opened, reader]);

  useEffect(() => {
    if (total <= 160) { setStart(1); return; }
    setStart(Math.max(1, Math.min(total - windowSize + 1, current - Math.floor(windowSize / 2))));
  }, [current, total, windowSize]);

  const titleByPage = useMemo(() => new Map<number, string>(contents.map(item => [item.page, item.title] as const)), [contents]);
  const visiblePages = useMemo(() => {
    const end = Math.min(total, start + windowSize - 1);
    const pages = Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
    const filtered = filter === 'bookmarks' ? pages.filter(page => bookmarks.includes(page)) : pages;
    const needle = query.trim().toLocaleLowerCase();
    return needle ? filtered.filter(page => `${page} ${titleByPage.get(page) || ''}`.toLocaleLowerCase().includes(needle)) : filtered;
  }, [start, total, windowSize, bookmarks, filter, query, titleByPage]);

  const jump = (page: number) => { reader.goTo(page); onClose(); };
  const seek = (value: string) => { const page = Number(value); if (Number.isInteger(page) && page >= 1 && page <= total) { setStart(Math.max(1, Math.min(total - windowSize + 1, page - Math.floor(windowSize / 2)))); setCurrent(page); reader.goTo(page); onClose(); } };
  const maxStart = Math.max(1, total - windowSize + 1);

  return <Modal className="reader-previews-modal" opened={opened} onClose={onClose} centered size="min(980px, calc(100vw - 28px))" fullScreen={window.matchMedia('(max-width: 48em)').matches} title={t('Pages & bookmarks', 'Halaman & penanda')} overlayProps={{ backgroundOpacity: 0.5, blur: 12 }}>
    <div className="reader-previews-tools">
      <TextInput className="reader-preview-search" value={query} onChange={event => setQuery(event.currentTarget.value)} placeholder={t('Find a chapter or page', 'Cari bab atau halaman')} leftSection={<Search size={15} />} aria-label={t('Find a chapter or page', 'Cari bab atau halaman')} />
      <SegmentedControl value={filter} onChange={setFilter} data={[{ value: 'all', label: t('All pages', 'Semua halaman') }, { value: 'bookmarks', label: `${t('Bookmarks', 'Penanda')} · ${bookmarks.length}` }]} />
    </div>
    {total > 160 && <Group className="reader-preview-range" justify="space-between">
      <Button variant="default" size="compact-sm" leftSection={<ChevronLeft size={14} />} disabled={start <= 1} onClick={() => setStart(value => Math.max(1, value - windowSize))}>{t('Earlier pages', 'Halaman sebelumnya')}</Button>
      <Text size="xs" c="dimmed">{start}–{Math.min(total, start + windowSize - 1)} / {total}</Text>
      <Button variant="default" size="compact-sm" rightSection={<ChevronRight size={14} />} disabled={start >= maxStart} onClick={() => setStart(value => Math.min(maxStart, value + windowSize))}>{t('Later pages', 'Halaman berikutnya')}</Button>
    </Group>}
    <ScrollArea className="reader-previews-scroll" type="auto">
      {visiblePages.length ? <div className="reader-previews-grid">{visiblePages.map(page => <PreviewCard key={page} reader={reader} page={page} kind={kind} title={titleByPage.get(page)} current={page === current} marked={bookmarks.includes(page)} lang={lang} onOpen={jump} />)}</div> : <div className="reader-previews-empty"><Text>{filter === 'bookmarks' ? t('No bookmarks in this range.', 'Tidak ada penanda di rentang ini.') : t('No matching pages.', 'Tidak ada halaman yang cocok.')}</Text><TextInput type="number" min={1} max={total || undefined} placeholder={t('Page number', 'Nomor halaman')} aria-label={t('Jump to page', 'Lompat ke halaman')} onKeyDown={event => { if (event.key === 'Enter') seek(event.currentTarget.value); }} /></div>}
    </ScrollArea>
    <div className="reader-preview-footer"><Text size="xs" c="dimmed">{t(`Page ${current} of ${total || '…'}`, `Halaman ${current} dari ${total || '…'}`)}</Text><TextInput className="reader-preview-jump" type="number" min={1} max={total || undefined} placeholder={t('Go to page', 'Ke halaman')} aria-label={t('Go to page', 'Ke halaman')} onKeyDown={event => { if (event.key === 'Enter') seek(event.currentTarget.value); }} /></div>
  </Modal>;
}
