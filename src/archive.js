import { unzipSync } from 'fflate';
import { bindZoomGestures } from './gestures.js';

import { readBytes } from './bytes.js';
export { readBytes } from './bytes.js';
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
    this.language=nodes(opf,'language')[0]?.textContent||'';
    this.outline=this.readOutline(opf,items,opfPath);
    this.numPages=this.chapters.length;if(!this.numPages)throw new Error('EPUB has no chapters');
    if(this.chapters.some(name=>!this.files[name]))throw new Error('EPUB spine references a missing chapter');
    if(this.chapters.reduce((size,name)=>size+this.files[name].length,0)>16*1024*1024)throw new Error('EPUB chapter text exceeds 16 MiB');
    this.slots=this.chapters.map((name,i)=>{const el=document.createElement('section');el.className='flippy-epub-chapter';el.dataset.page=i+1;
      const shadow=el.attachShadow({mode:'open'});const style=document.createElement('style');
      style.textContent=':host{display:block}article{font-family:Georgia,serif;font-size:var(--flippy-text-size,19px);line-height:1.8;color:var(--flippy-fg);overflow-wrap:anywhere}img{max-width:100%;height:auto}h1,h2,h3{line-height:1.25}pre{white-space:pre-wrap}a{color:inherit}table{max-width:100%}';
      shadow.appendChild(style);const article=document.createElement('article');const doc=new DOMParser().parseFromString(text(this.files[name]),'text/html');
      for(const child of doc.body.childNodes)article.appendChild(this.sanitize(child,name));shadow.appendChild(article);return el;});
    this.container.append(...this.slots);this.goTo(this.opts.startPage||1);
    if(this.opts.mode==='webtoon'){this.observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)this.updatePage(+entry.target.dataset.page);},{root:this.container,threshold:.25});this.slots.forEach(el=>this.observer.observe(el));}
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
  goTo(n){n=Math.max(1,Math.min(this.numPages||1,Math.trunc(+n)||1));this.slots?.forEach((el,i)=>{el.hidden=this.opts.mode!=='webtoon'&&i!==n-1;});this.slots?.[n-1]?.scrollIntoView({block:'start',behavior:'instant'});this.updatePage(n);}
  currentPage(){return this.page;}next(){this.goTo(this.page+1);}prev(){this.goTo(this.page-1);}
  setZoom(n){this.zoom=Math.max(.65,Math.min(2.5,+n||1));this.container.style.setProperty('--flippy-text-size',`${19*this.zoom}px`);this.emit('zoomchange',{zoom:this.zoom});}
  zoomIn(){this.setZoom(this.zoom+.15);}zoomOut(){this.setZoom(this.zoom-.15);}
  toggleFullscreen(){if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});else this.container.requestFullscreen?.().catch(()=>{});}
  destroy(){this.destroyed=true;this.abort.abort();this.observer?.disconnect();this.removeGestures();this.urls.forEach(url=>URL.revokeObjectURL(url));this.files=null;this.container.replaceChildren();}
}

export function cbzLibrary(){return {getDocument(options){
  const abort=new AbortController();let urls=[];let destroyed=false;
  const promise=(async()=>{
    const files=extractArchive(await readBytes(options,abort.signal));
    const names=Object.keys(files).filter(name=>imageType(name)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    if(!names.length)throw new Error('CBZ contains no supported raster images');
    urls=names.map(name=>URL.createObjectURL(new Blob([files[name]],{type:imageType(name)})));
    const doc={numPages:names.length,destroy:async()=>{destroyed=true;urls.forEach(url=>URL.revokeObjectURL(url));urls=[];},getPage:async number=>{
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
