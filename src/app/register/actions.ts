"use server";

import { redirect } from "next/navigation";
import { isAuthWeakPasswordError } from "@supabase/supabase-js";
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
  if (password.length < 8) {
    return {
      error: "Le mot de passe doit contenir au moins 8 caractères.",
      info: null,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    // Le détail technique (error.message) reste dans les logs serveur pour le
    // diagnostic, mais ne doit jamais être répercuté tel quel à l'utilisateur
    // (fuite d'informations d'implémentation) — seul le cas "email déjà
    // utilisé" est suffisamment sûr et utile pour être affiché explicitement.
    if (error) {
      console.error("[register] supabase.auth.signUp error:", error.status, error.message);
    }
    // Le minimum de longueur imposé par le dashboard Supabase peut être plus
    // strict que la vérification ci-dessus (ex. relevé sans mettre à jour le
    // code) — dans ce cas Supabase rejette avec AuthWeakPasswordError plutôt
    // qu'un message générique, qu'on traduit ici en message clair.
    if (error && isAuthWeakPasswordError(error)) {
      return {
        error: error.reasons.includes("length")
          ? "Le mot de passe doit contenir au moins 8 caractères."
          : "Ce mot de passe est trop faible. Merci d'en choisir un autre.",
        info: null,
      };
    }
    return {
      error:
        error?.message === "User already registered"
          ? "Un compte existe déjà avec cet email."
          : "Impossible de créer le compte pour le moment. Merci de réessayer.",
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
