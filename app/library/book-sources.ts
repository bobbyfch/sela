import {externalBooks,externalWikiFile} from './external-catalogs.ts';
import {fetchFile} from './network.ts';
import {catalogCoverUrl} from './covers.ts';
import type {ExternalCatalogBook,ExternalCatalogPage} from './external-catalogs.ts';
type JsonRecord=Record<string,any>;
type CatalogBook={id:string;title:string;source:string;author?:string;year?:number|string;language?:string;genre?:string;rights?:string;external?:string;coverUrl?:string;coverDownloadUrl?:string;repo?:string;branch?:string;pageid?:number;url?:string;format?:string;[key:string]:unknown};
interface SearchRequest {source:string;query?:string;page?:number;continuation?:string;category?:string;collection?:string;signal?:AbortSignal}
const cache=new Map<string,{time:number;data:JsonRecord}>();
async function json(url:string,signal?:AbortSignal):Promise<JsonRecord>{
 const hit=cache.get(url);if(hit&&Date.now()-hit.time<15*60000)return hit.data;
 const response=await fetch(url,{signal,credentials:'omit'});if(!response.ok)throw Error(response.status===403||response.status===429?'Catalog limit reached. Try later.':'Catalog unavailable ('+response.status+').');
 const data=await response.json();if(data.error)throw Error(data.error.info||'Catalog unavailable');
  if(cache.size>40){const oldest=cache.keys().next().value;if(oldest)cache.delete(oldest);}cache.set(url,{time:Date.now(),data});return data;
}
function gutenbergIdFromUrl(value?:string){
 try{const url=new URL(value||'');if(url.protocol!=='https:'||url.hostname!=='www.gutenberg.org')return undefined;return url.pathname.match(/^\/ebooks\/(\d+)(?:\.html)?\/?$/)?.[1];}catch{return undefined;}
}
async function acquireGutenbergBook(book:CatalogBook,signal?:AbortSignal){
 const id=gutenbergIdFromUrl(book.external);if(!id)throw Error('This Project Gutenberg record is not valid.');
 const metadata=await json(`https://gutendex.com/books/${id}`,signal),formats=metadata.formats;
 if(!formats||typeof formats!=='object'||Array.isArray(formats))throw Error('No downloadable text formats are listed for this edition.');
 const entries=Object.entries(formats as Record<string,unknown>).filter((entry):entry is [string,string]=>typeof entry[1]==='string');
 const choices=['application/epub+zip','text/html; charset=utf-8','text/html','text/plain; charset=utf-8','text/plain'];
 const selected=choices.map(type=>entries.find(([mime])=>mime.toLowerCase()===type)).find(Boolean);
 if(!selected)throw Error('No EPUB, HTML, or plain-text edition is available for this book.');
 const [mime,url]=selected;let target:URL;try{target=new URL(url);}catch{throw Error('The listed download address is invalid.');}
 if(target.protocol!=='https:'||!/(^|\.)gutenberg\.org$/i.test(target.hostname))throw Error('The listed download address is not a Project Gutenberg file.');
 const extension=mime.includes('epub')?'epub':mime.includes('html')?'html':'txt';
 return fetchFile(target.href,book.title+'.'+extension,{signal});
}
const wiki=(params:Record<string,string>,signal?:AbortSignal)=>json('https://id.wikisource.org/w/api.php?'+new URLSearchParams({format:'json',origin:'*',...params}),signal);
export async function searchBooks({source='gitenberg',query='',page=1,continuation,category='',collection='',signal}:SearchRequest={source:'gitenberg'}):Promise<ExternalCatalogPage&{continuation?:string}>{
 if(!['wikisource','gitenberg'].includes(source))return externalBooks({source,query,page,category,collection,signal});
 if(source==='wikisource'){
  const categories:Record<string,string>={fiction:'Kategori:Novel',poetry:'Kategori:Puisi','short-stories':'Kategori:Cerita pendek'};
  const browseCategory=categories[category];
  const data=await wiki(browseCategory?{action:'query',list:'categorymembers',cmtitle:browseCategory,cmnamespace:'0',cmlimit:'24',...(continuation?{cmcontinue:continuation}:{})}:query?{action:'query',list:'search',srnamespace:'0',srsearch:query,srlimit:'24',sroffset:String((page-1)*24)}:{action:'query',list:'categorymembers',cmtitle:'Kategori:Novel',cmnamespace:'0',cmlimit:'24',...(continuation?{cmcontinue:continuation}:{})},signal);
  const rows:JsonRecord[]=(data.query?.search||data.query?.categorymembers||[]).filter((b:JsonRecord)=>!query||String(b.title||'').toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return {books:rows.map((b:JsonRecord)=>({id:'ws-'+b.pageid,title:String(b.title||''),source,author:'',language:'id',genre:browseCategory?.replace('Kategori:','')||'Wikisumber',rights:'Original work: see source. Wikisource contributions: CC BY-SA.',pageid:Number(b.pageid)})),next:browseCategory?!!data.continue?.cmcontinue:query?data.continue?.sroffset!=null:data.continue?.cmcontinue!=null,continuation:data.continue?.cmcontinue,total:data.query?.searchinfo?.totalhits};
 }
 const q=(query.replace(/[:<>]/g,' ').slice(0,100)+' user:GITenberg').trim();
 const data=await json('https://api.github.com/search/repositories?'+new URLSearchParams({q,per_page:'24',page:String(page)}),signal);
  return {books:(data.items||[]).filter((b:JsonRecord)=>b.owner?.login?.toLowerCase()==='gitenberg'&&!/\.github\.com$/i.test(String(b.name||''))).map((b:JsonRecord)=>{
  const description=String(b.description||'').replace(/\s+/g,' ').replace(/ is a Project Gutenberg book.*$/,'');const split=description.lastIndexOf(' by '),gutenbergId=b.name.match(/_(\d+)$/)?.[1];
  return {id:b.id,title:split>=0?description.slice(0,split):b.name.replace(/_\d+$/,'').replace(/-/g,' '),author:split>=0?description.slice(split+4):'',source,repo:b.name,branch:b.default_branch,language:'',genre:'Project Gutenberg',rights:'Project Gutenberg edition; public domain in the US. Check local copyright.',coverUrl:gutenbergId?catalogCoverUrl(`https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg`):undefined};
 }),next:page*24<Math.min(data.total_count||0,1000),total:data.total_count};
}
export async function acquireBook(book:CatalogBook,{signal}: {signal?:AbortSignal}={}){
 if(book.source.startsWith('wiki-')){if(typeof book.pageid!=='number')throw Error('Invalid book identifier.');return externalWikiFile({source:book.source,title:book.title,pageid:book.pageid},signal);}
 if(book.url)return fetchFile(book.url,book.title+'.'+(book.format||'txt'),{signal});
 if(gutenbergIdFromUrl(book.external))return acquireGutenbergBook(book,signal);
 if(book.source==='wikisource'){if(typeof book.pageid!=='number')throw Error('Invalid book identifier.');return acquireWiki(book as CatalogBook&{pageid:number},signal);}
 const repo=book.repo;if(typeof repo!=='string'||!/^[\w.-]+$/.test(repo))throw Error('Invalid book identifier.');
 const files=await json(`https://api.github.com/repos/GITenberg/${encodeURIComponent(repo)}/contents/`,signal);
 const file=Array.isArray(files)&&files.find(f=>f.type==='file'&&/\.txt$/i.test(f.name)&&!/^readme|license/i.test(f.name));
 if(!file||!file.download_url||new URL(file.download_url).hostname!=='raw.githubusercontent.com')throw Error('This edition has no readable text file.');
 return fetchFile(file.download_url,book.title+'.txt',{signal});
}
async function acquireWiki(book:CatalogBook&{pageid:number},signal?:AbortSignal){
 const root=await wiki({action:'parse',pageid:String(book.pageid),prop:'text|displaytitle'},signal);
 if(!root.parse?.text?.['*'])throw Error('This edition has no readable text.');
 const chapters=[{title:book.title,html:root.parse.text['*']}];
 const listing=await wiki({action:'query',list:'allpages',apprefix:book.title+'/',aplimit:'100'},signal);
 if(listing.continue)throw Error('This edition has more than 100 sections; import an original EPUB instead.');
 const index=new DOMParser().parseFromString(root.parse.text['*'],'text/html'),order=new Map();
 for(const anchor of index.querySelectorAll('a[title]')){const title=anchor.getAttribute('title');if(title?.startsWith(book.title+'/')&&!order.has(title))order.set(title,order.size);}
 const pages=[...(listing.query?.allpages||[])].sort((a,b)=>(order.get(a.title)??Infinity)-(order.get(b.title)??Infinity)||a.title.localeCompare(b.title,'id',{numeric:true}));
 for(const page of pages){const part=await wiki({action:'parse',pageid:String(page.pageid),prop:'text'},signal);if(part.parse?.text?.['*'])chapters.push({title:page.title.slice(book.title.length+1),html:part.parse.text['*']});}
 // Remove navigation, scripts and styling before the reader's second sanitizer.
 let size=0;const body=chapters.map(chapter=>{
  const doc=new DOMParser().parseFromString(chapter.html,'text/html');doc.querySelectorAll('script,style,iframe,form,button,input,nav,.ws-noexport,.noprint,.mw-editsection,.header,.ws-header,.ambox,.navbox').forEach(n=>n.remove());
  doc.querySelectorAll('img,svg').forEach(n=>n.remove());
  for(const el of doc.querySelectorAll('*'))for(const attr of [...el.attributes])if(attr.name!=='id')el.removeAttribute(attr.name);
  const h=document.createElement('h1');h.textContent=chapter.title;doc.body.prepend(h);size+=doc.body.innerHTML.length;if(size>16*1048576)throw Error('Edition exceeds safe text import size.');return doc.body.innerHTML;
 }).join('<hr>');
 const credit=document.createElement('p');credit.textContent='Source: Wikisumber bahasa Indonesia — '+book.title+'. Original work rights are listed at the source; contributions licensed CC BY-SA. Text is transcribed by contributors and may contain incomplete sections.';
 const a=document.createElement('a');a.href='https://id.wikisource.org/?curid='+book.pageid;a.textContent='Source and revision history';credit.append(' ',a);
 return new File(['<!doctype html><html lang="id"><meta charset="utf-8"><body>',body,credit.outerHTML,'</body></html>'],book.title+'.html',{type:'text/html'});
}
