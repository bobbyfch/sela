(function (win, doc) {
  'use strict';
  var own = doc.currentScript;
  var src = own && own.src || '';
  var base = src.slice(0, src.lastIndexOf('/') + 1);
  var capable = 'noModule' in doc.createElement('script') && win.Promise && win.EventTarget && win.ResizeObserver && win.IntersectionObserver && win.Worker && win.PointerEvent && win.CSS && win.CSS.supports('scale', '-1 1');
  if (capable) {
    win.FlippyReady = new win.Promise(function (resolve, reject) {
      var script = doc.createElement('script'); script.src = base + 'sela.min.js';
      script.onload = function () { win.Sela = win.Flippy; resolve(win.Flippy); };
      script.onerror = function () { reject(new Error('Sela could not load; use the direct PDF link.')); };
      doc.head.appendChild(script);
    });
    win.FlippyReady.catch(function () {});
    win.SelaReady = win.FlippyReady;
  } else {
    win.Flippy = function (options) { this.options = options || {}; };
    win.Sela = win.Flippy; win.Flippy.supported = false;
    win.Flippy.prototype.open = function () {
      if (!this.options.pdfUrl && !this.options.url) throw new Error('A PDF URL is required');
      var anchor = doc.createElement('a'); anchor.href = this.options.pdfUrl || this.options.url || '';
      if (!/^https?:$/.test(anchor.protocol) || !anchor.href) throw new Error('A safe PDF URL is required');
      win.location.assign(anchor.href);
      return { then: function (resolve) { if (resolve) resolve(); }, catch: function () {} };
    };
    win.Flippy.prototype.close = win.Flippy.prototype.destroy = function () {};
  }
})(window, document);
