# Zoeken — Shopify Search

> Sinds 15/11/2026 zoekt de webshop met **Shopify Storefront Search en Predictive Search**. De eigen zoekmotor (tekstvergelijking in het geheugen, `lib/catalog/search.ts`) is verwijderd. Er is geen terugvaloptie en geen tweede zoekmotor.

Shopify bepaalt wat er gevonden wordt en in welke volgorde. De site legt daar niets bovenop: geen eigen rangschikking, geen eigen synoniemen, geen eigen tikfoutcorrectie. Wie de resultaten wil sturen, doet dat in Shopify (zie [Instellen in Shopify](#instellen-in-shopify)).

## Bestanden (`apps/prototype`)

| Bestand | Rol |
|---|---|
| `src/lib/zoeken/zoeken.ts` | Alles wat met Shopify praat: `zoekSuggesties` (Predictive Search) en `zoekResultaten` (Search, filters, sortering, paginering). Enkel op de server. |
| `src/lib/zoeken/paginas.ts` | Shopify-pagina → pagina van de site (diensten, infopagina's, artikels). |
| `src/app/api/zoeken/route.ts` | Dunne route voor het zoekveld. De browser praat enkel hiermee; de token blijft op de server. |
| `src/components/layout/search-box.tsx` | Het zoekveld met het suggestiepaneel. |
| `src/app/(winkel)/zoeken/page.tsx` | De zoekpagina. Gebruikt dezelfde lijstcomponent als elke productlijst (`product-listing.tsx`). |
| `scripts/test-zoeken.mjs` | `pnpm --filter @brunic/prototype test:zoeken`: de 55 vaste zoekopdrachten en de codetests. |

Omgevingsvariabelen: de bestaande `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_API_TOKEN` en `SHOPIFY_API_VERSION`. Er kwam geen variabele bij.

## Hoe het werkt

**Wat Shopify teruggeeft zijn product-ID's.** De kaart (beeld, prijs per eenheid, "op aanvraag", samengevoegde ontwerpen) komt uit de catalogus van de site, dezelfde als op elke andere lijst. Een product dat Shopify vindt maar dat niet op de site staat (geen gekoppelde collectie, of nieuwer dan de momentopname) valt weg: het zou ook geen productpagina hebben.

**Zoekveld.** Vanaf twee tekens, 220 ms na de laatste toetsaanslag, één verzoek naar `/api/zoeken`. Het paneel toont hoogstens zes producten met beeld, merk, titel en prijs, en "Bekijk alle resultaten". Zoektermen, categorieën en pagina's verschijnen als Shopify ze geeft. Het paneel toont geen aantal: Shopify geeft hier hoogstens tien suggesties, geen totaal. Elke nieuwe zoekterm breekt het vorige verzoek af; een laat antwoord op een oudere term wordt genegeerd. Pijltjes lopen door de suggesties, Escape sluit, Enter opent `/zoeken?q=…`.

**Zoekpagina.** Zoekterm, filters, sortering en pagina staan in de URL: `/zoeken?q=vloerkleed&kleurfamilie=beige&sorteer=prijs-af&pagina=2`. Per weergave gaan er drie verzoeken tegelijk naar Shopify (product-ID's, filters, categorieën en pagina's). Staat er een filter in de URL, dan gaat er één verzoek vooraf: de URL bevat waarde-ID's en Shopify verwacht per waarde zijn eigen invoer.

**Paginering.** De cursorpaginering van Shopify, 250 ID's per verzoek. De URL bewaart het paginanummer; "Meer tonen" laadt 48 kaarten bij met dezelfde zoekterm, filters en sortering.

**Fouten.** Antwoordt Shopify niet binnen 8 seconden of met een fout, dan toont de pagina "Zoeken lukt even niet" met een knop om opnieuw te proberen, en het zoekveld "De suggesties zijn tijdelijk niet beschikbaar". Er gaat een `[ALERT]`-regel naar de logs (`lib/melding.ts`), zonder de zoekterm.

## Aantallen

Shopify telt Shopify-producten en stopt bij 1000. De site voegt ontwerpen samen: 4.111 Shopify-producten zijn 4.070 producten op de site (Desso "Linon" is in Shopify één product per kleur). Het aantal van Shopify klopt dus niet met de kaarten. Daarom:

- **Een totaal staat er enkel als alle resultaten opgehaald zijn.** Dan is het het aantal kaarten ("25 producten"). Dat is zo bij elke zoekopdracht tot ongeveer 250 resultaten.
- **Anders staat er geen totaal**: "48 producten getoond" en "Meer tonen", zonder voortgangsbalk.
- **Filterwaarden tonen geen aantal.** Een waarde zonder resultaten verdwijnt wel.
- Na 1000 resultaten stopt Shopify. De lijst zegt dan dat dit de best passende resultaten zijn en vraagt om te verfijnen.

## Filters en sortering

De zoekpagina toont de filters uit de app **Search & Discovery**, in de volgorde van de app. Er staat geen filterlijst in de code: een filter die Brunic in de app toevoegt, verschijnt vanzelf. Vandaag (15/11/2026): Prijs, Breedte (cm), Lengte (cm), Kleurfamilie, Poolklasse, Materiaal.

- Een filter verschijnt enkel als hij de lijst kan verkleinen (minstens twee waarden met resultaten). "Availability" valt zo weg: Shopify volgt geen voorraad, alles staat "in stock".
- OF binnen een filter, EN tussen filters. Dat is het gedrag van Shopify zelf.
- **Prijs** is één keuze tegelijk, in de vaste prijsklassen van de site. Shopify kent één prijsbereik; bij twee telt enkel het eerste. Een klasse zonder resultaten verdwijnt. "Prijs op aanvraag" is in Shopify een prijs van € 0.
- De winkel staat in het Engels, dus Shopify noemt zijn standaardfilters "Price" en "Availability". De site vertaalt die twee, plus "Merk" en "Type" als die ooit aangezet worden. De andere namen komen uit de app.
- **Sortering**: Relevantie (standaard), Prijs oplopend, Prijs aflopend. Meer kan Shopify Search niet. Bij "Prijs oplopend" staan producten op aanvraag achteraan, zoals op elke lijst: de site vraagt Shopify eerst de producten met een prijs en daarna de rest.
- De andere lijsten (categorie, merk, aanbiedingen) gebruiken nog het filtersysteem van de site (`filtersysteem.md`). Daar verandert niets.

## Verschillen met de vroegere zoekfunctie

Gemeten op 15/11/2026 met de 55 vaste zoekopdrachten uit de QA-audits: **51 van de 55** doen wat de klant verwacht. De oude zoekfunctie haalde er 48.

**Beter**

| Wat | Vroeger | Nu |
|---|---|---|
| Tikfouten | 0 resultaten | "behnag" en "Rampor" vinden behang en Rampur |
| Meervoud | 0 resultaten | "gordijnstoffen" en "tapijttegels" werken ("vloerkleden" niet, zie onder) |
| "vinyl" | eerst tien muurstickers | de eerste tien zijn vinylvloeren |
| Desso | 3 producten ontbraken | alle Desso-producten gevonden, ook de drie met vendor Tarkett |
| Beschrijving | niet doorzocht | doorzocht |
| Kop en lijst | verschillend aantal met een filter (R6-17) | één aantal, of geen |

**Anders of minder goed**

| Wat | Vroeger | Nu | Oplossing |
|---|---|---|---|
| Filterwaarden uit metafields (kleurfamilie, materiaal, eigenschappen, lichtdoorlatendheid, ruimte) | doorzocht | niet doorzocht. "wasbaar": 614 → 0. "verduisterend": 34 → 2. "antraciet": 186 → 59. "brandvrij": 96 → 47 | het woord als tag op het product (zie onder) |
| Lijn of collectie (`brunic.collectie`) | doorzocht | enkel als de naam in de titel, de beschrijving of een tag staat. "Nordic Folk" en "Letter to the sun" werken | tag `collectie:…` bestaat al voor een deel |
| Categorienamen | doorzocht | geen productveld in Shopify | product type en tags |
| "vloerkleden" | 0 resultaten | vasttapijt en vinyl eerst, geen vloerkleed in de eerste tien | winkeltaal, zie onder |
| "vloerkled" (tikfout) | 0 resultaten | vinylvloeren | idem |
| Categorieën in het paneel | uit de boom van de site | Shopify geeft er vandaag geen | collecties publiceren, zie onder |
| Sorteren | aanbevolen, nieuwste, prijs, naam | relevantie en prijs | grens van Shopify |
| Filters | het filtersysteem van de site, met aantallen | de filters van Search & Discovery, zonder aantallen | filters toevoegen in de app |
| Kaart bij een kleurfilter | toonde de gekozen kleur | toont de standaardkleur | – |
| Meer dan 1000 resultaten | alles bereikbaar | Shopify stopt bij 1000 | grens van Shopify |
| Brede woorden | elk woord moest voorkomen | Shopify geeft ook verwante resultaten ("linnen": 76 → het maximum van 1000) | zie [Zoeken op betekenis](#zoeken-op-betekenis) |
| Een woord dat in geen enkel product staat ("deurmat", "laminaat") | 0 resultaten, met de lege staat | tientallen "verwante" producten, zonder dat woord | zie [Zoeken op betekenis](#zoeken-op-betekenis) |

**Wat Shopify doorzoekt**: titel, beschrijving, product type, vendor, tags, en van de varianten de titel (de optiewaarden, bv. een kleurnaam), het artikelnummer en de barcode ([bron](https://help.shopify.com/en/manual/online-store/storefront-search/search-behavior)). Metafields staan niet in die lijst. Een artikelnummer werkt ook op zijn eerste tekens. Tikfouten: één verkeerde of twee verwisselde letters, niet in artikelnummers.

Let op: ook interne tags zijn doorzoekbaar (`leveranciersimport`, `bron:ddept`, `prijs-ontbreekt`, `uitlopend`). Een klant die "uitlopend" intikt, krijgt het maximum van 1000 producten (gemeten 15/11/2026). Dat tags werken, is ook het bewijs voor stap 7 hieronder.

## Zoeken op betekenis

Shopify zoekt niet alleen op woorden maar ook op betekenis ("semantic search"). Vindt het weinig of niets met het woord zelf, dan vult het aan met producten die het verwant vindt. Shopify noemt dat "fewer no-result searches". Gevolg: een woord dat in geen enkel product staat, geeft toch resultaten. Gemeld door Alexander op 15/11/2026 met "deurmat": in het zoekveld stond behang "… mat zwart …" bij de eerste zes.

Gemeten op 15/11/2026. "Met het woord" = het woord staat, ook als deel van een langer woord, in een veld dat Shopify doorzoekt.

| Zoekterm | Resultaten | Met het woord, bij de eerste 24 |
|---|---|---|
| vloerkleed, behang, vinyl, gordijnstof, tapijt, blauw, bloemen | 372 tot 1000 | 24 van 24 |
| Rampur | 23 | 19 (de vier andere staan achteraan) |
| lamp | 351 | 2 (de twee lampen staan vooraan) |
| deurmat | 33 | 0 |
| laminaat | 75 | 0 |
| kunstgras | 238 | 0 |
| rolgordijn | 128 | 0 |
| badmat | 96 | 0 |
| zwembad | 8 | 0 |

- **Voor wat Brunic verkoopt, klopt de eerste pagina.** De echte treffers staan vooraan, de verwante erachter.
- **Voor wat Brunic niet verkoopt, komt er geen "niets gevonden" meer.** De kop zegt "Resultaten voor …" en de lijst telt producten, terwijl geen ervan het woord bevat.
- **Sorteren op prijs haalt de verwante producten naar voren.** "lamp", prijs oplopend: de eerste zes zijn vinylvloeren en vloerkleden, geen lamp. Bij "Rampur", prijs oplopend, staat een Ripley-kleed vooraan.
- Het lijkt alsof Shopify de Nederlandse teksten deels als Engels leest: "lamp" geeft "Hi Light" en "Light Grey", "deurmat" geeft behang "mat zwart" (Engels *mat*). De winkel staat in het Engels (stap 3). Niet getest of de winkeltaal dit verandert.

**Uitzetten kan niet, voor zover gedocumenteerd.** Het Help Center: "Semantic understanding is included in online store search", en "There's no setting that controls how broadly search matches" ([zoekgedrag](https://help.shopify.com/en/manual/online-store/storefront-search/search-behavior), [Search & Discovery](https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-modify-search), gelezen op 15/11/2026). Een bericht van Shopify uit september 2024 spreekt nog van inschakelen in de app Search & Discovery; of die schakelaar er nog staat, is enkel in de admin te zien.

**Geprobeerd via de API (15/11/2026), zonder bruikbaar resultaat:**

| Poging | Uitkomst |
|---|---|
| Aanhalingstekens (`"deurmat"`) | geen verwante producten meer, maar ook geen woorddelen en geen tikfouten: "lamp" 0, "fiets" 0 (er is behang met "fietsen"), "Tarkett vinyl" 0 |
| Veldsyntaxis (`title:… OR product_type:… OR body:…`) | enkel hele woorden: `title:lamp` vindt "Staanlamp" niet, `title:rampor` vindt niets |
| `*`, `AND`, haakjes | niet strikter: meestal méér resultaten ("deurmat*": 1000) |
| `searchableFields` bij `predictiveSearch` | geen effect |

Er is dus geen instelling in de code die dit oplost en toch woorddelen en tikfouten behoudt.

**Wat wel kan**

1. In Shopify (zie de stappen hieronder): de winkeltaal op Nederlands (stap 3), in Search & Discovery kijken of er een schakelaar voor semantic search staat, en anders de vraag aan Shopify Support stellen. Voor een woord dat klanten gebruiken voor iets wat Brunic wél heeft ("deurmat" voor de schoonloopmat Defend AD19): het woord als tag of synoniem toevoegen, dan staat dat product vooraan (stappen 5 en 7).
2. Op de site: een controle op het woord zelf. Dat is een eigen laag bovenop Shopify, tegen de beslissing van 15/11 in, en dus een beslissing van Alexander of Jeroen. Twee vormen: enkel de kop eerlijk maken ("Geen producten gevonden voor 'deurmat'. Verwante producten:") als geen enkel resultaat het woord bevat, of resultaten zonder het woord niet tonen. De tweede vorm kost de hulp bij tikfouten en raakt de filters, de aantallen en de paginering.

Meten: deel 1b van `test:zoeken` draait negen woorden die in geen enkel product staan en toont wat Shopify ervoor teruggeeft. Stand op 15/11/2026: 9 van 9 geven producten.

## Instellen in Shopify

Niets hiervan is uitgevoerd: aan Shopify is niets gewijzigd. Na elke stap `pnpm --filter @brunic/prototype test:zoeken` draaien.

**1. API-versie (code en Vercel, vóór 16/01/2027).** `SHOPIFY_API_VERSION=2025-10` is sinds 16/10/2026 vervallen. Shopify antwoordt vandaag met 2026-01 (header `X-Shopify-API-Version`), en die versie vervalt op 16/01/2027. Zet de variabele op `2026-10` in `.env` en op Vercel, en draai daarna de sync en de tests. Nagekeken op 15/11/2026 met versie 2026-10 (alleen lezen): `test:zoeken` geeft dezelfde uitslag (51 van 55, 15 van 15), en de vragen van de sync, de live beschikbaarheid en de metaobjects antwoorden zonder fout. Niet nagekeken op 2026-10: de formulieren (Admin API, dezelfde variabele) en de kassa. Test die op een preview.

**2. Privé-token (Vercel, vóór de livegang).** De site belt Shopify vanaf de server met een publieke token. Shopify meet het verkeer van een publieke token per IP-adres van de bezoeker; vanaf een server lijkt alles van één adres te komen en kan Shopify verzoeken weigeren (HTTP 430). Zet in `SHOPIFY_STOREFRONT_API_TOKEN` de privé-token van het Headless-kanaal (`shpat_…`). De code stuurt dan vanzelf het IP-adres van de bezoeker mee (`Shopify-Storefront-Buyer-IP`).

**3. Winkeltaal Nederlands (Instellingen › Talen).** De winkel staat in het Engels. Shopify herkent woordvormen (enkelvoud, meervoud) per taal. Dat verklaart wellicht waarom "vloerkleden" geen vloerkleden vindt. Niet getest: we weten pas na de wijziging of dit het oplost. Het zet ook de filternamen "Price" en "Availability" in het Nederlands. Kijk na de wijziging ook naar deel 1b van de test: mogelijk verandert de taal wat Shopify "verwant" vindt (zie [Zoeken op betekenis](#zoeken-op-betekenis)).

**4. Search & Discovery › Filters.** Toevoegen: **Product type**. Dan kan een klant bij "tapijt" kiezen tussen Vloerkleed, Vasttapijt en Tapijttegel; de site toont de filter als "Type". Te overwegen: Motief en Stijl (metafields). Niet toevoegen zonder overleg: **Vendor**, want die toont "Desso" als merk terwijl de site Desso overal onder Tarkett zet. De namen "Breedte (cm)", "Lengte (cm)" en "Kleurfamilie" komen uit de app en zijn daar aan te passen.

**5. Search & Discovery › Synoniemen.** Als de app nog synoniemgroepen aanbiedt: `vloerkleed, vloerkleden, karpet, tapijt` en `gordijn, gordijnen, overgordijn, gordijnstof`. De documentatie van Shopify beschrijft handmatige synoniemen niet meer en zegt dat Shopify ze zelf afleidt; kijk in de app of de optie er nog staat.

**6. Search & Discovery › Product boosts.** Voor "tapijt" staan nu behangpapieren met "tapijt" in de titel tussen de eerste resultaten. Een boost zet gekozen producten bovenaan voor een zoekterm (per product hoogstens tien termen). Boosts gelden ook via de Storefront API ([bron](https://help.shopify.com/en/manual/online-store/storefront-search)).

**7. Tags via de catalogus-pipeline.** Shopify doorzoekt tags, geen metafields. De woorden waarop klanten zoeken en die enkel in een metafield staan, kunnen als tag op het product: Wasbaar, Verduisterend, Brandvertragend, de kleurfamilie, het materiaal, en bij vloerkleden ook "tapijt" en "vloerkleden". De pipeline schrijft al tags (`packages/catalog`, zie `agent-work/tapijt-tags.md`). Dit wijzigt productgegevens van 4.111 producten: eerst beslissen welke woorden, dan uitvoeren.

**8. Pagina "Opmeting aan huis" (Onlinewinkel › Pagina's).** Shopify Search vindt pagina's uit Shopify, niet de pagina's van de site. Maak een pagina met handle `opmeting-aan-huis` en in de tekst de woorden waarop klanten zoeken (opmeting, opmeten, meten, plaatsing). Ze verschijnt dan in het zoekveld en op de zoekpagina en leidt naar `/op-maat-en-plaatsing/opmeting-aan-huis`. Hetzelfde werkt voor elke dienst, infopagina en elk artikel: de handle is de slug van de pagina op de site. De pagina "contact" bestaat al en werkt zo.

**9. Collecties publiceren op het kanaal Onlinewinkel.** Predictive Search geeft vandaag geen enkele collectie terug, ook niet voor "behang". De collecties staan wel op het Headless-kanaal. Een melding op het forum van Shopify beschrijft hetzelfde en de oplossing: de collectie ook op Onlinewinkel publiceren. Niet officieel gedocumenteerd; probeer het met één collectie. De code toont een gevonden collectie als categorie van de site.

**10. Drie producten met een prijs én "etalage".** Soft Sense II AC27, Asteranne A411 en Paradiso AB69 (vendor Tarkett, handle eindigt op `-desso`) hebben `brunic.etalage = true` en toch een prijs (€ 44, € 99, € 44). De site toont "Prijs op aanvraag", Shopify sorteert ze op hun prijs: bij "Prijs oplopend" staan ze tussen de producten met een prijs. Prijs op 0 zetten of de etalagevlag weghalen.

**Zoeksuggesties ("Suggesties" in het paneel)** leidt Shopify af uit de catalogus en uit wat klanten zoeken. De dev-store heeft geen bezoekers, dus er zijn er geen. De code toont ze zodra Shopify ze geeft.

## Testen

```
pnpm --filter @brunic/prototype test:zoeken
```

Leest alleen. Deel 1 draait de 55 zoekopdrachten tegen de echte Shopify Search en zegt per regel of het verwachte product, merk of type bij de eerste tien staat. Een rode regel daar is werk in Shopify, geen codefout. Deel 1b toont ter informatie wat Shopify teruggeeft voor negen woorden die in geen enkel product staan. Deel 2 en 3 testen de code: aantallen, paginering, filters (OF en EN), prijsklassen, sortering, suggesties. Die horen groen te zijn; enkel dan eindigt het script met een fout.

Stand op 15/11/2026: 51 van 55, en 15 van 15 codetests. De vier rode regels: "vloerkleden", "vloerkled", "wasbaar" en "opmeting" (stappen 3, 7 en 8 hierboven).

## Beperkingen

- Shopify geeft ook producten die het verwant vindt, zonder het zoekwoord. Een woord buiten het assortiment geeft daardoor zelden "niets gevonden", en sorteren op prijs mengt verwante producten tussen de echte treffers. Zie [Zoeken op betekenis](#zoeken-op-betekenis).
- Het resultaat hangt af van de catalogus-momentopname. Een product dat nieuwer is dan de laatste build wordt door Shopify gevonden maar niet getoond tot de volgende build (webhook, hoogstens een kwartier later).
- Een dubbelepunt in de zoekterm wordt een spatie. In Shopify is `veld:waarde` zoeksyntaxis en schakelt die de tikfoutcorrectie uit.
- Zoekstatistieken (wat klanten zoeken, wat niets oplevert) meet Shopify enkel met zijn eigen tracking. Die staat niet aan: de site zegt "geen statistieken" (vraag 23 in `vragen-aan-brunic.md`).
- Niet getest: echte toestellen, Safari, Firefox, een schermlezer, en het gedrag op Vercel onder echt verkeer (punt 2).
