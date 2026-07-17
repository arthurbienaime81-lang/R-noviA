import type { Priorite } from "./types";

export const CATEGORIES_RECLAMATION = [
  {
    label: "Urgence (fuite, panne)",
    priorite: "P1" as Priorite,
    delaiHeures: 4,
    delaiLabel: "4h",
  },
  {
    label: "Malfaçon (retouche, défaut)",
    priorite: "P2" as Priorite,
    delaiHeures: 48,
    delaiLabel: "48h",
  },
  {
    label: "Réclamation (facturation)",
    priorite: "P2" as Priorite,
    delaiHeures: 48,
    delaiLabel: "48h",
  },
  {
    label: "Question (info, délai)",
    priorite: "P3" as Priorite,
    delaiHeures: 120,
    delaiLabel: "5 jours",
  },
] as const;

export const CANAUX_RECLAMATION = [
  "Formulaire web",
  "WhatsApp",
  "Email",
  "Téléphone",
] as const;

export function getPrioriteForSujet(sujet: string): Priorite {
  return (
    CATEGORIES_RECLAMATION.find((c) => c.label === sujet)?.priorite ?? "P3"
  );
}

export function getDelaiLabelForSujet(sujet: string): string {
  return (
    CATEGORIES_RECLAMATION.find((c) => c.label === sujet)?.delaiLabel ??
    "5 jours"
  );
}

export const PRIORITE_STYLES: Record<Priorite, string> = {
  P1: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  P2: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
  P3: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

export const PRIORITE_LABELS: Record<Priorite, string> = {
  P1: "P1 — Urgence",
  P2: "P2 — Prioritaire",
  P3: "P3 — Question",
};

/** Heures ouvrées : du lundi au vendredi, 9h-18h (heure du serveur). */
export function estHeureOuvree(date: Date): boolean {
  const jour = date.getDay();
  const heure = date.getHours();
  if (jour === 0 || jour === 6) return false;
  return heure >= 9 && heure < 18;
}
