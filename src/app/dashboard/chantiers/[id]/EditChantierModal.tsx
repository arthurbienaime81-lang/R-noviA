"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { updateChantier, type ChantierActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import type { Chantier } from "@/lib/types";

const initialState: ChantierActionState = { error: null, success: false };

export function EditChantierModal({ chantier }: { chantier: Chantier }) {
  const [open, setOpen] = useState(false);
  const action = updateChantier.bind(null, chantier.id);
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Modifier
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Modifier le chantier
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              {state.error && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
                  {state.error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Statut
                </label>
                <select
                  name="statut"
                  defaultValue={
                    chantier.statut === "en_retard" ? "en_retard" : "en_cours"
                  }
                  disabled={chantier.statut === "termine" || chantier.statut === "conteste"}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="en_cours">En cours</option>
                  <option value="en_retard">En retard</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  « Terminé » et « Contesté » sont gérés automatiquement via la
                  clôture du chantier et la contestation client.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Date de début
                  </label>
                  <input
                    name="date_debut"
                    type="date"
                    defaultValue={chantier.date_debut ?? ""}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Date de fin prévue
                  </label>
                  <input
                    name="date_fin_prevue"
                    type="date"
                    defaultValue={chantier.date_fin_prevue ?? ""}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Type de travaux
                  </label>
                  <input
                    name="type_travaux"
                    type="text"
                    maxLength={100}
                    defaultValue={chantier.type_travaux ?? ""}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Montant (€)
                  </label>
                  <input
                    name="montant"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={chantier.montant ?? ""}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  name="urgent"
                  type="checkbox"
                  defaultChecked={chantier.urgent}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                Marquer comme urgent
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <SubmitButton pendingLabel="Enregistrement...">
                  Enregistrer
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
