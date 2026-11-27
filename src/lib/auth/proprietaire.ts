import "server-only";
import { supabaseEnvOptionnel } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Indique si la session courante appartient au propriétaire de Dragon Ball DB. */
export async function estProprietaireServeur(): Promise<boolean> {
  if (!supabaseEnvOptionnel()) return false;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data: estProp, error } = await supabase.rpc("est_proprietaire");
  return !error && estProp === true;
}

/** Exige une session propriétaire et renvoie le client Supabase authentifié (soumis à la RLS). */
export async function exigerProprietaire() {
  if (!supabaseEnvOptionnel()) {
    throw new Error("Supabase n'est pas configuré.");
  }
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("Connexion requise pour modifier le catalogue.");
  }
  const { data: estProp, error } = await supabase.rpc("est_proprietaire");
  if (error || estProp !== true) {
    throw new Error("Action réservée au propriétaire du catalogue.");
  }
  return supabase;
}
