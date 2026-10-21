import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Group, NumberInput, Progress, Stack, Text, Title } from '@mantine/core';
import { BookOpen, Clock3 } from 'lucide-react';
import type { LibraryBook } from '../../../../../app/library/models.ts';
import { editPersonal, readPersonal } from '../../../../../app/library/personal-store.ts';
import { formatDuration } from '../../state.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

type Session = { book: string; at: number; seconds: number };

export function ReadingJournalCard({ books, sessions }: { books: LibraryBook[]; sessions: Session[] }) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [target, setTarget] = useState<number | string>(() => readPersonal().weeklyTarget || 0);
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    const sync = () => setTarget(readPersonal().weeklyTarget || 0);
    document.addEventListener('sela:personal', sync);
    return () => document.removeEventListener('sela:personal', sync);
  }, []);

  const recent = useMemo(() => sessions.filter(session => session.seconds > 0 && Date.now() - session.at < 7 * 86400000), [sessions]);
  const recentSeconds = recent.reduce((sum, session) => sum + session.seconds, 0);
  const entries = [...sessions].filter(session => session.seconds > 0).sort((a, b) => b.at - a.at).slice(0, 30);
  const targetMinutes = Math.max(0, Math.min(6000, Number(target) || 0));
  const percent = targetMinutes > 0 ? Math.min(100, recentSeconds / 60 / targetMinutes * 100) : 0;
  const saveTarget = () => {
    try {
      editPersonal(data => { data.weeklyTarget = targetMinutes; });
      setSaved(true);
    } catch { setSaved(false); }
  };
  const dateLocale = lang === 'id' ? 'id-ID' : 'en-US';

  return <Card className="reading-journal-card" withBorder radius="xl" padding="lg">
    <div className="section-heading"><div><Text className="page-eyebrow">{t('A GENTLE GOAL', 'TARGET RINGAN')}</Text><Title order={2}>{t('Reading journal', 'Jurnal baca')}</Title></div><BookOpen size={18} aria-hidden="true" /></div>
    <div className="journal-goal">
      <div><Text fw={650}>{formatDuration(recentSeconds, lang)} <span>{t('in the last 7 days', 'dalam 7 hari terakhir')}</span></Text><Progress value={percent} aria-label={t('Weekly reading goal progress', 'Progres target baca mingguan')} size="sm" radius="xl" /></div>
      <Group className="journal-target-control" align="flex-end" gap="xs" wrap="nowrap">
        <NumberInput label={t('Weekly minutes', 'Menit per minggu')} value={target} onChange={value => { setTarget(value); setSaved(false); }} min={0} max={6000} step={15} clampBehavior="strict" allowDecimal={false} suffix=" min" aria-label={t('Optional weekly reading minutes; zero disables the goal', 'Target menit baca mingguan; nol menonaktifkan target')} />
        <Button variant="default" onClick={saveTarget}>{t('Save', 'Simpan')}</Button>
      </Group>
    </div>
    {!saved && <Text size="xs" c="dimmed" role="status">{t('Save your goal to keep it on this device.', 'Simpan target agar tersimpan di perangkat ini.')}</Text>}
    <div className="journal-session-heading"><Text fw={600}>{t('Recent sessions', 'Sesi terbaru')}</Text><Text size="xs" c="dimmed">{entries.length} / 30</Text></div>
    {entries.length ? <div className="journal-session-list" aria-label={t('Last 30 reading sessions', '30 sesi membaca terakhir')}>
      {entries.map((session, index) => {
        const book = books.find(item => item.id === session.book);
        return <div className="journal-session-row" key={`${session.book}:${session.at}:${index}`}>
          <span className="journal-session-icon"><Clock3 size={14} aria-hidden="true" /></span>
          <span className="journal-session-copy"><strong>{book?.name || t('Reading session', 'Sesi membaca')}</strong><small>{new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(session.at))}</small></span>
          <span className="journal-session-duration">{formatDuration(session.seconds, lang)}</span>
        </div>;
      })}
    </div> : <Text size="sm" c="dimmed">{t('Your reading sessions will appear here as you use the reader.', 'Sesi baca akan muncul di sini saat kamu membaca.')}</Text>}
  </Card>;
}
