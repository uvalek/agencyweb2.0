"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  CornerDownLeft,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import TurnstileWidget from "@/components/TurnstileWidget";

/* -------------------------------------------------------------------------- */
/*  Types & constants                                                         */
/* -------------------------------------------------------------------------- */

type FormData = {
  // Empresa
  companyName: string;
  teamSize: string;
  location: string;
  websiteUrl: string;

  // Plataformas
  platforms: string[];

  // Volumen
  dailyMessages: string;
  monthlyMessages: string;

  // Bot config
  botName: string;
  language: string;

  // Horario humano
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;

  // Funciones
  features: string[];

  // DB
  dbFile: File | null;

  // FAQs
  customFaqs: string;
  faqFile: File | null;

  // Handoff
  handoffCases: string[];
  handoffOther: string;

  // CRM
  hasCrm: "" | "yes" | "no";
  crmName: string;
  crmPreference: string;

  // Personalidad
  personality: string;

  // Calendarios
  calendarCount: string;
  calendars: { name: string; hours: string }[];

  // Contacto
  contactName: string;
  role: string;
  email: string;
  whatsapp: string;
  preferredContact: string;

  // Third-party connections
  manychatStatus: "" | "yes" | "no";

  // Terms
  acceptTerms: boolean;

  // Cloudflare Turnstile
  turnstileToken: string;
};

// Mirror of the server-side email check so the wizard blocks invalid
// addresses before submit instead of failing validation server-side.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL: FormData = {
  companyName: "",
  teamSize: "",
  location: "",
  websiteUrl: "",
  platforms: [],
  dailyMessages: "",
  monthlyMessages: "",
  botName: "",
  language: "es",
  workingDays: ["Lun", "Mar", "Mié", "Jue", "Vie"],
  workingHoursStart: "09:00",
  workingHoursEnd: "18:00",
  features: [
    "scheduling",
    "properties",
    "faqs",
    "lead-capture",
    "qualification",
    "reminders",
  ],
  dbFile: null,
  customFaqs: "",
  faqFile: null,
  handoffCases: [],
  handoffOther: "",
  hasCrm: "",
  crmName: "",
  crmPreference: "",
  personality: "",
  calendarCount: "1",
  calendars: [],
  contactName: "",
  role: "",
  email: "",
  whatsapp: "",
  preferredContact: "",
  manychatStatus: "",
  acceptTerms: false,
  turnstileToken: "",
};

const PLATFORMS = [
  { id: "whatsapp", label: "WhatsApp", icon: "/whatsapp-icon.svg" },
  { id: "messenger", label: "Messenger", icon: "/messenger.svg" },
  { id: "instagram", label: "Instagram", icon: "/instagram-icon.svg" },
  { id: "website", label: "Sitio web (widget)", icon: null },
  { id: "telegram", label: "Telegram", icon: null },
];

const DAILY_OPTIONS = [
  { id: "1-50", label: "1 — 50 mensajes" },
  { id: "51-150", label: "51 — 150 mensajes" },
  { id: "151-300", label: "151 — 300 mensajes" },
  { id: "301-700", label: "301 — 700 mensajes" },
  { id: "700+", label: "Más de 700 mensajes" },
];

// Daily → set of monthly options that make sense (~30 days, with some
// breathing room).
const MONTHLY_BY_DAILY: Record<string, { id: string; label: string }[]> = {
  "1-50": [
    { id: "<500", label: "Menos de 500" },
    { id: "500-1500", label: "500 — 1,500" },
  ],
  "51-150": [
    { id: "1500-3000", label: "1,500 — 3,000" },
    { id: "3000-4500", label: "3,000 — 4,500" },
  ],
  "151-300": [
    { id: "4500-7000", label: "4,500 — 7,000" },
    { id: "7000-9000", label: "7,000 — 9,000" },
  ],
  "301-700": [
    { id: "9000-15000", label: "9,000 — 15,000" },
    { id: "15000-21000", label: "15,000 — 21,000" },
  ],
  "700+": [
    { id: "21000-30000", label: "21,000 — 30,000" },
    { id: "30000+", label: "Más de 30,000" },
  ],
};

const TEAM_SIZES = [
  "1 (solo yo)",
  "2 — 5",
  "6 — 10",
  "11 — 25",
  "Más de 25",
];

const ROLES = [
  "Bróker individual",
  "Asesor inmobiliario en una empresa",
  "Dueño / Fundador de inmobiliaria",
  "Gerente o director",
  "Otro",
];

const LANGUAGES = [
  { id: "es", label: "Español" },
  { id: "en", label: "Inglés" },
  { id: "both", label: "Ambos (español + inglés)" },
];

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const FEATURES = [
  {
    id: "scheduling",
    label: "Agendamiento automático de citas",
    desc: "El bot agenda visitas y reuniones por ti.",
  },
  {
    id: "properties",
    label: "Muestra de propiedades desde tu base de datos",
    desc: "Responde con propiedades reales: precio, ubicación, fotos.",
  },
  {
    id: "faqs",
    label: "Respuesta a preguntas frecuentes",
    desc: "Resuelve dudas comunes al instante, 24/7.",
  },
  {
    id: "lead-capture",
    label: "Captura automática de prospectos al CRM",
    desc: "Cada conversación se registra con los datos del prospecto.",
  },
  {
    id: "qualification",
    label: "Calificación inteligente de leads",
    desc: "Identifica leads serios y los prioriza.",
  },
  {
    id: "reminders",
    label: "Recordatorios de visitas y citas",
    desc: "Envía recordatorios antes de cada cita.",
  },
];

const HANDOFF_CASES = [
  "El prospecto pide explícitamente hablar con un humano",
  "Cierre de venta o negociación de precio",
  "Quejas, reclamos o casos sensibles",
  "El bot no entiende tras varios intentos",
  "Solicitudes de documentos legales o firmas",
];

