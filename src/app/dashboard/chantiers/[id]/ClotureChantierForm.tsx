"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { clorChantier, type ChantierActionState } from "./actions";
import { ProgressBar } from "@/components/ProgressBar";
import { formatDate } from "@/lib/format";
import type { Chantier } from "@/lib/types";

const initialState: ChantierActionState = { error: null, success: false };

function ClotureSubmitButton({ canSubmit }: { canSubmit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!canSubmit || pending}
      className="rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Clôture..." : "Clôturer le chantier"}
    </button>
  );
}

export function ClotureChantierForm({ chantier }: { chantier: Chantier }) {
  const action = clorChantier.bind(null, chantier.id);
  const [state, formAction] = useFormState(action, initialState);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [photoSelectionnee, setPhotoSelectionnee] = useState(false);

  useEffect(() => {
    if (state.success) setShowForm(false);
  }, [state.success]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Progression</p>
        <span className="text-sm font-semibold text-slate-900">
          {chantier.progression}%
        </span>
      </div>
      <ProgressBar progression={chantier.progression} size="lg" />
      <p className="mt-2 text-xs text-slate-500">
        Calculée automatiquement à partir des étapes marquées « Fait ».
      </p>

      {chantier.statut === "en_cours" && chantier.progression === 100 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Clôturer le chantier
            </button>
          ) : (
            <form action={formAction} className="space-y-3">
              {state.error && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-inset ring-red-200">
                  {state.error}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Description de fin de chantier
                </label>
                <textarea
                  name="description_cloture"
                  required
                  rows={3}
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Photo finale (obligatoire)
                </label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  required
                  onChange={(e) => setPhotoSelectionnee(!!e.target.files?.[0])}
                  className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <ClotureSubmitButton
                  canSubmit={Boolean(description.trim()) && photoSelectionnee}
                />
              </div>
            </form>
          )}
        </div>
      )}

      {(chantier.statut === "termine" || chantier.statut === "conteste") &&
        chantier.description_cloture && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500">
              Clôturé le {formatDate(chantier.date_cloture)}
              {chantier.statut === "conteste" && (
                <span className="ml-2 text-purple-600">— contesté par le client</span>
              )}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {chantier.description_cloture}
            </p>
            {chantier.photo_cloture_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={chantier.photo_cloture_url}
                alt="Photo de clôture"
                className="mt-2 h-24 w-24 rounded-md object-cover"
              />
            )}
          </div>
        )}
    </div>
  );
}
