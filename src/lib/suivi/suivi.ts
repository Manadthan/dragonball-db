// Contrat commun GET /api/suivi (identique à nintendo-db, raccordable directement dans mon-site-sdlc).
import { timingSafeEqual } from "node:crypto";
import {
  filtrerObjets,
  filtresDepuisParametres,
  versParametres,
} from "@/lib/catalogue/filtres";
import {
  libelleCategorie,
  libelleEre,
  libelleMarche,
  type ObjetCatalogue,
} from "@/lib/catalogue/types";
import { possedeObjet } from "@/lib/collection/collection";

export const NOM_SITE = "Dragon Ball DB";
export const URL_SITE_DEFAUT = "https://dragonball-db.vercel.app";

export type ReponseSuivi = {
  source: "dragonball-db";
  owned: number;
  total: number;
  coverUrl: string | null;
  suggestedTitle: string;
  url: string;
};

/** Vérifie l'en-tête `Authorization: Bearer <jeton>` en temps constant (`timingSafeEqual`). */
export function verifierJetonSuivi(
  autorisation: string | null,
  attendu: string | undefined,
): boolean {
  const secret = attendu?.trim();
  if (!secret || !autorisation) return false;
  const correspondance = /^Bearer\s+(.+)$/i.exec(autorisation.trim());
  if (!correspondance) return false;
  const recu = Buffer.from(correspondance[1]!.trim(), "utf8");
  const ref = Buffer.from(secret, "utf8");
  if (recu.length !== ref.length) return false;
  return timingSafeEqual(recu, ref);
}

export function calculerSuivi({
  search,
  objets,
  possessions,
  urlSite = URL_SITE_DEFAUT,
}: {
  search: string;
  objets: readonly ObjetCatalogue[];
  possessions: ReadonlySet<string>;
  urlSite?: string;
}): ReponseSuivi {
  const filtres = { ...filtresDepuisParametres(search), collection: null };
  const filtresActifs = filtrerObjets(objets, filtres);
  const total = filtresActifs.length;
  const owned = filtresActifs.filter((o) =>
    possedeObjet(possessions, o.id),
  ).length;
  const coverUrl = filtresActifs.find((o) => o.imageUrl)?.imageUrl ?? null;

  const partiesTitre = [
    filtres.categorie ? libelleCategorie(filtres.categorie) : null,
    filtres.ere ? libelleEre(filtres.ere) : null,
    filtres.edition,
    filtres.editeur,
    filtres.annee,
    filtres.marche ? libelleMarche(filtres.marche) : null,
    filtres.q || null,
  ].filter((p): p is string => !!p);

  const suggestedTitle =
    partiesTitre.length > 0 ? partiesTitre.join(" · ") : NOM_SITE;

  const base = urlSite.replace(/\/+$/, "");
  const query = versParametres(filtres);
  const url = `${base}/${query}`;

  return {
    source: "dragonball-db",
    owned,
    total,
    coverUrl,
    suggestedTitle,
    url,
  };
}
