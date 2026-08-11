"use client";

import { useFormState } from "react-dom";
import { updateProfil, type ProfilActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { DARK_GOLD_BUTTON_CLASSES } from "@/lib/styles";
import type { Entreprise } from "@/lib/types";

const initialState: ProfilActionState = { error: null, success: false };

export function ProfilForm({ entreprise }: { entreprise: Entreprise }) {
  const [state, formAction] = useFormState(updateProfil, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-inset ring-green-200">
          Profil mis à jour.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Nom de la société
        </label>
        <input
          name="nom"
          type="text"
          required
          defaultValue={entreprise.nom}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          required
          defaultValue={entreprise.email}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Téléphone
        </label>
        <input
          name="tel"
          type="tel"
          defaultValue={entreprise.tel ?? ""}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Lien Google Maps de votre entreprise
        </label>
        <input
          name="google_maps_url"
          type="url"
          placeholder="https://maps.app.goo.gl/..."
          defaultValue={entreprise.google_maps_url ?? ""}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-slate-500">
          Utilisé pour rediriger vos clients vers votre fiche Google Maps
          lorsqu&apos;ils laissent un avis de 4 étoiles ou plus.
        </p>
      </div>

      <SubmitButton className={DARK_GOLD_BUTTON_CLASSES} pendingLabel="Enregistrement...">
        Enregistrer
      </SubmitButton>
    </form>
  );
}
