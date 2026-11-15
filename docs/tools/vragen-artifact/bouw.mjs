#!/usr/bin/env node
/**
 * Bouwt de invulpagina (Claude-artifact) van docs/vragen-aan-brunic.md: per vraag een kaart
 * met een antwoordkader. Het md-bestand blijft de bron; de pagina is er een afdruk van.
 *
 *   node docs/tools/vragen-artifact/bouw.mjs <uitvoer.html> [--voorbeeld]
 *
 * - De uitvoer is de pagina zoals de Artifact-tool ze verwacht (geen doctype/head/body).
 *   Met --voorbeeld komt er een volledige HTML-pagina uit, om lokaal in een browser te bekijken.
 * - Deel 1 (open) en deel 2 (beantwoord) komen op de pagina. Deel 3 en de interne noot
 *   bovenaan niet: de pagina mag met Brunic gedeeld worden.
 * - De antwoorden die iemand typt, staan niet in de pagina maar in de opslag van het artifact
 *   (verzameling `antwoorden`, document `v<nummer>`: { nr, antwoord, bijgewerkt }).
 *   Ze blijven dus staan wanneer de pagina opnieuw gebouwd en gepubliceerd wordt.
 *
 * Waar het artifact staat en hoe de antwoorden terug in het md-bestand komen: zie de interne
 * noot bovenaan docs/vragen-aan-brunic.md.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const uit = args.find((a) => !a.startsWith("--"));
if (!uit) {
  console.error("Gebruik: node docs/tools/vragen-artifact/bouw.mjs <uitvoer.html> [--voorbeeld]");
  process.exit(2);
}
const md = fs.readFileSync(path.resolve(here, "../../vragen-aan-brunic.md"), "utf8").replace(/\r\n/g, "\n");
const sjabloon = fs.readFileSync(path.join(here, "sjabloon.html"), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

/** Kleine markdown-omzetter voor wat in het vragenbestand voorkomt: alinea's, lijsten, vakjes, tabellen. */
function naarHtml(tekst) {
  const regels = tekst.split("\n");
  const out = [];
  for (let i = 0; i < regels.length; ) {
    const r = regels[i];
    if (!r.trim()) { i++; continue; }
    if (r.startsWith("|")) {
      const rijen = [];
      while (i < regels.length && regels[i].startsWith("|")) rijen.push(regels[i++]);
      const cellen = (x) => x.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const rechts = cellen(rijen[1] ?? "").map((c) => /:$/.test(c) && !/^:/.test(c));
      const kop = cellen(rijen[0]);
      const k = (c, j, tag) => `<${tag}${rechts[j] ? ' class="rechts"' : ""}>${inline(c)}</${tag}>`;
      out.push(
        `<div class="tabel"><table><thead><tr>${kop.map((c, j) => k(c, j, "th")).join("")}</tr></thead><tbody>${rijen
          .slice(2)
          .map((x) => `<tr>${cellen(x).map((c, j) => k(c, j, "td")).join("")}</tr>`)
          .join("")}</tbody></table></div>`,
      );
      continue;
    }
    if (/^- /.test(r)) {
      const items = [];
      while (i < regels.length && /^- /.test(regels[i])) {
        const t = regels[i++].slice(2);
        const vak = t.match(/^\[( |x)\] (.*)$/);
        items.push(vak ? `<li class="vakje${vak[1] === "x" ? " aan" : ""}">${inline(vak[2])}</li>` : `<li>${inline(t)}</li>`);
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    const alinea = [];
    while (i < regels.length && regels[i].trim() && !regels[i].startsWith("|") && !/^- /.test(regels[i])) alinea.push(regels[i++].trim());
    out.push(`<p>${inline(alinea.join(" "))}</p>`);
  }
  return out.join("\n");
}

/* Overzichtstabel: nummer → status, dringendheid, herkomst */
const overzicht = new Map();
for (const m of md.matchAll(/^\| \[(\d+)\]\(#v\d+\) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \|$/gm)) {
  const [, nr, onderwerp, status, wanneer, bron] = m;
  overzicht.set(+nr, {
    onderwerp,
    status: /Beantwoord/.test(status) && !/Deels/.test(status) ? "beantwoord" : /Deels/.test(status) ? "deels" : "open",
    urgentie: /Dringend/.test(wanneer) ? "dringend" : /livegang/i.test(wanneer) ? "livegang" : "later",
    wanneer: wanneer.replace(/:.*$/, ""),
    bron,
  });
}

/* De vragen zelf, in de volgorde en de groepen van het bestand (deel 1 en 2) */
const einde = md.indexOf("\n# Deel 3");
const lijf = md.slice(md.indexOf("\n# Deel 1"), einde < 0 ? undefined : einde);
const groepen = [];
let deel = 0;
let groep = null;
let vraag = null;
const sluitVraag = () => { if (vraag) { groep.vragen.push(vraag); vraag = null; } };
for (const r of lijf.split("\n")) {
  const d = r.match(/^# Deel (\d)/);
  if (d) { sluitVraag(); deel = +d[1]; groep = { deel, titel: deel === 2 ? "Al beantwoord" : "", uitleg: [], vragen: [] }; groepen.push(groep); continue; }
  const g = r.match(/^## (?:[A-Z]\. )?(.+)$/);
  if (g) {
    sluitVraag();
    if (groep && !groep.vragen.length && !groep.titel) groep.titel = g[1];
    else { groep = { deel, titel: g[1], uitleg: [], vragen: [] }; groepen.push(groep); }
    continue;
  }
  const a = r.match(/^<a id="v(\d+)"><\/a>$/);
  if (a) { sluitVraag(); vraag = { nr: +a[1], titel: "", regels: [] }; continue; }
  if (r.trim() === "---") { sluitVraag(); continue; }
  if (vraag) {
    const k = r.match(/^### \d+\. (.+)$/);
    if (k && !vraag.titel) vraag.titel = k[1].replace(/\s*\([^()]*\)\s*$/, "");
    else vraag.regels.push(r);
  } else if (groep && r.trim()) groep.uitleg.push(r.trim());
}
sluitVraag();

const data = [];
const kaart = (v, g) => {
  const o = overzicht.get(v.nr);
  if (!o) throw new Error(`Vraag ${v.nr} staat niet in de overzichtstabel van vragen-aan-brunic.md`);
  const snede = v.regels.findIndex((r) => /^Antwoord\b/.test(r));
  const vraagTekst = (snede < 0 ? v.regels : v.regels.slice(0, snede)).join("\n");
  const antwoordTekst = snede < 0 ? "" : v.regels.slice(snede).join("\n").trim();
  const heeftAntwoord = antwoordTekst && antwoordTekst !== "Antwoord:";
  if (g.deel === 1 && o.status === "beantwoord") throw new Error(`Vraag ${v.nr} is beantwoord volgens het overzicht maar staat in deel 1`);
  if (g.deel === 2 && !heeftAntwoord) throw new Error(`Vraag ${v.nr} staat in deel 2 maar heeft geen antwoord`);
  data.push({ nr: v.nr, titel: v.titel, deel: g.deel, urgentie: g.deel === 1 ? o.urgentie : "beantwoord" });
  const pil = g.deel === 2 ? `<span class="pil pil-beantwoord">Beantwoord</span>` : `<span class="pil pil-${o.urgentie}">${esc(o.wanneer)}</span>`;
  // "Antwoord (via Alexander, 13/11/2026): tekst" → de aanhef wordt het label van het kader, de rest de inhoud.
  const aanhef = (antwoordTekst.match(/^Antwoord \(([^)]*)\):/) || [])[1];
  const gegevenKop = aanhef ? `Antwoord ${aanhef}` : o.status === "deels" ? "Al beantwoord" : "Antwoord";
  const gegeven = heeftAntwoord ? naarHtml(antwoordTekst.replace(/^Antwoord(?: \([^)]*\))?:\s*/, "")) : "";
  return `    <article class="vraag" id="vraag-${v.nr}" data-nr="${v.nr}">
      <header class="vraag-kop"><span class="nr">${v.nr}</span><h3>${inline(v.titel)}</h3>${pil}</header>
      <div class="tekst">
${naarHtml(vraagTekst)}
      </div>${
        gegeven
          ? `
      <div class="gegeven"><p class="gegeven-kop">${esc(gegevenKop)}</p><div class="gegeven-inhoud">
${gegeven}
      </div></div>`
          : ""
      }
      <div class="antwoord">
        <label for="antwoord-v${v.nr}">${g.deel === 2 ? "Aanvulling (als er iets verandert)" : o.status === "deels" ? "Antwoord op wat nog open staat" : "Antwoord"}</label>
        <textarea id="antwoord-v${v.nr}" rows="3" placeholder="${g.deel === 2 ? "Typ hier een aanvulling…" : "Typ hier het antwoord…"}"></textarea>
        <p class="stand" id="stand-v${v.nr}" aria-live="polite"></p>
      </div>
      <p class="bron">${esc(o.bron)}</p>
    </article>`;
};

const blokken = [];
for (const g of groepen.filter((x) => x.vragen.length)) {
  const kaarten = g.vragen.map((v) => kaart(v, g)).join("\n");
  if (g.deel === 2) {
    blokken.push(`  <details class="archief">
    <summary>Al beantwoord (${g.vragen.length})</summary>
    <section class="groep" data-deel="2">
      <p class="groep-uitleg">Deze antwoorden zijn uitgevoerd op de webshop. Verandert er iets, typ dan een aanvulling.</p>
${kaarten}
    </section>
  </details>`);
  } else {
    blokken.push(`  <section class="groep" data-deel="1">
    <h2>${inline(g.titel)}</h2>
${kaarten}
  </section>`);
  }
}

const stand = (md.match(/^Stand van (\d{2}\/\d{2}\/\d{4})/m) || [])[1] ?? "";
const open = data.filter((v) => v.deel === 1).length;
const klaar = data.length - open;
if (data.length !== overzicht.size) throw new Error(`Overzicht telt ${overzicht.size} vragen, de pagina ${data.length}`);

let pagina = sjabloon
  .replace("<!--@STAND-->", `Stand van ${stand} · ${open} open vragen, ${klaar} beantwoord`)
  .replace("<!--@VOORTGANG-->", `0 van de ${open} open vragen ingevuld`)
  .replace("<!--@KAARTEN-->", () => blokken.join("\n\n"))
  .replace("/*@DATA*/[]", () => JSON.stringify(data));

if (args.includes("--voorbeeld")) {
  pagina = `<!doctype html><html lang="nl-BE"><head><meta charset="utf8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${pagina}</body></html>`;
}
fs.mkdirSync(path.dirname(path.resolve(uit)), { recursive: true });
fs.writeFileSync(uit, pagina, "utf8");
console.log(`${uit}: ${data.length} vragen (${open} open, ${klaar} beantwoord), ${Math.round(Buffer.byteLength(pagina) / 1024)} KB`);
