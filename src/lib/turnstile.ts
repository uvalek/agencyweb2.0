// Server-side verification of a Cloudflare Turnstile token.
//
// Returns:
//   - true  → token valid (or no secret configured, so we don't break
//             local/dev/test environments).
//   - false → token missing, expired, replayed or rejected by Cloudflare.

const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  // Backwards-compatible: if not configured, treat as pass-through so
  // a missing env var never bricks the site. Production should always
  // have this set.
  if (!secret) return true;

  if (!token) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.error("[turnstile] siteverify HTTP", res.status);
      return false;
    }
    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) {
      console.warn("[turnstile] verification failed", data["error-codes"]);
    }
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] siteverify exception", err);
    return false;
  }
}
