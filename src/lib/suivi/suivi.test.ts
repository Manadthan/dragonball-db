import { describe, expect, it } from "vitest";
import type { ObjetCatalogue } from "@/lib/catalogue/types";
import { ensemblePossessions } from "@/lib/collection/collection";
import { calculerSuivi, verifierJetonSuivi } from "./suivi";

const OBJETS: ObjetCatalogue[] = [
  {
    id: "o1",
    slug: "tome-1",
    categorie: "manga-livre",
    ere: "dragon-ball",
    marche: "FR",
    titre: "Dragon Ball — Tome 1",
    titreOriginal: null,
    editeur: "Glénat",
    annee: 1993,
    reference: "9782723418560",
    imageUrl: "https://exemple.fr/tome1.webp",
  },
  {
    id: "o2",
    slug: "tome-2",
    categorie: "manga-livre",
    ere: "dragon-ball",
    marche: "FR",
    titre: "Dragon Ball — Tome 2",
    titreOriginal: null,
    editeur: "Glénat",
    annee: 1993,
    reference: null,
    imageUrl: null,
  },
  {
    id: "o3",
    slug: "carddass-1",
    categorie: "carte",
    ere: "dbz",
    marche: "JAP",
    titre: "Carddass Part 1",
    titreOriginal: null,
    editeur: "Bandai",
    annee: 1988,
    reference: null,
    imageUrl: "https://exemple.fr/card1.webp",
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

  it("calcule possédés, total, couverture, titre suggéré et retire ?collection=", () => {
    expect(
      calculerSuivi({
        search: "?categorie=manga-livre&marche=fr&collection=manquants",
        objets: OBJETS,
        possessions,
      }),
    ).toEqual({
      source: "dragonball-db",
      owned: 1,
      total: 2,
      coverUrl: "https://exemple.fr/tome1.webp",
      suggestedTitle: "Mangas & livres · France",
      url: "https://dragonball-db.vercel.app/?categorie=manga-livre&marche=fr",
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
