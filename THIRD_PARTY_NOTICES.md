# Third-party notices

Sela is MIT licensed, Copyright (c) 2025 Bobby Fajar Christian.

The book engine is based on PDFlipbook, Copyright (c) 2026 Symple NZ,
MIT licensed. The imported baseline was the locally modified intranet engine,
originally based on SympleNZ/PDFlipbook commit
`99d46380ea37394d8c83c95f6d7cc8e9a0129986`. Its license is preserved in
`licenses/PDFlipbook-MIT.txt` and `dist/PDFlipbook-LICENSE.txt`.

PDF.js 6.4.299 is bundled as lazily loaded assets, Copyright Mozilla Foundation
and contributors, Apache-2.0 licensed. Its full license is in
`dist/vendor/pdfjs/LICENSE`. The modern and legacy builds and corresponding
workers come from the same pinned npm package. Its CMap and standard-font
assets retain their upstream notices. PDF.js is an internal dependency; this
project does not claim to implement a new PDF parser.

The page-turn audio is MIT licensed, Copyright Bobby Fajar Christian.
Public-site icons use the locally bundled Phosphor Icons web font 2.1.2,
MIT licensed, Copyright Phosphor Icons. Only the filled weight is included;
its license is preserved in `licenses/Phosphor-MIT.txt`.

The app navigation and controls use tree-shaken Lucide React 1.59.0 icons.
Lucide is ISC licensed; its license and required MIT notice for icons derived
from Feather are preserved in `licenses/Lucide-React.txt`.

The optional EPUB/CBZ adapter includes fflate 0.8.3 (MIT), Copyright Arjun
Barrett. Its full license is preserved in `dist/fflate-LICENSE.txt`.

The transparent 3D reading companion and four-animal companion atlas were
created for Sela. Their original artwork is included under this project's MIT
license. The app icon, favicon, and navigation glyphs are custom Sela artwork;
no Apple, OpenAI, or Meta logos or UI assets are included.

The mobile Home room animation optionally bundles Three.js 0.186.1 (MIT),
Copyright three.js authors. Its full license is preserved in
`dist/three-LICENSE.txt`.

The optional DjVu adapter integrates separately supplied DjVu.js, by
RussCoder, GPL-2.0 licensed: https://github.com/RussCoder/djvujs . The decoder
is not bundled in this repository or release. The demo loads the official
external decoder with SRI only when requested. The adapter does not change
the upstream decoder's license. The small Green valley sample is an original
generated landscape, encoded using DjVu.js.

## Original sample story

Yang Tidak Ikut Pulang text and original AI-generated illustrations are CC BY 4.0, attributed to Sela and Bobby Fajar Christian. Text is AI-assisted fiction and does not describe the real people whose names appear. See example/story/README.md. Previous sample content remains licensed in historical releases; it is absent from the active distribution.

## Optional weather
Home city weather uses Open-Meteo when enabled. Data attribution: Open-Meteo, CC BY 4.0. Hosted free endpoint is for non-commercial use; see https://open-meteo.com/en/pricing. Quotes are original Sela EN/ID copy and work offline.

## React application shell

The separate application shell bundles React 19.3.0 and React DOM 19.3.0, MIT licensed, Copyright Meta Platforms, Inc. and affiliates. Their full licenses are preserved in `mobile/react-LICENSE.txt` and `mobile/react-dom-LICENSE.txt`. The Universal Viewer SDK does not bundle React. Astro, Vite and TypeScript are development/build tools.

## Product screenshot tooling

Sharp 0.35.5 (Apache-2.0) converts development-time browser captures to local WebP/PNG assets. It is not bundled into the Universal Viewer or Reader browser runtime. Navigation, app icon and material SVG artwork are authored for Sela; Apple design documentation is a reference, not a bundled asset.

## Personal reading room and optional content providers

Room/companion/material SVG artwork and bilingual offline reflections are original Sela assets under the repository MIT license. No Apple artwork or proprietary UI icons are included.

