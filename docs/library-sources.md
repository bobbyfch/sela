# Explore inside your personal reader

Read a temporary preview or use the download icon to save a copy in your private shelf. Catalogs load on Explore, rather than in the SDK main entry. Source chips open a sheet; cover grids, pagination, detail/rights sheets and offline errors use one bookshelf layout.

| Source | Available integration | Limits |
| --- | --- | --- |
| GITenberg | Title/author search, pagination, pinned repository text acquisition | US-specific public-domain status; GitHub quotas. |
| Gutendex / Gutenberg | Search/pagination and advertised EPUB/text acquisitions | Endpoint/CORS/file availability and copyright vary. |
| Wikisource | Indonesia plus EN, FR, ES, JV, SU, DE, NL, PT, IT, ZH, JA, RU, AR | Safe text transcriptions; metadata and completeness vary. ID assembly caps 100 subpages; other languages 80, with bounded concurrency and partial-edition notice. Original work and contributor rights remain separate. |
| Open Library | Edition/work metadata search and source link | Discovery only: lending/borrow/DRM availability does not become a Sela download. |
| DOAB / OAPEN | DOAB title/author/rights metadata, publisher/repository edition link | Metadata only, not an assumed PDF acquisition API. Browser CORS may block the endpoint. |
| OpenStax | Eight curated official textbook edition links | Source provides its own current PDF/online options; no fabricated download. |
| Standard Ebooks | New-release Atom metadata and edition links | Feed/CORS availability and membership terms; no bypass of OPDS membership. |
| Selected classics | Eight bundled catalog entries with locally searchable titles | Original text fetched on explicit Read/Save; small fallback catalog. |
| My OPDS catalogs | OPDS 1 Atom/OPDS 2 JSON navigation, pagination and direct open acquisitions | HTTPS/CORS required; buy/borrow/indirect DRM excluded. Search filters the fetched feed, not arbitrary server-wide search. |

There are **22 source choices**, not 22 independent book collections. Multilingual Wikisource choices share a provider. Results deduplicate IDs within the active source; SHA-256 prevents saving identical files twice. Different editions are not silently merged.

**Read** fetches a bounded file and opens an ephemeral preview. Closing cleans up viewer resources; it does not add the book to IndexedDB. **Download / Save offline** validates and stores it in the private shelf. Metadata-only cards offer **View edition**. Covers generated from titles/authors are distinguished from original publisher art. Text transcriptions lack EPUB/PDF publisher layout fidelity.

## Personal catalogs

Save named HTTPS OPDS profiles for compatible Calibre-Web/Kavita/Komga servers. Optional username/password stay in the current sheet/session and are not persisted. Authorization is scoped to the origin where credentials were supplied; external acquisition/navigation links do not inherit it. Servers must permit the Sela origin and required auth headers through CORS. HTTP servers cannot be fetched from an HTTPS app. Importing a file is still available when remote access fails.

Catalog profiles are local preferences. OPDS discovery does not itself sync progress; optional manual WebDAV backup is a separate connection. Nothing bypasses lending restrictions, DRM, provider quotas or membership.

## Live availability

[Local browser probe, 12 October 2026](source-runtime-results.json): Open Library, Indonesian/English Wikisource and Wikiquote succeeded; Gutendex/dictionary timed out, DOAB/Standard Ebooks/Quotable could not be fetched. These are network/browser observations, not permanent service guarantees. Failed sources keep a retry, source link and Selected classics fallback. A saved edition works offline only while its original bytes remain stored.

References: [GITenberg](https://gitenberg.org/), [Gutendex](https://gutendex.com/), [Wikisource](https://wikisource.org/), [Open Library search API](https://openlibrary.org/dev/docs/api/search), [DOAB API](https://www.doabooks.org/en/article/api-search-doab), [OpenStax](https://openstax.org/), [Standard Ebooks feeds](https://standardebooks.org/feeds/atom), [OPDS 1.2](https://specs.opds.io/opds-1.2), [OPDS 2.0](https://specs.opds.io/opds-2.0).
