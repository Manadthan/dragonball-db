// Import des couvertures officielles des 25 Dragon Ball Anime Comics — Shueisha Jump Remix (SJR)
// vers le bucket public `dragonball-visuels` (WebP 300w + 680w).
//
// Usages :
//   node scripts/jaquettes-jump-remix.mjs --ecrire             (importe les couvertures manquantes)
//   node scripts/jaquettes-jump-remix.mjs --ecrire --forcer    (remplace aussi les couvertures déjà présentes)
//
// Variables requises :
//   SUPABASE_URL (ou SUPABASE_PROJECT_REF) + SUPABASE_SECRET_KEY (ou SUPABASE_ACCESS_TOKEN via API Management)

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "dragonball-visuels";
const TAILLES = [300, 680];
const CONCURRENCE = 4;
const __dir = dirname(fileURLToPath(import.meta.url));
const manifeste = JSON.parse(
  readFileSync(join(__dir, "data", "jump-remix-couvertures.json"), "utf8"),
);

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

function isbn13Vers10(isbn13) {
  const corps = isbn13.slice(3, 12);
  let somme = 0;
  for (let i = 0; i < 9; i++) somme += Number(corps[i]) * (10 - i);
  const reste = 11 - (somme % 11);
  return corps + (reste === 10 ? "X" : reste === 11 ? "0" : String(reste));
}

async function resoudreConfigSupabase() {
  const ref = process.env.SUPABASE_PROJECT_REF?.trim();
  const url = (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    (ref ? `https://${ref}.supabase.co` : "")
  ).replace(/\/+$/, "");

  let secretKey = process.env.SUPABASE_SECRET_KEY?.trim() || "";
  if (!secretKey && ref && process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN.trim()}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error(
        `API Management Supabase (api-keys) HTTP ${res.status}`,
      );
    }
    const cles = await res.json();
    const cle =
      cles.find((k) => k.type === "secret" && k.api_key) ??
      cles.find((k) => k.name === "service_role" && k.api_key);
    secretKey = cle?.api_key ?? "";
    if (secretKey && process.env.GITHUB_ACTIONS === "true") {
      console.log(`::add-mask::${secretKey}`);
    }
  }

  if (!url || !secretKey) {
    throw new Error(
      "Variables Supabase requises : SUPABASE_URL (ou SUPABASE_PROJECT_REF) et SUPABASE_SECRET_KEY (ou SUPABASE_ACCESS_TOKEN).",
    );
  }
  return { url, secretKey };
}

function candidatsPourIsbn(isbn) {
  const propre = (isbn ?? "").replace(/[^0-9]/g, "");
  if (propre.length !== 13) return [];
  const i10 = isbn13Vers10(propre);
  const entree = manifeste[propre];
  const listeManifeste = Array.isArray(entree)
    ? entree
    : entree
      ? [entree]
      : [];
  return [
    ...new Set(
      [
        ...listeManifeste,
        `https://dosbg3xlm0x1t.cloudfront.net/images/items/${propre}/1200/${propre}.jpg`,
        `https://shop.r10s.jp/book/cabinet/${propre.slice(-4)}/${propre}.jpg`,
        `https://images-fe.ssl-images-amazon.com/images/P/${i10}.09._SCLZZZZZZZ_.jpg`,
      ].filter(Boolean),
    ),
  ];
}

async function telechargerCouverture(isbn, slug) {
  const candidats = candidatsPourIsbn(isbn);
  let erreur = "aucune source";
  for (const cible of candidats) {
    for (let essai = 1; essai <= 3; essai++) {
      const res = await fetch(cible, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; dragonball-db/1.0)" },
        signal: AbortSignal.timeout(15_000),
      }).catch((e) => ({ ok: false, status: e.message }));
      if (!res.ok) {
        erreur = `HTTP ${res.status} (${cible})`;
        if (essai < 3 && res.status !== 404) {
          await pause(1000 * essai);
          continue;
        }
        break;
      }
      const octets = Buffer.from(await res.arrayBuffer());
      if (octets.length < 1500) {
        erreur = `image vide (${octets.length} o)`;
        break;
      }
      const meta = await sharp(octets).metadata().catch(() => null);
      if (
        !meta?.width ||
        !meta?.height ||
        meta.width < 80 ||
        meta.height < 120
      ) {
        erreur = `dimensions invalides (${meta?.width}x${meta?.height})`;
        break;
      }
      return { octets, width: meta.width, height: meta.height };
    }
  }
  throw new Error(`${slug} (${isbn}) : ${erreur}`);
}

async function televerserAvecReessai(supabase, chemin, webp) {
  let dernierErreur = null;
  for (let essai = 1; essai <= 4; essai++) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(chemin, webp, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });
    if (!error) return;
    dernierErreur = error;
    if (essai < 4) await pause(1000 * essai);
  }
  throw new Error(`upload ${chemin} : ${dernierErreur.message}`);
}

async function convertirEtPublier(supabase, slug, octets) {
  const cle = `${slug}-v1`;
  for (const largeur of TAILLES) {
    const webp = await sharp(octets)
      .resize({ width: largeur, withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 })
      .toBuffer();
    await televerserAvecReessai(supabase, `${cle}-${largeur}w.webp`, webp);
  }
  const { error: errDb } = await supabase
    .schema("dragonball")
    .from("objets")
    .update({ image_path: cle })
    .eq("slug", slug);
  if (errDb) throw new Error(`maj objets.${slug} : ${errDb.message}`);
  return cle;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const ecrire = args.has("--ecrire");
  const forcer = args.has("--forcer");

  if (!ecrire) {
    console.log(
      "Mode aperçu uniquement. Ajoutez `--ecrire` pour publier les couvertures Jump Remix dans Supabase.",
    );
    return;
  }

  const { url, secretKey } = await resoudreConfigSupabase();
  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: objets, error } = await supabase
    .schema("dragonball")
    .from("objets")
    .select("slug, reference, image_path")
    .eq("categorie", "manga-livre")
    .eq("editeur", "Shueisha (Jump Remix)")
    .eq("marche", "JAP")
    .order("slug");
  if (error) throw new Error(`lecture objets : ${error.message}`);

  const aTraiter = (objets ?? []).filter(
    (o) => o.reference && (forcer || !o.image_path),
  );
  console.log(
    `Jump Remix Anime Comics : ${objets?.length ?? 0} livre(s) en base, ${aTraiter.length} couverture(s) à importer.`,
  );

  let ok = 0;
  let erreurs = 0;
  const file = [...aTraiter];

  async function travailleur() {
    while (file.length > 0) {
      const item = file.shift();
      if (!item) break;
      try {
        const { octets, width, height } = await telechargerCouverture(
          item.reference,
          item.slug,
        );
        const cle = await convertirEtPublier(supabase, item.slug, octets);
        ok++;
        console.log(`  ✓ ${item.slug} (${width}×${height}) → ${cle}`);
      } catch (e) {
        erreurs++;
        console.error(`  ✗ ${e.message}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: CONCURRENCE }, () => travailleur()),
  );

  console.log(
    `\nBilan Jump Remix : ${ok}/${aTraiter.length} publiée(s), ${erreurs} erreur(s).`,
  );
  if (erreurs > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
