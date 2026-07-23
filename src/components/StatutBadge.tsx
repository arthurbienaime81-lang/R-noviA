import type { StatutChantier } from "@/lib/types";

const STYLES: Record<StatutChantier, string> = {
  en_cours: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
  termine: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  en_retard: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  conteste: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
};

const LABELS: Record<StatutChantier, string> = {
  en_cours: "En cours",
  termine: "Terminé",
  en_retard: "En retard",
  conteste: "Contesté",
};

export function StatutBadge({ statut }: { statut: StatutChantier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[statut]}`}
    >
      {LABELS[statut]}
    </span>
  );
}
