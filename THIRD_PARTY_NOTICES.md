# Third-party notices

Sela is MIT licensed, Copyright (c) 2025 Bobby Fajar Christian.

The book engine is based on PDFlipbook, Copyright (c) 2026 Symple NZ,
MIT licensed. The imported baseline was the locally modified intranet engine,
originally based on SympleNZ/PDFlipbook commit
`99d46380ea37394d8c83c95f6d7cc8e9a0129986`. Its license is preserved in
`licenses/PDFlipbook-MIT.txt` and `dist/PDFlipbook-LICENSE.txt`.

PDF.js 4.10.38 is bundled as lazily loaded assets, Copyright Mozilla Foundation
and contributors, Apache-2.0 licensed. Its full license is in
`dist/vendor/pdfjs/LICENSE`. The modern and legacy builds and corresponding
workers come from the same pinned npm package. Its CMap and standard-font
assets retain their upstream notices. PDF.js is an internal dependency; this
project does not claim to implement a new PDF parser.

The page-turn audio is from the original MIT-licensed FlippyPDF distribution.
Sela includes inline SVG icons rather than third-party icon fonts.

The optional EPUB/CBZ adapter includes fflate 0.8.3 (MIT), Copyright Arjun
Barrett. Its full license is preserved in `dist/fflate-LICENSE.txt`.

The optional DjVu adapter integrates separately supplied DjVu.js, by
RussCoder, GPL-2.0 licensed: https://github.com/RussCoder/djvujs . The decoder
is not bundled in this repository or release. The demo loads the official
external decoder with SRI only when requested. The adapter does not change
the upstream decoder's license. The small Green valley sample is an original
generated landscape, encoded using DjVu.js.

## Original sample story

Yang Tidak Ikut Pulang text and original AI-generated illustrations are CC BY 4.0, attributed to Sela and Bobby Fajar Christian. Text is AI-assisted fiction and does not describe the real people whose names appear. See example/story/README.md and prompts.md. Previous sample content remains licensed in historical releases; it is absent from the active distribution.

## Optional weather
Home city weather uses Open-Meteo when enabled. Data attribution: Open-Meteo, CC BY 4.0. Hosted free endpoint is for non-commercial use; see https://open-meteo.com/en/pricing. Quotes are original Sela EN/ID copy and work offline.
