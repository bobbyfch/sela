type BookFormat='epub'|'pdf'|'cbz'|'txt'|'html'|'fb2';
type JsonRecord=Record<string,unknown>;
interface OpdsLink {href?:unknown;rel?:unknown;type?:unknown}
interface OpdsBook {id:string;title:string;author:string;[key:string]:unknown}
interface OpdsOptions {signal?:AbortSignal;query?:string;headers?:Record<string,string>}

const types:Record<string,BookFormat>={
 'application/epub+zip':'epub','application/pdf':'pdf','application/x-cbz':'cbz',
 'application/vnd.comicbook+zip':'cbz','text/plain':'txt','text/html':'html',
 'application/x-fictionbook+xml':'fb2'
};
function isRecord(value:unknown):value is JsonRecord{return !!value&&typeof value==='object'&&!Array.isArray(value);}
function records(value:unknown):JsonRecord[]{return Array.isArray(value)?value.filter(isRecord):[];}
function strings(value:unknown):string[]{return Array.isArray(value)?value.filter((item):item is string=>typeof item==='string'):[];}
function displayNames(value:unknown):string{return Array.isArray(value)?value.map(item=>typeof item==='string'?item:isRecord(item)&&typeof item.name==='string'?item.name:'').filter(Boolean).join(', '):typeof value==='string'?value:'';}
function safe(value:unknown,base?:string):string|null{if(typeof value!=='string'||!value)return null;try{const url=new URL(value,base);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}}
function value(parent:Element|Document,name:string):string{return parent.getElementsByTagNameNS('*',name)[0]?.textContent?.trim()||'';}
function hasRelation(link:OpdsLink,relation:string):boolean{return [...strings(link.rel),...(typeof link.rel==='string'?[link.rel]:[])].includes(relation);}
function acquisition(links:unknown,url:string):OpdsLink|undefined{
 return records(links).find(link=>typeof link.type==='string'&&!!types[link.type]&&
  ['http://opds-spec.org/acquisition','http://opds-spec.org/acquisition/open-access'].some(relation=>hasRelation(link,relation))&&
  !!safe(link.href,url));
}

export async function opdsBooks(url:string,{signal,query='',headers={}}:OpdsOptions={}):Promise<{books:OpdsBook[];next:boolean;continuation:string|null}>{
 const target=safe(url);if(!target)throw Error('Use an HTTPS catalog URL without credentials.');
 const response=await fetch(target,{signal,headers,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('Catalog unavailable ('+response.status+').');
 if(Number(response.headers.get('content-length'))>2*1048576)throw Error('Catalog exceeds 2 MiB.');let body:string;
 if(response.body?.getReader){const reader=response.body.getReader(),decoder=new TextDecoder();let size=0;body='';try{for(;;){const {done,value:chunk}=await reader.read();if(done)break;if((size+=chunk.byteLength)>2*1048576)throw Error('Catalog exceeds 2 MiB.');body+=decoder.decode(chunk,{stream:true});}body+=decoder.decode();}catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}}
 else{body=await response.text();if(body.length>2*1048576)throw Error('Catalog exceeds 2 MiB.');}
 const books:OpdsBook[]=[];let continuation:string|null=null;
 if(body.trimStart().startsWith('{')){
  const feed:unknown=JSON.parse(body);if(!isRecord(feed)||(!feed.metadata&&!feed.publications&&!feed.navigation))throw Error('Not an OPDS catalog.');
  for(const publication of records(feed.publications).slice(0,100)){
   const link=acquisition(publication.links,target);if(!link)continue;const meta=isRecord(publication.metadata)?publication.metadata:{};const href=safe(link.href,target);if(!href)continue;
   const format=types[String(link.type)];books.push({id:typeof meta.identifier==='string'?meta.identifier:href,title:String(meta.title||'Untitled'),author:displayNames(meta.author),description:String(meta.description||''),language:strings(meta.language)[0]||String(meta.language||''),year:String(meta.published||'').slice(0,4),format,url:href,genre:'OPDS',rights:String(meta.rights||''),source:'opds'});
  }
  for(const nav of records(feed.navigation).slice(0,32)){const href=safe(nav.href,target);if(href)books.push({id:href,title:String(nav.title||'Collection'),author:'',genre:'OPDS',navigation:href,source:'opds'});}
  const next=records(feed.links).find(link=>hasRelation(link,'next'));continuation=next?safe(next.href,target):null;
 }else{
  const feed=new DOMParser().parseFromString(body,'application/xml');if(feed.querySelector('parsererror')||feed.documentElement.localName!=='feed')throw Error('Not an OPDS catalog.');
  for(const entry of Array.from(feed.getElementsByTagNameNS('*','entry')).slice(0,100)){
   const links:OpdsLink[]=Array.from(entry.getElementsByTagNameNS('*','link')).map(link=>({href:link.getAttribute('href'),rel:link.getAttribute('rel'),type:link.getAttribute('type')}));
   const link=acquisition(links,target),title=value(entry,'title'),author=value(entry,'name');
   if(link){const href=safe(link.href,target);if(href)books.push({id:value(entry,'id')||href,title,author,format:types[String(link.type)],url:href,genre:'OPDS',rights:value(entry,'rights'),language:value(entry,'language'),description:value(entry,'summary')||value(entry,'content'),source:'opds'});}
   else{const nav=links.find(link=>typeof link.type==='string'&&/application\/(atom\+xml|opds\+json)/.test(link.type)&&typeof link.rel==='string'&&['subsection','http://opds-spec.org/sort/new','http://opds-spec.org/sort/popular'].includes(link.rel));const href=nav?safe(nav.href,target):null;if(nav&&href)books.push({id:value(entry,'id')||href,title,author:'',genre:'OPDS',navigation:href,source:'opds'});}
  }
  const next=Array.from(feed.documentElement.children).find(link=>link.localName==='link'&&link.getAttribute('rel')==='next');continuation=next?safe(next.getAttribute('href'),target):null;
 }
 const needle=query.toLocaleLowerCase();return {books:books.filter(book=>(book.title+' '+book.author).toLocaleLowerCase().includes(needle)),next:!!continuation,continuation};
}
