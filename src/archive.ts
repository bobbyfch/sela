import { extractArchive } from './archive-codec.ts';
import { extractArchiveAsync } from './archive-client.ts';
export { createBackupArchive, readBackupArchive, extractArchive } from './archive-codec.ts';
export { extractArchiveAsync } from './archive-client.ts';
import { bindZoomGestures } from './gestures.ts';
import { captureTextPosition, restoreTextPosition } from './preferences.ts';
import {epubMetadata,comicMetadata} from './book-metadata.ts';

import { readBytes } from './bytes.ts';
export { readBytes } from './bytes.ts';
const text=bytes=>new TextDecoder().decode(bytes);
const xml=bytes=>{if(!bytes)throw new Error('Required EPUB file is missing');const doc=new DOMParser().parseFromString(text(bytes),'application/xml');if(doc.querySelector('parsererror'))throw new Error('Invalid EPUB XML');return doc;};
const nodes=(doc: Document | Element,name: string)=>Array.from(doc.getElementsByTagNameNS('*',name));
const path=(href,base)=>decodeURIComponent(new URL(href,'https://archive.invalid/'+base).pathname.slice(1));
const imageType=name=>({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',avif:'image/avif'}[name.split('.').pop().toLowerCase()]);
const allowed=new Set('p div span h1 h2 h3 h4 h5 h6 blockquote ul ol li dl dt dd em strong b i u s sub sup br hr pre code table thead tbody tr td th figure figcaption a img section article aside'.split(' '));
export function validateEpub(files){
 if(text(files.mimetype||new Uint8Array()).trim()!=='application/epub+zip')throw Error('Not an EPUB archive');
 const opfPath=nodes(xml(files['META-INF/container.xml']),'rootfile')[0]?.getAttribute('full-path');
 const opf=xml(files[opfPath]),items=new Map(nodes(opf,'item').map(item=>[item.getAttribute('id'),item]));
 const chapters=nodes(opf,'itemref').filter(item=>item.getAttribute('linear')!=='no').map(item=>{const resource=items.get(item.getAttribute('idref'));if(!resource)throw Error('Invalid EPUB spine');if(!['application/xhtml+xml','text/html'].includes(resource.getAttribute('media-type')))throw Error('Only HTML EPUB spine content is supported');return path(resource.getAttribute('href'),opfPath);});
 if(!chapters.length)throw Error('EPUB has no chapters');
 if(chapters.some(name=>!files[name]))throw Error('EPUB spine references a missing chapter');
 if(chapters.reduce((size,name)=>size+files[name].length,0)>16*1048576)throw Error('EPUB chapter text exceeds 16 MiB');
 if(files['META-INF/encryption.xml']){
  const encryption=xml(files['META-INF/encryption.xml']),fonts=new Set([...items.values()].filter(item=>/^(font\/|application\/(?:vnd\.ms-opentype|font-))/i.test(item.getAttribute('media-type')||'')).map(item=>path(item.getAttribute('href'),opfPath))),encrypted=nodes(encryption,'EncryptedData');
  if(!encrypted.length||encrypted.some(resource=>{const algorithm=nodes(resource,'EncryptionMethod')[0]?.getAttribute('Algorithm'),uri=nodes(resource,'CipherReference')[0]?.getAttribute('URI');return !['http://www.idpf.org/2008/embedding','http://ns.adobe.com/pdf/enc#RC'].includes(algorithm)||!uri||!fonts.has(path(uri,''));}))throw Error('Encrypted/DRM EPUB is not supported');
 }
 return {opfPath,opf,items,chapters};
}

export class Epub {
    parseNodes=0;
    declare container: any;
    declare opts: any;
    declare zoom: number;
    declare page: number;
    declare urls: any[];
    declare abort: any;
    declare removeGestures: any;
    declare files: any;
    declare chapters: any;
    declare metadata: any;
    declare language: any;
    declare outline: any;
    declare numPages: any;
    declare slots: any;
    declare note: any;
    declare readerScroll: any;
    declare readerFrame: any;
    declare observer: any;
    declare destroyed: boolean;

  constructor(container,options) {
    this.container=container;this.opts=options;this.zoom=1;this.page=1;this.urls=[];this.abort=new AbortController();
    container.classList.add('sela-epub');container.tabIndex=0;
    this.removeGestures=bindZoomGestures(container,this,options);this.load();
  }
  emit(name,detail){this.container.dispatchEvent(new CustomEvent('flipbook:'+name,{detail,bubbles:true}));}
  async load(){try{
    this.files=await extractArchiveAsync(await readBytes(this.opts,this.abort.signal),this.abort.signal);if(this.destroyed)return;
    const {opfPath,opf,items,chapters}=validateEpub(this.files);this.chapters=chapters;
    this.metadata=epubMetadata(opf);this.language=nodes(opf,'language')[0]?.textContent||'';
    this.outline=this.readOutline(opf,items,opfPath);
    this.numPages=this.chapters.length;if(!this.numPages)throw new Error('EPUB has no chapters');
    if(this.chapters.some(name=>!this.files[name]))throw new Error('EPUB spine references a missing chapter');
    if(this.chapters.reduce((size,name)=>size+this.files[name].length,0)>16*1024*1024)throw new Error('EPUB chapter text exceeds 16 MiB');
    this.slots=this.chapters.map((name,i)=>{const el=document.createElement('section');el.className='sela-epub-chapter';el.dataset.page=i+1;
      const shadow=el.attachShadow({mode:'open'});const style=document.createElement('style');
      style.textContent=':host{display:block}article{font-family:var(--sela-text-font,Georgia,serif);font-size:var(--sela-text-size,19px);line-height:var(--sela-line-height,1.8);text-align:var(--sela-text-align,start);color:var(--sela-fg);overflow-wrap:anywhere}img{max-width:100%;height:auto}h1,h2,h3{line-height:1.25}pre{white-space:pre-wrap}a{color:inherit}table{max-width:100%}';
      shadow.appendChild(style);const article=document.createElement('article');const doc=new DOMParser().parseFromString(text(this.files[name]),'text/html');
      for(const child of doc.body.childNodes)article.appendChild(this.sanitize(child,name));shadow.appendChild(article);return el;});
    this.container.append(...this.slots);this.goTo(this.opts.startPage||1);
    this.setReadingMode(['webtoon','scroll'].includes(this.opts.mode)?'scroll':'single');
    this.emit('ready',{pages:this.numPages});
  }catch(error){if(!this.destroyed)this.emit('error',{error});}}
  sanitize(node,base,depth=0){
    this.parseNodes=(this.parseNodes||0)+1;if(depth>64||this.parseNodes>200000)throw new Error('EPUB structure exceeds safety limits');
    if(node.nodeType===3)return document.createTextNode(node.textContent);
    if(node.nodeType!==1 || !allowed.has(node.localName.toLowerCase()))return document.createTextNode('');
    const el=document.createElement(node.localName.toLowerCase());
    if(node.id)el.id=node.id;
    if(el.localName==='img'){
      const src=node.getAttribute('src')||'';
      if(!/^[a-z]+:|^\/\//i.test(src)){const name=path(src,base);const type=imageType(name);if(type&&this.files[name]){const url=URL.createObjectURL(new Blob([this.files[name]],{type}));this.urls.push(url);el.src=url;}}
      el.alt=node.getAttribute('alt')||'';el.loading='lazy';
    }
    if(el.localName==='a'){
      const href=node.getAttribute('href')||'';
      if(!/^[a-z]+:|^\/\//i.test(href)) {const name=path(href,base),index=this.chapters.indexOf(name),anchor=new URL(href,'https://archive.invalid/'+base).hash.slice(1);if(index>=0){el.href='#chapter-'+(index+1);const note=node.getAttribute('epub:type')?.split(/\s+/).includes('noteref')||node.getAttribute('role')==='doc-noteref';el.addEventListener('click',event=>{event.preventDefault();if(note&&anchor)this.showFootnote(name,anchor,el);else this.goToLocation({page:index+1,anchor});});}}
    }
    for(const child of node.childNodes)el.appendChild(this.sanitize(child,base,depth+1));return el;
  }
  showFootnote(name,anchor,trigger){
    let id=anchor;try{id=decodeURIComponent(anchor);}catch{}const doc=new DOMParser().parseFromString(text(this.files[name]),'text/html'),target=doc.getElementById(id);if(!target)return;
    this.note?.remove();const dialog=document.createElement('dialog');dialog.className='sela-footnote';dialog.setAttribute('aria-label',this.opts.language==='id'?'Catatan kaki':'Footnote');
    const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label',this.opts.language==='id'?'Tutup catatan kaki':'Close footnote');dialog.append(close,this.sanitize(target,name));
    const dismiss=()=>{dialog.close?.();dialog.remove();this.note=null;trigger.focus();};close.onclick=dismiss;dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});this.note=dialog;this.container.append(dialog);if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');close.focus();
  }
  readOutline(opf: Document,items: Map<string, Element>,base: string){
    const nav=Array.from(items.values()).find(el=>(el.getAttribute('properties')||'').split(/\s+/).includes('nav'));
    const location=(href,navPath)=>{const target=new URL(href,'https://archive.invalid/'+navPath);return {page:this.chapters.indexOf(decodeURIComponent(target.pathname.slice(1)))+1,anchor:decodeURIComponent(target.hash.slice(1))};};
    if(nav){const navPath=path(nav.getAttribute('href'),base);const doc=xml(this.files[navPath]);const root=nodes(doc,'nav').find(el=>(el.getAttributeNS('http://www.idpf.org/2007/ops','type')||el.getAttribute('epub:type')||'').split(/\s+/).includes('toc'))||nodes(doc,'nav')[0];
      const walk=(ol?: Element)=>Array.from(ol?.children||[]).filter(el=>el.localName==='li').map(li=>{const a=Array.from(li.children).find(el=>el.localName==='a');return {title:a?.textContent||li.firstChild?.textContent||'…',...location(a?.getAttribute('href')||'',navPath),items:walk(Array.from(li.children).find(el=>el.localName==='ol'))};});
      if(root)return walk(nodes(root,'ol')[0]);
    }
    const ncx=Array.from(items.values()).find(el=>el.getAttribute('media-type')==='application/x-dtbncx+xml');
    if(ncx){const navPath=path(ncx.getAttribute('href'),base);const doc=xml(this.files[navPath]);const walk=(parent?: Element)=>Array.from(parent?.children||[]).filter(el=>el.localName==='navPoint').map(el=>({title:nodes(el,'text')[0]?.textContent||'…',...location(nodes(el,'content')[0]?.getAttribute('src')||'',navPath),items:walk(el)}));return walk(nodes(doc,'navMap')[0]);}
    return this.chapters.map((name,i)=>({title:'Chapter '+(i+1),page:i+1}));
  }
  getOutline(){return this.outline;}
  getText(n){const slot=this.slots?.[n-1],article=slot?.shadowRoot?.querySelector('article')||slot?.querySelector(':scope > article');const walk=node=>node.nodeType===3?node.textContent:Array.from(node.childNodes).map(walk).join('')+(/^(P|DIV|H[1-6]|LI|BLOCKQUOTE|BR|TR)$/.test(node.nodeName)?'\n':'');return article?walk(article):'';}
  goToLocation(item){if(!item.page)return;this.goTo(item.page);if(item.anchor){const slot=this.slots[item.page-1],lightTargets=slot?Array.from(slot.querySelectorAll('[id]')) as HTMLElement[]:[],target=slot?.shadowRoot?.getElementById(item.anchor)||lightTargets.find(el=>el.id===item.anchor);target?.scrollIntoView({block:'start',behavior:'instant'});}}
  updatePage(n){if(n!==this.page){this.page=n;this.emit('pagechange',{page:n});}}
  goTo(n){n=Math.max(1,Math.min(this.numPages||1,Math.trunc(+n)||1));this.slots?.forEach((el,i)=>{el.hidden=!['webtoon','scroll'].includes(this.opts.mode)&&i!==n-1;});this.slots?.[n-1]?.scrollIntoView({block:'start',behavior:'instant'});this.updatePage(n);}
  setReadingMode(mode){const location=captureTextPosition(this.container);this.opts.mode=mode;this.observer?.disconnect();this.goTo(this.page);restoreTextPosition(this.container,location);if(!this.readerScroll){this.readerScroll=()=>{cancelAnimationFrame(this.readerFrame);this.readerFrame=requestAnimationFrame(()=>{if(this.destroyed||this.opts.mode!=='scroll')return;const top=this.container.getBoundingClientRect().top+32;const active=this.slots.find(el=>el.getBoundingClientRect().bottom>top);if(active)this.updatePage(+active.dataset.page);});};this.container.addEventListener('scroll',this.readerScroll,{passive:true});}if(mode==='scroll'){this.observer=new IntersectionObserver(this.readerScroll,{root:this.container,threshold:.25});this.slots.forEach(el=>this.observer.observe(el));}}
  getLocation(){return captureTextPosition(this.container);}
  restoreLocation(location){this.goTo(location.page);restoreTextPosition(this.container,location);}
  currentPage(){return this.page;}next(){this.goTo(this.page+1);}prev(){this.goTo(this.page-1);}
  setZoom(n){const location=captureTextPosition(this.container);this.zoom=Math.max(.65,Math.min(2.5,+n||1));this.container.style.setProperty('--sela-text-size',`${(this.opts.fontSize||19)*this.zoom}px`);restoreTextPosition(this.container,location);this.emit('zoomchange',{zoom:this.zoom});}
  zoomIn(){this.setZoom(this.zoom+.15);}zoomOut(){this.setZoom(this.zoom-.15);}
  toggleFullscreen(){if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});else this.container.requestFullscreen?.().catch(()=>{});}
  destroy(){this.destroyed=true;this.abort.abort();this.observer?.disconnect();cancelAnimationFrame(this.readerFrame);this.container.removeEventListener('scroll',this.readerScroll);this.removeGestures();this.urls.forEach(url=>URL.revokeObjectURL(url));this.files=null;this.container.replaceChildren();}
}

