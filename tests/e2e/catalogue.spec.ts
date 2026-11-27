import { expect, test } from "@playwright/test";

test("le catalogue affiche les catégories, l'édition, la fiche objet et /connexion", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Catalogue Dragon Ball", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("5 objets affichés sur 5")).toBeVisible();

  await page.getByRole("button", { name: "Vidéo", exact: true }).click();
  await expect(page).toHaveURL("/?categorie=video");
  await expect(page.getByText("1 objet affiché sur 5")).toBeVisible();

  await page
    .getByRole("link", { name: /Dragon Ball Z — Dragon Box Vol\. 1/i })
    .click();
  await expect(page).toHaveURL("/objets/dbz-dragon-box-dvd-jap");
  await expect(page.getByText("19 mars 2003")).toBeVisible();
  await expect(page.getByText("PCBC-50368")).toBeVisible();

  await page.getByRole("link", { name: "Connexion", exact: true }).click();
  await expect(page).toHaveURL("/connexion");
  await expect(
    page.getByRole("heading", { name: "Connexion", exact: true }),
  ).toBeVisible();

  await page.goto("/objets/nouveau");
  await expect(page).toHaveURL("/connexion");
});

test("le tri réordonne le catalogue et le bouton remonter en haut apparaît au défilement", async ({
  page,
}) => {
  await page.goto("/");

  const titres = page.locator("ul li h2");
  // Tri par défaut : plus anciens (1988 → 2018)
  await expect(titres.first()).toContainText("Carddass Hondan Part 1");

  // Tri plus récents (2018 → 1988) et conservation au rechargement de l'URL
  await page.getByLabel("Tri").selectOption("recents");
  await expect(page).toHaveURL("/?tri=recents");
  await expect(titres.first()).toContainText("S.H.Figuarts Son Goku");

  await page.goto("/?tri=recents");
  await expect(page.getByLabel("Tri")).toHaveValue("recents");
  await expect(titres.first()).toContainText("S.H.Figuarts Son Goku");

  // Tri alphabétique A → Z
  await page.getByLabel("Tri").selectOption("az");
  await expect(page).toHaveURL("/?tri=az");
  await expect(titres.first()).toContainText("Carddass Hondan Part 1");

  // Retour au tri par défaut : le paramètre ?tri= est retiré de l'URL
  await page.getByLabel("Tri").selectOption("anciens");
  await expect(page).toHaveURL("/");

  // Bouton flottant « Remonter en haut » : caché en haut, visible après défilement, remonte en haut au clic
  const boutonHaut = page.getByRole("button", { name: "Remonter en haut" });
  await expect(boutonHaut).toBeHidden();

  await page.evaluate(() => {
    document.body.style.minHeight = "2000px";
    window.scrollTo(0, 600);
  });
  await expect(boutonHaut).toBeVisible();

  await boutonHaut.click();
  await expect
    .poll(() => page.evaluate(() => Math.round(window.scrollY)))
    .toBe(0);
  await expect(boutonHaut).toBeHidden();
});
