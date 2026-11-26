"use client";

import { useSyncExternalStore } from "react";
import { clientNavigateur, clientSiSession } from "@/lib/supabase/navigateur";
import { avecObjet, ensemblePossessions } from "./collection";

export type EtatCollection = {
  connecte: boolean | null;
  possessions: ReadonlySet<string>;
  erreur: string | null;
};

const INITIAL: EtatCollection = {
  connecte: null,
  possessions: new Set(),
  erreur: null,
};
let etat = INITIAL;
let charge = false;
const abonnes = new Set<() => void>();

function changer(patch: Partial<EtatCollection>) {
  etat = { ...etat, ...patch };
  for (const rappel of abonnes) rappel();
}

async function charger() {
  const supabase = await clientSiSession();
  if (!supabase) return changer({ connecte: false });
  const { data } = await supabase.auth.getSession();
  if (!data.session) return changer({ connecte: false });
  const { data: lignes, error } = await supabase
    .from("possessions")
    .select("objet_id");
  if (error) return changer({ connecte: true, erreur: "Collection illisible" });
  changer({
    connecte: true,
    possessions: ensemblePossessions(lignes ?? []),
  });
}

function abonner(rappel: () => void) {
  abonnes.add(rappel);
  if (!charge) {
    charge = true;
    void charger().catch(() => changer({ connecte: false }));
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
