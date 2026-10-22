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

const entryKey = (packId: string, itemId: string) => `${packId}/${itemId}`;

export const readingNote = (packId: string, itemId: string): string => readPersonal().readingsNotes?.[entryKey(packId, itemId)] ?? '';
export function setReadingNote(packId: string, itemId: string, note: string): void {
  const key = entryKey(packId, itemId);
  try {
    editPersonal(data => {
      const { [key]: _, ...rest } = data.readingsNotes ?? {};
      data.readingsNotes = note.trim() ? { ...rest, [key]: note } : rest;
    });
  } catch { }
}

export type ReadingQuote = { key: string; text: string; at: number };
export const readingQuotes = (packId: string, itemId: string): ReadingQuote[] => (readPersonal().readingsQuotes ?? []).filter(quote => quote.key === entryKey(packId, itemId));
export const allReadingQuotes = (): ReadingQuote[] => readPersonal().readingsQuotes ?? [];
export const allReadingNotes = (): Record<string, string> => readPersonal().readingsNotes ?? {};
export function addReadingQuote(packId: string, itemId: string, text: string): void {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 800);
  if (!clean) return;
  try {
    editPersonal(data => {
      const current = data.readingsQuotes ?? [];
      if (current.some(quote => quote.key === entryKey(packId, itemId) && quote.text === clean)) return;
      data.readingsQuotes = [...current, { key: entryKey(packId, itemId), text: clean, at: Date.now() }];
    });
  } catch { }
}
export function removeReadingQuote(quote: ReadingQuote): void {
  try { editPersonal(data => { data.readingsQuotes = (data.readingsQuotes ?? []).filter(item => !(item.key === quote.key && item.at === quote.at)); }); } catch { }
}
