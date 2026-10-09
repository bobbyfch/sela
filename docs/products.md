# Three products, one reader

| Product | Purpose | Install | Devices |
| --- | --- | --- | --- |
| Sela Viewer | Embed a document reader; CDN, ESM, TypeScript | Copy versioned script / framework integration | Any supported browser / OS |
| Sela Home | Desktop new-tab dashboard, bookshelf and Viewer | New Tab extension ZIP | Windows/macOS/Linux: Chrome, Edge, Brave, Chromium or Firefox |
| Sela Bookshelf | Mobile library and reading app, bottom navigation | Browser → Add to Home Screen / Install | Android, iPhone/iPad with capability fallback |

[Choose from the public page](https://bobbyfch.github.io/sela/#products). Home Standard is retained only as a compatibility package; Home New Tab is the recommended edition. New-tab override is separate from browser startup/homepage preferences. Set the public Pages route as a bookmark; use the extension to replace new tabs. Safari extensions require a signed Xcode/native package and are not shipped. Mobile extensions are not an installation route supported by this release.

Home adds a local clock/calendar, coffee pause, rotating original EN/ID quotes and optional city weather. No quotes API or GPS is required. Weather is enabled by entering a city; Open-Meteo receives that city and selected city coordinates. Extension origin permission is requested only on that action. Successful conditions are cached locally; cached information is labeled. Disable weather clears preferences. The hosted free API is non-commercial and rate-limited; commercial redistribution must arrange a suitable plan or self-hosting. [Open-Meteo pricing](https://open-meteo.com/en/pricing), [data attribution](https://open-meteo.com/).

Both shelves have title search, newest/last-read/title sorting, format/status/favorites filters, shelf/grid/list views, rename, export, remove/undo and local covers. They do not synchronize across extension and web origins. See [Home installation](offline-extension.md), [Bookshelf mobile](pwa.md), [Viewer code](install.md).
