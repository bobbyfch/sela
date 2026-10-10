# Install Sela Reader

1. Open [Sela Reader](https://bobbyfch.github.io/sela/mobile/) in your browser on desktop, tablet or phone. The legacy `/mobile/` URL remains supported on all devices.
2. Use browser **Install app** / **Add to Home Screen** when offered. On iPhone/iPad use Safari → Share → Add to Home Screen. Desktop installation depends on the browser; bookmarking always works.
3. Add local books. Open each format once online to cache its decoder; imported books live in this browser’s IndexedDB.

Reader has Home, Shelf, Explore and Settings. Wide screens use a side rail, touch-sized phones a bottom bar. Theme and language are in Settings.

## Offline and backup

The application shell is cached by its service worker. Offline document support needs the matching adapter/decoder already cached; a saved book alone does not guarantee every format works before its first online open. Browser storage can be evicted. Export the full library ZIP regularly; restoring merges records with integrity checks. Google Drive and OneDrive backup is manual export/share/upload and restore; optional OAuth connections import selected files; there is no automatic synchronization. See [cloud setup](cloud.md).

Older browsers receive a basic page with original PDF links. iPhone 4 cannot support the modern offline app. Physical device and background TTS behavior depend on browser/OS. A web app cannot replace every browser’s new-tab page automatically.
