# Faith readings: roadmap and research

Candidates for later work, with what is known about their rights. Nothing here is shipped. Each item needs its own licence check before any code.

## Likely next

| Candidate | Tradition | Why | Rights note |
| --- | --- | --- | --- |
| SuttaCentral Samyutta and Anguttara Nikaya (Sujato) | Buddhist | The largest remaining collections of the Pali discourses | CC0 1.0. Large: a pack per nikaya, and the importer already supports it |
| More Samyukta Agama in Indonesian | Buddhist | Indonesian text is rare | Only 11 suttas are published in the Indonesian translation so far |
| Mencius (Legge) | Confucian | Completes the Four Books with the Analects, Great Learning and Doctrine of the Mean | Public-domain translation. Wikisource transcription is CC BY-SA. Needs a commentary-aware parser |
| World English Bible with the deuterocanonical books | Catholic | Gives the Catholic tab a second modern edition | Public domain. The `eng-web` edition at eBible.org includes 15 DC books |
| Hadith Nawawi and Riyadh as-Salihin in Indonesian | Islam | Widely read hadith collections | HadeethEnc covers selections. A full translation needs a publisher licence |
| Sefaria exports for Tanakh classics | Jewish tradition | Not one of the six recognised faiths in Indonesia, so only as an opt-in | Licence differs per version. Filter by licence, never mirror the repository |

## Worth researching

- Indonesian public-domain classics on Wikisumber (for example folklore collections and early novels). Check the work, the transcription and any modern translation separately.
- Standard Ebooks (CC0 typesetting of public-domain works) for philosophy and world literature beyond the faith tab. Better suited to Discover than to the Faith tab.
- Open textbooks (OpenStax) as optional downloads. Rights are per edition, including NC and SA variants.
- Commentary and tafsir. The Kemenag tafsir API needs registration and its terms must be read first. Do not scrape.
- Prayer and remembrance texts per tradition, only where a source gives a clear licence.

## App ideas that follow from the research

- Reading plans (for example the Gospels in 30 days, or the Dhammapada in a week) built from existing packs, stored in the personal store.
- A daily reading that prefers an installed pack over a network request.
- Search across installed packs on the device, using the same on-device index as the shelf.
- Highlights and notes inside pack entries, keyed by stable entry ids so they survive pack updates.
- Pack update checks that compare checksums once a week and never download without a tap.
- Export of saved entries as a plain Markdown file.

## Rules for every addition

1. Name the exact edition and its licence.
2. Never edit scripture text. Do not merge editions.
3. Keep interpretation visibly separate from the text.
4. Show source, edition and licence before the reader downloads anything.
5. Add a notice file, a validator check and a test.
