import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Alert, AppShell, ActionIcon, Button, Group, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { HashRouter, Link as RouterLink, NavLink as RouterNavLink, Route, Routes, useLocation, useNavigate } from 'react-router';
import { notifications } from '@mantine/notifications';
import { Dropzone } from '@mantine/dropzone';
import { Spotlight as MantineSpotlight, spotlight, type SpotlightActionData } from '@mantine/spotlight';
import {
  BookOpen, Bookmark, ChartNoAxesColumnIncreasing, Check,
  Compass, FileUp, Languages, LibraryBig, Moon, Plus, Search, Settings2, Sun, X,
} from 'lucide-react';
import { useLibraryStore, readAppPreferences, saveAppPreferences, type AppPreferences } from './state.ts';
import { copy, WorkspaceProvider, type WorkspaceValue } from './workspace.tsx';
import { SelaUiProvider } from './theme.tsx';
import type { LibraryBook } from '../../../app/library/models.ts';

const HomeScreen = lazy(() => import('./screens.tsx').then(module => ({ default: module.HomeScreen })));
const ShelfScreen = lazy(() => import('./screens.tsx').then(module => ({ default: module.ShelfScreen })));
const DiscoverScreen = lazy(() => import('./screens.tsx').then(module => ({ default: module.DiscoverScreen })));
const ProgressScreen = lazy(() => import('./screens.tsx').then(module => ({ default: module.ProgressScreen })));
const SettingsScreen = lazy(() => import('./screens.tsx').then(module => ({ default: module.SettingsScreen })));
const SettingsDetail = lazy(() => import('./screens.tsx').then(module => ({ default: module.SettingsDetail })));
const ReaderScreen = lazy(() => import('./screens.tsx').then(module => ({ default: module.ReaderScreen })));
const FaithReaderScreen = lazy(() => import('./features/faith/FaithReaderScreen.tsx'));

const sections = [
  { to: '/', en: 'Today', id: 'Hari ini', icon: BookOpen, end: true },
  { to: '/shelf', en: 'My shelf', id: 'Rak buku', icon: LibraryBig },
  { to: '/discover', en: 'Discover', id: 'Jelajah', icon: Compass },
  { to: '/progress', en: 'Reading log', id: 'Catatan baca', icon: ChartNoAxesColumnIncreasing },
  { to: '/settings', en: 'Settings', id: 'Pengaturan', icon: Settings2 },
];

