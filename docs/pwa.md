# Installable viewer / PWA

Open [Sela Pages](https://bobbyfch.github.io/sela/?geo=off), then use **Install viewer** when offered, your browser install icon, or its **Add to Home Screen** menu. HTTPS and service workers are required. Safari/iOS uses the Share menu; availability and UI depend on the browser. The manifest has standalone display and ordinary icons; no native app store is required.

This installs the viewer, not the private bookshelf. The bookshelf is extension-only. Choose a local file on each reading session; PWA does not retain its bytes or grant filesystem access.

The viewer shell is cached after successful installation of the service worker. Read each format online once to cache its lazy adapter/decoder/worker. PDF fonts and CMaps are cached only if requested, so a different offline PDF may need a font resource you have not cached. Visit and test the actual document online before relying on offline reading. External DjVu is excluded. Sample PDFs/EPUBs/CBZs and user-supplied document URLs are not cached by the worker.

Updates install in the background; close all Sela windows and reopen to activate a newly cached version. Versioned caches are removed when a newer worker activates. Browser storage may be evicted or cleared. Keep original documents and exported notes. Incognito/private browsing or browser policy can disable storage/PWA installation.

## Privacy

The worker handles only same-origin viewer assets and the root viewer navigation. It does not intercept extension pages, document downloads, cross-origin resources, or uploads. IndexedDB bookshelf storage belongs to the separate extension origin. Pages language lookup is disabled in the installed PWA start URL (`?geo=off&app=1`). Speech voices may be supplied by an online provider only if enabled in Reading tools.
