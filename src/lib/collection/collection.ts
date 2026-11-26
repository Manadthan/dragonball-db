import type { FiltreCollection } from "@/lib/catalogue/filtres";
import type { ObjetCatalogue } from "@/lib/catalogue/types";

export function ensemblePossessions(
  lignes: readonly { objet_id: string }[],
): ReadonlySet<string> {
  return new Set(lignes.map((l) => l.objet_id));
}

export const possedeObjet = (
  possessions: ReadonlySet<string>,
  objetId: string,
) => possessions.has(objetId);

export function avecObjet(
  possessions: ReadonlySet<string>,
  objetId: string,
  avoir: boolean,
): ReadonlySet<string> {
  const suite = new Set(possessions);
  if (avoir) suite.add(objetId);
  else suite.delete(objetId);
  return suite;
}

export function filtrerCollection(
  objets: readonly ObjetCatalogue[],
  filtre: FiltreCollection | null,
  possessions: ReadonlySet<string>,
): ObjetCatalogue[] {
  if (!filtre) return [...objets];
  return objets.filter(
    (o) => possedeObjet(possessions, o.id) === (filtre === "possedes"),
  );
}
