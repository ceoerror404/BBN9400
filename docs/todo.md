# To-do — webshop

> Open taken voor het team (code, Shopify-instellingen, Vercel, livegang). Wat op Brunic wacht, staat in [`vragen-aan-brunic.md`](vragen-aan-brunic.md); wat bewust wacht, in [`problemen-voor-later.md`](problemen-voor-later.md). Tot 19/11/2026 stond deze lijst in `apps/prototype/TODO.md`. Paden zonder voorvoegsel (`src/…`, `scripts/…`, `components/…`, `lib/…`) zijn relatief tegenover `apps/prototype/`; "README" is `apps/prototype/README.md`.

Bron: audit van 30/09/2026 (alleen `apps/prototype`, niet `apps/web`). Geauditeerde codeversie: stand van 23:12. De merkwijzigingen van 23:21 (merkenpagina, `brand-tile.tsx`, `data/merken.ts`, `brands.ts`, homepage) zijn niet opnieuw getest.

**Legende:** `Bxx` = bevinding-ID · P0 ernstig risico · P1 blokkeert flow of verkoop · P2 duidelijke tekortkoming · P3 verfijning · inspanning K/M/G = klein/middel/groot · zekerheid tussen haakjes.

**Stand:** begeleide klantdemo mogelijk onder voorwaarden (zie hieronder). Echte verkoop: niet gereed. Geen P0 gevonden: er staan geen secrets in de browsercode, en `/api/kassa` weigert €0- en etalageproducten.

---

## 1. Vóór een demo

