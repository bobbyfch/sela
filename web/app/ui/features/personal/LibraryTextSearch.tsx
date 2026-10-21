import { useRef, useState } from 'react';
import { Alert, Button, Card, Group, Progress, Stack, Text, TextInput, Title } from '@mantine/core';
import { getFile } from '../../../../../app/library/storage.ts';
import type { LibraryBook } from '../../../../../app/library/models.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { loadReaderSdk } from '../../reader-sdk.ts';

type SearchHit = { book: LibraryBook; page: number; snippet: string };
type WorkerResult = { requestId: number; bookId: string; page: number; snippet: string };
type SearchReader = { open: () => Promise<unknown>; totalPages: number; getText: (page: number) => Promise<string>; destroy: () => void };

export function LibraryTextSearch({ onOpen }: { onOpen: (book: LibraryBook, page: number) => void }) {
  const { lang, store } = useWorkspace();
  const hostRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0);
  const stopRef = useRef<() => void>(() => undefined);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const t = (en: string, id: string) => copy(lang, en, id);

  const cancel = () => { runRef.current += 1; stopRef.current(); setBusy(false); setStatus(t('Search stopped.', 'Pencarian dihentikan.')); };

  const search = async () => {
    const term = query.trim().slice(0, 200);
    if (!term || busy) return;
    const run = ++runRef.current;
    let current: SearchReader | undefined;
    let worker: Worker | undefined;
    let rejectPending: ((reason: Error) => void) | undefined;
    setBusy(true); setError(''); setStatus(''); setProgress(0); setHits([]);
    try {
      worker = new Worker(new URL('./library-search.worker.ts', import.meta.url), { type: 'module' });
      const activeWorker = worker;
      stopRef.current = () => { current?.destroy?.(); rejectPending?.(new Error('Search cancelled')); activeWorker.terminate(); };
      const [sdk, files] = await Promise.all([loadReaderSdk(), Promise.all(store.books.map(async book => ({ book, file: await getFile(book.id) })))]);
      const Reader = (sdk.default || sdk.Sela) as new (options: Record<string, unknown>) => SearchReader;
      if (!hostRef.current) throw new Error(t('Search is not ready.', 'Pencarian belum siap.'));
      const readable = files.filter(row => row.file);
      let completed = 0;
      const found: SearchHit[] = [];
      for (const { book, file } of readable) {
        if (run !== runRef.current) break;
        setStatus(t(`Reading ${book.name}`, `Membaca ${book.name}`));
        try {
          current = new Reader({ data: await file!.arrayBuffer(), format: book.format, title: book.name, persistPreferences: false, presentation: 'inline', container: hostRef.current, lowPower: true });
          await current.open();
          if (run !== runRef.current) break;
          const pages: string[] = [];
          let totalChars = 0;
          const limit = Math.min(current.totalPages, 500);
          for (let page = 1; page <= limit && totalChars < 1_000_000; page++) {
            if (run !== runRef.current) break;
            const text = (await current.getText(page)).slice(0, 1_000_000 - totalChars);
            totalChars += text.length; pages.push(text);
          }
          if (run !== runRef.current) break;
          const requestId = run * 1000 + completed;
          const result = await new Promise<WorkerResult>((resolve, reject) => {
            const cleanup = () => { clearTimeout(timeout); activeWorker.removeEventListener('message', receive); rejectPending = undefined; };
            const timeout = window.setTimeout(() => { cleanup(); reject(new Error(t('Search worker timed out.', 'Pencarian terlalu lama.'))); }, 8000);
            const receive = (event: MessageEvent<WorkerResult>) => {
              if (event.data?.requestId !== requestId) return;
              cleanup(); resolve(event.data);
            };
            rejectPending = reason => { cleanup(); reject(reason); };
            activeWorker.addEventListener('message', receive);
            activeWorker.postMessage({ requestId, bookId: book.id, pages, query: term });
          });
          if (result.page) found.push({ book, page: result.page, snippet: result.snippet });
        } catch (reason) {
          if (run === runRef.current) setStatus(t(`Text unavailable in ${book.name}. Continuing…`, `Teks ${book.name} tidak bisa dibaca. Melanjutkan…`));
        } finally { current?.destroy?.(); current = undefined; completed += 1; setProgress(readable.length ? completed / readable.length * 100 : 100); }
      }
      if (run === runRef.current) { setHits(found); setStatus(found.length ? t(`${found.length} book(s) contain this text.`, `${found.length} buku memuat teks ini.`) : t('No matching text was found.', 'Teks yang cocok tidak ditemukan.')); }
    } catch (reason) { if (run === runRef.current) setError(reason instanceof Error ? reason.message : t('Library search failed.', 'Pencarian rak gagal.')); }
    finally {
      current?.destroy?.(); worker?.terminate();
      if (run === runRef.current) { setBusy(false); stopRef.current = () => undefined; }
    }
  };

  return <Card className="settings-panel personal-tools-card" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('SEARCH YOUR OWN BOOKS', 'CARI DI BUKU MILIKMU')}</Text><Title order={2}>{t('Search inside my library', 'Cari isi perpustakaan')}</Title><Text>{t('Sela reads text locally, up to 500 pages and 1 million characters per book. Image-only pages need OCR. Search text is not saved.', 'Sela memeriksa teks secara lokal, maksimal 500 halaman dan 1 juta karakter per buku. Halaman gambar memerlukan OCR. Kata pencarian tidak disimpan.')}</Text></div>
    <Group align="end" wrap="wrap"><TextInput className="library-search-input" style={{ flex: '1 1 260px' }} label={t('Words to find', 'Kata yang dicari')} value={query} onChange={event => setQuery(event.currentTarget.value)} maxLength={200} onKeyDown={event => { if (event.key === 'Enter') void search(); }} /><Button onClick={() => void search()} loading={busy} disabled={!query.trim()}>{t('Search books', 'Cari buku')}</Button>{busy && <Button variant="default" onClick={cancel}>{t('Stop', 'Hentikan')}</Button>}</Group>
    {busy && <Progress value={progress} aria-label={t('Search progress', 'Progres pencarian')} />}
    {error && <Alert color="red" role="alert">{error}</Alert>}
    {status && <Text size="sm" role="status" aria-live="polite">{status}</Text>}
    {hits.length > 0 && <Stack gap="xs" className="library-search-results">{hits.map(hit => <article key={`${hit.book.id}:${hit.page}`}><div><strong>{hit.book.name}</strong><span>{t(`Page ${hit.page}`, `Halaman ${hit.page}`)}</span></div><Text size="sm">{hit.snippet}</Text><Button variant="subtle" size="compact-sm" onClick={() => onOpen(hit.book, hit.page)}>{t('Open at this page', 'Buka di halaman ini')}</Button></article>)}</Stack>}
    <div ref={hostRef} className="library-search-render-host" aria-hidden="true" />
  </Card>;
}
