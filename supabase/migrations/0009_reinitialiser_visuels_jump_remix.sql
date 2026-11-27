-- Réinitialise image_path des 25 Anime Comics Shueisha Jump Remix importés avec le mauvais suffixe (*w.webp)
-- afin de déclencher automatiquement leur réimport au format `{base}-{taille}.webp` via `import-visuels.yml`.

update dragonball.objets
set image_path = null,
    updated_at = now()
where categorie = 'manga-livre'
  and editeur = 'Shueisha (Jump Remix)'
  and marche = 'JAP'
  and image_path like '%-v1';
