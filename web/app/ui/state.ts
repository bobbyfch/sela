import { useCallback, useEffect, useState } from 'react';
import type { LibraryBook } from '../../../app/library/models.ts';
import { changeCollection, importBook, listBooks, listCollections, updateBook, writeBook } from '../../../app/library/storage.ts';
import { isReflowableBookFormat } from '../../../app/library/reader-modes.ts';

export type ThemeName = 'vanilla' | 'olive' | 'parchment' | 'mist' | 'stone' | 'oat' | 'cocoa' | 'ivory';
export type AppearanceName = 'light' | 'dark' | 'oled';
export type LanguageName = 'id' | 'en';
export type ShelfFinish = 'oak' | 'olive' | 'ink';
export type AppPreferences = {
  theme: ThemeName;
  appearance: AppearanceName;
  language: LanguageName;
  finish: ShelfFinish;
  density: number;
  widgets: { calendar: boolean; reflection: boolean; water: boolean; history: boolean; news: boolean; faith: boolean; prayer: boolean; weather: boolean };
  defaultTextMode: 'single' | 'scroll';
  defaultPageMode: 'single' | 'book' | 'scroll' | 'webtoon' | 'manga';
};

export function defaultReadingMode(format: string | undefined, preferences: Pick<AppPreferences, 'defaultPageMode' | 'defaultTextMode'>) {
  const normalized = (format || '').toLowerCase();
  const presetKind = ['epub', 'txt', 'md', 'html', 'fb2', 'docx', 'odt'].includes(normalized) ? 'novel' : normalized === 'cbz' ? 'comic' : 'document';
  try {
    const preset = JSON.parse(localStorage.getItem(`sela-library:preset:${presetKind}`) || '{}').mode;
    const allowed = presetKind === 'novel' ? ['single', 'scroll'] : presetKind === 'comic' ? ['single', 'book', 'scroll', 'webtoon', 'manga'] : ['single', 'book', 'scroll'];
    if (allowed.includes(preset)) return preset;
  } catch { /* Fall through to the app-wide preference. */ }
  return isReflowableBookFormat(format) ? preferences.defaultTextMode : preferences.defaultPageMode;
}

export const preferenceDefaults: AppPreferences = {
  theme: 'vanilla', appearance: 'light', language: 'id', finish: 'oak', density: 2,
  widgets: { calendar: true, reflection: true, water: true, history: false, news: false, faith: true, prayer: true, weather: false },
  defaultTextMode: 'scroll', defaultPageMode: 'book',
};
const preferenceKey = 'sela:app:preferences';

export function readAppPreferences(): AppPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey) || 'null');
    if (!saved || typeof saved !== 'object') return preferenceDefaults;
    const themes: ThemeName[] = ['vanilla', 'olive', 'parchment', 'mist', 'stone', 'oat', 'cocoa', 'ivory'];
    const appearances: AppearanceName[] = ['light', 'dark', 'oled'];
    const finishes: ShelfFinish[] = ['oak', 'olive', 'ink'];
    return {
      ...preferenceDefaults,
      ...saved,
      theme: themes.includes(saved.theme) ? saved.theme : preferenceDefaults.theme,
      appearance: appearances.includes(saved.appearance) ? saved.appearance : saved.theme === 'oled' ? 'oled' : preferenceDefaults.appearance,
      language: saved.language === 'en' ? 'en' : 'id',
      finish: finishes.includes(saved.finish) ? saved.finish : 'oak',
      density: Math.max(1, Math.min(3, Number(saved.density) || 2)),
      widgets: {
        calendar: saved.widgets?.calendar !== false,
        reflection: saved.widgets?.reflection !== false,
        water: saved.widgets?.water !== false,
        history: saved.widgets?.history === true,
        news: saved.widgets?.news === true,
        faith: saved.widgets?.faith !== false,
        prayer: saved.widgets?.prayer !== false,
        weather: saved.widgets?.weather === true,
      },
      defaultTextMode: saved.defaultTextMode === 'single' ? 'single' : 'scroll',
      defaultPageMode: ['single', 'book', 'scroll', 'webtoon', 'manga'].includes(saved.defaultPageMode) ? saved.defaultPageMode : 'book',
    };
  } catch { return preferenceDefaults; }
}

export function saveAppPreferences(value: AppPreferences) {
  try { localStorage.setItem(preferenceKey, JSON.stringify(value)); } catch { /* private browsing */ }
}

export function useLibraryStore() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [nextBooks, nextCollections] = await Promise.all([listBooks(), listCollections()]);
      setBooks(nextBooks.sort((a, b) => b.opened - a.opened || b.saved - a.saved));
      setCollections(nextCollections);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Rak lokal belum bisa dibuka.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const chosen = Array.from(files);
    if (!chosen.length) return { added: 0, duplicates: 0, books: [] as LibraryBook[] };
    setLoading(true); setError('');
    let added = 0, duplicates = 0;
    const books: LibraryBook[] = [];
    try {
      for (const file of chosen) {
        const result = await importBook(file);
        books.push(result.book);
        if (result.duplicate) duplicates += 1; else added += 1;
      }
      await refresh();
      return { added, duplicates, books };
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Buku belum dapat ditambahkan.';
      setError(message);
      throw reason;
    } finally { setLoading(false); }
  }, [refresh]);

  const patchBook = useCallback(async (id: string, patch: Partial<LibraryBook>) => {
    await updateBook(id, patch);
    await refresh();
  }, [refresh]);

  const removeBook = useCallback(async (book: LibraryBook) => {
    await writeBook(book, undefined, true);
    await refresh();
  }, [refresh]);

  const createCollection = useCallback(async (name: string) => {
    await changeCollection({ action: 'create', name });
    await refresh();
  }, [refresh]);

  const assignCollection = useCallback(async (book: LibraryBook, name: string) => {
    await changeCollection({ action: 'add', name, ids: [book.id] });
    await refresh();
  }, [refresh]);

  return { books, collections, loading, error, refresh, addFiles, patchBook, removeBook, createCollection, assignCollection };
}

export function formatDuration(seconds: number, lang: LanguageName) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return lang === 'id' ? `${mins} mnt` : `${mins} min`;
  const hours = Math.floor(mins / 60), rest = mins % 60;
  return rest ? `${hours}j ${rest}m` : `${hours}j`;
}

export function readingStatus(book: LibraryBook, lang: LanguageName) {
  if (book.didNotFinish) return lang === 'id' ? 'Ditinggalkan' : 'Did not finish';
  if (book.completed) return lang === 'id' ? 'Selesai dibaca' : 'Finished';
  if (book.opened) return lang === 'id' ? 'Sedang dibaca' : 'Reading';
  return lang === 'id' ? 'Nanti dibaca' : 'Want to read';
}

export function initials(title: string) {
  return title.trim().split(/\s+/).slice(0, 2).map(word => word[0] || '').join('').toLocaleUpperCase();
}
