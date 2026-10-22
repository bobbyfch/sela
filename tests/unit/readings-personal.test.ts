import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyPersonal, validatePersonal } from '../../app/library/personal-store.ts';

test('saved faith reading entries and last-read positions survive validation, which is what backups use', () => {
  const valid = validatePersonal({ ...emptyPersonal(), readingsSaved: ['sela-prophets-id-v1/yusuf', 'hadeethenc-id-3/2962', 'sela-prophets-id-v1/yusuf'], readingsLast: { 'sela-prophets-id-v1': 'musa' } });
  assert.deepEqual(valid.readingsSaved, ['sela-prophets-id-v1/yusuf', 'hadeethenc-id-3/2962']);
  assert.deepEqual(valid.readingsLast, { 'sela-prophets-id-v1': 'musa' });
});

test('malformed saved entries are dropped instead of stored', () => {
  const valid = validatePersonal({ ...emptyPersonal(), readingsSaved: ['../x', 'a/b/c', 42, '<script>/1', 'ok-pack/item-1'], readingsLast: { 'BAD KEY': 'x', 'ok-pack': '<img onerror=1>', 'good-pack': 'item-2' } });
  assert.deepEqual(valid.readingsSaved, ['ok-pack/item-1']);
  assert.deepEqual(valid.readingsLast, { 'good-pack': 'item-2' });
});

test('personal data without faith reading fields is unchanged', () => {
  const valid = validatePersonal(emptyPersonal());
  assert.equal(valid.readingsSaved, undefined);
  assert.equal(valid.readingsLast, undefined);
});
