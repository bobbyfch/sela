# Browser and platform compatibility

The interactive reader requires ES2020, dynamic modules, module workers, Pointer Events, EventTarget, ResizeObserver and IntersectionObserver. Manga uses individual CSS scale. The compatibility entry checks capabilities instead of guessing from OS names.

| Environment | Behavior | Verification |
| --- | --- | --- |
| Current Edge / Windows | Interactive viewer | Local browser suite |
| Chromium / Linux | Interactive viewer | GitHub Actions suite |
| Playwright WebKit / Windows | Interactive viewer, formats and library storage | Automated browser scenarios; this is not physical Safari/iOS verification |
| Playwright Firefox / Linux | Interactive viewer and formats | GitHub Actions matrix; Windows runtime has failed to launch (SideBySide/mozglue assembly) |
| Android / iOS | Responsive modes and fullscreen fallback | Mobile viewport emulation, not physical devices |
| Missing required capabilities, including IE | Original HTTP(S) PDF via compat entry | Capability removal tested in Chromium |
| JavaScript disabled / blocked | Normal PDF link | Demo includes noscript |

PDF.js 4.10.38 ships matching modern and legacy bundles. A legacy build cannot give IE all modern reader features. [Official PDF.js FAQ](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions).

Always retain a direct PDF link. CSP must allow scripts/styles and module workers (blob: for cross-origin workers). Authentication and CORS still apply. Windows, macOS, Linux, Android, iOS and ChromeOS are browser hosts, not separate native builds.

EPUB additionally needs Shadow DOM and TextDecoder, CBZ needs image decoding, and optional DjVu needs createImageBitmap plus the external decoder's blob worker. The old-browser fallback applies to PDF; EPUB/CBZ/DjVu need a capable browser or an alternative server conversion. Touch pinch is covered by synthetic pointer tests; physical mobile gesture behavior remains unverified. See [format scope](formats.md).

Sela 1.0 regression coverage includes embedded PDF/EPUB outlines, search, notes import/export, safe text formats, portrait/landscape transitions, independent inline embeds, library import/deduplication/cover generation and narrow light/dark layouts. The packaged Chromium New Tab edition is tested in an actual temporary Edge extension context, including saved PDF reload/read/tools with the network disconnected and real new-tab override. IndexedDB stores byte buffers for reliable persistence across the tested Chromium and WebKit hosts. Check CI for current matrix results. Firefox extension signing/store review and physical Quetta/Safari/mobile devices remain unverified.

TTS uses optional Web Speech and defaults to voices reporting `localService`. Voice availability and language quality depend on the browser and installed OS voices; local testing found English voices but no Indonesian local voice. No paid service or API key is required. Browsers without speech support keep the transcript available. Screen orientation locking requires browser/OS support and may require fullscreen; denial leaves ordinary responsive reading available.

SEO: static crawlable content, canonical/description/Open Graph/Twitter tags, SoftwareApplication JSON-LD and sitemap. llms.txt is agent documentation, not a ranking mechanism. [Google AI features use the same foundational SEO practices](https://developers.google.com/search/docs/appearance/ai-features). Indexing, rankings and AI inclusion are not guaranteed. A GitHub project cannot supply origin-root robots.txt; the project-level file documents policy. Submit the sitemap to Search Console after verifying ownership.
