import { describe, expect, it } from "vitest";
import type { ObjetCatalogue } from "@/lib/catalogue/types";
import { ensemblePossessions } from "@/lib/collection/collection";
import { calculerSuivi, verifierJetonSuivi } from "./suivi";

const BASE = {
  titreOriginal: null,
  edition: null,
  numero: null,
  dateSortie: null,
  reference: null,
  details: null,
  lienOfficiel: null,
  imagePath: null,
};

const OBJETS: ObjetCatalogue[] = [
  {
    ...BASE,
    id: "o1",
    slug: "dbz-dvd-jp-01",
    categorie: "video",
    ere: "dbz",
    marche: "JAP",
    titre: "Dragon Ball Z — DVD #1",
    editeur: "Pony Canyon",
    edition: "DVD individuels",
    numero: 1,
    annee: 2005,
    reference: "PCBC-50781",
    imageUrl: "https://exemple.fr/dvd1-680.webp",
  },
  {
    ...BASE,
    id: "o2",
    slug: "dbz-dvd-jp-02",
    categorie: "video",
    ere: "dbz",
    marche: "JAP",
    titre: "Dragon Ball Z — DVD #2",
    editeur: "Pony Canyon",
    edition: "DVD individuels",
    numero: 2,
    annee: 2005,
    reference: "PCBC-50782",
    imageUrl: null,
  },
  {
    ...BASE,
    id: "o3",
    slug: "dbz-dragon-box",
    categorie: "video",
    ere: "dbz",
    marche: "JAP",
    titre: "Dragon Ball Z — Dragon Box Vol. 1",
    editeur: "Pony Canyon",
    edition: "Dragon Box",
    numero: 1,
    annee: 2003,
    imageUrl: "https://exemple.fr/box1.webp",
  },
];

describe("verifierJetonSuivi", () => {
  it("valide le jeton Bearer en temps constant", () => {
    expect(verifierJetonSuivi("Bearer db-secret", "db-secret")).toBe(true);
    expect(verifierJetonSuivi("Bearer faux", "db-secret")).toBe(false);
    expect(verifierJetonSuivi(null, "db-secret")).toBe(false);
    expect(verifierJetonSuivi("Bearer db-secret", "")).toBe(false);
  });
});

describe("calculerSuivi", () => {
  const possessions = ensemblePossessions([{ objet_id: "o1" }]);

  it("calcule possédés, total, couverture, titre suggéré avec ?edition= et retire ?collection=", () => {
    expect(
      calculerSuivi({
        search:
          "?categorie=video&ere=dbz&marche=jap&edition=DVD+individuels&collection=manquants",
        objets: OBJETS,
        possessions,
      }),
    ).toEqual({
      source: "dragonball-db",
      owned: 1,
      total: 2,
      coverUrl: "https://exemple.fr/dvd1-680.webp",
      suggestedTitle: "DVD / Blu-ray · DBZ · DVD individuels · Japon",
      url: "https://dragonball-db.vercel.app/?categorie=video&ere=dbz&marche=jap&edition=DVD+individuels",
    });
  });

  it("retombe sur « Dragon Ball DB » sans filtre", () => {
    const res = calculerSuivi({ search: "", objets: OBJETS, possessions });
    expect(res.suggestedTitle).toBe("Dragon Ball DB");
    expect(res.owned).toBe(1);
    expect(res.total).toBe(3);
    expect(res.url).toBe("https://dragonball-db.vercel.app/");
  });
});
