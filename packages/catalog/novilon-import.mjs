// novilon-import.mjs — de Forbo Novilon-rolvinyl (Basic, Viva, Traffic) als nieuwe producten in Shopify.
//
// Bron: ..\Data\Novilon\NOVILON_BRON.json + de foto's ernaast (zie novilon-ophalen.mjs).
// Model zoals het andere rolvinyl (Tarkett, Beauflor): één product per dessin, productType "Vinylvloer",
// optie "Breedte" (2 m / 3 m / 4 m), verkoop per m², collecties Vloerbekleding + Vinyl vloeren,
// gepubliceerd op Brunic Headless. Titel = lijn + dessin ("Basic Light Timber"), merk (vendor) Novilon.
// Prijs 0 = nog geen prijs: de site toont dan "op aanvraag" en de kassa weigert (brunic.etalage = false,
// expliciet gezet). Teksten volgens docs/teksten-en-beloftes.md §C1: Forbo in de derde persoon, u-vorm,
// geen lever- of winkelbeloftes van de fabrikant.
//
//   node packages/catalog/novilon-import.mjs                      # dry-run → ..\Data\Novilon\NOVILON_IMPORT_REVIEW_<tijd>.md + _PLAN_<tijd>.json
//   node packages/catalog/novilon-import.mjs --go [--alleen <handle>]   # aanmaken; pushlog in ..\Data\
//   node packages/catalog/novilon-import.mjs --rollback "<pushlog>" --go # de aangemaakte producten weer verwijderen
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { admin, DOMAIN, ROOT_DIR } from "./_shopify.mjs";

const DATA = join(ROOT_DIR, "..", "Data");
const MAP = join(DATA, "Novilon");
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const GO = process.argv.includes("--go");
const ALLEEN = arg("--alleen");
const ROLLBACK = arg("--rollback");
const stempel = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

/* ---------- rollback ---------- */
if (ROLLBACK) {
  const log = JSON.parse(readFileSync(ROLLBACK, "utf8"));
  console.log(`${log.producten.length} producten in ${ROLLBACK} · ${GO ? "VERWIJDERT" : "DRY-RUN"}`);
  for (const p of log.producten) {
    if (!p.id) continue;
    console.log(`  ${p.titel} ${p.id}`);
    if (!GO) continue;
    const r = await admin(`mutation($i:ProductDeleteInput!){ productDelete(input:$i){ deletedProductId userErrors{ message } } }`, { i: { id: p.id } });
    if (r.productDelete.userErrors.length) console.log(`    ⚠ ${JSON.stringify(r.productDelete.userErrors)}`);
  }
  process.exit(0);
}

