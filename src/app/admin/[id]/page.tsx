import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileText,
  HelpCircle,
  Layers,
  MessageSquare,
  Plug,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type FullRequest = {
  id: string;
  created_at: string;
  company_name: string;
  team_size: string | null;
  location: string | null;
  website_url: string | null;
  platforms: string[] | null;
  daily_messages: string | null;
  monthly_messages: string | null;
  bot_name: string | null;
  language: string | null;
  working_days: string[] | null;
  working_hours_start: string | null;
  working_hours_end: string | null;
  features: string[] | null;
  db_file_path: string | null;
  db_file_name: string | null;
  db_file_size: number | null;
  db_file_type: string | null;
  custom_faqs: string | null;
  faq_file_path: string | null;
  faq_file_name: string | null;
  faq_file_size: number | null;
  faq_file_type: string | null;
  handoff_cases: string[] | null;
  handoff_other: string | null;
  has_crm: string | null;
  crm_name: string | null;
  crm_preference: string | null;
  personality: string | null;
  calendar_count: string | null;
  calendars: Array<{ name: string; hours: string }> | null;
  contact_name: string;
  role: string | null;
  email: string;
  whatsapp: string | null;
  preferred_contact: string | null;
  manychat_status: string | null;
  accept_terms: boolean | null;
};

const PLATFORM_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  instagram: "Instagram",
  website: "Sitio web (widget)",
  telegram: "Telegram",
};

const FEATURE_LABELS: Record<string, string> = {
  scheduling: "Agendamiento automático",
  properties: "Muestra de propiedades",
  faqs: "Preguntas frecuentes",
  "lead-capture": "Captura al CRM",
  qualification: "Calificación de leads",
  reminders: "Recordatorios",
};

const PERSONALITY_LABELS: Record<string, string> = {
  formal: "Formal / Corporativo",
  "pro-friendly": "Profesional pero amigable",
  casual: "Casual y cercano",
  juvenil: "Juvenil y dinámico",
};

const LANGUAGE_LABELS: Record<string, string> = {
  es: "Español",
  en: "Inglés",
  both: "Ambos",
};

function fmtSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function RequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) redirect("/admin/login");

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("trial_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const r = data as FullRequest;

  // Signed URLs for the private bucket files (1h expiry)
  async function sign(path: string | null): Promise<string | null> {
    if (!path) return null;
    const { data } = await admin.storage
      .from("trial-uploads")
      .createSignedUrl(path, 60 * 60);
    return data?.signedUrl ?? null;
  }
  const dbUrl = await sign(r.db_file_path);
  const faqUrl = await sign(r.faq_file_path);

  const createdAt = new Date(r.created_at);
  const createdLabel = createdAt.toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="px-5 py-8 sm:px-10 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-brand-muted transition-colors hover:text-brand-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Link>

        {/* Hero */}
        <header className="mb-8 rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/[0.08] to-transparent p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-purple-300">
            Solicitud recibida {createdLabel}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-brand-white sm:text-4xl">
            {r.company_name}
          </h1>
          <p className="mt-2 text-base text-brand-muted">
            {r.contact_name}
            {r.role ? ` · ${r.role}` : ""}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <a
              href={`mailto:${r.email}`}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-brand-white transition-colors hover:bg-white/[0.08]"
            >
              ✉ {r.email}
            </a>
            {r.whatsapp && (
              <a
                href={`https://wa.me/${r.whatsapp.replace(/[^0-9+]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-brand-white transition-colors hover:bg-white/[0.08]"
              >
                💬 {r.whatsapp}
              </a>
            )}
            {r.preferred_contact && (
              <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1.5 text-purple-200">
                Prefiere: {r.preferred_contact === "whatsapp" ? "WhatsApp" : "Email"}
              </span>
            )}
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-5">
          {/* Empresa */}
          <Section icon={<Building2 className="h-4 w-4" />} title="Empresa">
            <Grid>
              <Field label="Nombre" value={r.company_name} />
              <Field label="Equipo" value={r.team_size} />
              <Field label="Ubicación" value={r.location} />
              <Field
                label="Sitio web"
                value={
                  r.website_url ? (
                    <a
                      href={
                        r.website_url.startsWith("http")
                          ? r.website_url
                          : `https://${r.website_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 underline underline-offset-2 hover:text-purple-200"
                    >
                      {r.website_url}
                    </a>
                  ) : null
                }
              />
            </Grid>
          </Section>

          {/* Plataformas */}
          <Section icon={<Plug className="h-4 w-4" />} title="Plataformas">
            <Chips
              items={
                r.platforms?.map((p) => PLATFORM_LABELS[p] ?? p) ?? []
              }
            />
          </Section>

          {/* Volumen */}
          <Section icon={<MessageSquare className="h-4 w-4" />} title="Volumen de mensajes">
            <Grid>
              <Field label="Por día" value={r.daily_messages} />
              <Field label="Por mes" value={r.monthly_messages} />
            </Grid>
          </Section>

          {/* Bot config */}
          <Section icon={<Sparkles className="h-4 w-4" />} title="Configuración del chatbot">
            <Grid>
              <Field
                label="Nombre del bot"
                value={r.bot_name || `Asistente de ${r.company_name}`}
              />
              <Field
                label="Idioma"
                value={r.language ? LANGUAGE_LABELS[r.language] ?? r.language : null}
              />
              <Field
                label="Personalidad"
                value={
                  r.personality
                    ? PERSONALITY_LABELS[r.personality] ?? r.personality
                    : null
                }
              />
            </Grid>
          </Section>

          {/* Horarios */}
          <Section icon={<Clock className="h-4 w-4" />} title="Horarios y calendarios">
            <Grid>
              <Field
                label="Días de atención"
                value={r.working_days?.join(" · ") ?? null}
              />
              <Field
                label="Horario"
                value={
                  r.working_hours_start && r.working_hours_end
                    ? `${r.working_hours_start} — ${r.working_hours_end}`
                    : null
                }
              />
            </Grid>
            {r.calendars && r.calendars.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">
                  Calendarios adicionales
                </p>
                {r.calendars.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-brand-white">
                      {c.name || `Calendario ${i + 1}`}
                    </span>
                    {c.hours && (
                      <span className="ml-2 text-brand-muted">· {c.hours}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Funciones */}
          <Section icon={<Layers className="h-4 w-4" />} title="Funciones activas">
            <Chips
              items={
                r.features?.map((f) => FEATURE_LABELS[f] ?? f) ?? []
              }
            />
          </Section>

          {/* Archivos */}
          <Section icon={<Database className="h-4 w-4" />} title="Archivos adjuntos">
            <div className="space-y-3">
              <FileBlock
                label="Base de datos de propiedades"
                name={r.db_file_name}
                size={fmtSize(r.db_file_size)}
                url={dbUrl}
              />
              <FileBlock
                label="Información de FAQs"
                name={r.faq_file_name}
                size={fmtSize(r.faq_file_size)}
                url={faqUrl}
              />
            </div>
          </Section>

          {/* FAQs custom */}
          {r.custom_faqs && (
            <Section icon={<HelpCircle className="h-4 w-4" />} title="Preguntas frecuentes personalizadas">
              <pre className="whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 font-body text-sm text-brand-white/90">
                {r.custom_faqs}
              </pre>
            </Section>
          )}

          {/* Handoff */}
          {(r.handoff_cases?.length || r.handoff_other) && (
            <Section icon={<Users className="h-4 w-4" />} title="Cuándo delegar a humano">
              {r.handoff_cases && r.handoff_cases.length > 0 && (
                <ul className="space-y-1.5 text-sm text-brand-white/90">
                  {r.handoff_cases.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-300" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              )}
              {r.handoff_other && (
                <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-brand-white/90">
                  <span className="text-xs uppercase tracking-wider text-brand-muted">
                    Otros casos
                  </span>
                  <p className="mt-1 whitespace-pre-wrap">{r.handoff_other}</p>
                </div>
              )}
            </Section>
          )}

          {/* CRM */}
          <Section icon={<FileText className="h-4 w-4" />} title="CRM">
            <Grid>
              <Field
                label="¿Usa CRM actualmente?"
                value={r.has_crm === "yes" ? "Sí" : r.has_crm === "no" ? "No" : null}
              />
              <Field label="Cuál" value={r.crm_name} />
              <Field
                label="Preferencia"
                value={
                  r.crm_preference === "current"
                    ? "Mantener el suyo"
                    : r.crm_preference === "dashboard"
                    ? "Solo el del dashboard"
                    : r.crm_preference === "mixed"
                    ? "Mixto (sincronizados)"
                    : null
                }
              />
            </Grid>
          </Section>

          {/* Third-party */}
          <Section icon={<Plug className="h-4 w-4" />} title="Conexiones a terceros">
            <Grid>
              <Field
                label="¿Ya usa ManyChat?"
                value={
                  r.manychat_status === "yes"
                    ? "Sí"
                    : r.manychat_status === "no"
                    ? "No"
                    : null
                }
              />
            </Grid>
          </Section>

          {/* Contacto + términos */}
          <Section icon={<User className="h-4 w-4" />} title="Datos del contacto">
            <Grid>
              <Field label="Nombre" value={r.contact_name} />
              <Field label="Cargo" value={r.role} />
              <Field label="Email" value={r.email} />
              <Field label="WhatsApp" value={r.whatsapp} />
              <Field
                label="Acepta términos"
                value={
                  r.accept_terms ? (
                    <span className="inline-flex items-center gap-1.5 text-green-400">
                      <ShieldCheck className="h-4 w-4" /> Sí
                    </span>
                  ) : (
                    "No"
                  )
                }
              />
            </Grid>
          </Section>

          {/* Raw ID */}
          <p className="pt-4 text-center text-xs text-brand-muted/60">
            ID: <span className="font-mono">{r.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-purple-300">
        {icon}
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-brand-muted">
        {label}
      </p>
      <p className="text-sm text-brand-white/90">
        {value ?? <span className="text-brand-muted/60">—</span>}
      </p>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (items.length === 0)
    return <p className="text-sm text-brand-muted/60">—</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <span
          key={it}
          className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-200"
        >
          {it}
        </span>
      ))}
    </div>
  );
}

function FileBlock({
  label,
  name,
  size,
  url,
}: {
  label: string;
  name: string | null;
  size: string;
  url: string | null;
}) {
  if (!name) {
    return (
      <div className="rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01] px-4 py-3 text-sm text-brand-muted/60">
        <span className="text-brand-white/70">{label}:</span> no se subió
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-brand-muted">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm text-brand-white" title={name}>
          {name}
        </p>
        {size && <p className="text-xs text-brand-muted">{size}</p>}
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-3 py-1.5 text-xs font-medium text-purple-200 transition-colors hover:bg-purple-500/25"
        >
          <Download className="h-3.5 w-3.5" /> Descargar
        </a>
      ) : (
        <Calendar className="h-4 w-4 text-brand-muted" />
      )}
    </div>
  );
}
