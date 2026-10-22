import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import {
  ActionIcon, Alert, Anchor, Badge, Button, Card, Center, Checkbox,
  Divider, FileButton, Grid, Group, Menu, Modal, Paper, Progress, SegmentedControl,
  Select, SimpleGrid, Skeleton, Slider, Stack, Switch, Text, TextInput, Title, Tooltip,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { notifications } from '@mantine/notifications';
import {
  ArrowDown, ArrowDownToLine, ArrowLeft, ArrowUp, ArrowUpRight, Bookmark, BookOpen, CalendarDays, Check,
  CircleHelp, Clock3, Download, Ellipsis, Grid2X2, Heart, List, LoaderCircle,
  MoreHorizontal, Plus, RefreshCw, Search, Settings2, Share2, Sparkles, Trash2, Upload, X, LibraryBig,
  Undo2,
} from 'lucide-react';
import type { LibraryBook } from '../../../app/library/models.ts';
import type { BookMetadata } from '../../../src/public-api.ts';
import { changeCollection, getAsset, getFile, updateBook, writeBook } from '../../../app/library/storage.ts';
import { searchBooks, acquireBook } from '../../../app/library/book-sources.ts';
import { exportLibrary, restoreLibrary } from '../../../app/library/backup.ts';
import { editPersonal, readPersonal } from '../../../app/library/personal-store.ts';
import { coverPixelsNeedFallback } from '../../../app/library/cover-analysis.ts';
import { VERSION } from '../../../app/library/version.ts';
import { defaultReadingMode, formatDuration, initials, readingStatus, type AppPreferences } from './state.ts';
import { copy, useWorkspace } from './workspace.tsx';
import { loadReaderSdk } from './reader-sdk.ts';

const TamanBacaan = lazy(() => import('./features/taman/TamanBacaan.tsx'));
const ShelfRoom = lazy(() => import('./shelf-room.tsx'));
const CatalogExplorer = lazy(() => import('./features/discovery/CatalogExplorer.tsx').then(module => ({ default: module.CatalogExplorer })));
const LibraryToolsScreen = lazy(() => import('./features/personal/LibraryToolsScreen.tsx').then(module => ({ default: module.LibraryToolsScreen })));
const ReaderToolsDialog = lazy(() => import('./features/reader/ReaderToolsDialog.tsx').then(module => ({ default: module.ReaderToolsDialog })));
const ReaderChrome = lazy(() => import('./features/reader/ReaderChrome.tsx').then(module => ({ default: module.ReaderChrome })));
const ReaderPreviewsDialog = lazy(() => import('./features/reader/ReaderPreviewsDialog.tsx').then(module => ({ default: module.ReaderPreviewsDialog })));
const BookNotesDialog = lazy(() => import('./features/personal/BookNotesDialog.tsx').then(module => ({ default: module.BookNotesDialog })));
const BookNewsWidget = lazy(() => import('./features/home/ActivityFeeds.tsx').then(module => ({ default: module.BookNewsWidget })));
const OnThisDayWidget = lazy(() => import('./features/home/ActivityFeeds.tsx').then(module => ({ default: module.OnThisDayWidget })));
const WaterTracker = lazy(() => import('./features/home/WaterTracker.tsx').then(module => ({ default: module.WaterTracker })));
const FaithReadingWidget = lazy(() => import('./features/home/FaithReadingWidget.tsx').then(module => ({ default: module.FaithReadingWidget })));
const WeatherWidget = lazy(() => import('./features/home/WeatherWidget.tsx').then(module => ({ default: module.WeatherWidget })));
const PrayerTimesWidget = lazy(() => import('./features/home/PrayerTimesWidget.tsx').then(module => ({ default: module.PrayerTimesWidget })));
const IslamicReadingShelf = lazy(() => import('./features/home/IslamicReadingShelf.tsx').then(module => ({ default: module.IslamicReadingShelf })));
const FaithToolsPrompt = lazy(() => import('./features/home/FaithToolsPrompt.tsx').then(module => ({ default: module.FaithToolsPrompt })));
const HomeCalendar = lazy(() => import('./features/home/HomeCalendar.tsx').then(module => ({ default: module.HomeCalendar })));
const SourcedReflectionWidget = lazy(() => import('./features/home/SourcedReflectionWidget.tsx').then(module => ({ default: module.SourcedReflectionWidget })));
const ReadingJournalCard = lazy(() => import('./features/progress/ReadingJournalCard.tsx').then(module => ({ default: module.ReadingJournalCard })));
const SelaSampleCard = lazy(() => import('./features/home/SelaSampleCard.tsx').then(module => ({ default: module.SelaSampleCard })));
const FocusTimerCard = lazy(() => import('./features/home/FocusTimerCard.tsx').then(module => ({ default: module.FocusTimerCard })));
const FocusTimerBadge = lazy(() => import('./features/home/FocusTimerCard.tsx').then(module => ({ default: module.FocusTimerBadge })));
const RediscoverWidget = lazy(() => import('./features/home/RediscoverWidget.tsx').then(module => ({ default: module.RediscoverWidget })));
const AboutSelaCard = lazy(() => import('./features/personal/AboutSelaCard.tsx').then(module => ({ default: module.AboutSelaCard })));

function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="page-header">
    <div className="page-heading-copy">
      {eyebrow && <Text className="page-eyebrow">{eyebrow}</Text>}
      <Title order={1} className="page-title">{title}</Title>
      {description && <Text className="page-description">{description}</Text>}
    </div>
    {action && <div className="page-header-action">{action}</div>}
  </header>;
}

function BookCover({ book, compact = false }: { book: LibraryBook; compact?: boolean }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (!book.cover) { setSrc(''); return; }
    const url = URL.createObjectURL(book.cover);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [book.cover]);
  const palette = Math.abs([...book.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 6;
  const useDesignedFallback = (image: HTMLImageElement) => {
    if (image.naturalWidth < 2 || image.naturalHeight < 2) return true;
    try {
      const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 45;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return false;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return coverPixelsNeedFallback(context.getImageData(0, 0, canvas.width, canvas.height).data);
    } catch { return false; }
  };
  return <div className={`book-cover${compact ? ' is-compact' : ''}${src ? ' has-image' : ''}`} data-jacket={palette}>
    {src ? <img src={src} alt="" loading="lazy" onError={() => setSrc('')} onLoad={event => { if (useDesignedFallback(event.currentTarget)) setSrc(''); }} /> : <div className="jacket-placeholder" aria-hidden="true">
      <span className="jacket-mark"><BookOpen size={compact ? 14 : 18} strokeWidth={1.3} /></span>
      <span className="jacket-title">{book.name}</span>
      {book.metadata?.author && <span className="jacket-author">{book.metadata.author}</span>}
      <span className="jacket-edition">SELA · {(book.format || 'book').toUpperCase()}</span>
    </div>}
  </div>;
}

function BookCard({ book, onOpen, compact = false, selection }: { book: LibraryBook; onOpen: (book: LibraryBook) => void; compact?: boolean; selection?: { selected: boolean; onChange: (selected: boolean) => void } }) {
  const { store, lang } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [queued, setQueued] = useState(() => readPersonal().queue.includes(book.id));
  useEffect(() => {
    const sync = () => setQueued(readPersonal().queue.includes(book.id));
    document.addEventListener('sela:personal', sync);
    return () => document.removeEventListener('sela:personal', sync);
  }, [book.id]);
  const patch = async (values: Partial<LibraryBook>) => {
    setBusy(true);
    try { await store.patchBook(book.id, values); }
    catch (error) { notifications.show({ message: error instanceof Error ? error.message : copy(lang, 'Book could not be updated.', 'Buku belum bisa diperbarui.'), color: 'red' }); }
    finally { setBusy(false); }
  };
  const progress = book.total ? Math.max(0, Math.min(100, (book.progress || 0) / book.total * 100)) : 0;
  return <Card className={`book-card${compact ? ' is-compact' : ''}`} padding="sm" radius="lg" withBorder>
    {selection && <div className="book-selection-chip"><Checkbox checked={selection.selected} onChange={event => selection.onChange(event.currentTarget.checked)} aria-label={copy(lang, `Select ${book.name}`, `Pilih ${book.name}`)} /></div>}
    <button type="button" className="book-cover-button" onClick={() => onOpen(book)} aria-label={copy(lang, `Open ${book.name}`, `Buka ${book.name}`)}>
      <BookCover book={book} compact={compact} />
    </button>
    <div className="book-card-copy">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap={4}>
        <button type="button" className="book-title-button" onClick={() => onOpen(book)}>{book.name}</button>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target><ActionIcon variant="subtle" color="gray" aria-label={copy(lang, 'Book actions', 'Aksi buku')} loading={busy}><MoreHorizontal size={17} /></ActionIcon></Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<Bookmark size={15} />} onClick={() => setNotesOpen(true)}>{copy(lang, 'Book notes & metadata', 'Catatan & metadata buku')}</Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<BookOpen size={15} />} onClick={() => {
              try { editPersonal(data => { data.queue = queued ? data.queue.filter(id => id !== book.id) : [...data.queue, book.id]; }); }
              catch { notifications.show({ message: copy(lang, 'Reading desk could not be saved on this device.', 'Meja baca belum bisa disimpan di perangkat ini.'), color: 'red' }); }
            }}>{queued ? copy(lang, 'Remove from reading desk', 'Hapus dari meja baca') : copy(lang, 'Add to reading desk', 'Tambahkan ke meja baca')}</Menu.Item>
            <Menu.Item leftSection={<Heart size={15} />} onClick={() => void patch({ favorite: !book.favorite })}>{book.favorite ? copy(lang, 'Remove favorite', 'Hapus dari favorit') : copy(lang, 'Add to favorites', 'Tambahkan ke favorit')}</Menu.Item>
            <Menu.Item leftSection={<Check size={15} />} onClick={() => void patch({ completed: !book.completed, didNotFinish: false })}>{book.completed ? copy(lang, 'Mark as unread', 'Tandai belum selesai') : copy(lang, 'Mark as finished', 'Tandai selesai')}</Menu.Item>
            <Menu.Item leftSection={<X size={15} />} onClick={() => void patch({ didNotFinish: !book.didNotFinish, completed: false })}>{book.didNotFinish ? copy(lang, 'Return to shelf', 'Kembalikan ke rak') : copy(lang, 'Did not finish', 'Tidak dilanjutkan')}</Menu.Item>
            <Menu.Item leftSection={<Bookmark size={15} />} onClick={() => void patch({ pinned: !book.pinned })}>{book.pinned ? copy(lang, 'Unpin book', 'Lepas sematan') : copy(lang, 'Pin to top', 'Sematkan di atas')}</Menu.Item>
            {store.collections.length > 0 && <><Menu.Divider /><Menu.Label>{copy(lang, 'Add to collection', 'Tambahkan ke koleksi')}</Menu.Label>{store.collections.slice(0, 10).map(name => <Menu.Item key={name} leftSection={<Bookmark size={14} />} onClick={() => void store.assignCollection(book, name)}>{name}</Menu.Item>)}</>}
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Text className="book-author">{book.metadata?.author || (book.format || 'book').toUpperCase()}</Text>
      <Group justify="space-between" gap={8} className="book-card-meta">
        <Badge variant="light" color="quill" size="sm">{readingStatus(book, lang)}</Badge>
        <Text className="book-format">{(book.format || 'book').toUpperCase()}</Text>
      </Group>
      {book.total ? <div className="book-progress"><Progress value={progress} size="xs" radius="xl" aria-label={`${Math.round(progress)}%`} /><Text>{Math.round(progress)}%</Text></div> : null}
    </div>
    <Suspense fallback={null}><BookNotesDialog book={book} opened={notesOpen} onClose={() => setNotesOpen(false)} /></Suspense>
  </Card>;
}

