import { useSyncExternalStore } from 'react';
import { Button, Card, Group, NativeSelect, SegmentedControl, Text, Title } from '@mantine/core';
import { Clock3, Pause, Play, RotateCcw } from 'lucide-react';
import type { LibraryBook } from '../../../../../app/library/models.ts';
import { copy, useWorkspace } from '../../workspace.tsx';
import { chooseFocusBook, chooseFocusDuration, getFocusTimer, resetFocusTimer, subscribeFocusTimer, toggleFocusTimer } from './focus-timer.ts';
import { useNavigate } from 'react-router';

export function FocusTimerCard({ books }: { books: LibraryBook[] }) {
  const { lang } = useWorkspace();
  const navigate = useNavigate();
  const t = (en: string, id: string) => copy(lang, en, id);
  const timer = useSyncExternalStore(subscribeFocusTimer, getFocusTimer, getFocusTimer);
  const minutes = Math.floor(timer.remaining / 60), seconds = timer.remaining % 60;
  return <Card className="focus-timer-card" withBorder radius="xl" padding="lg">
    <div className="section-heading"><div><Text className="page-eyebrow">{t('A QUIET READING SESSION', 'SESI MEMBACA TENANG')}</Text><Title order={2}>{t('A little reading time', 'Waktu untuk membaca')}</Title></div><Clock3 size={18} aria-hidden="true" /></div>
    <Text className="focus-timer-description">{t('Set aside a few quiet minutes for one chapter.', 'Sisihkan beberapa menit tenang untuk satu bab.')}</Text>
    <SegmentedControl className="focus-timer-presets" value={String(timer.minutes)} onChange={value => chooseFocusDuration(Number(value))} disabled={!!timer.deadline} aria-label={t('Choose a reading session', 'Pilih durasi membaca')} data={[{ value: '15', label: t('15 min', '15 mnt') }, { value: '25', label: t('25 min', '25 mnt') }, { value: '45', label: t('45 min', '45 mnt') }]} />
    <div className="focus-timer-clock" aria-live="off" aria-label={`${t('Time remaining', 'Waktu tersisa')}: ${minutes}:${String(seconds).padStart(2, '0')}`}><strong>{minutes}:{String(seconds).padStart(2, '0')}</strong><span>{t('left', 'tersisa')}</span></div>
    {books.length > 0 && <NativeSelect label={t('Book for this session', 'Buku untuk sesi ini')} value={timer.bookId || books[0].id} onChange={event => chooseFocusBook(event.currentTarget.value)} data={books.map(book => ({ value: book.id, label: book.name }))} />}
    <Group className="focus-timer-actions" gap="xs"><Button leftSection={timer.deadline ? <Pause size={15} /> : <Play size={15} />} onClick={toggleFocusTimer}>{timer.deadline ? t('Pause', 'Jeda') : t('Start', 'Mulai')}</Button><Button variant="default" leftSection={<RotateCcw size={15} />} onClick={resetFocusTimer}>{t('Reset', 'Atur ulang')}</Button>{books.length > 0 && <Button variant="subtle" onClick={() => navigate(`/read/${timer.bookId || books[0].id}`)}>{t('Read', 'Baca')}</Button>}</Group>
    {timer.remaining === 0 && !timer.deadline && <Text size="xs" role="status" className="focus-timer-complete">{t('Session finished. Stretch and rest your eyes.', 'Sesi selesai. Regangkan tubuh dan istirahatkan mata.')}</Text>}
  </Card>;
}

export function FocusTimerBadge() {
  const { lang } = useWorkspace();
  const timer = useSyncExternalStore(subscribeFocusTimer, getFocusTimer, getFocusTimer);
  if (!timer.deadline && timer.remaining === timer.minutes * 60) return null;
  const t = (en: string, id: string) => copy(lang, en, id);
  const minutes = Math.floor(timer.remaining / 60), seconds = timer.remaining % 60;
  return <div className="reader-focus-timer" role="status"><Clock3 size={15} aria-hidden="true" /><strong>{minutes}:{String(seconds).padStart(2, '0')}</strong><Button size="compact-xs" variant="default" leftSection={timer.deadline ? <Pause size={12} /> : <Play size={12} />} onClick={toggleFocusTimer}>{timer.deadline ? t('Pause', 'Jeda') : t('Resume', 'Lanjutkan')}</Button><Button size="compact-xs" variant="subtle" onClick={resetFocusTimer}>{t('Reset', 'Ulang')}</Button></div>;
}
