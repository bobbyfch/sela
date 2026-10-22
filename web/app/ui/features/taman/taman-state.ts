// Saved entries and the last entry read in each pack. They live in the personal store, so Sela backups carry them.
import { editPersonal, readPersonal } from '../../../../../app/library/personal-store.ts';

export const lastTamanArticle = (packId: string): string | undefined => readPersonal().tamanLast?.[packId];
export function rememberTamanArticle(packId: string, slug: string): void {
  try { editPersonal(data => { data.tamanLast = { ...data.tamanLast, [packId]: slug }; }); } catch { /* Reading still works without storage. */ }
}
export function forgetTamanPack(packId: string): void {
  try { editPersonal(data => { if (data.tamanLast) { const { [packId]: _, ...rest } = data.tamanLast; data.tamanLast = rest; } }); } catch { /* Nothing to clean up. */ }
}
export const savedTamanEntries = (): string[] => readPersonal().tamanSaved ?? [];
export const isTamanSaved = (packId: string, itemId: string): boolean => savedTamanEntries().includes(`${packId}/${itemId}`);
export function toggleTamanSaved(packId: string, itemId: string): boolean {
  const key = `${packId}/${itemId}`;
  let saved = false;
  try { editPersonal(data => { const current = data.tamanSaved ?? []; saved = !current.includes(key); data.tamanSaved = saved ? [...current, key] : current.filter(item => item !== key); }); } catch { /* Storage is unavailable; nothing changed. */ }
  return saved;
}
