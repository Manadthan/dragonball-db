import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseEnv } from "./env";

export function createSupabasePublicClient() {
  const { url, key } = supabaseEnv();
  return createClient<Database, "dragonball">(url, key, {
    db: { schema: "dragonball" },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
