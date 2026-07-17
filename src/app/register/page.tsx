import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Créer un compte | RenovIA",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6 py-10">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-900">RenovIA</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            Créer un compte
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pour votre entreprise de rénovation.
          </p>
        </div>
        <RegisterForm />
      </div>
    </main>
  );
}
