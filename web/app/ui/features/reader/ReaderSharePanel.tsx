import { useEffect, useState } from 'react';
import { Alert, Button, Group, Image, Select, Stack, Text, Textarea } from '@mantine/core';
import { Download, ImagePlus, Share2 } from 'lucide-react';
import { captureReaderPage, createReadingCard } from './reading-card.ts';

export function ReaderSharePanel({ reader, title, lang }: { reader: any; title: string; lang: 'en' | 'id' }) {
  const [type, setType] = useState('quote');
  const [quote, setQuote] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const t = (en: string, id: string) => lang === 'id' ? id : en;

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  const useSelection = async () => {
    const selected = window.getSelection()?.toString().trim();
    if (selected) { setQuote(selected.slice(0, 800)); return; }
    try { setQuote(String(await reader.getText(reader.currentPage()) || '').trim().slice(0, 800)); }
    catch { setStatus(t('Select text in the reader or type a short passage.', 'Pilih teks di reader atau tulis penggalan pendek.')); }
  };
  const invalidate = () => { setBlob(null); setStatus(''); setPreviewUrl(current => { if (current) URL.revokeObjectURL(current); return ''; }); };
  const create = async () => {
    if (type === 'quote' && !quote.trim()) { setStatus(t('Add a short passage first.', 'Tambahkan penggalan pendek terlebih dahulu.')); return; }
    setBusy(true); setStatus('');
    try {
      const pageImage = type === 'page' ? await captureReaderPage(reader) : null;
      const metadata = await reader.getMetadata();
      const result = await createReadingCard({ quote: quote.slice(0, 800), metadata: { ...metadata, title: metadata.title || title }, page: reader.currentPage(), pageImage });
      const url = URL.createObjectURL(result); setPreviewUrl(current => { if (current) URL.revokeObjectURL(current); return url; }); setBlob(result); setStatus(t('Ready to download or share.', 'Siap diunduh atau dibagikan.'));
    } catch (reason) { setStatus(reason instanceof Error ? reason.message : t('The reading card could not be created.', 'Kartu bacaan belum dapat dibuat.')); }
    finally { setBusy(false); }
  };
  const download = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'sela-reading-card.png'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const share = async () => {
    if (!blob) return;
    const file = new File([blob], 'sela-reading-card.png', { type: 'image/png' });
    try {
      if (!navigator.share || !navigator.canShare?.({ files: [file] })) throw new Error(t('Image sharing is unavailable. Download the PNG to share it from your device.', 'Berbagi gambar belum tersedia. Unduh PNG untuk membagikannya dari perangkat.'));
      await navigator.share({ files: [file], title: t('Sela reading card', 'Kartu bacaan Sela') });
    } catch (reason) { if (reason instanceof Error && reason.name !== 'AbortError') setStatus(reason.message); }
  };

  return <Stack className="reader-tool-section" gap="md">
    <div><Text fw={650}>{t('Make a reading card', 'Buat kartu bacaan')}</Text><Text size="xs" c="dimmed">{t('Create an image on this device to keep or share a passage.', 'Buat gambar di perangkat ini untuk menyimpan atau membagikan kutipan.')}</Text></div>
    <Select label={t('Card type', 'Jenis kartu')} value={type} onChange={value => { setType(value || 'quote'); invalidate(); }} data={[{ value: 'quote', label: t('Quote card', 'Kartu kutipan') }, { value: 'page', label: t('Page image', 'Gambar halaman') }]} allowDeselect={false} />
    {type === 'quote' && <><Textarea label={t('Passage', 'Penggalan teks')} value={quote} onChange={event => { setQuote(event.currentTarget.value.slice(0, 800)); invalidate(); }} maxLength={800} minRows={5} autosize /><Button variant="default" onClick={() => void useSelection()} leftSection={<ImagePlus size={15} />}>{t('Use selection or current page', 'Gunakan pilihan atau halaman ini')}</Button></>}
    <Group gap="xs"><Button onClick={() => void create()} loading={busy}>{t('Create preview', 'Buat pratinjau')}</Button>{blob && <><Button variant="default" leftSection={<Download size={15} />} onClick={download}>{t('Download PNG', 'Unduh PNG')}</Button><Button variant="default" leftSection={<Share2 size={15} />} onClick={() => void share()}>{t('Share image', 'Bagikan gambar')}</Button></>}</Group>
    {previewUrl && <Image className="reader-card-preview" src={previewUrl} alt={t('Reading card preview', 'Pratinjau kartu bacaan')} radius="md" />}
    {status && <Alert color={blob ? 'green' : 'gray'} variant="light" role="status">{status}</Alert>}
  </Stack>;
}
