# Reading, collections and backups

Available in Sela Reader 1.3.2. The universal app has an independently built reading UI for phone, tablet and desktop. Its back/title bar, navigation dock, scrubber and reading-settings sheet/sidebar are app-owned; document engines and optional tools services are shared with Viewer. The CDN viewer keeps its integration interface and does not load app modules.

## Reader app

Open the sliders icon to change mode, page fit, brightness, crop or text typography, page filters and application palette. Four persistent palettes (Limaraya, Paper, Ink, Rose) are independent of the light/dark/system preference in Settings. Contents, search and narration have direct icon actions; all tools also include notes, transcription and additional appearance options. Press Escape to dismiss a panel before leaving the book.

On phones the panel opens from the bottom; tablet/desktop use a side panel. The book occupies the reading canvas with app controls hidden by a center tap. Optional screen wake lock is available only where supported and permitted; it is released when hidden or closed. No native volume-key or forced rotation claim is made.

## Shared document services

Open Reading tools → Reading mode to change the current document. PDF, CBZ and DjVu support `single`, `book`, `scroll`, `webtoon` and `manga`. Scroll adds a page gap; Webtoon defaults to no gap. Text/EPUB offer single chapter and continuous scroll, with font family, size, line spacing, margins and alignment. PDF text does not reflow.

```js
const reader = new Sela({
  url: '/book.pdf', id: 'book-edition-1', language: 'en',
  mode: 'single', fit: 'page', persistPreferences: true,
  storagePrefix: 'my-reader:'
});
await reader.open();
await reader.setMode('webtoon'); // reuses the already loaded document
reader.setFit('width');         // page | width | original
reader.back();                 // return after a contents/search/bookmark jump
// For text books:
// reader.setTypography({fontSize: 22, lineHeight: 1.8, fontFamily: 'serif'});
```

Use a stable ID per document edition. Saved per-book preferences override global defaults when `persistPreferences` is enabled; Viewer integrations opt in, while Home and Bookshelf enable it. Settings can be saved as defaults or reset for the current book. Core TypeScript declarations include these methods.

Mobile tools open as a bottom panel. Center taps hide/show controls; double-click/tap toggles zoom. Native selection and browser gestures can vary on touch hardware. Fit modes, optional paper grain, manual symmetric margin crop, twelve filters, brightness and dim are display adjustments; originals stay intact. Low power reduces canvas resolution and disables fold animation. Browser reduced-motion preference also disables animation.

Embedded contents and printed PDF page labels are retained. The scrubber displays the current label. Text position uses chapter/block/fraction locators across reflow and reopening, **not EPUB CFI**. Full CFI interchange, paginated EPUB and an aligned PDF text layer remain separate work.

## Highlights and narration

Use Document text to select a passage, highlight it, save a quote into page notes, or narrate the selection. Text books also display saved highlights in their text. PDF highlights appear in the extracted transcript, not as geometric overlays on the canvas. Highlights match the first occurrence of a saved passage in that chapter; use the same edition. Clearing page highlights leaves notes intact.

Browser/OS narration defaults to local voices. It supports speed, pause/resume, previous/next passage, continuation and 5–60 minute sleep timers. Closing the tools leaves a small player; closing the reader cancels narration. Resume restarts the current short passage rather than promising sample-accurate seeking. Background playback, available Indonesian voices and audible quality depend on the browser/OS.

An optional `speechAdapter` supplies audio through your own backend. It is excluded while “Local voices only” is checked. There is no bundled cloud subscription, provider key or guaranteed free cloud service.

```js
new Sela({
  url: '/book.epub',
  speechAdapter: async (text, {language, rate, signal}) => {
    const response = await fetch('/api/narration', {
      method: 'POST', signal,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text, language, rate})
    });
    if (!response.ok) throw new Error('Narration unavailable');
    return response.blob(); // audio/*, at most 20 MiB per short passage
  }
});
```

Keep credentials, access control, provider consent, quotas and charging on your backend. This example defines an integration contract; it does not deploy an audio service. Audio is fetched only after the reader explicitly chooses the adapter and starts narration.

## Home and Bookshelf

Reader has four separate screens: Home (continue reading and sample catalog), Shelf (personal books), Explore (read/save a sample), and Settings (defaults, storage, backup). Reader is available on desktop, tablet and phone; browser-extension packages are discontinued. Collections/tags, favorites, unread/started/finished, sorting and shelf/grid/list layouts work in both. Select book checkboxes for batch favorite, finished, collection and remove/undo.

The empty shelf shows an add-book icon. Catalog books join the private shelf only after Save offline. The existing 50-page sample remains; full novels are a separate postponed content phase. Documents are never uploaded by these library features.

## Full backup

Settings → Download full backup exports a ZIP with original files, titles, collections, reading status/progress, bookmarks, notes, highlights, text position and reader preferences. Cover thumbnails are not exported; original documents remain available. Up to 120 MiB of book files, 200 books, and 64 MiB per individual book; restore accepts archives up to 128 MiB. Larger libraries can export originals individually.

Restore validates archive sizes, file hashes and metadata before a single IndexedDB transaction. It adds missing books and keeps existing books and their newer notes. Storage failures are reported; if localStorage cannot accept reading data, retain the backup and free browser storage. No cloud sync or automatic transfer between browsers or devices occurs.

Storage usage is an estimate. Requesting persistent storage is optional and can be declined by the browser. Clearing data or browser eviction can remove the library, so keep backups outside the browser. Offline shell caching includes the shared library modules; sample downloads and optional format assets still need an initial online visit. Older browsers retain the basic fallback rather than the modern PWA.
