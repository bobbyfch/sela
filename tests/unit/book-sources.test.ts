import test from 'node:test';
import assert from 'node:assert/strict';
import { acquireBook } from '../../app/library/book-sources.ts';

test('Project Gutenberg text is fetched only when a book is explicitly acquired', async () => {
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async input => {
    const url = String(input);
    requests.push(url);
    if (url === 'https://gutendex.com/books/999999') {
      return new Response(JSON.stringify({ formats: { 'application/epub+zip': 'https://www.gutenberg.org/cache/epub/999999/pg999999.epub.noimages' } }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (url === 'https://www.gutenberg.org/cache/epub/999999/pg999999.epub.noimages') {
      return new Response('EPUB fixture bytes', { status: 200, headers: { 'content-type': 'application/epub+zip' } });
    }
    return new Response('Unexpected request', { status: 404 });
  };

  try {
    const book = { id: '999999', title: 'A Test Edition', source: 'Project Gutenberg', external: 'https://www.gutenberg.org/ebooks/999999' };
    assert.equal(requests.length, 0);
    const file = await acquireBook(book);
    assert.deepEqual(requests, ['https://gutendex.com/books/999999', 'https://www.gutenberg.org/cache/epub/999999/pg999999.epub.noimages']);
    assert.equal(file.name, 'A Test Edition.epub');
    assert.equal(file.type, 'application/epub+zip');
    assert.equal(await file.text(), 'EPUB fixture bytes');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
