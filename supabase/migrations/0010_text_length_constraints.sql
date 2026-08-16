-- Ajoute des contraintes CHECK de longueur sur les champs texte libres, qui
-- n'avaient jusqu'ici aucune limite en base. Limites choisies avec Arthur en
-- fonction de l'usage réel de chaque champ (voir conversation du 2026-08-16).
--
-- char_length() sur une valeur NULL renvoie NULL, et Postgres considère
-- qu'une contrainte CHECK dont l'expression vaut NULL est satisfaite — donc
-- ces contraintes n'imposent pas NOT NULL sur les colonnes déjà nullable.
--
-- Vérifié avant écriture : aucune ligne existante ne dépasse ces limites
-- (contrôlé en lecture seule sur la prod le 2026-08-16), donc l'ajout de ces
-- contraintes ne devrait pas échouer sur les données actuelles.

alter table entreprises
  add constraint entreprises_nom_length check (char_length(nom) <= 100),
  add constraint entreprises_email_length check (char_length(email) <= 254),
  add constraint entreprises_tel_length check (char_length(tel) <= 20),
  add constraint entreprises_google_maps_url_length check (char_length(google_maps_url) <= 500);

alter table chantiers
  add constraint chantiers_nom_client_length check (char_length(nom_client) <= 100),
  add constraint chantiers_email_client_length check (char_length(email_client) <= 254),
  add constraint chantiers_tel_client_length check (char_length(tel_client) <= 20),
  add constraint chantiers_adresse_length check (char_length(adresse) <= 200),
  add constraint chantiers_description_length check (char_length(description) <= 2000),
  add constraint chantiers_description_cloture_length check (char_length(description_cloture) <= 2000),
  add constraint chantiers_type_travaux_length check (char_length(type_travaux) <= 100);

alter table reclamations
  add constraint reclamations_sujet_length check (char_length(sujet) <= 100),
  add constraint reclamations_message_length check (char_length(message) <= 3000),
  add constraint reclamations_note_interne_length check (char_length(note_interne) <= 2000),
  add constraint reclamations_description_resolution_length check (char_length(description_resolution) <= 2000);

alter table messages
  add constraint messages_contenu_length check (char_length(contenu) <= 2000);

alter table photos
  add constraint photos_caption_length check (char_length(caption) <= 200);

alter table avis
  add constraint avis_commentaire_length check (char_length(commentaire) <= 1000);
