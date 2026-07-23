import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type {
  Chantier,
  Etape,
  Reclamation,
  ReclamationPhoto,
  ActiviteTicket,
  Message,
  Photo,
} from "@/lib/types";
import { StatutBadge } from "@/components/StatutBadge";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { EditChantierModal } from "./EditChantierModal";
import { ClotureChantierForm } from "./ClotureChantierForm";
import { EtapesList } from "./EtapesList";
import { PhotoUpload } from "./PhotoUpload";
import { ReclamationsList, type ReclamationAvecDetails } from "./ReclamationsList";
import { Messagerie } from "./Messagerie";

export const metadata: Metadata = {
  title: "Détail du chantier | RenovIA",
};

export default async function ChantierDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: chantier } = await supabase
    .from("chantiers")
    .select("*")
    .eq("id", params.id)
    .single<Chantier>();

  if (!chantier) {
    notFound();
  }

  const [{ data: etapes }, { data: reclamations }, { data: messages }, { data: photos }] =
    await Promise.all([
      supabase
        .from("etapes")
        .select("*")
        .eq("chantier_id", chantier.id)
        .order("ordre", { ascending: true })
        .returns<Etape[]>(),
      supabase
        .from("reclamations")
        .select("*")
        .eq("chantier_id", chantier.id)
        .order("created_at", { ascending: false })
        .returns<Reclamation[]>(),
      supabase
        .from("messages")
        .select("*")
        .eq("chantier_id", chantier.id)
        .order("created_at", { ascending: true })
        .returns<Message[]>(),
      supabase
        .from("photos")
        .select("*")
        .eq("chantier_id", chantier.id)
        .order("created_at", { ascending: false })
        .returns<Photo[]>(),
    ]);

  const reclamationIds = (reclamations ?? []).map((r) => r.id);
  const [{ data: reclamationPhotos }, { data: activites }] =
    reclamationIds.length > 0
      ? await Promise.all([
          supabase
            .from("reclamation_photos")
            .select("*")
            .in("reclamation_id", reclamationIds)
            .returns<ReclamationPhoto[]>(),
          supabase
            .from("activites_ticket")
            .select("*")
            .in("reclamation_id", reclamationIds)
            .order("created_at", { ascending: true })
            .returns<ActiviteTicket[]>(),
        ])
      : [{ data: [] as ReclamationPhoto[] }, { data: [] as ActiviteTicket[] }];

  const reclamationsAvecDetails: ReclamationAvecDetails[] = (reclamations ?? []).map(
    (reclamation) => ({
      ...reclamation,
      photos: (reclamationPhotos ?? []).filter(
        (p) => p.reclamation_id === reclamation.id,
      ),
      activites: (activites ?? []).filter(
        (a) => a.reclamation_id === reclamation.id,
      ),
    }),
  );

  const lienClient = `${getOrigin()}/chantier/${chantier.lien_token}`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {chantier.nom_client}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{chantier.adresse}</p>
          <div className="mt-2 flex items-center gap-2">
            <StatutBadge statut={chantier.statut} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CopyLinkButton link={lienClient} />
          <EditChantierModal chantier={chantier} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
          <ClotureChantierForm chantier={chantier} />
          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-500">Client</dt>
              <dd className="text-slate-900">{chantier.email_client}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Téléphone</dt>
              <dd className="text-slate-900">{chantier.tel_client ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Début</dt>
              <dd className="text-slate-900">{formatDate(chantier.date_debut)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Fin prévue</dt>
              <dd className="text-slate-900">
                {formatDate(chantier.date_fin_prevue)}
              </dd>
            </div>
          </dl>
          {chantier.description && (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
              {chantier.description}
            </p>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Étapes</h2>
          <EtapesList chantierId={chantier.id} etapes={etapes ?? []} />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Photos</h2>
          <PhotoUpload chantierId={chantier.id} />
          {photos && photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={photo.caption ?? "Photo du chantier"}
                  className="aspect-square w-full rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            Réclamations
          </h2>
          <ReclamationsList
            chantierId={chantier.id}
            reclamations={reclamationsAvecDetails}
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            Messagerie
          </h2>
          <Messagerie chantierId={chantier.id} messages={messages ?? []} />
        </section>
      </div>
    </div>
  );
}
