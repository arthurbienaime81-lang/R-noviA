"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  updatePrioriteReclamation,
  updateNoteInterne,
  prendreEnCharge,
  clorReclamation,
  type ChantierActionState,
} from "./actions";
import { useTransition } from "react";
import { PRIORITE_STYLES, PRIORITE_LABELS } from "@/lib/priorites";
import { formatDate } from "@/lib/format";
import { StatutReclamationBadge } from "@/components/StatutReclamationBadge";
import type {
  Priorite,
  Reclamation,
  ReclamationPhoto,
  ActiviteTicket,
} from "@/lib/types";

const initialClotureState: ChantierActionState = { error: null, success: false };

function ClotureSubmitButton({ canSubmit }: { canSubmit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!canSubmit || pending}
      className="rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Clôture..." : "Clore la réclamation"}
    </button>
  );
}

export function ReclamationCard({
  chantierId,
  reclamation,
}: {
  chantierId: string;
  reclamation: Reclamation & {
    photos: ReclamationPhoto[];
    activites: ActiviteTicket[];
  };
}) {
  const [isPending, startTransition] = useTransition();
  const [noteInterne, setNoteInterne] = useState(reclamation.note_interne ?? "");
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const clotureAction = clorReclamation.bind(null, chantierId, reclamation.id);
  const [clotureState, clotureFormAction] = useFormState(
    clotureAction,
    initialClotureState,
  );
  const [showClotureForm, setShowClotureForm] = useState(false);
  const [descriptionResolution, setDescriptionResolution] = useState("");
  const [photoSelectionnee, setPhotoSelectionnee] = useState(false);

  useEffect(() => {
    if (clotureState.success) setShowClotureForm(false);
  }, [clotureState.success]);

  function handleNoteSave() {
    startTransition(async () => {
      const { error } = await updateNoteInterne(chantierId, reclamation.id, noteInterne);
      if (error) {
        setNoteError(error);
        return;
      }
      setNoteError(null);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    });
  }

  const photosClient = reclamation.photos.filter((p) => p.type === "client");
  const photoResolution = reclamation.photos.find((p) => p.type === "resolution");
  const peutClore =
    reclamation.statut === "ouverte" || reclamation.statut === "en_cours";

  return (
    <li className="space-y-4 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-400">
              {reclamation.numero_ticket}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITE_STYLES[reclamation.priorite]}`}
            >
              {PRIORITE_LABELS[reclamation.priorite]}
            </span>
            <span className="text-xs text-slate-400">{reclamation.canal}</span>
            <StatutReclamationBadge statut={reclamation.statut} />
          </div>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {reclamation.sujet}
          </p>
          <p className="mt-1 text-sm text-slate-600">{reclamation.message}</p>
          <p className="mt-1 text-xs text-slate-400">
            {formatDate(reclamation.created_at)}
          </p>
        </div>

        <select
          value={reclamation.priorite}
          disabled={isPending}
          onChange={(e) =>
            startTransition(() =>
              updatePrioriteReclamation(
                chantierId,
                reclamation.id,
                e.target.value as Priorite,
              ),
            )
          }
          className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-xs"
        >
          <option value="P1">P1 — Urgence</option>
          <option value="P2">P2 — Prioritaire</option>
          <option value="P3">P3 — Question</option>
        </select>
      </div>

      {photosClient.length > 0 && (
        <div className="flex gap-2">
          {photosClient.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt="Photo jointe par le client"
              className="h-16 w-16 rounded-md object-cover"
            />
          ))}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-500">
          Note interne (non visible par le client)
        </label>
        <textarea
          value={noteInterne}
          onChange={(e) => setNoteInterne(e.target.value)}
          rows={2}
          maxLength={2000}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {noteError && <p className="mt-1 text-xs text-red-600">{noteError}</p>}
        <button
          type="button"
          onClick={handleNoteSave}
          disabled={isPending}
          className="mt-1 text-xs font-medium text-[#2563EB] hover:underline"
        >
          {noteSaved ? "Enregistré ✓" : "Enregistrer la note"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {reclamation.statut === "ouverte" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(() => prendreEnCharge(chantierId, reclamation.id))
            }
            className="rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Prendre en charge
          </button>
        )}
        {peutClore && !showClotureForm && (
          <button
            type="button"
            onClick={() => setShowClotureForm(true)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Clore la réclamation
          </button>
        )}
      </div>

      {showClotureForm && (
        <form
          action={clotureFormAction}
          className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4"
        >
          {clotureState.error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-inset ring-red-200">
              {clotureState.error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Description de l&apos;intervention réalisée
            </label>
            <textarea
              name="description_resolution"
              required
              rows={3}
              maxLength={2000}
              value={descriptionResolution}
              onChange={(e) => setDescriptionResolution(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Photo après intervention (obligatoire)
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
              onClick={() => setShowClotureForm(false)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <ClotureSubmitButton
              canSubmit={Boolean(descriptionResolution.trim()) && photoSelectionnee}
            />
          </div>
        </form>
      )}

      {photoResolution && (
        <div>
          <p className="text-xs font-medium text-slate-500">
            Photo après intervention
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoResolution.url}
            alt="Photo après intervention"
            className="mt-1 h-24 w-24 rounded-md object-cover"
          />
        </div>
      )}

      {reclamation.activites.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500">Journal</p>
          <ul className="mt-1 space-y-1">
            {reclamation.activites.map((activite) => (
              <li key={activite.id} className="text-xs text-slate-500">
                <span className="text-slate-400">
                  {formatDate(activite.created_at)}
                </span>{" "}
                — {activite.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