/* ---------- per dessin: kleurfamilie en uitzicht (nagekeken op de productfoto's, 19/11/2026) ---------- */
// uitzicht: planken | visgraat | chevron | mozaiek | terrazzo | beton | cementtegel | steen | effen
const DESSIN = {
  // Basic
  5442: ["Beige", "planken"], 5441: ["Bruin", "planken"], 5443: ["Grijs", "planken"], 6131: ["Wit", "planken"],
  6134: ["Naturel", "planken"], 6161: ["Naturel", "planken"], 5457: ["Beige", "planken"], 5763: ["Beige", "steen"],
  5616: ["Beige", "terrazzo"], 5619: ["Grijs", "terrazzo"],
  // Viva
  5759: ["Bruin", "planken"], 5758: ["Naturel", "planken"], 5756: ["Beige", "planken"], 5738: ["Naturel", "chevron"],
  5446: ["Naturel", "visgraat"], 5445: ["Beige", "visgraat"], 5449: ["Bruin", "visgraat"], 5781: ["Grijs", "planken"],
  5782: ["Grijs", "planken"], 5818: ["Naturel", "mozaiek"], 5628: ["Beige", "effen"], 5600: ["Grijs", "effen"],
  5601: ["Taupe", "effen"], 5602: ["Antraciet", "effen"], 7362: ["Grijs", "steen"], 8523: ["Grijs", "steen"],
  5615: ["Grijs", "terrazzo"], 5625: ["Beige", "terrazzo"], 5631: ["Grijs", "cementtegel"], 5633: ["Beige", "cementtegel"],
  // Traffic
  3034: ["Beige", "planken"], 3036: ["Naturel", "planken"], 3028: ["Bruin", "planken"], 3093: ["Naturel", "planken"],
  3095: ["Beige", "planken"], 3086: ["Beige", "planken"], 3087: ["Naturel", "planken"], 3089: ["Bruin", "planken"],
  3052: ["Naturel", "planken"], 3092: ["Beige", "planken"], 3018: ["Beige", "planken"], 3016: ["Naturel", "planken"],
  3023: ["Grijs", "planken"], 3024: ["Grijs", "planken"], 3097: ["Grijs", "beton"], 3096: ["Beige", "beton"],
  3066: ["Beige", "beton"], 3054: ["Taupe", "beton"], 3111: ["Grijs", "effen"], 3117: ["Grijs", "effen"],
};
// Kenmerk "Dessin": de site leidt er de look-filter uit af (facet-normalisatie.ts: hout → Planken, tegel → Tegels,
// beton/steen → Steen / beton, effen → Effen / gespikkeld).
const DESSIN_LABEL = {
  planken: "Houtlook (planken)", visgraat: "Houtlook (visgraat)", chevron: "Houtlook (Hongaarse punt)", mozaiek: "Houtlook (mozaïekparket)",
  terrazzo: "Terrazzo (steenlook)", beton: "Betonlook", cementtegel: "Tegellook (cementtegels)", steen: "Steenlook", effen: "Effen",
};
const LOOK_ZIN = {
  planken: "een houtlook in planken", visgraat: "een houtlook in visgraatmotief", chevron: "een houtlook in Hongaarse punt",
  mozaiek: "een houtlook in mozaïekparket", terrazzo: "een terrazzolook", beton: "een betonlook", cementtegel: "de look van cementtegels",
  steen: "een steenlook", effen: "een rustig, effen uitzicht",
};
const TINT = { Beige: "een beige", Bruin: "een bruine", Grijs: "een grijze", Wit: "een witte", Naturel: "een natuurlijke houtkleurige", Taupe: "een taupe", Antraciet: "een antracietgrijze", Ecru: "een ecru" };

/* ---------- labels van Forbo → kenmerken ---------- */
const KLASSE = { domestic: "huishoudelijk", commercial: "commercieel", industrial: "industrieel" };
const ZWAARTE = { moderate: "licht", heavy: "zwaar", general: "normaal", domestic: "zwaar" };
function uitLabels(labels) {
  const u = { klassen: [], brand: null, db: null, slip: null };
  for (const { code } of labels) {
    let m;
    if ((m = code.match(/^class_(\d\d)_(domestic|commercial|industrial)(?:_(\w+))?$/))) {
      const zwaarte = m[2] === "domestic" ? "zwaar" : ZWAARTE[m[3]] ?? "";
      u.klassen.push({ nr: m[1], soort: m[2], tekst: `${zwaarte} ${KLASSE[m[2]]} gebruik`.trim() });
    } else if ((m = code.match(/^reaction_to_fire_(\w+?)_(s\d)$/))) u.brand = `${m[1][0].toUpperCase()}${m[1].slice(1)}-${m[2]}`;
    else if ((m = code.match(/^acoustic_db_(\d+)$/))) u.db = Number(m[1]);
    else if ((m = code.match(/^din51130_\w*?_(r\d+)$/))) u.slip = m[1].toUpperCase();
    else throw new Error(`onbekend Forbo-label: ${code}`);
  }
  return u;
}

