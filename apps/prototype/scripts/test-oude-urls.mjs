#!/usr/bin/env node
/**
 * Test wat de site doet met elke URL van de oude WooCommerce-site (brunic.be): volgt de
 * redirects en meldt elke URL die niet op een 200 eindigt of te veel stappen nodig heeft.
 * Alleen GET-verzoeken, hoogstens 3 tegelijk.
 *
 *   node apps/prototype/scripts/test-oude-urls.mjs <basis-URL> [--stappen 1] [--uit resultaat.json]
 *
 *   node apps/prototype/scripts/test-oude-urls.mjs http://localhost:3100
 *   node apps/prototype/scripts/test-oude-urls.mjs https://brunic.vercel.app
 *   node apps/prototype/scripts/test-oude-urls.mjs https://brunic.be --stappen 2    ← na de domeinkoppeling
 *
 * --stappen: hoeveel redirects een oude URL hoogstens mag kosten (standaard 1). Na de
 * domeinkoppeling komt daar de stap brunic.be → www.brunic.be bij: test dan met 2 op
 * https://brunic.be, en met 1 op https://www.brunic.be.
 *
 * De lijst (oude-urls/brunic-be-sitemap-2026-11-14.txt) is de sitemap van brunic.be zoals ze
 * op 14/11/2026 online stond: 2.060 unieke paden (2.063 vermeldingen). Na de livegang bestaat
 * die sitemap niet meer.
 * Nulmeting en verwachte bestemmingen: docs/audits/2026-11-14-seo-geo/url-inventory.csv.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const basis = (args.find((a) => /^https?:\/\//.test(a)) ?? "").replace(/\/$/, "");
const optie = (naam, standaard) => (args.includes(naam) ? args[args.indexOf(naam) + 1] : standaard);
const MAX_STAPPEN = Number(optie("--stappen", 1));
const UIT = optie("--uit", null);
if (!basis) {
  console.error("Gebruik: node apps/prototype/scripts/test-oude-urls.mjs <basis-URL> [--stappen 1] [--uit resultaat.json]");
  process.exit(2);
}

const paden = fs
  .readFileSync(path.join(here, "oude-urls/brunic-be-sitemap-2026-11-14.txt"), "utf8")
  .split(/\r?\n/)
  .map((r) => r.trim())
  .filter((r) => r.startsWith("/"));

async function volg(start) {
  const stappen = [];
  let nu = start;
  for (let i = 0; i < 8; i++) {
    let res;
    try {
      res = await fetch(nu, { redirect: "manual", headers: { "user-agent": "BrunicOudeUrlTest/1.0" }, signal: AbortSignal.timeout(30000) });
    } catch (e) {
      return { stappen, eind: nu, status: `fout: ${e.message}` };
    }
    await res.arrayBuffer().catch(() => {});
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      stappen.push(res.status);
      nu = new URL(loc, nu).href;
      continue;
    }
    return { stappen, eind: nu, status: res.status };
  }
  return { stappen, eind: nu, status: "lus" };
}

const rijen = new Array(paden.length);
let volgende = 0;
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (volgende < paden.length) {
      const i = volgende++;
      const r = await volg(basis + paden[i]);
      const eind = new URL(r.eind);
      rijen[i] = { oud: paden[i], nieuw: eind.pathname + eind.search + eind.hash, host: eind.host, status: r.status, stappen: r.stappen };
    }
  }),
);

const fout = rijen.filter((r) => r.status !== 200);
const teLang = rijen.filter((r) => r.status === 200 && r.stappen.length > MAX_STAPPEN);
const nietPermanent = rijen.filter((r) => r.stappen.some((s) => s !== 301 && s !== 308));
const perStappen = rijen.reduce((a, r) => ((a[r.stappen.length] = (a[r.stappen.length] ?? 0) + 1), a), {});
const naarCatalogus = rijen.filter((r) => r.nieuw === "/catalogus" && r.oud !== "/webshop/").length;

console.log(`${basis}: ${rijen.length} oude URL's getest`);
console.log(`  eindigt op 200: ${rijen.length - fout.length} · niet 200: ${fout.length}`);
console.log(`  aantal stappen: ${JSON.stringify(perStappen)} (toegelaten: ${MAX_STAPPEN})`);
console.log(`  tijdelijke redirect (geen 301/308): ${nietPermanent.length}`);
console.log(`  terugval op /catalogus (geschrapt aanbod): ${naarCatalogus}`);
for (const r of [...fout, ...teLang, ...nietPermanent].slice(0, 25)) console.log(`  ! ${r.status} [${r.stappen.join(">")}] ${r.oud} → ${r.nieuw}`);
if (UIT) fs.writeFileSync(UIT, JSON.stringify({ basis, getestOp: new Date().toISOString(), rijen }, null, 1));
process.exit(fout.length || teLang.length || nietPermanent.length ? 1 : 0);
