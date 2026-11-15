#!/usr/bin/env node
// set-leveranciersteksten.mjs — productbeschrijvingen volgens de huisregels C1 van
// docs/teksten-en-beloftes.md (beslist 13/11/2026):
//   A8  de vinylbrief ("Beste klanten, … Neem contact met ons op via mail …") weglaten;
//   A2  de garantietermijn uit het kenmerk "Garantie" als zin achteraan de beschrijving
//       ("Beauflor geeft op deze vloer 10 jaar fabrieksgarantie bij residentieel gebruik.");
//       het kenmerk zelf blijft in Shopify, de site verbergt het label;
//   A3/A4/A6  zinnen van de fabrikant in de wij-vorm, met leverbeloftes of in de je-vorm
//       vervangen volgens leveranciersteksten.json (per merk: oude zin → nieuwe zin, "" = schrappen).
//
//   node packages/catalog/set-leveranciersteksten.mjs                 dry-run: review + plan in ..\Data
//   node packages/catalog/set-leveranciersteksten.mjs --apply <plan>  schrijft het plan naar Shopify (pushlog)
//   node packages/catalog/set-leveranciersteksten.mjs --rollback <log> zet de oude HTML uit een pushlog terug
//   node packages/catalog/set-leveranciersteksten.mjs --controle      telt wat live nog tegen de regels ingaat
//
// Lezen van Shopify gebeurt altijd live (Admin API, enkel actieve producten). Schrijven enkel met
// --apply/--rollback. Herhaalbaar: een tweede run op een al aangepaste beschrijving verandert niets.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { admin, ROOT_DIR } from "./_shopify.mjs";

const DATA_DIR = join(ROOT_DIR, "..", "Data");
const MAPPING = JSON.parse(readFileSync(new URL("./leveranciersteksten.json", import.meta.url), "utf8"));
const stempel = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

// ---------------------------------------------------------------------------------------------
// Tekst en HTML

const ENTITEITEN = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", ndash: "–", mdash: "—", eacute: "é", euml: "ë", egrave: "è", ouml: "ö", aring: "å", Aring: "Å", auml: "ä", iuml: "ï", hellip: "…" };
const decodeer = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITEITEN[e] ?? m,
  );

