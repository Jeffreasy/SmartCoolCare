# Folder structure

This is a description of the current repository layout (as-is).

## Top level

- `src/`: frontend application code.
- `api/`: Vercel serverless functions (Node runtime).
- `public/`: static assets copied as-is.

Important config files:

- `package.json`: scripts and dependencies.
- `vite.config.ts`: Vite config + alias `@` → `./src`.
- `tsconfig.json` / `tsconfig.app.json`: TypeScript baseUrl + path mapping for `@/*`.
- `tailwind.config.js` + `postcss.config.js`: Tailwind/PostCSS pipeline.
- `components.json`: shadcn/ui generator config and aliases.
- `vercel.json`: Vercel build + routing configuration.

Note: imports using `@/…` resolve to the `src/` folder. This is configured in:

- Vite: `resolve.alias` in `vite.config.ts`
- TypeScript: `compilerOptions.paths` in `tsconfig.json` / `tsconfig.app.json`

## `src/` (frontend)

Key entrypoints:

- `src/main.tsx`: React root mount.
- `src/App.tsx`: page composition (Navbar + section components + Footer + utilities).

Main subfolders:

- `src/components/layout/`: layout primitives like `Navbar`, `Footer`, wrappers (`Container`, `Section`).
- `src/components/sections/`: the landing-page sections rendered by `App`.
- `src/components/shared/`: shared widgets used across sections (e.g. `DemoModal`, motion wrappers).
- `src/components/ui/`: shadcn-style UI components (Button, Card, Dialog, Toast, etc).
- `src/hooks/`: reusable hooks (currently `use-toast.ts`).
- `src/lib/`: utilities (`utils.ts`), animation variants, shared styling constants (`styles.ts`), and content constants (`constants/`).
  - `src/lib/theme/` exists but currently contains no files (there is no `colors.ts`).

## `api/` (serverless)

- `api/submit.ts`: form submission endpoint that sends email via SMTP using `nodemailer`.

## `public/`

Static assets referenced by `index.html` (favicons, OG image, logo, etc).

