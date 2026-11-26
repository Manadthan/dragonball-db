"use client";

import { possedeObjet } from "@/lib/collection/collection";
import { basculerObjet, useCollection } from "@/lib/collection/navigateur";

/** Case « Je l'ai » native sur chaque objet ; visible uniquement pour un compte connecté. */
export function CaseObjet({ objetId }: { objetId: string }) {
  const collection = useCollection();
  if (!collection.connecte) return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-bordure bg-carte px-3.5 text-[15px] font-semibold">
        <input
          type="checkbox"
          checked={possedeObjet(collection.possessions, objetId)}
          onChange={(e) => void basculerObjet(objetId, e.target.checked)}
          className="size-5 accent-possede"
        />
        Je l&apos;ai
      </label>
      {collection.erreur && (
        <p
          role="alert"
          className="rounded-[10px] border border-erreur-bordure bg-erreur-fond px-3 py-2 text-sm text-erreur"
        >
          {collection.erreur}
        </p>
      )}
    </div>
  );
}
