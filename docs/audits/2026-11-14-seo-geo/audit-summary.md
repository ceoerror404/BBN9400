# SEO/GEO-nulmeting Brunic — ronde 1

**Datum:** 14/11/2026 · **Uitvoering:** Claude (skill `seo-geo-audit`, draaiboek v1.0), op vraag van Alexander · **Modus:** audit, alleen lezen. Niets gewijzigd aan productie, Shopify of DNS.
**Omgevingen:** oude site `https://brunic.be` (WooCommerce, live) en nieuwe site `https://brunic.vercel.app` (pre-launch, momentopname 12/11/2026 22:40, 4.070 producten). Productie draaide op commit `ea59bbd` (12/11/2026 23:39), de laatste op `origin/master`.

## Oordeel

Dit is een **gedeeltelijke audit**: Search Console, analytics en een SEO-database ontbreken. Alle eigen klikken, vertoningen en volumes blijven dus **ONBEKEND**, en de cijfers uit de prospectiemail zijn niet bevestigd of weerlegd.

Wat wel vaststaat (GEMETEN):

1. **De migratie is technisch sterk.** Alle 2.060 unieke URL's uit de sitemap van brunic.be (2.063 vermeldingen, 3 dubbel) eindigen op de nieuwe site op een 200, zonder één 404. 765 producten gaan naar hun opvolger, 815 naar een passende categorie, 25 pagina's naar de juiste dienst of infopagina. De nieuwe site heeft canonicals op elk template, een sitemap van 4.146 URL's (4.080 met `lastmod`), server-side h1 en Product/Breadcrumb-markup.
2. **Drie van de vijf zoekwoorden uit de mail verwijzen naar aanbod dat de nieuwe webshop niet meer verkoopt.** De vermoedelijke ranking-URL's (HYPOTHESE: de URL zelf staat niet in de mail) voor **gordijnlint**, **lichtdoorlatend rolgordijn** en **witte rolgordijnen** zijn producten van de oude site. Gordijnlint kost daar € 1,40 per meter, rolgordijnen € 22,69–73,35. De nieuwe site stuurt ze naar een pagina waar dat product niet staat: passementen, of de dienst raamdecoratie op maat. Een nieuwe tekst wint die posities niet terug. Eerst moet Brunic beslissen of het aanbod terugkomt.
3. **De twee clusters met de grootste geclaimde vraag passen wel bij het aanbod**: tapis plein (1.300) en tapijt op maat (590). Daar ontbreken op de nieuwe pagina's de Vlaamse termen die de oude site gebruikte ("tapis plein" 0×, "afboorden" 0×). Dat is de kans met de beste verhouding tussen inspanning en mogelijk effect, op voorwaarde dat de Belgische SERP en GSC de vraag bevestigen.

**Grootste risico:** de livegang zonder nulmeting. Zonder GSC-export vooraf is achteraf niet te zeggen of de migratie verkeer kost (SEO-1-01). Na de hostwissel van `brunic.be` naar `www.brunic.be` moeten de redirects opnieuw getest worden (SEO-1-04).

## Top-acties

| # | Actie | Issue | Wie | Prio |
|---|---|---|---|---|
| 1 | GSC-toegang voor brunic.be + export van 16 maanden query × pagina, **vóór de livegang** | SEO-1-01 | Brunic + Jeroen | P1 |
| 2 | Bij de domeinkoppeling: apex → www met behoud van het pad, en daarna de migratietest opnieuw draaien tegen www.brunic.be | SEO-1-04 | Jeroen | P1 (livegang) |
| 3 | De vragen 18 tot 21 aan Brunic (`docs/vragen-aan-brunic.md`): beslissen over gordijnlint, kant-en-klare rolgordijnen, afboorden en AI-training | SEO-1-02/03/07/11 | Alexander → Brunic | P2 |
| 4 | De lokale wijzigingen van 13/11 (beloftes-teksten) committen en deployen; de metabeschrijving van vasttapijt-en-vloeren zegt op productie nog "onze eigen mensen" | SEO-1-08 | Alexander/Jeroen | P2 |
| 5 | Contentbrief 1 (vasttapijt / tapis plein) uitvoeren na een SERP-check | SEO-1-06 | inhoud | P2 |
| 6 | Bron van offerte- en opmetingsaanvragen meten (GA4 + consent, of server-side landingspagina) | SEO-1-10 | Brunic → code | P2 |
| 7 | Contentbriefs 2 en 3 na de antwoorden op vraag 19 en vraag 20 | SEO-1-03/07 | inhoud | P2 |

Volledige lijst met bewijs, acceptatiecheck en score: `issues.csv`. De prioriteit volgt draaiboek §6.4. Het is een planningshulpmiddel, geen voorspelling.

