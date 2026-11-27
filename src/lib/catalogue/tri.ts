import type { ObjetCatalogue } from "./types";

export type TriCatalogue = "anciens" | "recents" | "az" | "za" | "numero";

export const TRI_PAR_DEFAUT: TriCatalogue = "anciens";

export const OPTIONS_TRI: readonly {
  valeur: TriCatalogue;
  libelle: string;
}[] = [
  { valeur: "anciens", libelle: "Plus anciens" },
  { valeur: "recents", libelle: "Plus récents" },
  { valeur: "az", libelle: "Titre A → Z" },
  { valeur: "za", libelle: "Titre Z → A" },
  { valeur: "numero", libelle: "N° / Tome" },
];

const COLLATEUR_FR = new Intl.Collator("fr", {
  sensitivity: "base",
  numeric: true,
});

export function estTriCatalogue(valeur: string | null): valeur is TriCatalogue {
  return OPTIONS_TRI.some((opt) => opt.valeur === valeur);
}

function anneeEffective(objet: ObjetCatalogue): number | null {
  if (objet.annee !== null) return objet.annee;
  if (objet.dateSortie && /^\d{4}/.test(objet.dateSortie)) {
    return Number(objet.dateSortie.slice(0, 4));
  }
  return null;
}

function dateIsoValide(objet: ObjetCatalogue): string | null {
  return objet.dateSortie && /^\d{4}-\d{2}-\d{2}$/.test(objet.dateSortie)
    ? objet.dateSortie
    : null;
}

function comparerNumeros(
  a: number | null,
  b: number | null,
  sens: 1 | -1,
): number {
  if (a === null || b === null) {
    if (a !== null) return -1;
    if (b !== null) return 1;
    return 0;
  }
  return (a - b) * sens;
}

function comparerParDate(
  a: ObjetCatalogue,
  b: ObjetCatalogue,
  sens: 1 | -1,
): number {
  const anA = anneeEffective(a);
  const anB = anneeEffective(b);
  if (anA === null || anB === null) {
    if (anA !== null) return -1;
    if (anB !== null) return 1;
  } else if (anA !== anB) {
    return (anA - anB) * sens;
  }

  const dateA = dateIsoValide(a);
  const dateB = dateIsoValide(b);
  if (dateA !== null && dateB !== null) {
    const cmpDate = dateA.localeCompare(dateB);
    if (cmpDate !== 0) return cmpDate * sens;
  } else if (dateA !== null || dateB !== null) {
    return dateA !== null ? -1 : 1;
  }

  const cmpNum = comparerNumeros(a.numero, b.numero, sens);
  if (cmpNum !== 0) return cmpNum;

  const cmpTitre = COLLATEUR_FR.compare(a.titre, b.titre);
  if (cmpTitre !== 0) return cmpTitre;
  return a.id.localeCompare(b.id);
}

function comparerParTitre(
  a: ObjetCatalogue,
  b: ObjetCatalogue,
  sens: 1 | -1,
): number {
  const cmpTitre = COLLATEUR_FR.compare(a.titre, b.titre) * sens;
  if (cmpTitre !== 0) return cmpTitre;

  const cmpNum = comparerNumeros(a.numero, b.numero, sens);
  if (cmpNum !== 0) return cmpNum;
  return a.id.localeCompare(b.id);
}

function comparerParNumero(a: ObjetCatalogue, b: ObjetCatalogue): number {
  const cmpNum = comparerNumeros(a.numero, b.numero, 1);
  if (cmpNum !== 0) return cmpNum;

  const cmpTitre = COLLATEUR_FR.compare(a.titre, b.titre);
  if (cmpTitre !== 0) return cmpTitre;
  return comparerParDate(a, b, 1);
}

/** Retourne une copie triée des objets selon le critère choisi. */
export function trierObjets(
  objets: readonly ObjetCatalogue[],
  tri: TriCatalogue,
): ObjetCatalogue[] {
  const copie = [...objets];
  switch (tri) {
    case "anciens":
      return copie.sort((a, b) => comparerParDate(a, b, 1));
    case "recents":
      return copie.sort((a, b) => comparerParDate(a, b, -1));
    case "az":
      return copie.sort((a, b) => comparerParTitre(a, b, 1));
    case "za":
      return copie.sort((a, b) => comparerParTitre(a, b, -1));
    case "numero":
      return copie.sort(comparerParNumero);
  }
}
