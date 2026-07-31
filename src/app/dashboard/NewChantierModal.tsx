"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { createChantier, type NewChantierState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: NewChantierState = { error: null, success: false };

export function NewChantierModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(createChantier, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-md bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Nouveau chantier
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Nouveau chantier
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

            <form ref={formRef} action={formAction} className="space-y-4">
              {state.error && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
                  {state.error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nom du client
                  </label>
                  <input
                    name="nom_client"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Email du client
                  </label>
                  <input
                    name="email_client"
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Téléphone du client
                  </label>
                  <input
                    name="tel_client"
                    type="tel"
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Adresse
                  </label>
                  <input
                    name="adresse"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Type de travaux
                  </label>
                  <input
                    name="type_travaux"
                    type="text"
                    placeholder="Ex. Rénovation salle de bain"
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
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Date de début
                  </label>
                  <input
                    name="date_debut"
                    type="date"
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
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  name="urgent"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                Marquer comme urgent
              </label>

              <p className="text-xs text-slate-500">
                Les 4 étapes par défaut (Démolition, Gros œuvre, Finitions,
                Livraison) seront créées automatiquement.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <SubmitButton pendingLabel="Création...">
                  Créer le chantier
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
