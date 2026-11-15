# Meetplan SEO/GEO — Brunic (r1, 14/11/2026)

Dit plan is een voorstel. Niets ervan is ingepland of geautomatiseerd.

## 1. Vóór de livegang (verplicht, anders is er geen nulmeting)

| # | Wat | Wie | Waarom |
|---|---|---|---|
| M1 | Toegang tot **Search Console** voor `brunic.be` (domeinproperty, op naam van Brunic nv; wij als gebruiker) | Brunic + Jeroen | Zonder GSC zijn de huidige klikken, vertoningen en ranking-URL's `ONBEKEND`. De claims uit de mail kunnen we dan niet toetsen. |
| M2 | Export van 16 maanden prestaties per **query × pagina** (land BEL, per apparaat), plus het indexatierapport | wij, na M1 | Vergelijkingsbasis voor na de migratie. Na de hostwissel zijn de URL-data van de oude property niet meer met de nieuwe te koppelen zonder deze export. |
| M3 | Een lijst van de oude URL's met klikken > 0 in de laatste 12 maanden | wij, uit M2 | Dan controleren we de redirects van precies die URL's met de hand (zie `issues.csv` SEO-1-01/02). |
| M4 | Domeinproperty `brunic.be` dekt ook `www.brunic.be`. Controleer dat beide varianten erin zitten | wij | De canonical wisselt van apex naar www. |
| M5 | Beslissing over **GA4 + Consent Mode v2** of een cookieloze teller (TODO.md, vraag 23) | Brunic | Zonder analytics zijn conversies uit organisch verkeer niet meetbaar. De cookieverklaring belooft nu "geen statistieken": landingspagina of herkomst bijhouden kan dus pas na een beslissing en een aangepaste tekst. Wat er al is: elke aanvraag bewaart de pagina van het formulier ("Pagina:" in de klantnotitie), dus per formulierpagina tellen kan nu al. |
| M6 | Momentopname van de oude site bewaren: `raw/oude-site.json` + `raw/kernpaginas-oud.json` (r1) | gedaan | Titels, canonicals en prijzen van vóór de migratie. |

## 2. Op de dag van de livegang

- `SITE_INDEXEREN=1` en `SITE_URL=https://www.brunic.be` op Vercel (productie). Daarna: `robots.txt` = `Allow`, `<meta robots>` = `index, follow`.
- `brunic.be` → `https://www.brunic.be` met een 301/308 **met behoud van het pad**, voor `http` en `https`. Test: `/product/gordijnlint-wit-25cm-gt7/`, `/product-categorie/vloerbekleding/vasttapijt/`, `/rolgordijnen/` en `/?s=behang` moeten in hoogstens twee stappen eindigen op een 200.
- Draai `node apps/prototype/scripts/test-oude-urls.mjs https://brunic.be --stappen 2` en daarna op `https://www.brunic.be` (zonder `--stappen`). Verwacht: 2.060 oude URL's, 0 × niet-200, dezelfde bestemmingen als in `url-inventory.csv` (19 met een anker erbij sinds 14/11).
- Dien `https://www.brunic.be/sitemap.xml` in bij Search Console. Laat de oude sitemap-URL's (`/sitemap_index.xml`, `/product-sitemap*.xml`) niet op een 404 eindigen zonder reden: een 410 of een redirect naar de nieuwe sitemap.
- URL-inspectie op 10 vaste URL's: home, 4 afdelingen, 3 producten, 2 dienstpagina's.

## 3. Ritme na de livegang

| Ritme | Meten | Bron |
|---|---|---|
| Dag 1, 3, 7 | 404's en soft-404's in GSC (Pagina's → Niet gevonden), crawlstatistieken, redirectfouten | GSC |
| Wekelijks (8 weken) | Klikken en vertoningen niet-merk vs. merk, per afdeling. Vergelijk met dezelfde weken uit M2 | GSC-export |
| Vierwekelijks | De vijf clusters uit `keyword-opportunities.csv`: vertoningen, CTR, positie per URL. Aanvragen (offerte, opmeting) per landingspagina | GSC + leads |
| Vierwekelijks | GEO-panel `geo-panel.csv`: zelfde 20 prompts, 3 herhalingen, per platform dat we echt kunnen bevragen | handmatig of via API, binnen budget |
| Per kwartaal | Assortiment vs. zoekvraag (bijvoorbeeld de vraag naar gordijnlint of kant-en-klare rolgordijnen), contentbriefs, prijzen in Merchant Center | GSC + Shopify |

## 4. Definities

- CTR = som(klikken) / som(vertoningen), nooit het gemiddelde van rij-CTR's.
- Merkqueries: bevatten `brunic`, inclusief schrijfvarianten (`brunik`, `brunic ninove`). Leg de regex vast in de eerste export.
- GEO: `mention_rate`, `citation_rate`, `recommendation_rate`, `error_rate` volgens draaiboek §8.5. Toon altijd aantallen naast percentages. Een time-out telt niet als nul.
- Een migratie geeft doorgaans enkele weken schommelingen. Trek geen conclusies over één week.
