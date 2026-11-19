# Taak: Shopify Analytics, cookiemelding en de winkelmand naar Shopify

**Eigenaar:** Alexander (met Claude) · 16/11/2026

**Status:** code klaar en lokaal geverifieerd, **niet gecommit, niet gepusht, staat uit**. Alles zit achter drie omgevingsvariabelen; zonder die variabelen gedraagt de site zich zoals voorheen (nagemeten). Aan Shopify is niets gewijzigd: de Admin API is enkel gelezen.

Werking, cookies, testoverzicht, admin-instellingen en terugdraaien: **[`docs/analytics-en-cookies.md`](../analytics-en-cookies.md)**.

## Beslissingen van Alexander (16/11), nog te loggen in het J.A.R.V.I.S-dossier

Het dossier staat niet op deze pc, dus `log-decision.mjs` kon niet draaien. Jeroen: graag overnemen of bijsturen.

1. **Eerst Shopify Analytics, Google later.** Dit faseert het plan uit `architectuur.md` §Analytics (GA4 + consent mode v2). Reden: er lopen nog geen advertenties; Google Ads is "binnen enkele maanden" voorzien. De opzet is erop voorbereid (`analytics-en-cookies.md` §10).
2. **De winkelmand verhuist naar Shopify** (optie B) in plaats van lokaal in de browser. Reden: Shopify leidt "toegevoegd aan winkelmand" af uit een mand die het zelf bevestigd heeft, zo doen de grote shops het, en de shop is nog niet live. Terugvallen kan met één variabele.
3. **Eigen cookiemelding**, niet die van Shopify: controle over toegankelijkheid, gelijkwaardige knoppen en opnieuw vragen na 6 maanden.
4. **`@shopify/hydrogen` als bibliotheek.** ADR 0001 noemt `@shopify/hydrogen-react`; Shopify noemt dat sinds 2026-10 "legacy". Zelfde principe: de bibliotheek, niet het framework of Oxygen. Het ADR zelf is niet aangepast.

## Verificatie

`tsc`, `eslint`, 27 unittests (`test:analytics`), productiebuild met de schakelaars aan en uit, en een reeks browserscenario's op de productiebuild (48 van 48 controles in de laatste run). Details en wat **niet** geverifieerd is: `analytics-en-cookies.md` §8.

Tijdens het testen zijn enkele tientallen testbezoeken en mandwijzigingen naar de analytics van `brunic-3.myshopify.com` gestuurd, met `localhost`-adressen (stand `test`). Er is geen bestelling geplaatst. De testmanden vervallen vanzelf.

## Open punten

| Punt | Voor wie |
|---|---|
| Committen en beslissen wanneer het aangaat. Een push naar `master` gaat live, maar zonder de variabelen op Vercel verandert er niets voor bezoekers. | Alexander / Jeroen |
| Aanzetten in Vercel bij de livegang: de stappen staan als afvinklijst in `docs/todo.md` §5 "Vercel bij de livegang (voor Jeroen)" (toegevoegd 18/11) | Jeroen |
| Shopify-admin: toestemming vereist voor de hele EER (nu enkel België), Nederlands toevoegen, wachtwoordpagina. `analytics-en-cookies.md` §7 | Jeroen (eigenaar: Bruno) |
| Nieuwe cookie- en privacytekst laten nalezen (`COOKIES_MET_SHOPIFY` in `src/data/content.ts`) | Brunic, via README §4 punt 6 |
| Rapporten in Shopify Analytics nakijken na het aanzetten; een testbestelling zodra de kassa bereikbaar is | Alexander / Jeroen |
| Opnieuw testen op het echte domein (`_shopify_cmp`, kassadomein) | Bij de domeinverhuizing |
| De header- en zoomwijzigingen van 15/11 (kleverige navigatie, naden, site op 90%) staan in dezelfde werkmap en zijn ook nog niet gecommit. Los te committen: ze raken `globals.css`, `site-header.tsx`, `product-listing.tsx`, `product-view.tsx`, `lib/site/scroll.ts` en `lib/site/zoom.ts`. `product-view.tsx` bevat wijzigingen van beide taken. | Alexander |

## Opgemerkt, buiten deze taak

- **De etalagebewaking zit enkel in onze eigen routes.** Wie de publieke Storefront-token heeft, kan rechtstreeks bij Shopify een cart met een etalageproduct aanmaken. De token staat nergens in de browser, en dit werk voegt geen nieuwe weg toe (de proxy laat enkel het toestemmingsverzoek door, `/api/cart` controleert elke variant, de kassa-URL komt enkel uit `/api/kassa`). Een sluitende afscherming hoort in Shopify zelf.
- De winkel staat volgens de Admin API op het plan **Basic** (`partnerDevelopment: false`), tijdzone Europe/Brussels. `architectuur.md` spreekt nog van een Partner development store op EDT.

## Volgende actie

Alexander bekijkt het lokaal (`http://localhost:3100`, de devserver draait met de melding aan en zonder versturen) en beslist over commit en aanzetten.
