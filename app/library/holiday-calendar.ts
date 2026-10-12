export interface PublicHoliday {date:string;localName:string;name:string;countryCode:string;global:boolean;types:string[];counties?:string[]}
export interface HolidayYear {country:string;year:number;holidays:PublicHoliday[];cached:boolean;stale:boolean}

const CACHE_PREFIX='sela-library:public-holidays:v1:';
const WEEK=7*24*60*60*1000;
const memory=new Map<string,{savedAt:number;holidays:PublicHoliday[]}>();
function valid(value:unknown):value is PublicHoliday[]{
  if(!Array.isArray(value)||value.length>120)return false;
  return value.every((item:any)=>item&&typeof item.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(item.date)&&typeof item.name==='string'&&item.name.length<=180&&typeof item.localName==='string'&&item.localName.length<=180&&typeof item.countryCode==='string'&&Array.isArray(item.types));
}
function read(key:string){
  const inMemory=memory.get(key);if(inMemory)return inMemory;
  try{const value=JSON.parse(localStorage.getItem(key)||'null');if(value&&Number.isFinite(value.savedAt)&&valid(value.holidays))return value;}catch{/* Private browsing or corrupt cache: fetch can still work. */}
  return undefined;
}
function save(key:string,holidays:PublicHoliday[]){const value={savedAt:Date.now(),holidays};memory.set(key,value);try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Keep this session's result in memory. */}return value;}

/** Fetches official country public holidays and uses a bounded local cache for offline visits. */
export async function loadPublicHolidays(year:number,country:string,fetcher:typeof fetch=fetch):Promise<HolidayYear>{
  if(!Number.isInteger(year)||year<1970||year>2100||! /^[A-Z]{2}$/.test(country))throw new TypeError('Invalid holiday calendar region');
  const key=CACHE_PREFIX+country+':'+year,cached=read(key);
  if(cached&&Date.now()-cached.savedAt<WEEK)return {country,year,holidays:cached.holidays,cached:true,stale:false};
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  try{
    const response=await fetcher(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw new Error(`Holiday service returned ${response.status}`);
    const body=await response.json();
    if(!valid(body))throw new Error('Holiday service returned invalid data');
    const holidays=body.filter(item=>item.global||!item.counties).map((item:any)=>({date:item.date,localName:item.localName.trim().slice(0,180),name:item.name.trim().slice(0,180),countryCode:item.countryCode,global:!!item.global,types:item.types.filter((type:unknown)=>typeof type==='string').slice(0,8)})).sort((a,b)=>a.date.localeCompare(b.date));
    const saved=save(key,holidays);return {country,year,holidays:saved.holidays,cached:false,stale:false};
  }catch(error){if(cached)return {country,year,holidays:cached.holidays,cached:true,stale:true};throw error;}
  finally{clearTimeout(timeout);}
}
