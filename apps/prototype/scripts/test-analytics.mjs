/**
 * Test van de regels achter de cookiemelding en de metingen — zonder browser en zonder Shopify:
 *
 * 1. toestemming: wanneer geldt een keuze, wanneer vragen we opnieuw, wat gaat er naar Shopify;
 * 2. metingen: ID's, bedragen, zoekterm en adres zoals ze met een gebeurtenis meegaan;
 * 3. ontdubbelen: geen dubbele telling door React, wel elke echte paginawissel.
 *
 *   pnpm --filter @brunic/prototype test:analytics
 *
 * Het gedrag in een echte browser (cookies, netwerkverzoeken, Shopify's eigen scripts) staat in
 * docs/analytics-en-cookies.md §Testoverzicht.
 */
import assert from "node:assert/strict";

const imp = (p) => import(new URL(`../src/${p}`, import.meta.url).href);
const regels = await imp("lib/consent/regels.ts");
const payloads = await imp("lib/analytics/payloads.ts");

let geslaagd = 0;
const test = (naam, doe) => {
  try {
    doe();
    geslaagd++;
    console.log(`  ✓ ${naam}`);
  } catch (e) {
    console.error(`  ✗ ${naam}\n    ${e.message}`);
    process.exitCode = 1;
  }
};

/* ---------------- 1. toestemming ---------------- */
console.log("1. Toestemming");
const { geldigeKeuze, maakStempel, leesStempel, naarShopify, BELEID_VERSIE, GELDIG_DAGEN, STEMPEL_SLEUTEL, CATEGORIEEN } = regels;
const nu = new Date("2026-11-16T10:00:00Z");
const dagenGeleden = (n) => new Date(nu.getTime() - n * 86_400_000);
const JA = { analytics: "yes", marketing: "no", preferences: "no", sale_of_data: "no" };
const NEE = { analytics: "no", marketing: "no", preferences: "no", sale_of_data: "no" };
const LEEG = { analytics: "", marketing: "", preferences: "", sale_of_data: "" };

test("stempel heen en terug", () => {
  const s = maakStempel(nu);
  assert.equal(s, `${BELEID_VERSIE}|2026-11-16`);
  assert.deepEqual(leesStempel(s), { versie: BELEID_VERSIE, datum: new Date("2026-11-16T00:00:00Z") });
  assert.ok(STEMPEL_SLEUTEL.length <= 25 && s.length <= 100, "past binnen Shopify's grenzen voor toestemmingsgegevens");
});
test("onleesbare stempel = geen keuze", () => {
  for (const s of [undefined, null, "", "1", "x|2026-11-16", "1|16/11/2026", "1|2026-13-45", 42, {}]) assert.equal(leesStempel(s), null, JSON.stringify(s));
});
test("nieuw bezoek: niets gekozen → geen keuze (alles geblokkeerd)", () => {
  assert.equal(geldigeKeuze(LEEG, undefined, nu), null);
  assert.equal(geldigeKeuze(null, maakStempel(nu), nu), null);
  assert.equal(geldigeKeuze(undefined, undefined, nu), null);
});
test("aanvaard en geweigerd zijn allebei een geldige keuze", () => {
  assert.deepEqual(geldigeKeuze(JA, maakStempel(nu), nu), { analytics: true, marketing: false });
  assert.deepEqual(geldigeKeuze(NEE, maakStempel(nu), nu), { analytics: false, marketing: false });
});
test("toestemming zonder stempel telt niet (bv. door Shopify's regiostandaard gezet)", () => {
  assert.equal(geldigeKeuze(JA, undefined, nu), null);
});
test(`na ${GELDIG_DAGEN} dagen opnieuw vragen — ook na een weigering`, () => {
  assert.ok(geldigeKeuze(JA, maakStempel(dagenGeleden(GELDIG_DAGEN - 1)), nu));
  assert.equal(geldigeKeuze(JA, maakStempel(dagenGeleden(GELDIG_DAGEN + 1)), nu), null);
  assert.equal(geldigeKeuze(NEE, maakStempel(dagenGeleden(GELDIG_DAGEN + 1)), nu), null);
});
test("nieuwe versie van het beleid → opnieuw vragen", () => {
  assert.equal(geldigeKeuze(JA, maakStempel(nu, BELEID_VERSIE + 1), nu), null);
  assert.equal(geldigeKeuze(JA, maakStempel(nu, BELEID_VERSIE - 1), nu), null);
});
test("stempel uit de toekomst telt niet", () => {
  assert.equal(geldigeKeuze(JA, maakStempel(new Date(nu.getTime() + 5 * 86_400_000)), nu), null);
});
test("naar Shopify: enkel actieve doelen kunnen aan", () => {
  assert.deepEqual(naarShopify({ analytics: true, marketing: true }), { analytics: true, marketing: CATEGORIEEN.find((c) => c.sleutel === "marketing").actief, preferences: false, sale_of_data: CATEGORIEEN.find((c) => c.sleutel === "marketing").actief });
  assert.deepEqual(naarShopify({ analytics: false, marketing: false }), { analytics: false, marketing: false, preferences: false, sale_of_data: false });
});
test("melding toont enkel wat de site gebruikt: vandaag alleen statistieken", () => {
  assert.deepEqual(CATEGORIEEN.filter((c) => c.actief).map((c) => c.sleutel), ["analytics"]);
});

