import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  exigerProprietaire,
  televerserVisuel,
  supprimerVisuelStocke,
  revalidatePath,
  redirect,
  insert,
  updateEq,
  deleteEq,
  maybeSingle,
} = vi.hoisted(() => ({
  exigerProprietaire: vi.fn(),
  televerserVisuel: vi.fn(),
  supprimerVisuelStocke: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  insert: vi.fn(),
  updateEq: vi.fn(),
  deleteEq: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/auth/proprietaire", () => ({ exigerProprietaire }));
vi.mock("@/lib/visuels/televersement", () => ({
  televerserVisuel,
  supprimerVisuelStocke,
}));

import { creerObjet, modifierObjet, supprimerObjet } from "./objets";

const ID = "00000000-0000-0000-0000-000000000010";

function form(champs: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(champs)) fd.set(k, v);
  return fd;
}

describe("actions CRUD objets (propriétaire)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    exigerProprietaire.mockResolvedValue({
      from: () => ({
        insert,
        select: () => ({ eq: () => ({ maybeSingle }) }),
        update: () => ({ eq: updateEq }),
        delete: () => ({ eq: deleteEq }),
      }),
    });
  });

  it("crée un objet valide, révalide / et redirige vers sa fiche", async () => {
    insert.mockResolvedValueOnce({ error: null });
    await expect(
      creerObjet(
        {},
        form({
          titre: "Dragon Ball — Tome 2",
          categorie: "manga-livre",
          ere: "dragon-ball",
          marche: "FR",
          editeur: "Glénat",
          annee: "1993",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/objets/dragon-ball-tome-2");

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "dragon-ball-tome-2",
        titre: "Dragon Ball — Tome 2",
        image_path: null,
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/objets/dragon-ball-tome-2");
  });

  it("signale un doublon de slug (code 23505)", async () => {
    insert.mockResolvedValueOnce({ error: { code: "23505", message: "dup" } });
    const res = await creerObjet(
      {},
      form({
        titre: "Dragon Ball — Tome 1",
        categorie: "manga-livre",
        ere: "dragon-ball",
        marche: "FR",
      }),
    );
    expect(res.erreurs?.[0]).toMatch(/existe déjà/i);
  });

  it("modifie un objet, supprime son ancien visuel si demandé et révalide", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { slug: "ancien-slug", image_path: "ancien-v1" },
      error: null,
    });
    updateEq.mockResolvedValueOnce({ error: null });

    await expect(
      modifierObjet(
        {},
        form({
          id: ID,
          slug: "nouveau-slug",
          titre: "Nouveau titre",
          categorie: "video",
          ere: "dbz",
          marche: "JAP",
          supprimer_visuel: "on",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/objets/nouveau-slug");

    expect(supprimerVisuelStocke).toHaveBeenCalledWith(
      expect.anything(),
      "ancien-v1",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/objets/ancien-slug");
    expect(revalidatePath).toHaveBeenCalledWith("/objets/nouveau-slug");
  });

  it("supprime un objet, nettoie son visuel et redirige vers /", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { slug: "a-supprimer", image_path: "a-supprimer-v1" },
      error: null,
    });
    deleteEq.mockResolvedValueOnce({ error: null });

    await expect(supprimerObjet({}, form({ id: ID }))).rejects.toThrow(
      "REDIRECT:/",
    );
    expect(supprimerVisuelStocke).toHaveBeenCalledWith(
      expect.anything(),
      "a-supprimer-v1",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/objets/a-supprimer");
  });
});