Explore and optional quote/dictionary features fetch content only when requested. GITenberg/Gutenberg editions retain their source notices and jurisdiction-specific rights. Wikisource/Wikiquote contributions retain attribution and their applicable CC BY-SA terms; underlying works and quotations may carry separate rights. Open Library/DOAB/OpenStax/Standard Ebooks metadata links do not imply ownership or permission to redistribute every edition. Online quote passages retain their source attribution; original reflections are labelled separately.

Dictionary packs are supplied by the user; no third-party dictionary dataset is bundled. Optional dictionaryapi.dev/MyMemory calls follow provider terms and receive the submitted word/passage. Local audio is user-supplied; rain ambience is synthesized locally. WebDAV sends an explicitly requested private backup to the user-selected server. See docs/library-sources.md for provider scope and availability.

The lazy-loaded local book-search module bundles Orama 3.1.18 and @orama/stemmers 3.1.18, both Apache-2.0 licensed. Their license texts are preserved in `dist/orama-LICENSE.md` and `dist/orama-stemmers-LICENSE.md`.

## Local faith-reading editions

The optional local reading library contains complete English text editions loaded only after the reader chooses a tradition: World English Bible (66 books, public domain; https://ebible.org/engwebp/), Douay-Rheims 1899 American Edition (73 books, public domain; https://ebible.org/engDRA/), Dhammapada translated by Bhikkhu Sujato (423 verses, CC0 1.0; https://github.com/suttacentral/bilara-data/blob/published/LICENSE.md), The Song Celestial / Bhagavad-Gita translated by Sir Edwin Arnold (18 chapters, Project Gutenberg #2388; https://www.gutenberg.org/ebooks/2388), and The Analects of Confucius translated by James Legge (20 books, Project Gutenberg #3330; https://www.gutenberg.org/ebooks/3330). The Gutenberg editions are public domain in the United States; check applicable local law before redistribution. The selected edition, translator when applicable, source and license are shown with the reading. These English editions are not Indonesian translations.

## Curated reading directories and open textbooks

Selected classics in `library/public-books.json` are metadata plus pinned links to
GITenberg text files. Text bytes are fetched only after the reader chooses Read
or Save offline; no Gutenberg text files are bundled in this repository. Sela
keeps each edition's Project Gutenberg notice in imported text and links to its
official ebook landing page. Project Gutenberg identifies the selected works
as public domain in the United States, but rights can vary by country and by
translator or edition. The copyrighted David Wyllie translation of
*Metamorphosis* (ebook 5200) is deliberately excluded from this offline list.
The U.S. public-domain label does not establish Indonesian status; check the
edition and applicable law, including Indonesia's [Copyright Act (UU 28/2014)](https://peraturan.bpk.go.id/Details/38690/uu-no-28-tahun-2014), before redistribution.

The selected Indonesian programming links in
`library/indonesia-tech-books.json` are an adapted, curated subset of
EbookFoundation's `free-programming-books-id.md` directory, licensed CC BY 4.0.
Attribution: “EbookFoundation contributors, Free Programming Books Indonesia,”
https://github.com/EbookFoundation/free-programming-books/blob/main/books/free-programming-books-id.md.
Descriptions are written for Sela. Each linked work retains its own license
and access conditions. Sela stores only titles, short descriptions, and
outbound HTTPS URLs for these links; it does not copy their book content.

OpenStax entries in Explore link to official textbook pages. Textbook rights
are edition-specific (including CC BY and CC BY-NC-SA); books and PDF files are
not bundled. Check each source edition before reuse.

The following user-supplied GitHub repositories were reviewed as discovery
indexes: `sindresorhus/awesome` (CC0-1.0), `GitIndonesia/awesome-indonesia-repo`
(CC BY 4.0 for the index), and `rujukan/made-in-indonesia` (no repository
license was found). Sela copies no descriptions or project code from the latter
two indexes and does not treat a linked project's public availability as a
reuse license. Their URLs are documented in `docs/library-sources.md`.
