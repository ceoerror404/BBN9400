#!/usr/bin/env node
// set-boras-prijzen.mjs — zet de Belgische winkelprijs per rol van borastapeter.com op het
// Boråstapeter-behang in Shopify (productType "Behang"; fotobehang op maat blijft op aanvraag).
// Koppeling: variant-SKU = Boråstapeter-artikelnummer (bv. 7786 = Elm Tree, zwart).
//
// Borastapeter.com toont de prijs volgens het land van de bezoeker (Shopify Markets): vanuit
// België "€84,90 / roll", vanuit elders kronen. Hun server remt geautomatiseerde verzoeken sterk af
// (HTTP 429), dus de prijzen komen uit een browserscript dat iemand in België zelf draait:
//
//   1. node packages/catalog/set-boras-prijzen.mjs --browserscript
//        → ..\Data\BORAS_PRIJZEN_<datum>\prijzen-ophalen.js (met de artikelnummers uit Shopify)
//   2. In Chrome: https://www.borastapeter.com/en/ (prijzen in €), F12 → Console, plak het script.
//        → download boras-prijzen-BE-<datum>.json (± 1 verzoek per seconde, met pauze bij 429)
//   3. node packages/catalog/set-boras-prijzen.mjs "<boras-prijzen-BE-….json>"              dry-run
//      node packages/catalog/set-boras-prijzen.mjs "<…json>" --verkoopbaar --go             schrijven
//      node packages/catalog/set-boras-prijzen.mjs --rollback "<pushlog.json>"               terugdraaien
//
// Prijs = de gewone prijs incl. btw (bij een actie op borastapeter.com: de doorgestreepte prijs).
// Enkel een product waarvan élke kleur een prijs kreeg, verliest de tag "prijs-ontbreekt" en gaat
// met --verkoopbaar op brunic.etalage = false (prijs + koopknop zichtbaar). De rest blijft op aanvraag.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { admin, ROOT_DIR } from "./_shopify.mjs";

const argv = process.argv.slice(2);
const GO = argv.includes("--go");
const VERKOOPBAAR = argv.includes("--verkoopbaar");
const ROLLBACK = argv.includes("--rollback");
const BROWSERSCRIPT = argv.includes("--browserscript");
const BESTAND = argv.find((a) => !a.startsWith("--"));
const DATUM = new Date().toISOString().slice(0, 10);
const DATA = join(ROOT_DIR, "..", "Data");
const MIN = 15, MAX = 250; // €/rol daarbuiten: melden als uitschieter

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

async function borasProducten() {
  const uit = [];
  for (let cursor = null; ; ) {
    const d = await metRetry(
      `query($c:String){ products(first:100, after:$c, query:"vendor:Boråstapeter"){
        nodes{ id handle title vendor productType status tags
          etalage: metafield(namespace:"brunic", key:"etalage"){ value }
          eenheid: metafield(namespace:"brunic", key:"verkoop_eenheid"){ value }
          variants(first:100){ nodes{ id sku price compareAtPrice } } }
        pageInfo{ hasNextPage endCursor } } }`,
      { c: cursor },
    );
    uit.push(...d.products.nodes);
    if (!d.products.pageInfo.hasNextPage) break;
    cursor = d.products.pageInfo.endCursor;
  }
  return uit.filter((p) => /bor[aå]stapeter/i.test(p.vendor) && p.productType === "Behang");
}

// ---------- 1. browserscript ----------
if (BROWSERSCRIPT) {
  const producten = await borasProducten();
  const skus = [...new Set(producten.flatMap((p) => p.variants.nodes.map((v) => v.sku?.trim()).filter(Boolean)))].sort();
  const map = join(DATA, `BORAS_PRIJZEN_${DATUM}`);
  mkdirSync(map, { recursive: true });
  const script = readFileSync(new URL("./boras-prijzen-browser.js", import.meta.url), "utf8")
    .replace("/*ARTIKELNUMMERS*/[]", JSON.stringify(skus));
  writeFileSync(join(map, "prijzen-ophalen.js"), script);
  console.log(`${producten.length} behang-producten, ${skus.length} artikelnummers → ${join(map, "prijzen-ophalen.js")}`);
  process.exit(0);
}

