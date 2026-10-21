import { useEffect, useRef, useState } from 'react';
import { Alert, Button, FileButton, Group, NativeSelect, Stack, Text } from '@mantine/core';
import { CloudRain, Waves, Wind, AudioLines, Volume2 } from 'lucide-react';

type AmbientKind = 'rain' | 'wind' | 'stream' | 'waves';
const ambience: { key: AmbientKind; en: string; id: string; icon: typeof CloudRain; frequency: number; type: BiquadFilterType; gain: number }[] = [
  { key: 'rain', en: 'Rain', id: 'Hujan', icon: CloudRain, frequency: 1500, type: 'lowpass', gain: 0.065 },
  { key: 'wind', en: 'Wind', id: 'Angin', icon: Wind, frequency: 360, type: 'lowpass', gain: 0.07 },
  { key: 'stream', en: 'Stream', id: 'Aliran air', icon: AudioLines, frequency: 780, type: 'bandpass', gain: 0.05 },
  { key: 'waves', en: 'Waves', id: 'Ombak', icon: Waves, frequency: 430, type: 'lowpass', gain: 0.07 },
];

export function ReaderAudioPanel({ lang }: { lang: 'en' | 'id' }) {
  const [selected, setSelected] = useState<AmbientKind | ''>('');
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [audioName, setAudioName] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [status, setStatus] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const urlRef = useRef('');
  const contextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode; oscillator?: OscillatorNode } | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const t = (en: string, id: string) => lang === 'id' ? id : en;

  const stopAmbient = () => {
    const nodes = nodesRef.current; nodesRef.current = null;
    try { nodes?.source.stop(); } catch { /* Already stopped. */ }
    try { nodes?.oscillator?.stop(); } catch { /* Already stopped. */ }
    setSelected('');
  };
  const stopEverything = () => {
    window.clearTimeout(timerRef.current); timerRef.current = undefined;
    audioRef.current?.pause(); stopAmbient(); setTimerMinutes(0);
    void contextRef.current?.suspend();
  };
  const toggleAmbient = async (kind: AmbientKind) => {
    try {
      if (selected === kind) { stopAmbient(); await contextRef.current?.suspend(); return; }
      stopAmbient();
      const context = contextRef.current ||= new AudioContext();
      const choice = ambience.find(item => item.key === kind)!;
      const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
      const samples = buffer.getChannelData(0); let brown = 0;
      for (let index = 0; index < samples.length; index++) { const white = Math.random() * 2 - 1; brown = (brown + 0.025 * white) / 1.025; samples[index] = kind === 'stream' ? white * 0.45 + brown * 2 : brown * 3; }
      const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
      const filter = context.createBiquadFilter(); filter.type = choice.type; filter.frequency.value = choice.frequency; filter.Q.value = kind === 'stream' ? 0.7 : 0.45;
      const gain = context.createGain(); gain.gain.value = choice.gain; source.connect(filter).connect(gain).connect(context.destination);
      let oscillator: OscillatorNode | undefined;
      if (kind === 'wind' || kind === 'waves') { oscillator = context.createOscillator(); const modulation = context.createGain(); oscillator.frequency.value = kind === 'waves' ? 0.09 : 0.055; modulation.gain.value = kind === 'waves' ? 0.025 : 0.018; oscillator.connect(modulation).connect(gain.gain); oscillator.start(); }
      nodesRef.current = { source, filter, gain, oscillator }; source.start(); await context.resume(); setSelected(kind); setStatus('');
    } catch { stopAmbient(); setStatus(t('Room sound is unavailable in this browser.', 'Suasana audio belum tersedia di browser ini.')); }
  };
  const chooseFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('audio/') || file.size > 256 * 1048576) { setStatus(t('Choose an audio file smaller than 256 MiB.', 'Pilih berkas audio di bawah 256 MiB.')); return; }
    audioRef.current?.pause(); if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(file); setAudioUrl(urlRef.current);
    setAudioName(file.name); setStatus(t('Audio stays on this device.', 'Audio tetap di perangkat ini.'));
  };

  useEffect(() => {
    if (timerMinutes > 0) timerRef.current = window.setTimeout(() => { stopEverything(); setStatus(t('Sleep timer finished.', 'Timer selesai.')); }, timerMinutes * 60_000);
    return () => window.clearTimeout(timerRef.current);
  }, [timerMinutes]);
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) void contextRef.current?.suspend(); else if (nodesRef.current) void contextRef.current?.resume(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility); window.clearTimeout(timerRef.current);
      audioRef.current?.pause(); audioRef.current?.removeAttribute('src');
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const nodes = nodesRef.current; nodesRef.current = null;
      try { nodes?.source.stop(); } catch { /* Already stopped. */ }
      try { nodes?.oscillator?.stop(); } catch { /* Already stopped. */ }
      void contextRef.current?.close();
    };
  }, []);

  return <Stack className="reader-tool-section" gap="md">
    <div><Text fw={650}>{t('Audio & room atmosphere', 'Audio & suasana ruang')}</Text><Text size="xs" c="dimmed">{t('Choose a local audio file, make soft room sounds, or open built-in narration.', 'Pilih audio lokal, buat suara suasana, atau gunakan narasi bawaan reader.')}</Text></div>
    <Group gap="xs"><FileButton onChange={chooseFile} accept="audio/*,.mp3,.m4a,.ogg,.opus,.wav,.flac,.aac">{({ onClick }) => <Button variant="default" onClick={onClick} leftSection={<Volume2 size={15} />}>{t('Choose audio file', 'Pilih berkas audio')}</Button>}</FileButton><Text size="xs" c="dimmed">{audioName || t('No audio selected', 'Belum ada audio dipilih')}</Text></Group>
    {audioUrl && <audio key={audioUrl} ref={audioRef} className="reader-audio-player" src={audioUrl} controls preload="metadata" aria-label={t('Local audiobook player', 'Pemutar audio buku lokal')} />}
    <div><Text size="xs" fw={650} mb="xs">{t('ROOM SOUNDS · GENERATED ON THIS DEVICE', 'SUARA RUANG · DIBUAT DI PERANGKAT')}</Text><div className="reader-ambient-grid">{ambience.map(item => { const Icon = item.icon; return <button key={item.key} type="button" className="reader-ambient-choice" aria-pressed={selected === item.key} onClick={() => void toggleAmbient(item.key)}><Icon size={17} /><span>{t(item.en, item.id)}</span></button>; })}</div></div>
    <NativeSelect label={t('Stop audio after', 'Hentikan audio setelah')} value={String(timerMinutes)} onChange={event => setTimerMinutes(Number(event.currentTarget.value))} data={[{ value: '0', label: t('Off', 'Mati') }, { value: '15', label: t('15 minutes', '15 menit') }, { value: '30', label: t('30 minutes', '30 menit') }, { value: '60', label: t('60 minutes', '60 menit') }]} />
    <Text size="xs" c="dimmed">{t('Sound effects are synthesized locally. No music service or network audio is used.', 'Efek suara dibuat lokal. Tidak ada layanan musik atau audio jaringan.')}</Text>
    {status && <Alert color="gray" variant="light" role="status">{status}</Alert>}
  </Stack>;
}
