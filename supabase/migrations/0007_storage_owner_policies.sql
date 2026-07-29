-- RenovIA — durcissement : policies storage scopées par propriétaire.
--
-- Audit de sécurité 2026-07 : les policies d'écriture/suppression sur
-- storage.objects ne vérifiaient que bucket_id, pas que l'objet appartienne
-- bien au chantier/entreprise de l'appelant authentifié. N'importe quel
-- compte RenovIA authentifié pouvait donc théoriquement écrire/supprimer un
-- objet appartenant à une autre entreprise, à condition de connaître son
-- chemin exact (chantier_id/reclamation_id/entreprise_id, non énumérables
-- depuis l'UI mais pas non plus vérifiés). Cette migration referme ce trou
-- en vérifiant le premier segment du chemin (storage.foldername) contre la
-- chaîne de propriété réelle, via les mêmes jointures que les policies RLS
-- déjà en place sur les tables. Les pages publiques (/chantier/[token],
-- /avis/[token]) ne sont pas concernées : elles écrivent via le client
-- service_role, qui contourne systématiquement RLS.

-- ━━━ chantier-photos : premier segment = chantiers.id ━━━

drop policy if exists "chantier_photos_auth_write" on storage.objects;
drop policy if exists "chantier_photos_auth_delete" on storage.objects;

create policy "chantier_photos_owner_write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'chantier-photos'
    and (storage.foldername(name))[1]::uuid in (
      select c.id from chantiers c
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  );

create policy "chantier_photos_owner_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'chantier-photos'
    and (storage.foldername(name))[1]::uuid in (
      select c.id from chantiers c
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  );

-- ━━━ logos : premier segment = entreprises.id ━━━

drop policy if exists "logos_auth_write" on storage.objects;
drop policy if exists "logos_auth_update" on storage.objects;

create policy "logos_owner_write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1]::uuid in (
      select id from entreprises where user_id = auth.uid()
    )
  );

create policy "logos_owner_update" on storage.objects
  for update to authenticated using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1]::uuid in (
      select id from entreprises where user_id = auth.uid()
    )
  );

-- ━━━ reclamation-photos : premier segment = reclamations.id ━━━
-- (uniquement le cas où le tableau de bord entreprise envoie lui-même une
-- photo "après intervention" avec sa propre session ; les photos jointes
-- par le client passent par service_role, hors RLS)

drop policy if exists "reclamation_photos_auth_write" on storage.objects;
drop policy if exists "reclamation_photos_auth_delete" on storage.objects;

create policy "reclamation_photos_owner_write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'reclamation-photos'
    and (storage.foldername(name))[1]::uuid in (
      select r.id from reclamations r
      join chantiers c on c.id = r.chantier_id
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  );

create policy "reclamation_photos_owner_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'reclamation-photos'
    and (storage.foldername(name))[1]::uuid in (
      select r.id from reclamations r
      join chantiers c on c.id = r.chantier_id
      join entreprises e on e.id = c.entreprise_id
      where e.user_id = auth.uid()
    )
  );
