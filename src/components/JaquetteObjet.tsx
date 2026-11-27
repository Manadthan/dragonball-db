import { libelleCategorie, type ObjetCatalogue } from "@/lib/catalogue/types";
import { srcsetVisuel, urlVisuel } from "@/lib/visuels/stockage";

type Props = {
  objet: Pick<ObjetCatalogue, "titre" | "categorie" | "imagePath" | "imageUrl">;
  /** Largeur affichée pour guider le navigateur entre les variantes 300w et 680w. */
  sizes: string;
  /** Chargement prioritaire sur la fiche détail. */
  prioritaire?: boolean;
};

/**
 * Visuel d'un objet (jaquette DVD, couverture manga…) aux proportions DVD (68:100), jamais recadré.
 * Sans visuel : vignette neutre avec la catégorie et le titre (100 % jetons sémantiques clair/sombre).
 */
export function JaquetteObjet({ objet, sizes, prioritaire = false }: Props) {
  const srcSet = objet.imagePath ? srcsetVisuel(objet.imagePath) : null;
  const src =
    (objet.imagePath ? urlVisuel(objet.imagePath, 680) : null) ??
    objet.imageUrl;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- images déjà optimisées en WebP 300/680 dans dragonball-visuels
      <img
        src={src}
        srcSet={srcSet ?? undefined}
        sizes={srcSet ? sizes : undefined}
        width={680}
        height={1000}
        alt={`Jaquette de ${objet.titre}`}
        loading={prioritaire ? "eager" : "lazy"}
        decoding="async"
        className="aspect-[68/100] w-full rounded-lg border border-bordure bg-surface object-contain"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${objet.titre} — visuel à venir`}
      className="flex aspect-[68/100] w-full flex-col overflow-hidden rounded-lg border border-bordure bg-surface"
    >
      <div className="flex h-5 items-center bg-accent-doux px-2 text-[10px] font-bold tracking-wide text-accent-fonce uppercase">
        {libelleCategorie(objet.categorie)}
      </div>
      <div className="flex flex-1 items-center justify-center p-2.5 text-center text-xs leading-snug font-medium text-texte-doux">
        {objet.titre}
      </div>
    </div>
  );
}
