"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { login, type AuthState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { primeIntroAudio } from "@/lib/introAudio";

const initialState: AuthState = { error: null };
const LOGIN_INTRO_FLAG = "renovia-show-login-intro";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useFormState(login, initialState);

  useEffect(() => {
    // Identifiants refusés : la connexion n'a pas abouti, on retire le
    // drapeau posé au clic pour ne pas déclencher l'intro à tort lors d'une
    // future arrivée sur le dashboard (session déjà ouverte par ailleurs).
    if (state.error) {
      sessionStorage.removeItem(LOGIN_INTRO_FLAG);
    }
  }, [state.error]);

  return (
    <form
      action={formAction}
      onSubmit={() => {
        // Synchrone, dans la continuité directe du clic sur "Se connecter" :
        // pose le drapeau qui déclenchera l'écran d'intro sur le dashboard
        // et débloque la lecture audio, avant même que l'action serveur
        // (asynchrone) ne démarre.
        sessionStorage.setItem(LOGIN_INTRO_FLAG, "1");
        primeIntroAudio();
      }}
      className="space-y-4"
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />

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

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Mot de passe
          </label>
          <Link href="/reset-password" className="text-xs font-medium text-[#2563EB] hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <SubmitButton className="w-full" pendingLabel="Connexion...">
        Se connecter
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-[#2563EB] hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
