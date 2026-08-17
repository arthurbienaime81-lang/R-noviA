import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { sendRetardAlert } from "@/lib/emails";
import type { Chantier } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { StatutBreakdown } from "@/components/StatutBreakdown";
import { AlertesIABanner } from "@/components/AlertesIABanner";
import { GOLD_BG_TEXT_CLASS } from "@/lib/styles";
import type { SupabaseClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Tableau de bord | Chantivia",
};

async function flagChantiersEnRetard(
  supabase: SupabaseClient,
  chantiers: Chantier[],
  emailEntreprise: string,
): Promise<Chantier[]> {
  const aujourdHui = new Date().toISOString().slice(0, 10);
  const enRetard = chantiers.filter(
    (c) =>
      c.date_fin_prevue &&
      c.date_fin_prevue < aujourdHui &&
      c.statut !== "termine" &&
      c.statut !== "en_retard" &&
      c.statut !== "conteste",
  );

  if (enRetard.length === 0) return chantiers;

  await Promise.all(
    enRetard.map((c) =>
      supabase.from("chantiers").update({ statut: "en_retard" }).eq("id", c.id),
    ),
  );

  await Promise.all(
    enRetard.map((c) =>
      sendRetardAlert(
        emailEntreprise,
        c.nom_client,
        formatDate(c.date_fin_prevue),
      ).catch(() => {}),
    ),
  );

  const enRetardIds = new Set(enRetard.map((c) => c.id));
  return chantiers.map((c) =>
    enRetardIds.has(c.id) ? { ...c, statut: "en_retard" as const } : c,
  );
}

function estDansLeMoisCourant(dateIso: string | null) {
  if (!dateIso) return false;
  const d = new Date(dateIso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: entreprise } = await supabase
    .from("entreprises")
    .select("id, email")
    .eq("user_id", user.id)
    .single();

  if (!entreprise) {
    return (
      <div className="p-6">
        <p className={`text-sm ${GOLD_BG_TEXT_CLASS}`}>
          Impossible de charger les informations de votre entreprise.
        </p>
      </div>
    );
  }

  const { data: chantiersData } = await supabase
    .from("chantiers")
    .select("*")
    .eq("entreprise_id", entreprise.id)
    .order("created_at", { ascending: false });

  const chantiers = await flagChantiersEnRetard(
    supabase,
    (chantiersData ?? []) as Chantier[],
    entreprise.email,
  );

  const chantierIds = chantiers.map((c) => c.id);
  const { data: ticketsUrgents } =
    chantierIds.length > 0
      ? await supabase
          .from("reclamations")
          .select("id, numero_ticket, sujet, chantier_id")
          .eq("priorite", "P1")
          .in("statut", ["ouverte", "en_cours"])
          .in("chantier_id", chantierIds)
      : { data: [] };

  // ━━━ Stats 2x2 ━━━
  const chantiersOuverts = chantiers.filter((c) => c.statut !== "termine").length;
  const enRetard = chantiers.filter((c) => c.statut === "en_retard").length;
  const livresCeMois = chantiers.filter(
    (c) => c.statut === "termine" && estDansLeMoisCourant(c.date_cloture),
  ).length;
  const receptionsPretes = chantiers.filter(
    (c) => c.statut === "en_cours" && c.progression === 100,
  ).length;

  // ━━━ Répartition par statut ━━━
  const repartition = [
    { label: "En cours", count: chantiers.filter((c) => c.statut === "en_cours").length },
    { label: "En retard", count: enRetard },
    { label: "Contesté", count: chantiers.filter((c) => c.statut === "conteste").length },
    { label: "Terminé", count: chantiers.filter((c) => c.statut === "termine").length },
  ];

  // ━━━ Alertes IA : tickets P1 urgents + chantiers en retard ━━━
  const alertes = [
    ...(ticketsUrgents ?? []).map(
      (t) => `Ticket ${t.numero_ticket} — ${t.sujet} (intervention sous 4h)`,
    ),
    ...chantiers
      .filter((c) => c.statut === "en_retard")
      .map((c) => `Chantier de ${c.nom_client} en retard (fin prévue le ${formatDate(c.date_fin_prevue)})`),
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord</h1>
        <p className={`mt-1 text-sm ${GOLD_BG_TEXT_CLASS}`}>
          Vue d&apos;ensemble de l&apos;activité de votre entreprise.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <StatCard label="Chantiers ouverts" value={chantiersOuverts} dot="blue" />
        <StatCard label="En retard" value={enRetard} dot="red" />
        <StatCard
          label="Livrés ce mois"
          value={livresCeMois}
          subtext="Clôturés ce mois-ci"
          dot="green"
        />
        <StatCard
          label="Réceptions prêtes"
          value={receptionsPretes}
          subtext="Progression à 100 %, en attente de clôture"
          dot="orange"
        />
      </div>

      <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Répartition par statut
        </h2>
        <StatutBreakdown items={repartition} />
      </div>

      <AlertesIABanner items={alertes} />
    </div>
  );
}
