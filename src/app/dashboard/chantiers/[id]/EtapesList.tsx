"use client";

import { useTransition } from "react";
import { toggleEtape } from "./actions";
import type { Etape } from "@/lib/types";

export function EtapesList({
  chantierId,
  etapes,
}: {
  chantierId: string;
  etapes: Etape[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <ul className="divide-y divide-slate-200">
      {etapes.map((etape) => {
        const fait = etape.statut === "fait";
        return (
          <li key={etape.id} className="flex items-center justify-between py-3">
            <span
              className={`text-sm ${fait ? "text-slate-400 line-through" : "text-slate-900"}`}
            >
              {etape.nom}
            </span>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(() =>
                  toggleEtape(chantierId, etape.id, etape.statut),
                )
              }
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                fait
                  ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200"
                  : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200"
              }`}
            >
              {fait ? "Fait" : "À faire"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
