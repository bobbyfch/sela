import { useRef, useState } from 'react';
import { Alert, Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { Search, X } from 'lucide-react';

type Match = { page: number; excerpt: string; occurrence: number };

export function ReaderSearchPanel({ reader, lang }: { reader: any; lang: 'en' | 'id' }) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const runId = useRef(0);
  const t = (en: string, id: string) => lang === 'id' ? id : en;
  const cancel = () => { runId.current++; setBusy(false); setStatus(t('Search stopped.', 'Pencarian dihentikan.')); };

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    const needle = query.trim().toLocaleLowerCase(); if (!needle) return;
    const run = ++runId.current; const found: Match[] = [];
    setMatches([]); setBusy(true); setStatus(t('Searching this book…', 'Mencari di buku…'));
    try {
      for (let page = 1; page <= reader.totalPages && found.length < 100; page++) {
        if (run !== runId.current) return;
        setStatus(t(`Searching page ${page} of ${reader.totalPages}…`, `Mencari halaman ${page} dari ${reader.totalPages}…`));
        let text = '';
        try { text = String(await reader.getText(page) || ''); } catch { continue; }
        const lower = text.toLocaleLowerCase(); let start = 0;
        while (found.length < 100) {
          const index = lower.indexOf(needle, start); if (index < 0) break;
          const left = Math.max(0, index - 90), right = Math.min(text.length, index + needle.length + 120);
          const excerpt = `${left ? '…' : ''}${text.slice(left, right).replace(/\s+/g, ' ').trim()}${right < text.length ? '…' : ''}`;
          found.push({ page, excerpt, occurrence: index }); start = index + Math.max(1, needle.length);
        }
        if (page % 8 === 0) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      }
      if (run === runId.current) { setMatches(found); setStatus(found.length ? t(`${found.length}${found.length === 100 ? '+' : ''} matches`, `${found.length}${found.length === 100 ? '+' : ''} hasil`) : t('No matches in extractable text.', 'Tidak ada kecocokan pada teks yang bisa dibaca.')); }
    } catch { if (run === runId.current) setStatus(t('Search could not be completed.', 'Pencarian belum dapat diselesaikan.')); }
    finally { if (run === runId.current) setBusy(false); }
  };

  return <Stack className="reader-tool-section" gap="md">
    <div><Text fw={650}>{t('Find in this book', 'Cari di buku')}</Text><Text size="xs" c="dimmed">{t('Search runs on your device and checks readable pages one at a time.', 'Pencarian berlangsung di perangkatmu dan memeriksa halaman yang dapat dibaca satu per satu.')}</Text></div>
    <form className="reader-search-form" onSubmit={event => void search(event)}><TextInput type="search" maxLength={200} value={query} onChange={event => setQuery(event.currentTarget.value)} placeholder={t('Word or phrase', 'Kata atau frasa')} aria-label={t('Search text', 'Cari teks')} /><Group gap="xs"><Button type="submit" leftSection={<Search size={15} />} loading={busy}>{t('Search', 'Cari')}</Button>{busy && <Button type="button" variant="default" leftSection={<X size={14} />} onClick={cancel}>{t('Stop', 'Hentikan')}</Button>}</Group></form>
    <Text size="sm" role="status" aria-live="polite" c="dimmed">{status}</Text>
    {matches.length > 0 && <div className="reader-search-results">{matches.map((match, index) => <button key={`${match.page}-${match.occurrence}-${index}`} type="button" className="reader-search-result" onClick={() => reader.goTo(match.page)}><span>{t('Page ', 'Halaman ')}{match.page}</span><span>{match.excerpt}</span></button>)}</div>}
    {!busy && matches.length === 0 && query.trim() && status.toLocaleLowerCase().includes('no matches') && <Alert color="gray" variant="light">{t('Scanned pages and image-only comics do not contain searchable text.', 'Halaman hasil pindai dan komik berupa gambar tidak memiliki teks yang bisa dicari.')}</Alert>}
  </Stack>;
}
