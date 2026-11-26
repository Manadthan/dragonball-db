-- Socle Dragon Ball DB dans un schéma dédié `dragonball` : permet de partager le projet Supabase de `nintendo-db`
-- sans aucun conflit de tables, d'enums ou de migrations, tout en restant 100 % autonome en CI locale.
create schema if not exists dragonball;

grant usage on schema dragonball to anon, authenticated, service_role;
alter default privileges for role postgres in schema dragonball
  grant all on tables to service_role;
alter default privileges for role postgres in schema dragonball
  grant all on routines to service_role;
alter default privileges for role postgres in schema dragonball
  grant all on sequences to service_role;

create type dragonball.categorie_objet as enum (
  'manga-livre',
  'video',
  'carte',
  'jeu',
  'figurine'
);

create type dragonball.ere_db as enum (
  'dragon-ball',
  'dbz',
  'dbgt',
  'dbs',
  'daima',
  'films'
);

create type dragonball.marche as enum ('FR', 'JAP', 'US');

create type dragonball.role_compte as enum ('proprietaire', 'collectionneur');

create table dragonball.profils (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pseudo  text not null unique,
  role    dragonball.role_compte not null default 'collectionneur',
  cree_le timestamptz not null default now()
);

create or replace function dragonball.est_proprietaire()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from dragonball.profils
    where user_id = (select auth.uid()) and role = 'proprietaire'
  );
$$;

-- Si la base partagée (mon-site-sdlc, mono-utilisateur) contient déjà un unique compte, l'enregistre comme propriétaire.
do $$
begin
  if (select count(*) from auth.users) = 1 then
    insert into dragonball.profils (user_id, pseudo, role)
    select id, 'proprietaire', 'proprietaire'
    from auth.users
    on conflict (user_id) do nothing;
  end if;
end $$;

create table dragonball.objets (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique
    constraint objets_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 140),
  categorie      dragonball.categorie_objet not null,
  ere            dragonball.ere_db not null,
  marche         dragonball.marche not null,
  titre          text not null
    constraint objets_titre_non_vide check (char_length(btrim(titre)) > 0),
  titre_original text,
  editeur        text,
  annee          integer
    constraint objets_annee_valide check (annee is null or (annee between 1984 and 2100)),
  reference      text,
  image_url      text
    constraint objets_image_url_format check (image_url is null or image_url ~ '^https?://'),
  cree_le        timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index objets_categorie_idx on dragonball.objets (categorie);
create index objets_ere_idx on dragonball.objets (ere);
create index objets_marche_idx on dragonball.objets (marche);

create table dragonball.possessions (
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  objet_id uuid not null references dragonball.objets (id) on delete cascade,
  cree_le  timestamptz not null default now(),
  primary key (user_id, objet_id)
);

-- Droits SQL explicites pour schéma personnalisé (la RLS filtre ensuite chaque ligne).
grant all on all tables in schema dragonball to service_role;
grant all on all routines in schema dragonball to service_role;
grant all on all sequences in schema dragonball to service_role;

grant select on dragonball.objets to anon, authenticated;
grant insert, update, delete on dragonball.objets to authenticated;
grant select, insert, delete on dragonball.possessions to authenticated;
grant select on dragonball.profils to authenticated;
grant execute on function dragonball.est_proprietaire() to authenticated;

-- RLS
alter table dragonball.profils enable row level security;
alter table dragonball.objets enable row level security;
alter table dragonball.possessions enable row level security;

create policy "profils : lecture de sa ligne" on dragonball.profils
  for select to authenticated using (user_id = (select auth.uid()));

create policy "objets : lecture publique" on dragonball.objets
  for select to anon, authenticated using (true);
create policy "objets : ajout par le proprietaire" on dragonball.objets
  for insert to authenticated with check ((select dragonball.est_proprietaire()));
create policy "objets : modification par le proprietaire" on dragonball.objets
  for update to authenticated using ((select dragonball.est_proprietaire())) with check ((select dragonball.est_proprietaire()));
create policy "objets : suppression par le proprietaire" on dragonball.objets
  for delete to authenticated using ((select dragonball.est_proprietaire()));

create policy "possessions : lecture de ses lignes" on dragonball.possessions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "possessions : ajout de ses lignes" on dragonball.possessions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "possessions : retrait de ses lignes" on dragonball.possessions
  for delete to authenticated using (user_id = (select auth.uid()));
