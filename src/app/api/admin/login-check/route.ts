import { NextResponse } from "next/server";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

// Lightweight gatekeeper the login form calls before reaching out to
// Supabase Auth from the browser. It enforces:
//   - rate limit by IP (defence in depth over Supabase's own quota)
//   - Cloudflare Turnstile captcha verification when configured
//
// Supabase Auth still hashes/validates the password itself.

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "admin-login", {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  let captchaToken = "";
  try {
    const body = (await req.json()) as { captchaToken?: string };
    captchaToken = (body.captchaToken ?? "").toString();
  } catch {
    // Allow legacy callers without a body to fall through to the
    // verifier; if Turnstile is configured it will reject the empty
    // token.
  }

  const ok = await verifyTurnstile(captchaToken, getClientIp(req));
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "captcha_failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
