-- RenovIA — champs additionnels sur chantiers pour la refonte du dashboard.
--
-- N'ajoute aucun statut ni ne touche à chantiers_statut_check : le pipeline
-- reste en_cours/termine/en_retard/conteste (décision prise le 2026-08).
-- Les 4 colonnes ci-dessous sont strictement additives (nullables ou avec
-- défaut), aucune table ni policy existante n'est modifiée.

-- ━━━ numero_dossier (ex. "CH-2026-0001") — même mécanisme que numero_ticket
-- sur reclamations (0002_sop.sql) : compteur par année + trigger à l'insert.

create table if not exists dossier_counters (
  year int primary key,
  counter int not null default 0
);
alter table dossier_counters enable row level security;
-- Aucune policy créée intentionnellement : ni anon ni authenticated n'ont
-- besoin d'y accéder directement (même raisonnement que ticket_counters).

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
$$ language plpgsql;

alter table chantiers
  add column if not exists numero_dossier text,
  add column if not exists type_travaux text,
  add column if not exists urgent boolean not null default false,
  add column if not exists montant numeric(10, 2);

drop trigger if exists trg_set_numero_dossier on chantiers;
create trigger trg_set_numero_dossier
  before insert on chantiers
  for each row execute function set_numero_dossier();

-- Backfill des chantiers déjà créés avant ce trigger, avec la même logique
-- de compteur (par année de création réelle du chantier, pas l'année
-- courante), traités dans l'ordre chronologique pour une numérotation
-- cohérente.
do $$
declare
  r record;
  annee int;
  compteur int;
begin
  for r in
    select id, created_at from chantiers where numero_dossier is null order by created_at asc
  loop
    annee := extract(year from r.created_at)::int;
    insert into dossier_counters (year, counter) values (annee, 1)
      on conflict (year) do update set counter = dossier_counters.counter + 1
      returning counter into compteur;
    update chantiers
      set numero_dossier = 'CH-' || annee || '-' || lpad(compteur::text, 4, '0')
      where id = r.id;
  end loop;
end $$;

alter table chantiers alter column numero_dossier set not null;
create unique index if not exists chantiers_numero_dossier_key on chantiers (numero_dossier);
