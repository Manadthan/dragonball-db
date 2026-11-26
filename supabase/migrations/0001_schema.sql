-- Socle Dragon Ball DB : 5 catégories natives, filtres (ère, marché, éditeur, année), rôles et possessions privées.
create type public.categorie_objet as enum (
  'manga-livre',
  'video',
  'carte',
  'jeu',
  'figurine'
);

create type public.ere_db as enum (
  'dragon-ball',
  'dbz',
  'dbgt',
  'dbs',
  'daima',
  'films'
);

create type public.marche as enum ('FR', 'JAP', 'US');

create type public.role_compte as enum ('proprietaire', 'collectionneur');

create table public.profils (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pseudo  text not null unique,
  role    public.role_compte not null default 'collectionneur',
  cree_le timestamptz not null default now()
);

create or replace function public.est_proprietaire()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profils
    where user_id = (select auth.uid()) and role = 'proprietaire'
  );
$$;

create table public.objets (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique
    constraint objets_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 140),
  categorie      public.categorie_objet not null,
  ere            public.ere_db not null,
  marche         public.marche not null,
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

create index objets_categorie_idx on public.objets (categorie);
create index objets_ere_idx on public.objets (ere);
create index objets_marche_idx on public.objets (marche);

create table public.possessions (
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  objet_id uuid not null references public.objets (id) on delete cascade,
  cree_le  timestamptz not null default now(),
  primary key (user_id, objet_id)
);

-- RLS
alter table public.profils enable row level security;
alter table public.objets enable row level security;
alter table public.possessions enable row level security;

create policy "profils : lecture de sa ligne" on public.profils
  for select to authenticated using (user_id = (select auth.uid()));

create policy "objets : lecture publique" on public.objets
  for select to anon, authenticated using (true);
create policy "objets : ajout par le proprietaire" on public.objets
  for insert to authenticated with check ((select public.est_proprietaire()));
create policy "objets : modification par le proprietaire" on public.objets
  for update to authenticated using ((select public.est_proprietaire())) with check ((select public.est_proprietaire()));
create policy "objets : suppression par le proprietaire" on public.objets
  for delete to authenticated using ((select public.est_proprietaire()));

create policy "possessions : lecture de ses lignes" on public.possessions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "possessions : ajout de ses lignes" on public.possessions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "possessions : retrait de ses lignes" on public.possessions
  for delete to authenticated using (user_id = (select auth.uid()));
