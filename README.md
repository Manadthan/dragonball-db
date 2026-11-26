# Dragon Ball DB

Base de référence et suivi de collection **Dragon Ball**, construite avec la même méthode SDLC et la même stack que [`nintendo-db`](https://github.com/Manadthan/nintendo-db).

## 5 catégories natives

- **Mangas & livres** (`manga-livre`) — mangas, artbooks, guides
- **DVD / Blu-ray** (`video`) — anime, films, coffrets
- **Cartes à collectionner** (`carte`) — Carddass, Super Battle…
- **Jeux vidéo** (`jeu`)
- **Figurines & goodies** (`figurine`)

## Base de données partagée avec `mon-site-sdlc`

Pour rester dans la limite gratuite Supabase (2 projets actifs), `dragonball-db` partage le projet Supabase de `mon-site-sdlc` en utilisant un **schéma Postgres isolé `dragonball`** :
1. Dans Supabase (`mon-site-sdlc`) → **Settings → Data API → Exposed schemas**, ajouter `dragonball`.
2. Dans GitHub (`dragonball-db`) → **Settings → Secrets → Actions**, renseigner `SUPABASE_ACCESS_TOKEN` et `SUPABASE_PROJECT_REF` (les mêmes que `mon-site-sdlc`) : le workflow `deploy-db.yml` applique les migrations dans `dragonball` sans toucher celles de `mon-site-sdlc`.
3. Dans Vercel (`dragonball-db`), reprendre les mêmes `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` et `SUPABASE_SECRET_KEY` que `mon-site-sdlc`, et définir `SUIVI_API_TOKEN`.

## Connexion à `mon-site-sdlc`

Expose nativement **`GET /api/suivi`** (`Authorization: Bearer <SUIVI_API_TOKEN>`) : il suffit de renseigner `DRAGONBALL_DB_URL` et `DRAGONBALL_DB_TOKEN` sur Vercel dans `mon-site-sdlc` (avec le même jeton que `SUIVI_API_TOKEN` ici) pour lier n'importe quelle URL filtrée.
