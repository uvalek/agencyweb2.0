"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captchaRequired = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Rate-limit + captcha gate. The server checks Turnstile before
    // letting the login attempt reach Supabase Auth.
    try {
      const gate = await fetch("/api/admin/login-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captchaToken }),
      });
      if (gate.status === 429) {
        const retry = gate.headers.get("Retry-After");
        setError(
          `Demasiados intentos. Espera ${
            retry ? `${retry} segundos` : "unos minutos"
          } y vuelve a intentar.`
        );
        setLoading(false);
        return;
      }
      if (gate.status === 400) {
        setError("Verificación anti-bot fallida. Recarga e inténtalo otra vez.");
        setLoading(false);
        return;
      }
    } catch {
      // If the gate itself is unreachable we still try the login.
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.refresh();
    router.replace("/admin");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-brand-muted transition-colors hover:text-brand-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al sitio
        </Link>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-white sm:text-3xl">
            Acceso administrador
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Inicia sesión para ver las solicitudes de prueba.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-brand-muted">
                Correo
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-base text-brand-white placeholder:text-brand-muted/60 outline-none transition-colors focus:border-purple-400/50 focus:bg-white/[0.05]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-brand-muted">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-base text-brand-white placeholder:text-brand-muted/60 outline-none transition-colors focus:border-purple-400/50 focus:bg-white/[0.05]"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Cloudflare Turnstile */}
            <div className="flex justify-center pt-1">
              <TurnstileWidget
                onVerify={setCaptchaToken}
                onExpire={() => setCaptchaToken("")}
              />
            </div>

            <button
              type="submit"
              disabled={loading || (captchaRequired && !captchaToken)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Entrando…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Entrar
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
