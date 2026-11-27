// Import des couvertures officielles Jump Comics Japon (Shueisha CloudFront 1200px HD en priorité,
// complété par Rakuten Books et Amazon Japon pour les éditions épuisées) pour les 229 livres Dragon Ball
// Jump Comics vers le bucket public `dragonball-visuels` (WebP 300w + 680w).
//
// Usages :
//   node scripts/jaquettes-jump-comics.mjs --ecrire             (importe les couvertures manquantes)
//   node scripts/jaquettes-jump-comics.mjs --ecrire --forcer    (remplace aussi les couvertures déjà présentes)
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
  readFileSync(join(__dir, "data", "jump-comics-couvertures.json"), "utf8"),
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
  return [
    ...new Set(
      [
        manifeste[propre],
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
        erreur = `dimensions insuffisantes ${meta?.width}×${meta?.height}`;
        break;
      }
      return { octets, width: meta.width, height: meta.height };
    }
  }
  throw new Error(`${slug} (${isbn}) : ${erreur}`);
}

/** Upload avec réessais en cas de pic de connexions Supabase Storage. */
async function televerserAvecReessais(supabase, chemin, webp) {
  for (let essai = 1; essai <= 4; essai++) {
    const { error } = await supabase.storage.from(BUCKET).upload(chemin, webp, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    });
    if (!error) return;
    if (essai === 4) {
      throw new Error(`Upload ${chemin} : ${error.message}`);
    }
    await pause(1500 * essai);
  }
}

async function ecrireEnBase(forcer) {
  const { url, secretKey } = await resoudreConfigSupabase();
  const supabase = createClient(url, secretKey, {
    db: { schema: "dragonball" },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tous = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await supabase
      .from("objets")
      .select("id, slug, reference, image_path")
      .eq("editeur", "Shueisha (Jump Comics)")
      .order("slug")
      .range(de, de + 999);
    if (error) throw new Error(`Lecture objets impossible : ${error.message}`);
    tous.push(...(data ?? []));
    if ((data ?? []).length < 1000) break;
  }

  const cibles = tous.filter((o) => forcer || !o.image_path);
  console.log(
    `${cibles.length} couverture(s) Jump Comics à importer sur ${tous.length} ouvrage(s).`,
  );

  const version = `v${Date.now().toString(36).slice(-5)}`;
  let curseur = 0;
  let importees = 0;
  const erreurs = [];

  async function travailleur() {
    while (curseur < cibles.length) {
      const objet = cibles[curseur++];
      try {
        const dl = await telechargerCouverture(objet.reference, objet.slug);
        const base = `${objet.slug}-${version}`;

        for (const taille of TAILLES) {
          const webp = await sharp(dl.octets)
            .resize({ width: taille, withoutEnlargement: true })
            .webp({ quality: 86, effort: 5 })
            .toBuffer();
          await televerserAvecReessais(supabase, `${base}-${taille}.webp`, webp);
        }

        const { error: errMaj } = await supabase
          .from("objets")
          .update({ image_path: base, updated_at: new Date().toISOString() })
          .eq("id", objet.id);
        if (errMaj) throw new Error(`MAJ ${objet.slug} : ${errMaj.message}`);

        importees++;
        if (importees % 25 === 0 || importees === cibles.length) {
          console.log(
            `[${importees}/${cibles.length}] ${objet.slug} (${dl.width}×${dl.height}) → ${base}`,
          );
        }
      } catch (e) {
        erreurs.push(`${objet.slug} : ${e.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCE }, travailleur));
  console.log(
    `Terminé : ${importees} publiée(s), ${erreurs.length} erreur(s).`,
  );
  if (erreurs.length > 0) {
    for (const err of erreurs.slice(0, 20)) console.error(`  ✗ ${err}`);
    process.exit(1);
  }
}

if (process.argv.includes("--ecrire")) {
  await ecrireEnBase(process.argv.includes("--forcer"));
} else {
  console.error(
    "Usage : node scripts/jaquettes-jump-comics.mjs --ecrire [--forcer]",
  );
  process.exit(1);
}
