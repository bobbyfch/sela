/* OS routing is a UX guard, not a security boundary. ES5 for older browsers. */
(function(w){var ua=navigator.userAgent||'',ipad=/Macintosh/.test(ua)&&navigator.maxTouchPoints>1,mobile=/Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(ua)||ipad;
w.SelaPlatform={mobile:mobile,ios:/iPhone|iPad|iPod/.test(ua)||ipad,desktop:!mobile&&/Windows NT|Macintosh|Linux|CrOS/.test(ua),safari:/Safari/.test(ua)&&!/Chrome|Chromium|Edg|OPR|Android/.test(ua),modern:!!(w.Promise&&w.indexedDB&&w.ResizeObserver&&w.TextDecoder&&w.crypto&&w.crypto.subtle)};
})(window);