/* ---------------- 2. metingen ---------------- */
console.log("2. Metingen");
const { gid, productPayload, collectiePayload, schoneZoekterm, zoekPayload, zonderPersoonsgegevens, paginaSleutel, GEBEURTENIS, maakOntdubbelaar } = payloads;

test("gebeurtenisnamen zijn die van Shopify", () => {
  assert.deepEqual(GEBEURTENIS, { pagina: "page_viewed", product: "product_viewed", collectie: "collection_viewed", zoeken: "search_viewed" });
});
test("korte ID's worden volledige GID's, een GID blijft wat hij is", () => {
  assert.equal(gid("Product", "123"), "gid://shopify/Product/123");
  assert.equal(gid("ProductVariant", "gid://shopify/ProductVariant/9"), "gid://shopify/ProductVariant/9");
});
const product = { id: "100", title: "Rampur 0600", brand: "Ragolle" };
const variant = { id: "200", sku: "A-1", options: { Kleur: "4747", Maat: "80 × 150 cm" }, price: { amount: { amount: 79, currency: "EUR" }, unit: "stuk" } };
test("product: ID's, prijs als tekst met twee decimalen, valuta EUR", () => {
  assert.deepEqual(productPayload(product, variant), {
    id: "gid://shopify/Product/100",
    title: "Rampur 0600",
    vendor: "Ragolle",
    variantId: "gid://shopify/ProductVariant/200",
    variantTitle: "4747 / 80 × 150 cm",
    price: { amount: "79.00", currencyCode: "EUR" },
    quantity: 1,
    sku: "A-1",
  });
  assert.equal(productPayload(product, { ...variant, price: { amount: { amount: 12.5, currency: "EUR" }, unit: "meter" } }).price.amount, "12.50");
});
test("samengevoegd ontwerp: het product van de variant, niet dat van de pagina", () => {
  assert.equal(productPayload(product, { ...variant, bronProductId: "555" }).id, "gid://shopify/Product/555");
});
test("prijs op aanvraag gaat mee als 0.00; variant zonder opties heet 'Default Title'", () => {
  const p = productPayload({ id: "1", title: "Stof" }, { id: "2", sku: "", options: {}, price: null });
  assert.equal(p.price.amount, "0.00");
  assert.equal(p.variantTitle, "Default Title");
  assert.equal(p.vendor, "Brunic");
  assert.equal(p.sku, null);
});
test("de Shopify-vendor gaat voor op het moedermerk van de site", () => {
  assert.equal(productPayload({ ...product, brand: "Tarkett", merkBron: "Desso" }, variant).vendor, "Desso");
});
test("collectie: enkel met Shopify-ID", () => {
  assert.deepEqual(collectiePayload({ handle: "tapijten", id: "gid://shopify/Collection/7" }), { collection: { id: "gid://shopify/Collection/7", handle: "tapijten" } });
  assert.equal(collectiePayload({ handle: "tapijten" }), null);
  assert.equal(collectiePayload(undefined), null);
});
test("zoekterm: opgeschoond en ingekort", () => {
  assert.equal(schoneZoekterm("  linnen   gordijn "), "linnen gordijn");
  assert.equal(schoneZoekterm("x".repeat(200)).length, 80);
  assert.equal(schoneZoekterm(""), null);
  assert.equal(schoneZoekterm(null), null);
});
test("zoekterm met e-mailadres of telefoonnummer gaat niet mee", () => {
  for (const t of ["jan.peeters@telenet.be", "bestelling jan@x.be", "054 33 73 52", "+32 475 12 34 56", "0475/12.34.56"]) assert.equal(schoneZoekterm(t), null, t);
  // Productcodes en maten blijven wel werken.
  for (const t of ["rampur 0600", "160 x 230", "6849", "behang 53 cm"]) assert.equal(schoneZoekterm(t), t, t);
});
test("zoekmeting: aantal enkel als het gekend is", () => {
  assert.deepEqual(zoekPayload("linnen", 12), { searchTerm: "linnen", searchResults: { totalCount: 12 } });
  assert.deepEqual(zoekPayload("linnen", null), { searchTerm: "linnen" });
  assert.equal(zoekPayload("jan@x.be", 3), null);
});
test("adres zonder persoonsgegevens: een gewoon adres blijft onaangeroerd (null)", () => {
  for (const u of [
    "https://www.brunic.be/",
    "https://www.brunic.be/catalogus/tapijten?kleur=grijs&maat=170-240&pagina=2#lijst",
    "https://www.brunic.be/zoeken?q=linnen",
    "https://www.brunic.be/zoeken?q=rampur%200600",
    "https://www.brunic.be/product/x?variant=59354776928588",
    // Campagnecodes blijven: ze zeggen waar het bezoek vandaan komt.
    "https://www.brunic.be/?utm_source=nieuwsbrief&utm_campaign=herfst&gclid=abc123",
  ]) assert.equal(zonderPersoonsgegevens(u), null, u);
});
test("adres zonder persoonsgegevens: zoekterm met e-mailadres of telefoonnummer verdwijnt, de rest blijft", () => {
  assert.equal(zonderPersoonsgegevens("https://www.brunic.be/zoeken?q=jan%40telenet.be&kleur=grijs"), "https://www.brunic.be/zoeken?kleur=grijs");
  assert.equal(zonderPersoonsgegevens("https://www.brunic.be/zoeken?q=0475%2012%2034%2056"), "https://www.brunic.be/zoeken");
});
test("adres zonder persoonsgegevens: een e-mailadres in eender welke parameter verdwijnt", () => {
  assert.equal(zonderPersoonsgegevens("https://www.brunic.be/product/x?variant=123&email=jan%40x.be&utm_source=mail"), "https://www.brunic.be/product/x?variant=123&utm_source=mail");
  assert.equal(zonderPersoonsgegevens("https://www.brunic.be/?ontvanger=jan.peeters%40telenet.be#top"), "https://www.brunic.be/#top");
});

