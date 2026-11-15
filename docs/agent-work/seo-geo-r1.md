# Taak: SEO/GEO-nulmeting ronde 1 en de wijzigingen die eruit volgden

**Eigenaar:** Alexander (met Claude) · 14/11/2026 · bouwt verder op de niet-gecommitte wijzigingen van 13/11 (beloftes-teksten) en op `seo-groei.md`. Niets teruggedraaid.

**Status:** code klaar en lokaal geverifieerd, **niet gecommit en niet gedeployd**. Aan Shopify is niets gewijzigd. Rapport van de nulmeting: `docs/audits/2026-11-14-seo-geo/audit-summary.md` (issues SEO-1-01 t.e.m. -11).

## Wat er veranderd is

| Issue | Wijziging | Bestanden (apps/prototype) |
|---|---|---|
| SEO-1-05 | Een oude URL van brunic.be (altijd met `/` achteraan) ging in twee stappen naar haar bestemming: eerst haalde Next de streep weg. Nu één 308. `skipTrailingSlashRedirect` staat aan; de proxy stuurt elke andere URL met een streep zoals voorheen in één 308 naar de URL zonder streep | `next.config.ts`, `src/proxy.ts` |
| SEO-1-03 | Dienstpagina Raamdecoratie op maat: zes blokken met een anker (`#rolgordijnen`, `#lichtdoorlatend-of-verduisterend`, `#kleur`, `#plisses`, `#jaloezieen`, `#vouwgordijnen`), een vergelijkingstabel, eigen `<title>` en description. De oude typepagina's en de kant-en-klare rolgordijnen landen op het passende blok | `src/data/content.ts` (type `ServiceSection`, `seoTitle`, `seoDescription`, `sections`), `src/app/(winkel)/op-maat-en-plaatsing/[slug]/page.tsx`, `next.config.ts`, `src/lib/site/oude-urls.ts` |
| SEO-1-06 | Vasttapijt: `<title>` "Vasttapijt (tapis plein) met gratis opmeting" en vijf koopvragen onder de lijst. De h1 en de intro (Shopify-metaobject) zijn ongewijzigd | `src/data/categorie-seo.ts` (nieuw), `src/components/catalog/category-faq.tsx` (nieuw), `src/app/(winkel)/catalogus/[...pad]/page.tsx` |
| SEO-1-07 | Tapijt op maat: de dienst heet in de titel "Tapijt op maat laten maken", de collectie "Tapijten op maat: kies uw kwaliteit", met drie koopvragen die naar de dienst linken | `src/data/content.ts`, `src/data/categorie-seo.ts` |
| Voorstel uit seo-groei.md | Koopvragen op de vier afdelingslandingen (Gordijnen & stoffen, Behang, Vloerbekleding, Tapijten). Een subcategorie toont enkel vragen als ze eigen vragen heeft | `src/data/categorie-seo.ts`, `src/components/catalog/category-landing.tsx` |
| Diensten | Meta description van elke dienst hoogstens 155 tekens (`metaDescription`), was op productie tot 219 | `[slug]/page.tsx`, `content.ts` |
| SEO-1-04 | Herbruikbare migratietest met de lijst van 2.060 oude URL's (sitemap van 14/11/2026) | `scripts/test-oude-urls.mjs`, `scripts/oude-urls/brunic-be-sitemap-2026-11-14.txt` |
| Docs | README §2 en §4, TODO §5, AGENTS.md (skills), skill `seo-geo-audit` | — |
| Ordening (14/11, later op de dag) | Index van alle audits: `docs/audits/README.md`. Alle vragen aan Brunic in één lijst met een statusoverzicht: `docs/vragen-aan-brunic.md` (25 vragen; bestaande nummers 1–12 behouden, A–E werden 13–17, V1–V6 werden 18–23, twee open punten uit `teksten-en-beloftes.md` werden 24 en 25). De twee auditskills tellen hun ronde nu per soort map en schrijven nieuwe vragen in de centrale lijst. Kopie van het oude vragenbestand: `%TEMP%\brunic-seo\r1\backup\` | — |

## Keuzes die ik maakte

- **Niets in Shopify.** De intro van een categorie komt uit het metaobject `categorie_inhoud` en gaat binnen vijf minuten live, zonder review. Daarom staan de zoektitel en de koopvragen in de code. Wie "tapis plein" ook in de intro wil: Shopify › Inhoud › Categorie | Tekst en foto.
- **Enkel bevestigde feiten.** De koopvragen hergebruiken de bestaande FAQ (`uitFaq`, faalt bij de build als een vraag verdwijnt) of zinnen die al op de site stonden. Geen levertermijn op categoriepagina's. Op de raamdecoratiepagina staan enkel rolgordijnen, plissés, jaloezieën en vouwgordijnen; duo-rolgordijnen, shutters en Velux pas na bevestiging (vraag 19).
- **Geen FAQPage-markup.** Google toont die rich results niet voor webshops; de tekst staat wel in de server-HTML (`<details>`).
- **SEO-1-10 niet uitgevoerd.** Landingspagina en herkomst bij een aanvraag bewaren is statistiek. De cookieverklaring zegt "Geen statistieken" en belooft eerst toestemming te vragen. Dat is een beslissing van Brunic (vraag 23). De pagina van het formulier wordt al bewaard.

## Verificatie (14/11/2026, lokale productiebuild, momentopname 02/11 20:35)

- `tsc --noEmit` ✅ · `eslint .` ✅ (0 errors, dezelfde 7 bestaande warnings) · `next build` ✅ (zonder prebuild-sync) · `test:filters` 537/537.
- `node scripts/test-oude-urls.mjs http://localhost:3111`: 2.060 oude URL's, **2.060 × 200, 2.059 in één stap** (home heeft er geen), 0 tijdelijke redirects. Bestemmingen vergeleken met de meting op productie van dezelfde dag: 2.041 identiek, 19 met een anker erbij, 0 anders.
- Steekproef van 43 URL's met en zonder streep (oude pagina's, `/product-tag/…`, `/mijn-account/…`, nieuwe pagina's, querystrings, `/api/status/`, onbekende URL's): telkens één 308; onbekende URL's eindigen op 404.
- Pagina's in ruwe HTML (gemeten op de build vóór de laatste stijlcorrectie aan de tabel, die geen tekst raakt): titels ≤ 60 tekens, descriptions ≤ 155, canonicals en BreadcrumbList ongewijzigd, één h1. Vasttapijt: "tapis plein" in de titel en 2× in de tekst. Raamdecoratie: rolgordijn 11×, lichtdoorlatend 5×, verduisterend 5×, zes ankers, één tabel. `?weergave=producten` en subcategorieën zonder eigen vragen tonen geen vragenblok.
- `node packages/catalog/set-beloftes-inhoud.mjs --controle` (leest alleen): 0 treffers in code en metaobjects.
- Visueel in headless Chrome, 1366 × 900, 390 × 844 en 320 × 700: de blokken, de tabel en de koopvragen (dicht en open); geen horizontale overflow, geen consolefouten; ankers landen onder de header.

