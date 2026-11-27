-- Tests pgTAP du socle Dragon Ball DB (schéma dédié `dragonball`) : tables, droits, RLS et possessions privées.
begin;
create extension if not exists pgtap with schema extensions;
select plan(15);

select has_table('dragonball', 'objets', 'table dragonball.objets');
select has_table('dragonball', 'profils', 'table dragonball.profils');
select has_table('dragonball', 'possessions', 'table dragonball.possessions');
select is((select count(*)::int from dragonball.objets), 54, '54 objets (5 de départ + 49 DVD DBZ Pony Canyon)');
select is(
  (select count(*)::int from dragonball.objets where edition = 'DVD individuels' and editeur = 'Pony Canyon'),
  49,
  '49 DVD individuels Dragon Ball Z Pony Canyon'
);
select is(
  (select public from storage.buckets where id = 'dragonball-visuels'),
  true,
  'bucket public dragonball-visuels créé'
);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'proprietaire@test.local'),
  ('00000000-0000-0000-0000-0000000000b2', 'autre@test.local');
insert into dragonball.profils (user_id, pseudo, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'Patron', 'proprietaire'),
  ('00000000-0000-0000-0000-0000000000b2', 'Vegeta', 'collectionneur');

-- Le propriétaire coche un objet et peut ajouter un objet.
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-0000000000a1", "role": "authenticated"}';
select lives_ok(
  $$insert into dragonball.possessions (objet_id) select id from dragonball.objets where slug = 'dragon-ball-tome-1-glenat'$$,
  'le propriétaire coche un objet'
);
select throws_ok(
  $$insert into dragonball.possessions (objet_id) select id from dragonball.objets where slug = 'dragon-ball-tome-1-glenat'$$,
  '23505', null, 'un objet ne se coche qu''une fois'
);
select lives_ok(
  $$insert into dragonball.objets (slug, categorie, ere, marche, titre, editeur, annee, image_path, lien_officiel)
    values ('dragon-ball-daima-blu-ray-fr', 'video', 'daima', 'FR', 'Dragon Ball Daima — Intégrale Blu-ray', 'Crunchyroll', 2026, 'dragon-ball-daima-v1', 'https://example.com/daima')$$,
  'le propriétaire peut ajouter un objet avec visuel et lien officiel'
);
select throws_ok(
  $$insert into dragonball.objets (slug, categorie, ere, marche, titre, image_path)
    values ('visuel-invalide', 'video', 'dbz', 'JAP', 'Invalide', '../hack')$$,
  '23514', null, 'image_path rejette les chemins hors format'
);
select throws_ok(
  $$insert into dragonball.objets (slug, categorie, ere, marche, titre, lien_officiel)
    values ('lien-invalide', 'video', 'dbz', 'JAP', 'Invalide', 'javascript:alert(1)')$$,
  '23514', null, 'lien_officiel exige http(s)://'
);

-- Un autre compte ne peut ni voir les possessions du propriétaire ni modifier le catalogue.
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-0000000000b2", "role": "authenticated"}';
select is_empty('select * from dragonball.possessions', 'un autre compte ne voit pas les possessions');
select throws_ok(
  $$insert into dragonball.objets (slug, categorie, ere, marche, titre)
    values ('objet-interdit', 'carte', 'dbs', 'JAP', 'Interdit')$$,
  '42501', null, 'un collectionneur ne peut pas écrire dans objets'
);

-- Un visiteur voit le catalogue public mais ne peut pas lire les possessions.
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select is((select count(*)::int from dragonball.objets), 55, 'un visiteur lit le catalogue public');
select throws_ok(
  $$select * from dragonball.possessions$$,
  '42501', null, 'un visiteur n''a aucun accès à dragonball.possessions'
);

select * from finish();
rollback;
