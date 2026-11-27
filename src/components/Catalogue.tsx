"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { JaquetteObjet } from "@/components/JaquetteObjet";
import {
  anneesProposees,
  editeursProposes,
  editionsProposees,
  filtrerObjets,
  filtresDepuisParametres,
  SANS_FILTRE,
  versParametres,
  type FiltresCatalogue,
} from "@/lib/catalogue/filtres";
import {
  OPTIONS_TRI,
  trierObjets,
  type TriCatalogue,
} from "@/lib/catalogue/tri";
import {
  CATEGORIES,
  ERES,
  libelleEre,
  MARCHES,
  type ObjetCatalogue,
} from "@/lib/catalogue/types";
import { filtrerCollection, possedeObjet } from "@/lib/collection/collection";
import { useCollection } from "@/lib/collection/navigateur";

const abonnesUrl = new Set<() => void>();

function abonnerUrl(rappel: () => void) {
  abonnesUrl.add(rappel);
  window.addEventListener("popstate", rappel);
  return () => {
    abonnesUrl.delete(rappel);
    window.removeEventListener("popstate", rappel);
  };
}

function lireUrl(): string {
  return window.location.search;
}

const TAILLE_LOT = 48;

export function Catalogue({ objets }: { objets: ObjetCatalogue[] }) {
  const rechercheUrl = useSyncExternalStore(abonnerUrl, lireUrl, () => "");
  const filtresUrl = useMemo(
    () => filtresDepuisParametres(rechercheUrl),
    [rechercheUrl],
  );
  const [saisieQ, setSaisieQ] = useState<string | null>(null);
  const filtres = useMemo<FiltresCatalogue>(
    () =>
      saisieQ !== null && saisieQ.trim() === filtresUrl.q
        ? { ...filtresUrl, q: saisieQ }
        : filtresUrl,
    [filtresUrl, saisieQ],
  );

  const [limite, setLimite] = useState(TAILLE_LOT);
  const collection = useCollection();
  const connecte = collection.connecte === true;

  function appliquer(patch: Partial<FiltresCatalogue>) {
    const suivants: FiltresCatalogue = { ...filtres, ...patch };
    setSaisieQ("q" in patch ? suivants.q : null);
    setLimite(TAILLE_LOT);
    if (typeof window !== "undefined") {
      const qs = versParametres(suivants);
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${qs}`,
      );
      for (const rappel of abonnesUrl) rappel();
    }
  }

  const editeurs = useMemo(() => editeursProposes(objets), [objets]);
  const editions = useMemo(() => editionsProposees(objets), [objets]);
  const annees = useMemo(() => anneesProposees(objets), [objets]);

  const affiches = useMemo(() => {
    const base = filtrerObjets(objets, filtres);
    const liste = connecte
      ? filtrerCollection(base, filtres.collection, collection.possessions)
      : base;
    return trierObjets(liste, filtres.tri);
  }, [objets, filtres, connecte, collection.possessions]);

  const visibles = useMemo(() => affiches.slice(0, limite), [affiches, limite]);

  const aFiltresActifs =
    filtres.categorie !== null ||
    filtres.ere !== null ||
    filtres.marche !== null ||
    filtres.editeur !== null ||
    filtres.edition !== null ||
    filtres.annee !== null ||
    filtres.q !== "" ||
    (connecte && filtres.collection !== null);

  return (
    <div className="flex flex-col gap-4">
      {/* 5 catégories natives en pilules défilables */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Catégories"
      >
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
        placeholder="Rechercher un manga, un DVD, un ISBN ou une réf. (PCBC, DSTD…)"
        aria-label="Rechercher dans le catalogue"
        className="h-11 w-full rounded-xl border border-champ bg-carte px-3.5 text-sm text-texte outline-none focus:border-accent"
      />

      {/* Filtres URL : ère, marché, éditeur, édition, année (+ collection si connecté) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
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

        {editions.length > 0 && (
          <select
            aria-label="Édition"
            value={filtres.edition ?? ""}
            onChange={(e) =>
              appliquer({ edition: e.currentTarget.value || null })
            }
            className="h-10 rounded-lg border border-champ bg-carte px-2.5 text-xs font-medium text-texte"
          >
            <option value="">Toutes les éditions</option>
            {editions.map((ed) => (
              <option key={ed} value={ed}>
                {ed}
              </option>
            ))}
          </select>
        )}

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

      {/* Tri + compteur + réinitialisation */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-2">
          <label
            htmlFor="tri-catalogue"
            className="text-xs font-medium text-texte-doux"
          >
            Tri
          </label>
          <select
            id="tri-catalogue"
            value={filtres.tri}
            onChange={(e) =>
              appliquer({ tri: e.currentTarget.value as TriCatalogue })
            }
            className="h-10 rounded-lg border border-champ bg-carte px-2.5 text-xs font-medium text-texte"
          >
            {OPTIONS_TRI.map((opt) => (
              <option key={opt.valeur} value={opt.valeur}>
                {opt.libelle}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-texte-discret">
          <span>
            {affiches.length} objet{affiches.length > 1 ? "s" : ""} affiché
            {affiches.length > 1 ? "s" : ""} sur {objets.length}
          </span>
          {aFiltresActifs && (
            <button
              type="button"
              onClick={() => appliquer({ ...SANS_FILTRE, tri: filtres.tri })}
              className="font-semibold text-accent"
            >
              Tout effacer
            </button>
          )}
        </div>
      </div>

      {/* Grille mobile-first (2 colonnes sur iPhone 12 mini) */}
      {affiches.length === 0 ? (
        <p className="rounded-xl border border-bordure bg-carte p-6 text-center text-sm text-texte-doux">
          Aucun objet ne correspond à ces filtres.
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {visibles.map((objet) => {
              const possede =
                connecte && possedeObjet(collection.possessions, objet.id);
              return (
                <li key={objet.id}>
                  <Link
                    href={`/objets/${objet.slug}`}
                    className="flex h-full flex-col gap-2 rounded-xl border border-bordure bg-carte p-2.5 hover:border-accent"
                  >
                    <div className="relative">
                      <JaquetteObjet
                        objet={objet}
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 230px"
                      />
                      {possede && (
                        <span className="absolute top-1.5 right-1.5 rounded-md bg-possede px-1.5 py-0.5 text-[10px] font-bold text-inverse shadow-sm">
                          ✓ Je l&apos;ai
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-texte-doux">
                        {libelleEre(objet.ere)}
                      </span>
                      <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-texte-doux">
                        {objet.marche}
                      </span>
                    </div>
                    <h2 className="font-titre text-sm leading-snug font-bold">
                      {objet.titre}
                    </h2>
                    <p className="mt-auto text-[11px] text-texte-discret">
                      {[objet.reference, objet.annee]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
          {affiches.length > visibles.length && (
            <button
              type="button"
              onClick={() => setLimite((n) => n + TAILLE_LOT)}
              className="mx-auto mt-1 rounded-xl border border-champ bg-carte px-5 py-2.5 text-sm font-semibold text-texte hover:border-accent"
            >
              Afficher plus ({affiches.length - visibles.length} restant
              {affiches.length - visibles.length > 1 ? "s" : ""})
            </button>
          )}
        </>
      )}
    </div>
  );
}
