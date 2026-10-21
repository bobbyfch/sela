import { useEffect, useState } from 'react';
import { ActionIcon, Modal, Tabs, Tooltip } from '@mantine/core';
import { SlidersHorizontal } from 'lucide-react';
import { useMediaQuery } from '@mantine/hooks';
import type { LibraryBook } from '../../../../../app/library/models.ts';
import type { BookMetadata } from '../../../../../src/public-api.ts';
import { useWorkspace, copy } from '../../workspace.tsx';
import { ReaderSettingsPanel } from './ReaderSettingsPanel.tsx';
import { ReaderProfilesPanel } from './ReaderProfilesPanel.tsx';
import { ReaderAudioPanel } from './ReaderAudioPanel.tsx';
import { ReaderDictionaryPanel } from './ReaderDictionaryPanel.tsx';
import { ReaderSharePanel } from './ReaderSharePanel.tsx';
import { ReaderBookInfoPanel } from './ReaderBookInfoPanel.tsx';
import { ReaderContentsPanel } from './ReaderContentsPanel.tsx';
import { ReaderSearchPanel } from './ReaderSearchPanel.tsx';
import { ReaderAnnotationsPanel } from './ReaderAnnotationsPanel.tsx';
import { ReaderNarrationPanel } from './ReaderNarrationPanel.tsx';

export function ReaderToolsDialog({ reader, book, onSaveMetadata, opened: controlledOpened, onOpenedChange, showTrigger = true, onShowPreviews, initialTab, selectedText = '' }: { reader: any; book: LibraryBook; onSaveMetadata: (metadata: BookMetadata) => Promise<void>; opened?: boolean; onOpenedChange?: (opened: boolean) => void; showTrigger?: boolean; onShowPreviews?: () => void; initialTab?: string; selectedText?: string }) {
  const { lang } = useWorkspace();
  const [uncontrolledOpened, setUncontrolledOpened] = useState(false);
  const opened = controlledOpened ?? uncontrolledOpened;
  const setOpened = (value: boolean) => { setUncontrolledOpened(value); onOpenedChange?.(value); };
  const [activeTab, setActiveTab] = useState<string | null>('layout');
  const mobile = useMediaQuery('(max-width: 48em)');
  const t = (en: string, id: string) => copy(lang, en, id);
  useEffect(() => { if (opened && initialTab) setActiveTab(initialTab); }, [opened, initialTab]);
  const openReaderPanel = (tab: string) => setActiveTab(tab);
  const showPreviews = () => { setOpened(false); onShowPreviews?.(); };

  return <>
    {showTrigger && <Tooltip label={t('Reader tools', 'Alat reader')} withArrow>
      <ActionIcon className="reader-tools-trigger" variant="default" size={44} radius="xl" aria-label={t('Open reader tools', 'Buka alat reader')} onClick={() => setOpened(true)}><SlidersHorizontal size={18} /></ActionIcon>
    </Tooltip>}
    <Modal className="reader-tools-modal" opened={opened} onClose={() => setOpened(false)} fullScreen={!!mobile} size="min(820px, calc(100vw - 32px))" centered title={t('Reading desk', 'Meja baca')} overlayProps={{ backgroundOpacity: 0.48, blur: 14 }}>
      <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false} className="reader-tools-tabs">
        <Tabs.List grow>
          <Tabs.Tab value="layout">{t('Layout', 'Tata letak')}</Tabs.Tab>
          <Tabs.Tab value="contents">{t('Contents', 'Daftar isi')}</Tabs.Tab>
          <Tabs.Tab value="search">{t('Search', 'Cari')}</Tabs.Tab>
          <Tabs.Tab value="notes">{t('Notes', 'Catatan')}</Tabs.Tab>
          <Tabs.Tab value="profiles">{t('Profiles', 'Profil')}</Tabs.Tab>
          <Tabs.Tab value="audio">{t('Audio', 'Audio')}</Tabs.Tab>
          <Tabs.Tab value="dictionary">{t('Words', 'Kata')}</Tabs.Tab>
          <Tabs.Tab value="share">{t('Share', 'Bagikan')}</Tabs.Tab>
          <Tabs.Tab value="info">{t('Book info', 'Info buku')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="layout" pt="md"><ReaderSettingsPanel reader={reader} format={book.format || ''} lang={lang} onReaderPanel={openReaderPanel} onShowPreviews={showPreviews} /></Tabs.Panel>
        <Tabs.Panel value="contents" pt="md"><ReaderContentsPanel reader={reader} lang={lang} /></Tabs.Panel>
        <Tabs.Panel value="search" pt="md"><ReaderSearchPanel reader={reader} lang={lang} /></Tabs.Panel>
        <Tabs.Panel value="notes" pt="md"><ReaderAnnotationsPanel reader={reader} title={book.metadata?.title || book.name} lang={lang} selectedText={selectedText} /></Tabs.Panel>
        <Tabs.Panel value="profiles" pt="md"><ReaderProfilesPanel key={book.id} reader={reader} lang={lang} bookId={book.id} /></Tabs.Panel>
        <Tabs.Panel value="audio" pt="md"><ReaderAudioPanel lang={lang} /><ReaderNarrationPanel reader={reader} lang={lang} /></Tabs.Panel>
        <Tabs.Panel value="dictionary" pt="md"><ReaderDictionaryPanel reader={reader} lang={lang} /></Tabs.Panel>
        <Tabs.Panel value="share" pt="md"><ReaderSharePanel reader={reader} title={book.metadata?.title || book.name} lang={lang} /></Tabs.Panel>
        <Tabs.Panel value="info" pt="md"><ReaderBookInfoPanel key={book.id} book={book} reader={reader} lang={lang} onSave={onSaveMetadata} /></Tabs.Panel>
      </Tabs>
    </Modal>
  </>;
}
