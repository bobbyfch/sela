# Sela Books app design research

**Reviewed:** 19 October 2026
**Scope:** installed web app; fresh information architecture and visual foundation, 19 October 2026

## Findings

- PwC's 2026 U.S. survey of children aged 7–14 found boredom, excessive advertising, and slow load times among the most common reasons children abandon apps. This supports a quick path to a useful reading action and low-noise surfaces. The sample is U.S.-based, so it does not stand in for Indonesian readers.
- Ofcom's 2025 UK Online Nation work describes children aged 8–14 as highly mobile and spends substantial time on social and video services. That is a reason to make Sela responsive and quick to understand; it is not a reason to imitate rapid-feed patterns in a reading app.
- Apple describes Liquid Glass as a dynamic material for interface controls. Its design guidance recommends adaptable layouts, predictable iconography, clear hierarchy, and restrained color. Sela uses translucent glass only for navigation and controls, while book covers and reading content stay matte.
- A single label such as “Gen Alpha” covers a wide age range and many different tastes. Sela uses personal choice, rather than age stereotypes, as the design response: readers can choose quiet paper, olive, stone, oat, cocoa, porcelain, or OLED themes.
- Apple's current Liquid Glass guidance treats the material as an interactive layer for navigation and controls, with the content below remaining the focus. This supports using glass on the app rail, compact top controls, and mobile tabs while leaving the shelf, settings, pages, and cover art matte.
- Kobo's Winter 2025 library update calls out a cover grid and a choice between recently opened and newly added books. Sela's Shelf therefore opens as a cover-first collection, while sort, collection filters, and list/grid choice remain available as explicit tools.
- Apple's Search Fields guidance allows search to sit in navigation, a toolbar, or inline with the content depending on the task. Sela places Explore search after source selection and keeps Shelf search beside collection controls; the placement is a task-based design inference.
- Google's Material 3 Expressive research describes expression in relation to users' patterns of use. Sela applies that idea through selectable tinted-paper themes and readable book art, rather than bright colors across every control or age-coded decoration.
- WCAG 2.2 provides a 24 by 24 CSS pixel minimum target-size criterion with stated exceptions, and the reflow guidance evaluates content at a 320 CSS pixel equivalent. Sela uses touch-sized controls and that width as a responsive review point; this is design guidance, not a conformance claim.

## Fresh layout decisions

- Keep the public page's restrained paper-and-ink family, then give the installed app its own navigation and page composition: the two surfaces share type and palette principles, not a copied marketing-page layout.
- Use a persistent section rail on desktop, a compact task header, and one book-led content canvas. Collapse the rail to floating five-destination tabs below 68 rem.
- Order Home as current reading and the focus tools first, then the reading queue and discovery; place optional daily tools after those primary reading tasks. Keep all five destinations and existing Home modules reachable.
- Let Shelf lead with full-color covers and group search, sorting, collection filters, and add/import tools together. In Explore, show the selected source and search before attributed results. Present Progress as one reading report. Make Settings a short category index leading to focused groups.
- Keep all existing stored palette IDs and preferences while refreshing them as Vanilla, Olive, Parchment, Mist, Stone, Oat, Cocoa, Porcelain, and OLED. OLED uses true black; other surfaces remain tinted neutrals.
- Preserve local storage, navigation events, import controls, reader/viewer entry points, and all existing settings actions. The visual layer does not add external analytics or account flows.

## Sources

- [PwC, Generation Alpha Survey 2026](https://www.pwc.com/us/en/industries/consumer-markets/library/gen-alpha-survey-report.html)
- [Ofcom, Online Nation 2025](https://www.ofcom.org.uk/media-use-and-attitudes/online-habits/from-apps-to-ai-search-how-the-uk-goes-online-in-2025)
- [Apple Developer, Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass)
- [Apple WWDC25, Build a UIKit app with the new design](https://developer.apple.com/videos/play/wwdc2025/284/)
- [Apple Human Interface Guidelines, Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields?changes=_1)
- [Kobo, What's new with the Kobo Winter 2025 update](https://www.kobo.com/blog/whats-new-with-kobo-winter-2025-update/)
- [Google Design, Inside Material 3 Expressive](https://design.google/library/design-notes-material-3-expressive-liam-spradlin)
- [W3C, Understanding Success Criterion 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [W3C, Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow)

## Reading features and shelf review — 19 October 2026

- Apple Books documents independent font, spacing, margin, theme, and page-turn controls. Kobo's Web Reader adds search, table of contents, bookmarks, notes, highlights, one/two columns, and horizontal/vertical direction. These patterns favor a reader with small, independent controls and saved positions rather than one oversized "reading mode" switch.
- Sela already supports single pages, two-page spreads, manga direction, continuous scroll, and Webtoon flow, along with search, bookmarks, notes, highlights, and audio. The gap found in this pass was a reader-comfort preset that combines an optional dyslexia-friendly font with roomier line spacing. Added OpenDyslexic as an opt-in font and profile; it does not replace a reader's existing font or mode.
- Goodreads supports custom bookshelves and recently announced a Did Not Finish shelf. Sela already has collections and reading states; this pass adds persistent manual shelf order, accessible move-earlier/later controls, and a separate Did Not Finish status. The status is included in new backups, while older version-1 backups safely restore it as false.
- The existing Home already includes a calendar, quote/reflection, widgets, and carousel support, and the app already has Phosphor/Lucide icon packages. These were reused instead of adding another calendar, quote, slider, or icon dependency.
- The shelf uses semantic book cards with CSS perspective and a layered shelf board. Three.js `CSS3DRenderer` places DOM elements in a scene graph, but it does not provide the geometry/material treatment needed to justify replacing the current accessible DOM shelf. The 3D shelf now has four material choices, four room backdrops, saved depth and spacing controls, and persistent manual ordering. This is a performance and accessibility choice, not a claim that the shelf simulates a physical room.
- OpenDyslexic is distributed under the SIL Open Font License. Sela bundles the Latin regular and bold WOFF2 files locally, with the license copied to the built app.

### Reading-library sources

- [Apple Books: customize your reading experience](https://support.apple.com/guide/iphone/read-books-iphc1af7c57/27/ios/27)
- [Kobo Web Reader: navigation and reading features](https://help.kobo.com/hc/en-us/articles/35996239522967-Kobo-Web-Reader-Navigation-Reading-Features)
- [Kobo accessibility features](https://help.kobo.com/hc/en-us/articles/32868920931991-Accessibility-Features-Design-Support)
- [OpenDyslexic official site](https://opendyslexic.org/)
- [Goodreads: new Did Not Finish shelf](https://www.goodreads.com/blog/show/3115-new-top-requested-reader-feature-did-not-finish-shelf)
- [Goodreads: custom bookshelves](https://www.goodreads.com/blog/show/1399-goodreads-hack-how-to-create-custom-bookshelves?tab=book)
- [Three.js CSS3DRenderer documentation](https://threejs.org/docs/pages/CSS3DRenderer.html)
