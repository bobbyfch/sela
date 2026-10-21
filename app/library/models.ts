import type { BookMetadata, SelaOptions } from '../../src/public-api.ts';
export interface LibraryBook {
 id: string; name: string; filename: string; format: SelaOptions['format']; size: number;
 saved: number; opened: number; favorite?: boolean; completed?: boolean; didNotFinish?: boolean; pinned?: boolean;
 progress?: number; total?: number; tags?: string[]; metadata?: BookMetadata;
 cover?: Blob; coverBytes?: ArrayBuffer; coverType?: string;
}
export interface StoredFile { id: string; bytes?: ArrayBuffer; type?: string; blob?: Blob; }
export interface RestoredBook { book: LibraryBook; bytes: ArrayBuffer; type: string; }
export type Translate = (english: string, indonesian: string) => string;