const spec = (d, re) => d.specs.find((s) => re.test(s.label))?.waarde ?? [];
const cm = (s) => Number(s.match(/x\s*(\d+)\s*cm/)?.[1]);
const meter = (c) => `${c / 100} m`;
const opsomming = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} of ${xs.at(-1)}` : xs[0]);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function bouw(d) {
  const [kleur, uitzicht] = DESSIN[d.nr] ?? [];
  if (!kleur) throw new Error(`${d.titel}: geen kleur/uitzicht in DESSIN`);
  const lijn = d.lijn;
  const L = uitLabels(d.labels);
  const dikte = spec(d, /^Dikte$/i)[0];
  const slijtlaag = spec(d, /slijtlaag/i)[0];
  const lrv = spec(d, /^LRV$/i)[0];
  const ncs = spec(d, /^NCS$/i)[0];
  const gerecycleerd = spec(d, /gerecycleerd/i)[0];
  const rolPagina = spec(d, /lengte x breedte/i);
  const rollengte = (d.rolmaten[0].match(/^([≤±])\s*(\d+)\s*m/) ?? []);
  const rollengteTekst = rollengte[1] === "≤" ? `tot ${rollengte[2]} m` : `± ${rollengte[2]} m`;

  // Varianten: dessinnummer ↔ breedte volgens de positie in de dessinlijst. Controle: Forbo's reeks
  // (4 cijfers = 4 m, 5de cijfer 3 = 3 m, 2 = 2 m) en de breedtes op de productpagina.
  const waarschuwingen = [];
  const varianten = d.nummers.map((nr, i) => {
    const breedte = cm(d.rolmaten[i]);
    const verwacht = nr.length === 4 ? 400 : { 2: 200, 3: 300 }[nr.at(-1)];
    if (verwacht !== breedte) waarschuwingen.push(`${nr}: volgens de lijst ${breedte} cm, volgens Forbo's nummering ${verwacht} cm`);
    return { nr, breedte };
  });
  const paginaBreedtes = new Set(rolPagina.map(cm));
  for (const v of varianten) if (!paginaBreedtes.has(v.breedte)) waarschuwingen.push(`${v.breedte} cm staat niet op de productpagina`);
  if (paginaBreedtes.size !== varianten.length) waarschuwingen.push(`pagina: ${[...paginaBreedtes].join("/")} cm, lijst: ${varianten.map((v) => v.breedte).join("/")} cm`);
  varianten.sort((a, b) => a.breedte - b.breedte);
  const breedtesM = varianten.map((v) => String(v.breedte / 100));

  const res = L.klassen.find((k) => k.soort === "domestic");
  const com = L.klassen.find((k) => k.soort === "commercial");
  const ind = L.klassen.find((k) => k.soort === "industrial");
  const specificaties = [
    { label: "Dessin", waarde: DESSIN_LABEL[uitzicht] },
    { label: "Dessinnummer", waarde: [...varianten].reverse().map((v) => `${v.nr} (${meter(v.breedte)})`).join(" · ") },
    { label: "Totale dikte", waarde: dikte },
    { label: "Dikte van de slijtlaag", waarde: slijtlaag },
    { label: "Rolbreedte", waarde: `${breedtesM.slice(0, -1).join(", ")}${breedtesM.length > 1 ? " en " : ""}${breedtesM.at(-1)} m` },
    { label: "Rollengte", waarde: rollengteTekst },
    res && { label: "Residentiële gebruiksklasse", waarde: `${res.nr} – ${res.tekst}` },
    com && { label: "Commerciële gebruiksklasse", waarde: `${com.nr} – ${com.tekst}` },
    ind && { label: "Industriële gebruiksklasse", waarde: `${ind.nr} – ${ind.tekst}` },
    L.brand && { label: "Brandklasse", waarde: L.brand },
    L.db && { label: "Contactgeluidreductie", waarde: `${L.db} dB` },
    L.slip && { label: "Slipweerstand", waarde: `${L.slip} (DIN 51130)` },
    { label: "Installatiemethode", waarde: "Losliggend tot 40 m²" },
    { label: "Vloerverwarming", waarde: "Geschikt" },
    { label: "Eigenschappen", waarde: "Geluidsabsorberend, Waterbestendig, Antistatisch, Ftalaatvrij" },
    lrv && { label: "Lichtreflectie (LRV)", waarde: lrv.replace(/(\d)%/, "$1 %") },
    ncs && { label: "NCS-kleurcode", waarde: ncs },
    gerecycleerd && { label: "Gerecycleerd materiaal", waarde: gerecycleerd.replace(/(\d)%/, "$1 %") },
  ].filter(Boolean);
  for (const s of specificaties) if (!s.waarde) throw new Error(`${d.titel}: kenmerk ${s.label} zonder waarde`);

  // Beschrijving (Brunic is de afzender, Forbo in de derde persoon, u-vorm).
  const klassenZin = L.klassen.map((k) => `${k.tekst} (klasse ${k.nr})`);
  const klassenTekst = `${klassenZin.slice(0, -1).join(", ")} en ${klassenZin.at(-1)}`;
  const zwaarste = lijn === "Traffic";
  const html = [
    `<p>${esc(d.titel)} is een cushion vinylvloer uit de collectie Novilon ${esc(lijn)} van Forbo, met ${LOOK_ZIN[uitzicht]}, in ${TINT[kleur]} tint.</p>`,
    `<p>Novilon heeft een veerkrachtige schuimlaag: de vloer voelt warm en zacht aan onder de voeten en dempt contactgeluid met ${L.db} dB. De Diamond Seal-afwerking maakt het oppervlak kras- en slijtvast, en de Noviclean-toplaag houdt vuil tegen, zodat de vloer makkelijk schoon te houden is. Volgens Forbo is Novilon zeer bestendig tegen water, koffie, wijn en andere vloeistoffen.</p>`,
    zwaarste
      ? `<p>Novilon Traffic is de stevigste lijn van Novilon: ${dikte} dik, met een slijtlaag van ${slijtlaag}. De vloer is geschikt voor ${klassenTekst}, dus ook voor een drukke hal, een winkel of een kantoor.</p>`
      : `<p>Met een totale dikte van ${dikte} en een slijtlaag van ${slijtlaag} is Novilon ${esc(lijn)} geschikt voor ${klassenTekst}.</p>`,
    "<ul>",
    "<li>Losliggend te plaatsen tot 40 m², zonder lijm. Zo kan de vloer later ook weer weggenomen worden.</li>",
    `<li>Op rol van ${opsomming(breedtesM)} m breed${breedtesM.includes("4") ? ": met een breedte tot 4 m legt u de meeste kamers zonder naad" : ""}.</li>`,
    "<li>Geschikt voor vloerverwarming.</li>",
    `<li>Slipweerstand ${L.slip} en brandklasse ${L.brand}.</li>`,
    "<li>Antistatisch, ftalaatvrij en met zeer lage emissies in de binnenlucht (TVOC ≤ 0,02 mg/m²).</li>",
    "</ul>",
    `<p>Forbo produceert Novilon met 100 % hernieuwbare elektriciteit${gerecycleerd ? `. Novilon ${esc(lijn)} bevat ${gerecycleerd.replace(/(\d)%/, "$1 %")} gerecycleerd materiaal` : ""}.</p>`,
  ].join("\n");

  const handle = `vinyl-${d.titel.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-")}-novilon`;
  const mf = (key, type, value) => ({ namespace: "brunic", key, type, value: String(value) });
  return {
    titel: d.titel,
    handle,
    waarschuwingen,
    fotos: d.fotos.map((f) => ({ pad: join(MAP, ...f.bestand.split("/")), soort: f.soort, alt: `Novilon ${d.titel} – ${f.soort}` })),
    input: {
      handle,
      title: d.titel,
      vendor: "Novilon",
      productType: "Vinylvloer",
      status: "ACTIVE",
      descriptionHtml: html,
      tags: ["Novilon", `Novilon ${lijn}`, "Forbo", "Vinylvloeren", "Vloerbekleding", "leveranciersimport", "bron:forbo-be"],
      productOptions: [{ name: "Breedte", values: varianten.map((v) => ({ name: meter(v.breedte) })) }],
      metafields: [
        mf("etalage", "boolean", "false"),
        mf("verkoop_eenheid", "single_line_text_field", "Per m²"),
        mf("leverancier", "single_line_text_field", "Forbo"),
        mf("materiaal", "single_line_text_field", "Vinyl"),
        mf("kleurfamilie", "single_line_text_field", kleur),
        mf("collectie", "single_line_text_field", `Novilon ${lijn}`),
        mf("modelcode", "single_line_text_field", d.nr),
        mf("bron_id", "id", `forbo-novilon:${d.nr}`),
        mf("bron_url", "url", d.pagina),
        mf("specificaties", "json", JSON.stringify(specificaties)),
        mf("gebruiksklasse", "single_line_text_field", L.klassen.map((k) => k.nr).join(" / ")),
        mf("brandklasse", "single_line_text_field", L.brand),
        mf("vloerverwarming", "boolean", "true"),
        mf("rollengte_m", "number_decimal", rollengte[2]),
      ],
      variants: varianten.map((v) => ({
        optionValues: [{ optionName: "Breedte", name: meter(v.breedte) }],
        sku: `NOV-${v.nr}`,
        price: "0.00",
        inventoryPolicy: "DENY",
        inventoryItem: { tracked: false, requiresShipping: true },
        metafields: [
          mf("kleurfamilie", "single_line_text_field", kleur),
          mf("rolbreedte_cm", "number_integer", v.breedte),
          mf("artikelcode_leverancier", "single_line_text_field", v.nr),
        ],
      })),
    },
  };
}

