import { createPdfTask } from './pdf-loader.js';
import { bindZoomGestures } from './gestures.js';

export class Webtoon {
  constructor(container, opts) {
    this.container = container; this.opts = opts; this.zoom = 1; this.page = 1;
    this.destroyed = false; this.jobs = []; this.running = 0; this.slots = []; this.visible = new Set();
    container.classList.add('flippy-webtoon');
    container.tabIndex = 0;
    container.style.setProperty('--flippy-page-gap', `${opts.pageGap ?? 0}px`);
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
      if (this.destroyed) { await pdf.destroy(); return; }
      this.pdf = pdf; this.numPages = pdf.numPages;
      const first = await pdf.getPage(1);
      if (this.destroyed) return;
      const viewport = first.getViewport({ scale: 1 }); this.aspect = viewport.height / viewport.width;
      this.status.remove();
      const tools = document.createElement('div'); tools.className = 'flippy-webtoon-tools';
      for (const [label, text, action] of [
        ['Previous page', '←', () => this.prev()], ['Next page', '→', () => this.next()],
        ['Zoom out', '−', () => this.zoomOut()], ['Zoom in', '+', () => this.zoomIn()],
        ['Fullscreen', '⛶', () => this.toggleFullscreen()]
      ]) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'library-reader-button';
        button.setAttribute('aria-label', label); button.title = label; button.textContent = text;
        button.addEventListener('click', action); tools.appendChild(button);
      }
      this.container.appendChild(tools);
      const fragment = document.createDocumentFragment();
      for (let i = 1; i <= this.numPages; i++) {
        const el = document.createElement('section'); el.className = 'flippy-webtoon-page'; el.dataset.page = String(i);
        el.setAttribute('aria-label', `Page ${i}`); el.style.aspectRatio = `${viewport.width} / ${viewport.height}`;
        const canvas = document.createElement('canvas'); el.appendChild(canvas);
        this.slots.push({ el, canvas, page: i, version: 0 }); fragment.appendChild(el);
      }
      this.container.appendChild(fragment);
      this.observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const slot = this.slots[Number(entry.target.dataset.page) - 1];
          if (entry.isIntersecting) { this.visible.add(slot); this.queue(slot); }
          else { this.visible.delete(slot); this.free(slot); }
        }
      }, { root: this.container, rootMargin: '600px' });
      this.pageObserver = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting && entry.intersectionRatio >= .25) this.updatePage(Number(entry.target.dataset.page));
      }, { root: this.container, threshold: [.25, .5] });
      this.slots.forEach(slot => { this.observer.observe(slot.el); this.pageObserver.observe(slot.el); });
      this.onScroll = () => {
        cancelAnimationFrame(this.scrollFrame);
        this.scrollFrame = requestAnimationFrame(() => {
          const center = this.container.getBoundingClientRect().top + this.container.clientHeight / 2;
          let closest, distance = Infinity;
          for (const slot of this.visible) { const r = slot.el.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - center); if (d < distance) { closest = slot; distance = d; } }
          if (closest) this.updatePage(closest.page);
        });
      };
      this.container.addEventListener('scroll', this.onScroll, { passive: true });
    this.ro = new ResizeObserver(() => { this.visible.forEach(slot => { this.free(slot); this.queue(slot); }); }); this.ro.observe(this.container);
    this.slots.forEach(slot => this.ro.observe(slot.el));
      this.goTo(this.opts.startPage || 1);
      this.emit('ready', { pages: this.numPages });
    } catch (error) { if (!this.destroyed) this.emit('error', { error }); }
  }

  queue(slot) {
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
    let scale = slot.el.clientWidth * Math.min(devicePixelRatio || 1, this.opts.maxScale || 1.75) / natural.width;
    scale = Math.min(scale, Math.sqrt((this.opts.maxCanvasPixels || 2500000) / (natural.width * natural.height)));
    const viewport = page.getViewport({ scale });
    slot.canvas.width = Math.ceil(viewport.width); slot.canvas.height = Math.ceil(viewport.height);
    slot.el.style.aspectRatio = `${natural.width} / ${natural.height}`;
    const task = page.render({ canvasContext: slot.canvas.getContext('2d'), viewport }); slot.task = task;
    await task.promise;
    if (slot.version === version) { slot.task = null; slot.width = Math.max(1, Math.round(slot.el.clientWidth * Math.min(devicePixelRatio || 1, this.opts.maxScale || 1.75))); }
  }
  free(slot) { slot.version++; slot.task?.cancel(); slot.task = null; slot.canvas.width = slot.canvas.height = 0; slot.width = null; }
  updatePage(page) { if (this.page !== page) { this.page = page; this.emit('pagechange', { page }); } }
  goTo(page) { const n = Math.max(1, Math.min(this.numPages || 1, Math.trunc(Number(page)) || 1)); this.slots[n - 1]?.el.scrollIntoView({ block: 'start', behavior: 'instant' }); this.updatePage(n); }
  currentPage() { return this.page; }
  next() { this.goTo(this.page + 1); }
  prev() { this.goTo(this.page - 1); }
  setZoom(value) { this.zoom = Math.max(.5, Math.min(3, Number(value) || 1)); this.container.style.setProperty('--flippy-page-width', `${Math.round(Math.min(760,this.container.clientWidth-40) * this.zoom)}px`); this.container.style.setProperty('--flippy-page-max',this.zoom>1?'none':'100%'); this.emit('zoomchange',{zoom:this.zoom}); }
  zoomIn() { this.setZoom(this.zoom + .25); }
  zoomOut() { this.setZoom(this.zoom - .25); }
  toggleFullscreen() { if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); else this.container.requestFullscreen?.().catch(() => {}); }
  destroy() {
    if (this.destroyed) return; this.destroyed = true; this.jobs = [];
    this.observer?.disconnect(); this.pageObserver?.disconnect(); this.ro?.disconnect();
    this.removeGestures?.();
    cancelAnimationFrame(this.scrollFrame);
    this.slots.forEach(slot => this.free(slot));
    this.loadingTask?.destroy().catch(() => {});
    this.container.removeEventListener('keydown', this.onKey); this.container.removeEventListener('scroll', this.onScroll);
    this.container.replaceChildren(); this.pdf = null;
  }
}
