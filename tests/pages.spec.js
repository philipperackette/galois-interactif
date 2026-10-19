// Vérifications communes à toutes les pages du site.
import { test, expect } from "@playwright/test";
import { readdirSync } from "node:fs";
import { adresse, debordement, surveiller } from "./outils.js";

const PAGES = readdirSync(".").filter((f) => f.endsWith(".html")).sort();

for (const fichier of PAGES) {
  test(`${fichier} : s'ouvre sans erreur, titre et langue, pas de défilement horizontal`, async ({ page }) => {
    const suivi = surveiller(page);
    await page.goto(adresse(fichier));
    await page.waitForLoadState("load");
    await expect(page).toHaveTitle(/\S/);
    await expect(page.locator("html")).toHaveAttribute("lang", /^[a-z]{2}/);
    await page.waitForTimeout(300);
    expect(await debordement(page), "défilement horizontal (px)").toBeLessThanOrEqual(1);
    suivi.verifier();
  });
}
