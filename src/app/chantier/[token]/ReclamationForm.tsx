"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { submitReclamation, type PublicActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { CATEGORIES_RECLAMATION, CANAUX_RECLAMATION } from "@/lib/priorites";
import {
  MAX_PHOTOS_RECLAMATION,
  MAX_PHOTO_SIZE_BYTES,
  ALLOWED_PHOTO_TYPES,
} from "@/lib/uploads";

const initialState: PublicActionState = { error: null, success: false };
const MAX_PHOTOS = MAX_PHOTOS_RECLAMATION;

export function ReclamationForm({ token }: { token: string }) {
  const action = submitReclamation.bind(null, token);
  const [state, formAction] = useFormState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    const messages: string[] = [];

    let valides = files.filter((file) => {
      if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
        messages.push(`« ${file.name} » n'est pas une image valide (JPG, PNG ou WEBP).`);
        return false;
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        messages.push(`« ${file.name} » dépasse la taille maximale de 5 Mo.`);
        return false;
      }
      return true;
    });

    if (valides.length > MAX_PHOTOS) {
      messages.push(`Seules les ${MAX_PHOTOS} premières photos valides ont été conservées.`);
      valides = valides.slice(0, MAX_PHOTOS);
    }

    // On ne peut pas juste avertir : on réassigne réellement la sélection de
    // l'input aux fichiers valides retenus, pour que ce qui est envoyé au
    // serveur corresponde exactement à ce que l'utilisateur voit.
    const dataTransfer = new DataTransfer();
    valides.forEach((file) => dataTransfer.items.add(file));
    input.files = dataTransfer.files;

    setPhotoError(messages.length > 0 ? messages.join(" ") : null);
  }

  if (state.success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 ring-1 ring-inset ring-green-200">
        Votre réclamation a bien été envoyée. Vous recevrez un email de
        confirmation avec votre numéro de suivi.
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Comment nous contactez-vous ?
        </label>
        <select
          name="canal"
          required
          defaultValue={CANAUX_RECLAMATION[0]}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {CANAUX_RECLAMATION.map((canal) => (
            <option key={canal} value={canal}>
              {canal}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Sujet
        </label>
        <select
          name="sujet"
          required
          defaultValue=""
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="" disabled>
            Choisissez un sujet
          </option>
          {CATEGORIES_RECLAMATION.map((categorie) => (
            <option key={categorie.label} value={categorie.label}>
              {categorie.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={4}
          maxLength={3000}
          placeholder="Décrivez votre réclamation en détail"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Photos (jusqu&apos;à {MAX_PHOTOS}, 5 Mo max chacune, facultatif)
        </label>
        <input
          type="file"
          name="photos"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handlePhotosChange}
          className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
        {photoError && <p className="mt-1 text-xs text-red-600">{photoError}</p>}
      </div>

      <SubmitButton className="w-full py-3" pendingLabel="Envoi...">
        Envoyer
      </SubmitButton>
    </form>
  );
}
