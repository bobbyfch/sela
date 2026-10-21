import { useEffect, useState } from 'react';
import { Button, Card, Text, Title } from '@mantine/core';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { readPersonal } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

export function FaithToolsPrompt() {
  const { lang } = useWorkspace();
  const navigate = useNavigate();
  const [faith, setFaith] = useState(() => readPersonal().faith);
  useEffect(() => {
    const sync = () => setFaith(readPersonal().faith);
    document.addEventListener('sela:personal', sync);
    return () => document.removeEventListener('sela:personal', sync);
  }, []);
  if (faith !== 'none') return null;

  return <Card className="home-widget-card faith-tools-prompt" withBorder radius="xl" padding="lg">
    <Text className="page-eyebrow">{copy(lang, 'OPTIONAL READING TOOLS', 'ALAT BACA OPSIONAL')}</Text>
    <Title order={3}>{copy(lang, 'Quran, daily readings & prayer times', 'Al-Qur’an, bacaan harian & jadwal salat')}</Title>
    <Text size="sm" c="dimmed">{copy(lang, 'Choose Islam in your personal reading preferences to show these tools on Home. A city is used for prayer estimates only when you ask to load them.', 'Pilih Islam di preferensi membaca pribadi untuk menampilkan fitur ini di Beranda. Kota hanya dipakai untuk perkiraan salat saat kamu meminta jadwal dimuat.')}</Text>
    <Button variant="default" leftSection={<BookOpen size={15} />} rightSection={<ArrowUpRight size={14} />} onClick={() => navigate('/settings/library')}>
      {copy(lang, 'Choose reading sources', 'Pilih sumber bacaan')}
    </Button>
  </Card>;
}
