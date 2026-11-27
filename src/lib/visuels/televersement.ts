import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import {
  baseVisuel,
  BUCKET_VISUELS,
  cheminVisuel,
  TAILLES_VISUEL,
} from "@/lib/visuels/stockage";
import type { Database } from "@/types/database";

const TAILLE_MAX_OCTETS = 6 * 1024 * 1024;
const TYPES_IMAGE_ACCEPTES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

/** Convertit un fichier image en WebP 300w + 680w et le dépose dans `dragonball-visuels`. */
export async function televerserVisuel(
  supabase: SupabaseClient<Database, "dragonball">,
  slug: string,
  fichier: File,
): Promise<string> {
  if (fichier.size > TAILLE_MAX_OCTETS) {
    throw new Error("L'image dépasse la limite de 6 Mo.");
  }
  if (fichier.type && !TYPES_IMAGE_ACCEPTES.has(fichier.type.toLowerCase())) {
    throw new Error(
      "Format d'image non pris en charge (JPEG, PNG, WebP ou AVIF attendus).",
    );
  }

  const octets = Buffer.from(await fichier.arrayBuffer());
  const meta = await sharp(octets)
    .metadata()
    .catch(() => null);
  if (!meta?.width || !meta.height || meta.width < 100 || meta.height < 100) {
    throw new Error(
      "Image illisible ou trop petite (minimum 100 × 100 pixels).",
    );
  }

  const version = `v${Date.now().toString(36).slice(-6)}`;
  const base = baseVisuel(slug, version);

  for (const taille of TAILLES_VISUEL) {
    const webp = await sharp(octets)
      .rotate()
      .resize({ width: taille, withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();
    const chemin = cheminVisuel(base, taille);
    const { error } = await supabase.storage
      .from(BUCKET_VISUELS)
      .upload(chemin, webp, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });
    if (error) {
      throw new Error(`Envoi du visuel impossible : ${error.message}`);
    }
  }

  return base;
}

/** Supprime les variantes WebP (`300w` et `680w`) d'un ancien visuel (sans bloquer en cas d'absence). */
export async function supprimerVisuelStocke(
  supabase: SupabaseClient<Database, "dragonball">,
  imagePath: string | null,
): Promise<void> {
  if (!imagePath) return;
  try {
    const chemins = TAILLES_VISUEL.map((t) => cheminVisuel(imagePath, t));
    await supabase.storage.from(BUCKET_VISUELS).remove(chemins);
  } catch {
    // Nettoyage best-effort.
  }
}
