import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyPersonal, validatePersonal } from '../../app/library/personal-store.ts';

test('saved Taman Bacaan entries and last-read positions survive validation, which is what backups use', () => {
  const valid = validatePersonal({ ...emptyPersonal(), tamanSaved: ['sela-prophets-id-v1/yusuf', 'hadeethenc-id-3/2962', 'sela-prophets-id-v1/yusuf'], tamanLast: { 'sela-prophets-id-v1': 'musa' } });
  assert.deepEqual(valid.tamanSaved, ['sela-prophets-id-v1/yusuf', 'hadeethenc-id-3/2962']);
  assert.deepEqual(valid.tamanLast, { 'sela-prophets-id-v1': 'musa' });
});

test('malformed saved entries are dropped instead of stored', () => {
  const valid = validatePersonal({ ...emptyPersonal(), tamanSaved: ['../x', 'a/b/c', 42, '<script>/1', 'ok-pack/item-1'], tamanLast: { 'BAD KEY': 'x', 'ok-pack': '<img onerror=1>', 'good-pack': 'item-2' } });
  assert.deepEqual(valid.tamanSaved, ['ok-pack/item-1']);
  assert.deepEqual(valid.tamanLast, { 'good-pack': 'item-2' });
});

test('personal data without Taman Bacaan fields is unchanged', () => {
  const valid = validatePersonal(emptyPersonal());
  assert.equal(valid.tamanSaved, undefined);
  assert.equal(valid.tamanLast, undefined);
});
