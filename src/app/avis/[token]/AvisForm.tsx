"use client";

import { useFormState } from "react-dom";
import { submitAvis, type AvisActionState } from "./actions";
import { StarRating } from "./StarRating";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: AvisActionState = { error: null, success: false, note: null };

export function AvisForm({
  token,
  nomEntreprise,
  googleMapsUrl,
}: {
  token: string;
  nomEntreprise: string;
  googleMapsUrl: string | null;
}) {
  const action = submitAvis.bind(null, token);
  const [state, formAction] = useFormState(action, initialState);

  if (state.success && state.note !== null) {
    if (state.note >= 4) {
      const lienGoogle =
        googleMapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nomEntreprise)}`;
      return (
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-700">
            Merci beaucoup pour votre avis ! Ça compte énormément pour nous.
          </p>
          <a
            href={lienGoogle}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Laisser un avis sur Google Maps
          </a>
        </div>
      );
    }

    return (
      <p className="text-center text-sm text-slate-700">
        Merci pour votre retour. Nous en tenons compte pour nous améliorer.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {state.error}
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-slate-700">
          Comment évaluez-vous votre expérience avec {nomEntreprise} ?
        </p>
        <StarRating name="note" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Un commentaire (facultatif)
        </label>
        <textarea
          name="commentaire"
          rows={4}
          placeholder="Votre avis nous aide à nous améliorer"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <SubmitButton className="w-full py-3" pendingLabel="Envoi...">
        Envoyer mon avis
      </SubmitButton>
    </form>
  );
}
