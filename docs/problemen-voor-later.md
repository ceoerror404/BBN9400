# Problemen voor later

> **Intern.** Problemen die we kennen maar bewust nog niet oplossen: ze blokkeren de livegang niet, of ze wachten op een beslissing. Hoort het bij Brunic om te beslissen, dan staat het in `docs/vragen-aan-brunic.md`. Is het een taak voor het team (code, Shopify, Vercel), dan staat het in `docs/todo.md`. Nummers veranderen nooit, zodat andere documenten ernaar kunnen verwijzen ("probleem 1").
> - **Opgelost?** Zet de status in het overzicht op "Opgelost" met de datum, en schrijf onder het probleem wat er gebeurd is en waar.

Stand van 22/11/2026.

## Overzicht

**3 problemen: 3 open.**

| Nr. | Onderwerp | Status | Wanneer | Uit |
|---:|---|---|---|---|
| [1](#p1) | Levertermijnen van leveranciers in de beschrijving in Shopify | **Open** | Vóór een koppeling met een ander verkoopkanaal | Controle leverbelofte 18/11 |
| [2](#p2) | Search Console: drie niet-kritieke meldingen bij productfragmenten | **Open** (bewust zo) | Bij echte productbeoordelingen of een voorraadkoppeling | Mail van Search Console 22/11 |
| [3](#p3) | Search Console: verkopersvermeldingen zonder retour, verzending en beschikbaarheid | **Open** (wacht op B16 en B17) | Zodra de verzendtarieven vastliggen en de retourtekst getoetst is | Mail van Search Console 22/11 |

---

<a id="p1"></a>
## 1. Levertermijnen van leveranciers in de beschrijving in Shopify

**Wat:** bij ±276 vinylproducten (Beauflor, Tarkett, Gerflor, Narcis) staat de levertermijn van de leverancier op twee plekken in Shopify:

- als kenmerk (`brunic.specificaties`): "Levertermijn: 3-5 Werkdagen" (234), "Levertijd: 3 – 5 werkdagen" (32), "Levertermijn: 5-10 Werkdagen" (Gerflor, 9) en "Levertijd: 7 werkdagen" (Tarkett, 1);
- als rij in een tabel in de beschrijving (`descriptionHtml`): dezelfde waarden. De tabel herhaalt de kenmerken.

Voorbeeld: `vinyl-easytex-westbury-beauflor`.

**Waarom het nu geen probleem is:** onze site toont geen van beide. Ze laat de kenmerken weg (`IS_LEVERBELOFTE` in `apps/prototype/src/lib/catalog/shopify-adapter.ts`) en haalt elke tabel uit de beschrijving (`TABEL`, zelfde bestand). De gegevens voor Google (`seo.ts`) gebruiken die opgekuiste beschrijving.

**Waarom het later wel een probleem wordt:** de filter zit enkel in onze site. Alles wat de beschrijving rechtstreeks uit Shopify haalt, toont de termijn van de leverancier:

- een verkoopkanaal via Shopify, zoals Google Shopping of Facebook (afgeleid, niet getest);
- een medewerker die een beschrijving uit de Shopify-admin kopieert naar een mail of folder;
- een nieuwe site die de filter niet overneemt.

Dat botst met de belofte van Brunic zelf ("binnen de week", met voorbehoud), en "5-10 werkdagen" is langer dan een week.

**Voorstel:**

1. De tabel uit de beschrijving in Shopify halen. De site toont ze toch nooit, en alles staat al in de kenmerken.
2. Het kenmerk "Levertermijn" laten staan. Kenmerken gaan niet mee naar andere kanalen, en voor Brunic is het intern nuttig om te weten hoe snel de leverancier levert.
3. De filter op de site laten staan als vangnet.
4. Het weghalen van de tabel een vaste stap maken in `packages/catalog/set-leveranciersteksten.mjs`, dat al na elke import draait. Anders zet een nieuwe import van de leveranciersdata de tabel terug (zie `docs/teksten-en-beloftes.md` §C4).

**Let op:** op 13/11/2026 is beslist de data in Shopify te laten staan en enkel op de site te verbergen (`docs/filtersysteem.md`, "Levertermijnen"). Dit voorstel herziet die beslissing voor de tabel, niet voor het kenmerk.

**Wanneer:** vóór Brunic de producten via Shopify naar een ander verkoopkanaal stuurt. Uitvoeren met dry-run, nalezen, `--apply`, met een pushlog om terug te zetten.

---

<a id="p2"></a>
## 2. Search Console: drie niet-kritieke meldingen bij productfragmenten

**Wat:** op 22/11/2026 meldde Search Console voor `https://www.brunic.be/` drie niet-kritieke problemen bij "Gestructureerde gegevens voor Productfragmenten":

- ontbrekend veld `aggregateRating`;
- ontbrekend veld `review`;
- ontbrekend veld `availability` (in `offers`).

Nagemeten op de live site op 22/11 (10 productpagina's): de pagina's met een prijs geven een `Offer` met prijs, zonder `availability`. Geen enkele pagina heeft `aggregateRating` of `review`. De melding klopt dus.

**Waarom het nu geen probleem is:** Google vraagt de drie velden als aanbevolen, niet als verplicht. Een productfragment heeft `offers`, `review` of `aggregateRating` nodig, en één van de drie volstaat. Pagina's met een prijs blijven dus in aanmerking komen voor een prijs in het zoekresultaat.

**Waarom we ze niet invullen:**

- **`aggregateRating` en `review`:** er zijn geen productbeoordelingen. Google aanvaardt enkel beoordelingen van echte klanten die op de productpagina zelf te lezen zijn. Verzonnen scores, of de Google-reviews van de winkel bij een product zetten, gaan tegen de richtlijnen voor reviewfragmenten in. Dat kan een handmatige maatregel opleveren waardoor alle fragmenten van de site verdwijnen.
- **`availability`:** bewust weggelaten in `offers()` (`apps/prototype/src/lib/site/seo.ts`). Shopify volgt de voorraad niet. `InStock` zet "Op voorraad" onder het zoekresultaat, en dat is de belofte die we van de site gehaald hebben (QA 02/11, R3-16). De andere waarden van Google (`BackOrder`, `PreOrder`, `OnlineOnly`, `InStoreOnly`, `LimitedAvailability` …) zeggen zonder voorraadgegevens evenmin iets wat we zeker weten. Enkel `OutOfStock` gaat mee, als geen enkele variant te koop is.

**Wanneer wel:**

- Beoordelingen: zodra Brunic echte productbeoordelingen verzamelt en ze op de productpagina staan.
- Beschikbaarheid: zodra de voorraad gekoppeld is, of als Brunic beslist dat "online te bestellen" in Google als "op voorraad" mag staan. Dat is dan één regel in `offers()`.

**Let op:** producten op aanvraag hebben geen `offers` en komen daardoor niet in aanmerking voor een productfragment. Dat staat al in `docs/agent-work/seo-groei.md` ("Product zonder Offer") en lost zich op met prijzen (B06).

---

<a id="p3"></a>
## 3. Search Console: verkopersvermeldingen zonder retour, verzending en beschikbaarheid

**Wat:** op 22/11/2026 meldde Search Console voor `https://www.brunic.be/` drie niet-kritieke problemen bij "Gestructureerde gegevens voor Verkopersvermeldingen", telkens in `offers`:

- ontbrekend veld `hasMerchantReturnPolicy`;
- ontbrekend veld `availability`;
- ontbrekend veld `shippingDetails`.

Verkopersvermeldingen zijn de gratis productvermeldingen in Google (foto, prijs, winkel). Het gaat om dezelfde productpagina's met een prijs als bij probleem 2.

**Waarom het nu geen probleem is:** de drie velden zijn aanbevolen, niet verplicht. De pagina's blijven in aanmerking komen. Zonder deze velden toont Google bij het product geen verzendkosten en geen retourtermijn.

**Waarom we ze nog niet invullen:** achter elk veld zit iets wat nog niet vastligt.

- **`availability`:** zie probleem 2.
- **`shippingDetails`:** Google vraagt per land een concreet bedrag (`shippingRate`) en een levertijd in dagen. De verzendtarieven in Shopify zijn niet nagekeken (`docs/todo.md`, lanceringschecklist) en de site noemt nog geen bedrag: "Bij het afrekenen ziet u welke leveringsmogelijkheden er zijn en wat ze eventueel kosten" (B16). Een levertijd in dagen is bovendien een leverbelofte: die moet overeenkomen met "binnen de week, met voorbehoud".
- **`hasMerchantReturnPolicy`:** de regel staat op `/info/retourneren`: 14 dagen, de kosten van het terugzenden zijn voor de klant, terugsturen of binnenbrengen in de winkel, en niet voor wat op maat gemaakt of gesneden is. Welke producten onder die uitzondering vallen, is nog niet juridisch getoetst (B17). Vinyl per m² en behang per rol krijgen wellicht een andere regel.

**Voorstel, zodra B16 en B17 rond zijn:** per product invullen in `offers()` (`apps/prototype/src/lib/site/seo.ts`).

- Retour, standaardartikel: `MerchantReturnFiniteReturnWindow`, `merchantReturnDays: 14`, `returnFees: ReturnFeesCustomerResponsibility`, `returnMethod: ReturnByMail` en `ReturnInStore`, `applicableCountry: BE`.
- Retour, op maat gesneden: `MerchantReturnNotPermitted`.
- Verzending: `OfferShippingDetails` met het tarief uit Shopify, `shippingDestination` BE en de levertijd.

**Niet doen:** het retourbeleid in Search Console zelf instellen. Dat is een regel op accountniveau, en volgens Google telt dan enkel die instelling en niet meer wat op de pagina staat. De uitzondering voor maatwerk valt dan weg. Voor de verzendtarieven kan die instelling wel, als ze voor alle producten gelijk zijn.
