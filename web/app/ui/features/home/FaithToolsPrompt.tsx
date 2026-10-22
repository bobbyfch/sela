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
    <Text className="page-eyebrow">{copy(lang, 'OPTIONAL FAITH READINGS', 'BACAAN AGAMA OPSIONAL')}</Text>
    <Title order={3}>{copy(lang, 'Scriptures, daily readings & prayer times', 'Kitab suci, bacaan harian & jadwal salat')}</Title>
    <Text size="sm" c="dimmed">{copy(lang, 'Choose your faith or tradition in your personal reading preferences. A Faith tab appears on your shelf with its scriptures, and Home shows a sourced daily reading. Prayer times are for Islam and use a city only when you ask to load them.', 'Pilih agama atau tradisimu di preferensi membaca pribadi. Tab Agama muncul di rak bukumu berisi kitab suci tradisi itu, dan Beranda menampilkan bacaan harian bersumber. Jadwal salat khusus Islam dan hanya memakai kota saat kamu memintanya.')}</Text>
    <Button variant="default" leftSection={<BookOpen size={15} />} rightSection={<ArrowUpRight size={14} />} onClick={() => navigate('/settings/library')}>
      {copy(lang, 'Choose faith or tradition', 'Pilih agama atau tradisi')}
    </Button>
  </Card>;
}
