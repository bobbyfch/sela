import { useEffect, useState } from 'react';
import { Alert, Button, Card, Checkbox, Group, Stack, Text, Title } from '@mantine/core';
import { getFile } from '../../../../../app/library/storage.ts';
import type { LibraryBook } from '../../../../../app/library/models.ts';
import { editPersonal, readPersonal } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

type CheckResult = { ready: string[]; missing: string[]; usage?: number; quota?: number };

export function LibraryCare({ books }: { books: LibraryBook[] }) {
  const { lang } = useWorkspace();
  const [selected, setSelected] = useState<string[]>(() => readPersonal().queue.filter(id => books.some(book => book.id === id)));
  const [result, setResult] = useState<CheckResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [protectionStatus, setProtectionStatus] = useState('');
  const t = (en: string, id: string) => copy(lang, en, id);

  useEffect(() => {
    const sync = () => setSelected(current => current.filter(id => books.some(book => book.id === id)));
    document.addEventListener('sela:personal', sync);
    return () => document.removeEventListener('sela:personal', sync);
  }, [books]);

  const check = async (ids: string[]) => {
    setBusy(true); setError(''); setResult(null);
    const next: CheckResult = { ready: [], missing: [] };
    try {
      for (const id of ids) {
        const file = await getFile(id);
        const book = books.find(item => item.id === id);
        (file?.size ? next.ready : next.missing).push(book?.name || id.slice(0, 10));
      }
      const estimate = await navigator.storage?.estimate?.();
      if (estimate) { next.usage = estimate.usage; next.quota = estimate.quota; }
      setResult(next);
    } catch (reason) { setError(reason instanceof Error ? reason.message : t('File check failed.', 'Pemeriksaan file gagal.')); }
    finally { setBusy(false); }
  };

  const toggle = (id: string, checked: boolean) => {
    setSelected(current => checked ? [...new Set([...current, id])] : current.filter(item => item !== id));
    try { editPersonal(data => { data.queue = checked ? [...new Set([...data.queue, id])] : data.queue.filter(item => item !== id); }); } catch { /* Selection remains available in the current view. */ }
  };

  const usageLabel = result?.usage != null ? `${(result.usage / 1048576).toFixed(1)} MiB${result.quota ? ` / ${(result.quota / 1048576).toFixed(1)} MiB` : ''}` : '';
  const protectStorage = async () => {
    try {
      const persistent = await navigator.storage?.persist?.();
      setProtectionStatus(persistent ? t('Persistent storage was enabled. Keep a separate backup too.', 'Penyimpanan persisten diaktifkan. Tetap simpan cadangan terpisah.') : t('The browser will manage this storage. Keep a separate backup.', 'Penyimpanan tetap dikelola browser. Simpan cadangan terpisah.'));
    } catch { setProtectionStatus(t('Storage protection is not available in this browser.', 'Perlindungan penyimpanan tidak tersedia di browser ini.')); }
  };
  return <Card className="settings-panel personal-tools-card" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('LOCAL FILES', 'FILE LOKAL')}</Text><Title order={2}>{t('Travel & library care', 'Persiapan bepergian & perawatan rak')}</Title><Text>{t('Check that original files are ready offline and review this browser’s storage use. Nothing is removed.', 'Pastikan file asli siap dibuka offline dan lihat penggunaan penyimpanan browser. Tidak ada yang dihapus.')}</Text></div>
    {error && <Alert color="red" role="alert">{error}</Alert>}
    <Stack gap="xs" className="travel-book-list">{books.map(book => <Checkbox key={book.id} checked={selected.includes(book.id)} onChange={event => toggle(book.id, event.currentTarget.checked)} label={book.name} description={book.metadata?.author || (book.format || 'book').toUpperCase()} />)}</Stack>
    <Group><Button variant="default" onClick={() => void check(books.map(book => book.id))} loading={busy}>{t('Check all originals', 'Periksa semua file asli')}</Button><Button onClick={() => void check(selected)} loading={busy} disabled={!selected.length}>{t('Check selected for travel', 'Periksa pilihan untuk perjalanan')}</Button><Button variant="subtle" onClick={() => void protectStorage()}>{t('Protect offline storage', 'Lindungi penyimpanan offline')}</Button></Group>
    {protectionStatus && <Text size="xs" c="dimmed" role="status">{protectionStatus}</Text>}
    {result && <Alert color={result.missing.length ? 'yellow' : 'quill'} title={t('Offline file check', 'Pemeriksaan file offline')}>
      <Stack gap={5}><Text size="sm">{t(`${result.ready.length} ready · ${result.missing.length} need the original file`, `${result.ready.length} siap · ${result.missing.length} perlu file asli`)}</Text>{result.missing.map(name => <Text size="xs" key={name}>• {name}</Text>)}{usageLabel && <Text size="xs" c="dimmed">{t('Browser storage', 'Penyimpanan browser')}: {usageLabel}</Text>}<Text size="xs" c="dimmed">{t('Keep a separate backup; browser storage can be cleared by the device.', 'Simpan cadangan terpisah; penyimpanan browser dapat dihapus oleh perangkat.')}</Text></Stack>
    </Alert>}
  </Card>;
}
