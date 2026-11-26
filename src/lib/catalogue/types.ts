import type { Database } from "@/types/database";

export type CategorieObjet = Database["public"]["Enums"]["categorie_objet"];
export type EreDb = Database["public"]["Enums"]["ere_db"];
export type Marche = Database["public"]["Enums"]["marche"];

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
  annee: number | null;
  reference: string | null;
  imageUrl: string | null;
};

export const libelleCategorie = (c: CategorieObjet) =>
  CATEGORIES.find((x) => x.valeur === c)?.libelle ?? c;

export const libelleEre = (e: EreDb) =>
  ERES.find((x) => x.valeur === e)?.libelle ?? e;

export const libelleMarche = (m: Marche) =>
  MARCHES.find((x) => x.valeur === m)?.libelle ?? m;
