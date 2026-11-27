// Import des jaquettes officielles pour les DVD japonais individuels Dragon Ball (26), Dragon Ball Z (49),
// Dragon Ball GT (11) (Pony Canyon HD size=6, ~680×1000 px), Dragon Box, et Dragon Ball The Movies (17, Toei Video)
// vers le bucket public `dragonball-visuels`.
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
const FORMAT_DSTD_MOVIE = /^DSTD-0(78(?:5[1-9]|6[0-7]))$/i;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// Jaquettes DVD individuels Dragon Ball The Movies (#01 à #17, Toei Video) : Book-Off LL (300×450) + Kanzenshuu (#13).
const MOVIES_BOOKOFF = {
  "DSTD-07851": "0015867048",
  "DSTD-07852": "0015867049",
  "DSTD-07853": "0015894726",
  "DSTD-07854": "0015894727",
  "DSTD-07855": "0015894704",
  "DSTD-07856": "0015894705",
  "DSTD-07857": "0015951978",
  "DSTD-07858": "0015951979",
  "DSTD-07859": "0016005224",
  "DSTD-07860": "0016005253",
  "DSTD-07861": "0016005453",
  "DSTD-07862": "0016005452",
  "DSTD-07864": "0016037732",
  "DSTD-07865": "0016061225",
  "DSTD-07866": "0016061226",
  "DSTD-07867": "0016061227",
};

const option = (nom) => {
  const i = process.argv.indexOf(nom);
  return i > 0 ? process.argv[i + 1] : null;
};

function urlsJaquetteDvd(reference) {
  const ref = (reference ?? "").trim().toUpperCase();
  const mPc = FORMAT_PCBC.exec(ref);
  if (mPc) {
    return {
      minWidth: 500,
      minHeight: 700,
      urls: [
        `https://www.ponycanyon.co.jp/images/wcms/accessor/bin/jacket/PCBC0000${mPc[1]}.jpg?size=6&order=1`,
      ],
    };
  }
  const mMovie = FORMAT_DSTD_MOVIE.exec(ref);
  if (mMovie) {
    const num = Number(mMovie[1]) - 7850;
    const numPad = String(num).padStart(2, "0");
    const boId = MOVIES_BOOKOFF[ref];
    const urls = [];
    if (boId) {
      urls.push(
        `https://content.bookoff.co.jp/goodsimages/LL/${boId.slice(0, 6)}/${boId}LL.jpg`,
      );
    }
    urls.push(
      `https://www.kanzenshuu.com/guides/home-video/jp/movies/${numPad}_large.jpg`,
      `https://www.toei-video.co.jp/images/jackets/DSTD0${mMovie[1]}.jpg`,
    );
    return { minWidth: 160, minHeight: 240, urls };
  }
  return null;
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
  const spec = urlsJaquetteDvd(reference);
  if (!spec) throw new Error(`Référence DVD non reconnue : ${reference}`);
  let dernierErreur = "aucune source";
  for (const url of spec.urls) {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; dragonball-db/1.0)" },
    }).catch((e) => ({ ok: false, status: e.message }));
    if (!res.ok) {
      dernierErreur = `HTTP ${res.status} (${url})`;
      continue;
    }
    const octets = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(octets).metadata().catch(() => null);
    if (
      !meta?.width ||
      !meta?.height ||
      meta.width < spec.minWidth ||
      meta.height < spec.minHeight
    ) {
      dernierErreur = `dimensions insuffisantes ${meta?.width}×${meta?.height} (${url})`;
      continue;
    }
    return { octets, width: meta.width, height: meta.height };
  }
  throw new Error(`${reference} : ${dernierErreur}`);
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
    .in("editeur", ["Pony Canyon", "Toei Video"])
    .not("reference", "is", null)
    .order("numero", { ascending: true, nullsFirst: false })
    .order("slug");
  if (error) throw new Error(`Lecture objets impossible : ${error.message}`);

  const cibles = (objets ?? []).filter(
    (o) => urlsJaquetteDvd(o.reference) && (forcer || !o.image_path),
  );
  console.log(
    `${cibles.length} jaquette(s) à importer sur ${(objets ?? []).length} DVD japonais.`,
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
