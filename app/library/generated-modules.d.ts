// Runtime bundles are deliberately loaded as separate browser assets. Keep
// their public surface typed here without pulling bundle implementations into
// the React application graph.
declare module '*sela.profiles.js' {
  export function readProfiles(prefix?: string): unknown[];
  export function validateProfiles(value: unknown): unknown[];
  export function mergeProfiles(current: unknown[], incoming: unknown[]): unknown[];
  export function writeProfiles(records: unknown[], prefix?: string): void;
}

declare module '*sela.metadata.js' {
  export interface BookMetadata {
    title?: string;
    author?: string;
    publisher?: string;
    publicationDate?: string;
    year?: string;
    language?: string;
    identifier?: string;
    isbn?: string;
    description?: string;
    subjects?: string;
    rights?: string;
    series?: string;
    edition?: string;
    pageCount?: number;
    creationDate?: string;
  }
  export function cleanMetadata(value: unknown): BookMetadata;
}

declare module '*sela.archive.js' {
  export function createBackupArchive(entries: Record<string, Uint8Array<ArrayBufferLike>>): Uint8Array<ArrayBufferLike>;
  export function readBackupArchive(bytes: Uint8Array<ArrayBufferLike>): Record<string, Uint8Array<ArrayBufferLike>>;
  export function extractArchiveAsync(bytes: Uint8Array<ArrayBufferLike>, signal?: AbortSignal, backup?: boolean): Promise<Record<string, Uint8Array<ArrayBufferLike>>>;
  export function validateEpub(files: Record<string, Uint8Array<ArrayBufferLike>>): unknown;
}
