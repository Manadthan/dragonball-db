import {
  CATEGORIES,
  ERES,
  MARCHES,
  type CategorieObjet,
  type EreDb,
  type Marche,
  type ObjetCatalogue,
} from "./types";

export type FiltreCollection = "possedes" | "manquants";

export type FiltresCatalogue = {
  categorie: CategorieObjet | null;
  ere: EreDb | null;
  marche: Marche | null;
  editeur: string | null;
  edition: string | null;
  annee: string | null;
  q: string;
  collection: FiltreCollection | null;
};

export const SANS_FILTRE: FiltresCatalogue = {
  categorie: null,
  ere: null,
  marche: null,
  editeur: null,
  edition: null,
  annee: null,
  q: "",
  collection: null,
};

/** Normalisation sans accents et en minuscules pour la recherche instantanée. */
export function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function motsRecherche(texte: string): string[] {
  return normaliser(texte).split(/\s+/).filter(Boolean);
}

/** Lit tous les filtres du catalogue depuis les paramètres URL. */
export function filtresDepuisParametres(recherche: string): FiltresCatalogue {
  const params = new URLSearchParams(recherche);
  const cat = params.get("categorie") ?? params.get("type");
  const ere = params.get("ere") ?? params.get("serie");
  const marche = params.get("marche")?.toUpperCase();
  const annee = params.get("annee");
  const col = params.get("collection");

  return {
    categorie: CATEGORIES.find((c) => c.valeur === cat)?.valeur ?? null,
    ere: ERES.find((e) => e.valeur === ere)?.valeur ?? null,
    marche: MARCHES.find((m) => m.valeur === marche)?.valeur ?? null,
    editeur: params.get("editeur")?.trim() || null,
    edition: params.get("edition")?.trim() || null,
    annee: annee && /^\d{4}$/.test(annee) ? annee : null,
    q: params.get("q")?.trim() ?? "",
    collection: col === "possedes" || col === "manquants" ? col : null,
  };
}

/** Construit la chaîne de requête (`?categorie=...`) à partir des filtres actifs. */
export function versParametres(filtres: FiltresCatalogue): string {
  const params = new URLSearchParams();
  if (filtres.categorie) params.set("categorie", filtres.categorie);
  if (filtres.ere) params.set("ere", filtres.ere);
  if (filtres.marche) params.set("marche", filtres.marche.toLowerCase());
  if (filtres.editeur) params.set("editeur", filtres.editeur);
  if (filtres.edition) params.set("edition", filtres.edition);
  if (filtres.annee) params.set("annee", filtres.annee);
  if (filtres.q.trim()) params.set("q", filtres.q.trim());
  if (filtres.collection) params.set("collection", filtres.collection);
  const texte = params.toString();
  return texte ? `?${texte}` : "";
}

export function texteRechercheObjet(objet: ObjetCatalogue): string {
  return normaliser(
    [
      objet.titre,
      objet.titreOriginal,
      objet.editeur,
      objet.edition,
      objet.reference,
      objet.details,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/** Filtre le catalogue par catégorie, ère, marché, éditeur, édition, année et recherche `?q=`. */
export function filtrerObjets(
  objets: readonly ObjetCatalogue[],
  filtres: FiltresCatalogue,
): ObjetCatalogue[] {
  const mots = motsRecherche(filtres.q);
  const editeurNormalise = filtres.editeur ? normaliser(filtres.editeur) : null;
  const editionNormalisee = filtres.edition
    ? normaliser(filtres.edition)
    : null;

  return objets.filter((o) => {
    if (filtres.categorie && o.categorie !== filtres.categorie) return false;
    if (filtres.ere && o.ere !== filtres.ere) return false;
    if (filtres.marche && o.marche !== filtres.marche) return false;
    if (editeurNormalise && normaliser(o.editeur ?? "") !== editeurNormalise) {
      return false;
    }
    if (
      editionNormalisee &&
      normaliser(o.edition ?? "") !== editionNormalisee
    ) {
      return false;
    }
    if (filtres.annee && String(o.annee ?? "") !== filtres.annee) return false;
    if (mots.length > 0) {
      const texte = texteRechercheObjet(o);
      if (!mots.every((m) => texte.includes(m))) return false;
    }
    return true;
  });
}

export function editeursProposes(objets: readonly ObjetCatalogue[]): string[] {
  return [
    ...new Set(
      objets.map((o) => o.editeur?.trim()).filter((e): e is string => !!e),
    ),
  ].sort((a, b) => a.localeCompare(b, "fr"));
}

export function editionsProposees(objets: readonly ObjetCatalogue[]): string[] {
  return [
    ...new Set(
      objets.map((o) => o.edition?.trim()).filter((e): e is string => !!e),
    ),
  ].sort((a, b) => a.localeCompare(b, "fr"));
}

export function anneesProposees(objets: readonly ObjetCatalogue[]): string[] {
  return [
    ...new Set(
      objets
        .map((o) => (o.annee ? String(o.annee) : null))
        .filter((a): a is string => a !== null),
    ),
  ].sort((a, b) => b.localeCompare(a));
}
