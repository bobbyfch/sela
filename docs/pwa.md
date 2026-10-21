# Install Sela Books

1. Open [Sela Books](https://bobbyfch.github.io/sela/app/) in your browser on desktop, tablet or phone. `/app/` is the single installed app and works across screen sizes.
2. On Home, choose **Install Sela**. Chromium browsers show their native install prompt when available; otherwise Sela gives instructions for the detected browser and operating system. The browser menu is always a fallback.
3. Add local books. Open each format once online to cache its decoder; imported books live in this browser’s IndexedDB.

The `/app/` workspace has Home, Shelf, Discover, Reading log and Settings. Wide screens use a side rail; narrow screens use a bottom bar. Theme and language are in Settings.
After a useful import, browsers with a native prompt can offer an install invitation. Dismissing it pauses invitations for seven days; installation remains available on Home. Sela detects standalone launches and installations made through its own prompt. Browsers do not expose a universal way to ask whether the same site was installed in a different browser or profile, so an installation made elsewhere may still show the guide.

## Browser and device instructions

- **Chrome, Edge, Opera and Samsung Internet:** when eligible, use Sela’s **Install Sela** button to open the browser prompt. The browser menu also offers **Install app** or **Add to Home Screen**. On Android, Chrome and Samsung Internet can create a full app; other browsers may create a browser shortcut instead.
- **Safari on iPhone or iPad:** use **Share → Add to Home Screen** and enable **Open as Web App** when shown. Safari does not provide the Chromium `beforeinstallprompt` event, so Sela opens these instructions instead of promising a native popup.
- **Safari on macOS:** choose **File → Add to Dock**. Chrome and Edge for macOS use their browser menu’s install command.
- **Firefox on Windows:** use the Web Apps button in the address bar (Firefox 143 or newer; Firefox from the Microsoft Store requires version 150 or newer). Firefox on macOS and Linux does not currently provide this Web Apps installation flow.
- **Firefox on Android:** use the browser menu’s **Add to Home Screen** command for a Firefox shortcut. Other unsupported combinations can keep Sela as a normal bookmark.

The `beforeinstallprompt` interface is non-standard and limited to Chromium-based browsers. A successful installation hides the button when the browser reports `appinstalled`, the app is launched standalone, or Sela has recorded an accepted install prompt on that device/profile. A browser cannot reliably inspect unrelated app installations across browsers or profiles. [MDN install-prompt limits](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt) · [Apple iPhone steps](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/27/ios/27) · [Firefox Windows Web Apps](https://support.mozilla.org/en-US/kb/web-apps-firefox-windows).

## Updates and incoming files

Settings → Updates checks the release and app worker. While open, Sela also checks on launch and after returning online or to the foreground, throttled to once an hour. A downloaded worker waits behind an **Update now / Later** notice. Close the reader, finish imports and close other Sela windows before applying. The build fingerprints cached shell bytes and adapter hashes, so same-version app edits also invalidate stale assets. Updates replace app assets, not the book database. Checks while the app is closed are not guaranteed.

Installed Android Chromium PWAs may appear in the system **Share** chooser for supported book files. The worker receives bytes locally, then the ordinary import pipeline validates and deduplicates them. Supported desktop Chromium browsers can register **Open with Sela** file handlers after installation and permission. Availability depends on OS/browser policy; these are not universal file associations. iOS users can use **+** to select Files; native inbound sharing/open-with is not guaranteed.

## Offline and backup

The application shell is cached by its service worker. Offline document support needs the matching adapter/decoder already cached; a saved book alone does not guarantee every format works before its first online open. Browser storage can be evicted. Export the full library ZIP regularly; restoring merges records with integrity checks. Backup is manual ZIP export/share and restore, without account setup. There is no automatic synchronization. See [backup](backup.md).

Older browsers receive a basic page with original PDF links. iPhone 4 cannot support the modern offline app. Physical device and background TTS behavior depend on browser/OS. A web app cannot replace every browser’s new-tab page automatically.
