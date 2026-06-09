"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function MfaChallenge({ factorId }: { factorId: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.replace(/\s/g, ""),
    });
    if (error) {
      setError(error.message || "Código incorrecto. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }
    router.refresh();
    router.replace("/admin");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-brand-muted">
          Código de 6 dígitos
        </label>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123 456"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-center text-2xl tracking-widest text-brand-white outline-none focus:border-purple-400/50"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || code.replace(/\s/g, "").length < 6}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Verificando…
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" /> Verificar y entrar
          </>
        )}
      </button>
    </form>
  );
}
