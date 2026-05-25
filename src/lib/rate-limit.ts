// Tiny in-memory rate limiter. Good enough for low-traffic protection
// of public endpoints and login attempts on a single Vercel region.
//
// For multi-region or higher scale, swap this module for
// `@upstash/ratelimit` backed by Upstash Redis. The public API
// (`check`) is intentionally Promise-shaped so the migration is a
// drop-in change.
//
// Each tracked key (usually IP, optionally suffixed with the endpoint
// name) keeps a sliding window of timestamps. Old entries are
// trimmed on each access; idle entries are evicted by a background
// sweep to prevent unbounded growth.

type Bucket = {
  hits: number[];
};

const STORE = new Map<string, Bucket>();
const SWEEP_INTERVAL_MS = 60_000;

// Lazy background sweep — runs only once per server instance lifecycle.
if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as { __ratelimitSweep?: boolean };
  if (!g.__ratelimitSweep) {
    g.__ratelimitSweep = true;
    setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of STORE.entries()) {
        // Anything older than 1h is gone.
        bucket.hits = bucket.hits.filter((t) => now - t < 60 * 60 * 1000);
        if (bucket.hits.length === 0) STORE.delete(key);
      }
    }, SWEEP_INTERVAL_MS).unref?.();
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Hits in the current window. */
  count: number;
  /** ms until the user is allowed again. 0 if `ok`. */
  retryAfterMs: number;
};

export type RateLimitOptions = {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export async function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): Promise<RateLimitResult> {
  const now = Date.now();
  const bucket = STORE.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    const retryAfterMs = Math.max(0, windowMs - (now - oldest));
    STORE.set(key, bucket);
    return { ok: false, count: bucket.hits.length, retryAfterMs };
  }

  bucket.hits.push(now);
  STORE.set(key, bucket);
  return { ok: true, count: bucket.hits.length, retryAfterMs: 0 };
}

/**
 * Extracts the caller IP from a Request. Falls back to "unknown" so
 * we always end up with *some* key — better to occasionally
 * rate-limit the unknown bucket than to error out.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/**
 * Convenience: throws a 429 Response if the call exceeds the limit.
 * Useful inside `try { ... }` blocks where we want to bail fast.
 */
export async function enforceRateLimit(
  req: Request,
  endpoint: string,
  opts: RateLimitOptions
): Promise<Response | null> {
  const ip = getClientIp(req);
  const result = await rateLimit(`${endpoint}:${ip}`, opts);
  if (result.ok) return null;
  const retryAfter = Math.ceil(result.retryAfterMs / 1000);
  return new Response(
    JSON.stringify({ ok: false, error: "rate_limited" }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}
