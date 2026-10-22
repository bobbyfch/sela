import { useEffect, useState } from 'react';
import { Card, NumberInput, Select, Stack, Switch, Text, Title } from '@mantine/core';
import { editPersonal, readPersonal, type PersonalData } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

const faithOptions: [PersonalData['faith'], string, string][] = [
  ['none', 'No preference', 'Tidak memilih'], ['islam', 'Islam', 'Islam'],
  ['protestantism', 'Protestant Christianity', 'Kristen Protestan'], ['catholicism', 'Catholic Christianity', 'Katolik'],
  ['hinduism', 'Hinduism', 'Hindu'], ['buddhism', 'Buddhism', 'Buddha'], ['confucianism', 'Confucianism', 'Konghucu'],
];

export function PersonalPreferences() {
  const { lang } = useWorkspace();
  const [personal, setPersonal] = useState(() => readPersonal());
  const t = (en: string, id: string) => copy(lang, en, id);
  useEffect(() => { const sync = () => setPersonal(readPersonal()); document.addEventListener('sela:personal', sync); return () => document.removeEventListener('sela:personal', sync); }, []);
  const update = (change: (data: PersonalData) => void) => { try { editPersonal(change); setPersonal(readPersonal()); } catch { /* Keep the existing preference visible if storage is unavailable. */ } };
  const week = personal.sessions.filter(session => Date.now() - session.at < 7 * 86400000).reduce((sum, session) => sum + session.seconds, 0);

  return <Card className="settings-panel personal-tools-card" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('PERSONAL READING', 'PREFERENSI MEMBACA')}</Text><Title order={2}>{t('A reading practice that fits you', 'Kebiasaan membaca yang sesuai untukmu')}</Title><Text>{t('These choices are optional and stay on this device.', 'Pilihan ini opsional dan tersimpan di perangkat ini.')}</Text></div>
    <Stack gap="md">
      <Switch label={t('Quiet reading space', 'Ruang baca tenang')} description={t('Use a calmer home atmosphere.', 'Gunakan suasana beranda yang lebih tenang.')} checked={personal.quiet} onChange={event => update(data => { data.quiet = event.currentTarget.checked; })} />
      <Switch label={t('Show focus timer on Home', 'Tampilkan timer fokus di Beranda')} description={t('Keep a small timer beside your reading tools.', 'Tampilkan timer di antara alat bacaan.')} checked={!personal.hidden.includes('timer')} onChange={event => update(data => { data.hidden = event.currentTarget.checked ? data.hidden.filter(item => item !== 'timer') : [...new Set([...data.hidden, 'timer'])]; })} />
      <Switch label={t('Rediscover books', 'Temukan kembali buku')} description={t('Show a quiet suggestion from your own shelf.', 'Tampilkan saran buku dari rakmu sendiri.')} checked={!personal.hidden.includes('rediscover')} onChange={event => update(data => { data.hidden = event.currentTarget.checked ? data.hidden.filter(item => item !== 'rediscover') : [...new Set([...data.hidden, 'rediscover'])]; })} />
      <Select label={t('Faith or tradition', 'Agama atau tradisi')} description={t('Shapes the Faith tab on your shelf, the daily sourced reading, and prayer tools on Home. Choose “No preference” to hide all of them.', 'Menentukan tab Agama di rak, bacaan harian bersumber, dan alat ibadah di Beranda. Pilih “Tidak memilih” untuk menyembunyikan semuanya.')} value={personal.faith} onChange={value => update(data => { data.faith = (value || 'none') as PersonalData['faith']; })} data={faithOptions.map(([value, en, id]) => ({ value, label: t(en, id) }))} allowDeselect={false} />
      <Select label={t('Gender preference (optional)', 'Preferensi gender (opsional)')} description={t('Used only to personalize language where relevant.', 'Hanya dipakai untuk penyesuaian bahasa jika relevan.')} value={personal.gender} onChange={value => update(data => { data.gender = (value || 'unspecified') as PersonalData['gender']; })} data={[
        { value: 'unspecified', label: t('Prefer not to say', 'Tidak ingin menyebutkan') }, { value: 'woman', label: t('Woman', 'Perempuan') },
        { value: 'man', label: t('Man', 'Laki-laki') }, { value: 'nonbinary', label: t('Non-binary', 'Nonbiner') }, { value: 'another', label: t('Another identity', 'Identitas lain') },
      ]} allowDeselect={false} />
      <NumberInput label={t('Weekly reading goal (minutes)', 'Target membaca mingguan (menit)')} description={t('Set 0 to turn the goal off.', 'Isi 0 untuk menonaktifkan target.')} value={personal.weeklyTarget || 0} onChange={value => update(data => { data.weeklyTarget = Math.max(0, Math.min(6000, Number(value) || 0)); })} min={0} max={6000} step={15} />
      <Text size="sm" c="dimmed">{t(`${Math.round(week / 60)} minutes read in the last 7 days`, `${Math.round(week / 60)} menit membaca dalam 7 hari terakhir`)}</Text>
    </Stack>
  </Card>;
}
