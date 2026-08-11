import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Chantier } from "@/lib/types";
import { ClientsList } from "./ClientsList";
import { GOLD_BG_TEXT_CLASS } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Clients | RenovIA",
};

export type ClientAgregat = {
  nom: string;
  email: string;
  tel: string | null;
  nombreChantiers: number;
  clientDepuis: string;
};

export default async function ClientsPage() {
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
    .eq("entreprise_id", entreprise.id)
    .order("created_at", { ascending: true });

  const chantiers = (chantiersData ?? []) as Chantier[];

  // Regroupe les chantiers par email client (pas de table clients dédiée) :
  // le tri ascendant garantit que la première rencontre d'un email
  // correspond à son chantier le plus ancien, utilisé comme "client depuis".
  const parEmail = new Map<string, ClientAgregat>();
  for (const c of chantiers) {
    const existant = parEmail.get(c.email_client);
    if (existant) {
      existant.nombreChantiers += 1;
      if (c.tel_client) existant.tel = c.tel_client;
    } else {
      parEmail.set(c.email_client, {
        nom: c.nom_client,
        email: c.email_client,
        tel: c.tel_client,
        nombreChantiers: 1,
        clientDepuis: c.created_at,
      });
    }
  }

  const clients = Array.from(parEmail.values()).sort((a, b) =>
    a.nom.localeCompare(b.nom),
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
        <p className={`mt-1 text-sm ${GOLD_BG_TEXT_CLASS}`}>
          {clients.length} client{clients.length > 1 ? "s" : ""} au total.
        </p>
      </div>
      <ClientsList clients={clients} />
    </div>
  );
}
