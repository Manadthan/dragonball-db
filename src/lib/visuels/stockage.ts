/** Bucket public dédié aux visuels et jaquettes de Dragon Ball DB (migration 0003). */
export const BUCKET_VISUELS = "dragonball-visuels";

/** Deux largeurs WebP par jaquette : 300 px pour la grille mobile, 680 px (source HD Pony Canyon) pour la fiche et Retina ×3. */
export const TAILLES_VISUEL = [300, 680] as const;
export type TailleVisuel = (typeof TAILLES_VISUEL)[number];

const FORMAT_BASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FORMAT_VERSION = /^[a-z0-9]{1,16}$/;
const FORMAT_PCBC = /^PCBC-(\d{5})$/i;

/** Construit la base versionnée d'un visuel stockée dans `dragonball.objets.image_path`. */
export function baseVisuel(slug: string, version: string): string {
  if (!FORMAT_BASE.test(slug)) {
    throw new Error(`Slug invalide pour un visuel : « ${slug} ».`);
  }
  if (!FORMAT_VERSION.test(version)) {
    throw new Error(`Version de visuel invalide : « ${version} ».`);
  }
  return `${slug}-${version}`;
}

/** Chemin d'une taille WebP dans le bucket `dragonball-visuels` : `{base}-{taille}.webp`. */
export function cheminVisuel(base: string, taille: TailleVisuel): string {
  if (!FORMAT_BASE.test(base)) {
    throw new Error(`Base de visuel invalide : « ${base} ».`);
  }
  return `${base}-${taille}.webp`;
}

function baseUrlSupabase(baseUrl?: string): string {
  const url = (baseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  return url.replace(/\/+$/, "");
}

/** Adresse publique d'une jaquette dans le bucket `dragonball-visuels`. */
export function urlVisuel(
  base: string,
  taille: TailleVisuel = 680,
  baseUrl?: string,
): string | null {
  const origine = baseUrlSupabase(baseUrl);
  if (!origine) return null;
  return `${origine}/storage/v1/object/public/${BUCKET_VISUELS}/${cheminVisuel(base, taille)}`;
}

/** Attribut `srcSet` responsive (`300w, 680w`) pour que le navigateur choisisse la taille optimale. */
export function srcsetVisuel(base: string, baseUrl?: string): string | null {
  const origine = baseUrlSupabase(baseUrl);
  if (!origine) return null;
  return TAILLES_VISUEL.map(
    (taille) =>
      `${origine}/storage/v1/object/public/${BUCKET_VISUELS}/${cheminVisuel(base, taille)} ${taille}w`,
  ).join(", ");
}

/** Résout l'URL principale (680w du bucket si `imagePath` est renseigné, sinon `imageUrl`). */
export function resoudreImageObjet(
  {
    imagePath,
    imageUrl,
  }: { imagePath: string | null; imageUrl: string | null },
  baseUrl?: string,
): string | null {
  if (imagePath) {
    return urlVisuel(imagePath, 680, baseUrl) ?? imageUrl;
  }
  return imageUrl;
}

/**
 * URL officielle HD (size=6, ~680×1000 px) d'une jaquette Pony Canyon à partir de sa référence (`PCBC-50781`).
 */
export function urlJaquettePonyCanyon(reference: string | null): string | null {
  if (!reference) return null;
  const correspondance = FORMAT_PCBC.exec(reference.trim());
  if (!correspondance) return null;
  return `https://www.ponycanyon.co.jp/images/wcms/accessor/bin/jacket/PCBC0000${correspondance[1]}.jpg?size=6&order=1`;
}

/** Vérifie qu'une jaquette HD téléchargée a bien les dimensions minimales attendues (≥ 500×700 px). */
export function estJaquetteHdValide(dimensions: {
  width?: number;
  height?: number;
}): boolean {
  const { width, height } = dimensions;
  return (
    typeof width === "number" &&
    typeof height === "number" &&
    width >= 500 &&
    height >= 700
  );
}
