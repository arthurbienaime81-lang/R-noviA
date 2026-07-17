"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerifierRelancesButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [resultat, setResultat] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setResultat(null);
    try {
      const res = await fetch("/api/cron/relances", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResultat(data.error ?? "Erreur lors de la vérification.");
      } else {
        setResultat(
          `${data.relances} relance(s), ${data.archivees} archivage(s), ${data.avisEnvoyes} demande(s) d'avis envoyée(s).`,
        );
        router.refresh();
      }
    } catch {
      setResultat("Erreur lors de la vérification.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {pending ? "Vérification..." : "Vérifier les relances"}
      </button>
      {resultat && <span className="text-xs text-slate-500">{resultat}</span>}
    </div>
  );
}
