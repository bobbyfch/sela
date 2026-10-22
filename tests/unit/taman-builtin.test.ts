import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BUILTIN_EDITIONS } from '../../web/app/ui/features/taman/builtin-editions.ts';

const files: Record<string, string> = { protestantism: 'faith-bible-web', catholicism: 'faith-bible-dra', buddhism: 'faith-dhammapada', hinduism: 'faith-bhagavad-gita', confucianism: 'faith-analects' };

test('built-in edition cards state exactly what the shipped JSON files say', async () => {
  assert.equal(BUILTIN_EDITIONS.length, 5);
  for (const row of BUILTIN_EDITIONS) {
    const data = JSON.parse(await readFile(`library/assets/${files[row.faith]}.json`, 'utf8'));
    assert.equal(row.license, data.license, row.title);
    assert.equal(row.source, data.source, row.title);
    const shown = data.edition || data.translator;
    assert.ok(row.edition.includes(shown), `${row.title}: card edition "${row.edition}" must mention "${shown}"`);
    const total = (data.books ?? data.chapters).length;
    assert.ok(row.count.en.startsWith(String(total)), `${row.title}: card says "${row.count.en}" but the file has ${total}`);
  }
});
