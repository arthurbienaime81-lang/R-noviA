-- Corrige un bug bloquant la création de chantier pour tout utilisateur réel.
--
-- Découvert le 2026-08-17 pendant les tests de la migration Next.js 16 : le
-- trigger set_numero_dossier() (0008_chantiers_champs_additionnels.sql)
-- écrit dans dossier_counters, table dont la RLS interdit tout accès à
-- authenticated/anon (deny-by-default, intentionnel — commentaire de 0008).
-- Mais le trigger n'était pas déclaré SECURITY DEFINER : il s'exécutait donc
-- avec les droits de l'utilisateur qui déclenche l'INSERT sur "chantiers".
-- createChantier() (src/app/dashboard/actions.ts) utilise le client RLS
-- standard (pas service_role) — toute création de chantier depuis le
-- dashboard échouait avec "new row violates row-level security policy for
-- table dossier_counters" (code 42501).
--
-- Le seul chemin qui fonctionnait déjà était service_role (contourne
-- systématiquement RLS), ce qui explique que le bug soit passé inaperçu :
-- le backfill de 0008 et tout accès via service_role n'étaient pas concernés.
--
-- SECURITY DEFINER fait tourner le trigger avec les droits du propriétaire
-- de la fonction plutôt que de l'appelant — search_path fixé explicitement
-- par bonne pratique standard pour toute fonction SECURITY DEFINER (évite un
-- détournement de résolution des identifiants non qualifiés).

create or replace function set_numero_dossier() returns trigger as $$
declare
  annee int := extract(year from now())::int;
  compteur int;
begin
  if new.numero_dossier is not null then
    return new;
  end if;

  insert into dossier_counters (year, counter) values (annee, 1)
    on conflict (year) do update set counter = dossier_counters.counter + 1
    returning counter into compteur;

  new.numero_dossier := 'CH-' || annee || '-' || lpad(compteur::text, 4, '0');
  return new;
end;
$$ language plpgsql security definer set search_path = public;
