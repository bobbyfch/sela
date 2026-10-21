import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Alert, Button, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router';
import { BookOpen, X } from 'lucide-react';
import { importBook } from '../../../../../app/library/storage.ts';
import { faithSource, loadFaithLibrary, type FaithId, type FaithTextBook, type FaithTextChapter, type FaithTextLibrary } from '../../../../../app/library/scripture-sources.ts';
import { useWorkspace, copy } from '../../workspace.tsx';

const browsableFaiths = new Set<FaithId>(['protestantism', 'catholicism', 'buddhism', 'hinduism', 'confucianism']);
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
const sectionText = (section?: FaithTextChapter | FaithTextBook) => {
  if (!section) return '';
  if ('verses' in section && Array.isArray(section.verses)) return section.verses.map(verse => `${verse.number}. ${verse.text}`).join('\n').trim();
  return typeof section.text === 'string' ? section.text.trim() : '';
};

function makeEditionFile(title: string, sectionTitle: string, text: string, edition: string, source: string) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>*{box-sizing:border-box}body{max-width:52rem;margin:0 auto;padding:clamp(1rem,4vw,2.5rem);font:1rem/1.8 system-ui,sans-serif;color:#272622}header{padding:1.2rem;border:1px solid #8885;border-radius:1.2rem;background:#8881}h1{margin:.3rem 0;font-size:clamp(1.4rem,4vw,2rem);line-height:1.2}.edition{font-size:.8rem;opacity:.7}article{padding:clamp(1rem,3vw,1.6rem);border:1px solid #8884;border-radius:1.2rem;white-space:pre-wrap;overflow-wrap:anywhere}a{color:inherit}</style></head><body><main><header><small>Sela Books · sourced edition</small><h1>${escapeHtml(sectionTitle)}</h1><p class="edition">${escapeHtml(edition)}</p></header><article>${escapeHtml(text)}</article><p><a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">Open source ↗</a></p></main></body></html>`;
  return new File([html], `faith-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`, { type: 'text/html' });
}

export function FaithLibraryBrowser({ faith }: { faith: FaithId }) {
  const { lang, store, announce } = useWorkspace();
  const navigate = useNavigate();
  const t = (en: string, id: string) => copy(lang, en, id);
  const [opened, setOpened] = useState(false);
  const [library, setLibrary] = useState<FaithTextLibrary | null>(null);
  const [bookIndex, setBookIndex] = useState<string | null>(null);
  const [chapterIndex, setChapterIndex] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const mobile = useMediaQuery('(max-width: 48em)');

  useEffect(() => {
    if (!opened) return;
    let active = true;
    setLibrary(null); setStatus(t('Loading edition…', 'Memuat edisi…')); setError('');
    void loadFaithLibrary(faith).then(result => {
      if (!active) return;
      setLibrary(result);
      const firstBook = result.books?.[0];
      setBookIndex(firstBook ? '0' : result.chapters?.length ? '0' : null);
      setChapterIndex(firstBook?.chapters?.length ? '0' : null);
      setStatus(t('This edition is stored with the app for offline reading.', 'Edisi ini tersimpan bersama aplikasi untuk dibaca offline.'));
    }).catch(reason => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : t('The edition could not be opened.', 'Edisi belum dapat dibuka.'));
      setStatus('');
    });
    return () => { active = false; };
  }, [opened, faith, lang]);

  const books = library?.books || [];
  const chapters = useMemo(() => {
    if (books.length) return books[Number(bookIndex)]?.chapters || [];
    return library?.chapters || [];
  }, [books, library, bookIndex]);
  const book = books[Number(bookIndex)] as FaithTextBook | undefined;
  const chapter = chapters[Number(chapterIndex)] as FaithTextChapter | undefined;
  const text = sectionText(chapter || book);
  const title = chapter?.title || (chapter ? `${t('Chapter', 'Bab')} ${chapter.number}` : book?.title || book?.name || library?.title || 'Reading');
  const bookLabel = book?.name || book?.title || '';
  const sectionName = book && chapter ? `${bookLabel} · ${title}` : title;
  if (!browsableFaiths.has(faith)) return null;

  const openInReader = async () => {
    if (!library || !text || busy) return;
    setBusy(true); setError('');
    try {
      const edition = [library.edition || library.title || 'Faith reading', library.translator, library.license].filter(Boolean).join(' · ');
      const source = library.source || faithSource(faith);
      const file = makeEditionFile(`${faith}-${sectionName}`, sectionName, text, edition, source);
      const result = await importBook(file);
      await store.refresh();
      setOpened(false);
      navigate(`/read/${result.book.id}`);
      announce(t('The selected passage is ready in the reader.', 'Bacaan pilihan siap dibuka di reader.'));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('This passage could not be opened in Sela.', 'Bacaan ini belum bisa dibuka di Sela.'));
    } finally { setBusy(false); }
  };

  return <>
    <Button className="faith-library-trigger" variant="default" leftSection={<BookOpen size={15} />} onClick={() => setOpened(true)}>{t('Browse the library', 'Jelajahi pustaka')}</Button>
    <Modal className="faith-library-modal" opened={opened} onClose={() => setOpened(false)} fullScreen={!!mobile} size="min(700px, calc(100vw - 32px))" centered title={t('Source library', 'Pustaka sumber')} closeButtonProps={{ icon: <X size={16} />, 'aria-label': t('Close library', 'Tutup pustaka') }} overlayProps={{ backgroundOpacity: 0.48, blur: 12 }}>
      <Stack gap="md">
        <Text size="sm" c="dimmed">{t('Choose a book and chapter from this attributed edition.', 'Pilih kitab dan bab dari edisi dengan atribusi sumber.')}</Text>
        {library && <>
          {books.length > 0 && <Select label={faith === 'confucianism' ? t('Book', 'Kitab') : t('Book', 'Kitab')} value={bookIndex} onChange={value => { setBookIndex(value); setChapterIndex(books[Number(value)]?.chapters?.length ? '0' : null); }} data={books.map((item, index) => ({ value: String(index), label: item.name || item.title || `${t('Book', 'Kitab')} ${index + 1}` }))} searchable maxDropdownHeight={280} />}
          {chapters.length > 0 && <Select label={t('Chapter', 'Bab')} value={chapterIndex} onChange={setChapterIndex} data={chapters.map((item, index) => ({ value: String(index), label: item.title || `${t('Chapter', 'Bab')} ${item.number}` }))} searchable maxDropdownHeight={280} />}
          <div className="faith-library-edition"><Text fw={600} size="sm">{library.edition || library.title}</Text><Text size="xs" c="dimmed">{[library.translator, library.license].filter(Boolean).join(' · ')}</Text>{(library.source || faithSource(faith)).startsWith('https://') && <a href={library.source || faithSource(faith)} target="_blank" rel="noopener noreferrer">{t('Open original source', 'Buka sumber asli')} ↗</a>}</div>
          <Group justify="space-between" align="center"><Text size="xs" c="dimmed">{status}</Text><Button leftSection={<BookOpen size={15} />} loading={busy} disabled={!text} onClick={() => void openInReader()}>{t('Open in Sela', 'Buka di Sela')}</Button></Group>
        </>}
        {error && <Alert color="yellow" role="status">{error}</Alert>}
      </Stack>
    </Modal>
  </>;
}
