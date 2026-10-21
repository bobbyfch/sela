import { createContext, useContext } from 'react';
import type { AppPreferences, LanguageName } from './state.ts';
import type { useLibraryStore } from './state.ts';
import type { LibraryBook } from '../../../app/library/models.ts';

export type LibraryStore = ReturnType<typeof useLibraryStore>;
export type WorkspaceValue = {
  store: LibraryStore;
  preferences: AppPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<AppPreferences>>;
  lang: LanguageName;
  globalSearch: string;
  setGlobalSearch: React.Dispatch<React.SetStateAction<string>>;
  importing: boolean;
  importBooks: (files: FileList | File[]) => Promise<{ added: number; duplicates: number; books: LibraryBook[] } | null>;
  announce: (message: string) => void;
};

const WorkspaceContext = createContext<WorkspaceValue | null>(null);
export const WorkspaceProvider = WorkspaceContext.Provider;
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('Sela workspace is not available.');
  return value;
}

export function copy(lang: LanguageName, english: string, indonesian: string) {
  return lang === 'id' ? indonesian : english;
}
