import { responseText } from '../../../../../app/library/network.ts';

export type SourcedQuote = { content: string; author: string; language: string; source: 'Wikiquote'; sourceUrl: string; portrait?: string };
type QuoteTopic = 'reading' | 'calm' | 'courage' | 'life' | 'friendship' | 'creativity' | 'spiritual';
const cacheKey = 'sela-library:quote-cache';
const terms: Record<QuoteTopic, Record<string, string>> = {
  reading: { en: 'Reading', id: 'Membaca', ja: '読書' }, calm: { en: 'Peace', id: 'Ketenangan', ja: '平和' },
  courage: { en: 'Courage', id: 'Keberanian', ja: '勇気' }, life: { en: 'Life', id: 'Kehidupan', ja: '人生' },
  friendship: { en: 'Friendship', id: 'Persahabatan', ja: '友情' }, creativity: { en: 'Creativity', id: 'Kreativitas', ja: '創造性' },
  spiritual: { en: 'Wisdom', id: 'Kebijaksanaan', ja: '知恵' },
};

export function readQuoteCache(topic: string, language: string): SourcedQuote[] {
  try {
    const value = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (value?.topic !== topic || value?.language !== language || !Array.isArray(value.rows)) return [];
    return value.rows.filter((row: unknown): row is SourcedQuote => !!row && typeof row === 'object' && typeof (row as SourcedQuote).content === 'string' && typeof (row as SourcedQuote).author === 'string' && typeof (row as SourcedQuote).sourceUrl === 'string').slice(0, 20);
  } catch { return []; }
}

function apiUrl(language: string, params: Record<string, string>) {
  const host = language === 'zh' ? 'zh' : language;
  const url = new URL(`https://${host}.wikiquote.org/w/api.php`);
  url.search = new URLSearchParams({ ...params, format: 'json', origin: '*' }).toString();
  return url;
}

export async function fetchSourcedQuotes(topic: QuoteTopic, language: string, signal?: AbortSignal): Promise<SourcedQuote[]> {
  const category = terms[topic][language] || terms[topic].en;
  const searchResponse = await fetch(apiUrl(language, { action: 'query', list: 'search', srsearch: category, srlimit: '5' }), { signal: signal || AbortSignal.timeout(10000), credentials: 'omit', referrerPolicy: 'no-referrer' });
  const search = JSON.parse(await responseText(searchResponse, 512 * 1024));
  const matches = Array.isArray(search?.query?.search) ? search.query.search.slice(0, 5) : [];
  const found: SourcedQuote[] = [];
  for (const match of matches) {
    if (signal?.aborted) throw new DOMException('The quote search was cancelled.', 'AbortError');
    if (!Number.isInteger(match?.pageid) || typeof match?.title !== 'string') continue;
    const parseResponse = await fetch(apiUrl(language, { action: 'parse', pageid: String(match.pageid), prop: 'text' }), { signal: signal || AbortSignal.timeout(10000), credentials: 'omit', referrerPolicy: 'no-referrer' });
    let html = '';
    try { const parsed = JSON.parse(await responseText(parseResponse, 1024 * 1024)); html = parsed?.parse?.text?.['*'] || ''; } catch { continue; }
    if (typeof html !== 'string' || html.length > 1024 * 1024) continue;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script,style,.navbox,.toc,.mw-editsection').forEach(node => node.remove());
    let author = match.title.slice(0, 100);
    let authorUrl = `https://${language}.wikiquote.org/wiki/${encodeURIComponent(match.title.replaceAll(' ', '_'))}`;
    for (const element of Array.from(doc.querySelectorAll('h2,h3,h4,li'))) {
      if (/^H[234]$/.test(element.tagName)) {
        const heading = element.querySelector('.mw-headline')?.textContent || element.textContent || '';
        author = heading.replace(/\[edit\]/gi, '').trim().slice(0, 100) || author;
        authorUrl = `https://${language}.wikiquote.org/wiki/${encodeURIComponent(author.replaceAll(' ', '_'))}`;
        continue;
      }
      if (element.parentElement?.closest('li')) continue;
      const content = (element.textContent || '').replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
      if (content.length < 30 || content.length > 800) continue;
      const cite = element.querySelector('cite');
      const authorLink = cite?.querySelector('a[href^="/wiki/"]') || element.querySelector('a[href^="/wiki/"]');
      const quotedBy = (cite?.textContent || authorLink?.textContent || author).replace(/^\s*[—–-]\s*/, '').trim().slice(0, 100);
      const href = authorLink?.getAttribute('href');
      const sourceUrl = href && /^\/wiki\/[^#?]+$/.test(href) ? `https://${language}.wikiquote.org${href}` : authorUrl;
      found.push({ content, author: quotedBy || author, language, source: 'Wikiquote', sourceUrl });
      if (found.length >= 12) break;
    }
    if (found.length >= 12) break;
  }
  if (!found.length) throw new Error('No quote was found for this topic.');
  try { localStorage.setItem(cacheKey, JSON.stringify({ topic, language, savedAt: Date.now(), rows: found })); } catch { /* Keep the result usable even when browser storage is full. */ }
  return found;
}

export async function fetchAuthorPortrait(quote: SourcedQuote, signal?: AbortSignal): Promise<string | undefined> {
  if (quote.portrait || !quote.author) return quote.portrait;
  const url = new URL(`https://${quote.language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(quote.author.replaceAll(' ', '_'))}`);
  try {
    const response = await fetch(url, { signal: signal || AbortSignal.timeout(7000), credentials: 'omit', referrerPolicy: 'no-referrer', headers: { Accept: 'application/json' } });
    const summary = JSON.parse(await responseText(response, 256 * 1024));
    const portrait = summary?.thumbnail?.source;
    if (typeof portrait !== 'string' || !portrait.startsWith('https://') || new URL(portrait).hostname !== 'upload.wikimedia.org') return undefined;
    quote.portrait = portrait;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    const saved = cached?.rows?.find((row: SourcedQuote) => row.content === quote.content && row.author === quote.author);
    if (saved) { saved.portrait = portrait; localStorage.setItem(cacheKey, JSON.stringify(cached)); }
    return portrait;
  } catch { return undefined; }
}
