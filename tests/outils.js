// Outils communs aux tests : ouverture d'une page locale et relevé des erreurs.
import { expect } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

export const adresse = (fichier) => pathToFileURL(resolve(fichier)).href;

// Relève les erreurs JavaScript et les fichiers locaux introuvables. Les
// ressources externes (polices, CDN) ne sont pas comptées : leur panne ne
// dépend pas du dépôt.
export function surveiller(page) {
  const erreurs = [];
  page.on("pageerror", (e) => erreurs.push(e.message));
  page.on("console", (m) => {
    const source = m.location().url || "";
    if (m.type() === "error" && !/^https?:/.test(source) && !/^Failed to load resource/.test(m.text())) {
      erreurs.push(m.text());
    }
  });
  page.on("requestfailed", (r) => {
    if (r.url().startsWith("file:")) erreurs.push(`introuvable : ${r.url()}`);
  });
  return {
    erreurs,
    verifier: () => expect(erreurs, "erreurs JavaScript ou fichiers locaux introuvables").toEqual([]),
  };
}

// Largeur qui dépasse de l'écran. clientWidth et non innerWidth : sur téléphone,
// le navigateur élargit innerWidth (dézoom) quand la page déborde.
export async function debordement(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}
