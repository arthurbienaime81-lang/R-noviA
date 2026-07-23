-- RenovIA — durcissement : RLS explicite sur ticket_counters.
--
-- Audit de sécurité 2026-07 : cette table (compteur interne du trigger
-- set_numero_ticket) n'avait jamais reçu de "enable row level security"
-- explicite dans 0002_sop.sql. Vérification empirique : Supabase active RLS
-- par défaut sur toute nouvelle table de ce projet, donc l'accès était déjà
-- refusé par défaut (deny-by-default, aucune policy = aucun accès pour
-- anon/authenticated). Cette migration rend ce verrouillage explicite plutôt
-- que de dépendre d'un comportement implicite de la plateforme.

alter table ticket_counters enable row level security;

-- Aucune policy créée intentionnellement : ni le rôle anon ni authenticated
-- n'ont besoin d'accéder à cette table directement. Seul le trigger
-- set_numero_ticket (déclenché lors d'un insert sur reclamations via le
-- client service_role, qui contourne RLS) doit l'écrire.
