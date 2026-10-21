// Generated from src/archive-codec.ts by npm run build. Do not edit.
import { unzipSync, zipSync } from "fflate";
export function createBackupArchive(entries) {
  return zipSync(entries, { level: 0 });
}
export function decodeArchive(bytes, backup = false) {
  let total = 0, count = 0;
  const maxEntries = backup ? 500 : 2e3;
  const maxEntry = (backup ? 64 : 32) * 1048576;
  return unzipSync(bytes, { filter: (file) => {
    if (++count > maxEntries || file.originalSize > maxEntry || (total += file.originalSize) > 128 * 1048576) {
      throw Error(backup ? "Backup exceeds safety limits" : "Archive expansion exceeds safety limits");
    }
    if (/^(?:[\\/]|[a-z]:)/i.test(file.name) || file.name.replaceAll("\\", "/").split("/").includes("..")) {
      throw Error(backup ? "Backup exceeds safety limits: unsafe archive path" : "Unsafe archive path");
    }
    return true;
  } });
}
export const extractArchive = (bytes) => decodeArchive(bytes);
export const readBackupArchive = (bytes) => decodeArchive(bytes, true);
