// boras-prijzen-browser.js — sjabloon voor set-boras-prijzen.mjs --browserscript.
// Plakken in de console (F12) van https://www.borastapeter.com/en/ terwijl de site prijzen in € toont.
// Leest enkel publieke productgegevens, rustig (± 1 verzoek per seconde, pauze bij 429),
// en downloadt boras-prijzen-<land>-<datum>.json. Verandert niets op borastapeter.com.
// Opnieuw plakken in hetzelfde tabblad gaat verder waar de vorige run stopte.
(async () => {
  const ARTIKELNUMMERS = /*ARTIKELNUMMERS*/[];
  const PAUZE = 1100;
  const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
  const STALEN = /sample|bobbin/i; // stalenpakketten van Boråstapeter dragen soms hetzelfde nummer in hun naam
  const norm = (s) => String(s ?? "").trim().toUpperCase();

  // Verder waar een vorige run in dit tabblad stopte (zonder verdachte koppelingen met stalenpakketten)
  const vorige = Object.fromEntries(Object.entries(window.borasStatus?.prijzen ?? {}).filter(([, b]) => !STALEN.test(b.url)));
  // Typ op elk moment `borasStatus` in de console voor de stand van zaken.
  const status = (window.borasStatus = { fase: "start", totaal: ARTIKELNUMMERS.length, opgehaald: 0, niet_gevonden: 0, laatste: null, bezig_sinds: new Date().toLocaleTimeString() });
  const land = window.Shopify?.country;
  const munt = window.Shopify?.currency?.active;
  console.log(`Borastapeter-prijzen · land ${land} · munt ${munt} · ${ARTIKELNUMMERS.length} artikelnummers · al opgehaald: ${Object.keys(vorige).length}`);
  if (munt !== "EUR") {
    alert(`De site toont prijzen in ${munt}, niet in euro. Kies onderaan België (EUR) en draai het script opnieuw.`);
    return;
  }

  async function haal(url) {
    for (let poging = 1, fout5xx = 0; poging <= 10; poging++) {
      let r;
      try {
        r = await fetch(url, { credentials: "same-origin", headers: { accept: "application/json" } });
      } catch (e) {
        r = { status: 0, ok: false };
      }
      if (r.status === 429) {
        const s = Number(r.headers.get("retry-after")) || 60;
        console.log(`  even wachten (${s} s, de site vraagt om trager te gaan)…`);
        status.pauze_tot = new Date(Date.now() + s * 1000 + 2000).toLocaleTimeString();
        await wacht(s * 1000 + 2000);
        delete status.pauze_tot;
        continue;
      }
      if ((r.status >= 500 || r.status === 0) && ++fout5xx <= 3) { await wacht(5000); continue; }
      if (!r.ok) { console.warn(`  overgeslagen: HTTP ${r.status} op ${url}`); return null; }
      return r.json();
    }
    console.warn(`  overgeslagen: blijft 429 op ${url}`);
    return null;
  }

  // 1. Overzicht: artikelnummer → handle. Eerst op de SKU van de variant, anders op het nummer
  //    achteraan de handle (elm-tree-7786) — nooit een stalenpakket. Bewaard voor een volgende run.
  let { perSku, perEinde } = window.borasHandles ?? {};
  if (!perSku) {
    perSku = new Map();
    perEinde = new Map();
    for (let pagina = 1; ; pagina++) {
      status.fase = `overzicht, pagina ${pagina}`;
      const d = await haal(`/products.json?limit=250&page=${pagina}`);
      if (!d?.products?.length) break;
      for (const p of d.products) {
        const stalen = STALEN.test(`${p.handle} ${p.title}`);
        for (const v of p.variants) {
          const sku = norm(v.sku);
          if (sku && (!perSku.has(sku) || (STALEN.test(perSku.get(sku)) && !stalen))) perSku.set(sku, p.handle);
        }
        const eind = norm(p.handle.match(/-(\d+[a-z]?)$/i)?.[1]);
        if (eind && !stalen && !perEinde.has(eind)) perEinde.set(eind, p.handle);
      }
      console.log(`  overzicht pagina ${pagina}: ${perSku.size} artikelnummers gekend`);
      await wacht(PAUZE);
    }
    window.borasHandles = { perSku, perEinde };
  }

  // 2. Prijs per product in de munt van de bezoeker (de .js-versie volgt het gekozen land)
  const prijzen = { ...vorige };
  const nietGevonden = [];
  status.fase = "prijzen ophalen";
  status.prijzen = prijzen;
  status.niet_gevonden_lijst = nietGevonden;
  try {
    for (const sku of ARTIKELNUMMERS) {
      if (prijzen[sku]) continue;
      const n = Object.keys(prijzen).length;
      Object.assign(status, { opgehaald: n, niet_gevonden: nietGevonden.length, nog_te_doen: ARTIKELNUMMERS.length - n - nietGevonden.length });
      status.klaar_rond = new Date(Date.now() + status.nog_te_doen * (PAUZE + 300)).toLocaleTimeString();
      const h = perSku.get(norm(sku)) ?? perEinde.get(norm(sku));
      if (!h) { nietGevonden.push(sku); continue; }
      const p = await haal(`/products/${h}.js`);
      await wacht(PAUZE);
      if (!p) { nietGevonden.push(sku); continue; }
      const v = p.variants.find((x) => norm(x.sku) === norm(sku))
        ?? (p.variants.length === 1 && !p.variants[0].sku && !STALEN.test(`${h} ${p.title}`) ? p.variants[0] : null);
      if (!v) { nietGevonden.push(sku); continue; }
      prijzen[sku] = {
        prijs: v.price / 100,
        van_prijs: v.compare_at_price ? v.compare_at_price / 100 : null,
        beschikbaar: v.available,
        titel: p.title,
        url: `https://www.borastapeter.com/en/products/${h}`,
      };
      status.laatste = `${sku} ${p.title}: € ${prijzen[sku].prijs}`;
      const m = Object.keys(prijzen).length;
      if (m % 25 === 0) console.log(`  ${m} prijzen opgehaald…`);
    }
  } finally {
    // Ook bij een onverwachte fout: bewaren wat er is. Opnieuw plakken gaat verder.
    const n = Object.keys(prijzen).length;
    const klaar = n + nietGevonden.length >= ARTIKELNUMMERS.length;
    Object.assign(status, { fase: klaar ? "klaar" : "onderbroken — plak het script opnieuw om verder te gaan", opgehaald: n, niet_gevonden: nietGevonden.length, nog_te_doen: ARTIKELNUMMERS.length - n - nietGevonden.length });
    const uit = { opgehaald: new Date().toISOString(), land, munt, aantal: n, volledig: klaar, niet_gevonden: nietGevonden, prijzen };
    // Werd de download geblokkeerd? Typ dan in de console: copy(JSON.stringify(borasResultaat)) en plak in een .json-bestand.
    window.borasResultaat = uit;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(uit, null, 1)], { type: "application/json" }));
    a.download = `boras-prijzen-${land}-${uit.opgehaald.slice(0, 10)}${klaar ? "" : "-deels"}.json`;
    document.body.appendChild(a);
    a.click();
    console.log(`${klaar ? "Klaar" : "Onderbroken"}: ${n} prijzen, ${nietGevonden.length} niet gevonden. Bestand gedownload: ${a.download}`);
  }
})();
