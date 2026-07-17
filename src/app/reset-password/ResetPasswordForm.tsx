"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { requestPasswordReset, type ResetState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: ResetState = { error: null, success: false };

export function ResetPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

  if (state.success) {
    return (
      <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-inset ring-green-200">
        Si un compte existe avec cet email, un lien de réinitialisation vient
        de vous être envoyé.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <SubmitButton className="w-full" pendingLabel="Envoi...">
        Envoyer le lien de réinitialisation
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-[#2563EB] hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
