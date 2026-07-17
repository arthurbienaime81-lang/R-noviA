import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client privilégié (clé service_role) : bypasse RLS.
 *
 * À utiliser UNIQUEMENT dans du code serveur de confiance qui résout
 * explicitement un `lien_token` en `chantier_id` avant toute lecture/écriture
 * (page publique /chantier/[token] et ses Server Actions). Ne jamais exposer
 * ce client au navigateur ni l'utiliser pour des requêtes non scopées.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
