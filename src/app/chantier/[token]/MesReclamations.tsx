"use client";

import { useState, useTransition } from "react";
import { contesterReclamation } from "./actions";
import { PRIORITE_STYLES, PRIORITE_LABELS } from "@/lib/priorites";
import { StatutReclamationBadge } from "@/components/StatutReclamationBadge";
import type { ReclamationPublique, ActiviteTicket } from "@/lib/types";

export type ReclamationClient = ReclamationPublique & { activites: ActiviteTicket[] };

function ContesterButton({
  token,
  reclamationId,
}: {
  token: string;
  reclamationId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState(false);

  if (!confirmation) {
    return (
      <button
        type="button"
        onClick={() => setConfirmation(true)}
        className="text-xs font-medium text-red-600 hover:underline"
      >
        Contester cette résolution
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-slate-600">
        Confirmez-vous vouloir contester cette résolution ? Notre équipe
        reprendra votre dossier en priorité.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await contesterReclamation(token, reclamationId);
              if (result.error) setError(result.error);
            })
          }
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? "Envoi..." : "Confirmer la contestation"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmation(false)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export function MesReclamations({
  token,
  reclamations,
}: {
  token: string;
  reclamations: ReclamationClient[];
}) {
  if (reclamations.length === 0) return null;

  return (
    <ul className="space-y-4">
      {reclamations.map((reclamation) => {
        const peutContester =
          reclamation.statut === "resolue" &&
          reclamation.date_limite_contestation &&
          new Date(reclamation.date_limite_contestation).getTime() > Date.now();

        return (
          <li
            key={reclamation.id}
            className="rounded-lg border border-slate-200 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-slate-400">
                {reclamation.numero_ticket}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITE_STYLES[reclamation.priorite]}`}
              >
                {PRIORITE_LABELS[reclamation.priorite]}
              </span>
              <StatutReclamationBadge statut={reclamation.statut} />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {reclamation.sujet}
            </p>

            {reclamation.activites.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                {reclamation.activites.map((activite) => (
                  <li key={activite.id} className="text-xs text-slate-500">
                    {activite.description}
                  </li>
                ))}
              </ul>
            )}

            {peutContester && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <ContesterButton token={token} reclamationId={reclamation.id} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
