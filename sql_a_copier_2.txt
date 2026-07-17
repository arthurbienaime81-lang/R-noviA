-- RenovIA — SOP réclamations (7 étapes)
-- À exécuter après 0001_init.sql dans l'éditeur SQL de votre projet Supabase.

-- ━━━ NUMÉRO DE TICKET AUTOMATIQUE (SAV-YYYY-XXXX) ━━━

create table if not exists ticket_counters (
  year int primary key,
  counter int not null default 0
);

create or replace function set_numero_ticket() returns trigger as $$
declare
  annee int := extract(year from now())::int;
  compteur int;
begin
  if new.numero_ticket is not null then
    return new;
  end if;

  insert into ticket_counters (year, counter) values (annee, 1)
    on conflict (year) do update set counter = ticket_counters.counter + 1
    returning counter into compteur;

  new.numero_ticket := 'SAV-' || annee || '-' || lpad(compteur::text, 4, '0');
  return new;
end;
$$ language plpgsql;

-- ━━━ COLONNES SOP SUR "reclamations" ━━━

alter table reclamations
  add column if not exists numero_ticket text,
  add column if not exists canal text not null default 'Formulaire web'
    check (canal in ('Formulaire web', 'WhatsApp', 'Email', 'Téléphone')),
  add column if not exists priorite text not null default 'P3'
    check (priorite in ('P1', 'P2', 'P3')),
  add column if not exists note_interne text,
  add column if not exists derniere_mise_a_jour timestamptz not null default now(),
  add column if not exists niveau_relance int not null default 0,
  add column if not exists date_prise_en_charge timestamptz,
  add column if not exists description_resolution text,
  add column if not exists date_cloture timestamptz,
  add column if not exists date_limite_contestation timestamptz;

create unique index if not exists reclamations_numero_ticket_key on reclamations (numero_ticket);

drop trigger if exists trg_set_numero_ticket on reclamations;
create trigger trg_set_numero_ticket
  before insert on reclamations
  for each row execute function set_numero_ticket();

-- Le statut gagne "contestee" et "archive" en plus de ouverte/en_cours/resolue.
alter table reclamations drop constraint if exists reclamations_statut_check;
alter table reclamations add constraint reclamations_statut_check
  check (statut in ('ouverte', 'en_cours', 'resolue', 'contestee', 'archive'));

-- ━━━ PHOTOS DE RÉCLAMATION (jointes par le client + "après intervention") ━━━

create table if not exists reclamation_photos (
  id uuid primary key default gen_random_uuid(),
  reclamation_id uuid not null references reclamations (id) on delete cascade,
  url text not null,
  type text not null default 'client' check (type in ('client', 'resolution')),
  created_at timestamptz not null default now()
);
create index if not exists reclamation_photos_reclamation_id_idx
  on reclamation_photos (reclamation_id);

-- ━━━ JOURNAL D'ACTIVITÉ DU TICKET ━━━

create table if not exists activites_ticket (
  id uuid primary key default gen_random_uuid(),
  reclamation_id uuid not null references reclamations (id) on delete cascade,
  description text not null,
  created_at timestamptz not null default now()
);
create index if not exists activites_ticket_reclamation_id_idx
  on activites_ticket (reclamation_id);

-- ━━━ AVIS CLIENT ━━━

create table if not exists avis (
  id uuid primary key default gen_random_uuid(),
  chantier_id uuid not null references chantiers (id) on delete cascade,
  entreprise_id uuid not null references entreprises (id) on delete cascade,
  note int check (note between 1 and 5),
  commentaire text,
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create unique index if not exists avis_token_key on avis (token);
create index if not exists avis_entreprise_id_idx on avis (entreprise_id);

-- ━━━ RLS ━━━
-- Même principe que 0001 : accès entreprise via la chaîne
-- reclamations/chantiers -> entreprises ; la page publique passe par le
-- client service_role (jamais de policy anonyme).

alter table reclamation_photos enable row level security;
alter table activites_ticket enable row level security;
alter table avis enable row level security;

create policy "reclamation_photos_owner_all" on reclamation_photos
  for all using (
    reclamation_id in (
      select r.id from reclamations r
      join chantiers c on c.id = r.chantier_id
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  )
  with check (
    reclamation_id in (
      select r.id from reclamations r
      join chantiers c on c.id = r.chantier_id
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  );

create policy "activites_ticket_owner_all" on activites_ticket
  for all using (
    reclamation_id in (
      select r.id from reclamations r
      join chantiers c on c.id = r.chantier_id
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  )
  with check (
    reclamation_id in (
      select r.id from reclamations r
      join chantiers c on c.id = r.chantier_id
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  );

create policy "avis_owner_select" on avis
  for select using (
    entreprise_id in (select id from entreprises where user_id = auth.uid())
  );

-- ━━━ STORAGE : photos de réclamation ━━━

insert into storage.buckets (id, name, public)
values ('reclamation-photos', 'reclamation-photos', true)
on conflict (id) do nothing;

create policy "reclamation_photos_public_read" on storage.objects
  for select using (bucket_id = 'reclamation-photos');
create policy "reclamation_photos_auth_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'reclamation-photos');
create policy "reclamation_photos_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'reclamation-photos');
