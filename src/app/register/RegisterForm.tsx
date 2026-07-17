"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { register, type RegisterState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: RegisterState = { error: null, info: null };

export function RegisterForm() {
  const [state, formAction] = useFormState(register, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {state.error}
        </div>
      )}
      {state.info && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-inset ring-green-200">
          {state.info}
        </div>
      )}

      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-slate-700">
          Nom de la société
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

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

      <div>
        <label htmlFor="tel" className="block text-sm font-medium text-slate-700">
          Téléphone
        </label>
        <input
          id="tel"
          name="tel"
          type="tel"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <SubmitButton className="w-full" pendingLabel="Création du compte...">
        Créer mon compte
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-[#2563EB] hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