// ---------- rollback ----------
if (ROLLBACK) {
  if (!BESTAND) throw new Error("Gebruik: --rollback <pushlog.json>");
  const log = JSON.parse(readFileSync(BESTAND, "utf8"));
  const perProduct = new Map();
  for (const r of log.varianten.filter((r) => r.geschreven)) {
    if (!perProduct.has(r.productId)) perProduct.set(r.productId, []);
    perProduct.get(r.productId).push({ id: r.variantId, price: r.oude_prijs });
  }
  console.log(`Terugzetten: ${[...perProduct.values()].flat().length} prijzen bij ${perProduct.size} producten`);
  if (!GO) { console.log("DRY-RUN — draai met --go om terug te zetten."); process.exit(0); }
  await pool([...perProduct], 4, async ([id, v]) => {
    const d = await metRetry(`mutation($id:ID!,$v:[ProductVariantsBulkInput!]!){ productVariantsBulkUpdate(productId:$id, variants:$v){ userErrors{ message } } }`, { id, v });
    if (d.productVariantsBulkUpdate.userErrors.length) console.log(`  ! ${id}: ${d.productVariantsBulkUpdate.userErrors.map((e) => e.message).join("; ")}`);
  });
  for (const p of log.producten) {
    if (p.tag_weg) await metRetry(`mutation($id:ID!,$t:[String!]!){ tagsAdd(id:$id, tags:$t){ userErrors{ message } } }`, { id: p.id, t: ["prijs-ontbreekt"] });
    if (p.etalage_nieuw != null && p.etalage_oud != null)
      await metRetry(`mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ message } } }`,
        { m: [{ ownerId: p.id, namespace: "brunic", key: "etalage", type: "boolean", value: p.etalage_oud }] });
  }
  console.log("Teruggezet. Zichtbaar op de site na de volgende build.");
  process.exit(0);
}

// ---------- 2. dry-run / schrijven ----------
if (!BESTAND) {
  console.error('Gebruik: node set-boras-prijzen.mjs --browserscript | "<boras-prijzen-BE.json>" [--verkoopbaar] [--go] | --rollback <log>');
  process.exit(1);
}
const bron = JSON.parse(readFileSync(BESTAND, "utf8").replace(/^﻿/, ""));
if (bron.munt !== "EUR") throw new Error(`Bestand is in ${bron.munt}, niet in EUR. Draai het browserscript vanuit België.`);
if (bron.volledig === false) console.log("⚠ Dit is een onderbroken run (volledig: false): de ontbrekende kleuren tellen als 'niet op borastapeter.com'.");
if (bron.land !== "BE") console.log(`⚠ Land in het bestand: ${bron.land} (verwacht BE). Controleer of dat de bedoelde prijs is.`);
const prijzen = new Map(Object.entries(bron.prijzen));
console.log(`Bestand: ${prijzen.size} prijzen (${bron.land}, ${bron.munt}, ${bron.opgehaald}) · niet gevonden op borastapeter.com: ${bron.niet_gevonden?.length ?? 0}`);

const producten = await borasProducten();
console.log(`Shopify: ${producten.length} Boråstapeter-behangen (fotobehang niet meegeteld)\n`);

