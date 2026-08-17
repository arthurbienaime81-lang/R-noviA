"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/utils";

export type ResetState = { error: string | null; success: boolean };

export async function requestPasswordReset(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Merci de renseigner votre email.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await getOrigin()}/reset-password/confirm`,
  });

  if (error) {
    return {
      error: "Impossible d'envoyer l'email de réinitialisation. Réessayez.",
      success: false,
    };
  }

  return { error: null, success: true };
}
