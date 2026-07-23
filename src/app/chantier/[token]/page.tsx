import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import type {
  Chantier,
  Etape,
  Message,
  Photo,
  ActiviteTicket,
  ReclamationPublique,
} from "@/lib/types";
import { ProgressBar } from "@/components/ProgressBar";
import { ReclamationForm } from "./ReclamationForm";
import { MessagerieClient } from "./MessagerieClient";
import { MesReclamations, type ReclamationClient } from "./MesReclamations";
import { ClotureChantierInfo } from "./ClotureChantierInfo";

export const metadata: Metadata = {
  title: "Suivi de votre chantier",
  description: "Suivez l'avancement de votre chantier en temps réel.",
};

function EtapeIcon({ fait }: { fait: boolean }) {
  if (fait) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.415l-7.09 7.09a1 1 0 01-1.415 0l-3.09-3.09a1 1 0 111.415-1.415l2.383 2.383 6.383-6.383a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="h-7 w-7 shrink-0 rounded-full border-2 border-slate-300 bg-white" />
  );
}

export default async function ChantierPubliquePage({
  params,
}: {
  params: { token: string };
}) {
  const admin = createAdminClient();

  const { data: chantier } = await admin
    .from("chantiers")
    .select("*, entreprises(nom)")
    .eq("lien_token", params.token)
    .single<Chantier & { entreprises: { nom: string } | null }>();

  if (!chantier) {
    notFound();
  }

  const nomEntreprise = chantier.entreprises?.nom ?? "";

  const [{ data: etapes }, { data: photos }, { data: messages }, { data: reclamations }] =
    await Promise.all([
      admin
        .from("etapes")
        .select("*")
        .eq("chantier_id", chantier.id)
        .order("ordre", { ascending: true })
        .returns<Etape[]>(),
      admin
        .from("photos")
        .select("*")
        .eq("chantier_id", chantier.id)
        .order("created_at", { ascending: false })
        .returns<Photo[]>(),
      admin
        .from("messages")
        .select("*")
        .eq("chantier_id", chantier.id)
        .order("created_at", { ascending: true })
        .returns<Message[]>(),
      admin
        .from("reclamations")
        // Sélection explicite : ne jamais faire de select("*") ici. Ces
        // données sont passées à un composant client et donc sérialisées
        // dans le payload envoyé au navigateur — note_interne et les autres
        // champs internes ne doivent jamais apparaître dans cette liste.
        .select(
          "id, chantier_id, sujet, message, statut, numero_ticket, canal, priorite, description_resolution, date_limite_contestation, created_at",
        )
        .eq("chantier_id", chantier.id)
        .order("created_at", { ascending: false })
        .returns<ReclamationPublique[]>(),
    ]);

  const reclamationIds = (reclamations ?? []).map((r) => r.id);
  const { data: activites } =
    reclamationIds.length > 0
      ? await admin
          .from("activites_ticket")
          .select("*")
          .in("reclamation_id", reclamationIds)
          .order("created_at", { ascending: true })
          .returns<ActiviteTicket[]>()
      : { data: [] as ActiviteTicket[] };

  const reclamationsClient: ReclamationClient[] = (reclamations ?? []).map(
    (reclamation) => ({
      ...reclamation,
      activites: (activites ?? []).filter(
        (a) => a.reclamation_id === reclamation.id,
      ),
    }),
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-[430px] px-4 py-8">
        <header className="mb-6 text-center">
          {nomEntreprise && (
            <p className="text-sm font-medium text-[#2563EB]">{nomEntreprise}</p>
          )}
          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            {chantier.nom_client}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{chantier.adresse}</p>
        </header>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              Avancement du chantier
            </p>
            <p className="text-2xl font-semibold text-[#2563EB]">
              {chantier.progression}%
            </p>
          </div>
          <ProgressBar progression={chantier.progression} size="lg" />
          <p className="mt-3 text-sm text-slate-500">
            Fin prévue le {formatDate(chantier.date_fin_prevue)}
          </p>
        </section>

        <ClotureChantierInfo
          token={params.token}
          statut={chantier.statut}
          descriptionCloture={chantier.description_cloture}
          photoClotureUrl={chantier.photo_cloture_url}
          dateCloture={chantier.date_cloture}
          dateLimiteContestation={chantier.date_limite_contestation}
        />

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Étapes</h2>
          <ul className="space-y-4">
            {(etapes ?? []).map((etape) => (
              <li key={etape.id} className="flex items-center gap-3">
                <EtapeIcon fait={etape.statut === "fait"} />
                <span
                  className={`text-sm ${
                    etape.statut === "fait"
                      ? "font-medium text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {etape.nom}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {photos && photos.length > 0 && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Photos du chantier
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.caption ?? "Photo du chantier"}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {reclamationsClient.length > 0 && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Mes réclamations
            </h2>
            <MesReclamations
              token={params.token}
              reclamations={reclamationsClient}
            />
          </section>
        )}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Une question, un problème ?
          </h2>
          <ReclamationForm token={params.token} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Messagerie
          </h2>
          <MessagerieClient token={params.token} messages={messages ?? []} />
        </section>
      </div>
    </main>
  );
}
