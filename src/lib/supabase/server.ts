import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

/**
 * Client Supabase côté serveur (composants serveur, server actions, routes) ciblant le schéma `dragonball`.
 * La session utilisateur est lue dans les cookies afin que la RLS s'applique en son nom.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();

  return createServerClient<Database, "dragonball">(url, key, {
    db: { schema: "dragonball" },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un composant serveur en lecture seule : sans gravité.
        }
      },
    },
  });
}
