import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/utils";
import type { Chantier } from "@/lib/types";
import { VerifierRelancesButton } from "@/components/VerifierRelancesButton";
import { NewChantierModal } from "../NewChantierModal";
import { ChantiersList } from "./ChantiersList";
import { GOLD_BG_TEXT_CLASS } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Chantiers | Chantivia",
};

export default async function ChantiersPage() {
  const supabase = await createClient();
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
    .eq("entreprise_id", entreprise.id)
    .order("created_at", { ascending: false });

  const chantiers = (chantiersData ?? []) as Chantier[];
  const chantierIds = chantiers.map((c) => c.id);

  const { data: messagesParChantier } =
    chantierIds.length > 0
      ? await supabase.from("messages").select("chantier_id").in("chantier_id", chantierIds)
      : { data: [] };

  const nombreMessagesParChantier: Record<string, number> = {};
  for (const { chantier_id } of messagesParChantier ?? []) {
    nombreMessagesParChantier[chantier_id] =
      (nombreMessagesParChantier[chantier_id] ?? 0) + 1;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Chantiers</h1>
          <p className={`mt-1 text-sm ${GOLD_BG_TEXT_CLASS}`}>
            Tous vos chantiers, en un coup d&apos;œil.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <VerifierRelancesButton />
          <NewChantierModal />
        </div>
      </div>

      <ChantiersList
        chantiers={chantiers}
        origin={await getOrigin()}
        messageCounts={nombreMessagesParChantier}
      />
    </div>
  );
}
