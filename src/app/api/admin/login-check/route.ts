import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Lightweight gatekeeper the login form calls before reaching out to
// Supabase Auth from the browser. It only enforces a rate limit by IP
// so we don't lean entirely on Supabase's quota for credential-stuffing
// protection. Supabase Auth still hashes/validates the password itself.

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "admin-login", {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;
  return NextResponse.json({ ok: true });
}
