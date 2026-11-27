import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EnTete } from "@/components/EnTete";
import { FormulaireObjet } from "@/components/FormulaireObjet";
import { estProprietaireServeur } from "@/lib/auth/proprietaire";
import { chargerObjetParSlug } from "@/lib/catalogue/charger";

export const metadata: Metadata = {
  title: "Modifier un objet · Dragon Ball DB",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PageModifierObjet({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await estProprietaireServeur())) {
    redirect("/connexion");
  }

  const { slug } = await params;
  const objet = await chargerObjetParSlug(slug);
  if (!objet) notFound();

  return (
    <>
      <EnTete />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 pt-4 pb-12">
        <Link
          href={`/objets/${objet.slug}`}
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          ← Retour à la fiche
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="font-titre text-2xl font-bold tracking-tight">
            Modifier l&apos;objet
          </h1>
          <p className="text-sm text-texte-doux">{objet.titre}</p>
        </div>

        <FormulaireObjet mode="edition" objet={objet} />
      </main>
    </>
  );
}
