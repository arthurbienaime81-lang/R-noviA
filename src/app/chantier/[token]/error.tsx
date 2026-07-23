"use client";

import { useEffect } from "react";

export default function ChantierError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[chantier/[token]] erreur client :", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm font-medium text-slate-900">
          Une erreur d&apos;affichage est survenue.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Votre action a peut-être bien été enregistrée. Rechargez la page
          pour vérifier.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    </main>
  );
}
