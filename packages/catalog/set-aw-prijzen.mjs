#!/usr/bin/env node
// set-aw-prijzen.mjs — zet de adviesverkoopprijs (RRP, € per m², incl. btw) uit de Associated
// Weavers-prijslijst "BENELUX - Elsie - Pricelist tool AW Rolls 2026 - 2026-01-27.pdf" op de
// AW-producten in Shopify. AW-producten zonder RRP in die lijst gaan op concept (DRAFT).
//
// Bron van de koppeling: ..\Data\Associated Weavers\AW-prijzen-shopify-plan-<datum>.csv
//   (kolommen Product;Collectie;Varianten;Actie;RRP EUR/m2;Opmerking;ProductId, Actie = "Prijs zetten" | "Draft")
//
//   node packages/catalog/set-aw-prijzen.mjs "<plan.csv>"              dry-run
//   node packages/catalog/set-aw-prijzen.mjs "<plan.csv>" --go         schrijven
//   node packages/catalog/set-aw-prijzen.mjs --rollback "<pushlog>"    dry-run van terugzetten (+ --go)
//
// Per geprijsd product: alle varianten (kleuren) dezelfde m²-prijs, tag "prijs-ontbreekt" weg en
// brunic.etalage = false (prijs + koopknop zichtbaar), net als set-boras-prijzen.mjs --verkoopbaar.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { admin, ROOT_DIR } from "./_shopify.mjs";

const argv = process.argv.slice(2);
const GO = argv.includes("--go");
const ROLLBACK = argv.includes("--rollback");
const TAG = argv.find((a) => a.startsWith("--tag="))?.slice(6) || null; // bv. --tag=prijs-voorstel
const BESTAND = argv.find((a) => !a.startsWith("--"));
const DATA = join(ROOT_DIR, "..", "Data");

async function metRetry(query, vars) {
  for (let poging = 1; ; poging++) {
    try {
      return await admin(query, vars);
    } catch (e) {
      if (poging >= 8 || !/THROTTLED|fetch failed|ECONNRESET|HTTP 5|JSON/.test(e.message)) throw e;
      await new Promise((r) => setTimeout(r, 1000 * poging));
    }
  }
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}
const ZET_STATUS = `mutation($p:ProductUpdateInput!){ productUpdate(product:$p){ product{ id status } userErrors{ field message } } }`;
const ZET_PRIJZEN = `mutation($id:ID!,$v:[ProductVariantsBulkInput!]!){ productVariantsBulkUpdate(productId:$id, variants:$v){
  productVariants{ id price } userErrors{ field message } } }`;
const ZET_META = `mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ field message } } }`;

// ---------- rollback ----------
if (ROLLBACK) {
  if (!BESTAND) throw new Error("Gebruik: --rollback <pushlog.json>");
  const log = JSON.parse(readFileSync(BESTAND, "utf8"));
  const prijs = log.producten.filter((p) => p.prijzen_geschreven);
  const status = log.producten.filter((p) => p.status_nieuw && p.status_nieuw !== p.status_oud);
  console.log(`Terugzetten: prijzen bij ${prijs.length} producten · status bij ${status.length} producten`);
  if (!GO) { console.log("DRY-RUN — draai met --go om terug te zetten."); process.exit(0); }
  await pool(prijs, 4, async (p) => {
    const d = await metRetry(ZET_PRIJZEN, { id: p.id, v: p.varianten.map((v) => ({ id: v.id, price: v.oude_prijs })) });
    if (d.productVariantsBulkUpdate.userErrors.length) console.log(`  ! ${p.titel}: ${d.productVariantsBulkUpdate.userErrors.map((e) => e.message).join("; ")}`);
    if (p.tag_weg) await metRetry(`mutation($id:ID!,$t:[String!]!){ tagsAdd(id:$id, tags:$t){ userErrors{ message } } }`, { id: p.id, t: ["prijs-ontbreekt"] });
    if (p.tag_erbij) await metRetry(`mutation($id:ID!,$t:[String!]!){ tagsRemove(id:$id, tags:$t){ userErrors{ message } } }`, { id: p.id, t: [p.tag_erbij] });
    if (p.etalage_nieuw != null) {
      if (p.etalage_oud != null) await metRetry(ZET_META, { m: [{ ownerId: p.id, namespace: "brunic", key: "etalage", type: "boolean", value: p.etalage_oud }] });
      else console.log(`  · ${p.titel}: etalage had vóór de push geen waarde — staat nu op false, handmatig nakijken`);
    }
  });
  await pool(status, 4, async (p) => {
    const d = await metRetry(ZET_STATUS, { p: { id: p.id, status: p.status_oud } });
    if (d.productUpdate.userErrors.length) console.log(`  ! ${p.titel}: ${d.productUpdate.userErrors.map((e) => e.message).join("; ")}`);
  });
  console.log("Teruggezet. Zichtbaar op de site na de volgende build.");
  process.exit(0);
}

