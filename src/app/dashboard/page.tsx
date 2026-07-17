import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { sendRetardAlert } from "@/lib/emails";
import type { Chantier } from "@/lib/types";
import { StatutBadge } from "@/components/StatutBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { VerifierRelancesButton } from "@/components/VerifierRelancesButton";
import { NewChantierModal } from "./NewChantierModal";
import type { SupabaseClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Tableau de bord | RenovIA",
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
      c.statut !== "en_retard",
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

export default async function DashboardPage() {
  const supabase = createClient();
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
        <p className="text-sm text-slate-500">
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

  const origin = getOrigin();
  const total = chantiers.length;
  const enCours = chantiers.filter((c) => c.statut === "en_cours").length;
  const enRetard = chantiers.filter((c) => c.statut === "en_retard").length;
  const termines = chantiers.filter((c) => c.statut === "termine").length;

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

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {ticketsUrgents && ticketsUrgents.length > 0 && (
        <div className="mb-6 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white">
          URGENT — Intervention requise sous 4h ({ticketsUrgents.length} ticket
          {ticketsUrgents.length > 1 ? "s" : ""} P1 en attente)
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Chantiers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Vue d&apos;ensemble de l&apos;activité de votre entreprise.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <VerifierRelancesButton />
          <NewChantierModal />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">En cours</p>
          <p className="mt-1 text-2xl font-semibold text-orange-600">
            {enCours}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">En retard</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            {enRetard}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Terminés</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {termines}
          </p>
        </div>
      </div>

      {chantiers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Aucun chantier pour le moment. Créez votre premier chantier pour
            commencer.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Progression
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fin prévue
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {chantiers.map((chantier) => (
                <tr key={chantier.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/chantiers/${chantier.id}`}
                      className="text-sm font-medium text-slate-900 hover:underline"
                    >
                      {chantier.nom_client}
                    </Link>
                    <p className="text-xs text-slate-500">{chantier.adresse}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatutBadge statut={chantier.statut} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <ProgressBar progression={chantier.progression} size="sm" />
                      </div>
                      <span className="text-xs text-slate-500">
                        {chantier.progression}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {formatDate(chantier.date_fin_prevue)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <CopyLinkButton
                        link={`${origin}/chantier/${chantier.lien_token}`}
                      />
                      <Link
                        href={`/dashboard/chantiers/${chantier.id}`}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Gérer
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
