/**
 * Vérification de longueur partagée par les Server Actions, pour un message
 * d'erreur cohérent sur tous les champs texte libres (mêmes limites que les
 * contraintes CHECK ajoutées en base — voir supabase/migrations/0010).
 */
export function erreurLongueur(
  valeur: string,
  max: number,
  label: string,
): string | null {
  return valeur.length > max ? `${label} ne doit pas dépasser ${max} caractères.` : null;
}
