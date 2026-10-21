import { useState } from 'react';
import { Alert, Button, FileButton, Group, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { BookMarked, BookOpenText, Languages, Search, Upload } from 'lucide-react';
import { responseText } from '../../../../../app/library/network.ts';

const dictionaryKey = 'sela-library:dictionary';
function readDictionary(): Record<string, string> {
  try { const data = JSON.parse(localStorage.getItem(dictionaryKey) || '{}'); return data && typeof data === 'object' && !Array.isArray(data) ? data : {}; } catch { return {}; }
}
function byteLimited(value: string, limit: number) {
  const encoder = new TextEncoder(); let output = '';
  for (const character of value) { if (encoder.encode(output + character).length > limit) break; output += character; }
  return output;
}

export function ReaderDictionaryPanel({ reader, lang }: { reader: any; lang: 'en' | 'id' }) {
  const [text, setText] = useState('');
  const [direction, setDirection] = useState('en|id');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const t = (en: string, id: string) => lang === 'id' ? id : en;
  const loadSelection = async () => {
    const selected = window.getSelection()?.toString().trim();
    if (selected) { setText(selected.slice(0, 1000)); return; }
    try { const excerpt = await reader.getText(reader.currentPage()); setText(String(excerpt || '').trim().slice(0, 1000)); }
    catch { setStatus(t('Select a passage in the book first.', 'Pilih penggalan teks di buku terlebih dahulu.')); }
  };
  const importPack = async (file: File | null) => {
    if (!file) return;
    try {
      if (file.size > 1048576) throw new Error(t('Dictionary files must be under 1 MiB.', 'Berkas kamus harus di bawah 1 MiB.'));
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length > 20_000 || Object.values(data).some(value => typeof value !== 'string' || value.length > 2000)) throw new Error(t('Use a JSON object of words mapped to definitions.', 'Gunakan objek JSON yang memetakan kata ke definisinya.'));
      localStorage.setItem(dictionaryKey, JSON.stringify(data)); setStatus(t('Local dictionary is ready.', 'Kamus lokal siap digunakan.'));
    } catch (reason) { setStatus(reason instanceof Error ? reason.message : t('Dictionary could not be loaded.', 'Kamus belum dapat dimuat.')); }
  };
  const lookupLocal = () => {
    const dictionary = readDictionary(); const word = text.trim().toLocaleLowerCase();
    const definition = dictionary[word]; setResult(typeof definition === 'string' ? definition : t('Word not found in your local dictionary.', 'Kata tidak ditemukan di kamus lokal.')); setStatus('');
  };
  const lookupEnglish = async () => {
    const word = text.trim().split(/\s+/)[0]; if (!word) return;
    setBusy(true); setStatus('');
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { signal: AbortSignal.timeout(10_000), credentials: 'omit', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error(t('Dictionary service is unavailable.', 'Layanan kamus belum tersedia.'));
      const data = JSON.parse(await responseText(response, 128 * 1024));
      const definitions = Array.isArray(data?.[0]?.meanings) ? data[0].meanings.flatMap((meaning: any) => Array.isArray(meaning.definitions) ? meaning.definitions.map((definition: any) => definition.definition) : []).filter((value: unknown) => typeof value === 'string').slice(0, 3) : [];
      setResult(definitions.join(' · ') || t('No definition was returned.', 'Definisi tidak ditemukan.'));
    } catch (reason) { setStatus(reason instanceof Error ? reason.message : t('Dictionary service is unavailable.', 'Layanan kamus belum tersedia.')); }
    finally { setBusy(false); }
  };
  const translate = async () => {
    const passage = byteLimited(text.trim(), 500); if (!passage) return;
    setBusy(true); setStatus('');
    try {
      const url = `https://api.mymemory.translated.net/get?${new URLSearchParams({ langpair: direction, q: passage })}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(10_000), credentials: 'omit', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error(t('Translation service is unavailable.', 'Layanan terjemahan belum tersedia.'));
      const data = JSON.parse(await responseText(response, 128 * 1024));
      if (data.responseStatus !== undefined && Number(data.responseStatus) !== 200) throw new Error(t('Translation service rejected this text.', 'Layanan terjemahan menolak teks ini.'));
      if (typeof data.responseData?.translatedText !== 'string') throw new Error(t('No translation was returned.', 'Terjemahan tidak ditemukan.'));
      setResult(data.responseData.translatedText);
    } catch (reason) { setStatus(reason instanceof Error ? reason.message : t('Translation service is unavailable.', 'Layanan terjemahan belum tersedia.')); }
    finally { setBusy(false); }
  };

  return <Stack className="reader-tool-section" gap="md">
    <div><Text fw={650}>{t('Dictionary & translation', 'Kamus & terjemahan')}</Text><Text size="xs" c="dimmed">{t('Use a local dictionary or send a selected passage to an online provider only when you choose an action.', 'Gunakan kamus lokal atau kirim teks pilihan ke layanan online hanya setelah kamu memilih aksinya.')}</Text></div>
    <Textarea label={t('Word or passage', 'Kata atau penggalan')} value={text} onChange={event => setText(event.currentTarget.value.slice(0, 1000))} maxLength={1000} minRows={5} autosize />
    <Group gap="xs" wrap="wrap"><Button variant="default" leftSection={<BookOpenText size={15} />} onClick={() => void loadSelection()}>{t('Use selection or current page', 'Gunakan pilihan atau halaman ini')}</Button><FileButton onChange={file => void importPack(file)} accept=".json,application/json">{({ onClick }) => <Button variant="default" onClick={onClick} leftSection={<Upload size={14} />}>{t('Load dictionary JSON', 'Muat kamus JSON')}</Button>}</FileButton></Group>
    <Group gap="xs" wrap="wrap"><Button variant="light" leftSection={<BookMarked size={15} />} onClick={lookupLocal}>{t('Look up locally', 'Cari di kamus lokal')}</Button><Button variant="light" leftSection={<Search size={15} />} loading={busy} onClick={() => void lookupEnglish()}>{t('Look up English online', 'Cari arti bahasa Inggris')}</Button></Group>
    <div className="reader-translation-row"><Select label={t('Translation direction', 'Arah terjemahan')} value={direction} onChange={value => setDirection(value || 'en|id')} data={[{ value: 'en|id', label: 'English → Indonesia' }, { value: 'id|en', label: 'Indonesia → English' }]} allowDeselect={false} /><Button loading={busy} onClick={() => void translate()} leftSection={<Languages size={15} />}>{t('Translate online', 'Terjemahkan online')}</Button></div>
    {result && <Alert color="gray" variant="light" title={t('Result', 'Hasil')}>{result}</Alert>}
    {status && <Alert color="yellow" variant="light" role="status">{status}</Alert>}
  </Stack>;
}
