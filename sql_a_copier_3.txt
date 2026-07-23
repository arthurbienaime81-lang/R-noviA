-- RenovIA — lien Google Maps de l'entreprise (utilisé sur /avis/[token] pour
-- rediriger les avis ≥ 4 étoiles vers la fiche Google Maps de l'entreprise).

alter table entreprises
  add column if not exists google_maps_url text;
