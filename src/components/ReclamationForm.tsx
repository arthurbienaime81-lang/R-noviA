"use client";

import { useState, type FormEvent } from "react";

export function ReclamationForm({ chantierNom }: { chantierNom: string }) {
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [envoye, setEnvoye] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sujet.trim() || !message.trim()) return;

    // TODO: brancher sur l'API de réclamations une fois disponible
    console.log("Réclamation envoyée pour", chantierNom, { sujet, message });

    setEnvoye(true);
    setSujet("");
    setMessage("");
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-slate-900">
        Signaler une réclamation
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Une question ou un problème sur ce chantier ? Décrivez-le ci-dessous,
        notre équipe vous répondra rapidement.
      </p>

      {envoye ? (
        <div className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-inset ring-green-200">
          Votre réclamation a bien été envoyée. Nous reviendrons vers vous
          dans les meilleurs délais.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="sujet"
              className="block text-sm font-medium text-slate-700"
            >
              Sujet
            </label>
            <input
              id="sujet"
              type="text"
              required
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder="Ex. : Retard sur les finitions"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-slate-700"
            >
              Message
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre réclamation en détail"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Envoyer la réclamation
          </button>
        </form>
      )}
    </div>
  );
}
