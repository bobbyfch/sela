import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ActionIcon, Group, Slider, Text, Tooltip } from '@mantine/core';
import { ArrowDownToLine, ArrowLeft, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Expand, Grid2X2, Moon, Settings2, Sun } from 'lucide-react';

export function ReaderChrome({ reader, title, author, lang, appearance, onToggleAppearance, onBack, onOpenTools, onOpenPreviews, onCaptureSelection }: {
  reader: any; title: string; author?: string; lang: 'en' | 'id'; appearance: 'light' | 'dark' | 'oled'; onToggleAppearance: () => void; onBack: () => void; onOpenTools: () => void; onOpenPreviews: () => void; onCaptureSelection?: (text: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [draft, setDraft] = useState('1');
  const [fullscreen, setFullscreen] = useState(false);
  const t = (en: string, id: string) => lang === 'id' ? id : en;

  useEffect(() => {
    const refresh = () => {
      const current = Math.max(1, reader.currentPage() || 1);
      setPage(current); setDraft(String(current)); setPages(reader.totalPages || 0); setBookmarks(reader.getBookmarks());
    };
    const fullscreenChanged = () => setFullscreen(!!document.fullscreenElement);
    refresh();
    reader.addEventListener('pagechange', refresh);
    reader.overlay?.addEventListener('sela:bookmarks', refresh);
    document.addEventListener('fullscreenchange', fullscreenChanged);
    return () => {
      reader.removeEventListener('pagechange', refresh);
      reader.overlay?.removeEventListener('sela:bookmarks', refresh);
      document.removeEventListener('fullscreenchange', fullscreenChanged);
    };
  }, [reader]);

  const jump = (value: number) => {
    if (Number.isInteger(value) && value >= 1 && value <= pages) reader.goTo(value);
    else setDraft(String(page));
  };
  const submitPage = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); jump(Number(draft)); };
  const toggleBookmark = () => {
    try { setBookmarks(reader.toggleBookmark(page)); } catch { /* Reader page may be changing. */ }
  };
  const action = (label: string, icon: ReactNode, onClick: () => void, pressed?: boolean, onPointerDown?: () => void) => <Tooltip key={label} label={label} withArrow openDelay={800}>
    <ActionIcon className="reader-chrome-action" variant="default" size={40} aria-label={label} aria-pressed={pressed} onPointerDown={onPointerDown} onClick={onClick}>{icon}</ActionIcon>
  </Tooltip>;

  return <>
    <header className="reader-chrome-top glass-surface">
      <Group className="reader-chrome-identity" gap="sm" wrap="nowrap">
        <Tooltip label={t('Back to shelf', 'Kembali ke rak')} withArrow openDelay={800}>
          <ActionIcon className="reader-chrome-action" variant="default" size={40} aria-label={t('Back to shelf', 'Kembali ke rak')} onClick={onBack}><ArrowLeft size={18} /></ActionIcon>
        </Tooltip>
        <div className="reader-chrome-title"><Text fw={650} truncate title={title}>{title}</Text><Text size="xs" c="dimmed" truncate>{author || t('Reading now', 'Sedang dibaca')}</Text></div>
      </Group>
      <Group className="reader-chrome-top-actions" gap={6} wrap="nowrap">
        {action(t('Page previews', 'Pratinjau halaman'), <Grid2X2 size={17} />, onOpenPreviews)}
        {action(t('Reading desk', 'Meja baca'), <Settings2 size={17} />, onOpenTools, undefined, () => onCaptureSelection?.(window.getSelection()?.toString().trim().slice(0, 10000) || ''))}
        {action(appearance === 'light' ? t('Dark mode', 'Mode gelap') : t('Light mode', 'Mode terang'), appearance === 'light' ? <Moon size={17} /> : <Sun size={17} />, onToggleAppearance, appearance !== 'light')}
        {action(t('Download original', 'Unduh berkas asli'), <ArrowDownToLine size={17} />, () => reader.downloadOriginal())}
        {action(fullscreen ? t('Exit fullscreen', 'Keluar dari layar penuh') : t('Fullscreen', 'Layar penuh'), <Expand size={17} />, () => reader.toggleFullscreen(), fullscreen)}
      </Group>
    </header>
    <footer className="reader-chrome-bottom glass-surface">
      <Tooltip label={t('Previous page', 'Halaman sebelumnya')} withArrow openDelay={800}>
        <ActionIcon className="reader-chrome-action reader-page-step" variant="default" size={42} aria-label={t('Previous page', 'Halaman sebelumnya')} disabled={page <= 1} onClick={() => reader.prev()}><ChevronLeft size={19} /></ActionIcon>
      </Tooltip>
      <form className="reader-page-position" onSubmit={submitPage}>
        <input type="number" min={1} max={pages || undefined} value={draft} onChange={event => setDraft(event.currentTarget.value)} onBlur={() => setDraft(String(page))} aria-label={t('Current page', 'Halaman saat ini')} />
        <span aria-hidden="true">/ {pages || '…'}</span>
      </form>
      <Slider className="reader-page-slider" min={1} max={Math.max(1, pages)} step={1} value={page} disabled={!pages} onChange={setPage} onChangeEnd={jump} aria-label={t('Reading position', 'Posisi bacaan')} thumbLabel={String(page)} />
      <Text className="reader-page-progress" size="xs" c="dimmed">{pages ? `${Math.round(page / pages * 100)}%` : '…'}</Text>
      <Tooltip label={bookmarks.includes(page) ? t('Remove bookmark', 'Hapus penanda') : t('Bookmark page', 'Tandai halaman')} withArrow openDelay={800}>
        <ActionIcon className="reader-chrome-action" variant="default" size={42} aria-label={bookmarks.includes(page) ? t('Remove bookmark', 'Hapus penanda') : t('Bookmark page', 'Tandai halaman')} aria-pressed={bookmarks.includes(page)} onClick={toggleBookmark}>{bookmarks.includes(page) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</ActionIcon>
      </Tooltip>
      <Tooltip label={t('Next page', 'Halaman berikutnya')} withArrow openDelay={800}>
        <ActionIcon className="reader-chrome-action reader-page-step" variant="default" size={42} aria-label={t('Next page', 'Halaman berikutnya')} disabled={!!pages && page >= pages} onClick={() => reader.next()}><ChevronRight size={19} /></ActionIcon>
      </Tooltip>
    </footer>
  </>;
}
