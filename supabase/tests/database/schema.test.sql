-- Tests pgTAP du socle Dragon Ball DB : tables, contraintes, RLS des objets et des possessions privées.
begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

select has_table('public', 'objets', 'table objets');
select has_table('public', 'profils', 'table profils');
select has_table('public', 'possessions', 'table possessions');
select is((select count(*)::int from public.objets), 5, '5 objets de départ (1 par catégorie)');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'proprietaire@test.local'),
  ('00000000-0000-0000-0000-0000000000b2', 'autre@test.local');
insert into public.profils (user_id, pseudo, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'Patron', 'proprietaire'),
  ('00000000-0000-0000-0000-0000000000b2', 'Vegeta', 'collectionneur');

-- Le propriétaire coche un objet et peut ajouter un objet.
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-0000000000a1", "role": "authenticated"}';
select lives_ok(
  $$insert into public.possessions (objet_id) select id from public.objets where slug = 'dragon-ball-tome-1-glenat'$$,
  'le propriétaire coche un objet'
);
select throws_ok(
  $$insert into public.possessions (objet_id) select id from public.objets where slug = 'dragon-ball-tome-1-glenat'$$,
  '23505', null, 'un objet ne se coche qu''une fois'
);
select lives_ok(
  $$insert into public.objets (slug, categorie, ere, marche, titre, editeur, annee)
    values ('dragon-ball-daima-blu-ray-fr', 'video', 'daima', 'FR', 'Dragon Ball Daima — Intégrale Blu-ray', 'Crunchyroll', 2026)$$,
  'le propriétaire peut ajouter un objet'
);

-- Un autre compte ne peut ni voir les possessions du propriétaire ni modifier le catalogue.
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-0000000000b2", "role": "authenticated"}';
select is_empty('select * from public.possessions', 'un autre compte ne voit pas les possessions');
select throws_ok(
  $$insert into public.objets (slug, categorie, ere, marche, titre)
    values ('objet-interdit', 'carte', 'dbs', 'JAP', 'Interdit')$$,
  '42501', null, 'un collectionneur ne peut pas écrire dans objets'
);

-- Un visiteur voit le catalogue public mais jamais les possessions.
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';
select is_empty('select * from public.possessions', 'un visiteur ne voit pas les possessions');

select * from finish();
rollback;
