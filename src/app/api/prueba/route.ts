import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

// Persist trial-request submissions from the /prueba wizard into the
// Supabase project "SuperCerebro" — table public.trial_requests + private
// bucket "trial-uploads" for the two optional files.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "trial-uploads";

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing Supabase env vars (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

function jsonField<T>(fd: FormData, key: string, fallback: T): T {
  const raw = fd.get(key);
  if (raw == null) return fallback;
  if (raw instanceof File) return fallback;
  try {
    return JSON.parse(raw as string) as T;
  } catch {
    return fallback;
  }
}

function strField(fd: FormData, key: string): string {
  const v = jsonField<string | null>(fd, key, null);
  return typeof v === "string" ? v : "";
}

function strArrField(fd: FormData, key: string): string[] {
  const v = jsonField<string[]>(fd, key, []);
  return Array.isArray(v) ? v.map(String) : [];
}

function boolField(fd: FormData, key: string): boolean {
  const v = jsonField<boolean>(fd, key, false);
  return Boolean(v);
}

function jsonbField<T>(fd: FormData, key: string, fallback: T): T {
  return jsonField<T>(fd, key, fallback);
}

async function uploadFile(
  client: ReturnType<typeof getSupabase>,
  requestId: string,
  prefix: "db" | "faq",
  file: File
): Promise<{
  path: string;
  name: string;
  size: number;
  type: string;
} | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  // Sanitize filename to keep the original name without surprises.
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const path = `${requestId}/${prefix}-${safeName}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error } = await client.storage.from(BUCKET).upload(path, buf, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) {
    console.error(`[prueba] upload ${prefix} failed`, error);
    return null;
  }
  return { path, name: file.name, size: file.size, type: file.type };
}

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const supabase = getSupabase();
    const requestId = randomUUID();

    // Files first — if either upload fails we still try to save the row.
    const dbFile = fd.get("dbFile");
    const faqFile = fd.get("faqFile");
    const dbInfo =
      dbFile instanceof File ? await uploadFile(supabase, requestId, "db", dbFile) : null;
    const faqInfo =
      faqFile instanceof File ? await uploadFile(supabase, requestId, "faq", faqFile) : null;

    const row = {
      id: requestId,

      // Empresa
      company_name: strField(fd, "companyName"),
      team_size: strField(fd, "teamSize") || null,
      location: strField(fd, "location") || null,
      website_url: strField(fd, "websiteUrl") || null,

      // Plataformas
      platforms: strArrField(fd, "platforms"),

      // Volumen
      daily_messages: strField(fd, "dailyMessages") || null,
      monthly_messages: strField(fd, "monthlyMessages") || null,

      // Bot
      bot_name: strField(fd, "botName") || null,
      language: strField(fd, "language") || null,

      // Horarios
      working_days: strArrField(fd, "workingDays"),
      working_hours_start: strField(fd, "workingHoursStart") || null,
      working_hours_end: strField(fd, "workingHoursEnd") || null,

      // Funciones
      features: strArrField(fd, "features"),

      // DB file
      db_file_path: dbInfo?.path ?? null,
      db_file_name: dbInfo?.name ?? null,
      db_file_size: dbInfo?.size ?? null,
      db_file_type: dbInfo?.type ?? null,

      // FAQs
      custom_faqs: strField(fd, "customFaqs") || null,
      faq_file_path: faqInfo?.path ?? null,
      faq_file_name: faqInfo?.name ?? null,
      faq_file_size: faqInfo?.size ?? null,
      faq_file_type: faqInfo?.type ?? null,

      // Handoff
      handoff_cases: strArrField(fd, "handoffCases"),
      handoff_other: strField(fd, "handoffOther") || null,

      // CRM
      has_crm: strField(fd, "hasCrm") || null,
      crm_name: strField(fd, "crmName") || null,
      crm_preference: strField(fd, "crmPreference") || null,

      // Personalidad
      personality: strField(fd, "personality") || null,

      // Calendarios
      calendar_count: strField(fd, "calendarCount") || null,
      calendars: jsonbField<unknown[]>(fd, "calendars", []),

      // Contacto
      contact_name: strField(fd, "contactName"),
      role: strField(fd, "role") || null,
      email: strField(fd, "email"),
      whatsapp: strField(fd, "whatsapp") || null,
      preferred_contact: strField(fd, "preferredContact") || null,

      // Third-party
      manychat_status: strField(fd, "manychatStatus") || null,

      // Terms
      accept_terms: boolField(fd, "acceptTerms"),
    };

    const { error } = await supabase
      .from("trial_requests")
      .insert(row);

    if (error) {
      console.error("[prueba] insert failed", error);
      return NextResponse.json(
        { ok: false, error: "db_insert_failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: requestId });
  } catch (err) {
    console.error("[prueba] error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
