import { ActionIcon, Stack, Text, Title, Tooltip } from '@mantine/core';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { copy, useWorkspace } from '../../workspace.tsx';
import { CollectionCardBuilder } from './CollectionCardBuilder.tsx';
import { LibraryCare } from './LibraryCare.tsx';
import { PersonalPreferences } from './PersonalPreferences.tsx';
import ReadingDownloads from '../readings/ReadingDownloads.tsx';
import { SmartShelves } from './SmartShelves.tsx';
import { LibraryTextSearch } from './LibraryTextSearch.tsx';
import { WebDavSync } from './WebDavSync.tsx';
import { ReadingPresets } from './ReadingPresets.tsx';
import { ReadingSpaceSettings } from './ReadingSpaceSettings.tsx';

export function LibraryToolsScreen() {
  const { lang, store } = useWorkspace();
  const navigate = useNavigate();
  const t = (en: string, id: string) => copy(lang, en, id);
  const openBook = (bookId: string, page?: number) => navigate(`/read/${bookId}${page ? `?page=${page}` : ''}`);
  return <div className="page-shell settings-detail personal-tools-screen">
    <div className="detail-back-row"><Tooltip label={t('Back to settings', 'Kembali ke pengaturan')} withArrow><ActionIcon className="settings-back" variant="default" size={42} onClick={() => navigate('/settings')} aria-label={t('Back', 'Kembali')}><ArrowLeft size={18} /></ActionIcon></Tooltip><div><Text className="page-eyebrow">{t('YOUR DEVICE', 'PERANGKATMU')}</Text><Title order={1}>{t('Library tools', 'Alat perpustakaan')}</Title></div></div>
    <Text className="page-description personal-tools-intro">{t('Small tools for the books and reading habits you keep on this device.', 'Alat sederhana untuk buku dan kebiasaan membaca yang tersimpan di perangkat ini.')}</Text>
    <Stack className="settings-panel-stack">
      <PersonalPreferences />
      <ReadingDownloads />
      <ReadingSpaceSettings />
      <SmartShelves books={store.books} onOpen={book => openBook(book.id)} />
      <LibraryCare books={store.books} />
      <LibraryTextSearch onOpen={(book, page) => openBook(book.id, page)} />
      <WebDavSync />
      <ReadingPresets />
      <CollectionCardBuilder books={store.books} />
    </Stack>
  </div>;
}
