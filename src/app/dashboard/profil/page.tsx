import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Entreprise } from "@/lib/types";
import { ProfilForm } from "./ProfilForm";
import { LogoUpload } from "./LogoUpload";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = {
  title: "Profil | RenovIA",
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
        <h1 className="text-2xl font-semibold text-slate-900">Profil</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gérez les informations de votre entreprise.
        </p>
      </div>

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
          Mot de passe
        </h2>
        <PasswordForm />
      </section>
    </div>
  );
}
