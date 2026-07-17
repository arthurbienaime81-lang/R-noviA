-- RenovIA — schéma initial
-- À exécuter dans l'éditeur SQL de votre projet Supabase (voir SETUP.md).

create extension if not exists pgcrypto;

-- ━━━ TABLES ━━━

create table if not exists entreprises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nom text not null,
  email text not null,
  tel text,
  logo_url text,
  created_at timestamptz not null default now()
);
create unique index if not exists entreprises_user_id_key on entreprises (user_id);

create table if not exists chantiers (
  id uuid primary key default gen_random_uuid(),
  entreprise_id uuid not null references entreprises (id) on delete cascade,
  nom_client text not null,
  email_client text not null,
  tel_client text,
  adresse text not null,
  statut text not null default 'en_cours' check (statut in ('en_cours', 'termine', 'en_retard')),
  progression int not null default 0 check (progression between 0 and 100),
  date_debut date,
  date_fin_prevue date,
  description text,
  lien_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create index if not exists chantiers_entreprise_id_idx on chantiers (entreprise_id);
create unique index if not exists chantiers_lien_token_key on chantiers (lien_token);

create table if not exists etapes (
  id uuid primary key default gen_random_uuid(),
  chantier_id uuid not null references chantiers (id) on delete cascade,
  nom text not null,
  statut text not null default 'pending' check (statut in ('pending', 'en_cours', 'fait')),
  ordre int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists etapes_chantier_id_idx on etapes (chantier_id);

create table if not exists reclamations (
  id uuid primary key default gen_random_uuid(),
  chantier_id uuid not null references chantiers (id) on delete cascade,
  sujet text not null,
  message text not null,
  statut text not null default 'ouverte' check (statut in ('ouverte', 'en_cours', 'resolue')),
  created_at timestamptz not null default now()
);
create index if not exists reclamations_chantier_id_idx on reclamations (chantier_id);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chantier_id uuid not null references chantiers (id) on delete cascade,
  contenu text not null,
  auteur text not null check (auteur in ('entreprise', 'client')),
  created_at timestamptz not null default now()
);
create index if not exists messages_chantier_id_idx on messages (chantier_id);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  chantier_id uuid not null references chantiers (id) on delete cascade,
  url text not null,
  caption text,
  created_at timestamptz not null default now()
);
create index if not exists photos_chantier_id_idx on photos (chantier_id);

-- ━━━ RLS ━━━
-- Principe : seule l'entreprise propriétaire (via sa session Supabase Auth)
-- peut lire/écrire ses propres données. La page publique /chantier/[token]
-- ne passe jamais par ces policies : elle utilise la clé service_role côté
-- serveur (voir src/lib/supabase/admin.ts), après avoir résolu le token en
-- chantier_id. Aucune policy "public" n'est donc nécessaire ici, ce qui
-- évite toute énumération des chantiers par un client anonyme.

alter table entreprises enable row level security;
alter table chantiers enable row level security;
alter table etapes enable row level security;
alter table reclamations enable row level security;
alter table messages enable row level security;
alter table photos enable row level security;

create policy "entreprises_self_select" on entreprises
  for select using (auth.uid() = user_id);
create policy "entreprises_self_insert" on entreprises
  for insert with check (auth.uid() = user_id);
create policy "entreprises_self_update" on entreprises
  for update using (auth.uid() = user_id);

create policy "chantiers_owner_all" on chantiers
  for all using (
    entreprise_id in (select id from entreprises where user_id = auth.uid())
  )
  with check (
    entreprise_id in (select id from entreprises where user_id = auth.uid())
  );

create policy "etapes_owner_all" on etapes
  for all using (
    chantier_id in (
      select c.id from chantiers c
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  )
  with check (
    chantier_id in (
      select c.id from chantiers c
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  );

create policy "reclamations_owner_all" on reclamations
  for all using (
    chantier_id in (
      select c.id from chantiers c
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  )
  with check (
    chantier_id in (
      select c.id from chantiers c
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  );

create policy "messages_owner_all" on messages
  for all using (
    chantier_id in (
      select c.id from chantiers c
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  )
  with check (
    chantier_id in (
      select c.id from chantiers c
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  );

create policy "photos_owner_all" on photos
  for all using (
    chantier_id in (
      select c.id from chantiers c
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  )
  with check (
    chantier_id in (
      select c.id from chantiers c
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  );

-- ━━━ STORAGE ━━━
-- Bucket pour les photos de chantier et les logos d'entreprise.
-- Les deux sont publics en lecture (les URLs sont déjà non devinables /
-- affichées uniquement sur les pages autorisées), mais l'écriture passe
-- uniquement par le client authentifié (dashboard) ou service_role.

insert into storage.buckets (id, name, public)
values ('chantier-photos', 'chantier-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "chantier_photos_public_read" on storage.objects
  for select using (bucket_id = 'chantier-photos');
create policy "chantier_photos_auth_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'chantier-photos');
create policy "chantier_photos_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'chantier-photos');

create policy "logos_public_read" on storage.objects
  for select using (bucket_id = 'logos');
create policy "logos_auth_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'logos');
create policy "logos_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'logos');
