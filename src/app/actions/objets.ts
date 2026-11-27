"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerProprietaire } from "@/lib/auth/proprietaire";
import { validerObjetFormulaire } from "@/lib/objets/formulaire";
import {
  supprimerVisuelStocke,
  televerserVisuel,
} from "@/lib/visuels/televersement";

export type EtatFormulaireObjet = {
  erreurs?: string[];
};

const FORMAT_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extraireFichierVisuel(formData: FormData): File | null {
  const champ = formData.get("visuel");
  if (champ instanceof File && champ.size > 0) return champ;
  return null;
}

/** Ajoute un nouvel objet au catalogue (propriétaire uniquement) et redirige vers sa fiche. */
export async function creerObjet(
  _precedent: EtatFormulaireObjet,
  formData: FormData,
): Promise<EtatFormulaireObjet> {
  const validation = validerObjetFormulaire(formData);
  if (!validation.ok) {
    return { erreurs: validation.erreurs };
  }

  let slugCree: string;
  try {
    const supabase = await exigerProprietaire();
    const fichier = extraireFichierVisuel(formData);
    const imagePath = fichier
      ? await televerserVisuel(supabase, validation.donnees.slug, fichier)
      : null;

    const { error } = await supabase.from("objets").insert({
      ...validation.donnees,
      image_path: imagePath,
    });

    if (error) {
      await supprimerVisuelStocke(supabase, imagePath);
      if (error.code === "23505") {
        return {
          erreurs: [
            `Un objet avec l'adresse « ${validation.donnees.slug} » existe déjà.`,
          ],
        };
      }
      return { erreurs: [`Création impossible : ${error.message}`] };
    }
    slugCree = validation.donnees.slug;
  } catch (e) {
    return {
      erreurs: [
        e instanceof Error ? e.message : "Création impossible pour le moment.",
      ],
    };
  }

  revalidatePath("/");
  revalidatePath(`/objets/${slugCree}`);
  redirect(`/objets/${slugCree}`);
}

/** Modifie un objet existant (propriétaire uniquement) et redirige vers sa fiche à jour. */
export async function modifierObjet(
  _precedent: EtatFormulaireObjet,
  formData: FormData,
): Promise<EtatFormulaireObjet> {
  const id = String(formData.get("id") ?? "").trim();
  if (!FORMAT_UUID.test(id)) {
    return { erreurs: ["Identifiant d'objet invalide."] };
  }

  const validation = validerObjetFormulaire(formData);
  if (!validation.ok) {
    return { erreurs: validation.erreurs };
  }

  let ancienSlug: string;
  let nouveauSlug: string;
  try {
    const supabase = await exigerProprietaire();
    const { data: existant, error: errLecture } = await supabase
      .from("objets")
      .select("slug, image_path")
      .eq("id", id)
      .maybeSingle();
    if (errLecture || !existant) {
      return { erreurs: ["Objet introuvable."] };
    }

    ancienSlug = existant.slug;
    const fichier = extraireFichierVisuel(formData);
    const supprimerVisuel = formData.get("supprimer_visuel") === "on";

    let imagePath = existant.image_path;
    let nouveauVisuelTeleverse: string | null = null;
    let ancienVisuelASupprimer: string | null = null;

    if (fichier) {
      nouveauVisuelTeleverse = await televerserVisuel(
        supabase,
        validation.donnees.slug,
        fichier,
      );
      ancienVisuelASupprimer = existant.image_path;
      imagePath = nouveauVisuelTeleverse;
    } else if (supprimerVisuel) {
      ancienVisuelASupprimer = existant.image_path;
      imagePath = null;
    }

    const { error: errMaj } = await supabase
      .from("objets")
      .update({
        ...validation.donnees,
        image_url: supprimerVisuel ? null : validation.donnees.image_url,
        image_path: imagePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (errMaj) {
      await supprimerVisuelStocke(supabase, nouveauVisuelTeleverse);
      if (errMaj.code === "23505") {
        return {
          erreurs: [
            `Un autre objet utilise déjà l'adresse « ${validation.donnees.slug} ».`,
          ],
        };
      }
      return { erreurs: [`Modification impossible : ${errMaj.message}`] };
    }

    if (ancienVisuelASupprimer && ancienVisuelASupprimer !== imagePath) {
      await supprimerVisuelStocke(supabase, ancienVisuelASupprimer);
    }
    nouveauSlug = validation.donnees.slug;
  } catch (e) {
    return {
      erreurs: [
        e instanceof Error
          ? e.message
          : "Modification impossible pour le moment.",
      ],
    };
  }

  revalidatePath("/");
  revalidatePath(`/objets/${ancienSlug}`);
  if (nouveauSlug !== ancienSlug) {
    revalidatePath(`/objets/${nouveauSlug}`);
  }
  redirect(`/objets/${nouveauSlug}`);
}

/** Supprime un objet et son visuel stocké (propriétaire uniquement), puis retourne au catalogue. */
export async function supprimerObjet(
  _precedent: EtatFormulaireObjet,
  formData: FormData,
): Promise<EtatFormulaireObjet> {
  const id = String(formData.get("id") ?? "").trim();
  if (!FORMAT_UUID.test(id)) {
    return { erreurs: ["Identifiant d'objet invalide."] };
  }

  let slugSupprime: string;
  try {
    const supabase = await exigerProprietaire();
    const { data: existant, error: errLecture } = await supabase
      .from("objets")
      .select("slug, image_path")
      .eq("id", id)
      .maybeSingle();
    if (errLecture || !existant) {
      return { erreurs: ["Objet introuvable."] };
    }

    const { error: errSuppr } = await supabase
      .from("objets")
      .delete()
      .eq("id", id);
    if (errSuppr) {
      return { erreurs: [`Suppression impossible : ${errSuppr.message}`] };
    }

    await supprimerVisuelStocke(supabase, existant.image_path);
    slugSupprime = existant.slug;
  } catch (e) {
    return {
      erreurs: [
        e instanceof Error
          ? e.message
          : "Suppression impossible pour le moment.",
      ],
    };
  }

  revalidatePath("/");
  revalidatePath(`/objets/${slugSupprime}`);
  redirect("/");
}
