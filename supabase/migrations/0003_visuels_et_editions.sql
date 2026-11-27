-- Visuels (bucket Storage dédié), éditions, numérotation naturelle, dates exactes et liens officiels.
-- Reste strictement isolé dans le schéma `dragonball` et le bucket `dragonball-visuels`
-- (aucune interférence avec le schéma `public` ni le bucket `items` de `mon-site-sdlc`).

alter table dragonball.objets
  add column edition text,
  add column numero integer
    constraint objets_numero_positif check (numero is null or numero > 0),
  add column date_sortie date,
  add column details text,
  add column lien_officiel text
    constraint objets_lien_officiel_format check (lien_officiel is null or lien_officiel ~ '^https?://'),
  add column image_path text
    constraint objets_image_path_format check (image_path is null or image_path ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

comment on column dragonball.objets.edition is
  'Nom de la collection ou édition homogène (ex. DVD individuels, Dragon Box) ; filtrable par ?edition=.';
comment on column dragonball.objets.numero is
  'Numéro d''ordre dans la collection ou l''édition (tri numérique naturel #1, #2, …, #49).';
comment on column dragonball.objets.date_sortie is
  'Date exacte de sortie commerciale (YYYY-MM-DD).';
comment on column dragonball.objets.details is
  'Informations éditoriales complémentaires (épisodes inclus, format, illustrateur…).';
comment on column dragonball.objets.lien_officiel is
  'Lien vers la page officielle éditeur (vérifiée en ligne).';
comment on column dragonball.objets.image_path is
  'Base versionnée dans le bucket public dragonball-visuels (ex. dbz-dvd-jp-01-v1 → -300.webp et -680.webp).';

create index objets_edition_idx on dragonball.objets (edition);

-- Bucket public dédié aux jaquettes et visuels de Dragon Ball DB (WebP 1 Mo max, écriture réservée au propriétaire).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dragonball-visuels', 'dragonball-visuels', true, 1048576, array['image/webp'])
on conflict (id) do nothing;

create policy "dragonball-visuels : lecture proprietaire" on storage.objects
  for select to authenticated
  using (bucket_id = 'dragonball-visuels' and (select dragonball.est_proprietaire()));
create policy "dragonball-visuels : ajout proprietaire" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'dragonball-visuels' and (select dragonball.est_proprietaire()));
create policy "dragonball-visuels : remplacement proprietaire" on storage.objects
  for update to authenticated
  using (bucket_id = 'dragonball-visuels' and (select dragonball.est_proprietaire()))
  with check (bucket_id = 'dragonball-visuels' and (select dragonball.est_proprietaire()));
create policy "dragonball-visuels : suppression proprietaire" on storage.objects
  for delete to authenticated
  using (bucket_id = 'dragonball-visuels' and (select dragonball.est_proprietaire()));
