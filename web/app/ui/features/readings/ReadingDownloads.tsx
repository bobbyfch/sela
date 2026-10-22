import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { Trash2 } from 'lucide-react';
import { isHostedPack, listRecords, removePack, type PackRecord } from '../../../../../app/library/content-packs.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { FAITH_LABELS } from './faith-labels.ts';
import { forgetReadingPack } from './readings-state.ts';

const sizeLabel = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

export default function ReadingDownloads() {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [records, setRecords] = useState<PackRecord[]>([]);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<PackRecord | null>(null);

  const refresh = useCallback(async () => {
    try { setRecords(await listRecords()); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t('Browser storage is unavailable.', 'Penyimpanan peramban tidak tersedia.')); }
  }, [lang]);
  useEffect(() => { void refresh(); }, [refresh]);

  const confirmRemove = async () => {
    const target = removing;
    if (!target) return;
    try { await removePack(target.id); forgetReadingPack(target.id); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t('It could not be removed.', 'Tidak dapat dihapus.')); }
    setRemoving(null);
  };

  const total = records.reduce((sum, record) => sum + record.bytes, 0);
  const titleOf = (record: PackRecord) => isHostedPack(record) ? (lang === 'id' ? record.manifest.title.id : record.manifest.title.en) : record.info.title;
  const detailOf = (record: PackRecord) => isHostedPack(record)
    ? record.manifest.faiths.map(faith => lang === 'id' ? FAITH_LABELS[faith].id : FAITH_LABELS[faith].en).join(', ')
    : record.info.publisher.label;

  return <Card className="settings-panel" withBorder radius="xl" padding="lg">
    <div>
      <Text className="page-eyebrow">{t('FAITH READINGS', 'BACAAN AGAMA')}</Text>
      <Title order={2}>{t('Downloaded readings', 'Bacaan terunduh')}</Title>
      <Text>{t('Readings you saved for offline use. Removing one never touches your books, notes, bookmarks or backups.', 'Bacaan yang kamu simpan untuk offline. Menghapusnya tidak menyentuh buku, catatan, penanda, atau cadanganmu.')}</Text>
    </div>
    {error && <Alert color="yellow" role="alert">{error}</Alert>}
    {!records.length && !error && <Text size="sm" c="dimmed" role="status">{t('Nothing downloaded yet. Open the Faith tab on your shelf to add readings.', 'Belum ada yang diunduh. Buka tab Agama di rak bukumu untuk menambah bacaan.')}</Text>}
    {records.length > 0 && <Stack gap="xs" component="ul" className="readings-downloads">
      {records.map(record => <li key={record.id} className="readings-download-row">
        <div><strong>{titleOf(record)}</strong><Text size="xs" c="dimmed">{detailOf(record)} · {sizeLabel(record.bytes)}</Text></div>
        <Button variant="subtle" color="red" size="compact-md" leftSection={<Trash2 size={15} />} aria-label={`${t('Remove', 'Hapus')} ${titleOf(record)}`} onClick={() => setRemoving(record)}>{t('Remove', 'Hapus')}</Button>
      </li>)}
    </Stack>}
    {records.length > 0 && <Text size="sm">{t(`Total on this device: ${sizeLabel(total)}`, `Total di perangkat ini: ${sizeLabel(total)}`)}</Text>}
    <Modal opened={!!removing} onClose={() => setRemoving(null)} title={t('Remove this download?', 'Hapus unduhan ini?')} centered>
      <Text size="sm">{removing ? titleOf(removing) : ''}</Text>
      <Text size="sm" mt="xs">{t('It is deleted from this device only. You can download it again later.', 'Hanya dihapus dari perangkat ini. Kamu bisa mengunduhnya lagi nanti.')}</Text>
      <Group mt="md" justify="flex-end"><Button variant="default" onClick={() => setRemoving(null)}>{t('Keep it', 'Simpan')}</Button><Button color="red" onClick={() => void confirmRemove()}>{t('Remove', 'Hapus')}</Button></Group>
    </Modal>
  </Card>;
}
