# Backend: `/api/submit`

Source file: `api/submit.ts`.

## Purpose

- Receives demo request form data from the frontend.
- Sends an email using SMTP via `nodemailer`.

## HTTP behaviour

- Always sets `Content-Type: application/json; charset=utf-8`.
- Sets CORS headers via `setCorsHeaders(req, res)`.

Supported methods:

- `OPTIONS`: returns `{ ok: true, preflight: true }`.
- `POST`: validates fields and attempts to send mail.
- Other methods: returns `405` with `{ ok: false, error: "Alleen POST toegestaan", method }`.

## Request body

The handler parses `req.body` as JSON if it is a string; otherwise accepts it if it is an object.

Expected fields (required):

- `name`
- `company`
- `email`

Optional:

- `phone`
- `message`

If required fields are missing, it returns `400` with `Missing required fields: name, company, email`.

### Example request (as sent by the frontend)

`src/components/shared/DemoModal.tsx` sends JSON to `/api/submit`:

```json
{
  "name": "...",
  "company": "...",
  "email": "...",
  "phone": "...",
  "message": "..."
}
```

## Environment variables

The SMTP configuration is taken from `process.env`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE` (parsed via `parseBooleanEnv`)
- `SMTP_USER`
- `SMTP_PASS`
- `TO_EMAIL`

If any required SMTP env vars are missing, it returns `500` with `Email service not configured`.

## Response contract (observed)

- Success: `200` with `{ ok: true }`.
- Failure: `4xx/5xx` with `{ ok: false, error: string }`.

Frontend expectation:

- `src/components/shared/DemoModal.tsx` expects JSON with `{ ok: true }` on success.

### Example responses

Success:

```json
{ "ok": true }
```

Error:

```json
{ "ok": false, "error": "..." }
```

