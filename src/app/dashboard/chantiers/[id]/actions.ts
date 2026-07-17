"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  sendEtapeUpdate,
  sendNouveauMessageClient,
  sendPriseEnCharge,
  sendCloture,
} from "@/lib/emails";
import type {
  StatutChantier,
  StatutEtape,
  Priorite,
} from "@/lib/types";

export type ChantierActionState = { error: string | null; success: boolean };

async function logActivite(
  supabase: SupabaseClient,
  reclamationId: string,
  description: string,
) {
  await supabase
    .from("activites_ticket")
    .insert({ reclamation_id: reclamationId, description });
}

export async function updateChantier(
  chantierId: string,
  _prevState: ChantierActionState,
  formData: FormData,
): Promise<ChantierActionState> {
  const statut = String(formData.get("statut") ?? "") as StatutChantier;
  const date_debut = String(formData.get("date_debut") ?? "") || null;
  const date_fin_prevue = String(formData.get("date_fin_prevue") ?? "") || null;

  const supabase = createClient();
  const { error } = await supabase
    .from("chantiers")
    .update({ statut, date_debut, date_fin_prevue })
    .eq("id", chantierId);

  if (error) {
    return { error: "Impossible de mettre à jour le chantier.", success: false };
  }

  revalidatePath(`/dashboard/chantiers/${chantierId}`);
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function updateProgression(chantierId: string, progression: number) {
  const supabase = createClient();
  const clamped = Math.min(100, Math.max(0, Math.round(progression)));
  const update: { progression: number; statut?: StatutChantier } = {
    progression: clamped,
  };
  if (clamped >= 100) update.statut = "termine";

  await supabase.from("chantiers").update(update).eq("id", chantierId);
  revalidatePath(`/dashboard/chantiers/${chantierId}`);
  revalidatePath("/dashboard");
}

export async function toggleEtape(
  chantierId: string,
  etapeId: string,
  currentStatut: StatutEtape,
) {
  const supabase = createClient();
  const nouveauStatut: StatutEtape = currentStatut === "fait" ? "pending" : "fait";

  const { error } = await supabase
    .from("etapes")
    .update({ statut: nouveauStatut })
    .eq("id", etapeId);

  if (!error && nouveauStatut === "fait") {
    const [{ data: chantier }, { data: etape }] = await Promise.all([
      supabase
        .from("chantiers")
        .select("email_client, adresse, entreprise_id, entreprises(nom)")
        .eq("id", chantierId)
        .single(),
      supabase.from("etapes").select("nom").eq("id", etapeId).single(),
    ]);

    const entrepriseNom = (
      chantier as unknown as { entreprises: { nom: string } | null } | null
    )?.entreprises?.nom;

    if (chantier && etape && entrepriseNom) {
      await sendEtapeUpdate(
        chantier.email_client,
        entrepriseNom,
        chantier.adresse,
        etape.nom,
      ).catch(() => {});
    }
  }

  revalidatePath(`/dashboard/chantiers/${chantierId}`);
}

export async function uploadPhoto(
  chantierId: string,
  _prevState: ChantierActionState,
  formData: FormData,
): Promise<ChantierActionState> {
  const file = formData.get("photo") as File | null;
  const caption = String(formData.get("caption") ?? "").trim();

  if (!file || file.size === 0) {
    return { error: "Merci de sélectionner une photo.", success: false };
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${chantierId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("chantier-photos")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: "Impossible d'envoyer la photo.", success: false };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("chantier-photos").getPublicUrl(path);

  const { error: insertError } = await supabase.from("photos").insert({
    chantier_id: chantierId,
    url: publicUrl,
    caption: caption || null,
  });

  if (insertError) {
    return {
      error: "Photo envoyée mais impossible de l'enregistrer.",
      success: false,
    };
  }

  revalidatePath(`/dashboard/chantiers/${chantierId}`);
  return { error: null, success: true };
}

export async function sendMessageEntreprise(
  chantierId: string,
  _prevState: ChantierActionState,
  formData: FormData,
): Promise<ChantierActionState> {
  const contenu = String(formData.get("contenu") ?? "").trim();
  if (!contenu) {
    return { error: "Le message ne peut pas être vide.", success: false };
  }

  const supabase = createClient();
  const { error } = await supabase.from("messages").insert({
    chantier_id: chantierId,
    contenu,
    auteur: "entreprise",
  });

  if (error) {
    return { error: "Impossible d'envoyer le message.", success: false };
  }

  const { data: chantier } = await supabase
    .from("chantiers")
    .select("email_client, entreprises(nom)")
    .eq("id", chantierId)
    .single();

  const entrepriseNom = (
    chantier as unknown as { entreprises: { nom: string } | null } | null
  )?.entreprises?.nom;

  if (chantier && entrepriseNom) {
    await sendNouveauMessageClient(chantier.email_client, entrepriseNom).catch(
      () => {},
    );
  }

  revalidatePath(`/dashboard/chantiers/${chantierId}`);
  return { error: null, success: true };
}

// ━━━ Étape 03 — Qualification ━━━

export async function updatePrioriteReclamation(
  chantierId: string,
  reclamationId: string,
  priorite: Priorite,
) {
  const supabase = createClient();
  await supabase
    .from("reclamations")
    .update({ priorite, derniere_mise_a_jour: new Date().toISOString() })
    .eq("id", reclamationId);

  revalidatePath(`/dashboard/chantiers/${chantierId}`);
  revalidatePath("/dashboard");
}

export async function updateNoteInterne(
  chantierId: string,
  reclamationId: string,
  noteInterne: string,
) {
  const supabase = createClient();
  await supabase
    .from("reclamations")
    .update({
      note_interne: noteInterne || null,
      derniere_mise_a_jour: new Date().toISOString(),
    })
    .eq("id", reclamationId);

  revalidatePath(`/dashboard/chantiers/${chantierId}`);
}

// ━━━ Étape 04 — Prise en charge ━━━

export async function prendreEnCharge(chantierId: string, reclamationId: string) {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: reclamation } = await supabase
    .from("reclamations")
    .select("numero_ticket")
    .eq("id", reclamationId)
    .single();

  const { error } = await supabase
    .from("reclamations")
    .update({
      statut: "en_cours",
      date_prise_en_charge: now,
      derniere_mise_a_jour: now,
      niveau_relance: 0,
    })
    .eq("id", reclamationId);

  if (error || !reclamation) return;

  await logActivite(
    supabase,
    reclamationId,
    "Votre demande a été prise en charge par notre équipe.",
  );

  const { data: chantier } = await supabase
    .from("chantiers")
    .select("email_client, entreprises(nom)")
    .eq("id", chantierId)
    .single();

  const entrepriseNom = (
    chantier as unknown as { entreprises: { nom: string } | null } | null
  )?.entreprises?.nom;

  if (chantier && entrepriseNom) {
    await sendPriseEnCharge(
      chantier.email_client,
      entrepriseNom,
      reclamation.numero_ticket,
    ).catch(() => {});
  }

  revalidatePath(`/dashboard/chantiers/${chantierId}`);
  revalidatePath("/dashboard");
}

// ━━━ Étape 06 — Clôture ━━━

export async function clorReclamation(
  chantierId: string,
  reclamationId: string,
  _prevState: ChantierActionState,
  formData: FormData,
): Promise<ChantierActionState> {
  const description = String(formData.get("description_resolution") ?? "").trim();
  const photo = formData.get("photo") as File | null;

  if (!description) {
    return {
      error: "La description de l'intervention est obligatoire.",
      success: false,
    };
  }
  if (!photo || photo.size === 0) {
    return {
      error: "Une photo « après intervention » est obligatoire.",
      success: false,
    };
  }

  const supabase = createClient();
  const ext = photo.name.split(".").pop() ?? "jpg";
  const path = `${reclamationId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("reclamation-photos")
    .upload(path, photo, { contentType: photo.type });

  if (uploadError) {
    return { error: "Impossible d'envoyer la photo.", success: false };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("reclamation-photos").getPublicUrl(path);

  await supabase.from("reclamation_photos").insert({
    reclamation_id: reclamationId,
    url: publicUrl,
    type: "resolution",
  });

  const now = new Date();
  const dateLimiteContestation = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  const { data: reclamation, error: updateError } = await supabase
    .from("reclamations")
    .update({
      statut: "resolue",
      description_resolution: description,
      date_cloture: now.toISOString(),
      date_limite_contestation: dateLimiteContestation.toISOString(),
      derniere_mise_a_jour: now.toISOString(),
    })
    .eq("id", reclamationId)
    .select("numero_ticket")
    .single();

  if (updateError || !reclamation) {
    return { error: "Impossible de clôturer la réclamation.", success: false };
  }

  await logActivite(
    supabase,
    reclamationId,
    "Votre demande a été résolue. Vous disposez de 72h pour la contester si besoin.",
  );

  const { data: chantier } = await supabase
    .from("chantiers")
    .select("email_client, entreprises(nom)")
    .eq("id", chantierId)
    .single();

  const entrepriseNom = (
    chantier as unknown as { entreprises: { nom: string } | null } | null
  )?.entreprises?.nom;

  if (chantier && entrepriseNom) {
    await sendCloture(
      chantier.email_client,
      entrepriseNom,
      reclamation.numero_ticket,
      description,
      publicUrl,
    ).catch(() => {});
  }

  revalidatePath(`/dashboard/chantiers/${chantierId}`);
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
