export const APP_LANGUAGES = [
  {locale:'en-US',name:'English',base:'en',country:'US'},
  {locale:'id-ID',name:'Bahasa Indonesia',base:'id',country:'ID'},
  {locale:'ja-JP',name:'日本語',base:'ja',country:'JP'},
] as const;

export type AppLocale = typeof APP_LANGUAGES[number]['locale'];
const byBase = Object.fromEntries(APP_LANGUAGES.map(item=>[item.base,item])) as Record<string,typeof APP_LANGUAGES[number]>;
export function normalizeLocale(value:string|undefined|null):AppLocale {
  if(!value)return 'en-US';
  const normalized=value.replace('_','-').toLowerCase();
  const exact=APP_LANGUAGES.find(item=>item.locale.toLowerCase()===normalized);
  if(exact)return exact.locale;
  const base=normalized.split('-')[0];
  return byBase[base]?.locale||'en-US';
}
export function localeBase(value:string):string{return normalizeLocale(value).split('-')[0];}
export function holidayCountry(value:string):string{return APP_LANGUAGES.find(item=>item.locale===normalizeLocale(value))?.country||'US';}

const countryLocales:Record<string,AppLocale>={ID:'id-ID',JP:'ja-JP'};
/** Select one of Sela's supported languages by country; unknown regions use English. */
export function localeForCountry(country:string|undefined|null):AppLocale {
  const code=(country||'').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code)?countryLocales[code]||'en-US':'en-US';
}
