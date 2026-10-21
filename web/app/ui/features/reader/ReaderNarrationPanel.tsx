import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Group, NativeSelect, Slider, Stack, Switch, Text } from '@mantine/core';
import { AudioLines, Pause, Play, SkipBack, SkipForward, Square } from 'lucide-react';

function splitSpeech(text: string) {
  const chunks: string[] = [];
  for (const paragraph of text.split(/\n+/)) {
    let rest = paragraph.trim();
    while (rest) {
      let end = Math.min(240, rest.length);
      if (end < rest.length) {
        const sentence = rest.slice(0, end).search(/[.!?。！？][\s]*[^.!?。！？]*$/);
        const space = rest.lastIndexOf(' ', end);
        if (sentence > 40) end = sentence + 1; else if (space > 40) end = space;
      }
      chunks.push(rest.slice(0, end).trim()); rest = rest.slice(end).trim();
    }
  }
  return chunks;
}

export function ReaderNarrationPanel({ reader, lang }: { reader: any; lang: 'en' | 'id' }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [localOnly, setLocalOnly] = useState(true);
  const [rate, setRate] = useState(1);
  const [continuePages, setContinuePages] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [page, setPage] = useState(reader.currentPage());
  const [selectedText, setSelectedText] = useState('');
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState('');
  const run = useRef(0);
  const activePage = useRef(reader.currentPage());
  const playingRef = useRef(false);
  const chunkIndex = useRef(0);
  const currentChunks = useRef<string[]>([]);
  const pendingResolve = useRef<(() => void) | null>(null);
  const skip = useRef(false);
  const t = (en: string, id: string) => lang === 'id' ? id : en;
  const availableVoices = useMemo(() => localOnly ? voices.filter(voice => voice.localService) : voices, [voices, localOnly]);
  const activeVoice = availableVoices.find(voice => voice.voiceURI === voiceURI) || availableVoices.find(voice => voice.lang.toLowerCase().startsWith(lang)) || availableVoices[0];

  const stop = () => { run.current++; playingRef.current = false; window.speechSynthesis?.cancel(); pendingResolve.current?.(); pendingResolve.current = null; setPlaying(false); setPaused(false); skip.current = false; };
  const stopRef = useRef(stop); stopRef.current = stop;

  useEffect(() => {
    const synth = window.speechSynthesis;
    const syncVoices = () => setVoices(synth?.getVoices?.() || []);
    syncVoices(); synth?.addEventListener?.('voiceschanged', syncVoices);
    const changed = (event: Event) => {
      const next = Number((event as CustomEvent<{ page: number }>).detail?.page) || reader.currentPage();
      setPage(next);
      if (playingRef.current && next !== activePage.current) stopRef.current();
    };
    const selection = () => setSelectedText(window.getSelection()?.toString().trim().slice(0, 10000) || '');
    reader.addEventListener('pagechange', changed); document.addEventListener('selectionchange', selection);
    return () => { synth?.removeEventListener?.('voiceschanged', syncVoices); reader.removeEventListener('pagechange', changed); document.removeEventListener('selectionchange', selection); stopRef.current(); };
  }, [reader]);

  useEffect(() => {
    if (!sleepMinutes) return;
    const timer = window.setTimeout(() => { stopRef.current(); setStatus(t('Sleep timer finished.', 'Timer tidur selesai.')); setSleepMinutes(0); }, sleepMinutes * 60_000);
    return () => window.clearTimeout(timer);
  }, [sleepMinutes, lang]);

  const begin = async (startAt = 0, chosenText = '') => {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') { setStatus(t('Speech is unavailable in this browser.', 'Narasi suara tidak tersedia di browser ini.')); return; }
    if (!activeVoice) { setStatus(t('No matching local voice is installed. Choose an available voice or allow online voices.', 'Belum ada suara lokal yang sesuai. Pilih suara lain atau izinkan suara daring.')); return; }
    const token = ++run.current; playingRef.current = true; setPlaying(true); setPaused(false); setStatus(''); skip.current = false;
    const speakPage = async (at: number, offset: number, textOverride = ''): Promise<void> => {
      if (token !== run.current) return;
      activePage.current = at; setPage(at);
      let text = textOverride;
      if (!text) { try { text = String(await reader.getText(at) || ''); } catch { text = ''; } }
      if (token !== run.current) return;
      const chunks = splitSpeech(text); currentChunks.current = chunks;
      if (!chunks.length) { playingRef.current = false; setStatus(t('This page has no extractable text.', 'Halaman ini tidak memiliki teks yang dapat dibaca.')); setPlaying(false); return; }
      for (let index = offset; index < chunks.length; index++) {
        if (token !== run.current) return;
        chunkIndex.current = index; setStatus(chunks[index]);
        await new Promise<void>(resolve => {
          const utterance = new SpeechSynthesisUtterance(chunks[index]); utterance.voice = activeVoice; utterance.lang = activeVoice.lang; utterance.rate = rate;
          let settled = false; const finish = () => { if (settled) return; settled = true; if (pendingResolve.current === finish) pendingResolve.current = null; resolve(); };
          pendingResolve.current = finish; utterance.onend = finish; utterance.onerror = finish;
          try { synth.speak(utterance); } catch { finish(); }
        });
        if (token !== run.current) return;
        if (skip.current) skip.current = false;
      }
      if (token !== run.current) return;
      if (continuePages && !textOverride && at < reader.totalPages) { activePage.current = at + 1; reader.goTo(at + 1); await speakPage(at + 1, 0); return; }
      playingRef.current = false; setPlaying(false); setPaused(false); setStatus(t('Narration finished.', 'Bacaan selesai.'));
    };
    await speakPage(reader.currentPage(), startAt, chosenText);
  };

  const nextPassage = () => { if (!playing) { void begin(0); return; } skip.current = true; window.speechSynthesis?.cancel(); pendingResolve.current?.(); };
  const previousPassage = () => { const start = Math.max(0, chunkIndex.current - 1); stop(); void begin(start); };
  const togglePause = () => { const synth = window.speechSynthesis; if (paused) { synth?.resume(); setPaused(false); } else { synth?.pause(); setPaused(true); } };

  return <Stack className="reader-tool-section reader-narration-panel" gap="md">
    <div><Text fw={650}>{t('Read aloud', 'Baca bersuara')}</Text><Text size="xs" c="dimmed">{t('Narration uses voices installed by your browser or operating system.', 'Narasi memakai suara yang tersedia di browser atau sistem operasi.')}</Text></div>
    <NativeSelect label={t('Narration voice', 'Suara narasi')} value={activeVoice?.voiceURI || ''} onChange={event => { stop(); setVoiceURI(event.currentTarget.value); }} data={availableVoices.map(voice => ({ value: voice.voiceURI, label: `${voice.name} · ${voice.lang} · ${t('local', 'lokal')}` }))} disabled={!availableVoices.length} />
    <div className="reader-slider-field"><Text size="xs" fw={600}>{t('Speaking rate', 'Kecepatan baca')} · {rate.toFixed(1)}×</Text><Slider min={0.65} max={1.8} step={0.05} value={rate} onChange={value => { stop(); setRate(value); }} thumbLabel={t('Speaking rate', 'Kecepatan baca')} /></div>
    <Group className="reader-narration-options"><Switch label={t('Continue to next page', 'Lanjut ke halaman berikutnya')} checked={continuePages} onChange={event => setContinuePages(event.currentTarget.checked)} /><Switch label={t('Local voices only', 'Suara lokal saja')} checked={localOnly} onChange={event => { stop(); setLocalOnly(event.currentTarget.checked); }} /></Group>
    <NativeSelect label={t('Sleep timer', 'Timer tidur')} value={String(sleepMinutes)} onChange={event => setSleepMinutes(Number(event.currentTarget.value))} data={[{ value: '0', label: t('Off', 'Mati') }, { value: '5', label: t('5 minutes', '5 menit') }, { value: '15', label: t('15 minutes', '15 menit') }, { value: '30', label: t('30 minutes', '30 menit') }, { value: '60', label: t('60 minutes', '60 menit') }]} />
    <Group gap="xs"><Button variant="default" aria-label={t('Previous passage', 'Bagian sebelumnya')} onClick={previousPassage}><SkipBack size={15} /></Button><Button leftSection={playing ? <Pause size={15} /> : <Play size={15} />} onClick={() => playing ? togglePause() : void begin()} disabled={!activeVoice}>{playing ? paused ? t('Resume', 'Lanjutkan') : t('Pause', 'Jeda') : t('Listen', 'Dengarkan')}</Button><Button variant="default" aria-label={t('Next passage', 'Bagian berikutnya')} onClick={nextPassage}><SkipForward size={15} /></Button><Button variant="default" aria-label={t('Stop narration', 'Hentikan narasi')} onClick={() => { stop(); setStatus(t('Narration stopped.', 'Narasi dihentikan.')); }}><Square size={14} /></Button></Group>
    {selectedText && <Button variant="light" leftSection={<AudioLines size={15} />} onMouseDown={event => event.preventDefault()} onClick={() => void begin(0, selectedText)}>{t('Read selected text', 'Baca teks pilihan')}</Button>}
    <Text size="xs" role="status" aria-live="polite" c="dimmed">{playing ? `${t('Page ', 'Halaman ')}${page} · ` : ''}{status || t('Narration stays on this device. Online voices may send text to their provider.', 'Narasi berjalan di perangkat ini. Suara daring dapat mengirim teks ke penyedianya.')}</Text>
    {!availableVoices.length && <Alert color="gray" variant="light">{t('No voices are available for this language. Install a voice in your system settings or turn off local-only mode.', 'Belum ada suara untuk bahasa ini. Pasang suara di pengaturan sistem atau matikan opsi suara lokal saja.')}</Alert>}
  </Stack>;
}
