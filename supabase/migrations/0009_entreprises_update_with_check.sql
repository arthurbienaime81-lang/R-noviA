-- Ajoute une clause WITH CHECK explicite à entreprises_self_update.
-- La policy d'origine (0001_init.sql) n'avait qu'un USING : PostgreSQL
-- réutilise alors implicitement cette même expression comme check sur la
-- ligne résultante d'un UPDATE, donc le comportement ne change pas — mais
-- rendre le check explicite évite de dépendre de ce repli implicite si la
-- policy évolue un jour (ex. ajout d'une policy permissive supplémentaire).
drop policy "entreprises_self_update" on entreprises;

create policy "entreprises_self_update" on entreprises
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
