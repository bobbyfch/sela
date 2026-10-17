import {responseText} from './network.ts';

export type FaithPreference='none'|'islam'|'protestantism'|'catholicism'|'buddhism'|'hinduism'|'confucianism';
/** Legacy ids remain readable for existing integrations; the preference UI only exposes Indonesia's six religions. */
export type FaithId=FaithPreference|'christianity'|'judaism'|'sikhism';
export interface FaithReading {faith:FaithId;title:string;text:string;reference:string;attribution:string;sourceUrl:string;language:string;license?:string;direction?:'ltr'|'rtl';}
export interface QuranVerse {sura:number;aya:number;arabic:string;translation:string;footnotes:string;}
export interface QuranSurah {number:number;name:string;translationKey:string;translationTitle:string;version:string;language:string;verses:QuranVerse[];sourceUrl:string;}
export interface QuranTranslationEdition {key:string;title:string;version:string;language:string;description:string;}
export interface IslamicReadingItem {title:string;arabic:string;transliteration:string;meaning:string;reference:string;repeat:string;grade:string;note:string;}
export interface IslamicReadingCollection {slug:string;name:string;arabicName:string;title:string;sourceNote:string;items:IslamicReadingItem[];sourceUrl:string;}
type JsonRecord=Record<string,unknown>;
const quranApi='https://quranenc.com/api/v1';
export const QURAN_STUDY_SOURCES={
 kemenagSurah:'https://quran.kemenag.go.id/quran/per-ayat/surah/',
 surahNames:'https://pustakalajnah.kemenag.go.id/detail/165',
 revelationPeriod:'https://pustakalajnah.kemenag.go.id/detail/95',
 asbabunNuzul:'https://pustakalajnah.kemenag.go.id/detail/93',
 prophetStories:'https://pustakalajnah.kemenag.go.id/detail/35',
 prophethood:'https://pustakalajnah.kemenag.go.id/detail/66',
 tajweedLatinJuzAmma:'https://quran.kemenag.go.id/assets/files/Juz-Amma-Metode-Tilawah.pdf',
 kemenagApi:'https://quran-api.lpmqkemenag.id/'
} as const;
export function quranKemenagSurahUrl(number:number,verseCount?:number):string{
 if(!Number.isInteger(number)||number<1||number>114)throw new RangeError('Choose a surah from 1 to 114.');
 const range=Number.isInteger(verseCount)&&Number(verseCount)>0?`?from=1&to=${Math.min(286,Number(verseCount))}`:'';
 return `${QURAN_STUDY_SOURCES.kemenagSurah}${number}${range}`;
}
function localeBase(value:string):string{const language=String(value||'en').trim().toLowerCase().split(/[-_]/,1)[0];return /^[a-z]{2,3}$/.test(language)?language:'en';}
const surahNames=['Al-Fātiḥah','Al-Baqarah','Āli ʿImrān','An-Nisāʾ','Al-Māʾidah','Al-Anʿām','Al-Aʿrāf','Al-Anfāl','At-Tawbah','Yūnus','Hūd','Yūsuf','Ar-Raʿd','Ibrāhīm','Al-Ḥijr','An-Naḥl','Al-Isrāʾ','Al-Kahf','Maryam','Ṭāhā','Al-Anbiyāʾ','Al-Ḥajj','Al-Muʾminūn','An-Nūr','Al-Furqān','Ash-Shuʿarāʾ','An-Naml','Al-Qaṣaṣ','Al-ʿAnkabūt','Ar-Rūm','Luqmān','As-Sajdah','Al-Aḥzāb','Sabaʾ','Fāṭir','Yā-Sīn','Aṣ-Ṣāffāt','Ṣād','Az-Zumar','Ghāfir','Fuṣṣilat','Ash-Shūrā','Az-Zukhruf','Ad-Dukhān','Al-Jāthiyah','Al-Aḥqāf','Muḥammad','Al-Fatḥ','Al-Ḥujurāt','Qāf','Adh-Dhāriyāt','Aṭ-Ṭūr','An-Najm','Al-Qamar','Ar-Raḥmān','Al-Wāqiʿah','Al-Ḥadīd','Al-Mujādilah','Al-Ḥashr','Al-Mumtaḥanah','Aṣ-Ṣaff','Al-Jumuʿah','Al-Munāfiqūn','At-Taghābun','Aṭ-Ṭalāq','At-Taḥrīm','Al-Mulk','Al-Qalam','Al-Ḥāqqah','Al-Maʿārij','Nūḥ','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyāmah','Al-Insān','Al-Mursalāt','An-Nabaʾ','An-Nāziʿāt','ʿAbasa','At-Takwīr','Al-Infiṭār','Al-Muṭaffifīn','Al-Inshiqāq','Al-Burūj','Aṭ-Ṭāriq','Al-Aʿlā','Al-Ghāshiyah','Al-Fajr','Al-Balad','Ash-Shams','Al-Layl','Aḍ-Ḍuḥā','Ash-Sharḥ','At-Tīn','Al-ʿAlaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-ʿĀdiyāt','Al-Qāriʿah','At-Takāthur','Al-ʿAṣr','Al-Humazah','Al-Fīl','Quraysh','Al-Māʿūn','Al-Kawthar','Al-Kāfirūn','An-Naṣr','Al-Masad','Al-Ikhlāṣ','Al-Falaq','An-Nās'];
const quranPatternSvg='<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><g fill="none" stroke="#48a5c5" stroke-opacity=".22" stroke-width="1.4"><path d="M96 12 108 42 138 30 126 60 156 72 126 84 138 114 108 102 96 132 84 102 54 114 66 84 36 72 66 60 54 30 84 42Z"/><path d="M96 35 103 65 133 72 103 79 96 109 89 79 59 72 89 65Z"/><circle cx="96" cy="72" r="18"/><path d="M0 0 18 18 0 36M192 0l-18 18 18 18M0 192l18-18L0 156m192 36-18-18 18-18"/></g></svg>';
export const QURAN_PATTERN_BACKGROUND=`url("data:image/svg+xml,${encodeURIComponent(quranPatternSvg)}")`;
const quranScenePalettes=[
 ['#e8f7ff','#d9f0f1','#b9e0dd','#f8fdff','#8dc5cf','#65aaba'],
 ['#f0f4ff','#e2e9ff','#c8d8f3','#fbfcff','#9caedd','#7b8fd0'],
 ['#eaf8f2','#d8eee5','#b7dfcf','#f7fffb','#8fc9b2','#5eaa91'],
 ['#f1f4ff','#e1e9f7','#c3d7e7','#fbfdff','#96b9c6','#639dac'],
 ['#eef7ff','#dcecf8','#c1e0e7','#ffffff','#91c3ce','#6ca8b6'],
 ['#f2f5ff','#e4eaff','#cbd7f0','#fbfcff','#a1b5d8','#718ac2']
] as const;
/** Deterministic, distinct geometric scene for each surah; decorative art only, not religious text. */
export function quranSceneBackgroundForSurah(number:number):string{
 const n=Number.isInteger(number)&&number>=1&&number<=114?number:1,p=quranScenePalettes[(n-1)%quranScenePalettes.length];
 const archX=205+((n*37)%170),archW=390+((n*19)%150),archTop=22+((n*13)%55),patternTurn=(n*23)%360;
 const dots=Array.from({length:7+(n%6)},(_,i)=>{const x=930+((n*83+i*137)%440),y=48+((n*47+i*73)%290),r=3+((n+i*3)%7);return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'"/>';}).join('');
 const ornaments=Array.from({length:3+(n%4)},(_,i)=>{const x=1000+i*105+((n*17)%38),y=440-((n+i*11)%55);return '<path d="M'+x+' '+y+'q24 -46 48 0m-24 -2v-47m-18 11q18 -22 36 0"/>';}).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="520" viewBox="0 0 1440 520"><defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+p[0]+'"/><stop offset=".58" stop-color="'+p[1]+'"/><stop offset="1" stop-color="'+p[2]+'"/></linearGradient><linearGradient id="arch" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+p[3]+'"/><stop offset="1" stop-color="'+p[1]+'"/></linearGradient><pattern id="tile" width="'+(52+(n%5)*8)+'" height="'+(52+(n%5)*8)+'" patternUnits="userSpaceOnUse" patternTransform="rotate('+patternTurn+')"><path d="M32 5 39 24 59 32 39 40 32 59 25 40 5 32 25 24Z" fill="none" stroke="'+p[5]+'" stroke-opacity=".18" stroke-width="1.5"/><circle cx="32" cy="32" r="7" fill="none" stroke="'+p[5]+'" stroke-opacity=".14"/></pattern></defs><rect width="1440" height="520" rx="40" fill="url(#sky)"/><path d="M0 '+(350+n%65)+'Q260 '+(n%60+300)+' 505 '+(370+n%43)+'T1015 '+(355+n%55)+' 1440 '+(345+n%72)+'V520H0Z" fill="'+p[2]+'" opacity=".74"/><path d="M'+archX+' 520V'+(archTop+205)+'C'+archX+' '+(archTop+68)+' '+(archX+archW*.22)+' '+archTop+' '+(archX+archW/2)+' '+archTop+'s'+(archW*.5)+' '+(archTop+68)+' '+(archW/2)+' '+(archTop+205)+'v'+(315-archTop)+'Z" fill="url(#arch)" stroke="'+p[4]+'" stroke-opacity=".5" stroke-width="8"/><path d="M'+(archX+57)+' 520V'+(archTop+220)+'c0-106 '+(archW*.23)+'-178 '+(archW/2-57)+'-178s'+(archW/2-57)+' 72 '+(archW/2-57)+' 178v'+(300-archTop)+'Z" fill="url(#tile)"/><path d="M0 488H1440" stroke="'+p[5]+'" stroke-opacity=".22" stroke-width="3"/><g fill="#fff" opacity=".76">'+dots+'</g><g fill="none" stroke="'+p[5]+'" stroke-opacity=".32" stroke-width="3" stroke-linecap="round">'+ornaments+'</g><path d="M1050 494h310" stroke="'+p[5]+'" stroke-opacity=".2" stroke-width="5" stroke-linecap="round"/></svg>';
 return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
}
export const QURAN_SCENE_BACKGROUND=quranSceneBackgroundForSurah(1);

export function quranSurahName(number:number):string{return Number.isInteger(number)&&number>=1&&number<=surahNames.length?surahNames[number-1]:`Surah ${number}`;}
export function quranSurahCatalog():{number:number;name:string}[]{return surahNames.map((name,index)=>({number:index+1,name}));}

async function getJson(url:string,signal?:AbortSignal,maxBytes=4*1024*1024):Promise<any>{
 const response=await fetch(url,{signal:signal||AbortSignal.timeout(15000),headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw Error(`Scripture source returned ${response.status}`);
 return JSON.parse(await responseText(response,maxBytes));
}
function asText(value:unknown,max=12000):string{return typeof value==='string'?value.slice(0,max):'';}
function stripTags(value:string):string{return value.replace(/<[^>]{0,2000}>/g,' ').replace(/\s+/g,' ').trim();}
function todayNumber(date:Date):number{return Math.floor(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())/86400000);}
function dailyIndex(date:Date,length:number,offset=0):number{return length?((todayNumber(date)+offset)%length):0;}
function responseRows(value:any):any[]{return Array.isArray(value)?value:Array.isArray(value?.result)?value.result:Array.isArray(value?.translations)?value.translations:Array.isArray(value?.data)?value.data:[];}

const preferredTranslations:Record<string,string>={id:'indonesian_affairs',en:'english_saheeh',ja:'japanese_saeedsato'};
export async function listQuranTranslations(language:string,signal?:AbortSignal):Promise<QuranTranslationEdition[]>{
 const lang=localeBase(language),supported=['id','en','ja'].includes(lang)?lang:'en';
 const rows=responseRows(await getJson(`${quranApi}/translations/list/${encodeURIComponent(supported)}?localization=${encodeURIComponent(supported)}`,signal,1024*1024));
 const editions=rows.filter(row=>String(row?.language_iso_code||'').toLowerCase()===supported&&typeof row?.key==='string'&&/^[a-z0-9_]+$/.test(row.key)).map(row=>({key:String(row.key),title:asText(row.title)||supported.toUpperCase(),version:asText(row.version)||'source version not provided',language:supported,description:asText(row.description,1000)}));
 if(!editions.length)throw Error(`QuranEnc has no available translation editions for ${supported.toUpperCase()} right now.`);
 const preferred=preferredTranslations[supported];return editions.sort((a,b)=>Number(b.key===preferred)-Number(a.key===preferred)||a.title.localeCompare(b.title));
}
async function quranTranslation(language:string,signal?:AbortSignal,translationKey?:string):Promise<QuranTranslationEdition>{
 const editions=await listQuranTranslations(language,signal),lang=editions[0].language;
 if(translationKey){const selected=editions.find(edition=>edition.key===translationKey);if(!selected)throw Error(`The selected Quran edition is not available in ${lang.toUpperCase()}. Choose another translation.`);return selected;}
 const preferred=editions.find(edition=>edition.key===preferredTranslations[lang]);return preferred||editions[0];
}

export async function loadQuranSurah(number:number,language:string,signal?:AbortSignal,translationKey?:string):Promise<QuranSurah>{
 if(!Number.isInteger(number)||number<1||number>114)throw new RangeError('Choose a surah from 1 to 114.');
 const translation=await quranTranslation(language,signal,translationKey);
 const data=await getJson(`${quranApi}/translation/sura/${encodeURIComponent(translation.key)}/${number}`,signal,4*1024*1024);
 const rows=responseRows(data),verses:QuranVerse[]=rows.map((row:JsonRecord)=>({sura:Number(row.sura)||number,aya:Number(row.aya)||0,arabic:asText(row.arabic_text),translation:asText(row.translation),footnotes:asText(row.footnotes)})).filter((row:QuranVerse)=>row.aya>0&&!!row.translation);
 if(!verses.length)throw Error('The Quran edition returned no readable verses.');
 return {number,name:surahNames[number-1],translationKey:translation.key,translationTitle:translation.title,version:translation.version,language:translation.language,verses,sourceUrl:`https://quranenc.com/en/browse/${encodeURIComponent(translation.key)}/${number}`};
}

async function quranOfTheDay(language:string,date:Date,signal?:AbortSignal):Promise<FaithReading>{
 const day=todayNumber(date),sura=1+(Math.abs(day)%114),result=await loadQuranSurah(sura,language,signal),verse=result.verses[Math.abs(Math.floor(day/114))%result.verses.length];
 const publisher=result.language==='id'?'Kementerian Agama RI · QuranEnc':'QuranEnc · '+result.translationTitle,quranTitle=result.language==='ja'?'クルアーン':result.language==='en'?'The Quran':'Al-Qur’an';
 return {faith:'islam',title:quranTitle+' · '+result.name,text:verse.translation,reference:`Surah ${result.number}:${verse.aya}`,attribution:`${publisher} · v${result.version}`,sourceUrl:result.sourceUrl,language:result.language};
}

const bibleReferences=['John 3:16','Psalm 23:1','Matthew 5:9','Romans 12:12','Philippians 4:6'];
async function christianReading(date:Date,signal?:AbortSignal,faith:'christianity'|'protestantism'|'catholicism'='christianity'):Promise<FaithReading>{
 const ref=bibleReferences[dailyIndex(date,bibleReferences.length)],data=await getJson(`https://bible-api.com/${encodeURIComponent(ref)}?translation=web`,signal,256*1024),text=asText(data.text).trim();
 if(!text)throw Error('The Bible source returned an empty passage.');
 return {faith,title:'Bible reading',text,reference:asText(data.reference)||ref,attribution:'World English Bible · Public Domain · eBible.org · English text',sourceUrl:'https://ebible.org/engwebp/',language:'en'};
}

const torahReferences=['Genesis 1:1','Psalms 23:1','Deuteronomy 6:4','Proverbs 3:5'];
async function jewishReading(date:Date,signal?:AbortSignal):Promise<FaithReading>{
 const ref=torahReferences[dailyIndex(date,torahReferences.length)],data=await getJson(`https://www.sefaria.org/api/v3/texts/${encodeURIComponent(ref)}?version=hebrew&return_format=text_only`,signal,512*1024),version=responseRows(data?.versions)[0],license=asText(version?.license);
 if(!version||!license||/NC|not verified|unknown/i.test(license))throw Error('This Sefaria text version has no reusable license metadata.');
 const raw=Array.isArray(version.text)?version.text.join(' '):version.text,text=stripTags(asText(raw));if(!text)throw Error('The Sefaria source returned no readable text.');
 const versionTitle=asText(version.versionTitle)||'Hebrew source text';
 return {faith:'judaism',title:'Tanakh reading',text,reference:ref,attribution:`Sefaria · ${versionTitle} · ${license}`,sourceUrl:`https://www.sefaria.org/${encodeURIComponent(ref.replaceAll(' ','.'))}`,language:'he',license,direction:'rtl'};
}

async function buddhistReading(date:Date,signal?:AbortSignal):Promise<FaithReading>{
 const rows=responseRows(await getJson('https://suttacentral.net/api/epigraphs',signal,1024*1024));
 const candidates=rows.filter(row=>typeof row?.uid==='string'&&/\/sujato(?:#|$)/.test(row.uid)&&typeof row?.epigraph==='string'&&row.epigraph.trim());
 if(!candidates.length)throw Error('No verified CC0 SuttaCentral passages are available right now.');
 const row=candidates[dailyIndex(date,candidates.length)],uid=asText(row.uid),reference=uid.split('/')[0];
 return {faith:'buddhism',title:'Dhamma reading',text:asText(row.epigraph),reference,attribution:'SuttaCentral · Bhikkhu Sujato · CC0',sourceUrl:`https://suttacentral.net/${uid.split('#')[0]}`,language:uid.split('/')[1]||'en'};
}

const gitaReferences:[[number,number],[number,number],[number,number],[number,number],[number,number]]=[[2,47],[2,48],[4,7],[4,8],[6,5]];
async function hinduReading(language:string,date:Date,signal?:AbortSignal):Promise<FaithReading>{
 const [chapter,verse]=gitaReferences[dailyIndex(date,gitaReferences.length)],url=`https://vedicscriptures.github.io/slok/${chapter}/${verse}`,data=await getJson(url,signal,256*1024),text=asText(data.slok);
 if(!text)throw Error('The Bhagavad Gita source returned no Sanskrit verse.');
 const english=localeBase(language)==='en'?asText(data.siva?.et):'';
 return {faith:'hinduism',title:'Bhagavad Gita',text:english||text,reference:`${chapter}.${verse}`,attribution:english?'Bhagavad Gita API · Swami Sivananda English rendering':'Bhagavad Gita API · Sanskrit source text',sourceUrl:url,language:english?'en':'sa'};
}

async function sikhReading(signal?:AbortSignal):Promise<FaithReading>{
 const data=await getJson('https://api.banidb.com/v2/random/1',signal,512*1024),rows=responseRows(data?.verses),text=rows.map(row=>asText(row?.verse?.unicode||row?.verse?.gurmukhi)).filter(Boolean).join('\n');
 if(!text)throw Error('BaniDB returned no original Gurmukhi lines.');
 const info=data.shabadInfo||{},reference=[info.source?.english,info.pageNo?'Ang '+info.pageNo:''].filter(Boolean).join(' · ');
 return {faith:'sikhism',title:'Gurbani reading',text,reference:reference||'Sri Guru Granth Sahib Ji',attribution:'BaniDB · original Gurmukhi text',sourceUrl:'https://www.banidb.com/',language:'pa'};
}

/** Chinese Text Project requires a registered IP or API key; keep this as a safe source link until a key is configured. */
export function faithSource(faith:FaithId):string{
 switch(faith){case 'confucianism':return 'https://ctext.org/analects/xue-er?if=en';case 'islam':return 'https://quranenc.com/en/home/api/';case 'catholicism':return 'https://bible-api.alkitab.or.id/';case 'protestantism':case 'christianity':return 'https://ebible.org/engwebp/';case 'hinduism':return 'https://vedicscriptures.github.io/';case 'buddhism':return 'https://suttacentral.net/api/docs/index.html';case 'judaism':return 'https://developers.sefaria.org/reference/get-v3-texts';case 'sikhism':return 'https://api.banidb.com/v2/api-docs/';default:return 'https://quranenc.com/en/home/api/';}
}

export async function loadFaithReading(faith:FaithId,language:string,date=new Date(),signal?:AbortSignal):Promise<FaithReading|null>{
 switch(faith){case 'islam':return quranOfTheDay(language,date,signal);case 'christianity':return christianReading(date,signal);case 'protestantism':return christianReading(date,signal,'protestantism');case 'catholicism':return null;case 'judaism':return jewishReading(date,signal);case 'buddhism':return buddhistReading(date,signal);case 'hinduism':return hinduReading(language,date,signal);case 'sikhism':return sikhReading(signal);case 'confucianism':return null;default:return null;}
}

const islamicReadingSlugs=new Set(['waking-up','morning-adhkar','after-salah','evening-adhkar','before-sleep','quranic-duas','home','food-drink','travel']);
/** The Buruja content API publishes Arabic and English adhkar with citations; keep its edition and refs attached. */
export async function loadIslamicReadingCollection(slug:string,signal?:AbortSignal):Promise<IslamicReadingCollection>{
 if(!islamicReadingSlugs.has(slug))throw new RangeError('Choose an available daily Islamic reading.');
 const sourceUrl=`https://buruja.com/api/v1/adhkar/${slug}.json`,data=await getJson(sourceUrl,signal,768*1024),rawItems=Array.isArray(data?.items)?data.items:[];
 const items:IslamicReadingItem[]=rawItems.slice(0,64).map((row:JsonRecord)=>({title:asText(row.title,200),arabic:asText(row.arabic,12000),transliteration:asText(row.translit,4000),meaning:asText(row.en,12000),reference:asText(row.ref,1000),repeat:asText(row.repeat,100),grade:asText(row.grade,200),note:asText(row.note,2000)})).filter((row:IslamicReadingItem)=>!!row.arabic&&!!row.meaning);
 if(!items.length)throw Error('The daily reading source returned no complete Arabic and English passages.');
 return {slug,name:asText(data.name,200)||slug,arabicName:asText(data.arabic_name,200),title:asText(data.title,500)||asText(data.name,200)||slug,sourceNote:asText(data.source_note,500),items,sourceUrl};
}

export async function openIslamicReadingInSela(slug:string,title:string,openBook:(book:Record<string,unknown>)=>unknown,uiLanguage='en',signal?:AbortSignal):Promise<IslamicReadingCollection>{
 const collection=await loadIslamicReadingCollection(slug,signal),lang=localeBase(uiLanguage),copy=lang==='id'?{meaning:'Makna bahasa Inggris',transliteration:'Transliterasi',source:'Rujukan',repeat:'Ulangan',note:'Catatan',sourceLine:'Sumber dan teks asli'}:lang==='ja'?{meaning:'英語の意味',transliteration:'翻字',source:'出典',repeat:'回数',note:'注記',sourceLine:'出典と原文'}:{meaning:'English meaning',transliteration:'Transliteration',source:'Reference',repeat:'Repeat',note:'Note',sourceLine:'Source and original text'};
 const rows=collection.items.map((item,index)=>`<article class="adhkar-entry"><p class="entry-index">${String(index+1).padStart(2,'0')}</p><h2>${escapeHtml(item.title||item.reference||collection.name)}</h2><p class="arabic" lang="ar" dir="rtl">${escapeHtml(item.arabic)}</p>${item.transliteration?`<p class="transliteration"><b>${escapeHtml(copy.transliteration)}:</b> ${escapeHtml(item.transliteration)}</p>`:''}<p class="meaning" lang="en"><b>${escapeHtml(copy.meaning)}:</b> ${escapeHtml(item.meaning)}</p><p class="reference">${item.reference?`<b>${escapeHtml(copy.source)}:</b> ${escapeHtml(item.reference)}`:''}${item.repeat?` · <b>${escapeHtml(copy.repeat)}:</b> ${escapeHtml(item.repeat)}`:''}${item.grade?` · ${escapeHtml(item.grade)}`:''}</p>${item.note?`<p class="note"><b>${escapeHtml(copy.note)}:</b> ${escapeHtml(item.note)}</p>`:''}</article>`).join('');
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="author" content="Sela Books"><title>${escapeHtml(title)}</title><style>:root{color-scheme:light dark}*{box-sizing:border-box}body{max-width:54rem;margin:0 auto;padding:clamp(1rem,4vw,2.5rem);font:400 1rem/1.75 system-ui,sans-serif;color:inherit}.adhkar-scene{display:grid;min-height:clamp(150px,24vw,230px);align-content:end;gap:.45rem;margin-bottom:1.25rem;padding:clamp(1.25rem,4vw,2rem);border:1px solid color-mix(in srgb,#50a5c7 28%,transparent);border-radius:28px;background-color:#eaf7fc;background-image:linear-gradient(90deg,#f7fcffbb,#eefaff78),${QURAN_SCENE_BACKGROUND};background-position:center;background-size:cover;color:#294d58}.kicker{font-size:.72rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;opacity:.72}.adhkar-scene h1{max-width:24ch;margin:0;font-size:clamp(1.35rem,3vw,2rem);line-height:1.25}.source{margin:.2rem 0 0;font-size:.78rem;line-height:1.5;opacity:.78}.source a{color:inherit}.adhkar-entry{margin:1rem 0;padding:clamp(1rem,3vw,1.5rem);border:1px solid color-mix(in srgb,currentColor 14%,transparent);border-radius:24px;background-color:color-mix(in srgb,currentColor 3%,transparent);background-image:linear-gradient(110deg,color-mix(in srgb,#91dce8 8%,transparent),transparent 72%),${QURAN_PATTERN_BACKGROUND};background-size:auto,192px 192px}.entry-index{margin:0;color:#5c91a1;font:700 .72rem/1 system-ui,sans-serif;letter-spacing:.1em}.adhkar-entry h2{margin:.5rem 0;font-size:1.12rem}.arabic{margin:1rem 0;text-align:center;font:400 clamp(1.5rem,4vw,2.2rem)/2 "Noto Naskh Arabic","Amiri",serif}.transliteration,.meaning{white-space:pre-wrap}.reference,.note{font-size:.82rem;line-height:1.55;opacity:.76}.note{margin-bottom:0}.source a:focus-visible{outline:2px solid currentColor;outline-offset:3px}@media(prefers-color-scheme:dark){.adhkar-scene{background-image:linear-gradient(90deg,#243846d9,#293d4ab8),${QURAN_SCENE_BACKGROUND};color:#f3f9fb}.adhkar-entry{background-color:color-mix(in srgb,currentColor 5%,transparent)}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}</style></head><body><main><header class="adhkar-scene"><span class="kicker">Sela · Daily remembrance</span><h1>${escapeHtml(title)}</h1><p class="source">${escapeHtml(collection.arabicName)} · ${collection.items.length} passages · <a href="${escapeHtml(collection.sourceUrl)}">${escapeHtml(copy.sourceLine)} · Buruja</a></p></header>${rows}</main></body></html>`;
 const file=new File([html],`islamic-${slug}.html`,{type:'text/html'});
 await openBook({previewFile:file,format:'html',name:title,metadata:{title,author:'Buruja Content API',language:'en',rights:'Buruja Content API; preserve each Quran and hadith attribution',description:collection.sourceUrl,faith:'islam'}});
 return collection;
}

function escapeHtml(value:string):string{return value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));}
export function faithReadingHtml(title:string,rows:{reference:string;text:string;direction?:'ltr'|'rtl'}[],attribution:string,language='en'):string{
 const body=rows.map(row=>`<section><h2>${escapeHtml(row.reference)}</h2><p dir="${row.direction==='rtl'?'rtl':'auto'}">${escapeHtml(row.text)}</p></section>`).join('\n');
 return `<!doctype html><html lang="${escapeHtml(language)}"><head><meta charset="utf-8"><meta name="author" content="Sela Books"><title>${escapeHtml(title)}</title></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(attribution)}</p>${body}</body></html>`;
}

export interface QuranDisplayOptions {translationKey?:string;arabicSize?:number;translationSize?:number;verse?:number;}
function quranReadingHtml(title:string,surah:QuranSurah,arabicSize:number,translationSize:number,startVerse:number):string{
 const verses=surah.verses.map(verse=>`<article id="quran-verse-${verse.aya}" class="quran-verse"><h2>${verse.sura}:${verse.aya}</h2><p class="quran-arabic" lang="ar" dir="rtl">${escapeHtml(verse.arabic)}</p><p class="quran-translation" lang="${escapeHtml(surah.language)}" dir="auto">${escapeHtml(verse.translation)}</p>${verse.footnotes?`<small class="quran-footnotes">${escapeHtml(verse.footnotes)}</small>`:''}</article>`).join('\n');
 const copy=surah.language==='id'?{learn:'Sumber belajar resmi',latin:'Latin, terjemahan dan tafsir surat ini · Qur’an Kemenag',names:'Makna nama seluruh surat · LPMQ',revelation:'Periode pewahyuan Makki dan Madani · LPMQ',asbab:'Asbabun Nuzul · LPMQ',prophets:'Kisah para nabi pra-Ibrahim · LPMQ',prophethood:'Kenabian dalam Al-Qur’an · LPMQ',tajweed:'Tajwid warna dan transliterasi Latin · Juz Amma',scope:'Buku tajwid ini khusus Juz Amma.'}:surah.language==='ja'?{learn:'信頼できる学習資料',latin:'この章のラテン文字表記・翻訳・注釈 · クルアーン・インドネシア宗教省',names:'全スーラ名の意味 · LPMQ',revelation:'啓示の時期：マッカ・マディーナ · LPMQ',asbab:'啓示の背景 · LPMQ',prophets:'イブラーヒーム以前の預言者の物語 · LPMQ',prophethood:'クルアーンにおける預言 · LPMQ',tajweed:'カラータジュウィードとラテン表記 · ジュズ・アンマ',scope:'カラータジュウィード資料はジュズ・アンマのみです。'}:{learn:'Verified study sources',latin:'Latin transliteration, translation and tafsir for this surah · Kemenag',names:'Meanings of all surah names · LPMQ',revelation:'Revelation periods: Makki and Madani · LPMQ',asbab:'Asbabun Nuzul · LPMQ',prophets:'Stories of prophets before Ibrahim · LPMQ',prophethood:'Prophethood in the Quran · LPMQ',tajweed:'Color tajwid and Latin guide · Juz Amma',scope:'This color tajwid guide covers Juz Amma only.'};
 const studyLinks=[{label:copy.latin,url:quranKemenagSurahUrl(surah.number,surah.verses.length)},{label:copy.names,url:QURAN_STUDY_SOURCES.surahNames},{label:copy.revelation,url:QURAN_STUDY_SOURCES.revelationPeriod},{label:copy.asbab,url:QURAN_STUDY_SOURCES.asbabunNuzul},{label:copy.prophets,url:QURAN_STUDY_SOURCES.prophetStories},{label:copy.prophethood,url:QURAN_STUDY_SOURCES.prophethood},{label:copy.tajweed,url:QURAN_STUDY_SOURCES.tajweedLatinJuzAmma}].map(link=>`<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} ↗</a>`).join('');
 const studies=`<aside class="quran-study-links" aria-labelledby="quran-study-heading"><h2 id="quran-study-heading">${escapeHtml(copy.learn)}</h2><div>${studyLinks}</div><p>${escapeHtml(copy.scope)}</p></aside>`;
 return `<!doctype html><html lang="${escapeHtml(surah.language)}"><head><meta charset="utf-8"><meta name="author" content="Sela Books"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>
body{max-width:48rem;margin:0 auto;padding:clamp(1rem,4vw,2.5rem);line-height:1.7;color:inherit}
.quran-reading-scene{box-sizing:border-box;min-height:clamp(150px,24vw,230px);display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:.35rem;margin:0 0 1rem;padding:clamp(1.25rem,4vw,2rem);overflow:hidden;border:1px solid color-mix(in srgb,#4f9baa 22%,transparent);border-radius:26px;background-color:color-mix(in srgb,currentColor 4%,transparent);background-image:linear-gradient(90deg,color-mix(in srgb,#f7fdff 10%,transparent),color-mix(in srgb,#f7fdff 55%,transparent)),${quranSceneBackgroundForSurah(surah.number)};background-position:center;background-size:cover;color:#294d58}
.quran-scene-kicker{margin:0;font:700 .7rem/1.3 system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;opacity:.72}.quran-scene-title{max-width:28ch;font:600 clamp(1.2rem,3vw,1.8rem)/1.25 system-ui,sans-serif;overflow-wrap:anywhere}.quran-scene-reference{font:500 .82rem/1.4 system-ui,sans-serif;opacity:.8}
.quran-source{font-size:.8rem;line-height:1.5;opacity:.8;margin:0 0 1.25rem}
.quran-study-links{display:grid;gap:.6rem;margin:1.25rem 0;padding:1rem;border:1px solid color-mix(in srgb,currentColor 13%,transparent);border-radius:18px;background:color-mix(in srgb,currentColor 3%,transparent)}.quran-study-links h2{margin:0;font:650 .95rem/1.4 system-ui,sans-serif}.quran-study-links>div{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:.5rem}.quran-study-links a{display:flex;min-height:42px;align-items:center;padding:.55rem .75rem;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:12px;color:inherit;font:600 .8rem/1.45 system-ui,sans-serif;text-decoration:none}.quran-study-links a:hover,.quran-study-links a:focus-visible{border-color:#4f9baa;color:#347d8b}.quran-study-links p{margin:0;font:400 .72rem/1.5 system-ui,sans-serif;opacity:.68}
.quran-verse{padding:1.25rem 1.5rem;margin:1rem 0;border:1px solid color-mix(in srgb,currentColor 13%,transparent);border-radius:22px;background-color:color-mix(in srgb,currentColor 3%,transparent);background-image:linear-gradient(110deg,color-mix(in srgb,currentColor 2%,transparent),color-mix(in srgb,#9bdae3 12%,transparent)),${QURAN_PATTERN_BACKGROUND};background-repeat:no-repeat,repeat;background-size:cover,192px 192px;box-shadow:0 8px 24px #2d66850c}.quran-verse h2{font:600 .8rem/1.4 system-ui,sans-serif;opacity:.7}.quran-arabic{font-family:"Noto Naskh Arabic","Amiri",serif;font-size:${arabicSize}px;line-height:2.1;text-align:center;margin:1rem 0 1.5rem}.quran-translation{font-family:system-ui,sans-serif;font-size:${translationSize}px;line-height:1.8;white-space:pre-wrap}.quran-footnotes{display:block;font:400 .8rem/1.6 system-ui,sans-serif;opacity:.68;margin-top:.75rem}
</style></head><body><main data-quran-surah="${surah.number}" data-quran-translation-key="${escapeHtml(surah.translationKey)}" data-quran-language="${escapeHtml(surah.language)}" data-quran-start-verse="${startVerse}" data-quran-verse-count="${surah.verses.length}" data-quran-arabic-size="${arabicSize}" data-quran-translation-size="${translationSize}"><section id="quran-reading-scene" data-surah="${surah.number}" aria-label="${escapeHtml(title)}"><span class="quran-scene-kicker">${surah.language==='ja'?'クルアーンの読書':surah.language==='en'?'A quiet moment with the Quran':'Waktu tenang bersama Al-Qur’an'}</span><strong class="quran-scene-title">${escapeHtml(surah.name)}</strong><span class="quran-scene-reference">${surah.number} · ${surah.verses.length} ${surah.language==='ja'?'節':surah.language==='en'?'verses':'ayat'}</span></section><h1>${escapeHtml(title)}</h1><p class="quran-source">${escapeHtml(surah.translationTitle)} · version ${escapeHtml(surah.version)} · QuranEnc · <a href="https://quranenc.com/en/home/api/">Source and translation terms</a></p>${studies}${verses}</main></body></html>`;
}

export async function openQuranInSela(number:number,language:string,openBook:(book:Record<string,unknown>)=>unknown,signal?:AbortSignal,options:QuranDisplayOptions={}):Promise<QuranSurah>{
 const surah=await loadQuranSurah(number,language,signal,options.translationKey),title=`Al-Qur’an · ${surah.name}`;
 const arabicSize=Math.max(20,Math.min(48,Math.round(options.arabicSize||32))),translationSize=Math.max(14,Math.min(28,Math.round(options.translationSize||18)));
 const attribution=`${surah.translationTitle} · version ${surah.version} · QuranEnc · https://quranenc.com/en/home/api/`;
 const startVerse=Math.max(1,Math.min(surah.verses.length,Math.round(options.verse||1)));
 const file=new File([quranReadingHtml(title,surah,arabicSize,translationSize,startVerse)],`quran-${number}.html`,{type:'text/html'});
 await openBook({previewFile:file,format:'html',name:title,metadata:{title,author:surah.translationTitle,language:surah.language,rights:`QuranEnc · ${surah.version}`,description:attribution,quran:{surah:surah.number,translationKey:surah.translationKey,translationTitle:surah.translationTitle,version:surah.version,language:surah.language,startVerse,verseCount:surah.verses.length,arabicSize,translationSize}}});
 return surah;
}

export async function openFaithReadingInSela(reading:FaithReading,openBook:(book:Record<string,unknown>)=>unknown):Promise<void>{
 const title=`${reading.title} · ${reading.reference}`,file=new File([faithReadingHtml(title,[{reference:reading.reference,text:reading.text,direction:reading.direction}],reading.attribution,reading.language)],`scripture-${reading.faith}.html`,{type:'text/html'});
 await openBook({previewFile:file,format:'html',name:title,metadata:{title,author:reading.attribution,language:reading.language,rights:reading.license||reading.attribution,description:reading.sourceUrl}});
}
