import {extractArchive, type ArchiveFiles} from './archive-codec.ts';
import {extractArchiveAsync} from './archive-client.ts';
const decode=data=>new TextDecoder().decode(data||new Uint8Array());
function xml(data){if(!data)throw Error('Missing office document content');const doc=new DOMParser().parseFromString(decode(data),'application/xml');if(doc.querySelector('parsererror'))throw Error('Invalid office document XML');return doc;}
const descendants=(el,name)=>[...el.getElementsByTagNameNS('*',name)];
// Reflow text, not a print-layout engine. Macros, embedded objects and scripts never run.
export function officeText(bytes: Uint8Array, format: string){ return renderOffice(extractArchive(bytes),format); }
export async function officeTextAsync(bytes: Uint8Array, format: string, signal?: AbortSignal){return renderOffice(await extractArchiveAsync(bytes,signal),format);}
function renderOffice(files: ArchiveFiles,format: string){
 const result=document.createElement('article');
 if(format==='docx'){
  const doc=xml(files['word/document.xml']),body=descendants(doc,'body')[0];if(!body)throw Error('Invalid DOCX body');
  for(const paragraph of descendants(body,'p')){
   const style=descendants(paragraph,'pStyle')[0]?.getAttributeNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main','val')||'';
   const heading=/^Heading([1-6])$/i.exec(style);const node=document.createElement(heading?'h'+heading[1]:'p');
   for(const run of descendants(paragraph,'r')){const value=[...run.childNodes].map(n=>n.localName==='t'?n.textContent:n.localName==='br'?'\n':n.localName==='tab'?'\t':'').join('');if(!value)continue;let inline: Node=document.createTextNode(value);if(descendants(run,'b').length){const b=document.createElement('strong');b.append(inline);inline=b;}if(descendants(run,'i').length){const i=document.createElement('em');i.append(inline);inline=i;}node.append(inline);}
   if(node.textContent.trim())result.append(node);
  }
 }else{
  if(decode(files.mimetype).trim()!=='application/vnd.oasis.opendocument.text')throw Error('Invalid ODT mimetype');
  const doc=xml(files['content.xml']);const text=descendants(doc,'text')[0];if(!text)throw Error('Invalid ODT body');
  for(const paragraph of [...text.querySelectorAll('*')].filter(n=>['p','h'].includes(n.localName))){const level=Number(paragraph.getAttributeNS('urn:oasis:names:tc:opendocument:xmlns:text:1.0','outline-level'))||1;const node=document.createElement(paragraph.localName==='h'?'h'+Math.max(1,Math.min(6,level)):'p');node.textContent=paragraph.textContent;if(node.textContent.trim())result.append(node);}
 }
 if(!result.textContent.trim())throw Error('Office document contains no readable text');
 const notice=document.createElement('p');notice.textContent='Sela text view · Original layout, images and embedded objects are not reproduced. Export the original to keep the complete document.';result.prepend(notice);
 return '<!doctype html><html><body>'+result.innerHTML+'</body></html>';
}
