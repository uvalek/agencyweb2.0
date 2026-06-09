import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Centralised auth gate for every server component under /admin.
//
//   - Not logged in        → /admin/login
//   - Wrong email          → /admin/login (when ADMIN_EMAIL is set)
//   - Has TOTP factor but
//     current AAL is aal1  → /admin/mfa-challenge
//
// Pass `skipMfa: true` for routes that must be reachable at AAL1 — the
// MFA challenge page itself, and the security page (where the user
// enrols a new factor for the first time).

export type AdminUser = {
  id: string;
  email?: string | null;
};

export async function requireAdminAuth(opts?: {
  skipMfa?: boolean;
}): Promise<AdminUser> {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) redirect("/admin/login");
  const user = userData.user;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) {
    redirect("/admin/login");
  }

  if (!opts?.skipMfa) {
    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2") {
      redirect("/admin/mfa-challenge");
    }
  }

  return { id: user.id, email: user.email };
}
