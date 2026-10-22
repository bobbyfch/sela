# Faith readings: sources

Free to read is not permission to copy. Each edition keeps its own rights. The MIT licence covers SELA code and SELA-written text only.

Terms were read on 22 October 2026. Re-read them before you change how a source is used.

## How a reading reaches the reader

| Route | Sela hosts the text | Used for |
| --- | --- | --- |
| Bundled | Yes, inside the app | Five scripture editions that shipped earlier |
| Hosted pack | Yes, in `library/packs/`, SHA-256 checked | Editions whose licence allows redistribution |
| Publisher pack | No, the reader's browser downloads from the publisher on request | Quran editions and hadith, whose terms require unchanged, current, versioned text |

## Shipped

| Pack | Tradition | Route | Licence | Source |
| --- | --- | --- | --- | --- |
| Kisah 25 Nabi (25 entries, not reviewed by a scholar) | Islam | Hosted | MIT, original SELA prose | Quran references from Kemenag RI (LPMQ) |
| Quran editions, Indonesian and English | Islam | Publisher | QuranEnc terms | `quranenc.com/api/v1` |
| Hadith, Indonesian and English, 7 categories | Islam | Publisher | HadeethEnc terms | `hadeethenc.com/api/v1` |
| Alkitab TSI, Edisi Ketiga (NT complete, 21 OT books) | Protestant, Catholic | Hosted | CC BY-SA 4.0, Albata and Pioneer Bible Translators | eBible.org USFM, 3 May 2025 |
| World English Bible | Protestant | Bundled | Public domain | eBible.org |
| Douay-Rheims 1899 | Catholic | Bundled | Public domain | eBible.org |
| World English Bible Classic, the 15 deuterocanonical and apocryphal books | Catholic | Hosted | Public domain, trademark of eBible.org | eBible.org `eng-web` USFM |
| The Imitation of Christ, The Confessions of St. Augustine | Protestant, Catholic | Hosted | Public domain (US) | Project Gutenberg 1653, 3296 |
| Selected Pali suttas: DN, MN, SNP, UD, ITI, KP, Thag, Thig, CP | Buddhist | Hosted | CC0 1.0, Bhikkhu Sujato | SuttaCentral bilara-data, commit `fdb7ff3` |
| Samyutta Nikaya (56 samyuttas, 1,819 suttas) and Anguttara Nikaya (11 nipatas, 1,408 suttas) | Buddhist | Hosted | CC0 1.0, Bhikkhu Sujato | SuttaCentral bilara-data, commit `fdb7ff3` |
| Samyukta Agama, first 11 suttas, Indonesian | Buddhist | Hosted | CC0 1.0, Seniya | SuttaCentral bilara-data, commit `fdb7ff3` |
| Dhammapada | Buddhist | Bundled | CC0 1.0, Bhikkhu Sujato | SuttaCentral |
| Jataka Tales, More Jataka Tales, The Gospel of Buddha | Buddhist | Hosted | Public domain (US) | Project Gutenberg 62514, 7518, 35895 |
| Isa, Katha and Kena Upanishads; Yoga Sutras; Ramayana (Books 1 to 6) | Hindu | Hosted | Public domain (US) | Project Gutenberg 3283, 2526, 24869 |
| Bhagavad-Gita (Arnold) | Hindu | Bundled | Public domain (US) | Project Gutenberg 2388 |
| Analects (Legge) | Confucian | Bundled | Public domain (US) | Project Gutenberg 3330 |
| Tao Teh King (Legge) | Confucian | Hosted | Public domain (US) | Project Gutenberg 216 |
| The Sayings of Confucius (Lyall, 1909), The Book of Filial Duty (Ivan Chen) | Confucian | Hosted | Public domain (US) | Project Gutenberg 24055, 75878 |
| The Confessions of Al Ghazzali (Claud Field) | Islam | Hosted | Public domain (US) | Project Gutenberg 58977 |
| The Story of a Soul (Thérèse of Lisieux, translated by Thomas N. Taylor) | Catholic | Hosted | Public domain (US) | Project Gutenberg 16772 |
| Mencius, The Great Learning, The Doctrine of the Mean (Legge) | Confucian | Hosted | CC BY-SA 4.0 (Wikisource transcription of a public-domain translation) | Wikisource, page revisions listed in the notice |
| Gurindam Dua Belas, Syair Perahu, Syair Burung Unggas, Syair Sinar Gemala Mestika Alam, Syair Nasehat Kepada Anak (Hamzah Fansuri, Raja Ali Haji) | Islam | Hosted | CC BY-SA 4.0 (Wikisumber transcription of public-domain works) | Wikisumber, page revisions listed in the notice |

"Public domain (US)" is a statement about the United States. It does not settle the status in Indonesia or elsewhere. Check your local law before you reuse a text outside Sela.

## Publisher terms

QuranEnc and HadeethEnc allow republishing only if all of these hold: no modification, addition or deletion; the publisher and source are named; the version is shown; the transcript information is kept; notes are reported to the publisher; the text is kept current; no inappropriate advertising.

Sela meets this by not hosting the text. The browser stores the publisher's response verbatim, shows the version and a source link, and offers **Update** and **Download again**. HadeethEnc gives no version number, so the download date is shown instead. Nothing is saved unless every request succeeds and, for Quran editions, every surah has exactly its expected verse count.

## Declined or not started

| Item | Status | Reason |
| --- | --- | --- |
| Tanzil Arabic text | Declined | QuranEnc already returns the Arabic. A second Arabic source would mix editions, and Tanzil allows only verbatim copies. |
| Indonesian Catholic Bible | Not available | The Indonesian editions in common use are not freely licensed. The Catholic tab offers the Alkitab TSI (which has no deuterocanonical books), Douay-Rheims, the deuterocanon in English and classics instead. |
| Alkitab Yang Terbuka (AYT) | Declined | CC BY-ND forbids adaptations, and converting it to a pack is an adaptation. |
| Mahabharata | Not started | Gutenberg holds only part of the Ganguli translation. |
| The Practice of the Presence of God (Gutenberg 5657) | Declined | That edition was edited and re-set by a modern editor in 2002. The 1895 translation needs a clean source first. |
| Indonesian classics beyond the two above | Not started | Hikayat and chronicles on Wikisumber need a check of the text, the transcription and any modern translation. One page titled "Hikayat Sri Rama" is a 2011 poem, not the classic, and is excluded. |
| Sefaria, Standard Ebooks, Aozora, OpenStax packs | Not started | Licence is per edition. Each needs a named proposal first. See [the roadmap](faith-readings-roadmap.md). |

## How the 25 prophet stories were checked

- Every cited verse exists in the Hafs verse counts (`tests/unit/content-packs.test.ts`).
- About 40 verse ranges were compared by hand with the Kemenag Indonesian translation from QuranEnc. This found and fixed one wrong phrase.
- Details that are not in the verses (the name of the sacrificed son, the wife of the Egyptian governor, the Hira scene, the city of Lut) are stated as outside the Quran in each accuracy note.
- A scholar has not reviewed the text. The collection card says so, and every entry ends with an accuracy note that says so. Machine checks prove a verse exists, not that a summary is right.
