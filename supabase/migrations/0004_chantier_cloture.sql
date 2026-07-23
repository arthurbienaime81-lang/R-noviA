-- RenovIA — clôture de chantier avec preuve photo + fenêtre de contestation
-- (même principe que la clôture des réclamations : progression calculée à
-- partir des étapes, clôture manuelle obligatoire avec description + photo,
-- 72h de contestation client).

alter table chantiers
  add column if not exists description_cloture text,
  add column if not exists photo_cloture_url text,
  add column if not exists date_cloture timestamptz,
  add column if not exists date_limite_contestation timestamptz;

alter table chantiers drop constraint if exists chantiers_statut_check;
alter table chantiers add constraint chantiers_statut_check
  check (statut in ('en_cours', 'termine', 'en_retard', 'conteste'));