function openBook(navigate: ReturnType<typeof useNavigate>, book: LibraryBook) {
  navigate(`/read/${book.id}`);
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <Paper className="empty-state" radius="xl" p="xl" withBorder>
    <span className="empty-mark" aria-hidden="true"><BookOpen size={24} strokeWidth={1.4} /></span>
    <Title order={2}>{title}</Title><Text>{body}</Text>{action}
  </Paper>;
}

export function HomeScreen() {
  const { store, preferences, lang } = useWorkspace();
  const navigate = useNavigate();
  const [personal, setPersonal] = useState(() => readPersonal());
  const [backgroundUrl, setBackgroundUrl] = useState('');
  useEffect(() => {
    const refresh = () => setPersonal(readPersonal());
    document.addEventListener('sela:personal', refresh);
    return () => document.removeEventListener('sela:personal', refresh);
  }, []);
  useEffect(() => {
    let current = '';
    let disposed = false;
    const loadBackground = async () => {
      try {
        const blob = await getAsset('home-background');
        if (disposed) return;
        if (current) URL.revokeObjectURL(current);
        current = blob ? URL.createObjectURL(blob) : '';
        setBackgroundUrl(current);
      } catch { if (!disposed) setBackgroundUrl(''); }
    };
    void loadBackground();
    document.addEventListener('sela:background', loadBackground);
    return () => { disposed = true; document.removeEventListener('sela:background', loadBackground); if (current) URL.revokeObjectURL(current); };
  }, []);
  const recent = store.books.filter(book => book.opened).slice(0, 8);
  const current = recent.find(book => !book.completed && !book.didNotFinish) || recent[0];
  const sessions = personal.sessions || [];
  const today = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const recentBooks = store.books.slice(0, 12);
  const readingDesk = personal.queue.map(id => store.books.find(book => book.id === id)).filter((book): book is LibraryBook => Boolean(book));
  const moveDeskBook = (id: string, direction: -1 | 1) => {
    try { editPersonal(data => { const index = data.queue.indexOf(id), next = index + direction; if (index < 0 || next < 0 || next >= data.queue.length) return; [data.queue[index], data.queue[next]] = [data.queue[next], data.queue[index]]; }); }
    catch { notifications.show({ message: copy(lang, 'Reading desk order could not be saved.', 'Urutan meja baca belum bisa disimpan.'), color: 'red' }); }
  };
  const removeDeskBook = (id: string) => {
    try { editPersonal(data => { data.queue = data.queue.filter(item => item !== id); }); }
    catch { notifications.show({ message: copy(lang, 'Book could not be removed from the reading desk.', 'Buku belum bisa dihapus dari meja baca.'), color: 'red' }); }
  };

  return <div className="page-shell home-screen" data-custom-background={backgroundUrl ? 'true' : undefined} data-quiet={personal.quiet ? 'true' : undefined} style={backgroundUrl ? { '--home-user-background': `url("${backgroundUrl}")` } as CSSProperties : undefined}>
    <PageHeader eyebrow={today} title={personal.room || copy(lang, 'A little space for reading.', 'Ruang kecil untuk membaca.')} description={copy(lang, 'Your books, your pace. Pick up where you left off.', 'Kumpulan bukumu, ritmemu. Lanjutkan dari halaman terakhir.')} />
    {current ? <Card className="continue-card" radius="xl" withBorder>
      <div className="continue-art"><BookCover book={current} /></div>
      <div className="continue-copy">
        <Text className="page-eyebrow">{copy(lang, 'PICK UP WHERE YOU LEFT OFF', 'LANJUTKAN BACAAN')}</Text>
        <Title order={2}>{current.name}</Title>
        <Text>{current.metadata?.author || copy(lang, 'A book in your library', 'Buku dari koleksimu')}</Text>
        {current.total ? <div className="continue-progress"><Progress value={Math.min(100, (current.progress || 0) / current.total * 100)} size="sm" radius="xl" /><Text size="sm">{Math.round((current.progress || 0) / current.total * 100)}% · {copy(lang, `page ${current.progress || 1}`, `halaman ${current.progress || 1}`)}</Text></div> : null}
        <Button leftSection={<BookOpen size={17} />} onClick={() => openBook(navigate, current)}>{copy(lang, 'Continue reading', 'Lanjut membaca')}</Button>
      </div>
      <span className="continue-index" aria-hidden="true">01</span>
    </Card> : store.books.length > 0
      ? <EmptyState title={copy(lang, 'Choose your next read.', 'Pilih bacaan berikutnya.')} body={copy(lang, 'Your books are ready on the shelf. Pick one whenever you feel like reading.', 'Buku-bukumu sudah ada di rak. Pilih yang ingin dibaca kapan saja.')} action={<Button leftSection={<BookOpen size={17} />} onClick={() => navigate('/shelf')}>{copy(lang, 'Choose a book', 'Pilih buku')}</Button>} />
      : <EmptyState title={copy(lang, 'Start with a book you love.', 'Mulai dari buku yang kamu suka.')} body={copy(lang, 'Add a book from your device. Sela keeps the file and your reading progress here.', 'Tambahkan buku dari perangkatmu. Sela menyimpan file dan progres bacamu di sini.')} action={<Button leftSection={<Plus size={17} />} onClick={() => document.querySelector<HTMLInputElement>('input[type=file][accept^=".pdf"]')?.click()}>{copy(lang, 'Add your first book', 'Tambahkan buku pertama')}</Button>} />}
    <Suspense fallback={<Skeleton className="home-feature-fallback" height={190} radius="xl" />}><SelaSampleCard /></Suspense>
    {!personal.hidden.includes('timer') && <Suspense fallback={<Skeleton className="home-feature-fallback" height={240} radius="xl" />}><FocusTimerCard books={store.books} /></Suspense>}

    {readingDesk.length > 0 && <section className="section-block reading-desk-section" aria-labelledby="reading-desk-title">
      <div className="section-heading"><div><Text className="page-eyebrow">{copy(lang, 'YOUR NEXT CHAPTERS', 'BACAAN BERIKUTNYA')}</Text><Title id="reading-desk-title" order={2}>{copy(lang, 'Reading desk', 'Meja baca')}</Title></div><Text size="sm" c="dimmed">{copy(lang, `${readingDesk.length} queued`, `${readingDesk.length} buku dalam antrean`)}</Text></div>
      <div className="reading-desk-list">{readingDesk.slice(0, 5).map((book, index) => <Card className="reading-desk-book" key={book.id} withBorder radius="lg" padding="sm">
        <button className="reading-desk-cover" type="button" onClick={() => openBook(navigate, book)} aria-label={copy(lang, `Open ${book.name}`, `Buka ${book.name}`)}><BookCover book={book} compact /></button>
        <div className="reading-desk-copy"><button className="book-title-button" type="button" onClick={() => openBook(navigate, book)}>{book.name}</button><Text className="book-author">{book.metadata?.author || (book.format || 'book').toUpperCase()}</Text><Button className="reading-desk-open" size="compact-sm" variant="light" leftSection={<BookOpen size={14} />} onClick={() => openBook(navigate, book)}>{copy(lang, 'Read next', 'Baca berikutnya')}</Button></div>
        <div className="reading-desk-order"><Tooltip label={copy(lang, 'Move up', 'Geser ke atas')} withArrow><ActionIcon variant="subtle" size={32} disabled={index === 0} aria-label={copy(lang, `Move ${book.name} up`, `Geser ${book.name} ke atas`)} onClick={() => moveDeskBook(book.id, -1)}><ArrowUp size={15} /></ActionIcon></Tooltip><Tooltip label={copy(lang, 'Move down', 'Geser ke bawah')} withArrow><ActionIcon variant="subtle" size={32} disabled={index === readingDesk.length - 1} aria-label={copy(lang, `Move ${book.name} down`, `Geser ${book.name} ke bawah`)} onClick={() => moveDeskBook(book.id, 1)}><ArrowDown size={15} /></ActionIcon></Tooltip><Tooltip label={copy(lang, 'Remove from reading desk', 'Hapus dari meja baca')} withArrow><ActionIcon variant="subtle" size={32} aria-label={copy(lang, `Remove ${book.name} from reading desk`, `Hapus ${book.name} dari meja baca`)} onClick={() => removeDeskBook(book.id)}><X size={15} /></ActionIcon></Tooltip></div>
      </Card>)}</div>
    </section>}

    <section className="home-rails">
      <div className="home-rail-main">
        {recentBooks.length > 0 && <section className="section-block">
          <div className="section-heading"><div><Text className="page-eyebrow">{copy(lang, 'ON YOUR SHELF', 'DI RAKMU')}</Text><Title order={2}>{copy(lang, 'Recently added', 'Baru ditambahkan')}</Title></div><Button variant="subtle" rightSection={<ArrowUpRight size={15} />} onClick={() => navigate('/shelf')}>{copy(lang, 'View shelf', 'Lihat rak')}</Button></div>
          <Carousel className="book-carousel" slideSize={{ base: '84%', xs: '62%', sm: '66%', md: '46%', lg: '42%' }} slideGap="md" withControls={recentBooks.length > 3} controlSize={34} emblaOptions={{ loop: false, dragFree: true, align: 'start' }}>
            {recentBooks.map(book => <Carousel.Slide key={book.id}><BookCard book={book} onOpen={next => openBook(navigate, next)} compact /></Carousel.Slide>)}
          </Carousel>
        </section>}
        {!personal.hidden.includes('rediscover') && <Suspense fallback={<Skeleton height={155} radius="xl" />}><RediscoverWidget books={store.books} onOpen={book => openBook(navigate, book)} /></Suspense>}

        {preferences.widgets.reflection && <Suspense fallback={<Skeleton height={210} radius="xl" />}><SourcedReflectionWidget /></Suspense>}
        {preferences.widgets.faith && <Suspense fallback={<Skeleton height={180} radius="xl" />}><FaithReadingWidget /></Suspense>}
        {preferences.widgets.faith && <Suspense fallback={<Skeleton height={180} radius="xl" />}><IslamicReadingShelf /></Suspense>}
      </div>

      <aside className="home-rail-side">
        {preferences.widgets.calendar && <Suspense fallback={<Skeleton height={320} radius="xl" />}><HomeCalendar sessions={sessions} /></Suspense>}
        {preferences.widgets.water && <Suspense fallback={<Skeleton height={120} radius="xl" />}><WaterTracker /></Suspense>}
        {preferences.widgets.history && <Suspense fallback={<Skeleton height={220} radius="xl" />}><OnThisDayWidget /></Suspense>}
        {preferences.widgets.news && <Suspense fallback={<Skeleton height={220} radius="xl" />}><BookNewsWidget /></Suspense>}
        {(preferences.widgets.faith || preferences.widgets.prayer) && <Suspense fallback={<Skeleton height={170} radius="xl" />}><FaithToolsPrompt /></Suspense>}
        {preferences.widgets.prayer && <Suspense fallback={<Skeleton height={140} radius="xl" />}><PrayerTimesWidget /></Suspense>}
        {preferences.widgets.weather && <Suspense fallback={<Skeleton height={140} radius="xl" />}><WeatherWidget /></Suspense>}
        {!preferences.widgets.weather && preferences.widgets.prayer && personal.faith === 'islam' && <Suspense fallback={null}><WeatherWidget settingsOnly /></Suspense>}
        <Card className="privacy-card" radius="xl" withBorder>
          <span className="privacy-seal"><span className="local-dot" />{copy(lang, 'LOCAL BY DESIGN', 'LOKAL SEJAK AWAL')}</span>
          <Text>{copy(lang, 'Your books are stored in this browser. They are not uploaded to a Sela account.', 'Buku tersimpan di browser ini dan tidak diunggah ke akun Sela.')}</Text>
          <Button variant="subtle" rightSection={<ArrowUpRight size={15} />} onClick={() => navigate('/settings/data')}>{copy(lang, 'Back up your library', 'Cadangkan perpustakaan')}</Button>
        </Card>
      </aside>
    </section>
  </div>;
}