const PERSONALITIES = [
  {
    id: "formal",
    label: "Formal / Corporativo",
    desc: "Lenguaje corporativo, protocolo estricto",
    example:
      "Buenos días, agradecemos su contacto con Inmobiliaria X. ¿En qué podemos asistirle el día de hoy?",
  },
  {
    id: "pro-friendly",
    label: "Profesional pero amigable",
    desc: "Equilibrio entre profesionalismo y calidez",
    example:
      "¡Hola! Soy el asistente de Inmobiliaria X. Encantado de ayudarte a encontrar tu propiedad ideal. ¿En qué te apoyo?",
  },
  {
    id: "casual",
    label: "Casual y cercano",
    desc: "Conversación natural y relajada",
    example:
      "¡Hey! 👋 Soy de Inmobiliaria X. Cuéntame qué buscas y vemos juntos qué propiedades te van bien.",
  },
  {
    id: "juvenil",
    label: "Juvenil y dinámico",
    desc: "Energético, moderno, con jerga actual",
    example:
      "¡Quéeee onda! 🔥 Bienvenid@ a Inmobiliaria X. ¿Buscas algo cool para estrenar? Te ayudo a encontrarlo 🚀",
  },
];

const EXAMPLE_FAQS = [
  "¿Cuál es el precio de la propiedad X?",
  "¿Qué créditos aceptan?",
  "¿Dónde está ubicada?",
  "¿Cuántas recámaras y baños tiene?",
  "¿Cuántos metros cuadrados son?",
  "¿Aceptan financiamiento?",
  "¿Puedo agendar una visita?",
  "¿Es para renta o venta?",
];

const STEPS_TOTAL = 15;

const ACCESS_EMAIL = "alekhammer13@gmail.com";

const ManyChatStepsExisting: React.ReactNode[] = [
  <>Entra a tu cuenta de ManyChat.</>,
  <>
    Ve a <Bold>Settings → Team</Bold> en el menú lateral.
  </>,
  <>
    Haz clic en <Bold>Invite Team Member</Bold> y agrega mi correo:{" "}
    <Email>{ACCESS_EMAIL}</Email> con permisos de <Bold>Admin</Bold>.
  </>,
  <>Listo — recibo la invitación y conecto tu chatbot.</>,
];

const ManyChatStepsNew: React.ReactNode[] = [
  <>
    Entra a{" "}
    <ExtLink href="https://manychat.com">manychat.com</ExtLink> y crea tu cuenta
    gratis.
  </>,
  <>
    Conecta tu página de Facebook o tu cuenta de Instagram dentro del
    onboarding inicial (ManyChat te guía paso a paso).
  </>,
  <>
    Una vez dentro, ve a <Bold>Settings → Team</Bold> en el menú lateral.
  </>,
  <>
    Haz clic en <Bold>Invite Team Member</Bold> y agrega mi correo:{" "}
    <Email>{ACCESS_EMAIL}</Email> con permisos de <Bold>Admin</Bold>.
  </>,
  <>Listo — recibo la invitación y empiezo a configurar tu chatbot.</>,
];

const OpenAISteps: React.ReactNode[] = [
  <>
    Entra a{" "}
    <ExtLink href="https://platform.openai.com">platform.openai.com</ExtLink>{" "}
    y crea tu cuenta (puedes usar Google o tu correo).
  </>,
  <>Verifica tu número de teléfono cuando te lo pida.</>,
  <>
    Agrega un método de pago en <Bold>Settings → Billing</Bold>. La API se paga
    por consumo, no es suscripción mensual.
  </>,
  <>
    Ve a <Bold>Settings → Organization → Projects</Bold> y haz clic en{" "}
    <Bold>Create project</Bold>. Ponle un nombre como “Chatbot Inmobiliaria”.
  </>,
  <>
    Dentro del proyecto, abre <Bold>Members</Bold> e invita a:{" "}
    <Email>{ACCESS_EMAIL}</Email> con rol de <Bold>Owner</Bold> o{" "}
    <Bold>Admin</Bold>.
  </>,
  <>Listo — yo genero la API key y la conecto a tu chatbot.</>,
];

function Bold({ children }: { children: React.ReactNode }) {
  return <strong className="text-brand-white">{children}</strong>;
}

function Email({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded bg-purple-500/15 px-1.5 py-0.5 font-mono text-[12px] text-purple-200">
      {children}
    </span>
  );
}

function ExtLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-purple-300 underline underline-offset-2 hover:text-purple-200"
    >
      {children}
    </a>
  );
}

