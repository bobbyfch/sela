# Migration to Sela

Use `Sela`, `SelaOptions` and the `sela.*` assets. `Flippy` globals/types and `flippy.*` assets remain compatibility aliases. Pin a release tag in production. Historical CDN tags are not rewritten.

## Unified reader interface

Reader and Viewer now use the same responsive chrome. `ui: 'classic'` remains an accepted input alias for the current app interface; the classic toolbar is removed. Public API methods, document IDs, saved progress and bookmarks remain compatible. Integrations that customized old toolbar DOM or CSS selectors must update their styles. Treat the public API as the integration contract.

When self-hosting, deploy the entire matching `dist/` folder. App chrome loads on opening the reader; tools, metadata and document adapters load as needed. If `autoStyles: false`, include both `sela.min.css` and `sela.app.css`.

Overlay is the default. Inline presentation uses `presentation: 'inline'` and a connected `container` selector or HTMLElement with an explicit height. Inline viewers do not lock body scrolling or trap Tab. Keyboard shortcuts apply to the focused embed. Multiple independent embeds can coexist.

Reader library storage is tied to its browser origin. Export a complete ZIP backup before switching hosts or clearing site data. See [installation](install.md) and [backups](reading-experience.md).
