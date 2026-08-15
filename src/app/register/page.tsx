import type { Metadata, Viewport } from "next";
import { RegisterForm } from "./RegisterForm";
import goldBg from "@/styles/goldBackground.module.css";

export const metadata: Metadata = {
  title: "Créer un compte | Chantivia",
};

// Même couleur de base que le fond or du hero (goldBackground.module.css) —
// voir la note dans src/app/page.tsx.
export const viewport: Viewport = {
  themeColor: "#d4a94a",
};

export default function RegisterPage() {
  return (
    <main
      data-gold-bg
      className={`flex min-h-dvh items-center justify-center px-6 ${goldBg.goldBackgroundAnimated}`}
    >
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-900">Chantivia</p>
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
