# Taak: zoeken overzetten naar Shopify Search

**Eigenaar:** Alexander (met Claude) · 15/11/2026

**Status:** code klaar en lokaal geverifieerd, **niet gecommit en niet gedeployd**. Aan Shopify is niets gewijzigd: alle verzoeken waren leesverzoeken via de Storefront API.

**Beslissing (van Alexander, 15/11):** de eigen zoekmotor wordt volledig vervangen door Shopify Storefront Search en Predictive Search. Geen terugvaloptie, geen tweede zoekmotor, geen eigen rangschikking of synoniemen bovenop Shopify.

Werking, verschillen met vroeger en de lijst voor de Shopify-admin: **[`docs/zoeken.md`](../zoeken.md)**.

## Wat er veranderd is (`apps/prototype`)

| Wijziging | Bestanden |
|---|---|
| Nieuwe zoeklaag op Shopify `search` en `predictiveSearch` | `src/lib/zoeken/zoeken.ts`, `src/lib/zoeken/paginas.ts` (nieuw) |
| Zoekveld herschreven: debounce 220 ms, laad-, fout- en lege staat, geen aantal, verouderde antwoorden genegeerd | `src/components/layout/search-box.tsx` |
| `/api/zoeken` is een dunne route naar Shopify (502 bij een fout, CDN-cache van een minuut) | `src/app/api/zoeken/route.ts` |
| Zoekpagina op Shopify Search, met foutstaat | `src/app/(winkel)/zoeken/page.tsx` |
| De lijstcomponent kan een lijst zonder totaal, filterwaarden zonder aantal, eigen sorteringen en een filter met één keuze aan. De andere lijsten gedragen zich zoals voorheen | `src/components/catalog/product-listing.tsx`, `src/lib/catalog/filters.ts`, `src/lib/catalog/listing.ts` |
| Storefront-client: tijdslimiet en het IP-adres van de bezoeker (enkel met een privé-token) | `src/lib/shopify/storefront.ts` |
| Oude zoekmotor verwijderd: `lib/catalog/search.ts` (tekstvergelijking, score, categoriesuggesties) en `catalog.search()` | `src/lib/catalog/repository.ts`; `normalize` staat nu in `src/lib/catalog/tekst.ts` |
| Test met de 55 zoekopdrachten en de codetests | `scripts/test-zoeken.mjs`, `package.json` (`test:zoeken`); de Desso-zoektest verdween uit `test-filters.mjs` |
| Docs | `docs/zoeken.md` (nieuw), `docs/filtersysteem.md`, `docs/architectuur.md`, skill `webshop-qa-audit` |

Meegenomen omdat de regel toch wijzigde: "U hebt 1 van 1 producten bekeken" is nu "1 van 1 product" (R6-16), op elke lijst. En Escape in het suggestiepaneel sluit het paneel nu echt (het veld opende het meteen opnieuw; dat zat al in de oude code).

## Keuzes die ik maakte

- **De kaart komt uit de catalogus van de site, het resultaat uit Shopify.** Shopify geeft product-ID's; beeld, prijs per eenheid, "op aanvraag" en samengevoegde ontwerpen komen uit dezelfde bron als elke andere lijst. Anders zou een zoekresultaat een andere prijs of foto kunnen tonen dan de productpagina.
- **Geen totaal tenzij het klopt.** Shopify telt Shopify-producten en stopt bij 1000; de site voegt ontwerpen samen. Een totaal staat er enkel als alle resultaten opgehaald zijn. Filterwaarden tonen geen aantal.
- **Filters volgen Search & Discovery.** Geen filterlijst in de code. Een filter met één bruikbare waarde verschijnt niet (zo valt "Availability" weg).
- **Prijs: de vaste klassen van de site, één tegelijk.** Shopify kent één prijsbereik. Lege klassen verdwijnen (één extra verzoek, tegelijk met de rest).
- **Prijs oplopend in twee delen.** Shopify zet producten op aanvraag (€ 0) vooraan. De site vraagt eerst de producten met een prijs en dan de rest, zodat "op aanvraag" achteraan staat zoals op elke lijst. Beide delen sorteert en pagineert Shopify.
- **`SHOPIFY_API_VERSION`: enkel lokaal op 2026-10 gezet** (15/11, in de `.env` op de pc van Alexander; dat bestand zit niet in git). De standaardwaarde in de code en `.env.example` staan nog op 2025-10, en Vercel is niet aangepast: de variabele geldt ook voor de formulieren (Admin API) en de kassa, en die zijn op 2026-10 niet getest. Zie `zoeken.md`, stap 1.

