import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Anchor, Card, Group, SegmentedControl, Text, Title } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { loadPublicHolidays, type PublicHoliday } from '../../../../../app/library/holiday-calendar.ts';
import { holidayCountry } from '../../../../../src/locale.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

type Session = { book: string; at: number; seconds: number };
type Props = { sessions: Session[] };

const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const localDate = (value: string) => new Date(`${value}T12:00:00`);
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export function HomeCalendar({ sessions }: Props) {
  const { lang } = useWorkspace();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [selected, setSelected] = useState(() => isoDate(new Date()));
  const [displayedDate, setDisplayedDate] = useState(() => new Date());
  const [view, setView] = useState<'week' | 'month'>('month');
  const [holidays, setHolidays] = useState<Record<string, PublicHoliday>>({});
  const [holidayStatus, setHolidayStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');

  const sessionByDate = useMemo(() => {
    const result = new Map<string, { count: number; seconds: number }>();
    for (const session of sessions) {
      if (session.seconds <= 0 || !Number.isFinite(session.at)) continue;
      const key = isoDate(new Date(session.at));
      const value = result.get(key) || { count: 0, seconds: 0 };
      value.count += 1;
      value.seconds += session.seconds;
      result.set(key, value);
    }
    return result;
  }, [sessions]);

  const country = holidayCountry(lang === 'id' ? 'id-ID' : 'en-US');
  const selectedDate = localDate(selected);
  const weekDates = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [selected]);

  useEffect(() => {
    const years = new Set([displayedDate.getFullYear(), selectedDate.getFullYear(), ...weekDates.map(date => date.getFullYear())]);
    let active = true;
    setHolidayStatus('loading');
    void Promise.all([...years].map(year => loadPublicHolidays(year, country).then(result => result.holidays))).then(rows => {
      if (!active) return;
      setHolidays(previous => {
        const next = { ...previous };
        for (const row of rows.flat()) next[row.date] = row;
        return next;
      });
      setHolidayStatus('ready');
    }).catch(() => { if (active) setHolidayStatus('unavailable'); });
    return () => { active = false; };
  }, [country, displayedDate.getFullYear(), selectedDate.getFullYear(), weekDates.map(date => date.getFullYear()).join(',')]);

  const selectedSession = sessionByDate.get(selected) || null;
  const selectedHoliday = holidays[selected] || null;
  const locale = lang === 'id' ? 'id-ID' : 'en-US';
  const localizedHoliday = selectedHoliday ? (lang === 'id' ? selectedHoliday.localName || selectedHoliday.name : selectedHoliday.name) : '';
  const selectDate = (date: Date) => {
    const next = isoDate(date);
    setSelected(next);
    setDisplayedDate(date);
  };
  const shiftMonth = (step: -1 | 1) => {
    const next = new Date(displayedDate.getFullYear(), displayedDate.getMonth() + step, 1, 12);
    setDisplayedDate(next);
    setSelected(isoDate(next));
  };
  const shiftWeek = (step: -1 | 1) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + step * 7);
    selectDate(next);
  };
  const activeDays = [...sessionByDate.keys()].filter(key => {
    const date = localDate(key);
    return date.getFullYear() === displayedDate.getFullYear() && date.getMonth() === displayedDate.getMonth();
  }).length;
  const detailParts = [
    selectedSession ? t('Reading saved', 'Bacaan tersimpan') + ` · ${selectedSession.count} ${t(selectedSession.count === 1 ? 'session' : 'sessions', 'sesi')} · ${Math.max(1, Math.round(selectedSession.seconds / 60))} ${t('min', 'menit')}` : '',
    selectedHoliday ? `${t('Public holiday', 'Libur nasional')} · ${localizedHoliday}` : '',
  ].filter(Boolean);

  return <Card className="calendar-widget" radius="xl" withBorder>
    <Group justify="space-between" align="flex-start" gap="sm">
      <div><Text className="page-eyebrow">{t('YOUR READING RHYTHM', 'RITME MEMBACAMU')}</Text><Title order={3}>{t('Reading calendar', 'Kalender baca')}</Title></div>
      <CalendarDays size={18} aria-hidden="true" />
    </Group>
    <Group className="app-calendar-controls" justify="space-between" gap="xs">
      <div className="app-calendar-heading">
        {view === 'week' && <><ActionIcon variant="subtle" aria-label={t('Previous week', 'Minggu sebelumnya')} onClick={() => shiftWeek(-1)}><ArrowLeft size={15} /></ActionIcon><Text fw={600}>{new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(weekDates[0])} – {new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(weekDates[6])}</Text><ActionIcon variant="subtle" aria-label={t('Next week', 'Minggu berikutnya')} onClick={() => shiftWeek(1)}><ArrowRight size={15} /></ActionIcon></>}
        {view === 'month' && <Text size="sm" c="dimmed">{activeDays ? t(`Reading on ${activeDays} days`, `Ada sesi baca pada ${activeDays} hari`) : t('Small moments count.', 'Jeda kecil tetap berarti.')}</Text>}
      </div>
      <SegmentedControl size="xs" value={view} onChange={value => setView(value as typeof view)} aria-label={t('Calendar view', 'Tampilan kalender')} data={[{ value: 'week', label: t('Week', 'Minggu') }, { value: 'month', label: t('Month', 'Bulan') }]} />
    </Group>
    {view === 'month' ? <Calendar
      className="home-reading-calendar"
      fullWidth
      previousLabel={t('Previous month', 'Bulan sebelumnya')}
      nextLabel={t('Next month', 'Bulan berikutnya')}
      date={displayedDate}
      onDateChange={value => { const date = localDate(String(value)); setDisplayedDate(date); selectDate(date); }}
      getDayProps={value => {
        const date = localDate(String(value));
        const key = isoDate(date);
        return { selected: selected === key, className: sessionByDate.has(key) ? 'calendar-reading-day' : undefined, onClick: () => selectDate(date), 'aria-label': `${new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date)}${sessionByDate.has(key) ? ` · ${t('reading session', 'sesi membaca')}` : ''}${holidays[key] ? ` · ${lang === 'id' ? holidays[key].localName : holidays[key].name}` : ''}` };
      }}
    /> : <div className="app-calendar-week" role="group" aria-label={t('Reading days this week', 'Hari membaca minggu ini')}>
      {weekDates.map(date => {
        const key = isoDate(date), entry = sessionByDate.get(key), holiday = holidays[key];
        return <button key={key} type="button" className={`app-calendar-week-day${selected === key ? ' is-selected' : ''}${entry ? ' has-reading' : ''}${holiday ? ' has-holiday' : ''}`} aria-pressed={selected === key} aria-label={`${new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(date)}${entry ? ` · ${t('reading saved', 'ada bacaan')}` : ''}${holiday ? ` · ${lang === 'id' ? holiday.localName : holiday.name}` : ''}`} onClick={() => selectDate(date)}>
          <span>{new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)}</span><strong>{date.getDate()}</strong><i aria-hidden="true" />
        </button>;
      })}
    </div>}
    <div className="calendar-legend"><span className="calendar-legend-dot" />{t('A day with reading time', 'Hari dengan waktu membaca')}</div>
    <div className="app-calendar-detail" role="status" aria-live="polite">
      <Text size="xs" fw={600}>{new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(selectedDate)}</Text>
      <Text size="xs" c="dimmed">{detailParts.join(' · ') || t('A quiet day. No reading saved here yet.', 'Hari yang tenang. Belum ada sesi baca tersimpan.')}</Text>
      {holidayStatus === 'unavailable' && !selectedHoliday && <Text size="xs" c="dimmed">{t('Holiday details are unavailable offline until loaded once.', 'Informasi libur belum tersedia offline sebelum dimuat sekali.')}</Text>}
    </div>
    <Anchor className="calendar-holiday-source" href="https://date.nager.at/" target="_blank" rel="noopener noreferrer" size="xs">{t('Holiday source: Nager.Date', 'Sumber hari libur: Nager.Date')}</Anchor>
  </Card>;
}
