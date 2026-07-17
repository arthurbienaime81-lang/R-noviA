"use client";

import { useState, useTransition } from "react";
import { updateProgression } from "./actions";
import { ProgressBar } from "@/components/ProgressBar";

export function ProgressionEditor({
  chantierId,
  progression,
}: {
  chantierId: string;
  progression: number;
}) {
  const [value, setValue] = useState(progression);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateProgression(chantierId, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Progression</p>
        <span className="text-sm font-semibold text-slate-900">{value}%</span>
      </div>
      <ProgressBar progression={value} size="lg" />
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-3 w-full accent-[#2563EB]"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || value === progression}
          className="rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
        {saved && <span className="text-xs text-green-600">Mis à jour</span>}
        {value >= 100 && (
          <span className="text-xs text-slate-500">
            Passera automatiquement à « Terminé »
          </span>
        )}
      </div>
    </div>
  );
}
