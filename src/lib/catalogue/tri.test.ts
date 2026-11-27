import { describe, expect, it } from "vitest";
import { estTriCatalogue, TRI_PAR_DEFAUT, trierObjets } from "./tri";
import type { ObjetCatalogue } from "./types";

const BASE: Omit<
  ObjetCatalogue,
  "id" | "slug" | "titre" | "annee" | "dateSortie" | "numero"
> = {
  categorie: "manga-livre",
  ere: "dragon-ball",
  marche: "FR",
  titreOriginal: null,
  editeur: "Glénat",
  edition: null,
  reference: null,
  details: null,
  lienOfficiel: null,
  imagePath: null,
  imageUrl: null,
};

const OBJETS: ObjetCatalogue[] = [
  {
    ...BASE,
    id: "a",
    slug: "tome-10",
    titre: "Dragon Ball — Tome 10",
    annee: 1995,
    dateSortie: "1995-04-12",
    numero: 10,
  },
  {
    ...BASE,
    id: "b",
    slug: "tome-2",
    titre: "Dragon Ball — Tome 2",
    annee: 1993,
    dateSortie: "1993-06-15",
    numero: 2,
  },
  {
    ...BASE,
    id: "c",
    slug: "artbook-sans-date",
    titre: "Artbook Daizenshuu",
    annee: null,
    dateSortie: null,
    numero: null,
  },
  {
    ...BASE,
    id: "d",
    slug: "tome-1",
    titre: "Dragon Ball — Tome 1",
    annee: 1993,
    dateSortie: "1993-02-10",
    numero: 1,
  },
  {
    ...BASE,
    id: "e",
    slug: "guide-1993-sans-jour",
    titre: "Guide Dragon Ball",
    annee: 1993,
    dateSortie: null,
    numero: null,
  },
  {
    ...BASE,
    id: "f",
    slug: "super-broly",
    titre: "Super Broly",
    annee: 2022,
    dateSortie: "2022-06-10",
    numero: 14,
  },
];

describe("tri du catalogue dragonball-db", () => {
  it("valide les clés de tri connues", () => {
    expect(TRI_PAR_DEFAUT).toBe("anciens");
    expect(estTriCatalogue("anciens")).toBe(true);
    expect(estTriCatalogue("recents")).toBe(true);
    expect(estTriCatalogue("az")).toBe(true);
    expect(estTriCatalogue("za")).toBe(true);
    expect(estTriCatalogue("numero")).toBe(true);
    expect(estTriCatalogue("inconnu")).toBe(false);
    expect(estTriCatalogue(null)).toBe(false);
  });

  it("trie du plus ancien au plus récent en gardant les objets sans date à la fin", () => {
    const ordre = trierObjets(OBJETS, "anciens").map((o) => o.slug);
    expect(ordre).toEqual([
      "tome-1",
      "tome-2",
      "guide-1993-sans-jour",
      "tome-10",
      "super-broly",
      "artbook-sans-date",
    ]);
  });

  it("trie du plus récent au plus ancien en gardant les objets sans date à la fin", () => {
    const ordre = trierObjets(OBJETS, "recents").map((o) => o.slug);
    expect(ordre).toEqual([
      "super-broly",
      "tome-10",
      "tome-2",
      "tome-1",
      "guide-1993-sans-jour",
      "artbook-sans-date",
    ]);
  });

  it("trie par titre A → Z avec tri numérique naturel (Tome 2 avant Tome 10)", () => {
    const ordre = trierObjets(OBJETS, "az").map((o) => o.slug);
    expect(ordre).toEqual([
      "artbook-sans-date",
      "tome-1",
      "tome-2",
      "tome-10",
      "guide-1993-sans-jour",
      "super-broly",
    ]);
  });

  it("trie par titre Z → A avec tri numérique naturel", () => {
    const ordre = trierObjets(OBJETS, "za").map((o) => o.slug);
    expect(ordre).toEqual([
      "super-broly",
      "guide-1993-sans-jour",
      "tome-10",
      "tome-2",
      "tome-1",
      "artbook-sans-date",
    ]);
  });

  it("trie par numéro / tome croissant et place les objets sans numéro à la fin", () => {
    const ordre = trierObjets(OBJETS, "numero").map((o) => o.slug);
    expect(ordre).toEqual([
      "tome-1",
      "tome-2",
      "tome-10",
      "super-broly",
      "artbook-sans-date",
      "guide-1993-sans-jour",
    ]);
  });

  it("ne mute pas le tableau d'entrée", () => {
    const avant = OBJETS.map((o) => o.slug);
    trierObjets(OBJETS, "recents");
    expect(OBJETS.map((o) => o.slug)).toEqual(avant);
  });
});
