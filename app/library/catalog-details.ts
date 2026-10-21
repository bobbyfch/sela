export type CatalogDetailInput = { title: string; author?: string; external?: string; description?: string };
export type CatalogEdition = {
  key: string;
  title: string;
  publisher?: string;
  published?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number;
};
export type CatalogBookDetails = {
  found: boolean;
  description?: string;
  sourceUrl?: string;
  editions: CatalogEdition[];
};

type JsonRecord = Record<string, unknown>;
const detailCache = new Map<string, { at: number; value: CatalogBookDetails }>();
const cacheLifetime = 10 * 60_000;
const maxResponseBytes = 512 * 1024;

function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown, limit = 300): string | undefined {
  if (typeof value !== 'string') return undefined;
  const valueText = value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim();
  return valueText ? valueText.slice(0, limit) : undefined;
}

function textList(value: unknown, limit = 3): string[] {
  return Array.isArray(value) ? value.map(item => text(item, 180)).filter((item): item is string => !!item).slice(0, limit) : [];
}

export function normalizeCatalogText(value: string): string {
  return value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

export function openLibraryWorkKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'openlibrary.org' || url.username || url.password) return undefined;
    const match = url.pathname.match(/^\/works\/(OL\d+W)(?:\/|$)/i);
    return match?.[1].toUpperCase();
  } catch {
    return undefined;
  }
}

export function matchOpenLibraryWork(rows: unknown, book: Pick<CatalogDetailInput, 'title' | 'author'>): string | undefined {
  if (!Array.isArray(rows)) return undefined;
  const expectedTitle = normalizeCatalogText(book.title);
  const expectedAuthor = normalizeCatalogText(book.author || '');
  for (const row of rows) {
    if (!isRecord(row) || normalizeCatalogText(text(row.title, 300) || '') !== expectedTitle) continue;
    const authors = Array.isArray(row.author_name) ? row.author_name.filter((item): item is string => typeof item === 'string') : [];
    if (expectedAuthor && authors.length) {
      const expectedTokens = expectedAuthor.split(' ').filter(token => token.length > 2);
      const authorMatch = authors.some(author => {
        const actual = normalizeCatalogText(author);
        return actual === expectedAuthor || actual.includes(expectedAuthor) || expectedAuthor.includes(actual) || expectedTokens.some(token => token.length > 3 && actual.split(' ').includes(token));
      });
      if (!authorMatch) continue;
    }
    const key = text(row.key, 80)?.match(/^\/?works\/(OL\d+W)$/i)?.[1];
    if (key) return key.toUpperCase();
  }
  return undefined;
}

function descriptionText(value: unknown): string | undefined {
  if (typeof value === 'string') return text(value, 6000);
  if (isRecord(value)) return text(value.value, 6000);
  return undefined;
}

export function parseCatalogEditions(value: unknown): CatalogEdition[] {
  if (!isRecord(value) || !Array.isArray(value.entries)) return [];
  const unique = new Set<string>();
  const editions: CatalogEdition[] = [];
  for (const row of value.entries) {
    if (!isRecord(row)) continue;
    const key = text(row.key, 100);
    if (!key) continue;
    const isbn10 = textList(row.isbn_10, 1)[0]?.replace(/[^\dX]/gi, '').toUpperCase();
    const isbn13 = textList(row.isbn_13, 1)[0]?.replace(/\D/g, '');
    const identity = isbn13 || isbn10 || key;
    if (unique.has(identity)) continue;
    unique.add(identity);
    const pages = Number.isSafeInteger(row.number_of_pages) && Number(row.number_of_pages) > 0 ? Number(row.number_of_pages) : undefined;
    editions.push({
      key,
      title: text(row.title, 240) || 'Edition',
      publisher: textList(row.publishers, 2).join(', ') || undefined,
      published: text(row.publish_date, 80),
      isbn10,
      isbn13,
      pages,
    });
    if (editions.length >= 6) break;
  }
  return editions;
}

async function fetchOpenLibraryJson(url: string, signal: AbortSignal): Promise<JsonRecord> {
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(9000)]),
    headers: { Accept: 'application/json' },
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  });
  if (!response.ok) throw new Error(`Open Library unavailable (${response.status}).`);
  const raw = await response.text();
  if (raw.length > maxResponseBytes) throw new Error('Open Library returned too much edition data.');
  const data: unknown = JSON.parse(raw);
  if (!isRecord(data)) throw new Error('Open Library returned invalid edition data.');
  return data;
}

function cached(key: string): CatalogBookDetails | undefined {
  const row = detailCache.get(key);
  if (!row || Date.now() - row.at >= cacheLifetime) return undefined;
  return { ...row.value, editions: [...row.value.editions] };
}

function saveCache(key: string, value: CatalogBookDetails): CatalogBookDetails {
  if (detailCache.size > 100) detailCache.delete(detailCache.keys().next().value!);
  detailCache.set(key, { at: Date.now(), value });
  return { ...value, editions: [...value.editions] };
}

export async function lookupCatalogBookDetails(book: CatalogDetailInput, signal = new AbortController().signal): Promise<CatalogBookDetails> {
  const cacheKey = openLibraryWorkKey(book.external) || `${normalizeCatalogText(book.title)}|${normalizeCatalogText(book.author || '')}`;
  const saved = cached(cacheKey);
  if (saved) return saved;
  if (signal.aborted) throw signal.reason || new DOMException('Aborted', 'AbortError');

  let workId = openLibraryWorkKey(book.external);
  if (!workId) {
    const params = new URLSearchParams({ title: book.title.slice(0, 160), limit: '12', fields: 'key,title,author_name' });
    if (book.author) params.set('author', book.author.slice(0, 120));
    const search = await fetchOpenLibraryJson(`https://openlibrary.org/search.json?${params}`, signal);
    workId = matchOpenLibraryWork(search.docs, book);
  }
  if (!workId) return saveCache(cacheKey, { found: false, description: text(book.description, 6000), sourceUrl: book.external, editions: [] });

  const root = `https://openlibrary.org/works/${workId}`;
  const work = await fetchOpenLibraryJson(`${root}.json`, signal);
  let editionData: JsonRecord | undefined;
  try { editionData = await fetchOpenLibraryJson(`${root}/editions.json?limit=8`, signal); }
  catch (error) { if (signal.aborted) throw signal.reason || error; }
  return saveCache(cacheKey, {
    found: true,
    description: descriptionText(work.description) || text(book.description, 6000),
    sourceUrl: root,
    editions: parseCatalogEditions(editionData),
  });
}
