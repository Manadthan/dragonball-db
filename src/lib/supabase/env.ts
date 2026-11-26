export type SupabaseEnv = { url: string; key: string };

export function supabaseEnvOptionnel(
  env: Partial<Record<string, string | undefined>> = process.env,
): SupabaseEnv | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export function supabaseEnv(
  env: Partial<Record<string, string | undefined>> = process.env,
): SupabaseEnv {
  const config = supabaseEnvOptionnel(env);
  if (!config) {
    throw new Error(
      "Variables Supabase absentes (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }
  return config;
}

export function readSecretKey(
  env: Partial<Record<string, string | undefined>> = process.env,
): string {
  const key = env.SUPABASE_SECRET_KEY?.trim();
  if (!key) throw new Error("Variable SUPABASE_SECRET_KEY absente.");
  return key;
}
