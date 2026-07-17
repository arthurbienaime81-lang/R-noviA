import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AvisForm } from "./AvisForm";

export const metadata: Metadata = {
  title: "Votre avis",
  description: "Donnez votre avis sur votre chantier.",
};

export default async function AvisPage({
  params,
}: {
  params: { token: string };
}) {
  const admin = createAdminClient();

  const { data: avis } = await admin
    .from("avis")
    .select("id, note, entreprise_id, entreprises(nom)")
    .eq("token", params.token)
    .single<{
      id: string;
      note: number | null;
      entreprise_id: string;
      entreprises: { nom: string } | null;
    }>();

  if (!avis) {
    notFound();
  }

  const nomEntreprise = avis.entreprises?.nom ?? "l'entreprise";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="mb-4 text-center text-lg font-semibold text-slate-900">
          Votre avis compte
        </h1>
        {avis.note !== null ? (
          <p className="text-center text-sm text-slate-600">
            Vous avez déjà répondu à cette demande d&apos;avis. Merci !
          </p>
        ) : (
          <AvisForm token={params.token} nomEntreprise={nomEntreprise} />
        )}
      </div>
    </main>
  );
}
