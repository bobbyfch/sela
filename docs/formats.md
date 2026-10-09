# Document formats

Sela 1.0 adds optional format adapters while preserving the PDF API and existing CDN paths. This is a browser reader with explicitly scoped format support, not a fully conforming EPUB reading system or a universal document converter.

| Format | Reading behavior | Limits |
| --- | --- | --- |
| PDF | Book, single, seamless webtoon, manga RTL | Lazy PDF.js, bounded canvases; accessible original recommended |
| EPUB | Selectable, reflowing HTML; chapter navigation or continuous chapters | DRM-free HTML spine; no publisher CSS, fixed-layout fidelity, scripts, media overlays or embedded fonts |
| CBZ | Raster comic pages in all four modes | JPEG, PNG, WebP, GIF, AVIF according to browser decoding; naturally sorted filenames |
| TXT / MD / HTML / FB2 | Selectable reflow, optional TTS/search/notes, heading outline | UTF-8; basic Markdown headings/fences; sanitized HTML without external resources; FB2 text only (no embedded binary images) |
| DjVu / DJV | Raster pages in all four modes | Optional external DjVu.js decoder; bundled single-file documents only |

EPUB uses chapter numbers rather than physical page numbers. Encrypted resources, including obfuscated fonts, are rejected. Navigation/NCX exposes embedded contents. Internal links navigate chapters and anchor/footnote targets; embedded raster images are supported. Scripts, forms, SVG and external resources are removed. EPUB styling intentionally uses the reader's own typography, isolated in Shadow DOM. Reading direction is explicit through `mode: 'manga'` or `readingDirection: 'rtl'`; package direction is not inferred.

```js
const reader = new Sela({
  url: '/books/story.epub', // .epub, .cbz, .djvu and .djv inferred from URL
  mode: 'webtoon', pageGap: 0, theme: 'auto'
});
await reader.open();
```

For extensionless URLs, Blob URLs or byte data, set `format` explicitly. Requests accept `httpHeaders` and `withCredentials`; authentication and CORS still apply. Selected demo files stay in the browser.

## Optional DjVu decoder

DjVu.js is a separately supplied **GPL-2.0** dependency. Sela's release contains the adapter, not the decoder. Choose a decoder source and review its license for your distribution. The demo explicitly loads the official upstream build only when DjVu is requested, with SRI verification.

```js
const reader = new Sela({
  url: '/scan.djvu', format: 'djvu',
  djvujsSrc: '/vendor/djvu.js', // separately acquired upstream decoder
  // djvuIntegrity: 'sha384-…', // recommended for externally hosted builds
  mode: 'single'
});
await reader.open();
```

Source, license and downloads: [DjVu.js](https://github.com/RussCoder/djvujs), [official downloads](https://djvu.js.org/downloads). CSP must permit the selected decoder and its blob worker. Individual decoding operations time out after 30 seconds; rendering requires `createImageBitmap`. DjVu text/OCR selection, annotations and indirect multi-file documents are not implemented.

## Resource boundaries

Archive/DjVu input is limited to 64 MiB, ZIP expansion to 128 MiB, 2,000 entries and 32 MiB per entry. EPUB chapter text is limited to 16 MiB; CBZ images to 32 megapixels, DjVu to 20 megapixels per source page and 10,000 pages. ZIP extraction is synchronous and bounded; large archives can briefly block the UI. These limits do not replace file validation on your server.

PDF does not use the archive input limit. Demo uploads do. Close/destroy cancels requests and releases workers and object URLs. CBR/RAR, MOBI/AZW, DOCX and DRM are not supported; convert these formats upstream rather than silently renaming extensions.

See [W3C EPUB reading-system requirements](https://www.w3.org/TR/epub-rs-33/) for the wider standard. Full browser/device compatibility follows the required APIs; the old-browser fallback remains an original PDF link.

PDF embedded outlines are resolved through PDF.js named destinations/page references. Search and narration use the original extractable text order, which can differ from visual reading order in complex layouts. No OCR or aligned PDF text layer is supplied. Plain-text formats use one reflowing section; headings navigate within it. HTML styles/scripts/forms/media and external resources are removed.
