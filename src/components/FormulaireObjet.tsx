"use client";

import { useActionState, useState } from "react";
import {
  creerObjet,
  modifierObjet,
  supprimerObjet,
  type EtatFormulaireObjet,
} from "@/app/actions/objets";
import { JaquetteObjet } from "@/components/JaquetteObjet";
import {
  CATEGORIES,
  ERES,
  MARCHES,
  type ObjetCatalogue,
} from "@/lib/catalogue/types";
import { genererSlug } from "@/lib/objets/formulaire";

const champ =
  "h-12 w-full rounded-[10px] border border-champ bg-carte px-3 text-base text-texte outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

type Props =
  | { mode: "creation"; objet?: undefined }
  | { mode: "edition"; objet: ObjetCatalogue };

export function FormulaireObjet({ mode, objet }: Props) {
  const estEdition = mode === "edition";
  const action = estEdition ? modifierObjet : creerObjet;
  const [etat, soumettre, enCours] = useActionState<
    EtatFormulaireObjet,
    FormData
  >(action, {});
  const [etatSuppression, lancerSuppression, suppressionEnCours] =
    useActionState<EtatFormulaireObjet, FormData>(supprimerObjet, {});

  const [titre, setTitre] = useState(objet?.titre ?? "");
  const [slugModifie, setSlugModifie] = useState(estEdition);
  const [slug, setSlug] = useState(objet?.slug ?? "");
  const [confirmationSuppr, setConfirmationSuppr] = useState(false);

  const slugAffiche = slugModifie ? slug : genererSlug(titre);
  const aVisuel = Boolean(objet?.imagePath || objet?.imageUrl);

  return (
    <div className="flex flex-col gap-6">
      <form
        action={soumettre}
        className="flex flex-col gap-4 rounded-xl border border-bordure bg-carte p-4"
        noValidate
      >
        {estEdition && <input type="hidden" name="id" value={objet.id} />}

        {etat.erreurs && etat.erreurs.length > 0 && (
          <div
            role="alert"
            className="flex flex-col gap-1 rounded-[10px] border border-erreur-bordure bg-erreur-fond px-3 py-2.5 text-sm leading-snug text-erreur"
          >
            {etat.erreurs.map((err) => (
              <p key={err}>{err}</p>
            ))}
          </div>
        )}

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
          Titre *
          <input
            name="titre"
            type="text"
            required
            value={titre}
            onChange={(e) => setTitre(e.currentTarget.value)}
            placeholder="Ex. Dragon Ball Z — DVD #1"
            className={champ}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
          Titre original (japonais / VO)
          <input
            name="titre_original"
            type="text"
            defaultValue={objet?.titreOriginal ?? ""}
            placeholder="Ex. DRAGON BALL Z #1"
            className={champ}
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Catégorie *
            <select
              name="categorie"
              defaultValue={objet?.categorie ?? "video"}
              className={champ}
            >
              {CATEGORIES.map((c) => (
                <option key={c.valeur} value={c.valeur}>
                  {c.libelle}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Série / Ère *
            <select
              name="ere"
              defaultValue={objet?.ere ?? "dbz"}
              className={champ}
            >
              {ERES.map((e) => (
                <option key={e.valeur} value={e.valeur}>
                  {e.libelle}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Marché *
            <select
              name="marche"
              defaultValue={objet?.marche ?? "JAP"}
              className={champ}
            >
              {MARCHES.map((m) => (
                <option key={m.valeur} value={m.valeur}>
                  {m.libelle}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Éditeur
            <input
              name="editeur"
              type="text"
              defaultValue={objet?.editeur ?? ""}
              placeholder="Ex. Pony Canyon, Glénat, Bandai…"
              className={champ}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Édition / Collection
            <input
              name="edition"
              type="text"
              defaultValue={objet?.edition ?? ""}
              placeholder="Ex. DVD individuels, Kanzenban…"
              className={champ}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Volume (n°)
            <input
              name="numero"
              type="number"
              min={1}
              inputMode="numeric"
              defaultValue={objet?.numero ?? ""}
              placeholder="1"
              className={champ}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Année
            <input
              name="annee"
              type="number"
              min={1984}
              max={2100}
              inputMode="numeric"
              defaultValue={objet?.annee ?? ""}
              placeholder="2005"
              className={champ}
            />
          </label>

          <label className="col-span-2 flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux sm:col-span-1">
            Date de sortie
            <input
              name="date_sortie"
              type="date"
              defaultValue={objet?.dateSortie ?? ""}
              className={champ}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Référence / ISBN
            <input
              name="reference"
              type="text"
              defaultValue={objet?.reference ?? ""}
              placeholder="Ex. PCBC-50781 ou 9782723418560"
              className={champ}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Adresse (slug) *
            <input
              name="slug"
              type="text"
              required
              value={slugAffiche}
              onChange={(e) => {
                setSlugModifie(true);
                setSlug(e.currentTarget.value);
              }}
              placeholder="dragon-ball-z-dvd-1"
              className={champ}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
          Lien page officielle
          <input
            name="lien_officiel"
            type="url"
            inputMode="url"
            defaultValue={objet?.lienOfficiel ?? ""}
            placeholder="https://www.ponycanyon.co.jp/visual/..."
            className={champ}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
          Détails
          <textarea
            name="details"
            rows={3}
            defaultValue={objet?.details ?? ""}
            placeholder="Épisodes inclus, format, illustrateur, notes…"
            className="rounded-[10px] border border-champ bg-carte p-3 text-base text-texte outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        {/* Visuel / jaquette */}
        <fieldset className="flex flex-col gap-3 rounded-xl border border-bordure bg-surface/50 p-3.5">
          <legend className="px-1 text-xs font-bold tracking-wide text-texte-doux uppercase">
            Jaquette / Visuel
          </legend>

          {estEdition && aVisuel && (
            <div className="flex items-center gap-3">
              <div className="w-16 shrink-0">
                <JaquetteObjet objet={objet} sizes="64px" />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-texte-doux">
                <input
                  type="checkbox"
                  name="supprimer_visuel"
                  className="size-4 accent-erreur"
                />
                Supprimer la jaquette actuelle
              </label>
            </div>
          )}

          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Importer une photo (convertie en WebP HD)
            <input
              name="visuel"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-texte-doux file:mr-3 file:rounded-lg file:border file:border-bordure file:bg-carte file:px-3 file:py-2 file:text-xs file:font-semibold file:text-texte"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-texte-doux">
            Ou URL d&apos;image externe (optionnel)
            <input
              name="image_url"
              type="url"
              inputMode="url"
              defaultValue={objet?.imagePath ? "" : (objet?.imageUrl ?? "")}
              placeholder="https://..."
              className={champ}
            />
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={enCours}
          className="mt-1 h-[50px] rounded-xl bg-accent text-base font-semibold text-inverse disabled:opacity-60"
        >
          {enCours
            ? "Enregistrement…"
            : estEdition
              ? "Enregistrer les modifications"
              : "Ajouter au catalogue"}
        </button>
      </form>

      {estEdition && (
        <section className="flex flex-col gap-3 rounded-xl border border-erreur-bordure bg-erreur-fond p-4">
          <h2 className="font-titre text-sm font-bold text-erreur">
            Supprimer cet objet
          </h2>
          <p className="text-xs leading-relaxed text-texte-doux">
            Cette action supprime définitivement la fiche, sa jaquette stockée
            et son statut « Je l&apos;ai ».
          </p>

          {etatSuppression.erreurs && etatSuppression.erreurs.length > 0 && (
            <div role="alert" className="text-xs font-semibold text-erreur">
              {etatSuppression.erreurs.join(" ")}
            </div>
          )}

          {!confirmationSuppr ? (
            <button
              type="button"
              onClick={() => setConfirmationSuppr(true)}
              className="h-11 rounded-xl border border-erreur-bordure bg-carte px-4 text-sm font-semibold text-erreur"
            >
              Supprimer cet objet…
            </button>
          ) : (
            <form action={lancerSuppression} className="flex gap-2">
              <input type="hidden" name="id" value={objet.id} />
              <button
                type="submit"
                disabled={suppressionEnCours}
                className="h-11 flex-1 rounded-xl bg-erreur px-4 text-sm font-semibold text-inverse disabled:opacity-60"
              >
                {suppressionEnCours
                  ? "Suppression…"
                  : "Confirmer la suppression"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmationSuppr(false)}
                className="h-11 rounded-xl border border-bordure bg-carte px-4 text-sm font-semibold text-texte-doux"
              >
                Annuler
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
