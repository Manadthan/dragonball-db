import "server-only";
import { supabaseEnvOptionnel } from "@/lib/supabase/env";
import { toutesLesPages } from "@/lib/supabase/pages";
import { createSupabasePublicClient } from "@/lib/supabase/public";
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
    annee: 1993,
    reference: "9782723418560",
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
    annee: 2003,
    reference: "PCBC-50368",
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
    annee: 1988,
    reference: "DP-01-001",
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
    annee: 2008,
    reference: "RVL-RDSP-EUR",
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
    annee: 2018,
    reference: "4573102550132",
    imageUrl: null,
  },
];

function versObjet(l: LigneObjet): ObjetCatalogue {
  return {
    id: l.id,
    slug: l.slug,
    categorie: l.categorie,
    ere: l.ere,
    marche: l.marche,
    titre: l.titre,
    titreOriginal: l.titre_original,
    editeur: l.editeur,
    annee: l.annee,
    reference: l.reference,
    imageUrl: l.image_url,
  };
}

export async function chargerCatalogue(): Promise<ObjetCatalogue[]> {
  if (!supabaseEnvOptionnel()) return OBJETS_DEPART;
  const supabase = createSupabasePublicClient();
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
  return lignes.map(versObjet);
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