export function ShelfScreen() {
  const { store, lang, globalSearch, preferences, setPreferences } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const collection = new URLSearchParams(location.search).get('collection') || '';
  const [query, setQuery] = useState(globalSearch);
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('recent');
  const [view, setView] = useState<'grid' | 'room' | 'list'>('grid');
  const [modal, setModal] = useState(false);
  const createCollectionTrigger = useRef<HTMLButtonElement>(null);
  const [collectionName, setCollectionName] = useState('');
  const [removing, setRemoving] = useState<LibraryBook | null>(null);
  const [personal, setPersonal] = useState(() => readPersonal());
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false);
  const [bulkCollectionOpen, setBulkCollectionOpen] = useState(false);
  const [bulkCollection, setBulkCollection] = useState('');
  const [removedBatch, setRemovedBatch] = useState<{ book: LibraryBook; file?: Blob }[]>([]);
  const [visibleCount, setVisibleCount] = useState(80);
  useEffect(() => setQuery(globalSearch), [globalSearch]);
  useEffect(() => { const sync = () => setPersonal(readPersonal()); document.addEventListener('sela:personal', sync); return () => document.removeEventListener('sela:personal', sync); }, []);
  const filtered = useMemo(() => {
    let result = [...store.books];
    const q = query.trim().toLocaleLowerCase();
    if (q) result = result.filter(book => `${book.name} ${book.metadata?.author || ''} ${book.tags?.join(' ') || ''}`.toLocaleLowerCase().includes(q));
    if (collection) result = result.filter(book => book.tags?.includes(collection));
    if (status === 'reading') result = result.filter(book => book.opened > 0 && !book.completed && !book.didNotFinish);
    if (status === 'unread') result = result.filter(book => !book.opened && !book.completed && !book.didNotFinish);
    if (status === 'finished') result = result.filter(book => book.completed);
    if (status === 'dnf') result = result.filter(book => book.didNotFinish);
    if (status === 'favorite') result = result.filter(book => book.favorite);
    if (sort === 'title') result.sort((a, b) => a.name.localeCompare(b.name, lang));
    if (sort === 'author') result.sort((a, b) => (a.metadata?.author || '').localeCompare(b.metadata?.author || '', lang));
    if (sort === 'recent') result.sort((a, b) => b.opened - a.opened || b.saved - a.saved);
    if (sort === 'pinned') result.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.saved - a.saved);
    if (sort === 'series') result.sort((a, b) => (a.metadata?.series || a.name).localeCompare(b.metadata?.series || b.name, lang) || (personal.books[a.id]?.volume ?? Number.MAX_SAFE_INTEGER) - (personal.books[b.id]?.volume ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name, lang));
    return result;
  }, [store.books, query, status, sort, collection, lang, personal]);
  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  useEffect(() => { setVisibleCount(80); }, [query, status, sort, collection]);
  useEffect(() => setSelectedIds(ids => ids.filter(id => filtered.some(book => book.id === id))), [filtered]);
  const createCollection = async () => {
    try {
      await store.createCollection(collectionName);
      setCollectionName(''); setModal(false);
    } catch (error) { notifications.show({ message: error instanceof Error ? error.message : copy(lang, 'Collection could not be created.', 'Koleksi belum bisa dibuat.'), color: 'red' }); }
  };
  const removeBook = async () => {
    if (!removing) return;
    try { await store.removeBook(removing); setRemoving(null); notifications.show({ message: copy(lang, 'Book removed from this device.', 'Buku dihapus dari perangkat ini.'), color: 'quill' }); }
    catch (error) { notifications.show({ message: error instanceof Error ? error.message : copy(lang, 'Book could not be removed.', 'Buku belum bisa dihapus.'), color: 'red' }); }
  };
  const toggleSelection = (id: string, selected: boolean) => setSelectedIds(current => selected ? [...new Set([...current, id])] : current.filter(item => item !== id));
  const finishSelection = () => { setSelectionMode(false); setSelectedIds([]); };
  const updateSelected = async (patch: Partial<LibraryBook>) => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map(id => updateBook(id, patch)));
      await store.refresh(); finishSelection();
      notifications.show({ message: copy(lang, 'Selected books updated.', 'Buku terpilih diperbarui.'), color: 'quill' });
    } catch (error) { notifications.show({ message: error instanceof Error ? error.message : copy(lang, 'Selected books could not be updated.', 'Buku terpilih belum bisa diperbarui.'), color: 'red' }); }
  };
  const addSelectedToCollection = async () => {
    const name = bulkCollection.trim();
    if (!name || !selectedIds.length) return;
    try {
      await changeCollection({ action: 'add', name, ids: selectedIds });
      await store.refresh(); setBulkCollectionOpen(false); setBulkCollection(''); finishSelection();
      notifications.show({ message: copy(lang, 'Selected books added to the collection.', 'Buku terpilih ditambahkan ke koleksi.'), color: 'quill' });
    } catch (error) { notifications.show({ message: error instanceof Error ? error.message : copy(lang, 'The collection could not be updated.', 'Koleksi belum bisa diperbarui.'), color: 'red' }); }
  };
  const removeSelected = async () => {
    const chosen = filtered.filter(book => selectedIds.includes(book.id));
    const removed: { book: LibraryBook; file?: Blob }[] = [];
    try {
      for (const book of chosen) {
        const file = await getFile(book.id);
        await writeBook(book, undefined, true);
        removed.push({ book, file });
      }
      setRemovedBatch(removed); await store.refresh(); setBulkRemoveOpen(false); finishSelection();
      notifications.show({ message: copy(lang, `${removed.length} books removed from this device.`, `${removed.length} buku dihapus dari perangkat ini.`), color: 'quill' });
    } catch (error) {
      for (const item of removed) { try { await writeBook(item.book, item.file); } catch { /* Report the original failure; the backup remains available. */ } }
      await store.refresh();
      notifications.show({ message: error instanceof Error ? error.message : copy(lang, 'The selected books could not be removed.', 'Buku terpilih belum bisa dihapus.'), color: 'red' });
    }
  };
  const undoRemovedBatch = async () => {
    try {
      for (const item of removedBatch) await writeBook(item.book, item.file);
      await store.refresh(); setRemovedBatch([]);
      notifications.show({ message: copy(lang, 'Removed books restored to your shelf.', 'Buku yang dihapus dikembalikan ke rak.'), color: 'quill' });
    } catch (error) { notifications.show({ message: error instanceof Error ? error.message : copy(lang, 'The removed books could not be restored.', 'Buku yang dihapus belum bisa dikembalikan.'), color: 'red' }); }
  };
  const statusOptions = [
    { value: 'all', label: copy(lang, 'All books', 'Semua buku') }, { value: 'reading', label: copy(lang, 'Reading', 'Dibaca') },
    { value: 'unread', label: copy(lang, 'Want to read', 'Nanti dibaca') }, { value: 'finished', label: copy(lang, 'Finished', 'Selesai') },
    { value: 'dnf', label: copy(lang, 'Did not finish', 'Tidak dilanjutkan') }, { value: 'favorite', label: copy(lang, 'Favorites', 'Favorit') },
  ];

  return <div className="page-shell shelf-screen">
    <PageHeader eyebrow={copy(lang, 'YOUR PERSONAL LIBRARY', 'PERPUSTAKAAN PRIBADIMU')} title={collection || copy(lang, 'My shelf', 'Rak buku')} description={copy(lang, `${store.books.length} books, kept close at hand.`, `${store.books.length} buku, tersimpan rapi di perangkatmu.`)} action={<Group className="shelf-header-actions"><Button variant="default" onClick={() => { if (selectionMode) finishSelection(); else { setSelectionMode(true); setSelectedIds([]); } }}>{copy(lang, selectionMode ? 'Done selecting' : 'Select books', selectionMode ? 'Selesai memilih' : 'Pilih buku')}</Button><Button ref={createCollectionTrigger} variant="default" leftSection={<Plus size={16} />} onClick={() => setModal(true)}>{copy(lang, 'New collection', 'Koleksi baru')}</Button></Group>} />
    <div className="shelf-toolbar">
      <TextInput className="shelf-search" leftSection={<Search size={16} />} value={query} onChange={event => setQuery(event.currentTarget.value)} placeholder={copy(lang, 'Search titles, authors, collections', 'Cari judul, penulis, koleksi')} aria-label={copy(lang, 'Search your shelf', 'Cari rak buku')} />
      <Select className="shelf-status-select" data={statusOptions} value={status} onChange={value => setStatus(value || 'all')} aria-label={copy(lang, 'Filter by reading status', 'Filter status baca')} allowDeselect={false} />
      <Select className="shelf-sort-select" data={[{ value: 'recent', label: copy(lang, 'Recently opened', 'Terakhir dibuka') }, { value: 'pinned', label: copy(lang, 'Pinned first', 'Sematan di atas') }, { value: 'title', label: copy(lang, 'Title A–Z', 'Judul A–Z') }, { value: 'author', label: copy(lang, 'Author A–Z', 'Penulis A–Z') }, { value: 'series', label: copy(lang, 'Series volume', 'Urutan seri') }]} value={sort} onChange={value => setSort(value || 'recent')} aria-label={copy(lang, 'Sort books', 'Urutkan buku')} allowDeselect={false} />
      <SegmentedControl className="shelf-view-toggle" value={view} onChange={value => setView(value as typeof view)} aria-label={copy(lang, 'Shelf view', 'Tampilan rak')} data={[{ value: 'grid', label: <Grid2X2 size={16} aria-label={copy(lang, 'Grid view', 'Tampilan kisi')} /> }, { value: 'room', label: <BookOpen size={16} aria-label={copy(lang, 'Bookshelf view', 'Tampilan rak 3D')} /> }, { value: 'list', label: <List size={16} aria-label={copy(lang, 'List view', 'Tampilan daftar')} /> }]} />
    </div>
    {selectionMode && <Card className="bulk-selection-panel" withBorder radius="lg" padding="sm">
      <Group justify="space-between" align="center" gap="sm"><Text fw={650}>{selectedIds.length} {copy(lang, 'selected', 'dipilih')}</Text><Group gap="xs"><Button size="compact-sm" variant="subtle" onClick={() => setSelectedIds(visible.map(book => book.id))}>{copy(lang, 'Select all shown', 'Pilih semua yang tampil')}</Button><Button size="compact-sm" variant="subtle" onClick={() => setSelectedIds([])}>{copy(lang, 'Clear', 'Batal pilih')}</Button></Group></Group>
      <Group className="bulk-selection-actions" gap="xs"><Button size="compact-sm" variant="default" disabled={!selectedIds.length} leftSection={<Heart size={14} />} onClick={() => void updateSelected({ favorite: true })}>{copy(lang, 'Favorite', 'Favorit')}</Button><Button size="compact-sm" variant="default" disabled={!selectedIds.length} leftSection={<Check size={14} />} onClick={() => void updateSelected({ completed: true, didNotFinish: false })}>{copy(lang, 'Finished', 'Selesai')}</Button><Button size="compact-sm" variant="default" disabled={!selectedIds.length} leftSection={<X size={14} />} onClick={() => void updateSelected({ didNotFinish: true, completed: false })}>{copy(lang, 'Did not finish', 'Tidak dilanjutkan')}</Button><Button size="compact-sm" variant="default" disabled={!selectedIds.length} leftSection={<Bookmark size={14} />} onClick={() => { setBulkCollection(store.collections[0] || ''); setBulkCollectionOpen(true); }}>{copy(lang, 'Collection', 'Koleksi')}</Button><Button size="compact-sm" color="red" variant="light" disabled={!selectedIds.length} leftSection={<Trash2 size={14} />} onClick={() => setBulkRemoveOpen(true)}>{copy(lang, 'Remove selected', 'Hapus pilihan')}</Button></Group>
    </Card>}
    {removedBatch.length > 0 && <Button className="undo-batch-button" variant="subtle" leftSection={<Undo2 size={15} />} onClick={() => void undoRemovedBatch()}>{copy(lang, 'Undo batch removal', 'Urungkan penghapusan pilihan')}</Button>}
    {store.collections.length > 0 && <div className="collection-chips" aria-label={copy(lang, 'Collections', 'Koleksi')}>
      <button type="button" className={!collection ? 'is-selected' : ''} onClick={() => navigate('/shelf')}>{copy(lang, 'Everything', 'Semua')}</button>
      {store.collections.map(name => <button key={name} type="button" className={collection === name ? 'is-selected' : ''} onClick={() => navigate(`/shelf?collection=${encodeURIComponent(name)}`)}>{name}</button>)}
    </div>}
    {filtered.length ? <>
      {view === 'room' ? <section className="shelf-room-stage">
        <div className="shelf-room-heading"><div><Text className="page-eyebrow">{copy(lang, 'A PLACE FOR YOUR BOOKS', 'TEMPAT UNTUK BUKUMU')}</Text><Title order={2}>{copy(lang, 'The reading shelf', 'Rak bacaan')}</Title></div><Text>{copy(lang, 'Drag gently to look around · choose a book to read', 'Geser perlahan untuk melihat · pilih buku untuk dibaca')}</Text></div>
        <Suspense fallback={<Skeleton className="shelf-room-fallback" radius="lg" />}><ShelfRoom books={visible} finish={preferences.finish} onOpen={book => openBook(navigate, book)} /></Suspense>
        <div className="room-book-index">{visible.slice(0, 16).map((book, index) => <div className="room-book-index-row" key={book.id}>{selectionMode && <Checkbox checked={selectedIds.includes(book.id)} onChange={event => toggleSelection(book.id, event.currentTarget.checked)} aria-label={copy(lang, `Select ${book.name}`, `Pilih ${book.name}`)} />}<button type="button" onClick={() => selectionMode ? toggleSelection(book.id, !selectedIds.includes(book.id)) : openBook(navigate, book)}><span>{String(index + 1).padStart(2, '0')}</span>{book.name}</button></div>)}</div>
      </section> : view === 'list' ? <div className="book-list" role="list">{visible.map(book => <BookListRow key={book.id} book={book} onOpen={next => openBook(navigate, next)} onRemove={() => setRemoving(book)} selection={selectionMode ? { selected: selectedIds.includes(book.id), onChange: value => toggleSelection(book.id, value) } : undefined} />)}</div> : <div className="book-grid" data-density={preferences.density}>{visible.map(book => <div key={book.id} className="book-grid-item"><BookCard book={book} onOpen={next => openBook(navigate, next)} selection={selectionMode ? { selected: selectedIds.includes(book.id), onChange: value => toggleSelection(book.id, value) } : undefined} /><button className="remove-book-link" type="button" onClick={() => setRemoving(book)}>{copy(lang, 'Remove', 'Hapus')}</button></div>)}</div>}
      {view === 'grid' && <div className="shelf-customize-row"><Text size="sm">{copy(lang, 'Shelf density', 'Kerapatan rak')}</Text><Slider className="density-slider" min={1} max={3} step={1} value={preferences.density} onChange={density => setPreferences(value => ({ ...value, density }))} marks={[{ value: 1, label: copy(lang, 'Roomy', 'Lega') }, { value: 3, label: copy(lang, 'Compact', 'Rapat') }]} thumbLabel={copy(lang, 'Book grid density', 'Kerapatan kisi buku')} /></div>}
      {visible.length < filtered.length && <Button className="shelf-load-more" variant="default" onClick={() => setVisibleCount(count => Math.min(filtered.length, count + 80))}>{copy(lang, `More books · ${filtered.length - visible.length} left`, `Buku lainnya · sisa ${filtered.length - visible.length}`)}</Button>}
    </> : <EmptyState title={query || collection || status !== 'all' ? copy(lang, 'No books match this view.', 'Tidak ada buku yang cocok di tampilan ini.') : copy(lang, 'Your shelf is ready.', 'Rak bukumu siap diisi.')} body={query || collection || status !== 'all' ? copy(lang, 'Try another search or clear a filter to see more.', 'Coba kata pencarian lain atau hapus filter.') : copy(lang, 'Add a local book to make this shelf your own.', 'Tambahkan buku dari perangkat untuk mengisi rak ini.')} />}
    <Modal opened={modal} onClose={() => setModal(false)} onExitTransitionEnd={() => createCollectionTrigger.current?.focus()} returnFocus={false} title={copy(lang, 'Create a collection', 'Buat koleksi')} centered radius="lg">
      <Stack><Text>{copy(lang, 'Group books with a name that makes sense to you.', 'Kelompokkan buku dengan nama yang kamu suka.')}</Text><TextInput autoFocus value={collectionName} onChange={event => setCollectionName(event.currentTarget.value)} maxLength={40} label={copy(lang, 'Collection name', 'Nama koleksi')} placeholder={copy(lang, 'e.g. Sunday reading', 'mis. Bacaan akhir pekan')} onKeyDown={event => { if (event.key === 'Enter') void createCollection(); }} /><Group justify="flex-end"><Button variant="default" onClick={() => setModal(false)}>{copy(lang, 'Cancel', 'Batal')}</Button><Button onClick={() => void createCollection()} disabled={!collectionName.trim()}>{copy(lang, 'Create collection', 'Buat koleksi')}</Button></Group></Stack>
    </Modal>
    <Modal opened={bulkCollectionOpen} onClose={() => setBulkCollectionOpen(false)} title={copy(lang, 'Add selected books to a collection', 'Tambahkan buku pilihan ke koleksi')} centered radius="lg">
      <Stack><Text>{copy(lang, 'Choose an existing collection or enter a new name.', 'Pilih koleksi yang ada atau masukkan nama baru.')}</Text><TextInput autoFocus value={bulkCollection} onChange={event => setBulkCollection(event.currentTarget.value)} maxLength={40} label={copy(lang, 'Collection name', 'Nama koleksi')} list="sela-existing-collections" /><datalist id="sela-existing-collections">{store.collections.map(name => <option key={name} value={name} />)}</datalist><Group justify="flex-end"><Button variant="default" onClick={() => setBulkCollectionOpen(false)}>{copy(lang, 'Cancel', 'Batal')}</Button><Button onClick={() => void addSelectedToCollection()} disabled={!bulkCollection.trim() || !selectedIds.length}>{copy(lang, 'Add books', 'Tambahkan buku')}</Button></Group></Stack>
    </Modal>
    <Modal opened={bulkRemoveOpen} onClose={() => setBulkRemoveOpen(false)} title={copy(lang, 'Remove selected books?', 'Hapus buku pilihan?')} centered radius="lg">
      <Stack><Text>{copy(lang, `${selectedIds.length} books and their local files will be removed from this device. You can undo this batch from the shelf afterward.`, `${selectedIds.length} buku beserta file lokalnya akan dihapus dari perangkat ini. Kamu bisa membatalkan penghapusan batch ini dari rak.`)}</Text><Group justify="flex-end"><Button variant="default" onClick={() => setBulkRemoveOpen(false)}>{copy(lang, 'Keep books', 'Simpan buku')}</Button><Button color="red" leftSection={<Trash2 size={15} />} onClick={() => void removeSelected()}>{copy(lang, 'Remove selected', 'Hapus pilihan')}</Button></Group></Stack>
    </Modal>
    <Modal opened={!!removing} onClose={() => setRemoving(null)} title={copy(lang, 'Remove this book?', 'Hapus buku ini?')} centered radius="lg">
      <Stack><Text>{copy(lang, 'The stored file and its reading progress will be removed from this device. This cannot be undone.', 'File dan progres bacanya akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan.')}</Text><Group justify="flex-end"><Button variant="default" onClick={() => setRemoving(null)}>{copy(lang, 'Keep book', 'Simpan buku')}</Button><Button color="red" leftSection={<Trash2 size={16} />} onClick={() => void removeBook()}>{copy(lang, 'Remove book', 'Hapus buku')}</Button></Group></Stack>
    </Modal>
  </div>;
}