const varianten = [];
const plan = [];
for (const p of producten) {
  const nieuw = [];
  let allesGeprijsd = true;
  for (const v of p.variants.nodes) {
    const b = prijzen.get(v.sku?.trim());
    const r = { productId: p.id, variantId: v.id, handle: p.handle, sku: v.sku, status: p.status, oude_prijs: v.price };
    varianten.push(r);
    if (!b) { r.resultaat = "niet op borastapeter.com"; allesGeprijsd = false; continue; }
    if (/sample|bobbin/i.test(`${b.url} ${b.titel ?? ""}`)) { r.resultaat = `geweigerd: prijs van een stalenpakket (${b.url})`; allesGeprijsd = false; continue; }
    const gewoon = b.van_prijs > b.prijs ? b.van_prijs : b.prijs;
    if (!(gewoon > 0)) { r.resultaat = "geen prijs"; allesGeprijsd = false; continue; }
    r.nieuwe_prijs = gewoon.toFixed(2);
    r.boras_url = b.url;
    if (b.van_prijs > b.prijs) r.opmerking = `actie op borastapeter.com: ${b.prijs.toFixed(2)} i.p.v. ${b.van_prijs.toFixed(2)} — gewone prijs genomen`;
    if (gewoon < MIN || gewoon > MAX) r.uitschieter = true;
    r.resultaat = Number(v.price) === gewoon ? "prijs ongewijzigd" : Number(v.price) > 0 ? "prijs gecorrigeerd" : "prijs ingevuld";
    if (r.resultaat !== "prijs ongewijzigd") nieuw.push(r);
  }
  plan.push({ p, nieuw, allesGeprijsd });
}

const tel = {};
for (const r of varianten) tel[r.resultaat] = (tel[r.resultaat] || 0) + 1;
console.log("Kleuren (varianten):", tel);
const bedragen = varianten.filter((r) => r.nieuwe_prijs).map((r) => +r.nieuwe_prijs).sort((a, b) => a - b);
if (bedragen.length) {
  const verdeling = {};
  for (const x of bedragen) verdeling[x.toFixed(2)] = (verdeling[x.toFixed(2)] || 0) + 1;
  console.log(`Prijzen per rol: min € ${bedragen[0]} · mediaan € ${bedragen[bedragen.length >> 1]} · max € ${bedragen.at(-1)}`);
  console.log("Verdeling:", verdeling);
}
for (const r of varianten.filter((r) => r.uitschieter)) console.log(`  ⚠ uitschieter ${r.sku} ${r.handle}: € ${r.nieuwe_prijs} — ${r.boras_url}`);
for (const r of varianten.filter((r) => r.opmerking)) console.log(`  · ${r.sku} ${r.handle}: ${r.opmerking}`);
for (const r of varianten.filter((r) => r.resultaat === "prijs gecorrigeerd")) console.log(`  gecorrigeerd: ${r.sku} ${r.handle}: ${r.oude_prijs} → ${r.nieuwe_prijs}`);
const zonderEenheid = plan.filter((x) => x.allesGeprijsd && !/rol/i.test(x.p.eenheid?.value ?? ""));
if (zonderEenheid.length) console.log(`  ⚠ ${zonderEenheid.length} volledig geprijsde producten zonder eenheid "rol": ${zonderEenheid.slice(0, 10).map((x) => `${x.p.handle} (${x.p.eenheid?.value ?? "leeg"})`).join(", ")}`);

const volledig = plan.filter((x) => x.allesGeprijsd);
const deels = plan.filter((x) => !x.allesGeprijsd && varianten.some((r) => r.productId === x.p.id && r.nieuwe_prijs));
const geen = plan.filter((x) => !varianten.some((r) => r.productId === x.p.id && r.nieuwe_prijs));
console.log(`\nProducten: ${volledig.length} volledig geprijsd · ${deels.length} deels (blijven op aanvraag) · ${geen.length} zonder prijs (blijven op aanvraag)`);
for (const x of deels) console.log(`  deels: ${x.p.handle} — ontbreekt: ${varianten.filter((r) => r.productId === x.p.id && !r.nieuwe_prijs).map((r) => r.sku).join(", ")}`);
const metTag = volledig.filter((x) => x.p.tags.includes("prijs-ontbreekt")).length;
const naarVerkoop = volledig.filter((x) => x.p.etalage?.value !== "false");
console.log(`Tag "prijs-ontbreekt" weg bij ${metTag} producten · ${VERKOOPBAAR ? `etalage → false (online te koop) bij ${naarVerkoop.length} producten` : "etalage ongemoeid (zonder --verkoopbaar blijft de site 'op aanvraag' tonen)"}`);

