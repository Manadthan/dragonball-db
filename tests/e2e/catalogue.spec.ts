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
