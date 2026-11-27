// Import des jaquettes officielles HD Pony Canyon (size=6, ~680×1000 px) pour les 49 DVD Dragon Ball Z
// (PCBC-50781 à PCBC-50829) + le Dragon Box Vol. 1 (PCBC-50368) vers le bucket public `dragonball-visuels`.
//
// Usages :
//   node scripts/jaquettes-dbz-dvd.mjs --planche /dossier   (lecture seule : télécharge + planche contact)
//   node scripts/jaquettes-dbz-dvd.mjs --ecrire             (télécharge, convertit WebP 300w/680w, uploade & MAJ base)
//   node scripts/jaquettes-dbz-dvd.mjs --ecrire --forcer    (remplace aussi les jaquettes déjà présentes)
//
// Variables requises pour --ecrire :
//   SUPABASE_URL (ou SUPABASE_PROJECT_REF) + SUPABASE_SECRET_KEY (ou SUPABASE_ACCESS_TOKEN via API Management)

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "dragonball-visuels";
const TAILLES = [300, 680];
const FORMAT_PCBC = /^PCBC-(\d{5})$/i;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

const option = (nom) => {
  const i = process.argv.indexOf(nom);
  return i > 0 ? process.argv[i + 1] : null;
};

function urlPonyCanyon(reference) {
  const m = FORMAT_PCBC.exec((reference ?? "").trim());
  if (!m) return null;
  return `https://www.ponycanyon.co.jp/images/wcms/accessor/bin/jacket/PCBC0000${m[1]}.jpg?size=6&order=1`;
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

async function telechargerHd(reference) {
  const url = urlPonyCanyon(reference);
  if (!url) throw new Error(`Référence Pony Canyon invalide : ${reference}`);
  const res = await fetch(url, {
    headers: { "User-Agent": "dragonball-db-import/1.0" },
  });
  if (!res.ok) throw new Error(`${reference} HTTP ${res.status} (${url})`);
  const octets = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(octets).metadata();
  if (!meta.width || !meta.height || meta.width < 500 || meta.height < 700) {
    throw new Error(
      `${reference} dimensions insuffisantes : ${meta.width}×${meta.height}`,
    );
  }
  return { octets, width: meta.width, height: meta.height };
}

async function genererPlanche(dossier) {
  mkdirSync(join(dossier, "sources"), { recursive: true });
  const references = Array.from({ length: 49 }, (_, i) => ({
    slug: `dbz-dvd-jp-${String(i + 1).padStart(2, "0")}`,
    numero: i + 1,
    reference: `PCBC-${50781 + i}`,
  }));

  const L = 180;
  const H = 265;
  const LEG = 34;
  const COLS = 7;
  const LIGNES = Math.ceil(references.length / COLS);
  const couches = [];

  for (const [idx, item] of references.entries()) {
    const fichier = join(dossier, "sources", `${item.reference}.jpg`);
    let octets;
    let dims;
    if (existsSync(fichier)) {
      const img = sharp(fichier);
      const m = await img.metadata();
      octets = await img.toBuffer();
      dims = `${m.width}×${m.height}`;
    } else {
      const dl = await telechargerHd(item.reference);
      writeFileSync(fichier, dl.octets);
      octets = dl.octets;
      dims = `${dl.width}×${dl.height}`;
      await pause(150);
    }

    const x = (idx % COLS) * L;
    const y = Math.floor(idx / COLS) * (H + LEG);
    const miniature = await sharp(octets)
      .resize(L - 8, H - 8, { fit: "contain", background: "#ffffff" })
      .toBuffer();
    const legende = Buffer.from(
      `<svg width="${L}" height="${LEG}">` +
        `<rect width="100%" height="100%" fill="#ffffff"/>` +
        `<text x="6" y="14" font-size="13" font-weight="bold" font-family="sans-serif" fill="#b42318">#${item.numero}</text>` +
        `<text x="42" y="14" font-size="11" font-family="sans-serif" fill="#333333">${item.reference}</text>` +
        `<text x="6" y="29" font-size="10" font-family="sans-serif" fill="#666666">${dims}</text>` +
        `</svg>`,
    );
    couches.push({ input: miniature, left: x + 4, top: y + 4 });
    couches.push({ input: legende, left: x, top: y + H });
  }

  const sortie = join(dossier, "planche-dbz-dvd.jpg");
  await sharp({
    create: {
      width: COLS * L,
      height: LIGNES * (H + LEG),
      channels: 3,
      background: "#f6f5f2",
    },
  })
    .composite(couches)
    .jpeg({ quality: 86 })
    .toFile(sortie);

  console.log(`Planche contact générée (49/49 HD) : ${sortie}`);
}

async function ecrireEnBase(forcer) {
  const { url, secretKey } = await resoudreConfigSupabase();
  const supabase = createClient(url, secretKey, {
    db: { schema: "dragonball" },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: objets, error } = await supabase
    .from("objets")
    .select("id, slug, reference, image_path")
    .eq("editeur", "Pony Canyon")
    .not("reference", "is", null)
    .order("numero", { ascending: true, nullsFirst: false })
    .order("slug");
  if (error) throw new Error(`Lecture objets impossible : ${error.message}`);

  const cibles = (objets ?? []).filter(
    (o) => urlPonyCanyon(o.reference) && (forcer || !o.image_path),
  );
  console.log(
    `${cibles.length} jaquette(s) à importer sur ${(objets ?? []).length} objet(s) Pony Canyon.`,
  );

  const version = `v${Date.now().toString(36).slice(-5)}`;
  let importees = 0;

  for (const objet of cibles) {
    const dl = await telechargerHd(objet.reference);
    const base = `${objet.slug}-${version}`;

    for (const taille of TAILLES) {
      const webp = await sharp(dl.octets)
        .resize({ width: taille, withoutEnlargement: true })
        .webp({ quality: 90 })
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
    if (errMaj) {
      throw new Error(`MAJ ${objet.slug} : ${errMaj.message}`);
    }

    importees++;
    console.log(
      `[${importees}/${cibles.length}] ${objet.slug} (${objet.reference}) : ${dl.width}×${dl.height} → ${base}`,
    );
    await pause(150);
  }

  console.log(`Terminé : ${importees} jaquette(s) publiée(s) dans ${BUCKET}.`);
}

const dossierPlanche = option("--planche");
if (dossierPlanche) {
  await genererPlanche(dossierPlanche);
} else if (process.argv.includes("--ecrire")) {
  await ecrireEnBase(process.argv.includes("--forcer"));
} else {
  console.error(
    "Usage : node scripts/jaquettes-dbz-dvd.mjs --planche <dossier> | --ecrire [--forcer]",
  );
  process.exit(1);
}