const LOG = join(DATA, `BORAS_PRIJZEN_SHOPIFY_PUSH_LOG_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`);
const logInhoud = () => ({
  bron: BESTAND, bron_opgehaald: bron.opgehaald, land: bron.land, munt: bron.munt, verkoopbaar: VERKOOPBAAR, varianten,
  producten: plan.map((x) => ({ id: x.p.id, handle: x.p.handle, allesGeprijsd: x.allesGeprijsd, tag_weg: x.tag_weg ?? false, etalage_oud: x.p.etalage?.value ?? null, etalage_nieuw: x.etalage_nieuw ?? null })),
});

if (!GO) {
  console.log("\nDRY-RUN — draai met --go om te schrijven.");
  process.exit(0);
}
writeFileSync(LOG, JSON.stringify(logInhoud(), null, 1)); // vóór-toestand

// 1. prijzen
await pool(plan.filter((x) => x.nieuw.length), 4, async ({ p, nieuw }) => {
  const d = await metRetry(
    `mutation($id:ID!,$v:[ProductVariantsBulkInput!]!){ productVariantsBulkUpdate(productId:$id, variants:$v){
      productVariants{ id price } userErrors{ field message } } }`,
    { id: p.id, v: nieuw.map((r) => ({ id: r.variantId, price: r.nieuwe_prijs })) },
  );
  const fout = d.productVariantsBulkUpdate.userErrors.map((e) => e.message).join("; ");
  const nu = new Map((d.productVariantsBulkUpdate.productVariants ?? []).map((v) => [v.id, v.price]));
  for (const r of nieuw) {
    if (Number(nu.get(r.variantId)) === Number(r.nieuwe_prijs)) r.geschreven = true;
    else r.fout = fout || `prijs na update: ${nu.get(r.variantId)}`;
  }
});
const mislukt = new Set(varianten.filter((r) => r.fout).map((r) => r.productId));
const klaar = volledig.filter((x) => !mislukt.has(x.p.id));
console.log(`Prijzen gezet · ${mislukt.size} producten met fout`);
writeFileSync(LOG, JSON.stringify(logInhoud(), null, 1));

// 2. tag "prijs-ontbreekt" weg
await pool(klaar.filter((x) => x.p.tags.includes("prijs-ontbreekt")), 4, async (x) => {
  const d = await metRetry(`mutation($id:ID!,$t:[String!]!){ tagsRemove(id:$id, tags:$t){ userErrors{ message } } }`, { id: x.p.id, t: ["prijs-ontbreekt"] });
  if (d.tagsRemove.userErrors.length) console.log(`  ! tag ${x.p.handle}: ${d.tagsRemove.userErrors.map((e) => e.message).join("; ")}`);
  else x.tag_weg = true;
});

// 3. etalage uit (enkel met --verkoopbaar en enkel volledig geprijsde producten)
if (VERKOOPBAAR) {
  const doel = klaar.filter((x) => x.p.etalage?.value !== "false");
  for (let i = 0; i < doel.length; i += 25) {
    const stuk = doel.slice(i, i + 25);
    const d = await metRetry(
      `mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ field message } } }`,
      { m: stuk.map((x) => ({ ownerId: x.p.id, namespace: "brunic", key: "etalage", type: "boolean", value: "false" })) },
    );
    if (d.metafieldsSet.userErrors.length) console.log(`  ! etalage: ${d.metafieldsSet.userErrors.map((e) => e.message).join("; ")}`);
    else for (const x of stuk) x.etalage_nieuw = "false";
  }
  console.log(`Etalage uit bij ${doel.filter((x) => x.etalage_nieuw).length} producten`);
}

writeFileSync(LOG, JSON.stringify(logInhoud(), null, 1));
console.log(`\nKlaar · log: ${LOG}\nZichtbaar op de site na de volgende build (of pnpm prototype:sync lokaal).`);
