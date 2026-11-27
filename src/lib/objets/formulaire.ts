import {
  CATEGORIES,
  ERES,
  MARCHES,
  type CategorieObjet,
  type EreDb,
  type Marche,
} from "@/lib/catalogue/types";

const FORMAT_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;
const FORMAT_URL = /^https?:\/\/.+/i;

export type DonneesObjetValide = {
  slug: string;
  categorie: CategorieObjet;
  ere: EreDb;
  marche: Marche;
  titre: string;
  titre_original: string | null;
  editeur: string | null;
  edition: string | null;
  numero: number | null;
  annee: number | null;
  date_sortie: string | null;
  reference: string | null;
  details: string | null;
  lien_officiel: string | null;
  image_url: string | null;
};

export type ResultatValidationObjet =
  { ok: true; donnees: DonneesObjetValide } | { ok: false; erreurs: string[] };

/** Génère un slug propre (`a-z`, `0-9`, `-`, ≤ 120 caractères) à partir d'un titre. */
export function genererSlug(titre: string): string {
  return titre
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

function lireTexteOptionnel(formData: FormData, champ: string): string | null {
  const valeur = String(formData.get(champ) ?? "").trim();
  return valeur.length > 0 ? valeur : null;
}

/** Valide et normalise les champs d'un formulaire d'ajout ou de modification d'objet. */
export function validerObjetFormulaire(
  formData: FormData,
): ResultatValidationObjet {
  const erreurs: string[] = [];

  const titre = String(formData.get("titre") ?? "").trim();
  if (!titre) {
    erreurs.push("Le titre est obligatoire.");
  }

  const slugSaisi = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const slug = slugSaisi || (titre ? genererSlug(titre) : "");
  if (!slug || slug.length > 140 || !FORMAT_SLUG.test(slug)) {
    erreurs.push(
      "L'adresse (slug) doit contenir uniquement des lettres minuscules, chiffres et tirets (140 caractères max).",
    );
  }

  const catBrute = String(formData.get("categorie") ?? "").trim();
  const categorie = CATEGORIES.find((c) => c.valeur === catBrute)?.valeur;
  if (!categorie) {
    erreurs.push("Choisissez une catégorie valide.");
  }

  const ereBrute = String(formData.get("ere") ?? "").trim();
  const ere = ERES.find((e) => e.valeur === ereBrute)?.valeur;
  if (!ere) {
    erreurs.push("Choisissez une série / ère valide.");
  }

  const marcheBrute = String(formData.get("marche") ?? "")
    .trim()
    .toUpperCase();
  const marche = MARCHES.find((m) => m.valeur === marcheBrute)?.valeur;
  if (!marche) {
    erreurs.push("Choisissez un marché valide.");
  }

  const numeroBrut = lireTexteOptionnel(formData, "numero");
  let numero: number | null = null;
  if (numeroBrut !== null) {
    const n = Number(numeroBrut);
    if (!Number.isInteger(n) || n <= 0) {
      erreurs.push("Le volume (numéro) doit être un entier positif.");
    } else {
      numero = n;
    }
  }

  const dateSortie = lireTexteOptionnel(formData, "date_sortie");
  if (dateSortie !== null) {
    if (
      !FORMAT_DATE.test(dateSortie) ||
      Number.isNaN(new Date(`${dateSortie}T00:00:00Z`).getTime())
    ) {
      erreurs.push("La date de sortie doit être au format AAAA-MM-JJ.");
    }
  }

  const anneeBrute = lireTexteOptionnel(formData, "annee");
  let annee: number | null = null;
  if (anneeBrute !== null) {
    const a = Number(anneeBrute);
    if (!Number.isInteger(a) || a < 1984 || a > 2100) {
      erreurs.push("L'année doit être comprise entre 1984 et 2100.");
    } else {
      annee = a;
    }
  } else if (dateSortie && FORMAT_DATE.test(dateSortie)) {
    const a = Number(dateSortie.slice(0, 4));
    if (a >= 1984 && a <= 2100) annee = a;
  }

  const lienOfficiel = lireTexteOptionnel(formData, "lien_officiel");
  if (lienOfficiel !== null && !FORMAT_URL.test(lienOfficiel)) {
    erreurs.push("Le lien officiel doit commencer par http:// ou https://.");
  }

  const imageUrl = lireTexteOptionnel(formData, "image_url");
  if (imageUrl !== null && !FORMAT_URL.test(imageUrl)) {
    erreurs.push("L'URL d'image doit commencer par http:// ou https://.");
  }

  if (erreurs.length > 0 || !categorie || !ere || !marche) {
    return { ok: false, erreurs };
  }

  return {
    ok: true,
    donnees: {
      slug,
      categorie,
      ere,
      marche,
      titre,
      titre_original: lireTexteOptionnel(formData, "titre_original"),
      editeur: lireTexteOptionnel(formData, "editeur"),
      edition: lireTexteOptionnel(formData, "edition"),
      numero,
      annee,
      date_sortie: dateSortie,
      reference: lireTexteOptionnel(formData, "reference"),
      details: lireTexteOptionnel(formData, "details"),
      lien_officiel: lienOfficiel,
      image_url: imageUrl,
    },
  };
}
