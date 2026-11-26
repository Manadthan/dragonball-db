import { describe, expect, it } from "vitest";
import {
  anneesProposees,
  editeursProposes,
  filtrerObjets,
  filtresDepuisParametres,
  SANS_FILTRE,
  versParametres,
} from "./filtres";
import type { ObjetCatalogue } from "./types";

const OBJETS: ObjetCatalogue[] = [
  {
    id: "1",
    slug: "tome-1",
    categorie: "manga-livre",
    ere: "dragon-ball",
    marche: "FR",
    titre: "Dragon Ball — Tome 1",
    titreOriginal: "ドラゴンボール 1",
    editeur: "Glénat",
    annee: 1993,
    reference: "9782723418560",
    imageUrl: null,
  },
  {
    id: "2",
    slug: "carddass-1",
    categorie: "carte",
    ere: "dragon-ball",
    marche: "JAP",
    titre: "Carddass Hondan Part 1",
    titreOriginal: null,
    editeur: "Bandai",
    annee: 1988,
    reference: "DP-01",
    imageUrl: null,
  },
  {
    id: "3",
    slug: "bt3",
    categorie: "jeu",
    ere: "dbz",
    marche: "FR",
    titre: "Budokai Tenkaichi 3",
    titreOriginal: "Sparking! METEOR",
    editeur: "Bandai Namco",
    annee: 2008,
    reference: null,
    imageUrl: null,
  },
];

describe("filtres URL dragonball-db", () => {
  it("lit et sérialise les filtres (catégorie, ère, marché, éditeur, année, recherche, collection)", () => {
    const f = filtresDepuisParametres(
      "?categorie=manga-livre&ere=dragon-ball&marche=fr&editeur=Gl%C3%A9nat&annee=1993&q=tome&collection=possedes",
    );
    expect(f).toEqual({
      categorie: "manga-livre",
      ere: "dragon-ball",
      marche: "FR",
      editeur: "Glénat",
      annee: "1993",
      q: "tome",
      collection: "possedes",
    });
    expect(versParametres(f)).toBe(
      "?categorie=manga-livre&ere=dragon-ball&marche=fr&editeur=Gl%C3%A9nat&annee=1993&q=tome&collection=possedes",
    );
  });

  it("ignore les valeurs inconnues", () => {
    expect(
      filtresDepuisParametres("?categorie=inconnu&ere=xyz&marche=uk&annee=99&collection=tout"),
    ).toEqual(SANS_FILTRE);
  });

  it("filtre par critères combinés et recherche insensible aux accents", () => {
    expect(
      filtrerObjets(OBJETS, { ...SANS_FILTRE, categorie: "manga-livre", marche: "FR" }).map(
        (o) => o.slug,
      ),
    ).toEqual(["tome-1"]);
    expect(
      filtrerObjets(OBJETS, { ...SANS_FILTRE, q: "glenat" }).map((o) => o.slug),
    ).toEqual(["tome-1"]);
    expect(
      filtrerObjets(OBJETS, { ...SANS_FILTRE, ere: "dbz", annee: "2008" }).map(
        (o) => o.slug,
      ),
    ).toEqual(["bt3"]);
  });

  it("propose éditeurs triés et années décroissantes", () => {
    expect(editeursProposes(OBJETS)).toEqual(["Bandai", "Bandai Namco", "Glénat"]);
    expect(anneesProposees(OBJETS)).toEqual(["2008", "1993", "1988"]);
  });
});
