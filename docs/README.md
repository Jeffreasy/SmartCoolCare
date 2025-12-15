# SmartCool Care — Developer Documentation

Scope: this documentation is **developer-only** and is written strictly from what exists in the repository (no external assumptions).

## Quick links (start here)

- Architecture overview: `docs/architecture/overview.md`
- Folder structure: `docs/architecture/folder-structure.md`
- Frontend entrypoints: `docs/frontend/entrypoints.md`
- Frontend components: `docs/frontend/components.md`
- Content/constants: `docs/frontend/content-constants.md`
- Backend endpoint `/api/submit`: `docs/backend/api-submit.md`
- Tooling & commands: `docs/tooling/development.md`

## Repo facts (source-of-truth pointers)

- Toolchain & scripts are defined in `package.json` (e.g. `dev`, `build`, `lint`).
- Vite configuration and path alias `@ -> ./src` are in `vite.config.ts`.
- Runtime entrypoints are `index.html` → `src/main.tsx` → `src/App.tsx`.
- Serverless functions live under `api/` (Vercel Node runtime), e.g. `api/submit.ts`.

## Naming & navigation conventions (from code)

- The UI is composed as a **single page** with multiple sections rendered in `src/App.tsx`.
- Navigation uses hash anchors (e.g. `#hero`, `#pricing`) defined in `src/components/layout/Navbar.tsx`.

## Current implementation conventions (keep consistent)

### Layout

- Sections are built with `Section` (which renders an internal `Container`).
- Avoid nesting `Container` directly under `Section`.

### Animation

Sections typically use these shared motion primitives:

- `StaggerInView` for in-view orchestration (with reduced-motion handling).
- `FadeInUpBlock` for a standard `fadeInUp` enter animation (with reduced-motion handling).
- `StaggerGrid` for grid containers using `staggerContainer` (with reduced-motion handling).

### Styling

Small, repeated Tailwind class blocks are centralized in `src/lib/styles.ts`.

