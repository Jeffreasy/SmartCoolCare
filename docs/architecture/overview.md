# Architecture overview

This repository contains:

1) A Vite + React + TypeScript frontend (client bundle)
2) A Vercel serverless function under `api/` used by the frontend

## Frontend runtime

- `index.html` loads the application bundle via `src/main.tsx`.
- `src/main.tsx` renders the React root and mounts `App`.
- `src/App.tsx` composes the page out of multiple section components.

### Shared frontend conventions

Motion/styling patterns are centralized in shared primitives:

- `src/components/shared/StaggerInView.tsx`
- `src/components/shared/FadeInUpBlock.tsx`
- `src/components/shared/StaggerGrid.tsx`
- `src/lib/styles.ts`

## Backend runtime (Vercel)

- `vercel.json` configures two builds:
  - `api/**/*.ts` using `@vercel/node`
  - a static build from `package.json` outputting to `dist`

The only serverless endpoint currently in the repo is:

- `api/submit.ts` — handles `POST` and `OPTIONS` and sends email via `nodemailer`.

## Request flow: demo form submit

The modal form component `src/components/shared/DemoModal.tsx` submits to the serverless endpoint.

```mermaid
flowchart LR
  A[Browser] --> B[React app]
  B --> C[DemoModal form]
  C -->|fetch POST| D[/api/submit]
  D --> E[Nodemailer]
  E --> F[SMTP server]
```

Implementation pointers:

- Client submit: `fetch("/api/submit", { method: "POST", ... })` in `src/components/shared/DemoModal.tsx`.
- Serverless handler: default export `handler(req, res)` in `api/submit.ts`.


