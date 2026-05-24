import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LogOut, Mail, MessageSquare, Users } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

type TrialRequest = {
  id: string;
  created_at: string;
  company_name: string;
  contact_name: string;
  email: string;
  whatsapp: string | null;
  platforms: string[] | null;
  daily_messages: string | null;
  team_size: string | null;
  location: string | null;
  has_crm: string | null;
  personality: string | null;
};

function timeAgo(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 30)
    return `hace ${day} ${day === 1 ? "día" : "días"}`;
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PLATFORM_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  instagram: "Instagram",
  website: "Sitio web",
  telegram: "Telegram",
};

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) {
    redirect("/admin/login");
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("trial_requests")
    .select(
      "id, created_at, company_name, contact_name, email, whatsapp, platforms, daily_messages, team_size, location, has_crm, personality"
    )
    .order("created_at", { ascending: false });

  const rows = (data as TrialRequest[] | null) ?? [];

  // Stats
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeek = rows.filter(
    (r) => now - new Date(r.created_at).getTime() < weekMs
  ).length;

  return (
    <div className="px-5 py-8 sm:px-10 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Top bar */}
        <header className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo Monocromatico Blanco.svg"
              alt="AlekAgency"
              className="h-10 w-auto"
            />
            <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-200">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-brand-muted hidden sm:inline">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-brand-white transition-colors hover:bg-white/[0.05]"
              >
                <LogOut className="h-4 w-4" /> Salir
              </button>
            </form>
          </div>
        </header>

        {/* Title */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-brand-white sm:text-4xl">
            Solicitudes de prueba
          </h1>
          <p className="mt-2 text-base text-brand-muted">
            Todo lo que llega del formulario en /prueba.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total recibidas"
            value={rows.length.toString()}
            icon={<MessageSquare className="h-5 w-5" />}
          />
          <StatCard
            label="Esta semana"
            value={thisWeek.toString()}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Última solicitud"
            value={rows[0] ? timeAgo(rows[0].created_at) : "—"}
            icon={<Mail className="h-5 w-5" />}
          />
        </div>

        {/* List */}
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Error cargando datos: {error.message}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-base text-brand-muted">
              Aún no hay solicitudes. En cuanto alguien envíe el formulario, lo
              verás aquí.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/${r.id}`}
                  className="group flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-purple-400/30 hover:bg-white/[0.04] sm:flex-row sm:items-center"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-heading text-lg font-bold text-brand-white truncate">
                        {r.company_name || "(sin nombre)"}
                      </h3>
                      <span className="text-xs text-brand-muted shrink-0">
                        · {timeAgo(r.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-brand-muted truncate">
                      {r.contact_name} · {r.email}
                      {r.whatsapp ? ` · ${r.whatsapp}` : ""}
                    </p>
                    {(r.platforms?.length || r.daily_messages) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {r.platforms?.map((p) => (
                          <span
                            key={p}
                            className="rounded-md border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-200"
                          >
                            {PLATFORM_LABELS[p] ?? p}
                          </span>
                        ))}
                        {r.daily_messages && (
                          <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] text-brand-muted">
                            {r.daily_messages}/día
                          </span>
                        )}
                        {r.location && (
                          <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] text-brand-muted">
                            {r.location}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-brand-muted transition-transform group-hover:translate-x-0.5 group-hover:text-purple-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-2 flex items-center gap-2 text-purple-300">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider text-brand-muted">
          {label}
        </span>
      </div>
      <p className="font-heading text-3xl font-bold text-brand-white">
        {value}
      </p>
    </div>
  );
}
