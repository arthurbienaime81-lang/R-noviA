"use client";

import { useMemo, useState } from "react";
import type { Chantier } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { VolumeChart } from "@/components/VolumeChart";

type Periode = "mois" | "trimestre" | "annee";

const ONGLETS: { value: Periode; label: string }[] = [
  { value: "mois", label: "Ce mois" },
  { value: "trimestre", label: "Trimestre" },
  { value: "annee", label: "Année" },
];

const formateurEuro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function debutPeriode(periode: Periode): Date {
  const maintenant = new Date();
  if (periode === "mois") {
    return new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  }
  if (periode === "trimestre") {
    const moisTrimestre = Math.floor(maintenant.getMonth() / 3) * 3;
    return new Date(maintenant.getFullYear(), moisTrimestre, 1);
  }
  return new Date(maintenant.getFullYear(), 0, 1);
}

export function RapportsClient({ chantiers }: { chantiers: Chantier[] }) {
  const [periode, setPeriode] = useState<Periode>("mois");

  const stats = useMemo(() => {
    const debut = debutPeriode(periode);
    const termines = chantiers.filter(
      (c) => c.statut === "termine" && c.date_cloture && new Date(c.date_cloture) >= debut,
    );

    const chantiersLivres = termines.length;

    const avecDelai = termines.filter((c) => c.date_debut && c.date_cloture);
    const delaiMoyenJours =
      avecDelai.length > 0
        ? avecDelai.reduce((somme, c) => {
            const debutMs = new Date(c.date_debut!).getTime();
            const finMs = new Date(c.date_cloture!).getTime();
            return somme + (finMs - debutMs) / 86_400_000;
          }, 0) / avecDelai.length
        : null;

    const caGenere = termines.reduce((somme, c) => somme + (c.montant ?? 0), 0);

    const livresEnRetard = termines.filter(
      (c) => c.date_fin_prevue && c.date_cloture && c.date_cloture > c.date_fin_prevue,
    ).length;
    const tauxRetard = chantiersLivres > 0 ? (livresEnRetard / chantiersLivres) * 100 : null;

    return { chantiersLivres, delaiMoyenJours, caGenere, tauxRetard };
  }, [chantiers, periode]);

  const volumeMensuel = useMemo(() => {
    const maintenant = new Date();
    const points: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const debutMs = d.getTime();
      const finMs = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      const count = chantiers.filter((c) => {
        if (c.statut !== "termine" || !c.date_cloture) return false;
        const t = new Date(c.date_cloture).getTime();
        return t >= debutMs && t < finMs;
      }).length;
      points.push({
        label: d.toLocaleDateString("fr-FR", { month: "short" }),
        value: count,
      });
    }
    return points;
  }, [chantiers]);

  return (
    <div className="mt-6">
      <div className="inline-flex rounded-full bg-slate-100 p-1">
        {ONGLETS.map((onglet) => (
          <button
            key={onglet.value}
            type="button"
            onClick={() => setPeriode(onglet.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              periode === onglet.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {onglet.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <StatCard label="Chantiers livrés" value={stats.chantiersLivres} dot="green" />
        <StatCard
          label="Délai moyen"
          value={
            stats.delaiMoyenJours !== null ? `${stats.delaiMoyenJours.toFixed(1)} j` : "—"
          }
          dot="blue"
        />
        <StatCard label="CA généré" value={formateurEuro.format(stats.caGenere)} dot="orange" />
        <StatCard
          label="Taux de retard"
          value={stats.tauxRetard !== null ? `${stats.tauxRetard.toFixed(0)}%` : "—"}
          dot="red"
        />
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Volume mensuel</h2>
        <VolumeChart data={volumeMensuel} />
      </div>
    </div>
  );
}