## Claims uit de prospectiemail

| Zoekwoord | Claim (pos / vol.) | Status | Wat we wél weten |
|---|---|---|---|
| gordijnlint | 7 / 170 | ONBEKEND | Oude productpagina `/product/gordijnlint-wit-25cm-gt7/` bestaat (200, Product-markup, € 1,40 per meter). Nieuwe catalogus: 0 linten |
| tapis plein | 12 / 1.300 | ONBEKEND | Oude categorie "Vasttapijt op maat versneden & afgeboord". Nieuw: 233 vasttapijten, term 0× gebruikt. "Tapis Plein" is ook de naam van een Vlaamse erfgoedorganisatie (HYPOTHESE: een deel van het volume is navigatie) |
| lichtdoorlatend rolgordijn | 15 / 390 | ONBEKEND | 6 oude producten met "lichtdoorlatend" in de titel; nieuw 0 producten |
| witte rolgordijnen | 20 / 170 | ONBEKEND | 3 oude witte rolgordijnen; nieuw 0 producten, "wit" 0× op de dienstpagina |
| tapijt op maat | 27 / 590 | ONBEKEND | Oud: `/tapijten-op-maat/` ("…op maat laten afboorden"). Nieuw: dienst + collectie, wederzijds gelinkt |

De rekensom in de mail (5–7 klikken bij 170 zoekopdrachten, een CTR van ±3–4 %) is plausibel als schatting. Ze zegt niets over Brunic zelf. Vraag de afzender, als dat nog nodig is, om een export met ranking-URL, land, apparaat, tool en datum (draaiboek §1).

## Technische stand nieuwe site (pre-launch)

