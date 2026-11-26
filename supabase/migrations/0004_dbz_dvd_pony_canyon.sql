-- Catalogue des 49 DVD japonais individuels Dragon Ball Z (Pony Canyon, nov. 2005 – fév. 2007).
-- Références PCBC-50781 à PCBC-50829, intégrale des 291 épisodes, couvertures par Tadayoshi Yamamuro.
-- Idempotent : met à jour les métadonnées éditoriales sans écraser image_path.

update dragonball.objets
set
  edition = 'Dragon Box',
  numero = 1,
  date_sortie = '2003-03-19',
  details = 'Coffret DVD Dragon Box Z Vol. 1 · Épisodes 1 à 147 · 4:3 · NTSC Région 2'
where slug = 'dbz-dragon-box-dvd-jap';

insert into dragonball.objets (
  slug, categorie, ere, marche, titre, titre_original, editeur, edition, numero, annee, date_sortie, reference, details, lien_officiel
) values
  ('dbz-dvd-jp-01', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #1', 'DRAGON BALL Z #1', 'Pony Canyon', 'DVD individuels', 1, 2005, '2005-11-02', 'PCBC-50781', 'Épisodes 1 à 6 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-02', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #2', 'DRAGON BALL Z #2', 'Pony Canyon', 'DVD individuels', 2, 2005, '2005-11-02', 'PCBC-50782', 'Épisodes 7 à 12 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-03', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #3', 'DRAGON BALL Z #3', 'Pony Canyon', 'DVD individuels', 3, 2005, '2005-11-02', 'PCBC-50783', 'Épisodes 13 à 18 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-04', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #4', 'DRAGON BALL Z #4', 'Pony Canyon', 'DVD individuels', 4, 2005, '2005-12-07', 'PCBC-50784', 'Épisodes 19 à 24 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-05', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #5', 'DRAGON BALL Z #5', 'Pony Canyon', 'DVD individuels', 5, 2005, '2005-12-07', 'PCBC-50785', 'Épisodes 25 à 30 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-06', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #6', 'DRAGON BALL Z #6', 'Pony Canyon', 'DVD individuels', 6, 2005, '2005-12-07', 'PCBC-50786', 'Épisodes 31 à 36 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', 'https://www.ponycanyon.co.jp/visual/PCBC000050786'),
  ('dbz-dvd-jp-07', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #7', 'DRAGON BALL Z #7', 'Pony Canyon', 'DVD individuels', 7, 2006, '2006-01-11', 'PCBC-50787', 'Épisodes 37 à 42 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-08', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #8', 'DRAGON BALL Z #8', 'Pony Canyon', 'DVD individuels', 8, 2006, '2006-01-11', 'PCBC-50788', 'Épisodes 43 à 48 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-09', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #9', 'DRAGON BALL Z #9', 'Pony Canyon', 'DVD individuels', 9, 2006, '2006-01-11', 'PCBC-50789', 'Épisodes 49 à 54 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-10', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #10', 'DRAGON BALL Z #10', 'Pony Canyon', 'DVD individuels', 10, 2006, '2006-02-01', 'PCBC-50790', 'Épisodes 55 à 60 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-11', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #11', 'DRAGON BALL Z #11', 'Pony Canyon', 'DVD individuels', 11, 2006, '2006-02-01', 'PCBC-50791', 'Épisodes 61 à 66 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-12', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #12', 'DRAGON BALL Z #12', 'Pony Canyon', 'DVD individuels', 12, 2006, '2006-02-01', 'PCBC-50792', 'Épisodes 67 à 72 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-13', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #13', 'DRAGON BALL Z #13', 'Pony Canyon', 'DVD individuels', 13, 2006, '2006-03-01', 'PCBC-50793', 'Épisodes 73 à 78 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-14', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #14', 'DRAGON BALL Z #14', 'Pony Canyon', 'DVD individuels', 14, 2006, '2006-03-01', 'PCBC-50794', 'Épisodes 79 à 84 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-15', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #15', 'DRAGON BALL Z #15', 'Pony Canyon', 'DVD individuels', 15, 2006, '2006-03-01', 'PCBC-50795', 'Épisodes 85 à 90 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-16', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #16', 'DRAGON BALL Z #16', 'Pony Canyon', 'DVD individuels', 16, 2006, '2006-04-05', 'PCBC-50796', 'Épisodes 91 à 96 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-17', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #17', 'DRAGON BALL Z #17', 'Pony Canyon', 'DVD individuels', 17, 2006, '2006-04-05', 'PCBC-50797', 'Épisodes 97 à 102 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-18', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #18', 'DRAGON BALL Z #18', 'Pony Canyon', 'DVD individuels', 18, 2006, '2006-04-05', 'PCBC-50798', 'Épisodes 103 à 108 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-19', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #19', 'DRAGON BALL Z #19', 'Pony Canyon', 'DVD individuels', 19, 2006, '2006-04-26', 'PCBC-50799', 'Épisodes 109 à 114 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-20', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #20', 'DRAGON BALL Z #20', 'Pony Canyon', 'DVD individuels', 20, 2006, '2006-04-26', 'PCBC-50800', 'Épisodes 115 à 120 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-21', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #21', 'DRAGON BALL Z #21', 'Pony Canyon', 'DVD individuels', 21, 2006, '2006-04-26', 'PCBC-50801', 'Épisodes 121 à 126 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-22', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #22', 'DRAGON BALL Z #22', 'Pony Canyon', 'DVD individuels', 22, 2006, '2006-06-07', 'PCBC-50802', 'Épisodes 127 à 132 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-23', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #23', 'DRAGON BALL Z #23', 'Pony Canyon', 'DVD individuels', 23, 2006, '2006-06-07', 'PCBC-50803', 'Épisodes 133 à 137 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-24', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #24', 'DRAGON BALL Z #24', 'Pony Canyon', 'DVD individuels', 24, 2006, '2006-06-07', 'PCBC-50804', 'Épisodes 138 à 142 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-25', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #25', 'DRAGON BALL Z #25', 'Pony Canyon', 'DVD individuels', 25, 2006, '2006-07-05', 'PCBC-50805', 'Épisodes 143 à 147 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-26', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #26', 'DRAGON BALL Z #26', 'Pony Canyon', 'DVD individuels', 26, 2006, '2006-07-05', 'PCBC-50806', 'Épisodes 148 à 153 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-27', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #27', 'DRAGON BALL Z #27', 'Pony Canyon', 'DVD individuels', 27, 2006, '2006-07-05', 'PCBC-50807', 'Épisodes 154 à 159 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-28', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #28', 'DRAGON BALL Z #28', 'Pony Canyon', 'DVD individuels', 28, 2006, '2006-08-02', 'PCBC-50808', 'Épisodes 160 à 165 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-29', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #29', 'DRAGON BALL Z #29', 'Pony Canyon', 'DVD individuels', 29, 2006, '2006-08-02', 'PCBC-50809', 'Épisodes 166 à 171 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-30', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #30', 'DRAGON BALL Z #30', 'Pony Canyon', 'DVD individuels', 30, 2006, '2006-08-02', 'PCBC-50810', 'Épisodes 172 à 177 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-31', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #31', 'DRAGON BALL Z #31', 'Pony Canyon', 'DVD individuels', 31, 2006, '2006-09-06', 'PCBC-50811', 'Épisodes 178 à 183 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-32', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #32', 'DRAGON BALL Z #32', 'Pony Canyon', 'DVD individuels', 32, 2006, '2006-09-06', 'PCBC-50812', 'Épisodes 184 à 189 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-33', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #33', 'DRAGON BALL Z #33', 'Pony Canyon', 'DVD individuels', 33, 2006, '2006-09-06', 'PCBC-50813', 'Épisodes 190 à 195 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-34', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #34', 'DRAGON BALL Z #34', 'Pony Canyon', 'DVD individuels', 34, 2006, '2006-10-04', 'PCBC-50814', 'Épisodes 196 à 201 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-35', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #35', 'DRAGON BALL Z #35', 'Pony Canyon', 'DVD individuels', 35, 2006, '2006-10-04', 'PCBC-50815', 'Épisodes 202 à 207 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-36', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #36', 'DRAGON BALL Z #36', 'Pony Canyon', 'DVD individuels', 36, 2006, '2006-10-04', 'PCBC-50816', 'Épisodes 208 à 213 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-37', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #37', 'DRAGON BALL Z #37', 'Pony Canyon', 'DVD individuels', 37, 2006, '2006-11-01', 'PCBC-50817', 'Épisodes 214 à 219 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-38', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #38', 'DRAGON BALL Z #38', 'Pony Canyon', 'DVD individuels', 38, 2006, '2006-11-01', 'PCBC-50818', 'Épisodes 220 à 225 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-39', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #39', 'DRAGON BALL Z #39', 'Pony Canyon', 'DVD individuels', 39, 2006, '2006-11-01', 'PCBC-50819', 'Épisodes 226 à 231 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-40', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #40', 'DRAGON BALL Z #40', 'Pony Canyon', 'DVD individuels', 40, 2006, '2006-12-06', 'PCBC-50820', 'Épisodes 232 à 237 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-41', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #41', 'DRAGON BALL Z #41', 'Pony Canyon', 'DVD individuels', 41, 2006, '2006-12-06', 'PCBC-50821', 'Épisodes 238 à 243 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-42', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #42', 'DRAGON BALL Z #42', 'Pony Canyon', 'DVD individuels', 42, 2006, '2006-12-06', 'PCBC-50822', 'Épisodes 244 à 249 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-43', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #43', 'DRAGON BALL Z #43', 'Pony Canyon', 'DVD individuels', 43, 2007, '2007-01-10', 'PCBC-50823', 'Épisodes 250 à 255 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-44', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #44', 'DRAGON BALL Z #44', 'Pony Canyon', 'DVD individuels', 44, 2007, '2007-01-10', 'PCBC-50824', 'Épisodes 256 à 261 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-45', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #45', 'DRAGON BALL Z #45', 'Pony Canyon', 'DVD individuels', 45, 2007, '2007-01-10', 'PCBC-50825', 'Épisodes 262 à 267 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-46', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #46', 'DRAGON BALL Z #46', 'Pony Canyon', 'DVD individuels', 46, 2007, '2007-02-07', 'PCBC-50826', 'Épisodes 268 à 273 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', 'https://www.ponycanyon.co.jp/visual/PCBC000050826'),
  ('dbz-dvd-jp-47', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #47', 'DRAGON BALL Z #47', 'Pony Canyon', 'DVD individuels', 47, 2007, '2007-02-07', 'PCBC-50827', 'Épisodes 274 à 279 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-48', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #48', 'DRAGON BALL Z #48', 'Pony Canyon', 'DVD individuels', 48, 2007, '2007-02-07', 'PCBC-50828', 'Épisodes 280 à 285 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null),
  ('dbz-dvd-jp-49', 'video', 'dbz', 'JAP', 'Dragon Ball Z — DVD #49', 'DRAGON BALL Z #49', 'Pony Canyon', 'DVD individuels', 49, 2007, '2007-02-07', 'PCBC-50829', 'Épisodes 286 à 291 · 4:3 · NTSC Région 2 · Super Jewel Box · Couverture : Tadayoshi Yamamuro', null)
on conflict (slug) do update set
  titre = excluded.titre,
  titre_original = excluded.titre_original,
  editeur = excluded.editeur,
  edition = excluded.edition,
  numero = excluded.numero,
  annee = excluded.annee,
  date_sortie = excluded.date_sortie,
  reference = excluded.reference,
  details = excluded.details,
  lien_officiel = excluded.lien_officiel;
