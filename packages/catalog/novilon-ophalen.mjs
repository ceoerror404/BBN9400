// novilon-ophalen.mjs — Forbo Novilon (Basic, Viva, Traffic): dessinlijst + productpagina's + foto's.
//
// Leest de dessinlijst (xlsx met een tabblad per lijn: Dessin | Dessinnummers | Rolmaten | Productpagina |
// Afbeelding), haalt per dessin de Belgische productpagina van forbo.com op (één verzoek per 1,5 s) en
// bewaart:
//   ..\Data\Novilon\<Lijn Dessin>\<dessinnummer>\01_productfoto.jpg   (1024×1024, productimages/large)
//   ..\Data\Novilon\<Lijn Dessin>\<dessinnummer>\0n_sfeerfoto.jpg      (galerij van de lijnpagina's, als
//                                                                        de bestandsnaam het dessinnummer noemt)
//   ..\Data\Novilon\NOVILON_BRON.json   specificaties, labels en lijnteksten per dessin
// Herhaalbaar: bestaande foto's worden niet opnieuw gedownload.
//
//   node packages/catalog/novilon-ophalen.mjs "<pad naar Forbo_Novilon_dessins.xlsx>"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MAP = join(ROOT, "..", "Data", "Novilon");
const XLSX = process.argv[2];
if (!XLSX) {
  console.error('Gebruik: node packages/catalog/novilon-ophalen.mjs "<Forbo_Novilon_dessins.xlsx>"');
  process.exit(1);
}
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", "Accept-Language": "nl-BE,nl;q=0.9" };
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- xlsx (zip) lezen zonder dependency ---------- */
function unzip(buf) {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const n = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const uit = {};
  for (let i = 0; i < n; i++) {
    const methode = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28), elen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const lokaal = buf.readUInt32LE(p + 42);
    const naam = buf.toString("utf8", p + 46, p + 46 + nlen);
    const start = lokaal + 30 + buf.readUInt16LE(lokaal + 26) + buf.readUInt16LE(lokaal + 28);
    const data = buf.subarray(start, start + csize);
    uit[naam] = (methode === 8 ? inflateRawSync(data) : data).toString("utf8");
    p += 46 + nlen + elen + clen;
  }
  return uit;
}
const ont = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;|&#39;|&#x27;/g, "'");

