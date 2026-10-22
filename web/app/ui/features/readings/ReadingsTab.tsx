import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Anchor, Button, Card, Group, Modal, Progress, Skeleton, Text, TextInput, Title } from '@mantine/core';
import { ArrowDownToLine, ArrowUpRight, BookOpen, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { fetchPackIndex, installPack, isProphetPack, listInstalledPacks, packUpdateAvailable, removePack, type InstalledPack, type PackFaith, type PackManifest } from '../../../../../app/library/content-packs.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import BuiltinEditions from './BuiltinEditions.tsx';
import { FAITH_LABELS } from './faith-labels.ts';
import PublisherPacks from './PublisherPacks.tsx';
import SavedReadings from './SavedReadings.tsx';
import { forgetReadingPack, lastReadingEntry } from './readings-state.ts';

type Catalogue = { state: 'loading' } | { state: 'ready'; packs: PackManifest[] } | { state: 'error'; message: string };
type Progress = { received: number; total: number };

const sizeLabel = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

function entryExists(pack: InstalledPack, entry: string): boolean {
  if (isProphetPack(pack)) return pack.payload.articles.some(article => article.slug === entry);
  const [workId, sectionId] = entry.split('/');
  return pack.payload.works.some(work => work.id === workId && work.sections.some(section => section.id === sectionId));
}

export default function ReadingsTab({ faith }: { faith: PackFaith }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const navigate = useNavigate();
  const [catalogue, setCatalogue] = useState<Catalogue>({ state: 'loading' });
  const [installed, setInstalled] = useState<InstalledPack[]>([]);
  const [storageError, setStorageError] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState<Record<string, Progress>>({});
  const [failure, setFailure] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [removing, setRemoving] = useState<InstalledPack | null>(null);
  const controllers = useRef(new Map<string, AbortController>());
  const label = FAITH_LABELS[faith];

  const refreshInstalled = useCallback(async () => {
    try { setInstalled(await listInstalledPacks()); setStorageError(''); }
    catch (reason) { setStorageError(reason instanceof Error ? reason.message : t('Browser storage is unavailable.', 'Penyimpanan peramban tidak tersedia.')); }
  }, [lang]);

  const loadCatalogue = useCallback(() => {
    const controller = new AbortController();
    setCatalogue({ state: 'loading' });
    fetchPackIndex(controller.signal).then(index => setCatalogue({ state: 'ready', packs: index.packs }))
      .catch(reason => { if (!controller.signal.aborted) setCatalogue({ state: 'error', message: reason instanceof Error ? reason.message : t('The catalogue could not be loaded.', 'Katalog belum dapat dimuat.') }); });
    return () => controller.abort();
  }, [lang]);

  useEffect(() => loadCatalogue(), [loadCatalogue]);
  useEffect(() => { void refreshInstalled(); }, [refreshInstalled]);
  useEffect(() => () => { for (const controller of controllers.current.values()) controller.abort(); }, []);

  const listed = catalogue.state === 'ready' ? catalogue.packs : [];
  const rows = useMemo(() => {
    const byId = new Map<string, { manifest: PackManifest; installed?: InstalledPack; listed: boolean }>();
    for (const manifest of listed) if (manifest.faiths.includes(faith)) byId.set(manifest.id, { manifest, listed: true });
    for (const pack of installed) if (pack.manifest.faiths.includes(faith)) byId.set(pack.id, { manifest: byId.get(pack.id)?.manifest ?? pack.manifest, installed: pack, listed: byId.has(pack.id) });
    const needle = query.trim().toLowerCase();
    return [...byId.values()].filter(({ manifest, installed: pack }) => {
      if (!needle) return true;
      const entries = !pack ? [] : isProphetPack(pack) ? pack.payload.articles.flatMap(article => [article.name, article.lede]) : pack.payload.works.flatMap(work => [work.title, work.author ?? '']);
      return [manifest.title.id, manifest.title.en, manifest.description.id, manifest.description.en, ...entries].join(' ').toLowerCase().includes(needle);
    });
  }, [listed, installed, query, faith]);

  const download = async (manifest: PackManifest) => {
    const controller = new AbortController();
    controllers.current.set(manifest.id, controller);
    setFailure(current => { const { [manifest.id]: _, ...rest } = current; return rest; });
    setNotice('');
    setBusy(current => ({ ...current, [manifest.id]: { received: 0, total: manifest.payload.bytes } }));
    try {
      await installPack(manifest, controller.signal, (received, total) => setBusy(current => ({ ...current, [manifest.id]: { received, total } })));
      await refreshInstalled();
      setNotice(t(`“${manifest.title.en}” is ready to read offline.`, `“${manifest.title.id}” siap dibaca tanpa internet.`));
    } catch (reason) {
      if (controller.signal.aborted) setNotice(t('Download cancelled. Nothing was saved.', 'Unduhan dibatalkan. Tidak ada yang disimpan.'));
      else setFailure(current => ({ ...current, [manifest.id]: reason instanceof Error ? reason.message : t('The download failed.', 'Unduhan gagal.') }));
    } finally {
      controllers.current.delete(manifest.id);
      setBusy(current => { const { [manifest.id]: _, ...rest } = current; return rest; });
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    const target = removing;
    try {
      await removePack(target.id);
      forgetReadingPack(target.id);
      await refreshInstalled();
      setNotice(t('Removed from this device. Your shelf, notes and progress were not touched.', 'Dihapus dari perangkat ini. Rak, catatan, dan progres bacamu tidak berubah.'));
    } catch (reason) { setFailure(current => ({ ...current, [target.id]: reason instanceof Error ? reason.message : t('It could not be removed.', 'Tidak dapat dihapus.') })); }
    setRemoving(null);
  };

  const open = (pack: InstalledPack) => {
    const last = lastReadingEntry(pack.id);
    navigate(last && entryExists(pack, last) ? `/readings/${pack.id}/${last}` : `/readings/${pack.id}`);
  };

  const countLabel = (manifest: PackManifest) => manifest.kind === 'text-collection' ? t(`${manifest.itemCount} works`, `${manifest.itemCount} karya`) : t(`${manifest.itemCount} stories`, `${manifest.itemCount} kisah`);
  const statusLabel = (manifest: PackManifest) => manifest.status === 'pilot' ? t('Pilot', 'Rintisan') : manifest.status === 'draft' ? t('Draft', 'Draf') : t('Complete', 'Lengkap');

  return <div className="readings-landing">
    <section className="readings-intro" aria-labelledby="readings-title">
      <Text className="page-eyebrow">{t('FAITH READINGS', 'BACAAN AGAMA')}</Text>
      <Title id="readings-title" order={2}>{lang === 'id' ? label.id : label.en}</Title>
      <p className="readings-lede">{lang === 'id' ? label.ledeId : label.ledeEn} {t('Nothing downloads until you choose it, and nothing is added to your books.', 'Tidak ada yang diunduh sebelum kamu memilih, dan tidak ada yang masuk ke daftar bukumu.')}</p>
      <TextInput className="readings-search" type="search" leftSection={<Search size={16} aria-hidden="true" />} aria-label={t('Search readings', 'Cari bacaan')} placeholder={t('Search readings and downloaded entries', 'Cari bacaan dan entri yang sudah diunduh')} value={query} onChange={event => setQuery(event.currentTarget.value)} />
    </section>
    <SavedReadings />
    <div aria-live="polite" className="readings-status">{notice && <Alert color="green" withCloseButton closeButtonLabel={t('Dismiss', 'Tutup')} onClose={() => setNotice('')}>{notice}</Alert>}</div>
    {storageError && <Alert color="yellow" role="alert" title={t('Downloads cannot be saved here', 'Unduhan tidak dapat disimpan di sini')}>{storageError}</Alert>}
    {catalogue.state === 'loading' && <div role="status" aria-label={t('Loading readings…', 'Memuat bacaan…')}><Skeleton height={150} radius="xl" /></div>}
    {catalogue.state === 'error' && <Alert color={installed.length ? 'yellow' : 'red'} role="alert" title={navigator.onLine ? t('The catalogue could not be loaded', 'Katalog belum dapat dimuat') : t('You are offline', 'Kamu sedang offline')}>
      {installed.length ? t('Readings already on this device are still available below.', 'Bacaan yang sudah ada di perangkat ini tetap bisa dibuka di bawah.') : catalogue.message}
      <br /><Button mt="sm" variant="default" leftSection={<RefreshCw size={14} />} onClick={loadCatalogue}>{t('Try again', 'Coba lagi')}</Button>
    </Alert>}
    <div className="readings-grid">
      {rows.map(({ manifest, installed: pack, listed: isListed }) => {
        const progress = busy[manifest.id];
        const listedManifest = listed.find(item => item.id === manifest.id);
        const update = !!(pack && listedManifest && packUpdateAvailable(pack, listedManifest));
        const last = pack ? lastReadingEntry(pack.id) : undefined;
        return <Card key={manifest.id} className="readings-card" withBorder radius="lg" padding="lg" component="article" aria-labelledby={`readings-${manifest.id}`}>
          <Group gap={6} mb={6}>
            {manifest.status !== 'complete' && <span className="readings-badge" data-tone="draft">{statusLabel(manifest)}</span>}
            <span className="readings-badge">{pack ? t('Downloaded', 'Terunduh') : t('Available', 'Tersedia')}</span>
            {pack && <span className="readings-badge">{t('Works offline', 'Bisa offline')}</span>}
          </Group>
          <Title id={`readings-${manifest.id}`} order={3}>{lang === 'id' ? manifest.title.id : manifest.title.en}</Title>
          <Text className="readings-card-text">{lang === 'id' ? manifest.description.id : manifest.description.en}</Text>
          <dl className="readings-facts">
            <div><dt>{t('Contents', 'Isi')}</dt><dd>{countLabel(manifest)}</dd></div>
            <div><dt>{t('Language', 'Bahasa')}</dt><dd>{manifest.language === 'id' ? 'Indonesia' : manifest.language === 'en' ? 'English' : manifest.language.toUpperCase()}</dd></div>
            <div><dt>{t('Licence', 'Lisensi')}</dt><dd>{manifest.license.name}</dd></div>
            <div><dt>{t('Edition', 'Edisi')}</dt><dd>{manifest.edition}</dd></div>
            <div><dt>{t('Download size', 'Ukuran unduhan')}</dt><dd>{sizeLabel(manifest.payload.bytes)}</dd></div>
          </dl>
          <p className="readings-sources">{t('Sources', 'Sumber')}: {manifest.source.map((source, index) => <span key={source.url}>{index > 0 && ', '}<Anchor href={source.url} target="_blank" rel="noopener noreferrer" size="xs">{source.label} <ArrowUpRight size={11} aria-hidden="true" /></Anchor></span>)}</p>
          {progress && <div className="readings-progress"><Progress value={Math.min(100, (progress.received / progress.total) * 100)} aria-label={t('Download progress', 'Kemajuan unduhan')} /><Text size="xs">{sizeLabel(progress.received)} / {sizeLabel(progress.total)}</Text></div>}
          {failure[manifest.id] && <Alert color="red" role="alert" mt="sm">{failure[manifest.id]}</Alert>}
          <Group mt="md" gap="xs">
            {pack && !progress && <Button leftSection={<BookOpen size={16} />} onClick={() => open(pack)}>{last && entryExists(pack, last) ? t('Continue reading', 'Lanjut membaca') : t('Read', 'Baca')}</Button>}
            {!pack && !progress && <Button leftSection={<ArrowDownToLine size={16} />} onClick={() => void download(manifest)}>{t('Download for offline', 'Unduh untuk offline')}</Button>}
            {update && !progress && <Button variant="default" leftSection={<RefreshCw size={16} />} onClick={() => void download(listedManifest!)}>{t('Update', 'Perbarui')}</Button>}
            {progress && <Button variant="default" leftSection={<X size={16} />} onClick={() => controllers.current.get(manifest.id)?.abort()}>{t('Cancel', 'Batalkan')}</Button>}
            {pack && !progress && <Button variant="subtle" color="red" leftSection={<Trash2 size={16} />} onClick={() => setRemoving(pack)}>{t('Remove', 'Hapus')}</Button>}
          </Group>
          {pack && !isListed && <Text size="xs" mt="xs">{t('This reading is no longer in the catalogue; your copy still works.', 'Bacaan ini sudah tidak ada di katalog; salinanmu tetap bisa dibaca.')}</Text>}
        </Card>;
      })}
    </div>
    {catalogue.state === 'ready' && !rows.length && <Text role="status" className="readings-empty">{query.trim() ? t('No reading matches that search.', 'Tidak ada bacaan yang cocok dengan pencarian itu.') : t('No downloadable readings are listed for this tradition yet.', 'Belum ada bacaan yang bisa diunduh untuk tradisi ini.')}</Text>}
    {faith === 'islam' && <PublisherPacks query={query} />}
    <BuiltinEditions faith={faith} query={query} />
    <Modal opened={!!removing} onClose={() => setRemoving(null)} title={t('Remove this reading?', 'Hapus bacaan ini?')} centered>
      <Text size="sm">{t('The downloaded copy is deleted from this device. Your shelf, backups, notes and reading progress stay as they are. You can download it again later.', 'Salinan unduhan dihapus dari perangkat ini. Rak, cadangan, catatan, dan progres bacamu tidak berubah. Kamu bisa mengunduhnya lagi nanti.')}</Text>
      <Group mt="md" justify="flex-end"><Button variant="default" onClick={() => setRemoving(null)}>{t('Keep it', 'Simpan')}</Button><Button color="red" onClick={() => void confirmRemove()}>{t('Remove', 'Hapus')}</Button></Group>
    </Modal>
  </div>;
}
