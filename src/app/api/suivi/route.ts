import { chargerCatalogue } from "@/lib/catalogue/charger";
import { ensemblePossessions } from "@/lib/collection/collection";
import {
  calculerSuivi,
  URL_SITE_DEFAUT,
  verifierJetonSuivi,
} from "@/lib/suivi/suivi";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseEnvOptionnel } from "@/lib/supabase/env";
import { toutesLesPages } from "@/lib/supabase/pages";

export const dynamic = "force-dynamic";

const ENTETES = { "Cache-Control": "no-store" } as const;

async function chargerPossessionsProprietaire(): Promise<ReadonlySet<string>> {
  if (!supabaseEnvOptionnel() || !process.env.SUPABASE_SECRET_KEY?.trim()) {
    return new Set();
  }
  const admin = createSupabaseAdminClient();
  const { data: proprietaire, error } = await admin
    .from("profils")
    .select("user_id")
    .eq("role", "proprietaire")
    .order("cree_le")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Propriétaire illisible : ${error.message}`);
  if (!proprietaire) return new Set();

  const lignes = await toutesLesPages<{ objet_id: string }>(
    (de, a) =>
      admin
        .from("possessions")
        .select("objet_id")
        .eq("user_id", proprietaire.user_id)
        .order("objet_id")
        .range(de, a),
    "Possessions",
  );
  return ensemblePossessions(lignes);
}

export async function GET(request: Request) {
  const jeton = process.env.SUIVI_API_TOKEN?.trim();
  if (!jeton) {
    return Response.json(
      { error: "Suivi non configuré" },
      { status: 503, headers: ENTETES },
    );
  }
  if (!verifierJetonSuivi(request.headers.get("authorization"), jeton)) {
    return Response.json(
      { error: "Non autorisé" },
      { status: 401, headers: ENTETES },
    );
  }

  const search = new URL(request.url).search;
  const [objets, possessions] = await Promise.all([
    chargerCatalogue(),
    chargerPossessionsProprietaire(),
  ]);

  const reponse = calculerSuivi({
    search,
    objets,
    possessions,
    urlSite: process.env.NEXT_PUBLIC_SITE_URL?.trim() || URL_SITE_DEFAUT,
  });

  return Response.json(reponse, { headers: ENTETES });
}
