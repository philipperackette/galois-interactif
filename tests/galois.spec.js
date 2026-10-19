/* global examples */
import { test, expect } from "@playwright/test";
import { adresse, surveiller } from "./outils.js";

test.beforeEach(async ({ page }) => {
  await page.goto(adresse("index.html"));
});

test("chaque exemple : groupe, sous-groupes et correspondance de Galois vérifiés numériquement", async ({ page }) => {
  const ecarts = await page.evaluate(() => {
    // Nombres complexes [re, im].
    const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
    const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
    const div = (a, b) => { const d = b[0] ** 2 + b[1] ** 2; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
    const expi = (t) => [Math.cos(t), Math.sin(t)];
    const c2 = Math.cbrt(2), j = expi(2 * Math.PI / 3);
    // Valeurs des racines (dans l'ordre de rootLabels) et générateurs des corps intermédiaires.
    const DONNEES = {
      sqrt2: { racines: [[Math.SQRT2, 0], [-Math.SQRT2, 0]], corps: { L: (r) => r[0] } },
      sqrt23: {
        racines: [[Math.SQRT2, 0], [-Math.SQRT2, 0], [Math.sqrt(3), 0], [-Math.sqrt(3), 0]],
        corps: { E2: (r) => r[0], E3: (r) => r[2], E6: (r) => mul(r[0], r[2]), L: (r) => add(r[0], r[2]) },
      },
      cubic: {
        racines: [[c2, 0], mul(j, [c2, 0]), mul(mul(j, j), [c2, 0])],
        corps: { Qj: (r) => div(r[1], r[0]), K1: (r) => r[0], K2: (r) => r[1], K3: (r) => r[2], L: (r) => add(r[0], mul([2, 0], r[1])) },
      },
      zeta5: {
        racines: [1, 2, 3, 4].map((k) => expi(2 * Math.PI * k / 5)),
        corps: { F: (r) => sub(add(r[0], r[3]), add(r[1], r[2])), L: (r) => r[0] },
      },
      zeta8: {
        racines: [1, 3, 5, 7].map((k) => expi(2 * Math.PI * k / 8)),
        corps: { i: (r) => mul(r[0], r[0]), S: (r) => add(r[0], r[3]), M: (r) => add(r[0], r[1]), L: (r) => r[0] },
      },
    };
    const out = [];
    for (const [cle, e] of Object.entries(examples)) {
      const d = DONNEES[cle];
      const perms = e.autos.map((a) => a[1]);
      const rond = (p, q) => q.map((x) => p[x]);
      const indice = (p) => perms.findIndex((q) => q.every((v, i) => v === p[i]));
      // Les automorphismes forment un groupe (stable par composition).
      for (const p of perms) for (const q of perms) if (indice(rond(p, q)) < 0) out.push(`${cle} : groupe non stable`);
      // Chaque permutation respecte les relations entre racines : on vérifie qu'elle
      // préserve la valeur des générateurs fixés par tout le groupe (aucun ici) et que
      // les sous-groupes annoncés sont stables.
      for (const H of e.subgroups) {
        for (const a of H.autos) for (const b of H.autos) {
          if (!H.autos.includes(indice(rond(perms[a], perms[b])))) out.push(`${cle} : ${H.name} non stable`);
        }
        // Correspondance : H fixe exactement le corps associé.
        const f = d.corps[e.pairing[H.id]];
        if (!f) continue;
        const x = f(d.racines);
        perms.forEach((p, k) => {
          const y = f(p.map((i) => d.racines[i]));
          const fixe = Math.hypot(...sub(x, y)) < 1e-9;
          if (fixe !== H.autos.includes(k)) out.push(`${cle} : ${e.autos[k][0]} et ${H.name} ↔ ${e.pairing[H.id]}`);
        });
      }
      // Les automorphismes σₐ des corps cyclotomiques envoient ζᵏ sur ζᵃᵏ.
      if (cle.startsWith("zeta")) {
        const n = Number(cle.slice(4)), chiffres = "⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉";
        const exp = (s) => (s.length === 1 ? 1 : chiffres.indexOf(s.slice(1)) % 10);
        const ks = e.rootLabels.map(exp);
        e.autos.forEach(([nom, p]) => {
          const a = nom === "id" ? 1 : chiffres.indexOf(nom.slice(1)) % 10;
          ks.forEach((k, i) => { if (ks[p[i]] !== (a * k) % n) out.push(`${cle} : ${nom}(ζ^${k})`); });
        });
      }
      // Correspondance décroissante : une inclusion de sous-groupes donne l'inclusion inverse des corps.
      for (const [a, b] of e.subgroupEdges) {
        if (!e.fieldEdges.some(([u, v]) => u === e.pairing[b] && v === e.pairing[a])) out.push(`${cle} : arête ${a}–${b}`);
      }
    }
    return out;
  });
  expect(ecarts).toEqual([]);
});

test("interface : choix d'un exemple, d'un automorphisme et d'un sous-groupe", async ({ page }) => {
  const suivi = surveiller(page);
  await expect(page.locator("#autos .card")).toHaveCount(6);
  await page.locator('#autos .card[data-auto="1"]').click();
  await expect(page.locator("#currentAuto")).toBeVisible();
  await expect(page.locator("#roots path[marker-end]")).toHaveCount(3);
  for (const [cle, n] of [["sqrt2", 2], ["sqrt23", 4], ["zeta5", 4], ["zeta8", 4]]) {
    await page.selectOption("#ex", cle);
    await expect(page.locator("#autos .card")).toHaveCount(n);
  }
  suivi.verifier();
});