// ---------- dry-run / schrijven ----------
if (!BESTAND) {
  console.error('Gebruik: node set-aw-prijzen.mjs "<plan.csv>" [--go] | --rollback <pushlog> [--go]');
  process.exit(1);
}
const regels = readFileSync(BESTAND, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
// Velden gescheiden door ";" (Export-Csv -Delimiter ';'), eventueel tussen "…" met "" als escape.
const velden = (r) => [...r.matchAll(/(?:^|;)(?:"((?:[^"]|"")*)"|([^;]*))/g)].map((m) => (m[1] ?? m[2] ?? "").replace(/""/g, '"'));
const kop = velden(regels.shift());
const plan = regels.map((r) => Object.fromEntries(velden(r).map((c, i) => [kop[i], c])));
const perId = new Map(plan.map((r) => [`gid://shopify/Product/${r.ProductId}`, r]));

const producten = [];
for (let cursor = null; ; ) {
  const d = await metRetry(
    `query($c:String){ products(first:50, after:$c, query:"vendor:'Associated Weavers'"){
      nodes{ id title status tags
        etalage: metafield(namespace:"brunic", key:"etalage"){ value }
        eenheid: metafield(namespace:"brunic", key:"verkoop_eenheid"){ value }
        variants(first:100){ nodes{ id price } } }
      pageInfo{ hasNextPage endCursor } } }`,
    { c: cursor },
  );
  producten.push(...d.products.nodes);
  if (!d.products.pageInfo.hasNextPage) break;
  cursor = d.products.pageInfo.endCursor;
}
console.log(`Shopify: ${producten.length} AW-producten · plan: ${plan.length} regels`);

const zonderPlan = producten.filter((p) => !perId.has(p.id));
const zonderShopify = plan.filter((r) => !producten.some((p) => p.id === `gid://shopify/Product/${r.ProductId}`));
if (zonderPlan.length) console.log(`  ⚠ niet in het plan (blijven ongemoeid): ${zonderPlan.map((p) => p.title).join(", ")}`);
if (zonderShopify.length) console.log(`  ⚠ in het plan maar niet in Shopify: ${zonderShopify.map((r) => r.Product).join(", ")}`);

const werk = [];
for (const p of producten) {
  const r = perId.get(p.id);
  if (!r) continue;
  if (r.Product.trim().toLowerCase() !== p.title.trim().toLowerCase()) throw new Error(`Titel klopt niet: plan "${r.Product}" ≠ Shopify "${p.title}" (${p.id})`);
  const w = { id: p.id, titel: p.title, actie: r.Actie, status_oud: p.status, etalage_oud: p.etalage?.value ?? null, eenheid: p.eenheid?.value ?? null,
    varianten: p.variants.nodes.map((v) => ({ id: v.id, oude_prijs: v.price })), heeftTag: p.tags.includes("prijs-ontbreekt") };
  if (r.Actie === "Prijs zetten") {
    const prijs = Number(r["RRP EUR/m2"]);
    if (!(prijs > 0)) throw new Error(`Geen geldige RRP voor ${p.title}: "${r["RRP EUR/m2"]}"`);
    w.nieuwe_prijs = prijs.toFixed(2);
    if (!/m²|m2/i.test(w.eenheid ?? "")) console.log(`  ⚠ ${p.title}: verkoopeenheid is "${w.eenheid ?? "leeg"}", niet per m²`);
    const nietNul = w.varianten.filter((v) => Number(v.oude_prijs) > 0 && Number(v.oude_prijs) !== prijs);
    if (nietNul.length) console.log(`  · ${p.title}: ${nietNul.length} varianten hadden al een andere prijs (${nietNul[0].oude_prijs}) → wordt overschreven`);
  } else if (r.Actie !== "Draft") throw new Error(`Onbekende actie "${r.Actie}" voor ${p.title}`);
  werk.push(w);
}
const prijsWerk = werk.filter((w) => w.actie === "Prijs zetten");
const draftWerk = werk.filter((w) => w.actie === "Draft" && w.status_oud !== "DRAFT");
console.log(`\nPrijs zetten: ${prijsWerk.length} producten, ${prijsWerk.reduce((s, w) => s + w.varianten.length, 0)} varianten`);
const verdeling = {};
for (const w of prijsWerk) verdeling[w.nieuwe_prijs] = (verdeling[w.nieuwe_prijs] || 0) + 1;
console.log("  RRP €/m² → aantal producten:", verdeling);
console.log(`Naar concept (DRAFT): ${draftWerk.length} producten (${werk.filter((w) => w.actie === "Draft").length - draftWerk.length} stonden al op draft)`);

const LOG = join(DATA, `AW_PRIJZEN_SHOPIFY_PUSH_LOG_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`);
const bewaar = () => writeFileSync(LOG, JSON.stringify({ bron: BESTAND, prijslijst: "BENELUX - Elsie - Pricelist tool AW Rolls 2026 - 2026-01-27.pdf (kolom RRP)", producten: werk }, null, 1));
if (!GO) { console.log("\nDRY-RUN — draai met --go om te schrijven."); process.exit(0); }
bewaar(); // vóór-toestand

// 1. prijzen
await pool(prijsWerk, 4, async (w) => {
  const d = await metRetry(ZET_PRIJZEN, { id: w.id, v: w.varianten.map((v) => ({ id: v.id, price: w.nieuwe_prijs })) });
  const fout = d.productVariantsBulkUpdate.userErrors.map((e) => e.message).join("; ");
  const nu = new Map((d.productVariantsBulkUpdate.productVariants ?? []).map((v) => [v.id, v.price]));
  if (!fout && w.varianten.every((v) => Number(nu.get(v.id)) === Number(w.nieuwe_prijs))) w.prijzen_geschreven = true;
  else { w.prijzen_geschreven = w.varianten.some((v) => Number(nu.get(v.id)) === Number(w.nieuwe_prijs)); w.fout = fout || "niet alle varianten bijgewerkt"; }
});
const klaar = prijsWerk.filter((w) => w.prijzen_geschreven && !w.fout);
console.log(`Prijzen gezet bij ${klaar.length}/${prijsWerk.length} producten`);
for (const w of prijsWerk.filter((w) => w.fout)) console.log(`  ! ${w.titel}: ${w.fout}`);
bewaar();

// 2. tag "prijs-ontbreekt" weg
await pool(klaar.filter((w) => w.heeftTag), 4, async (w) => {
  const d = await metRetry(`mutation($id:ID!,$t:[String!]!){ tagsRemove(id:$id, tags:$t){ userErrors{ message } } }`, { id: w.id, t: ["prijs-ontbreekt"] });
  if (d.tagsRemove.userErrors.length) console.log(`  ! tag ${w.titel}: ${d.tagsRemove.userErrors.map((e) => e.message).join("; ")}`);
  else w.tag_weg = true;
});

// 3. etalage uit → prijs en koopknop zichtbaar
const etalageDoel = klaar.filter((w) => w.etalage_oud !== "false");
for (let i = 0; i < etalageDoel.length; i += 25) {
  const stuk = etalageDoel.slice(i, i + 25);
  const d = await metRetry(ZET_META, { m: stuk.map((w) => ({ ownerId: w.id, namespace: "brunic", key: "etalage", type: "boolean", value: "false" })) });
  if (d.metafieldsSet.userErrors.length) console.log(`  ! etalage: ${d.metafieldsSet.userErrors.map((e) => e.message).join("; ")}`);
  else for (const w of stuk) w.etalage_nieuw = "false";
}
console.log(`Tag weg bij ${klaar.filter((w) => w.tag_weg).length} · etalage → false bij ${etalageDoel.filter((w) => w.etalage_nieuw).length}`);
bewaar();

// 3b. optionele markeertag (bv. prijs-voorstel = zelf berekende prijs, geen AW-RRP)
if (TAG) {
  await pool(klaar, 4, async (w) => {
    const d = await metRetry(`mutation($id:ID!,$t:[String!]!){ tagsAdd(id:$id, tags:$t){ userErrors{ message } } }`, { id: w.id, t: [TAG] });
    if (d.tagsAdd.userErrors.length) console.log(`  ! tag ${TAG} ${w.titel}: ${d.tagsAdd.userErrors.map((e) => e.message).join("; ")}`);
    else w.tag_erbij = TAG;
  });
  console.log(`Tag "${TAG}" erbij bij ${klaar.filter((w) => w.tag_erbij).length}`);
}

// 3c. geprijsde producten die op concept stonden weer actief
const activeren = klaar.filter((w) => w.status_oud !== "ACTIVE");
await pool(activeren, 4, async (w) => {
  const d = await metRetry(ZET_STATUS, { p: { id: w.id, status: "ACTIVE" } });
  if (d.productUpdate.userErrors.length) console.log(`  ! actief ${w.titel}: ${d.productUpdate.userErrors.map((e) => e.message).join("; ")}`);
  else w.status_nieuw = d.productUpdate.product.status;
});
if (activeren.length) console.log(`Weer actief: ${activeren.filter((w) => w.status_nieuw === "ACTIVE").length}/${activeren.length}`);
bewaar();

// 4. concept
await pool(draftWerk, 4, async (w) => {
  const d = await metRetry(ZET_STATUS, { p: { id: w.id, status: "DRAFT" } });
  if (d.productUpdate.userErrors.length) console.log(`  ! draft ${w.titel}: ${d.productUpdate.userErrors.map((e) => e.message).join("; ")}`);
  else w.status_nieuw = d.productUpdate.product.status;
});
console.log(`Op draft gezet: ${draftWerk.filter((w) => w.status_nieuw === "DRAFT").length}/${draftWerk.length}`);
bewaar();
console.log(`\nKlaar · log: ${LOG}\nZichtbaar op de site na de volgende build (of pnpm prototype:sync lokaal).`);
