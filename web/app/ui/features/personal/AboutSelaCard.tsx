import { Anchor, Badge, Card, Group, Text, Title } from '@mantine/core';
import { BookOpen, MessageCircle, ShieldCheck } from 'lucide-react';
import { VERSION } from '../../../../../app/library/version.ts';
import { SocialIcon } from '../../../../../ui/social-icons.tsx';
import { copy, useWorkspace } from '../../workspace.tsx';

export function AboutSelaCard() {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const links = [
    { label: 'GitHub', href: 'https://github.com/bobbyfch/sela', icon: <SocialIcon brand="github" /> },
    { label: 'Instagram', href: 'https://www.instagram.com/bobby.fch/', icon: <SocialIcon brand="instagram" /> },
    { label: 'Threads', href: 'https://www.threads.com/@bobby.fch', icon: <SocialIcon brand="threads" /> },
    { label: 'LinkedIn', href: 'https://id.linkedin.com/in/bobbyfajarc', icon: <SocialIcon brand="linkedin" /> },
    { label: t('MIT license', 'Lisensi MIT'), href: 'https://github.com/bobbyfch/sela/blob/main/LICENSE', icon: <ShieldCheck size={15} aria-hidden="true" /> },
    { label: t('Third-party notices', 'Lisensi pihak ketiga'), href: 'https://github.com/bobbyfch/sela/blob/main/THIRD_PARTY_NOTICES.md', icon: <BookOpen size={15} aria-hidden="true" /> },
  ];
  return <Card className="settings-panel about-sela-card" withBorder radius="xl" padding="lg">
    <Group justify="space-between" align="flex-start"><div><Text className="page-eyebrow">{t('MADE WITH CARE', 'DIBUAT DENGAN HATI')}</Text><Title order={2}>{t('About Sela', 'Tentang Sela')}</Title></div><Badge variant="default" radius="xl">v{VERSION}</Badge></Group>
    <Text>{t('A quiet home for your books, notes and reading time. The local reader supports PDF, EPUB, CBZ, DjVu, text, HTML, FB2, DOCX and ODT. Narration uses voices available from your browser or operating system.', 'Ruang tenang untuk buku, catatan dan waktu membaca. Reader lokal mendukung PDF, EPUB, CBZ, DjVu, teks, HTML, FB2, DOCX dan ODT. Narasi menggunakan suara yang tersedia di browser atau sistem operasi.')}</Text>
    <div className="about-sela-author"><span className="about-sela-mark"><BookOpen size={18} aria-hidden="true" /></span><div><Text fw={650}>Bobby Fajar Christian</Text><Text size="xs" c="dimmed">{t('Creator of Sela Books', 'Pembuat Sela Books')}</Text></div><Anchor href="https://bobbyfch.github.io/" target="_blank" rel="noopener noreferrer">{t('Profile', 'Profil')} ↗</Anchor></div>
    <div className="about-sela-links">{links.map(({ label, href, icon }) => <Anchor key={label} href={href} target="_blank" rel="noopener noreferrer">{icon}{label}<span aria-hidden="true">↗</span></Anchor>)}<Anchor href="https://github.com/bobbyfch/sela/issues/new" target="_blank" rel="noopener noreferrer"><MessageCircle size={15} aria-hidden="true" />{t('Send feedback', 'Kirim masukan')}<span aria-hidden="true">↗</span></Anchor></div>
  </Card>;
}