function BookListRow({ book, onOpen, onRemove, selection }: { book: LibraryBook; onOpen: (book: LibraryBook) => void; onRemove: () => void; selection?: { selected: boolean; onChange: (selected: boolean) => void } }) {
  const { lang } = useWorkspace();
  return <Paper className={`book-list-row${selection ? ' is-selecting' : ''}`} component="article" withBorder radius="lg" p="sm">
    {selection && <Checkbox checked={selection.selected} onChange={event => selection.onChange(event.currentTarget.checked)} aria-label={copy(lang, `Select ${book.name}`, `Pilih ${book.name}`)} />}
    <button className="list-cover-button" type="button" onClick={() => onOpen(book)}><BookCover book={book} compact /></button>
    <button type="button" className="list-book-title" onClick={() => onOpen(book)}><strong>{book.name}</strong><span>{book.metadata?.author || (book.format || 'book').toUpperCase()}</span></button>
    <Badge variant="light" color="quill">{readingStatus(book, lang)}</Badge><Text className="list-format">{(book.format || 'book').toUpperCase()}</Text>
    <Menu position="bottom-end"><Menu.Target><ActionIcon variant="subtle" color="gray" aria-label={copy(lang, 'Book actions', 'Aksi buku')}><Ellipsis size={17} /></ActionIcon></Menu.Target><Menu.Dropdown><Menu.Item leftSection={<Trash2 size={15} />} color="red" onClick={onRemove}>{copy(lang, 'Remove book', 'Hapus buku')}</Menu.Item></Menu.Dropdown></Menu>
  </Paper>;
}

