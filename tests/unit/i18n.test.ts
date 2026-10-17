import test from 'node:test';
import assert from 'node:assert/strict';
import {APP_LANGUAGES,holidayCountry,localeBase,localeForCountry,normalizeLocale,translate} from '../../src/i18n.ts';

test('language preferences expose only English, Indonesian and Japanese and normalize older locales safely',()=>{
  assert.equal(normalizeLocale('id'),'id-ID');
  assert.equal(normalizeLocale('ja-JP'),'ja-JP');
  assert.equal(normalizeLocale('es-MX'),'en-US');
  assert.equal(normalizeLocale('unknown'),'en-US');
  assert.equal(localeBase('ko-KR'),'en');
  assert.equal(holidayCountry('ja-JP'),'JP');
  assert.equal(holidayCountry('id-ID'),'ID');
  assert.deepEqual(APP_LANGUAGES.map(language=>language.base),['en','id','ja']);
});

test('IP country detection selects a supported locale and safely defaults unknown countries to English',()=>{
  assert.equal(localeForCountry('ID'),'id-ID');
  assert.equal(localeForCountry('jp'),'ja-JP');
  assert.equal(localeForCountry('MX'),'en-US');
  assert.equal(localeForCountry('SN'),'en-US');
  assert.equal(localeForCountry('TW'),'en-US');
  assert.equal(localeForCountry('GB'),'en-US');
  assert.equal(localeForCountry('AQ'),'en-US');
  assert.equal(localeForCountry('invalid'),'en-US');
});

test('common app labels are localized while English remains the fallback',()=>{
  assert.equal(translate('Reading calendar','Kalender membaca','ja-JP'),'読書カレンダー');
  assert.equal(translate('Weather','Cuaca','fr-FR'),'Weather');
  assert.equal(translate('Search this book','Cari buku ini','es-ES'),'Search this book');
  assert.equal(translate('Reading calendar','Kalender membaca','id-ID'),'Kalender membaca');
});

test('Home greeting, welcome copy and quote controls are localized across supported languages',()=>{
  const locales=APP_LANGUAGES.filter(language=>!language.base.startsWith('en'));
  for(const language of locales){
    assert.notEqual(translate('Good morning','Selamat pagi',language.locale),'Good morning',language.locale);
    assert.notEqual(translate('Pick up where you left off.','Lanjutkan dari halaman terakhir.',language.locale),'Pick up where you left off.',language.locale);
    assert.notEqual(translate('Find sourced quotes in this language','Cari kutipan bersumber dalam bahasa ini',language.locale),'Find sourced quotes in this language',language.locale);
    assert.notEqual(translate('Install on your device','Pasang di perangkatmu',language.locale),'Install on your device',language.locale);
    assert.notEqual(translate('Open Sela Books, then tap Install Sela when the app offers it.','Buka Sela Books, lalu ketuk Pasang Sela saat tombolnya tersedia.',language.locale),'Open Sela Books, then tap Install Sela when the app offers it.',language.locale);
    for(const [english,indonesian] of [
      ['Your little world of stories.','Ruang kecil untuk cerita.'],
      ['YOUR READING SPACE','RUANG BACA PRIBADIMU'],
      ['A little space to make reading feel like yours.','Ruang kecil untuk mengatur bacaan dengan caramu.'],
      ['A thought for today','Renungan hari ini'],
      ['Bookshelf ready for local files offline. Keep a backup.','Rak siap untuk berkas lokal offline. Tetap simpan cadangan.'],
      ['Offline shell unavailable; keep your originals.','Shell offline belum tersedia; simpan berkas asli.'],
      ['On your shelf','Di rakmu'],
      ['Make room for your first story.','Sisakan tempat untuk cerita pertama.'],
      ['Beyond your shelf','Di luar rakmu'],
      ['Discover open books. Read here or keep an offline copy.','Temukan buku terbuka. Baca di sini atau simpan offline.'],
      ['My room','Ruangku'],
      ['A few pages are enough for today.','Beberapa halaman cukup untuk hari ini.'],
      ['books shown','buku ditampilkan'],
      ['Your books.<br>Within reach.','Buku-bukumu.<br>Selalu dekat.'],
      ['Make this space yours','Buat ruang ini terasa milikmu'],
      ['Home background','Latar beranda'],
      ['Upload your own mascot image','Unggah gambar maskot sendiri'],
      ['Quote themes','Tema kutipan'],
      ['Small reading rituals','Ritual kecil membaca'],
      ['Update now','Perbarui sekarang'],
      ['App checked. Updates appear here when ready.','App diperiksa. Pembaruan akan tampil di sini setelah siap.'],
      ['Viewer playground','Playground Viewer'],
      ['Try your document','Coba dokumenmu'],
      ['THE READING DESK','MEJA BACA'],
    ]) assert.notEqual(translate(english,indonesian,language.locale),english,`${language.locale}: ${english}`);
  }
});
