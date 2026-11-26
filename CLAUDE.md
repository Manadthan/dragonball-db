# CLAUDE.md — Dragon Ball DB

Lu au début de chaque session. Résume le projet, la stack et les règles SDLC (identiques à `nintendo-db`).

## Objectif

Base de référence et suivi de collection **Dragon Ball** couvrant 5 catégories natives :
- `manga-livre` — Mangas, livres, artbooks & guides
- `video` — DVD / Blu-ray (anime, films, coffrets)
- `carte` — Cartes à collectionner (Carddass, Super Battle…)
- `jeu` — Jeux vidéo Dragon Ball
- `figurine` — Figurines & goodies

Compatible nativement avec `mon-site-sdlc` via le contrat **`GET /api/suivi`** (`Authorization: Bearer <SUIVI_API_TOKEN>`).
Mobile-first **iPhone 12 mini** (375 × 812), interface en **français**, thème clair/sombre automatique + bascule.

## Règles de travail (SDLC)

- **Jamais de commit ni push direct sur `main`.** Branche `feat/...` / `fix/...` → Conventional Commits → PR avec lien de prévisualisation Vercel (`https://dragonball-db-git-<branche>-manadthan.vercel.app`) → revue du propriétaire → merge par le propriétaire uniquement.
- Le propriétaire travaille depuis un **iPhone 12 mini** : réponses courtes, pas de commandes locales à lui faire taper.
- Prettier uniquement sur les `.ts`/`.tsx` modifiés (jamais sur `docs/*.md`).
- Le schéma évolue uniquement par `supabase/migrations/` ; `src/types/database.ts` est vérifié en CI contre `supabase gen types typescript --schema public | prettier`.
- Aucun secret dans le dépôt.

## Stack et commandes

Next.js 16 (App Router, TypeScript strict) · Tailwind 4 · Supabase (Postgres + RLS) · Vitest · Playwright · Vercel (`cdg1`).

```
npm run dev        # serveur local
npm run check      # lint + typecheck + tests unitaires
npm run build      # build de production
npm run e2e        # Playwright 375 × 812
npm run db:start   # base Supabase locale (Docker)
npm run db:test    # tests pgTAP
npm run db:types   # régénérer src/types/database.ts après une migration
```
