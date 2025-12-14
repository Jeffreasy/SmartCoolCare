import nodemailer from "nodemailer";

type Req = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type Res = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => Res;
  json: (body: unknown) => void;
};

type SubmitBody = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
};

function getHeaderValue(
  headers: Req["headers"],
  key: string
): string | undefined {
  if (!headers) return undefined;
  const value = headers[key] ?? headers[key.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) return false;
  return value === "true" || value === "1" || value === "yes";
}

function parseBody(body: unknown): SubmitBody {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      const parsed: unknown = JSON.parse(body);
      if (parsed && typeof parsed === "object") return parsed as SubmitBody;
      return {};
    } catch {
      return {};
    }
  }
  if (typeof body === "object") return body as SubmitBody;
  return {};
}

function requireNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

export default async function handler(req: Req, res: Res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const body = parseBody(req.body);

  const name = requireNonEmptyString(body.name);
  const company = requireNonEmptyString(body.company);
  const email = requireNonEmptyString(body.email);
  const phone = requireNonEmptyString(body.phone) ?? "";
  const message = requireNonEmptyString(body.message) ?? "";

  if (!name || !company || !email) {
    return res.status(400).json({
      ok: false,
      error: "Missing required fields: name, company, email",
    });
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    TO_EMAIL,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !TO_EMAIL) {
    return res
      .status(500)
      .json({ ok: false, error: "Email service not configured" });
  }

  const port = Number(SMTP_PORT);
  if (!Number.isFinite(port) || port <= 0) {
    return res
      .status(500)
      .json({ ok: false, error: "Invalid SMTP_PORT" });
  }

  const secure = parseBooleanEnv(SMTP_SECURE);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const forwardedFor = getHeaderValue(req.headers, "x-forwarded-for") ?? "";
  const userAgent = getHeaderValue(req.headers, "user-agent") ?? "";

  const subject = `New demo request: ${company}`;
  const text = [
    "New demo request received.",
    "",
    `Name: ${name}`,
    `Company: ${company}`,
    `Email: ${email}`,
    `Phone: ${phone || "(not provided)"}`,
    "",
    `Message: ${message || "(not provided)"}`,
    "",
    `x-forwarded-for: ${forwardedFor || "(not available)"}`,
    `user-agent: ${userAgent || "(not available)"}`,
  ].join("\n");

  try {
    await transporter.sendMail({
      to: TO_EMAIL,
      from: SMTP_USER,
      replyTo: email,
      subject,
      text,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("/api/submit failed to send email", error);
    return res.status(500).json({ ok: false, error: "Failed to send email" });
  }
}

