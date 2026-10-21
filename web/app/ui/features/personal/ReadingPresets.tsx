import { useState } from 'react';
import { Alert, Card, Select, Stack, Text, Title } from '@mantine/core';
import { copy, useWorkspace } from '../../workspace.tsx';

type PresetKind = 'novel' | 'document' | 'comic';
const modes: Record<PresetKind, string[]> = { novel: ['single', 'scroll'], document: ['single', 'book', 'scroll'], comic: ['single', 'book', 'scroll', 'webtoon', 'manga'] };
const modeNames: Record<string, [string, string]> = { single: ['Single page', 'Satu halaman'], book: ['Book spread', 'Dua halaman'], scroll: ['Continuous scroll', 'Gulir kontinu'], webtoon: ['Webtoon', 'Webtoon'], manga: ['Manga · right to left', 'Manga · kanan ke kiri'] };

function readMode(kind: PresetKind) {
  try { const mode = JSON.parse(localStorage.getItem(`sela-library:preset:${kind}`) || '{}').mode; return modes[kind].includes(mode) ? mode : kind === 'novel' ? 'scroll' : 'single'; }
  catch { return kind === 'novel' ? 'scroll' : 'single'; }
}

export function ReadingPresets() {
  const { lang } = useWorkspace();
  const [values, setValues] = useState<Record<PresetKind, string>>(() => ({ novel: readMode('novel'), document: readMode('document'), comic: readMode('comic') }));
  const [error, setError] = useState('');
  const t = (en: string, id: string) => copy(lang, en, id);
  const rows: [PresetKind, string, string, string, string][] = [
    ['novel', 'Novel and text', 'Novel & teks', 'Reflowable books use one page or continuous text.', 'Buku teks memakai halaman atau alur berkelanjutan.'],
    ['document', 'PDF documents', 'Dokumen PDF', 'Choose single pages, spreads or a continuous column.', 'Pilih satu halaman, dua halaman atau kolom kontinu.'],
    ['comic', 'Comics and manga', 'Komik & manga', 'Includes right-to-left manga and seamless webtoon flow.', 'Termasuk manga kanan ke kiri dan alur webtoon tanpa jeda.'],
  ];
  const update = (kind: PresetKind, mode: string) => {
    if (!modes[kind].includes(mode)) return;
    try { localStorage.setItem(`sela-library:preset:${kind}`, JSON.stringify({ mode })); setValues(current => ({ ...current, [kind]: mode })); setError(''); }
    catch { setError(t('This browser could not save the reading preset.', 'Browser ini belum bisa menyimpan preset baca.')); }
  };
  return <Card className="settings-panel personal-tools-card" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('DEFAULT READING FLOW', 'ALUR BACA AWAL')}</Text><Title order={2}>{t('Reading presets', 'Preset bacaan')}</Title><Text>{t('Set a default layout for novels, documents and comics. Each book keeps its own saved reader settings.', 'Atur tata letak awal untuk novel, dokumen dan komik. Pengaturan reader tiap buku tetap tersimpan sendiri.')}</Text></div>
    {error && <Alert color="red" role="alert">{error}</Alert>}
    <Stack gap="md">{rows.map(([kind, en, id, descEn, descId]) => <Select key={kind} label={t(en, id)} description={t(descEn, descId)} value={values[kind]} onChange={mode => { if (mode) update(kind, mode); }} data={modes[kind].map(mode => ({ value: mode, label: t(...modeNames[mode]) }))} allowDeselect={false} />)}</Stack>
  </Card>;
}
