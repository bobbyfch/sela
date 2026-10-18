# Sela Design System

Sela shares one visual foundation across its public site, app shell, app reader, and standalone viewer. Product palettes remain semantic and can change independently; type, control sizing, radii, elevation, motion, and component behavior use shared tokens.

## Foundations

The source of truth is [`ui/design-system.css`](../ui/design-system.css). Each Tailwind entry imports it so the same tokens are available in the independently built CSS bundles.

| Area | Shared rule |
| --- | --- |
| UI type | System sans for controls and interface copy; editorial serif reserved for long-form or literary display text |
| Type scale | Meta, caption, label, button, body, body-large, title-small, and title tokens with paired line heights |
| Spacing | Tailwind's 4 px base scale plus named control heights at 32, 36, 40, and 44 px |
| Radius | Compact control, standard control, popover, surface, dialog, and pill tokens |
| Elevation | Control, card, popover, and modal shadow tokens |
| Motion | Shared easing and fast/normal durations; honor reduced-motion preferences |
| Color | Semantic canvas, surface, ink, muted, line, accent, primary, secondary, destructive, and focus-ring aliases |
| Accessibility | Visible focus, disabled and invalid states, readable type hierarchy, and a shared 44 px touch-target token |
| Icons and artwork | Rounded Lucide outline controls, a custom minimal book mark, and transparent original companion art; avoid mixing icon weights or using brand marks as decoration |
| Glass surfaces | Use translucent material for navigation and short-lived controls; keep reading surfaces opaque and legible |

## Component inventory

| Component family | Source of truth |
| --- | --- |
| Buttons and button variants | [`ui/components/ui/button.tsx`](../ui/components/ui/button.tsx) |
| Native select | [`ui/components/ui/native-select.tsx`](../ui/components/ui/native-select.tsx) |
| Dialog, overlay, title, description, footer | [`ui/components/ui/dialog.tsx`](../ui/components/ui/dialog.tsx) |
| Popover, title, description | [`ui/components/ui/popover.tsx`](../ui/components/ui/popover.tsx) |
| App navigation and control-sheet host | [`app/mobile/react-app.tsx`](../app/mobile/react-app.tsx) |
| Home, widgets, timer, weather, quotes, prayer times | `ui/app-redesign-utilities.css`, `ui/home-responsive-utilities.css`, `app/library/home-*.ts`, `app/library/weather.ts`, and `app/library/prayer-times.ts` |
| Shelf, book covers, collections, book actions | `ui/app-tailwind-utilities.css`, `ui/app-redesign-utilities.css`, and `app/library/*` shelf/catalog modules |
| Explore, catalog, search, filters | `ui/app-tailwind-utilities.css`, `ui/app-redesign-utilities.css`, and `app/library/discovery.ts`, `catalog.ts`, `smart-search.ts` |
| Progress and reading controls | `ui/app-redesign-utilities.css`, `ui/app-reader-utilities.css`, and `app/library/reading-*.ts` |
| Settings, preferences, dialogs, and forms | `ui/app-tailwind-utilities.css`, `ui/app-redesign-utilities.css`, `ui/app-reader-utilities.css`, and `app/library/advanced.ts`, `controls.ts` |
| Shared reader chrome and reader settings | `ui/app-reader-utilities.css` and `ui/pages/reader.tsx` |
| Standalone viewer controls and reading surfaces | `ui/viewer-tailwind-utilities.css` |
| Public landing page and embed demo | `ui/public-tailwind.css` and `ui/pages/public.tsx` |

## Component rules

- Use the shared `Button`, `NativeSelect`, `Dialog`, and `Popover` primitives for React surfaces. Keep page-specific layout in the page; keep base size, focus, radius, and state behavior in the primitive.
- Use semantic color utilities instead of fixed light/dark colors. Palette and theme selectors own the semantic values.
- Use the shared radius and shadow tokens for controls, cards, popovers, and dialogs. Avoid one-off pixel radii for these component families.
- Use semantic text utilities for controls and interface metadata. Serif type is an intentional reading/editorial treatment, not a UI fallback.
- Use the 44 px token for primary touch targets. Compact variants remain for dense desktop or secondary actions; do not use them for primary touch actions.
- Keep loading, empty, disabled, invalid, hover, focus, selected, and reduced-motion states in the same component family.
- Settings is an index of labeled categories; each category opens as a full-page view with a back control. Keep multi-step preferences within that route.

## Built surfaces

`mobile-tailwind.css`, `app-reader-tailwind.css`, `viewer-tailwind.css`, and `public-tailwind.css` import the same token source. The build emits separate scoped bundles so CDN integrations and the app can retain their existing contracts while sharing the design language.
