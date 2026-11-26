"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EtatConnexion = { erreur?: string; email?: string };

/** Connexion par e-mail et mot de passe (même compte Supabase Auth que mon-site-sdlc). */
export async function seConnecter(
  _precedent: EtatConnexion,
  formData: FormData,
): Promise<EtatConnexion> {
  const email = String(formData.get("email") ?? "").trim();
  const motDePasse = String(formData.get("password") ?? "");

  if (!email || !motDePasse) {
    return { erreur: "Saisissez votre e-mail et votre mot de passe.", email };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });

  if (error) {
    const identifiantsRefuses = error.status === 400;
    return {
      erreur: identifiantsRefuses
        ? "E-mail ou mot de passe incorrect."
        : "Connexion impossible pour le moment. Réessayez dans un instant.",
      email,
    };
  }

  redirect("/");
}

/** Déconnexion sur cet appareil uniquement (`scope: "local"`) pour ne pas fermer les autres sessions. */
export async function seDeconnecter() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}
