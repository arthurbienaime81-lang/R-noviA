export type StatutChantier = "En cours" | "Terminé" | "En retard";

export type StatutEtape = "terminee" | "en_cours" | "a_venir";

export interface Etape {
  nom: string;
  statut: StatutEtape;
}

export interface Chantier {
  id: string;
  nom: string;
  client: string;
  adresse: string;
  statut: StatutChantier;
  dateFinPrevue: string;
  progression: number;
  etapes: Etape[];
}

export const chantiers: Chantier[] = [
  {
    id: "1",
    nom: "Rénovation appartement Haussmannien",
    client: "M. et Mme Lefebvre",
    adresse: "12 rue de Rivoli, Paris",
    statut: "En cours",
    dateFinPrevue: "28/08/2026",
    progression: 55,
    etapes: [
      { nom: "Démolition", statut: "terminee" },
      { nom: "Gros œuvre", statut: "en_cours" },
      { nom: "Finitions", statut: "a_venir" },
      { nom: "Livraison", statut: "a_venir" },
    ],
  },
  {
    id: "2",
    nom: "Extension maison individuelle",
    client: "Famille Morel",
    adresse: "8 allée des Tilleuls, Nantes",
    statut: "Terminé",
    dateFinPrevue: "02/06/2026",
    progression: 100,
    etapes: [
      { nom: "Démolition", statut: "terminee" },
      { nom: "Gros œuvre", statut: "terminee" },
      { nom: "Finitions", statut: "terminee" },
      { nom: "Livraison", statut: "terminee" },
    ],
  },
  {
    id: "3",
    nom: "Rénovation locaux commerciaux",
    client: "SCI Bellevue",
    adresse: "45 avenue Jean Jaurès, Lyon",
    statut: "En retard",
    dateFinPrevue: "10/07/2026",
    progression: 40,
    etapes: [
      { nom: "Démolition", statut: "terminee" },
      { nom: "Gros œuvre", statut: "en_cours" },
      { nom: "Finitions", statut: "a_venir" },
      { nom: "Livraison", statut: "a_venir" },
    ],
  },
  {
    id: "4",
    nom: "Réhabilitation immeuble collectif",
    client: "Copropriété Les Cèdres",
    adresse: "3 place de la Mairie, Bordeaux",
    statut: "En cours",
    dateFinPrevue: "15/09/2026",
    progression: 20,
    etapes: [
      { nom: "Démolition", statut: "en_cours" },
      { nom: "Gros œuvre", statut: "a_venir" },
      { nom: "Finitions", statut: "a_venir" },
      { nom: "Livraison", statut: "a_venir" },
    ],
  },
  {
    id: "5",
    nom: "Rénovation pavillon des années 70",
    client: "M. Dubreuil",
    adresse: "21 chemin des Vignes, Toulouse",
    statut: "Terminé",
    dateFinPrevue: "05/05/2026",
    progression: 100,
    etapes: [
      { nom: "Démolition", statut: "terminee" },
      { nom: "Gros œuvre", statut: "terminee" },
      { nom: "Finitions", statut: "terminee" },
      { nom: "Livraison", statut: "terminee" },
    ],
  },
];

export function getChantierById(id: string): Chantier | undefined {
  return chantiers.find((chantier) => chantier.id === id);
}
