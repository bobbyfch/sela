import test from 'node:test';
import assert from 'node:assert/strict';
import {faithReadingHtml,faithSource,listQuranTranslations,loadFaithReading,loadIslamicReadingCollection,loadQuranSurah,openIslamicReadingInSela,openQuranInSela,quranSurahCatalog,quranSurahName} from '../../app/library/scripture-sources.ts';
import {SCRIPTURE_PROVIDERS} from '../../src/scriptures.ts';

test('scripture providers cover the six Indonesian-recognized choices and report source language or credential limits',async()=>{
 assert.deepEqual(SCRIPTURE_PROVIDERS.map(provider=>provider.faith),['islam','protestantism','catholicism','buddhism','hinduism','confucianism']);
 assert.deepEqual(SCRIPTURE_PROVIDERS[0].textLanguages,['id','en','ja']);assert.deepEqual(SCRIPTURE_PROVIDERS[1].textLanguages,['en']);assert.equal(SCRIPTURE_PROVIDERS[2].requiresKey,true);assert.equal(SCRIPTURE_PROVIDERS[5].requiresKey,true);
 assert.equal(faithSource('catholicism'),'https://bible-api.alkitab.or.id/');assert.equal(faithSource('confucianism'),'https://ctext.org/analects/xue-er?if=en');assert.equal(await loadFaithReading('confucianism','ja-JP'),null);assert.equal(await loadFaithReading('catholicism','id-ID'),null);
});

test('Quran source selects the official Indonesian Affairs translation and returns the whole surah',async()=>{
 const originalFetch=globalThis.fetch;let requests=0;
 try{
  globalThis.fetch=async input=>{requests++;const url=new URL(String(input));if(url.pathname.endsWith('/translations/list/id'))return new Response(JSON.stringify({translations:[{key:'indonesian_affairs',language_iso_code:'id',title:'Terjemahan Berbahasa Indonesia - Kementerian Agama',version:'1.0.1'}]}),{status:200});assert.equal(url.pathname,'/api/v1/translation/sura/indonesian_affairs/1');return new Response(JSON.stringify({result:[{sura:'1',aya:'1',arabic_text:'بِسْمِ اللَّهِ',translation:'Dengan nama Allah.',footnotes:''},{sura:'1',aya:'2',arabic_text:'الْحَمْدُ لِلَّهِ',translation:'Segala puji bagi Allah.',footnotes:''}]}),{status:200});};
  const surah=await loadQuranSurah(1,'id-ID');assert.equal(requests,2);assert.equal(surah.name,'Al-Fātiḥah');assert.match(surah.translationTitle,/Kementerian Agama/);assert.equal(surah.version,'1.0.1');assert.equal(surah.verses.length,2);assert.equal(surah.verses[0].arabic,'بِسْمِ اللَّهِ');
 }finally{globalThis.fetch=originalFetch;}
});

test('Quran translation editions follow Indonesian, English and Japanese without silent language fallback',async()=>{
 const originalFetch=globalThis.fetch;
 const editions={id:[{key:'indonesian_affairs',language_iso_code:'id',title:'Kementerian Agama RI',version:'1.0.1'},{key:'indonesian_sabik',language_iso_code:'id',title:'Sabiq',version:'1.0.0'}],en:[{key:'english_saheeh',language_iso_code:'en',title:'Saheeh International',version:'1.0.1'}],ja:[{key:'japanese_saeedsato',language_iso_code:'ja',title:'日亜対訳（日本語） - サイード佐藤',version:'1.0.13'}]};
 try{
  globalThis.fetch=async input=>{const url=new URL(String(input));const list=url.pathname.match(/\/translations\/list\/(id|en|ja)$/);if(list)return new Response(JSON.stringify({translations:editions[list[1]]}),{status:200});const match=url.pathname.match(/\/translation\/sura\/([^/]+)\/(\d+)$/);assert.ok(match,'expected a Quran surah endpoint');const language=match[1]==='indonesian_affairs'||match[1]==='indonesian_sabik'?'id':match[1]==='japanese_saeedsato'?'ja':'en';return new Response(JSON.stringify({result:[{sura:'1',aya:'1',arabic_text:'بِسْمِ اللَّهِ',translation:language==='id'?'Dengan nama Allah.':language==='ja'?'慈悲あまねく慈愛深きアッラーの御名において。':'In the name of Allah.',footnotes:''}]}),{status:200});};
  for(const [language,key] of [['id-ID','indonesian_affairs'],['en-US','english_saheeh'],['ja-JP','japanese_saeedsato']] as const){const available=await listQuranTranslations(language);assert.equal(available[0].key,key);const surah=await loadQuranSurah(1,language,undefined,key);assert.equal(surah.language,language.slice(0,2));assert.equal(surah.translationKey,key);assert.ok(surah.verses[0].translation);}
  await assert.rejects(loadQuranSurah(1,'ja-JP',undefined,'english_saheeh'),/not available in JA/);
 }finally{globalThis.fetch=originalFetch;}
});

