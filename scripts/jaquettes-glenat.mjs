// Import des couvertures officielles HD Glénat (media.hachette.fr, ~1400×2030 px) pour les livres Dragon Ball
// publiés par Glénat en France vers le bucket public `dragonball-visuels` (WebP 300w + 680w).
//
// Usages :
//   node scripts/jaquettes-glenat.mjs --ecrire             (importe les couvertures manquantes)
//   node scripts/jaquettes-glenat.mjs --ecrire --forcer    (remplace aussi les couvertures déjà présentes)
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
const CONCURRENCE = 6;
const __dir = dirname(fileURLToPath(import.meta.url));
const manifeste = JSON.parse(
  readFileSync(join(__dir, "data", "glenat-couvertures.json"), "utf8"),
);

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

/** Résout l'URL HD officielle Glénat (manifeste par ISBN-13, sinon lecture de la page officielle glenat.com). */
async function resoudreUrlCouverture(objet) {
  const ean = (objet.reference ?? "").replace(/[^0-9]/g, "");
  if (ean && manifeste[ean]) return manifeste[ean];

  if (objet.lien_officiel && objet.lien_officiel.includes("glenat.com")) {
    const res = await fetch(objet.lien_officiel, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; dragonball-db/1.0)" },
    }).catch(() => null);
    if (res?.ok) {
      const html = await res.text();
      const matchs = [
        ...new Set(
          [
            ...html.matchAll(
              /https:\/\/media\.hachette\.fr\/imgArticle\/[^"\\]+/g,
            ),
          ].map((m) => m[0]),
        ),
      ];
      const trouvee = (ean && matchs.find((u) => u.includes(ean))) || matchs[0];
      if (trouvee) {
        const u = new URL(trouvee);
        u.searchParams.set("source", "web");
        return u.toString();
      }
    }
  }
  return null;
}

async function telechargerHd(url, reference) {
  const candidats = [
    url,
    url.replace(
      "https://media.hachette.fr/",
      "https://www.images.hachette-livre.fr/media/",
    ),
  ];
  let erreur = "aucune source";
  for (const cible of [...new Set(candidats)]) {
    const res = await fetch(cible, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; dragonball-db/1.0)" },
    }).catch((e) => ({ ok: false, status: e.message }));
    if (!res.ok) {
      erreur = `HTTP ${res.status} (${cible})`;
      continue;
    }
    const octets = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(octets).metadata().catch(() => null);
    if (!meta?.width || !meta?.height || meta.width < 200 || meta.height < 280) {
      erreur = `dimensions insuffisantes ${meta?.width}×${meta?.height}`;
      continue;
    }
    return { octets, width: meta.width, height: meta.height };
  }
  throw new Error(`${reference} : ${erreur}`);
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
      .select("id, slug, reference, lien_officiel, image_path")
      .eq("editeur", "Glénat")
      .order("slug")
      .range(de, de + 999);
    if (error) throw new Error(`Lecture objets impossible : ${error.message}`);
    tous.push(...(data ?? []));
    if ((data ?? []).length < 1000) break;
  }

  const cibles = tous.filter((o) => forcer || !o.image_path);
  console.log(
    `${cibles.length} couverture(s) Glénat à importer sur ${tous.length} ouvrage(s).`,
  );

  const version = `v${Date.now().toString(36).slice(-5)}`;
  let curseur = 0;
  let importees = 0;
  let ignorees = 0;
  const erreurs = [];

  async function travailleur() {
    while (curseur < cibles.length) {
      const objet = cibles[curseur++];
      try {
        const imgUrl = await resoudreUrlCouverture(objet);
        if (!imgUrl) {
          ignorees++;
          continue;
        }
        const dl = await telechargerHd(imgUrl, objet.reference || objet.slug);
        const base = `${objet.slug}-${version}`;

        for (const taille of TAILLES) {
          const webp = await sharp(dl.octets)
            .resize({ width: taille, withoutEnlargement: true })
            .webp({ quality: 86, effort: 5 })
            .toBuffer();
          const chemin = `${base}-${taille}.webp`;
          const { error: errUpload } = await supabase.storage
            .from(BUCKET)
            .upload(chemin, webp, {
              contentType: "image/webp",
              cacheControl: "31536000",
              upsert: true,
            });
          if (errUpload) {
            throw new Error(`Upload ${chemin} : ${errUpload.message}`);
          }
        }

        const { error: errMaj } = await supabase
          .from("objets")
          .update({ image_path: base, updated_at: new Date().toISOString() })
          .eq("id", objet.id);
        if (errMaj) throw new Error(`MAJ ${objet.slug} : ${errMaj.message}`);

        importees++;
        if (importees % 20 === 0 || importees === cibles.length) {
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
    `Terminé : ${importees} publiée(s), ${ignorees} sans source Glénat, ${erreurs.length} erreur(s).`,
  );
  if (erreurs.length > 0) {
    for (const err of erreurs.slice(0, 20)) console.error(`  ✗ ${err}`);
    process.exit(1);
  }
}

if (process.argv.includes("--ecrire")) {
  await ecrireEnBase(process.argv.includes("--forcer"));
} else {
  console.error("Usage : node scripts/jaquettes-glenat.mjs --ecrire [--forcer]");
  process.exit(1);
}
