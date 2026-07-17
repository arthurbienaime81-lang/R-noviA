import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  sendRelanceNiveau1,
  sendRelanceNiveau2,
  sendRelanceNiveau3Entreprise,
  sendRelanceNiveau3Client,
  sendDemandeAvis,
} from "@/lib/emails";

export const dynamic = "force-dynamic";

async function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = request.headers.get("authorization");
    if (header === `Bearer ${cronSecret}`) return true;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

interface ReclamationRow {
  id: string;
  chantier_id: string;
  numero_ticket: string;
  priorite: string;
  niveau_relance: number;
  derniere_mise_a_jour: string;
  statut: string;
  date_limite_contestation: string | null;
}

async function logActivite(
  admin: ReturnType<typeof createAdminClient>,
  reclamationId: string,
  description: string,
) {
  await admin
    .from("activites_ticket")
    .insert({ reclamation_id: reclamationId, description });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  let relances = 0;
  let archivees = 0;
  let avisEnvoyes = 0;

  // ━━━ Relances niveau 1/2/3 sur les tickets ouverts ━━━
  const { data: ouverts } = await admin
    .from("reclamations")
    .select(
      "id, chantier_id, numero_ticket, priorite, niveau_relance, derniere_mise_a_jour, statut, date_limite_contestation",
    )
    .in("statut", ["ouverte", "en_cours"])
    .returns<ReclamationRow[]>();

  for (const reclamation of ouverts ?? []) {
    const heures =
      (now - new Date(reclamation.derniere_mise_a_jour).getTime()) / 3_600_000;

    let niveauCible = reclamation.niveau_relance;
    if (reclamation.niveau_relance < 1 && heures >= 24) niveauCible = 1;
    if (reclamation.niveau_relance < 2 && heures >= 48) niveauCible = 2;
    if (reclamation.niveau_relance < 3 && heures >= 72) niveauCible = 3;

    if (niveauCible === reclamation.niveau_relance) continue;

    const { data: chantier } = await admin
      .from("chantiers")
      .select("nom_client, email_client, entreprises(nom, email)")
      .eq("id", reclamation.chantier_id)
      .single();

    const entreprise = (
      chantier as unknown as {
        entreprises: { nom: string; email: string } | null;
      } | null
    )?.entreprises;

    if (!chantier || !entreprise) continue;

    if (niveauCible >= 1 && reclamation.niveau_relance < 1) {
      await sendRelanceNiveau1(
        entreprise.email,
        reclamation.numero_ticket,
        chantier.nom_client,
      ).catch(() => {});
      await logActivite(
        admin,
        reclamation.id,
        "Votre demande est toujours en cours de traitement.",
      );
    }
    if (niveauCible >= 2 && reclamation.niveau_relance < 2) {
      await sendRelanceNiveau2(
        entreprise.email,
        reclamation.numero_ticket,
        chantier.nom_client,
      ).catch(() => {});
      await logActivite(
        admin,
        reclamation.id,
        "Notre équipe accélère le traitement de votre demande.",
      );
    }
    if (niveauCible >= 3 && reclamation.niveau_relance < 3) {
      await Promise.all([
        sendRelanceNiveau3Entreprise(
          entreprise.email,
          reclamation.numero_ticket,
          chantier.nom_client,
        ).catch(() => {}),
        sendRelanceNiveau3Client(
          chantier.email_client,
          entreprise.nom,
          reclamation.numero_ticket,
        ).catch(() => {}),
      ]);
      await logActivite(
        admin,
        reclamation.id,
        "Votre demande est traitée en priorité.",
      );
    }

    await admin
      .from("reclamations")
      .update({ niveau_relance: niveauCible })
      .eq("id", reclamation.id);

    relances += 1;
  }

  // ━━━ Archivage automatique 72h après clôture sans contestation ━━━
  const { data: resolues } = await admin
    .from("reclamations")
    .select("id, chantier_id, date_limite_contestation")
    .eq("statut", "resolue")
    .not("date_limite_contestation", "is", null)
    .returns<Pick<ReclamationRow, "id" | "chantier_id" | "date_limite_contestation">[]>();

  for (const reclamation of resolues ?? []) {
    if (
      !reclamation.date_limite_contestation ||
      new Date(reclamation.date_limite_contestation).getTime() > now
    ) {
      continue;
    }

    await admin
      .from("reclamations")
      .update({ statut: "archive" })
      .eq("id", reclamation.id);
    await logActivite(
      admin,
      reclamation.id,
      "Cette réclamation est classée sans suite (aucune contestation reçue).",
    );
    archivees += 1;
  }

  // ━━━ Demande d'avis 24h après archivage (une seule fois par chantier) ━━━
  const { data: archivesEligibles } = await admin
    .from("reclamations")
    .select("id, chantier_id, date_limite_contestation")
    .eq("statut", "archive")
    .not("date_limite_contestation", "is", null)
    .returns<Pick<ReclamationRow, "id" | "chantier_id" | "date_limite_contestation">[]>();

  for (const reclamation of archivesEligibles ?? []) {
    const archiveDepuisHeures =
      (now - new Date(reclamation.date_limite_contestation!).getTime()) / 3_600_000;
    if (archiveDepuisHeures < 24) continue;

    const { count } = await admin
      .from("avis")
      .select("id", { count: "exact", head: true })
      .eq("chantier_id", reclamation.chantier_id);

    if (count && count > 0) continue;

    const { data: chantier } = await admin
      .from("chantiers")
      .select("email_client, entreprise_id, entreprises(nom)")
      .eq("id", reclamation.chantier_id)
      .single();

    const entreprise = (
      chantier as unknown as { entreprises: { nom: string } | null } | null
    )?.entreprises;

    if (!chantier || !entreprise) continue;

    const { data: avis } = await admin
      .from("avis")
      .insert({
        chantier_id: reclamation.chantier_id,
        entreprise_id: chantier.entreprise_id,
      })
      .select("token")
      .single();

    if (!avis) continue;

    const lienAvis = `${request.nextUrl.origin}/avis/${avis.token}`;
    await sendDemandeAvis(chantier.email_client, entreprise.nom, lienAvis).catch(
      () => {},
    );
    avisEnvoyes += 1;
  }

  return NextResponse.json({ relances, archivees, avisEnvoyes });
}
