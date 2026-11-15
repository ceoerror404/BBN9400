// set-beloftes-inhoud.mjs — zet de beloftes van Brunic (beloftes-teksten.mjs) gelijk in de code
// en in de Shopify-metaobjects. Beslist door Alexander op 13/11/2026 (docs/teksten-en-beloftes.md).
//
//   node packages/catalog/set-beloftes-inhoud.mjs --code              # past apps/prototype/src aan (lokaal)
//   node packages/catalog/set-beloftes-inhoud.mjs                     # dry-run metaobjects → ..\Data\BELOFTES_INHOUD_PLAN_*.json
//   node packages/catalog/set-beloftes-inhoud.mjs --apply <plan.json> # schrijft naar Shopify + pushlog
//   node packages/catalog/set-beloftes-inhoud.mjs --rollback <log.json>
//   node packages/catalog/set-beloftes-inhoud.mjs --controle          # telt verboden formuleringen (code + metaobjects)
//
// De metaobjects `categorie_inhoud` voor verf en slapen-wonen worden in --apply verwijderd
// (B7: verf en slaapcomfort helemaal weg); de pushlog bewaart alle velden om ze terug te zetten.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { admin, ROOT_DIR } from "./_shopify.mjs";
import { VERVANGINGEN, VELDEN_EXACT, VERBODEN } from "./beloftes-teksten.mjs";

const args = process.argv.slice(2);
const DATA = join(ROOT_DIR, "..", "Data");
const stempel = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const WEG = [
  ["categorie_inhoud", "verf"],
  ["categorie_inhoud", "slapen-wonen"],
];

function vervang(tekst) {
  const exact = VELDEN_EXACT.find(([oud]) => tekst.trim() === oud);
  if (exact) return { t: exact[1], gebruikt: [exact[0]] };
  let t = tekst;
  const gebruikt = [];
  for (const [oud, nieuw] of VERVANGINGEN) {
    if (oud !== nieuw && t.includes(oud)) {
      t = t.split(oud).join(nieuw);
      gebruikt.push(oud.slice(0, 50));
    }
  }
  return { t, gebruikt };
}

/** Rich text van Shopify: JSON-boom met tekstknopen. Enkel de tekstwaarden aanpassen. */
function vervangRich(json) {
  const boom = JSON.parse(json);
  const gebruikt = [];
  const loop = (n) => {
    if (!n || typeof n !== "object") return;
    if (typeof n.value === "string") {
      const r = vervang(n.value);
      n.value = r.t;
      gebruikt.push(...r.gebruikt);
    }
    for (const c of n.children ?? []) loop(c);
  };
  loop(boom);
  return { t: JSON.stringify(boom), gebruikt };
}

function platteTekst(f) {
  if (!/rich/.test(f.type)) return f.value ?? "";
  const out = [];
  const loop = (n) => {
    if (!n || typeof n !== "object") return;
    if (typeof n.value === "string") out.push(n.value);
    for (const c of n.children ?? []) loop(c);
  };
  try {
    loop(JSON.parse(f.value));
  } catch {
    return f.value ?? "";
  }
  return out.join(" ");
}

const verbodenIn = (tekst) => VERBODEN.filter((r) => r.test(tekst)).map((r) => r.source);

async function alleMetaobjects() {
  const defs = await admin(`{ metaobjectDefinitions(first: 50) { nodes { type } } }`);
  const alle = [];
  for (const { type } of defs.metaobjectDefinitions.nodes) {
    let after = null;
    do {
      const r = await admin(
        `query($t:String!,$a:String){ metaobjects(type:$t, first:100, after:$a){ pageInfo{hasNextPage endCursor} nodes{ id handle type fields{ key type value } } } }`,
        { t: type, a: after },
      );
      alle.push(...r.metaobjects.nodes);
      after = r.metaobjects.pageInfo.hasNextPage ? r.metaobjects.pageInfo.endCursor : null;
    } while (after);
  }
  return alle;
}

function codeBestanden(dir = join(ROOT_DIR, "apps", "prototype", "src")) {
  const out = [];
  for (const naam of readdirSync(dir)) {
    const p = join(dir, naam);
    if (statSync(p).isDirectory()) out.push(...codeBestanden(p));
    else if (/\.(ts|tsx)$/.test(naam)) out.push(p);
  }
  return out;
}