/* ---------- plan ---------- */
const bron = JSON.parse(readFileSync(join(MAP, "NOVILON_BRON.json"), "utf8"));
const plan = bron.dessins.map(bouw).filter((p) => !ALLEEN || p.handle === ALLEEN);
if (!plan.length) throw new Error(`niets te doen${ALLEEN ? ` (--alleen ${ALLEEN} onbekend)` : ""}`);

// Bestaat er al iets met dezelfde handle of SKU?
const bestaand = [];
for (let i = 0; i < plan.length; i += 10) {
  const groep = plan.slice(i, i + 10);
  const q = groep.map((p) => `handle:${p.handle}`).join(" OR ");
  const d = await admin(`query($q:String!){ products(first:20, query:$q){ nodes{ id handle title } } }`, { q });
  bestaand.push(...d.products.nodes);
  const skus = groep.flatMap((p) => p.input.variants.map((v) => `sku:${v.sku}`)).join(" OR ");
  const s = await admin(`query($q:String!){ productVariants(first:50, query:$q){ nodes{ sku product{ handle } } } }`, { q: skus });
  for (const v of s.productVariants.nodes) bestaand.push({ handle: v.product.handle, sku: v.sku });
}

const coll = {};
for (const h of ["vloerbekleding", "vloerbekleding-vinyl"]) {
  const d = await admin(`query($h:String!){ collectionByHandle(handle:$h){ id title } }`, { h });
  if (!d.collectionByHandle) throw new Error(`collectie ${h} niet gevonden`);
  coll[h] = d.collectionByHandle.id;
}
const pubs = (await admin(`{ publications(first:20){ nodes{ id name } } }`)).publications.nodes;
const kanaal = pubs.find((p) => p.name === "Brunic Headless");
if (!kanaal) throw new Error("publicatie Brunic Headless niet gevonden");

