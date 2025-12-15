# Tooling & development

## Package scripts

Defined in `package.json`:

- `dev`: `vite`
- `build`: `tsc -b && vite build`
- `lint`: `eslint .`
- `preview`: `vite preview`

Install dependencies:

- `npm install`

## Dev server

`vite.config.ts` sets:

- `server.port = 3000`
- `server.host = true`

So local development runs on `http://localhost:3000`.

## Module resolution / aliases

There are two relevant alias configs:

- TypeScript paths: `@/*` → `./src/*` in `tsconfig.json` and `tsconfig.app.json`.
- Vite alias: `@` → `./src` in `vite.config.ts`.

## Styling

- Tailwind is configured in `tailwind.config.js`.
- PostCSS plugins are defined in `postcss.config.js`.
- Global CSS entry for Tailwind layers is `src/index.css`.

## Vercel build

`vercel.json` defines:

- `api/**/*.ts` built with `@vercel/node`
- a static build from `package.json` outputting `dist/`

## Minimal verification

- Build: `npm run build`
- Lint: `npm run lint`

