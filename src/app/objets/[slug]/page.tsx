import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseObjet } from "@/components/CaseObjet";
import { EnTete } from "@/components/EnTete";
import { JaquetteObjet } from "@/components/JaquetteObjet";
import { chargerObjetParSlug } from "@/lib/catalogue/charger";
import {
  formaterDateSortie,
  libelleCategorie,
  libelleEre,
  libelleMarche,
} from "@/lib/catalogue/types";

export const revalidate = 300;

function Info({
  libelle,
  valeur,
  pleineLargeur = false,
}: {
  libelle: string;
  valeur: string | null;
  pleineLargeur?: boolean;
}) {
  return (
    <div className={pleineLargeur ? "col-span-2" : undefined}>
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

  const dateFormatee =
    formaterDateSortie(objet.dateSortie) ??
    (objet.annee ? String(objet.annee) : null);

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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="mx-auto w-52 shrink-0 sm:mx-0 sm:w-56">
            <JaquetteObjet
              objet={objet}
              sizes="(max-width: 640px) 208px, 224px"
              prioritaire
            />
          </div>

          <div className="flex flex-1 flex-col gap-3">
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
                {objet.edition && (
                  <span className="flex h-6 items-center rounded-md bg-surface px-2 text-xs font-semibold text-texte-doux">
                    {objet.edition}
                  </span>
                )}
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

            {objet.lienOfficiel && (
              <a
                href={objet.lienOfficiel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-bordure bg-carte px-4 text-sm font-semibold text-accent hover:border-accent"
              >
                Page officielle ({objet.editeur ?? "éditeur"}) ↗
              </a>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-3.5 rounded-xl border border-bordure bg-carte p-4">
          <Info
            libelle="Catégorie"
            valeur={libelleCategorie(objet.categorie)}
          />
          <Info libelle="Série / Ère" valeur={libelleEre(objet.ere)} />
          <Info libelle="Marché" valeur={libelleMarche(objet.marche)} />
          <Info libelle="Éditeur" valeur={objet.editeur} />
          {objet.edition && <Info libelle="Édition" valeur={objet.edition} />}
          {objet.numero !== null && (
            <Info libelle="Volume" valeur={`#${objet.numero}`} />
          )}
          <Info libelle="Date de sortie" valeur={dateFormatee} />
          <Info libelle="Référence / ISBN" valeur={objet.reference} />
          {objet.details && (
            <Info libelle="Détails" valeur={objet.details} pleineLargeur />
          )}
        </dl>
      </main>
    </>
  );
}
