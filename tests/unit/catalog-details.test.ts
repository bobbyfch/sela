import test from 'node:test';
import assert from 'node:assert/strict';
import { matchOpenLibraryWork, normalizeCatalogText, openLibraryWorkKey, parseCatalogEditions } from '../../app/library/catalog-details.ts';

test('catalog detail lookup only accepts HTTPS Open Library work identifiers', () => {
  assert.equal(openLibraryWorkKey('https://openlibrary.org/works/OL123W/a-title'), 'OL123W');
  assert.equal(openLibraryWorkKey('http://openlibrary.org/works/OL123W'), undefined);
  assert.equal(openLibraryWorkKey('https://example.com/works/OL123W'), undefined);
  assert.equal(openLibraryWorkKey('https://openlibrary.org/books/OL123M'), undefined);
});

test('Open Library work matching requires an exact normalized title and compatible author', () => {
  const rows = [
    { key: '/works/OL1W', title: 'A Day with the Little Prince', author_name: ['Antoine de Saint-Exupéry'] },
    { key: '/works/OL2W', title: 'Le Petit Prince', author_name: ['Antoine de Saint-Exupéry'] },
    { key: '/works/OL3W', title: 'The Little Prince', author_name: ['Richard Bach'] },
    { key: '/works/OL4W', title: 'The Little Prince', author_name: ['Antoine de Saint-Exupéry'] },
  ];
  assert.equal(matchOpenLibraryWork(rows, { title: 'The Little Prince', author: 'Antoine de Saint-Exupéry' }), 'OL4W');
  assert.equal(matchOpenLibraryWork(rows, { title: 'Le Petit Prince', author: 'Unknown' }), undefined);
  assert.equal(normalizeCatalogText('  Café—Stories!  '), 'cafe stories');
});

test('edition parsing returns bounded ISBN and publisher metadata without duplicates', () => {
  const editions = parseCatalogEditions({ entries: [
    { key: '/books/OL1M', title: 'First edition', publishers: ['North Press'], publish_date: '2020', isbn_13: ['978-1-23456-789-0'], isbn_10: ['1-23456-789-X'], number_of_pages: 220 },
    { key: '/books/OL2M', title: 'Duplicate identifier', isbn_13: ['9781234567890'] },
    { key: '/books/OL3M', title: 'Another edition', isbn_10: ['0-12345-678-9'] },
    null,
  ] });
  assert.equal(editions.length, 2);
  assert.equal(editions[0].isbn13, '9781234567890');
  assert.equal(editions[0].isbn10, '123456789X');
  assert.equal(editions[0].publisher, 'North Press');
  assert.equal(editions[0].pages, 220);
});
