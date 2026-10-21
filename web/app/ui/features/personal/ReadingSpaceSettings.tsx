import { useEffect, useState } from 'react';
import { Alert, Button, Card, FileButton, Group, Select, Stack, Switch, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getAsset, setAsset } from '../../../../../app/library/storage.ts';
import { editPersonal, readPersonal, type PersonalData } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

const topics: [PersonalData['quoteTopic'], string, string][] = [
  ['reading', 'Reading', 'Membaca'], ['calm', 'Calm', 'Ketenangan'], ['courage', 'Courage', 'Keberanian'],
  ['life', 'Life', 'Kehidupan'], ['friendship', 'Friendship', 'Persahabatan'], ['creativity', 'Creativity', 'Kreativitas'], ['spiritual', 'Reflection', 'Renungan'],
];

export function ReadingSpaceSettings() {
  const { lang } = useWorkspace();
  const [personal, setPersonal] = useState(() => readPersonal());
  const [background, setBackground] = useState<Blob | null>(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const t = (en: string, id: string) => copy(lang, en, id);

  useEffect(() => {
    let objectUrl = '';
    let alive = true;
    void getAsset('home-background').then(blob => {
      if (!alive) return;
      setBackground(blob || null);
      if (blob) { objectUrl = URL.createObjectURL(blob); setPreview(objectUrl); }
    }).catch(reason => { if (alive) setError(reason instanceof Error ? reason.message : t('Background could not be loaded.', 'Latar belum bisa dimuat.')); });
    const sync = () => setPersonal(readPersonal());
    document.addEventListener('sela:personal', sync);
    return () => { alive = false; document.removeEventListener('sela:personal', sync); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, []);

  const update = (change: (data: PersonalData) => void) => {
    try { editPersonal(change); setPersonal(readPersonal()); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t('Reading space preferences could not be saved.', 'Preferensi ruang baca belum bisa disimpan.')); }
  };
  const chooseBackground = async (file: File | null) => {
    if (!file) return;
    setBusy(true); setError('');
    try {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) throw new Error(t('Choose a JPG, PNG, WebP or AVIF image.', 'Pilih gambar JPG, PNG, WebP, atau AVIF.'));
      if (!file.size || file.size > 8 * 1048576) throw new Error(t('Choose an image smaller than 8 MiB.', 'Pilih gambar di bawah 8 MiB.'));
      if (typeof createImageBitmap === 'function') {
        const bitmap = await createImageBitmap(file); const valid = bitmap.width >= 320 && bitmap.height >= 200 && bitmap.width <= 12000 && bitmap.height <= 12000; bitmap.close();
        if (!valid) throw new Error(t('Choose an image between 320 × 200 and 12000 × 12000 pixels.', 'Pilih gambar antara 320 × 200 hingga 12000 × 12000 piksel.'));
      }
      await setAsset('home-background', file);
      const url = URL.createObjectURL(file); if (preview) URL.revokeObjectURL(preview);
      setBackground(file); setPreview(url); document.dispatchEvent(new Event('sela:background'));
      notifications.show({ message: t('Background saved on this device.', 'Latar tersimpan di perangkat ini.'), color: 'quill' });
    } catch (reason) { setError(reason instanceof Error ? reason.message : t('Background could not be saved.', 'Latar belum bisa disimpan.')); }
    finally { setBusy(false); }
  };
  const restoreBackground = async () => {
    setBusy(true); setError('');
    try { await setAsset('home-background', null); if (preview) URL.revokeObjectURL(preview); setBackground(null); setPreview(''); document.dispatchEvent(new Event('sela:background')); }
    catch (reason) { setError(reason instanceof Error ? reason.message : t('Background could not be removed.', 'Latar belum bisa dihapus.')); }
    finally { setBusy(false); }
  };

  return <Card className="settings-panel personal-tools-card reading-space-settings" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('YOUR READING SPACE', 'RUANG BACAMU')}</Text><Title order={2}>{t('Make the room feel like yours', 'Beri sentuhan personal pada ruang baca')}</Title><Text>{t('Set a quiet name, a soft photo background and the subject of your daily reflection. No mascot or external image is added.', 'Atur nama ruang, latar foto yang lembut, dan tema refleksi harian. Tidak ada maskot atau gambar eksternal yang ditambahkan.')}</Text></div>
    {error && <Alert color="red" role="alert">{error}</Alert>}
    <Stack gap="md">
      <TextInput label={t('Room name', 'Nama ruang')} value={personal.room} onChange={event => update(data => { data.room = event.currentTarget.value.slice(0, 80); })} maxLength={80} placeholder={t('A little reading room', 'Ruang baca kecil')} />
      <Switch checked={personal.quiet} onChange={event => update(data => { data.quiet = event.currentTarget.checked; })} label={t('Quiet reading space', 'Ruang baca tenang')} description={t('Soften the photo background and keep visual atmosphere subdued.', 'Lembutkan latar foto dan kurangi suasana visual.')}/>
      <Select label={t('Daily reflection topic', 'Tema refleksi harian')} value={personal.quoteTopic} onChange={value => update(data => { data.quoteTopic = value || 'reading'; })} data={topics.map(([value, en, id]) => ({ value, label: t(en, id) }))} allowDeselect={false} />
      <Select label={t('Reflection language', 'Bahasa refleksi')} value={personal.quoteLanguage} onChange={value => update(data => { data.quoteLanguage = value || 'auto'; })} data={[{ value: 'auto', label: t('Follow app language', 'Ikuti bahasa aplikasi') }, { value: 'id', label: 'Bahasa Indonesia' }, { value: 'en', label: 'English' }]} allowDeselect={false} />
      <Group><FileButton onChange={file => void chooseBackground(file)} accept="image/jpeg,image/png,image/webp,image/avif">{props => <Button {...props} variant="default" loading={busy}>{t('Choose background image', 'Pilih gambar latar')}</Button>}</FileButton>{background && <Button variant="subtle" color="gray" onClick={() => void restoreBackground()} loading={busy}>{t('Restore paper background', 'Kembalikan latar kertas')}</Button>}</Group>
      {preview && <img className="reading-space-preview" src={preview} alt={t('Preview of the saved reading space background', 'Pratinjau latar ruang baca tersimpan')} />}
    </Stack>
  </Card>;
}
