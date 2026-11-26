import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseObjet } from "@/components/CaseObjet";
import { EnTete } from "@/components/EnTete";
import { chargerObjetParSlug } from "@/lib/catalogue/charger";
import {
  libelleCategorie,
  libelleEre,
  libelleMarche,
} from "@/lib/catalogue/types";

export const revalidate = 300;

function Info({ libelle, valeur }: { libelle: string; valeur: string | null }) {
  return (
    <div>
      <dt className="text-xs text-texte-discret">{libelle}</dt>
      <dd className="mt-0.5 text-sm font-medium">{valeur ?? "—"}</dd>
    </div>
  );
}

export default async function PageObjet({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const objet = await chargerObjetParSlug(slug);
  if (!objet) notFound();

  return (
    <>
      <EnTete />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pt-4 pb-10">
        <Link
          href="/"
          className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
        >
          ← Retour au catalogue
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span className="flex h-6 items-center rounded-md bg-accent-doux px-2 text-xs font-semibold text-accent-fonce">
              {libelleCategorie(objet.categorie)}
            </span>
            <span className="flex h-6 items-center rounded-md bg-surface px-2 text-xs font-semibold text-texte-doux">
              {libelleEre(objet.ere)}
            </span>
            <span className="flex h-6 items-center rounded-md bg-surface px-2 text-xs font-semibold text-texte-doux">
              {libelleMarche(objet.marche)}
            </span>
          </div>
          <h1 className="font-titre text-2xl leading-tight font-bold tracking-tight">
            {objet.titre}
          </h1>
          {objet.titreOriginal && (
            <p lang="ja" className="text-sm text-texte-discret">
              {objet.titreOriginal}
            </p>
          )}
        </div>

        <CaseObjet objetId={objet.id} />

        <dl className="grid grid-cols-2 gap-x-3 gap-y-3.5 rounded-xl border border-bordure bg-carte p-4">
          <Info libelle="Catégorie" valeur={libelleCategorie(objet.categorie)} />
          <Info libelle="Série / Ère" valeur={libelleEre(objet.ere)} />
          <Info libelle="Marché" valeur={libelleMarche(objet.marche)} />
          <Info libelle="Éditeur" valeur={objet.editeur} />
          <Info
            libelle="Année"
            valeur={objet.annee ? String(objet.annee) : null}
          />
          <Info libelle="Référence / ISBN" valeur={objet.reference} />
        </dl>
      </main>
    </>
  );
}
