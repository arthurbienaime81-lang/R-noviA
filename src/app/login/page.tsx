import type { Metadata, Viewport } from "next";
import { LoginForm } from "./LoginForm";
import goldBg from "@/styles/goldBackground.module.css";

export const metadata: Metadata = {
  title: "Connexion | RenovIA",
};

// Même couleur de base que le fond or du hero (goldBackground.module.css) —
// voir la note dans src/app/page.tsx.
export const viewport: Viewport = {
  themeColor: "#d4a94a",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  return (
    <main
      data-gold-bg
      className={`flex min-h-dvh items-center justify-center px-6 ${goldBg.goldBackground}`}
    >
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
