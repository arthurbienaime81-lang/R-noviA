import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getChantierById, type Etape } from "@/lib/chantiers";
import { ReclamationForm } from "@/components/ReclamationForm";

export const metadata: Metadata = {
  title: "Suivi de chantier | RenovIA",
};

const etapeStyles: Record<Etape["statut"], string> = {
  terminee: "bg-green-600 border-green-600 text-white",
  en_cours: "bg-blue-600 border-blue-600 text-white",
  a_venir: "bg-white border-slate-300 text-slate-400",
};

function EtapeLabel({ statut }: { statut: Etape["statut"] }) {
  if (statut === "terminee") return <span className="text-green-700">Terminé</span>;
  if (statut === "en_cours") return <span className="text-blue-700">En cours</span>;
  return <span className="text-slate-400">À venir</span>;
}

export default function ChantierPage({
  params,
}: {
  params: { id: string };
}) {
  const chantier = getChantierById(params.id);

  if (!chantier) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-8">
          <p className="text-sm font-medium text-slate-500">RenovIA</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {chantier.nom}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {chantier.client} — {chantier.adresse}
          </p>
        </header>

        <section className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Avancement du chantier
            </h2>
            <span className="text-sm font-medium text-slate-700">
              {chantier.progression}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${chantier.progression}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Date de fin prévue : {chantier.dateFinPrevue}
          </p>

          <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {chantier.etapes.map((etape, index) => (
              <li key={etape.nom} className="flex sm:flex-col sm:items-center">
                <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${etapeStyles[etape.statut]}`}
                  >
                    {index + 1}
                  </span>
                  <div className="sm:text-center">
                    <p className="text-sm font-medium text-slate-900">
                      {etape.nom}
                    </p>
                    <p className="text-xs">
                      <EtapeLabel statut={etape.statut} />
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <ReclamationForm chantierNom={chantier.nom} />
      </div>
    </main>
  );
}
