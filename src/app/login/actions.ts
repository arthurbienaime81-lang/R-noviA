"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sousLaLimite } from "@/lib/rateLimit";

export type AuthState = { error: string | null };

const MAX_TENTATIVES = 8;
const FENETRE_MINUTES = 10;

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");

  if (!email || !password) {
    return { error: "Veuillez renseigner votre email et votre mot de passe." };
  }

  // Anti-brute-force : la table login_attempts n'a pas de policy RLS
  // (deny-by-default), donc on y accède uniquement via service_role.
  const admin = createAdminClient();

  if (!(await sousLaLimite(admin, "login_attempts", "email", email, MAX_TENTATIVES, FENETRE_MINUTES))) {
    return {
      error: "Trop de tentatives de connexion. Merci de réessayer dans quelques minutes.",
    };
  }

  // Purge opportuniste des tentatives de plus de 24h pour ne pas laisser
  // cette table de bookkeeping grossir indéfiniment.
  await admin
    .from("login_attempts")
    .delete()
    .lt("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString());
  await admin.from("login_attempts").insert({ email });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  redirect(redirectTo || "/dashboard");
}