/** Zoals htmlNaarTekst in apps/prototype/src/lib/catalog/shopify-adapter.ts: wat de klant ziet. */
function htmlNaarTekst(html) {
  return decodeer(
    html
      .replace(/<table\b[\s\S]*?<\/table>/gi, "")
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
/** Zinnen zoals de klant ze leest (één per regel of per leesteken). */
const zinnen = (html) =>
  htmlNaarTekst(html)
    .split(/\n+|(?<=[.!?])\s+/)
    .map((z) => z.trim())
    .filter(Boolean);
/** Vergelijkingsvorm: zonder tags, zonder witruimte. Voor de snelle voorselectie. */
const plat = (html) => decodeer(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, "");

const esc = (c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TAG = "(?:<[^>]+>)*";
const WIT = "(?:\\s|&nbsp;|&#160;|<[^>]+>)*";
/** Regex die een zin in HTML vindt, ook met tags, entiteiten of &nbsp; ertussen. */
function zinRegex(zin) {
  const delen = [];
  for (const c of [...zin]) {
    if (/\s/.test(c)) {
      delen.push(WIT);
      continue;
    }
    const alt = [esc(c), `&#${c.codePointAt(0)};`, `&#x${c.codePointAt(0).toString(16)};`];
    for (const [naam, waarde] of Object.entries(ENTITEITEN)) if (waarde === c) alt.push(`&${naam};`);
    delen.push(`(?:${alt.join("|")})`, TAG);
  }
  return new RegExp(delen.join("").replace(/(\(\?:<\[\^>\]\+>\)\*)+$/, ""), "g");
}
const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Vervang een zin; de tags binnen de gevonden zin blijven staan (dan blijft de HTML in evenwicht). */
function vervangZin(html, oud, nieuw) {
  if (!plat(html).includes(oud.replace(/\s+/g, ""))) return { html, n: 0 };
  let n = 0;
  const uit = html.replace(zinRegex(oud), (m) => {
    n++;
    return escHtml(nieuw) + (m.match(/<[^>]+>/g) ?? []).join("");
  });
  return { html: uit, n };
}

/** Lege omhulsels die na het schrappen overblijven. */
function ruimOp(html) {
  let vorig;
  do {
    vorig = html;
    html = html
      .replace(/<(p|div|strong|b|a|span|em|i|u)\b[^>]*>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/\1>/gi, "")
      .replace(/(<(p|div|strong|b)\b[^>]*>)(?:\s|&nbsp;)*<br\s*\/?>/gi, "$1")
      .replace(/<br\s*\/?>(?:\s|&nbsp;)*(<\/(p|div|strong|b)>)/gi, "$1");
  } while (html !== vorig);
  return html.trim();
}

// ---------------------------------------------------------------------------------------------
// Regels

const VINYL_MERKEN = new Set(["Beauflor", "Tarkett", "Gerflor"]);
/** A8: de brief bij vinyl. Langste eerst, zodat "…info@brunic.be“" vóór "…info@brunic.be" komt. */
const VINYLBRIEF = [
  "Heeft u graag dat uw vloerbekleding geplaatst wordt of vindt u niet de geschikte afmeting die u wenst?",
  "Neem dan gerust contact op met ons zodat we de juiste afmeting kunnen bestellen voor u via info@brunic.be",
  "Neem dan gerust contact op met ons zodat we de juiste afmeting kunnen bestellen voor u:",
  "Heeft u graag dat uw vloerbekleding geplaatst wordt?",
  "Vindt u niet de geschikte afmeting die u wenst?",
  "Neem contact met ons op via mail info@brunic.be“",
  "Neem contact met ons op via mail info@brunic.be",
  "mail: info@brunic.be",
  "Beste klanten,",
];
const isVinyl = (p) => VINYL_MERKEN.has(p.vendor) && /vinyl/i.test(p.productType ?? "");

/** A2: "10 jaar residentieel" → "10 jaar fabrieksgarantie bij residentieel gebruik". */
function garantieZin(merk, waarde) {
  const m = waarde.trim().match(/^(\d+)\s*jaar(\s+residentieel)?$/i);
  if (!m) return null;
  return `${merk} geeft op deze vloer ${m[1]} jaar fabrieksgarantie${m[2] ? " bij residentieel gebruik" : ""}.`;
}
function specs(p) {
  try {
    const v = JSON.parse(p.specificaties?.value ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Zinnen die Brunic zelf zegt: "ons" is hier Brunic, dat mag. */
const WHITELIST = [
  /^Neem contact met ons op via info@brunic\.be\.?$/,
  /^Wenst u een andere maat of hebt u een vraag over dit tapijt\? Neem contact met ons op via info@brunic\.be\.?$/,
  /^Contacteer ons voor meer info\.?$/,
];
const CONTROLES = {
  wij: /\b(wij|we|ons|onze)\b/i,
  je: /\b(je|jij|jou|jouw|jullie)\b/i,
  aanhef: /beste klant/i,
  levering: /levertijd|levertermijn|snelle levering|thuis geleverd|rechtstreeks .*geleverd|gratis op\b|halen .* gratis|gratis .*ophalen/i,
  winkellocator: /winkellocator|retailer/i,
  // Terugname, ophalen of inzamelen door de fabrikant: zegt Brunic bij de levering, niet op de site (14/11/2026).
  terugname: /take care|restart®|terugname|terugneem|terug naar (louis|de fabrikant|tarkett)|qr-code|ophal|inzamel|tweede thuis|doorverkoop/i,
  tekens: /\?\?/,
};
function overtredingen(html) {
  const uit = [];
  for (const z of zinnen(html)) {
    if (WHITELIST.some((w) => w.test(z))) continue;
    for (const [soort, re] of Object.entries(CONTROLES)) if (re.test(z)) uit.push({ soort, zin: z });
  }
  return uit;
}

/** Zinnen uit de mapping die minstens één keer gevonden zijn (de rest: tikfout of al aangepast). */
const GEBRUIKT = new Set();

/** Alle regels op één product. Geeft de nieuwe HTML en wat er gebeurde. */
function herschrijf(p) {
  let html = p.descriptionHtml ?? "";
  const soorten = new Set();
  const onbekend = [];
  if (isVinyl(p)) {
    for (const zin of VINYLBRIEF) {
      const r = vervangZin(html, zin, "");
      if (r.n) soorten.add("A8 vinylbrief");
      html = r.html;
    }
  }
  // Desso is een merk van Tarkett: dezelfde zinnen kunnen onder beide vendors staan.
  const groep = p.vendor === "Desso" || p.vendor === "Tarkett" ? ["Tarkett", "Desso"] : [p.vendor];
  const mapping = Object.assign({}, MAPPING["*"] ?? {}, ...groep.map((v) => MAPPING[v] ?? {}));
  for (const [oud, nieuw] of Object.entries(mapping).sort((a, b) => b[0].length - a[0].length)) {
    const r = vervangZin(html, oud, nieuw);
    if (r.n) GEBRUIKT.add(oud);
    if (r.n) soorten.add(nieuw ? "C1 herschreven" : "C1 geschrapt");
    html = r.html;
  }
  // Enkel opruimen als er iets veranderde: anders zou elke beschrijving met een lege <div> meegaan.
  if (soorten.size) html = ruimOp(html);
  const garantie = specs(p).find((s) => /^garantie$/i.test(String(s.label).trim()));
  if (garantie) {
    const zin = garantieZin(p.vendor === "Desso" ? "Tarkett" : p.vendor, String(garantie.waarde));
    if (!zin) onbekend.push(`garantiewaarde "${garantie.waarde}"`);
    else if (!htmlNaarTekst(html).includes("fabrieksgarantie")) {
      html = `${html}${html ? "\n" : ""}<p>${escHtml(zin)}</p>`;
      soorten.add("A2 garantiezin");
    }
  }
  return { html, soorten: [...soorten], onbekend };
}

// ---------------------------------------------------------------------------------------------
// Shopify

const Q = `query($c:String){ products(first:100, after:$c, query:"status:active"){
  pageInfo{ hasNextPage endCursor }
  nodes{ id handle title vendor productType descriptionHtml specificaties: metafield(namespace:"brunic", key:"specificaties"){ value } } } }`;
async function haalProducten() {
  const out = [];
  let c = null;
  do {
    const d = await admin(Q, { c });
    out.push(...d.products.nodes);
    c = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (c);
  return out;
}
const UPDATE = `mutation($p:ProductUpdateInput!){ productUpdate(product:$p){ product{ id } userErrors{ field message } } }`;
async function schrijf(regels, richting) {
  const log = [];
  for (const [i, r] of regels.entries()) {
    const html = richting === "terug" ? r.oud : r.nieuw;
    try {
      const d = await admin(UPDATE, { p: { id: r.id, descriptionHtml: html } });
      const fout = d.productUpdate.userErrors.map((e) => e.message).join("; ");
      log.push({ ...r, resultaat: fout || "ok" });
      if (fout) console.log(`  ! ${r.handle}: ${fout}`);
    } catch (e) {
      log.push({ ...r, resultaat: String(e.message ?? e) });
      console.log(`  ! ${r.handle}: ${e.message ?? e}`);
    }
    if ((i + 1) % 50 === 0) console.log(`  … ${i + 1}/${regels.length}`);
  }
  return log;
}

// ---------------------------------------------------------------------------------------------

const [modus, arg] = process.argv.slice(2);

if (modus === "--apply" || modus === "--rollback") {
  if (!arg || !existsSync(arg)) {
    console.error(`Gebruik: ${modus} <${modus === "--apply" ? "plan" : "pushlog"}.json>`);
    process.exit(1);
  }
  const bron = JSON.parse(readFileSync(arg, "utf8"));
  const regels = (bron.producten ?? bron).filter((r) => modus === "--apply" || r.resultaat === "ok");
  console.log(`${modus === "--apply" ? "Toepassen" : "Terugzetten"}: ${regels.length} producten`);
  const log = await schrijf(regels, modus === "--apply" ? "heen" : "terug");
  const pad = join(DATA_DIR, `LEVERANCIERSTEKSTEN_SHOPIFY_${modus === "--apply" ? "PUSH" : "ROLLBACK"}_LOG_${stempel()}.json`);
  writeFileSync(pad, JSON.stringify({ bron: arg, datum: new Date().toISOString(), producten: log }, null, 1), "utf8");
  const ok = log.filter((r) => r.resultaat === "ok").length;
  console.log(`Klaar: ${ok} ok, ${log.length - ok} fout. Log: ${pad}`);
  console.log("Daarna: --controle, en een nieuwe build van de site (de momentopname neemt het pas dan over).");
  process.exit(log.length - ok ? 1 : 0);
}

const producten = await haalProducten();
console.log(`Actieve producten in Shopify: ${producten.length}`);

if (modus === "--controle") {
  const telling = {};
  const voorbeelden = [];
  let zonderGarantie = 0;
  for (const p of producten) {
    for (const o of overtredingen(p.descriptionHtml ?? "")) {
      telling[p.vendor] ??= {};
      telling[p.vendor][o.soort] = (telling[p.vendor][o.soort] ?? 0) + 1;
      if (voorbeelden.length < 400) voorbeelden.push(`${p.vendor}\t${o.soort}\t${p.handle}\t${o.zin}`);
    }
    if (specs(p).some((s) => /^garantie$/i.test(String(s.label).trim())) && !htmlNaarTekst(p.descriptionHtml ?? "").includes("fabrieksgarantie")) zonderGarantie++;
  }
  const pad = join(DATA_DIR, `LEVERANCIERSTEKSTEN_CONTROLE_${stempel()}.tsv`);
  writeFileSync(pad, voorbeelden.join("\n"), "utf8");
  console.log("Treffers buiten de whitelist, per merk:", JSON.stringify(telling, null, 1));
  console.log(`Producten met kenmerk Garantie zonder garantiezin: ${zonderGarantie}`);
  console.log(`Zinnen: ${pad}`);
  const totaal = Object.values(telling).reduce((a, t) => a + Object.values(t).reduce((x, y) => x + y, 0), 0);
  process.exit(totaal || zonderGarantie ? 1 : 0);
}

// Dry-run
const plan = [];
const perSoort = {};
const perMerk = {};
const nietHerschreven = [];
const onbekend = [];
let leeg = 0;
for (const p of producten) {
  const r = herschrijf(p);
  for (const o of overtredingen(r.html)) nietHerschreven.push({ vendor: p.vendor, handle: p.handle, ...o });
  for (const x of r.onbekend) onbekend.push(`${p.handle}: ${x}`);
  if (!r.soorten.length || r.html === (p.descriptionHtml ?? "")) continue;
  plan.push({ id: p.id, handle: p.handle, vendor: p.vendor, soorten: r.soorten, oud: p.descriptionHtml ?? "", nieuw: r.html });
  for (const s of r.soorten) perSoort[s] = (perSoort[s] ?? 0) + 1;
  perMerk[p.vendor] = (perMerk[p.vendor] ?? 0) + 1;
  if (!htmlNaarTekst(r.html)) leeg++;
}

const t = stempel();
const planPad = join(DATA_DIR, `LEVERANCIERSTEKSTEN_PLAN_${t}.json`);
const reviewPad = join(DATA_DIR, `LEVERANCIERSTEKSTEN_REVIEW_${t}.md`);
writeFileSync(planPad, JSON.stringify({ datum: new Date().toISOString(), producten: plan }, null, 1), "utf8");

const md = [`# Leveranciersteksten: review van de dry-run (${t})`, "", `${plan.length} producten wijzigen. Tekst zoals de site hem toont (tabellen verborgen).`, ""];
md.push("## Niet herschreven", "", nietHerschreven.length ? "" : "Geen.", ...nietHerschreven.map((n) => `- ${n.vendor} · ${n.soort} · \`${n.handle}\`: ${n.zin}`), "");
if (onbekend.length) md.push("## Onbekende garantiewaarden", "", ...onbekend.map((o) => `- ${o}`), "");
for (const merk of [...new Set(plan.map((r) => r.vendor))].sort()) {
  md.push(`## ${merk}`, "");
  for (const r of plan.filter((x) => x.vendor === merk)) {
    md.push(`### \`${r.handle}\` · ${r.soorten.join(", ")}`, "", "**Vóór**", "", "> " + (htmlNaarTekst(r.oud) || "(leeg)").replace(/\n+/g, "\n>\n> "), "", "**Na**", "", "> " + (htmlNaarTekst(r.nieuw) || "(leeg)").replace(/\n+/g, "\n>\n> "), "");
  }
}
writeFileSync(reviewPad, md.join("\n"), "utf8");

console.log(`Te wijzigen: ${plan.length} producten`);
console.log("Per soort:", perSoort);
console.log("Per merk:", perMerk);
console.log(`Lege beschrijving na de wijziging: ${leeg}`);
console.log(`Niet herschreven (zinnen die nog tegen de regels ingaan): ${nietHerschreven.length}`);
console.log(`Onbekende garantiewaarden: ${onbekend.length}`);
const ongebruikt = Object.entries(MAPPING).flatMap(([merk, m]) => (typeof m === "object" ? Object.keys(m).filter((k) => !GEBRUIKT.has(k)).map((k) => `${merk}: ${k}`) : []));
console.log(`Zinnen uit de mapping die nergens gevonden zijn: ${ongebruikt.length}${ongebruikt.length ? "\n  " + ongebruikt.join("\n  ") : ""}`);
console.log(`Review: ${reviewPad}\nPlan:   ${planPad}`);
console.log(`Toepassen: node packages/catalog/set-leveranciersteksten.mjs --apply "${planPad}"`);
