import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Reclamation, Avis } from "@/lib/types";

export const metadata: Metadata = {
  title: "Rapports | RenovIA",
};

function estDansLeMois(dateIso: string, debutMois: Date) {
  return new Date(dateIso) >= debutMois;
}

export default async function RapportsPage() {
  const supabase = createClient();

  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  // RLS filtre déjà sur les chantiers/avis de l'entreprise connectée.
  const [{ data: reclamationsData }, { data: avisData }] = await Promise.all([
    supabase.from("reclamations").select("*").returns<Reclamation[]>(),
    supabase.from("avis").select("*").returns<Avis[]>(),
  ]);

  const reclamations = (reclamationsData ?? []).filter((r) =>
    estDansLeMois(r.created_at, debutMois),
  );
  const avis = (avisData ?? []).filter((a) => estDansLeMois(a.created_at, debutMois));

  const avisRepondus = avis.filter((a) => a.note !== null);
  const noteMoyenne =
    avisRepondus.length > 0
      ? avisRepondus.reduce((somme, a) => somme + (a.note ?? 0), 0) /
        avisRepondus.length
      : null;
  const tauxReponseAvis =
    avis.length > 0 ? (avisRepondus.length / avis.length) * 100 : null;

  const parPriorite = { P1: 0, P2: 0, P3: 0 };
  for (const r of reclamations) {
    parPriorite[r.priorite] = (parPriorite[r.priorite] ?? 0) + 1;
  }

  const terminaux = reclamations.filter((r) =>
    ["resolue", "contestee", "archive"].includes(r.statut),
  );
  const contestees = reclamations.filter((r) => r.statut === "contestee");
  const tauxContestation =
    terminaux.length > 0 ? (contestees.length / terminaux.length) * 100 : null;

  const resolues = reclamations.filter((r) => r.date_cloture);
  const delaiMoyenHeures =
    resolues.length > 0
      ? resolues.reduce((somme, r) => {
          const debut = new Date(r.created_at).getTime();
          const fin = new Date(r.date_cloture!).getTime();
          return somme + (fin - debut) / 3_600_000;
        }, 0) / resolues.length
      : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Rapports</h1>
      <p className="mt-1 text-sm text-slate-500">
        Statistiques du mois en cours.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Note moyenne des avis
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {noteMoyenne !== null ? `${noteMoyenne.toFixed(1)} / 5` : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {avisRepondus.length} avis reçu{avisRepondus.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Délai moyen de résolution
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {delaiMoyenHeures !== null
              ? `${delaiMoyenHeures.toFixed(1)} h`
              : "—"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Taux de contestation
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {tauxContestation !== null ? `${tauxContestation.toFixed(0)}%` : "—"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Taux de réponse aux demandes d&apos;avis
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {tauxReponseAvis !== null ? `${tauxReponseAvis.toFixed(0)}%` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
        <p className="mb-3 text-xs font-medium text-slate-500">
          Volume de tickets par priorité (ce mois-ci)
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-semibold text-red-600">
              {parPriorite.P1}
            </p>
            <p className="text-xs text-slate-500">P1 — Urgence</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-orange-600">
              {parPriorite.P2}
            </p>
            <p className="text-xs text-slate-500">P2 — Prioritaire</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-600">
              {parPriorite.P3}
            </p>
            <p className="text-xs text-slate-500">P3 — Question</p>
          </div>
        </div>
      </div>
    </div>
  );
}
