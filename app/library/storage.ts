import type {LibraryBook, RestoredBook} from './models.ts';
import {detectBookFormat} from './file-format.ts';
interface StoredAsset {id:string;bytes?:ArrayBuffer;type?:string;blob?:Blob}
interface StoredCollection {name:string}
let pending: Promise<IDBDatabase> | undefined;
async function database(): Promise<IDBDatabase>{
 if(!pending)pending=new Promise<IDBDatabase>((resolve,reject)=>{
  const req=indexedDB.open('sela-private-library',3);
  req.onupgradeneeded=()=>{for(const [name,key] of [['books','id'],['files','id'],['collections','name'],['assets','id']])if(!req.result.objectStoreNames.contains(name))req.result.createObjectStore(name,{keyPath:key});};
  req.onsuccess=()=>{req.result.onversionchange=()=>{req.result.close();pending=undefined;};resolve(req.result);};
  req.onerror=()=>{pending=undefined;reject(req.error);};
  req.onblocked=()=>{pending=undefined;reject(new Error('Close other Sela tabs, then try again.'));};
 });return pending;
}
export async function listBooks(): Promise<LibraryBook[]>{const db=await database();return new Promise<LibraryBook[]>((resolve,reject)=>{const r=db.transaction('books').objectStore('books').getAll() as IDBRequest<LibraryBook[]>;r.onsuccess=()=>resolve(r.result.map((book:LibraryBook)=>({...book,cover:book.coverBytes?new Blob([book.coverBytes],{type:book.coverType}):book.cover})));r.onerror=()=>reject(r.error);});}
export async function getFile(id: string): Promise<Blob | undefined>{const db=await database();return new Promise<Blob | undefined>((resolve,reject)=>{const r=db.transaction('files').objectStore('files').get(id) as IDBRequest<{bytes?:ArrayBuffer;type?:string;blob?:Blob}|undefined>;r.onsuccess=()=>resolve(r.result?.bytes?new Blob([r.result.bytes],{type:r.result.type}):r.result?.blob);r.onerror=()=>reject(r.error);});}
export async function getAsset(id:string):Promise<Blob|undefined>{const db=await database();return new Promise<Blob|undefined>((resolve,reject)=>{const request=db.transaction('assets').objectStore('assets').get(id) as IDBRequest<StoredAsset|undefined>;request.onsuccess=()=>{const asset=request.result;if(asset?.bytes)return resolve(new Blob([asset.bytes],{type:asset.type||'application/octet-stream'}));resolve(asset?.blob);};request.onerror=()=>reject(request.error);});}
export async function setAsset(id:string,blob:Blob|null):Promise<void>{const bytes=blob?await blob.arrayBuffer():null,db=await database();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('assets','readwrite'),store=tx.objectStore('assets');if(blob)store.put({id,bytes,type:blob.type,size:blob.size,updated:Date.now()});else store.delete(id);tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Could not save this image. Free browser storage and retry.'));});}
export async function updateBook(id:string,values:Partial<LibraryBook>):Promise<void>{const db=await database();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('books','readwrite'),store=tx.objectStore('books'),request=store.get(id) as IDBRequest<LibraryBook|undefined>;let failure:Error|undefined;request.onsuccess=()=>{if(!request.result){failure=Error('Book no longer exists on this shelf.');tx.abort();return;}const {id:ignored,...patch}=values;store.put({...request.result,...patch});};tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(failure||tx.error);});}
export async function writeBook(book: LibraryBook,blob?: Blob,remove=false,bytes?: ArrayBuffer){
 // Byte buffers avoid inconsistent IndexedDB Blob persistence on some WebKit hosts.
 const stored={...book};if(book.cover){stored.coverBytes=await book.cover.arrayBuffer();stored.coverType=book.cover.type;delete stored.cover;}
 const file=blob?{id:book.id,bytes:bytes||await blob.arrayBuffer(),type:blob.type}:null;
  const db=await database();return new Promise<void>((resolve,reject)=>{
 const tx=db.transaction(['books','files'],'readwrite');
 if(remove){tx.objectStore('books').delete(book.id);tx.objectStore('files').delete(book.id);}
 else{tx.objectStore('books').put(stored);if(file)tx.objectStore('files').put(file);}
  tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Local storage failed. Export books or free browser storage.'));
});}
export async function importBook(file: File){
 if(!file.size||file.size>64*1048576)throw Error('Choose a non-empty book up to 64 MiB.');
 const data=await file.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
 const books=await listBooks();const existing=books.find(book=>book.id===hash);if(existing)return {book:existing,duplicate:true};
 const format=await detectBookFormat(file,data);
 const book: LibraryBook={id:hash,name:file.name.replace(/\.[^.]+$/,''),filename:file.name,format,size:file.size,saved:Date.now(),opened:0};
 await writeBook(book,file,false,data);return {book,duplicate:false};
}

