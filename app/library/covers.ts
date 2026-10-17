const OPEN_LIBRARY_COVERS = 'covers.openlibrary.org';

/** Permit remote catalog artwork only from known public book-cover providers. */
export function catalogCoverUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 2048) return;
  try {
    const url = new URL(value);
    if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'books.google.com')) || url.username || url.password) return;
    if (url.hostname === OPEN_LIBRARY_COVERS && /^\/b\/(?:id|isbn)\/[\w-]+-(?:S|M|L)\.jpg$/i.test(url.pathname)) return url.href;
    if (url.hostname === 'www.gutenberg.org' && /^\/cache\/epub\/\d+\/.+\.(?:jpe?g|png|webp)$/i.test(url.pathname)) return url.href;
    if (url.hostname === 'books.google.com' && url.pathname === '/books/content') {
      const id=url.searchParams.get('id');if(!id||! /^[\w-]{1,128}$/.test(id)||url.searchParams.get('img')!=='1')return;
      const cover=new URL('https://books.google.com/books/content');cover.searchParams.set('id',id);cover.searchParams.set('printsec','frontcover');cover.searchParams.set('img','1');cover.searchParams.set('zoom',url.searchParams.get('zoom')==='2'?'2':'1');cover.searchParams.set('source','gbs_api');return cover.href;
    }
  } catch {
    return;
  }
}
