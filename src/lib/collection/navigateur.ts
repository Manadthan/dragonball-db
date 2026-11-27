"use client";

import { useSyncExternalStore } from "react";
import {
  aCookieSession,
  clientNavigateur,
  clientSiSession,
} from "@/lib/supabase/navigateur";
import { avecObjet, ensemblePossessions } from "./collection";

export type EtatCollection = {
  connecte: boolean | null;
  proprietaire: boolean;
  possessions: ReadonlySet<string>;
  erreur: string | null;
};

const INITIAL: EtatCollection = {
  connecte: null,
  proprietaire: false,
  possessions: new Set(),
  erreur: null,
};
let etat = INITIAL;
let charge = false;
let chargementEnCours = false;
const abonnes = new Set<() => void>();

function changer(patch: Partial<EtatCollection>) {
  etat = { ...etat, ...patch };
  for (const rappel of abonnes) rappel();
}

async function charger() {
  if (chargementEnCours) return;
  chargementEnCours = true;
  try {
    const supabase = await clientSiSession();
    if (!supabase) {
      changer({
        connecte: false,
        proprietaire: false,
        possessions: new Set(),
        erreur: null,
      });
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      changer({
        connecte: false,
        proprietaire: false,
        possessions: new Set(),
        erreur: null,
      });
      return;
    }
    const [{ data: lignes, error }, { data: estProp }] = await Promise.all([
      supabase.from("possessions").select("objet_id"),
      supabase.rpc("est_proprietaire"),
    ]);
    if (error) {
      changer({
        connecte: true,
        proprietaire: estProp === true,
        erreur: "Collection illisible",
      });
      return;
    }
    changer({
      connecte: true,
      proprietaire: estProp === true,
      possessions: ensemblePossessions(lignes ?? []),
      erreur: null,
    });
  } finally {
    chargementEnCours = false;
  }
}

export function rechargerCollection() {
  void charger().catch(() =>
    changer({
      connecte: false,
      proprietaire: false,
      possessions: new Set(),
      erreur: null,
    }),
  );
}

function abonner(rappel: () => void) {
  abonnes.add(rappel);
  const cookiePresent = aCookieSession();
  const desynchronise =
    charge &&
    ((cookiePresent && etat.connecte === false) ||
      (!cookiePresent && etat.connecte === true));
  if (!charge || desynchronise) {
    charge = true;
    rechargerCollection();
  }
  return () => abonnes.delete(rappel);
}

export function useCollection(): EtatCollection {
  return useSyncExternalStore(
    abonner,
    () => etat,
    () => INITIAL,
  );
}

export async function basculerObjet(objetId: string, avoir: boolean) {
  const avant = etat.possessions;
  changer({ possessions: avecObjet(avant, objetId, avoir), erreur: null });
  const supabase = await clientNavigateur();
  if (!supabase) {
    changer({
      possessions: avant,
      erreur: "Connexion Supabase non configurée",
    });
    return;
  }
  const table = supabase.from("possessions");
  const { error } = avoir
    ? await table.insert({ objet_id: objetId })
    : await table.delete().eq("objet_id", objetId);
  if (error && error.code !== "23505") {
    changer({
      possessions: avant,
      erreur: "Collection non enregistrée, réessaie dans un instant",
    });
  }
}
