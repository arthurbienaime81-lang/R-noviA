import type { Metadata } from "next";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Chantivia",
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-900">Chantivia</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            Mot de passe oublié
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Recevez un lien pour réinitialiser votre mot de passe.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
