// Last-read entry per installed pack. Kept in localStorage; it is a convenience, not part of Sela backups.
const KEY = 'sela:taman:last-read';

function read(): Record<string, string> {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
export const lastTamanArticle = (packId: string): string | undefined => {
  const slug = read()[packId];
  return typeof slug === 'string' ? slug : undefined;
};
export function rememberTamanArticle(packId: string, slug: string): void {
  try { localStorage.setItem(KEY, JSON.stringify({ ...read(), [packId]: slug })); } catch { /* Reading still works without storage. */ }
}
export function forgetTamanPack(packId: string): void {
  try { const rows = read(); delete rows[packId]; localStorage.setItem(KEY, JSON.stringify(rows)); } catch { /* Nothing to clean up. */ }
}
