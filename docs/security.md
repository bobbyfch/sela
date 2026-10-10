# Security, attribution and distribution

Sela is MIT open source. Retain copyright and upstream notices. Bundles include a license banner and console attribution; `dist/manifest.json` records asset SHA-256 hashes. Browser-delivered code can be inspected and copied. Encryption with a client-side key or domain redirects would not prevent cloning and would break legitimate self-hosting.

## Local data

Reader stores book bytes in IndexedDB on the website origin. This is not application-level encryption at rest. Browser/OS protections apply; retain original files and full ZIP backups. Clearing browser data or storage eviction may remove the shelf. Manual backup sharing and optional cloud imports are controlled by the user. OAuth tokens remain in memory; see [setup and privacy](cloud.md). No automatic cloud account sync exists.

## Document handling

PDF.js uses `isEvalSupported: false`. EPUB/HTML scripts and external embedded resources are removed; archives and imports have size/count limits. These safeguards complement browser sandboxing. The optional release checker uses the public GitHub API without credentials or document content and constructs official release URLs. It never executes remote replacement code. Web app code updates through the service worker lifecycle; close app windows and reopen after an update is ready.

Reader and Viewer share the document engine, while Viewer has no personal bookshelf. No analytics or document upload is implemented. Public landing-page language selection may query country.is unless `?geo=off`; app and embed do not perform that lookup. Historical browser-extension releases are no longer distributed in current versions.
