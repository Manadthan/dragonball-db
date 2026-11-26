import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithPassword, signOut, redirect } = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { signInWithPassword, signOut },
  })),
}));

import { seConnecter, seDeconnecter } from "./auth";

function formulaire(champs: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(champs)) fd.set(k, v);
  return fd;
}

describe("actions d'authentification dragonball-db", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuse des champs vides sans appeler Supabase", async () => {
    const res = await seConnecter({}, formulaire({ email: "", password: "" }));
    expect(res.erreur).toMatch(/e-mail/i);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("renvoie un message vague en cas d'identifiants refusés (HTTP 400)", async () => {
    signInWithPassword.mockResolvedValueOnce({ error: { status: 400 } });
    const res = await seConnecter(
      {},
      formulaire({ email: "moi@test.fr", password: "faux" }),
    );
    expect(res).toEqual({
      erreur: "E-mail ou mot de passe incorrect.",
      email: "moi@test.fr",
    });
  });

  it("redirige vers l'accueil après connexion réussie", async () => {
    signInWithPassword.mockResolvedValueOnce({ error: null });
    await expect(
      seConnecter({}, formulaire({ email: "moi@test.fr", password: "ok" })),
    ).rejects.toThrow("REDIRECT:/");
  });

  it("déconnecte uniquement l'appareil courant (scope: local)", async () => {
    signOut.mockResolvedValueOnce({ error: null });
    await expect(seDeconnecter()).rejects.toThrow("REDIRECT:/");
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});
