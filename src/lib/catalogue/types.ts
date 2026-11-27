import type { Database } from "@/types/database";

export type CategorieObjet = Database["dragonball"]["Enums"]["categorie_objet"];
export type EreDb = Database["dragonball"]["Enums"]["ere_db"];
export type Marche = Database["dragonball"]["Enums"]["marche"];

export const CATEGORIES: readonly {
  valeur: CategorieObjet;
  libelle: string;
  court: string;
}[] = [
  { valeur: "manga-livre", libelle: "Mangas & livres", court: "Mangas" },
  { valeur: "video", libelle: "DVD / Blu-ray", court: "Vidéo" },
  { valeur: "carte", libelle: "Cartes à collectionner", court: "Cartes" },
  { valeur: "jeu", libelle: "Jeux vidéo", court: "Jeux" },
  { valeur: "figurine", libelle: "Figurines & goodies", court: "Figurines" },
];

export const ERES: readonly { valeur: EreDb; libelle: string }[] = [
  { valeur: "dragon-ball", libelle: "Dragon Ball" },
  { valeur: "dbz", libelle: "DBZ" },
  { valeur: "dbgt", libelle: "DBGT" },
  { valeur: "dbs", libelle: "DBS" },
  { valeur: "daima", libelle: "Daima" },
  { valeur: "films", libelle: "Films" },
];

export const MARCHES: readonly { valeur: Marche; libelle: string }[] = [
  { valeur: "FR", libelle: "France" },
  { valeur: "JAP", libelle: "Japon" },
  { valeur: "US", libelle: "États-Unis" },
];

export type ObjetCatalogue = {
  id: string;
  slug: string;
  categorie: CategorieObjet;
  ere: EreDb;
  marche: Marche;
  titre: string;
  titreOriginal: string | null;
  editeur: string | null;
  edition: string | null;
  numero: number | null;
  annee: number | null;
  dateSortie: string | null;
  reference: string | null;
  details: string | null;
  lienOfficiel: string | null;
  imagePath: string | null;
  imageUrl: string | null;
};

export const libelleCategorie = (c: CategorieObjet) =>
  CATEGORIES.find((x) => x.valeur === c)?.libelle ?? c;

export const libelleEre = (e: EreDb) =>
  ERES.find((x) => x.valeur === e)?.libelle ?? e;

export const libelleMarche = (m: Marche) =>
  MARCHES.find((x) => x.valeur === m)?.libelle ?? m;

const FORMAT_DATE_FR = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Formate une date ISO (`YYYY-MM-DD`) en français (`2 novembre 2005`). */
export function formaterDateSortie(iso: string | null): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return FORMAT_DATE_FR.format(date);
}
