import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit, getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Server-side proxy between the chat widget and the VPS-hosted chatbot.
//
// Browsers never reach the VPS directly anymore. That gives us:
//   - one place to apply rate-limits and prompt-injection logging
//   - the freedom to add an API key / signed request to the VPS later
//     without touching the client bundle
//   - an obvious chokepoint to kill traffic if we get abused.

const CHATBOT_URL =
  process.env.CHATBOT_URL ?? process.env.NEXT_PUBLIC_CHATBOT_URL;

const MAX_INPUT_LEN = 4_000;

const bodySchema = z.object({
  chat_id: z.string().trim().min(1).max(120),
  text: z.string().trim().min(1).max(MAX_INPUT_LEN),
});

// Heuristics for "obvious" prompt-injection attempts. Far from perfect, but
// catches the classic copy-paste payloads so we can monitor abuse.
const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all|any|previous) (instructions|prompts?)/i,
  /disregard (the )?(above|previous|prior) (instructions|system|prompt)/i,
  /act as (?:a |an )?(?:different|new|unrestricted|jailbroken)/i,
  /you are now (?:a |an )?(?:dan|jailbroken|developer mode)/i,
  /forget (?:everything|your training|the rules)/i,
  new RegExp("<\\/?\\s*system\\s*>", "i"),
];

// Simple global circuit breaker — if the whole site sees more than 200
// chat requests in a minute we shed load until traffic calms down.
const GLOBAL_BREAKER = { limit: 200, windowMs: 60_000 };

export async function POST(req: Request) {
  if (!CHATBOT_URL) {
    console.error("[chat] missing CHATBOT_URL env var");
    return NextResponse.json(
      { ok: false, error: "service_unavailable" },
      { status: 503 }
    );
  }

  // Per-IP rate limits. Two windows: a sustained one and a tight burst one.
  const ipLimited = await enforceRateLimit(req, "chat:ip", {
    limit: 30,
    windowMs: 5 * 60 * 1000,
  });
  if (ipLimited) return ipLimited;
  const burst = await enforceRateLimit(req, "chat:burst", {
    limit: 8,
    windowMs: 1_000,
  });
  if (burst) return burst;

  // Global breaker keyed on a constant — same module, single server instance.
  const globalCheck = await rateLimit("chat:global", GLOBAL_BREAKER);
  if (!globalCheck.ok) {
    console.warn("[chat] global breaker engaged");
    return NextResponse.json(
      { ok: false, error: "busy" },
      {
        status: 503,
        headers: {
          "Retry-After": String(Math.ceil(globalCheck.retryAfterMs / 1000)),
        },
      }
    );
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "invalid_input" },
        { status: 400 }
      );
    }
    payload = parsed.data;
  } catch {
    return NextResponse.json(
      { ok: false, error: "bad_request" },
      { status: 400 }
    );
  }

  if (INJECTION_PATTERNS.some((re) => re.test(payload.text))) {
    console.warn(
      "[chat] suspicious prompt-injection attempt",
      JSON.stringify({
        ip: getClientIp(req),
        chat_id: payload.chat_id,
        preview: payload.text.slice(0, 120),
      })
    );
    // Don't block — let the upstream model handle it, but flag it for review.
  }

  // Shared secret with the chatbot VPS. When set, the upstream rejects
  // any request that doesn't carry this header — so only this proxy can
  // talk to it. Has to match WEBCHAT_API_KEY in EasyPanel.
  const upstreamKey = process.env.WEBCHAT_API_KEY?.trim();
  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (upstreamKey) upstreamHeaders["X-API-Key"] = upstreamKey;

  try {
    const res = await fetch(`${CHATBOT_URL}/api/webchat`, {
      method: "POST",
      headers: upstreamHeaders,
      body: JSON.stringify(payload),
      // 30s gives the model plenty of room; anything longer is almost
      // certainly a stuck connection.
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      console.error("[chat] upstream failed", res.status);
      return NextResponse.json(
        { ok: false, error: "upstream_error" },
        { status: 502 }
      );
    }
    const data = (await res.json()) as { chunks?: string[] };
    return NextResponse.json({ chunks: data.chunks ?? [] });
  } catch (err) {
    console.error("[chat] upstream exception", err);
    return NextResponse.json(
      { ok: false, error: "upstream_error" },
      { status: 502 }
    );
  }
}
