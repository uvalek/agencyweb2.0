import { createBrowserClient } from "@supabase/ssr";

function normalize(raw: string): string {
  let url = raw.trim();
  url = url.replace(/\/rest\/v1\/?$/i, "");
  url = url.replace(/\/auth\/v1\/?$/i, "");
  url = url.replace(/\/storage\/v1\/?$/i, "");
  url = url.replace(/\/$/, "");
  return url;
}

// Client-side Supabase client. Used by the login form.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    normalize(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim()
  );
}
