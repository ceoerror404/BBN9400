# Brunic — webshop-site (`apps/prototype`)

De Brunic-webshop: een Next.js-front op de **echte Shopify-catalogus** (Storefront API), met offerte-, opmeting-, contact- en nieuwsbriefformulieren die als klantfiche in Brunics eigen Shopify landen, en een winkelmand die doorstuurt naar de Shopify-kassa. De visuele opbouw volgt [fr.vente-unique.be](https://fr.vente-unique.be/) (gemeten 26/09/2026); identiteit, assortiment, teksten en beelden zijn van Brunic en zijn leveranciers.

> De map heet nog `apps/prototype` (historisch); het pakket is productieklaar sinds 30/09/2026. Hernoemen kan samen met het aanmaken van het Vercel-project.

```bash
pnpm install                              # in de repo-root
pnpm --filter @brunic/prototype sync      # catalogus ophalen uit Shopify (alleen lezen) → .data/shopify-catalogus.json
pnpm --filter @brunic/prototype dev       # → http://localhost:3100
pnpm --filter @brunic/prototype typecheck
pnpm --filter @brunic/prototype build     # haalt eerst zelf de catalogus op (prebuild), dan next build
```

## 1. Hoe de onderdelen op de webshop aansluiten

| Onderdeel | Bron / koppeling |
|---|---|
| Producten, varianten, foto's, merken | Shopify (Storefront API) via `scripts/sync-shopify.mjs` → `.data/shopify-catalogus.json` → `src/lib/catalog/shopify-adapter.ts`. Enkel producten die actief én gepubliceerd zijn op **Brunic Headless**. |
| Catalogus actueel | De momentopname komt bij elke build. Een nieuwe build start **vanzelf**: bij een product- of collectiewijziging (Shopify-webhook → `VERCEL_DEPLOY_HOOK_URL`, max. 1 per kwartier) en dagelijks als vangnet (Vercel Cron → `/api/catalogus/vernieuwen`, enkel bij een echt verschil). Zie `src/lib/catalog/herbouw.ts`. **Beschikbaarheid** in de winkelmand en op de productpagina komt live uit Shopify (`/api/producten?live=1`). |
| Hoofdcategorieën | `src/data/categories.ts` (naam, URL, volgorde, banner) ↔ Shopify-collectie via `src/data/shopify-bron.ts`. **Een hoofdcategorie zonder producten verschijnt nergens** (menu, tegels, sitemap) en haar URL geeft 404; vult u de collectie in Shopify, dan verschijnt ze bij de volgende build vanzelf (Raamdecoratie, Verf, Slapen & wonen staan zo klaar). |
| Subcategorieën | Shopify-collecties met het voorvoegsel van de hoofdcategorie (`behang-effen` → Behang › Effen). Lege collecties worden verborgen. Teksten: `src/data/categorie-teksten.ts` (of de collectiebeschrijving in Shopify, die wint). |
| Prijs / "prijs op aanvraag" | `brunic.etalage = true` of prijs € 0 → "Prijs op aanvraag" + knop **Offerte aanvragen** (gaat met product en kleur naar het aanvraagformulier). |
| Winkelmand → kassa | Lokale winkelmand → `POST /api/kassa` controleert LIVE per variant (geen etalage, prijs > 0, beschikbaar) → Storefront `cartCreate` → Shopify-kassa. Een etalage-/€ 0-product is nooit afrekenbaar. Na een afgeronde betaling verdwijnen de betaalde regels uit de lokale winkelmand (`components/commerce/kassa-opvolging.tsx`). |
| Formulieren | `src/lib/leads/*`: opmeting, offerte (product of hele verlanglijst), dienstaanvraag, contact → **klantfiche in Shopify** (notitie + tags `website`, `lead-<soort>`, toestemmingsbewijs in metafields, foto's in Shopify Files) → tag `opmeting-nieuw` laat **Shopify Flow** de winkel mailen. Nieuwsbrief → klant met e-mailtoestemming (single opt-in). Een bestaande klant (zelfde e-mailadres) krijgt enkel een notitie, tags en het aanvraag-metafield bij: naam en telefoon worden nooit overschreven. Max. 5 aanvragen/inschrijvingen per kwartier per IP (`lib/leads/limiet.ts`). |
| Homepage, diensten, artikels | Tegels en campagnes verwijzen naar categorie-ID's, productslugs of artikels (`src/data/home.ts`); bestaat het doel niet, dan valt de tegel weg. Diensten en artikels tonen producten uit hun gekoppelde categorie. |
| Merken | `/merken` en `/merken/<merk>`: afgeleid uit Shopify `vendor`. |
| Beelden | `src/data/beelden.ts`: **sfeerfoto's van de leveranciers** (ADO, Boråstapeter, ESTAhome, Associated Weavers, Balsan, Louis De Poortere …) van producten die Brunic verkoopt, via het Shopify-CDN met `srcset`. Subcategorie- en merktegels kiezen automatisch een sfeerfoto uit hun eigen assortiment. Productbeelden: de rolfoto van Boråstapeter (alt `– rolfoto –`) staat nooit vooraan — in Shopify gezet door `packages/catalog/borastapeter-rolfoto-achteraan.mjs` (opnieuw draaien na een herimport), de adapter houdt ze achteraan. |

## 2. Routes

| Route | Inhoud |
|---|---|
| `/` | Hero · afdelingen · selecties · nieuw binnen · trends · winkelband · inspiratie · merken · nieuwsbrief |
| `/catalogus`, `/catalogus/<hoofd>[/<sub>]` | Categorieën (landingspagina met alle producten + filters; subcategorie = lijst) |
| `/product/<slug>` | Productdetail (plat pad, `?variant=`) |
| `/merken`, `/merken/<merk>` | Merkoverzicht en productlijst per merk |
| `/nieuw-binnen`, `/aanbiedingen` | Samengestelde lijsten (Aanbiedingen staat enkel in het menu als er actieprijzen zijn) |
| `/op-maat-en-plaatsing[/<dienst>]` | 8 diensten met aanvraagformulier; `opmeting-aan-huis` = primaire conversie (`?product=`, `?verlanglijst=1`) |
| `/inspiratie-en-advies[/<artikel>]` | 10 artikels (`?thema=`) |
| `/winkel-en-contact` | FAQ, contact, winkelinfo, contactformulier |
| `/verlanglijst`, `/winkelmand` | Lokaal bewaard; verlanglijst → offerte of afdrukken als winkellijst; winkelmand → Shopify-kassa |
| `/info/<slug>` | Over ons, levering, retour, FAQ, betalen, cookies, AV, privacy, herroepingsrecht |
| `/sitemap.xml`, `/robots.txt` | Enkel indexeerbaar met `SITE_INDEXEREN=1` |
| Oude URL's van brunic.be (WooCommerce) | 308 naar de nieuwe pagina: producten via `src/proxy.ts` + `src/data/oude-urls.json` (opnieuw maken: `scripts/genereer-oude-urls.mjs`), `/product-categorie/…` via `app/product-categorie/`, gewone pagina's in `next.config.ts`. Eén stap per oude URL, ook met de schuine streep achteraan (`skipTrailingSlashRedirect` + `src/proxy.ts`). Testen: `node apps/prototype/scripts/test-oude-urls.mjs <basis-URL>` (2.060 oude URL's, lijst van 14/11/2026 in `scripts/oude-urls/`); laatst getest op een lokale build op 14/11/2026: alles 200, één stap. |
| `/api/status` | Gezondheidscontrole voor een uptime-monitor (200 = catalogus + Shopify ok, anders 503) |

## 3. Omgevingsvariabelen (zie repo-root `.env.example`)

| Variabele | Nodig voor |
|---|---|
| `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_API_TOKEN`, `SHOPIFY_API_VERSION` | catalogus-sync (build) en kassa |
| `SHOPIFY_ADMIN_API_TOKEN` **of** `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` | formulieren (scopes `read_customers`, `write_customers`, `write_files`) |
| `SITE_URL` | canonical, sitemap, Open Graph (`https://www.brunic.be`) |
| `SITE_INDEXEREN=1` | **enkel op productie** — anders noindex + robots disallow |
| `LEADS_DRYRUN=1` | lokaal/preview: formulieren loggen i.p.v. klanten aanmaken — **niet op productie** |
| `VERCEL_DEPLOY_HOOK_URL` | nieuwe build bij product-/collectiewijzigingen en via de dagelijkse controle |
| `CRON_SECRET` | beveiligt `/api/catalogus/vernieuwen` (Vercel Cron stuurt het zelf mee) |
| `SHOPIFY_WEBHOOK_SECRET` | optioneel: HMAC-controle van de Shopify-webhooks (anders het client secret van de app) |
| `ALERT_WEBHOOK_URL` | optioneel: Slack/Teams/Discord/Make-webhook voor meldingen (mislukte aanvraag, kassa, serverfout) |
| `NEXT_PUBLIC_SHOPIFY_WINKELMAND=1` | winkelmand in Shopify in plaats van lokaal in de browser (bij het bouwen ingebakken) → [docs/analytics-en-cookies.md](../../docs/analytics-en-cookies.md) |
| `SHOPIFY_ANALYTICS=1` + `SHOPIFY_SHOP_ID` | Shopify Analytics en de cookiemelding. `1` verstuurt enkel op de productieomgeving van Vercel; `test` ook lokaal (nooit op Vercel zetten). Zonder: geen scripts, geen melding, geen metingen |

## 4. Livegang — checklist

1. Vercel-project met root `apps/prototype` (team fruitcocktailbe-projects), variabelen uit §3, `SITE_INDEXEREN=1` enkel op Production, `LEADS_DRYRUN` niet op Production.
2. **Shopify Flow** controleren: *Customer updated* → tag `opmeting-nieuw` → interne mail → tag verwijderen. Eén testaanvraag doen.
3. Deploy Hook aanmaken → `VERCEL_DEPLOY_HOOK_URL`; `CRON_SECRET` zetten; daarna `node packages/catalog/register-webhooks.mjs https://www.brunic.be --producten` (eerst `--dry-run`). Testen: een producttitel wijzigen in Shopify → binnen enkele minuten een nieuwe deploy.
4. Uptime-monitor op `https://www.brunic.be/api/status` en eventueel `ALERT_WEBHOOK_URL`.
5. Domein: `brunic.be` → 301 naar `www.brunic.be` (Vercel › Domains) **met behoud van het pad**, HTTPS actief; de oude URL's controleren op het echte domein: `node apps/prototype/scripts/test-oude-urls.mjs https://brunic.be --stappen 2` en `… https://www.brunic.be` (verwacht: 0 × niet-200). Vooraf een Search Console-export van brunic.be bewaren (docs/audits/2026-11-14-seo-geo/measurement-plan.md).
6. Juridische teksten (`src/data/content.ts`, comment boven `INFO_PAGES`) laten valideren door Brunic. Met de metingen of de Shopify-winkelmand aan tonen de cookiepagina en de privacyverklaring een andere tekst (`COOKIES_MET_SHOPIFY`): die ook laten nalezen.
   Metingen en cookiemelding aanzetten: de stappen en de instellingen in de Shopify-admin staan in [docs/analytics-en-cookies.md](../../docs/analytics-en-cookies.md) §Aanzetten.
7. Gebruiksrecht op de leveranciersfoto's bevestigen (dealerafspraken).
8. Niets live vóór getekende offerte + voorschot (CLAUDE.md).

## 5. Nog open (niet door de site op te lossen)

- **Prijzen**: alle 2.386 producten staan nu op etalage/€ 0 → overal "Prijs op aanvraag". Zodra de ERP-prijzen in Shopify staan, werken winkelmand en kassa zonder codewijziging.
- **Meterware** (stof per 0,1 m): de kassa kent enkel gehele aantallen; verkoopmodel (variant per 10 cm of lengte als regel-eigenschap) ligt bij Brunic.
- **Eigen foto's** (atelier, winkel, klanten): na de fotoshoot in `src/data/beelden.ts` zetten.
- **Analytics + cookiebanner**: Shopify Analytics met een eigen cookiemelding is gebouwd (16/11/2026) maar staat uit; aanzetten gebeurt in Vercel, zie `docs/todo.md` §5 "Vercel bij de livegang (voor Jeroen)". Tot dan plaatst de site geen trackingcookies. Google (GA4 of Ads onder Bruno's account, Consent Mode v2) volgt bij de start van de advertenties.
- Dode code: verwijderd op 20/10/2026 (demobestanden, accountpagina, ongebruikte iconen/route). Controle: TypeScript-analyse (geen onbereikbare bestanden of ongebruikte exports), `pnpm lint`. De iconen `truck` en `shield` lijken ongebruikt maar horen bij de icoonkeuzes "Levering" en "Schild" van de metaobjects — laten staan.
