"use client";

import Link from "next/link";
import { useState } from "react";
import { useCollection } from "@/lib/collection/navigateur";

type Theme = "auto" | "clair" | "sombre";
const CLE_THEME = "dragonball-db:theme";

function lireTheme(): Theme {
  if (typeof window === "undefined") return "auto";
  try {
    const t = localStorage.getItem(CLE_THEME);
    return t === "clair" || t === "sombre" ? t : "auto";
  } catch {
    return "auto";
  }
}

export function EnTete() {
  const [theme, setTheme] = useState<Theme>(() => lireTheme());
  const collection = useCollection();

  function basculerTheme() {
    const suivant: Theme =
      theme === "auto" ? "sombre" : theme === "sombre" ? "clair" : "auto";
    setTheme(suivant);
    try {
      if (suivant === "auto") {
        localStorage.removeItem(CLE_THEME);
        delete document.documentElement.dataset.theme;
      } else {
        localStorage.setItem(CLE_THEME, suivant);
        document.documentElement.dataset.theme = suivant;
      }
    } catch {
      // Stockage indisponible.
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-bordure bg-carte/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-titre text-lg font-bold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-extrabold text-inverse"
          >
            ★
          </span>
          Dragon Ball DB
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/connexion"
            className="flex h-9 items-center rounded-lg border border-bordure bg-surface px-2.5 text-xs font-semibold text-texte-doux hover:border-accent hover:text-texte"
          >
            {collection.connecte ? "Compte" : "Connexion"}
          </Link>
          <button
            type="button"
            onClick={basculerTheme}
            aria-label="Changer de thème"
            className="flex h-9 items-center rounded-lg border border-bordure bg-surface px-2.5 text-xs font-semibold text-texte-doux"
          >
            {theme === "auto"
              ? "Auto"
              : theme === "sombre"
                ? "Sombre"
                : "Clair"}
          </button>
        </div>
      </div>
    </header>
  );
}