export function DiscoverScreen() {
  const { lang } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const lens = params.get('lens') === 'taman' ? 'taman' : 'explore';
  const fallback = <div className="page-shell"><Skeleton height={40} width="42%" radius="md" /><Skeleton mt="md" height={160} radius="xl" /><Skeleton mt="md" height={240} radius="xl" /></div>;
  return <>
    <div className="discover-lens">
      <SegmentedControl aria-label={copy(lang, 'Discover view', 'Tampilan Jelajah')} value={lens} onChange={value => setParams(value === 'taman' ? { lens: 'taman' } : {}, { replace: true })} data={[{ label: copy(lang, 'Explore sources', 'Jelajah sumber'), value: 'explore' }, { label: copy(lang, 'Reading garden', 'Taman Bacaan'), value: 'taman' }]} />
    </div>
    <Suspense fallback={fallback}>{lens === 'taman' ? <TamanBacaan /> : <CatalogExplorer />}</Suspense>
  </>;
}

export function ProgressScreen() {
  const { lang, store } = useWorkspace();
  const [period, setPeriod] = useState('7');
  const [personal, setPersonal] = useState(() => readPersonal());
  useEffect(() => {
    const refresh = () => setPersonal(readPersonal());
    document.addEventListener('sela:personal', refresh);
    return () => document.removeEventListener('sela:personal', refresh);
  }, []);
  const span = Number(period);
  const now = new Date();
  const sessions = (personal.sessions || []).filter(session => now.getTime() - session.at < span * 86400000 && session.seconds > 0);
  const totalSeconds = sessions.reduce((sum, session) => sum + session.seconds, 0);
  const daily = Array.from({ length: span === 7 ? 7 : span === 30 ? 10 : 12 }, (_, index) => {
    const steps = span === 7 ? 1 : span === 30 ? 3 : 30;
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (span === 30 ? (9 - index) * steps : span === 365 ? (11 - index) * steps : 6 - index));
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const value = (personal.sessions || []).filter(item => { const d = new Date(item.at); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === key; }).reduce((sum, item) => sum + item.seconds, 0);
    return { date, value };
  });
  const max = Math.max(1, ...daily.map(item => item.value));
  const completed = store.books.filter(book => book.completed).length;
  const currentBooks = store.books.filter(book => book.opened && !book.completed && !book.didNotFinish).length;
  const streakDays = new Set((personal.sessions || []).filter(item => item.seconds > 0).map(item => {
    const date = new Date(item.at); return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }));
  const readingDayKeys = new Set((personal.sessions || []).filter(item => item.seconds > 0).map(item => {
    const date = new Date(item.at); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }));
  const adjacentDay = (first: string, second: string) => { const date = new Date(`${first}T12:00:00`); date.setDate(date.getDate() + 1); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` === second; };
  const orderedReadingDays = [...readingDayKeys].sort();
  let longestStreak = 0, runningStreak = 0, previousDay = '';
  for (const day of orderedReadingDays) { runningStreak = previousDay && adjacentDay(previousDay, day) ? runningStreak + 1 : 1; longestStreak = Math.max(longestStreak, runningStreak); previousDay = day; }
  const todayDate = new Date();
  const todayKey = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(todayDate); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  let currentStreak = 0, streakCursor = readingDayKeys.has(todayKey) ? todayKey : readingDayKeys.has(yesterdayKey) ? yesterdayKey : '';
  while (streakCursor && readingDayKeys.has(streakCursor)) { currentStreak++; const date = new Date(`${streakCursor}T12:00:00`); date.setDate(date.getDate() - 1); streakCursor = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  const dayTotals = new Map<string, number>();
  for (const session of personal.sessions || []) if (session.seconds > 0) { const date = new Date(session.at), key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; dayTotals.set(key, (dayTotals.get(key) || 0) + session.seconds); }
  const bestDaySeconds = Math.max(0, ...dayTotals.values());
  const allTimeSeconds = (personal.sessions || []).reduce((sum, session) => sum + session.seconds, 0);
  const notebookEntries = useMemo(() => collectNotebookEntries(store.books, personal, lang), [store.books, personal, lang]);
  const [notebookQuery, setNotebookQuery] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);
  const matchingNotes = notebookEntries.filter(entry => `${entry.bookName} ${entry.text} ${entry.kind}`.toLocaleLowerCase(lang === 'id' ? 'id-ID' : 'en-US').includes(notebookQuery.trim().toLocaleLowerCase(lang === 'id' ? 'id-ID' : 'en-US')));
  const shownNotes = matchingNotes.slice(0, showAllNotes ? 40 : 6);
  return <div className="page-shell progress-screen">
    <PageHeader eyebrow={copy(lang, 'YOUR READING LIFE', 'PERJALANAN MEMBACAMU')} title={copy(lang, 'A record of showing up.', 'Catatan tentang kebiasaan membaca.')} description={copy(lang, 'Time is counted only while a book is open and this tab is visible.', 'Waktu dihitung saat buku terbuka dan tab ini sedang terlihat.')} />
    <div className="progress-metrics">
      <Metric label={copy(lang, 'All-time reading', 'Total waktu membaca')} value={formatDuration(allTimeSeconds, lang)} note={copy(lang, 'Since your first session', 'Sejak sesi pertamamu')} icon={<Clock3 size={17} />} />
      <Metric label={copy(lang, 'Current streak', 'Streak saat ini')} value={String(currentStreak)} note={copy(lang, 'Days in a row', 'Hari berturut-turut')} icon={<CalendarDays size={17} />} />
      <Metric label={copy(lang, 'Longest streak', 'Streak terpanjang')} value={String(longestStreak)} note={copy(lang, 'Best run of reading days', 'Rangkaian hari membaca terlama')} icon={<Sparkles size={17} />} />
      <Metric label={copy(lang, 'Best day', 'Hari terbaik')} value={formatDuration(bestDaySeconds, lang)} note={copy(lang, 'Most time in one day', 'Waktu terbanyak dalam sehari')} icon={<Clock3 size={17} />} />
      <Metric label={copy(lang, 'In progress', 'Sedang dibaca')} value={String(currentBooks)} note={copy(lang, 'Books you opened', 'Buku yang sudah dibuka')} icon={<BookOpen size={17} />} />
      <Metric label={copy(lang, 'Finished', 'Selesai')} value={String(completed)} note={copy(lang, 'On your shelf', 'Di rakmu')} icon={<Check size={17} />} />
      <Metric label={copy(lang, 'Reading days', 'Hari membaca')} value={String(streakDays.size)} note={copy(lang, 'Days with a session', 'Hari dengan sesi baca')} icon={<CalendarDays size={17} />} />
    </div>
    <Suspense fallback={<Skeleton height={280} radius="xl" />}><ReadingJournalCard books={store.books} sessions={personal.sessions || []} /></Suspense>
    <Card className="reading-chart-card" withBorder radius="xl" padding="lg">
      <div className="section-heading"><div><Text className="page-eyebrow">{copy(lang, 'TIME WITH YOUR BOOKS', 'WAKTU BERSAMA BUKU')}</Text><Title order={2}>{copy(lang, 'Reading sessions', 'Sesi membaca')}</Title></div><SegmentedControl value={period} onChange={setPeriod} aria-label={copy(lang, 'Reading chart period', 'Rentang grafik baca')} data={[{ value: '7', label: copy(lang, '7 days', '7 hari') }, { value: '30', label: copy(lang, '30 days', '30 hari') }, { value: '365', label: copy(lang, '12 months', '12 bulan') }]} /></div>
      {totalSeconds > 0 ? <div className="reading-chart" role="img" aria-label={copy(lang, 'Reading time over the selected period', 'Waktu membaca pada rentang pilihan')}>
        {daily.map(({ date, value }) => <div className="chart-day" key={date.toISOString()}><span className="chart-value">{value >= 60 ? Math.round(value / 60) : ''}</span><div className="chart-track"><span style={{ height: `${value ? Math.max(6, value / max * 100) : 3}%` }} /></div><span className="chart-label">{new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', span === 365 ? { month: 'short' } : { weekday: 'short', day: span === 7 ? undefined : 'numeric' }).format(date)}</span></div>)}
      </div> : <EmptyState title={copy(lang, 'Your first reading session will show up here.', 'Sesi membaca pertamamu akan muncul di sini.')} body={copy(lang, 'Open any book and spend a few quiet minutes with it.', 'Buka buku apa saja dan luangkan waktu sebentar untuk membacanya.')} />}
      <Text className="chart-footnote">{copy(lang, 'Reading time is stored on this device and never inferred while the reader is hidden.', 'Waktu baca tersimpan di perangkat ini dan tidak dihitung saat tab pembaca tersembunyi.')}</Text>
    </Card>
    <section className="section-block"><div className="section-heading"><div><Text className="page-eyebrow">{copy(lang, 'RETURN TO A BOOK', 'KEMBALI KE BUKU')}</Text><Title order={2}>{copy(lang, 'Currently reading', 'Sedang dibaca')}</Title></div></div><div className="book-grid" data-density={2}>{store.books.filter(book => book.opened && !book.completed && !book.didNotFinish).slice(0, 6).map(book => <BookCard key={book.id} book={book} onOpen={next => { window.location.hash = `/read/${next.id}`; }} />)}</div></section>
    <section className="section-block notebook-section" aria-labelledby="notebook-title">
      <div className="section-heading"><div><Text className="page-eyebrow">{copy(lang, 'YOUR MARGINALIA', 'CATATAN BACA')}</Text><Title id="notebook-title" order={2}>{copy(lang, 'Notebook', 'Notebook')}</Title></div><Badge variant="light" color="quill">{matchingNotes.length}</Badge></div>
      <Text className="notebook-intro">{copy(lang, 'Notes, highlights and bookmarked pages stay on this device.', 'Catatan, sorotan dan halaman bertanda tetap tersimpan di perangkat ini.')}</Text>
      {notebookEntries.length > 0 && <TextInput className="notebook-search" value={notebookQuery} onChange={event => { setNotebookQuery(event.currentTarget.value); setShowAllNotes(false); }} placeholder={copy(lang, 'Search your notebook', 'Cari di notebook')} aria-label={copy(lang, 'Search your notebook', 'Cari di notebook')} leftSection={<Search size={15} />} />}
      {shownNotes.length > 0 ? <div className="notebook-list">{shownNotes.map(entry => <Card className="notebook-entry" key={entry.id} withBorder radius="lg" padding="md">
        <Group justify="space-between" gap="sm"><Badge variant="light" color="quill">{copy(lang, entry.kind, entry.kindId)}</Badge>{entry.page && <Text className="notebook-page">{copy(lang, `Page ${entry.page}`, `Halaman ${entry.page}`)}</Text>}</Group>
        <Title order={3}>{entry.bookName}</Title><Text className="notebook-entry-copy">{entry.text}</Text>
        <Button variant="subtle" rightSection={<ArrowUpRight size={14} />} onClick={() => { window.location.hash = `/read/${entry.bookId}`; }}>{copy(lang, 'Open book', 'Buka buku')}</Button>
      </Card>)}</div> : <EmptyState title={copy(lang, notebookQuery ? 'No notes match that search.' : 'Your notebook is ready when you are.', notebookQuery ? 'Tidak ada catatan yang cocok.' : 'Notebook-mu siap menampung catatan.')} body={copy(lang, notebookQuery ? 'Try a shorter phrase or another book title.' : 'Bookmark a page or add a note while reading, and it will appear here.', notebookQuery ? 'Coba kata yang lebih singkat atau judul buku lain.' : 'Tandai halaman atau tulis catatan saat membaca; isinya akan muncul di sini.')} />}
      {matchingNotes.length > shownNotes.length && <Button className="notebook-more" variant="default" onClick={() => setShowAllNotes(true)}>{copy(lang, 'Show more notes', 'Tampilkan catatan lain')}</Button>}
    </section>
  </div>;
}

type NotebookEntry = { id: string; bookId: string; bookName: string; page: string; text: string; kind: string; kindId: string };
function collectNotebookEntries(books: LibraryBook[], personal: ReturnType<typeof readPersonal>, lang: 'id' | 'en'): NotebookEntry[] {
  const entries: NotebookEntry[] = [];
  const read = (key: string, fallback: unknown) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } };
  const add = (book: LibraryBook, page: string, text: unknown, kind: string, kindId: string) => {
    if (typeof text !== 'string' || !text.trim()) return;
    entries.push({ id: `${book.id}:${kind}:${page}:${entries.length}`, bookId: book.id, bookName: book.name, page, text: text.trim(), kind, kindId });
  };
  for (const book of books) {
    const prefix = `sela-library:${book.id}:`;
    const notesValue = read(prefix + 'notes', {}), notes = notesValue && typeof notesValue === 'object' && !Array.isArray(notesValue) ? notesValue as Record<string, unknown> : {};
    const highlightsValue = read(prefix + 'highlights', {}), highlights = highlightsValue && typeof highlightsValue === 'object' && !Array.isArray(highlightsValue) ? highlightsValue as Record<string, unknown> : {};
    const marks = read(prefix + 'marks', []) as unknown[];
    for (const [page, note] of Object.entries(notes)) add(book, page, note, 'Note', 'Catatan');
    for (const [page, highlightsAtPage] of Object.entries(highlights)) if (Array.isArray(highlightsAtPage)) for (const highlight of highlightsAtPage) add(book, page, highlight, 'Highlight', 'Sorotan');
    for (const page of Array.isArray(marks) ? marks : []) if (Number.isInteger(page) && Number(page) > 0) add(book, String(page), personal.books[book.id]?.marks?.[String(page)] || (lang === 'id' ? 'Halaman ditandai untuk nanti.' : 'Page saved for later.'), 'Bookmark', 'Penanda');
    const thoughts = personal.books[book.id];
    if (thoughts) {
      add(book, '', thoughts.later, 'For later', 'Untuk nanti');
      add(book, '', thoughts.review, 'Impression', 'Kesan');
      add(book, '', thoughts.quote, 'Favorite passage', 'Kutipan favorit');
      for (const [page, note] of Object.entries(thoughts.marks || {})) add(book, page, note, 'Bookmark note', 'Catatan penanda');
      for (const copy of thoughts.copies || []) add(book, String(copy.page), copy.text, 'Synced note copy', 'Salinan catatan sinkron');
    }
  }
  return entries.slice(-500).reverse();
}

function Metric({ label, value, note, icon }: { label: string; value: string; note: string; icon: ReactNode }) {
  return <Card className="metric-card" withBorder radius="lg" padding="md"><Group justify="space-between" align="flex-start"><Text>{label}</Text><span className="metric-icon">{icon}</span></Group><Title order={2}>{value}</Title><Text className="metric-note">{note}</Text></Card>;
}

const settingGroups = [
  { key: 'library', icon: LibraryBig, en: 'Library tools', id: 'Alat perpustakaan', subEn: 'Smart shelves, notes, offline checks and more', subId: 'Rak pintar, catatan, cek offline, dan lainnya' },
  { key: 'appearance', icon: Settings2, en: 'Appearance & shelf', id: 'Tampilan & rak', subEn: 'Color, bookcase finish and layout', subId: 'Tema, bahan rak dan tata letak' },
  { key: 'reading', icon: BookOpen, en: 'Reading preferences', id: 'Preferensi baca', subEn: 'Default reader mode and page flow', subId: 'Mode pembaca dan alur halaman' },
  { key: 'data', icon: ArrowDownToLine, en: 'Backup & data', id: 'Cadangan & data', subEn: 'Export a safe copy or restore a shelf', subId: 'Ekspor cadangan atau pulihkan rak' },
];

export function SettingsScreen() {
  const { lang, preferences, setPreferences } = useWorkspace();
  const navigate = useNavigate();
  return <div className="page-shell settings-screen">
    <PageHeader eyebrow={copy(lang, 'MAKE SELA YOURS', 'ATUR SELA SESUKAMU')} title={copy(lang, 'Settings', 'Pengaturan')} description={copy(lang, 'A few thoughtful choices for your reading space.', 'Beberapa pilihan untuk menata ruang bacamu.')} />
    <div className="settings-layout">
      <div className="settings-menu-list">
        {settingGroups.map(({ key, icon: Icon, en, id, subEn, subId }) => <button key={key} className="settings-row" type="button" onClick={() => navigate(`/settings/${key}`)}>
          <span className="settings-row-icon"><Icon size={18} /></span><span className="settings-row-copy"><strong>{copy(lang, en, id)}</strong><small>{copy(lang, subEn, subId)}</small></span><span className="settings-row-arrow"><ArrowUpRight size={16} /></span>
        </button>)}
      </div>
      <Card className="settings-summary" withBorder radius="xl" padding="lg"><Text className="page-eyebrow">{copy(lang, 'THIS DEVICE', 'PERANGKAT INI')}</Text><Title order={2}>{copy(lang, 'Your library stays close.', 'Perpustakaanmu tetap pribadi.')}</Title><Text>{copy(lang, 'Books, notes, bookmarks and reading history live in this browser. Make a backup before clearing site data or changing devices.', 'Buku, catatan, penanda dan riwayat tersimpan di browser ini. Buat cadangan sebelum menghapus data situs atau berpindah perangkat.')}</Text><Button variant="default" leftSection={<Download size={16} />} onClick={() => navigate('/settings/data')}>{copy(lang, 'Back up library', 'Cadangkan perpustakaan')}</Button></Card>
    </div>
    <div className="settings-language-row"><div><strong>{copy(lang, 'Interface language', 'Bahasa antarmuka')}</strong><span>{copy(lang, 'Change the language used across Sela.', 'Ganti bahasa di seluruh Sela.')}</span></div><SegmentedControl value={lang} onChange={value => { if (value === 'id' || value === 'en') setPreferences(current => ({ ...current, language: value })); }} data={[{ value: 'id', label: 'Bahasa' }, { value: 'en', label: 'English' }]} aria-label={copy(lang, 'Interface language', 'Bahasa antarmuka')} /></div>
    <Text className="version-note">Sela Books · {copy(lang, 'Local reader', 'Pembaca lokal')} · {preferences.theme.toUpperCase()}</Text>
    <Suspense fallback={<Skeleton height={220} radius="xl" />}><AboutSelaCard /></Suspense>
  </div>;
}

function UpdateCard({ lang }: { lang: 'id' | 'en' }) {
  const initial = document.getElementById('update-status')?.textContent?.trim() || '';
  const [message, setMessage] = useState(initial);
  const [tone, setTone] = useState<'info' | 'success' | 'error'>('info');
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; tone?: 'info' | 'success' | 'error'; checking?: boolean }>).detail;
      if (typeof detail?.message === 'string') setMessage(detail.message);
      if (detail?.tone) setTone(detail.tone);
      setChecking(Boolean(detail?.checking));
    };
    document.addEventListener('sela:update-status', receive);
    return () => document.removeEventListener('sela:update-status', receive);
  }, []);
  return <Card className="settings-panel update-panel" withBorder radius="xl" padding="lg">
    <Group className="update-panel-heading" justify="space-between" align="flex-start" wrap="nowrap">
      <div><Text className="page-eyebrow">{copy(lang, 'APP & VERSION', 'APP & VERSI')}</Text><Title order={2}>{copy(lang, 'Keep Sela current', 'Perbarui Sela')}</Title></div>
      <Badge className="update-version" variant="default" radius="xl">{VERSION}</Badge>
    </Group>
    <Text>{copy(lang, 'Check whether a newer app shell is ready. Your shelf, notes and reading progress stay on this device.', 'Periksa apakah versi app terbaru sudah siap. Rak, catatan dan progres bacamu tetap tersimpan di perangkat ini.')}</Text>
    <Group className="update-panel-actions" align="center" gap="sm">
      <Button leftSection={<RefreshCw size={16} />} loading={checking} onClick={() => document.dispatchEvent(new Event('sela:check-update'))}>{copy(lang, 'Check for updates', 'Periksa pembaruan')}</Button>
      <Text className="update-panel-status" data-tone={tone} role="status" aria-live="polite">{message || copy(lang, 'Updates are checked when Sela opens. You can check again here.', 'Pembaruan diperiksa saat Sela dibuka. Kamu bisa memeriksa lagi di sini.')}</Text>
    </Group>
  </Card>;
}

export function SettingsDetail() {
  const { section = '' } = useParams();
  const navigate = useNavigate();
  const { lang, preferences, setPreferences, store } = useWorkspace();
  const restoreRef = useRef<HTMLButtonElement>(null);
  const [restoring, setRestoring] = useState(false);
  const [backupBusy, setBackupBusy] = useState(false);
  useEffect(() => {
    const handler = (event: Event) => {
      const language = (event as CustomEvent<'id' | 'en'>).detail;
      if (language === 'id' || language === 'en') setPreferences(value => ({ ...value, language }));
    };
    window.addEventListener('sela:language', handler);
    return () => window.removeEventListener('sela:language', handler);
  }, [setPreferences]);
  const title = settingGroups.find(item => item.key === section);
  const back = <Tooltip label={copy(lang, 'Back to settings', 'Kembali ke pengaturan')} withArrow><ActionIcon className="settings-back" variant="default" size={42} onClick={() => navigate('/settings')} aria-label={copy(lang, 'Back', 'Kembali')}><ArrowLeft size={18} /></ActionIcon></Tooltip>;
  if (section === 'library') return <Suspense fallback={<Skeleton className="shelf-room-fallback" radius="lg" />}><LibraryToolsScreen /></Suspense>;
  if (!title) return <div className="page-shell settings-detail"><div className="detail-back-row">{back}<Text>{copy(lang, 'Settings', 'Pengaturan')}</Text></div><EmptyState title={copy(lang, 'This settings page is not available.', 'Halaman pengaturan ini tidak tersedia.')} body={copy(lang, 'Return to Settings and choose another section.', 'Kembali ke Pengaturan dan pilih bagian lain.')} /></div>;
  const update = (patch: Partial<AppPreferences>) => setPreferences(value => ({ ...value, ...patch }));
  const themeOptions = [
    { value: 'vanilla', label: copy(lang, 'Vanilla', 'Vanila') },
    { value: 'olive', label: copy(lang, 'Olive', 'Zaitun') },
    { value: 'parchment', label: copy(lang, 'Parchment', 'Perkamen') },
    { value: 'mist', label: copy(lang, 'Mist', 'Kabut') },
    { value: 'stone', label: copy(lang, 'Stone', 'Batu') },
    { value: 'oat', label: 'Oat' },
    { value: 'cocoa', label: copy(lang, 'Cocoa', 'Kakao') },
    { value: 'ivory', label: copy(lang, 'Porcelain', 'Porselen') },
  ];
  const makeBackupFile = async () => new File([await exportLibrary()], `sela-library-${new Date().toISOString().slice(0, 10)}.zip`, { type: 'application/zip' });
  const downloadBackupFile = (file: File) => {
    const url = URL.createObjectURL(file), anchor = document.createElement('a');
    anchor.href = url; anchor.download = file.name; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const exportBackup = async () => {
    setBackupBusy(true);
    try {
      downloadBackupFile(await makeBackupFile());
      notifications.show({ message: copy(lang, 'Library backup downloaded.', 'Cadangan perpustakaan diunduh.'), color: 'quill' });
    } catch (error) { notifications.show({ message: error instanceof Error ? error.message : copy(lang, 'Backup could not be created.', 'Cadangan belum bisa dibuat.'), color: 'red' }); }
    finally { setBackupBusy(false); }
  };
  const shareBackup = async () => {
    setBackupBusy(true);
    try {
      const file = await makeBackupFile();
      if (navigator.share && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: copy(lang, 'Sela library backup', 'Cadangan perpustakaan Sela') });
      else { downloadBackupFile(file); notifications.show({ message: copy(lang, 'File sharing is unavailable here, so the backup was downloaded.', 'Bagikan file belum tersedia di sini, jadi cadangan diunduh.'), color: 'quill' }); }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      notifications.show({ message: error instanceof Error ? error.message : copy(lang, 'Backup could not be shared.', 'Cadangan belum bisa dibagikan.'), color: 'red' });
    } finally { setBackupBusy(false); }
  };
  const restore = async (file: File | null) => {
    if (!file) return;
    setRestoring(true);
    try {
      const result = await restoreLibrary(file); await store.refresh();
      notifications.show({ title: copy(lang, 'Restore complete', 'Pemulihan selesai'), message: copy(lang, `${result.added} books added; ${result.kept} existing books kept.`, `${result.added} buku ditambahkan; ${result.kept} buku yang ada tetap disimpan.`), color: 'quill' });
    } catch (error) { notifications.show({ message: error instanceof Error ? error.message : copy(lang, 'This backup could not be restored.', 'Cadangan ini belum bisa dipulihkan.'), color: 'red' }); }
    finally { setRestoring(false); }
  };

  return <div className="page-shell settings-detail" data-pwa-busy={restoring || backupBusy ? 'true' : undefined}>
    <div className="detail-back-row">{back}<div><Text className="page-eyebrow">{copy(lang, 'SETTINGS', 'PENGATURAN')}</Text><Title order={1}>{copy(lang, title.en, title.id)}</Title></div></div>
    {section === 'appearance' && <Stack className="settings-panel-stack">
      <Card className="settings-panel" withBorder radius="xl" padding="lg">
        <Text className="page-eyebrow">{copy(lang, 'COLOR & DISPLAY', 'WARNA & TAMPILAN')}</Text>
        <Title order={2}>{copy(lang, 'Set your reading room', 'Atur ruang bacamu')}</Title>
        <Text>{copy(lang, 'Choose light, dark or OLED mode independently from your color theme.', 'Pilih mode terang, gelap, atau OLED secara terpisah dari tema warnamu.')}</Text>
        <SegmentedControl
          value={preferences.appearance}
          onChange={value => update({ appearance: value as AppPreferences['appearance'] })}
          data={[
            { value: 'light', label: copy(lang, 'Light', 'Terang') },
            { value: 'dark', label: copy(lang, 'Dark', 'Gelap') },
            { value: 'oled', label: 'OLED' },
          ]}
          aria-label={copy(lang, 'Appearance mode', 'Mode tampilan')}
        />
        <Select
          label={copy(lang, 'Color theme', 'Tema warna')}
          value={preferences.theme}
          onChange={value => update({ theme: (value || 'vanilla') as AppPreferences['theme'] })}
          data={themeOptions}
          leftSection={<span className="theme-color-swatch" data-theme={preferences.theme} aria-hidden="true" />}
          renderOption={({ option, checked }) => <Group className="theme-option" gap="sm" wrap="nowrap"><span className="theme-color-swatch" data-theme={option.value} aria-hidden="true" /><Text size="sm">{option.label}</Text>{checked && <Check className="theme-option-check" size={15} aria-hidden="true" />}</Group>}
        />
      </Card>
      <Card className="settings-panel" withBorder radius="xl" padding="lg"><Text className="page-eyebrow">{copy(lang, 'BOOKCASE', 'RAK BUKU')}</Text><Title order={2}>{copy(lang, 'Set the shelf tone', 'Atur nuansa rak')}</Title><SegmentedControl value={preferences.finish} onChange={value => update({ finish: value as AppPreferences['finish'] })} data={[{ value: 'oak', label: copy(lang, 'Oak', 'Ek') }, { value: 'olive', label: copy(lang, 'Olive', 'Zaitun') }, { value: 'ink', label: copy(lang, 'Ink', 'Tinta') }]} aria-label={copy(lang, 'Bookshelf finish', 'Bahan rak buku')} /><Divider /><Text size="sm">{copy(lang, 'Default shelf density', 'Kerapatan rak awal')}</Text><Slider min={1} max={3} step={1} value={preferences.density} onChange={density => update({ density })} marks={[{ value: 1, label: copy(lang, 'Roomy', 'Lega') }, { value: 2, label: copy(lang, 'Balanced', 'Seimbang') }, { value: 3, label: copy(lang, 'Compact', 'Rapat') }]} thumbLabel={copy(lang, 'Default shelf density', 'Kerapatan rak awal')} /></Card>
      <Card className="settings-panel home-widget-settings" withBorder radius="xl" padding="lg">
        <Text className="page-eyebrow">{copy(lang, 'HOME WIDGETS', 'WIDGET BERANDA')}</Text>
        <Switch label={copy(lang, 'Reading calendar', 'Kalender baca')} description={copy(lang, 'Show reading days on Home.', 'Tampilkan hari membaca di Beranda.')} checked={preferences.widgets.calendar} onChange={event => update({ widgets: { ...preferences.widgets, calendar: event.currentTarget.checked } })} />
        <Divider />
        <Switch label={copy(lang, 'Daily reading note', 'Catatan baca harian')} description={copy(lang, 'Keep a gentle one-line prompt on Home.', 'Tampilkan pengingat singkat di Beranda.')} checked={preferences.widgets.reflection} onChange={event => update({ widgets: { ...preferences.widgets, reflection: event.currentTarget.checked } })} />
        <Divider />
        <Switch label={copy(lang, 'Water tracker', 'Pencatat minum')} description={copy(lang, 'A private daily glass count on this device.', 'Hitungan gelas harian yang tersimpan lokal.')} checked={preferences.widgets.water} onChange={event => update({ widgets: { ...preferences.widgets, water: event.currentTarget.checked } })} />
        <Divider />
        <Switch label={copy(lang, 'On this day', 'Hari ini dalam sejarah')} description={copy(lang, 'Load a source-linked Wikimedia history feed.', 'Muat linimasa sejarah bersumber dari Wikimedia.')} checked={preferences.widgets.history} onChange={event => update({ widgets: { ...preferences.widgets, history: event.currentTarget.checked } })} />
        <Divider />
        <Switch label={copy(lang, 'Book news', 'Berita bacaan')} description={copy(lang, 'Load selected topics from public news feeds.', 'Muat topik pilihan dari feed berita publik.')} checked={preferences.widgets.news} onChange={event => update({ widgets: { ...preferences.widgets, news: event.currentTarget.checked } })} />
        <Divider />
        <Switch label={copy(lang, 'Faith reading & Quran', 'Bacaan keyakinan & Al-Qur’an')} description={copy(lang, 'Choose a reading source in Library tools. Quran and Islamic reading appear when Islam is selected.', 'Pilih sumber bacaan di Alat perpustakaan. Al-Qur’an dan bacaan Islam tampil setelah Islam dipilih.')} checked={preferences.widgets.faith} onChange={event => update({ widgets: { ...preferences.widgets, faith: event.currentTarget.checked } })} />
        <Divider />
        <Switch label={copy(lang, 'Prayer times', 'Jadwal salat')} description={copy(lang, 'Shown for the Islam reading preference. A saved city is used only after you request a daily estimate.', 'Tampil saat preferensi bacaan Islam dipilih. Kota tersimpan hanya digunakan saat kamu meminta perkiraan harian.')} checked={preferences.widgets.prayer} onChange={event => update({ widgets: { ...preferences.widgets, prayer: event.currentTarget.checked } })} />
        <Divider />
        <Switch label={copy(lang, 'Weather', 'Cuaca')} description={copy(lang, 'Manual city selection or location permission only after you choose it.', 'Pilihan kota manual atau izin lokasi hanya setelah kamu memilihnya.')} checked={preferences.widgets.weather} onChange={event => update({ widgets: { ...preferences.widgets, weather: event.currentTarget.checked } })} />
      </Card>
    </Stack>}
    {section === 'reading' && <Stack className="settings-panel-stack">
      <Card className="settings-panel" withBorder radius="xl" padding="lg"><Text className="page-eyebrow">{copy(lang, 'DOCUMENTS', 'DOKUMEN')}</Text><Title order={2}>{copy(lang, 'Choose how books open', 'Pilih cara buku dibuka')}</Title><Text>{copy(lang, 'Page layout is for fixed-page books such as PDF and CBZ. EPUB and text books use Text flow.', 'Tata letak halaman untuk buku berformat tetap seperti PDF dan CBZ. EPUB dan buku teks mengikuti Alur teks.')}</Text><Select label={copy(lang, 'Page layout', 'Tata letak halaman')} value={preferences.defaultPageMode} onChange={value => update({ defaultPageMode: (value || 'book') as AppPreferences['defaultPageMode'] })} data={[{ value: 'book', label: copy(lang, 'Book spread', 'Dua halaman') }, { value: 'single', label: copy(lang, 'Single page', 'Satu halaman') }, { value: 'scroll', label: copy(lang, 'Continuous scroll', 'Gulir kontinu') }, { value: 'webtoon', label: 'Webtoon' }, { value: 'manga', label: 'Manga' }]} /><Divider /><Select label={copy(lang, 'Text flow', 'Alur teks')} value={preferences.defaultTextMode} onChange={value => update({ defaultTextMode: value === 'single' ? 'single' : 'scroll' })} data={[{ value: 'scroll', label: copy(lang, 'Continuous page', 'Halaman berkelanjutan') }, { value: 'single', label: copy(lang, 'Paged text', 'Teks per halaman') }]} /></Card>
      <Card className="settings-panel" withBorder radius="xl" padding="lg"><Text className="page-eyebrow">{copy(lang, 'READING PROFILES', 'PROFIL BACA')}</Text><Title order={2}>{copy(lang, 'A comfortable page', 'Halaman yang nyaman')}</Title><Text>{copy(lang, 'The reader supports serif, sans, monospace and OpenDyslexic type, spacing, page tint, filters, bookmarks, notes and highlights.', 'Pembaca mendukung font serif, sans, monospace, OpenDyslexic, jarak baris, warna halaman, filter, penanda, catatan dan sorotan.')}</Text><Button variant="default" leftSection={<BookOpen size={16} />} onClick={() => navigate('/shelf')}>{copy(lang, 'Open a book', 'Buka buku')}</Button></Card>
    </Stack>}
    {section === 'data' && <Stack className="settings-panel-stack">
      <Card className="settings-panel" withBorder radius="xl" padding="lg"><Text className="page-eyebrow">{copy(lang, 'YOUR BOOKS', 'BUKUMU')}</Text><Title order={2}>{copy(lang, 'Back up the whole shelf', 'Cadangkan seluruh rak')}</Title><Text>{copy(lang, 'A Sela backup includes local book files, collections and reading progress. Keep the ZIP somewhere safe before clearing browser data.', 'Cadangan Sela memuat file buku lokal, koleksi dan progres baca. Simpan file ZIP sebelum menghapus data browser.')}</Text><Group><Button disabled={backupBusy || restoring} leftSection={<Download size={16} />} onClick={() => void exportBackup()}>{copy(lang, 'Export backup', 'Ekspor cadangan')}</Button><Button variant="default" disabled={backupBusy || restoring} leftSection={<Share2 size={16} />} onClick={() => void shareBackup()}>{copy(lang, 'Share backup', 'Bagikan cadangan')}</Button><FileButton onChange={file => void restore(file)} accept=".zip,application/zip">{({ onClick }) => <Button variant="default" disabled={backupBusy} onClick={onClick} leftSection={restoring ? <LoaderCircle className="spin" size={16} /> : <Upload size={16} />} loading={restoring}>{copy(lang, 'Restore a backup', 'Pulihkan cadangan')}</Button>}</FileButton></Group><Text className="backup-count">{copy(lang, `${store.books.length} books currently stored on this device.`, `${store.books.length} buku tersimpan di perangkat ini.`)}</Text></Card>
      <Card className="settings-panel" withBorder radius="xl" padding="lg"><Text className="page-eyebrow">{copy(lang, 'STORAGE NOTE', 'CATATAN PENYIMPANAN')}</Text><Title order={2}>{copy(lang, 'Browser storage is private, but not permanent.', 'Penyimpanan browser bersifat pribadi, tetapi tidak permanen.')}</Title><Text>{copy(lang, 'Private browsing, clearing site data or device cleanup may remove local files. Keep your original book files and a recent Sela backup.', 'Mode privat, penghapusan data situs atau pembersihan perangkat dapat menghapus file lokal. Simpan file asli dan cadangan Sela terbaru.')}</Text></Card>
      <UpdateCard lang={lang} />
    </Stack>}
  </div>;
}

function waitForReader<T>(promise: Promise<T>, signal: AbortSignal, timeoutMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      window.clearTimeout(timer);
      signal.removeEventListener('abort', abort);
    };
    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      action();
    };
    const abort = () => finish(() => reject(new DOMException('Reader load cancelled.', 'AbortError')));
    const timer = window.setTimeout(() => finish(() => reject(new Error(timeoutMessage))), 20000);
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    promise.then(value => finish(() => resolve(value)), reason => finish(() => reject(reason)));
  });
}

export function ReaderScreen() {
  const { bookId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { store, preferences, lang } = useWorkspace();
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState<'file' | 'engine' | 'rendering' | 'ready' | 'error'>('file');
  const [error, setError] = useState('');
  const [errorKind, setErrorKind] = useState<'recoverable' | 'missing'>('recoverable');
  const [retryToken, setRetryToken] = useState(0);
  const [activeReader, setActiveReader] = useState<any>(null);
  const [toolsOpened, setToolsOpened] = useState(false);
  const [toolsTab, setToolsTab] = useState('layout');
  const [selectedQuoteText, setSelectedQuoteText] = useState('');
  const selectionSnapshot = useRef('');
  const [previewsOpened, setPreviewsOpened] = useState(false);
  const currentBook = store.books.find(item => item.id === bookId);
  const openReaderTools = (tab = 'layout') => {
    const selected = window.getSelection()?.toString().trim() || selectionSnapshot.current;
    setSelectedQuoteText(selected.slice(0, 10000));
    selectionSnapshot.current = '';
    setToolsTab(tab);
    setToolsOpened(true);
  };
  useEffect(() => {
    let disposed = false;
    let stopTracker: (() => void) | undefined;
    let instance: any;
    const abort = new AbortController();
    const load = async () => {
      if (store.loading) return;
      setLoading(true);
      setLoadingPhase('file');
      setError('');
      setErrorKind('recoverable');
      try {
        if (!bookId || !mountRef.current) {
          setErrorKind('missing');
          throw new Error(copy(lang, 'This book could not be found.', 'Buku ini tidak ditemukan.'));
        }
        const activeBook = store.books.find(item => item.id === bookId);
        if (!activeBook) {
          setErrorKind('missing');
          throw new Error(copy(lang, 'This book is no longer on your shelf.', 'Buku ini sudah tidak ada di rak.'));
        }
        const blob = await waitForReader(
          getFile(bookId),
          abort.signal,
          copy(lang, 'The saved file took too long to open. Try again or return to your shelf.', 'File tersimpan terlalu lama dibuka. Coba lagi atau kembali ke rak.'),
        );
        if (disposed) return;
        if (!blob) {
          setErrorKind('missing');
          throw new Error(copy(lang, 'The original book file is missing. Return to your shelf to import it again or restore a backup.', 'File buku asli tidak ditemukan. Kembali ke rak untuk mengimpornya lagi atau pulihkan dari cadangan.'));
        }
        const data = await waitForReader(
          blob.arrayBuffer(),
          abort.signal,
          copy(lang, 'The saved file took too long to prepare. Try again or return to your shelf.', 'File tersimpan terlalu lama disiapkan. Coba lagi atau kembali ke rak.'),
        );
        if (disposed) return;
        setLoadingPhase('engine');
        const engineMessage = copy(lang, 'The reader engine took too long to load. Try again or refresh the app.', 'Mesin pembaca terlalu lama dimuat. Coba lagi atau muat ulang aplikasi.');
        const sdkPromise = waitForReader(loadReaderSdk(), abort.signal, engineMessage).catch(reason => {
          if (abort.signal.aborted || (reason instanceof Error && reason.message === engineMessage)) throw reason;
          throw new Error(copy(lang, 'The reader engine could not be loaded. Try again or refresh the app.', 'Mesin pembaca belum dapat dimuat. Coba lagi atau muat ulang aplikasi.'));
        });
        const [sdk, tracker] = await Promise.all([
          sdkPromise,
          waitForReader(import('../../../app/library/reading-tracker.ts'), abort.signal, engineMessage),
        ]);
        if (disposed) return;
        const Reader = (sdk.default || sdk.Sela) as new (options: Record<string, unknown>) => any;
        const mode = defaultReadingMode(activeBook.format, preferences);
        setLoadingPhase('rendering');
        instance = new Reader({ data, format: activeBook.format, title: activeBook.name, metadata: activeBook.metadata, id: activeBook.id, storagePrefix: 'sela-library:', presentation: 'inline', container: mountRef.current, appContext: true, headless: true, language: lang, mode, theme: preferences.appearance === 'light' ? 'light' : 'dark', persistPreferences: true, assetBase: '../dist/', cssUrl: '../dist/css/sela.app.css', onClose: () => navigate('/shelf', { replace: true }), onError: (detail: { error: Error }) => { if (!disposed) { setErrorKind('recoverable'); setLoadingPhase('error'); setError(detail.error.message); } } });
        instance.on?.('progressChanged', (detail: { page: number; pages: number; progress: number }) => {
          void store.patchBook(activeBook.id, { progress: detail.page, total: detail.pages });
        });
        stopTracker = tracker.startAutomaticReadingTracker(activeBook.id);
        await instance.open();
        if (disposed) { instance.destroy(); return; }
        const openTools = (event: Event) => { const tab = (event as CustomEvent<{ tab?: string }>).detail?.tab; openReaderTools(tab || 'layout'); };
        const openPreviews = () => setPreviewsOpened(true);
        instance.overlay?.addEventListener('sela:request-tools', openTools);
        instance.overlay?.addEventListener('sela:request-previews', openPreviews);
        const requestedPage = Number(new URLSearchParams(location.search).get('page'));
        if (Number.isInteger(requestedPage) && requestedPage > 0) instance.goTo?.(requestedPage);
        if (!disposed) { setActiveReader(instance); setLoadingPhase('ready'); void store.patchBook(activeBook.id, { opened: Date.now() }); }
      } catch (reason) {
        instance?.destroy?.();
        instance = undefined;
        if (!disposed) {
          setLoadingPhase('error');
          setError(reason instanceof Error ? reason.message : copy(lang, 'The reader could not open this book.', 'Buku belum dapat dibuka.'));
        }
      } finally { if (!disposed) setLoading(false); }
    };
    void load();
    return () => { disposed = true; abort.abort(); stopTracker?.(); setActiveReader(null); setToolsOpened(false); setToolsTab('layout'); setSelectedQuoteText(''); selectionSnapshot.current = ''; setPreviewsOpened(false); instance?.destroy?.(); };
  }, [bookId, location.search, store.loading, retryToken]);
  const saveReaderMetadata = async (metadata: BookMetadata) => {
    if (!currentBook) throw new Error(copy(lang, 'This book is no longer on the shelf.', 'Buku ini sudah tidak ada di rak.'));
    await store.patchBook(currentBook.id, { name: metadata.title?.trim() || currentBook.name, metadata });
    if (activeReader) { activeReader.options.title = metadata.title || currentBook.name; activeReader.options.metadata = metadata; }
  };
  const phaseCopy = loadingPhase === 'file'
    ? copy(lang, 'Opening your saved book…', 'Membuka buku tersimpan…')
    : loadingPhase === 'engine'
      ? copy(lang, 'Loading the reader…', 'Memuat pembaca…')
      : copy(lang, 'Rendering the pages…', 'Menyiapkan halaman…');
  return <div className="reader-layout">
    <Suspense fallback={null}><FocusTimerBadge /></Suspense>
    {activeReader && currentBook && <Suspense fallback={null}><ReaderChrome reader={activeReader} title={currentBook.metadata?.title || currentBook.name} author={currentBook.metadata?.author} lang={lang} onBack={() => activeReader.close()} onCaptureSelection={text => { if (text) selectionSnapshot.current = text; }} onOpenTools={() => openReaderTools('layout')} onOpenPreviews={() => setPreviewsOpened(true)} /></Suspense>}
    {activeReader && currentBook && <Suspense fallback={null}><ReaderToolsDialog reader={activeReader} book={currentBook} onSaveMetadata={saveReaderMetadata} opened={toolsOpened} onOpenedChange={setToolsOpened} showTrigger={false} onShowPreviews={() => setPreviewsOpened(true)} initialTab={toolsTab} selectedText={selectedQuoteText} /></Suspense>}
    {activeReader && currentBook && <Suspense fallback={null}><ReaderPreviewsDialog reader={activeReader} format={currentBook.format || ''} lang={lang} opened={previewsOpened} onClose={() => setPreviewsOpened(false)} /></Suspense>}
    {error && <Alert className="reader-error" color="red" title={copy(lang, 'Reader message', 'Pesan pembaca')} role="alert">
      <Text size="sm">{error}</Text>
      <Group mt="sm" gap="xs">
        {errorKind === 'recoverable' && <Button leftSection={<RefreshCw size={15} />} onClick={() => setRetryToken(value => value + 1)}>{copy(lang, 'Try again', 'Coba lagi')}</Button>}
        <Button variant="default" onClick={() => navigate('/shelf', { replace: true })}>{errorKind === 'missing' ? copy(lang, 'Back to shelf to re-import', 'Kembali ke rak untuk impor ulang') : copy(lang, 'Back to shelf', 'Kembali ke rak')}</Button>
      </Group>
    </Alert>}
    <main className="reader-body" aria-busy={loading}>
      <div ref={mountRef} className="reader-mount" aria-label={copy(lang, 'Book reader', 'Pembaca buku')} />
      {loading && <div className="reader-loading" role="status" aria-live="polite"><LoaderCircle className="spin" size={24} /><Text>{phaseCopy}</Text></div>}
    </main>
  </div>;
}

