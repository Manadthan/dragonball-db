import { Catalogue } from "@/components/Catalogue";
import { EnTete } from "@/components/EnTete";
import { chargerCatalogue } from "@/lib/catalogue/charger";

export const revalidate = 300;

export default async function Home() {
  const objets = await chargerCatalogue();

  return (
    <>
      <EnTete />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pt-4 pb-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-titre text-2xl font-bold tracking-tight">
            Catalogue Dragon Ball
          </h1>
          <p className="text-sm text-texte-doux">
            Mangas &amp; livres, DVD/Blu-ray, cartes, jeux vidéo et figurines.
          </p>
        </div>
        <Catalogue objets={objets} />
      </main>
    </>
  );
}
