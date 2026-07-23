export type StatutChantier = "en_cours" | "termine" | "en_retard" | "conteste";
export type StatutEtape = "pending" | "en_cours" | "fait";
export type StatutReclamation =
  | "ouverte"
  | "en_cours"
  | "resolue"
  | "contestee"
  | "archive";
export type Priorite = "P1" | "P2" | "P3";
export type Auteur = "entreprise" | "client";
export type TypePhotoReclamation = "client" | "resolution";

export interface Entreprise {
  id: string;
  user_id: string;
  nom: string;
  email: string;
  tel: string | null;
  logo_url: string | null;
  google_maps_url: string | null;
  created_at: string;
}

export interface Chantier {
  id: string;
  entreprise_id: string;
  nom_client: string;
  email_client: string;
  tel_client: string | null;
  adresse: string;
  statut: StatutChantier;
  progression: number;
  date_debut: string | null;
  date_fin_prevue: string | null;
  description: string | null;
  description_cloture: string | null;
  photo_cloture_url: string | null;
  date_cloture: string | null;
  date_limite_contestation: string | null;
  lien_token: string;
  created_at: string;
}

export interface Etape {
  id: string;
  chantier_id: string;
  nom: string;
  statut: StatutEtape;
  ordre: number;
  created_at: string;
}

export interface Reclamation {
  id: string;
  chantier_id: string;
  sujet: string;
  message: string;
  statut: StatutReclamation;
  numero_ticket: string;
  canal: string;
  priorite: Priorite;
  note_interne: string | null;
  derniere_mise_a_jour: string;
  niveau_relance: number;
  date_prise_en_charge: string | null;
  description_resolution: string | null;
  date_cloture: string | null;
  date_limite_contestation: string | null;
  created_at: string;
}

/**
 * Vue restreinte d'une réclamation exposée aux pages publiques
 * (/chantier/[token]). Exclut délibérément les champs internes qui ne
 * doivent jamais atteindre le navigateur du client (note_interne,
 * derniere_mise_a_jour, niveau_relance, date_prise_en_charge) : passer un
 * objet `Reclamation` complet à un composant client le sérialiserait dans
 * le payload envoyé au navigateur même sans jamais l'afficher à l'écran.
 */
export interface ReclamationPublique {
  id: string;
  chantier_id: string;
  sujet: string;
  message: string;
  statut: StatutReclamation;
  numero_ticket: string;
  canal: string;
  priorite: Priorite;
  description_resolution: string | null;
  date_limite_contestation: string | null;
  created_at: string;
}

export interface ReclamationPhoto {
  id: string;
  reclamation_id: string;
  url: string;
  type: TypePhotoReclamation;
  created_at: string;
}

export interface ActiviteTicket {
  id: string;
  reclamation_id: string;
  description: string;
  created_at: string;
}

export interface Avis {
  id: string;
  chantier_id: string;
  entreprise_id: string;
  note: number | null;
  commentaire: string | null;
  token: string;
  created_at: string;
}

export interface Message {
  id: string;
  chantier_id: string;
  contenu: string;
  auteur: Auteur;
  created_at: string;
}

export interface Photo {
  id: string;
  chantier_id: string;
  url: string;
  caption: string | null;
  created_at: string;
}

export const ETAPES_PAR_DEFAUT = [
  "Démolition",
  "Gros œuvre",
  "Finitions",
  "Livraison",
] as const;
