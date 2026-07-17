"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { sendMessageEntreprise, type ChantierActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import type { Message } from "@/lib/types";

const initialState: ChantierActionState = { error: null, success: false };

export function Messagerie({
  chantierId,
  messages,
}: {
  chantierId: string;
  messages: Message[];
}) {
  const action = sendMessageEntreprise.bind(null, chantierId);
  const [state, formAction] = useFormState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-80 space-y-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun message pour le moment.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.auteur === "entreprise"
                  ? "ml-auto bg-[#2563EB] text-white"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              <p>{message.contenu}</p>
              <p
                className={`mt-1 text-[10px] ${
                  message.auteur === "entreprise" ? "text-blue-100" : "text-slate-400"
                }`}
              >
                {message.auteur === "entreprise" ? "Vous" : "Client"} ·{" "}
                {new Date(message.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
          ))
        )}
      </div>

      <form ref={formRef} action={formAction} className="space-y-2">
        {state.error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-inset ring-red-200">
            {state.error}
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            name="contenu"
            required
            rows={2}
            placeholder="Écrire un message au client..."
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <SubmitButton pendingLabel="Envoi...">Envoyer</SubmitButton>
        </div>
      </form>
    </div>
  );
}
