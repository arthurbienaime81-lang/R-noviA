import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Anti-spam basique par comptage en base (réclamations/messages publics,
 * tentatives de connexion) : pas d'infrastructure de rate limiting partagée
 * disponible côté Vercel serverless, donc on limite le débit d'écriture par
 * clé (chantier_id, email...) plutôt que par IP. Renvoie `true` si la limite
 * n'est pas atteinte.
 */
export async function sousLaLimite(
  client: SupabaseClient,
  table: string,
  column: string,
  value: string,
  maxSurFenetre: number,
  fenetreMinutes: number,
): Promise<boolean> {
  const depuis = new Date(Date.now() - fenetreMinutes * 60_000).toISOString();
  const { count } = await client
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, value)
    .gte("created_at", depuis);

  return (count ?? 0) < maxSurFenetre;
}
