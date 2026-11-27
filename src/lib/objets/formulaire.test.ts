import { describe, expect, it } from "vitest";
import { genererSlug, validerObjetFormulaire } from "./formulaire";

function form(champs: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(champs)) fd.set(k, v);
  return fd;
}

describe("formulaire d'objet dragonball-db", () => {
  it("génère un slug propre sans accents ni caractères spéciaux", () => {
    expect(genererSlug("Dragon Ball Z — Édition Spéciale #1")).toBe(
      "dragon-ball-z-edition-speciale-1",
    );
    expect(genererSlug("  S.H.Figuarts Son Gokū (2026)! ")).toBe(
      "s-h-figuarts-son-goku-2026",
    );
  });

  it("valide une saisie complète et déduit l'année depuis la date de sortie", () => {
    const res = validerObjetFormulaire(
      form({
        titre: "Dragon Ball — DVD #1",
        categorie: "video",
        ere: "dragon-ball",
        marche: "jap",
        editeur: "Pony Canyon",
        edition: "DVD individuels",
        numero: "1",
        date_sortie: "2007-04-04",
        reference: "PCBC-51101",
        lien_officiel: "https://www.ponycanyon.co.jp/visual/PCBC000051101",
        details: "Épisodes 1 à 6",
      }),
    );
    expect(res).toEqual({
      ok: true,
      donnees: {
        slug: "dragon-ball-dvd-1",
        categorie: "video",
        ere: "dragon-ball",
        marche: "JAP",
        titre: "Dragon Ball — DVD #1",
        titre_original: null,
        editeur: "Pony Canyon",
        edition: "DVD individuels",
        numero: 1,
        annee: 2007,
        date_sortie: "2007-04-04",
        reference: "PCBC-51101",
        details: "Épisodes 1 à 6",
        lien_officiel: "https://www.ponycanyon.co.jp/visual/PCBC000051101",
        image_url: null,
      },
    });
  });

  it("rejette les valeurs invalides (titre vide, année hors bornes, URL javascript, volume négatif)", () => {
    const res = validerObjetFormulaire(
      form({
        titre: "   ",
        slug: "../hack",
        categorie: "inconnue",
        ere: "autre",
        marche: "UK",
        numero: "0",
        annee: "1970",
        date_sortie: "02/11/2005",
        lien_officiel: "javascript:alert(1)",
        image_url: "ftp://example.com/a.jpg",
      }),
    );
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.erreurs.length).toBeGreaterThanOrEqual(8);
    }
  });
});
