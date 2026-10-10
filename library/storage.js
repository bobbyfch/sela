let pending;
async function database(){
 if(!pending)pending=new Promise((resolve,reject)=>{
  const req=indexedDB.open('sela-private-library',1);
  req.onupgradeneeded=()=>{req.result.createObjectStore('books',{keyPath:'id'});req.result.createObjectStore('files',{keyPath:'id'});};
  req.onsuccess=()=>{req.result.onversionchange=()=>{req.result.close();pending=null;};resolve(req.result);};
  req.onerror=()=>{pending=null;reject(req.error);};
  req.onblocked=()=>{pending=null;reject(new Error('Close other Sela tabs, then try again.'));};
 });return pending;
}
export async function listBooks(){const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction('books').objectStore('books').getAll();r.onsuccess=()=>resolve(r.result.map(book=>({...book,cover:book.coverBytes?new Blob([book.coverBytes],{type:book.coverType}):book.cover})));r.onerror=()=>reject(r.error);});}
export async function getFile(id){const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction('files').objectStore('files').get(id);r.onsuccess=()=>resolve(r.result?.bytes?new Blob([r.result.bytes],{type:r.result.type}):r.result?.blob);r.onerror=()=>reject(r.error);});}
export async function writeBook(book,blob,remove=false){
 // Byte buffers avoid inconsistent IndexedDB Blob persistence on some WebKit hosts.
 const stored={...book};if(book.cover){stored.coverBytes=await book.cover.arrayBuffer();stored.coverType=book.cover.type;delete stored.cover;}
 const file=blob?{id:book.id,bytes:await blob.arrayBuffer(),type:blob.type}:null;
 const db=await database();return new Promise((resolve,reject)=>{
 const tx=db.transaction(['books','files'],'readwrite');
 if(remove){tx.objectStore('books').delete(book.id);tx.objectStore('files').delete(book.id);}
 else{tx.objectStore('books').put(stored);if(file)tx.objectStore('files').put(file);}
 tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Local storage failed. Export books or free browser storage.'));
});}
export async function importBook(file){
 const format=file.name.split('.').pop().toLowerCase();
 if(!['pdf','epub','cbz','txt','md','html','fb2'].includes(format))throw new Error('Supported: PDF, EPUB, CBZ, TXT, MD, HTML, FB2. DjVu requires external code and is available in the web viewer only.');
 if(!file.size||file.size>64*1048576)throw new Error('Choose a non-empty book up to 64 MiB.');
 const data=await file.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
 const books=await listBooks();const existing=books.find(book=>book.id===hash);if(existing)return {book:existing,duplicate:true};
 const book={id:hash,name:file.name.replace(/\.[^.]+$/,''),filename:file.name,format,size:file.size,saved:Date.now(),opened:0};
 await writeBook(book,file);return {book,duplicate:false};
}

// One transaction: validated restores either finish together or leave the shelf intact.
export async function restoreBooks(records){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction(['books','files'],'readwrite');for(const {book,bytes,type} of records){tx.objectStore('books').put(book);tx.objectStore('files').put({id:book.id,bytes,type});}tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Restore failed; free browser storage and retry.'));});}
