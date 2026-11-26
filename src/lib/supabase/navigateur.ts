"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let client: SupabaseClient<Database, "dragonball"> | null = null;

export function aCookieSession(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith("sb-"));
}

export async function clientNavigateur(): Promise<SupabaseClient<
  Database,
  "dragonball"
> | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  if (!client) {
    const { createBrowserClient } = await import("@supabase/ssr");
    client = createBrowserClient<Database, "dragonball">(url, key, {
      db: { schema: "dragonball" },
    });
  }
  return client;
}

export async function clientSiSession(): Promise<SupabaseClient<
  Database,
  "dragonball"
> | null> {
  if (!aCookieSession()) return null;
  return clientNavigateur();
}
