# Install Sela Reader

1. Open [Sela Reader](https://bobbyfch.github.io/sela/mobile/) in your browser on desktop, tablet or phone. The legacy `/mobile/` URL remains supported on all devices.
2. Use browser **Install app** / **Add to Home Screen** when offered. On iPhone/iPad use Safari → Share → Add to Home Screen. Desktop installation depends on the browser; bookmarking always works.
3. Add local books. Open each format once online to cache its decoder; imported books live in this browser’s IndexedDB.

Reader has Home, Shelf, Explore and Settings. Wide screens use a side rail, touch-sized phones a bottom bar. Theme and language are in Settings.
After a useful import, supported browsers can offer an install invitation. Dismissing it pauses invitations for seven days; installation remains available in Settings. Sela never pretends that unsupported browsers expose a native install prompt.

## Updates and incoming files

Settings → Updates checks the release and app worker. While open, Sela also checks on launch and after returning online or to the foreground, throttled to once an hour. A downloaded worker waits behind an **Update now / Later** notice. Close the reader, finish imports and close other Sela windows before applying. The build fingerprints cached shell bytes and adapter hashes, so same-version app edits also invalidate stale assets. Updates replace app assets, not the book database. Checks while the app is closed are not guaranteed.

Installed Android Chromium PWAs may appear in the system **Share** chooser for supported book files. The worker receives bytes locally, then the ordinary import pipeline validates and deduplicates them. Supported desktop Chromium browsers can register **Open with Sela** file handlers after installation and permission. Availability depends on OS/browser policy; these are not universal file associations. iOS users can use **+** to select Files; native inbound sharing/open-with is not guaranteed.

## Offline and backup

The application shell is cached by its service worker. Offline document support needs the matching adapter/decoder already cached; a saved book alone does not guarantee every format works before its first online open. Browser storage can be evicted. Export the full library ZIP regularly; restoring merges records with integrity checks. Backup is manual ZIP export/share and restore, without account setup. There is no automatic synchronization. See [backup](backup.md).

Older browsers receive a basic page with original PDF links. iPhone 4 cannot support the modern offline app. Physical device and background TTS behavior depend on browser/OS. A web app cannot replace every browser’s new-tab page automatically.
