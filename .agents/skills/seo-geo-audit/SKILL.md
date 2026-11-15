---
name: seo-geo-audit
description: SEO- en GEO-audit (standaard alleen lezen) van de Brunic-webshop. Behandelt indexatie, canonicals, de migratie van brunic.be (WooCommerce) naar de nieuwe Next.js/Shopify-site, zoekwoordkansen, assortimentsfit, structured data, AI-crawlertoegang en een GEO-promptpanel. Ook bruikbaar om SEO-claims van derden (prospectiemails, tools) te toetsen. Levert een nulmeting of vervolgmeting met bewijslabels in docs/audits/<datum>-seo-geo/. Wijzigt niets aan productie.
disable-model-invocation: true
---

# SEO- en GEO-audit — Brunic

De volledige werkinstructie staat in **`draaiboek.md`** in deze map (versie 1.0, 14/11/2026). Lees dat eerst helemaal. Dit bestand vult de Brunic-specifieke context in die het draaiboek bewust openlaat (`canonical_origin: null`, `platform: unverified`), en legt vast waar je leest en schrijft.

## 0. Geverifieerde context (stand 14/11/2026, bij elke run opnieuw controleren)

| Gegeven | Waarde | Bron |
|---|---|---|
| Huidige live site | `https://brunic.be/` (WooCommerce/WordPress, Yoast-sitemaps). `www` en `http` → 301 naar `https://brunic.be/` | eigen crawl r1 |
| Nieuwe site | `https://brunic.vercel.app` (Next.js `apps/prototype` + Shopify headless). Elke push naar `master` is productie | AGENTS.md |
| Geplande canonical | `https://www.brunic.be` (`SITE_URL`, terugval in `src/lib/site/config.ts`). **Hostwissel** van apex naar www bij de livegang | code |
| Indexatie nieuwe site | Bewust `noindex` + `Disallow: /` tot de livegang (`SITE_INDEXEREN=1`). Dat is geen bevinding. Vermeld de stand | `src/app/robots.ts`, `layout.tsx` |
| Markt en taal | België, enkel nl-BE, u-vorm | AGENTS.md |
| Fysieke winkel | Ninove (NAP in `src/lib/site/config.ts`, door Brunic te valideren) | code |
| Analytics | Nog geen GA4 op de nieuwe site; de cookieverklaring zegt "geen tracking" | TODO.md |
| Search Console | Geen export in de repo. Account hoort op naam van Brunic nv (eigendomsprincipe) | AGENTS.md |
| Livegang | Niets live vóór een getekende offerte en een voorschot | AGENTS.md |

Dus: oude rankings meet je op **brunic.be**, de nieuwe site beoordeel je **pre-launch** op brunic.vercel.app. Test ook altijd wat de nieuwe site doet met de URL's van de oude site (migratie, draaiboek §5.5). Dat weegt het zwaarst zolang de livegang nog moet komen.

## 1. Waar de logica zit

- Metadata en structured data: `apps/prototype/src/lib/site/seo.ts`
- robots en sitemap: `src/app/robots.ts`, `src/app/sitemap.ts`
- Oude URL's → nieuwe: `src/lib/site/oude-urls.ts` (categoriekoppeling), `src/data/oude-urls.json` (producten), `src/app/oude-site/product/[slug]`, `src/app/product-categorie/[...pad]/route.ts`, `next.config.ts › redirects()` (gewone pagina's)
- Zoektitels en koopvragen per categorie (in de code, niet in Shopify): `src/data/categorie-seo.ts`, getoond door `src/components/catalog/category-faq.tsx`. Ondertitel en intro van een categorie komen uit het Shopify-metaobject `categorie_inhoud` en gaan binnen vijf minuten live: daar schrijf je nooit zonder opdracht
- Diensten en wat Brunic levert: `src/lib/site/maatwerk.ts`, `src/data/content.ts` (`seoTitle`, `seoDescription` en `sections` met ankers per dienst)
- Migratietest: `node apps/prototype/scripts/test-oude-urls.mjs <basis-URL>` (2.060 oude URL's van 14/11/2026 in `scripts/oude-urls/`)
- Vorige SEO-werk en open voorstellen: `docs/agent-work/seo-groei.md`, het recentste `docs/audits/*-seo-geo/`
- Regels van de opdrachtgever (beloftes, levertermijn, garantie, leveranciersteksten): §0 van `.agents/skills/webshop-qa-audit/SKILL.md`. Die gelden ook voor elke contentbrief en elk structured-data-voorstel. Bijvoorbeeld: nooit `deliveryTime` of een leverancierslevertermijn in markup.

## 2. Databronnen

- Lokale catalogus: `apps/prototype/.data/shopify-catalogus.json`, alleen lezen. Productie kan nieuwer zijn: vergelijk eerst met `/api/status`.
- Ruwe klantdata in `..\Data\` mag je lokaal lezen. Stuur ze nooit naar een externe dienst (AGENTS.md).
- Search Console, GA4 en SEO-tools gebruik je enkel als export of toegang aangeleverd is. Zonder die bronnen blijven klikken, vertoningen en volumes `ONBEKEND` (draaiboek §3, regel 7).
- WebSearch in deze omgeving geeft Amerikaanse resultaten. Gebruik het niet als Belgische SERP-waarneming, hoogstens als verkennend signaal (label `HYPOTHESE`).
- AI-platformen: meet enkel wat je echt kunt bevragen. Simuleer geen antwoorden (draaiboek §8.4).

## 3. Grenzen

- Standaard `mode: audit`: geen code, Shopify-data, DNS, Vercel-instellingen of robots aanpassen. Commit en push niets.
- Wijzigingen pas na een expliciete vervolgopdracht (startprompt "codewijziging" in het draaiboek §12), en dan klein, met verificatie en herstelstap.
- Verstuur geen mails of formulieren. Draai niets in `packages/catalog` en geen `sync`/`build`.
- Crawl beleefd: hoogstens 3 verzoeken tegelijk op brunic.vercel.app en 2 op brunic.be, met pauzes. Stop bij 429/5xx.

## 4. Waar je schrijft

- Scripts en ruwe uitvoer: `$env:TEMP\brunic-seo\r<ronde>\` (`scripts\` en `raw\`). Begin van de scripts van de vorige ronde als ze er nog staan.
- Rapport: `docs/audits/<JJJJ-MM-DD>-seo-geo/`, met de bestanden uit draaiboek §10: `audit-summary.md`, `source-register.csv`, `url-inventory.csv`, `keyword-opportunities.csv`, `issues.csv`, `content-briefs.md`, `geo-baseline.csv` (enkel als er echt gemeten is, anders `geo-panel.csv` met status), `measurement-plan.md`. Een ouder rapport overschrijf je nooit.
- Issue-ID's: `SEO-<ronde>-<nr>`. Een bekend punt houdt zijn oude ID. De ronde telt enkel de mappen `docs/audits/*-seo-geo*`.
- Twee gedeelde bestanden vul je aan, zonder ze te herschrijven: één rij in de index `docs/audits/README.md`, en je nieuwe vragen voor Brunic in `docs/vragen-aan-brunic.md`. Dat is de enige centrale vragenlijst: het volgende vrije nummer, een rij in het overzicht bovenaan en de vraag in deel 1, geschreven voor Brunic (wat we zien, de vraag in het vet, "Antwoord:"). In je rapport verwijs je naar dat nummer en herhaal je de vraag niet.

## 5. Afronden

Je laatste bericht is de overdracht. Geef het pad naar het rapport, de drie belangrijkste acties, wat gemeten en wat onbekend bleef, en welke toegang de volgende ronde nodig heeft.