export function cbzLibrary(){return {getDocument(options){
  const abort=new AbortController();let urls=[];let destroyed=false;
  const promise=(async()=>{
    const files=await extractArchiveAsync(await readBytes(options,abort.signal),abort.signal);
    const names=Object.keys(files).filter(name=>imageType(name)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    if(!names.length)throw new Error('CBZ contains no supported raster images');
    urls=names.map(name=>URL.createObjectURL(new Blob([files[name]],{type:imageType(name)})));
    const comicInfo=Object.keys(files).find(name=>/(^|\/)ComicInfo\.xml$/i.test(name));let metadata: Record<string, any>={};try{if(comicInfo)metadata=comicMetadata(xml(files[comicInfo]));}catch{}
    const doc={numPages:names.length,getMetadata:async()=>({info:{Title:metadata.title,Author:metadata.author,Subject:metadata.description},metadata:{get:key=>({'dc:date':metadata.year,'dc:publisher':metadata.publisher,'dc:language':metadata.language}[key])}}),metadata,destroy:async()=>{destroyed=true;urls.forEach(url=>URL.revokeObjectURL(url));urls=[];},getPage:async number=>{
      if(destroyed)throw new DOMException('Closed','AbortError');
      const img=new Image();img.src=urls[number-1];await img.decode();
      if(img.naturalWidth*img.naturalHeight>32000000)throw new Error('Comic image exceeds 32 megapixels');
      return {getViewport:({scale})=>({width:img.naturalWidth*scale,height:img.naturalHeight*scale,scale}),render:({canvasContext,viewport})=>{
        let cancelled=false;const promise=Promise.resolve().then(()=>{if(!cancelled&&!destroyed)canvasContext.drawImage(img,0,0,viewport.width,viewport.height);});
        return {promise,cancel(){cancelled=true;}};
      }};
    }};if(destroyed){await doc.destroy();throw new DOMException('Closed','AbortError');}return doc;
  })();
  return {promise,destroy:async()=>{destroyed=true;abort.abort();urls.forEach(url=>URL.revokeObjectURL(url));urls=[];}};
}};}
