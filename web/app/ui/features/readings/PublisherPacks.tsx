import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Anchor, Button, Card, Group, Modal, Progress, SegmentedControl, Text, Title } from '@mantine/core';
import { ArrowDownToLine, ArrowUpRight, BookOpen, RefreshCw, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { removePack, type InstalledSourcePack, type SourcePackInfo } from '../../../../../app/library/content-packs.ts';
import { editPersonal, readPersonal } from '../../../../../app/library/personal-store.ts';
import { installSourcePack, listHadithCollections, listInstalledSourcePacks, listQuranEditions, sourcePackOutdated, type SourceLanguage } from '../../../../../app/library/source-packs.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

type Listing = { state: 'idle' } | { state: 'loading' } | { state: 'ready'; items: SourcePackInfo[] } | { state: 'error'; message: string };
type Progress = { done: number; total: number };

const megabytes = (bytes: number) => bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

export default function PublisherPacks({ query }: { query: string }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const navigate = useNavigate();
  const [installed, setInstalled] = useState<InstalledSourcePack[]>([]);
  const [quran, setQuran] = useState<Listing>({ state: 'idle' });
  const [hadith, setHadith] = useState<Listing>({ state: 'idle' });
  const [busy, setBusy] = useState<Record<string, Progress>>({});
  const [failure, setFailure] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [language, setLanguage] = useState<SourceLanguage>(lang === 'id' ? 'id' : 'en');
  const [removing, setRemoving] = useState<InstalledSourcePack | null>(null);
  const controllers = useRef(new Map<string, AbortController>());
  const listControllers = useRef(new Set<AbortController>());

  const refresh = useCallback(async () => { try { setInstalled(await listInstalledSourcePacks()); } catch { setInstalled([]); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => () => { for (const controller of [...controllers.current.values(), ...listControllers.current]) controller.abort(); }, []);

  const load = (set: (listing: Listing) => void, fetcher: (signal: AbortSignal) => Promise<SourcePackInfo[]>) => {
    const controller = new AbortController();
    listControllers.current.add(controller);
    set({ state: 'loading' });
    fetcher(controller.signal).then(items => set({ state: 'ready', items }))
      .catch(reason => { if (!controller.signal.aborted) set({ state: 'error', message: reason instanceof Error ? reason.message : t('The source could not be reached.', 'Sumber belum dapat dijangkau.') }); })
      .finally(() => listControllers.current.delete(controller));
  };

  const download = async (info: SourcePackInfo) => {
    const controller = new AbortController();
    controllers.current.set(info.id, controller);
    setFailure(current => { const { [info.id]: _, ...rest } = current; return rest; });
    setNotice('');
    setBusy(current => ({ ...current, [info.id]: { done: 0, total: info.kind === 'quran-edition' ? 114 : info.itemCount } }));
    try {
      await installSourcePack(info, controller.signal, (done, total) => setBusy(current => ({ ...current, [info.id]: { done, total } })));
      await refresh();
      setNotice(t(`“${info.title}” is saved on this device.`, `“${info.title}” tersimpan di perangkat ini.`));
    } catch (reason) {
      if (controller.signal.aborted) setNotice(t('Download cancelled. Nothing was saved.', 'Unduhan dibatalkan. Tidak ada yang disimpan.'));
      else setFailure(current => ({ ...current, [info.id]: reason instanceof Error ? reason.message : t('The download failed.', 'Unduhan gagal.') }));
    } finally {
      controllers.current.delete(info.id);
      setBusy(current => { const { [info.id]: _, ...rest } = current; return rest; });
    }
  };

  const confirmRemove = async () => {
    const target = removing;
    if (!target) return;
    try { await removePack(target.id); await refresh(); setNotice(t('Removed from this device. Your shelf, notes and progress were not touched.', 'Dihapus dari perangkat ini. Rak, catatan, dan progres bacamu tidak berubah.')); }
    catch (reason) { setFailure(current => ({ ...current, [target.id]: reason instanceof Error ? reason.message : t('It could not be removed.', 'Tidak dapat dihapus.') })); }
    setRemoving(null);
  };

  const read = (pack: InstalledSourcePack) => {
    if (pack.info.kind === 'quran-edition') {
      try { editPersonal(data => { data.quranLanguage = pack.info.language === 'en' ? 'en' : 'id'; data.quranTranslationKey = pack.info.remoteKey; }); } catch { }
      navigate(`/faith/quran/${readPersonal().quranSurah || 1}`);
    } else navigate(`/readings/${pack.id}`);
  };

  const needle = query.trim().toLowerCase();
  const matches = (info: SourcePackInfo) => !needle || `${info.title} ${info.description} ${info.publisher.label}`.toLowerCase().includes(needle);
  const installedIds = useMemo(() => new Set(installed.map(pack => pack.id)), [installed]);
  const listed = useMemo(() => new Map([...(quran.state === 'ready' ? quran.items : []), ...(hadith.state === 'ready' ? hadith.items : [])].map(info => [info.id, info])), [quran, hadith]);
  const available = (listing: Listing) => listing.state === 'ready' ? listing.items.filter(info => !installedIds.has(info.id) && matches(info)) : [];

  const card = (info: SourcePackInfo, pack?: InstalledSourcePack) => {
    const progress = busy[info.id];
    const current = pack?.info ?? info;
    const latest = listed.get(info.id);
    const update = !!(pack && latest && sourcePackOutdated(pack, latest));
    return <Card key={info.id} className="readings-card" withBorder radius="lg" padding="lg" component="article" aria-labelledby={`readings-${info.id}`}>
      <Group gap={6} mb={6}>
        <span className="readings-badge">{pack ? t('Downloaded', 'Terunduh') : t('Available', 'Tersedia')}</span>
        <span className="readings-badge">{info.kind === 'quran-edition' ? t('Quran edition', 'Edisi Al-Qur’an') : t('Hadith', 'Hadis')}</span>
        {pack && <span className="readings-badge">{t('Works offline', 'Bisa offline')}</span>}
      </Group>
      <Title id={`readings-${info.id}`} order={3}>{info.title}</Title>
      {info.description && <Text className="readings-card-text">{info.description}</Text>}
      <dl className="readings-facts">
        <div><dt>{t('Entries', 'Isi')}</dt><dd>{info.kind === 'quran-edition' ? t('114 surahs, 6,236 verses', '114 surah, 6.236 ayat') : t(`${current.itemCount} hadith`, `${current.itemCount} hadis`)}</dd></div>
        <div><dt>{t('Version', 'Versi')}</dt><dd>{current.version}{update && latest ? ` → ${latest.version}` : ''}</dd></div>
        <div><dt>{t('Publisher', 'Penerbit')}</dt><dd>{info.publisher.label}</dd></div>
        <div><dt>{t('Size on device', 'Ukuran di perangkat')}</dt><dd>{pack ? megabytes(pack.bytes) : info.kind === 'quran-edition' ? '≈ 2–3 MB' : t(`about ${Math.max(1, Math.round(info.itemCount * 3.2 / 1024))} MB`, `sekitar ${Math.max(1, Math.round(info.itemCount * 3.2 / 1024))} MB`)}</dd></div>
      </dl>
      <p className="readings-sources">{t('Source', 'Sumber')}: <Anchor href={info.publisher.url} target="_blank" rel="noopener noreferrer" size="xs">{info.publisher.label} <ArrowUpRight size={11} aria-hidden="true" /></Anchor></p>
      {progress && <div className="readings-progress"><Progress value={Math.min(100, (progress.done / Math.max(1, progress.total)) * 100)} aria-label={t('Download progress', 'Kemajuan unduhan')} /><Text size="xs">{progress.done} / {progress.total}</Text></div>}
      {failure[info.id] && <Alert color="red" role="alert" mt="sm">{failure[info.id]}</Alert>}
      <Group mt="md" gap="xs">
        {pack && !progress && <Button leftSection={<BookOpen size={16} />} onClick={() => read(pack)}>{t('Read', 'Baca')}</Button>}
        {!pack && !progress && <Button leftSection={<ArrowDownToLine size={16} />} onClick={() => void download(info)}>{t('Download for offline', 'Unduh untuk offline')}</Button>}
        {pack && !progress && <Button variant="default" leftSection={<RefreshCw size={16} />} onClick={() => void download(latest ?? pack.info)}>{update ? t('Update', 'Perbarui') : t('Download again', 'Unduh ulang')}</Button>}
        {progress && <Button variant="default" leftSection={<X size={16} />} onClick={() => controllers.current.get(info.id)?.abort()}>{t('Cancel', 'Batalkan')}</Button>}
        {pack && !progress && <Button variant="subtle" color="red" leftSection={<Trash2 size={16} />} onClick={() => setRemoving(pack)}>{t('Remove', 'Hapus')}</Button>}
      </Group>
    </Card>;
  };

  const listingBlock = (listing: Listing, retry: () => void) => <>
    {listing.state === 'loading' && <Text role="status" size="sm">{t('Asking the publisher…', 'Menghubungi penerbit…')}</Text>}
    {listing.state === 'error' && <Alert color="red" role="alert">{listing.message}<br /><Button mt="sm" variant="default" leftSection={<RefreshCw size={14} />} onClick={retry}>{t('Try again', 'Coba lagi')}</Button></Alert>}
  </>;

  const shownInstalled = installed.filter(pack => matches(pack.info));
  const quranAvailable = available(quran), hadithAvailable = available(hadith);
  const loadQuran = () => load(setQuran, signal => listQuranEditions(language, signal)), loadHadith = () => load(setHadith, signal => listHadithCollections(language, signal));

  return <section className="readings-sources-panel" aria-labelledby="readings-official-title">
    <Text className="page-eyebrow">{t('FROM THE PUBLISHERS', 'DARI PENERBITNYA')}</Text>
    <Title id="readings-official-title" order={2}>{t('Quran and hadith, saved for offline', 'Al-Qur’an dan hadis, tersimpan untuk offline')}</Title>
    <p className="readings-lede">{t('Sela does not host this text. Your browser downloads it from the publisher when you ask, stores it unchanged with its version, and you can download it again to stay current. Asking for the list contacts the publisher.', 'Sela tidak menyimpan teks ini. Peramban mengunduhnya dari penerbit saat kamu meminta, menyimpannya tanpa perubahan beserta versinya, dan kamu bisa mengunduh ulang agar tetap terbaru. Meminta daftar berarti menghubungi penerbit.')}</p>
    <div aria-live="polite" className="readings-status">{notice && <Alert color="green" withCloseButton closeButtonLabel={t('Dismiss', 'Tutup')} onClose={() => setNotice('')}>{notice}</Alert>}</div>
    <SegmentedControl aria-label={t('Language of the downloads', 'Bahasa unduhan')} value={language} onChange={value => { setLanguage(value as SourceLanguage); setQuran({ state: 'idle' }); setHadith({ state: 'idle' }); }} data={[{ value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }]} />
    <Group gap="xs" mb="md">
      <Button variant="default" loading={quran.state === 'loading'} onClick={loadQuran}>{t('Show Quran editions (QuranEnc)', 'Tampilkan edisi Al-Qur’an (QuranEnc)')}</Button>
      <Button variant="default" loading={hadith.state === 'loading'} onClick={loadHadith}>{t('Show hadith collections (HadeethEnc)', 'Tampilkan koleksi hadis (HadeethEnc)')}</Button>
    </Group>
    {listingBlock(quran, loadQuran)}
    {listingBlock(hadith, loadHadith)}
    <div className="readings-grid">
      {shownInstalled.map(pack => card(pack.info, pack))}
      {quranAvailable.map(info => card(info))}
      {hadithAvailable.map(info => card(info))}
    </div>
    <Modal opened={!!removing} onClose={() => setRemoving(null)} title={t('Remove this download?', 'Hapus unduhan ini?')} centered>
      <Text size="sm">{t('The saved copy is deleted from this device. Your shelf, backups, notes and progress stay as they are. You can download it again later.', 'Salinan tersimpan dihapus dari perangkat ini. Rak, cadangan, catatan, dan progres bacamu tidak berubah. Kamu bisa mengunduhnya lagi nanti.')}</Text>
      <Group mt="md" justify="flex-end"><Button variant="default" onClick={() => setRemoving(null)}>{t('Keep it', 'Simpan')}</Button><Button color="red" onClick={() => void confirmRemove()}>{t('Remove', 'Hapus')}</Button></Group>
    </Modal>
  </section>;
}
