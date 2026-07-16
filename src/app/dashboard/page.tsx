import Link from "next/link";
import type { Metadata } from "next";
import { chantiers, type StatutChantier } from "@/lib/chantiers";

export const metadata: Metadata = {
  title: "Tableau de bord | RenovIA",
};

const statutStyles: Record<StatutChantier, string> = {
  "En cours": "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  Terminé: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  "En retard": "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
};

function StatutBadge({ statut }: { statut: StatutChantier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statutStyles[statut]}`}
    >
      {statut}
    </span>
  );
}

export default function DashboardPage() {
  const total = chantiers.length;
  const enCours = chantiers.filter((c) => c.statut === "En cours").length;
  const enRetard = chantiers.filter((c) => c.statut === "En retard").length;
  const termines = chantiers.filter((c) => c.statut === "Terminé").length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <p className="text-sm font-medium text-slate-500">RenovIA</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Tableau de bord des chantiers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vue d&apos;ensemble de l&apos;activité de votre entreprise TCE.
          </p>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">
              Chantiers actifs
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {total}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">En cours</p>
            <p className="mt-1 text-2xl font-semibold text-blue-700">
              {enCours}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">En retard</p>
            <p className="mt-1 text-2xl font-semibold text-red-700">
              {enRetard}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-500">Terminés</p>
            <p className="mt-1 text-2xl font-semibold text-green-700">
              {termines}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Chantier
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fin prévue
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Suivi client
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {chantiers.map((chantier) => (
                <tr key={chantier.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {chantier.nom}
                    </p>
                    <p className="text-xs text-slate-500">
                      {chantier.adresse}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {chantier.client}
                  </td>
                  <td className="px-6 py-4">
                    <StatutBadge statut={chantier.statut} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {chantier.dateFinPrevue}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/chantier/${chantier.id}`}
                      className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
                    >
                      Voir le lien client
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