## Niet getest

- **Vercel.** `skipTrailingSlashRedirect` en de bredere matcher van de proxy (`/(.*)/`) zijn enkel op `next start` getest. Eerst een preview-deploy, dan `node apps/prototype/scripts/test-oude-urls.mjs <preview-URL>`.
- Echte toestellen, Safari en Firefox. Het vragenblok staat onder de productlijst: het scrollgedrag van de lijst (scrollgedrag-2026-11-03.md) is niet opnieuw doorgemeten.
- De Belgische zoekresultaten voor "tapis plein" (de zoektool hier geeft Amerikaanse resultaten) en Search Console.

## Open punten

- Wacht op Brunic: vraag 18 gordijnlint, vraag 19 raamdecoratie (types, merken, kant-en-klaar), vraag 20 afboorden, vraag 21 AI-crawlers, vraag 22 Search Console, vraag 23 herkomst meten. Ze staan sinds 14/11 in de centrale lijst `docs/vragen-aan-brunic.md` (in de eerste versie van het rapport heetten ze V1 tot V6) en zijn nog niet doorgestuurd.
- Vóór de domeinkoppeling: Search Console-export van brunic.be (measurement-plan M1–M3).
- Niet gelogd in J.A.R.V.I.S: `D:\GithubLocal\J.A.R.V.I.S` bestaat niet op deze pc. Te loggen: "raamdecoratie blijft één dienstpagina met ankers" en "geen herkomstmeting zonder beslissing van Brunic".
- De kopieën van de bestanden van vóór deze wijzigingen staan in `%TEMP%\brunic-seo\r1\backup\`; schermafbeeldingen in `…\shots\`.

## Volgende actie

Alexander/Jeroen: diff nakijken (samen met de wijzigingen van 13/11), committen, preview-deploy, daar de migratietest draaien, dan naar `master`. Alexander: de vragen 18 tot 23 naar Brunic (`docs/vragen-aan-brunic.md`, deel 1).
