import { editPersonal, readPersonal } from '../../../../../app/library/personal-store.ts';

export const lastReadingEntry = (packId: string): string | undefined => readPersonal().readingsLast?.[packId];
export function rememberReadingEntry(packId: string, slug: string): void {
  try { editPersonal(data => { data.readingsLast = { ...data.readingsLast, [packId]: slug }; }); } catch { }
}
export function forgetReadingPack(packId: string): void {
  try { editPersonal(data => { if (data.readingsLast) { const { [packId]: _, ...rest } = data.readingsLast; data.readingsLast = rest; } }); } catch { }
}
export const savedReadingEntries = (): string[] => readPersonal().readingsSaved ?? [];
export const isSavedReadings = (packId: string, itemId: string): boolean => savedReadingEntries().includes(`${packId}/${itemId}`);
export function toggleSavedReadings(packId: string, itemId: string): boolean {
  const key = `${packId}/${itemId}`;
  let saved = false;
  try { editPersonal(data => { const current = data.readingsSaved ?? []; saved = !current.includes(key); data.readingsSaved = saved ? [...current, key] : current.filter(item => item !== key); }); } catch { }
  return saved;
}