function leesDessins(pad) {
  const z = unzip(readFileSync(pad));
  const tabs = [...z["xl/workbook.xml"].matchAll(/<sheet name="([^"]+)" sheetId="(\d+)"[^>]*r:id="([^"]+)"/g)];
  const wbRels = Object.fromEntries([...(z["xl/_rels/workbook.xml.rels"] ?? "").matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map((m) => [m[1], m[2]]));
  const rijen = [];
  for (const [, lijn, , rid] of tabs) {
    const doel = (wbRels[rid] ?? "").replace(/^\/?(xl\/)?/, "");
    const blad = `xl/${doel}`;
    const xml = z[blad];
    const relPad = blad.replace(/worksheets\//, "worksheets/_rels/") + ".rels";
    const rels = Object.fromEntries([...(z[relPad] ?? "").matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map((m) => [m[1], ont(m[2])]));
    const links = Object.fromEntries([...xml.matchAll(/<hyperlink ref="([^"]+)" r:id="([^"]+)"/g)].map((m) => [m[1], rels[m[2]]]));
    for (const r of xml.matchAll(/<row r="(\d+)"[^>]*>(.*?)<\/row>/gs)) {
      if (r[1] === "1") continue;
      const c = {};
      for (const m of r[2].matchAll(/<c r="([A-Z]+)\d+"[^>]*>(.*?)<\/c>/gs)) c[m[1]] = { t: [...m[2].matchAll(/<t[^>]*>(.*?)<\/t>/gs)].map((x) => ont(x[1])).join("").trim(), link: links[m[1] + r[1]] };
      if (!c.A?.t) continue;
      rijen.push({ lijn, dessin: c.A.t, nummers: c.B.t.split("/").map((s) => s.trim()), rolmaten: c.C.t.split("/").map((s) => s.trim()), pagina: c.D.link, afbeelding: c.E.link });
    }
  }
  return rijen;
}

/* ---------- productpagina ontleden ---------- */
const tekst = (html) => ont(html.replace(/<sup>2<\/sup>/g, "²").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&#x2082;/g, "₂").replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n")).trim();

function ontleed(html) {
  // Specificatietabel van het gekozen dessin (Dikte, Dikte slijtlaag, Lengte x breedte, LRV, …)
  const tabel = html.match(/<table[^>]*>([\s\S]*?)<\/table>/)?.[1] ?? "";
  const specs = [...tabel.matchAll(/<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/g)].map((m) => ({ label: tekst(m[1]), waarde: tekst(m[2]).split("\n").map((s) => s.trim()).filter(Boolean) }));
  const labels = [...html.matchAll(/<img alt="([^"]*)" title="[^"]*" src="[^"]*product_labels\/([^"]+)\.svg"/g)].map((m) => ({ naam: ont(m[1]), code: m[2] }));
  const grootBeeld = html.match(/https:\/\/forbo\.azureedge\.net\/productimages\/big\/([^"'\s]+)\.webp/)?.[1] ?? null;
  // Lijnintro: de alinea's tussen het kruimelpad en het dessinnummer
  const kop = html.slice(0, html.indexOf("<table"));
  const intro = [...kop.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => tekst(m[1])).filter((s) => s.length > 60);
  const galerij = [...new Set([...html.matchAll(/https:\/\/forbo\.azureedge\.net\/forboimages\/[^"'\s)]+?\/(?:1024x1024|1084x610)[^"'\s)]*?\.(?:webp|jpg)/gi)].map((m) => m[0]))];
  return { specs, labels, grootBeeld, intro, galerij };
}

async function haal(url) {
  for (let poging = 1; poging <= 4; poging++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok) return res;
    if (res.status === 429 || res.status >= 500) { await wacht(5000 * poging); continue; }
    throw new Error(`${url}: HTTP ${res.status}`);
  }
  throw new Error(`${url}: blijft weigeren`);
}

async function download(url, pad) {
  if (existsSync(pad)) return "bestond";
  const res = await haal(url);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error(`${url}: verdacht klein (${buf.length} B)`);
  mkdirSync(dirname(pad), { recursive: true });
  writeFileSync(pad, buf);
  return "nieuw";
}

const titelCase = (s) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

/* ---------- uitvoeren ---------- */
const dessins = leesDessins(XLSX);
console.log(`${dessins.length} dessins: ${[...new Set(dessins.map((d) => d.lijn))].map((l) => `${l} ${dessins.filter((d) => d.lijn === l).length}`).join(", ")}`);
mkdirSync(MAP, { recursive: true });

const uit = [];
const galerijPerLijn = {};
for (const [i, d] of dessins.entries()) {
  const res = await haal(d.pagina);
  const html = await res.text();
  const p = ontleed(html);
  const nr = d.nummers[0];
  const titel = `${titelCase(d.lijn)} ${titelCase(d.dessin)}`;
  // Welke dessinnummers staan op de pagina? (controle dat de pagina over dit dessin gaat)
  const opPagina = html.includes(`${nr}/`) || html.includes(`>${nr}<`);
  galerijPerLijn[d.lijn] ??= new Set();
  for (const g of p.galerij) galerijPerLijn[d.lijn].add(g);
  uit.push({ ...d, titel, nr, opPagina, specs: p.specs, labels: p.labels, intro: p.intro, productfoto: p.grootBeeld ? `https://forbo.azureedge.net/productimages/large/${p.grootBeeld}.jpg` : null });
  console.log(`${String(i + 1).padStart(2)}/${dessins.length} ${titel} (${nr}) · ${p.specs.length} specs · ${p.labels.length} labels${opPagina ? "" : " · ⚠ dessinnummer niet op pagina"}`);
  await wacht(1500);
}

// Foto's: productfoto per dessin + sfeer-/detailfoto's uit de galerij als het dessinnummer in de naam staat.
const alleGalerij = [...new Set(Object.values(galerijPerLijn).flatMap((s) => [...s]))];
for (const d of uit) {
  const map = join(MAP, d.titel, d.nr);
  d.fotos = [];
  if (d.productfoto) {
    const st = await download(d.productfoto, join(map, "01_productfoto.jpg"));
    d.fotos.push({ bestand: `${d.titel}/${d.nr}/01_productfoto.jpg`, soort: "productfoto", bron: d.productfoto, st });
  } else console.log(`⚠ ${d.titel}: geen productfoto op de pagina`);
  const eigen = alleGalerij.filter((u) => new RegExp(`_${d.nr}[_.-]`).test(u.split("/").pop()));
  // 1024x1024 en 1084x610 van hetzelfde beeld: één keer (de grootste naam wint niet altijd; neem alles behalve exacte dubbels per naam)
  const perNaam = new Map();
  for (const u of eigen) {
    const naam = u.split("/").pop().replace(/^\d+x\d+(px)?(nw)?_/, "").toLowerCase();
    if (!perNaam.has(naam) || /1024x1024/.test(u)) perNaam.set(naam, u);
  }
  let n = 2;
  for (const [naam, webp] of perNaam) {
    const soort = /detail/i.test(naam) ? "detailfoto" : "sfeerfoto";
    // Forbo's CDN levert hetzelfde beeld ook als jpg: jpg, zoals de andere merken in Data.
    const u = webp.replace(/\.webp$/i, ".jpg");
    const bestand = `${String(n++).padStart(2, "0")}_${soort}.jpg`;
    const st = await download(u, join(map, bestand));
    d.fotos.push({ bestand: `${d.titel}/${d.nr}/${bestand}`, soort, bron: u, st });
    await wacht(500);
  }
  console.log(`${d.titel}: ${d.fotos.length} foto('s) (${d.fotos.filter((f) => f.st === "nieuw").length} nieuw)`);
}

const pad = join(MAP, "NOVILON_BRON.json");
writeFileSync(pad, JSON.stringify({ opgehaald: new Date().toISOString(), bron: XLSX.split(/[\\/]/).pop(), galerij: alleGalerij, dessins: uit }, null, 2));
console.log(`\n→ ${pad}`);