| Onderdeel | Meting | Oordeel |
|---|---|---|
| Indexatie | `noindex, nofollow` + `Disallow: /` (bewust tot `SITE_INDEXEREN=1`) | stand, geen bevinding |
| Canonical | elk template naar `https://www.brunic.be/…`; gefilterd/gesorteerd: `noindex, follow` + canonical naar de kale lijst | in orde |
| Onbekende URL's | `/product/bestaat-niet`, `/catalogus/bestaat-niet`, `/catalogus/verf`, `/catalogus/slapen-en-wonen` → 404 | in orde (geen soft-200) |
| Titels / descriptions | 41 templates: titel 22–64 tekens, description 94–160. Uitzonderingen: vasttapijt-en-vloeren 219 tekens (en de verboden zin, SEO-1-08), gordijnen-op-maat 181 | grotendeels in orde |
| Structured data | Home: HomeGoodsStore + WebSite. PDP: Product + BreadcrumbList. Prijsproducten: Offer met UnitPriceSpecification (per m²). Op aanvraag: Product zonder `offers` (bekend, seo-groei.md) | in orde |
| Server-HTML | h1 en productlinks staan in de ruwe HTML (zonder JS) op alle lijsten en PDP's | in orde |
| Redirects oude site | 2.060/2.060 → 200, telkens 2 stappen (SEO-1-05) | in orde, kan korter |
| AI-crawlers | robots laat na de livegang alles toe; geen UA-blokkade op Vercel of nginx (8 UA's) | beleidsvraag vraag 21 |
| hreflang | geen (enkel nl-BE) | in orde |

Niet onderzocht: Core Web Vitals (labmetingen staan in TODO.md en in de QA-rapporten), visuele rendering, echte Google-indexatie, backlinks, Merchant Center, Business Profile.

## GEO

- **Technische toegang:** GEMETEN, zie hierboven. Dezelfde HTML voor browser, Googlebot, Bingbot, OAI-SearchBot, GPTBot, ChatGPT-User, ClaudeBot en PerplexityBot. Een UA-string bewijst niets over echte bot-IP's.
- **Promptpanel:** 20 prompts, waarvan 3 merkvragen, in `geo-panel.csv`, getoetst aan het assortiment. **Niet gemeten**: vanuit deze omgeving is geen AI-platform rechtmatig te bevragen, en antwoorden simuleren mag niet. `geo-baseline.csv` bestaat daarom niet.
- Volgende stap: het panel handmatig of via een API draaien (3 herhalingen, één platform om te beginnen), met de definities uit draaiboek §8.5. Na de livegang heeft dat het meeste zin: de oude site is de bron die AI-systemen nu kennen.

## Vragen aan Brunic

De zes vragen uit deze audit staan in de centrale lijst [`docs/vragen-aan-brunic.md`](../../vragen-aan-brunic.md), geschreven voor Brunic. In de eerste versie van dit rapport heetten ze V1 tot V6.

| Vraag | Onderwerp | Hoort bij | Wanneer nodig |
|---:|---|---|---|
| 18 | Gordijnlint en haakjes | SEO-1-02 | Vóór de livegang |
| 19 | Rolgordijnen en raamdecoratie (kant-en-klaar, soorten, merken) | SEO-1-03 | Vóór de livegang |
| 20 | Tapijt afboorden | SEO-1-07 | Vóór de livegang |
| 21 | AI-zoekassistenten: trainen of enkel verwijzen | SEO-1-11 | Kan daarna |
| 22 | Toegang tot Google Search Console | SEO-1-01 | Vóór de livegang |
| 23 | Meten waar aanvragen vandaan komen | SEO-1-10 | Kan daarna |

## Uitgevoerd na de audit (14/11/2026, zelfde dag)

Op vraag van Alexander is alles doorgevoerd wat niet op een antwoord van Brunic wacht. **Lokaal, niet gecommit en niet gedeployd**; aan Shopify is niets gewijzigd. Details, bestanden en verificatie: `docs/agent-work/seo-geo-r1.md`.

| Issue | Gedaan | Blijft open |
|---|---|---|
| SEO-1-05 | Elke oude URL gaat in één 308 naar haar bestemming (was twee). 2.060/2.060 → 200 op een lokale productiebuild | Natesten op een Vercel-preview |
| SEO-1-06 | Titel "Vasttapijt (tapis plein) met gratis opmeting" en vijf koopvragen onder de lijst | Belgische SERP en GSC bekijken; de intro in Shopify is niet aangeraakt |
| SEO-1-03 | Dienstpagina raamdecoratie: zes blokken met een anker, een vergelijking lichtdoorlatend/verduisterend, kleur; eigen titel en description; 19 oude URL's landen op het juiste blok | Types en merken bevestigen (vraag 19) |
| SEO-1-07 | Dienst en collectie "tapijt op maat" hebben elk een eigen titel en rol; koopvragen op de collectie | "Afboorden" (vraag 20) |
| Voorstel uit seo-groei.md | Koopvragen per afdeling op de vier landingspagina's (hergebruik van de bestaande FAQ waar mogelijk) | — |
| SEO-1-04 | Testscript `apps/prototype/scripts/test-oude-urls.mjs` met de lijst van 2.060 oude URL's | Draaien op de dag van de domeinkoppeling |
| SEO-1-10 | **Niet uitgevoerd**: botst met de cookieverklaring | Beslissing Brunic (vraag 23) |
| SEO-1-01, -02, -11 | — | Brunic (vragen 22, 18 en 21) |
| SEO-1-08 | Lokale build: "eigen mensen" 0× | Committen en deployen |

## Bestanden in deze map

| Bestand | Inhoud |
|---|---|
| `audit-summary.md` | dit rapport |
| `source-register.csv` | bronnen, status en beperkingen |
| `url-inventory.csv` | 2.063 sitemapvermeldingen van de oude site (2.060 unieke URL's) met bestemming op de nieuwe site + 41 templates (UTC-tijdstempels) |
| `keyword-opportunities.csv` | de vijf clusters uit de mail, met bewijslabel en actie |
| `issues.csv` | SEO-1-01 t.e.m. SEO-1-11 |
| `content-briefs.md` | 3 briefs: vasttapijt, raamdecoratie, tapijt op maat |
| `geo-panel.csv` | 20 prompts, niet gemeten |
| `measurement-plan.md` | nulmeting vóór, op en na de livegang |

Scripts en ruwe data (herbruikbaar voor ronde 2): `%TEMP%\brunic-seo\r1\scripts\` en `raw\`. De migratietest staat sinds 14/11 ook in de repo: `node apps/prototype/scripts/test-oude-urls.mjs https://brunic.be --stappen 2` na de domeinkoppeling.

## Beperkingen

- Geen GSC, GA4, SEO-database, logs of AI-platformen: zie `source-register.csv`.
- WebSearch geeft hier Amerikaanse resultaten. Het is gebruikt als verkenning, niet als bewijs.
- De metadata van de oude site komen uit een steekproef: alle pagina's en categorieën, 142 producten en 25 kernpagina's. De h1-extractie op de oude site is onbetrouwbaar (een JS-string in de HTML).
- De migratie is getest op brunic.vercel.app, niet op het echte domein.
- Productie draait op commit `ea59bbd` (12/11 23:39) en de momentopname van 12/11. De tekstcorrecties van 13/11 in de code (`content.ts` e.a.) staan lokaal maar zijn nog niet gecommit, dus nog niet live. *(Gecorrigeerd op 14/11: een eerdere versie van dit rapport schreef dit enkel aan de Shopify-momentopname toe.)*

## Volgende meting

Ronde 2, zodra de GSC-export (M2) binnen is: startprompt "vervolgmeting" uit draaiboek §12, met deze ronde als basis. De migratietest draait opnieuw op de dag van de domeinkoppeling.
