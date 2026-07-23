import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Anti-spam basique pour les endpoints publics (réclamation, message client) :
 * un token de suivi étant non devinable mais potentiellement partagé /
 * intercepté, on limite le débit d'écriture par chantier plutôt que par IP
 * (pas d'infrastructure de rate limiting partagée disponible côté Vercel
 * serverless). Renvoie `true` si la limite n'est pas atteinte.
 */
export async function sousLaLimite(
  client: SupabaseClient,
  table: "reclamations" | "messages",
  chantierId: string,
  maxSurFenetre: number,
  fenetreMinutes: number,
): Promise<boolean> {
  const depuis = new Date(Date.now() - fenetreMinutes * 60_000).toISOString();
  const { count } = await client
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("chantier_id", chantierId)
    .gte("created_at", depuis);

  return (count ?? 0) < maxSurFenetre;
}
