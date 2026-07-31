"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { StatutBadge } from "@/components/StatutBadge";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import type { Chantier, StatutChantier } from "@/lib/types";

const STATUTS: { value: StatutChantier | "tous"; label: string }[] = [
  { value: "tous", label: "Tous les statuts" },
  { value: "en_cours", label: "En cours" },
  { value: "en_retard", label: "En retard" },
  { value: "conteste", label: "Contesté" },
  { value: "termine", label: "Terminé" },
];

export function ChantiersList({
  chantiers,
  origin,
  messageCounts,
}: {
  chantiers: Chantier[];
  origin: string;
  messageCounts: Record<string, number>;
}) {
  const [recherche, setRecherche] = useState("");
  const [statutFiltre, setStatutFiltre] = useState<string>("tous");
  const [urgenceFiltre, setUrgenceFiltre] = useState<string>("toutes");

  const rechercheNormalisee = recherche.trim().toLowerCase();
  const filtres = chantiers.filter((c) => {
    const matchRecherche =
      !rechercheNormalisee ||
      c.nom_client.toLowerCase().includes(rechercheNormalisee) ||
      c.adresse.toLowerCase().includes(rechercheNormalisee) ||
      c.numero_dossier.toLowerCase().includes(rechercheNormalisee) ||
      (c.type_travaux ?? "").toLowerCase().includes(rechercheNormalisee);
    const matchStatut = statutFiltre === "tous" || c.statut === statutFiltre;
    const matchUrgence =
      urgenceFiltre === "toutes" ||
      (urgenceFiltre === "urgent" && c.urgent) ||
      (urgenceFiltre === "normal" && !c.urgent);
    return matchRecherche && matchStatut && matchUrgence;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher par client, adresse, dossier..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={statutFiltre}
          onChange={(e) => setStatutFiltre(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {STATUTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={urgenceFiltre}
          onChange={(e) => setUrgenceFiltre(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="toutes">Toutes urgences</option>
          <option value="urgent">Urgent</option>
          <option value="normal">Normal</option>
        </select>
      </div>

      {filtres.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            {chantiers.length === 0
              ? "Aucun chantier pour le moment. Créez votre premier chantier pour commencer."
              : "Aucun chantier ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtres.map((chantier) => (
            <div
              key={chantier.id}
              className="relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              {(messageCounts[chantier.id] ?? 0) > 0 && (
                <span
                  className="absolute -left-2 -top-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-300 px-1.5 text-[10px] font-medium leading-none text-slate-700"
                  title={`${messageCounts[chantier.id]} message(s)`}
                >
                  {messageCounts[chantier.id]}
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs text-slate-500">
                  {chantier.numero_dossier}
                </span>
                <StatutBadge statut={chantier.statut} />
              </div>
              <Link
                href={`/dashboard/chantiers/${chantier.id}`}
                className="mt-2 block hover:underline"
              >
                <h3 className="text-base font-semibold text-slate-900">
                  {chantier.type_travaux ? `${chantier.type_travaux} · ` : ""}
                  {chantier.nom_client}
                </h3>
              </Link>
              <p className="mt-1 text-sm text-slate-500">{chantier.adresse}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Échéance : {formatDate(chantier.date_fin_prevue)}</span>
                  {chantier.urgent && (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                      Urgent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CopyLinkButton link={`${origin}/chantier/${chantier.lien_token}`} />
                  <Link
                    href={`/dashboard/chantiers/${chantier.id}`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Gérer
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
