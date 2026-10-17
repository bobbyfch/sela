import {faithReadingHtml,listQuranTranslations,loadFaithReading,loadIslamicReadingCollection,loadQuranSurah,openIslamicReadingInSela} from '../app/library/scripture-sources.ts';

export type ScriptureFaith='islam'|'protestantism'|'catholicism'|'buddhism'|'hinduism'|'confucianism';
export interface ScripturePassage {faith:ScriptureFaith;title:string;text:string;reference:string;attribution:string;sourceUrl:string;language:string;license?:string;direction?:'ltr'|'rtl';}
export interface QuranVerse {sura:number;aya:number;arabic:string;translation:string;footnotes:string;}
export interface QuranChapter {number:number;name:string;translationKey:string;translationTitle:string;version:string;language:string;verses:QuranVerse[];sourceUrl:string;}
export interface QuranTranslationEdition {key:string;title:string;version:string;language:string;description:string;}
export interface IslamicReadingItem {title:string;arabic:string;transliteration:string;meaning:string;reference:string;repeat:string;grade:string;note:string;}
export interface IslamicReadingCollection {slug:string;name:string;arabicName:string;title:string;sourceNote:string;items:IslamicReadingItem[];sourceUrl:string;}
export interface ScriptureSection {reference:string;text:string;direction?:'ltr'|'rtl';}

/** UI locales are id/en/ja; textLanguages records the actual languages offered by each source. */
export const SCRIPTURE_PROVIDERS=[
 {faith:'islam',name:'QuranEnc · Kementerian Agama / Saheeh International / Saeed Sato',textLanguages:['id','en','ja'],appLanguages:['id','en','ja'],requiresKey:false,source:'https://quranenc.com/en/home/api/'},
 {faith:'protestantism',name:'World English Bible · eBible.org',textLanguages:['en'],appLanguages:['id','en','ja'],requiresKey:false,source:'https://ebible.org/engwebp/'},
 {faith:'catholicism',name:'Bible API · Lembaga Alkitab Indonesia',textLanguages:['id'],appLanguages:['id','en','ja'],requiresKey:true,source:'https://bible-api.alkitab.or.id/'},
 {faith:'buddhism',name:'SuttaCentral · Bhikkhu Sujato',textLanguages:['en'],appLanguages:['id','en','ja'],requiresKey:false,source:'https://suttacentral.net/api/docs/index.html'},
 {faith:'hinduism',name:'Bhagavad Gita API · Sanskrit source and English rendering',textLanguages:['sa','en'],appLanguages:['id','en','ja'],requiresKey:false,source:'https://vedicscriptures.github.io/'},
 {faith:'confucianism',name:'Chinese Text Project · Analects',textLanguages:['zh','en'],appLanguages:['id','en','ja'],requiresKey:true,source:'https://ctext.org/tools/api/ens'}
] as const;

/** Fetch today's cited passage. The app locale chooses a source edition where one is available. */
export async function getDailyScripture(faith:ScriptureFaith,language='en',date=new Date(),signal?:AbortSignal):Promise<ScripturePassage>{
 const item=await loadFaithReading(faith,language,date,signal);if(!item)throw Error('Choose a supported scripture tradition.');return item as ScripturePassage;
}

/** List source-published Quran translations available in Indonesian, English or Japanese. */
export async function getQuranTranslations(language='en',signal?:AbortSignal):Promise<QuranTranslationEdition[]>{return await listQuranTranslations(language,signal);}

/** Fetch one complete Quran surah from the selected QuranEnc translation. */
export async function getQuranChapter(number:number,language='id',signal?:AbortSignal,translationKey?:string):Promise<QuranChapter>{return await loadQuranSurah(number,language,signal,translationKey) as QuranChapter;}

/** Fetch a cited Buruja daily-remembrance collection. Arabic and the source's English meaning stay distinct. */
export async function getIslamicReadingCollection(slug:string,signal?:AbortSignal):Promise<IslamicReadingCollection>{return await loadIslamicReadingCollection(slug,signal);}

/** Open a cited adhkar collection in a Sela reader document without changing the general viewer/CDN contract. */
export async function openIslamicCollection(slug:string,title:string,openBook:(book:Record<string,unknown>)=>unknown,uiLanguage='en',signal?:AbortSignal):Promise<IslamicReadingCollection>{return await openIslamicReadingInSela(slug,title,openBook,uiLanguage,signal);}

/** Create a safe HTML document that can be passed to Sela as format: "html". */
export function createScriptureDocument(title:string,sections:ScriptureSection[],attribution:string):Blob{
 return new Blob([faithReadingHtml(title,sections,attribution)],{type:'text/html;charset=utf-8'});
}
