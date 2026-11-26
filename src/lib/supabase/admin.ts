import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { readSecretKey, supabaseEnv } from "./env";

export function createSupabaseAdminClient() {
  const { url } = supabaseEnv();
  return createClient<Database, "dragonball">(url, readSecretKey(process.env), {
    db: { schema: "dragonball" },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
