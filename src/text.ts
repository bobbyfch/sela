import { readBytes } from './bytes.ts';
import { bindZoomGestures } from './gestures.ts';
import { captureTextPosition, restoreTextPosition } from './preferences.ts';
import {fb2Metadata,cleanMetadata} from './book-metadata.ts';

const allowed = new Set('main p div span h1 h2 h3 h4 h5 h6 blockquote ul ol li em strong b i u s sub sup br hr pre code table thead tbody tr td th figure figcaption a section article small'.split(' '));
const safeClasses = new Set(['quran-source','quran-verse','quran-arabic','quran-translation','quran-footnotes']);
// Safe reflow adapter. Publisher scripts, styles, remote media and active HTML never run.
export class TextBook {
    parseNodes=0;
    declare container: any;
    declare opts: any;
    declare page: number;
    declare zoom: number;
    declare abort: any;
    declare removeGestures: any;
    declare article: any;
    declare language: any;
    declare metadata: any;
    declare outline: any;
    quranMetadata: {surah:number;translationKey:string;language:string;startVerse:number;verseCount:number;arabicSize:number;translationSize:number}|null = null;
    declare numPages: number;
    declare destroyed: boolean;

  constructor(container, options) {
    this.container = container; this.opts = options; this.page = 1; this.zoom = 1;
    this.abort = new AbortController(); container.classList.add('sela-epub'); container.tabIndex = 0;
    this.removeGestures = bindZoomGestures(container, this, options); this.load();
  }
  emit(name, detail) { this.container.dispatchEvent(new CustomEvent('flipbook:' + name, { detail, bubbles: true })); }
  async load() {
    try {
      const bytes = await readBytes(this.opts, this.abort.signal);
      if (bytes.length > 16 * 1024 * 1024) throw new Error('Text document exceeds 16 MiB');
      if (this.destroyed) return;
      const office=['docx','odt'].includes(this.opts.format);
      const source = office?await (await import(/* webpackIgnore: true */ /* @vite-ignore */ new URL(/* @vite-ignore */ './sela.office.js',import.meta.url).href)).officeTextAsync(bytes,this.opts.format,this.abort.signal):new TextDecoder().decode(bytes);
      if (this.destroyed) return;
      let quranArabicSize=0,quranTranslationSize=0;
      // Bound line/tag amplification before allocating a parser DOM or millions
      // of paragraph nodes, including tiny but highly repetitive text files.
      let structures=0;for(const _ of source.matchAll(/<(?=[a-z])|\n/ig))if(++structures>50000)throw new Error('Text document structure exceeds safety limits');
      this.article = document.createElement('article');
      if (this.opts.format === 'html'||office) {
        const doc = new DOMParser().parseFromString(source, 'text/html'); this.language = doc.documentElement.lang;
        const quran=doc.querySelector<HTMLElement>('main[data-quran-arabic-size][data-quran-translation-size]');
        const arabicSize=Number(quran?.dataset.quranArabicSize),translationSize=Number(quran?.dataset.quranTranslationSize);
        if(Number.isFinite(arabicSize)&&arabicSize>=20&&arabicSize<=48)quranArabicSize=Math.round(arabicSize);
        if(Number.isFinite(translationSize)&&translationSize>=14&&translationSize<=28)quranTranslationSize=Math.round(translationSize);
        const surah=Number(quran?.dataset.quranSurah),startVerse=Number(quran?.dataset.quranStartVerse),verseCount=Number(quran?.dataset.quranVerseCount),translationKey=quran?.dataset.quranTranslationKey||'',language=quran?.dataset.quranLanguage||'';
        if(Number.isInteger(surah)&&surah>=1&&surah<=114&&Number.isInteger(startVerse)&&startVerse>=1&&Number.isInteger(verseCount)&&verseCount>=1&&verseCount<=286&&/^[a-z0-9_]{1,80}$/.test(translationKey)&&/^(id|en|ja)$/.test(language))this.quranMetadata={surah,translationKey,language,startVerse:Math.min(startVerse,verseCount),verseCount,arabicSize:quranArabicSize||32,translationSize:quranTranslationSize||18};
        this.metadata=cleanMetadata({title:doc.title,author:(doc.querySelector('meta[name=author]') as HTMLMetaElement)?.content,description:(doc.querySelector('meta[name=description]') as HTMLMetaElement)?.content,language:this.language});
        for (const child of doc.body.childNodes) this.article.appendChild(this.sanitize(child));
      } else if (this.opts.format === 'fb2') {
        const doc = new DOMParser().parseFromString(source, 'application/xml');
        if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'FictionBook') throw new Error('Invalid FictionBook 2 XML');
        this.metadata=fb2Metadata(doc);this.language = doc.getElementsByTagNameNS('*', 'lang')[0]?.textContent;
        for (const body of doc.getElementsByTagNameNS('*', 'body')) this.article.appendChild(this.sanitize(body, true));
      } else if (this.opts.format === 'txt') {
        // Printed text wraps lines inside paragraphs; avoid turning every line
        // into a separate paragraph in the reflow reader.
        for (const block of source.split(/\r?\n[ \t]*\r?\n/)) {
          const value = block.trim(); if (!value) continue;
          const heading = /^(?:chapter|book|part|letter)\s+(?:[ivxlcdm]+|\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b[^\n]*$/i.test(value);
          const el = document.createElement(heading ? 'h2' : 'p');
          el.textContent = value; this.article.appendChild(el);
        }
      } else {
        let fence = null;
        for (const line of source.split(/\r?\n/)) {
          if (this.opts.format === 'md' && /^```/.test(line)) { if (fence) fence = null; else { fence = document.createElement('pre'); this.article.appendChild(fence); } continue; }
          if (fence) { fence.appendChild(document.createTextNode(line + '\n')); continue; }
          const heading = this.opts.format === 'md' && /^(#{1,6})\s+(.+)$/.exec(line);
          const el = document.createElement(heading ? 'h' + heading[1].length : 'p'); el.textContent = heading ? heading[2] : line; this.article.appendChild(el);
        }
      }
      if (!this.article.textContent.trim()) throw new Error('Document contains no readable text');
      const headings = [...this.article.querySelectorAll('h1,h2,h3,h4,h5,h6')];
      headings.forEach((el, i) => { el.id ||= 'sela-heading-' + i; });
      this.outline = headings.slice(0, 2000).map(el => ({ title: el.textContent, page: 1, anchor: el.id }));
      const section = document.createElement('section'); section.className = 'sela-epub-chapter';section.dataset.page='1';
      if(quranArabicSize)section.style.setProperty('--quran-arabic-size',`${quranArabicSize}px`);
      if(quranTranslationSize)section.style.setProperty('--quran-translation-size',`${quranTranslationSize}px`);
      const shadow = section.attachShadow({ mode: 'open' }); const style = document.createElement('style');
      style.textContent = 'article{font-size:var(--sela-text-size,19px);line-height:var(--sela-line-height,1.8);font-family:var(--sela-text-font,Georgia,serif);text-align:var(--sela-text-align,start);color:var(--sela-fg);overflow-wrap:anywhere}h1,h2,h3{line-height:1.3}pre{white-space:pre-wrap}p{white-space:pre-wrap}table{max-width:100%}a{color:inherit}.quran-source{font:400 .8em/1.6 system-ui,sans-serif;opacity:.72;margin:0 0 2em}.quran-verse{padding:1.5em 0;border-bottom:1px solid currentColor}.quran-verse h2{font:600 .8em/1.4 system-ui,sans-serif;opacity:.65}.quran-arabic{font-family:"Noto Naskh Arabic","Amiri",serif;font-size:var(--quran-arabic-size,32px);line-height:2.1;text-align:center;margin:1em 0 1.5em}.quran-translation{font-family:system-ui,sans-serif;font-size:var(--quran-translation-size,18px);line-height:1.8;white-space:pre-wrap}.quran-footnotes{display:block;font:400 .8em/1.6 system-ui,sans-serif;opacity:.68;margin-top:.75em}';
      shadow.append(style, this.article); this.container.append(section); this.numPages = 1;
      this.emit('ready', { pages: 1 });
    } catch (error) { if (!this.destroyed) this.emit('error', { error }); }
  }
  sanitize(node, fb2 = false, depth = 0) {
    this.parseNodes=(this.parseNodes||0)+1;if(depth>64||this.parseNodes>50000)throw new Error('Text document structure exceeds safety limits');
    if (node.nodeType === 3) return document.createTextNode(node.textContent);
    if (node.nodeType !== 1) return document.createTextNode('');
    let name = node.localName.toLowerCase();
    if (fb2) name = ({ body: 'section', title: 'h2', subtitle: 'h3', emphasis: 'em', 'empty-line': 'br', poem: 'blockquote', stanza: 'div', v: 'p', epigraph: 'blockquote', 'text-author': 'p' })[name] || name;
    if (!allowed.has(name)) return document.createTextNode('');
    const el = document.createElement(name); if (node.id) el.id = node.id;
    const classes=(node.getAttribute('class')||'').split(/\s+/).filter(value=>safeClasses.has(value));if(classes.length)el.className=classes.join(' ');
    const direction=node.getAttribute('dir');if(direction==='ltr'||direction==='rtl'||direction==='auto')el.setAttribute('dir',direction);
    const language=node.getAttribute('lang');if(language&&/^[a-z0-9-]{2,35}$/i.test(language))el.setAttribute('lang',language);
    if (name === 'a') {
      const href = node.getAttribute('href') || node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
      if (href.startsWith('#')) { el.href = href; el.addEventListener('click', event => { event.preventDefault(); this.goToLocation({ anchor: decodeURIComponent(href.slice(1)) }); }); }
    }
    for (const child of node.childNodes) el.appendChild(this.sanitize(child, fb2, depth+1)); return el;
  }
  getOutline() { return this.outline; }
  getText() { return this.article?.innerText || this.article?.textContent || ''; }
  goToLocation(item) { this.article?.querySelectorAll('[id]').forEach(el => { if (el.id === item.anchor) el.scrollIntoView({ block: 'start', behavior: 'instant' }); }); }
  currentPage() { return 1; } goTo() {} next() {} prev() {}
  setReadingMode(mode) { this.opts.mode=mode; }
  getLocation() { return captureTextPosition(this.container); }
  restoreLocation(location) { restoreTextPosition(this.container,location); }
  setZoom(value) { const location=this.getLocation();this.zoom = Math.max(.65, Math.min(2.5, +value || 1)); this.container.style.setProperty('--sela-text-size', `${(this.opts.fontSize||19) * this.zoom}px`);this.restoreLocation(location); this.emit('zoomchange', { zoom: this.zoom }); }
  zoomIn() { this.setZoom(this.zoom + .15); } zoomOut() { this.setZoom(this.zoom - .15); }
  toggleFullscreen() { if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); else this.container.requestFullscreen?.().catch(() => {}); }
  destroy() { this.destroyed = true; this.abort.abort(); this.removeGestures(); this.container.replaceChildren(); }
}