test('scripture source rejects invalid Quran chapter numbers and keeps generated HTML escaped',async()=>{
 await assert.rejects(loadQuranSurah(115,'id'),/surah from 1 to 114/);
 const html=faithReadingHtml('Faith <title>',[{reference:'1:1',text:'<script>alert(1)</script> & aman'}],'Source & edition');assert.match(html,/Faith &lt;title&gt;/);assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp; aman/);assert.doesNotMatch(html,/<script>/);
});

test('faith home passage uses a sourced, public-domain Bible edition',async()=>{
 const originalFetch=globalThis.fetch;
 try{globalThis.fetch=async input=>{assert.match(String(input),/bible-api\.com/);return new Response(JSON.stringify({reference:'John 3:16',text:'For God so loved the world.',translation_name:'World English Bible',translation_note:'Public Domain'}),{status:200});};const reading=await loadFaithReading('christianity','id-ID',new Date('2026-10-13T12:00:00Z'));assert.equal(reading?.reference,'John 3:16');assert.equal(reading?.language,'en');assert.match(reading?.attribution||'',/Public Domain/);}finally{globalThis.fetch=originalFetch;}
});

test('daily Islamic reading collections preserve Arabic, English meaning, references, and source attribution in Sela',async()=>{
 const originalFetch=globalThis.fetch;let opened:Record<string,any>|undefined;
 try{globalThis.fetch=async input=>{assert.equal(String(input),'https://buruja.com/api/v1/adhkar/morning-adhkar.json');return new Response(JSON.stringify({slug:'morning-adhkar',name:'Morning Adhkar',arabic_name:'أذكار الصباح',title:'Morning remembrances',source_note:'Quran and hadith sources',items:[{n:1,title:'Ayat al-Kursi',arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ',translit:'Allahu la ilaha illa Huwa',en:'Allah—there is no deity except Him.',repeat:'1x',ref:'Al-Baqarah 2:255',grade:'Quran',note:'A note <script>alert(1)</script>'}]}),{status:200});};const collection=await loadIslamicReadingCollection('morning-adhkar');assert.equal(collection.items.length,1);assert.equal(collection.items[0].meaning,'Allah—there is no deity except Him.');await openIslamicReadingInSela('morning-adhkar','Zikir pagi',async book=>{opened=book;},'id-ID');const html=await(opened?.previewFile as File).text();assert.match(html,/<html lang="en">/);assert.match(html,/lang="ar" dir="rtl">اللَّهُ/);assert.match(html,/Makna bahasa Inggris/);assert.match(html,/Al-Baqarah 2:255/);assert.match(html,/Buruja/);assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);assert.equal((opened?.metadata as Record<string,unknown>).language,'en');}
 finally{globalThis.fetch=originalFetch;}
});

test('daily Islamic collection routes reject unknown slug values before network access',async()=>{
 await assert.rejects(loadIslamicReadingCollection('../unsafe'),/available daily Islamic reading/);
});

test('Quran chapters are presented in order and localized by source version',()=>{assert.equal(quranSurahName(1),'Al-Fātiḥah');assert.equal(quranSurahName(114),'An-Nās');assert.equal(quranSurahName(0),'Surah 0');});

test('Quran reader payload keeps the selected verse, edition, and text sizing for in-viewer navigation',async()=>{
 const originalFetch=globalThis.fetch;let opened:Record<string,any>|undefined;
 try{
  globalThis.fetch=async input=>{const url=new URL(String(input));if(url.pathname.endsWith('/translations/list/id'))return new Response(JSON.stringify({translations:[{key:'indonesian_affairs',language_iso_code:'id',title:'Kementerian Agama RI',version:'1.0.1'}]}),{status:200});return new Response(JSON.stringify({result:[{sura:'2',aya:'1',arabic_text:'الم',translation:'Awal ayat.'},{sura:'2',aya:'2',arabic_text:'ذَٰلِكَ الْكِتَابُ',translation:'Ayat kedua.'}]}),{status:200});};
  await openQuranInSela(2,'id',async book=>{opened=book;},undefined,{translationKey:'indonesian_affairs',arabicSize:36,translationSize:20,verse:2});
  const html=await (opened?.previewFile as File).text();assert.match(html,/data-quran-surah="2"/);assert.match(html,/data-quran-translation-key="indonesian_affairs"/);assert.match(html,/data-quran-start-verse="2"/);assert.match(html,/data-quran-verse-count="2"/);assert.match(html,/id="quran-verse-2"/);assert.match(html,/data-quran-arabic-size="36"/);assert.match(html,/data-quran-translation-size="20"/);assert.deepEqual(quranSurahCatalog()[0],{number:1,name:'Al-Fātiḥah'});
 }finally{globalThis.fetch=originalFetch;}
});
