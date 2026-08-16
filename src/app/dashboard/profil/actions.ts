"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validatePhotoFile, extensionFromMimeType } from "@/lib/uploads";
import { erreurLongueur } from "@/lib/validation";

export type ProfilActionState = { error: string | null; success: boolean };

export async function updateProfil(
  _prevState: ProfilActionState,
  formData: FormData,
): Promise<ProfilActionState> {
  const nom = String(formData.get("nom") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const tel = String(formData.get("tel") ?? "").trim();
  const google_maps_url = String(formData.get("google_maps_url") ?? "").trim();

  if (!nom || !email) {
    return { error: "Le nom et l'email sont obligatoires.", success: false };
  }
  for (const [valeur, max, label] of [
    [nom, 100, "Le nom de la société"],
    [email, 254, "L'email"],
    [tel, 20, "Le téléphone"],
    [google_maps_url, 500, "Le lien Google Maps"],
  ] as const) {
    const erreur = erreurLongueur(valeur, max, label);
    if (erreur) return { error: erreur, success: false };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Session expirée, reconnectez-vous.", success: false };
  }

  const { error } = await supabase
    .from("entreprises")
    .update({ nom, email, tel: tel || null, google_maps_url: google_maps_url || null })
    .eq("user_id", user.id);

  if (error) {
    return { error: "Impossible de mettre à jour le profil.", success: false };
  }

  revalidatePath("/dashboard/profil");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function uploadLogo(
  _prevState: ProfilActionState,
  formData: FormData,
): Promise<ProfilActionState> {
  const file = formData.get("logo") as File | null;

  if (!file || file.size === 0) {
    return { error: "Merci de sélectionner une image.", success: false };
  }
  const fileError = validatePhotoFile(file);
  if (fileError) {
    return { error: fileError, success: false };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Session expirée, reconnectez-vous.", success: false };
  }

  const { data: entreprise } = await supabase
    .from("entreprises")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!entreprise) {
    return { error: "Impossible de retrouver votre entreprise.", success: false };
  }

  const ext = extensionFromMimeType(file.type);
  const path = `${entreprise.id}/logo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return { error: "Impossible d'envoyer le logo.", success: false };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("logos").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("entreprises")
    .update({ logo_url: `${publicUrl}?t=${Date.now()}` })
    .eq("id", entreprise.id);

  if (updateError) {
    return { error: "Logo envoyé mais impossible de l'enregistrer.", success: false };
  }

  revalidatePath("/dashboard/profil");
  return { error: null, success: true };
}

export type PasswordActionState = { error: string | null; success: boolean };

export async function changePassword(
  _prevState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!currentPassword || !newPassword) {
    return { error: "Merci de renseigner tous les champs.", success: false };
  }
  if (newPassword.length < 8) {
    return {
      error: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
      success: false,
    };
  }
  if (newPassword !== confirmation) {
    return { error: "Les mots de passe ne correspondent pas.", success: false };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Session expirée, reconnectez-vous.", success: false };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return { error: "Mot de passe actuel incorrect.", success: false };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: "Impossible de mettre à jour le mot de passe.", success: false };
  }

  return { error: null, success: true };
}
