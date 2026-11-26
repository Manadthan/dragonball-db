# Dragon Ball DB

Base de référence et suivi de collection **Dragon Ball**, construite avec la même méthode SDLC et la même stack que [`nintendo-db`](https://github.com/Manadthan/nintendo-db).

## 5 catégories natives

- **Mangas & livres** (`manga-livre`) — mangas, artbooks, guides
- **DVD / Blu-ray** (`video`) — anime, films, coffrets
- **Cartes à collectionner** (`carte`) — Carddass, Super Battle…
- **Jeux vidéo** (`jeu`)
- **Figurines & goodies** (`figurine`)

## Connexion à `mon-site-sdlc`

Expose nativement **`GET /api/suivi`** (`Authorization: Bearer <SUIVI_API_TOKEN>`) : il suffit de renseigner `DRAGONBALL_DB_URL` et `DRAGONBALL_DB_TOKEN` sur Vercel dans `mon-site-sdlc` (avec le même jeton que `SUIVI_API_TOKEN` ici) pour lier n'importe quelle URL filtrée.
