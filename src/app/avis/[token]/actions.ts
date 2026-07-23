"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendAvisAlerteInterne } from "@/lib/emails";

export type AvisActionState = {
  error: string | null;
  success: boolean;
  note: number | null;
};

export async function submitAvis(
  token: string,
  _prevState: AvisActionState,
  formData: FormData,
): Promise<AvisActionState> {
  const note = Number(formData.get("note") ?? 0);
  const commentaire = String(formData.get("commentaire") ?? "").trim();

  if (!Number.isInteger(note) || note < 1 || note > 5) {
    return { error: "Merci de choisir une note de 1 à 5 étoiles.", success: false, note: null };
  }

  const admin = createAdminClient();
  const { data: avis } = await admin
    .from("avis")
    .select("id, note, entreprise_id, chantier_id")
    .eq("token", token)
    .single();

  if (!avis) {
    return { error: "Lien invalide ou expiré.", success: false, note: null };
  }

  if (avis.note !== null) {
    return { error: "Vous avez déjà répondu à cette demande d'avis.", success: false, note: avis.note };
  }

  // Update conditionné sur "note is null" : élimine la fenêtre de course
  // entre la lecture ci-dessus et l'écriture (deux soumissions quasi
  // simultanées sur le même lien ne peuvent pas toutes les deux réussir).
  const { data: misAJour, error } = await admin
    .from("avis")
    .update({ note, commentaire: commentaire || null })
    .eq("id", avis.id)
    .is("note", null)
    .select("id")
    .single();

  if (error || !misAJour) {
    return {
      error: "Vous avez déjà répondu à cette demande d'avis.",
      success: false,
      note: null,
    };
  }

  if (note <= 3) {
    const { data: entreprise } = await admin
      .from("entreprises")
      .select("nom, email")
      .eq("id", avis.entreprise_id)
      .single();

    if (entreprise) {
      const { data: chantier } = await admin
        .from("chantiers")
        .select("nom_client")
        .eq("id", avis.chantier_id)
        .single();

      await sendAvisAlerteInterne(
        entreprise.email,
        note,
        commentaire || null,
        chantier?.nom_client ?? "un client",
      ).catch(() => {});
    }
  }

  return { error: null, success: true, note };
}
