[![CI](https://github.com/philipperackette/galois-interactif/actions/workflows/ci.yml/badge.svg)](https://github.com/philipperackette/galois-interactif/actions/workflows/ci.yml)

# Galois interactif

Racines, automorphismes et correspondance de Galois entre sous-groupes et sous-corps, sur cinq exemples.

**En ligne :** https://philipperackette.github.io/galois-interactif/

## Vérifications automatiques

À chaque push et pull request, GitHub Actions lance ESLint et HTMLHint, puis des tests Playwright dans Chromium, sur écran d'ordinateur et de téléphone. Ils vérifient que chaque page s'ouvre sans erreur JavaScript ni défilement horizontal. Tests propres à ce site : pour chaque exemple, le groupe d'automorphismes, ses sous-groupes et la correspondance de Galois, vérifiés numériquement avec les racines complexes.

Le site lui-même n'a aucune dépendance : `package.json` ne sert qu'à ces vérifications.

```bash
npm ci
npm run lint
npx playwright install chromium
npm test
```