const regels = [
  `# Novilon-import — review ${stempel}`,
  "",
  `Winkel: ${DOMAIN} · ${plan.length} producten · ${plan.reduce((n, p) => n + p.input.variants.length, 0)} varianten · ${plan.reduce((n, p) => n + p.fotos.length, 0)} foto's`,
  `Collecties: ${Object.keys(coll).join(", ")} · publicatie: ${kanaal.name} · status ACTIVE, prijs 0 (= op aanvraag tot de prijs er is)`,
  "",
  bestaand.length ? `## ⚠ Bestaat al\n\n${bestaand.map((b) => `- ${b.handle}${b.sku ? ` (SKU ${b.sku})` : ""}`).join("\n")}\n` : "Geen bestaande producten of SKU's met dezelfde handle/SKU.\n",
  "| Product | Breedtes (SKU) | Kleur | Dessin | Foto's | Let op |",
  "|---|---|---|---|---|---|",
  ...plan.map((p) => {
    const sp = JSON.parse(p.input.metafields.find((m) => m.key === "specificaties").value);
    return `| ${p.titel} | ${p.input.variants.map((v) => `${v.optionValues[0].name} (${v.sku})`).join(", ")} | ${p.input.metafields.find((m) => m.key === "kleurfamilie").value} | ${sp.find((s) => s.label === "Dessin").waarde} | ${p.fotos.map((f) => f.soort.replace("foto", "")).join(", ")} | ${p.waarschuwingen.join("; ")} |`;
  }),
  "",
  "## Voorbeeld: kenmerken en beschrijving",
  ...["Basic", "Viva", "Traffic"].flatMap((l) => {
    const p = plan.find((x) => x.input.tags.includes(`Novilon ${l}`));
    if (!p) return [];
    const sp = JSON.parse(p.input.metafields.find((m) => m.key === "specificaties").value);
    return ["", `### ${p.titel}`, "", ...sp.map((s) => `- **${s.label}:** ${s.waarde}`), "", "```html", p.input.descriptionHtml, "```"];
  }),
];
const reviewPad = join(MAP, `NOVILON_IMPORT_REVIEW_${stempel}.md`);
writeFileSync(reviewPad, regels.join("\n"));
writeFileSync(join(MAP, `NOVILON_IMPORT_PLAN_${stempel}.json`), JSON.stringify(plan, null, 2));
console.log(`winkel: ${DOMAIN} · ${GO ? "SCHRIJFT" : "DRY-RUN"} · ${plan.length} producten`);
for (const p of plan.filter((x) => x.waarschuwingen.length)) console.log(`  ⚠ ${p.titel}: ${p.waarschuwingen.join("; ")}`);
if (bestaand.length) console.log(`  ⚠ bestaat al: ${bestaand.map((b) => b.handle + (b.sku ? `/${b.sku}` : "")).join(", ")}`);
console.log(`→ ${reviewPad}`);
if (!GO) process.exit(0);
// Herhaalbaar: een product dat al bestaat (zelfde handle) wordt overgeslagen. Een SKU die bij een
// ánder product hoort, is een echt conflict: dan niets doen.
const alGemaakt = new Set(bestaand.filter((b) => !b.sku).map((b) => b.handle));
const conflict = bestaand.filter((b) => b.sku && !alGemaakt.has(b.handle));
if (conflict.length) throw new Error(`SKU's bestaan al bij andere producten: ${conflict.map((b) => `${b.sku} (${b.handle})`).join(", ")}`);
if (alGemaakt.size) console.log(`  overgeslagen (bestaat al): ${[...alGemaakt].join(", ")}`);
plan.splice(0, plan.length, ...plan.filter((p) => !alGemaakt.has(p.handle)));

