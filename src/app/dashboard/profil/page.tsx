import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Entreprise } from "@/lib/types";
import { ProfilForm } from "./ProfilForm";
import { LogoUpload } from "./LogoUpload";
import { PasswordForm } from "./PasswordForm";
import { GOLD_BG_TEXT_CLASS } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Paramètres | RenovIA",
};

export default async function ProfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: entreprise } = await supabase
    .from("entreprises")
    .select("*")
    .eq("user_id", user.id)
    .single<Entreprise>();

  if (!entreprise) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Paramètres</h1>
        <p className={`mt-1 text-sm ${GOLD_BG_TEXT_CLASS}`}>
          Gérez votre compte et les informations de votre entreprise.
        </p>
      </div>

      {/* Aucun système d'abonnement en base pour le moment : libellé fixe,
          à remplacer par une vraie donnée si un système de plans est ajouté
          plus tard. */}
      <section className="rounded-lg bg-[#23261c] p-6">
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d4a94a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
          </svg>
          <h2 className="text-sm font-semibold text-[#d4a94a]">Plan actuel</h2>
        </div>
        <p className="mt-2 text-lg font-semibold text-[#d4a94a]">Plan Standard</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Compte</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <dt className="text-slate-500">Rôle</dt>
            <dd className="font-medium text-slate-900">Propriétaire</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">
          Informations de la société
        </h2>
        <ProfilForm entreprise={entreprise} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Logo</h2>
        <LogoUpload logoUrl={entreprise.logo_url} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">
          Sécurité
        </h2>
        <PasswordForm />
      </section>
    </div>
  );
}
