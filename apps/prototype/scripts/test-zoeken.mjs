/**
 * Test van de zoekfunctie tegen de echte Shopify Search (Storefront API, alleen lezen) en de
 * catalogus-momentopname (.data/shopify-catalogus.json):
 *
 * 1. de vaste reeks van 55 zoekopdrachten uit de QA-audits
 *    (docs/audits/2026-11-12-webshop-qa/rapport.md §4.12);
 * 2. filters, sortering, aantallen en paginering van de zoekpagina;
 * 3. de suggesties van het zoekveld.
 *
 *   pnpm --filter @brunic/prototype test:zoeken
 *
 * Nodig: SHOPIFY_STORE_DOMAIN en SHOPIFY_STOREFRONT_API_TOKEN in de .env van de repo-root.
 *
 * Shopify bepaalt wat er gevonden wordt. Een rode regel bij deel 1 is dus meestal werk in de
 * Shopify-admin (Search & Discovery, productgegevens) en geen fout in de code: docs/zoeken.md
 * zegt wat waar zit. Deel 2 en 3 testen de code van de site en horen altijd groen te zijn.
 * Het script eindigt enkel met een fout als deel 2 of 3 faalt.
 */
import assert from "node:assert/strict";
import fs from "node:fs";

try {
  for (const regel of fs.readFileSync(new URL("../../../.env", import.meta.url), "utf8").split("\n")) {
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* geen .env: de variabelen staan in de omgeving */
}

const imp = (p) => import(new URL(`../src/${p}`, import.meta.url).href);
const { zoekResultaten, zoekSuggesties, zoekterm, ZOEK_SORTERINGEN } = await imp("lib/zoeken/zoeken.ts");
const { paginaVanShopify } = await imp("lib/zoeken/paginas.ts");
const { PAGE_SIZE } = await imp("lib/catalog/filters.ts");

const zoek = (q, sp = {}) => zoekResultaten(zoekterm(q), { q, ...sp });

/* ---------------- 1. de 55 zoekopdrachten ---------------- */

const slug = (s) => ({ soort: "slug", waarde: s });
const bevat = (s) => ({ soort: "slugBevat", waarde: s });
const merk = (s) => ({ soort: "merk", waarde: s });
const type = (s) => ({ soort: "type", waarde: s });
const min = (n) => ({ soort: "min", waarde: n });

const REEKS = [
  ["Rampur 0600", "exacte productnaam", slug("vloerkleed-rampur-0600-ragolle")],
  ["Rampur", "deel van de naam", bevat("rampur")],
  ["Lily Tree", "exacte productnaam", slug("behang-lily-tree-borastapeter")],
  ["Papercut", "exacte productnaam", slug("vloerkleed-papercut-louis-de-poortere")],
  ["RAMPUR 0600", "hoofdletters", slug("vloerkleed-rampur-0600-ragolle")],
  ["kersenbloesems", "deel van de naam", bevat("kersenbloesem")],
  ["Bacopa Moonlight Cobble", "exacte productnaam", slug("vinyl-bacopa-moonlight-cobble-beauflor")],
  ["Toscana B592", "exacte productnaam", slug("vasttapijt-toscana-b592-desso")],
  ["Ragolle", "merk", merk("Ragolle")],
  ["Borastapeter", "merk zonder speciale tekens", merk("Boråstapeter")],
  ["Boråstapeter", "merk met speciale tekens", merk("Boråstapeter")],
  ["Louis De Poortere", "merk (meerdere woorden)", merk("Louis De Poortere")],
  ["Desso", "merk dat onder een ander valt", bevat("desso")],
  ["Tarkett", "merk", merk("Tarkett")],
  ["Sanders & Sanders", "merk met &", merk("Sanders & Sanders")],
  ["blauw", "kleurnaam", min(100)],
  ["Columbus Gold", "kleurnaam van een variant", slug("vloerkleed-griff-louis-de-poortere")],
  ["antraciet", "kleurnaam", min(50)],
  ["901D", "kleurcode", slug("vinyl-barinas-inspire-modena-beauflor")],
  ["162L", "kleurcode", slug("vinyl-easytex-westbury-beauflor")],
  ["Nordic Folk", "collectie", min(9)],
  ["Letter to the sun", "collectie", slug("gordijnstof-movement-ado")],
  ["vloerkleed", "type enkelvoud", type("Vloerkleed")],
  ["vloerkleden", "type meervoud", type("Vloerkleed")],
  ["gordijnstof", "type enkelvoud", type("Gordijnstof")],
  ["gordijnstoffen", "type meervoud", type("Gordijnstof")],
  ["tapijttegel", "type enkelvoud", type("Tapijttegel")],
  ["tapijttegels", "type meervoud", type("Tapijttegel")],
  ["vinyl", "type (deel)", type("Vinylvloer")],
  ["fotobehang", "type", min(280)],
  ["gordijnen", "gewoon woord van de klant", min(100)],
  ["tapijt", "gewoon woord van de klant", min(100)],
  ["vloerkled", "tikfout", type("Vloerkleed")],
  ["Rampor", "tikfout", bevat("rampur")],
  ["behnag", "tikfout", min(1)],
  ["xyzzyqq", "woord dat nergens voorkomt", { soort: "geen" }],
  ["3390 / 110", "artikelnummer", slug("gordijnstof-movement-ado")],
  ["131367", "artikelnummer", slug("behang-3d-golvende-lijnen-aubergine-paars-estahome")],
  ["macrame", "zonder accent", bevat("macram")],
  ["macramé", "met accent", bevat("macram")],
  ["grijs vloerkleed", "twee woorden uit twee velden", type("Vloerkleed")],
  ["Tarkett vinyl", "merk + type", type("Vinylvloer")],
  ["blauw behang bloemen", "drie woorden", min(5)],
  ["Olivträd", "hernoemd product", bevat("oliv")],
  ["Olivtrad", "hernoemd product zonder tekens", bevat("oliv")],
  ["verduisterend", "suggestie van de site", min(1)],
  ["linnen", "suggestie van de site", min(1)],
  ["bloemen", "suggestie van de site", min(1)],
  ["vasttapijt", "suggestie van de site", type("Vasttapijt")],
  ["brandvrij", "suggestie van de site", min(1)],
  ["kinderkamer", "ruimte", min(100)],
  ["rond tapijt", "vorm + gewoon woord", min(10)],
  ["wasbaar", "eigenschap", min(100)],
  ["opmeting", "dienst (geen product)", { soort: "pagina", waarde: "/op-maat-en-plaatsing/opmeting-aan-huis" }],
  ["a", "één teken", min(1)],
];

/** Voldoet het resultaat? `detail` zegt hoe sterk: bij merk en type het aandeel in de eerste tien. */
function beoordeel(verwacht, r) {
  const tien = r.listing.items.slice(0, 10);
  const aantal = r.listing.total ?? `${r.listing.items.length}+`;
  switch (verwacht.soort) {
    case "slug":
      return { ok: tien.some((k) => k.slug === verwacht.waarde), detail: `plaats ${r.listing.items.findIndex((k) => k.slug === verwacht.waarde) + 1 || "–"}` };
    case "slugBevat": {
      const n = tien.filter((k) => k.slug.includes(verwacht.waarde)).length;
      return { ok: n > 0, detail: `${n} van de eerste ${tien.length}` };
    }
    case "merk":
    case "type": {
      const n = tien.filter((k) => (verwacht.soort === "merk" ? k.brand : k.type) === verwacht.waarde).length;
      return { ok: n > 0, zwak: n > 0 && n < Math.ceil(tien.length / 2), detail: `${n} van de eerste ${tien.length}` };
    }
    case "min":
      return { ok: r.listing.items.length >= verwacht.waarde, detail: `${aantal} producten` };
    case "geen":
      return { ok: r.listing.items.length === 0, detail: `${aantal} producten` };
    case "pagina":
      return { ok: r.pages.some((p) => p.href === verwacht.waarde), detail: `${r.pages.length} pagina's, ${aantal} producten` };
  }
}

const nu = Date.now();
const regels = [];
for (const [i, [q, soort, verwacht]] of REEKS.entries()) {
  // Genoeg pagina's om een verwacht minimum te kunnen tellen.
  const pagina = verwacht.soort === "min" ? Math.ceil(verwacht.waarde / PAGE_SIZE) : 1;
  try {
    const r = await zoek(q, { pagina: String(pagina) });
    regels.push({ nr: i + 1, q, soort, verwacht, ...beoordeel(verwacht, r), eerste: r.listing.items.slice(0, 3).map((k) => k.title).join(" | ") });
  } catch (e) {
    regels.push({ nr: i + 1, q, soort, verwacht, ok: false, detail: `FOUT ${e.message.slice(0, 80)}`, eerste: "" });
  }
}
const toon = (v) => (v.soort === "geen" ? "geen resultaat" : v.soort === "min" ? `≥ ${v.waarde}` : v.soort === "pagina" ? `pagina ${v.waarde}` : `${v.soort} ${v.waarde}`);
console.log("\n1. De 55 zoekopdrachten\n");
for (const r of regels) console.log(`${r.ok ? (r.zwak ? "~" : "✓") : "✖"} ${String(r.nr).padStart(2)} ${r.q.padEnd(26)} ${r.soort.padEnd(30)} ${toon(r.verwacht).padEnd(52)} ${r.detail}${r.ok ? "" : `   → ${r.eerste}`}`);
const goed = regels.filter((r) => r.ok).length;
console.log(`\n${goed} van ${regels.length} doen wat de klant verwacht (${regels.filter((r) => r.zwak).length} daarvan zwak: minder dan de helft van de eerste tien) · ${((Date.now() - nu) / 1000).toFixed(0)} s`);

/* ---------------- 2. filters, sortering, aantallen, paginering ---------------- */

let ok = 0;
const fouten = [];
async function check(naam, fn) {
  try {
    await fn();
    ok++;
  } catch (e) {
    fouten.push(`✖ ${naam}\n    ${String(e.message).split("\n").slice(0, 3).join("\n    ")}`);
  }
}
const bedrag = (k) => (k.pricing === "fixed" && k.price ? k.price.amount.amount : null);
const slugs = (r) => r.listing.items.map((k) => k.slug);

await check("zoekterm: spaties, lengte en dubbelepunt", () => {
  assert.equal(zoekterm("  kleur:  110 "), "kleur 110");
  assert.equal(zoekterm(["a", "b"]), "a");
  assert.equal(zoekterm(undefined), "");
  assert.equal(zoekterm("x".repeat(500)).length, 120);
});

await check("smalle zoekopdracht: totaal = aantal kaarten, geen dubbels, geen 'meer'", async () => {
  const r = await zoek("rampur", { pagina: "20" });
  assert.equal(typeof r.listing.total, "number");
  assert.equal(r.listing.total, r.listing.items.length);
  assert.equal(new Set(slugs(r)).size, r.listing.items.length);
  assert.equal(r.listing.hasMore, false);
});

await check("brede zoekopdracht: geen totaal, wel 'meer', pagina 2 begint met pagina 1", async () => {
  const een = await zoek("behang");
  assert.equal(een.listing.total, null, "een totaal dat Shopify afkapt op 1000 mag niet getoond worden");
  assert.equal(een.listing.items.length, PAGE_SIZE);
  assert.equal(een.listing.hasMore, true);
  const twee = await zoek("behang", { pagina: "2" });
  assert.equal(twee.listing.items.length, 2 * PAGE_SIZE);
  assert.deepEqual(slugs(twee).slice(0, PAGE_SIZE), slugs(een));
  assert.equal(new Set(slugs(twee)).size, 2 * PAGE_SIZE);
});

await check("laatste pagina van een afgekapte lijst: geen 'meer', geen totaal, wel de melding", async () => {
  const r = await zoek("behang", { pagina: "999" });
  assert.equal(r.listing.hasMore, false);
  assert.equal(r.listing.total, null);
  assert.equal(r.listing.afgekapt, true);
  assert.equal(new Set(slugs(r)).size, r.listing.items.length);
});

await check("filters: enkel werkende filters, OF binnen een filter, EN tussen filters", async () => {
  const basis = await zoek("vloerkleed", { pagina: "999" });
  const groepen = basis.listing.groups;
  assert.ok(groepen.length >= 2, `te weinig filters: ${groepen.map((g) => g.def.key).join(",")}`);
  for (const g of groepen) {
    assert.ok(g.options.length >= 2, `${g.def.key}: een filter met één waarde kan de lijst niet verkleinen`);
    assert.ok(g.options.every((o) => o.count === undefined), `${g.def.key}: zoekfilters tonen geen aantal`);
  }
  assert.ok(!groepen.some((g) => g.def.key === "beschikbaarheid"), "Beschikbaarheid werkt niet zolang Shopify geen voorraad volgt");
  const lijsten = groepen.filter((g) => g.def.kind !== "bucket");
  const [a, b] = lijsten;
  const [a1, a2] = a.options;
  const telt = async (sp) => (await zoek("vloerkleed", { ...sp, pagina: "999" })).listing.items.length;
  const nA1 = await telt({ [a.def.key]: a1.value });
  const nA2 = await telt({ [a.def.key]: a2.value });
  const nOf = await telt({ [a.def.key]: `${a1.value},${a2.value}` });
  assert.ok(nA1 > 0 && nA2 > 0, `${a.def.key}: een getoonde waarde geeft geen resultaat (${nA1}, ${nA2})`);
  assert.ok(nA1 < basis.listing.items.length, "een filter verkleint de lijst");
  assert.ok(nOf >= Math.max(nA1, nA2) && nOf <= nA1 + nA2, `OF binnen ${a.def.key}: ${nA1} of ${nA2} → ${nOf}`);
  const nEn = await telt({ [a.def.key]: a1.value, [b.def.key]: b.options[0].value });
  assert.ok(nEn <= nA1, `EN tussen ${a.def.key} en ${b.def.key}: ${nA1} → ${nEn}`);
});

await check("filters: de keuze uit de URL komt terug in de toestand, onzin valt weg", async () => {
  const basis = await zoek("vloerkleed");
  const g = basis.listing.groups.find((x) => x.def.kind !== "bucket");
  const r = await zoek("vloerkleed", { [g.def.key]: `${g.options[0].value},bestaat-niet`, onbekend: "x", sorteer: "hack", pagina: "-3" });
  assert.deepEqual(r.listing.state.selection, { [g.def.key]: [g.options[0].value] });
  assert.equal(r.listing.state.sort, ZOEK_SORTERINGEN[0].value);
  assert.equal(r.listing.state.page, 1);
  assert.equal(r.gefilterd, true);
  assert.ok(r.listing.groups.find((x) => x.def.key === g.def.key).options.some((o) => o.value === g.options[0].value), "de gekozen waarde blijft afvinkbaar");
});

await check("prijs: één klasse tegelijk, elke getoonde klasse heeft resultaten en klopt met de kaarten", async () => {
  const basis = await zoek("vloerkleed");
  const prijs = basis.listing.groups.find((g) => g.def.key === "prijs");
  assert.ok(prijs, "geen prijsfilter");
  assert.equal(prijs.def.enkel, true);
  for (const o of prijs.options) {
    const r = await zoek("vloerkleed", { prijs: o.value });
    assert.ok(r.listing.items.length > 0, `prijsklasse ${o.label} is leeg`);
    assert.deepEqual(r.listing.state.selection, { prijs: [o.value] });
    const klasse = prijs.def.buckets.find((k) => k.value === o.value);
    for (const k of r.listing.items) {
      if (o.value === "op-aanvraag") assert.equal(bedrag(k), null, `${k.slug} heeft een prijs`);
    }
    if (o.value !== "op-aanvraag") {
      // Een product hoort bij de klasse als één van zijn varianten erin valt: de kaartprijs ("vanaf") kan dus lager liggen, nooit hoger dan de bovengrens.
      const buiten = r.listing.items.filter((k) => bedrag(k) !== null && bedrag(k) >= klasse.max);
      assert.equal(buiten.length, 0, `${o.label}: ${buiten.slice(0, 3).map((k) => `${k.slug} € ${bedrag(k)}`).join(", ")}`);
    }
  }
  const twee = await zoek("vloerkleed", { prijs: `${prijs.options[0].value},${prijs.options[1].value}` });
  assert.deepEqual(twee.listing.state.selection, { prijs: [prijs.options[0].value] }, "Shopify kent één prijsbereik");
});

await check("sorteren: relevantie is de standaard en staat niet in de toestand als iets anders", async () => {
  const r = await zoek("rampur");
  assert.equal(r.listing.state.sort, "relevantie");
  assert.deepEqual(r.listing.sorts.map((s) => s.value), ["relevantie", "prijs-op", "prijs-af"]);
});

// Een product "op aanvraag" (etalage) dat in Shopify toch een prijs heeft, sorteert Shopify op die
// prijs: het staat dan tussen de producten met een prijs. Dat is een fout in de productgegevens,
// geen fout in de code; meer dan een handvol wijst wel op een fout in de sortering zelf.
const etalageMetPrijs = new Set();
for (const q of ["rampur", "vloerkleed"]) {
  await check(`sorteren op prijs (${q}): oplopend en aflopend, 'op aanvraag' achteraan`, async () => {
    for (const [sorteer, richting] of [["prijs-op", 1], ["prijs-af", -1]]) {
      const r = await zoek(q, { sorteer, pagina: "3" });
      const prijzen = r.listing.items.map(bedrag);
      const laatsteMetPrijs = prijzen.findLastIndex((p) => p !== null);
      const ertussen = r.listing.items.filter((k, i) => bedrag(k) === null && i < laatsteMetPrijs);
      for (const k of ertussen) etalageMetPrijs.add(k.slug);
      assert.ok(ertussen.length <= 5, `${sorteer}: ${ertussen.length} producten op aanvraag staan tussen de producten met een prijs`);
      const metPrijs = prijzen.filter((p) => p !== null);
      const fout = metPrijs.findIndex((p, i) => i > 0 && (p - metPrijs[i - 1]) * richting < 0);
      assert.equal(fout, -1, `${sorteer}: € ${metPrijs[fout - 1]} staat voor € ${metPrijs[fout]} (plaats ${fout + 1})`);
      assert.equal(new Set(slugs(r)).size, r.listing.items.length);
    }
  });
}

await check("sorteren en filteren blijven behouden bij de volgende pagina", async () => {
  const basis = await zoek("vloerkleed");
  const g = basis.listing.groups.find((x) => x.def.kind !== "bucket");
  const sp = { [g.def.key]: g.options[0].value, sorteer: "prijs-af" };
  const een = await zoek("vloerkleed", sp);
  const twee = await zoek("vloerkleed", { ...sp, pagina: "2" });
  assert.deepEqual(twee.listing.state.selection, een.listing.state.selection);
  assert.equal(twee.listing.state.sort, "prijs-af");
  assert.deepEqual(slugs(twee).slice(0, een.listing.items.length), slugs(een));
});

await check("geen resultaat: lege lijst, totaal 0, geen filters", async () => {
  const r = await zoek("xyzzyqq");
  assert.equal(r.listing.items.length, 0);
  assert.equal(r.listing.total, 0);
  assert.equal(r.listing.hasMore, false);
  assert.equal(r.gefilterd, false);
});

/* ---------------- 3. suggesties ---------------- */

await check("suggesties: hoogstens zes producten, met beeld, titel en prijsgegevens", async () => {
  const s = await zoekSuggesties("rampur");
  assert.ok(s.products.length > 0 && s.products.length <= 6);
  for (const p of s.products) {
    assert.ok(p.slug && p.title && p.image?.src, JSON.stringify(p).slice(0, 120));
    assert.ok(p.pricing === "on-request" || p.price, `${p.slug}: geen prijs`);
  }
  assert.equal(new Set(s.products.map((p) => p.slug)).size, s.products.length);
});
await check("suggesties: tikfout en onbestaand woord", async () => {
  assert.ok((await zoekSuggesties("behnag")).products.length > 0);
  const niets = await zoekSuggesties("xyzzyqq");
  assert.deepEqual([niets.products.length, niets.categories.length, niets.pages.length, niets.queries.length], [0, 0, 0, 0]);
});
await check("suggesties: een Shopify-pagina leidt naar de pagina van de site", async () => {
  const s = await zoekSuggesties("contact");
  assert.ok(s.pages.every((p) => p.href.startsWith("/")), JSON.stringify(s.pages));
  // Een Shopify-pagina met de slug van een dienst, infopagina of artikel als handle wordt een zoekresultaat.
  assert.equal(paginaVanShopify("opmeting-aan-huis", "x")?.href, "/op-maat-en-plaatsing/opmeting-aan-huis");
  assert.equal(paginaVanShopify("levering", "x")?.href, "/info/levering");
  assert.equal(paginaVanShopify("contact", "Contact")?.href, "/winkel-en-contact");
  assert.equal(paginaVanShopify("bestaat-niet-op-de-site", "x"), undefined);
});

console.log(`\n2–3. Filters, sortering, paginering en suggesties: ${ok} geslaagd, ${fouten.length} mislukt`);
for (const f of fouten) console.log(f);
if (etalageMetPrijs.size) console.log(`\nProductgegevens: op de site "op aanvraag", in Shopify met een prijs (Shopify sorteert ze op die prijs): ${[...etalageMetPrijs].join(", ")}`);
process.exitCode = fouten.length ? 1 : 0;
