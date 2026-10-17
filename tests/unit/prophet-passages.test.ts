import test from 'node:test';
import assert from 'node:assert/strict';
import {PROPHET_PASSAGES} from '../../app/library/prophet-passages.ts';

test('Islamic reading rail contains 25 distinct, referenced Quran passage starters',()=>{
  assert.equal(PROPHET_PASSAGES.length,25);
  assert.equal(new Set(PROPHET_PASSAGES.map(item=>item.english)).size,25);
  for(const passage of PROPHET_PASSAGES){
    assert.ok(passage.english.trim());
    assert.ok(passage.indonesian.startsWith('Nabi '));
    assert.ok(passage.arabic.trim());
    assert.ok(Number.isInteger(passage.surah)&&passage.surah>=1&&passage.surah<=114);
    assert.ok(Number.isInteger(passage.verse)&&passage.verse>=1&&passage.verse<=286);
    assert.ok(passage.reference.includes(String(passage.surah)));
  }
  assert.match(PROPHET_PASSAGES.find(item=>item.english==='Al-Yasa')?.reference||'',/brief mention/);
});
