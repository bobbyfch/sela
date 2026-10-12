import { unzipSync, zipSync, type Zippable } from 'fflate';

export type ArchiveFiles = Record<string, Uint8Array<ArrayBuffer>>;
export function createBackupArchive(entries: Zippable): Uint8Array {
  return zipSync(entries, { level: 0 });
}
export function decodeArchive(bytes: Uint8Array, backup = false): ArchiveFiles {
  let total = 0, count = 0;
  const maxEntries = backup ? 500 : 2000;
  const maxEntry = (backup ? 64 : 32) * 1048576;
  return unzipSync(bytes, { filter: file => {
    if (++count > maxEntries || file.originalSize > maxEntry ||
        (total += file.originalSize) > 128 * 1048576) {
      throw Error(backup ? 'Backup exceeds safety limits' : 'Archive expansion exceeds safety limits');
    }
    // ZIP paths are untrusted even though entries are never written to disk.
    if (/^(?:[\\/]|[a-z]:)/i.test(file.name) || file.name.replaceAll('\\', '/').split('/').includes('..')) {
      throw Error(backup ? 'Backup exceeds safety limits: unsafe archive path' : 'Unsafe archive path');
    }
    return true;
  } }) as ArchiveFiles;
}
export const extractArchive = (bytes: Uint8Array) => decodeArchive(bytes);
export const readBackupArchive = (bytes: Uint8Array) => decodeArchive(bytes, true);
