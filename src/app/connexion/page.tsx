import type { Metadata } from "next";
import Link from "next/link";
import { seDeconnecter } from "@/app/actions/auth";
import { EnTete } from "@/components/EnTete";
import { FormulaireConnexion } from "@/components/FormulaireConnexion";
import { supabaseEnvOptionnel } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Connexion · Dragon Ball DB",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function lireEmailConnecte(): Promise<string | null> {
  if (!supabaseEnvOptionnel()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export default async function PageConnexion() {
  const email = await lireEmailConnecte();

  return (
    <>
      <EnTete />
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-8 pb-12">
        <Link
          href="/"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          ← Retour au catalogue
        </Link>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-titre text-2xl font-bold tracking-tight">
            Connexion
          </h1>
          <p className="text-sm text-texte-doux">
            Connectez-vous pour cocher vos objets possédés (« Je l&apos;ai ») et
            synchroniser votre suivi.
          </p>
        </div>

        {email ? (
          <div className="flex flex-col gap-4 rounded-xl border border-bordure bg-carte p-4">
            <p className="text-sm text-texte-doux">
              Connecté en tant que{" "}
              <span className="font-semibold text-texte">{email}</span>.
            </p>
            <form action={seDeconnecter}>
              <button
                type="submit"
                className="h-12 w-full rounded-xl border border-bordure bg-surface text-sm font-semibold text-texte"
              >
                Se déconnecter sur cet appareil
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border border-bordure bg-carte p-4">
            <FormulaireConnexion />
          </div>
        )}
      </main>
    </>
  );
}
