"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type RegisterState = { error: string | null; info: string | null };

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const nom = String(formData.get("nom") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const tel = String(formData.get("tel") ?? "").trim();

  if (!nom || !email || !password) {
    return {
      error: "Merci de renseigner le nom de la société, l'email et le mot de passe.",
      info: null,
    };
  }
  if (password.length < 6) {
    return {
      error: "Le mot de passe doit contenir au moins 6 caractères.",
      info: null,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return {
      error:
        error?.message === "User already registered"
          ? "Un compte existe déjà avec cet email."
          : "Impossible de créer le compte. Réessayez.",
      info: null,
    };
  }

  const admin = createAdminClient();
  const { error: insertError } = await admin.from("entreprises").insert({
    user_id: data.user.id,
    nom,
    email,
    tel: tel || null,
  });

  if (insertError) {
    return {
      error: "Compte créé mais impossible d'enregistrer les informations de la société.",
      info: null,
    };
  }

  if (!data.session) {
    return {
      error: null,
      info: "Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.",
    };
  }

  redirect("/dashboard");
}
