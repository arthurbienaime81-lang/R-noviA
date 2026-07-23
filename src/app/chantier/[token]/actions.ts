"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendReclamationConfirmation,
  sendReclamationNotification,
  sendNouveauMessageEntreprise,
  sendContestationAlert,
  sendContestationChantierAlert,
} from "@/lib/emails";
import { getPrioriteForSujet, estHeureOuvree } from "@/lib/priorites";
import {
  MAX_PHOTOS_RECLAMATION,
  validatePhotoFile,
  extensionFromMimeType,
} from "@/lib/uploads";

export type PublicActionState = { error: string | null; success: boolean };

// Résout le lien_token (uuid non devinable) en chantier, via le client
// service_role. Toutes les écritures ci-dessous sont ensuite scopées à ce
// chantier_id résolu côté serveur — jamais à une valeur fournie par le client.
async function resolveChantier(token: string) {
  const admin = createAdminClient();
  const { data: chantier } = await admin
    .from("chantiers")
    .select(
      "id, nom_client, email_client, tel_client, adresse, entreprise_id, statut, date_limite_contestation",
    )
    .eq("lien_token", token)
    .single();
  return chantier;
}

export async function submitReclamation(
  token: string,
  _prevState: PublicActionState,
  formData: FormData,
): Promise<PublicActionState> {
  const canal = String(formData.get("canal") ?? "Formulaire web").trim();
  const sujet = String(formData.get("sujet") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const photos = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (!sujet || !message) {
    return {
      error: "Merci de renseigner le sujet et le message.",
      success: false,
    };
  }

  // Toujours revalider côté serveur : le nombre, le type et la taille des
  // fichiers ne doivent jamais être fiés au seul contrôle côté client, qui
  // peut être contourné par un appel API direct.
  if (photos.length > MAX_PHOTOS_RECLAMATION) {
    return {
      error: `Vous pouvez joindre au maximum ${MAX_PHOTOS_RECLAMATION} photos.`,
      success: false,
    };
  }
  for (const photo of photos) {
    const validationError = validatePhotoFile(photo);
    if (validationError) {
      return { error: validationError, success: false };
    }
  }

  const chantier = await resolveChantier(token);
  if (!chantier) {
    return { error: "Chantier introuvable.", success: false };
  }

  const priorite = getPrioriteForSujet(sujet);
  const horsHeuresOuvrees = !estHeureOuvree(new Date());

  const admin = createAdminClient();
  const { data: reclamation, error } = await admin
    .from("reclamations")
    .insert({ chantier_id: chantier.id, sujet, message, canal, priorite })
    .select("id, numero_ticket")
    .single();

  if (error || !reclamation) {
    return { error: "Impossible d'envoyer la réclamation.", success: false };
  }

  const photoUrls: string[] = [];
  for (const photo of photos) {
    const ext = extensionFromMimeType(photo.type);
    const path = `${reclamation.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("reclamation-photos")
      .upload(path, photo, { contentType: photo.type });

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = admin.storage.from("reclamation-photos").getPublicUrl(path);
      photoUrls.push(publicUrl);
      await admin.from("reclamation_photos").insert({
        reclamation_id: reclamation.id,
        url: publicUrl,
        type: "client",
      });
    }
  }

  await admin.from("activites_ticket").insert({
    reclamation_id: reclamation.id,
    description: `Votre demande a bien été enregistrée (ticket ${reclamation.numero_ticket}).`,
  });

  const { data: entreprise } = await admin
    .from("entreprises")
    .select("nom, email")
    .eq("id", chantier.entreprise_id)
    .single();

  await Promise.all([
    entreprise
      ? sendReclamationConfirmation(
          chantier.email_client,
          entreprise.nom,
          reclamation.numero_ticket,
          horsHeuresOuvrees,
        ).catch(() => {})
      : Promise.resolve(),
    entreprise
      ? sendReclamationNotification(
          entreprise.email,
          reclamation.numero_ticket,
          priorite,
          chantier.nom_client,
          chantier.email_client,
          chantier.tel_client,
          chantier.adresse,
          sujet,
          message,
          photoUrls,
        ).catch(() => {})
      : Promise.resolve(),
  ]);

  revalidatePath(`/chantier/${token}`);
  return { error: null, success: true };
}

export async function contesterReclamation(
  token: string,
  reclamationId: string,
): Promise<PublicActionState> {
  const chantier = await resolveChantier(token);
  if (!chantier) {
    return { error: "Chantier introuvable.", success: false };
  }

  const admin = createAdminClient();
  const { data: reclamation } = await admin
    .from("reclamations")
    .select("id, chantier_id, statut, numero_ticket, date_limite_contestation")
    .eq("id", reclamationId)
    .single();

  if (!reclamation || reclamation.chantier_id !== chantier.id) {
    return { error: "Réclamation introuvable.", success: false };
  }

  const dateLimite = reclamation.date_limite_contestation
    ? new Date(reclamation.date_limite_contestation)
    : null;

  if (
    reclamation.statut !== "resolue" ||
    !dateLimite ||
    dateLimite.getTime() < Date.now()
  ) {
    return {
      error: "Cette réclamation ne peut plus être contestée.",
      success: false,
    };
  }

  const { error } = await admin
    .from("reclamations")
    .update({
      statut: "contestee",
      priorite: "P1",
      derniere_mise_a_jour: new Date().toISOString(),
    })
    .eq("id", reclamationId);

  if (error) {
    return { error: "Impossible d'enregistrer la contestation.", success: false };
  }

  await admin.from("activites_ticket").insert({
    reclamation_id: reclamationId,
    description:
      "Vous avez contesté cette résolution. Notre équipe reprend le dossier en priorité.",
  });

  const { data: entreprise } = await admin
    .from("entreprises")
    .select("email")
    .eq("id", chantier.entreprise_id)
    .single();

  if (entreprise) {
    await sendContestationAlert(
      entreprise.email,
      reclamation.numero_ticket,
      chantier.nom_client,
    ).catch(() => {});
  }

  revalidatePath(`/chantier/${token}`);
  return { error: null, success: true };
}

export async function contesterChantier(
  token: string,
): Promise<PublicActionState> {
  const chantier = await resolveChantier(token);
  if (!chantier) {
    return { error: "Chantier introuvable.", success: false };
  }

  const dateLimite = chantier.date_limite_contestation
    ? new Date(chantier.date_limite_contestation)
    : null;

  if (
    chantier.statut !== "termine" ||
    !dateLimite ||
    dateLimite.getTime() < Date.now()
  ) {
    return {
      error: "Ce chantier ne peut plus être contesté.",
      success: false,
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("chantiers")
    .update({ statut: "conteste" })
    .eq("id", chantier.id);

  if (error) {
    return { error: "Impossible d'enregistrer la contestation.", success: false };
  }

  const { data: entreprise } = await admin
    .from("entreprises")
    .select("email")
    .eq("id", chantier.entreprise_id)
    .single();

  if (entreprise) {
    await sendContestationChantierAlert(entreprise.email, chantier.nom_client).catch(
      () => {},
    );
  }

  revalidatePath(`/chantier/${token}`);
  return { error: null, success: true };
}

export async function sendMessageClient(
  token: string,
  _prevState: PublicActionState,
  formData: FormData,
): Promise<PublicActionState> {
  const contenu = String(formData.get("contenu") ?? "").trim();

  if (!contenu) {
    return { error: "Le message ne peut pas être vide.", success: false };
  }

  const chantier = await resolveChantier(token);
  if (!chantier) {
    return { error: "Chantier introuvable.", success: false };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("messages").insert({
    chantier_id: chantier.id,
    contenu,
    auteur: "client",
  });

  if (error) {
    return { error: "Impossible d'envoyer le message.", success: false };
  }

  const { data: entreprise } = await admin
    .from("entreprises")
    .select("email")
    .eq("id", chantier.entreprise_id)
    .single();

  if (entreprise) {
    await sendNouveauMessageEntreprise(entreprise.email, chantier.nom_client).catch(
      () => {},
    );
  }

  revalidatePath(`/chantier/${token}`);
  return { error: null, success: true };
}
