# Frontend components

This doc describes component groupings visible in `src/components/`.

## `src/components/layout/`

Layout primitives and site-level chrome.

Notable components:

- `Navbar.tsx`: sticky header with desktop and mobile navigation; uses a sheet for mobile.
- `Footer.tsx`: footer wrapper.
- `Container.tsx`: width constraint + padding wrapper.
- `Section.tsx`: section wrapper with optional background; **includes** an internal `Container`.
- `CookieConsentBar.tsx`: cookie consent UI; currently only hides itself via in-component state (no persistence mechanism is implemented in this file).

### `Section` / `Container` convention

- Use `Section` as the outer wrapper for landing-page sections.
- Do **not** add an extra `Container` directly under `Section` (it already renders one internally).
- Use `Container` directly only when you are *not* inside a `Section` (e.g. bespoke layout needs in navigation/footer/chrome).

## `src/components/sections/`

Page sections rendered by `src/App.tsx`.

These sections generally use:

- `Section` as the layout wrapper (no nested `Container`)
- `framer-motion` variants from `src/lib/animations/variants.ts`
- content constants from `src/lib/constants/*`
- shared section primitives like `SectionHeading` and `StaggerInView`

## `src/components/shared/`

Reusable widgets.

- `DemoModal.tsx`: form modal/sheet component that submits data to `/api/submit`.
- `BackToTop.tsx`: scroll-to-top button.
- `PricingCard.tsx`, `CheckItem.tsx`: section helpers.
- `SectionHeading.tsx`: standardized section header (title + optional subtitle). Use at the top of section content for consistent typography/alignment.
- `StaggerInView.tsx`: framer-motion wrapper that applies shared in-view defaults and `staggerContainer`; includes reduced-motion handling.
- `FadeInUpBlock.tsx`: wrapper for the common `fadeInUp` animation block; includes reduced-motion handling.
- `StaggerGrid.tsx`: wrapper for the common `staggerContainer` grid container; includes reduced-motion handling.

### Shared styling constants

For small, repeated Tailwind class blocks, shared constants live in `src/lib/styles.ts` (e.g. CTA button classes, responsive 3-column grid, muted lead text).

## `src/components/ui/`

Shadcn-style UI components.

This folder includes wrappers/adapters over Radix primitives (e.g. Accordion, Dialog, Toast) and app-level UI primitives (Button, Card, Input, Textarea, Table, etc).

