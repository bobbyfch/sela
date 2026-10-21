import { useState } from 'react';
import { Alert, Button, Card, Group, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { exportLibrary, mergeRemoteReading, restoreLibrary } from '../../../../../app/library/backup.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

type SyncResult = Awaited<ReturnType<typeof restoreLibrary>>;

function savedUrl() { try { return localStorage.getItem('sela-library:webdav-url') || ''; } catch { return ''; } }

export function WebDavSync() {
  const { lang, store } = useWorkspace();
  const [url, setUrl] = useState(savedUrl);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [etag, setEtag] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<SyncResult['conflicts']>([]);
  const [busy, setBusy] = useState<'pull' | 'push' | ''>('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const t = (en: string, id: string) => copy(lang, en, id);

  const config = () => {
    const endpoint = new URL(url.trim());
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error(t('Use an HTTPS URL without credentials in the address.', 'Gunakan URL HTTPS tanpa kredensial di alamat.'));
    try { localStorage.setItem('sela-library:webdav-url', endpoint.href); } catch { /* The session can still sync without saving the URL. */ }
    const headers: Record<string, string> = {};
    if (username || password) headers.Authorization = `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}`;
    return { endpoint, headers };
  };

  const pull = async () => {
    setBusy('pull'); setError(''); setMessage(''); setConflicts([]);
    try {
      const { endpoint, headers } = config();
      const response = await fetch(endpoint, { headers, credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(t(`Sync server returned ${response.status}.`, `Server sinkronisasi mengembalikan ${response.status}.`));
      const limit = 128 * 1048576;
      if (Number(response.headers.get('content-length')) > limit) throw new Error(t('Remote backup exceeds 128 MiB.', 'Cadangan remote melebihi 128 MiB.'));
      const reader = response.body?.getReader();
      if (!reader) throw new Error(t('This browser cannot stream the backup safely.', 'Browser ini tidak dapat membaca cadangan secara aman.'));
      const chunks: ArrayBuffer[] = []; let size = 0;
      try {
        for (;;) {
          const part = await reader.read(); if (part.done) break;
          size += part.value.byteLength; if (size > limit) throw new Error(t('Remote backup exceeds 128 MiB.', 'Cadangan remote melebihi 128 MiB.'));
          chunks.push(part.value.buffer.slice(part.value.byteOffset, part.value.byteOffset + part.value.byteLength) as ArrayBuffer);
        }
      } catch (reason) { await reader.cancel(); throw reason; }
      finally { reader.releaseLock(); }
      const result = await restoreLibrary(new File(chunks, 'sela-sync.zip', { type: 'application/zip' }));
      await store.refresh(); setEtag(response.headers.get('etag')); setConflicts(result.conflicts);
      setMessage(t(`${result.added} books added; ${result.kept} existing books kept.`, `${result.added} buku ditambahkan; ${result.kept} buku lokal dipertahankan.`));
    } catch (reason) { setError(reason instanceof Error ? reason.message : t('Could not read the remote backup.', 'Cadangan remote belum dapat dibaca.')); }
    finally { setBusy(''); }
  };

  const push = async () => {
    setBusy('push'); setError(''); setMessage('');
    try {
      const { endpoint, headers } = config();
      const archive = await exportLibrary();
      const response = await fetch(endpoint, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/zip', ...(etag ? { 'If-Match': etag } : { 'If-None-Match': '*' }) }, body: archive, credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(60000) });
      if (response.status === 412) throw new Error(t('The remote backup changed. Pull it first to review updates.', 'Cadangan remote berubah. Tarik dahulu untuk meninjau pembaruan.'));
      if (!response.ok) throw new Error(t(`Sync server returned ${response.status}.`, `Server sinkronisasi mengembalikan ${response.status}.`));
      setEtag(response.headers.get('etag')); setMessage(t('Backup synchronized. Your credentials remain in this session only.', 'Cadangan tersinkron. Kredensial hanya berlaku selama sesi ini.'));
    } catch (reason) { setError(reason instanceof Error ? reason.message : t('Could not send the remote backup.', 'Cadangan belum dapat dikirim.')); }
    finally { setBusy(''); }
  };

  const merge = async (conflict: SyncResult['conflicts'][number]) => {
    try {
      await mergeRemoteReading(conflict); await store.refresh();
      setConflicts(rows => rows.filter(item => item.id !== conflict.id));
      notifications.show({ message: t(`Remote reading merged for ${conflict.name}.`, `Progres remote ${conflict.name} digabung.`), color: 'quill' });
    } catch (reason) { setError(reason instanceof Error ? reason.message : t('Reading data could not be merged.', 'Data baca belum bisa digabung.')); }
  };

  return <Card className="settings-panel personal-tools-card" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('OPTIONAL PRIVATE SYNC', 'SINKRON PRIBADI OPSIONAL')}</Text><Title order={2}>WebDAV</Title><Text>{t('Use an HTTPS backup endpoint that allows browser CORS. Pull merges new books and keeps local reading by default. Passwords are never saved.', 'Gunakan alamat cadangan HTTPS yang mengizinkan CORS browser. Tarik menambahkan buku baru dan mempertahankan progres lokal. Kata sandi tidak pernah disimpan.')}</Text></div>
    <Stack gap="sm">
      <TextInput label={t('Backup file URL', 'URL file cadangan')} placeholder="https://…/sela.zip" value={url} onChange={event => setUrl(event.currentTarget.value)} autoComplete="url" />
      <Group grow><TextInput label={t('Username (optional)', 'Username (opsional)')} value={username} onChange={event => setUsername(event.currentTarget.value)} autoComplete="username" /><PasswordInput label={t('Password (session only)', 'Kata sandi (sesi ini saja)')} value={password} onChange={event => setPassword(event.currentTarget.value)} autoComplete="current-password" /></Group>
      <Text size="xs" c="dimmed">{t('This endpoint must permit HTTPS GET/PUT, CORS, and conditional headers. A failed push never overwrites a changed remote copy.', 'Alamat ini harus mengizinkan HTTPS GET/PUT, CORS, dan header kondisional. Push gagal tanpa menimpa salinan remote yang berubah.')}</Text>
      {error && <Alert color="red" role="alert">{error}</Alert>}{message && <Alert color="quill" role="status">{message}</Alert>}
      <Group><Button variant="default" onClick={() => void pull()} loading={busy === 'pull'} disabled={!!busy || !url.trim()}>{t('Pull and merge', 'Tarik dan gabungkan')}</Button><Button onClick={() => void push()} loading={busy === 'push'} disabled={!!busy || !url.trim()}>{t('Push backup safely', 'Kirim cadangan dengan aman')}</Button></Group>
      {conflicts.length > 0 && <Stack gap="xs" className="webdav-conflicts"><Title order={3}>{t('Review reading from another device', 'Tinjau bacaan dari perangkat lain')}</Title><Text size="sm" c="dimmed">{t('Local reading stays by default. Merge imports remote progress, adds bookmarks and highlights, and keeps different notes as copies.', 'Bacaan lokal tetap dipakai secara default. Gabungkan untuk mengambil progres, penanda, dan sorotan remote serta menyimpan perbedaan catatan sebagai salinan.')}</Text>
        {conflicts.map(conflict => <details key={conflict.id}><summary>{conflict.name} · {conflict.progress} / {conflict.total}</summary><pre>{(() => { try { return Object.entries(JSON.parse(conflict.reading.notes || '{}')).map(([page, note]) => `${page} · ${note}`).join('\n') || t('No remote notes.', 'Tidak ada catatan remote.'); } catch { return t('Remote notes are unavailable for preview.', 'Catatan remote belum bisa dipratinjau.'); } })()}</pre><Button size="compact-sm" onClick={() => void merge(conflict)}>{t('Merge this reading', 'Gabungkan progres ini')}</Button></details>)}
      </Stack>}
    </Stack>
  </Card>;
}
