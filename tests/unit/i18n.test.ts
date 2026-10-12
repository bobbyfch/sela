import test from 'node:test';
import assert from 'node:assert/strict';
import {APP_LANGUAGES,holidayCountry,localeBase,localeForCountry,normalizeLocale,translate} from '../../src/i18n.ts';

test('language preferences normalize legacy values and preserve supported regions',()=>{
  assert.equal(normalizeLocale('id'),'id-ID');
  assert.equal(normalizeLocale('ja-JP'),'ja-JP');
  assert.equal(normalizeLocale('es-MX'),'es-ES');
  assert.equal(normalizeLocale('unknown'),'en-US');
  assert.equal(localeBase('ko-KR'),'ko');
  assert.equal(holidayCountry('ja-JP'),'JP');
  assert.equal(holidayCountry('id-ID'),'ID');
  assert.equal(APP_LANGUAGES.length,10);
});

test('IP country detection selects a supported locale and safely defaults unknown countries to English',()=>{
  assert.equal(localeForCountry('ID'),'id-ID');
  assert.equal(localeForCountry('jp'),'ja-JP');
  assert.equal(localeForCountry('MX'),'es-ES');
  assert.equal(localeForCountry('SN'),'fr-FR');
  assert.equal(localeForCountry('TW'),'zh-CN');
  assert.equal(localeForCountry('GB'),'en-GB');
  assert.equal(localeForCountry('AQ'),'en-US');
  assert.equal(localeForCountry('invalid'),'en-US');
});

test('common app labels are localized while English remains the fallback',()=>{
  assert.equal(translate('Reading calendar','Kalender membaca','ja-JP'),'読書カレンダー');
  assert.equal(translate('Weather','Cuaca','fr-FR'),'Météo');
  assert.equal(translate('Search this book','Cari buku ini','es-ES'),'Search this book');
  assert.equal(translate('Reading calendar','Kalender membaca','id-ID'),'Kalender membaca');
});
