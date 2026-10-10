import {fetchFile,node} from './network.js';
let booksPromise;
export function coverFor(book){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 240 360');
 const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;svg.append(e);};
 const colors=['#385b54','#684d60','#49576f','#6c573d'];const color=colors[Number(book.id)%colors.length];
 add('rect',{width:240,height:360,fill:color});add('rect',{x:15,y:15,width:210,height:330,rx:3,fill:'none',stroke:'#ede5cf','stroke-opacity':'.45'});
 add('path',{d:'M35 57h170M35 290h170',stroke:'#ede5cf','stroke-opacity':'.5'});
 const words=book.title.split(/\s+/);let lines=[],line='';for(const word of words){if((line+' '+word).trim().length>18&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();}if(line)lines.push(line);
 lines.slice(0,7).forEach((s,i)=>add('text',{x:120,y:102+i*23,'text-anchor':'middle',fill:'#faf4e6','font-family':'Georgia, serif','font-size':19},s));
 add('text',{x:120,y:319,'text-anchor':'middle',fill:'#ede5cf','font-family':'sans-serif','font-size':11},book.author);
 return new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'});
}
export async function mountOpenCatalog(parent,{t,status,addFiles,openBook}){
 if(parent.dataset.mounted)return;parent.dataset.mounted='true';
 const description=node(parent,'p',t('Eight complete classics. Search, read here, or keep a copy offline. English editions; Project Gutenberg / GITenberg.','Delapan klasik utuh. Cari, baca di sini, atau simpan offline. Edisi bahasa Inggris; Project Gutenberg / GITenberg.'));
 const form=node(parent,'form'),query=node(form,'input');query.type='search';query.maxLength=120;query.placeholder=t('Title, author or genre','Judul, penulis atau genre');query.setAttribute('aria-label',query.placeholder);
 const genre=node(form,'select');genre.setAttribute('aria-label',t('Genre','Genre'));const first=node(genre,'option',t('All genres','Semua genre'));first.value='';
 const count=node(parent,'p');count.setAttribute('role','status');const results=node(parent,'div','','open-results');
 node(parent,'small',t('Public-domain editions in the US; copyright can differ by country. Original credits and terms remain in each book.','Edisi domain publik di AS; hak cipta dapat berbeda di tiap negara. Kredit dan ketentuan asli tetap ada di tiap buku.'));
 const urls=[];let books=[];
 try{booksPromise||=fetch(new URL('./public-books.json',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Catalog unavailable');return r.json();}).catch(e=>{booksPromise=null;throw e;});books=await booksPromise;}catch{count.textContent=t('Collection unavailable. Try again when online.','Koleksi belum tersedia. Coba lagi saat online.');parent.dataset.mounted='';return;}
 for(const name of [...new Set(books.map(b=>b.genre))].sort()){const o=node(genre,'option',name);o.value=name;}
 function render(){urls.forEach(URL.revokeObjectURL);urls.length=0;results.replaceChildren();const needle=query.value.trim().toLocaleLowerCase();const matches=books.filter(b=>(!genre.value||b.genre===genre.value)&&(b.title+' '+b.author+' '+b.genre).toLocaleLowerCase().includes(needle));count.textContent=matches.length+' '+t('books','buku');
 for(const book of matches){const card=node(results,'article','','open-book'),image=node(card,'img');const cover=coverFor(book);const url=URL.createObjectURL(cover);urls.push(url);image.src=url;image.alt=book.title;image.loading='lazy';const copy=node(card,'div');node(copy,'h4',book.title);node(copy,'p',book.author+' · '+book.year);node(copy,'small',book.genre+' · EN');const actions=node(copy,'div','','catalog-actions');
 const read=node(actions,'button',t('Read','Baca')),save=node(actions,'button',t('Save offline','Simpan offline'));read.type=save.type='button';
 async function acquire(open){read.disabled=save.disabled=true;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);const label=open?t('Opening…','Membuka…'):t('Saving…','Menyimpan…');count.textContent=label;
 try{const file=await fetchFile(book.url,book.title+'.txt',{signal:controller.signal});const imported=await addFiles([file],{title:book.title,author:book.author,year:book.year,language:book.language,publisher:book.source,rights:book.rights,description:book.genre},cover);if(!imported?.length)throw new Error(t('Could not save this book.','Buku belum dapat disimpan.'));if(open)await openBook(imported[0]);count.textContent=t('Ready in your shelf.','Tersimpan di rakmu.');}catch(e){count.textContent=t('Could not load this book. Check your connection and try again.','Buku belum dapat dimuat. Periksa koneksi lalu coba lagi.');status(count.textContent);}finally{clearTimeout(timer);read.disabled=save.disabled=false;}}
 read.onclick=()=>acquire(true);save.onclick=()=>acquire(false);}}
 query.oninput=render;genre.onchange=render;form.onsubmit=e=>{e.preventDefault();render();};render();window.addEventListener('pagehide',()=>urls.forEach(URL.revokeObjectURL),{once:true});
 return {localize(){description.textContent=t('Eight complete classics. Search, read here, or keep a copy offline. English editions; Project Gutenberg / GITenberg.','Delapan klasik utuh. Cari, baca di sini, atau simpan offline. Edisi bahasa Inggris; Project Gutenberg / GITenberg.');query.placeholder=t('Title, author or genre','Judul, penulis atau genre');query.setAttribute('aria-label',query.placeholder);first.textContent=t('All genres','Semua genre');render();}};
}
