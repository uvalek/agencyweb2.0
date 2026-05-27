import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import MfaChallenge from "./MfaChallenge";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function MfaChallengePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  // No challenge needed → fall through to the dashboard.
  if (
    !aal ||
    aal.currentLevel === "aal2" ||
    aal.nextLevel === "aal1"
  ) {
    redirect("/admin");
  }

  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const firstTotp = factorsData?.totp?.find((f) => f.status === "verified");
  if (!firstTotp) redirect("/admin");

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

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-white sm:text-3xl">
            Verificación en dos pasos
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Ingresa el código de 6 dígitos de tu app autenticadora para
            terminar el inicio de sesión.
          </p>

          <MfaChallenge factorId={firstTotp.id} />

          <form action={signOut} className="mt-6">
            <button
              type="submit"
              className="text-xs text-brand-muted hover:text-brand-white"
            >
              Cancelar y volver al login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