// ── --code ──────────────────────────────────────────────────────────────
if (args[0] === "--code") {
  let n = 0;
  for (const p of codeBestanden()) {
    const oud = readFileSync(p, "utf8");
    const { t, gebruikt } = vervang(oud);
    if (t !== oud) {
      writeFileSync(p, t, "utf8");
      n += gebruikt.length;
      console.log(`${relative(ROOT_DIR, p)}: ${gebruikt.length} vervanging(en)`);
    }
  }
  console.log(`Klaar: ${n} vervangingen in de code.`);
  process.exit(0);
}

// ── --controle ──────────────────────────────────────────────────────────
if (args[0] === "--controle") {
  let treffers = 0;
  // Technische namen, geen klanttekst: de (lege) categorie Verf en de redirects van oude URL's.
  const TECHNISCH = /[\\/](categories|shopify-bron|oude-urls)\.ts$/;
  for (const p of codeBestanden().filter((p) => !TECHNISCH.test(p))) {
    const regels = readFileSync(p, "utf8").split("\n");
    regels.forEach((r, i) => {
      // Commentaar en technische namen tellen niet: enkel tekst tussen aanhalingstekens of JSX.
      if (/^\s*(\/\/|\*|\/\*)/.test(r)) return;
      const v = verbodenIn(r);
      if (v.length) {
        treffers++;
        console.log(`CODE ${relative(ROOT_DIR, p)}:${i + 1} [${v.join(", ")}] ${r.trim().slice(0, 140)}`);
      }
    });
  }
  for (const m of await alleMetaobjects()) {
    if (WEG.some(([t, h]) => t === m.type && h === m.handle)) {
      treffers++;
      console.log(`SHOPIFY ${m.type}/${m.handle}: hoort verwijderd te zijn (verf/slaapcomfort)`);
      continue;
    }
    for (const f of m.fields) {
      if (!f.value || !/text|rich/.test(f.type)) continue;
      const v = verbodenIn(platteTekst(f));
      if (v.length) {
        treffers++;
        console.log(`SHOPIFY ${m.type}/${m.handle}.${f.key} [${v.join(", ")}] ${platteTekst(f).slice(0, 140)}`);
      }
    }
  }
  console.log(`Controle: ${treffers} treffer(s).`);
  process.exit(treffers ? 1 : 0);
}

// ── --rollback ──────────────────────────────────────────────────────────
if (args[0] === "--rollback") {
  const log = JSON.parse(readFileSync(args[1], "utf8"));
  for (const r of log.bijgewerkt ?? []) {
    const fields = r.velden.map((v) => ({ key: v.key, value: v.oud }));
    const res = await admin(`mutation($id:ID!,$m:MetaobjectUpdateInput!){ metaobjectUpdate(id:$id, metaobject:$m){ userErrors{ field message } } }`, { id: r.id, m: { fields } });
    console.log(`${r.type}/${r.handle}: ${res.metaobjectUpdate.userErrors.length ? JSON.stringify(res.metaobjectUpdate.userErrors) : "teruggezet"}`);
  }
  for (const r of log.verwijderd ?? []) {
    const fields = r.fields.filter((f) => f.value != null).map((f) => ({ key: f.key, value: f.value }));
    const res = await admin(`mutation($m:MetaobjectCreateInput!){ metaobjectCreate(metaobject:$m){ userErrors{ field message } } }`, { m: { type: r.type, handle: r.handle, fields } });
    console.log(`${r.type}/${r.handle}: ${res.metaobjectCreate.userErrors.length ? JSON.stringify(res.metaobjectCreate.userErrors) : "opnieuw aangemaakt"}`);
  }
  process.exit(0);
}

