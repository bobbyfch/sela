import { createPdfTask } from './pdf-loader.ts';
import { bindZoomGestures } from './gestures.ts';

export class Webtoon {
    declare container: any;
    declare opts: any;
    declare zoom: number;
    declare page: number;
    declare destroyed: boolean;
    declare jobs: any[];
    declare running: number;
    declare slots: any[];
    declare visible: any;
    declare removeGestures: any;
    declare onKey: any;
    declare status: any;
    declare loadingTask: any;
    declare pdf: any;
    declare numPages: any;
    declare aspect: any;
    declare endSpacer: any;
    declare observer: any;
    declare pageObserver: any;
    declare onScroll: any;
    declare scrollFrame: any;
    declare ro: any;
    declare resizeFrame: any;
    declare observedWidth: number;
    declare observedHeight: number;
    declare gesturing: boolean;
    declare renderTimer: any;

  constructor(container, opts) {
    this.container = container; this.opts = opts; this.zoom = 1; this.page = 1;
    this.destroyed = false; this.jobs = []; this.running = 0; this.slots = []; this.visible = new Set();
    this.resizeFrame = 0; this.observedWidth = container.clientWidth; this.observedHeight = container.clientHeight;
    container.classList.add('sela-webtoon');
    container.tabIndex = 0;
    container.style.setProperty('--sela-page-gap', `${opts.mode === 'scroll' ? (opts.pageGap || 16) : (opts.pageGap ?? 0)}px`);
    this.removeGestures = bindZoomGestures(container, this, opts);
    this.onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      const rtl = opts.readingDirection === 'rtl';
      if ([rtl ? 'ArrowLeft' : 'ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); this.next(); }
      if ([rtl ? 'ArrowRight' : 'ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); this.prev(); }
      if (e.key === 'Home') { e.preventDefault(); this.goTo(1); }
      if (e.key === 'End') { e.preventDefault(); this.goTo(this.numPages); }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); this.zoomIn(); }
      if (e.key === '-') { e.preventDefault(); this.zoomOut(); }
    };
    container.addEventListener('keydown', this.onKey);
    this.status = document.createElement('p'); this.status.textContent = 'Loading PDF…'; container.appendChild(this.status);
    this.load();
  }

  emit(name, detail) { this.container.dispatchEvent(new CustomEvent(`flipbook:${name}`, { detail, bubbles: true })); }
  async load() {
    try {
      this.loadingTask = createPdfTask(this.opts.pdfjsLib, this.opts);
      const pdf = await this.loadingTask.promise;
      if (this.destroyed) { await this.loadingTask?.destroy(); return; }
      this.pdf = pdf; this.numPages = pdf.numPages;
      const first = await pdf.getPage(1);
      if (this.destroyed) return;
      const viewport = first.getViewport({ scale: 1 }); this.aspect = viewport.height / viewport.width;
      this.status.remove();
      const tools = document.createElement('div'); tools.className = 'sela-webtoon-tools';
      for (const [label, text, action] of [
        ['Previous page', '←', () => this.prev()], ['Next page', '→', () => this.next()],
        ['Zoom out', '−', () => this.zoomOut()], ['Zoom in', '+', () => this.zoomIn()],
        ['Fullscreen', '⛶', () => this.toggleFullscreen()]
      ] as [string, string, () => void][]) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'library-reader-button';
        button.setAttribute('aria-label', label); button.title = label; button.textContent = text;
        button.addEventListener('click', action); tools.appendChild(button);
      }
      this.container.appendChild(tools);
      const fragment = document.createDocumentFragment();
      for (let i = 1; i <= this.numPages; i++) {
        const el = document.createElement('section'); el.className = 'sela-webtoon-page'; el.dataset.page = String(i);
        el.setAttribute('aria-label', `Page ${i}`); el.style.aspectRatio = `${viewport.width} / ${viewport.height}`;
        const canvas = document.createElement('canvas'); el.appendChild(canvas);
        this.slots.push({ el, canvas, page: i, version: 0 }); fragment.appendChild(el);
      }
      this.container.appendChild(fragment);
      this.endSpacer=document.createElement('div');this.endSpacer.setAttribute('aria-hidden','true');this.container.appendChild(this.endSpacer);
      this.fit();
      this.observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const slot = this.slots[Number((entry.target as HTMLElement).dataset.page) - 1];
          if (entry.isIntersecting) { this.visible.add(slot); this.queue(slot); }
          else { this.visible.delete(slot); this.free(slot); }
        }
      }, { root: this.container, rootMargin: '600px' });
      this.pageObserver = new IntersectionObserver(() => this.onScroll?.(), { root: this.container, threshold: [.25, .5] });
      this.slots.forEach(slot => { this.observer.observe(slot.el); this.pageObserver.observe(slot.el); });
      this.onScroll = () => {
        cancelAnimationFrame(this.scrollFrame);
        this.scrollFrame = requestAnimationFrame(() => {
          const center = this.container.getBoundingClientRect().top + 32;
          let closest, distance = Infinity;
          for (const slot of this.visible) { const r = slot.el.getBoundingClientRect(); const d = r.top<=center&&r.bottom>center?0:Math.min(Math.abs(r.top-center),Math.abs(r.bottom-center)); if (d < distance) { closest = slot; distance = d; } }
          if (closest) this.updatePage(closest.page);
        });
      };
      this.container.addEventListener('scroll', this.onScroll, { passive: true });
    // Fitting depends only on the scroll viewport. Observing the page slots as well
    // creates a resize feedback loop in WebKit when their aspect ratios settle.
    this.ro = new ResizeObserver(() => {
      // Defer layout writes until after ResizeObserver delivery. Safari/WebKit reports
      // a loop error when page sizing changes in the same frame as the resize notice.
      if (this.resizeFrame) return;
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = 0;
        if (this.destroyed) return;
        const width = this.container.clientWidth, height = this.container.clientHeight;
        if (width === this.observedWidth && height === this.observedHeight) return;
        this.observedWidth = width; this.observedHeight = height;
        this.fit(); this.scheduleRender();
      });
    });
    this.ro.observe(this.container);
      this.goTo(this.opts.startPage || 1);
      this.emit('ready', { pages: this.numPages });
    } catch (error) { if (!this.destroyed) this.emit('error', { error }); }
  }

  queue(slot) {
    if(this.gesturing)return;
    const width = Math.max(1, Math.round(slot.el.clientWidth * Math.min(devicePixelRatio || 1, this.opts.maxScale || 1.75)));
    if (slot.width === width || slot.queued) return;
    slot.queued = true; this.jobs.push(slot); this.pump();
  }
  pump() {
    while (!this.destroyed && this.running < 2 && this.jobs.length) {
      const slot = this.jobs.shift(); slot.queued = false;
      if (!this.visible.has(slot)) continue;
      const version = ++slot.version; this.running++;
      this.render(slot, version).catch(error => {
        if (!this.destroyed && error.name !== 'RenderingCancelledException') this.emit('pageerror', { page: slot.page, error });
      }).finally(() => { this.running--; this.pump(); });
    }
  }
  async render(slot, version) {
    const page = await this.pdf.getPage(slot.page);
    if (this.destroyed || slot.version !== version) return;
    const natural = page.getViewport({ scale: 1 });
    const targetWidth=Math.max(1,Math.round(slot.el.clientWidth*Math.min(devicePixelRatio||1,this.opts.maxScale||1.75)));
    let scale = targetWidth / natural.width;
    scale = Math.min(scale, Math.sqrt((this.opts.maxCanvasPixels || 2500000) / (natural.width * natural.height)));
    const viewport = page.getViewport({ scale });
    // Render into a separate canvas: never blank the currently visible page.
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    slot.el.style.aspectRatio = `${natural.width} / ${natural.height}`;
    const task = page.render({ canvasContext: canvas.getContext('2d'), viewport }); slot.task = task;
    await task.promise;
    if (!this.destroyed&&slot.version === version) { slot.task = null;slot.canvas.replaceWith(canvas);slot.canvas=canvas;slot.width=targetWidth;this.scheduleRender(); }
  }
  free(slot) { slot.version++; slot.task?.cancel(); slot.task = null; slot.canvas.width = slot.canvas.height = 0; slot.width = null; }
  updatePage(page) { if (this.page !== page) { this.page = page; this.emit('pagechange', { page }); } }
  goTo(page) { const n = Math.max(1, Math.min(this.numPages || 1, Math.trunc(Number(page)) || 1)); this.slots[n - 1]?.el.scrollIntoView({ block: 'start', behavior: 'instant' }); this.updatePage(n); }
  currentPage() { return this.page; }
  next() { this.goTo(this.page + 1); }
  prev() { this.goTo(this.page - 1); }
  beginGesture(){this.gesturing=true;clearTimeout(this.renderTimer);}
  endGesture(){this.gesturing=false;this.scheduleRender();}
  scheduleRender(){clearTimeout(this.renderTimer);if(!this.gesturing)this.renderTimer=setTimeout(()=>{if(!this.destroyed)this.visible.forEach(slot=>this.queue(slot));},180);}
  panBy(x,y){this.container.scrollLeft+=x;this.container.scrollTop+=y;}
  setZoom(value,point?: any) {
    const next=Math.max(.5,Math.min(3,Number(value)||1));if(Math.abs(next-this.zoom)<.001)return;
    const bounds=this.container.getBoundingClientRect();point||={x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2};
    const slot=this.slots.find(s=>{const r=s.el.getBoundingClientRect();return r.top<=point.y&&r.bottom>=point.y;})||this.slots[this.page-1];
    const before=slot?.el.getBoundingClientRect();const x=before?(point.x-before.left)/before.width:0,y=before?(point.y-before.top)/before.height:0;
    this.zoom=next;this.fit();
    if(before){const after=slot.el.getBoundingClientRect();this.container.scrollLeft+=after.left+x*after.width-point.x;this.container.scrollTop+=after.top+y*after.height-point.y;}
    this.scheduleRender();this.emit('zoomchange',{zoom:this.zoom});
  }
  fit() {
    if(this.endSpacer)this.endSpacer.style.height=this.container.clientHeight+'px';
    const width = Math.max(80, this.container.clientWidth - 24);
    const value = this.opts.fit === 'width' ? width : this.opts.fit === 'original' ? 760 : Math.min(width, Math.max(80, this.container.clientHeight - 60) / (this.aspect || 1.4));
    this.container.style.setProperty('--sela-page-width', `${Math.round(value * this.zoom)}px`);
    this.container.style.setProperty('--sela-page-max',this.zoom>1||this.opts.fit==='original'?'none':'100%');
    this.container.style.touchAction=this.zoom>1?'none':'pan-y';
  }
  setFit(value) { this.opts.fit=value; this.zoom=1; this.fit(); }
  zoomIn() { this.setZoom(this.zoom + .25); }
  zoomOut() { this.setZoom(this.zoom - .25); }
  toggleFullscreen() { if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); else this.container.requestFullscreen?.().catch(() => {}); }
  destroy(preserveDocument) {
    if (this.destroyed) return; this.destroyed = true; this.jobs = [];
    this.observer?.disconnect(); this.pageObserver?.disconnect(); this.ro?.disconnect();
    this.removeGestures?.();
    cancelAnimationFrame(this.scrollFrame);
    cancelAnimationFrame(this.resizeFrame);
    clearTimeout(this.renderTimer);
    this.slots.forEach(slot => this.free(slot));
    if (!preserveDocument) this.loadingTask?.destroy().catch(() => {});
    this.container.removeEventListener('keydown', this.onKey); this.container.removeEventListener('scroll', this.onScroll);
    this.container.replaceChildren(); this.container.classList.remove('sela-webtoon'); this.pdf = null;
  }
}
