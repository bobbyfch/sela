# Faith readings: roadmap and research

Candidates for later work, with what is known about their rights. Nothing here is shipped. Each item needs its own licence check before any code.

## Likely next

| Candidate | Tradition | Why | Rights note |
| --- | --- | --- | --- |
| Khuddaka Nikaya remainder (Jataka verses, Niddesa, Patisambhida) | Buddhist | The last large block of Sujato's CC0 translations | Check which parts are marked published in `_publication.json` first |
| Hadith Nawawi and Riyadh as-Salihin in Indonesian | Islam | Widely read hadith collections | HadeethEnc covers selections. A full translation needs a publisher licence |
| Sefaria exports for Tanakh classics | Jewish tradition | Not one of the six recognised faiths in Indonesia, so only as an opt-in | Licence differs per version. Filter by licence, never mirror the repository |

## Worth researching

- Persian and Sufi classics already on Gutenberg: The Kashf al-Mahjub (Nicholson, 1911), The Persian Mystics: Rumi, The Mystics of Islam, Mystics and Saints of Islam. They are long and have uneven structure, so each needs its own splitter.
- Christian devotional classics: Francis de Sales (Introduction to the Devout Life) and the Little Flowers of St. Francis were not found as clean Gutenberg files. Check other public-domain sources.

- More Indonesian and Malay public-domain classics on Wikisumber (Hikayat Abdullah, Sejarah Melayu, other syair). Check the work, the transcription and any modern translation separately, and beware pages that hold modern poems under a classical title.
- Standard Ebooks (CC0 typesetting of public-domain works) for philosophy and world literature beyond the faith tab. Better suited to Discover than to the Faith tab.
- Open textbooks (OpenStax) as optional downloads. Rights are per edition, including NC and SA variants.
- Commentary and tafsir. The Kemenag tafsir API needs registration and its terms must be read first. Do not scrape.
- Prayer and remembrance texts per tradition, only where a source gives a clear licence.

## App ideas that follow from the research

- Reading plans (for example the Gospels in 30 days, or the Dhammapada in a week) built from existing packs, stored in the personal store.
- A daily reading that prefers an installed pack over a network request.
- Search across installed packs on the device, using the same on-device index as the shelf.
- Pack update checks that compare checksums once a week and never download without a tap.
- Export of saved entries as a plain Markdown file.

## Rules for every addition

1. Name the exact edition and its licence.
2. Never edit scripture text. Do not merge editions.
3. Keep interpretation visibly separate from the text.
4. Show source, edition and licence before the reader downloads anything.
5. Add a notice file, a validator check and a test.
