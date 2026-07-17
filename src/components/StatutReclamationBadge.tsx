import type { StatutReclamation } from "@/lib/types";

const STYLES: Record<StatutReclamation, string> = {
  ouverte: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  en_cours: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  resolue: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  contestee: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  archive: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200",
};

const LABELS: Record<StatutReclamation, string> = {
  ouverte: "Ouverte",
  en_cours: "En cours",
  resolue: "Résolue",
  contestee: "Contestée",
  archive: "Archivée",
};

export function StatutReclamationBadge({ statut }: { statut: StatutReclamation }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[statut]}`}
    >
      {LABELS[statut]}
    </span>
  );
}
