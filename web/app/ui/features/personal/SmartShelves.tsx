import { useMemo, useState } from 'react';
import { Alert, Button, Card, Group, Select, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Trash2 } from 'lucide-react';
import type { LibraryBook } from '../../../../../app/library/models.ts';
import { editPersonal, matchesRack, readPersonal } from '../../../../../app/library/personal-store.ts';
import { copy, useWorkspace } from '../../workspace.tsx';

const ruleTypes = [
  ['unread', 'Want to read', 'Nanti dibaca'], ['reading', 'Currently reading', 'Sedang dibaca'],
  ['finished', 'Finished', 'Selesai'], ['didNotFinish', 'Did not finish', 'Tidak dilanjutkan'],
  ['favorite', 'Favorites', 'Favorit'], ['format', 'File format', 'Format file'],
  ['language', 'Book language', 'Bahasa buku'], ['series', 'Series', 'Seri'],
  ['collection', 'Collection', 'Koleksi'], ['recent', 'Opened recently', 'Baru dibuka'],
] as const;

export function SmartShelves({ books, onOpen }: { books: LibraryBook[]; onOpen: (book: LibraryBook) => void }) {
  const { lang, store } = useWorkspace();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('unread');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const racks = useMemo(() => readPersonal().racks, [revision]);
  const t = (en: string, id: string) => copy(lang, en, id);
  const typeOptions = ruleTypes.map(([value, en, id]) => ({ value, label: t(en, id) }));
  const rule = ['format', 'language', 'series', 'collection', 'recent'].includes(type) ? `${type}:${value.trim()}` : type;
  const valueLabel = type === 'format' ? t('File format', 'Format file') : type === 'language' ? t('Language code', 'Kode bahasa') : type === 'series' ? t('Series name', 'Nama seri') : type === 'collection' ? t('Choose collection', 'Pilih koleksi') : t('Days', 'Jumlah hari');
  const canCreate = name.trim().length > 0 && (!['format', 'language', 'series', 'collection', 'recent'].includes(type) || !!value.trim());

  const create = () => {
    setError('');
    if (!canCreate || !/^(unread|reading|finished|didNotFinish|favorite|format:.+|language:.+|series:.+|collection:.+|recent:(7|30|90))$/.test(rule)) {
      setError(t('Add a valid name and rule value.', 'Isi nama dan aturan rak yang valid.')); return;
    }
    if (racks.some(row => row.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase())) {
      setError(t('A shelf with that name already exists.', 'Nama rak tersebut sudah digunakan.')); return;
    }
    try {
      editPersonal(data => { data.racks.push({ name: name.trim().slice(0, 40), rule, description: description.trim().slice(0, 500), badge: 'book' }); });
      setName(''); setDescription(''); setValue(''); setRevision(value => value + 1);
      notifications.show({ message: t('Smart shelf saved.', 'Rak pintar tersimpan.'), color: 'quill' });
    } catch (reason) { setError(reason instanceof Error ? reason.message : t('Shelf could not be saved.', 'Rak belum bisa disimpan.')); }
  };

  const remove = (rackName: string) => {
    try { editPersonal(data => { data.racks = data.racks.filter(rack => rack.name !== rackName); }); setRevision(value => value + 1); }
    catch (reason) { notifications.show({ message: reason instanceof Error ? reason.message : t('Shelf could not be removed.', 'Rak belum bisa dihapus.'), color: 'red' }); }
  };

  return <Card className="settings-panel personal-tools-card" withBorder radius="xl" padding="lg">
    <div><Text className="page-eyebrow">{t('VIEWS OF YOUR SHELF', 'TAMPILAN RAKMU')}</Text><Title order={2}>{t('Smart shelves', 'Rak pintar')}</Title><Text>{t('Save a rule once, then let Sela keep the matching books together.', 'Simpan aturan sekali, lalu Sela mengelompokkan buku yang cocok secara otomatis.')}</Text></div>
    <Stack gap="sm">
      {error && <Alert color="red" role="alert">{error}</Alert>}
      <SimpleGrid cols={{ base: 1, sm: 2 }}><TextInput label={t('Shelf name', 'Nama rak')} value={name} onChange={event => setName(event.currentTarget.value)} maxLength={40} /><Select label={t('Show books that', 'Tampilkan buku yang')} data={typeOptions} value={type} onChange={next => { setType(next || 'unread'); setValue(''); }} allowDeselect={false} /></SimpleGrid>
      {['format', 'language', 'series', 'collection', 'recent'].includes(type) && <>
        {type === 'collection' ? <Select label={valueLabel} data={store.collections.map(item => ({ value: item, label: item }))} value={value} onChange={next => setValue(next || '')} searchable allowDeselect={false} /> : type === 'recent' ? <Select label={valueLabel} data={['7', '30', '90'].map(days => ({ value: days, label: t(`${days} days`, `${days} hari`) }))} value={value || '7'} onChange={next => setValue(next || '7')} allowDeselect={false} /> : <TextInput label={valueLabel} value={value} onChange={event => setValue(event.currentTarget.value)} maxLength={80} placeholder={type === 'format' ? 'epub' : type === 'language' ? 'id' : t('Series title', 'Judul seri')} />}
      </>}
      <TextInput label={t('Description (optional)', 'Deskripsi (opsional)')} value={description} onChange={event => setDescription(event.currentTarget.value)} maxLength={500} />
      <Group justify="flex-end"><Button onClick={create} disabled={!canCreate}>{t('Save smart shelf', 'Simpan rak pintar')}</Button></Group>
    </Stack>
    {racks.length > 0 ? <div className="smart-shelf-list">{racks.map(rack => {
      const matching = books.filter(book => matchesRack(book, rack.rule));
      return <section key={`${rack.name}:${rack.rule}`} className="smart-shelf-row">
        <div className="smart-shelf-heading"><div><strong>{rack.name}</strong>{rack.description && <small>{rack.description}</small>}</div><span>{matching.length}</span><Button variant="subtle" color="gray" size="compact-sm" aria-label={t(`Remove ${rack.name}`, `Hapus ${rack.name}`)} onClick={() => remove(rack.name)}><Trash2 size={15} /></Button></div>
        {matching.length ? <div className="smart-shelf-books">{matching.slice(0, 8).map(book => <button key={book.id} type="button" onClick={() => onOpen(book)}>{book.name}<span>{book.metadata?.author || (book.format || 'book').toUpperCase()}</span></button>)}</div> : <Text size="xs" c="dimmed">{t('No books match this rule yet.', 'Belum ada buku yang cocok dengan aturan ini.')}</Text>}
      </section>;
    })}</div> : <Text size="sm" c="dimmed">{t('Your saved shelves will appear here.', 'Rak yang disimpan akan muncul di sini.')}</Text>}
  </Card>;
}
