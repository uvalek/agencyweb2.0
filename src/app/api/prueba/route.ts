import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

// Persist trial-request submissions from the /prueba wizard into the
// Supabase project "SuperCerebro" — table public.trial_requests + private
// bucket "trial-uploads" for the two optional files.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "trial-uploads";

// 25 MB per file. Anything bigger is almost certainly abuse for our use case.
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ALLOWED_FILE_PREFIXES = [
  "application/",
  "text/",
  "image/",
  "audio/",
  "video/",
];

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const shortText = z.string().trim().max(200);
const longText = z.string().trim().max(5_000);
const stringArr = z.array(z.string().trim().max(200)).max(20);

const submissionSchema = z.object({
  companyName: shortText.min(1),
  teamSize: shortText.optional().default(""),
  location: shortText.optional().default(""),
  websiteUrl: shortText.optional().default(""),

  platforms: stringArr,

  dailyMessages: shortText.optional().default(""),
  monthlyMessages: shortText.optional().default(""),

  botName: shortText.optional().default(""),
  language: z
    .string()
    .max(20)
    .optional()
    .default(""),

  workingDays: stringArr,
  workingHoursStart: z.string().max(10).optional().default(""),
  workingHoursEnd: z.string().max(10).optional().default(""),

  features: stringArr,

  customFaqs: longText.optional().default(""),

  handoffCases: stringArr,
  handoffOther: longText.optional().default(""),

  hasCrm: z.enum(["", "yes", "no"]).default(""),
  crmName: shortText.optional().default(""),
  crmPreference: shortText.optional().default(""),

  personality: shortText.optional().default(""),

  calendarCount: shortText.optional().default(""),
  calendars: z
    .array(
      z.object({
        name: shortText.optional().default(""),
        hours: shortText.optional().default(""),
      })
    )
    .max(5)
    .default([]),

  contactName: shortText.min(1),
  role: shortText.optional().default(""),
  email: z.string().email().max(200),
  whatsapp: shortText.optional().default(""),
  preferredContact: shortText.optional().default(""),

  manychatStatus: z.enum(["", "yes", "no"]).default(""),

  acceptTerms: z.boolean(),
});

type Submission = z.infer<typeof submissionSchema>;

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

