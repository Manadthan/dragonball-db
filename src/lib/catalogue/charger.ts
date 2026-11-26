import "server-only";
import { supabaseEnvOptionnel } from "@/lib/supabase/env";
import { toutesLesPages } from "@/lib/supabase/pages";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { resoudreImageObjet } from "@/lib/visuels/stockage";
import type { Database } from "@/types/database";
import type { ObjetCatalogue } from "./types";

type LigneObjet = Database["dragonball"]["Tables"]["objets"]["Row"];

/** Jeu de démonstration utilisé uniquement si Supabase n'est pas encore configuré (ex. 1er build Vercel). */
export const OBJETS_DEPART: ObjetCatalogue[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "dragon-ball-tome-1-glenat",
    categorie: "manga-livre",
    ere: "dragon-ball",
    marche: "FR",
    titre: "Dragon Ball — Tome 1 : Sangoku",
    titreOriginal: "ドラゴンボール 1",
    editeur: "Glénat",
    edition: null,
    numero: 1,
    annee: 1993,
    dateSortie: null,
    reference: "9782723418560",
    details: null,
    lienOfficiel: null,
    imagePath: null,
    imageUrl: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "dbz-dragon-box-dvd-jap",
    categorie: "video",
    ere: "dbz",
    marche: "JAP",
    titre: "Dragon Ball Z — Dragon Box Vol. 1",
    titreOriginal: "DRAGON BALL Z DVD-BOX DRAGON BOX Z編 VOL.1",
    editeur: "Pony Canyon",
    edition: "Dragon Box",
    numero: 1,
    annee: 2003,
    dateSortie: "2003-03-19",
    reference: "PCBC-50368",
    details:
      "Coffret DVD Dragon Box Z Vol. 1 · Épisodes 1 à 147 · 4:3 · NTSC Région 2",
    lienOfficiel: null,
    imagePath: null,
    imageUrl: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "carddass-hondan-part-1-n1",
    categorie: "carte",
    ere: "dragon-ball",
    marche: "JAP",
    titre: "Carddass Hondan Part 1 — N°1 Son Goku",
    titreOriginal: "カードダス ドラゴンボール 本弾 1弾 No.1",
    editeur: "Bandai",
    edition: null,
    numero: 1,
    annee: 1988,
    dateSortie: null,
    reference: "DP-01-001",
    details: null,
    lienOfficiel: null,
    imagePath: null,
    imageUrl: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    slug: "dbz-budokai-tenkaichi-3-wii-fr",
    categorie: "jeu",
    ere: "dbz",
    marche: "FR",
    titre: "Dragon Ball Z: Budokai Tenkaichi 3",
    titreOriginal: "ドラゴンボールZ Sparking! METEOR",
    editeur: "Atari / Bandai Namco",
    edition: null,
    numero: null,
    annee: 2008,
    dateSortie: null,
    reference: "RVL-RDSP-EUR",
    details: null,
    lienOfficiel: null,
    imagePath: null,
    imageUrl: null,
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    slug: "shfiguarts-son-goku-saiyan-raised-on-earth",
    categorie: "figurine",
    ere: "dbz",
    marche: "FR",
    titre: "S.H.Figuarts Son Goku — A Saiyan Raised on Earth",
    titreOriginal: "S.H.Figuarts 孫悟空-地球育ちのサイヤ人-",
    editeur: "Tamashii Nations",
    edition: null,
    numero: null,
    annee: 2018,
    dateSortie: null,
    reference: "4573102550132",
    details: null,
    lienOfficiel: null,
    imagePath: null,
    imageUrl: null,
  },
];

function versObjet(l: LigneObjet): ObjetCatalogue {
  const imagePath = l.image_path ?? null;
  const imageUrl = l.image_url ?? null;
  return {
    id: l.id,
    slug: l.slug,
    categorie: l.categorie,
    ere: l.ere,
    marche: l.marche,
    titre: l.titre,
    titreOriginal: l.titre_original ?? null,
    editeur: l.editeur ?? null,
    edition: l.edition ?? null,
    numero: l.numero ?? null,
    annee: l.annee ?? null,
    dateSortie: l.date_sortie ?? null,
    reference: l.reference ?? null,
    details: l.details ?? null,
    lienOfficiel: l.lien_officiel ?? null,
    imagePath,
    imageUrl: resoudreImageObjet({ imagePath, imageUrl }),
  };
}

function trierCatalogue(a: ObjetCatalogue, b: ObjetCatalogue): number {
  const anA = a.annee ?? Number.MAX_SAFE_INTEGER;
  const anB = b.annee ?? Number.MAX_SAFE_INTEGER;
  if (anA !== anB) return anA - anB;

  const numA = a.numero ?? Number.MAX_SAFE_INTEGER;
  const numB = b.numero ?? Number.MAX_SAFE_INTEGER;
  if (numA !== numB) return numA - numB;

  const parTitre = a.titre.localeCompare(b.titre, "fr");
  if (parTitre !== 0) return parTitre;
  return a.id.localeCompare(b.id);
}

export async function chargerCatalogue(): Promise<ObjetCatalogue[]> {
  if (!supabaseEnvOptionnel()) return OBJETS_DEPART;
  const supabase = createSupabasePublicClient();
  // Tri SQL sur colonnes du socle 0001 + tri naturel sur `numero` côté TS :
  // permet aux aperçus Vercel de builder avant l'application de la migration 0003 en prod.
  const lignes = await toutesLesPages<LigneObjet>(
    (de, a) =>
      supabase
        .from("objets")
        .select("*")
        .order("annee", { ascending: true, nullsFirst: false })
        .order("titre")
        .order("id")
        .range(de, a),
    "Catalogue Dragon Ball",
  );
  return lignes.map(versObjet).sort(trierCatalogue);
}

export async function chargerObjetParSlug(
  slug: string,
): Promise<ObjetCatalogue | null> {
  if (!supabaseEnvOptionnel()) {
    return OBJETS_DEPART.find((o) => o.slug === slug) ?? null;
  }
  const { data, error } = await createSupabasePublicClient()
    .from("objets")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Objet ${slug} illisible : ${error.message}`);
  return data ? versObjet(data) : null;
}
