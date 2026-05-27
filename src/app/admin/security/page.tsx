import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import MfaEnroll from "./MfaEnroll";

export const dynamic = "force-dynamic";

// Lets the logged-in admin enroll a TOTP MFA factor on their own
// Supabase account. The Supabase dashboard intentionally does NOT
// expose enrollment so we provide it inside the app — same security
// model, but accessible to a non-technical owner.

export default async function SecurityPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/admin/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) redirect("/admin/login");

  // If the user has already enrolled and verified a TOTP factor but is
  // still at AAL1, they must clear the challenge before they can touch
  // this page (otherwise they could un-enroll without re-proving
  // ownership of the second factor).
  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2") {
    redirect("/admin/mfa-challenge");
  }

  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const verified =
    factorsData?.totp?.filter((f) => f.status === "verified") ?? [];

  return (
    <div className="px-5 py-8 sm:px-10 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-brand-muted transition-colors hover:text-brand-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Link>

        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-purple-300">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Seguridad de tu cuenta
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-brand-white sm:text-4xl">
            Verificación en dos pasos
          </h1>
          <p className="mt-3 text-base text-brand-muted">
            Cuando esté activa, además de tu contraseña te pediremos un código
            de 6 dígitos que cambia cada 30 segundos en tu celular. Si alguien
            llegara a saber tu contraseña, aún así no podría entrar.
          </p>
        </header>

        <MfaEnroll alreadyVerified={verified.length > 0} />
      </div>
    </div>
  );
}
