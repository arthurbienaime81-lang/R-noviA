-- RenovIA — durcissement : rate limiting sur la connexion.
--
-- Table de bookkeeping pure (aucune donnée métier) utilisée par
-- src/app/login/actions.ts pour plafonner le nombre de tentatives de
-- connexion par email sur une fenêtre glissante. RLS activée sans aucune
-- policy (deny-by-default) : ni anon ni authenticated n'ont besoin d'y
-- accéder directement, seul le client service_role (qui contourne RLS)
-- l'utilise depuis la Server Action de login.

create table if not exists login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_email_idx on login_attempts (email, created_at);

alter table login_attempts enable row level security;