const bookDropAccept = {
  'application/pdf': ['.pdf'],
  'application/epub+zip': ['.epub'],
  'application/zip': ['.epub', '.cbz', '.docx', '.odt'],
  'application/vnd.comicbook+zip': ['.cbz'],
  'text/plain': ['.txt', '.md'],
  'text/markdown': ['.md'],
  'text/html': ['.html', '.htm'],
  'application/x-fictionbook+xml': ['.fb2'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.oasis.opendocument.text': ['.odt'],
};
const appPwaPath = ['./', 'pwa.js'].join('');

type RouteFailureBoundaryProps = { children: ReactNode; lang: WorkspaceValue['lang']; onBack: () => void };
type RouteFailureBoundaryState = { failed: boolean };

class RouteFailureBoundary extends Component<RouteFailureBoundaryProps, RouteFailureBoundaryState> {
  state: RouteFailureBoundaryState = { failed: false };

  static getDerivedStateFromError(): RouteFailureBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error('A Sela screen could not be loaded.', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const { lang, onBack } = this.props;
    return <Alert className="reader-error" color="red" title={copy(lang, 'This part of Sela could not be loaded', 'Bagian Sela ini belum dapat dimuat')} role="alert">
      <Text size="sm">{copy(lang, 'An app file may be missing or out of date. Refresh to try again; your books and reading progress stay on this device.', 'Berkas aplikasi mungkin hilang atau sudah lama. Muat ulang untuk mencoba lagi; buku dan progres membaca tetap tersimpan di perangkat ini.')}</Text>
      <Group mt="sm" gap="xs">
        <Button onClick={() => window.location.reload()}>{copy(lang, 'Refresh app', 'Muat ulang app')}</Button>
        <Button variant="default" onClick={onBack}>{copy(lang, 'Back to shelf', 'Kembali ke rak')}</Button>
      </Group>
    </Alert>;
  }
}

function AppFrame({ workspace }: { workspace: WorkspaceValue }) {
  const location = useLocation();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const isReader = location.pathname.startsWith('/read/');
  const isFaithReader = location.pathname.startsWith('/faith');
  const lang = workspace.lang;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.appTheme = workspace.preferences.theme;
    document.documentElement.dataset.appAppearance = workspace.preferences.appearance;
    document.documentElement.style.colorScheme = workspace.preferences.appearance === 'light' ? 'light' : 'dark';
  }, [lang, workspace.preferences.theme, workspace.preferences.appearance]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => { void import(/* @vite-ignore */ new URL(appPwaPath, import.meta.url).href).catch(() => undefined); }, []);

  useEffect(() => {
    const receiveIncomingFiles = (event: Event) => {
      const detail = (event as CustomEvent<{ files?: File[]; complete?: (books: LibraryBook[]) => void }>).detail;
      if (!Array.isArray(detail?.files)) return;
      void workspace.importBooks(detail.files).then(result => {
        const books = result?.books || [];
        detail.complete?.(books);
        if (books[0]) navigate(`/read/${books[0].id}`);
      });
    };
    document.addEventListener('sela:incoming-files', receiveIncomingFiles);
    return () => document.removeEventListener('sela:incoming-files', receiveIncomingFiles);
  }, [navigate, workspace.importBooks]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/shelf');
    setSearchOpen(false);
  };

  if (isReader || isFaithReader) return <div className={`sela-app reader-app${isFaithReader ? ' faith-reader-app' : ''}`} data-theme={workspace.preferences.theme} data-appearance={workspace.preferences.appearance} data-importing={workspace.importing || undefined}>
    <RouteFailureBoundary key={location.pathname} lang={lang} onBack={() => navigate('/shelf', { replace: true })}>
      <Suspense fallback={<div className="screen-loading" role="status">{copy(lang, isReader ? 'Opening your book…' : 'Opening your reading…', isReader ? 'Membuka bukumu…' : 'Membuka bacaan…')}</div>}><Routes>
        <Route path="/read/:bookId" element={<ReaderScreen />} />
        <Route path="/faith/*" element={<FaithReaderScreen />} />
      </Routes></Suspense>
    </RouteFailureBoundary>
  </div>;

  return <div className="sela-app" data-theme={workspace.preferences.theme} data-appearance={workspace.preferences.appearance} data-importing={workspace.importing || undefined}>
    <AppShell
      className="sela-shell"
      padding={0}
      navbar={{ width: 256, breakpoint: 'sm', collapsed: { mobile: true } }}
      header={{ height: 72 }}
      transitionDuration={160}
    >
      <AppShell.Navbar className="app-sidebar glass-surface" p="md" aria-label={copy(lang, 'Main navigation', 'Navigasi utama')}>
        <Text className="nav-caption">{copy(lang, 'YOUR LIBRARY', 'PERPUSTAKAANMU')}</Text>
        <nav className="primary-nav" aria-label={copy(lang, 'Library views', 'Tampilan perpustakaan')}>
          {sections.slice(0, 4).map(({ to, en, id, icon: Icon, end }) => <RouterNavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}>
            <Icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{copy(lang, en, id)}</span>
          </RouterNavLink>)}
        </nav>
        {workspace.store.collections.length > 0 && <section className="sidebar-collections" aria-label={copy(lang, 'Collections', 'Koleksi')}>
          <div className="sidebar-section-title"><span>{copy(lang, 'COLLECTIONS', 'KOLEKSI')}</span><Bookmark size={14} aria-hidden="true" /></div>
          {workspace.store.collections.slice(0, 8).map(name => <RouterNavLink key={name} to={`/shelf?collection=${encodeURIComponent(name)}`} className="collection-link"><span className="collection-dot" />{name}</RouterNavLink>)}
        </section>}
        <div className="sidebar-bottom">
          <div className="local-note"><span className="local-dot" /><span>{copy(lang, 'Books stay on this device', 'Buku tersimpan di perangkat ini')}</span></div>
          <RouterNavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}><Settings2 size={18} strokeWidth={1.7} aria-hidden="true" /><span>{copy(lang, 'Settings', 'Pengaturan')}</span></RouterNavLink>
        </div>
      </AppShell.Navbar>

      <AppShell.Header className="app-topbar glass-surface" px="clamp(16px, 3vw, 36px)">
        <Group justify="space-between" wrap="nowrap" className="topbar-inner" gap="md">
          <UnstyledButton component={RouterLink} to="/" className="brand-lockup topbar-brand" aria-label="Sela Books · Home">
            <span className="brand-mark" aria-hidden="true"><BookOpen size={19} strokeWidth={1.7} /></span>
            <span className="brand-word">sela<span>books</span></span>
          </UnstyledButton>
          <form className={`global-search${searchOpen ? ' is-open' : ''}`} role="search" onSubmit={submitSearch}>
            <Search size={17} aria-hidden="true" />
            <input value={workspace.globalSearch} onChange={event => workspace.setGlobalSearch(event.target.value)} onFocus={() => setSearchOpen(true)} onBlur={() => setSearchOpen(false)} placeholder={copy(lang, 'Find a book or author', 'Cari judul atau penulis')} aria-label={copy(lang, 'Search your books', 'Cari bukumu')} />
            <kbd>↵</kbd>
          </form>
          <Group gap={8} wrap="nowrap" className="topbar-actions">
            <Tooltip label={copy(lang, 'Switch language', 'Ganti bahasa')} withArrow>
              <ActionIcon className="glass-control" variant="default" size={40} aria-label={copy(lang, 'Switch language', 'Ganti bahasa')} onClick={() => workspace.setPreferences(value => ({ ...value, language: value.language === 'id' ? 'en' : 'id' }))}><Languages size={17} /></ActionIcon>
            </Tooltip>
            <Tooltip label={workspace.preferences.appearance === 'light' ? copy(lang, 'Switch to dark mode', 'Ganti ke mode gelap') : copy(lang, 'Switch to light mode', 'Ganti ke mode terang')} withArrow>
              <ActionIcon className="glass-control" variant="default" size={40} aria-pressed={workspace.preferences.appearance !== 'light'} aria-label={workspace.preferences.appearance === 'light' ? copy(lang, 'Switch to dark mode', 'Ganti ke mode gelap') : copy(lang, 'Switch to light mode', 'Ganti ke mode terang')} onClick={() => workspace.setPreferences(value => ({ ...value, appearance: value.appearance === 'light' ? 'dark' : 'light' }))}>
                {workspace.preferences.appearance === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label={copy(lang, 'Search your books', 'Cari bukumu')} withArrow>
              <ActionIcon className="glass-control mobile-search" variant="default" size={40} aria-label={copy(lang, 'Search your books', 'Cari bukumu')} onClick={spotlight.open}><Search size={17} /></ActionIcon>
            </Tooltip>
            <Button className="add-books-button" leftSection={<Plus size={17} />} onClick={() => fileRef.current?.click()}>{copy(lang, 'Add books', 'Tambah buku')}</Button>
            <input ref={fileRef} className="visually-hidden" type="file" accept=".pdf,.epub,.cbz,.txt,.md,.html,.htm,.fb2,.docx,.odt" multiple onChange={event => { const files = event.currentTarget.files; if (files?.length) void workspace.importBooks(files); event.currentTarget.value = ''; }} aria-label={copy(lang, 'Choose book files', 'Pilih file buku')} />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main className="app-content">
        {workspace.store.error && <div className="global-error" role="alert"><span>{workspace.store.error}</span><Button size="compact-sm" variant="subtle" onClick={() => void workspace.store.refresh()}>{copy(lang, 'Retry', 'Coba lagi')}</Button></div>}
        <RouteFailureBoundary key={location.pathname} lang={lang} onBack={() => navigate('/shelf', { replace: true })}>
          <Suspense fallback={<div className="screen-loading" role="status">{copy(lang, 'Opening this page…', 'Membuka halaman…')}</div>}><Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/shelf" element={<ShelfScreen />} />
            <Route path="/discover" element={<DiscoverScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/settings/:section" element={<SettingsDetail />} />
            <Route path="*" element={<HomeScreen />} />
          </Routes></Suspense>
        </RouteFailureBoundary>
        <div id="app-offline-status" className="visually-hidden" role="status" />
        <div id="update-status" className="visually-hidden" role="status" aria-hidden="true" />
      </AppShell.Main>

    </AppShell>
    {!location.pathname.startsWith('/settings/') && <nav className="mobile-dock glass-surface" aria-label={copy(lang, 'App tabs', 'Tab aplikasi')}>
      <Group justify="space-around" wrap="nowrap" gap={0}>
        {sections.map(({ to, en, id, icon: Icon, end }) => <RouterNavLink key={to} to={to} end={end} className={({ isActive }) => `dock-link${isActive ? ' is-active' : ''}`}>
          <Icon size={19} strokeWidth={1.7} aria-hidden="true" /><span>{copy(lang, en, id)}</span>
        </RouterNavLink>)}
      </Group>
    </nav>}
    <MantineSpotlight
      actions={[
        ...sections.map(({ to, en, id, icon: Icon }) => ({ id: `page-${to}`, label: copy(lang, en, id), description: copy(lang, 'Open this section', 'Buka bagian ini'), leftSection: <Icon size={17} />, onClick: () => navigate(to) })),
        ...workspace.store.books.map(book => ({ id: `book-${book.id}`, label: book.name, description: book.metadata?.author || copy(lang, `${(book.format || 'book').toUpperCase()} · open book`, `${(book.format || 'buku').toUpperCase()} · buka buku`), leftSection: <BookOpen size={17} />, onClick: () => navigate(`/read/${book.id}`), keywords: [book.filename, book.metadata?.author || '', ...(book.tags || [])] })),
      ] satisfies SpotlightActionData[]}
      shortcut="mod + K"
      limit={7}
      highlightQuery
      nothingFound={copy(lang, 'Nothing in your library matches.', 'Tidak ada yang cocok di perpustakaanmu.')}
      searchProps={{ leftSection: <Search size={17} />, placeholder: copy(lang, 'Search books or open a page…', 'Cari buku atau buka halaman…') }}
    />
    <div className="announcer visually-hidden" role="status" aria-live="polite">{workspace.store.loading ? copy(lang, 'Updating your library', 'Memperbarui rak buku') : ''}</div>
  </div>;
}

function AppProvider() {
  const store = useLibraryStore();
  const [preferences, setPreferences] = useState(readAppPreferences);
  const [globalSearch, setGlobalSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const lang = preferences.language;

  useEffect(() => { saveAppPreferences(preferences); }, [preferences]);

  const importBooks = useCallback(async (files: FileList | File[]) => {
    setImporting(true);
    try {
      const result = await store.addFiles(files);
      const message = result.duplicates
        ? copy(lang, `${result.duplicates} duplicate book${result.duplicates === 1 ? '' : 's'} skipped.`, `${result.duplicates} buku duplikat dilewati.`)
        : copy(lang, `${result.added} book${result.added === 1 ? '' : 's'} added to your shelf.`, `${result.added} buku ditambahkan ke rak.`);
      notifications.show({ title: copy(lang, 'Shelf updated', 'Rak diperbarui'), message, color: 'quill' });
      document.dispatchEvent(new CustomEvent('sela:app-notice', { detail: message }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : copy(lang, 'Import failed.', 'Impor gagal.');
      notifications.show({ title: copy(lang, 'Could not add books', 'Buku belum bisa ditambahkan'), message, color: 'red' });
      document.dispatchEvent(new CustomEvent('sela:app-error', { detail: message }));
      return null;
    } finally {
      setImporting(false);
    }
  }, [lang, store]);

  const announce = useCallback((message: string) => notifications.show({ message, color: 'quill' }), []);
  const value = useMemo(() => ({ store, preferences, setPreferences, lang, globalSearch, setGlobalSearch, importing, importBooks, announce }), [store, preferences, lang, globalSearch, importing, importBooks, announce]);

  const reportRejectedFiles = (files: Array<{ errors: Array<{ code: string }> }>) => {
    const tooLarge = files.some(file => file.errors.some(error => error.code === 'file-too-large'));
    const tooMany = files.some(file => file.errors.some(error => error.code === 'too-many-files'));
    notifications.show({
      title: copy(lang, 'Some files were not added', 'Beberapa file tidak ditambahkan'),
      message: tooLarge
        ? copy(lang, 'Each book must be 64 MB or smaller.', 'Ukuran setiap buku maksimal 64 MB.')
        : tooMany
          ? copy(lang, 'Add up to 20 books at a time.', 'Tambahkan maksimal 20 buku sekaligus.')
          : copy(lang, 'Use PDF, EPUB, CBZ, TXT, MD, HTML, FB2, DOCX or ODT files.', 'Gunakan file PDF, EPUB, CBZ, TXT, MD, HTML, FB2, DOCX, atau ODT.'),
      color: 'red',
    });
  };

  return <SelaUiProvider dark={preferences.appearance !== 'light'} locale={lang}><WorkspaceProvider value={value}>
    <AppFrame workspace={value} />
    <Dropzone.FullScreen
      className="app-drop-overlay"
      active
      accept={bookDropAccept}
      maxSize={64 * 1024 * 1024}
      maxFiles={20}
      onDrop={(files: File[]) => void importBooks(files)}
      onReject={reportRejectedFiles}
    >
      <Group className="app-drop-prompt" justify="center" gap="lg" wrap="nowrap">
        <Dropzone.Accept><FileUp size={30} /></Dropzone.Accept>
        <Dropzone.Reject><X size={30} /></Dropzone.Reject>
        <Dropzone.Idle><Check size={30} /></Dropzone.Idle>
        <div><Text fw={650}>{copy(lang, 'Drop books anywhere in Sela', 'Letakkan buku di mana saja di Sela')}</Text><Text size="sm" c="dimmed">{copy(lang, 'PDF · EPUB · CBZ · TXT · MD · HTML · FB2 · DOCX · ODT · 64 MB each', 'PDF · EPUB · CBZ · TXT · MD · HTML · FB2 · DOCX · ODT · maks. 64 MB per file')}</Text></div>
      </Group>
    </Dropzone.FullScreen>
  </WorkspaceProvider></SelaUiProvider>;
}

export function SelaApp() {
  return <HashRouter><AppProvider /></HashRouter>;
}
