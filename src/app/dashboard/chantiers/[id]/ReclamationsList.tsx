import { ReclamationCard } from "./ReclamationCard";
import type { Reclamation, ReclamationPhoto, ActiviteTicket } from "@/lib/types";

export type ReclamationAvecDetails = Reclamation & {
  photos: ReclamationPhoto[];
  activites: ActiviteTicket[];
};

export function ReclamationsList({
  chantierId,
  reclamations,
}: {
  chantierId: string;
  reclamations: ReclamationAvecDetails[];
}) {
  if (reclamations.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Aucune réclamation pour ce chantier.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200">
      {reclamations.map((reclamation) => (
        <ReclamationCard
          key={reclamation.id}
          chantierId={chantierId}
          reclamation={reclamation}
        />
      ))}
    </ul>
  );
}