// ── --apply ─────────────────────────────────────────────────────────────
if (args[0] === "--apply") {
  const plan = JSON.parse(readFileSync(args[1], "utf8"));
  const log = { gestart: new Date().toISOString(), plan: args[1], bijgewerkt: [], verwijderd: [], fouten: [] };
  const logPad = join(DATA, `BELOFTES_INHOUD_SHOPIFY_PUSH_LOG_${stempel}.json`);
  const bewaar = () => writeFileSync(logPad, JSON.stringify(log, null, 1), "utf8");
  for (const w of plan.wijzigingen) {
    const res = await admin(`mutation($id:ID!,$m:MetaobjectUpdateInput!){ metaobjectUpdate(id:$id, metaobject:$m){ userErrors{ field message } } }`, {
      id: w.id,
      m: { fields: w.velden.map((v) => ({ key: v.key, value: v.nieuw })) },
    });
    const fout = res.metaobjectUpdate.userErrors;
    if (fout.length) log.fouten.push({ ...w, fout });
    else log.bijgewerkt.push(w);
    bewaar();
  }
  for (const v of plan.verwijderen) {
    const res = await admin(`mutation($id:ID!){ metaobjectDelete(id:$id){ deletedId userErrors{ field message } } }`, { id: v.id });
    const fout = res.metaobjectDelete.userErrors;
    if (fout.length) log.fouten.push({ ...v, fout });
    else log.verwijderd.push(v);
    bewaar();
  }
  console.log(`Bijgewerkt: ${log.bijgewerkt.length} metaobjects, verwijderd: ${log.verwijderd.length}, fouten: ${log.fouten.length}. Log: ${logPad}`);
  process.exit(log.fouten.length ? 1 : 0);
}

// ── dry-run (standaard) ─────────────────────────────────────────────────
const alle = await alleMetaobjects();
const wijzigingen = [];
const verwijderen = [];
const review = [];
for (const m of alle) {
  if (WEG.some(([t, h]) => t === m.type && h === m.handle)) {
    verwijderen.push({ id: m.id, type: m.type, handle: m.handle, fields: m.fields });
    review.push(`### ${m.type}/${m.handle}: VERWIJDEREN (verf/slaapcomfort)`);
    continue;
  }
  const velden = [];
  for (const f of m.fields) {
    if (!f.value || !/text|rich/.test(f.type)) continue;
    const r = /rich/.test(f.type) ? vervangRich(f.value) : vervang(f.value);
    if (r.t !== f.value) velden.push({ key: f.key, type: f.type, oud: f.value, nieuw: r.t });
  }
  if (velden.length) {
    wijzigingen.push({ id: m.id, type: m.type, handle: m.handle, velden });
    review.push(`### ${m.type}/${m.handle}`);
    for (const v of velden) {
      review.push(`- **${v.key}**`);
      review.push(`  - vóór: ${platteTekst({ type: v.type, value: v.oud }).slice(0, 2000)}`);
      review.push(`  - na: ${platteTekst({ type: v.type, value: v.nieuw }).slice(0, 2000)}`);
    }
  }
}
// Wat na de vervanging nog verboden is (bv. een zin die in rich text over twee knopen gesplitst is).
const rest = [];
for (const m of alle) {
  if (WEG.some(([t, h]) => t === m.type && h === m.handle)) continue;
  const w = wijzigingen.find((x) => x.id === m.id);
  for (const f of m.fields) {
    if (!f.value || !/text|rich/.test(f.type)) continue;
    const nieuw = w?.velden.find((v) => v.key === f.key)?.nieuw ?? f.value;
    const v = verbodenIn(platteTekst({ type: f.type, value: nieuw }));
    if (v.length) rest.push(`${m.type}/${m.handle}.${f.key} [${v.join(", ")}]`);
  }
}
const planPad = join(DATA, `BELOFTES_INHOUD_PLAN_${stempel}.json`);
const reviewPad = join(DATA, `BELOFTES_INHOUD_REVIEW_${stempel}.md`);
writeFileSync(planPad, JSON.stringify({ gemaakt: new Date().toISOString(), wijzigingen, verwijderen }, null, 1), "utf8");
writeFileSync(reviewPad, [`# Beloftes in metaobjects — dry-run ${stempel}`, "", ...review, "", "## Nog verboden na de vervanging", "", ...(rest.length ? rest.map((r) => `- ${r}`) : ["Geen."])].join("\n"), "utf8");
console.log(`Metaobjects: ${alle.length}. Te wijzigen: ${wijzigingen.length} (${wijzigingen.reduce((s, w) => s + w.velden.length, 0)} velden). Te verwijderen: ${verwijderen.length}. Nog verboden na vervanging: ${rest.length}.`);
for (const r of rest) console.log("  REST", r);
console.log(`Plan: ${planPad}\nReview: ${reviewPad}`);
