# Sela private library & browser extensions

The extension has its own room: `extension/library.html`, with a bookshelf, real PDF/EPUB/comic covers when extractable, typographic covers otherwise, a clock, a coffee pause, theme and language controls. **GitHub Pages is only a viewer playground.** The library is not part of the reader's core download.

## Choose an edition

Download an extension ZIP from [Sela releases](https://github.com/bobbyfch/sela/releases), or build locally:
Download `SHA256SUMS.txt` from the same release to verify the ZIP before loading it. [Verification](security.md).

```sh
npm ci
npm run build
npm run package:extension
```

| Package | Entry | New tabs |
| --- | --- | --- |
| `sela-chromium-standard-1.1.0.zip` | Toolbar opens your shelf | Unchanged |
| `sela-chromium-newtab-1.1.0.zip` | Toolbar and new tabs open your shelf | Sela library |
| `sela-firefox-standard-1.1.0.zip` | Toolbar opens your shelf | Unchanged |
| `sela-firefox-newtab-1.1.0.zip` | Toolbar and new tabs open your shelf | Sela library |

Build folders and ZIPs are in `.git/sela-extension/`. Extract the selected ZIP. In Chrome/Edge/Brave, open the extension manager, enable developer mode, then **Load unpacked** and choose the extracted folder containing `manifest.json`. In Firefox, open `about:debugging` → This Firefox → Load Temporary Add-on → choose the manifest. These development builds are **not store-published or signed**; permanent Firefox installation requires signing. The Firefox package targets Firefox 140+; the web viewer has separate capability-based fallback support.

The New Tab edition uses the browser's static new-tab override. To stop using Sela for new tabs, disable it or replace it with the standard edition. The editions have different identities/storage; export originals and notes before switching. This does not change the browser's startup/homepage setting. [Chrome documentation](https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages), [Firefox documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides).

## Your local books

Use **+** or drag multiple files onto the shelf. Supported: PDF, EPUB, CBZ, TXT, MD, HTML and FB2. Maximum 64 MiB per file, up to 100 files in one batch. SHA-256 deduplicates files by content. Imports are sequential; optional thumbnails are generated locally. Password-protected PDFs keep a typographic cover; reader password prompting is not supplied by the shelf in this release. Keep originals for protected documents and integrate the viewer's `password` option yourself when needed.

Search titles, sort by newest/title/last read, open book options to rename, export the original, or remove and undo the most recent removal. Reading progress, page/chapter notes and bookmarks remain local. Use the reader tools to export/import notes as JSON. Contents/notes are document text and metadata, not PDF geometry highlights or EPUB CFI.

Books use IndexedDB; reader state uses localStorage. No account, synchronization, upload, or tracking is implemented. Once installed, bundled PDF/EPUB/comic/text engines work offline. Local TTS needs an installed OS/browser voice; online voices do not become offline voices. DjVu is excluded from extensions because its external decoder would violate the bundled-code design. Clearing extension data, uninstalling, a different profile/extension identity, storage eviction or quota errors can remove the shelf. **Keep your original books and exported notes.**

## Open with Sela

Right-click a supported HTTP(S) document link and choose **Open with Sela**. A local confirmation page displays the address. Clicking **Download & open** requests optional access to that site's origin, downloads up to 64 MiB, saves it on the shelf, and opens the reader. Access is not requested when browsing normally; granted permissions can remain until revoked in the extension manager. No content script, compulsory host access, telemetry or automatic PDF interception.

Authenticated downloads omit credentials; redirects are rejected. Download those files through your normal site and import them locally. Extensionless document endpoints and operating-system file associations are not intercepted. The extension does not replace the OS “Open with” dialog. [Chrome context-menu API](https://developer.chrome.com/docs/extensions/reference/api/contextMenus).

## Mobile browsers

The room adapts to narrow screens, with two cover columns and touch-size actions. Quetta documents Android Chrome/Edge extension support, but browser support for installation, new-tab overrides, context menus, storage and narration differs. A supported desktop API is not proof it works on every mobile browser. Actual Quetta/device installation remains a physical-device check; use the toolbar edition if the browser does not honor a new-tab override. [Quetta's official extension guide](https://www.quetta.net/blog/top-extensions-for-quetta-browser-customize-your-android-browsing).

## Music: a later phase

The simplest free, offline option is a separate extension-only player for user-selected MP3/OGG/WAV files using HTML audio, with a playlist stored locally. It needs no service API key, account or streaming subscription; codec support varies. Keep it out of the embedding core and pause/duck it during narration. Store recordings only after the user chooses them.

Streaming is a separate provider integration. Spotify's Web Playback SDK requires Spotify Premium, so it is not a universally free music engine. Official embeds can be considered after evaluating each provider's authentication, ads, background playback and terms. No streaming provider or music player is shipped in 1.0. [Spotify SDK reference](https://developer.spotify.com/documentation/web-playback-sdk/reference).

## Release notifications

The refresh icon checks the latest stable GitHub release. A daily alarm checks too; disable it in library details. Requests send no book contents or identifiers and omit credentials. Offline/rate-limit failures leave the last successful check intact. A badge means a newer version is available. Download the same browser/edition, close Sela, replace the contents of the existing unpacked directory, and reload the extension; keep its path/identity to retain storage. Export originals and notes first. Never uninstall merely to update.

Chrome/Edge unpacked packages cannot replace their own code. Browser-managed updates require Chrome Web Store / Edge Add-ons distribution. Firefox permanent installation requires signing and either AMO distribution or an approved self-hosted update manifest; these ZIPs are temporary development packages. No signing/store listing is claimed.
