import test from 'node:test';
import assert from 'node:assert/strict';
import books from '../../library/public-books.json' with { type: 'json' };

const curated = books as { id: string; title: string; author?: string; source: string; external: string; rights?: string; url?: string; topics?: string[] }[];
const topicKeys = ['uncanny', 'memory-home', 'longing', 'poetry-sound', 'myth-folklore', 'speculative', 'reflection', 'life-writing', 'storycraft', 'nature-journey'];

test('Sela picks contain more than 200 unique book records with local rights notes', () => {
  assert.ok(curated.length >= 220);
  assert.equal(new Set(curated.map(book => book.id)).size, curated.length);
  for (const book of curated) {
    assert.ok(book.title.trim(), `book ${book.id} needs a title`);
    assert.ok(book.author?.trim(), `${book.title} needs an author`);
    assert.match(book.external, /^https:\/\/www\.gutenberg\.org\/ebooks\/\d+$/);
    assert.match(book.rights || '', /check local copyright/i);
  }
});

test('curated categories show counts from actual matching records', () => {
  for (const topic of topicKeys) assert.ok(curated.filter(book => book.topics?.includes(topic)).length > 0, `${topic} needs at least one book`);
});

test('new Sela picks store metadata only until the reader chooses a download', () => {
  const newlyCurated = curated.filter(book => book.source === 'Project Gutenberg');
  assert.ok(newlyCurated.length >= 180);
  assert.ok(newlyCurated.every(book => !book.url));
  assert.ok(newlyCurated.every(book => /^https:\/\/www\.gutenberg\.org\/ebooks\/\d+$/.test(book.external)));
});
