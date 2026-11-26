"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  anneesProposees,
  editeursProposes,
  filtrerObjets,
  filtresDepuisParametres,
  SANS_FILTRE,
  versParametres,
  type FiltresCatalogue,
} from "@/lib/catalogue/filtres";
import {
  CATEGORIES,
  ERES,
  libelleCategorie,
  libelleEre,
  libelleMarche,
  MARCHES,
  type ObjetCatalogue,
} from "@/lib/catalogue/types";
import { filtrerCollection, possedeObjet } from "@/lib/collection/collection";
import { useCollection } from "@/lib/collection/navigateur";

function lireFiltresNavigateur(): FiltresCatalogue {
  if (typeof window === "undefined") return SANS_FILTRE;
  return filtresDepuisParametres(window.location.search);
}

export function Catalogue({ objets }: { objets: ObjetCatalogue[] }) {
  const [filtres, setFiltres] = useState<FiltresCatalogue>(() =>
    lireFiltresNavigateur(),
  );
  const collection = useCollection();
  const connecte = collection.connecte === true;

  function appliquer(patch: Partial<FiltresCatalogue>) {
    const suivants: FiltresCatalogue = { ...filtres, ...patch };
    setFiltres(suivants);
    if (typeof window !== "undefined") {
      const qs = versParametres(suivants);
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${qs}`,
      );
    }
  }

  const editeurs = useMemo(() => editeursProposes(objets), [objets]);
  const annees = useMemo(() => anneesProposees(objets), [objets]);

  const affiches = useMemo(() => {
    const base = filtrerObjets(objets, filtres);
    return connecte
      ? filtrerCollection(base, filtres.collection, collection.possessions)
      : base;
  }, [objets, filtres, connecte, collection.possessions]);

  const aFiltresActifs =
    filtres.categorie !== null ||
    filtres.ere !== null ||
    filtres.marche !== null ||
    filtres.editeur !== null ||
    filtres.annee !== null ||
    filtres.q !== "" ||
    (connecte && filtres.collection !== null);

  return (
    <div className="flex flex-col gap-4">
      {/* 5 catégories natives en pilules défilables */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Catégories">
        <button
          type="button"
          onClick={() => appliquer({ categorie: null })}
          aria-pressed={filtres.categorie === null}
          className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold ${
            filtres.categorie === null
              ? "bg-accent text-inverse"
              : "border border-bordure bg-carte text-texte-doux"
          }`}
        >
          Tout
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.valeur}
            type="button"
            onClick={() =>
              appliquer({
                categorie: filtres.categorie === c.valeur ? null : c.valeur,
              })
            }
            aria-pressed={filtres.categorie === c.valeur}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold ${
              filtres.categorie === c.valeur
                ? "bg-accent text-inverse"
                : "border border-bordure bg-carte text-texte-doux"
            }`}
          >
            {c.court}
          </button>
        ))}
      </div>

      {/* Recherche ?q= */}
      <input
        type="search"
        value={filtres.q}
        onChange={(e) => appliquer({ q: e.currentTarget.value })}
        placeholder="Rechercher un manga, une carte, un jeu…"
        aria-label="Rechercher dans le catalogue"
        className="h-11 w-full rounded-xl border border-champ bg-carte px-3.5 text-sm text-texte outline-none focus:border-accent"
      />

      {/* Filtres URL : ère, marché, éditeur, année (+ collection si connecté) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select
          aria-label="Série ou ère"
          value={filtres.ere ?? ""}
          onChange={(e) =>
            appliquer({
              ere: (e.currentTarget.value || null) as FiltresCatalogue["ere"],
            })
          }
          className="h-10 rounded-lg border border-champ bg-carte px-2.5 text-xs font-medium text-texte"
        >
          <option value="">Toutes les ères</option>
          {ERES.map((e) => (
            <option key={e.valeur} value={e.valeur}>
              {e.libelle}
            </option>
          ))}
        </select>

        <select
          aria-label="Marché"
          value={filtres.marche ?? ""}
          onChange={(e) =>
            appliquer({
              marche: (e.currentTarget.value ||
                null) as FiltresCatalogue["marche"],
            })
          }
          className="h-10 rounded-lg border border-champ bg-carte px-2.5 text-xs font-medium text-texte"
        >
          <option value="">Tous les marchés</option>
          {MARCHES.map((m) => (
            <option key={m.valeur} value={m.valeur}>
              {m.libelle}
            </option>
          ))}
        </select>

        <select
          aria-label="Éditeur"
          value={filtres.editeur ?? ""}
          onChange={(e) =>
            appliquer({ editeur: e.currentTarget.value || null })
          }
          className="h-10 rounded-lg border border-champ bg-carte px-2.5 text-xs font-medium text-texte"
        >
          <option value="">Tous les éditeurs</option>
          {editeurs.map((ed) => (
            <option key={ed} value={ed}>
              {ed}
            </option>
          ))}
        </select>

        <select
          aria-label="Année"
          value={filtres.annee ?? ""}
          onChange={(e) => appliquer({ annee: e.currentTarget.value || null })}
          className="h-10 rounded-lg border border-champ bg-carte px-2.5 text-xs font-medium text-texte"
        >
          <option value="">Toutes les années</option>
          {annees.map((an) => (
            <option key={an} value={an}>
              {an}
            </option>
          ))}
        </select>

        {connecte && (
          <select
            aria-label="Collection"
            value={filtres.collection ?? ""}
            onChange={(e) =>
              appliquer({
                collection: (e.currentTarget.value ||
                  null) as FiltresCatalogue["collection"],
              })
            }
            className="h-10 rounded-lg border border-champ bg-carte px-2.5 text-xs font-medium text-texte"
          >
            <option value="">Toute la collection</option>
            <option value="possedes">Possédés</option>
            <option value="manquants">Manquants</option>
          </select>
        )}
      </div>

      {/* Compteur + réinitialisation */}
      <div className="flex items-center justify-between text-xs text-texte-discret">
        <span>
          {affiches.length} objet{affiches.length > 1 ? "s" : ""} affiché
          {affiches.length > 1 ? "s" : ""} sur {objets.length}
        </span>
        {aFiltresActifs && (
          <button
            type="button"
            onClick={() => appliquer(SANS_FILTRE)}
            className="font-semibold text-accent"
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Liste / grille d'objets */}
      {affiches.length === 0 ? (
        <p className="rounded-xl border border-bordure bg-carte p-6 text-center text-sm text-texte-doux">
          Aucun objet ne correspond à ces filtres.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {affiches.map((objet) => {
            const possede =
              connecte && possedeObjet(collection.possessions, objet.id);
            return (
              <li key={objet.id}>
                <Link
                  href={`/objets/${objet.slug}`}
                  className="flex h-full flex-col gap-2 rounded-xl border border-bordure bg-carte p-3.5 hover:border-accent"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-accent-doux px-2 py-0.5 text-[11px] font-semibold text-accent-fonce">
                      {libelleCategorie(objet.categorie)}
                    </span>
                    <span className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold text-texte-doux">
                      {libelleEre(objet.ere)}
                    </span>
                    <span className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold text-texte-doux">
                      {objet.marche}
                    </span>
                    {possede && (
                      <span className="rounded-md bg-possede px-2 py-0.5 text-[11px] font-bold text-inverse">
                        ✓ Je l&apos;ai
                      </span>
                    )}
                  </div>
                  <h2 className="font-titre text-base leading-snug font-bold">
                    {objet.titre}
                  </h2>
                  {objet.titreOriginal && (
                    <p lang="ja" className="text-xs text-texte-discret">
                      {objet.titreOriginal}
                    </p>
                  )}
                  <p className="mt-auto text-xs text-texte-doux">
                    {[objet.editeur, objet.annee, libelleMarche(objet.marche)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
