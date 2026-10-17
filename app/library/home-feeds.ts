import {responseText} from './network.ts';
import {localeBase} from '../../src/i18n.ts';

export type HomeFeedItem={title:string;description?:string;url:string;source?:string;date?:string;image?:string;year?:number};
export const HOME_NEWS_TOPICS=['books','science','nature','art','technology','culture'] as const;
export type HomeNewsTopic=typeof HOME_NEWS_TOPICS[number];
export const HOME_NEWS_SOURCES=['auto','google','gdelt','antara'] as const;
export type HomeNewsSource=typeof HOME_NEWS_SOURCES[number];
const antaraTopicFeeds:Record<HomeNewsTopic,{path:string;label:string}>={
 books:{path:'humaniora',label:'Humaniora'},science:{path:'tekno',label:'Tekno'},nature:{path:'warta-bumi',label:'Warta Bumi'},art:{path:'lifestyle',label:'Lifestyle'},technology:{path:'tekno',label:'Tekno'},culture:{path:'hiburan',label:'Hiburan'}
};
const topicTerms:Record<HomeNewsTopic,string[]>={
 books:['buku','pustaka','literasi','sastra','membaca','novel','komik','penerbit','perpustakaan','cerpen','penulis'],
 science:['sains','ilmiah','riset','penelitian','ilmu','eksperimen','temuan','laboratorium','biologi','fisika'],
 nature:['alam','lingkungan','hutan','laut','satwa','spesies','iklim','bumi','konservasi','ekosistem','polusi','sampah'],
 art:['seni','seniman','pameran','museum','desain','lukisan','galeri','karya','kreatif','festival'],
 technology:['teknologi','digital','aplikasi','ponsel','internet','robot','gadget','komputer','siber','startup','inovasi'],
 culture:['budaya','film','musik','konser','teater','hiburan','seni','festival','artis','sinem','tradisi']
};

const topicWords:Record<string,Record<HomeNewsTopic,string[]>>={
 en:{books:['books','literature','publishing'],science:['science','research'],nature:['nature','wildlife','climate'],art:['art','design','museum'],technology:['technology','innovation'],culture:['culture','cinema','music']},
 id:{books:['buku','sastra','penerbitan'],science:['sains','penelitian'],nature:['alam','satwa','iklim'],art:['seni','desain','museum'],technology:['teknologi','inovasi'],culture:['budaya','film','musik']},
 ja:{books:['本','文学','出版'],science:['科学','研究'],nature:['自然','野生動物','気候'],art:['芸術','デザイン','美術館'],technology:['技術','イノベーション'],culture:['文化','映画','音楽']},
 es:{books:['libros','literatura','edición'],science:['ciencia','investigación'],nature:['naturaleza','fauna','clima'],art:['arte','diseño','museo'],technology:['tecnología','innovación'],culture:['cultura','cine','música']},
 fr:{books:['livres','littérature','édition'],science:['science','recherche'],nature:['nature','faune','climat'],art:['art','design','musée'],technology:['technologie','innovation'],culture:['culture','cinéma','musique']},
 de:{books:['Bücher','Literatur','Verlag'],science:['Wissenschaft','Forschung'],nature:['Natur','Wildtiere','Klima'],art:['Kunst','Design','Museum'],technology:['Technologie','Innovation'],culture:['Kultur','Film','Musik']},
 pt:{books:['livros','literatura','publicação'],science:['ciência','pesquisa'],nature:['natureza','vida selvagem','clima'],art:['arte','design','museu'],technology:['tecnologia','inovação'],culture:['cultura','cinema','música']},
 zh:{books:['图书','文学','出版'],science:['科学','研究'],nature:['自然','野生动物','气候'],art:['艺术','设计','博物馆'],technology:['科技','创新'],culture:['文化','电影','音乐']},
 ko:{books:['책','문학','출판'],science:['과학','연구'],nature:['자연','야생동물','기후'],art:['예술','디자인','박물관'],technology:['기술','혁신'],culture:['문화','영화','음악']}
};
const wikiLanguages=new Set(['en','id','ja','es','fr','de','pt','zh','ko']);
const gdeltLanguage:Record<string,string>={en:'english',id:'indonesian',ja:'japanese',es:'spanish',fr:'french',de:'german',pt:'portuguese',zh:'chinese',ko:'korean'};
const googleNewsLocale:Record<'en'|'id'|'ja',{hl:string;gl:string;ceid:string}>={en:{hl:'en-US',gl:'US',ceid:'US:en'},id:{hl:'id',gl:'ID',ceid:'ID:id'},ja:{hl:'ja',gl:'JP',ceid:'JP:ja'}};

