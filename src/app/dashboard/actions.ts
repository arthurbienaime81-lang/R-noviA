"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/utils";
import { sendBienvenueChantier } from "@/lib/emails";
import { ETAPES_PAR_DEFAUT } from "@/lib/types";

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type NewChantierState = { error: string | null; success: boolean };

export async function createChantier(
  _prevState: NewChantierState,
  formData: FormData,
): Promise<NewChantierState> {
  const nom_client = String(formData.get("nom_client") ?? "").trim();
  const email_client = String(formData.get("email_client") ?? "").trim();
  const tel_client = String(formData.get("tel_client") ?? "").trim();
  const adresse = String(formData.get("adresse") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const date_debut = String(formData.get("date_debut") ?? "") || null;
  const date_fin_prevue = String(formData.get("date_fin_prevue") ?? "") || null;

  if (!nom_client || !email_client || !adresse) {
    return {
      error:
        "Merci de renseigner au minimum le nom du client, son email et l'adresse.",
      success: false,
    };
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
    .select("id, nom")
    .eq("user_id", user.id)
    .single();

  if (!entreprise) {
    return { error: "Impossible de retrouver votre entreprise.", success: false };
  }

  const { data: chantier, error: insertError } = await supabase
    .from("chantiers")
    .insert({
      entreprise_id: entreprise.id,
      nom_client,
      email_client,
      tel_client: tel_client || null,
      adresse,
      description: description || null,
      date_debut,
      date_fin_prevue,
    })
    .select("id, lien_token")
    .single();

  if (insertError || !chantier) {
    return { error: "Impossible de créer le chantier.", success: false };
  }

  const { error: etapesError } = await supabase.from("etapes").insert(
    ETAPES_PAR_DEFAUT.map((nom, index) => ({
      chantier_id: chantier.id,
      nom,
      ordre: index,
    })),
  );

  if (etapesError) {
    return {
      error: "Chantier créé mais impossible de créer les étapes par défaut.",
      success: false,
    };
  }

  const lienSuivi = `${getOrigin()}/chantier/${chantier.lien_token}`;
  await sendBienvenueChantier(email_client, entreprise.nom, nom_client, lienSuivi).catch(
    () => {},
  );

  revalidatePath("/dashboard");
  return { error: null, success: true };
}
