type SearchRequest = { requestId: number; bookId: string; pages: string[]; query: string };
type SearchResponse = { requestId: number; bookId: string; page: number; snippet: string };

self.onmessage = (event: MessageEvent<SearchRequest>) => {
  const { requestId, bookId, pages, query } = event.data;
  if (!Number.isSafeInteger(requestId) || typeof bookId !== 'string' || !Array.isArray(pages) || typeof query !== 'string') return;
  const needle = query.trim().slice(0, 200).toLocaleLowerCase();
  let result: SearchResponse = { requestId, bookId, page: 0, snippet: '' };
  if (needle) {
    for (const [index, raw] of pages.slice(0, 500).entries()) {
      if (typeof raw !== 'string') continue;
      const text = raw.slice(0, 1_000_000).replace(/\s+/g, ' ').trim();
      const offset = text.toLocaleLowerCase().indexOf(needle);
      if (offset >= 0) {
        result = { requestId, bookId, page: index + 1, snippet: text.slice(Math.max(0, offset - 100), Math.min(text.length, offset + needle.length + 180)) };
        break;
      }
    }
  }
  self.postMessage(result);
};

export {};
