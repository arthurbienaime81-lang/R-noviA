"use client";

import { useState, useTransition } from "react";
import { contesterChantier } from "./actions";
import { formatDate } from "@/lib/format";
import type { StatutChantier } from "@/lib/types";

function ContesterButton({ token }: { token: string }) {
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
        Contester cette clôture
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-slate-600">
        Confirmez-vous vouloir contester la clôture de ce chantier ? Notre
        équipe reprendra votre dossier en priorité.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await contesterChantier(token);
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

export function ClotureChantierInfo({
  token,
  statut,
  descriptionCloture,
  photoClotureUrl,
  dateCloture,
  dateLimiteContestation,
}: {
  token: string;
  statut: StatutChantier;
  descriptionCloture: string | null;
  photoClotureUrl: string | null;
  dateCloture: string | null;
  dateLimiteContestation: string | null;
}) {
  if (statut !== "termine" && statut !== "conteste") return null;
  if (!descriptionCloture) return null;

  const peutContester =
    statut === "termine" &&
    dateLimiteContestation &&
    new Date(dateLimiteContestation).getTime() > Date.now();

  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">
        Chantier terminé le {formatDate(dateCloture)}
      </h2>
      <p className="text-sm text-slate-700">{descriptionCloture}</p>
      {photoClotureUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoClotureUrl}
          alt="Photo finale du chantier"
          className="mt-3 aspect-square w-full max-w-[200px] rounded-lg object-cover"
        />
      )}

      {statut === "conteste" ? (
        <p className="mt-3 text-xs font-medium text-purple-600">
          Vous avez contesté cette clôture. Notre équipe reprend le dossier.
        </p>
      ) : (
        peutContester && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <ContesterButton token={token} />
          </div>
        )
      )}
    </section>
  );
}