## Verificatie (15/11/2026, momentopname 02/11 20:35)

- `tsc --noEmit` ✅ · `eslint .` ✅ (0 errors, 6 bestaande warnings, één minder dan voorheen) · `next build` ✅ (zonder prebuild-sync) · `test:filters` 537/537.
- `test:zoeken`: **51 van de 55 zoekopdrachten** (vroeger 48), **15 van 15 codetests**. Rood: "vloerkleden", "vloerkled", "wasbaar", "opmeting": alle vier werk in Shopify.
- Browser (Edge headless via CDP, op de dev-server en op de productiebuild), 29 controles: één verzoek bij snel typen; hoogstens zes producten met beeld en prijs; geen aantal in het paneel; pijltjes, Escape en Enter; een vertraagd antwoord op een oudere term overschrijft de nieuwe niet; foutstaat en "Opnieuw proberen"; doorklikken naar het product; filter kiezen, sorteren, "Meer tonen" en filter verwijderen met de juiste URL; prijzen dalen bij "Prijs aflopend"; mobiel 390 × 844 zonder horizontale overflow; filterlade; geen consolefouten.
- Foutafhandeling op een productiebuild met een ongeldige token: `/zoeken?q=…` geeft de melding "Zoeken lukt even niet" (HTTP 200, geen token of foutdetails in de pagina), `/api/zoeken` geeft 502 met `no-store`, de cataloguspagina's blijven werken.
- Shopify-documentatie nagelezen op 15/11/2026 (shopify.dev en help.shopify.com): versies, grenzen van `search` en `predictiveSearch`, doorzochte velden, filters, Search & Discovery in headless. Het schema is ook op de echte API nagekeken (introspectie).

- Later op 15/11, met `SHOPIFY_API_VERSION=2026-10`: volledige sync (4.113 producten, 80 s, momentopname 15/11 19:29), `test:zoeken` 51 van 55 en 15 van 15, `test:filters` 539/539, typecheck ✅. De momentopname van 02/11 staat als kopie in `apps/prototype/.data/shopify-catalogus-2026-11-02.json` (niet in git).

## Niet getest

- Vercel, en het gedrag onder echt verkeer met de publieke token (zie `zoeken.md`, stap 2).
- Echte toestellen, Safari, Firefox, een schermlezer.
- Categorieën en zoeksuggesties in het paneel: Shopify geeft er vandaag geen. De code is er, het pad is enkel met pagina's getest ("contact").
- Wat de wijzigingen in Shopify opleveren (taal, tags, filters): pas te meten nadat ze gebeurd zijn.

## Open punten

- De tien stappen in `docs/zoeken.md` § Instellen in Shopify. Dringend: de API-versie (vóór 16/01/2027) en de privé-token (vóór de livegang).
- Drie producten met een prijs én de etalagevlag (Soft Sense II AC27, Asteranne A411, Paradiso AB69): zie stap 10. Dezelfde drie als R6-11.
- Het zoekveld is 14 px (R6-59): niet aangeraakt.
- Niet gelogd in J.A.R.V.I.S (`D:\GithubLocal\J.A.R.V.I.S` bestaat niet op deze pc). Te loggen: "zoeken loopt via Shopify Search en Predictive Search; de eigen zoekmotor is verwijderd".

## Stand van de bevindingen uit QA R6

| Punt | Was | Nu |
|---|---|---|
| R6-06 meervoud | 0 resultaten | "gordijnstoffen" en "tapijttegels" werken, "vloerkleden" niet (stap 3) |
| R6-07 "vinyl" | muurstickers eerst | opgelost: tien vinylvloeren eerst |
| R6-11 Desso | 3 producten ontbraken | gevonden; de data van die drie blijft fout (stap 10) |
| R6-16 "1 van 1 producten" | fout | opgelost |
| R6-17 kop en lijst | verschillend aantal | opgelost: één aantal, in de lijst |
| R6-52 tikfout en dienst | geen hulp | "behnag" en "Rampor" werken, "vloerkled" niet; de dienstpagina vraagt een Shopify-pagina (stap 8) |

## Volgende actie

Alexander of Jeroen: diff nakijken, committen, een preview-deploy, daar `/zoeken?q=vloerkleed` en het zoekveld proberen, dan naar `master`. Daarna de stappen in Shopify, met na elke stap `pnpm --filter @brunic/prototype test:zoeken`.
