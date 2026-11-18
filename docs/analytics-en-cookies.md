# Metingen, cookiemelding en de winkelmand bij Shopify

> Gebouwd op 16/11/2026 (Alexander met Claude). **Staat uit**: alles zit achter drie omgevingsvariabelen en is nog niet gecommit of gedeployd. Zonder die variabelen gedraagt de site zich exact zoals voorheen (nagemeten, zie §8).
> Beslissingen en open punten voor Jeroen: [agent-work/shopify-analytics-2026-11-16.md](agent-work/shopify-analytics-2026-11-16.md).

## 1. Wat het doet

1. **Shopify Analytics** op de headless site: paginabezoek, product bekeken, collectie bekeken, zoekresultaten bekeken, toegevoegd aan en verwijderd uit de winkelmand. De kassa en de aankoop registreert Shopify zelf; de site stuurt daar niets voor.
2. **Een eigen cookiemelding**. Zonder uitdrukkelijke keuze wordt er niets gemeten. De keuze leeft in Shopify (Customer Privacy API) en gaat mee naar de kassa.
3. **De winkelmand in Shopify** (Storefront Cart API) in plaats van lokaal in de browser. Dat is nodig om "toegevoegd aan winkelmand" te meten: Shopify leidt die gebeurtenis af uit een mand die het zelf bevestigd heeft.

Google (Ads, eventueel GA4) komt later, wanneer de advertenties starten: §10.

## 2. Schakelaars

| Variabele | Waarde | Effect |
|---|---|---|
| `NEXT_PUBLIC_SHOPIFY_WINKELMAND` | `1` | Winkelmand in Shopify. Wordt bij het bouwen ingebakken: wijzigen = opnieuw deployen. |
| `SHOPIFY_ANALYTICS` | `1` | Scripts, cookiemelding en gebeurtenissen aan. Versturen naar Shopify's rapporten enkel als `VERCEL_ENV=production`. |
| | `test` | Idem, maar verstuurt overal. Enkel om lokaal te verifiëren. **Nooit op Vercel zetten.** |
| `SHOPIFY_SHOP_ID` | `107286626636` | Numeriek shop-ID van `brunic-3.myshopify.com` (geen geheim). Zonder dit ID blijven de metingen uit. |

Geen van de drie is een geheim. De Storefront-token (`SHOPIFY_STOREFRONT_API_TOKEN`) blijft op de server; de browser krijgt hem nooit.

De metingen hebben de Shopify-winkelmand niet nodig, maar zonder haar ontbreken de mandgebeurtenissen. Zet ze dus samen aan.

## 3. Gekozen aanpak

- **Package:** `@shopify/hydrogen` 2026.10.3 als bibliotheek, niet als framework. Dit is de route die Shopify sinds API-versie 2026-10 documenteert, met Next.js uitdrukkelijk genoemd. `@shopify/hydrogen-react` (genoemd in ADR 0001) heet bij Shopify nu "legacy" en wordt niet gebruikt.
- **Scripts:** `ShopifyScripts` één keer in de `<head>` van de root-layout ([shopify-runtime.tsx](../apps/prototype/src/components/analytics/shopify-runtime.tsx)), kanaal `headless`.
- **Toestemming:** consent-modus `custom-banner`. Shopify laadt enkel zijn Customer Privacy API en houdt elke meting tegen tot onze melding een geldige keuze doorgeeft.
- **Proxy:** Shopify eist dat de toestemming via het eigen domein loopt. [proxy.ts](../apps/prototype/src/proxy.ts) laat daarvoor precies twee routes door naar `handleShopifyRoutes`:
  - `POST /api/<versie>/graphql.json`, enkel met de kop `Shopify-Storefront-Consent-Management: 1` (het verzoek van de privacy-API). Al de rest krijgt 404: het is geen open doorgang naar de Storefront API.
  - `/api/cart` (enkel met de Shopify-winkelmand aan).
  
  De andere routes die `handleShopifyRoutes` kan afhandelen (`/cart/…`, `/buy/…`, `/checkout`, de AJAX-cart, MCP) komen er bewust niet door: ze zouden een kassa kunnen openen buiten de etalagebewaking om. De proxy draait enkel op die paden; gewone pagina's blijven statisch of ISR en krijgen geen bezoekerscookies (nagemeten: `Cache-Control: s-maxage=300` op de homepage, geen `Set-Cookie`).