/* ---------- schrijven ---------- */
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
async function laadOp(handle, fotos) {
  const bestanden = fotos.map((f, i) => ({ ...f, buf: readFileSync(f.pad), naam: `${handle}-${String(i + 1).padStart(2, "0")}-${f.soort}${extname(f.pad)}`, mime: MIME[extname(f.pad).toLowerCase()] }));
  const r = await admin(
    `mutation($i:[StagedUploadInput!]!){ stagedUploadsCreate(input:$i){ stagedTargets{ url resourceUrl parameters{ name value } } userErrors{ field message } } }`,
    { i: bestanden.map((b) => ({ filename: b.naam, mimeType: b.mime, resource: "IMAGE", httpMethod: "POST", fileSize: String(b.buf.length) })) },
  );
  if (r.stagedUploadsCreate.userErrors.length) throw new Error(`staged: ${JSON.stringify(r.stagedUploadsCreate.userErrors)}`);
  const uit = [];
  for (const [i, doel] of r.stagedUploadsCreate.stagedTargets.entries()) {
    const form = new FormData();
    for (const p of doel.parameters) form.append(p.name, p.value);
    form.append("file", new Blob([bestanden[i].buf], { type: bestanden[i].mime }), bestanden[i].naam);
    const res = await fetch(doel.url, { method: "POST", body: form });
    if (!res.ok) throw new Error(`upload ${bestanden[i].naam}: HTTP ${res.status}`);
    uit.push({ originalSource: doel.resourceUrl, alt: bestanden[i].alt, contentType: "IMAGE" });
  }
  return uit;
}

const logPad = join(DATA, `NOVILON_SHOPIFY_PUSH_LOG_${stempel}.json`);
const log = { winkel: DOMAIN, op: new Date().toISOString(), producten: [] };
const fouten = [];
for (const p of plan) {
  try {
    const files = await laadOp(p.handle, p.fotos);
    const r = await admin(
      `mutation($i:ProductSetInput!){ productSet(synchronous:true, input:$i){ product{ id handle variants(first:5){ nodes{ id sku } } } userErrors{ field message code } } }`,
      { i: { ...p.input, files, collections: Object.values(coll) } },
    );
    if (r.productSet.userErrors.length) throw new Error(JSON.stringify(r.productSet.userErrors));
    const prod = r.productSet.product;
    log.producten.push({ titel: p.titel, id: prod.id, handle: prod.handle, varianten: prod.variants.nodes });
    writeFileSync(logPad, JSON.stringify(log, null, 2));
    const pub = await admin(`mutation($id:ID!,$i:[PublicationInput!]!){ publishablePublish(id:$id, input:$i){ userErrors{ field message } } }`, { id: prod.id, i: [{ publicationId: kanaal.id }] });
    if (pub.publishablePublish.userErrors.length) throw new Error(`publiceren: ${JSON.stringify(pub.publishablePublish.userErrors)}`);
    console.log(`  ✓ ${p.titel} (${prod.variants.nodes.map((v) => v.sku).join(", ")}, ${files.length} foto's)`);
  } catch (e) {
    fouten.push(`${p.titel}: ${e.message}`);
    console.log(`  ✗ ${p.titel}: ${e.message}`);
  }
}
writeFileSync(logPad, JSON.stringify(log, null, 2));
console.log(`\n${log.producten.length} aangemaakt, ${fouten.length} fouten · pushlog ${logPad}`);
if (fouten.length) process.exit(1);
