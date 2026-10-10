import { unzipSync, zipSync } from 'fflate';
import { bindZoomGestures } from './gestures.js';
import { captureTextPosition, restoreTextPosition } from './preferences.js';
import {epubMetadata,comicMetadata} from './book-metadata.js';

import { readBytes } from './bytes.js';
export { readBytes } from './bytes.js';
export function createBackupArchive(entries) { return zipSync(entries,{level:0}); }
export function readBackupArchive(bytes) { let total=0,count=0;return unzipSync(bytes,{filter:file=>{if(++count>500||file.originalSize>64*1048576||(total+=file.originalSize)>128*1048576||file.name.startsWith('/')||file.name.split('/').includes('..'))throw Error('Backup exceeds safety limits');return true;}}); }
export function extractArchive(bytes) {
  let total=0,count=0;
  return unzipSync(bytes,{filter:file=>{
    if(++count>2000 || file.originalSize>32*1024*1024 || (total+=file.originalSize)>128*1024*1024)throw new Error('Archive expansion exceeds safety limits');
    if(file.name.startsWith('/')||file.name.split('/').includes('..'))throw new Error('Unsafe archive path');
    return true;
  }});
}
const text=bytes=>new TextDecoder().decode(bytes);
const xml=bytes=>{if(!bytes)throw new Error('Required EPUB file is missing');const doc=new DOMParser().parseFromString(text(bytes),'application/xml');if(doc.querySelector('parsererror'))throw new Error('Invalid EPUB XML');return doc;};
const nodes=(doc,name)=>Array.from(doc.getElementsByTagNameNS('*',name));
const path=(href,base)=>decodeURIComponent(new URL(href,'https://archive.invalid/'+base).pathname.slice(1));
const imageType=name=>({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',avif:'image/avif'}[name.split('.').pop().toLowerCase()]);
const allowed=new Set('p div span h1 h2 h3 h4 h5 h6 blockquote ul ol li em strong b i u s sub sup br hr pre code table thead tbody tr td th figure figcaption a img section article'.split(' '));

export class Epub {
  constructor(container,options) {
    this.container=container;this.opts=options;this.zoom=1;this.page=1;this.urls=[];this.abort=new AbortController();
    container.classList.add('flippy-epub');container.tabIndex=0;
    this.removeGestures=bindZoomGestures(container,this,options);this.load();
  }
  emit(name,detail){this.container.dispatchEvent(new CustomEvent('flipbook:'+name,{detail,bubbles:true}));}
  async load(){try{
    this.files=extractArchive(await readBytes(this.opts,this.abort.signal));if(this.destroyed)return;
    if(text(this.files.mimetype||new Uint8Array())!=='application/epub+zip')throw new Error('Not an EPUB archive');
    if(this.files['META-INF/encryption.xml'])throw new Error('Encrypted/DRM EPUB is not supported');
    const opfPath=nodes(xml(this.files['META-INF/container.xml']),'rootfile')[0]?.getAttribute('full-path');
    const opf=xml(this.files[opfPath]);const items=new Map(nodes(opf,'item').map(item=>[item.getAttribute('id'),item]));
    this.chapters=nodes(opf,'itemref').filter(item=>item.getAttribute('linear')!=='no').map(item=>{
      const resource=items.get(item.getAttribute('idref'));if(!resource)throw new Error('Invalid EPUB spine');
      if(!['application/xhtml+xml','text/html'].includes(resource.getAttribute('media-type')))throw new Error('Only HTML EPUB spine content is supported');
      return path(resource.getAttribute('href'),opfPath);
    });
    this.metadata=epubMetadata(opf);this.language=nodes(opf,'language')[0]?.textContent||'';
    this.outline=this.readOutline(opf,items,opfPath);
    this.numPages=this.chapters.length;if(!this.numPages)throw new Error('EPUB has no chapters');
    if(this.chapters.some(name=>!this.files[name]))throw new Error('EPUB spine references a missing chapter');
    if(this.chapters.reduce((size,name)=>size+this.files[name].length,0)>16*1024*1024)throw new Error('EPUB chapter text exceeds 16 MiB');
    this.slots=this.chapters.map((name,i)=>{const el=document.createElement('section');el.className='flippy-epub-chapter';el.dataset.page=i+1;
      const shadow=el.attachShadow({mode:'open'});const style=document.createElement('style');
      style.textContent=':host{display:block}article{font-family:var(--sela-text-font,Georgia,serif);font-size:var(--flippy-text-size,19px);line-height:var(--sela-line-height,1.8);text-align:var(--sela-text-align,start);color:var(--flippy-fg);overflow-wrap:anywhere}img{max-width:100%;height:auto}h1,h2,h3{line-height:1.25}pre{white-space:pre-wrap}a{color:inherit}table{max-width:100%}';
      shadow.appendChild(style);const article=document.createElement('article');const doc=new DOMParser().parseFromString(text(this.files[name]),'text/html');
      for(const child of doc.body.childNodes)article.appendChild(this.sanitize(child,name));shadow.appendChild(article);return el;});
    this.container.append(...this.slots);this.goTo(this.opts.startPage||1);
    this.setReadingMode(['webtoon','scroll'].includes(this.opts.mode)?'scroll':'single');
    this.emit('ready',{pages:this.numPages});
  }catch(error){if(!this.destroyed)this.emit('error',{error});}}
  sanitize(node,base){
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
      if(!/^[a-z]+:|^\/\//i.test(href)) {const index=this.chapters.indexOf(path(href,base));if(index>=0){el.href='#chapter-'+(index+1);el.addEventListener('click',event=>{event.preventDefault();this.goToLocation({page:index+1,anchor:new URL(href,'https://archive.invalid/'+base).hash.slice(1)});});}}
    }
    for(const child of node.childNodes)el.appendChild(this.sanitize(child,base));return el;
  }
  readOutline(opf,items,base){
    const nav=Array.from(items.values()).find(el=>(el.getAttribute('properties')||'').split(/\s+/).includes('nav'));
    const location=(href,navPath)=>{const target=new URL(href,'https://archive.invalid/'+navPath);return {page:this.chapters.indexOf(decodeURIComponent(target.pathname.slice(1)))+1,anchor:decodeURIComponent(target.hash.slice(1))};};
    if(nav){const navPath=path(nav.getAttribute('href'),base);const doc=xml(this.files[navPath]);const root=nodes(doc,'nav').find(el=>(el.getAttributeNS('http://www.idpf.org/2007/ops','type')||el.getAttribute('epub:type')||'').split(/\s+/).includes('toc'))||nodes(doc,'nav')[0];
      const walk=ol=>Array.from(ol?.children||[]).filter(el=>el.localName==='li').map(li=>{const a=Array.from(li.children).find(el=>el.localName==='a');return {title:a?.textContent||li.firstChild?.textContent||'…',...location(a?.getAttribute('href')||'',navPath),items:walk(Array.from(li.children).find(el=>el.localName==='ol'))};});
      if(root)return walk(nodes(root,'ol')[0]);
    }
    const ncx=Array.from(items.values()).find(el=>el.getAttribute('media-type')==='application/x-dtbncx+xml');
    if(ncx){const navPath=path(ncx.getAttribute('href'),base);const doc=xml(this.files[navPath]);const walk=parent=>Array.from(parent?.children||[]).filter(el=>el.localName==='navPoint').map(el=>({title:nodes(el,'text')[0]?.textContent||'…',...location(nodes(el,'content')[0]?.getAttribute('src')||'',navPath),items:walk(el)}));return walk(nodes(doc,'navMap')[0]);}
    return this.chapters.map((name,i)=>({title:'Chapter '+(i+1),page:i+1}));
  }
  getOutline(){return this.outline;}
  getText(n){const article=this.slots?.[n-1]?.shadowRoot.querySelector('article');const walk=node=>node.nodeType===3?node.textContent:Array.from(node.childNodes).map(walk).join('')+(/^(P|DIV|H[1-6]|LI|BLOCKQUOTE|BR|TR)$/.test(node.nodeName)?'\n':'');return article?walk(article):'';}
  goToLocation(item){if(!item.page)return;this.goTo(item.page);if(item.anchor){const target=this.slots[item.page-1]?.shadowRoot.getElementById(item.anchor);target?.scrollIntoView({block:'start',behavior:'instant'});}}
  updatePage(n){if(n!==this.page){this.page=n;this.emit('pagechange',{page:n});}}
  goTo(n){n=Math.max(1,Math.min(this.numPages||1,Math.trunc(+n)||1));this.slots?.forEach((el,i)=>{el.hidden=!['webtoon','scroll'].includes(this.opts.mode)&&i!==n-1;});this.slots?.[n-1]?.scrollIntoView({block:'start',behavior:'instant'});this.updatePage(n);}
  setReadingMode(mode){const location=captureTextPosition(this.container);this.opts.mode=mode;this.observer?.disconnect();this.goTo(this.page);restoreTextPosition(this.container,location);if(!this.readerScroll){this.readerScroll=()=>{cancelAnimationFrame(this.readerFrame);this.readerFrame=requestAnimationFrame(()=>{if(this.destroyed||this.opts.mode!=='scroll')return;const top=this.container.getBoundingClientRect().top+32;const active=this.slots.find(el=>el.getBoundingClientRect().bottom>top);if(active)this.updatePage(+active.dataset.page);});};this.container.addEventListener('scroll',this.readerScroll,{passive:true});}if(mode==='scroll'){this.observer=new IntersectionObserver(this.readerScroll,{root:this.container,threshold:.25});this.slots.forEach(el=>this.observer.observe(el));}}
  getLocation(){return captureTextPosition(this.container);}
  restoreLocation(location){this.goTo(location.page);restoreTextPosition(this.container,location);}
  currentPage(){return this.page;}next(){this.goTo(this.page+1);}prev(){this.goTo(this.page-1);}
  setZoom(n){const location=captureTextPosition(this.container);this.zoom=Math.max(.65,Math.min(2.5,+n||1));this.container.style.setProperty('--flippy-text-size',`${(this.opts.fontSize||19)*this.zoom}px`);restoreTextPosition(this.container,location);this.emit('zoomchange',{zoom:this.zoom});}
  zoomIn(){this.setZoom(this.zoom+.15);}zoomOut(){this.setZoom(this.zoom-.15);}
  toggleFullscreen(){if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});else this.container.requestFullscreen?.().catch(()=>{});}
  destroy(){this.destroyed=true;this.abort.abort();this.observer?.disconnect();cancelAnimationFrame(this.readerFrame);this.container.removeEventListener('scroll',this.readerScroll);this.removeGestures();this.urls.forEach(url=>URL.revokeObjectURL(url));this.files=null;this.container.replaceChildren();}
}

export function cbzLibrary(){return {getDocument(options){
  const abort=new AbortController();let urls=[];let destroyed=false;
  const promise=(async()=>{
    const files=extractArchive(await readBytes(options,abort.signal));
    const names=Object.keys(files).filter(name=>imageType(name)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    if(!names.length)throw new Error('CBZ contains no supported raster images');
    urls=names.map(name=>URL.createObjectURL(new Blob([files[name]],{type:imageType(name)})));
    const comicInfo=Object.keys(files).find(name=>/(^|\/)ComicInfo\.xml$/i.test(name));let metadata={};try{if(comicInfo)metadata=comicMetadata(xml(files[comicInfo]));}catch{}
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
