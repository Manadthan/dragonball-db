import { describe, expect, it } from "vitest";
import type { ObjetCatalogue } from "@/lib/catalogue/types";
import {
  avecObjet,
  ensemblePossessions,
  filtrerCollection,
  possedeObjet,
} from "./collection";

const objet = (id: string): ObjetCatalogue => ({
  id,
  slug: id,
  categorie: "manga-livre",
  ere: "dragon-ball",
  marche: "FR",
  titre: id,
  titreOriginal: null,
  editeur: "Glénat",
  annee: 1993,
  reference: null,
  imageUrl: null,
});

describe("collection dragonball-db", () => {
  it("gère l'ajout, le retrait et le filtre possédés / manquants", () => {
    const initial = ensemblePossessions([{ objet_id: "o1" }]);
    expect(possedeObjet(initial, "o1")).toBe(true);
    expect(possedeObjet(initial, "o2")).toBe(false);

    const avec = avecObjet(initial, "o2", true);
    expect(possedeObjet(avec, "o2")).toBe(true);
    expect(possedeObjet(initial, "o2")).toBe(false);

    const sans = avecObjet(avec, "o1", false);
    expect(possedeObjet(sans, "o1")).toBe(false);

    const objets = [objet("o1"), objet("o2")];
    expect(filtrerCollection(objets, "possedes", initial).map((o) => o.id)).toEqual(["o1"]);
    expect(filtrerCollection(objets, "manquants", initial).map((o) => o.id)).toEqual(["o2"]);
    expect(filtrerCollection(objets, null, initial)).toHaveLength(2);
  });
});
