import { readBytes } from './bytes.js';
import { bindZoomGestures } from './gestures.js';

const allowed = new Set('p div span h1 h2 h3 h4 h5 h6 blockquote ul ol li em strong b i u s sub sup br hr pre code table thead tbody tr td th figure figcaption a section article'.split(' '));
// Safe reflow adapter. Publisher scripts, styles, remote media and active HTML never run.
export class TextBook {
  constructor(container, options) {
    this.container = container; this.opts = options; this.page = 1; this.zoom = 1;
    this.abort = new AbortController(); container.classList.add('flippy-epub'); container.tabIndex = 0;
    this.removeGestures = bindZoomGestures(container, this, options); this.load();
  }
  emit(name, detail) { this.container.dispatchEvent(new CustomEvent('flipbook:' + name, { detail, bubbles: true })); }
  async load() {
    try {
      const bytes = await readBytes(this.opts, this.abort.signal);
      if (bytes.length > 16 * 1024 * 1024) throw new Error('Text document exceeds 16 MiB');
      if (this.destroyed) return;
      const source = new TextDecoder().decode(bytes);
      this.article = document.createElement('article');
      if (this.opts.format === 'html') {
        const doc = new DOMParser().parseFromString(source, 'text/html'); this.language = doc.documentElement.lang;
        for (const child of doc.body.childNodes) this.article.appendChild(this.sanitize(child));
      } else if (this.opts.format === 'fb2') {
        const doc = new DOMParser().parseFromString(source, 'application/xml');
        if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'FictionBook') throw new Error('Invalid FictionBook 2 XML');
        this.language = doc.getElementsByTagNameNS('*', 'lang')[0]?.textContent;
        for (const body of doc.getElementsByTagNameNS('*', 'body')) this.article.appendChild(this.sanitize(body, true));
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
      const section = document.createElement('section'); section.className = 'flippy-epub-chapter';
      const shadow = section.attachShadow({ mode: 'open' }); const style = document.createElement('style');
      style.textContent = 'article{font:var(--flippy-text-size,19px)/1.8 Georgia,serif;color:var(--flippy-fg);overflow-wrap:anywhere}h1,h2,h3{line-height:1.3}pre{white-space:pre-wrap}p{white-space:pre-wrap}table{max-width:100%}a{color:inherit}';
      shadow.append(style, this.article); this.container.append(section); this.numPages = 1;
      this.emit('ready', { pages: 1 });
    } catch (error) { if (!this.destroyed) this.emit('error', { error }); }
  }
  sanitize(node, fb2 = false) {
    if (node.nodeType === 3) return document.createTextNode(node.textContent);
    if (node.nodeType !== 1) return document.createTextNode('');
    let name = node.localName.toLowerCase();
    if (fb2) name = ({ body: 'section', title: 'h2', subtitle: 'h3', emphasis: 'em', 'empty-line': 'br', poem: 'blockquote', stanza: 'div', v: 'p', epigraph: 'blockquote', 'text-author': 'p' })[name] || name;
    if (!allowed.has(name)) return document.createTextNode('');
    const el = document.createElement(name); if (node.id) el.id = node.id;
    if (name === 'a') {
      const href = node.getAttribute('href') || node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
      if (href.startsWith('#')) { el.href = href; el.addEventListener('click', event => { event.preventDefault(); this.goToLocation({ anchor: decodeURIComponent(href.slice(1)) }); }); }
    }
    for (const child of node.childNodes) el.appendChild(this.sanitize(child, fb2)); return el;
  }
  getOutline() { return this.outline; }
  getText() { return this.article?.innerText || this.article?.textContent || ''; }
  goToLocation(item) { this.article?.querySelectorAll('[id]').forEach(el => { if (el.id === item.anchor) el.scrollIntoView({ block: 'start', behavior: 'instant' }); }); }
  currentPage() { return 1; } goTo() {} next() {} prev() {}
  setZoom(value) { this.zoom = Math.max(.65, Math.min(2.5, +value || 1)); this.container.style.setProperty('--flippy-text-size', `${19 * this.zoom}px`); this.emit('zoomchange', { zoom: this.zoom }); }
  zoomIn() { this.setZoom(this.zoom + .15); } zoomOut() { this.setZoom(this.zoom - .15); }
  toggleFullscreen() { if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); else this.container.requestFullscreen?.().catch(() => {}); }
  destroy() { this.destroyed = true; this.abort.abort(); this.removeGestures(); this.container.replaceChildren(); }
}