- **Winkelmand:** eigen queries in [winkelmand-handlers.ts](../apps/prototype/src/lib/shopify/winkelmand-handlers.ts). Shopify's kant-en-klare `createCartServerHandlers` vraagt altijd `sellingPlanAllocation` op, en daarvoor heeft de token van deze winkel geen recht (`unauthenticated_read_selling_plans`). In de browser een kleine eigen store ([shopify-cart.ts](../apps/prototype/src/lib/store/shopify-cart.ts)) die niet van Shopify's scripts afhangt: de mand werkt ook met een adblocker.

## 4. Hoe het werkt

### Toestemming

- De melding verschijnt zodra Shopify's privacy-API geladen is en er geen geldige keuze is. "Alles accepteren" en "Niet-noodzakelijke weigeren" staan naast elkaar met dezelfde stijl; "Voorkeuren instellen" opent een paneel met de schakelaars standaard uit.
- Sluiten, scrollen of doorklikken is geen keuze: de melding blijft staan en er wordt niets gemeten.
- Een keuze is geldig als Shopify voor elk actief doel "yes" of "no" teruggeeft **en** er een stempel bij staat (`brunic_keuze` = `versie|datum`, bewaard in Shopify's eigen toestemmingsgegevens). Zonder stempel telt toestemming niet, ook niet als Shopify's regio-instelling tracking zou toelaten.
- **Opnieuw vragen:** na 183 dagen (de GBA noemt 6 maanden "in beginsel redelijk", thema Cookies, bijgewerkt 17/11/2023) of wanneer `BELEID_VERSIE` verhoogt. Geldt ook na een weigering.
- **Intrekken:** de link "Cookievoorkeuren" staat onderaan elke pagina, ook in de winkelmand. Shopify verwijdert dan zelf zijn analytics-cookie.
- **Laadt de privacy-API niet** (adblocker, storing): geen melding, geen metingen, de site werkt verder. "Cookievoorkeuren" legt dan uit dat er niets gemeten wordt.
- **Bewaren mislukt:** de melding blijft staan met een foutboodschap; er vertrekt niets.

De regels staan los van de browser in [regels.ts](../apps/prototype/src/lib/consent/regels.ts), de koppeling met Shopify in [toestemming.ts](../apps/prototype/src/lib/consent/toestemming.ts).

### Gebeurtenissen

| Gebeurtenis | Wanneer | Waar |
|---|---|---|
| `page_viewed` | Bij het laden en bij elke navigatie in de browser, ook terug/vooruit en terug uit de kassa (bfcache). Een andere variant kiezen telt niet. | `PaginaTracker` in de root-layout |
| `product_viewed` | Eén keer per bezoek aan een productpagina, met de uitvoering waarop de pagina opent. | `product-view.tsx` |
| `collection_viewed` | Eén keer per bezoek aan een categorie. Filters wijzigen de collectie niet. | `CollectieTracker` |
| `search_viewed` | Op de resultatenpagina, niet per toetsaanslag. | `ZoekTracker` |
| `cart_updated`, `product_added_to_cart`, `product_removed_from_cart` | Shopify's eigen tracker (`trackCartAnalytics`) leidt ze af uit de bevestigde mand. De site publiceert ze nooit zelf. | `WinkelmandMetingen` |

- **ID's:** de catalogus bewaart korte nummers; de metingen dragen volledige GID's. Bij een samengevoegd ontwerp gaat het Shopify-product van de gekozen variant mee, niet dat van de pagina (`Variant.bronProductId`).
- **Prijs:** die van de variant, als tekst met twee decimalen, in EUR. Prijs op aanvraag gaat mee als `0.00`; Shopify slaat een meting zonder prijs over.
- **Collectie-ID:** zit pas in momentopnames van na 16/11 (`scripts/sync-shopify.mjs` vraagt het nu mee op). Elke build maakt een nieuwe momentopname; tot dan wordt de collectiemeting overgeslagen.
- **Dubbels:** enkel een onmiddellijke herhaling van dezelfde gebeurtenis valt weg (React Strict Mode). A → B → A telt drie keer. Er is geen blijvend geheugen per adres.
- **Niet gebouwd:** `cart_viewed`.

### Vóór de toestemming

Vastgesteld gedrag van Shopify's bus (gemeten, en zo gedocumenteerd door Shopify):

- De gebeurtenissen van de lopende paginalading blijven in het geheugen van de browser, hoogstens 500. Er wordt niets bewaard en er vertrekt niets.
- Na "accepteren" levert de bus ze alsnog af, elk met zijn eigen adres (gemeten: twee paginabezoeken en een collectie).
- Na "weigeren" gooit hij ze weg. Na herladen zijn ze sowieso weg.
- Wij bouwen daar geen eigen wachtrij naast.
- Uitzondering: de mandtracker start pas bij toestemming, met de mand van dat moment als vertrekpunt. Wat er vóór de toestemming in de mand gelegd werd, wordt niet achteraf gemeld.

### Persoonsgegevens

Shopify's script leest het adres zelf uit de adresbalk. Daarom haalt [bus.ts](../apps/prototype/src/lib/analytics/bus.ts) vóór elke publicatie persoonsgegevens uit het adres (`replaceState`, de pagina blijft staan):

- een zoekterm die op een e-mailadres of telefoonnummer lijkt (`/zoeken?q=jan@…`);
- elke andere parameter met een e-mailadres als waarde (`?email=…` uit een mailing).

Campagnecodes (`utm_…`, `gclid`) blijven staan. Voor zo'n zoekterm gaat er ook geen `search_viewed` uit. Namen, e-mailadressen en tokens zitten in geen enkele gebeurtenis; fouten loggen geen zoekterm.

### Winkelmand

- Elke wijziging is een doel per variant ("variant X moet op 3 staan"). Het scherm toont dat meteen; op de achtergrond gaat één verzoek tegelijk naar Shopify. Snelle klikken tellen niet dubbel (gemeten: twee klikken geven één `product_added_to_cart` van 1 naar 3).
- Weigert Shopify of valt de verbinding weg, dan valt het scherm terug op de bevestigde mand en verschijnt een melding. Er wordt niet vanzelf opnieuw geprobeerd, en er gaat geen meting uit.
- **Etalagebewaking:** `/api/cart` controleert elke variant bij het toevoegen ([etalage.ts](../apps/prototype/src/lib/shopify/etalage.ts): niet `brunic.etalage`, prijs > 0, te koop). Het antwoord bevat geen kassa-URL. Die geeft enkel `/api/kassa`, na een nieuwe controle van elke regel.
- **Afgerekend of vervallen:** Shopify geeft de mand dan niet meer terug; de site wist de `cart`-cookie en toont een lege mand. `kassa-opvolging.tsx` is daarvoor niet meer nodig (blijft bestaan voor de lokale mand).
- **Overgang:** wie nog een lokale mand heeft, krijgt die regels eenmalig in zijn Shopify-mand.
- Producten op aanvraag kunnen niet in de Shopify-mand.

### Naar de kassa

`/api/kassa` leest de mand met de cookies van de bezoeker erbij. De kassa-URL die Shopify teruggeeft draagt de sessie en de toestemming mee als parameters (gemeten):

- na accepteren: `…/cart/c/<token>?key=…&_s=…&_y=…&_cs=…`, en Shopify zet op zijn eigen domein `_shopify_analytics`;
- na weigeren: enkel `key` en `_cs`, en op het kassadomein komt **geen** `_shopify_analytics`.

Dat werkt dus ook tussen twee verschillende domeinen (nu `localhost` en `brunic-3.myshopify.com`).

## 5. Cookies en opslag — wat er werkelijk staat

Gemeten in Edge (headless) op 16/11/2026, naast Shopify's cookielijst gelegd (shopify.com/legal/cookies, bijgewerkt 4/11/2026).

| Naam | Soort | Wanneer | Looptijd | Doel |
|---|---|---|---|---|
| `_shopify_essential` | cookie, HttpOnly | Bij het eerste paginabezoek, vóór elke keuze (antwoord op het toestemmingsverzoek) | 1 jaar | Noodzakelijk. Shopify: sessie- en kassagegevens en bescherming tegen manipulatie. |
| `_shopify_cmp` | cookie | Bij elk toestemmingsverzoek | 1 jaar | Noodzakelijk. Shopify: bewaart de cookiekeuze. **Op `localhost` weigert de browser hem** (Shopify stuurt hem wel); op het kassadomein staat hij er. Op het echte domein nakijken. |
| `_shopify_analytics` | cookie, HttpOnly | Enkel na toestemming voor statistieken; weg na intrekken | 1 jaar | Statistieken: herkent browser en bezoek. |
| `cart` | cookie, SameSite=Lax | Bij de eerste toevoeging aan de mand | 14 dagen | Noodzakelijk: verwijst naar de Shopify-mand. Door onze server gezet. |
| `cartLastUpdatedAt` | lokale opslag | Na toestemming, bij een mandwijziging | geen | Statistieken: voorkomt dubbele telling over tabbladen en herladen heen. Door Shopify's tracker. |
| `brunic:verlanglijst:v1`, `brunic:recent:v1` | lokale opslag | Bij gebruik | geen | Noodzakelijk (bestond al). |
| `brunic:winkelmand:v1`, `brunic:kassa:v1` | lokale opslag | Enkel met de lokale mand | geen | Noodzakelijk (bestond al). |

Op het kassadomein zet Shopify zelf: `_shopify_essential`, `_shopify_cmp`, `localization`, `cart_currency`, en na toestemming `_shopify_analytics`.

**Verzoeken naar buiten:**

| Wanneer | Waarheen | Wat |
|---|---|---|
| Altijd (bestond al) | `cdn.shopify.com` | Productfoto's. |
| Vóór elke keuze | `cdn.shopify.com` | Scripts: `standard-actions.js`, `consent-tracking-api.js`, `standard-events.js`, en `analytics/shopify.js` als er verstuurd mag worden. Plus een verbindingshint naar `shop.app`. |
| Vóór elke keuze | eigen domein → Shopify | `POST /api/unstable/graphql.json`: haalt de toestemmingsstatus op. Hierbij komt `_shopify_essential`. |
| Vóór elke keuze | `otlp-http-production.shopifysvc.com` | Telemetrie van Shopify's scripts. **Geblokkeerd door onze CSP**, bewust. |
| Enkel na toestemming | `monorail-edge.shopifysvc.com` | De metingen: unieke en bezoektoken, adres, verwijzer, browser, shop-ID, valuta, product- en mandgegevens. |

Geen andere trackers, pixels of tagmanagers aangetroffen, vóór of na dit werk.

**CSP** (enkel met `SHOPIFY_ANALYTICS` aan): `script-src` krijgt `https://cdn.shopify.com`, `connect-src` krijgt `https://monorail-edge.shopifysvc.com`. Niets anders.

## 6. Aanzetten

1. Lees eerst §7 en §9.
2. Laat de nieuwe cookie- en privacytekst nalezen (`COOKIES_MET_SHOPIFY` in `src/data/content.ts`; README §4 punt 6).
3. Zet op Vercel, omgeving Production: `NEXT_PUBLIC_SHOPIFY_WINKELMAND=1`, `SHOPIFY_ANALYTICS=1`, `SHOPIFY_SHOP_ID=107286626636`. Op Preview mag hetzelfde: daar wordt niets verstuurd.
4. Deploy. Controleer op de site: melding verschijnt; na accepteren een verzoek naar `monorail-edge.shopifysvc.com/unstable/produce_batch` met status 200; toevoegen aan de mand werkt.
5. Kijk de dag erna in Shopify › Analytics of er sessies binnenkomen op het Headless-kanaal.

**Terugdraaien:** de drie variabelen weghalen en opnieuw deployen. Geen codewijziging nodig. Een bezoeker met een Shopify-mand begint dan met een lege lokale mand.

## 7. Nog te doen in de Shopify-admin

Uitgelezen via de Admin API op 16/11/2026 (alleen lezen, niets gewijzigd):

1. **Toestemming vereist in meer landen.** Nu staat enkel België op "toestemming vereist"; Nederland, Frankrijk, Duitsland en Luxemburg niet. Op onze site maakt dat niets uit (zonder keuze wordt nooit gemeten). Aan de kassa geldt Shopify's instelling wel: een bezoeker uit Nederland die zonder keuze afrekent, wordt daar gevolgd. Zet in de privacy-instellingen van de winkel (Customer privacy) alle EER-landen, het VK en Zwitserland op "toestemming vereist". Het exacte scherm heb ik niet kunnen openen.
2. **Shopify's eigen cookiebanner staat aan** (`privacySettings.banner.enabled = true`, automatisch beheerd). Op de kassa kan die verschijnen bij wie nog niet koos. Niet nagekeken, want de kassa zit achter het wachtwoord (punt 4).
3. **Nederlands toevoegen.** De winkel kent enkel Engels: de kassa opent op `/en-be`. Na het toevoegen en publiceren van Nederlands: `language` in `src/lib/shopify/hydrogen.ts` op `"NL"` zetten.
4. **Wachtwoordpagina.** De winkel staat op "Opening soon". Wie nu afrekent, landt op `/password`. Zolang dat zo is, kan niemand bestellen en kan de kassa niet getest worden.
5. Optioneel: een privé-Storefront-token voor de server. Shopify's botbeveiliging telt dan per bezoeker en niet per server.

## 8. Testoverzicht

Lokaal, 16/11/2026. Browser: Edge headless via het DevTools Protocol, telkens met inspectie van netwerkverzoeken, cookies en lokale opslag. De reeks draaide twee keer tegen een productiebuild (`next build` + `next start`).

| Wat | Resultaat |
|---|---|
| `tsc --noEmit`, `eslint` | Geslaagd (0 fouten) |
| `pnpm --filter @brunic/prototype test:analytics` (27 tests: toestemmingsregels, payloads, ontdubbelen, persoonsgegevens in het adres) | Geslaagd |
| Productiebuild, schakelaars aan en uit | Geslaagd. De pagina's lezen geen cookies of headers; of de lijst statische routes gelijk is aan die van vóór dit werk, is niet vergeleken. |
| Nieuw bezoek zonder keuze: melding, geen meetverzoek | Geslaagd |
| Alles weigeren: geen meetverzoek, geen analytics-cookie, ook na navigatie en herladen | Geslaagd |
| Alleen statistieken via het voorkeurenpaneel (schakelaar standaard uit) | Geslaagd |
| Alles accepteren: paginabezoek van vóór de keuze wordt afgeleverd | Geslaagd |
| Intrekken: analytics-cookie weg, niets meer verstuurd | Geslaagd |
| Herladen en terugkerend bezoek: keuze onthouden | Geslaagd |
| Snel navigeren, terug en vooruit: vijf stappen = vijf paginabezoeken | Geslaagd |
| Variant wisselen: geen extra paginabezoek of productweergave | Geslaagd |
| Product, collectie en zoeken: juiste ID's en bedragen | Geslaagd |
| Zoeken op een e-mailadres: niets in de adresbalk, niets in het verzoek | Geslaagd (na een fix: eerst lekte het adres mee) |
| Mislukte mandactie: foutmelding, geen meting; daarna opnieuw: precies één | Geslaagd |
| Verwijderen uit de mand | Geslaagd |
| Shopify's scripts geblokkeerd: site, mand en kassa-URL werken; geen melding | Geslaagd |
| Toestemming bewaren mislukt (netwerk): foutboodschap, daarna opnieuw | Geslaagd |
| Mobiel 390 px: melding past, knoppen even groot | Geslaagd |
| Overgang naar de kassa: sessie en toestemming gaan mee, in beide richtingen | Geslaagd tot aan de wachtwoordpagina |
| Schakelaars uit: geen scripts, cookies of proxyroutes; lokale mand en kassa zoals voorheen; CSP identiek | Geslaagd |
| `SHOPIFY_ANALYTICS=1` buiten productie (lokaal, preview): melding en mand werken, Shopify's analytics-script laadt niet, geen meetverzoek | Geslaagd |
| De kassa zelf, een testbestelling, de aankoopregistratie | **Niet geverifieerd** (wachtwoordpagina) |
| Aankomst in de rapporten van Shopify Analytics | **Niet geverifieerd**. Technisch verzonden (HTTP 200 van `monorail-edge`), maar de rapporten zijn niet ingezien: de Shopify-koppeling van Claude vroeg opnieuw om aanmelding. |
| Gedrag op het echte domein (`www.brunic.be` + kassadomein), `_shopify_cmp` daar | **Niet geverifieerd** |
| Safari en Firefox, echte toestellen, schermlezer | **Niet geverifieerd** (enkel Edge/Chromium headless) |

Eén controle faalde in de eerste run op de devserver (toestemming werd in dat scenario niet vastgelegd) en slaagde in elke latere run, ook op de productiebuild. Oorzaak niet achterhaald.

## 9. Bekende beperkingen

- **Verzonden is niet ontvangen.** Zie §8.
- **Meetverlies.** Wie weigert, wordt niet gemeten. Wie een adblocker gebruikt die `monorail-edge.shopifysvc.com` of Shopify's scripts blokkeert ook niet, zelfs na "accepteren". Hoeveel dat is, valt pas na de livegang te zien.
- **`_shopify_essential` komt vóór elke keuze en blijft 1 jaar.** Dat is Shopify's noodzakelijke cookie; de looptijd is niet aan ons. De GBA noemt 6 maanden redelijk voor het onthouden van een cookiekeuze: de keuze zelf vragen wij na 6 maanden opnieuw, de cookie blijft langer staan.
- **Scripts van Shopify laden vóór de keuze** (geen meetverzoek, geen analytics-cookie). Ze pas na een keuze laden kan niet zonder een eigen "al gekozen"-vlag naast Shopify, en dat wilden we net vermijden.
- **Kassa aan de Shopify-kant**: taal, regio-instelling en Shopify's eigen banner, zie §7.
- **De Shopify-code zit ook in de JavaScript als de schakelaars uit staan** (statische import). Gemeten verschil tussen aan en uit: geen (892 kB tegen 893 kB, alle pagina's samen, ongecomprimeerd). Het verschil met de code van vóór dit werk is niet gemeten.
- **Cookietekst** is een ontwerp. De rechtsgrond en de formulering zijn niet juridisch nagekeken.

## 10. Later: Google

Bij de start van de advertenties:

1. In [regels.ts](../apps/prototype/src/lib/consent/regels.ts): categorie `marketing` op `actief: true` en `BELEID_VERSIE` verhogen. Elke bezoeker krijgt de vraag dan opnieuw; dat moet ook, want toestemming geldt enkel voor wat hij toen wist.
2. De cookiepagina aanvullen met Google en zijn cookies.
3. Google aansluiten als bestemming op dezelfde bus (`window.Shopify.analytics.addDestination`), of via Shopify's Google-kanaal. Welke van de twee, is dan uit te zoeken. De gebeurtenissen hoeven niet opnieuw gebouwd te worden.
4. De site en de kassa onder hetzelfde domein brengen (`www.brunic.be` en een kassa-subdomein) vóór de advertenties starten.

## 11. Bestanden

| Onderdeel | Bestanden (`apps/prototype`) |
|---|---|
| Shopify-context, etalagebewaking, mandroutes | `src/lib/shopify/hydrogen.ts`, `etalage.ts`, `winkelmand-handlers.ts` (nieuw) |
| Proxy en CSP | `src/proxy.ts`, `next.config.ts` |
| Toestemming | `src/lib/consent/regels.ts`, `toestemming.ts`; `src/components/consent/cookie-melding.tsx`, `cookievoorkeuren-knop.tsx` (nieuw) |
| Metingen | `src/lib/analytics/payloads.ts`, `bus.ts`; `src/components/analytics/shopify-runtime.tsx`, `trackers.tsx`, `winkelmand-metingen.tsx` (nieuw) |
| Winkelmand | `src/lib/store/shopify-cart.ts` (nieuw), `stores.ts`; `src/components/commerce/cart-ui.tsx`, `cart-view.tsx`; `src/app/api/kassa/route.ts` |
| Aansluiting op pagina's | `src/app/layout.tsx`, `(kassa)/layout.tsx`, `(winkel)/catalogus/[...pad]/page.tsx`, `(winkel)/zoeken/page.tsx`; `src/components/product/product-view.tsx`, `layout/site-footer.tsx` |
| ID's voor de metingen | `src/lib/catalog/types.ts`, `shopify-adapter.ts`, `ontwerpen.ts`; `scripts/sync-shopify.mjs` |
| Teksten | `src/data/content.ts` (cookiepagina, privacyverklaring) |
| Tests | `scripts/test-analytics.mjs`, `package.json` (`test:analytics`) |
| Afhankelijkheid | `package.json`, `pnpm-lock.yaml`: `@shopify/hydrogen` 2026.10.3 |
| Docs | dit bestand, `.env.example`, `apps/prototype/README.md`, `docs/architectuur.md` |