- [ ] **B05 · P1 · K** — Demo draaien vanaf een bevroren build/preview, niet vanaf de dev-server waarin gewerkt wordt. Tijdens de audit gaf elke pagina ±30 min HTTP 500 (`routes.account` ontbrak) door gelijktijdige bewerking. Vooraf `pnpm --filter @brunic/prototype typecheck` + korte rooktest. (bevestigd)
- [ ] **Demo-formulieren op dry-run** — `LEADS_DRYRUN=1` zetten. Die staat niet in de root-`.env`; zonder die variabele maakt elk demoformulier een echte klantfiche in de dev-store en start het (vermoedelijk) de Flow-mail. (bevestigd in code)
- [ ] **B14 (deel) · P2 · K** — "Rose Magnifique (kopie)" en het dubbele product (Artelux Brooklyn ↔ Loft79 6826, 31 gedeelde SKU's) offline halen in Shopify. (bevestigd)
- [ ] **B23 · P3 · K** — Claim "Al 40 jaar in Ninove" / "Familiebedrijf, al 40 jaar" laten bevestigen door Brunic. JSON-LD zegt `foundingDate: 1992` (`lib/site/config.ts`). (niet verifieerbaar)
- [ ] Liefst ook **B09** (stille kleurwissel), zie hieronder.

---

## 2. P1 — vóór echte verkoop

- [ ] **B01 · P1 · M — €0-/etalageproducten ook in Shopify zelf afschermen.** Alle 16.620 varianten staan op €0, `availableForSale = true`, voorraad niet gevolgd. De enige blokkade is `src/app/api/kassa/route.ts` (die werkt: 409). → Ook in Shopify blokkeren, bv. voorraad volgen op 0 met "niet verkopen zonder voorraad" voor etalageproducten, of een checkout-validatie. (bevestigd)
- [x] **B02 — opgelost 20/10** (PDP rendert server-side, `?variant=` na het laden; getest met `next build` + headless Chrome). Oorspronkelijke bevinding: **B02 · P1 · K–M — Productpagina's missen hun inhoud in de server-HTML.** In een productiebuild staan galerij, h1, prijs, offerteknop en beschrijving niet in de HTML (`BAILOUT_TO_CLIENT_SIDE_RENDERING`). Oorzaak: `useSearchParams()` in `components/product/product-view.tsx` binnen `<Suspense>` op een statische route. Gevolg: Lighthouse CLS 0,638 (desktop) / 0,846 (mobiel), LCP 5,6 s mobiel. Hetzelfde op `/nieuw-binnen` (0 productlinks in de HTML). De dev-server toont dit niet. → Variant server-side lezen (searchParams van de pagina) of een fallback met identieke layout; controleren met `next build` + `curl`. (bevestigd)
- [x] **B03 — grotendeels opgelost 20/10**: bestaande klant enkel op e-mail, nooit naam/telefoon overschrijven, marketingbewijs niet wissen, rate limit 5/kwartier/IP, `_t` verplicht. Open: double opt-in voor de nieuwsbrief (beslissing Brunic) en een harde limiet over alle Vercel-instanties (Vercel Firewall). Oorspronkelijke bevinding: **B03 · P1 · M — Formulieren kunnen klantfiches overschrijven.** `src/lib/leads/klant.ts`: een aanvraag met het e-mailadres of telefoonnummer van een bestaande klant voert `customerUpdate` uit, met naam, telefoon, notitie en toestemmingsvelden uit het formulier. `schrijfInVoorNieuwsbrief` en het marketingvinkje zetten elk adres op `SUBSCRIBED` zonder bevestiging. Spamfilter en rate limiting moeten sterker. → Bestaande klant nooit overschrijven (enkel notitie/tag toevoegen), double opt-in, rate limiting/captcha. (bevestigd in code, niet uitgevoerd)
- [ ] **B04 · P1 · K — App met te brede rechten.** De server gebruikt de Dev Dashboard-app met veel meer schrijfrechten dan nodig. Voor de formulieren volstaan `read_customers`, `write_customers` en `write_files`. → Aparte app met minimale scopes; de stappen staan in "Sleutels en toegang (voor Jeroen)", punt 3. (bevestigd, opnieuw nagekeken 19/11/2026)
- [ ] **B06 · P1 · G — Commerciële data ontbreekt** (klant/pipeline, geen programmeerfout): 0/2.386 producten hebben een prijs, er is geen voorraad, en Raamdecoratie, Verf en Slapen & wonen hebben 0 producten (404 + niet in het menu). (bevestigd)

---

## 3. P2

### Code

- [x] **B07 — opgelost 20/10** (max. 100 foto's per product + waarschuwing bij afkapping). Oorspronkelijke bevinding: **B07 · K — Sync kapt afbeeldingen af.** `scripts/sync-shopify.mjs` haalt `images(first: 24)` op zonder door te bladeren. 257 producten verliezen samen 5.335 beelden (bv. `vloerkleed-coral-louis-de-poortere`: 30 → 24). De adapter voegt de hoofdfoto's van varianten terug toe, maar extra detail- en sfeerbeelden gaan verloren. → Doorbladeren via `pageInfo` en afkapping loggen. (bevestigd)
- [ ] **B08 · K — Verzonnen verkoopeenheid.** `src/lib/catalog/shopify-adapter.ts` valt terug op `?? "stuk"`. 374 producten zonder `brunic.verkoop_eenheid` tonen "Verkoopeenheid: Per stuk": fotobehang op maat (145), tapijttegels (84), panoramisch behang (72), passement (32), wandbekleding (24), tapijtloper (16), click vinyl (1). Ook de filter "Verkocht per" op Behang toont "Per stuk (245)". → Geen standaardwaarde tonen; eenheid aanvullen in de data. (bevestigd)
- [x] **B09 — opgelost 20/10** (optielade toont "Enkel met een andere …", na de keuze een melding welke optie mee wisselde). Oorspronkelijke bevinding: **B09 · K — Niet-bestaande combinaties.** In de optielade (`product-view.tsx`, `choose()`) wordt elke waarde als "Op maat" getoond. Een combinatie die niet bestaat wisselt stil de andere optie. Voorbeeld: `vasttapijt-celestial-associated-weavers` → Kleur Navajo 32 + Breedte 500 cm → kleur wordt Onyx 25. Het gaat om 14 producten en 87 combinaties. → Waarde uitgrijzen of een melding tonen. (bevestigd, desktop + 390 px)
- [ ] **B18 · M — Kassa en eenheden.**
  - Meterware en m² kunnen enkel in hele eenheden (`QTY` step 1).
  - De eenheid gaat niet mee naar de Shopify-checkout (geen regeleigenschappen).
  - ~~`/api/kassa` laat ongeldige regels stil vallen~~ → opgelost 20/10: 400 met duidelijke melding.
  - ~~Een product-ID in plaats van een variant-ID geeft HTTP 502~~ → opgelost 20/10: 400.
  → Verkoopmodel voor meterware beslissen; eenheid als line attribute meesturen; ongeldige regels melden. (bevestigd in code/API)
- [ ] **B19 — deels opgelost 20/10**: beschikbaarheid live in winkelmand en PDP; catalogus herbouwt vanzelf bij wijzigingen (webhook + deploy hook, dagelijkse controle). Prijzen in de winkelmand komen nog uit de momentopname (prijsweergave buiten scope van de audit). Oorspronkelijke bevinding: **B19 · M — Verouderde prijzen mogelijk.** De winkelmand toont prijzen uit de momentopname (sync bij build) en er is geen revalidatie bij productwijzigingen. De kassa controleert wel live, dus zodra er prijzen zijn kan de prijs in de mand verschillen van die in de checkout. → Revalidatie via webhook of live prijs in de winkelmand. (vermoedelijk)
- [ ] **B20 · K — Toegankelijkheid** (axe 4.11, WCAG 2.2 AA):
  - links "+N kleuren" op productkaarten zijn 20–23×17 px (2.5.8);
  - groene tekst "Op maat" in de variantlade haalt 4,16:1 (1.4.3);
  - h3-kaarten zonder h2 op lijstpagina's;
  - niet-unieke landmarks;
  - header-transities negeren `prefers-reduced-motion`.
  (bevestigd, automatisch)
- [x] **B24 — opgelost 22/11** (de afdelingen staan bovenaan de footerkolom "Winkelen", gevoed door de categorieboom: `components/layout/shop-chrome.tsx` → `site-footer.tsx`, vlag `metAfdelingen` in `lib/site/navigation.ts`; lokaal nagekeken in de HTML van vier pagina's en op desktop en mobiel, nog niet gecommit of gedeployd). Oorspronkelijke bevinding: **B24 · K — Afdelingen staan niet als link in het menu.** Het megamenu wordt pas opgebouwd na een klik op "Catalogus" (`components/layout/site-header.tsx`: `{megaOpen && <MegaMenu … />}`), en de footer linkt enkel naar `/catalogus`. Buiten de homepage ("Snel naar een afdeling") en het kruimelpad staat er dus op geen enkele pagina een gewone link naar Gordijnen & stoffen, Behang, Vloerbekleding of Tapijten. Nagemeten op 22/11/2026 in de HTML van productie (`/info/levering`, `/merken`, een productpagina): 0 links naar een afdeling in `<header>`. Google leidt de sitelinks onder het zoekresultaat "brunic" onder meer af uit de vaste navigatie. → De afdelingen als gewone links op elke pagina zetten: in de footerkolom "Winkelen", of het megamenu altijd in de HTML houden en verbergen tot de klik. (bevestigd)

### Data (pipeline / Shopify)

- [ ] **B14 · M — Productdata opschonen:**
  - Engelse optiewaarde bij Desso "Rug" ("EcoBase - 100% recyclable …");
  - vasttapijt (Desso, Tarkett) staat onder "Tapijten › Tapijten op maat";
  - kleurfamilie maar bij 47/2.386 producten, waardoor er geen kleurfilter is bij behang en stoffen.
  (bevestigd)

### Juridisch (verkoop)

- [ ] **B16 · K–M — Ontbrekende informatie:**
  - RPR + rechtbank van de zetel (WVV art. 2:20);
  - concrete leveringskosten en aanvaarde betaalmiddelen uiterlijk bij het begin van het bestelproces (WER VI.45, VI.46 §3);
  - online herroepingsfunctie (WER VI.61/2);
  - toegankelijkheidsverklaring (EAA, WER VIII.60).
  (ontbreken vastgesteld; draagwijdte: juridisch advies)
- [ ] **B17 · K — Retourtekst laten toetsen.** Het accordeon "Retourneren" op elke PDP (`components/product/product-info.tsx`) stelt dat "op maat gesneden stoffen, behang of vasttapijt" wettelijk niet onder het herroepingsrecht vallen. Behang per rol is geen maatwerk. → Laten toetsen aan WER VI.53 3°. (juridisch advies nodig)

Bronnen, geraadpleegd via een onderzoeksagent: WER op Justel (geconsolideerd tot 04/08/2026), de e-commerce-richtlijnen van de FOD Economie (28/09/2026) en de cookie-checklist van de GBA. Dit is geen volledige conformiteitsbeoordeling.

---

## Sleutels en toegang (voor Jeroen)

Toegevoegd op 19/11/2026, na een controle van alle sleutels vanaf de pc van Alexander. Uitkomst: er is niets gelekt.

- `.env` staat niet in git. De ingevulde waarden staan nergens in de gevolgde bestanden of in de geschiedenis (40 commits, `master` en `Alexander`).
- Ze staan ook niet in de HTML of de browserbestanden van brunic.vercel.app.
- `/api/catalogus/vernieuwen` en `/api/webhooks/shopify` geven 401 zonder geldige sleutel of handtekening.

Wat hieronder staat, kon vanaf die pc niet nagekeken of niet uitgevoerd worden. De volgorde is de prioriteit.

- [ ] **1. GitHub-repo privé zetten, nu en niet pas bij de livegang.** De stappen en de test met Vercel staan in de lanceringschecklist (§5, "GitHub-repo privé zetten").
  - De repo staat op het gebruikersaccount `ceoerror404`, niet op de org HackersQuattroOrg. Enkel de eigenaar van dat account kan de zichtbaarheid wijzigen. Hoort de repo naar de org te verhuizen?
  - Daarna `AGENTS.md` ("Repo is privé, GitHub-org = HackersQuattroOrg") laten kloppen met de werkelijkheid.
- [ ] **2. Vercel nakijken** (project `brunic`, team fruitcocktailbe-projects).
  - Settings › Environment Variables: welke variabelen staan er, en in welke omgevingen? De namen die de code leest, staan in `.env.example`. Wat niet meer gebruikt wordt (bv. sleutels van `apps/web`): weghalen.
  - Opgelet met `SHOPIFY_ADMIN_API_TOKEN` (nagekeken in de code op 20/11/2026): staat die op Vercel, dan gebruikt de site hem vóór `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` (`src/lib/shopify/admin.ts`). Hij is dus niet ongebruikt. Weghalen mag, maar enkel als de client ID en het client secret er staan; daarna opnieuw deployen en één aanvraagformulier testen. Zonder die twee komen aanvragen niet meer aan.
  - Niet in `.env.example` maar wel gelezen door de site: `NEXT_PUBLIC_SITE_URL` (reserve voor `SITE_URL`). Wel in `.env.example` maar door geen enkele code gelezen, dus niet nodig op Vercel: `SHOPIFY_API_KEY` en `ANTHROPIC_API_KEY` (de chatbot is nog niet gebouwd). `VERCEL_ENV` en `NODE_ENV` zet Vercel zelf.
  - De geheimen als type **Secret** bewaren (vroeger "Sensitive"): `SHOPIFY_CLIENT_SECRET`, en later ook `CRON_SECRET`, `VERCEL_DEPLOY_HOOK_URL`, `ALERT_WEBHOOK_URL` en de privé-token van de Storefront API. Een Secret kan na het opslaan door niemand meer uitgelezen worden, enkel vervangen. Een bestaande variabele zo nodig verwijderen en opnieuw aanmaken.
  - Settings › Security › **Git Fork Protection** staat aan (de standaard). Zolang de repo publiek is, kan iedereen een pull request vanuit een fork indienen. Met deze instelling bouwt Vercel die pas na goedkeuring door een teamlid. Keur zo'n aanvraag nooit goed zonder de code te lezen: de build krijgt de sleutels mee.
  - Team Settings › Members: wie heeft toegang, en heeft iedereen tweestapsverificatie aan? Dezelfde vraag voor GitHub en voor het Shopify-account.
  - Het overbodige project `brunic-prototype` (zie `AGENTS.md`): staan daar nog sleutels in? Weghalen, of het project verwijderen.
- [ ] **3. B04: een aparte Shopify-app voor de site.** **On hold (beslissing Alexander, 20/11/2026): de Shopify-sleutels worden niet gewijzigd, niet lokaal en niet op Vercel. Niets hieronder uitvoeren zonder zijn akkoord.** De site gebruikt vandaag dezelfde Dev Dashboard-app ("brunic") als de lokale scripts. Die app heeft bijna alle rechten van de winkel, terwijl de site enkel klantfiches en foto's van de formulieren schrijft.
  - Dev Dashboard: een nieuwe app (bv. "brunic-site") met `read_customers`, `write_customers` en `write_files`. Voor de webhooks komen daar `read_products`, `read_metaobjects` en `read_metaobject_definitions` bij (niet getest met een smalle app). Installeren op `brunic-3`.
  - Vercel: `SHOPIFY_CLIENT_ID` en `SHOPIFY_CLIENT_SECRET` vervangen door die van de nieuwe app, opnieuw deployen en één aanvraagformulier met foto testen. Die test maakt een echte klantfiche en start mogelijk de Flow-mail: gebruik een herkenbare testnaam en verwijder de fiche daarna.
  - De webhooks aanmelden met de nieuwe app, niet met de brede. Shopify tekent een webhook met het geheim van de app die hem aanmaakte, en de site kent dan enkel nog het geheim van de smalle app. `register-webhooks.mjs` leest de root-`.env` maar laat bestaande omgevingsvariabelen staan: zet `SHOPIFY_CLIENT_ID` en `SHOPIFY_CLIENT_SECRET` van de smalle app in de shell en draai het script daarna.
  - De brede app blijft enkel lokaal, in de root-`.env` van wie de catalogusscripts of het thema beheert. Vernieuw daarna haar geheim (Dev Dashboard › de app › Settings › client secret › Rotate), zodat de kopie die op Vercel stond waardeloos is. Bezorg het nieuwe geheim aan Alexander via een wachtwoordbeheerder, niet via chat of mail.
- [ ] **4. J.A.R.V.I.S nakijken.** `clients/brunic/.env.client` (de logins van de klant) staat enkel op de pc van Jeroen.
  - Staat het bestand in `.gitignore`?
  - Komt het niet voor in de geschiedenis? `git log --all --oneline -- clients/brunic/.env.client` hoort niets te geven.
  - Is die repo privé?

---

## 5. Lanceringschecklist (bewust uitgeschakeld in de testfase)

> **Stand 20/11/2026, 18:04 — de site staat live.** `brunic.be` en `www.brunic.be` wijzen naar Vercel (Combell: A `216.150.1.1`, CNAME `58fe819a756f925e.vercel-dns-017.com`, geen AAAA, geen CAA, de drie nameservers gelijk). "Production is de testsite" hieronder klopt dus niet meer. Twee dingen zijn dringend, allebei in Vercel:
> 1. **Https: opgelost op 20/11/2026 om 18:12** (nagemeten 18:16). Beide namen hebben een geldig certificaat; `http://brunic.be` → `https://brunic.be` → `https://www.brunic.be` (308). Om 18:04 faalde https nog op beide namen.
> 2. **Indexering: opgelost, nagemeten op 21/11/2026 om 12:38.** robots.txt staat open (`Allow: /`, met de sitemap), de sitemap geeft 4.181 adressen die allemaal op `https://www.brunic.be` staan, en de homepage en twee productpagina's tonen `index, follow`. Op 20/11 om 18:16 stond er nog `noindex, nofollow` en `Disallow: /`. `SITE_INDEXEREN=1` op Production zetten en opnieuw deployen (eerste punt hieronder). `SITE_URL` hoeft niet: de canonical wijst al naar `https://www.brunic.be`.
>
> Pas doen zodra https werkt: de Hostname in het Shopify-thema (onder "Na de domeinverhuizing"), de webhooks aanmelden en `test-oude-urls.mjs` op het echte domein.

- [x] `SITE_INDEXEREN=1` zetten — gedaan door JP, nagemeten op 21/11/2026 (zie de stand hierboven). `SITE_URL` was niet nodig: de code valt terug op `https://www.brunic.be`.
- [ ] **GitHub-repo privé zetten** (vastgesteld 19/11/2026: `github.com/ceoerror404/Brunic` staat publiek, terwijl `AGENTS.md` "Repo is privé" zegt). GitHub › de repo › Settings › General › onderaan "Danger Zone" › **Change repository visibility** › Private.
  - Eerst nakijken op welk plan het Vercel-team staat: op het gratis plan (Hobby) bouwt Vercel bij een privérepo mogelijk enkel de commits van de accounteigenaar. Niet nagekeken.
  - Daarna testen: een kleine push van Alexander én van Jeroen geeft elk een nieuwe deploy op Vercel.
  - Daarna de opmerking "repo is publiek" in `.gitignore` aanpassen.
- [ ] **Shopify-webhooks aanmelden** (nagekeken 19/11/2026: er is er geen enkele aangemeld). Zonder webhooks ververst de catalogus niet vanzelf bij een wijziging in Shopify, enkel bij een nieuwe push; teksten en foto's uit de metaobjects verschijnen wel, na hoogstens 5 minuten.
  - Vooraf in Vercel (Production): `VERCEL_DEPLOY_HOOK_URL` (Settings › Git › Deploy Hooks, branch master) en `CRON_SECRET` (voor de dagelijkse controle als vangnet). Zie `.env.example`.
  - Aanmelden op het definitieve adres, dus na de domeinverhuizing: `node packages/catalog/register-webhooks.mjs https://www.brunic.be --producten`, eerst met `--dry-run` (README §4 punt 3). Eerder aanmelden kan op `https://brunic.vercel.app`, maar dan na de verhuizing opnieuw.
  - Aanmelden met de sleutels van de smalle site-app zodra die bestaat, niet met de brede app uit de root-`.env`: zie "Sleutels en toegang (voor Jeroen)", punt 3.
  - Testen: een producttitel wijzigen in Shopify → binnen enkele minuten start er een nieuwe deploy.
- [x] 301-map van WooCommerce naar de nieuwe URL's — 20/10: alle 2.061 URL's uit de oude sitemaps → 308 naar een bestaande pagina (README §2). 14/11: één stap in plaats van twee, getest op een lokale build (2.060 URL's, alles 200).
- [ ] Na de domeinoverdracht opnieuw testen: `node apps/prototype/scripts/test-oude-urls.mjs https://brunic.be --stappen 2` en op `https://www.brunic.be` (README §4 punt 5).
- [ ] Vóór de domeinoverdracht: Search Console-export van brunic.be (16 maanden, query × pagina) bewaren als nulmeting — docs/audits/2026-11-14-seo-geo/measurement-plan.md.
- [ ] Metingen en cookiemelding aanzetten: zie "Vercel bij de livegang (voor Jeroen)" hieronder. Tot dan zegt de cookieverklaring terecht "geen tracking". Google (GA4 of Ads, Consent Mode v2) volgt later, bij de start van de advertenties (`docs/analytics-en-cookies.md` §10).
- [ ] Shopify: verzendtarieven, betalingen (Bancontact), btw en checkout-branding instellen. Niet gecontroleerd: de app mist de leesrechten daarvoor.
- [ ] Kassa in de stijl van Brunic (voorbereid op 19/11/2026, nog in te stellen). Dit kan enkel met de hand in de Shopify-admin: de API voor de kassastijl werkt alleen op Plus- en ontwikkelwinkels, en de winkel staat op Basic. Op Basic zijn logo, kleuren en lettertypes aanpasbaar; de opbouw van de pagina ligt vast.
  - Settings › Checkout › Configurations › **Edit** bij "Brunic-configuratie 2" (de gepubliceerde) › tandwiel (Settings).
  - Logo: `brunic-kassa-logo.png` uit de bibliotheek (staat al in Content › Files: mascotte + woordmerk zoals de header van de site, transparant, 1360 × 480). Breedte 180 px, links.
  - Kleuren, uit `src/app/globals.css`: knoppen `#130c0c` (inkt), accent `#130c0c`, achtergrond hoofdgedeelte `#ffffff`, achtergrond besteloverzicht `#f4f1f0` (mist).
  - Lettertypes: koppen **Fraunces**, gewone tekst **Poppins** (zoals de site). Staat Fraunces niet in de lijst: ook Poppins voor de koppen.
  - Komt het vectorlogo van de klant binnen: het logo opnieuw samenstellen en hier vervangen.
  - De taal van de kassa: zie het punt hieronder.
- [x] Kassa in het Nederlands (24/11/2026). Nederlands stond in Shopify toegevoegd maar niet gepubliceerd, en de cart van de lokale mand werd zonder taalcontext gemaakt. Nu is Nederlands gepubliceerd en maakt de site elke cart in `NL`/`BE` (`src/lib/shopify/hydrogen.ts`): de kassa opent op `/nl-be`. Werking en test: `docs/analytics-en-cookies.md` §7 punt 3.
  - [ ] Verzendmethodes hebben geen Nederlandse naam: in Shopify staan "Standard", "Express" en "International" zonder vertaling. Hernoemen in Settings › Shipping and delivery of vertalen in Translate & Adapt. Niet nagekeken welke namen de klant aan de kassa ziet: dat vraagt een ingevuld adres.
  - [ ] Bestelmails nalezen in het Nederlands (Settings › Notifications): wie in het Nederlands afrekent, krijgt Shopify's Nederlandse versie. Een sjabloon dat enkel in het Engels is aangepast, heeft die aanpassing dan niet. Niet nagekeken.
  - [ ] Te beslissen: Nederlands de standaardtaal van de winkel maken (Settings › Languages › Change default). Vandaag is dat Engels, terwijl alle producttitels en teksten Nederlands zijn. Voor de kassa is het niet nodig. Het raakt wel alles wat buiten de site om loopt (conceptbestellingen, mails aan klanten zonder taal) en mogelijk het zoeken (`docs/zoeken.md`: Shopify leest de Nederlandse teksten als Engels).
- [ ] Vectorlogo (staat al open in de README)

### Vercel bij de livegang (voor Jeroen)

Toegevoegd op 18/11/2026. Alles hieronder gebeurt in het Vercel-project `brunic` (team fruitcocktailbe-projects), omgeving Production.

**Metingen, cookiemelding en winkelmand bij Shopify aanzetten**

Gebouwd op 16/11/2026 en lokaal getest, maar uit: zonder de drie variabelen hieronder verandert er niets voor bezoekers. Werking, cookielijst en testoverzicht: `docs/analytics-en-cookies.md`.

Bedoeld voor de livegang, niet eerder. "Production" is vandaag de testsite brunic.vercel.app: wie de variabelen nu al zet, toont daar de melding en stuurt de testbezoeken naar de rapporten van Brunic.

- [ ] Nog te beslissen (vraag van Alexander, 18/11/2026): blijft het bij drie variabelen die apart gezet worden, of gaat alles vanzelf aan zodra `SITE_INDEXEREN=1` staat? Het tweede kan bij de livegang niet vergeten worden, maar dan moeten de cookietekst en de Shopify-admin klaar zijn vóór die dag. Het vraagt een kleine codewijziging. "Standaard aan, uitzetten in Vercel" is afgeraden: dan staat alles bij de eerstvolgende push aan op de testsite. Tot de beslissing geldt de lijst hieronder.
- [ ] Eerst buiten Vercel: de cookie- en privacytekst is nagelezen door Brunic (`COOKIES_MET_SHOPIFY` in `src/data/content.ts`), en de instellingen in de Shopify-admin zijn gedaan (`docs/analytics-en-cookies.md` §7: toestemming vereist voor de hele EER, wachtwoordpagina weg, Shopify's eigen cookiebanner nagekeken; Nederlands is gepubliceerd sinds 24/11/2026).
- [ ] Settings › Environment Variables, omgeving Production:
  - `NEXT_PUBLIC_SHOPIFY_WINKELMAND` = `1`
  - `SHOPIFY_ANALYTICS` = `1`. Nooit `test`: die stand verstuurt ook vanaf previews en lokaal.
  - `SHOPIFY_SHOP_ID` = `107286626636` (het numerieke ID van `brunic-3.myshopify.com`, geen geheim)

  Zet ze alle drie samen: zonder shop-ID blijven de metingen uit, en zonder de winkelmand ontbreken de mandmetingen. Op Preview mag hetzelfde staan; daar wordt niets verstuurd.
- [ ] Opnieuw deployen. `NEXT_PUBLIC_SHOPIFY_WINKELMAND` wordt bij het bouwen ingebakken: de variabele wijzigen zonder nieuwe build doet niets.
- [ ] Nakijken op de site: de melding verschijnt bij een eerste bezoek; na "Alles accepteren" gaat er een verzoek naar `monorail-edge.shopifysvc.com/unstable/produce_batch` met status 200; een product in de winkelmand leggen werkt.
- [ ] De dag erna: in Shopify › Analytics komen sessies binnen op het Headless-kanaal. Dat is nog nooit nagekeken.
- [ ] Een testbestelling tot en met de kassa. Ook dat is nog nooit getest: de winkel stond achter de wachtwoordpagina.

Terugdraaien: de drie variabelen weghalen en opnieuw deployen, zonder codewijziging. Een bezoeker met een Shopify-mand begint dan met een lege lokale mand.

**Privé-token voor de Storefront API**

- [ ] `SHOPIFY_STOREFRONT_API_TOKEN` op Production: de privé-token van het Headless-kanaal (`shpat_…`) in plaats van de publieke. Met een publieke token ziet Shopify al het verkeer van de server als één bezoeker en kan het verzoeken weigeren (HTTP 430). Met de winkelmand bij Shopify loopt ook elke mandwijziging via de server. Achtergrond: `docs/zoeken.md`, "Instellen in Shopify" stap 2.

**Na de domeinverhuizing** (Vercel › Domains, README §4 punt 5)

- [ ] `brunic.vercel.app` permanent laten doorverwijzen naar `www.brunic.be`. Nagemeten op 23/11/2026: het adres geeft nog de volledige site met status 200, met de canonical naar `www.brunic.be`. Dat is geen ramp, maar met een 308 ziet Google maar één site. Vercel › Domains: bij `brunic.vercel.app` "Redirect to" `www.brunic.be` (308). Pas daarna de teruglink in de Shopify-kassa omzetten (punt hieronder), anders loopt die via een extra stap.

- [ ] De cookies opnieuw nakijken op `www.brunic.be`: staat `_shopify_cmp` er (op `localhost` weigerde de browser hem), en gaat de cookiekeuze mee naar de kassa. Dat is enkel lokaal getest.
- [ ] De teruglink vanuit de Shopify-kassa naar het nieuwe domein laten wijzen. Sinds 19/11/2026 stuurt het live thema "Brunic redirect naar brunic.vercel.app" (het officiële Hydrogen Redirect Theme) elk bezoek aan `brunic-3.myshopify.com` door naar de eigen site, ook de klik op "Brunic" linksboven in de kassa. Het doeladres staat op één plek, in Shopify; in de code verandert er niets.
  - Pas doen zodra `brunic.be` echt naar de nieuwe site op Vercel wijst. Eerder komt wie in de kassa op "Brunic" klikt op de oude WooCommerce-site terecht.
  - Shopify › Online Store › Themes › bij dat thema **Customize** › Theme settings › Storefront › **Hostname**: `brunic.vercel.app` vervangen door `www.brunic.be` (zonder `https://`) en **Save**. Met `brunic.be` zonder `www` werkt het ook, maar dan krijgt de klant een extra tussenstap.
  - De twee eigen regels in hetzelfde scherm blijven staan: `/cart > /winkelmand` en `/products > /product`.
  - Het thema hernoemen via ⋯ › Rename (de naam is enkel een label).
  - Daarna opnieuw testen in een privévenster: product in de winkelmand, "Veilig afrekenen", in de kassa op "Brunic" klikken → de homepage van `www.brunic.be`; en `brunic-3.myshopify.com` rechtstreeks openen → dezelfde homepage, zonder lus.
  - De kassa zelf (`/checkouts/…`, `/cart/c/…`) valt buiten het thema. Terugdraaien: het thema "Horizon" opnieuw publiceren.

Staat elders en hoort ook bij Vercel: `SITE_URL` en `SITE_INDEXEREN=1` (eerste punt van deze checklist), de Deploy Hook, `CRON_SECRET`, het domein en de uptime-monitor (`README.md` §4), en de limiet op formulieren in Vercel Firewall (B03).

---

## 6. Nog handmatig of in een testomgeving te testen

- [ ] Volledige checkout met een testbetaling in een afgeschermde winkel, inclusief de weigering van €0- en etalageproducten
  - Sinds 19/11/2026 staat daarvoor "Testproduct betaaltest" in Shopify (€ 0,50 incl. btw, handle `testproduct-betaaltest`, geen verzending, dus geen verzendkost). Actief op Brunic Headless maar in geen enkele collectie: niet zichtbaar op de site of in de zoekresultaten. Nagekeken: `/api/kassa` op brunic.vercel.app aanvaardt het en de kassapagina toont € 0,50 met Bancontact, kaart en Klarna. De betaling zelf is nog niet gedaan. Het is een echte betaling (geen testmodus gezien): achteraf terugbetalen in Shopify › Orders.
  - [ ] Vóór de livegang: het testproduct archiveren of verwijderen (Shopify › Products).
- [ ] Formulieren versturen in dry-run en in een testwinkel: Flow-mail, foto-upload (≤ 5 foto's, limiet 4 MB), fout- en successtatussen
- [ ] Echte toestellen: iOS Safari en Android Chrome, schermtoetsenbord, liggende weergave
  - Ook het winkelmandpaneel (23/11/2026, `docs/analytics-en-cookies.md` › "Winkelmandpaneel"): enkel getest in Chrome headless. Na te kijken op een echte telefoon: de voet blijft zichtbaar wanneer de adresbalk in- en uitschuift, en het paneel schuift vlot in.
- [ ] Schermlezer (NVDA / VoiceOver), zoom tot 200 %, tekstafstand
  - Ook het winkelmandpaneel: wordt "Mijn winkelmand (1), Toegevoegd aan uw winkelmand" voorgelezen bij het openen, en "… is verwijderd" na het verwijderen?
- [ ] Winkelmandpaneel, zin over verzendkosten ("Levering of afhalen kiest u bij het afrekenen; daar ziet u ook de eventuele verzendkosten"): opnieuw lezen zodra de verzendtarieven en afhalen in Shopify ingesteld zijn (§5). De zin belooft niets, maar "afhalen" moet dan wel een keuze zijn in de kassa. Dezelfde bewering staat al op de winkelmandpagina.
- [ ] INP en CWV-veldgegevens na publicatie (nu enkel labmetingen)
- [ ] Merkwijzigingen van 30/09 23:21 (niet opnieuw geaudit)

---

## Wat al aantoonbaar werkt (niet breken)

- `/api/kassa` weigert etalage-, €0-, onbestaande en ongeldige varianten live (409/400); er wordt dan geen mandje aangemaakt.
- Geen Shopify-secrets in de client-bundels of responses.
- De data komt uit de juiste winkel (`brunic-3`) en het juiste kanaal (Brunic Headless): Admin, Storefront en momentopname tellen elk 2.386 actieve producten.
- Filters: de aantallen komen exact overeen met de Shopify-data, ook gecombineerd; de filterstatus staat in de URL.
- Menu's en lades: focus blijft binnen de lade, Escape sluit, de focus keert terug naar de opener en de pagina scrollt niet mee.
- Terug naar de lijst herstelt de scrollpositie; "meer tonen" verplaatst de focus naar het eerste nieuwe product.
- Crawl van 158 URL's: allemaal HTTP 200, geen consolefouten, geen kapotte afbeeldingen; echte 404's.
- Geen horizontale scroll op 360, 414, 768, 844 (liggend), 1366 en 1920 px.
- De offerteflow neemt product en variant mee en toont ze zichtbaar.

## Metingen (lab, lokale productiebuild, Lighthouse 12.8; indicatief)

| Pagina | Mobiel | Desktop | Mobiel LCP / TBT / CLS |
|---|---|---|---|
| `/` | 79 | 98 | 4,6 s / 170 ms / 0,012 |
| `/catalogus/behang?weergave=producten` | 35 | 87 | 6,4 s / 490 ms / 0,846 |
| `/product/gordijnstof-movement-ado` | 49 | 71 | 5,6 s / 190 ms / 0,846 |
| `/op-maat-en-plaatsing/opmeting-aan-huis` | 70 | 100 | 4,6 s / 430 ms / 0,012 |

Toegankelijkheid scoort 95–97 en best practices 100. SEO scoort 69, maar enkel door de bewuste noindex.
