"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Step =
  | { kind: "idle" }
  | {
      kind: "enrolling";
      factorId: string;
      qrSvg: string;
      secret: string;
    }
  | { kind: "done" };

export default function MfaEnroll({
  alreadyVerified,
}: {
  alreadyVerified: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startEnroll() {
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `AlekAgency Admin (${new Date().toLocaleDateString(
        "es-MX"
      )})`,
    });
    setLoading(false);
    if (error || !data) {
      setError(error?.message ?? "No se pudo iniciar el registro.");
      return;
    }
    setStep({
      kind: "enrolling",
      factorId: data.id,
      qrSvg: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }

  async function verify() {
    if (step.kind !== "enrolling") return;
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge(
      { factorId: step.factorId }
    );
    if (cErr || !challenge) {
      setLoading(false);
      setError(cErr?.message ?? "No se pudo solicitar el desafío.");
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: step.factorId,
      challengeId: challenge.id,
      code: code.replace(/\s/g, ""),
    });
    setLoading(false);
    if (vErr) {
      setError(vErr.message ?? "Código incorrecto. Inténtalo de nuevo.");
      return;
    }
    setStep({ kind: "done" });
    setTimeout(() => router.refresh(), 1500);
  }

  if (alreadyVerified || step.kind === "done") {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/[0.05] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-green-400" />
          <h2 className="font-heading text-xl font-bold text-brand-white">
            Verificación en dos pasos activada
          </h2>
        </div>
        <p className="mt-3 text-sm text-brand-muted">
          A partir de tu próximo inicio de sesión te pediremos también el
          código de 6 dígitos de tu aplicación.
        </p>
      </div>
    );
  }

  if (step.kind === "idle") {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <ShieldX className="h-6 w-6 text-amber-300" />
          <h2 className="font-heading text-xl font-bold text-brand-white">
            Verificación en dos pasos desactivada
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">
          Es muy recomendable activarla. Antes de empezar, instala en tu
          celular alguna de estas apps:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brand-muted">
          <li>Google Authenticator</li>
          <li>Authy</li>
          <li>1Password / Bitwarden (cualquiera con soporte TOTP)</li>
        </ul>
        <button
          type="button"
          onClick={startEnroll}
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Preparando…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" /> Activar
            </>
          )}
        </button>
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>
    );
  }

  // step.kind === "enrolling"
  return (
    <div className="rounded-2xl border border-purple-400/30 bg-purple-500/[0.05] p-6 sm:p-8">
      <h2 className="font-heading text-xl font-bold text-brand-white">
        Escanea el código con tu app
      </h2>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-brand-muted">
        <li>Abre Google Authenticator (o Authy) en tu celular.</li>
        <li>
          Toca <strong className="text-brand-white">+ / Añadir cuenta</strong>{" "}
          y elige <strong className="text-brand-white">Escanear QR</strong>.
        </li>
        <li>Apunta la cámara al código de abajo.</li>
        <li>
          Escribe el código de 6 dígitos que muestre la app y dale{" "}
          <strong className="text-brand-white">Verificar</strong>.
        </li>
      </ol>

      <div className="mt-6 flex justify-center">
        <div
          className="rounded-2xl border border-white/10 bg-white p-3"
          // Supabase returns the QR as raw SVG markup. It's a trusted source
          // (their own auth API) and contains no scripts, so injecting it
          // here is safe.
          dangerouslySetInnerHTML={{ __html: step.qrSvg }}
        />
      </div>

      <details className="mt-5 text-xs text-brand-muted">
        <summary className="cursor-pointer hover:text-brand-white">
          ¿No puedes escanear? Mete el código a mano
        </summary>
        <p className="mt-2 break-all rounded border border-white/[0.08] bg-white/[0.03] px-3 py-2 font-mono text-brand-white">
          {step.secret}
        </p>
      </details>

      <div className="mt-6">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-brand-muted">
          Código de 6 dígitos
        </label>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123 456"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-center text-2xl tracking-widest text-brand-white outline-none focus:border-purple-400/50"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setStep({ kind: "idle" });
            setCode("");
            setError(null);
          }}
          className="text-sm text-brand-muted hover:text-brand-white"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={verify}
          disabled={loading || code.replace(/\s/g, "").length < 6}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verificando…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" /> Verificar
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
