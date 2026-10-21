# Sela Books — A quiet reading library

**Status:** Product design reference, checked 2026-10-21  
**Scope:** One responsive installed reading app at `/app/`. Public marketing pages keep their own presentation.

## Product stance

Sela is a personal library, reading room, and place to return to a book. The interface gives book covers the color and presence; navigation and tools stay quiet. It avoids dashboard clutter and keeps the next useful action obvious.

Audience: people reading their own books, comics, and documents across desktop and mobile. Tone: editorial, modern, warm, calm, and lightly expressive.

## Structure

- **Primary macrostructure:** Ecosystem Index. Surface distinct views of a user's collection through titled rails, reading states, a compact calendar, and a searchable command palette.
- **Desktop:** stable left navigation rail, slim utility bar, and a single content canvas capped at 86rem. Start with the current book, then shelves and reading rhythm.
- **Mobile:** one reading column, concise top utility row, and a floating five-item tab dock. All tap targets are at least 44px.
- **Shelf:** customizable 3D bookcase with accessible grid and list views. Use actual covers where available and generated typographic jackets where they are not. Never grayscale covers.
- **Settings:** one index with focused subpages. Subpages use a back icon and browser history; simple options remain inline.
- **Reader:** dedicated distraction-light route with distinct book and document modes. Keep page content matte and free of navigation glass.

## Component framework

The installed reader uses **Mantine 9.7** as its React UI framework for the app shell, navigation, inputs, dialogs, selectors, calendar, notifications, carousel, drag-and-drop book import, and keyboard-driven Spotlight search. A shared Mantine theme keeps component focus, spacing, and control behavior consistent. Sela-specific CSS defines page composition, eight named palettes, book jackets, and restrained glass on navigation and controls. Light, dark and OLED appearance remain separate from the selected palette. The public marketing site remains separate.

React 19.3, TypeScript 7, Vite 8, and React Router stay in place. Hash-based routes keep nested pages available on static hosting. React Three Fiber 9 with Drei loads only when the 3D shelf view is opened; it renders on demand and has a keyboard-accessible book index alongside its canvas.

## Visual system

Theme: **Quill & Glass**. Use local Newsreader for display type and local DM Sans for interface text. A four-pixel spacing scale governs layout. Named tokens are the source of colors, theme values, and font declarations.

The named palettes are Sela, Rimba, Sakura, Samudra, Lembayung, Kenanga, Senja and Arunika. Light, dark and OLED are separate appearance choices. Each palette keeps text, controls and surfaces readable while book artwork retains its original colors. Controls and navigation use restrained Liquid Glass with a fine edge and soft shadow. Content canvases, cards, reader pages, and book covers stay opaque and matte. Do not stack glass surfaces.

Icons come from one line-icon family, Lucide. Shadows give navigation and elevated actions depth without making every surface float.

## Behavior and accessibility

- Store books and files in the existing local IndexedDB database. The application does not upload books.
- Use HashRouter so nested app pages and Settings Back work on static hosting without route rewrites.
- Lazy-load the WebGL bookcase. Use React Three Fiber 9 with `frameloop="demand"`; provide the same books in an accessible index and a grid/list fallback.
- Support keyboard focus, reduced motion and reduced transparency, visible errors, one-line navigation labels, and 320–1920px layouts.
- Reader choices include page, book spread, continuous scroll, manga direction, and webtoon modes where supported by the document.

## Research basis

Apple's Liquid Glass guidance reserves the material for navigation and controls, keeping content prominent. Mantine supplies consistent prebuilt React controls and extensions while allowing Sela's own theme. Notion shows the value of several views over the same data. Goodreads makes reading status and custom shelves meaningful. Apple Books and Kobo expose type, page background, layout, and reading mode controls. Sela applies those ideas to a local-first personal library rather than copying another product's layout.