/* ---------------- 3. ontdubbelen ---------------- */
console.log("3. Ontdubbelen");
test("paginasleutel: een andere variant is geen nieuw bezoek, de volgorde van de query telt niet", () => {
  assert.equal(paginaSleutel("/product/x", "variant=1"), "/product/x");
  assert.equal(paginaSleutel("/product/x", "variant=1"), paginaSleutel("/product/x", "variant=2"));
  assert.equal(paginaSleutel("/catalogus/a", "kleur=grijs&maat=1"), paginaSleutel("/catalogus/a", "maat=1&kleur=grijs"));
  assert.notEqual(paginaSleutel("/catalogus/a", "kleur=grijs"), paginaSleutel("/catalogus/a", "kleur=rood"));
});
test("onmiddellijke herhaling (React Strict Mode) telt één keer", () => {
  const mag = maakOntdubbelaar(1000);
  assert.equal(mag("pagina", "/a", 0), true);
  assert.equal(mag("pagina", "/a", 5), false);
  assert.equal(mag("pagina", "/a", 999), false);
});
test("soorten lopen door elkaar zonder elkaar te storen (pagina + product, elk twee keer)", () => {
  const mag = maakOntdubbelaar(1000);
  assert.deepEqual([mag("pagina", "/p", 0), mag("product", "9", 1), mag("pagina", "/p", 2), mag("product", "9", 3)], [true, true, false, false]);
});
test("A → B → A telt drie keer, hoe snel ook; later terugkeren ook", () => {
  const mag = maakOntdubbelaar(1000);
  assert.deepEqual([mag("pagina", "/a", 0), mag("pagina", "/b", 100), mag("pagina", "/a", 200)], [true, true, true]);
  assert.equal(mag("pagina", "/a", 5000), true, "dezelfde pagina na het venster (herladen via een link) telt opnieuw");
});

console.log(`\n${geslaagd} geslaagd${process.exitCode ? " — met fouten" : ""}`);
