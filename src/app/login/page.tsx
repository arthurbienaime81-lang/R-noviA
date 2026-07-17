import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion | RenovIA",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-900">RenovIA</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            Connexion
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Accédez à votre tableau de bord chantiers.
          </p>
        </div>
        <LoginForm redirectTo={searchParams.redirectTo ?? "/dashboard"} />
      </div>
    </main>
  );
}
