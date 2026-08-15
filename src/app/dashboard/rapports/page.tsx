import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Chantier } from "@/lib/types";
import { RapportsClient } from "./RapportsClient";
import { GOLD_BG_TEXT_CLASS } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Rapports | Chantivia",
};

export default async function RapportsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: entreprise } = await supabase
    .from("entreprises")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!entreprise) {
    return (
      <div className="p-6">
        <p className={`text-sm ${GOLD_BG_TEXT_CLASS}`}>
          Impossible de charger les informations de votre entreprise.
        </p>
      </div>
    );
  }

  const { data: chantiersData } = await supabase
    .from("chantiers")
    .select("*")
    .eq("entreprise_id", entreprise.id);

  const chantiers = (chantiersData ?? []) as Chantier[];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Rapports</h1>
      <p className={`mt-1 text-sm ${GOLD_BG_TEXT_CLASS}`}>
        Statistiques d&apos;activité de votre entreprise.
      </p>
      <RapportsClient chantiers={chantiers} />
    </div>
  );
}