function cacheRead<T>(key:string,ttl:number,allowStale=false):T[]|undefined{try{const value=JSON.parse(localStorage.getItem(key)||'null');if(value&&Array.isArray(value.items)&&(allowStale||Date.now()-value.at<ttl))return value.items as T[];}catch{}return;}
function cacheWrite<T>(key:string,items:T[]){try{localStorage.setItem(key,JSON.stringify({at:Date.now(),items}));}catch{/* Feed remains available for this visit. */}}
function safeLink(value:unknown,hosts?:RegExp):string|undefined{if(typeof value!=='string'||value.length>2048)return;try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||hosts&&!hosts.test(url.hostname))return;return url.href;}catch{return;}}
function requestSignal(signal?:AbortSignal){const timeout=AbortSignal.timeout(10000);return signal?AbortSignal.any([signal,timeout]):timeout;}
function todayKey(date:Date){return `${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}`;}

/** Localized Wikimedia On-this-day feed; English is the fallback when a wiki has no feed. */
export async function loadOnThisDay(language:string,date=new Date(),signal?:AbortSignal):Promise<HomeFeedItem[]>{
 const lang=localeBase(language),key=`sela-home:on-this-day:${lang}:${date.getMonth()+1}-${date.getDate()}`;
 const cached=cacheRead<HomeFeedItem>(key,24*60*60*1000);if(cached)return cached;
 const candidates=lang==='id'?['id']:[...new Set([wikiLanguages.has(lang)?lang:'en','en'])],day=todayKey(date);
 for(const candidate of candidates){
  try{
   const response=await fetch(`https://${candidate}.wikipedia.org/api/rest_v1/feed/onthisday/selected/${day}`,{signal:requestSignal(signal),headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer'});
   if(!response.ok)continue;const data=JSON.parse(await responseText(response,1024*1024));
   const rows=Array.isArray(data.selected)?data.selected:Array.isArray(data.events)?data.events:[];
   const items:HomeFeedItem[]=rows.slice(0,8).map((row:any)=>{
    const page=Array.isArray(row.pages)?row.pages[0]:undefined;
    const url=safeLink(page?.content_urls?.desktop?.page, new RegExp(`^(?:${candidate}\\.)?wikipedia\\.org$`))||safeLink(page?.url,new RegExp(`^(?:${candidate}\\.)?wikipedia\\.org$`));
    if(!url||typeof row.text!=='string'||!row.text.trim())return;
    const image=safeLink(page?.thumbnail?.source,/^(?:upload|upload\.wikimedia)\.org$/);
    return {title:row.text.trim().slice(0,500),description:page?.title,url,source:'Wikimedia',image,year:Number.isInteger(row.year)?row.year:undefined};
   }).filter((item:HomeFeedItem|undefined):item is HomeFeedItem=>!!item);
   if(items.length){cacheWrite(key,items);return items;}
  }catch(error){if(signal?.aborted)throw error;}
 }
 return cacheRead<HomeFeedItem>(key,0,true)||[];
}

export function buildNewsUrl(topics:HomeNewsTopic[],language:string):string{
 const lang=localeBase(language),dictionary=topicWords[lang]||topicWords.en,selected=topics.filter(topic=>HOME_NEWS_TOPICS.includes(topic));
 const words=[...new Set((selected.length?selected:['books','science','nature']).flatMap(topic=>dictionary[topic]))].slice(0,18);
 // GDELT rejects short exact phrases (for example "alam", "seni", and 本).
 // Keep every term unquoted so localized short words remain searchable.
 const query=`(${words.map(word=>word.replace(/["\\()]/g,' ').trim()).filter(Boolean).join(' OR ')}) sourcelang:${gdeltLanguage[lang]||'english'}`;
 return 'https://api.gdeltproject.org/api/v2/doc/doc?'+new URLSearchParams({query,mode:'artlist',format:'json',maxrecords:'8',timespan:'7d',sort:'HybridRel'});
}

/** Google News RSS is one multilingual source; RSS2JSON is only used as a CORS bridge. */
export function buildGoogleNewsUrl(topics:HomeNewsTopic[],language:string):string{
 const lang=localeBase(language),config=googleNewsLocale[(lang in googleNewsLocale?lang:'en') as 'en'|'id'|'ja'],selected=topics.filter(topic=>HOME_NEWS_TOPICS.includes(topic));
 const words=[...new Set((selected.length?selected:['books','science','nature']).flatMap(topic=>(topicWords[lang]||topicWords.en)[topic]))].slice(0,8);
 const feed=new URL(lang==='id'?'https://news.google.com/rss':'https://news.google.com/rss/search');
 if(lang!=='id')feed.searchParams.set('q',words.join(' OR '));
 feed.searchParams.set('hl',config.hl);feed.searchParams.set('gl',config.gl);feed.searchParams.set('ceid',config.ceid);
 return 'https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(feed.href);
}

function decodeXml(value:string):string{return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#x([\da-f]+);/gi,(_m,hex:string)=>String.fromCodePoint(parseInt(hex,16))).replace(/&#(\d+);/g,(_m,num:string)=>String.fromCodePoint(Number(num))).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'");}
function rssTag(xml:string,name:string):string{const tag=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const match=new RegExp(`<(?:(?:[\\w.-]+):)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:(?:[\\w.-]+):)?${tag}\\s*>`,'i').exec(xml);return match?decodeXml(match[1]).trim():'';}
function stripMarkup(value:string):string{return value.replace(/<[^>]{0,1000}>/g,' ').replace(/\s+/g,' ').trim();}

/** Read the public ANTARA RSS feed without executing markup or expanding external XML entities. */
export function parseAntaraRss(xml:string):HomeFeedItem[]{
 if(typeof xml!=='string'||xml.length>2*1024*1024||/<!DOCTYPE|<!ENTITY/i.test(xml))return [];
 const items:HomeFeedItem[]=[];
 for(const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item\s*>/gi)){
  const row=match[1],title=stripMarkup(rssTag(row,'title')),url=safeLink(rssTag(row,'link'),/^www\.antaranews\.com$/);if(!title||!url)continue;
  const source=safeLink(rssTag(row,'source'),/^www\.antaranews\.com$/),description=stripMarkup(rssTag(row,'description')).slice(0,500);
  const enclosure=/<enclosure\b[^>]*\burl\s*=\s*(["'])(.*?)\1[^>]*>/i.exec(row)?.[2]||/<(?:[\w.-]+:)?(?:content|thumbnail)\b[^>]*\burl\s*=\s*(["'])(.*?)\1[^>]*>/i.exec(row)?.[2];
  const image=safeLink(enclosure?decodeXml(enclosure):'',/^(?:cdn|img)\.antaranews\.com$/);
  const date=rssTag(row,'pubDate');
  items.push({title:title.slice(0,300),description,url,source:source||'ANTARA',date:date||undefined,image});
  if(items.length===12)break;
 }
 return items;
}

/** Convert the documented RSS2JSON response shape without treating feed HTML as trusted markup. */
export function parseGoogleNews(value:unknown,topics:readonly HomeNewsTopic[]=HOME_NEWS_TOPICS,language='en'):HomeFeedItem[]{
 const root=value as {status?:unknown;items?:unknown},rows=Array.isArray(root?.items)?root.items:[],lang=localeBase(language),terms=(topics.length?topics:['books','science','nature']).flatMap(topic=>(topicWords[lang]||topicWords.en)[topic]).map(term=>term.toLocaleLowerCase(lang));
 const items:HomeFeedItem[]=[];
 for(const row of rows.slice(0,10)){
  if(!row||typeof row!=='object')continue;const entry=row as Record<string,unknown>,rawTitle=typeof entry.title==='string'?stripMarkup(decodeXml(entry.title)).trim():'';
  const match=rawTitle.match(/\s[-–—]\s([^\s].*)$/),publisher=match?.[1]?.trim()||'',title=(match?rawTitle.slice(0,match.index):rawTitle).trim(),url=safeLink(entry.link,/^(?:news\.)?google\.com$/);
  if(!title||!url)continue;
  const rawDescription=typeof entry.description==='string'?stripMarkup(decodeXml(entry.description)).trim():'';
  if(lang==='id'&&terms.length&&!terms.some(term=>`${title} ${rawDescription}`.toLocaleLowerCase(lang).includes(term)))continue;
  const enclosure=entry.enclosure&&typeof entry.enclosure==='object'?(entry.enclosure as Record<string,unknown>).link:undefined;
  const image=safeLink(entry.thumbnail)||safeLink(enclosure)||undefined;
  items.push({title:title.slice(0,300),description:rawDescription.slice(0,500)||undefined,url,source:typeof entry.author==='string'&&entry.author.trim()?entry.author.trim().slice(0,100):publisher.slice(0,100)||'Google News',date:typeof entry.pubDate==='string'?entry.pubDate:undefined,image});
 }
 return items;
}

async function loadGoogleNews(topics:HomeNewsTopic[],language:string,signal?:AbortSignal):Promise<HomeFeedItem[]>{
 const response=await fetch(buildGoogleNewsUrl(topics,language),{signal:requestSignal(signal),headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw Error(`Google News RSS bridge returned ${response.status}`);
 const data=JSON.parse(await responseText(response,1024*1024));if(data?.status!=='ok')throw Error('Google News RSS bridge returned an unavailable feed.');
 return parseGoogleNews(data,topics,language);
}

async function loadAntaraNews(feed='terkini',signal?:AbortSignal):Promise<HomeFeedItem[]>{
 const allowed=new Set(['terkini','humaniora','tekno','warta-bumi','lifestyle','hiburan']);if(!allowed.has(feed))throw new TypeError('Unsupported ANTARA news feed.');
 const key=`sela-home:news:antara:${feed}`,cached=cacheRead<HomeFeedItem>(key,15*60*1000);if(cached)return cached;
 const response=await fetch(`https://www.antaranews.com/rss/${feed}.xml`,{signal:requestSignal(signal),headers:{Accept:'application/rss+xml, application/xml, text/xml'},credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw Error(`ANTARA feed returned ${response.status}`);
 const label=feed==='terkini'?'Terkini':Object.values(antaraTopicFeeds).find(row=>row.path===feed)?.label||feed;
 const items=parseAntaraRss(await responseText(response,2*1024*1024)).map(item=>({...item,source:`ANTARA · ${label}`}));cacheWrite(key,items);return items;
}

async function loadAntaraTopics(topics:HomeNewsTopic[],signal?:AbortSignal):Promise<HomeFeedItem[]>{
 const selected=topics.filter(topic=>HOME_NEWS_TOPICS.includes(topic));
 const grouped=new Map<string,{path:string;label:string;topics:HomeNewsTopic[]}>();
 for(const topic of selected){const feed=antaraTopicFeeds[topic],group=grouped.get(feed.path);if(group)group.topics.push(topic);else grouped.set(feed.path,{...feed,topics:[topic]});}
 const feeds=[...grouped.values()];
 const results=await Promise.allSettled(feeds.map(feed=>loadAntaraNews(feed.path,signal)));
 const seen=new Set<string>(),items:HomeFeedItem[]=[];
 for(let i=0;i<results.length;i++){
  const result=results[i];if(result.status!=='fulfilled')continue;
  for(const item of result.value){const text=`${item.title} ${item.description||''}`.toLocaleLowerCase('id');if(!feeds[i].topics.some(topic=>topicTerms[topic].some(term=>text.includes(term))))continue;const key=item.url||item.title.toLocaleLowerCase();if(seen.has(key))continue;seen.add(key);items.push(item);}
 }
 return items.sort((a,b)=>(Date.parse(b.date||'')||0)-(Date.parse(a.date||'')||0)).slice(0,8);
}

async function loadGdeltNews(topics:HomeNewsTopic[],language:string,signal?:AbortSignal):Promise<HomeFeedItem[]>{
 const response=await fetch(buildNewsUrl(topics,language),{signal:requestSignal(signal),headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok)throw Error(`News source returned ${response.status}`);
 const data=JSON.parse(await responseText(response,1024*1024));
 return (Array.isArray(data.articles)?data.articles:[]).slice(0,8).map((row:any)=>{
  const url=safeLink(row.url);if(!url||typeof row.title!=='string'||!row.title.trim())return;
  return {title:row.title.trim().slice(0,300),url,source:typeof row.domain==='string'?row.domain.slice(0,100):'News',date:typeof row.seendate==='string'?row.seendate:undefined,image:safeLink(row.socialimage)};
 }).filter((item:HomeFeedItem|undefined):item is HomeFeedItem=>!!item);
}

function newsTimestamp(value?:string):number{
 if(!value)return 0;
 const gdelt=/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec(value);
 if(gdelt)return Date.UTC(Number(gdelt[1]),Number(gdelt[2])-1,Number(gdelt[3]),Number(gdelt[4]),Number(gdelt[5]),Number(gdelt[6]));
 const parsed=Date.parse(value);return Number.isFinite(parsed)?parsed:0;
}

function mergeNewsSources(results:PromiseSettledResult<HomeFeedItem[]>[]):HomeFeedItem[]{
 const merged=new Map<string,{item:HomeFeedItem;order:number;priority:number}>();let order=0;
 for(const result of results){if(result.status!=='fulfilled')continue;
  for(const item of result.value){
   const titleKey=item.title.toLocaleLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
   const key=titleKey||item.url.toLocaleLowerCase(),existing=merged.get(key);
   if(existing){if(!existing.item.image&&item.image)existing.item.image=item.image;if(!existing.item.description&&item.description)existing.item.description=item.description;if(!existing.item.date&&item.date)existing.item.date=item.date;continue;}
   const priority=item.source?.startsWith('ANTARA')?0:item.url.startsWith('https://news.google.com/')?1:2;
   merged.set(key,{item:{...item},order:order++,priority});
  }
 }
 return [...merged.values()].sort((a,b)=>newsTimestamp(b.item.date)-newsTimestamp(a.item.date)||a.priority-b.priority||a.order-b.order).slice(0,12).map(entry=>entry.item);
}

function filterAntaraTopics(items:HomeFeedItem[],topics:HomeNewsTopic[]):HomeFeedItem[]{
 const selected=topics.filter(topic=>HOME_NEWS_TOPICS.includes(topic));
 if(!selected.length)return [];
 return items.filter(item=>{
  const text=`${item.title} ${item.description||''}`.toLocaleLowerCase('id');
  return selected.some(topic=>topicTerms[topic].some(term=>text.includes(term)));
 });
}

/** Topic-filtered GDELT headlines. Only the selected topic terms and app language are sent. */
export async function loadTopicNews(topics:HomeNewsTopic[],language:string,signal?:AbortSignal,source:HomeNewsSource='auto',onProgress?:(items:HomeFeedItem[])=>void):Promise<HomeFeedItem[]>{
 if(!HOME_NEWS_SOURCES.includes(source))source='auto';
 const key=`sela-home:news:${localeBase(language)}:${[...topics].sort().join(',')}${source==='auto'?'':`:${source}`}`;
 const cached=cacheRead<HomeFeedItem>(key,15*60*1000);if(cached)return cached;
 const lang=localeBase(language);let items:HomeFeedItem[]=[];let failures:unknown[]=[];
 if(source==='google'||source==='gdelt'){
  try{items=source==='google'?await loadGoogleNews(topics,language,signal):await loadGdeltNews(topics,language,signal);}
  catch(error){if(signal?.aborted)throw error;failures=[error];}
 }else if(source==='antara'){
  if(lang!=='id')throw new Error('ANTARA is available when the app language is Indonesian.');
  try{items=await loadAntaraTopics(topics,signal);if(!items.length)items=filterAntaraTopics(await loadAntaraNews('terkini',signal),topics).slice(0,8);}
  catch(error){if(signal?.aborted)throw error;failures=[error];}
 }else{
  const tasks:Promise<HomeFeedItem[]>[]=[];
  if(lang==='id')tasks.push(loadAntaraTopics(topics,signal));
  tasks.push(loadGoogleNews(topics,language,signal),loadGdeltNews(topics,language,signal));
  const progress=new Map<number,PromiseSettledResult<HomeFeedItem[]>>();
  function publishProgress(){if(!onProgress)return;const settled:PromiseSettledResult<HomeFeedItem[]>[]=[];for(let index=0;index<tasks.length;index++){const result=progress.get(index);if(result)settled.push(result);}const partial=mergeNewsSources(settled);if(partial.length)onProgress(partial);}
  const results=await Promise.all(tasks.map((task,index)=>task.then(
   value=>{const result:PromiseFulfilledResult<HomeFeedItem[]>={status:'fulfilled',value};progress.set(index,result);publishProgress();return result;},
   reason=>{const result:PromiseRejectedResult={status:'rejected',reason};progress.set(index,result);publishProgress();return result;}
  )));failures=results.filter((result):result is PromiseRejectedResult=>result.status==='rejected').map(result=>result.reason);items=mergeNewsSources(results);
  if(!items.length&&lang==='id'){
   try{items=filterAntaraTopics(await loadAntaraNews('terkini',signal),topics).slice(0,8);}
   catch(error){if(signal?.aborted)throw error;}
  }
 }
 if(signal?.aborted)throw signal.reason||new DOMException('The operation was aborted.','AbortError');
 if(items.length){cacheWrite(key,items);return items;}
 const stale=cacheRead<HomeFeedItem>(key,0,true);if(stale?.length)return stale;
 if(failures.length)throw failures[0];
 return [];
}

export function readNewsTopics():HomeNewsTopic[]{try{const value=JSON.parse(localStorage.getItem('sela-home:news-topics')||'null');if(Array.isArray(value)){const valid=value.filter((item):item is HomeNewsTopic=>typeof item==='string'&&HOME_NEWS_TOPICS.includes(item as HomeNewsTopic));if(valid.length)return [...new Set(valid)].slice(0,4);}}catch{}return ['books','science','nature'];}
export function saveNewsTopics(value:unknown):HomeNewsTopic[]{const valid:HomeNewsTopic[]=Array.isArray(value)?[...new Set(value.filter((item):item is HomeNewsTopic=>typeof item==='string'&&HOME_NEWS_TOPICS.includes(item as HomeNewsTopic)))].slice(0,4):[];const result:HomeNewsTopic[]=valid.length?valid:['books','science','nature'];try{localStorage.setItem('sela-home:news-topics',JSON.stringify(result));}catch{}return result;}
const HOME_NEWS_SOURCE_KEY='sela-home:news-source';
export function readNewsSource():HomeNewsSource{try{const value=localStorage.getItem(HOME_NEWS_SOURCE_KEY);if(HOME_NEWS_SOURCES.includes(value as HomeNewsSource))return value as HomeNewsSource;}catch{}return 'auto';}
export function saveNewsSource(value:unknown):HomeNewsSource{const source=HOME_NEWS_SOURCES.includes(value as HomeNewsSource)?value as HomeNewsSource:'auto';try{localStorage.setItem(HOME_NEWS_SOURCE_KEY,source);}catch{}return source;}