function YouTubeEmbed({
  id,
  title,
  start,
}: {
  id: string;
  title: string;
  start?: number;
}) {
  const src = `https://www.youtube-nocookie.com/embed/${id}${
    start ? `?start=${start}` : ""
  }`;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/[0.08] bg-black">
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// OpenAI API cost estimate (GPT-4.1 mini)
// ---------------------------------------------------------------------------
//
// The chatbot is a multi-agent system: a Router (~1,210 tok) classifies
// every client message and hands it to a specialized agent — FAQ (~3,690),
// Catálogo (~2,470), Agendamiento (~2,900) or Seguimiento (~920) — and each
// call re-sends its own system prompt plus the growing history. So one
// client message triggers ~2 model calls, not one.
//
// Representative lead conversation (~13 client messages, ~7 bot turns, up to
// booking a visit; Catálogo + Agendamiento dominate, ~2,900 tok avg agent):
//   system : 7 × (1,210 router + 2,900 agent) ≈ 28,800 tok
//   history: re-sent on router + agent calls   ≈  3,900 tok
//   input  ≈ 32,000 × $0.40 / 1M               =  $0.0128
//   output ≈    650 × $1.60 / 1M               =  $0.0010
//   total  ≈ $0.014 per conversation ≈ $0.0011 per client message.
const OPENAI_COST_PER_MESSAGE_USD = 0.0011;

const MONTHLY_COST_RANGES: {
  id: string;
  label: string;
  min: number;
  max: number | null;
}[] = [
  { id: "<500", label: "Menos de 500", min: 0, max: 500 },
  { id: "500-1500", label: "500 — 1,500", min: 500, max: 1500 },
  { id: "1500-3000", label: "1,500 — 3,000", min: 1500, max: 3000 },
  { id: "3000-4500", label: "3,000 — 4,500", min: 3000, max: 4500 },
  { id: "4500-7000", label: "4,500 — 7,000", min: 4500, max: 7000 },
  { id: "7000-9000", label: "7,000 — 9,000", min: 7000, max: 9000 },
  { id: "9000-15000", label: "9,000 — 15,000", min: 9000, max: 15000 },
  { id: "15000-21000", label: "15,000 — 21,000", min: 15000, max: 21000 },
  { id: "21000-30000", label: "21,000 — 30,000", min: 21000, max: 30000 },
  { id: "30000+", label: "Más de 30,000", min: 30000, max: null },
];

function fmtUsd(n: number) {
  return `$${n.toFixed(2)}`;
}

function OpenAICostEstimate({ monthly }: { monthly: string }) {
  const rate = OPENAI_COST_PER_MESSAGE_USD;
  const selected = MONTHLY_COST_RANGES.find((r) => r.id === monthly);

  return (
    <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
      <h4 className="font-heading text-base font-bold text-brand-white">
        Costo estimado de la API de OpenAI
      </h4>
      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
        Usamos <strong className="text-brand-white">GPT-4.1 mini</strong>, el
        modelo más económico para chatbots. Esto es lo que pagarías
        directamente a OpenAI (aparte de tu prueba gratis), según el volumen
        que indicaste.
      </p>

      {selected && (
        <div className="mt-4 rounded-lg border border-purple-400/25 bg-purple-500/10 p-3">
          <p className="text-xs text-brand-muted">
            Para tu volumen ({selected.label} mensajes/mes):
          </p>
          <p className="mt-1 font-heading text-xl font-bold text-brand-white">
            {selected.max === null
              ? `desde ${fmtUsd(selected.min * rate)} USD / mes`
              : `~ ${fmtUsd(selected.min * rate)} – ${fmtUsd(
                  selected.max * rate
                )} USD / mes`}
          </p>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-white/[0.06]">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-white/[0.03] text-brand-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Mensajes / mes</th>
              <th className="px-3 py-2 text-right font-medium">
                Costo estimado (USD)
              </th>
            </tr>
          </thead>
          <tbody>
            {MONTHLY_COST_RANGES.map((r) => {
              const isSel = r.id === monthly;
              const cost =
                r.max === null
                  ? `desde ${fmtUsd(r.min * rate)}`
                  : `${fmtUsd(r.min * rate)} – ${fmtUsd(r.max * rate)}`;
              return (
                <tr
                  key={r.id}
                  className={
                    isSel
                      ? "bg-purple-500/15 font-semibold text-brand-white"
                      : "text-brand-muted"
                  }
                >
                  <td className="border-t border-white/[0.06] px-3 py-2">
                    {r.label}
                    {isSel && (
                      <span className="ml-1 text-purple-300">← tú</span>
                    )}
                  </td>
                  <td className="border-t border-white/[0.06] px-3 py-2 text-right">
                    {cost}/mes
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-brand-muted/70">
        Estimación para un sistema multi-agente (un router clasifica cada
        mensaje y lo envía al agente especializado —FAQ, catálogo, agendamiento
        o seguimiento—, y cada llamada reenvía su system prompt + el historial).
        Una conversación promedio hasta agendar (~13 mensajes) consume ~32,000
        tokens de entrada + ~650 de salida ≈ $0.014 USD. Precios GPT-4.1 mini:
        $0.40 (entrada) y $1.60 (salida) por millón de tokens. El costo real
        varía según la duración de cada conversación. OpenAI factura en USD.
      </p>
    </div>
  );
}

function NumberedSteps({ steps }: { steps: React.ReactNode[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-brand-muted">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-[11px] font-bold text-purple-200">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reusable input primitives                                                 */
/* -------------------------------------------------------------------------- */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-brand-white/80">
      {children}
    </label>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-lg text-brand-white placeholder:text-brand-muted/60 outline-none transition-colors focus:border-purple-400/50 focus:bg-white/[0.05]"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-base text-brand-white placeholder:text-brand-muted/60 outline-none transition-colors focus:border-purple-400/50 focus:bg-white/[0.05]"
    />
  );
}

function OptionCard({
  active,
  onClick,
  children,
  icon,
  multi,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all ${
        active
          ? "border-purple-400/60 bg-purple-500/10 shadow-[0_0_30px_rgba(124,58,237,0.15)]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
      }`}
    >
      {icon}
      <span className="flex-1 text-base text-brand-white">{children}</span>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center border transition-colors ${
          multi ? "rounded-md" : "rounded-full"
        } ${
          active
            ? "border-purple-400 bg-purple-500 text-white"
            : "border-white/20 bg-transparent text-transparent"
        }`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </button>
  );
}

function StepHeader({
  number,
  title,
  subtitle,
}: {
  number: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2 text-purple-300/80">
        <span className="font-heading text-sm font-bold tracking-wider">
          {String(number).padStart(2, "0")}
        </span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
      <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight text-brand-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-brand-muted sm:text-lg">{subtitle}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Wizard                                                                    */
/* -------------------------------------------------------------------------- */

export default function WizardForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggleIn = <K extends keyof FormData>(k: K, v: string) =>
    setData((d) => {
      const arr = d[k] as unknown as string[];
      const next = arr.includes(v)
        ? arr.filter((x) => x !== v)
        : [...arr, v];
      return { ...d, [k]: next as unknown as FormData[K] };
    });

  // The main schedule (workingDays/Hours) is the primary calendar. The
  // `calendars` array holds ADDITIONAL calendars beyond that one.
  useEffect(() => {
    const n =
      data.calendarCount === "1" ? 0 : data.calendarCount === "2" ? 1 : 2;
    if (data.calendars.length !== n) {
      const next = Array.from({ length: n }, (_, i) =>
        data.calendars[i] ?? { name: "", hours: "" }
      );
      set("calendars", next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.calendarCount]);

  // Clear monthly if daily changes to incompatible
  useEffect(() => {
    if (!data.dailyMessages) return;
    const allowed = MONTHLY_BY_DAILY[data.dailyMessages]?.map((o) => o.id) ?? [];
    if (data.monthlyMessages && !allowed.includes(data.monthlyMessages)) {
      set("monthlyMessages", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.dailyMessages]);

  const canContinue = useMemo<boolean>(() => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return data.companyName.trim().length > 0 && data.teamSize !== "";
      case 2:
        return data.platforms.length > 0;
      case 3:
        return Boolean(data.dailyMessages && data.monthlyMessages);
      case 4:
        return Boolean(data.language);
      case 5:
        return (
          data.workingDays.length > 0 &&
          !!data.workingHoursStart &&
          !!data.workingHoursEnd
        );
      case 6:
        return true;
      case 7:
        return true;
      case 8:
        return true;
      case 9:
        return true;
      case 10:
        return data.hasCrm !== "";
      case 11:
        return Boolean(data.personality);
      case 12:
        return Boolean(
          data.contactName.trim() &&
            data.role &&
            EMAIL_RE.test(data.email.trim()) &&
            data.preferredContact
        );
      case 13:
        return data.manychatStatus !== "";
      case 14:
        // Turnstile is only required when the site key is configured
        // (production). Locally / in dev it is skipped automatically.
        return (
          data.acceptTerms &&
          (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
            data.turnstileToken.length > 0)
        );
      default:
        return true;
    }
  }, [step, data]);

  const next = useCallback(() => {
    if (!canContinue) return;
    setStep((s) => Math.min(s + 1, STEPS_TOTAL - 1));
  }, [canContinue]);

  const back = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      for (const [k, v] of Object.entries(data)) {
        if (k === "dbFile" || k === "faqFile") {
          if (v instanceof File) fd.append(k, v);
        } else {
          fd.append(k, JSON.stringify(v));
        }
      }
      const res = await fetch("/api/prueba", { method: "POST", body: fd });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as
          | { error?: string; fields?: string[] }
          | null;
        if (err?.error === "captcha_failed") {
          // Token likely expired between solving and submitting. Clear it
          // so the user re-checks the box, then retries.
          set("turnstileToken", "");
          setSubmitError(
            "La verificación anti-spam expiró. Vuelve a marcar la casilla y envía de nuevo."
          );
        } else if (err?.error === "invalid_input" && err.fields?.length) {
          setSubmitError(
            `Revisa estos datos antes de enviar: ${err.fields.join(", ")}.`
          );
        } else {
          setSubmitError(
            "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo."
          );
        }
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  }, [data, set]);

  // Keyboard: Enter advances on most steps; Esc goes back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") back();
      if (e.key === "Enter") {
        const t = e.target as HTMLElement | null;
        if (t && t.tagName === "TEXTAREA") return;
        if (step === STEPS_TOTAL - 1) {
          if (canContinue && !submitting) {
            e.preventDefault();
            submit();
          }
        } else if (canContinue) {
          e.preventDefault();
          next();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, canContinue, next, step, submit, submitting]);

  if (submitted) return <ThankYou name={data.contactName} />;

  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-0 z-20 h-1 bg-white/[0.04]">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-300 transition-[width] duration-500 ease-out"
          style={{ width: `${((step + 1) / STEPS_TOTAL) * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <Link href="/" className="cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo Monocromatico Blanco.svg"
            alt="AlekAgency"
            className="h-12 w-auto sm:h-14"
          />
        </Link>
        <div className="font-heading text-sm font-medium text-brand-muted">
          <span className="text-brand-white">{step + 1}</span> / {STEPS_TOTAL}
        </div>
      </header>

      {/* Step content */}
      <main
        className="flex flex-1 items-start justify-center px-5 pt-6 sm:items-start sm:px-10 sm:pt-12"
        style={{
          paddingBottom: "calc(9rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div
          className={`w-full ${step === 13 ? "max-w-4xl" : "max-w-2xl"}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {renderStep(step, data, set, toggleIn)}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer nav */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/[0.06] bg-[#050505]/85 px-5 pt-4 backdrop-blur-xl sm:px-10"
        style={{
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {submitError && (
          <div className="mx-auto mb-3 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-200">
            {submitError}
          </div>
        )}
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-brand-white transition-colors hover:border-white/20 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
            Atrás
          </button>

          {step === STEPS_TOTAL - 1 ? (
            <button
              type="button"
              onClick={submit}
              disabled={!canContinue || submitting}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {submitting ? "Enviando…" : "Enviar mi solicitud"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              disabled={!canContinue}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Continuar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <span className="ml-1 hidden items-center gap-1 rounded border border-white/30 px-1.5 py-0.5 text-[10px] text-white/80 sm:inline-flex">
                <CornerDownLeft className="h-3 w-3" /> Enter
              </span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Render each step                                                          */
/* -------------------------------------------------------------------------- */

function renderStep(
  step: number,
  d: FormData,
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void,
  toggleIn: <K extends keyof FormData>(k: K, v: string) => void
): React.ReactNode {
  switch (step) {
    case 0:
      return (
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-purple-200">
            <Sparkles className="h-3.5 w-3.5" /> Prueba gratis · 14 días
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-brand-white sm:text-5xl md:text-6xl">
            Vamos a construir <br />
            <span className="gradient-text">tu IA inmobiliaria</span>.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-muted sm:text-xl">
            En unos minutos nos cuentas cómo trabaja tu inmobiliaria y armamos
            tu chatbot personalizado. Sin tarjeta. Sin compromiso.
          </p>
          <p className="mt-4 text-sm text-brand-muted/80">
            Tarda unos 5 — 8 minutos. Puedes presionar{" "}
            <kbd className="rounded border border-white/20 bg-white/[0.04] px-1.5 py-0.5 text-xs">
              Enter
            </kbd>{" "}
            para avanzar.
          </p>

          {/* Confidentiality / trust block */}
          <div className="mt-10 rounded-2xl border border-purple-400/20 bg-purple-500/[0.05] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-sm leading-relaxed text-brand-muted">
                <p className="mb-2 font-heading text-base font-bold text-brand-white">
                  Tu información está segura con nosotros.
                </p>
                <p className="mb-3">
                  Todo lo que compartas aquí se guarda en nuestra base de datos
                  privada, protegida con cifrado y altos estándares de
                  seguridad. Solo nuestro equipo tiene acceso, y únicamente
                  para configurar tu chatbot. No vendemos, alquilamos ni
                  compartimos tus datos con terceros — nunca.
                </p>
                <p>
                  Cumplimos con la{" "}
                  <strong className="text-brand-white">
                    Ley Federal de Protección de Datos Personales en Posesión
                    de los Particulares (LFPDPPP)
                  </strong>
                  . Puedes solicitar acceso, corrección o eliminación de tu
                  información cuando quieras escribiéndonos a{" "}
                  <a
                    href="mailto:agencyalek@gmail.com"
                    className="text-purple-300 underline underline-offset-2 hover:text-purple-200"
                  >
                    agencyalek@gmail.com
                  </a>
                  .
                </p>
                <Link
                  href="/privacidad"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-purple-300 hover:text-purple-200"
                >
                  Lee nuestra política de privacidad completa
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      );

    case 1:
      return (
        <div>
          <StepHeader
            number={1}
            title="Cuéntanos sobre tu inmobiliaria"
            subtitle="Para personalizar tu chatbot necesitamos lo básico de tu negocio."
          />
          <div className="space-y-5">
            <div>
              <FieldLabel>Nombre de tu inmobiliaria *</FieldLabel>
              <TextField
                value={d.companyName}
                onChange={(v) => set("companyName", v)}
                placeholder="Ej. Luce Real Estate"
                autoFocus
              />
            </div>
            <div>
              <FieldLabel>¿Cuántas personas trabajan en tu equipo? *</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {TEAM_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("teamSize", s)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      d.teamSize === s
                        ? "border-purple-400/60 bg-purple-500/15 text-brand-white"
                        : "border-white/[0.08] bg-white/[0.02] text-brand-muted hover:border-white/20 hover:text-brand-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Ubicación / Zona donde operan</FieldLabel>
              <TextField
                value={d.location}
                onChange={(v) => set("location", v)}
                placeholder="Ej. CDMX, Polanco y zonas aledañas"
              />
            </div>
            <div>
              <FieldLabel>Sitio web (si lo tienes)</FieldLabel>
              <TextField
                value={d.websiteUrl}
                onChange={(v) => set("websiteUrl", v)}
                placeholder="https://tuinmobiliaria.com"
              />
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div>
          <StepHeader
            number={2}
            title="¿Dónde quieres que viva tu chatbot?"
            subtitle="Selecciona todas las plataformas donde atenderás a tus prospectos."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {PLATFORMS.map((p) => (
              <OptionCard
                key={p.id}
                active={d.platforms.includes(p.id)}
                onClick={() => toggleIn("platforms", p.id)}
                multi
                icon={
                  p.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.icon} alt={p.label} className="h-7 w-7" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/15 text-purple-300">
                      <Sparkles className="h-4 w-4" />
                    </span>
                  )
                }
              >
                {p.label}
              </OptionCard>
            ))}
          </div>
        </div>
      );

    case 3: {
      const monthlyOpts = d.dailyMessages
        ? MONTHLY_BY_DAILY[d.dailyMessages] ?? []
        : [];
      return (
        <div>
          <StepHeader
            number={3}
            title="¿Qué volumen de mensajes manejas?"
            subtitle="Una estimación basta — esto nos ayuda a configurar tu infraestructura."
          />
          <div className="space-y-7">
            <div>
              <FieldLabel>Mensajes al día (aprox.) *</FieldLabel>
              <div className="grid gap-2">
                {DAILY_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.id}
                    active={d.dailyMessages === o.id}
                    onClick={() => set("dailyMessages", o.id)}
                  >
                    {o.label}
                  </OptionCard>
                ))}
              </div>
            </div>
            {d.dailyMessages && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FieldLabel>Mensajes al mes (aprox.) *</FieldLabel>
                <div className="grid gap-2">
                  {monthlyOpts.map((o) => (
                    <OptionCard
                      key={o.id}
                      active={d.monthlyMessages === o.id}
                      onClick={() => set("monthlyMessages", o.id)}
                    >
                      {o.label}
                    </OptionCard>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      );
    }

    case 4:
      return (
        <div>
          <StepHeader
            number={4}
            title="Configura tu chatbot"
            subtitle="Cómo quieres que se identifique y en qué idiomas habla."
          />
          <div className="space-y-6">
            <div>
              <FieldLabel>Nombre del chatbot (opcional)</FieldLabel>
              <TextField
                value={d.botName}
                onChange={(v) => set("botName", v)}
                placeholder="Si lo dejas vacío, será “Asistente de [tu inmobiliaria]”"
              />
            </div>
            <div>
              <FieldLabel>Idioma principal *</FieldLabel>
              <div className="grid gap-2 sm:grid-cols-3">
                {LANGUAGES.map((l) => (
                  <OptionCard
                    key={l.id}
                    active={d.language === l.id}
                    onClick={() => set("language", l.id)}
                  >
                    {l.label}
                  </OptionCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 5:
      return (
        <div>
          <StepHeader
            number={5}
            title="Horario de atención y agendamiento"
            subtitle="Estos horarios serán los que el chatbot use como referencia para agendar visitas y citas con tus prospectos."
          />
          <div className="space-y-6">
            <div>
              <FieldLabel>Días de atención *</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const active = d.workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleIn("workingDays", day)}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "border-purple-400/60 bg-purple-500/15 text-brand-white"
                          : "border-white/[0.08] bg-white/[0.02] text-brand-muted hover:border-white/20 hover:text-brand-white"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Desde *</FieldLabel>
                <input
                  type="time"
                  value={d.workingHoursStart}
                  onChange={(e) => set("workingHoursStart", e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-lg text-brand-white outline-none focus:border-purple-400/50"
                />
              </div>
              <div>
                <FieldLabel>Hasta *</FieldLabel>
                <input
                  type="time"
                  value={d.workingHoursEnd}
                  onChange={(e) => set("workingHoursEnd", e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-lg text-brand-white outline-none focus:border-purple-400/50"
                />
              </div>
            </div>

            <div className="flex gap-3 rounded-xl border border-purple-400/20 bg-purple-500/5 p-4 text-sm text-brand-muted">
              <Sparkles className="h-5 w-5 shrink-0 text-purple-300" />
              <p>
                Tu chatbot también atenderá{" "}
                <strong className="text-brand-white">
                  fuera de tu horario laboral
                </strong>
                , pero solo con fines informativos. Si requiere intervención
                humana, te avisa al volver.
              </p>
            </div>

            {/* Extra calendars */}
            <div className="pt-2">
              <FieldLabel>¿Necesitas calendarios adicionales?</FieldLabel>
              <p className="mb-3 text-sm text-brand-muted">
                Útil si manejas varios asesores con horarios distintos, o quieres
                separar agendas (ej. visitas presenciales vs. llamadas).
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "1", label: "Solo el de arriba" },
                  { id: "2", label: "Agregar 1 más" },
                  { id: "3+", label: "Agregar 2 o más" },
                ].map((o) => (
                  <OptionCard
                    key={o.id}
                    active={d.calendarCount === o.id}
                    onClick={() => set("calendarCount", o.id)}
                  >
                    {o.label}
                  </OptionCard>
                ))}
              </div>
            </div>

            {d.calendars.map((cal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <FieldLabel>Calendario adicional {i + 1}</FieldLabel>
                <div className="space-y-3">
                  <TextField
                    value={cal.name}
                    onChange={(v) => {
                      const next = [...d.calendars];
                      next[i] = { ...next[i], name: v };
                      set("calendars", next);
                    }}
                    placeholder={`Ej. Visitas presenciales · Asesor ${i + 1}…`}
                  />
                  <TextField
                    value={cal.hours}
                    onChange={(v) => {
                      const next = [...d.calendars];
                      next[i] = { ...next[i], hours: v };
                      set("calendars", next);
                    }}
                    placeholder="Horario personalizado · Ej. Lun-Vie 10:00 a 18:00"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );

    case 6:
      return (
        <div>
          <StepHeader
            number={6}
            title="¿Qué funciones activamos?"
            subtitle="Todas vienen activadas por defecto. Desmarca las que no necesites."
          />
          <div className="space-y-2.5">
            {FEATURES.map((f) => {
              const active = d.features.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleIn("features", f.id)}
                  className={`group flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition-all ${
                    active
                      ? "border-purple-400/60 bg-purple-500/10 shadow-[0_0_30px_rgba(124,58,237,0.12)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      active
                        ? "border-purple-400 bg-purple-500 text-white"
                        : "border-white/20 bg-transparent text-transparent"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-brand-white">{f.label}</div>
                    <div className="mt-0.5 text-sm text-brand-muted">
                      {f.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );

    case 7:
      return (
        <div>
          <StepHeader
            number={7}
            title="Sube tu base de datos de propiedades"
            subtitle="Para que el chatbot responda con datos reales. Si aún no la tienes lista, puedes saltar este paso y enviárnosla después."
          />
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-purple-400/25 bg-white/[0.02] px-6 py-12 text-center transition-colors hover:border-purple-400/50 hover:bg-white/[0.04]">
            <Upload className="h-9 w-9 text-purple-300" />
            <div>
              <p className="text-brand-white font-medium">
                {d.dbFile ? d.dbFile.name : "Arrastra o haz clic para seleccionar"}
              </p>
              <p className="mt-1 text-sm text-brand-muted">
                CSV, XLSX, PDF, DOC o imágenes
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.txt,image/*"
              onChange={(e) => set("dbFile", e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="mt-5 flex gap-3 rounded-xl border border-purple-400/20 bg-purple-500/5 p-4 text-sm text-brand-muted">
            <CircleAlert className="h-5 w-5 shrink-0 text-purple-300" />
            <div>
              <p className="text-brand-white font-medium mb-1">
                Por cada propiedad asegúrate de incluir:
              </p>
              <p className="leading-relaxed">
                Nombre de la propiedad · Estado · Municipio · Dirección completa
                · Recámaras · Baños · Metros cuadrados · Precio · Créditos que
                acepta · Descripción · Renta / Venta / Ambos · Sistema de
                financiamiento disponible.
              </p>
            </div>
          </div>
        </div>
      );

    case 8:
      return (
        <div>
          <StepHeader
            number={8}
            title="Preguntas frecuentes"
            subtitle="Algunos ejemplos de lo que el chatbot responderá automáticamente. Añade abajo las tuyas."
          />
          <div className="mb-6 grid gap-2 sm:grid-cols-2">
            {EXAMPLE_FAQS.map((q) => (
              <div
                key={q}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-brand-muted"
              >
                {q}
              </div>
            ))}
          </div>

          <FieldLabel>¿Alguna otra pregunta que el bot deba responder?</FieldLabel>
          <TextArea
            value={d.customFaqs}
            onChange={(v) => set("customFaqs", v)}
            placeholder="Una por línea, por ejemplo: ¿Aceptan mascotas?, ¿Cuál es el depósito requerido?…"
            rows={6}
          />

          <div className="mt-6">
            <FieldLabel>
              O sube tu información completa de preguntas frecuentes
            </FieldLabel>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-purple-400/25 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:border-purple-400/50 hover:bg-white/[0.04]">
              <Upload className="h-8 w-8 text-purple-300" />
              <div>
                <p className="font-medium text-brand-white">
                  {d.faqFile
                    ? d.faqFile.name
                    : "Arrastra o haz clic para seleccionar"}
                </p>
                <p className="mt-1 text-sm text-brand-muted">
                  Documento, audio, texto, PDF, imágenes… cualquier formato
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => set("faqFile", e.target.files?.[0] ?? null)}
              />
            </label>
            <p className="mt-2 text-xs text-brand-muted/80">
              Cuánta más información des, más precisas serán las respuestas que
              el chatbot dé a tus prospectos.
            </p>
          </div>

          <div className="mt-6 flex gap-3 rounded-xl border border-purple-400/20 bg-purple-500/5 p-4 text-sm text-brand-muted">
            <CircleAlert className="h-5 w-5 shrink-0 text-purple-300" />
            <p>
              <strong className="text-brand-white">
                Toda la información que compartas aquí es 100% confidencial.
              </strong>{" "}
              Se usa únicamente para configurar tu chatbot y no se comparte con
              terceros.
            </p>
          </div>
        </div>
      );

    case 9:
      return (
        <div>
          <StepHeader
            number={9}
            title="¿Cuándo debe pasar a un humano?"
            subtitle="Marca los casos en que prefieres que el chatbot delegue a tu equipo."
          />
          <div className="space-y-2.5">
            {HANDOFF_CASES.map((c) => (
              <OptionCard
                key={c}
                active={d.handoffCases.includes(c)}
                onClick={() => toggleIn("handoffCases", c)}
                multi
              >
                {c}
              </OptionCard>
            ))}
          </div>
          <div className="mt-5">
            <FieldLabel>¿Algún otro caso? (opcional)</FieldLabel>
            <TextArea
              value={d.handoffOther}
              onChange={(v) => set("handoffOther", v)}
              placeholder="Describe casos específicos de tu operación…"
              rows={3}
            />
          </div>
        </div>
      );

    case 10:
      return (
        <div>
          <StepHeader
            number={10}
            title="¿Usas algún CRM?"
            subtitle="Te integramos con el tuyo o te incluimos el CRM nativo del dashboard."
          />
          <div className="grid grid-cols-2 gap-3">
            <OptionCard
              active={d.hasCrm === "yes"}
              onClick={() => set("hasCrm", "yes")}
            >
              Sí, uso uno actualmente
            </OptionCard>
            <OptionCard
              active={d.hasCrm === "no"}
              onClick={() => set("hasCrm", "no")}
            >
              No, todavía no
            </OptionCard>
          </div>
          {d.hasCrm === "yes" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-5"
            >
              <div>
                <FieldLabel>¿Cuál CRM?</FieldLabel>
                <TextField
                  value={d.crmName}
                  onChange={(v) => set("crmName", v)}
                  placeholder="Ej. HubSpot, Pipedrive, Zoho, Salesforce…"
                />
              </div>
              <div>
                <FieldLabel>¿Cómo prefieres trabajar?</FieldLabel>
                <div className="space-y-2">
                  {[
                    { id: "current", label: "Seguir solo con mi CRM actual" },
                    { id: "dashboard", label: "Usar solo el CRM del dashboard" },
                    {
                      id: "mixed",
                      label: "Mixto — ambos sincronizados",
                    },
                  ].map((o) => (
                    <OptionCard
                      key={o.id}
                      active={d.crmPreference === o.id}
                      onClick={() => set("crmPreference", o.id)}
                    >
                      {o.label}
                    </OptionCard>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {d.hasCrm === "no" && (
            <div className="mt-6 flex gap-3 rounded-xl border border-purple-400/20 bg-purple-500/5 p-4 text-sm text-brand-muted">
              <Sparkles className="h-5 w-5 shrink-0 text-purple-300" />
              <p>
                Perfecto. Te incluimos el{" "}
                <strong className="text-brand-white">
                  CRM integrado del dashboard
                </strong>{" "}
                sin costo extra.
              </p>
            </div>
          )}
        </div>
      );

    case 11:
      return (
        <div>
          <StepHeader
            number={11}
            title="¿Qué personalidad tendrá tu chatbot?"
            subtitle="Así sonará al hablar con tus prospectos."
          />
          <div className="space-y-3">
            {PERSONALITIES.map((p) => {
              const active = d.personality === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set("personality", p.id)}
                  className={`block w-full rounded-2xl border p-5 text-left transition-all ${
                    active
                      ? "border-purple-400/60 bg-purple-500/10 shadow-[0_0_30px_rgba(124,58,237,0.15)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-heading text-lg font-bold text-brand-white">
                        {p.label}
                      </div>
                      <div className="mt-0.5 text-sm text-brand-muted">
                        {p.desc}
                      </div>
                    </div>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        active
                          ? "border-purple-400 bg-purple-500 text-white"
                          : "border-white/20 bg-transparent text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  </div>
                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#0E0E10] px-4 py-3 text-[13px] italic leading-relaxed text-[#d4d4d8]">
                    “{p.example}”
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );

    case 12:
      return (
        <div>
          <StepHeader
            number={12}
            title="Tus datos de contacto"
            subtitle="Para enviarte el acceso a tu prueba gratis y coordinar la activación."
          />
          <div className="space-y-5">
            <div>
              <FieldLabel>Tu nombre *</FieldLabel>
              <TextField
                value={d.contactName}
                onChange={(v) => set("contactName", v)}
                placeholder="Nombre y apellido"
              />
            </div>
            <div>
              <FieldLabel>¿Qué cargo ocupas? *</FieldLabel>
              <div className="grid gap-2">
                {ROLES.map((r) => (
                  <OptionCard
                    key={r}
                    active={d.role === r}
                    onClick={() => set("role", r)}
                  >
                    {r}
                  </OptionCard>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Correo electrónico *</FieldLabel>
              <TextField
                type="email"
                value={d.email}
                onChange={(v) => set("email", v)}
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <FieldLabel>WhatsApp (con código de país)</FieldLabel>
              <TextField
                value={d.whatsapp}
                onChange={(v) => set("whatsapp", v)}
                placeholder="+52 246 195 7348"
              />
            </div>
            <div>
              <FieldLabel>¿Cómo prefieres que te contactemos? *</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <OptionCard
                  active={d.preferredContact === "whatsapp"}
                  onClick={() => set("preferredContact", "whatsapp")}
                >
                  WhatsApp
                </OptionCard>
                <OptionCard
                  active={d.preferredContact === "email"}
                  onClick={() => set("preferredContact", "email")}
                >
                  Email
                </OptionCard>
              </div>
            </div>
          </div>
        </div>
      );

    case 13: {
      const has = d.manychatStatus !== "";
      return (
        <div>
          <StepHeader
            number={13}
            title="Conexión a terceros"
            subtitle="Para activar tu chatbot necesitamos acceso a dos plataformas: ManyChat (el conector con WhatsApp, Instagram y Messenger) y OpenAI (el cerebro del chatbot). Te dejamos el paso a paso para que sea sencillo."
          />

          {/* ManyChat */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-purple-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-200">
              01 · ManyChat
            </div>
            <h3 className="font-heading text-xl font-bold text-brand-white sm:text-2xl">
              ¿Ya usas ManyChat?
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <OptionCard
                active={d.manychatStatus === "yes"}
                onClick={() => set("manychatStatus", "yes")}
              >
                Sí, ya lo uso
              </OptionCard>
              <OptionCard
                active={d.manychatStatus === "no"}
                onClick={() => set("manychatStatus", "no")}
              >
                No, todavía no
              </OptionCard>
            </div>

            {has && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 grid gap-6 md:grid-cols-2"
              >
                <div>
                  <p className="mb-4 text-sm font-semibold text-brand-white">
                    {d.manychatStatus === "yes"
                      ? "Cómo darme acceso:"
                      : "Crea tu cuenta y dame acceso:"}
                  </p>
                  <NumberedSteps
                    steps={
                      d.manychatStatus === "yes"
                        ? ManyChatStepsExisting
                        : ManyChatStepsNew
                    }
                  />
                </div>
                <div>
                  <YouTubeEmbed
                    id="XlatDKw0dp0"
                    title={
                      d.manychatStatus === "yes"
                        ? "Cómo darme acceso a tu ManyChat"
                        : "Crear cuenta de ManyChat y darme acceso"
                    }
                  />
                  {d.manychatStatus === "yes" && (
                    <p className="mt-3 flex gap-2 rounded-lg border border-purple-400/20 bg-purple-500/5 px-3 py-2 text-xs text-brand-muted">
                      <Sparkles className="h-4 w-4 shrink-0 text-purple-300" />
                      <span>
                        En el{" "}
                        <strong className="text-brand-white">minuto 2:38</strong>{" "}
                        está la explicación de cómo agregar mi correo a tu cuenta
                        de ManyChat.
                      </span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </section>

          {/* OpenAI */}
          <section className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-purple-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-200">
              02 · OpenAI API
            </div>
            <h3 className="font-heading text-xl font-bold text-brand-white sm:text-2xl">
              Crea tu proyecto y dame acceso
            </h3>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <NumberedSteps steps={OpenAISteps} />
              <YouTubeEmbed
                id="gWZhLsoeJ4A"
                title="Crea tu proyecto y dame acceso"
              />
            </div>

            <OpenAICostEstimate monthly={d.monthlyMessages} />
          </section>

          <div className="mt-5 flex gap-3 rounded-xl border border-purple-400/20 bg-purple-500/5 p-4 text-sm text-brand-muted">
            <Sparkles className="h-5 w-5 shrink-0 text-purple-300" />
            <p>
              ¿Te trabaste en algún paso? No te preocupes — te acompañamos por
              WhatsApp o email durante toda la configuración.
            </p>
          </div>
        </div>
      );
    }

    case 14:
      return (
        <div>
          <StepHeader
            number={14}
            title="Un detalle importante"
            subtitle="Antes de enviar, queremos ser transparentes sobre lo que cubre la prueba."
          />
          <div className="space-y-4 rounded-2xl border border-purple-400/20 bg-purple-500/[0.05] p-6">
            <div className="flex gap-3">
              <CircleAlert className="h-5 w-5 shrink-0 text-purple-300" />
              <div className="text-sm leading-relaxed text-brand-muted">
                <p className="mb-2 font-medium text-brand-white">
                  Tu prueba de 14 días cubre la implementación completa del
                  sistema de IA: chatbot, dashboard, base de datos y CRM.
                </p>
                <p>
                  No incluye el pago por APIs o servicios externos —
                  principalmente la{" "}
                  <strong className="text-brand-white">API de OpenAI</strong>,
                  cuyo costo depende del volumen real de mensajes que procese
                  el bot. Te explicaremos al detalle cuando coordinemos la
                  activación.
                </p>
              </div>
            </div>
          </div>
          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
            <input
              type="checkbox"
              checked={d.acceptTerms}
              onChange={(e) => set("acceptTerms", e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-purple-500"
            />
            <span className="text-sm leading-relaxed text-brand-white">
              Entiendo que la prueba gratis cubre la implementación del sistema
              de IA y que los costos de APIs externas (como OpenAI) son
              independientes según el volumen de mensajes.
            </span>
          </label>

          {/* Cloudflare Turnstile (bot check) */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <TurnstileWidget
              onVerify={(token) => set("turnstileToken", token)}
              onExpire={() => set("turnstileToken", "")}
            />
            <p className="text-center text-[11px] text-brand-muted/70">
              Verificación anti-spam de Cloudflare. No nos guarda nada.
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Thank you screen                                                          */
/* -------------------------------------------------------------------------- */

function ThankYou({ name }: { name: string }) {
  const first = name.trim().split(" ")[0] || "";
  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 shadow-[0_0_50px_rgba(124,58,237,0.5)]">
        <Check className="h-10 w-10 text-white" strokeWidth={3} />
      </div>
      <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-brand-white sm:text-5xl">
        ¡Listo{first ? `, ${first}` : ""}!
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-muted sm:text-xl">
        Recibimos tu información. En las próximas horas te contactamos para
        coordinar la activación de tu{" "}
        <strong className="text-brand-white">prueba de 14 días gratis</strong>.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-6 py-3 text-sm font-medium text-brand-white transition-colors hover:bg-white/[0.06]"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al sitio
      </Link>
    </div>
  );
}
