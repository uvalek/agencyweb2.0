import { createClient } from "@supabase/supabase-js";

// Strip accidentally-pasted REST/Auth path suffixes and trailing slashes
// from the URL. The Supabase client expects the bare project URL like
// "https://xxxxx.supabase.co".
export function normalizeSupabaseUrl(raw: string): string {
  let url = raw.trim();
  url = url.replace(/\/rest\/v1\/?$/i, "");
  url = url.replace(/\/auth\/v1\/?$/i, "");
  url = url.replace(/\/storage\/v1\/?$/i, "");
  url = url.replace(/\/$/, "");
  return url;
}

// Server-only client that uses the service-role key. Bypasses RLS — never
// import this from client components.
export function createSupabaseAdminClient() {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }
  return createClient(normalizeSupabaseUrl(rawUrl), key.trim(), {
    auth: { persistSession: false },
  });
}
