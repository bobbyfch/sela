# Sela Books Design System

The installed reading app has one React entry at `/app/`, built on Mantine 9.7. Public marketing pages and the embeddable Sela reader remain separate products with their own stylesheets.

## Foundations

| Area | Source and rule |
| --- | --- |
| Components | Mantine core components; app-specific composition in [`web/app/ui/screens.tsx`](../web/app/ui/screens.tsx) and [`web/app/ui/app.tsx`](../web/app/ui/app.tsx) |
| Theme | [`web/app/ui/theme.tsx`](../web/app/ui/theme.tsx) coordinates Mantine controls with the app’s light/dark appearance and Sela’s semantic tokens |
| Tokens | [`tokens.css`](../tokens.css) defines paper, ink, glass, shadow, type, and spacing values |
| App styling | [`web/app/ui/app.css`](../web/app/ui/app.css) owns responsive layouts and component skin |
| Public and reader styles | Tailwind entrypoints under `ui/` build the public page and standalone reader outputs independently |
| Icons | Lucide outline icons at a consistent 1.6–1.8 stroke weight; book-cover artwork keeps its original colors |
| Glass | Reserve translucent material for app navigation, compact controls, and transient overlays; keep book pages and text surfaces opaque |
| Responsive layout | Desktop AppShell rail, compact top bar, and bottom navigation on narrow screens; use minmax grids and wrap controls before reducing readable text |
| Accessibility | Visible focus, labeled icon controls, keyboard-operable menus, reduced-motion support, and 44 px primary touch targets |

## Reusable patterns

- `PageHeader` provides consistent page title hierarchy and contextual actions.
- `EmptyState` keeps first-use, filtered-empty, and error recovery clear.
- `AppPreferences` is the shared source for themes, shelf finishes, grid density, widget visibility, language, and reading defaults.
- Mantine `Modal`, `Menu`, `Select`, `Slider`, `Calendar`, `Carousel`, `Spotlight`, `Notifications`, and `Dropzone` supply consistent interaction behavior.
- Setting categories open as routes within the app shell; the back control returns to the settings index.
- The bookshelf supports grid, list, and lazy 3D views; list and grid remain available when WebGL is unavailable.

## Palette and appearance

The app offers eight named palettes: Sela, Rimba, Sakura, Samudra, Lembayung, Kenanga, Senja and Arunika. Light, dark and OLED are appearance choices kept separate from the selected palette. Components consume semantic paper, ink, muted, rule, accent, glass and shadow tokens; book-cover art keeps its original colors.
