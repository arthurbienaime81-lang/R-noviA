"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { changePassword, type PasswordActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: PasswordActionState = { error: null, success: false };

export function PasswordForm() {
  const [state, formAction] = useFormState(changePassword, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-inset ring-green-200">
          Mot de passe mis à jour.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Mot de passe actuel
        </label>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Nouveau mot de passe
        </label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Confirmer le nouveau mot de passe
        </label>
        <input
          name="confirmation"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <SubmitButton pendingLabel="Mise à jour...">
        Changer le mot de passe
      </SubmitButton>
    </form>
  );
}
