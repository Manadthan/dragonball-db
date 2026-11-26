import { expect, test } from "@playwright/test";

test("le catalogue affiche les 5 catégories et synchronise les filtres dans l'URL", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Catalogue Dragon Ball", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("5 objets affichés sur 5")).toBeVisible();

  await page.getByRole("button", { name: "Mangas", exact: true }).click();
  await expect(page).toHaveURL("/?categorie=manga-livre");
  await expect(page.getByText("1 objet affiché sur 5")).toBeVisible();
});
