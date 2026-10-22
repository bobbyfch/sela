import { useEffect, useState } from 'react';
import { Accordion, ActionIcon, Anchor, Card, Group, NumberInput, Progress, Select, Text, Title, Tooltip } from '@mantine/core';
import { Minus, Plus, Settings2 } from 'lucide-react';
import { copy, useWorkspace } from '../../workspace.tsx';

const key = 'sela-library:water-glasses';
type GoalGuide = 'custom' | 'id-male-adult' | 'id-female-adult' | 'off';
type WaterLog = { day: string; glasses: number; goalMl: number; servingMl: number; goalGuide: GoalGuide };
const localDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function readLog(): WaterLog {
  const fallback: WaterLog = { day: localDay(new Date()), glasses: 0, goalMl: 0, servingMl: 250, goalGuide: 'off' };
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (!saved || typeof saved !== 'object') return fallback;
    const goalGuide: GoalGuide = ['custom', 'id-male-adult', 'id-female-adult', 'off'].includes(saved.goalGuide) ? saved.goalGuide : Number(saved.goalMl) > 0 ? 'custom' : 'off';
    return {
      day: localDay(new Date()),
      glasses: saved.day === localDay(new Date()) && Number.isInteger(saved.glasses) ? Math.min(99, Math.max(0, saved.glasses)) : 0,
      goalMl: Number.isFinite(saved.goalMl) ? Math.min(5000, Math.max(0, Math.round(saved.goalMl / 250) * 250)) : Number.isInteger(saved.goal) ? saved.goal * 250 : 0,
      servingMl: [150, 200, 250, 330, 500].includes(saved.servingMl) ? saved.servingMl : 250,
      goalGuide,
    };
  } catch { return fallback; }
}

export function WaterTracker() {
  const { lang } = useWorkspace();
  const [log, setLog] = useState(readLog);
  const t = (en: string, id: string) => copy(lang, en, id);
  const amount = log.glasses * log.servingMl;
  const percent = log.goalMl ? Math.min(100, Math.round(amount / log.goalMl * 100)) : 0;

  useEffect(() => {
    const refreshDay = () => setLog(current => current.day === localDay(new Date()) ? current : { ...current, day: localDay(new Date()), glasses: 0 });
    document.addEventListener('visibilitychange', refreshDay);
    return () => document.removeEventListener('visibilitychange', refreshDay);
  }, []);

  const update = (change: (current: WaterLog) => WaterLog) => {
    const next = change(log);
    setLog(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Keep this session usable if local storage is blocked. */ }
    document.dispatchEvent(new Event('sela:water'));
  };
  const setGuide = (guide: GoalGuide) => update(current => ({ ...current, goalGuide: guide, goalMl: guide === 'id-male-adult' ? 2500 : guide === 'id-female-adult' ? 2350 : guide === 'off' ? 0 : current.goalMl }));

  return <Card className="home-widget-card water-widget" withBorder radius="xl" padding="lg">
    <Group justify="space-between" align="flex-start" wrap="nowrap"><div><Text className="page-eyebrow">{t('A SMALL DAILY HABIT', 'KEBIASAAN KECIL HARIAN')}</Text><Title order={3}>{t('Water break', 'Jeda minum')}</Title><Text size="sm" c="dimmed">{t('Track the glasses you enter, at your own pace.', 'Catat gelas yang kamu masukkan, dengan ritmemu sendiri.')}</Text></div><Tooltip label={t('Water goal settings', 'Pengaturan target minum')} withArrow><ActionIcon className="water-goal-button" variant="subtle" aria-label={t('Water goal settings', 'Pengaturan target minum')} onClick={() => document.getElementById('water-settings')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })}><Settings2 size={17} /></ActionIcon></Tooltip></Group>
    <div className="water-widget-total"><strong>{amount >= 1000 && amount % 1000 === 0 ? `${amount / 1000} L` : `${amount} mL`}</strong><span>{t('logged today', 'tercatat hari ini')}</span></div>
    <Group gap="xs"><ActionIcon size={44} variant="default" aria-label={t('Undo one glass', 'Urungkan satu gelas')} disabled={!log.glasses} onClick={() => update(current => ({ ...current, glasses: Math.max(0, current.glasses - 1) }))}><Minus size={17} /></ActionIcon><ActionIcon size={44} aria-label={t('Add one glass', 'Tambah segelas')} onClick={() => update(current => ({ ...current, glasses: Math.min(99, current.glasses + 1) }))}><Plus size={17} /></ActionIcon><Text size="sm">{t('Add a glass', 'Tambah segelas')}</Text></Group>
    {log.goalMl > 0 && <div className="water-widget-progress"><Progress value={percent} aria-label={t('Optional water goal progress', 'Progres target minum opsional')} /><Text size="xs" c="dimmed">{amount} / {log.goalMl} mL · {percent}%</Text></div>}
    <Accordion variant="contained" className="water-settings-accordion" id="water-settings"><Accordion.Item value="settings"><Accordion.Control>{t('Optional goal settings', 'Pengaturan target opsional')}</Accordion.Control><Accordion.Panel>
      <div className="water-settings-fields"><Select label={t('Goal guide', 'Acuan target')} value={log.goalGuide} onChange={value => setGuide((value || 'off') as GoalGuide)} data={[{ value: 'custom', label: t('My own goal', 'Target pilihanku') }, { value: 'id-male-adult', label: t('Indonesia AKG · men · 19–64', 'AKG Indonesia · laki-laki · 19–64') }, { value: 'id-female-adult', label: t('Indonesia AKG · women · 19–64', 'AKG Indonesia · perempuan · 19–64') }, { value: 'off', label: t('No target', 'Tanpa target') }]} allowDeselect={false} /><NumberInput label={t('Daily goal (mL)', 'Target harian (mL)')} value={log.goalMl} onChange={value => update(current => ({ ...current, goalMl: Math.min(5000, Math.max(0, Math.round((Number(value) || 0) / 250) * 250)), goalGuide: 'custom' }))} min={0} max={5000} step={250} /><Select label={t('Serving size', 'Ukuran gelas')} value={String(log.servingMl)} onChange={value => update(current => ({ ...current, servingMl: Number(value || 250) }))} data={[150, 200, 250, 330, 500].map(size => ({ value: String(size), label: `${size} mL` }))} allowDeselect={false} /></div>
      <Text className="water-source-note">{t('The AKG amounts are population references for ages 19–64, not personal prescriptions. Sela counts only the glasses you enter; water from food and other drinks is not included.', 'Angka AKG adalah acuan populasi usia 19–64, bukan resep kebutuhan personal. Sela hanya menghitung gelas yang kamu masukkan; air dari makanan dan minuman lain tidak tercatat.')}</Text><Anchor href="https://peraturan.bpk.go.id/Details/138621/permenkes-no-28-tahun-2019" target="_blank" rel="noopener noreferrer" size="xs">{t('Read the Indonesia AKG regulation', 'Baca peraturan AKG Indonesia')}</Anchor>
    </Accordion.Panel></Accordion.Item></Accordion>
  </Card>;
}
