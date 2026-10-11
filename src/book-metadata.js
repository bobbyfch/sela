const limits={title:180,author:300,publisher:200,publicationDate:40,year:4,language:50,identifier:250,isbn:40,description:4000,subjects:500,rights:500,series:180,edition:100,creationDate:40};
export function cleanMetadata(value={}){
 const result={};if(!value||typeof value!=='object'||Array.isArray(value))return result;
 for(const [key,limit]of Object.entries(limits)){const raw=value[key];if(typeof raw==='string'||typeof raw==='number')result[key]=String(raw).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,limit);}
 if(result.year&&!/^\d{4}$/.test(result.year))delete result.year;
 if(!result.year&&/^\d{4}(?:-|$)/.test(result.publicationDate||''))result.year=result.publicationDate.slice(0,4);
 if(Number.isInteger(value.pageCount)&&value.pageCount>0)result.pageCount=Math.min(value.pageCount,1000000);
 return result;
}
function plain(value){if(!value)return '';const doc=new DOMParser().parseFromString(String(value).slice(0,20000),'text/html');doc.querySelectorAll('script,style').forEach(n=>n.remove());return doc.body.textContent.trim();}
export function epubMetadata(opf){
 const root=Array.from(opf.getElementsByTagNameNS('*','metadata'))[0];if(!root)return {};
 const get=name=>Array.from(root.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/',name)).map(n=>n.textContent.trim()).filter(Boolean);
 const identifier=get('identifier');const isbnNode=Array.from(root.getElementsByTagNameNS('*','identifier')).find(n=>Array.from(n.attributes).some(a=>a.localName==='scheme'&&/isbn/i.test(a.value))||/^urn:isbn:|^(?:97[89][ -]?)?\d[\d -]{8,16}[\dX]$/i.test(n.textContent.trim()));const meta=Array.from(root.getElementsByTagNameNS('*','meta'));return cleanMetadata({title:get('title')[0],author:get('creator').join(', '),publisher:get('publisher')[0],publicationDate:get('date')[0],language:get('language').join(', '),identifier:identifier.join(', '),isbn:(isbnNode?.textContent||identifier.find(v=>/isbn/i.test(v)))?.trim().replace(/^urn:isbn:/i,''),description:plain(get('description')[0]),subjects:get('subject').join(', '),rights:get('rights')[0],series:meta.find(n=>n.getAttribute('name')==='calibre:series')?.getAttribute('content')||meta.find(n=>n.getAttribute('property')==='belongs-to-collection')?.textContent});
}
export function comicMetadata(doc){const get=name=>doc.getElementsByTagNameNS('*',name)[0]?.textContent;return cleanMetadata({title:get('Title'),author:[get('Writer'),get('Penciller')].filter(Boolean).join(', '),publisher:get('Publisher'),year:get('Year'),language:get('LanguageISO'),description:plain(get('Summary')),subjects:get('Genre'),series:get('Series'),edition:get('Number'),isbn:get('GTIN')});}
export function fb2Metadata(doc){const get=name=>doc.getElementsByTagNameNS('*',name)[0]?.textContent;const author=Array.from(doc.getElementsByTagNameNS('*','title-info'))[0]?.querySelector('author');return cleanMetadata({title:get('book-title'),author:author?Array.from(author.children).filter(n=>/^(first-name|middle-name|last-name|nickname)$/.test(n.localName)).map(n=>n.textContent.trim()).filter(Boolean).join(' '):'',publisher:get('publisher'),year:get('year'),language:get('lang'),isbn:get('isbn'),description:get('annotation'),subjects:get('genre')});}
export async function readBookMetadata(book,overrides={}){
 let extracted=book?.metadata||book?.pdf?.metadata||{};
 if(book?.pdf?.getMetadata){try{const {info={},metadata}=await book.pdf.getMetadata();const x=key=>{const value=metadata?.get?.(key);return Array.isArray(value)?value.join(', '):value;};extracted={...extracted,title:info.Title||x('dc:title'),author:info.Author||x('dc:creator'),description:info.Subject||plain(x('dc:description')),subjects:info.Keywords,publisher:x('dc:publisher'),language:x('dc:language'),identifier:x('dc:identifier'),publicationDate:x('dc:date'),creationDate:info.CreationDate};}catch{/* Metadata is optional; reading must still work. */}}
 return {...cleanMetadata(extracted),...cleanMetadata(overrides),pageCount:book?.numPages||overrides.pageCount};
}
