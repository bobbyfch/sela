import { useState } from 'react';
import { Alert, Button, Card, Group, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { BookOpen, BookmarkPlus, Check, Trash2 } from 'lucide-react';
import { readingPreferences } from '../../../../../src/preferences.ts';
import { readProfiles, writeProfiles } from '../../../../../app/library/reader-profiles.ts';

type Profile = { name: string; values: Record<string, unknown> };
const presets: Profile[] = [
  { name: 'Novel', values: { mode: 'single', fit: 'page', filter: 'none', brightness: 1, dim: false, fontFamily: 'serif', fontSize: 20, lineHeight: 1.8, textMargin: 24, textAlign: 'start', pageSurface: 'vellum', paperTexture: true } },
  { name: 'Manga', values: { mode: 'manga', fit: 'page', filter: 'none', brightness: 1, dim: false, paperTexture: false } },
  { name: 'Study', values: { mode: 'single', fit: 'width', filter: 'none', brightness: 1, dim: false, fontFamily: 'sans', fontSize: 18, lineHeight: 1.6, textMargin: 20, textAlign: 'start', paperTexture: false } },
  { name: 'OpenDyslexic', values: { mode: 'single', fit: 'page', filter: 'none', brightness: 1, dim: false, fontFamily: 'opendyslexic', fontSize: 20, lineHeight: 2, textMargin: 28, textAlign: 'start', paperTexture: false } },
  { name: 'Night', values: { mode: 'single', fit: 'page', filter: 'lowblue', brightness: 0.65, dim: true, fontFamily: 'serif', fontSize: 21, lineHeight: 1.9, textMargin: 24, paperTexture: false, lowPower: true } },
];

export function ReaderProfilesPanel({ reader, lang, bookId }: { reader: any; lang: 'en' | 'id'; bookId: string }) {
  const [records, setRecords] = useState<Profile[]>(() => { try { return readProfiles('sela-library:'); } catch { return []; } });
  const selectionKey = `sela-library:reader-profile-selection:${bookId}`;
  const [selectedName, setSelectedName] = useState(() => { try { return sessionStorage.getItem(selectionKey) || ''; } catch { return ''; } });
  const [name, setName] = useState(() => { try { const selected = sessionStorage.getItem(selectionKey); return records.find(record => record.name === selected)?.name || ''; } catch { return ''; } });
  const [deleteCandidate, setDeleteCandidate] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState('');
  const t = (en: string, id: string) => lang === 'id' ? id : en;
  const refresh = () => { try { setRecords(readProfiles('sela-library:')); } catch (reason) { setStatus(reason instanceof Error ? reason.message : t('Profiles could not be read.', 'Profil tidak dapat dibaca.')); } };
  const selectProfile = (value: string) => {
    setSelectedName(value);
    try { if (value) sessionStorage.setItem(selectionKey, value); else sessionStorage.removeItem(selectionKey); } catch { /* Selection only improves the current reading session. */ }
  };

  const apply = async (profile: Profile) => {
    setBusy(profile.name); setStatus('');
    try {
      const values = readingPreferences(profile.values) as Record<string, unknown>;
      if (typeof values.mode === 'string') await reader.setMode(values.mode);
      if (typeof values.fit === 'string') reader.setFit(values.fit);
      reader.setTypography(values);
      selectProfile(records.some(record => record.name === profile.name) ? profile.name : '');
      setName(records.some(record => record.name === profile.name) ? profile.name : '');
      setStatus(t('Profile applied to this book.', 'Profil diterapkan ke buku ini.'));
    } catch (reason) { setStatus(reason instanceof Error ? reason.message : t('Profile could not be applied.', 'Profil belum dapat diterapkan.')); }
    finally { setBusy(''); }
  };
  const saveCurrent = () => {
    const title = name.trim();
    if (!title || title.length > 48) { setStatus(t('Enter a profile name (1–48 characters).', 'Masukkan nama profil (1–48 karakter).')); return; }
    if (records.some(record => record.name.toLocaleLowerCase() === title.toLocaleLowerCase())) { setStatus(t('That name is already in use. Apply its profile or update the selected profile.', 'Nama itu sudah dipakai. Terapkan profilnya atau perbarui profil yang dipilih.')); return; }
    try {
      const values = readingPreferences(reader.options || {});
      setRecords(writeProfiles([...records, { name: title, values }], 'sela-library:')); setName(title); selectProfile(title); setStatus(t('Profile saved on this device.', 'Profil tersimpan di perangkat ini.'));
    } catch (reason) { setStatus(reason instanceof Error ? reason.message : t('Profile could not be saved.', 'Profil belum bisa disimpan.')); }
  };
  const updateSelected = () => {
    const current = records.find(record => record.name === selectedName);
    if (!current) { setStatus(t('Apply a saved profile before updating it.', 'Terapkan profil tersimpan sebelum memperbaruinya.')); return; }
    const title = name.trim() || current.name;
    if (!title || title.length > 48) { setStatus(t('Enter a profile name (1–48 characters).', 'Masukkan nama profil (1–48 karakter).')); return; }
    if (records.some(record => record.name !== current.name && record.name.toLocaleLowerCase() === title.toLocaleLowerCase())) { setStatus(t('Another profile already uses that name.', 'Nama itu sudah dipakai profil lain.')); return; }
    try {
      const values = readingPreferences(reader.options || {});
      const updated = records.map(record => record.name === current.name ? { name: title, values } : record);
      setRecords(writeProfiles(updated, 'sela-library:')); setName(title); selectProfile(title); setStatus(t('Profile updated on this device.', 'Profil diperbarui di perangkat ini.'));
    } catch (reason) { setStatus(reason instanceof Error ? reason.message : t('Profile could not be updated.', 'Profil belum bisa diperbarui.')); }
  };
  const remove = (profile: Profile) => {
    if (deleteCandidate !== profile.name) { setDeleteCandidate(profile.name); setStatus(t(`Remove “${profile.name}”? Choose Delete again to confirm.`, `Hapus “${profile.name}”? Tekan Hapus sekali lagi untuk mengonfirmasi.`)); return; }
    try {
      setRecords(writeProfiles(records.filter(item => item.name !== profile.name), 'sela-library:'));
      if (selectedName === profile.name) { selectProfile(''); setName(''); }
      setDeleteCandidate(''); setStatus(t('Saved profile removed. This book’s settings stay as they are.', 'Profil tersimpan dihapus. Pengaturan buku ini tetap seperti semula.'));
    } catch (reason) { setStatus(reason instanceof Error ? reason.message : t('Profile could not be removed.', 'Profil belum bisa dihapus.')); }
  };

  return <Stack className="reader-tool-section" gap="md">
    <div><Text fw={650}>{t('Reading profiles', 'Profil bacaan')}</Text><Text size="xs" c="dimmed">{t('Apply a starting point or save the current page settings as your own.', 'Terapkan pengaturan awal atau simpan setelan saat ini sebagai profilmu.')}</Text></div>
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">{presets.map(profile => <Card key={profile.name} className="reader-profile-card" withBorder radius="lg" padding="sm"><Group justify="space-between" align="flex-start"><div><Text fw={600} size="sm">{profile.name}</Text><Text size="xs" c="dimmed">{profile.name === 'Manga' ? t('Right-to-left page turns', 'Balik halaman dari kanan ke kiri') : profile.name === 'OpenDyslexic' ? t('Roomier text and line spacing', 'Huruf dan jarak baris lebih lapang') : profile.name === 'Night' ? t('Dimmer, warmer pages', 'Halaman lebih redup dan hangat') : profile.name === 'Study' ? t('Wide, focused reading', 'Bacaan lebar dan fokus') : t('A calm, comfortable page', 'Halaman tenang dan nyaman')}</Text></div><BookOpen size={16} /></Group><Button mt="sm" size="compact-sm" variant="light" loading={busy === profile.name} onClick={() => void apply(profile)} leftSection={<Check size={14} />}>{t('Apply', 'Terapkan')}</Button></Card>)}</SimpleGrid>
    {records.length > 0 && <div><Text size="xs" fw={650} mb="xs">{t('YOUR SAVED PROFILES', 'PROFIL TERSIMPAN')}</Text><Stack gap="xs">{records.map(profile => <Card key={profile.name} className="reader-profile-saved" withBorder radius="md" padding="xs"><Group justify="space-between"><Text size="sm" fw={550}>{profile.name}</Text><Group gap="xs"><Button size="compact-xs" variant="light" loading={busy === profile.name} onClick={() => void apply(profile)}>{t('Apply', 'Terapkan')}</Button><Button size="compact-xs" variant="subtle" color="red" aria-label={`${deleteCandidate === profile.name ? t('Confirm delete', 'Konfirmasi hapus') : t('Delete', 'Hapus')} ${profile.name}`} onClick={() => remove(profile)}><Trash2 size={14} /></Button></Group></Group></Card>)}</Stack></div>}
    <div className="reader-profile-save"><TextInput label={t('Name this profile', 'Beri nama profil')} value={name} maxLength={48} onChange={event => { setName(event.currentTarget.value.slice(0, 48)); setStatus(''); }} placeholder={t('For example: Long evening reading', 'Contoh: Bacaan malam santai')} /><Group grow><Button disabled={!selectedName || !records.some(record => record.name === selectedName)} variant="default" onClick={updateSelected}>{t('Update selected', 'Perbarui profil')}</Button><Button onClick={saveCurrent} leftSection={<BookmarkPlus size={15} />}>{t('Save current settings', 'Simpan setelan saat ini')}</Button></Group></div>
    {status && <Alert color="gray" variant="light" role="status">{status}</Alert>}
  </Stack>;
}