// One transaction: validated restores either finish together or leave the shelf intact.
export async function restoreBooks(records: RestoredBook[],collections: string[]=[]){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction(['books','files','collections'],'readwrite');for(const name of collections)tx.objectStore('collections').put({name});for(const {book,bytes,type} of records){tx.objectStore('books').put(book);tx.objectStore('files').put({id:book.id,bytes,type});}tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Restore failed; free browser storage and retry.'));});}

export function collectionName(value:unknown):string{if(typeof value!=='string'||!value.trim()||value.trim().length>40)throw Error('Use a collection name of 1–40 characters.');return value.trim();}
export async function listCollections(): Promise<string[]>{const db=await database();return new Promise<string[]>((resolve,reject)=>{const tx=db.transaction(['books','collections']);const books=tx.objectStore('books').getAll() as IDBRequest<LibraryBook[]>,names=tx.objectStore('collections').getAll() as IDBRequest<StoredCollection[]>;tx.oncomplete=()=>resolve([...new Set([...names.result.map((n:StoredCollection)=>n.name),...books.result.flatMap((b:LibraryBook)=>b.tags||[])])].sort((a,b)=>a.localeCompare(b)));tx.onerror=tx.onabort=()=>reject(tx.error);});}
// Read and write membership in one transaction so collection edits never replace
// newer progress, covers or files from a stale UI snapshot.
interface ChangeCollectionRequest {action:string;name?:string;next?:string|string[];ids?:string[];from?:string}
export async function changeCollection({action,name,next,ids=[],from}:ChangeCollectionRequest):Promise<void>{
 if(!['create','rename','delete','add','remove','move','replace'].includes(action))throw Error('Invalid collection operation');
  const targetName=action==='replace'?undefined:collectionName(name);
  const nextName=action==='rename'?collectionName(typeof next==='string'?next:undefined):undefined;
  const sourceName=action==='move'?collectionName(from):undefined;
  const replacements=action==='replace'?[...new Set((Array.isArray(next)?next:[]).map(collectionName))]:[];
 if(replacements.length>30)throw Error('Choose up to 30 collections per book.');
  const db=await database();return new Promise<void>((resolve,reject)=>{
  const tx=db.transaction(['books','collections'],'readwrite'),books=tx.objectStore('books'),registry=tx.objectStore('collections');let failure:unknown;
  const all=books.getAll() as IDBRequest<LibraryBook[]>,known=registry.getAll() as IDBRequest<StoredCollection[]>;let ready=0;
 function update(){if(++ready!==2)return;try{
 const names=new Set([...known.result.map(n=>n.name),...all.result.flatMap(b=>b.tags||[])]);
  if((action==='create'&&names.has(targetName!))||(action==='rename'&&targetName!==nextName&&names.has(nextName!)))throw Error('A collection with that name already exists.');
  if(['rename','delete'].includes(action)&&!names.has(targetName!))throw Error('Collection no longer exists.');
  const added=['create','add','move'].includes(action)?[targetName!]:replacements;
 if(names.size<=200&&new Set([...names,...added]).size>200)throw Error('Up to 200 collections are supported.');
 const chosen=new Set(ids);if(ids.length&&ids.some(id=>!all.result.some(b=>b.id===id)))throw Error('A selected book is no longer on this shelf.');
 for(const book of all.result){const tags=new Set(book.tags||[]);let changed=false;
  if(action==='rename'&&tags.delete(targetName!)){tags.add(nextName!);changed=true;}
  if(action==='delete'&&tags.delete(targetName!))changed=true;
 if(chosen.has(book.id)){
 if(action==='replace'){tags.clear();replacements.forEach(n=>tags.add(n));changed=true;}
  if(action==='add'){tags.add(targetName!);changed=true;}
  if(action==='remove')changed=tags.delete(targetName!);
  if(action==='move'&&tags.delete(sourceName!)){tags.add(targetName!);changed=true;}
 }
 if(tags.size>30)throw Error('Choose up to 30 collections per book.');
 if(changed)books.put({...book,tags:[...tags]});
 }
  if(['create','add','move'].includes(action))registry.put({name:targetName!});
 if(action==='replace')replacements.forEach(name=>registry.put({name}));
  if(action==='rename'){registry.delete(targetName!);registry.put({name:nextName!});}
  if(action==='delete')registry.delete(targetName!);
 }catch(e){failure=e;tx.abort();}}
 all.onsuccess=update;known.onsuccess=update;
  tx.oncomplete=()=>resolve();tx.onerror=tx.onabort=()=>reject(failure||tx.error||Error('Collection could not be saved.'));
 });
}
