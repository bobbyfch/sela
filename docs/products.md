# Sela Books and Viewer

| Product | Purpose | Open / install |
| --- | --- | --- |
| Sela Books | Private bookshelf, collections, local/offline books and reading | [Web app](https://bobbyfch.github.io/sela/app/); use your browser’s Install or Add to Home Screen menu |
| Viewer | Embed a document reader in a website or framework | [CDN / ESM guide](install.md) |

Both use one responsive reader interface on phone, tablet and desktop. Sela Books owns library navigation, import, backups, Explore and home preferences. Viewer is scoped to its host and includes no shelf or home widgets. Inline and overlay modes share bookmarks, previews, themes, search and reading tools.

Reader stores imported books in IndexedDB on the current origin/device. Export a ZIP backup before clearing site data or moving to another origin. Browser extensions are not distributed. Installation and optional capabilities depend on your browser; see [compatibility](compatibility.md), [reading tools](reading-experience.md), [PWA installation](pwa.md) and [backup](backup.md).
