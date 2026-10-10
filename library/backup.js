import {cleanMetadata} from '../dist/js/sela.metadata.js';
import {listBooks,getFile,restoreBooks} from './storage.js';
const prefix='sela-library:';
const encoder=new TextEncoder();
const formats=['pdf','epub','cbz','txt','md','html','fb2'];
const readingKeys=['page','marks','notes','location','preferences','highlights'];
export async function exportLibrary(){
  const {createBackupArchive}=await import('../dist/js/sela.archive.js');
  const entries={},books=[];let total=0;
  for(const book of await listBooks()){
    const file=await getFile(book.id);if(!file)throw Error('Missing book: '+book.name);
    if((total+=file.size)>120*1048576)throw Error('Backup supports up to 120 MiB of book files per export. Export originals individually for a larger shelf.');
    entries[`books/${book.id}.${book.format}`]=new Uint8Array(await file.arrayBuffer());
    const {cover,coverBytes,coverType,...metadata}=book;
    const reading={};for(const suffix of readingKeys){const value=localStorage.getItem(prefix+book.id+':'+suffix);if(value!==null)reading[suffix]=value;}
    books.push({metadata,reading});
  }
  const preferences=localStorage.getItem(prefix+'preferences');
  if(books.length>200)throw Error('Backup supports up to 200 books per archive.');
  entries['sela.json']=encoder.encode(JSON.stringify({type:'sela-library',version:1,books,preferences}));
  if(entries['sela.json'].length>8*1048576)throw Error('Reading metadata exceeds 8 MiB. Export notes separately.');
  return new Blob([createBackupArchive(entries)],{type:'application/zip'});
}
function validateReading(reading){
  if(!reading||typeof reading!=='object'||Array.isArray(reading))throw Error('Invalid reading data');
  const result={};for(const [key,value] of Object.entries(reading)){
    if(!readingKeys.includes(key)||typeof value!=='string'||value.length>1048576)throw Error('Invalid reading data');
    const data=JSON.parse(value);
    if(key==='page'&&(!Number.isInteger(data)||data<1))throw Error('Invalid page');
    if(key==='marks'&&(!Array.isArray(data)||data.length>2000||data.some(n=>!Number.isInteger(n)||n<1)))throw Error('Invalid bookmarks');
    if(['notes','location','preferences','highlights'].includes(key)&&(!data||typeof data!=='object'||Array.isArray(data)))throw Error('Invalid reading data');
    if(key==='highlights'){const entries=Object.entries(data);if(entries.length>2000||entries.some(([page,quotes])=>!Number.isInteger(+page)||+page<1||!Array.isArray(quotes)||quotes.length>100||quotes.some(q=>typeof q!=='string'||q.length>10000)))throw Error('Invalid highlights');}
    if(key==='notes'){const notes=Object.entries(data);if(notes.length>2000||notes.some(([page,note])=>!Number.isInteger(+page)||+page<1||typeof note!=='string'||note.length>10000))throw Error('Invalid notes');}
    result[key]=value;
  }return result;
}
export async function restoreLibrary(file){
  if(file.size>128*1048576)throw Error('Backup exceeds 128 MiB');
  const {readBackupArchive}=await import('../dist/js/sela.archive.js');
  const entries=readBackupArchive(new Uint8Array(await file.arrayBuffer()));
  if(!entries['sela.json']||entries['sela.json'].length>8*1048576)throw Error('Invalid Sela backup');
  const manifest=JSON.parse(new TextDecoder().decode(entries['sela.json']));
  if(manifest.type!=='sela-library'||manifest.version!==1||!Array.isArray(manifest.books)||manifest.books.length>200)throw Error('Invalid Sela backup');
  const existing=new Set((await listBooks()).map(book=>book.id)),seen=new Set(),records=[],reading=[];
  for(const item of manifest.books){
    const b=item.metadata;
    if(!b||!/^[a-f0-9]{64}$/.test(b.id)||seen.has(b.id)||!formats.includes(b.format)||typeof b.name!=='string'||b.name.length>180||typeof b.filename!=='string'||b.filename.length>255)throw Error('Invalid book metadata');
    seen.add(b.id);const bytes=entries[`books/${b.id}.${b.format}`];if(!bytes||!bytes.length)throw Error('Missing book file');
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
    if(hash!==b.id)throw Error('Book integrity check failed');
    const validated=validateReading(item.reading);
    // Merge new books; existing books and their newer notes are kept intact.
    if(existing.has(b.id))continue;
    const book={id:b.id,format:b.format,filename:b.filename,name:b.name,size:bytes.length,saved:Number(b.saved)||Date.now(),opened:Number(b.opened)||0,favorite:!!b.favorite,completed:!!b.completed,tags:Array.isArray(b.tags)?b.tags.filter(t=>typeof t==='string').slice(0,30).map(t=>t.slice(0,40)):[]};
    book.metadata=cleanMetadata(b.metadata);book.progress=Math.max(0,Number(b.progress)||0);book.total=Math.max(0,Number(b.total)||0);
    records.push({book,bytes:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),type:'application/octet-stream'});reading.push({id:b.id,values:validated});
  }
  let defaults=null;if(manifest.preferences!==null&&manifest.preferences!==undefined){if(typeof manifest.preferences!=='string'||manifest.preferences.length>10000)throw Error('Invalid defaults');defaults=JSON.parse(manifest.preferences);if(!defaults||typeof defaults!=='object'||Array.isArray(defaults))throw Error('Invalid defaults');}
  await restoreBooks(records);
  let readingSaved=true;try{for(const entry of reading)for(const [suffix,value] of Object.entries(entry.values))localStorage.setItem(prefix+entry.id+':'+suffix,value);if(defaults&&!localStorage.getItem(prefix+'preferences'))localStorage.setItem(prefix+'preferences',JSON.stringify(defaults));}catch{readingSaved=false;}
  return {added:records.length,kept:existing.size,readingSaved};
}
