-- Données de départ : un objet emblématique par famille pour vérifier le catalogue et /api/suivi.
insert into dragonball.objets (slug, categorie, ere, marche, titre, titre_original, editeur, annee, reference) values
  ('dragon-ball-tome-1-glenat', 'manga-livre', 'dragon-ball', 'FR', 'Dragon Ball — Tome 1 : Sangoku', 'ドラゴンボール 1', 'Glénat', 1993, '9782723418560'),
  ('dbz-dragon-box-dvd-jap', 'video', 'dbz', 'JAP', 'Dragon Ball Z — Dragon Box Vol. 1', 'DRAGON BALL Z DVD-BOX DRAGON BOX Z編 VOL.1', 'Pony Canyon', 2003, 'PCBC-50368'),
  ('carddass-hondan-part-1-n1', 'carte', 'dragon-ball', 'JAP', 'Carddass Hondan Part 1 — N°1 Son Goku', 'カードダス ドラゴンボール 本弾 1弾 No.1', 'Bandai', 1988, 'DP-01-001'),
  ('dbz-budokai-tenkaichi-3-wii-fr', 'jeu', 'dbz', 'FR', 'Dragon Ball Z: Budokai Tenkaichi 3', 'ドラゴンボールZ Sparking! METEOR', 'Atari / Bandai Namco', 2008, 'RVL-RDSP-EUR'),
  ('shfiguarts-son-goku-saiyan-raised-on-earth', 'figurine', 'dbz', 'FR', 'S.H.Figuarts Son Goku — A Saiyan Raised on Earth', 'S.H.Figuarts 孫悟空-地球育ちのサイヤ人-', 'Tamashii Nations', 2018, '4573102550132')
on conflict (slug) do nothing;
