"use client";

import Link from "next/link";
import { useCollection } from "@/lib/collection/navigateur";

/** Bouton d'édition affiché uniquement au propriétaire connecté sur la fiche d'un objet. */
export function ActionsProprietaireObjet({ slug }: { slug: string }) {
  const collection = useCollection();
  if (!collection.proprietaire) return null;

  return (
    <Link
      href={`/objets/${slug}/modifier`}
      className="flex h-11 items-center justify-center rounded-xl border border-bordure bg-surface px-4 text-sm font-semibold text-texte hover:border-accent"
    >
      Modifier / supprimer cet objet
    </Link>
  );
}
