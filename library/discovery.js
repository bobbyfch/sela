import {node,fetchFile} from './network.js';
import {coverFor} from './open-catalog.js';
import {searchBooks,acquireBook} from './book-sources.js';
export function mountDiscovery(parent,{t,status,addFiles,openBook}){
 const description=node(parent,'p',t('Discover open books. Read here or keep an offline copy.','Temukan buku terbuka. Baca di sini atau simpan offline.'));
 const form=node(parent,'form'),source=node(form,'select');source.setAttribute('aria-label',t('Book source','Sumber buku'));
 for(const [value,label]of [['wikisource','Wikisumber · Indonesia'],['gitenberg','GITenberg · World classics'],['local','Sela · Selected classics'],['opds','OPDS · Your catalog']]){const option=node(source,'option',label);option.value=value;}source.value=document.documentElement.lang==='id'?'wikisource':'gitenberg';
 const address=node(form,'input');address.type='url';address.hidden=address.disabled=true;address.placeholder='https://…/opds';address.setAttribute('aria-label',t('OPDS catalog URL','URL katalog OPDS'));try{address.value=localStorage.getItem('sela-opds-url')||'';}catch{}
 const query=node(form,'input');query.type='search';query.maxLength=100;query.placeholder=t('Search titles or authors','Cari judul atau penulis');query.setAttribute('aria-label',query.placeholder);
 const submit=node(form,'button',t('Search','Cari'));submit.type='submit';
 const feedback=node(parent,'p');feedback.setAttribute('role','status');const results=node(parent,'div','','open-results');
 const more=node(parent,'button',t('More books','Buku lainnya'));more.type='button';more.hidden=true;
 const terms=node(parent,'small',t('Open editions vary in completeness and copyright by country. Source credits remain in each book. Public APIs may limit requests.','Kelengkapan edisi dan hak cipta berbeda menurut sumber dan negara. Kredit tetap disertakan. API publik dapat membatasi permintaan.'));
 let controller,timer,page=1,continuation,books=[],urls=[],destroyed=false,sequence=0;
 function render(){urls.forEach(URL.revokeObjectURL);urls=[];results.replaceChildren();for(const book of books){
  const card=node(results,'article','','open-book'),image=node(card,'img'),cover=coverFor(book);const url=URL.createObjectURL(cover);urls.push(url);image.src=url;image.alt=book.title;image.loading='lazy';
  const copy=node(card,'div');node(copy,'h4',book.title);node(copy,'p',book.author);node(copy,'small',book.genre+(book.language?' · '+book.language.toUpperCase():''));const actions=node(copy,'div','','catalog-actions');
  if(book.navigation){const browse=node(actions,'button',t('Open collection','Buka koleksi'));browse.type='button';browse.onclick=()=>{address.value=book.navigation;void load();};continue;}
  const read=node(actions,'button',t('Read','Baca')),save=node(actions,'button',t('Save offline','Simpan offline'));read.type=save.type='button';
  async function acquire(open){read.disabled=save.disabled=true;const request=new AbortController(),timeout=setTimeout(()=>request.abort(),120000);feedback.textContent=t('Preparing this edition…','Menyiapkan edisi ini…');try{
   const file=book.url?await fetchFile(book.url,book.title+'.'+(book.format||'txt'),{signal:request.signal}):await acquireBook(book,{signal:request.signal});
   if(book.format){const {detectBookFormat}=await import('./file-format.js');if(await detectBookFormat(file)!==book.format)throw Error('Downloaded content does not match the catalog format.');}
   const added=await addFiles([file],{title:book.title,author:book.author,year:book.year,language:book.language,publisher:book.genre,rights:book.rights,description:book.description||book.genre},cover);
   if(!added?.length)throw Error(t('Import did not finish.','Impor belum selesai.'));if(open)await openBook(added[0]);feedback.textContent=t('Saved to your shelf.','Tersimpan di rakmu.');
  }catch(e){feedback.textContent=t('Could not open this edition. ','Edisi belum dapat dibuka. ')+(e.name==='AbortError'?t('Download timed out. Try again.','Unduhan terlalu lama. Coba lagi.'):e.message);status(feedback.textContent);}finally{clearTimeout(timeout);read.disabled=save.disabled=false;}}
  read.onclick=()=>void acquire(true);save.onclick=()=>void acquire(false);
 }}
 async function load(append=false){clearTimeout(timer);controller?.abort();controller=new AbortController();const request=controller,current=++sequence,timeout=setTimeout(()=>request.abort(),20000);submit.disabled=more.disabled=true;feedback.textContent=t('Finding books…','Mencari buku…');if(!append){page=1;continuation=undefined;}
  try{let data;
   if(source.value==='local'){const response=await fetch(new URL('./public-books.json',import.meta.url),{signal:controller.signal});if(!response.ok)throw Error('Collection unavailable');const all=await response.json(),needle=query.value.toLocaleLowerCase();data={books:all.filter(b=>(b.title+' '+b.author+' '+b.genre).toLocaleLowerCase().includes(needle)),next:false};}
   else if(source.value==='opds'){const {opdsBooks}=await import('./opds.js');data=await opdsBooks(append?continuation:address.value,{query:query.value.trim(),signal:controller.signal});try{localStorage.setItem('sela-opds-url',address.value);}catch{}}
   else data=await searchBooks({source:source.value,query:query.value.trim(),page,continuation,signal:controller.signal});
   if(current!==sequence||destroyed)return;books=append?[...books,...data.books.filter(b=>!books.some(old=>old.id===b.id))]:data.books;continuation=data.continuation;more.hidden=!data.next;feedback.textContent=books.length+' '+t('books shown','buku ditampilkan')+(data.total!=null?' · '+data.total+' '+t('found','ditemukan'):'');render();
  }catch(e){if(current!==sequence||destroyed)return;feedback.textContent=t('Source unavailable. Retry or choose Selected classics.','Sumber belum tersedia. Coba lagi atau pilih Selected classics.')+(source.value==='opds'?' '+t('Catalog must allow browser access (CORS), with HTTPS and no login.','Katalog harus mengizinkan akses browser (CORS), menggunakan HTTPS dan tanpa login.'):'');more.hidden=true;if(!append){books=[];render();}}
  finally{clearTimeout(timeout);if(current===sequence){submit.disabled=more.disabled=false;}}
 }
 form.onsubmit=e=>{e.preventDefault();void load();};source.onchange=()=>{address.hidden=address.disabled=source.value!=='opds';if(source.value!=='opds'||address.value)void load();else{clearTimeout(timer);controller?.abort();sequence++;submit.disabled=more.disabled=false;books=[];render();feedback.textContent=t('Paste an open OPDS catalog URL, then Search.','Tempel URL katalog OPDS terbuka, lalu Cari.');more.hidden=true;}};query.oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>void load(),900);};more.onclick=()=>{page++;void load(true);};
 void load();window.addEventListener('pagehide',()=>{destroyed=true;controller?.abort();clearTimeout(timer);urls.forEach(URL.revokeObjectURL);},{once:true});
 return {localize(){description.textContent=t('Discover open books. Read here or keep an offline copy.','Temukan buku terbuka. Baca di sini atau simpan offline.');query.placeholder=t('Search titles or authors','Cari judul atau penulis');query.setAttribute('aria-label',query.placeholder);source.setAttribute('aria-label',t('Book source','Sumber buku'));submit.textContent=t('Search','Cari');more.textContent=t('More books','Buku lainnya');render();}};
}
