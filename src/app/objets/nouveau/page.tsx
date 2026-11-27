import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EnTete } from "@/components/EnTete";
import { FormulaireObjet } from "@/components/FormulaireObjet";
import { estProprietaireServeur } from "@/lib/auth/proprietaire";

export const metadata: Metadata = {
  title: "Ajouter un objet · Dragon Ball DB",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PageNouvelObjet() {
  if (!(await estProprietaireServeur())) {
    redirect("/connexion");
  }

  return (
    <>
      <EnTete />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 pt-4 pb-12">
        <Link
          href="/"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          ← Retour au catalogue
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="font-titre text-2xl font-bold tracking-tight">
            Ajouter un objet
          </h1>
          <p className="text-sm text-texte-doux">
            Nouvel élément dans le catalogue Dragon Ball DB.
          </p>
        </div>

        <FormulaireObjet mode="creation" />
      </main>
    </>
  );
}
