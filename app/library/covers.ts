const OPEN_LIBRARY_COVERS = 'covers.openlibrary.org';

/** Permit remote catalog artwork only from known public book-cover providers. */
export function catalogCoverUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 2048) return;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return;
    if (url.hostname === OPEN_LIBRARY_COVERS && /^\/b\/(?:id|isbn)\/[\w-]+-M\.jpg$/i.test(url.pathname)) return url.href;
    if (url.hostname === 'www.gutenberg.org' && /^\/cache\/epub\/\d+\/.+\.(?:jpe?g|png|webp)$/i.test(url.pathname)) return url.href;
  } catch {
    return;
  }
}