function parseJSON<T>(fd: FormData, key: string): T | undefined {
  const raw = fd.get(key);
  if (raw == null || raw instanceof File) return undefined;
  try {
    return JSON.parse(raw as string) as T;
  } catch {
    return undefined;
  }
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

  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`file_too_large:${prefix}`);
  }
  if (
    file.type &&
    !ALLOWED_FILE_PREFIXES.some((p) => file.type.startsWith(p))
  ) {
    throw new Error(`file_type_not_allowed:${prefix}`);
  }

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
  // 5 submissions / 10 min / IP. Generous enough for one prospect to
  // resubmit if they made a mistake, tight enough to deter scripted spam.
  const limited = await enforceRateLimit(req, "prueba", {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Cloudflare Turnstile verification. If TURNSTILE_SECRET_KEY isn't set
  // in the environment, `verifyTurnstile` returns true so the wizard
  // keeps working in development.
  const turnstileToken = parseJSON<string>(fd, "turnstileToken") ?? "";
  const turnstileOk = await verifyTurnstile(turnstileToken, getClientIp(req));
  if (!turnstileOk) {
    return NextResponse.json(
      { ok: false, error: "captcha_failed" },
      { status: 400 }
    );
  }

  // Reassemble the JSON-encoded fields submitted by the wizard.
  const raw = {
    companyName: parseJSON<string>(fd, "companyName") ?? "",
    teamSize: parseJSON<string>(fd, "teamSize") ?? "",
    location: parseJSON<string>(fd, "location") ?? "",
    websiteUrl: parseJSON<string>(fd, "websiteUrl") ?? "",
    platforms: parseJSON<string[]>(fd, "platforms") ?? [],
    dailyMessages: parseJSON<string>(fd, "dailyMessages") ?? "",
    monthlyMessages: parseJSON<string>(fd, "monthlyMessages") ?? "",
    botName: parseJSON<string>(fd, "botName") ?? "",
    language: parseJSON<string>(fd, "language") ?? "",
    workingDays: parseJSON<string[]>(fd, "workingDays") ?? [],
    workingHoursStart: parseJSON<string>(fd, "workingHoursStart") ?? "",
    workingHoursEnd: parseJSON<string>(fd, "workingHoursEnd") ?? "",
    features: parseJSON<string[]>(fd, "features") ?? [],
    customFaqs: parseJSON<string>(fd, "customFaqs") ?? "",
    handoffCases: parseJSON<string[]>(fd, "handoffCases") ?? [],
    handoffOther: parseJSON<string>(fd, "handoffOther") ?? "",
    hasCrm: parseJSON<string>(fd, "hasCrm") ?? "",
    crmName: parseJSON<string>(fd, "crmName") ?? "",
    crmPreference: parseJSON<string>(fd, "crmPreference") ?? "",
    personality: parseJSON<string>(fd, "personality") ?? "",
    calendarCount: parseJSON<string>(fd, "calendarCount") ?? "",
    calendars:
      parseJSON<{ name: string; hours: string }[]>(fd, "calendars") ?? [],
    contactName: parseJSON<string>(fd, "contactName") ?? "",
    role: parseJSON<string>(fd, "role") ?? "",
    email: parseJSON<string>(fd, "email") ?? "",
    whatsapp: parseJSON<string>(fd, "whatsapp") ?? "",
    preferredContact: parseJSON<string>(fd, "preferredContact") ?? "",
    manychatStatus: parseJSON<string>(fd, "manychatStatus") ?? "",
    acceptTerms: parseJSON<boolean>(fd, "acceptTerms") ?? false,
  };

  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[prueba] validation failed", parsed.error.flatten());
    return NextResponse.json(
      { ok: false, error: "invalid_input" },
      { status: 400 }
    );
  }
  const body: Submission = parsed.data;

  try {
    const supabase = getSupabase();
    const requestId = randomUUID();

    const dbFile = fd.get("dbFile");
    const faqFile = fd.get("faqFile");

    let dbInfo: Awaited<ReturnType<typeof uploadFile>> = null;
    let faqInfo: Awaited<ReturnType<typeof uploadFile>> = null;
    try {
      dbInfo =
        dbFile instanceof File
          ? await uploadFile(supabase, requestId, "db", dbFile)
          : null;
      faqInfo =
        faqFile instanceof File
          ? await uploadFile(supabase, requestId, "faq", faqFile)
          : null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "upload_failed";
      console.error("[prueba] file upload rejected", msg);
      return NextResponse.json(
        { ok: false, error: msg.startsWith("file_") ? msg : "upload_failed" },
        { status: 400 }
      );
    }

    const row = {
      id: requestId,

      company_name: body.companyName,
      team_size: body.teamSize || null,
      location: body.location || null,
      website_url: body.websiteUrl || null,

      platforms: body.platforms,

      daily_messages: body.dailyMessages || null,
      monthly_messages: body.monthlyMessages || null,

      bot_name: body.botName || null,
      language: body.language || null,

      working_days: body.workingDays,
      working_hours_start: body.workingHoursStart || null,
      working_hours_end: body.workingHoursEnd || null,

      features: body.features,

      db_file_path: dbInfo?.path ?? null,
      db_file_name: dbInfo?.name ?? null,
      db_file_size: dbInfo?.size ?? null,
      db_file_type: dbInfo?.type ?? null,

      custom_faqs: body.customFaqs || null,
      faq_file_path: faqInfo?.path ?? null,
      faq_file_name: faqInfo?.name ?? null,
      faq_file_size: faqInfo?.size ?? null,
      faq_file_type: faqInfo?.type ?? null,

      handoff_cases: body.handoffCases,
      handoff_other: body.handoffOther || null,

      has_crm: body.hasCrm || null,
      crm_name: body.crmName || null,
      crm_preference: body.crmPreference || null,

      personality: body.personality || null,

      calendar_count: body.calendarCount || null,
      calendars: body.calendars,

      contact_name: body.contactName,
      role: body.role || null,
      email: body.email,
      whatsapp: body.whatsapp || null,
      preferred_contact: body.preferredContact || null,

      manychat_status: body.manychatStatus || null,

      accept_terms: body.acceptTerms,
    };

    const { error } = await supabase.from("trial_requests").insert(row);
    if (error) {
      console.error("[prueba] insert failed", error);
      return NextResponse.json(
        { ok: false, error: "server_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: requestId });
  } catch (err) {
    console.error("[prueba] error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
