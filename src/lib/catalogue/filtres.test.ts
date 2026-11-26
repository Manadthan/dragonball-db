import { describe, expect, it } from "vitest";
import {
  anneesProposees,
  editeursProposes,
  editionsProposees,
  filtrerObjets,
  filtresDepuisParametres,
  SANS_FILTRE,
  versParametres,
} from "./filtres";
import { formaterDateSortie, type ObjetCatalogue } from "./types";

const BASE = {
  edition: null,
  numero: null,
  dateSortie: null,
  details: null,
  lienOfficiel: null,
  imagePath: null,
  imageUrl: null,
};

const OBJETS: ObjetCatalogue[] = [
  {
    ...BASE,
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
  },
  {
    ...BASE,
    id: "2",
    slug: "dbz-dvd-jp-01",
    categorie: "video",
    ere: "dbz",
    marche: "JAP",
    titre: "Dragon Ball Z — DVD #1",
    titreOriginal: "DRAGON BALL Z #1",
    editeur: "Pony Canyon",
    edition: "DVD individuels",
    numero: 1,
    annee: 2005,
    dateSortie: "2005-11-02",
    reference: "PCBC-50781",
    details: "Épisodes 1 à 6 · Couverture : Tadayoshi Yamamuro",
  },
  {
    ...BASE,
    id: "3",
    slug: "dbz-dragon-box",
    categorie: "video",
    ere: "dbz",
    marche: "JAP",
    titre: "Dragon Ball Z — Dragon Box Vol. 1",
    titreOriginal: null,
    editeur: "Pony Canyon",
    edition: "Dragon Box",
    numero: 1,
    annee: 2003,
    reference: "PCBC-50368",
  },
];

describe("filtres URL dragonball-db", () => {
  it("lit et sérialise les filtres (y compris ?edition=)", () => {
    const f = filtresDepuisParametres(
      "?categorie=video&ere=dbz&marche=jap&editeur=Pony+Canyon&edition=DVD+individuels&annee=2005&q=yamamuro&collection=possedes",
    );
    expect(f).toEqual({
      categorie: "video",
      ere: "dbz",
      marche: "JAP",
      editeur: "Pony Canyon",
      edition: "DVD individuels",
      annee: "2005",
      q: "yamamuro",
      collection: "possedes",
    });
    expect(versParametres(f)).toBe(
      "?categorie=video&ere=dbz&marche=jap&editeur=Pony+Canyon&edition=DVD+individuels&annee=2005&q=yamamuro&collection=possedes",
    );
  });

  it("ignore les valeurs inconnues", () => {
    expect(
      filtresDepuisParametres(
        "?categorie=inconnu&ere=xyz&marche=uk&annee=99&collection=tout",
      ),
    ).toEqual(SANS_FILTRE);
  });

  it("isole les DVD individuels du Dragon Box et cherche dans les détails", () => {
    expect(
      filtrerObjets(OBJETS, {
        ...SANS_FILTRE,
        categorie: "video",
        edition: "DVD individuels",
      }).map((o) => o.slug),
    ).toEqual(["dbz-dvd-jp-01"]);

    expect(
      filtrerObjets(OBJETS, { ...SANS_FILTRE, q: "yamamuro" }).map(
        (o) => o.slug,
      ),
    ).toEqual(["dbz-dvd-jp-01"]);
  });

  it("propose éditeurs, éditions et années triées", () => {
    expect(editeursProposes(OBJETS)).toEqual(["Glénat", "Pony Canyon"]);
    expect(editionsProposees(OBJETS)).toEqual([
      "Dragon Box",
      "DVD individuels",
    ]);
    expect(anneesProposees(OBJETS)).toEqual(["2005", "2003", "1993"]);
  });

  it("formate les dates de sortie en français", () => {
    expect(formaterDateSortie("2005-11-02")).toBe("2 novembre 2005");
    expect(formaterDateSortie("invalide")).toBeNull();
    expect(formaterDateSortie(null)).toBeNull();
  });
});
