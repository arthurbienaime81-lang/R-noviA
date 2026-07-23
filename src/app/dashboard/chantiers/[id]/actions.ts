"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  sendEtapeUpdate,
  sendNouveauMessageClient,
  sendPriseEnCharge,
  sendCloture,
  sendClotureChantier,
} from "@/lib/emails";
import type {
  StatutChantier,
  StatutEtape,
  Priorite,
} from "@/lib/types";
import { validatePhotoFile, extensionFromMimeType } from "@/lib/uploads";

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
  const statutSaisi = String(formData.get("statut") ?? "");
  // "termine" et "conteste" ne sont accessibles que via les flux dédiés
  // (clôture avec preuve photo, contestation client) : on ignore toute
  // tentative de les définir depuis ce formulaire générique.
  const statut: StatutChantier =
    statutSaisi === "en_retard" ? "en_retard" : "en_cours";
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

// Recalcule la progression (0/25/50/75/100 %) à partir du nombre d'étapes
// marquées "fait". Si une clôture avait déjà eu lieu et qu'une étape repasse
// "à faire" (progression < 100), la clôture est annulée : le chantier
// redevient "en_cours" et les informations de clôture sont effacées.
async function recalculerProgression(
  supabase: SupabaseClient,
  chantierId: string,
) {
  const { data: etapes } = await supabase
    .from("etapes")
    .select("statut")
    .eq("chantier_id", chantierId);

  const total = etapes?.length ?? 0;
  const faites = (etapes ?? []).filter((e) => e.statut === "fait").length;
  const progression = total > 0 ? Math.round((faites / total) * 100) : 0;

  const { data: chantier } = await supabase
    .from("chantiers")
    .select("statut")
    .eq("id", chantierId)
    .single();

  const update: {
    progression: number;
    statut?: StatutChantier;
    date_cloture?: null;
    date_limite_contestation?: null;
    description_cloture?: null;
    photo_cloture_url?: null;
  } = { progression };

  if (
    progression < 100 &&
    chantier &&
    (chantier.statut === "termine" || chantier.statut === "conteste")
  ) {
    update.statut = "en_cours";
    update.date_cloture = null;
    update.date_limite_contestation = null;
    update.description_cloture = null;
    update.photo_cloture_url = null;
  }

  await supabase.from("chantiers").update(update).eq("id", chantierId);
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

  if (!error) {
    await recalculerProgression(supabase, chantierId);

    if (nouveauStatut === "fait") {
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
  }

  revalidatePath(`/dashboard/chantiers/${chantierId}`);
  revalidatePath("/dashboard");
}

// ━━━ Clôture du chantier (progression 100 % requise, preuve photo obligatoire) ━━━

export async function clorChantier(
  chantierId: string,
  _prevState: ChantierActionState,
  formData: FormData,
): Promise<ChantierActionState> {
  const description = String(formData.get("description_cloture") ?? "").trim();
  const photo = formData.get("photo") as File | null;

  if (!description) {
    return {
      error: "La description de fin de chantier est obligatoire.",
      success: false,
    };
  }
  if (!photo || photo.size === 0) {
    return { error: "Une photo finale est obligatoire.", success: false };
  }
  const photoError = validatePhotoFile(photo);
  if (photoError) {
    return { error: photoError, success: false };
  }

  const supabase = createClient();

  const { data: chantierActuel } = await supabase
    .from("chantiers")
    .select("progression, statut")
    .eq("id", chantierId)
    .single();

  if (!chantierActuel || chantierActuel.progression < 100) {
    return {
      error: "Toutes les étapes doivent être terminées avant de clôturer le chantier.",
      success: false,
    };
  }
  if (chantierActuel.statut !== "en_cours") {
    return { error: "Ce chantier est déjà clôturé.", success: false };
  }

  const ext = extensionFromMimeType(photo.type);
  const path = `${chantierId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("chantier-photos")
    .upload(path, photo, { contentType: photo.type });

  if (uploadError) {
    return { error: "Impossible d'envoyer la photo.", success: false };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("chantier-photos").getPublicUrl(path);

  await supabase.from("photos").insert({
    chantier_id: chantierId,
    url: publicUrl,
    caption: "Photo de clôture",
  });

  const now = new Date();
  const dateLimiteContestation = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  const { data: chantier, error: updateError } = await supabase
    .from("chantiers")
    .update({
      statut: "termine",
      description_cloture: description,
      photo_cloture_url: publicUrl,
      date_cloture: now.toISOString(),
      date_limite_contestation: dateLimiteContestation.toISOString(),
    })
    .eq("id", chantierId)
    .select("email_client, nom_client, entreprises(nom)")
    .single();

  if (updateError || !chantier) {
    return { error: "Impossible de clôturer le chantier.", success: false };
  }

  const entrepriseNom = (
    chantier as unknown as { entreprises: { nom: string } | null } | null
  )?.entreprises?.nom;

  if (entrepriseNom) {
    await sendClotureChantier(
      chantier.email_client,
      entrepriseNom,
      chantier.nom_client,
      description,
      publicUrl,
    ).catch(() => {});
  }

  revalidatePath(`/dashboard/chantiers/${chantierId}`);
  revalidatePath("/dashboard");
  return { error: null, success: true };
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
  const fileError = validatePhotoFile(file);
  if (fileError) {
    return { error: fileError, success: false };
  }

  const supabase = createClient();
  const ext = extensionFromMimeType(file.type);
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
  const photoError = validatePhotoFile(photo);
  if (photoError) {
    return { error: photoError, success: false };
  }

  const supabase = createClient();
  const ext = extensionFromMimeType(photo.type);
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
