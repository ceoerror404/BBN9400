# Webshop-QA-audit Brunic: zesde ronde, negen dagen na de vorige

- **Datum:** 12/11/2026. Tests van 17:43 tot 18:18 en van 21:36 tot 22:36 (CET). Ertussen was de audit gepauzeerd.
- **Uitgevoerd door:** Claude (agent in de rol van `webshop-qa-audit`, alleen lezen en testen)
- **Opdracht:** `.agents/skills/webshop-qa-audit/SKILL.md`, volledige scope, getoetst aan `docs/filtersysteem.md`
- **Map:** `docs/audits/2026-11-12-webshop-qa/`. Screenshots in `screenshots/` (gitignored, voorvoegsel `r6-`). Alle bestandsnamen hieronder staan daar.
- **Vergelijking:** met `docs/audits/2026-11-03-webshop-qa/rapport.md` (R5). Status per eerdere bevinding: §6. De oudere mappen zijn niet gewijzigd.
- **Scripts en ruwe uitvoer:** `%TEMP%\brunic-qa\r6\scripts\` (44 bestanden) en `%TEMP%\brunic-qa\r6\ruw\`. De scripts van de vorige ronde stonden er niet meer (ze zaten toen in een scratchpad), dus ze zijn opnieuw geschreven. De ruwe uitvoer van R5 stond er wel en is gebruikt om te vergelijken.

| Omgeving | Code | Catalogus | Hoe vastgesteld |
|---|---|---|---|
| **Productie** https://brunic.vercel.app, deployment `dpl_JAdR9zs2662fAaQGcdPbVfo1aKoM` (om 17:47, om 21:36 en aan het einde dezelfde). Op 03/11 was dat nog `dpl_B5D6…`. | Git staat niet op deze pc. Afgelezen uit `.git/`: lokale `master` en `origin/master` (laatst opgehaald op 05/11) staan op `6172d13` "Update scrollgedrag-2026-11-03.md" van 03/11 23:30. De laatste codewijziging is `493917a` "smoothnes versie 1" (03/11 23:12). **Dat productie op die code draait, is afgeleid**, niet afgelezen: de site toont geen commit. | `/api/status`: "Shopify-momentopname van 2026-11-03 22:31 · 4070 producten (4111 in Shopify, zelfde ontwerp samengevoegd) · 24 categorieën · 2 zonder gekoppelde collectie". Tijd in UTC, dus 23:31 CET, één minuut na de laatste commit. **Negen dagen oud.** | De kaarten en variantprijzen van alle 4.070 producten op productie zijn gelijk aan wat de lokale code berekent: 0 verschillen. Het volledige productmodel van 664 productpagina's ook: 0 verschillen. 49.369 filtertellingen op 1.253 productielijsten: 0 afwijkingen. |
| Lokaal (enkel als rekenmodel) | Werkkopie op `6172d13`. Geen dev-server gestart. | `apps/prototype/.data/shopify-catalogus.json` van 02/11 19:35 UTC, dus een dag **ouder** dan productie. | Inhoud gelijk op alles wat ik kon nameten, zie hierboven. |

Er is niets gewijzigd aan code, data, beelden, koppelingen of Shopify. Er is niets geïnstalleerd, gecommit of gepusht. `sync`, `build` en `packages/catalog` zijn niet aangeraakt. De winkelmand is niet gebruikt, er is geen formulier verstuurd en geen kassa gestart. Geschreven is enkel in `%TEMP%\brunic-qa\r6\` en in de map van dit rapport.

---

## 1. Oordeel

**De winkel werkt technisch goed en is sinds 03/11 beter geworden. Wat de klant tegenhoudt, zit in de data, en daar is in negen dagen niets aan veranderd.** Filteren, tellen, sorteren en pagineren kloppen volledig: op 1.253 productielijsten met 111.464 kaarten en 49.369 tellingen vond ik geen enkele afwijking van mijn eigen, los van de filtercode gerekende uitkomst. Alle 41.951 foto's laden, alle 1.089 interne links werken, geen enkele pagina loopt horizontaal over op 24 schermformaten. Zeven punten van de vorige ronde zijn opgelost, geen enkel is teruggekomen.

**De drie zwaarste punten:**

1. **R6-01 en R6-02 (P1): vinyl en Boråstapeter zijn nog altijd niet te vinden op kleur of motief.** Vinyl (277 producten) heeft geen filter Kleur. De goedgekeurde kleuren liggen sinds 02/11 klaar, maar staan niet op de site. Boråstapeter (495 producten) heeft bijna geen kleur, geen motief, geen stijl. De tabel in §4.1 is cijfer voor cijfer gelijk aan die van 03/11.
2. **R6-30 (P1, te verifiëren): de prijs van twee Senso-vloeren.** "€ 55,48 / m²" bij een product dat "enkel per doos" van 2,22 m² verkocht wordt. De vraag ligt sinds 03/11 bij Brunic, zonder antwoord, en de klant kan ze online bestellen. De kassa geeft de eenheid niet door.
3. **Tekst en beloftes die niet van Brunic zijn.** Bij 274 vinylvloeren is de beschrijving een brief aan "Beste klanten," (R6-05). Bij 36 tapijten spreekt de fabrikant in de wij-vorm over "onze eigen fabriek" en gratis ophalen (R6-32). 104 producten spreken de klant aan met "je" (R6-09). 245 vinylvloeren tonen een garantietermijn (R6-31).



**Nieuw gevonden deze ronde, en de moeite:**

- **R6-67 (P2): elke productfoto is zachter dan nodig.** De productpagina laadt een bestand van 360 px breed voor een kader van 788 px, en hetzelfde bestand voor de lightbox op het hele scherm. De bronfoto's zijn groot genoeg. Eén eigenschap in de code lost het op.
- **R6-06 (P2): zoeken op een meervoud geeft niets.** "vloerkleden", "gordijnstoffen" en "tapijttegels": 0 producten.
- **R6-34 (P2, te verifiëren): hetzelfde tapijt staat er twee keer, met een andere prijs** (Mehari 0098 en Rampur 0098). Daarnaast tonen 34 andere producten in 14 groepen exact dezelfde foto's als een ander product, zonder dat de naam het verschil uitlegt (R6-35).
- **R6-65 (P2): op mobiel ziet u na een filter geen enkel product** als u bovenaan de pagina begon. Vanaf een gescrolde positie is dat nu wel in orde.

**Bruikbaarheid:** op desktop en mobiel kan een klant vlot bladeren, filteren en een product openen. Geen enkele pagina is stuk. Vóór de overstap zou ik de vindbaarheid, de Senso-prijzen en de teksten rechtzetten, en de vragen aan Brunic laten beantwoorden: twaalf vragen staan open sinds 03/11.

### Stand tegenover 03/11

| Punt | 03/11 | 12/11 (zelf gemeten op productie) | Oordeel |
|---|---|---|---|
| R5-04 na een filter belandt u bij de footer | 0 kaarten in beeld | Vanaf scroll 3.500: de pagina gaat naar het begin van de lijst, balk en 6 tot 8 kaarten in beeld. Desktop en mobiel | **Opgelost** (rest: R6-65) |
| R5-05 tabel als lopende zin | 243 producten | 0 | **Opgelost** (rest: R6-05) |
| R5-06 vloerkleed voor de helft weggesneden | 171 kaarten | 0: het hele tapijt past in het kader, ook in "Speciale vormen" | **Opgelost** |
| R5-08 opmeting aan huis bij Boråstapeter | 483 pagina's | 0: "bekijken we graag samen met u in onze winkel" | **Opgelost** |
| R5-13 focus onder de kleverige balk | 3 van de 26 stops | 0 van de 80 | **Opgelost** |
| R5-21 overflow rond 1.280 px | 7 px | 0 px op 1.279 tot 1.290 px | **Opgelost** |
| R5-43 mobiel: filters enkel bovenaan | knop op −3.316 px | Knop "Filters" verschijnt onderaan bij omhoog scrollen | **Opgelost** |
| R5-01, R5-02 vindbaarheid | P1 | Ongewijzigd | **Open** |
| R5-28 Senso-prijzen | P1, gevraagd | Ongewijzigd, geen antwoord | **Open** |
| R5-07 vinylkaart begint met een kamer | 28 kaarten | 28 kaarten, bekeken | **Open** |
| De andere 48 punten | open | 47 nog aanwezig, allemaal opnieuw getest. R5-22 (hover op touch) is in de emulatie niet eenduidig. Lijst: §6 | **Open** |
| `test:filters` | 535 geslaagd | 537 geslaagd, 0 mislukt | In orde |
| Momentopname | 3 minuten oud | 9 dagen oud, zelfde inhoud | Zie R6-36 |

---

## 2. Bevindingen

Prioriteit: **P1** blokkeert kopen of vinden, of toont foute informatie · **P2** duidelijk storend · **P3** afwerking. Pagina-URL's zijn relatief tot https://brunic.vercel.app. "Regel" = regel van de opdrachtgever: een afwijking is een fout, ook als de code doet wat ze moet doen. Logbestanden (`*.json`, `*-log.txt`) staan in `%TEMP%\brunic-qa\r6\ruw\`, screenshots in `screenshots/`. De nummers volgen de volgorde waarin ik de punten opschreef, niet de prioriteit: R6-67 tot R6-71 kwamen als laatste en staan bij hun soort.

In de kolom Prioriteit staat ook de status (nieuw, bekend met het oude nummer, teruggekomen) en wie het oplost.

### 2.1 Bevestigde fouten

| Prioriteit | Pagina/product/variant | Probleem | Verwacht gedrag | Vastgesteld gedrag | Bewijs en reproductiestappen | Voorgestelde oplossing |
|---|---|---|---|---|---|---|
| **P1** · R6-01 · bekend (R5-01) · Shopify-data | Alle vinyl: 277 producten, 514 kleuren. `/catalogus/vloerbekleding/vinyl` | Geen filter Kleur | De klant kan vinyl op kleur zoeken | Filters op productie: Look, Rolbreedte, Prijs, Merk, Slijtlaag, Plaatsing, Eigenschappen. 0 van de 514 kleuren heeft een kleurfamilie, 390 heten enkel een code (162L, 901D). In `/catalogus/vloerbekleding` sluit elke kleurkeuze alle vinyl uit. Een link met `?kleur=grijs` op de vinyllijst geeft een lege lijst. Ongewijzigd sinds 02/11. | `p1-lijsten.json`, §4.1. Reproductie: open de URL en zoek de knop Kleur. | **Shopify:** de goedgekeurde tags wegschrijven (`../Data/BRUNIC_VINYL_TAGS_2026-11-02.json`, zie `docs/agent-work/r4-en-vinylkleuren-2026-11-03.md`) en een nieuwe build. Raakt: de stalen blijven foto's, want die code staat al op productie. |
| **P1** · R6-02 · bekend (R5-02) · Shopify-data | Boråstapeter: 495 producten, 1.147 kleuren. `/merken/borastapeter`, `/catalogus/behang?weergave=producten` | Het merk is amper te vinden met de filters | Kleur, Motief, Stijl, Ruimte en Materiaal gelden voor heel Behang | Kleur: 9 van de 495. Motief, Stijl, Ruimte, Materiaal: 0. 1.113 kleuren zijn een code zonder familie. De merkpagina heeft enkel Type, Kleur en Eigenschappen. | `/catalogus/behang?weergave=producten&motief=bloemen&merk=borastapeter` geeft "0 producten" (`p6-log.txt`). | **Shopify:** kleurfamilie, motief en stijl taggen zoals bij de gordijnstoffen (fototags). De front neemt ze vanzelf over. |
| **P2** · R6-03 · bekend (R5-03) · Shopify-data | Behang: ESTAhome 584, Origin 121, Walls4You 7, Sanders 3, Boråstapeter 3. Vinyl 3 | Kleur staat in de titel, niet in de filter | "Behang … blauw" verschijnt onder Kleur: Blauw | 721 producten met een kleurwoord in de titel hebben geen kleurfamilie. Van de 156 behangen met "blauw" in de titel staan er 83 niet onder Blauw. | `a2.json`. Reproductie: `/zoeken?q=kersenbloesems`, daarna `/catalogus/behang?weergave=producten&kleur=blauw`. | **Shopify:** kleurfamilie aanvullen. De titel kan als voorstel dienen bij het nakijken. Niet in de front afleiden: "liever geen waarde dan een gegokte" (filtersysteem.md). |
| **P2** · R6-04 · bekend (R5-07), regel · Shopify-data | 28 vinylkaarten, waarvan 25 met een vlakke foto in de galerij. `/aanbiedingen`: 10 van de 12 | De kaart en de pagina beginnen met een kamer | "Een sfeerfoto komt nooit eerst, tenzij die kleur niets anders heeft" | Opnieuw bekeken: alle 28 tonen een kamer, bij 21 is de hover de vlakke vloer. De foto's hebben geen label (soort `overig`), dus de code kan ze niet rangschikken. Ongewijzigd sinds 03/11. | `r6-contact-vinyl-kamers.jpg`, `r6-desk-raster-aanbiedingen.jpg`, lijst in §3.1 | **Shopify:** label `sfeerfoto` op die kamerfoto's (het voorstel wacht volgens de overdracht van 03/11 op de klaarmelding van Alexander). Lost ook het staal en de hover van die kaarten op. |
| **P2** · R6-05 · nieuw (restant van R5-05) · Shopify-data, of code | 274 vinylproducten (Beauflor 212, Tarkett 53, Gerflor 9). Bv. `/product/vinyl-easytex-westbury-beauflor` | De beschrijving is een brief aan "Beste klanten," | Een beschrijving van het product, zonder aanhef | "Beste klanten, Heeft u graag dat uw vloerbekleding geplaatst wordt of vindt u niet de geschikte afmeting die u wenst? Neem contact met ons op via mail info@brunic.be". Bij 205 producten is dat de hele beschrijving. De tabel die er op 03/11 als lopende zin tussen stond, is weg. | `a3-log.txt` (AANHEF, ZELFDE BESCHRIJVING: 116 + 89 keer dezelfde tekst), `r6-desk-pdp-vinyl.jpg`. Reproductie: open de pagina, sectie Beschrijving. | **Shopify:** de aanhef uit de beschrijving halen en de alinea herschrijven ("Wenst u plaatsing of een andere afmeting? …"), of ze weglaten: de productpagina heeft al een blok "Hulp nodig bij uw keuze?". Raakt R6-54 (korte beschrijvingen): zonder die alinea blijft er bij 205 producten geen tekst over. |
| **P2** · R6-06 · nieuw · code | Zoeken. `/zoeken?q=vloerkleden`, `?q=gordijnstoffen`, `?q=tapijttegels` | Een type in het meervoud geeft niets | Meervoud vindt hetzelfde als enkelvoud | 0 producten, lege staat. Enkelvoud: 172, 574 en 56. "gordijnen" en "tapijt" werken wel, omdat de afdeling zo heet. | `tabel-zoeken.md` (#24, #26, #28), `p4-zoeken.json` | **Code** `lib/catalog/search.ts:14-18`: bij 0 treffers het zoekwoord ook zonder uitgang proberen (-en, -s), of de types in beide vormen in de zoektekst zetten. Raakt de telling van `/api/zoeken` (zelfde functie): mee testen. |
| **P2** · R6-67 · nieuw · code | Elke productpagina, grote foto en lightbox. Bv. `/product/behang-3d-golvende-lijnen-aubergine-paars-estahome` | De browser laadt een te klein beeldbestand, de foto is zacht | Een bestand dat minstens zo breed is als het kader | Desktop 1.366 px: kader 788 px, geladen bestand `?width=360`, dus 2,2 keer uitgerekt. In de lightbox 1.366 px breed met hetzelfde bestand van 360 px: 3,8 keer. Op 1.920 px: 540 px voor 1.246 px. Mobiel (390 px, scherm ×2): 540 px voor 780 px, 1,4 keer. Kaarten zijn in orde (0,6 tot 0,75). Gemeten op 3 producten × 3 schermen, overal hetzelfde. Dit verklaart "zacht op de productpagina" beter dan de bronfoto's: die zijn bij de meeste merken 1.500 px of breder. | `b4b-log.txt` (SCHERPTE), `r6-desk-lightbox-scherpte.jpg`, `r6-desk-pdp-scherpte.jpg`. Reproductie: open de pagina, klik op de eerste foto, bekijk in de ontwikkelaarstools welk bestand geladen is. | **Code** `components/product/gallery.tsx:48, 74, 150`: `ImageSlot` krijgt geen `sizes`, dus geldt de standaard "25vw" (`ui/image-slot.tsx:33`). Geef de grote foto ±`(min-width: 1024px) 60vw, 100vw`, de kleine `30vw`, de lightbox `100vw`. Raakt de laadtijd van de productpagina (groter bestand): na de aanpassing de LCP opnieuw meten (§4.13). |
| **P2** · R6-08 · bekend (R5-09) · Shopify-data | Toscana B592 (`vasttapijt-toscana-b592-desso`) | Rood op de kaart, blauw bij hover, voor dezelfde kleur | Elke kleur toont haar eigen foto | Kaart "729": de foto met alt-tekst 710 (rood). Hover en tweede foto: 729 (blauw). Kleur 710 heeft geen foto. | `r6-contact-diversen.jpg` #16–19, `r6-contact-koppeling.jpg` #29–30 | **Shopify:** variantfoto 710 → `…-a275158a63.jpg`, 729 → `…-caa208aed4.jpg`. |
| **P3** · R6-07 · nieuw · code | `/zoeken?q=vinyl` | De eerste tien resultaten zijn muurstickers | Vinylvloeren vooraan | 298 producten. De eerste tien: wanddecoratie van ESTAhome (materiaal vinyl). Het woord staat niet in de titel van de vloeren, en de volgorde bij gelijke score is "Aanbevolen". | `p4-zoeken.json` | **Code** `search.ts:48`: een treffer op het type zwaarder laten wegen dan een treffer op het materiaal. Raakt de volgorde van elke zoekopdracht: met de 55 vaste zoekopdrachten nakijken. |
| **P3** · R6-09 · nieuw, regel · Shopify-data | 104 producten: Boråstapeter 47, Louis De Poortere 36, Tarkett 20, ESTAhome 1 | "je", "jouw" in de beschrijving | nl-BE in de u-vorm | "Hang het in je woonkamer, eetkamer of keuken", "op maat gemaakt voor jouw muur", "vooruitgang die je kunt nagaan". Alle zinnen gelezen. Op de vaste pagina's: 0. | `a3-log.txt` (JE/JIJ) | **Shopify:** beschrijvingen herschrijven in de u-vorm. Bij Louis De Poortere samen met R6-32. |
| **P3** · R6-10 · bekend (R5-10), regel · Shopify-data | Goodnight (`gordijnstof-goodnight-artelux`) | "Deze stof heeft een korte levertijd" | Geen levertermijn op de site | Zichtbaar in de beschrijving en in de `description` van de structured data. | `b6-log.txt`, `pdp.json` | **Shopify:** de zin weghalen. Al gevraagd (vraag 7), nog geen antwoord. |
| **P3** · R6-11 · bekend (R5-11), regel · Shopify-data of code | Soft Sense II AC27, Asteranne A411, Paradiso AB69 | Niet vindbaar op "Desso" | Zoeken op Desso blijft werken | `/zoeken?q=desso`: 97 producten. Deze drie hebben `-desso` in de slug maar de vendor staat al op Tarkett. | `p6-log.txt` | **Shopify:** vendor terug op Desso. Of **code** `shopify-adapter.ts:396`: ook de slug `-desso` als bron nemen. |
| **P3** · R6-12 · bekend (R5-12) · code | Lade, een gekozen waarde met aantal 0 uitvinken. `/catalogus/tapijten?weergave=producten&kleur=roze&vorm=loper` | De focus valt weg | "Verdwijnt het element met de focus, dan gaat de focus naar…" | Na de spatiebalk op "Loper (0 producten)": `activeElement` = `BODY`, de lade blijft open. Desktop en mobiel. | `b1c-log.txt`, `b1-mob-log.txt`, `r6-desk-lade-focus-na-uitvinken.jpg` | **Code** `product-listing.tsx` (`DrawerGroup`, :444): na het verdwijnen de focus op de `summary` van de groep zetten. |
| **P3** · R6-13 · bekend (R5-14) · code | `/product/behang-olivtr-d-borastapeter` | 404 op de oude URL van een hernoemd product | Een hernoemd product blijft bereikbaar | 404. Het product staat nu op `/product/behang-olivtrad-borastapeter`. De vier andere oude URL's uit het rapport van 03/11 kon ik niet letterlijk terugvinden. Ik heb ze nagebouwd (`behang-noras-ng-…`, `…-skogsstj-rna-…`, `…-sol-ngen-…`, `…-tr-dg-rdsfr-jd-…`): ook 404, maar dat bewijst niet dat het de juiste oude adressen zijn. | `p6-log.txt` | **Code** `next.config.ts`: de vijf redirects, vóór de livegang. |
| **P3** · R6-14 · bekend (R5-15) · code | `/catalogus/tapijten?weergave=producten&kleur=Multicolor` | Oud label geeft een lege lijst | "Oude links met labels werken nog" | 0 producten, chip "Kleur: multicolor". `kleur=Grijs` en `merk=Boråstapeter` werken wel. | `p6-log.txt`, `b1-desk-log.txt` | **Code** `filters.ts:397-411` (`parseListState`): de kleursynoniemen van de normalisatie ook hier toepassen. |
| **P3** · R6-15 · bekend (R5-16) · code | `…&beschikbaarheid=op-voorraad&eenheid=per-stuk&kleur=grijs` | Vervallen parameters blijven in de URL | "worden uit de URL gehaald" | Resultaat correct (101), URL ongewijzigd tot de volgende klik. | `b1-desk-log.txt`, `b1-mob-log.txt` | `router.replace` bij het laden, of de zin in de specificatie aanpassen. |
| **P3** · R6-16 · bekend (R5-17) · code | Lijst met één resultaat, bv. `/zoeken?q=Myrten` | "U hebt 1 van 1 producten bekeken" | Enkelvoud | Staat er zo. De kop erboven zegt correct "1 product gevonden". | `p6-log.txt` | **Code** `product-listing.tsx:376`. |
| **P3** · R6-17 · bekend (R5-18) · code | `/zoeken?q=bloemen&categorie=behang` | Zoekkop en lijst tonen een ander aantal | Eén aantal | Kop "382 producten en 1 categorie gevonden", lijst "333 producten". | `p6-log.txt` | **Code** `zoeken/page.tsx:42`: het aantal van de lijst tonen als er een filter actief is. |
| **P3** · R6-18 · bekend (R5-19) · code | 1.908 behangen per rol | "Totaal voor 1 rollen" | "1 rol" | "Totaal voor 1 rollen: € 51,95". | `b6-log.txt` | **Code** `product-view.tsx:257`: `one` bij aantal 1. |
| **P3** · R6-19 · bekend (R5-20) · Shopify-data of code | Alle 136 tapijten van Lalee en Ragolle, 1.089 varianten | "Art.nr." is een Shopify-ID | Artikelnummer, of geen regel | "Art.nr. 59355001913676" op de productpagina, de verlanglijst en (in de code gelezen) de winkelmand. | `b6-log.txt`, `r6-mob-verlanglijst.jpg` | **Shopify:** SKU's (vraag 10, nog geen antwoord). **Code** `shopify-adapter.ts:343`: zonder SKU geen terugval op het ID, en `product-view.tsx:304`, `cart-view.tsx:155` tonen de regel dan niet. |
| **P3** · R6-21 · bekend (R5-23) · code | Lightbox op mobiel | Vegen werkt niet | Vegen zoals in de galerij | De teller blijft op "1 / 7" na een veeg. De knoppen werken (→ "2 / 7"). In de galerij zelf werkt vegen. Geëmuleerd. | `b6-log.txt`, `r6-mob-lightbox.jpg` | **Code** `gallery.tsx:101-160`: geen touch-afhandeling in de lightbox. |
| **P3** · R6-22 · bekend (R5-24) · code | 13 vinylproducten, bv. Barinas Inspire Modena | Twee keer "Kleur:" in de kenmerken | Eén regel | Kenmerk "Kleur: Zwart / Wit" en optie "Kleur: 901D". | `b6-log.txt` (dubbel kenmerk) | **Code** `product-info.tsx:60`: het kenmerk van de leverancier "Kleuromschrijving" noemen, of samenvoegen. Raakt R6-01: de kleur uit dat kenmerk kan een voorstel zijn voor de kleurfamilie. |
| **P3** · R6-23 · bekend (R5-25) · code of Shopify-data | Prime Zelfklevend 1m² (`vinyl-prime-zelfklevend-1m2-gerflor`) | 3 dessins, geen stalen op de kaart | Kleurkeuze op de kaart | De optie heet "Dessin". De kaart telt enkel een optie "Kleur" (`view.ts:166`), de adapter ook "Dessin" (`shopify-adapter.ts:254`). | `p7` (swatchTotal 0) | Eén definitie van de kleuroptie, of de optie in Shopify "Kleur" noemen. |
| **P3** · R6-24 · bekend (R5-26) · Shopify-data | 45 van de 66 Loft79-titels | Kleine letters: abbey, bolton, davon | Hoofdletter | Ongewijzigd. | `a3-log.txt` | **Shopify:** titels. |
| **P3** · R6-25 · bekend (R5-27), uitgebreid · inhoud | `/catalogus/behang`, home, `/catalogus/vloerbekleding`, `/catalogus/tapijten` | De intro noemt niet wat er staat | Merken en types uit de catalogus | Behang: "van Arte en Boråstapeter … Flamant en Missoni Home". Arte heeft 0 producten, ESTAhome (1.600) en Origin (591) ontbreken. Home: tegel "Arte en Boråstapeter". **Nieuw:** Vloerbekleding spreekt enkel over vasttapijt, niet over vinyl (277 van de 582). Tapijten noemt Lalee en Ragolle niet. | `p5-links.json`, tabel in §4.7 | **Inhoud:** het metaobject `categorie_inhoud` in Shopify aanpassen (dat gaat voor op de standaardtekst, `lib/inhoud/categorie.ts:31`). De code heeft voor Behang al de juiste tekst. Voor Vloerbekleding en Tapijten ook `categorie-teksten.ts` nakijken. Al gevraagd welke merken Brunic wil zien (vraag 11). |
| **P3** · R6-26 · nieuw, regel · code | `/inspiratie-en-advies/behang-kleine-ruimte`, `/fotobehang-panoramisch`, `/warme-tinten` | Opmeting aan huis bij behang | Een dienst enkel beloven waar Brunic die levert (`maatwerk.ts`: behang niet) | Elk artikel eindigt met "Kom langs in onze winkel of vraag een opmeting aan huis aan." en de knop "Opmeting aanvragen", ook de artikels over behang. | `p5-links.json` | **Code** `inspiratie-en-advies/[slug]/page.tsx:96-102`: het slot per afdeling kiezen, zoals op de productpagina. Samen met vraag 6 aan Brunic. |
| **P3** · R6-27 · nieuw · code | Mobiel tot 360 px breed, lade "Filters" | De knop "Toon N producten" loopt van het scherm | Volledig zichtbaar | Rechterrand van de knop op 368 px. Bij 360 px vallen 8 px weg, bij 320 px staat er "Toon 226 produc". Vanaf 390 px in orde. | `r6-breedte-360x740-lijst-lade.jpg`, `r6-breedte-320x568-lijst-lade.jpg`, `b2-log.txt` | **Code** `product-listing.tsx:402-409`: de knoppen laten krimpen (`min-w-0`, kleinere marge) of onder elkaar zetten onder 380 px. |
| **P3** · R6-28 · nieuw · Shopify-data | 9 Boråstapeter-producten (bv. Krusenberg, White Linen, Stone Grey), 1 Beauflor (Feelings Sweet Oak) | Rare tekens in de beschrijving | Zuivere tekst | "om een ??mooie, elegante levendigheid toe te voegen". Beauflor: een los aanhalingsteken na het e-mailadres. | `a7` (rare tekens) | **Shopify:** de tekens weghalen. |
| **P3** · R6-71 · nieuw · Shopify-data | 46 Boråstapeter-behangen, bv. `/product/behang-inga-borastapeter`, `/product/behang-tessin-borastapeter` | De beschrijving is één zin die op een dubbelepunt eindigt | Een volledige tekst, of geen | "Dit Zweedse behang onderscheidt zich met kwalitatieve eigenschappen:" en daarna niets. Zo staat het ook in Shopify (`<p>…eigenschappen:</p>`): de opsomming die erop hoort te volgen, is nooit meegekomen. Het heeft dus niets te maken met het weghalen van de tabellen op 03/11: dat heb ik nagekeken in de ruwe data. | `a14-beschrijvingen.txt`, telling op alle producten, ruwe `descriptionHtml` | **Shopify:** de zin aanvullen of schrappen. Raakt R6-54: zonder die zin blijft er geen beschrijving over. |
| **P3** · R6-29 · bekend (TODO B14) · Shopify-data | `/product/fotobehang-op-maat-rose-magnifique-kopie-borastapeter` | "Rose Magnifique (kopie)" staat online | Geen werkkopieën in de winkel | Titel, slug en drie bestandsnamen dragen "(kopie)". | `r6-contact-diversen.jpg` #20–23 | **Shopify:** offline halen. |
| **P3** · R6-69 · nieuw · code | Mobiel, zwarte band bovenaan | De boodschap is afgekapt | De hele zin, of een kortere | "Gordijnen op maat uit eigen atelier — gratis opmetin…" op 390 px, "gratis opm…" op 360 px. | `r6-mob-390-na-filter-bovenaan.jpg`, `r6-mob-360-na-filter-bovenaan.jpg` | **Code** `site-header.tsx`: op mobiel een kortere tekst ("Gratis opmeting aan huis"). Hangt af van vraag 6. |

### 2.2 Te verifiëren

| Prioriteit | Pagina/product/variant | Probleem | Verwacht gedrag | Vastgesteld gedrag | Bewijs en reproductiestappen | Voorgestelde oplossing |
|---|---|---|---|---|---|---|
| **P1** · R6-30 · bekend (R5-28) · navragen bij Brunic | Senso Wallstreet Light Urban 2,22m² en Senso Premium Grey Marble (Gerflor) | Doosprijs lijkt als prijs per m² te staan | Prijs en eenheid horen bij elkaar | Wallstreet: "€ 55,48 / m²", "Min. 1 m², per 1 m²", "!ENKEL VERKOCHT PER DOOS!", 2,22 m² per doos (dat zou € 24,99 per m² zijn). Premium: "€ 48,90 / m²", doos van 2,04 m². De andere vinyl kost € 10,99 tot € 26,50. **Enkel in de code gelezen:** de kassa krijgt enkel variant en aantal, geen eenheid (`api/kassa/route.ts:85-90`). Wie "3 m²" kiest, rekent 3 × € 55,48 af. | `b6-log.txt`, `r6-desk-pdp-senso-wallstreet.jpg`, `a4-log.txt` | Al gevraagd (vraag 1), **nog geen antwoord**. Tot dan: overwegen deze twee producten op aanvraag te zetten. Dat raakt de 12 aanbiedingen (Senso Premium is er één van). |
| **P2** · R6-31 · bekend (R5-29) · navragen | 245 vinylproducten met kenmerk "Garantie" | Garantietermijn zonder bevestiging | Enkel wat Brunic bevestigt | "5 jaar" 78, "10 jaar residentieel" 60, "7 jaar" 46, "7 jaar residentieel" 22, "8 jaar" 12, "10 jaar" 12, "15 Jaar" 9, "15 jaar residentieel" 4, "3 jaar" 1, "20 Jaar" 1. Uit de beschrijving is de garantie verdwenen (was 248). | `a3-log.txt` | Al gevraagd (vraag 4). Mag het niet: `IS_LEVERBELOFTE` uitbreiden (`shopify-adapter.ts:145`). |
| **P2** · R6-32 · bekend (R5-30) · navragen, daarna Shopify-data | Alle 36 Louis De Poortere-tapijten. Losse zinnen bij Boråstapeter (22), Tarkett-tapijt (26), Balsan (4) | Tekst in de stem van de fabrikant, met beloftes | Geen dienst beloven die Brunic niet bevestigt | "geproduceerd in onze eigen fabriek in België en rechtstreeks bij u thuis geleverd, met snelle levering in heel Europa", "Wij halen het gratis op", "ons Take Care-programma", "ons eigen R&D-team". Boråstapeter: "Wij hebben de eer gekregen…". Tarkett: "onze Circular Selection". | `a3-log.txt` (STEM, wij/ons per merk) | Al gevraagd (vraag 5). Herschrijven in de derde persoon, in de u-vorm (R6-09). |
| **P2** · R6-33 · bekend (R5-31) · navragen | Prime Zelfklevend 1m² (2 foto's), Kindervinyl Trude (1 foto) | Bestandsnaam wijst op Amazon en Facebook | Beeldrechten in orde | Ongewijzigd. | §3.6 | Al gevraagd (vraag 8). |
| **P2** · R6-34 · nieuw · navragen | Mehari 0098 en Rampur 0098 (Ragolle) | Zelfde tapijt onder twee namen, met een andere prijs | Eén product, één prijs | 20 van de 20 foto's gelijk, zelfde kleuren (6727, 6747, 9332), zelfde kenmerken. Mehari: 80 × 150 cm € 79, Rampur: € 89. 120 × 170 cm: € 129 en € 149. 133 × 195 cm: € 159 en € 189. Vanaf 160 × 230 cm gelijk. | `r6-contact-gelijk-bestand-producten.jpg` #53–56, `a9b.json` | Navragen (§7, nieuwe vraag A). Is het hetzelfde tapijt: één product houden. Zijn het twee kwaliteiten: de juiste foto's koppelen. |
| **P2** · R6-36 · bekend (R5-32) · proces | Shopify → site | Komen wijzigingen vanzelf op de site? | Filtersysteem: "bij elke Shopify-wijziging herbouwd (webhook)" | De momentopname is negen dagen oud (03/11 22:31 UTC) en de kaarten zijn gelijk aan die van 03/11. De overdracht van 03/11 zegt "de webhooks staan nog niet aan". Of er intussen iets in Shopify gewijzigd is, kan ik niet zien. | `/api/status`, `a8-vergelijk-r5.json` | Iemand met toegang tot Shopify en Vercel kijkt het na. Daarna `filtersysteem.md:35` of de overdracht rechtzetten. |
| **P2** · R6-45 · bekend (R5-33) · navragen | 305 producten in Vloerbekleding, 36 Louis De Poortere, 495 Boråstapeter, 592 stoffen | Geen prijs | Wat Brunic beslist | Ongewijzigd: 1.428 producten op aanvraag. | §4.5 | Al gevraagd (vraag 2). |
| **P3** · R6-35 · nieuw · navragen, daarna Shopify-data | 14 groepen van samen 34 producten met dezelfde foto's en hetzelfde kaartbeeld. Twee producten met twee kleuren op dezelfde foto's (Liski DAM 213, Rampur 0500). Eén foto bij twee Tarkett-vloeren (Iconik 260 Rock en Tendenza) | Twee producten of kleuren zien er identiek uit | De klant ziet het verschil, of er is er maar één | Associated Weavers: 11 groepen, 28 producten (bv. Liris, Orinoco, Verdant, Lustre, Parana, Rubico, Rio Grande: zeven kaarten met hetzelfde beeld). Lalee: Laos PMO 901 en 902. ESTAhome: 2 paren. Niet meegeteld, want daar zegt de naam het verschil: 13 groepen van Beauflor, Lano en Balsan (zelfde dessin in twee kwaliteiten). | §3.3, §4.9, `r6-contact-gelijk-bestand-*.jpg` | Navragen (§7, vraag B). Voor Associated Weavers: het verschil (gewicht, poolhoogte) op de kaart tonen. |
| **P3** · R6-20 · bekend (R5-22), nu te verifiëren · code | Mobiel, kaart met stalen, bv. Blacktex Columbian Oak op `/catalogus/vloerbekleding/vinyl` | Kleverige hover op touch | Staal uit → de eerste foto | Niet eenduidig in de emulatie. Staal van de kleur die de kaart al toont aan en weer uit: in 7 van de 7 lijsten blijft het hoverbeeld staan (bv. de kamer `…_rsh_01.jpg` in plaats van `…_psh.jpg`). Staal van een andere kleur aan en uit, na een bezoek aan de productpagina: 7 van de 7 keer komt de eerste foto terug. Op 03/11 stond dit als bevestigde fout. Touch-emulatie bootst hover niet betrouwbaar na, dus ik noem het geen bevestigde fout meer. | `b3-mob-log.txt`, `b3c-log.txt`, `r6-mob-staal-uit.jpg` | Op een echt toestel nakijken (§8, stap 1). Blijkt het zo: **code** `product-card.tsx:34-35`, hover enkel bij `pointerType === "mouse"`. |
| **P3** · R6-37 · bekend (R5-34) · navragen | 9 Boråstapeter-producten uit Nordic Folk | "Leverbaar tot (volgens leverancier): 12/26" | Geen levertermijn | Zichtbaar als kenmerk. Het is een einddatum, en die ligt over ruim een maand. | `b6-log.txt` | Al gevraagd (vraag 7). Mag het weg: het label toevoegen aan `IS_LEVERBELOFTE`. |
| **P3** · R6-38 · bekend (R5-35) · navragen | Vaste pagina's | Servicebeloftes | Enkel wat Brunic bevestigt | "Gratis opmeting" (39 zinnen op 21 pagina's, en de band op elke pagina), "binnen 1 à 2 werkdagen" (9 pagina's), "eigen atelier", "al 40 jaar", "sinds 1992". | `a6-log.txt` | Al gevraagd (vraag 6). |
| **P3** · R6-39 · nieuw · inhoud | `/info/over-ons`, `/info/veelgestelde-vragen` | De tekst noemt afdelingen zonder producten | Wat de winkel online toont, of duidelijk "in de winkel" | "gordijnen en stoffen, raamdecoratie, behang, vasttapijt, tapijten, verf en slaapcomfort". Raamdecoratie, Verf en Slapen & wonen hebben geen producten en geven 404. Er is wel een dienstpagina "Raamdecoratie op maat". | `p5-links.json` | Navragen of dit klopt voor de winkel (§7, vraag C). Zo ja: laten staan, het gaat over de winkel. |
| **P3** · R6-40 · bekend (R5-39) · navragen | Noras ang, Skogsstjarna, Solangen, Tradgardsfrojd, Poeme d'amour | Lijken Zweedse of Franse tekens te missen | Zelfde lijn als Olivträd | Ongewijzigd. | §4.10 | Al gevraagd (vraag 12). |
| **P3** · R6-41 · bekend (R5-38) · navragen | Mehari 0474, Rampur 0600 | Prijzen die uit de toon vallen | Correcte prijzen | Mehari 0474: Rond Ø 200 cm € 80, 120 × 170 cm € 129. Rampur 0600: Rond Ø 120 cm € 86,99. **Nieuw:** Rond Ø 160 cm kost naargelang de kleur € 159,60, € 159 of € 179. | `a4-log.txt`, `a7` | Al gevraagd (vraag 3). De drie prijzen voor Ø 160 cm erbij vermelden. |
| **P3** · R6-42 · bekend (R5-42) · Shopify-data | 14 andere producten met een foto aan een andere kleur, 7 kleuren zonder foto | Elke kleur toont haar eigen foto | Eigen foto, of geen | Ongewijzigd. Bekeken op het contactblad: bij Largo en Moonglaze verschilt de tint zichtbaar. | §3.2, `r6-contact-koppeling.jpg` | **Shopify:** koppelingen nakijken. Ontbrekende foto's: vraag 9. |
| **P3** · R6-43 · bekend (R5-36) · Shopify-data | 11 Ragolle-kaarten | Eerste beeld is een schuine, liggende opname | Recht en volledig, zoals de andere tapijten | Bekeken: bij 10 van de 11 is het tweede beeld recht en volledig. Ravenna 0174 heeft geen ander. | §3.4, `r6-contact-ragolle-eerste.jpg` | Het eerste beeld als `detailfoto` labelen, dan schuift het tweede naar voren. Raakt de kaart, het staal en de productpagina tegelijk (zelfde volgorde). |
| **P3** · R6-44 · bekend (R5-37, R5-40, R5-41) · navragen | Lalee (80 van de 84 eerste beelden smaller dan 800 px), Boråstapeter (337 van de 495), Samira 38743, ESTAhome en Origin | Bronfoto's klein, bijna wit, of met het merkteken van de leverancier | Scherp en neutraal | Ongewijzigd. "esta home.nl" staat midden op het dessin van bv. "Behang vogels zacht roze". Los R6-67 eerst op: dan pas is te zien welke bronfoto's echt te klein zijn. | §4.9, `r6-contact-paren.jpg` #3, `r6-contact-diversen.jpg` #1 | Al gevraagd (vraag 9). |

### 2.3 Verbeterpunten

| Prioriteit | Pagina/product/variant | Probleem | Verwacht gedrag | Vastgesteld gedrag | Bewijs en reproductiestappen | Voorgestelde oplossing |
|---|---|---|---|---|---|---|
| **P2** · R6-65 · nieuw · code, specificatie | Mobiel, "Alle producten" van een afdeling, filter gekozen bovenaan de pagina | Na "Toon N producten" staat er geen enkele kaart in beeld | De klant ziet het resultaat na elke actie | 390 × 844: de teller en de chip staan onderaan in beeld, de eerste kaart begint op 842 van de 844 px. 360 × 740: de teller staat op 800 px en de eerste kaart op 850 px, dus onder de rand (gemeten, de filterklik zelf is in die run niet bevestigd). De code volgt de specificatie: "Staat het begin al in beeld, dan blijft de pagina staan." Vanaf een gescrolde positie werkt het wel goed. | `r6-mob-390-na-filter-bovenaan.jpg`, `b4b-log.txt`, `b1-mob-log.txt` (stap 34) | **Specificatie en code:** "in beeld" strenger maken: de pagina blijft enkel staan als ook de eerste rij kaarten zichtbaar is. Anders naar het begin van de lijst. Niet met `scroll-padding-top` op `html` (overdracht scrollgedrag: "Niet doen"). Eerst onderzoeken op desktop: daar staat het begin van de lijst bij het laden ook laag (663 px). |
| **P3** · R6-46 · bekend (R5-48) · code | `og:image` en structured data | Niet het eerste beeld op de pagina | Zelfde beeld | 71 van de 664 pagina's (andere kleur dan de pagina toont). | `pdp-analyse.json`. `seo.ts:176`, `product/[slug]/page.tsx` | De beelden van de standaardvariant gebruiken (`imagesForVariant`). |
| **P3** · R6-47 · bekend (R5-49) · code | Broncode van elke productpagina | `availability: "op-voorraad"` in de pagina-data | Geen belofte die een machine kan lezen | Op alle 664 pagina's. Niet zichtbaar, geen schema.org. | `pdp.json`. `shopify-adapter.ts:346` | De waarde hernoemen ("beschikbaar"). Raakt elke plek die op `"op-voorraad"` test (`view.ts:81`, de API): samen aanpassen. |
| **P3** · R6-48 · bekend (R5-55) · code | 36 Louis De Poortere-tapijten op aanvraag | "de prijs hangt af van uw maten en afwerking" | Tekst die past bij vaste maten | Het zijn vaste maten (100 × 140 cm …). | `b6-log.txt`. `product-view.tsx:235` | Aparte tekst voor vaste maten. Hangt af van vraag 2. |
| **P3** · R6-49 · bekend (R5-56) · Shopify-data of code | Kenmerken op de productpagina | Schrijfwijze per leverancier, deels Engels, deels hoofdletters | nl-BE, één schrijfwijze | Zie §4.4. Ook: "Stijl: overig" of "Motief: overig" staat zichtbaar bij 102 producten, terwijl de filter die waarde terecht weglaat. | `a3-log.txt` | Woordenlijst in de normalisatie of in de pipeline. |
| **P3** · R6-50 · bekend (R5-52) · code | `/catalogus/behang` | Babybehang en Jeugdbehang meisjes: zelfde tegelbeeld | Eigen beeld | `behang-strepen-terracotta-roze-en-wit-estahome-ff93f86226.jpg`, twee keer. | `p7` | **Code** `lib/catalog/imagery.ts`: een beeld dat al gebruikt is, overslaan. |
| **P3** · R6-51 · bekend (R5-57) · Shopify-data | 69 titels gedeeld door 150 producten binnen één merk | Zelfde naam op verschillende kaarten | Onderscheidbare namen | Ongewijzigd. Bv. "Muursticker bosdieren bruin" (5 keer), "Krijtbord magneetbehang zwart" (2 keer, ook dezelfde foto's). | `a3-log.txt` | **Shopify:** de collectie in de titel, zoals al bij een deel gebeurd is ("… – Brooklyn Bridge"). |
| **P3** · R6-52 · nieuw · code | Zoeken, lege staat | Geen hulp bij een tikfout, geen weg naar de diensten | Een suggestie of een verwijzing | "vloerkled", "Rampor" en "behnag" geven 0 producten en zeven vaste suggesties. "opmeting" geeft 0 producten zonder link naar `/op-maat-en-plaatsing/opmeting-aan-huis`. | `tabel-zoeken.md` (#33–35, #54) | **Code** `zoeken/page.tsx`: bij 0 treffers ook de dienst- en infopagina's doorzoeken op titel. Tikfouten: onderzoeken, hoort bij de zoekindex die `architectuur.md` voorziet. |
| **P3** · R6-53 · nieuw · code | `/catalogus/behang?weergave=producten`, `/catalogus/vloerbekleding?weergave=producten` | De eerste pagina toont enkel producten op aanvraag | Ook wat online te koop is | Behang: de eerste 48 kaarten zijn allemaal Boråstapeter op aanvraag, terwijl 82% van het behang een prijs heeft. Vloerbekleding: 48 keer vasttapijt op aanvraag, vinyl (277, met prijs) komt later. "Aanbevolen" rekent met het aantal foto's en varianten (`shopify-adapter.ts:415`). | `a7` (eerste 48) | De sortering laten afwisselen per merk of type, of producten met een prijs een duwtje geven. Raakt de volgorde van elke lijst en van de zoekresultaten (R6-07): eerst op een kopie nakijken. Ontwerpkeuze voor Brunic. |
| **P3** · R6-54 · nieuw · inhoud | 1.011 producten met een beschrijving korter dan 100 tekens | Bijna geen tekst | Een beschrijving die iets zegt | "Gordijnstof Acer van Artelux. Verkrijgbaar in 13 kleuren." ADO 437, Boråstapeter 262, Associated Weavers 126, Artelux 72, Loft79 65, Lano 43. Daarnaast herhaalt de beschrijving van 2.228 behangen (ESTAhome, Origin, Walls4You, Sanders) enkel de kenmerken als opsomming. | `a3-log.txt`, `a14-beschrijvingen.txt` | Leveranciersteksten aanvullen in de pipeline. Niet zelf verzinnen. |
| **P3** · R6-55 · bekend (R5-44) · code | Lijsten na een keuze, bv. Passement: Merk "ADO (18)" | Filter met één waarde die alles dekt | "Een filter verschijnt alleen als hij de lijst kan verkleinen" | 1.785 keer in 1.253 lijsten (Type 578, Materiaal 363, Merk 314, Prijs 170). | `p3-fouten.json` (eenWaarde) | **Code** `filters.ts` (`facetGroups`): de regel ook op de gefilterde lijst toepassen. Gekozen groepen blijven staan. |
| **P3** · R6-56 · bekend (R5-45) · code of Shopify-data | 25 kaarten: Artelux 18, Loft79 7 | Hover is een smalle strook met maatlijnen | Hover = interieur, anders blijft de foto staan | Ongewijzigd (zelfde beelden). Eén voorbeeld opnieuw bekeken (Hazelaar). | §3.5, `r6-contact-paren.jpg` #30 | Die foto's een eigen label geven in Shopify, of ze overslaan als hover (`product.ts:103-112`). |
| **P3** · R6-57 · bekend (R5-46) · code | Kaarten met hover | Het hoverbeeld laadt pas bij de hover | Direct wisselen | Mediaan 734 ms, hoogste 1.132 ms (102 kaarten). Geen leeg kader, de kaart verspringt niet. Op 03/11: 509 ms. Het verschil kan aan de testmachine liggen (twee tests liepen tegelijk). | `b3-desk-vol-log.txt` | Het hoverbeeld vooraf laden zodra de muis boven de lijst komt. |
| **P3** · R6-58 · bekend (R5-47) · code | Gedeelde link met `?variant=` | Eerst de standaardkleur, dan de gevraagde | Meteen de gevraagde kleur | Papercut, Sea Spray: eerst `…9b0a90fcd4.webp` (zichtbaar op 387 ms), dan `…8c2e4cbf3f.webp` (1.306 ms). | `b6-log.txt`. `product-view.tsx:83-86` | De variant op de server lezen (`searchParams` van de pagina). Let op TODO B02: de pagina moet in de server-HTML blijven. |
| **P3** · R6-59 · bekend (R5-50), uitgebreid · code | Alle invoervelden | 14 px | Minstens 16 px op mobiel, anders zoomt iOS in bij het aantikken | Zoekveld in de header, "Zoek in motief" in de lade, de nieuwsbrief en alle velden van de formulieren (voornaam, e-mail, telefoon …): 14 px. De keuzelijsten: 15 px. Niet getest op een echte iPhone. | `b4-log.txt` (velden) | Lettergrootte 16 px op mobiel voor `input`, `select` en `textarea`. |
| **P3** · R6-60 · bekend (R5-51) · code | Elke pagina | Consolewaarschuwing "preloaded but not used" voor de merklogo's | Geen waarschuwingen | Enige consolemelding in alle tests. | `b1-desk-log.txt` | De preload van de logo's weghalen. |
| **P3** · R6-61 · bekend (R5-53) · code | Filterpaneel op desktop | Tab uit het paneel: het blijft open | Paneel sluit als de focus weggaat | Na 17 keer Tab staat de focus op de volgende knop en staat het paneel Kleur nog open. | `b1-desk-log.txt` (stap 27) | **Code** `FacetDropdown`: sluiten op `focusout`. |
| **P3** · R6-62 · bekend (R5-54) · code | 2.693 producten, bv. "Kleur: paars (1)", "Breedte: 4 m (1)" | Optieknop met één waarde opent een lade met één keuze | Enkel tekst | Ongewijzigd. | `b6-log.txt`. `product-view.tsx:207-221` | Bij één waarde geen knop maar een regel tekst. |
| **P3** · R6-63 · bekend (R5-58) · proces | `docs/filtersysteem.md`, de opdracht, `TODO.md` | Documentatie loopt achter | Klopt met de site | Zie §9. | – | Bijwerken. |
| **P3** · R6-64 · bekend (R5-59) · Shopify-data | Behang, filters Motief (53 waarden) en Stijl (27) | Waarden overlappen | Eén plek per begrip | Ongewijzigd: "Auto" naast "Auto & vliegtuig", "Vintage" en "Jungle" in beide filters. | `p1-lijsten.json` | Opschonen in de pipeline. |
| **P3** · R6-66 · nieuw · code | Desktop, filterpaneel geopend bovenaan de pagina, scherm tot 800 px hoog | "Klaar" valt onder de rand | Het open paneel staat volledig in beeld | Het paneel loopt van 729 tot 914 px, "Klaar" tot 902 px. Bij 768 of 800 px hoog valt het onderste deel weg. Het muiswiel boven het paneel scrolt de pagina bewust niet, dus de klant moet eerst de muis ernaast zetten. | `b2-log.txt` (PANEEL) | Bij het openen het paneel in beeld brengen als het er niet in past. Niet met `scroll-padding-top` op `html`. |
| **P3** · R6-68 · bekend (TODO B20) · code | Toegankelijkheid, meetbaar | Kleine tikdoelen, koppen, dubbele landmarks | WCAG 2.2 AA | "+N" op de kaart: 23 tot 31 × 17 px. Kruimelpad: 21 px hoog. Lijsten en zoeken: h1 → h3 zonder h2. De footer heeft vier `nav`-landmarks dubbel. | `b4-log.txt`, `b4b-log.txt` | Zie TODO B20. |
| **P3** · R6-70 · nieuw · code | Home en lijsten op mobiel (trage 4G, processor ×4) | Trage eerste weergave op home, veel verzoeken op de lijsten | Snel beeld, geen overbodige verzoeken | Home: LCP 7,2 s. De hero-foto (220 kB) deelt de lijn met 5 lettertypes, 8 vooraf geladen merklogo's en twee andere grote beelden. Lijst: 246 verzoeken zonder te scrollen, waarvan 168 stalen van 96 px (850 kB) voor alle 48 kaarten, terwijl er 8 in beeld staan. CLS overal 0 tot 0,012. Eerste meting met deze methode: geen vergelijking met 03/11. | `b5-log.txt`, `b5b-log.txt`, §4.13 | De stalen pas laden als de kaart in beeld komt (nu een CSS-achtergrond: die laadt altijd). De preload van de merklogo's weghalen (R6-60). Raakt: het staal moet zijn vaste maat houden, anders verspringt de kaart. |

### 2.4 Bekend en bewust, niet als bevinding geteld

- **Rolbreedte is een productfilter, geen variantfilter** (bekend, filtersysteem.md).
- **Prijsklassen mengen eenheden** (bekend, filtersysteem.md): behang per rol naast fotobehang per stuk.
- **Hoverbeeld ontbreekt als de sfeerfoto aan geen kleur hangt** (bekend, filtersysteem.md).
- **Kaart "vanaf € 49", productpagina "€ 79"** (Rampur 0600): de kaart toont de laagste prijs van het hele product, de pagina de prijs van de standaardvariant. Zo staat het in de specificatie (§Toonvariant).
- **Vinyl per m² met een keuze Breedte, enkel hele m²** (bekend, TODO B18).
- **"Verkoopeenheid: Per stuk" als terugval** bij tapijttegels, lopers, passement en fotobehang op maat (bekend, TODO B08).
- **PageDown op een lijst slaat ±99 px over** (bekend, overdracht scrollgedrag, open punt): opnieuw gemeten, 99 px.
- **"De actie loopt zolang de voorraad strekt"** op `/aanbiedingen`: actievoorwaarde, toegelaten.
- **"Desso en Tarkett" in teksten en "desso" in slugs:** bewust.
- **`noindex` en `Disallow: /`:** bewust tot de livegang (`SITE_INDEXEREN`). Stand op 12/11: `noindex, nofollow` op alle pagina's, `Disallow: /` in `robots.txt`.

---

## 3. Fotoproblemen per product

Alle URL's beginnen met `https://cdn.shopify.com/s/files/1/1072/8662/6636/files/`, hieronder `…/`. Screenshots staan in `screenshots/`. Het nummer achter een contactblad (`#5`) is het nummer op dat blad. De legenda van elk blad (nummer → product → URL) staat in `%TEMP%\brunic-qa\r6\ruw\legenda.json`.

**De kaarten van alle 4.070 producten zijn gelijk aan die van 03/11** (beeld, hover, stalen, prijs: 0 verschillen met `r5/prod-api.json`). De oordelen van toen gaan dus over dezelfde beelden. Ik heb ze opnieuw bekeken op de contactbladen `r6-contact-*.jpg`, niet alleen overgenomen.

### 3.1 Kaart begint met een kamer (R6-04)

Zelf bekeken op `r6-contact-vinyl-kamers.jpg` (kaart en hover naast elkaar): alle 28 kaarten tonen een kamer. Bij 21 daarvan is het hoverbeeld de vlakke vloer, dus net omgekeerd. De andere 68 vinylkaarten met een ongelabelde eerste foto tonen een vlakke vloer (`r6-contact-vinyl-overig-1.jpg`, `-2.jpg`).

| Product (titel + slug) | Variant/kleur | Pagina-URL | Standaardbeeld-URL | Hoverbeeld-URL | Screenshot | Oordeel | Voorstel |
|---|---|---|---|---|---|---|---|
| Bacopa Moonlight Cobble (`vinyl-bacopa-moonlight-cobble-beauflor`) | enige | /product/vinyl-bacopa-moonlight-cobble-beauflor | …/1715036976.jpg | …/1715060007.jpg | r6-contact-vinyl-kamers.jpg #1 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Bacopa Moonlight Daisies (`vinyl-bacopa-moonlight-daisies-beauflor`) | enige | /product/vinyl-bacopa-moonlight-daisies-beauflor | …/2020413475.jpg | …/2020424292.jpg | r6-contact-vinyl-kamers.jpg #3 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Bacopa Moonlight Street (`vinyl-bacopa-moonlight-street-beauflor`) | enige | /product/vinyl-bacopa-moonlight-street-beauflor | …/1843946841.jpg | …/1843941649.jpg | r6-contact-vinyl-kamers.jpg #5 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Barinas Inspire Modena (`vinyl-barinas-inspire-modena-beauflor`) | 901D | /product/vinyl-barinas-inspire-modena-beauflor | …/1387451242-1.jpg | …/1387444517-1.jpg | r6-contact-vinyl-kamers.jpg #7 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Beau Liana (`vinyl-beau-liana-beauflor`) · aanbieding | 999D | /product/vinyl-beau-liana-beauflor | …/1381475933-1.jpg | …/1381488051-1.jpg | r6-contact-vinyl-kamers.jpg #9 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Bennet Spectrum Solid (`vinyl-bennet-spectrum-solid-beauflor`) | 000S | /product/vinyl-bennet-spectrum-solid-beauflor | …/1387304133-1.jpg | …/1387292684-1.jpg | r6-contact-vinyl-kamers.jpg #11 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Bente Turbo Lancaster (`vinyl-bente-turbo-lancaster-beauflor`) | 196M | /product/vinyl-bente-turbo-lancaster-beauflor | …/1838848515-1.jpg | …/1838847659-1.jpg | r6-contact-vinyl-kamers.jpg #13 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Birgit Supreme Montreal (`vinyl-birgit-supreme-montreal-beauflor`) · aanbieding | 900M | /product/vinyl-birgit-supreme-montreal-beauflor | …/Sonipro-Montreal-900M.jpg | …/Sonipro-Montreal-900M-2.jpg | r6-contact-vinyl-kamers.jpg #15 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Birgit Supreme Zurich (`vinyl-birgit-supreme-zurich-beauflor`) · aanbieding | 991M | /product/vinyl-birgit-supreme-zurich-beauflor | …/1770282711.jpg | …/1770292719.jpg | r6-contact-vinyl-kamers.jpg #17 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Bonita Blacktex Col Oak (`vinyl-bonita-blacktex-col-oak-beauflor`) | 629L | /product/vinyl-bonita-blacktex-col-oak-beauflor | …/1838760750.jpg | …/1838741915.jpg | r6-contact-vinyl-kamers.jpg #19 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Bonita Cosytex Spanish Oak (`vinyl-bonita-cosytex-spanish-oak-beauflor`) | 900L | /product/vinyl-bonita-cosytex-spanish-oak-beauflor | …/1770401300.jpg | …/1770407913.jpg | r6-contact-vinyl-kamers.jpg #21 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Bonita Quintex Havana Oak (`vinyl-bonita-quintex-havana-oak-beauflor`) · aanbieding | 699L | /product/vinyl-bonita-quintex-havana-oak-beauflor | …/1838737165.jpg | …/1838737170.jpg | r6-contact-vinyl-kamers.jpg #23 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Bonita Texstyle Havana Oak (`vinyl-bonita-texstyle-havana-oak-beauflor`) | 696L | /product/vinyl-bonita-texstyle-havana-oak-beauflor | …/1838824190.jpg | …/1838829128.jpg | r6-contact-vinyl-kamers.jpg #25 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Bonita Texstyle Water Oak (`vinyl-bonita-texstyle-water-oak-beauflor`) | 676L | /product/vinyl-bonita-texstyle-water-oak-beauflor | …/1838536686.jpg | …/1838556357.jpg | r6-contact-vinyl-kamers.jpg #27 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| DJ Black Uni (`vinyl-dj-black-uni-tarkett`) | enige | /product/vinyl-dj-black-uni-tarkett | …/1976543797-1.jpg | …/1976551261-1.jpg | r6-contact-vinyl-kamers.jpg #29 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Gebroken Steen (`vinyl-gebroken-steen-tarkett`) | enige | /product/vinyl-gebroken-steen-tarkett | …/1979521320.jpg | …/1979514696.jpg | r6-contact-vinyl-kamers.jpg #31 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Kindervinyl Trude (`vinyl-kindervinyl-trude-tarkett`) · aanbieding | enige | /product/vinyl-kindervinyl-trude-tarkett | …/369636489_817757739793605_202972958917430398_n.jpg | geen | r6-contact-vinyl-kamers.jpg #33 | toegelaten (geen vlakke foto), te verifiëren of er een bestaat | Vlakke foto opvragen |
| Rock Grey Black Uni (`vinyl-rock-grey-black-uni-tarkett`) | enige | /product/vinyl-rock-grey-black-uni-tarkett | …/1974083892-1.jpg | …/1974152089-1.jpg | r6-contact-vinyl-kamers.jpg #35 | toegelaten (geen vlakke foto), te verifiëren of er een bestaat | Vlakke foto opvragen |
| Ster Zaragoza Tegel (`vinyl-ster-zaragoza-tegel-tarkett`) · aanbieding | enige | /product/vinyl-ster-zaragoza-tegel-tarkett | …/2329213021-1.jpg | …/2316146251-1.jpg | r6-contact-vinyl-kamers.jpg #37 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Stylish Concrete Grey (`vinyl-stylish-concrete-grey-tarkett`) | enige | /product/vinyl-stylish-concrete-grey-tarkett | …/1979477893.jpg | …/1979477863.jpg | r6-contact-vinyl-kamers.jpg #39 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Tara Arcadia Middle Grey (`vinyl-tara-arcadia-middle-grey-tarkett`) | enige | /product/vinyl-tara-arcadia-middle-grey-tarkett | …/1979862893.jpg | …/1979886414.jpg | r6-contact-vinyl-kamers.jpg #41 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Tia Cosmo Clay (`vinyl-tia-cosmo-clay-tarkett`) · aanbieding | enige | /product/vinyl-tia-cosmo-clay-tarkett | …/5827242-scaled.jpg | …/5827242-1.jpg | r6-contact-vinyl-kamers.jpg #43 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Tia Legacy Oak Grey (`vinyl-tia-legacy-oak-grey-tarkett`) | enige | /product/vinyl-tia-legacy-oak-grey-tarkett | …/5827066-scaled.jpg | …/5827066-1.jpg | r6-contact-vinyl-kamers.jpg #45 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Tia Selene Light Grey (`vinyl-tia-selene-light-grey-tarkett`) | enige | /product/vinyl-tia-selene-light-grey-tarkett | …/5827031-1.jpg | …/5827031.jpg | r6-contact-vinyl-kamers.jpg #47 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Tila Derby Grege (`vinyl-tila-derby-grege-tarkett`) | enige | /product/vinyl-tila-derby-grege-tarkett | …/1979908776.jpg | …/1979908781.jpg | r6-contact-vinyl-kamers.jpg #49 | toegelaten (geen vlakke foto), te verifiëren of er een bestaat | Vlakke foto opvragen |
| Tila Tegel 34cm x 34cm Grijs (`vinyl-tila-tegel-34cm-x-34cm-grijs-tarkett`) · aanbieding | enige | /product/vinyl-tila-tegel-34cm-x-34cm-grijs-tarkett | …/2366992240.jpg | …/2366999205.jpg | r6-contact-vinyl-kamers.jpg #51 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Trude (`vinyl-trude-tarkett`) · aanbieding | 5331091 | /product/vinyl-trude-tarkett | …/1593960540.jpg | …/1593960861.jpg | r6-contact-vinyl-kamers.jpg #53 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |
| Visgraat Parket (`vinyl-visgraat-parket-tarkett`) · aanbieding | enige | /product/vinyl-visgraat-parket-tarkett | …/1979454630-1.jpg | …/1979455624-1.jpg | r6-contact-vinyl-kamers.jpg #55 | fout (regel opdrachtgever) | Label `sfeerfoto` op de kamerfoto in Shopify |

### 3.2 Foto hangt aan een andere kleur dan de alt-tekst (R6-08, R6-42)

Berekend op de data, daarna bekeken op `r6-contact-koppeling.jpg`. Enkel Toscana is met zekerheid fout: de kaart van kleur 729 is rood, het hoverbeeld en de andere foto van 729 zijn blauw. "Raakt de kaart" = dit is de foto op de kaart.

| Product (titel + slug) | Variant/kleur | Pagina-URL | Standaardbeeld-URL | Hoverbeeld-URL | Screenshot | Oordeel | Voorstel |
|---|---|---|---|---|---|---|---|
| Moonglaze Blackout FR (`gordijnstof-moonglaze-blackout-fr-ado`) | alt-tekst 575, hangt aan 775 | /product/gordijnstof-moonglaze-blackout-fr-ado | …/gordijnstof-moonglaze-blackout-fr-ado-fbdbcafa1e.jpg | …/gordijnstof-moonglaze-blackout-fr-ado-805b81daed.jpg | r6-contact-koppeling.jpg #1 | te verifiëren | Variantfoto nakijken in Shopify |
| Largo (`gordijnstof-largo-ado`) | alt-tekst 110, hangt aan 112 | /product/gordijnstof-largo-ado | …/gordijnstof-largo-ado-c4783dbc5e.jpg | …/gordijnstof-largo-ado-cf32b87f17.jpg | r6-contact-koppeling.jpg #3 | te verifiëren | Variantfoto nakijken in Shopify |
| Waterlily (`gordijnstof-waterlily-ado`) | alt-tekst 383, hangt aan 995 | /product/gordijnstof-waterlily-ado | …/gordijnstof-waterlily-ado-5e00f5e751.jpg | …/gordijnstof-waterlily-ado-04e4e5b7e6.jpg | r6-contact-koppeling.jpg #5 | te verifiëren | Variantfoto nakijken in Shopify |
| Pigmentdruk (`gordijnstof-pigmentdruk-ado`) | alt-tekst 200, hangt aan 381 | /product/gordijnstof-pigmentdruk-ado | …/gordijnstof-pigmentdruk-ado-cd1f447277.jpg | geen | r6-contact-koppeling.jpg #7 | te verifiëren | Variantfoto nakijken in Shopify |
| Vitrage 3033 (`gordijnstof-vitrage-3033-ado`) | alt-tekst 11, hangt aan 13 | /product/gordijnstof-vitrage-3033-ado | …/gordijnstof-vitrage-3033-ado-7c9a8aad24.jpg | …/gordijnstof-vitrage-3033-ado-ae40a48034.jpg | r6-contact-koppeling.jpg #9 | te verifiëren | Variantfoto nakijken in Shopify |
| Uni 3173 (`gordijnstof-uni-3173-ado`) | alt-tekst 20, hangt aan 92 | /product/gordijnstof-uni-3173-ado | …/gordijnstof-uni-3173-ado-a6214043e8.jpg | geen | r6-contact-koppeling.jpg #11 | te verifiëren | Variantfoto nakijken in Shopify |
| Macramé-onderrand 4623 (`passement-macrame-onderrand-4623-ado`) | alt-tekst 12, hangt aan 13 | /product/passement-macrame-onderrand-4623-ado | …/passement-macrame-onderrand-4623-ado-ab52635f6b.jpg | …/passement-macrame-onderrand-4623-ado-f3b25db62e.jpg | r6-contact-koppeling.jpg #13 | te verifiëren | Variantfoto nakijken in Shopify |
| Boord 4625 (`passement-boord-4625-ado`) | alt-tekst 12, hangt aan 13 · raakt de kaart | /product/passement-boord-4625-ado | …/passement-boord-4625-ado-84bcc35d6a.jpg | geen | r6-contact-koppeling.jpg #15 | te verifiëren | Variantfoto nakijken in Shopify |
| Macramé-inzetstuk 4624 (`passement-macrame-inzetstuk-4624-ado`) | alt-tekst 12, hangt aan 13 · raakt de kaart | /product/passement-macrame-inzetstuk-4624-ado | …/passement-macrame-inzetstuk-4624-ado-81c13716e7.jpg | geen | r6-contact-koppeling.jpg #17 | te verifiëren | Variantfoto nakijken in Shopify |
| Uni 3174 (`gordijnstof-uni-3174-ado`) | alt-tekst 20, hangt aan 75 | /product/gordijnstof-uni-3174-ado | …/gordijnstof-uni-3174-ado-8c7ae048ec.jpg | …/gordijnstof-uni-3174-ado-6c4eed7bd9.jpg | r6-contact-koppeling.jpg #19 | te verifiëren | Variantfoto nakijken in Shopify |
| Macramé-boord 4794 (`passement-macrame-boord-4794-ado`) | alt-tekst 12, hangt aan 13 · raakt de kaart | /product/passement-macrame-boord-4794-ado | …/passement-macrame-boord-4794-ado-a7b2986763.jpg | geen | r6-contact-koppeling.jpg #21 | te verifiëren | Variantfoto nakijken in Shopify |
| Sonrisa (`vasttapijt-sonrisa-associated-weavers`) | alt-tekst Beige 04, hangt aan Bric 87 | /product/vasttapijt-sonrisa-associated-weavers | …/vasttapijt-sonrisa-associated-weavers-d17c807b25.jpg | …/vasttapijt-sonrisa-associated-weavers-b0985a9406.jpg | r6-contact-koppeling.jpg #23 | te verifiëren | Variantfoto nakijken in Shopify |
| Soft Distinction (`vasttapijt-soft-distinction-lano`) | alt-tekst Teal Grey 0874, hangt aan Greystone 0842 | /product/vasttapijt-soft-distinction-lano | …/vasttapijt-soft-distinction-lano-73b3e056d8.jpg | …/vasttapijt-soft-distinction-lano-a39c24f670.jpg | r6-contact-koppeling.jpg #25 | te verifiëren | Variantfoto nakijken in Shopify |
| Zen (`vasttapijt-zen-lano`) | alt-tekst Heather 1 061, hangt aan Muscat 4 164 | /product/vasttapijt-zen-lano | …/vasttapijt-zen-lano-6eadd915bb.jpg | …/vasttapijt-zen-lano-f6723d401e.jpg | r6-contact-koppeling.jpg #27 | te verifiëren | Variantfoto nakijken in Shopify |
| Toscana B592 (`vasttapijt-toscana-b592-desso`) | alt-tekst 710, hangt aan 729 · raakt de kaart | /product/vasttapijt-toscana-b592-desso | …/vasttapijt-toscana-b592-desso-a275158a63.jpg | …/vasttapijt-toscana-b592-desso-caa208aed4.jpg | r6-contact-koppeling.jpg #29 | fout (bekeken: rood op de kaart, blauw bij hover) | Variantfoto nakijken in Shopify |

**Zeven kleuren zonder enige foto** (de pagina toont dan foto's van andere kleuren, de kaart een bolletje): Uni 3173 (55), Uni 3174 (20), Boord 4625 (12), Macramé-inzetstuk 4624 (12), Macramé-boord 4794 (12), Zen (Heather 1 061), Toscana B592 (710).

### 3.3 Zelfde foto's bij twee producten of twee kleuren (R6-34, R6-35)

Nieuw deze ronde. Gevonden via de bestandsgrootte en de hash in de bestandsnaam, daarna bekeken op `r6-contact-gelijk-bestand-producten.jpg` (kaart A, kaart B, gedeeld bestand bij A, bij B) en `r6-contact-gelijk-bestand-kleuren.jpg`.

| Product (titel + slug) | Variant/kleur | Pagina-URL | Wat is gelijk | Screenshot | Oordeel | Voorstel |
|---|---|---|---|---|---|---|
| Mehari 0098 (`vloerkleed-mehari-0098-ragolle`) en Rampur 0098 (`vloerkleed-rampur-0098-ragolle`) | 6727, 6747, 9332 bij allebei | /product/vloerkleed-mehari-0098-ragolle · /product/vloerkleed-rampur-0098-ragolle | 20 van de 20 foto's, zelfde kaartbeeld, zelfde kleurcodes, zelfde kenmerken (polypropyleen, 212.000 punten, 3.200 g/m²). Prijs verschilt: 80 × 150 cm € 79 en € 89, 120 × 170 cm € 129 en € 149, 133 × 195 cm € 159 en € 189 | r6-contact-gelijk-bestand-producten.jpg #53–56 | te verifiëren (R6-34): zelfde tapijt onder twee namen en twee prijzen, of foto's van het ene bij het andere | Navragen bij Brunic. Is het hetzelfde tapijt: één product houden |
| Liski DAM 213 (`vloerkleed-liski-dam-213-lalee`) | Lichttaupe en Taupe | /product/vloerkleed-liski-dam-213-lalee | 4 van de 4 foto's (product, twee details, sfeer) | r6-contact-gelijk-bestand-kleuren.jpg #3–10 | te verifiëren (R6-35): twee kleuren, één reeks foto's | Foto's van de juiste kleur opvragen, of één kleur schrappen |
| Rampur 0500 (`vloerkleed-rampur-0500-ragolle`) | 4258 en 6258 | /product/vloerkleed-rampur-0500-ragolle | Productfoto (`…/rampur-0500-4258-07-foto.jpg` en `…/rampur-0500-6258-01-productfoto.jpg`). De prijzen verschillen wel per kleur | r6-contact-gelijk-bestand-kleuren.jpg #11–12 | te verifiëren (R6-35) | Koppeling nakijken in Shopify |
| Laos PMO 901 en Laos PMO 902 (`vloerkleed-laos-pmo-901-lalee`, `-902-lalee`) | – | /product/vloerkleed-laos-pmo-901-lalee | Zelfde kaartbeeld en gedeelde foto's. Niet apart bekeken | – | te verifiëren (R6-35) | Koppeling nakijken in Shopify |
| 11 groepen vasttapijt van Associated Weavers, 28 producten (lijst in §4.9), bv. Liris, Orinoco, Verdant, Lustre, Parana, Rubico en Rio Grande | alle kleuren | bv. /product/vasttapijt-liris-associated-weavers | 14 tot 32 foto's per paar, zelfde kaartbeeld | r6-contact-gelijk-bestand-producten.jpg #5–52 | te verifiëren (R6-35): waarschijnlijk dezelfde kleurkaart in een ander gewicht, maar de klant ziet zeven keer dezelfde kaart | Navragen. Zo ja: het verschil (gewicht, poolhoogte) op de kaart of in de titel zetten |
| Beauflor, 10 paren (bv. Quintex Gambel Oak en Tex-Style Gambel Oak) · Lano Heathertwist en Startwist, Elite en Supreme · Balsan Ultrasoft Dalle en Ultrasoft Dalle Sonic Confort | – | – | Zelfde dessin in twee kwaliteiten | r6-contact-gelijk-bestand-producten.jpg #1–4, #57–60 | geen fout: de naam zegt het verschil | – |
| "Krijtbord magneetbehang zwart" (`behang-krijtbord-magneetbehang-zwart-estahome` en `…-estahome-scandi-cool`) | – | – | Zelfde titel, zelfde foto's | – | zie R6-51 (dubbele titels) | – |

Zeven bestandsnamen komen bij twee producten voor (`r6-contact-zelfde-naam.jpg`, bekeken). Zes zijn van Beauflor: dezelfde sfeerfoto of plank bij hetzelfde dessin in twee reeksen (Fairplay Cobble en Moonlight Cobble, Fairplay Sand Beige en Moonlight Sand Beige, Gracetex Lime Oak en Smartex Lime Oak). Geen fout. De zevende is te verifiëren (R6-35): `TH_RR_ICONIK_Rock_Grey_Black_001.jpg` staat zowel bij Iconik 260 Rock als bij Iconik 260 Tendenza (Tarkett), twee vloeren met een verschillende kaart.

### 3.4 Ragolle: eerste beeld is een schuine opname (R6-43)

Het eerste beeld heet `…-sfeerfoto.jpg` maar draagt het label "productfoto". Op `r6-contact-ragolle-eerste.jpg` staat telkens het eerste en het tweede beeld. Op de kaart is het sinds de aanpassing voor vloerkleden extra zichtbaar: een liggende, schuine opname in een kader waar de andere tapijten recht en volledig staan (`r6-contact-vloerkleden.jpg` #35, #42, #43).

| Product (titel + slug) | Variant/kleur | Pagina-URL | Standaardbeeld-URL | Hoverbeeld-URL | Screenshot | Oordeel | Voorstel |
|---|---|---|---|---|---|---|---|
| Rampur 0056 (`vloerkleed-rampur-0056-ragolle`) | 6747 (kaart) | /product/vloerkleed-rampur-0056-ragolle | …/rampur-0056-6747-06-sfeerfoto.jpg | …/rampur-0056-6747-01-productfoto.jpg | r6-contact-ragolle-eerste.jpg #1 | te verifiëren (kwaliteit, label) | Tweede foto vooraan: …/rampur-0056-6747-08-foto.jpg |
| Rampur 0445 (`vloerkleed-rampur-0445-ragolle`) | 5332 (kaart) | /product/vloerkleed-rampur-0445-ragolle | …/rampur-0445-5332-07-sfeerfoto.jpg | …/rampur-0445-5332-01-sfeerfoto.jpg | r6-contact-ragolle-eerste.jpg #3 | te verifiëren (kwaliteit, label) | Tweede foto vooraan: …/rampur-0445-5332-08-foto.jpg |
| Rampur 0477 (`vloerkleed-rampur-0477-ragolle`) | 2787 (kaart) | /product/vloerkleed-rampur-0477-ragolle | …/rampur-0477-2787-06-sfeerfoto.jpg | …/rampur-0477-2787-01-productfoto.jpg | r6-contact-ragolle-eerste.jpg #5 | te verifiëren (kwaliteit, label) | Tweede foto vooraan: …/rampur-0477-2787-07-foto.jpg |
| Ravenna 0174 (`vloerkleed-ravenna-0174-ragolle`) | 6265 (kaart) | /product/vloerkleed-ravenna-0174-ragolle | …/ravenna-0174-6265-01-sfeerfoto.jpg | geen | r6-contact-ragolle-eerste.jpg #7 | te verifiëren (kwaliteit, label) | Vlakke foto opvragen |
| Ripley 0014 (`vloerkleed-ripley-0014-ragolle`) | 6262 (kaart) | /product/vloerkleed-ripley-0014-ragolle | …/ripley-0014-6262-03-sfeerfoto.jpg | …/ripley-0014-6262-01-detailfoto.jpg | r6-contact-ragolle-eerste.jpg #9 | te verifiëren (kwaliteit, label) | Tweede foto vooraan: …/ripley-0014-6262-04-foto.jpg |
| Ripley 0204 (`vloerkleed-ripley-0204-ragolle`) | 6242 (kaart) | /product/vloerkleed-ripley-0204-ragolle | …/ripley-0204-6242-07-sfeerfoto.jpg | …/ripley-0204-6242-01-productfoto.jpg | r6-contact-ragolle-eerste.jpg #11 | te verifiëren (kwaliteit, label) | Tweede foto vooraan: …/ripley-0204-6242-08-foto.jpg |
| Ripley 0205 (`vloerkleed-ripley-0205-ragolle`) | 6362 (kaart) | /product/vloerkleed-ripley-0205-ragolle | …/ripley-0205-6362-07-sfeerfoto.jpg | …/ripley-0205-6362-01-productfoto.jpg | r6-contact-ragolle-eerste.jpg #13 | te verifiëren (kwaliteit, label) | Tweede foto vooraan: …/ripley-0205-6362-08-foto.jpg |
| Ripley 0221 (`vloerkleed-ripley-0221-ragolle`) | 6312 (kaart) | /product/vloerkleed-ripley-0221-ragolle | …/ripley-0221-6312-07-sfeerfoto.jpg | …/ripley-0221-6312-01-productfoto.jpg | r6-contact-ragolle-eerste.jpg #15 | te verifiëren (kwaliteit, label) | Tweede foto vooraan: …/ripley-0221-6312-08-foto.jpg |
| Ripley 0224 (`vloerkleed-ripley-0224-ragolle`) | 6362 (kaart) | /product/vloerkleed-ripley-0224-ragolle | …/ripley-0224-6362-01-sfeerfoto.jpg | …/ripley-0224-6362-07-foto.jpg | r6-contact-ragolle-eerste.jpg #17 | te verifiëren (kwaliteit, label) | Tweede foto vooraan: …/ripley-0224-6362-07-foto.jpg |
| Ripley 0226 (`vloerkleed-ripley-0226-ragolle`) | 6342 (kaart) | /product/vloerkleed-ripley-0226-ragolle | …/ripley-0226-6342-06-sfeerfoto.jpg | …/ripley-0226-6342-08-foto.jpg | r6-contact-ragolle-eerste.jpg #19 | te verifiëren (kwaliteit, label) | Tweede foto vooraan: …/ripley-0226-6342-08-foto.jpg |
| Ripley 0239 (`vloerkleed-ripley-0239-ragolle`) | 6362 (kaart) | /product/vloerkleed-ripley-0239-ragolle | …/ripley-0239-6362-06-sfeerfoto.jpg | …/ripley-0239-6362-01-productfoto.jpg | r6-contact-ragolle-eerste.jpg #21 | te verifiëren (kwaliteit, label) | Tweede foto vooraan: …/ripley-0239-6362-07-foto.jpg |

### 3.5 Hover is een smalle strook (R6-56)

| Product (titel + slug) | Variant/kleur | Pagina-URL | Standaardbeeld-URL | Hoverbeeld-URL | Screenshot | Oordeel | Voorstel |
|---|---|---|---|---|---|---|---|
| Bamboe (`gordijnstof-bamboe-artelux`) | 01 | /product/gordijnstof-bamboe-artelux | …/gordijnstof-bamboe-artelux-7d4a2dc6d1.jpg | …/gordijnstof-bamboe-artelux-250aa75295.jpg | r6-contact-hover-stroken.jpg #1 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Beuk (`gordijnstof-beuk-artelux`) | 01 | /product/gordijnstof-beuk-artelux | …/gordijnstof-beuk-artelux-58a7bc8f8f.jpg | …/gordijnstof-beuk-artelux-97b98df3fa.jpg | r6-contact-hover-stroken.jpg #3 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Braam (`gordijnstof-braam-artelux`) | 01 | /product/gordijnstof-braam-artelux | …/gordijnstof-braam-artelux-1199e565e9.jpg | …/gordijnstof-braam-artelux-ca2b807d2e.jpg | r6-contact-hover-stroken.jpg #5 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Dille (`gordijnstof-dille-artelux`) | 01 | /product/gordijnstof-dille-artelux | …/gordijnstof-dille-artelux-533158fb44.jpg | …/gordijnstof-dille-artelux-2d5a2a3b23.jpg | r6-contact-hover-stroken.jpg #7 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Hazelaar (`gordijnstof-hazelaar-artelux`) | 01 | /product/gordijnstof-hazelaar-artelux | …/gordijnstof-hazelaar-artelux-ac87799bc5.jpg | …/gordijnstof-hazelaar-artelux-97afb9d355.jpg | r6-contact-hover-stroken.jpg #9 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Hennep (`gordijnstof-hennep-artelux`) | 01 | /product/gordijnstof-hennep-artelux | …/gordijnstof-hennep-artelux-576dfa7ad5.jpg | …/gordijnstof-hennep-artelux-9a2f75e481.jpg | r6-contact-hover-stroken.jpg #11 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Iep (`gordijnstof-iep-artelux`) | 01 | /product/gordijnstof-iep-artelux | …/gordijnstof-iep-artelux-091f2724b4.jpg | …/gordijnstof-iep-artelux-af158e613a.jpg | r6-contact-hover-stroken.jpg #13 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Jungle (`gordijnstof-jungle-artelux`) | 01 | /product/gordijnstof-jungle-artelux | …/gordijnstof-jungle-artelux-2eed8e07f5.jpg | …/gordijnstof-jungle-artelux-20f1bc5a05.jpg | r6-contact-hover-stroken.jpg #15 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Mangrove (`gordijnstof-mangrove-artelux`) | 01 | /product/gordijnstof-mangrove-artelux | …/gordijnstof-mangrove-artelux-c37860f04e.jpg | …/gordijnstof-mangrove-artelux-14d8bd90e8.jpg | r6-contact-hover-stroken.jpg #17 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Moesson (`gordijnstof-moesson-artelux`) | 01 | /product/gordijnstof-moesson-artelux | …/gordijnstof-moesson-artelux-3f9cd7045c.jpg | …/gordijnstof-moesson-artelux-c70ef7c33b.jpg | r6-contact-hover-stroken.jpg #19 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Populier (`gordijnstof-populier-artelux`) | 01 | /product/gordijnstof-populier-artelux | …/gordijnstof-populier-artelux-ce5aa02bbe.jpg | …/gordijnstof-populier-artelux-5a2f114092.jpg | r6-contact-hover-stroken.jpg #21 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Rubus (`gordijnstof-rubus-artelux`) | 01 | /product/gordijnstof-rubus-artelux | …/gordijnstof-rubus-artelux-54e3e26c88.jpg | …/gordijnstof-rubus-artelux-c44a4c140a.jpg | r6-contact-hover-stroken.jpg #23 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Salix (`gordijnstof-salix-artelux`) | 01 | /product/gordijnstof-salix-artelux | …/gordijnstof-salix-artelux-cafeea00d0.jpg | …/gordijnstof-salix-artelux-8b3d158620.jpg | r6-contact-hover-stroken.jpg #25 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Salvia (`gordijnstof-salvia-artelux`) | 01 | /product/gordijnstof-salvia-artelux | …/gordijnstof-salvia-artelux-9b9934d73d.jpg | …/gordijnstof-salvia-artelux-88bf9b0e9c.jpg | r6-contact-hover-stroken.jpg #27 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Tijm (`gordijnstof-tijm-artelux`) | 01 | /product/gordijnstof-tijm-artelux | …/gordijnstof-tijm-artelux-7bfa61b9eb.jpg | …/gordijnstof-tijm-artelux-bbf8544c62.jpg | r6-contact-hover-stroken.jpg #29 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Veld (`gordijnstof-veld-artelux`) | 01 | /product/gordijnstof-veld-artelux | …/gordijnstof-veld-artelux-1a16666c7a.jpg | …/gordijnstof-veld-artelux-5f50bf25b9.jpg | r6-contact-hover-stroken.jpg #31 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Weide (`gordijnstof-weide-artelux`) | 01 | /product/gordijnstof-weide-artelux | …/gordijnstof-weide-artelux-6e94da87d4.jpg | …/gordijnstof-weide-artelux-d4540446f4.jpg | r6-contact-hover-stroken.jpg #33 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| Vlier (`gordijnstof-vlier-artelux`) | 01 | /product/gordijnstof-vlier-artelux | …/gordijnstof-vlier-artelux-b793a7a2b3.jpg | …/gordijnstof-vlier-artelux-127d592856.jpg | r6-contact-hover-stroken.jpg #35 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| abbey (`gordijnstof-abbey-loft79`) | 01 | /product/gordijnstof-abbey-loft79 | …/gordijnstof-abbey-loft79-770fa1a6e4.jpg | …/gordijnstof-abbey-loft79-b6cb1833f7.jpg | r6-contact-hover-stroken.jpg #37 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| bolton (`gordijnstof-bolton-loft79`) | 01 | /product/gordijnstof-bolton-loft79 | …/gordijnstof-bolton-loft79-d2d9c5fce4.jpg | …/gordijnstof-bolton-loft79-25ab756043.jpg | r6-contact-hover-stroken.jpg #39 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| camden (`gordijnstof-camden-loft79`) | 01 | /product/gordijnstof-camden-loft79 | …/gordijnstof-camden-loft79-fb673e6b81.jpg | …/gordijnstof-camden-loft79-e2eb3d4694.jpg | r6-contact-hover-stroken.jpg #41 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| cross (`gordijnstof-cross-loft79`) | 01 | /product/gordijnstof-cross-loft79 | …/gordijnstof-cross-loft79-0c39007cce.jpg | …/gordijnstof-cross-loft79-bc1172d918.jpg | r6-contact-hover-stroken.jpg #43 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| darwin (`gordijnstof-darwin-loft79`) | 01 | /product/gordijnstof-darwin-loft79 | …/gordijnstof-darwin-loft79-9598bdf4bd.jpg | …/gordijnstof-darwin-loft79-3146556894.jpg | r6-contact-hover-stroken.jpg #45 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| hove (`gordijnstof-hove-loft79`) | 01 | /product/gordijnstof-hove-loft79 | …/gordijnstof-hove-loft79-34216ceb5a.jpg | …/gordijnstof-hove-loft79-98b2b598ff.jpg | r6-contact-hover-stroken.jpg #47 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |
| portland (`gordijnstof-portland-loft79`) | 01 | /product/gordijnstof-portland-loft79 | …/gordijnstof-portland-loft79-b306596c56.jpg | …/gordijnstof-portland-loft79-66405933c7.jpg | r6-contact-hover-stroken.jpg #49 | te verifiëren (kwaliteit) | Hover overslaan of interieur koppelen |

### 3.6 Beeldrechten (R6-33)

| Product (titel + slug) | Bestand | Pagina | Oorsprong | Oordeel |
|---|---|---|---|---|
| Prime Zelfklevend 1m² (`vinyl-prime-zelfklevend-1m2-gerflor`) | `81LV4aT7k5L._AC_SY879.jpg`, `71y0u1c1QUL._AC_SX679.jpg` | /product/vinyl-prime-zelfklevend-1m2-gerflor | Bestandsnaam zoals Amazon ze geeft. Volgens het rapport van 03/11 komen ze van de oude site | te verifiëren (beeldrechten), al gevraagd (vraag 8) |
| Kindervinyl Trude (`vinyl-kindervinyl-trude-tarkett`) | `369636489_817757739793605_202972958917430398_n.jpg` | /product/vinyl-kindervinyl-trude-tarkett | Bestandsnaam zoals Facebook ze geeft. Enige foto van het product, ook in de aanbiedingen | te verifiëren (beeldrechten), al gevraagd (vraag 8) |

De fotolijst in `..\Data\` heb ik deze ronde niet opnieuw gelezen: de bestanden zijn dezelfde als op 03/11.

### 3.7 Kleuren die met een sfeerfoto beginnen en niets anders hebben

Toegelaten door de regel. Geen enkele staat op een kaart: u krijgt ze enkel via een staal.

| Product (slug) | Kleur | Beeld | Staal | Oordeel |
|---|---|---|---|---|
| Arien (`gordijnstof-arien-ado`) | 193 | …/gordijnstof-arien-ado-31aa89b45c.jpg | bolletje | toegelaten: de kleur heeft niets anders |
| Naran FR (`gordijnstof-naran-fr-ado`) | 200 | …/gordijnstof-naran-fr-ado-ba56f03397.jpg | bolletje | toegelaten: de kleur heeft niets anders |
| Java (`vasttapijt-java-associated-weavers`) | Silver 90 | …/vasttapijt-java-associated-weavers-9b2637c87c.jpg | bolletje | toegelaten: de kleur heeft niets anders |
| Java (`vasttapijt-java-associated-weavers`) | Marble 93 | …/vasttapijt-java-associated-weavers-507fbcff7b.jpg | foto | toegelaten: de kleur heeft niets anders |
| Sonrisa (`vasttapijt-sonrisa-associated-weavers`) | Beige 04 | …/vasttapijt-sonrisa-associated-weavers-18b149750c.jpg | bolletje | te verifiëren (koppeling, zie R6-42) |
| Sonrisa (`vasttapijt-sonrisa-associated-weavers`) | Moss 28 | …/vasttapijt-sonrisa-associated-weavers-43a7836043.jpg | bolletje | te verifiëren (koppeling, zie R6-42) |
| Samira (`behang-samira-borastapeter`) | 38742 | …/behang-samira-borastapeter-e44774c738.webp | foto | toegelaten: de kleur heeft niets anders |
| Indigo Garden (`behang-indigo-garden-borastapeter`) | 3133 | …/behang-indigo-garden-borastapeter-dd29e0ad57.webp | foto | toegelaten: de kleur heeft niets anders |

### 3.8 Overige beelden

| Product (titel + slug) | Variant/kleur | Pagina-URL | Standaardbeeld-URL | Hoverbeeld-URL | Screenshot | Oordeel | Voorstel |
|---|---|---|---|---|---|---|---|
| Samira (`behang-samira-borastapeter`) | 38743 | /product/behang-samira-borastapeter | …/behang-samira-borastapeter-df59b04296.jpg | geen | r6-contact-diversen.jpg #1–4 | te verifiëren (R6-44): de kaart is bijna wit, de sfeerfoto hangt aan 38742 | Beoordelen of er een betere foto bestaat |
| DJ Black Uni (`vinyl-dj-black-uni-tarkett`) | enige | /product/vinyl-dj-black-uni-tarkett | …/1976543797-1.jpg (kamer) | …/1976551261-1.jpg (916 byte, egaal zwart) | r6-contact-diversen.jpg #5–8 | fout voor de kamer (R6-04). Hover: te verifiëren | Label `sfeerfoto`. Betere vlakke foto opvragen |
| Elke productpagina | – | bv. /product/behang-3d-golvende-lijnen-aubergine-paars-estahome | – | – | r6-desk-lightbox-scherpte.jpg, r6-desk-pdp-scherpte.jpg | fout (R6-67): de browser laadt een bestand van 360 px voor een kader van 788 px, en voor de lightbox van 1.366 px | `sizes` meegeven in de galerij en de lightbox |
| Rose Magnifique (kopie) (`fotobehang-op-maat-rose-magnifique-kopie-borastapeter`) | – | /product/fotobehang-op-maat-rose-magnifique-kopie-borastapeter | – | – | r6-contact-diversen.jpg #20–23 | fout (R6-29): een kopie staat online | Offline halen in Shopify |

**In orde in de steekproef:**

- **Vloerkleden:** het hele tapijt is zichtbaar op kaart en productpagina, ook in "Ronde tapijten" en "Speciale vormen" (`r6-contact-vloerkleden.jpg`, `r6-desk-raster-*.jpg`). R5-06 is opgelost. Het tapijt vult wel maar ongeveer de helft van het kader (gemiddeld 46 tot 50% blijft leeg), omdat de foto's staand zijn en het kader liggend.
- **Kaart en hover per merk:** 34 paren bekeken (`r6-contact-paren.jpg`, twee per merk). Hover hoort telkens bij hetzelfde product.
- **Hover in de browser:** 111 kaarten op 14 lijsten. 102 wisselen, alle 111 keren terug, geen enkele kaart verspringt. De 9 zonder wissel hebben geen hoverbeeld (Tarkett en Balsan), en dan hoort de foto te blijven staan.
- **Kaart → productpagina → terug:** 28 kaarten op 14 lijsten: titel, eerste beeld, URL en scrollpositie kloppen 28 keer.

---

## 4. Wat er niet staat

Alle tabellen zijn gerekend op de hele momentopname (4.070 producten, 15.927 varianten, 41.951 foto's). De lokale momentopname is van 02/11, die van productie van 03/11. Ik heb aangetoond dat ze op alles wat de klant ziet gelijk zijn: zie §11.1.

### 4.1 Vindbaarheid

"Enkel een code" = minstens één cijfer en hoogstens twee letters (901D, 162L, AD08). Een product zonder kleuroptie telt als één kleur. **Vetgedrukt = de klant kan die kleur niet vinden**, tenzij hij de code kent. De tabel is **cijfer voor cijfer gelijk aan die van 03/11**: er is in negen dagen geen enkele kleurfamilie, motief of stijl bijgekomen.

| Afdeling | Type | Merk | Producten | Kleuren | Zonder kleurfamilie | Enkel een code | **Code én geen familie** | Producten zonder enige kleur | Maat | Vorm | Motief | Stijl | Voorbeeld |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Behang | Behang | ESTAhome | 1304 | 1304 | 502 (38%) | 0 | **0** | 502 | 0% | 0% | 97% | 91% |  |
| Behang | Behang | Origin Wallcoverings | 566 | 566 | 131 (23%) | 0 | **0** | 131 | 0% | 0% | 99% | 100% |  |
| Behang | Behang | Boråstapeter | 352 | 887 | 853 (96%) | 853 | **853** | 343 | 0% | 0% | 0% | 0% | Lily Tree 7227, Lily Tree 7229 |
| Behang | Fotobehang | ESTAhome | 259 | 259 | 100 (39%) | 0 | **0** | 100 | 0% | 0% | 93% | 93% |  |
| Behang | Fotobehang op maat | Boråstapeter | 143 | 260 | 260 (100%) | 260 | **260** | 143 | 0% | 0% | 0% | 0% | Blossom II 9401W, Blossom II 9402W |
| Behang | Wanddecoratie | ESTAhome | 37 | 37 | 13 (35%) | 0 | **0** | 13 | 0% | 0% | 97% | 51% |  |
| Behang | Fotobehang | Origin Wallcoverings | 25 | 25 | 6 (24%) | 0 | **0** | 6 | 0% | 0% | 100% | 96% |  |
| Behang | Behang | Walls4You | 21 | 21 | 7 (33%) | 0 | **0** | 7 | 0% | 0% | 100% | 100% |  |
| Behang | Behang | Sanders & Sanders | 17 | 17 | 3 (18%) | 0 | **0** | 3 | 0% | 0% | 100% | 88% |  |
| Gordijnen & stoffen | Gordijnstof | ADO | 424 | 2051 | 0 (0%) | 2051 | **0** | 0 | 0% | 0% | 100% | 100% |  |
| Gordijnen & stoffen | Gordijnstof | Artelux | 84 | 1094 | 0 (0%) | 1094 | **0** | 0 | 0% | 0% | 100% | 100% |  |
| Gordijnen & stoffen | Gordijnstof | Loft79 | 66 | 799 | 0 (0%) | 799 | **0** | 0 | 0% | 0% | 100% | 100% |  |
| Gordijnen & stoffen | Passement | ADO | 18 | 26 | 0 (0%) | 26 | **0** | 0 | 0% | 0% | 0% | 0% |  |
| Tapijten | Vloerkleed | Lalee | 84 | 179 | 0 (0%) | 0 | **0** | 0 | 100% | 100% | 100% | 100% |  |
| Tapijten | Vloerkleed | Ragolle | 52 | 70 | 0 (0%) | 70 | **0** | 0 | 100% | 100% | 100% | 100% |  |
| Tapijten | Vasttapijt | Tarkett (Desso) | 44 | 474 | 86 (18%) | 474 | **86** | 10 | 0% | 0% | 0% | 0% | Esprit B226 219, Esprit B226 234 |
| Tapijten | Vloerkleed | Louis De Poortere | 36 | 138 | 0 (0%) | 0 | **0** | 0 | 100% | 100% | 100% | 100% |  |
| Tapijten | Vasttapijt | Tarkett | 10 | 114 | 29 (25%) | 114 | **29** | 7 | 0% | 0% | 0% | 0% | Soft Sense II AC27 1318, Soft Sense II AC27 1320 |
| Vloerbekleding | Vinylvloer | Beauflor | 212 | 402 | 402 (100%) | 387 | **387** | 212 | 0% | 0% | 0% | 0% | Easytex Westbury 162L, Easytex Westbury 689D |
| Vloerbekleding | Vasttapijt | Associated Weavers | 113 | 1149 | 845 (74%) | 0 | **0** | 11 | 0% | 0% | 0% | 0% |  |
| Vloerbekleding | Vinylvloer | Tarkett | 53 | 93 | 93 (100%) | 2 | **2** | 53 | 0% | 0% | 0% | 0% | Trude 5331091, Trude 5331141 |
| Vloerbekleding | Tapijttegel | Tarkett (Desso) | 50 | 660 | 0 (0%) | 657 | **0** | 0 | 0% | 0% | 0% | 0% |  |
| Vloerbekleding | Vasttapijt | Lano | 44 | 668 | 382 (57%) | 0 | **0** | 0 | 0% | 0% | 0% | 0% |  |
| Vloerbekleding | Vasttapijt | Balsan | 20 | 353 | 1 (0%) | 57 | **0** | 0 | 0% | 0% | 0% | 0% |  |
| Vloerbekleding | Tapijtloper | Associated Weavers | 16 | 58 | 40 (69%) | 0 | **0** | 5 | 0% | 0% | 0% | 0% |  |
| Vloerbekleding | Vinylvloer | Gerflor | 12 | 19 | 19 (100%) | 1 | **1** | 12 | 0% | 0% | 0% | 0% | Senso Premium Grey Marble 1539 |
| Vloerbekleding | Tapijttegel | Balsan | 6 | 37 | 6 (16%) | 37 | **6** | 1 | 0% | 0% | 0% | 0% | Sky 160, Sky 640 |
| Vloerbekleding | Vasttapijt | Tarkett (Desso) | 2 | 23 | 0 (0%) | 23 | **0** | 0 | 0% | 0% | 0% | 0% |  |
| **Totaal** | | | **4070** | **11783** | **3778 (32%)** | **6905** | **1624** | **1559** | | | | | |

Per afdeling (primaire categorie):

| Afdeling | Producten | Zonder kleur | Kleuren | Zonder familie | Code én geen familie |
|---|---:|---:|---:|---:|---:|
| Behang | 2724 | 1248 (46%) | 3376 | 1875 (56%) | 1113 |
| Gordijnen & stoffen | 592 | 0 (0%) | 3970 | 0 (0%) | 0 |
| Tapijten | 226 | 17 (8%) | 975 | 115 (12%) | 115 |
| Vloerbekleding | 528 | 294 (56%) | 3462 | 1788 (52%) | 396 |

**Wat dit betekent:**

- **Vinyl (277 producten, 514 kleuren): 0 kleurfamilies.** De lijst `/catalogus/vloerbekleding/vinyl` heeft geen filter Kleur (R6-01). Bij 31 vinylproducten staat de kleur wel als kenmerk ("Kleur: Zwart / Wit"), maar de filter leest dat niet.
- **Boråstapeter (495 producten): 9 met een kleur, 0 met motief, stijl, ruimte of materiaal** (R6-02).
- **Kleurwoord in de titel, geen kleurfamilie: 721 producten** (ESTAhome 584, Origin 121, Walls4You 7, Boråstapeter 3, Sanders 3, Beauflor 2, Tarkett 1). Van de 156 behangen met "blauw" of "blauwe" als los woord in de titel staan er 73 onder Kleur: Blauw en 83 niet (R6-03). Het rapport van 03/11 telde 725 en 61 met een iets andere woordenlijst. De orde van grootte is dezelfde.
- **Gordijnstoffen blijven het voorbeeld dat het kan:** alle 3.970 kleuren zijn codes, en toch vindbaar, omdat elke kleur een familie heeft.
- **Dekking per afdeling** (producten met minstens één waarde): Behang Kleur 54%, Motief 79%, Stijl 76%. Vloerbekleding Kleur 47%. Tapijten Kleur 92%, Maat, Vorm, Motief en Stijl 76% (enkel vloerkleden: daar 100%). Gordijnen & stoffen Kleur 100%, Motief en Stijl 97%. `test:filters` drukt dezelfde cijfers af.

**Filters die wegvallen, per lijst** (productie, 12/11). Vetgedrukt: geen enkel product in die lijst heeft data. De rest valt weg omdat elk product dezelfde waarde heeft, en dat is correct.

| Lijst | Producten | Getoond | Niet getoond (producten met data) |
|---|---:|---|---|
| /catalogus/gordijnen-en-stoffen | 592 | Type, Kleur, Lichtdoorlatendheid, Motief, Merk, Stijl, Materiaal, Stofbreedte, Eigenschappen | Prijs (592) |
| /catalogus/behang | 2724 | Type, Kleur, Motief, Stijl, Prijs, Merk, Ruimte, Materiaal, Eigenschappen | – |
| /catalogus/vloerbekleding | 582 | Type, Kleur, Look, Rolbreedte, Prijs, Merk, Materiaal, Slijtlaag, Gebruiksklasse, Plaatsing, Poolhoogte, Eigenschappen | – |
| /catalogus/tapijten | 226 | Type, Kleur, Maat, Motief, Prijs, Merk, Stijl, Vorm, Materiaal, Poolhoogte, Eigenschappen | – |
| /catalogus/behang/baby | 505 | Type, Kleur, Motief, Stijl, Prijs, Merk, Ruimte, Materiaal, Eigenschappen | – |
| /catalogus/behang/jeugd-meisjes | 445 | Type, Kleur, Motief, Stijl, Prijs, Merk, Ruimte, Materiaal, Eigenschappen | – |
| /catalogus/behang/bloemen | 327 | Type, Kleur, Motief, Stijl, Prijs, Merk, Ruimte, Materiaal, Eigenschappen | – |
| /catalogus/vloerbekleding/vinyl | 277 | Look, Rolbreedte, Prijs, Merk, Slijtlaag, Plaatsing, Eigenschappen | Type (277), **Kleur (0)**, Materiaal (277), **Gebruiksklasse (0)**, **Poolhoogte (0)** |
| /catalogus/gordijnen-en-stoffen/tekening | 262 | Kleur, Lichtdoorlatendheid, Motief, Merk, Stijl, Materiaal, Stofbreedte, Eigenschappen | Type (262), Prijs (262) |
| /catalogus/behang/jeugd-jongens | 246 | Type, Kleur, Motief, Stijl, Prijs, Merk, Ruimte, Materiaal, Eigenschappen | – |
| /catalogus/vloerbekleding/vasttapijt | 233 | Kleur, Look, Rolbreedte, Merk, Materiaal, Gebruiksklasse, Plaatsing, Poolhoogte, Eigenschappen | Type (233), Prijs (233), **Slijtlaag (0)** |
| /catalogus/behang/streep | 157 | Type, Kleur, Motief, Stijl, Prijs, Merk, Ruimte, Materiaal, Eigenschappen | – |
| /catalogus/behang/effen | 134 | Type, Kleur, Motief, Stijl, Prijs, Merk, Ruimte | Materiaal (134), **Eigenschappen (0)** |
| /catalogus/tapijten/modern | 105 | Kleur, Maat, Motief, Prijs, Merk, Stijl, Vorm, Materiaal, Poolhoogte, Eigenschappen | Type (105) |
| /catalogus/gordijnen-en-stoffen/brandvrij | 96 | Kleur, Lichtdoorlatendheid, Motief, Merk, Stijl, Materiaal, Stofbreedte, Eigenschappen | Type (96), Prijs (96) |
| /catalogus/tapijten/op-maat | 54 | Kleur, Materiaal, Eigenschappen | Type (54), **Maat (0)**, **Motief (0)**, Prijs (54), Merk (54), **Stijl (0)**, **Vorm (0)**, **Poolhoogte (0)** |
| /catalogus/tapijten/binnen-buiten | 36 | Kleur, Maat, Motief, Prijs, Merk, Stijl, Vorm, Materiaal, Poolhoogte, Eigenschappen | Type (36) |
| /catalogus/gordijnen-en-stoffen/isolerend-verduisterend | 34 | Kleur, Lichtdoorlatendheid, Motief, Merk, Stijl, Materiaal, Eigenschappen | Type (34), Prijs (34), Stofbreedte (34) |
| /catalogus/tapijten/rond | 25 | Kleur, Maat, Motief, Prijs, Merk, Stijl, Vorm, Materiaal, Poolhoogte, Eigenschappen | Type (25) |
| /catalogus/tapijten/klassiek | 24 | Kleur, Maat, Motief, Prijs, Merk, Stijl, Materiaal, Poolhoogte, Eigenschappen | Type (24), Vorm (24) |
| /catalogus/gordijnen-en-stoffen/benodigdheden | 18 | Kleur | Type (18), **Lichtdoorlatendheid (0)**, **Motief (0)**, Prijs (18), Merk (18), **Stijl (0)**, Materiaal (18), **Stofbreedte (0)**, Eigenschappen (18) |
| /catalogus/tapijten/speciale-vormen | 7 | Kleur, Maat, Motief, Stijl, Vorm | Type (7), Prijs (7), Merk (7), Materiaal (7), **Poolhoogte (0)**, Eigenschappen (7) |
| /catalogus/tapijten/kinder | 6 | Kleur, Motief | Type (6), Maat (6), Prijs (6), Merk (6), Stijl (6), Vorm (6), Materiaal (6), Poolhoogte (6), **Eigenschappen (0)** |
| /catalogus/gordijnen-en-stoffen/effen | 4 | Kleur, Lichtdoorlatendheid, Motief, Stijl, Materiaal, Stofbreedte | Type (4), Prijs (4), Merk (4), Eigenschappen (4) |

### 4.2 Consistentie tussen afdelingen

| | Gordijnen & stoffen | Behang | Vloerbekleding | Tapijten |
|---|---:|---:|---:|---:|
| Producten (primaire afdeling) | 592 | 2724 | 528 | 226 |
| Producten met een kleuroptie | 592 | 2724 | 496 | 226 |
| Kleuren (waarden van de kleuroptie) | 3970 | 3376 | 3430 | 975 |
| Staal = foto | 3963 (100%) | 3376 (100%) | 3427 (100%) | 974 (100%) |
| Staal = bolletje / geen staal | 7 / 0 | 0 / 0 | 3 / 0 | 1 / 0 |
| Kleur met eigen vlakke foto | 3963 (100%) | 3374 (100%) | 3425 (100%) | 974 (100%) |
| Kaart met hoverbeeld | 561 (95%) | 2579 (95%) | 412 (78%) | 153 (68%) |
| · hover = sfeerfoto / detail / ongelabeld / productfoto | 36 / 500 / 25 / 0 | 2579 / 0 / 0 / 0 | 370 / 2 / 40 / 0 | 143 / 5 / 0 / 5 |
| Kaart begint met: productfoto / detail / ongelabeld / sfeer | 588 / 4 / 0 / 0 | 2327 / 258 / 139 / 0 | 432 / 0 / 96 / 0 | 226 / 0 / 0 / 0 |
| Producten met één foto | 11 | 1 | 35 | 18 |
| Prijs op de kaart / op aanvraag | 0 / 592 | 2229 / 495 | 277 / 251 | 136 / 90 |
| Eenheid op de kaart | – | rol 1908, stuk 321 | m2 277 | stuk 136 |
| Regel onder de prijs: "Online te bestellen" / "Advies en offerte in de winkel" | 0 / 592 | 2229 / 495 | 277 / 251 | 136 / 90 |
| Kaart met stalen / met "+N" | 557 / 164 | 306 / 44 | 377 / 215 | 143 / 58 |
| "vanaf" op de kaart | 0 | 0 | 0 | 132 |
| Gem. kenmerken / afmetingen per product | 10.1 / 1.7 | 8.3 / 0.8 | 13.1 / 2.8 | 14.2 / 2.9 |
| Producten zonder blok Afmetingen | 2 | 483 | 47 | 1 |

- **Stalen: consequent.** In elke afdeling de foto van de kleur. 11 bolletjes op 11.751 kleuren, enkel waar geen vlakke foto is.
- **Hover: verschil zonder reden in de specificatie.** Vloerbekleding 78% en Tapijten 68% tegenover 95% elders. Oorzaak: Tarkett (144 van de 159 producten zonder hover) en Boråstapeter (145). Dat volgt de regel "dan blijft de foto staan".
- **Kaart begint met een ongelabelde foto: 235** (Boråstapeter 139, Tarkett 53, Beauflor 31, Gerflor 12). Bij vinyl zijn dat 28 kamers (R6-04).
- **Prijs:** 0% bij stoffen, 82% bij behang, 52% bij vloerbekleding, 60% bij tapijten. Ongewijzigd.
- **Eerste pagina van een afdeling** (sortering "Aanbevolen"): in Behang zijn de eerste 48 kaarten allemaal Boråstapeter op aanvraag, in Vloerbekleding allemaal vasttapijt op aanvraag. Zie R6-53.

### 4.3 Beloftes

**Alle 168 labels in `brunic.specificaties`** van de producten op de site staan in bijlage A, met wat de site ervan toont. Wat een belofte kan zijn:

| Label | Producten (ruw) | Zichtbaar op de site | Oordeel |
|---|---:|---:|---|
| Levertermijn | 243 | 0 | In orde: verborgen (`IS_LEVERBELOFTE`) |
| Levertijd | 31 | 0 | In orde: verborgen |
| Leverbaar tot (volgens leverancier) | 9 | **9** | Te verifiëren (R6-37), al gevraagd |
| Garantie | 245 | **245** | Te verifiëren (R6-31), al gevraagd |
| Minimale afname | 25 | 25 | Allemaal Balsan op aanvraag ("4 m2", "1 doos", "200 m2"): speelt niet online |
| Keurmerken, Certificeringen, ISO, Cradle to Cradle, GUI, CRI, Green Building | 34–111 | ja | Leveranciersclaims, niet nagekeken |

**Woorden in wat de klant ziet** (beschrijving en kenmerken zoals de site ze toont, alle 4.070 producten):

| Woord | In de beschrijving | Merken | In de kenmerken | Oordeel |
|---|---:|---|---:|---|
| levertijd | 1 | Artelux (Goodnight) | 0 | Fout (R6-10) |
| levertermijn, werkdagen, voorraad | 0 | | 0 | In orde |
| leverbaar | 4 | Tarkett 3, Balsan 1 ("ook leverbaar als tegel") | 9 | Geen belofte, behalve R6-37 |
| garantie | 3 | Tarkett ("bieden we de garantie op een lage CO2-voetafdruk") | 245 | Te verifiëren (R6-31) |
| gratis | 36 | Louis De Poortere ("Wij halen het gratis op") | 0 | Te verifiëren (R6-32) |
| levering, geleverd | 50 | Louis De Poortere 36, Tarkett 11, Balsan 3 | 0 | LDP: te verifiëren (R6-32). De rest beschrijft het product |
| gratis levering, retour, binnen N dagen | 0 | | 0 | In orde |

De tabel in de beschrijving is weg (R5-05 opgelost): op 03/11 stond "garantie" daardoor nog 248 keer in de beschrijving, nu 3 keer.

**In de echte HTML van productie** (664 productpagina's): "voorraad", "werkdagen", "levertermijn", `InStock`: 0 keer. "levertijd": 1 keer (Goodnight, ook in de structured data). "Leverbaar tot": 9 keer. Geen `availability` in de structured data. De interne waarde `op-voorraad` staat wel in de pagina-data van alle 664 pagina's (R6-47).

**Vaste pagina's** (78 pagina's gelezen): "gratis" 39 zinnen op 21 pagina's, telkens de gratis opmeting. "Wij nemen binnen 1 à 2 werkdagen contact met u op" op 9 pagina's. "Eigen atelier", "eigen stiksters", "onze eigen mensen" op 20 pagina's. "al 40 jaar" en "Sinds 1992 is Brunic een nv" op `/info/over-ons`, "Familiebedrijf sinds 1992" op home. Wettelijke termijnen (14 dagen, 30 dagen, twee jaar): geen punt. Dat alles is al aan Brunic gevraagd (vraag 6, R6-38). Nieuw: R6-26 (opmeting bij behangartikels) en R6-39 (afdelingen zonder producten in "Over Brunic").

### 4.4 Productpagina-inhoud

| Controle (alle 4.070 producten, tekst zoals de site ze toont) | Aantal | Oordeel |
|---|---:|---|
| Tabel als één lopende zin | 0 | Opgelost (was 243, R5-05) |
| HTML-resten en entiteiten | 0 | In orde |
| Aanhef of mededeling: "Beste klanten," | **274** (Beauflor 212, Tarkett 53, Gerflor 9) | Fout (R6-05). Bij 205 is dat de hele beschrijving |
| "!ENKEL VERKOCHT PER DOOS!" | 2 (Gerflor) | Zie R6-30 |
| Beschrijving eindigt op een dubbelepunt, zonder vervolg | **46** (Boråstapeter): "Dit Zweedse behang onderscheidt zich met kwalitatieve eigenschappen:" | Fout (R6-71). Staat zo in Shopify, geen gevolg van het weghalen van de tabellen |
| Beschrijving herhaalt enkel de kenmerken als opsomming | 2.228 behangen (ESTAhome 1.599, Origin 591, Walls4You 21, Sanders 17): "• Afmetingen: 53 cm x 10,05 m • Samenstelling: … • Aanbrengen: …" | Verbeterpunt (R6-54) |
| Rare tekens: "??" midden in een zin | 9 (Boråstapeter) | Fout (R6-28) |
| Los aanhalingsteken aan het einde | 1 (Beauflor Feelings Sweet Oak) | Fout (R6-28) |
| Twee keer hetzelfde kenmerk ("Kleur:") | 13 (Beauflor 12, Tarkett 1) | Fout (R6-22) |
| Zelfde kenmerk in twee schrijfwijzen | Totaal gewicht (235) / Totaalgewicht (26) · Plank Afmeting (95) / Plank afmeting (10) · Slijtlaag (274) / Slijtlaagdikte (2) / Dikte van de slijtlaag (1) · Oppervlakte per doos (50) / Oppervlakte / doos (2) · Totale dikte (131) / Dikte (274) | Verbeterpunt (R6-49) |
| Engelse kenmerken | 6 labels, bv. "Carbon Impact over the Entire Product Lifecycle" (34), "Green Building Certifications Contribution" (36). Waarden: "EcoBase - 100% recyclable, contains up to 91% recycled…" (38), "Polypropylene woven + fleece" (27) | Verbeterpunt (R6-49) |
| Kenmerk in hoofdletters | "GETUFT" (89), "OEKOTEX" (110), "ZUIVER" (1) | Verbeterpunt (R6-49) |
| Beschrijving korter dan 100 tekens | **1.011** (ADO 437, Boråstapeter 262, Associated Weavers 126, Artelux 72, Loft79 65, Lano 43, Tarkett 4, Gerflor 2). Leeg: 0 | Verbeterpunt (R6-54). Bv. "Gordijnstof Acer van Artelux. Verkrijgbaar in 13 kleuren." |
| Zelfde alinea bij 20 producten of meer | 18 alinea's. De grootste: "Heeft u graag dat uw vloerbekleding geplaatst wordt…" (234), "Wenst u een andere maat of hebt u een vraag over dit tapijt?" (136), de vijf LDP-alinea's (36 elk) | Zie R6-05 en R6-32 |
| Stem van de fabrikant ("onze eigen fabriek", "ons eigen R&D-team", "Wij halen het gratis op") | 36 (Louis De Poortere) + losse zinnen bij Boråstapeter (22), Tarkett (26), Balsan (4), Lano (1), Artelux (1) | Te verifiëren (R6-32) |

Per merk heb ik vijf beschrijvingen gelezen zoals de site ze toont (85 in totaal, de lange ingekort tot 520 tekens: `a14-beschrijvingen.txt`), en alle zinnen met wij, we, ons en onze (580 producten, `a3-log.txt`). Bij Beauflor, Tarkett-vinyl, Gerflor, Lalee en Ragolle is "ons" Brunic zelf ("Neem contact met ons op via info@brunic.be"): dat klopt. Bij Louis De Poortere, Boråstapeter ("Wij hebben de eer gekregen om de meest stijlvolle ontwerpen te selecteren", 11 keer), Tarkett-tapijt ("onze Circular Selection", 23 keer) en Balsan ("onze tapijttegels zijn voor 100% van Frans fabrikaat!") spreekt de fabrikant.

**Past de vaste tekst bij het product?** In de browser nagekeken op 13 soorten producten (`b6-log.txt`):

| Product | Vaste tekst | Oordeel |
|---|---|---|
| Behang per rol (ESTAhome) | "Liever eerst in het echt zien? Bekijk de stalenboeken in onze winkel" | In orde |
| Boråstapeter op aanvraag | "Prijs op aanvraag: vraag vrijblijvend een offerte aan — of kom de stalenboeken bekijken" · blok Afmetingen: "De afmetingen en de hoeveelheid die u nodig hebt, bekijken we graag samen met u in onze winkel." | In orde (R5-08 opgelost) |
| Vinyl | "Gelegd door onze eigen mensen? Vraag een gratis opmeting aan huis aan" | In orde volgens `maatwerk.ts` (vloer) |
| Vloerkleed Lalee, Ragolle | "Liever een andere afmeting? Bekijk tapijt op maat" | In orde |
| Louis De Poortere op aanvraag | "de prijs hangt af van uw maten en afwerking", bij vaste maten | Verbeterpunt (R6-48) |
| Tapijttegel, vasttapijt, gordijnstof | "de prijs hangt af van uw maten en afwerking" | In orde |
| Elke productpagina | Accordeon "Retourneren": "op maat gesneden stoffen, behang of vasttapijt vallen daar wettelijk niet onder" | Bekend (TODO B17): juridisch laten toetsen |

### 4.5 Prijs en eenheid

De verdeling is **ongewijzigd tegenover 03/11**: 2.642 producten met een prijs, 1.428 op aanvraag.

| Afdeling | Type | Merk | Producten | Met prijs | Op aanvraag | Eenheid | Laagste | Mediaan | Hoogste | In aanbieding |
|---|---|---|---:|---:|---:|---|---:|---:|---:|---:|
| Behang | Behang | Boråstapeter | 352 | 0 | 352 | – | – | – | – | 0 |
| Behang | Behang | ESTAhome | 1304 | 1304 | 0 | rol 1304 | € 23,95 | € 51,95 | € 148,95 | 0 |
| Behang | Behang | Origin Wallcoverings | 566 | 566 | 0 | rol 566 | € 52,95 | € 65,95 | € 170,95 | 0 |
| Behang | Behang | Sanders & Sanders | 17 | 17 | 0 | rol 17 | € 31,95 | € 36,50 | € 40,95 | 0 |
| Behang | Behang | Walls4You | 21 | 21 | 0 | rol 21 | € 30,95 | € 34,95 | € 34,95 | 0 |
| Behang | Fotobehang | ESTAhome | 259 | 259 | 0 | stuk 259 | € 64,95 | € 184,95 | € 470,95 | 0 |
| Behang | Fotobehang | Origin Wallcoverings | 25 | 25 | 0 | stuk 25 | € 106,95 | € 227,95 | € 371,95 | 0 |
| Behang | Fotobehang op maat | Boråstapeter | 143 | 0 | 143 | – | – | – | – | 0 |
| Behang | Wanddecoratie | ESTAhome | 37 | 37 | 0 | stuk 37 | € 25,95 | € 30,95 | € 144,95 | 0 |
| Gordijnen & stoffen | Gordijnstof | ADO | 424 | 0 | 424 | – | – | – | – | 0 |
| Gordijnen & stoffen | Gordijnstof | Artelux | 84 | 0 | 84 | – | – | – | – | 0 |
| Gordijnen & stoffen | Gordijnstof | Loft79 | 66 | 0 | 66 | – | – | – | – | 0 |
| Gordijnen & stoffen | Passement | ADO | 18 | 0 | 18 | – | – | – | – | 0 |
| Tapijten | Vasttapijt | Tarkett | 10 | 0 | 10 | – | – | – | – | 0 |
| Tapijten | Vasttapijt | Tarkett (Desso) | 44 | 0 | 44 | – | – | – | – | 0 |
| Tapijten | Vloerkleed | Lalee | 84 | 84 | 0 | stuk 84 | € 19,00 | € 49,00 | € 295,00 | 0 |
| Tapijten | Vloerkleed | Louis De Poortere | 36 | 0 | 36 | – | – | – | – | 0 |
| Tapijten | Vloerkleed | Ragolle | 52 | 52 | 0 | stuk 52 | € 39,00 | € 84,50 | € 215,00 | 0 |
| Vloerbekleding | Tapijtloper | Associated Weavers | 16 | 0 | 16 | – | – | – | – | 0 |
| Vloerbekleding | Tapijttegel | Balsan | 6 | 0 | 6 | – | – | – | – | 0 |
| Vloerbekleding | Tapijttegel | Tarkett (Desso) | 50 | 0 | 50 | – | – | – | – | 0 |
| Vloerbekleding | Vasttapijt | Associated Weavers | 113 | 0 | 113 | – | – | – | – | 0 |
| Vloerbekleding | Vasttapijt | Balsan | 20 | 0 | 20 | – | – | – | – | 0 |
| Vloerbekleding | Vasttapijt | Lano | 44 | 0 | 44 | – | – | – | – | 0 |
| Vloerbekleding | Vasttapijt | Tarkett (Desso) | 2 | 0 | 2 | – | – | – | – | 0 |
| Vloerbekleding | Vinylvloer | Beauflor | 212 | 212 | 0 | m2 212 | € 10,99 | € 18,49 | € 24,99 | 4 |
| Vloerbekleding | Vinylvloer | Gerflor | 12 | 12 | 0 | m2 12 | € 12,99 | € 27,25 | € 55,48 | 1 |
| Vloerbekleding | Vinylvloer | Tarkett | 53 | 53 | 0 | m2 53 | € 12,99 | € 18,99 | € 26,50 | 7 |
| **Totaal** | | | **4070** | **2642** | **1428** | | | | | |

**Uitschieters** (meer dan het dubbele of minder dan de helft van de mediaan van type + merk + eenheid): 114 producten. Ik heb ze per groep bekeken:

- **Verklaarbaar:** ESTAhome "XXL behang" (41 producten, € 148,95 per rol tegenover een mediaan van € 51,95: bredere rollen), Lalee Lachute, Lamego, Lech en Laos (enkel grote maten of handgemaakt), ESTAhome muurstickers van € 123–145 (groot formaat). Geen bevinding.
- **Gerflor Senso Wallstreet (€ 55,48 / m²) en Senso Premium (€ 48,90 / m²):** de rest van de vinyl kost € 10,99 tot € 26,50 per m². De doos bevat 2,22 m² en 2,04 m². Zie R6-30.
- **Vloerkleden per m², per kleur gerekend** (1.089 varianten): Lalee mediaan € 39 per m² (van € 13 tot € 292), Ragolle mediaan € 54 (van € 25 tot € 99). Eén variant wijkt meer dan het dubbele af van de rest van haar eigen product: Mehari 0474, Rond Ø 200 cm, € 80 (€ 25 per m², de andere maten € 53).
- **Grotere maat goedkoper dan een kleinere:** 26 paren in 5 producten. Vier daarvan zijn ronde maten die meer kosten dan een grotere rechthoek (Rampur 0098, 0477 en 0600, Ripley 0034): dat is gebruikelijk. Enkel Mehari 0474 valt uit de toon (rond Ø 200 cm € 80, 120 × 170 cm € 129).
- **Centen tussen ronde bedragen:** enkel Rampur 0600. Rond Ø 120 cm € 86,99 (3 kleuren) en Rond Ø 160 cm € 159,60. Dezelfde maat kost in een andere kleur € 159 en € 179: drie prijzen voor Rond Ø 160 cm.
- **Zelfde maat, andere prijs per kleur:** 20 gevallen, allemaal Rampur 0600 en Rampur 0445 (bv. 80 × 150 cm: € 79 en € 89). Kan kloppen (ander garen), maar de kaart zegt enkel "vanaf".
- **Zelfde tapijt, twee namen, twee prijzen:** Mehari 0098 en Rampur 0098. Zie R6-34.

Mehari 0474 en Rampur 0600 staan al in de vragen aan Brunic (vraag 3, R6-41).

**Eenheid tegenover de tekst:**

| Controle | Resultaat | Oordeel |
|---|---|---|
| Producten met een prijs waar "doos" in tekst of kenmerken staat | 3, allemaal Gerflor: Prime Zelfklevend 1m² (€ 12,99 / m², doos van 1,00 m², 11 tegels), Senso Wallstreet (€ 55,48 / m², doos van 2,22 m²), Senso Premium (€ 48,90 / m², 7 tegels van 73 × 39,9 cm = 2,04 m²) | Te verifiëren (R6-30) |
| Verkoopeenheid per type | Behang per rol (1.908 met prijs, 352 op aanvraag) · Fotobehang en Wanddecoratie per stuk (321) · Vinyl per m² (277) · Vloerkleed per stuk (136 + 36) · Gordijnstof per lopende meter (574, op aanvraag) · Vasttapijt per m² (233, op aanvraag) | In orde |
| "Per stuk" als terugval | Tapijttegel (56), Tapijtloper (16), Passement (18), Fotobehang op maat (143): allemaal op aanvraag | Bekend (TODO B08) |
| Afmeting van de rol bij behang per rol | 1.908 van de 1.908 hebben er een (53 cm × 10,05 m bij 1.858) | In orde |
| Vinyl: "Min. 1 m², per 1 m²" met een keuze Breedte (2, 3, 4 m) | 268 van de 277 | Bekend (TODO B18): de klant kiest vierkante meters van een rol met een vaste breedte |
| Aanbiedingen | 12, allemaal vinyl (Tarkett 7, Beauflor 4, Gerflor 1), korting 12% tot 45%, doorstreepte prijs telkens hoger | In orde |

**Winkelmand en kassa (enkel in de code gelezen, niet in de browser getest).** `src/app/api/kassa/route.ts:85-90` stuurt per regel enkel de variant en het aantal naar Shopify. De eenheid gaat niet mee (TODO B18). Voor Senso Wallstreet betekent dat: wie op de pagina "3 m²" kiest, rekent 3 × € 55,48 af, zonder dat de kassa zegt of dat 3 m² of 3 dozen (6,66 m²) is. De kassa weigert live elke variant zonder prijs, met `brunic.etalage = true` of die niet te koop is (`route.ts:74-83`). `cart-view.tsx` toont de eenheid achter de prijs (`:176`), "1 rol" en "2 rollen" correct (`:188`), "Art.nr." (`:155`, zie R6-19), en als enige voorraadtekst "Deze uitvoering is intussen uitverkocht" (`:182`) en "Dit product is niet meer beschikbaar" (`:132`). Dat is toegelaten: geen "op voorraad", geen levertermijn.

### 4.6 Taal

| Controle | Resultaat | Oordeel |
|---|---|---|
| je, jij, jou, jouw, jullie op de 78 vaste pagina's | 0 | In orde |
| je, jij, jou, jouw, jullie in de productdata | **104 producten** (Boråstapeter 47, Louis De Poortere 36, Tarkett 20, ESTAhome 1). Alle zinnen gelezen. Bv. "Hang het in je woonkamer, eetkamer of keuken", "op maat gemaakt voor jouw muur", "vooruitgang die je kunt nagaan" | Fout (R6-09): de regel is nl-BE in de u-vorm |
| Engels, Frans, Zweeds of Duits in lopende tekst | 0 zinnen | In orde |
| Engels in kenmerken | Zie §4.4 | Verbeterpunt (R6-49) |
| Collectienamen in het Engels ("Black & White with a splash of Gold", "Letter to the sun") | Productnamen van de leverancier | Geen punt |
| `lang` van de pagina | `nl-BE` op alle 78 | In orde |

### 4.7 Links en vaste pagina's

- **Links:** vanaf home 78 pagina's gevolgd (menu, footer, tegels, landingspagina's, diensten, info, artikels, merken) en alle 1.089 interne doelen opgevraagd, waaronder 1.003 productlinks: **allemaal 200**. Geen enkele productlink wijst buiten de catalogus.
- **Extern:** Facebook, Instagram en Google Maps. `tel:+3254337352` en `mailto:info@brunic.be` op elke pagina.
- **Koppen:** elke pagina heeft één h1, zonder sprongen in het niveau. Uitzondering: `/winkelmand` heeft geen h1 in de server-HTML (de pagina wordt in de browser opgebouwd).
- **Verborgen afdelingen:** `/catalogus/raamdecoratie`, `/verf` en `/slapen-en-wonen` geven 404 en staan niet in het menu. De 404-pagina ("Deze pagina bestaat niet (meer)") biedt de zoekfunctie, de vier afdelingen en de startpagina.
- **Doorverwijzingen:** `/merken/desso` → `/merken/tarkett` (308), `/shop` → `/catalogus`, `/contact` → `/winkel-en-contact`. De vijf oude Boråstapeter-URL's geven nog 404 (R6-13).
- **Tegels:** op `/catalogus/behang` delen Babybehang en Jeugdbehang meisjes hetzelfde beeld (R6-50). Elders geen dubbels, geen tegel zonder beeld.
- **Intro's tegenover de catalogus:**

| Pagina | Wat de tekst noemt | Wat er staat | Oordeel |
|---|---|---|---|
| `/catalogus/gordijnen-en-stoffen` | ADO, Artelux, Loft79 | ADO 442, Artelux 84, Loft79 66 | In orde |
| `/catalogus/behang` | "Behang en wandbekleding van Arte en Boråstapeter … collecties als Flamant en Missoni Home … wandbekleding van Arte vaak per lopende meter" | ESTAhome 1.600, Origin 591, Boråstapeter 495, Walls4You 21, Sanders & Sanders 17. **Arte: 0** | Fout (R6-25) |
| Home, tegel "Behang met karakter" | "Arte en Boråstapeter: van bloemen tot panoramische wanden" | Arte: 0 producten | Fout (R6-25) |
| `/catalogus/vloerbekleding` | "Vasttapijt maakt een ruimte warm…" Associated Weavers, Desso, Lano, Balsan, Tarkett. **Geen woord over vinyl** | Vinyl is de grootste groep: 277 van de 582 (Beauflor 212, Tarkett 53, Gerflor 12) | Fout (R6-25) |
| `/catalogus/tapijten` | Louis De Poortere, Desso, Tarkett | Lalee 84, Tarkett 54, Ragolle 52, Louis De Poortere 36. Lalee en Ragolle ontbreken | Fout (R6-25) |
| `/merken/<merk>` (17 pagina's) | "Ontdek N producten van X in onze webshop: …" met het juiste aantal en de juiste types | Klopt overal | In orde |

De code heeft voor Behang al een juiste tekst (`categorie-teksten.ts`: "ESTAhome, Origin Wallcoverings en het Zweedse Boråstapeter"), maar productie toont een andere. Die komt uit het metaobject `categorie_inhoud` in Shopify: de inhoud uit de admin gaat voor op de standaardtekst (`lib/inhoud/categorie.ts:31`).

### 4.8 Wat machines lezen

664 productpagina's van productie (alle 277 vinyl, 16 per merk en type, alle aanbiedingen, alle producten met één foto):

| Controle | Resultaat | Oordeel |
|---|---|---|
| h1 = productnaam | 664 van 664 | In orde |
| Titel bevat de productnaam, metabeschrijving van minstens 50 tekens | 664 van 664 | In orde |
| Canonical = `https://www.brunic.be/product/<slug>` | 664 van 664 | In orde |
| Prijs in de structured data = laagste prijs op de kaart | 437 van 437. Geen `offers` bij producten op aanvraag | In orde |
| Eenheid in de structured data | "per m²" bij alle 277 vinyl. Per rol en per stuk: geen eenheid, bewust (`seo.ts:119`) | In orde |
| Merk in de structured data | Overal Tarkett, nergens Desso | In orde (regel) |
| `availability` | 0 keer | In orde (regel) |
| Levertijd in de structured data | 1 keer: Goodnight, in `description` | Fout (R6-10) |
| `og:image` en eerste beeld in de structured data = eerste foto op de pagina | **593 van 664. 71 wijken af** (andere kleur dan de pagina toont) | Verbeterpunt (R6-46) |
| Eerste foto van de standaardvariant staat in de server-HTML | 664 van 664 | In orde |
| `robots` | `noindex, nofollow` op elke productpagina, `noindex, follow` op gefilterde lijsten en zoeken. `robots.txt`: `Disallow: /` | Bewust tot de livegang (`SITE_INDEXEREN`), geen bevinding |
| Sitemap | 4.146 URL's op `www.brunic.be`, waarvan 4.070 producten: dezelfde als de catalogus | In orde |

### 4.9 Beeldlabels en herkomst

| Merk | Producten | Foto's | Zonder label (overig) | Kaart begint met overig | Kaart met productfoto / detail | Kaart begint met sfeer- of rolfoto | Kaart met hover | Geen hover | Eén foto |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ESTAhome | 1600 | 14380 | 2798 (19%) | 0 | 1600 / 0 | 0 | 1600 | 0 | 0 |
| Origin Wallcoverings | 591 | 5220 | 1095 (21%) | 0 | 591 / 0 | 0 | 591 | 0 | 0 |
| Boråstapeter | 495 | 3574 | 252 (7%) | 139 | 98 / 258 | 0 | 350 | 145 | 1 |
| ADO | 442 | 7066 | 83 (1%) | 0 | 438 / 4 | 0 | 417 | 25 | 11 |
| Beauflor | 212 | 820 | 72 (9%) | 31 | 181 / 0 | 0 | 190 | 22 | 17 |
| Tarkett | 159 | 1401 | 130 (9%) | 53 | 106 / 0 | 0 | 15 | 144 | 18 |
| Associated Weavers | 129 | 2463 | 0 (0%) | 0 | 129 / 0 | 0 | 128 | 1 | 0 |
| Artelux | 84 | 1431 | 50 (3%) | 0 | 84 / 0 | 0 | 81 | 3 | 0 |
| Lalee | 84 | 871 | 27 (3%) | 0 | 84 / 0 | 0 | 78 | 6 | 6 |
| Loft79 | 66 | 1005 | 17 (2%) | 0 | 66 / 0 | 0 | 63 | 3 | 0 |
| Ragolle | 52 | 420 | 0 (0%) | 0 | 52 / 0 | 0 | 38 | 14 | 12 |
| Lano | 44 | 801 | 0 (0%) | 0 | 44 / 0 | 0 | 44 | 0 | 0 |
| Louis De Poortere | 36 | 1301 | 0 (0%) | 0 | 36 / 0 | 0 | 36 | 0 | 0 |
| Balsan | 26 | 802 | 8 (1%) | 0 | 26 / 0 | 0 | 24 | 2 | 0 |
| Walls4You | 21 | 136 | 21 (15%) | 0 | 21 / 0 | 0 | 21 | 0 | 0 |
| Sanders & Sanders | 17 | 155 | 31 (20%) | 0 | 17 / 0 | 0 | 17 | 0 | 0 |
| Gerflor | 12 | 105 | 105 (100%) | 12 | 0 / 0 | 0 | 12 | 0 | 0 |
| **Totaal** | **4070** | **41951** | **4689 (11%)** | **235** | | **0** | **3705** | **365** | **65** |

**Herkomst volgens de bestandsnaam** (41.951 unieke foto's):

| Spoor | Aantal | Oordeel |
|---|---:|---|
| Amazon (`_AC_SX…`, `_AC_SY…`) | 2, Prime Zelfklevend 1m² | Te verifiëren (R6-33), al gevraagd |
| Facebook of Instagram (`…_n.jpg`) | 1, Kindervinyl Trude | Te verifiëren (R6-33), al gevraagd |
| Stockbureaus, Pinterest, WhatsApp, screenshots, camerabestanden, "download", "untitled" | 0 | In orde |
| "gemini", "dalle" | 149 | Vals alarm: productnamen (Associated Weavers Gemini, Balsan Ultrasoft Dalle) |
| "kopie" | 3, van het product "Rose Magnifique (kopie)" | Zie R6-29 |
| Lange cijferreeks als naam | 70 (Tarkett 36, Beauflor 34) | Waarschijnlijk leverancierscodes |

**Alle 41.951 beeld-URL's** antwoorden met 200 en een beeldtype (HEAD, hoogstens 8 tegelijk). Twee bestanden zijn kleiner dan 3 kB: `1976551261-1.jpg` (DJ Black Uni, 916 byte, egaal zwart, het hoverbeeld) en `solid_999e_cv_beauflor_psh.jpg` (Fairplay Solid, 2.172 byte, effen). 26 bestanden zijn groter dan 5 MB (Louis De Poortere 13, Ragolle 12, Lalee 1, tot 12,2 MB), maar de site vraagt ze verkleind op.

**Hetzelfde beeld op twee plaatsen.** De CDN geeft geen ETag, wel de bestandsgrootte. Gelijke grootte alleen bewijst niets (2.101 toevalstreffers tussen willekeurige producten), dus telde ik enkel productparen met dezelfde hash in de bestandsnaam of met minstens drie bestanden van gelijke grootte binnen één merk, en heb ik de beelden zelf bekeken (`r6-contact-gelijk-bestand-producten.jpg`, `-kleuren.jpg`).

- **28 groepen van samen 62 producten tonen dezelfde foto's en hetzelfde kaartbeeld** onder een andere naam. Bij 13 groepen (Beauflor, Lano, Balsan) gaat het om hetzelfde dessin in twee kwaliteiten en zegt de naam dat. De andere 15 zijn te verifiëren: Mehari 0098 en Rampur 0098 (R6-34) en 14 groepen van Associated Weavers, ESTAhome en Lalee (R6-35):

| Merk | Producten met dezelfde foto's en hetzelfde kaartbeeld | Aantal |
|---|---|---:|
| Associated Weavers | Lustre (`vasttapijt-lustre-associated-weavers`) · Parana (`vasttapijt-parana-associated-weavers`) · Liris (`vasttapijt-liris-associated-weavers`) · Orinoco (`vasttapijt-orinoco-associated-weavers`) · Rubico (`vasttapijt-rubico-associated-weavers`) · Rio Grande (`vasttapijt-rio-grande-associated-weavers`) · Verdant (`vasttapijt-verdant-associated-weavers`) | 7 |
| Associated Weavers | Summit (`vasttapijt-summit-associated-weavers`) · Yukon (`vasttapijt-yukon-associated-weavers`) · Numicus (`vasttapijt-numicus-associated-weavers`) | 3 |
| Balsan | Ultrasoft Dalle (`tapijttegel-ultrasoft-dalle-balsan`) · Ultrasoft Dalle Sonic Confort (`tapijttegel-ultrasoft-dalle-sonic-confort-balsan`) | 2 |
| Associated Weavers | Pontus (`vasttapijt-pontus-associated-weavers`) · Varuna (`vasttapijt-varuna-associated-weavers`) | 2 |
| Associated Weavers | Kai (`vasttapijt-kai-associated-weavers`) · Pisces (`vasttapijt-pisces-associated-weavers`) | 2 |
| Associated Weavers | Galatea (`vasttapijt-galatea-associated-weavers`) · Yara (`vasttapijt-yara-associated-weavers`) | 2 |
| Associated Weavers | Elegance (`vasttapijt-elegance-associated-weavers`) · Silk (`vasttapijt-silk-associated-weavers`) | 2 |
| Associated Weavers | Hydra (`vasttapijt-hydra-associated-weavers`) · Oshun (`vasttapijt-oshun-associated-weavers`) | 2 |
| Associated Weavers | Orion (`vasttapijt-orion-associated-weavers`) · Stellar (`vasttapijt-stellar-associated-weavers`) | 2 |
| Ragolle | Mehari 0098 (`vloerkleed-mehari-0098-ragolle`) · Rampur 0098 (`vloerkleed-rampur-0098-ragolle`) | 2 |
| Lano | Heathertwist Elite (`vasttapijt-heathertwist-elite-lano`) · Heathertwist Supreme (`vasttapijt-heathertwist-supreme-lano`) | 2 |
| Lano | Startwist Elite (`vasttapijt-startwist-elite-lano`) · Startwist Supreme (`vasttapijt-startwist-supreme-lano`) | 2 |
| Associated Weavers | Apex (`vasttapijt-apex-associated-weavers`) · Esprit (`vasttapijt-esprit-associated-weavers`) | 2 |
| Associated Weavers | Impulse (`vasttapijt-impulse-associated-weavers`) · Serpentine (`vasttapijt-serpentine-associated-weavers`) | 2 |
| Associated Weavers | Livia (`vasttapijt-livia-associated-weavers`) · Tessa (`vasttapijt-tessa-associated-weavers`) | 2 |
| Beauflor | Quintex Gambel Oak (`vinyl-quintex-gambel-oak-beauflor`) · Tex-Style Gambel Oak (`vinyl-tex-style-gambel-oak-beauflor`) | 2 |
| ESTAhome | Krijtbord magneetbehang zwart (`behang-krijtbord-magneetbehang-zwart-estahome`) · Krijtbord magneetbehang zwart (`behang-krijtbord-magneetbehang-zwart-estahome-scandi-cool`) | 2 |
| Lalee | Laos PMO 901 (`vloerkleed-laos-pmo-901-lalee`) · Laos PMO 902 (`vloerkleed-laos-pmo-902-lalee`) | 2 |
| Beauflor | Quintex Disa (`vinyl-quintex-disa-beauflor`) · Tex-Style Disa (`vinyl-tex-style-disa-beauflor`) | 2 |
| Beauflor | Quintex Greenock (`vinyl-quintex-greenock-beauflor`) · Tex-Style Greenock (`vinyl-tex-style-greenock-beauflor`) | 2 |
| Beauflor | Quintex Havanna Oak (`vinyl-quintex-havanna-oak-beauflor`) · Tex-Style Havanna Oak (`vinyl-tex-style-havanna-oak-beauflor`) | 2 |
| ESTAhome | XXL behang bladzijden botanisch bloemen en planten boek groen (`xxl-behang-bladzijden-botanisch-bloemen-en-planten-boek-groen-estahome`) · XXL behang bladzijden botanisch bloemen en planten boek licht warm grijs en groen (`xxl-behang-bladzijden-botanisch-bloemen-en-planten-boek-licht-warm-grijs-en-groen-estahome`) | 2 |
| Beauflor | Feelings Chapman Oak (`vinyl-feelings-chapman-oak-beauflor`) · Plaza Chapman Oak (`vinyl-plaza-chapman-oak-beauflor`) | 2 |
| Beauflor | Atlantic Midas (`vinyl-atlantic-midas-beauflor`) · Smartex Midas (`vinyl-smartex-midas-beauflor`) | 2 |
| Beauflor | Atlantic Zinc (`vinyl-atlantic-zinc-beauflor`) · Fairplay Zinc (`vinyl-fairplay-zinc-beauflor`) | 2 |
| Beauflor | Quintex Lime Oak (`vinyl-quintex-lime-oak-beauflor`) · Tex-Style Lime Oak (`vinyl-tex-style-lime-oak-beauflor`) | 2 |
| Beauflor | Inspire Pure Oak (`vinyl-inspire-pure-oak-beauflor`) · Plaza Pure Oak (`vinyl-plaza-pure-oak-beauflor`) | 2 |
| Beauflor | Quintex Treviso (`vinyl-quintex-treviso-beauflor`) · Tex-Style Treviso (`vinyl-tex-style-treviso-beauflor`) | 2 |

- **Twee kleuren van één product met dezelfde foto's:** Liski DAM 213, Lichttaupe en Taupe (4 van de 4 foto's gelijk, bekeken) en Rampur 0500, kleur 4258 en 6258 (productfoto gelijk, bekeken). Zie R6-35. Een derde treffer, Good Vibes Dimout FR 191 en 996, bleek toeval: andere foto's.
- **Eén bestand als variantfoto bij twee kleuren:** 15 producten, dezelfde als op 03/11 (R6-08, R6-42).
- **Dubbele foto binnen één galerij:** 0 op URL. Op grootte één geval (Playcity, Multi 97), niet bekeken.

**Uitsnede en scherpte van het eerste beeld**, gerekend op de afmetingen in Shopify, voor het kader van de kaart (4:3):

| Afdeling · merk | Kaarten | Staand eerste beeld | Past heel (contain) | >25% valt weg (cover, 4:3) | Gemiddeld weg | Leeg kader bij contain (gem.) | Breedte < 600 px | < 800 px | Mediane breedte |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Behang · Boråstapeter | 495 | 146 | 0 | 175 (35%) | 29% | – | 90 | 337 | 600 px |
| Behang · ESTAhome | 1600 | 225 | 0 | 228 (14%) | 28% | – | 5 | 14 | 1500 px |
| Behang · Origin Wallcoverings | 591 | 23 | 0 | 23 (4%) | 26% | – | 2 | 2 | 1500 px |
| Behang · Sanders & Sanders | 17 | 1 | 0 | 1 (6%) | 27% | – | 0 | 0 | 1500 px |
| Behang · Walls4You | 21 | 0 | 0 | 0 (0%) | 25% | – | 0 | 0 | 1500 px |
| Gordijnen & stoffen · ADO | 442 | 172 | 0 | 192 (43%) | 31% | – | 7 | 19 | 1500 px |
| Gordijnen & stoffen · Artelux | 84 | 2 | 0 | 2 (2%) | 25% | – | 0 | 0 | 2048 px |
| Gordijnen & stoffen · Loft79 | 66 | 0 | 0 | 0 (0%) | 25% | – | 0 | 0 | 2048 px |
| Tapijten · Lalee | 84 | 83 | 84 | 0 (0%) | 0% | 50% | 5 | 80 | 600 px |
| Tapijten · Louis De Poortere | 36 | 36 | 36 | 0 (0%) | 0% | 45% | 0 | 0 | 1504 px |
| Tapijten · Ragolle | 52 | 40 | 52 | 0 (0%) | 0% | 50% | 2 | 2 | 2825 px |
| Tapijten · Tarkett | 54 | 1 | 0 | 1 (2%) | 25% | – | 0 | 0 | 960 px |
| Vloerbekleding · Associated Weavers | 129 | 0 | 0 | 0 (0%) | 25% | – | 1 | 1 | 1200 px |
| Vloerbekleding · Balsan | 26 | 3 | 0 | 3 (12%) | 25% | – | 4 | 4 | 2048 px |
| Vloerbekleding · Beauflor | 212 | 45 | 0 | 75 (35%) | 27% | – | 1 | 22 | 1000 px |
| Vloerbekleding · Gerflor | 12 | 7 | 0 | 10 (83%) | 36% | – | 0 | 1 | 1329.5 px |
| Vloerbekleding · Lano | 44 | 2 | 0 | 2 (5%) | 4% | – | 0 | 2 | 1417 px |
| Vloerbekleding · Tarkett | 105 | 0 | 0 | 10 (10%) | 25% | – | 1 | 1 | 960 px |

In de browser nagemeten (`naturalWidth` en `naturalHeight` tegenover het kader en `object-fit`): zie §11.2. Vloerkleden passen nu heel in het kader (R5-06 opgelost). Bij behang en stof valt bij een staande foto meer dan een kwart weg, maar daar loopt het patroon door.

### 4.10 Namen

| Controle | Aantal | Oordeel |
|---|---:|---|
| Begint met een kleine letter | 45, allemaal Loft79 | Fout (R6-24) |
| Los teken, weggevallen letter | 0 (6 treffers zijn "a" in "with a splash of Gold") | In orde |
| Rare tekens, entiteiten, dubbele spaties | 0 | In orde |
| "(kopie)" in de titel | 1: Rose Magnifique (kopie) | Bekend (TODO B14), zie R6-29 |
| Tekens lijken te ontbreken (Boråstapeter) | 5: Noras ang, Skogsstjarna, Solangen, Tradgardsfrojd, Poeme d'amour. 26 van de 495 titels hebben wel speciale tekens | Te verifiëren (R6-40), al gevraagd |
| Alt-tekst noemt een ander product | 0 | In orde |
| Slug mist een woord uit de titel | 61, bijna allemaal de collectienaam na het streepje ("… – Brooklyn Bridge") | Onschuldig |
| Hernoemd product op de oude URL | `/product/behang-olivtr-d-borastapeter`: 404 | Fout (R6-13) |
| Zelfde titel binnen een merk | 69 titels, 150 producten (ESTAhome 50 titels, Origin 17) | Verbeterpunt (R6-51) |

### 4.11 Versheid

- **Momentopname van productie:** 03/11/2026 22:31 UTC, bij het begin en het einde van de audit. Ze is dus **negen dagen oud**. Er is sinds 03/11 geen nieuwe build geweest: zelfde momentopname, en de kaarten van alle 4.070 producten zijn byte voor byte gelijk aan die van de vorige ronde (`r5/prod-api.json`).
- **Is er in Shopify iets gewijzigd dat de site nog niet toont?** Dat kan ik niet zien. De vinylkleuren (R6-01) liggen sinds 02/11 klaar, en volgens de overdracht van 03/11 staan de webhooks nog niet aan. Te verifiëren door iemand met toegang tot Shopify (R6-36).
- **Live tegenover de momentopname:** `/api/producten?live=1` op 300 producten, 1.104 varianten: 0 afwijkingen. Alle 15.927 varianten staan op beschikbaar.
- **Lokale momentopname:** 02/11 19:35 UTC, dus ouder dan productie. Inhoud gelijk: zie §11.1.

### 4.12 Zoeken

Vaste reeks van 55 zoekopdrachten, bewaard in `%TEMP%\brunic-qa\r6\scripts\zoekopdrachten.json` voor de volgende ronde. "Kop" = het aantal in de zin boven de lijst, "Lijst" = het aantal in de lijst zelf.

| # | Zoekopdracht | Soort | Verwacht | Bij de eerste tien? | Kop | Lijst | Kop = lijst? | Lege staat: uitweg |
|---:|---|---|---|---|---:|---:|---|---|
| 1 | `Rampur 0600` | exacte productnaam | vloerkleed-rampur-0600-ragolle | ja | 1 | 1 | ja | – |
| 2 | `Rampur` | deel van de naam | rampur | ja | 19 | 19 | ja | – |
| 3 | `Lily Tree` | exacte productnaam | behang-lily-tree-borastapeter | ja | 1 | 1 | ja | – |
| 4 | `Papercut` | exacte productnaam | vloerkleed-papercut-louis-de-poortere | ja | 1 | 1 | ja | – |
| 5 | `RAMPUR 0600` | hoofdletters | vloerkleed-rampur-0600-ragolle | ja | 1 | 1 | ja | – |
| 6 | `kersenbloesems` | deel van de naam | kersenbloesem | ja | 4 | 4 | ja | – |
| 7 | `Bacopa Moonlight Cobble` | exacte productnaam | vinyl-bacopa-moonlight-cobble-beauflor | ja | 1 | 1 | ja | – |
| 8 | `Toscana B592` | exacte productnaam | vasttapijt-toscana-b592-desso | ja | 1 | 1 | ja | – |
| 9 | `Ragolle` | merk | Ragolle | ja | 52 | 52 | ja | – |
| 10 | `Borastapeter` | merk zonder speciale tekens | Boråstapeter | ja | 495 | 495 | ja | – |
| 11 | `Boråstapeter` | merk met speciale tekens | Boråstapeter | ja | 495 | 495 | ja | – |
| 12 | `Louis De Poortere` | merk (meerdere woorden) | Louis De Poortere | ja | 36 | 36 | ja | – |
| 13 | `Desso` | merk dat onder een ander valt | Desso | ja | 97 | 97 | ja | – |
| 14 | `Tarkett` | merk | Tarkett | ja | 159 | 159 | ja | – |
| 15 | `Sanders & Sanders` | merk met & | Sanders & Sanders | ja | 17 | 17 | ja | – |
| 16 | `blauw` | kleurnaam | ≥ 100 | ja | 562 | 562 | ja | – |
| 17 | `Columbus Gold` | kleurnaam van een variant | vloerkleed-griff-louis-de-poortere | ja | 1 | 1 | ja | – |
| 18 | `antraciet` | kleurnaam | ≥ 50 | ja | 186 | 186 | ja | – |
| 19 | `901D` | kleurcode | vinyl-barinas-inspire-modena-beauflor | ja | 2 | 2 | ja | – |
| 20 | `162L` | kleurcode | vinyl-easytex-westbury-beauflor | ja | 2 | 2 | ja | – |
| 21 | `Nordic Folk` | collectie | ≥ 9 | ja | 9 | 9 | ja | – |
| 22 | `Letter to the sun` | collectie | gordijnstof-movement-ado | ja | 9 | 9 | ja | – |
| 23 | `vloerkleed` | type enkelvoud | Vloerkleed | ja | 172 | 172 | ja | – |
| 24 | `vloerkleden` | type meervoud | Vloerkleed | **nee** | 0 | – | – | 7 suggesties |
| 25 | `gordijnstof` | type enkelvoud | Gordijnstof | ja | 574 | 574 | ja | – |
| 26 | `gordijnstoffen` | type meervoud | Gordijnstof | **nee** | 0 | – | – | 7 suggesties |
| 27 | `tapijttegel` | type enkelvoud | Tapijttegel | ja | 56 | 56 | ja | – |
| 28 | `tapijttegels` | type meervoud | Tapijttegel | **nee** | 0 | – | – | 7 suggesties |
| 29 | `vinyl` | type (deel) | Vinylvloer | **nee** | 298 | 298 | ja | – |
| 30 | `fotobehang` | type | ≥ 280 | ja | 427 | 427 | ja | – |
| 31 | `gordijnen` | gewoon woord van de klant | ≥ 100 | ja | 592 | 592 | ja | – |
| 32 | `tapijt` | gewoon woord van de klant | ≥ 100 | ja | 493 | 493 | ja | – |
| 33 | `vloerkled` | tikfout | Vloerkleed | **nee** | 0 | – | – | 7 suggesties |
| 34 | `Rampor` | tikfout | rampur | **nee** | 0 | – | – | 7 suggesties |
| 35 | `behnag` | tikfout | ≥ 1 | **nee** | 0 | – | – | 7 suggesties |
| 36 | `xyzzyqq` | woord dat nergens voorkomt | geen resultaat | ja | 0 | – | – | 7 suggesties |
| 37 | `3390 / 110` | artikelnummer | gordijnstof-movement-ado | ja | 1 | 1 | ja | – |
| 38 | `131367` | artikelnummer | behang-3d-golvende-lijnen-aubergine-paars-estahome | ja | 1 | 1 | ja | – |
| 39 | `macrame` | zonder accent | macram | ja | 16 | 16 | ja | – |
| 40 | `macramé` | met accent | macram | ja | 16 | 16 | ja | – |
| 41 | `grijs vloerkleed` | twee woorden uit twee velden | Vloerkleed | ja | 71 | 71 | ja | – |
| 42 | `Tarkett vinyl` | merk + type | Vinylvloer | ja | 53 | 53 | ja | – |
| 43 | `blauw behang bloemen` | drie woorden | ≥ 5 | ja | 52 | 52 | ja | – |
| 44 | `Olivträd` | hernoemd product | oliv | ja | 1 | 1 | ja | – |
| 45 | `Olivtrad` | hernoemd product zonder tekens | oliv | ja | 1 | 1 | ja | – |
| 46 | `verduisterend` | suggestie van de site | ≥ 1 | ja | 34 | 34 | ja | – |
| 47 | `linnen` | suggestie van de site | ≥ 1 | ja | 76 | 76 | ja | – |
| 48 | `bloemen` | suggestie van de site | ≥ 1 | ja | 382 | 382 | ja | – |
| 49 | `vasttapijt` | suggestie van de site | Vasttapijt | ja | 233 | 233 | ja | – |
| 50 | `brandvrij` | suggestie van de site | ≥ 1 | ja | 96 | 96 | ja | – |
| 51 | `kinderkamer` | ruimte | ≥ 100 | ja | 701 | 701 | ja | – |
| 52 | `rond tapijt` | vorm + gewoon woord | ≥ 10 | ja | 25 | 25 | ja | – |
| 53 | `wasbaar` | eigenschap | ≥ 100 | ja | 614 | 614 | ja | – |
| 54 | `opmeting` | dienst (geen product) | geen resultaat | ja | 0 | – | – | 7 suggesties |
| 55 | `a` | één teken | ≥ 1 | ja | 4070 | 4070 | ja | – |

- **48 van de 55 doen wat de klant verwacht.** Exacte naam, deel van de naam, merk met en zonder speciale tekens, kleurnaam, kleurcode, collectie, artikelnummer, accenten, hoofdletters en combinaties van woorden werken.
- **Meervoud geeft niets:** "vloerkleden", "gordijnstoffen" en "tapijttegels" geven 0 producten, het enkelvoud 172, 574 en 56 (R6-06).
- **"vinyl" toont eerst muurstickers:** 298 resultaten, de eerste tien zijn wanddecoratie van ESTAhome (materiaal vinyl). De 277 vinylvloeren komen daarna (R6-07).
- **Tikfouten geven niets** ("vloerkled", "Rampor", "behnag"). De lege staat biedt zeven suggesties, geen "bedoelde u…" (R6-52).
- **Desso:** 97 producten, 3 ontbreken (R6-11).
- **Kop = lijst** bij alle 47 zoekopdrachten met resultaat. Met een filter erbij loopt het uiteen (R6-17).
- **Lege staat:** uitleg en zeven suggesties, die alle zeven resultaten geven. Bij "opmeting" (een dienst) verwijst ze niet naar de dienstpagina (R6-52).

---

### 4.13 Snelheid en server-HTML

**Labmeting op mobiel** (390 × 844, processor vier keer trager, trage 4G: 1,6 Mbit/s omlaag, 750 kbit/s omhoog, 150 ms vertraging, zonder cache). LCP, CLS en lange taken via een `PerformanceObserver`, drie keer per pagina, de middelste telt. Productie, 12/11 rond 22:25.

| Pagina | LCP (middelste van 3) | De drie metingen | CLS | Lange taken | Blokkeertijd | Langste taak | TTFB | Gewicht | LCP-element |
|---|---:|---|---:|---:|---:|---:|---:|---:|---|
| `/` | 7,2 s | 8,9 s · 6,8 s · 7,2 s | 0 | 7 | 980 ms | 586 ms | 52 ms | 1424 kB, 92 verzoeken | IMG brunic-site-behang-floral-tree-borastapeter-cf99dec041.j |
| `/catalogus/gordijnen-en-stoffen?weergave=…` | 2,0 s | 2,0 s · 1,9 s · 2,3 s | 0 | 6 | 968 ms | 627 ms | 34 ms | 1630 kB, 251 verzoeken | H1 «Alle producten: Gordijnen & stoffen» 26208 |
| `/catalogus/behang?weergave=…` | 2,4 s | 2,4 s · 3,6 s · 2,3 s | 0,001 | 5 | 634 ms | 220 ms | 39 ms | 2112 kB, 251 verzoeken | H1 «Alle producten: Behang» 20244 |
| `/catalogus/vloerbekleding?weergave=…` | 2,3 s | 2,2 s · 2,6 s · 2,3 s | 0,001 | 8 | 1175 ms | 912 ms | 37 ms | 1842 kB, 251 verzoeken | H1 «Alle producten: Vloerbekleding» 20244 |
| `/catalogus/tapijten?weergave=…` | 2,2 s | 2,0 s · 2,5 s · 2,2 s | 0,001 | 3 | 425 ms | 313 ms | 33 ms | 2840 kB, 251 verzoeken | H1 «Alle producten: Tapijten» 20244 |
| `/product/gordijnstof-movement-ado` | 3,2 s | 3,2 s · 3,1 s · 3,2 s | 0,001 | 6 | 173 ms | 116 ms | 41 ms | 903 kB, 110 verzoeken | IMG gordijnstof-movement-ado-539b4dd2bc.jpg?v=1790776930&wid |
| `/product/vloerkleed-rampur-0600-ragolle` | 5,8 s | 5,3 s · 6,2 s · 5,8 s | 0 | 11 | 1169 ms | 633 ms | 40 ms | 1180 kB, 105 verzoeken | IMG rampur-0600-4747-07-foto_535ed737-b468-43f5-b873-7c659fd |
| `/product/vinyl-bacopa-moonlight-cobble-beauflor` | 2,5 s | 2,5 s · 2,9 s · 2,5 s | 0,0123 | 5 | 288 ms | 229 ms | 42 ms | 1000 kB, 79 verzoeken | IMG 1715036976.jpg?v=1792418266&width=540 113880 |
| `/op-maat-en-plaatsing/opmeting-aan-huis` | 4,3 s | 4,2 s · 4,3 s · 4,3 s | 0 | 4 | 277 ms | 256 ms | 39 ms | 900 kB, 100 verzoeken | IMG gordijnstof-stilla-ado-bdd614582a.jpg?v=1790779357&width |

**Tegenover de tabel "Metingen" in `TODO.md`** (Lighthouse op een lokale build, 30/09, dus een andere methode: enkel de richting telt):

| Pagina | TODO (30/09): LCP / blokkeertijd / CLS | Nu: LCP / blokkeertijd / CLS | Richting |
|---|---|---|---|
| `/` | 4,6 s / 170 ms / 0,012 | 7,2 s / 980 ms / 0 | Trager, te volgen (R6-70) |
| `/catalogus/behang?weergave=producten` | 6,4 s / 490 ms / 0,846 | 2,4 s / 634 ms / 0,001 | Veel beter: de lijst staat in de server-HTML |
| `/product/gordijnstof-movement-ado` | 5,6 s / 190 ms / 0,846 | 3,2 s / 173 ms / 0,001 | Veel beter (TODO B02 blijft opgelost) |
| `/op-maat-en-plaatsing/opmeting-aan-huis` | 4,6 s / 430 ms / 0,012 | 4,3 s / 277 ms / 0 | Gelijk |

Op 03/11 is de snelheid niet gemeten, dus dit is de nulmeting voor de volgende ronde.

- **CLS is overal in orde** (0 tot 0,012). De enige verschuiving: op de vinylpagina schuift het blok met de opties 0,011 op na 3,5 s.
- **Home is de traagste pagina.** Het LCP-element is de hero-foto (220 kB, `fetchpriority="high"`, vooraf geladen). Ze deelt de lijn met vijf vooraf geladen lettertypes (150 kB), acht vooraf geladen merklogo's (die de browser daarna niet gebruikt: R6-60) en twee andere grote beelden.
- **Lijsten: 246 verzoeken zonder te scrollen.** 168 daarvan zijn stalen van 96 px (samen 850 kB), voor alle 48 kaarten, terwijl er 8 kaarten in beeld staan. De kaartfoto's zelf laden wel pas bij het scrollen (44 van de 48 zijn `lazy`).
- **Rampur 0600: 5,8 s.** De pagina heeft 57 varianten, 36 foto's en 11 lange taken (1.169 ms blokkeertijd).
- **Let op bij R6-67:** een groter bestand voor de eerste productfoto maakt de LCP van de productpagina trager. Na die aanpassing opnieuw meten.

**Server-HTML zonder JavaScript** (gewone GET, 13 pagina's): de h1 staat in de HTML van home, 7 lijsten en 5 productpagina's. Elke lijst heeft haar 48 (of minder) kaarten in de HTML, met titel, prijs en beeld. Elke productpagina heeft h1, prijs, knop en beschrijving in de HTML. `?variant=` geeft dezelfde HTML als zonder: de variant wordt pas in de browser toegepast (R6-58). In de HTML van home en van de productpagina's staat nog één `BAILOUT_TO_CLIENT_SIDE_RENDERING`, maar niet voor de inhoud: h1, prijs en beschrijving staan erin. Uitzondering: `/winkelmand` heeft geen h1 in de server-HTML (in de browser wel: "Uw winkelmand is leeg").

### 4.14 Toegankelijkheid die te meten is

| Controle | Resultaat | Oordeel |
|---|---|---|
| Knoppen, links en velden zonder toegankelijke naam (`Accessibility.getFullAXTree`) | 0 op 11 pagina's (home, lijst, productpagina, contact, opmeting, verlanglijst, zoeken; desktop en mobiel, lade open) | In orde |
| Beelden zonder naam | 0 | In orde |
| Zichtbare focus | 70 stops op een lijst, 60 op een productpagina: allemaal met een ring en in beeld | In orde |
| Focus onder de kleverige balk | 0 van 80 stops | In orde (R5-13 opgelost) |
| Skiplink | "Naar de inhoud" is de eerste stop en zet de focus op `main` | In orde |
| Lightbox en optielade met het toetsenbord | Enter opent, pijltjes bladeren (1 / 7 → 2 / 7), focus blijft binnen, Escape sluit en geeft de focus terug | In orde |
| Focus na uitvinken in de lade | Valt weg naar `body` | Fout (R6-12) |
| Tikdoelen kleiner dan 24 × 24 px | "+N" op de kaart: 23 tot 31 × 17 px (18 op de eerste pagina van de stoffen). Kruimelpad: 21 px hoog. Stalen: 40 × 40 px (mobiel) en 44 × 44 px (desktop) | Verbeterpunt (R6-68), bekend TODO B20 |
| Volgorde van de koppen | Eén h1 op elke pagina. Op lijsten en bij zoeken h1 → h3 (de kaarten), zonder h2 | Verbeterpunt (R6-68), bekend TODO B20 |
| Landmarks | Vier `nav`-landmarks in de footer komen twee keer voor (Klantendienst, Over Brunic, Winkelen, Juridisch) | Verbeterpunt (R6-68), bekend TODO B20 |
| Beweging bij `prefers-reduced-motion` | De schuifbeweging van de header staat dan op `none`, er lopen geen animaties bij het scrollen of bij het openen van de lade. Kleurovergangen van 0,15 s blijven | In orde |
| Lettergrootte van invoervelden | 14 px in alle velden, 15 px in de keuzelijsten | Verbeterpunt (R6-59) |
| Taal van de pagina | `nl-BE` op alle 78 pagina's | In orde |
| Schermlezer | Niet te vervangen door een meting | Zie §12 |

---

## 5. Regels van de opdrachtgever

| Regel | Meting | Oordeel |
|---|---|---|
| Een sfeerfoto komt nooit eerst, tenzij die kleur niets anders heeft | Gelabelde foto's: 0 van de 4.070 kaarten begint met een sfeer- of rolfoto (eigen telling), en per kleur zijn er maar 8 die met een sfeerfoto beginnen, omdat ze niets anders hebben (§3.7). Met een filter: `test:filters` (537 geslaagd) bewaakt dit, niet zelf nagerekend. **Ongelabelde foto's: 28 vinylkaarten beginnen met een kamer, 25 daarvan hebben een vlakke foto** (R6-04), bekeken. | **Niet in orde** (ongewijzigd) |
| Geen voorraadtekst | 0 op 664 productpagina's, 0 in de structured data, 0 in de optielade en op de verlanglijst (browser). Winkelmand, enkel in de code gelezen: enkel "uitverkocht" en "niet meer beschikbaar". De kaart zegt "Online te bestellen" of "Advies en offerte in de winkel". Interne waarde `op-voorraad` in de pagina-data (R6-47). | In orde |
| Geen levertermijn | 274 producten met "Levertermijn" of "Levertijd" in de data: 0 zichtbaar. Eén zin in lopende tekst (R6-10). Aanverwant: "Leverbaar tot" (R6-37), "snelle levering in heel Europa" (R6-32). | **Bijna in orde** (ongewijzigd) |
| Desso valt onder Tarkett, zoeken op Desso blijft werken | Merk "Desso": nergens, ook niet in de structured data. `?merk=desso` filtert op Tarkett, `/merken/desso` → 308. Zoeken: 97 producten, 3 ontbreken (R6-11). | **Bijna in orde** (ongewijzigd) |
| Een kleurstaal is de vlakke foto van die kleur | 11.740 stalen zijn een foto, 11 een bolletje, en die 11 kleuren hebben geen vlakke foto. Bij de 28 vinylkaarten van R6-04 telt de kamer als "vlak": het staal is daar een miniatuurkamer. | In orde, op R6-04 na |
| Een dienst enkel beloven waar Brunic die levert | Productpagina's: behang verwijst naar de winkel en de stalenboeken (R5-08 opgelost, 32 van de 32 behangpagina's in de steekproef). Artikels over behang eindigen met "vraag een opmeting aan huis aan" (R6-26). De band "gratis opmeting aan huis" staat op elke pagina (vraag 6). | **Bijna in orde** |
| Alles wat de klant leest, is nl-BE in de u-vorm | Vaste pagina's: 0 keer je, jij, jouw of jullie op 78 pagina's. Productdata: 104 producten (R6-09). Engels in kenmerken (R6-49). | **Niet in orde** (nieuw gemeten) |
| Een oplossing mag geen nieuw conflict geven | De zeven oplossingen van 03/11 nagelopen (R5-04, -05, -06, -08, -13, -21, -43): geen ervan brak iets anders. Drie laten wel een rest na: de tabel is weg maar "Beste klanten," staat er nog (R6-05), vloerkleden passen heel maar de schuine Ragolle-opnamen vallen nu op (R6-43), en scrollen na een filter werkt behalve bovenaan de pagina op mobiel (R6-65). | In orde |
| `noindex` en `Disallow: /` | `noindex, nofollow` op alle pagina's, `Disallow: /` in `robots.txt`. | Bewust tot de livegang, geen bevinding |

---

## 6. Status per eerdere bevinding

Vorig rapport: `docs/audits/2026-11-03-webshop-qa/rapport.md` (R5), 59 bevindingen. **Opgelost** = opnieuw getest en weg. **Open** = opnieuw getest en nog aanwezig. Elk punt is deze ronde opnieuw getest, met de reproductie uit dat rapport. Wat als opgelost gemeld was in R4 en R3, is meegetest via de lijstcontrole (§11.1) en de browsertests: niets is teruggekomen.

| Punt | Onderwerp | Status 12/11 | Hoe nagekeken | Nu |
|---|---|---|---|---|
| R5-01 | Vinyl zonder filter Kleur | **Open**, ongewijzigd | Productielijst, data | R6-01 |
| R5-02 | Boråstapeter niet te vinden met de filters | **Open**, ongewijzigd | Productielijst, data | R6-02 |
| R5-03 | Kleur in de titel, niet in de filter | **Open** | Data | R6-03 |
| R5-04 | Na een filter vanaf een gescrolde positie ziet u de resultaten niet | **Opgelost** | Browser, desktop en mobiel: kort en lang resultaat, behang, sorteren, chip weg. De pagina gaat naar het begin van de lijst, balk en kaarten in beeld (`r6-desk-scroll-*.jpg`) | Rest: R6-65 |
| R5-05 | Tabel als lopende zin in de beschrijving | **Opgelost** (0 van de 4.070). De aanhef blijft | Data en 277 vinylpagina's van productie | R6-05 |
| R5-06 | Vloerkleed afgesneden op kaart en pagina | **Opgelost** | Browser: `object-fit: contain` op 171 kaarten en op de eerste foto van de pagina, 0% weg. Contactblad bekeken | Rest: R6-43 |
| R5-07 | Vinylkaart begint met een kamer | **Open**, ongewijzigd | Contactblad bekeken | R6-04 |
| R5-08 | Opmeting aan huis bij Boråstapeter | **Opgelost** | 664 pagina's: behang toont de winkeltekst | – |
| R5-09 | Toscana: rood op de kaart, blauw bij hover | **Open** | Bekeken | R6-08 |
| R5-10 | Goodnight: "korte levertijd" | **Open** | Pagina en structured data | R6-10 |
| R5-11 | 3 Desso-tapijten niet vindbaar op "Desso" | **Open** | Zoeken op productie | R6-11 |
| R5-12 | Focus valt weg in de lade | **Open** | Browser, desktop en mobiel | R6-12 |
| R5-13 | Focus verdwijnt onder de kleverige balk bij Shift+Tab | **Opgelost** | 40 stops terug en 40 vooruit: 0 onder de balk | – |
| R5-14 | Oude Boråstapeter-URL's geven 404 | **Open** | GET | R6-13 |
| R5-15 | `kleur=Multicolor` geeft 0 | **Open** | GET en browser | R6-14 |
| R5-16 | Vervallen parameters blijven in de URL | **Open** | Browser | R6-15 |
| R5-17 | "1 van 1 producten" | **Open** | GET | R6-16 |
| R5-18 | Zoekkop en lijst verschillen | **Open** (382 en 333) | GET | R6-17 |
| R5-19 | "Totaal voor 1 rollen" | **Open** | Browser | R6-18 |
| R5-20 | Art.nr. is een Shopify-ID | **Open**, 1.089 varianten | Data, browser | R6-19 |
| R5-21 | Overflow tussen 1.280 en 1.289 px | **Opgelost** | 0 px op 1.279, 1.280, 1.285, 1.289 en 1.290 px, op home, lijst en productpagina | – |
| R5-22 | Kleverige hover op touch | **Niet eenduidig** in de emulatie | Twee reeksen van 7 lijsten, met een verschillende uitkomst | R6-20 (nu te verifiëren) |
| R5-23 | Vegen in de lightbox | **Open** | Geëmuleerd | R6-21 |
| R5-24 | Twee keer "Kleur:" | **Open**, 13 producten | Data, browser | R6-22 |
| R5-25 | Prime: dessins zonder stalen | **Open** | Kaart van productie | R6-23 |
| R5-26 | Loft79 in kleine letters | **Open**, 45 | Data | R6-24 |
| R5-27 | Intro noemt niet wat er staat | **Open**, en breder dan gemeld | 78 pagina's gelezen | R6-25 |
| R5-28 | Senso: doosprijs als prijs per m² | **Open**, gevraagd, geen antwoord | Browser, data, code van de kassa | R6-30 |
| R5-29 | Garantietermijnen | **Open**, gevraagd. Uit de beschrijving verdwenen | Data | R6-31 |
| R5-30 | Tekst van Louis De Poortere | **Open**, gevraagd | Data | R6-32 |
| R5-31 | Beeldrechten, 3 foto's | **Open**, gevraagd | Bestandsnamen | R6-33 |
| R5-32 | Komen wijzigingen vanzelf op de site? | **Open**. De momentopname is 9 dagen oud | `/api/status` | R6-36 |
| R5-33 | Producten zonder prijs | **Open**, gevraagd. Cijfers gelijk | Data | R6-45 |
| R5-34 | "Leverbaar tot: 12/26" | **Open**, gevraagd | Browser | R6-37 |
| R5-35 | Servicebeloftes | **Open**, gevraagd | 78 pagina's | R6-38 |
| R5-36 | Ragolle: eerste beeld schuin of vaag | **Open** | Contactblad bekeken | R6-43 |
| R5-37 | Kleine bronfoto's (Lalee, Boråstapeter) | **Open**, gevraagd. Eerst R6-67 oplossen | Data | R6-44 |
| R5-38 | Prijzen die uit de toon vallen | **Open**, gevraagd. Extra geval gevonden | Data | R6-41 |
| R5-39 | Namen zonder speciale tekens | **Open**, gevraagd | Data | R6-40 |
| R5-40 | Samira oogt leeg | **Open**, gevraagd | Bekeken | R6-44 |
| R5-41 | Merkteken van de leverancier op de foto | **Open**, gevraagd | Eén voorbeeld bekeken | R6-44 |
| R5-42 | Foto aan een andere kleur, kleuren zonder foto | **Open** | Data, contactblad | R6-42 |
| R5-43 | Mobiel: "Alle filters" enkel bovenaan | **Opgelost**: bij omhoog scrollen verschijnt onderaan een knop "Filters" (99 × 40 px) | Browser. Ontwerpkeuze, nog te bevestigen volgens de overdracht | – |
| R5-44 | Filter met één waarde die alles dekt | **Open** (1.785 keer in 1.253 lijsten) | Productielijsten | R6-55 |
| R5-45 | Hover is een smalle strook | **Open**, 25 kaarten | Zelfde beelden, één bekeken | R6-56 |
| R5-46 | Hoverbeeld laadt pas bij de hover | **Open** (mediaan 734 ms) | 102 kaarten | R6-57 |
| R5-47 | `?variant=`: eerst de standaardkleur | **Open** (387 ms en 1.306 ms) | Per frame gemeten | R6-58 |
| R5-48 | `og:image` is niet het eerste beeld | **Open** (71 van 664, was 69 van 423) | Productie-HTML | R6-46 |
| R5-49 | `availability` in de pagina-data | **Open** | Productie-HTML | R6-47 |
| R5-50 | Zoekveld 14 px | **Open**, geldt voor alle velden | Browser | R6-59 |
| R5-51 | Preload-waarschuwing | **Open** | Console | R6-60 |
| R5-52 | Twee tegels met hetzelfde beeld | **Open** | Productie-HTML | R6-50 |
| R5-53 | Tab uit het paneel: het blijft open | **Open** | Browser | R6-61 |
| R5-54 | Optieknop met één waarde | **Open**, 2.693 producten | Data, browser | R6-62 |
| R5-55 | "hangt af van uw maten" bij vaste maten | **Open** | Browser | R6-48 |
| R5-56 | Schrijfwijze van kenmerken | **Open** | Data | R6-49 |
| R5-57 | Zelfde titel binnen een merk | **Open**, 69 titels | Data | R6-51 |
| R5-58 | Documentatie loopt achter | **Open** | Vergeleken | R6-63, §9 |
| R5-59 | Motief en Stijl overlappen | **Open** | Productielijst | R6-64 |

**Samengevat:** 7 opgelost (R5-04, -05, -06, -08, -13, -21, -43), 51 open, 1 niet eenduidig (R5-22). Niets is teruggekomen. Van de 51 open punten hangen er 17 af van een antwoord van Brunic (R5-10, -20, -27 tot -31, -33 tot -42). In `docs/vragen-aan-brunic.md` is nog geen enkel antwoord ingevuld.

**Oudere rondes:** de punten van R4 en R3 die op 03/11 als opgelost stonden, zijn meegetest. Prijs na een klik op een staal (R4-01): Rampur 0600, kaart "vanaf € 49", staal 7272 "vanaf € 49", pagina € 49. Kaart en pagina op hetzelfde beeld (R3-05, R4-02): 28 van de 28 op desktop, 14 van de 14 op mobiel, 14 van de 14 via een staal. Lege filtergroepen (R3-03): 0 in 1.253 lijsten. "Meer tonen" (R3-06): 96 kaarten, zelfde plek, focus op kaart 49. Lightbox: focusval in orde (6 Tab-stops blijven binnen). Lade (R3-01): Escape sluit ze en geeft de focus terug aan "Alle filters". De focusval van de lade zelf heb ik deze ronde niet opnieuw doorlopen.

---

## 7. Vragen aan Brunic

**Wat al gevraagd is, herhaal ik niet.** `docs/vragen-aan-brunic.md` (stand 03/11) bevat twaalf vragen. Op 12/11 is bij geen enkele een antwoord ingevuld: ze staan alle twaalf op "gevraagd, nog geen antwoord".

| Vraag in `vragen-aan-brunic.md` | Onderwerp | Bevinding nu | Dringend? |
|---|---|---|---|
| 1 | Prijs van de twee Senso-vloeren | R6-30 | **Ja**: de klant kan ze online bestellen |
| 2 | Producten zonder prijs | R6-45 | Vóór de livegang |
| 3 | Twee tapijtprijzen | R6-41. Erbij vermelden: Rampur 0600, Rond Ø 160 cm kost € 159,60, € 159 of € 179 naargelang de kleur | Ja: online te bestellen |
| 4 | Garantie bij vinyl | R6-31 | Vóór de livegang |
| 5 | Tekst bij Louis De Poortere | R6-32 | Vóór de livegang |
| 6 | Beloftes van Brunic (gratis opmeting, 1 à 2 werkdagen, eigen atelier, 40 jaar) | R6-38, R6-26, R6-69 | Vóór de livegang |
| 7 | Levertermijnen | R6-10, R6-37 | – |
| 8 | Rechten op drie foto's | R6-33 | Vóór de livegang |
| 9 | Betere of ontbrekende foto's | R6-42, R6-43, R6-44 | – |
| 10 | Artikelnummers van Lalee en Ragolle | R6-19 | – |
| 11 | Merken in de inleidende teksten | R6-25 | – |
| 12 | Productnamen van Boråstapeter | R6-40 | – |

**Nieuwe vragen, klaar om door te sturen:**

**A. Twee tapijten met dezelfde foto's (R6-34).** Mehari 0098 en Rampur 0098 van Ragolle hebben dezelfde foto's, dezelfde kleuren (6727, 6747, 9332) en dezelfde kenmerken. De prijs verschilt bij de kleine maten:

| Maat | Mehari 0098 | Rampur 0098 |
|---|---:|---:|
| 80 × 150 cm | € 79 | € 89 |
| 120 × 170 cm | € 129 | € 149 |
| 133 × 195 cm | € 159 | € 189 |
| 160 × 230 cm en groter | gelijk | gelijk |

- **Is dit hetzelfde tapijt? Zo ja: welke naam en welke prijs klopt?**
- **Zo neen: hebt u de juiste foto's van het andere tapijt?**

**B. Producten die er op de foto's hetzelfde uitzien (R6-35).**

- **Associated Weavers:** 28 vasttapijten in 11 groepen tonen dezelfde foto's, bijvoorbeeld Liris, Orinoco, Verdant, Lustre, Parana, Rubico en Rio Grande. **Zijn dat dezelfde kleuren in een andere kwaliteit (gewicht, poolhoogte)? Mogen we dat verschil op de kaart tonen?**
- **Lalee, Liski DAM 213:** de kleuren Lichttaupe en Taupe hebben dezelfde vier foto's. **Zijn het twee kleuren?**
- **Ragolle, Rampur 0500:** de kleuren 4258 en 6258 hebben dezelfde productfoto, maar een andere prijs. **Klopt de foto?**
- **Lalee, Laos PMO 901 en 902:** zelfde eerste foto. **Klopt dat?**

**C. Tekst in de vinylbeschrijvingen (R6-05).** Bij 274 vinylvloeren begint de beschrijving met "Beste klanten, Heeft u graag dat uw vloerbekleding geplaatst wordt of vindt u niet de geschikte afmeting die u wenst? Neem contact met ons op via mail info@brunic.be". Bij 205 daarvan staat er niets anders. **Mogen we die tekst vervangen door één zin zonder aanhef, of weglaten? De pagina heeft al een blok "Hulp nodig bij uw keuze?".**

**D. Afdelingen in "Over Brunic" (R6-39).** De pagina noemt raamdecoratie, verf en slaapcomfort. Daarvan staan geen producten in de webshop. **Verkoopt Brunic die in de winkel? Dan laten we de zin staan en voegen we "in onze winkel" toe.**

**E. Volgorde in de lijsten (R6-53).** In Behang staan nu eerst 48 producten van Boråstapeter zonder prijs, terwijl 2.229 behangen een prijs hebben en online te bestellen zijn. **Wilt u producten die online te koop zijn vooraan?**

---

## 8. Zelf na te kijken

Voor iemand met een echte iPhone (Safari) en een Android-toestel (Chrome). Dit kon ik enkel emuleren.

| # | URL | Handeling | Wat hoort er te gebeuren |
|---:|---|---|---|
| 1 | `/catalogus/vloerbekleding/vinyl` | Tik bij "Blacktex Columbian Oak" op het eerste kleurbolletje, en tik er opnieuw op | De kaart toont opnieuw de vlakke vloer, niet de kamer (R6-20) |
| 2 | `/product/vloerkleed-rampur-0600-ragolle` | Tik op de foto, veeg in het grote beeld naar links | De volgende foto verschijnt en de teller gaat naar "2 / 7" (R6-21: nu gebeurt er niets) |
| 3 | Elke pagina, en `/catalogus/behang?weergave=producten` → Alle filters → Motief | Tik in het zoekveld bovenaan, en in "Zoek in motief" | Op iPhone zoomt de pagina niet in (R6-59: velden van 14 px) |
| 4 | `/catalogus/tapijten?weergave=producten` op een Android van 360 px breed | Tik op "Alle filters" | De knop "Toon 226 producten" staat volledig op het scherm (R6-27: rechts afgesneden) |
| 5 | `/catalogus/tapijten?weergave=producten`, zonder te scrollen | Alle filters → Kleur → Blauw → "Toon 35 producten" | U ziet meteen tapijten (R6-65: nu enkel de teller, of niets) |
| 6 | `/catalogus/tapijten?weergave=producten` | Scrol ver naar beneden, dan een stukje omhoog | Onderaan verschijnt de knop "Filters". Hij bedekt niets en verdwijnt bij omlaag scrollen. Ook liggend |
| 7 | `/product/behang-3d-golvende-lijnen-aubergine-paars-estahome` | Tik op de foto en knijp om in te zoomen | Het dessin is scherp (R6-67: nu zacht) |
| 8 | `/product/vloerkleed-rampur-0600-ragolle` | Scrol naar beneden | De bestelbalk blijft onderaan staan, boven de balk van Safari, en bedekt geen tekst |
| 9 | `/catalogus/behang?weergave=producten` | Scrol, tik op een kaart, ga terug met de veegbeweging van iOS | U staat op dezelfde plek in de lijst |
| 10 | `/product/vloerkleed-rampur-0600-ragolle`, toestel liggend | Tik op "Kleur" en kies een andere kleur | De lade past op het scherm, de knoppen zijn bereikbaar, de foto wisselt |

Een schermlezer (VoiceOver, TalkBack, NVDA) kan ik niet vervangen: zie §12.

---

## 9. Opdracht en specificatie bijwerken

**`docs/filtersysteem.md`**

- Matrix, rij Prijs: "Behang: verborgen (alles op aanvraag)" klopt niet meer. De filter Prijs staat er met 6 waarden, 2.229 behangen hebben een prijs. Idem "Wat er in Shopify ontbreekt", punt 6.
- Matrix: Rolbreedte 65% is nu 69%. De cijfers dateren van de momentopname van 22/10.
- §Architectuur: "herbouwd bij elke Shopify-wijziging (webhook)". De overdracht van 03/11 zegt dat de webhooks niet aan staan, en de momentopname is negen dagen oud (R6-36).
- §Scrollen: "Staat het begin al in beeld, dan blijft de pagina staan." Op mobiel staat dan geen enkele kaart in beeld (R6-65). Voorstel: "…als ook de eerste rij kaarten in beeld staat".
- §Hoverbeeld en §Toonvariant kloppen met de site. De regel dat een vloerkleed heel in het kader past (`toonHeleFoto`) staat er nog niet in.
- §URL: "Vervallen parameters worden uit de URL gehaald" gebeurt pas bij de volgende klik (R6-15). "Oude links met labels werken nog" geldt niet voor `Multicolor` (R6-14).

**`apps/prototype/TODO.md`**

- B06: "0/2.386 producten hebben een prijs". Nu 2.642 van de 4.070.
- B14: "kleurfamilie bij 47/2.386". Nu 2.511 van de 4.070 producten. "Rose Magnifique (kopie)" staat nog online.
- B20: "header-transities negeren `prefers-reduced-motion`" lijkt opgelost: met de voorkeur aan staat de overgang van de header op `none`.
- "Wat al aantoonbaar werkt": "tellen elk 2.386 actieve producten" is nu 4.111 in Shopify en 4.070 op de site.
- Tabel "Metingen": van 30/09, vóór B02 opgelost was. Vervangen door de tabel in §4.13.
- Lanceringschecklist: de vijf redirects van R6-13 toevoegen.

**`docs/vragen-aan-brunic.md`**

- "Aangepast in de code, nog niet gepusht: R5-04, R5-05, R5-06, R5-08" klopt niet meer: ze staan op productie.
- De nieuwe vragen A tot E (§7) toevoegen, en bij vraag 3 de drie prijzen voor Rond Ø 160 cm.

**De opdracht (`.agents/skills/webshop-qa-audit/SKILL.md`)**

- §1: "Op 12/11/2026 staan er vijf (mappen)". Er staan er nu zes: de volgende ronde is R7.
- §3, "Meet de uitsnede en de scherpte": `naturalWidth` zegt bij een `srcset` met breedtes niet hoe groot het geladen bestand is (de browser rekent het om naar de `sizes`-waarde). Lees `currentSrc` en de parameter `width=`. Zo kwam R6-67 boven, en zo las ik eerst de foute waarde af.
- §3, "Zoek hetzelfde beeld op twee plaatsen": de Shopify-CDN geeft geen ETag. Content-Length alleen geeft duizenden toevalstreffers. Wat werkt: gelijke grootte én dezelfde hash in de bestandsnaam, of minstens drie gelijke bestanden per productpaar binnen één merk.
- §6: drie valkuilen voor het meetinstrument, alle drie deze ronde gemaakt en met de hand rechtgezet: (1) klik nooit op coördinaten buiten het venster: eerst in beeld scrollen; (2) de eerste knop met `aria-pressed` op een kaart is het hartje, niet een staal; (3) de groepen in de lade zijn `details`/`summary`, geen knoppen met `aria-expanded`.
- §0: "Git staat niet op elke pc". Hier ook niet. De commit is wel af te lezen uit `.git/refs/heads/master` en `.git/logs/HEAD`.
- §4, "Snelheid": de eerste meting van een pagina is op Vercel vaak een koude start. Drie metingen is krap: de spreiding staat in §4.13.

---

## 10. Telling

**71 bevindingen.** Van de 59 punten van 03/11 zijn er 7 opgelost en is er geen enkel teruggekomen (§6).

| Soort | P1 | P2 | P3 | Totaal |
|---|---:|---:|---:|---:|
| Bevestigde fouten | 2 | 6 | 23 | 31 |
| Te verifiëren | 1 | 6 | 10 | 17 |
| Verbeterpunten | 0 | 1 | 22 | 23 |
| **Totaal** | **3** | **13** | **55** | **71** |

Nieuw: 19 (R6-05, R6-06, R6-07, R6-09, R6-26, R6-27, R6-28, R6-34, R6-35, R6-39, R6-52, R6-53, R6-54, R6-65, R6-66, R6-67, R6-69, R6-70, R6-71). De andere 52 waren al gemeld op 03/11 of staan in `TODO.md`. Drie daarvan zijn breder dan toen (R6-25, R6-41, R6-59), en R6-20 is van bevestigde fout naar te verifiëren gegaan.

---

## 11. Geteste onderdelen

### 11.0 De filtervragen uit de opdracht

| Vraag | Antwoord | Hoe getest |
|---|---|---|
| Passen de filters bij de categorie? | Ja, elk profiel volgt de matrix. Vinyl en Boråstapeter vallen uit de boot door de data (R6-01, R6-02). | 24 categorielijsten, 2 gemengde, 17 merkpagina's (§4.1) |
| Komen de waarden overeen met de productgegevens? | Ja. Type, Merk, Kleur, Maat, Vorm, Prijs, Rolbreedte, Poolhoogte, Stofbreedte, Slijtlaag, Motief en Stijl zelf gerekend uit de ruwe momentopname: 0 afwijkingen. Look, Lichtdoorlatendheid, Materiaal, Ruimte, Gebruiksklasse, Plaatsing en Eigenschappen: vergeleken met de normalisatie van de site en via `test:filters`, dus niet onafhankelijk. | Eigen rekenmodel (`m-model.mjs`) tegenover 1.253 productielijsten |
| Enkel producten die voldoen? | Ja. 0 fouten. | Idem |
| Meerdere waarden en combinaties? | Ja. OF binnen (90 lijsten), EN tussen (436 paren, 100 keer 3 of 4 filters, 98 keer variant + product), EN in Eigenschappen (48). | Idem, en browser |
| Bestaat de variant achter de filter? | Ja voor Kleur, Maat, Vorm en Prijs: 0 fouten op 29.729 kaarten met een variantfilter. Rolbreedte valt erbuiten (bekend). | Idem |
| Hele catalogus, ook niet geladen? | Ja, filteren gebeurt op de server. | `pagina=999` tegenover de eigen telling |
| Aantallen en opties? | Ja: 49.369 tellingen, 0 afwijkingen. Een waarde die alles dekt, blijft staan (R6-55). | Idem |
| Sorteren, paginering, meer laden? | Ja. 44 gesorteerde lijsten zonder fout. "Meer tonen": 96 kaarten, zelfde plek, focus op kaart 49, geen stap in de geschiedenis. | Lijsten en browser |
| Chips en wissen? | Ja, individueel en volledig, desktop en mobiel. Op mobiel staan de chips enkel bovenaan de lijst. | Browser |
| Melding bij nul resultaten? | Ja: uitleg, "Filters aanpassen" (opent de lade) en "Alle filters wissen". 268 lege lijsten correct. | Browser en lijsten |
| Vernieuwen, terug, gedeelde URL? | Ja. Oud label `Multicolor` niet (R6-14). | Browser |
| Fouten bij snel klikken? | **Niet opnieuw getest** deze ronde (op 03/11: 52 runs zonder fout). | – |
| Ziet de klant het resultaat na elke actie? | Vanaf een gescrolde positie: ja, op desktop en mobiel (R5-04 opgelost). Bovenaan de pagina op mobiel: neen (R6-65). | Browser, 5 scenario's × 2 |
| Prijsfilter? | Klassen, eenheden en ontbrekende prijzen kloppen: de prijs op elke kaart valt in de gekozen klasse (0 fouten). | Lijsten |

### 11.1 Volledig uitgevoerd (hele catalogus)

- **Productie tegenover de lokale code en momentopname:** de kaarten en variantprijzen van alle 4.070 producten via `/api/producten`: **0 verschillen**. Het volledige productmodel (titel, beschrijving, kenmerken, afmetingen, foto's met soort en kleur, opties, varianten, filterwaarden) van 664 productpagina's: **0 verschillen** (bij 32 kon ik de beschrijving niet vergelijken: ze staat als verwijzing in de pagina). Daarmee gelden de tellingen op de lokale momentopname ook voor productie.
- **Productie tegenover de vorige ronde:** alle 4.070 kaarten gelijk aan `r5/prod-api.json`.
- **Eigen model tegenover 1.253 productielijsten** (`pagina=999`): elke waarde van elke filter in de 4 afdelingen (348), paren van variantfilters (436), 3 en 4 filters (100), variant + productfilter (98), OF binnen een filter (90), Eigenschappen EN (48), sorteringen (44), alle 20 subcategorieën met en zonder filter (89). **111.464 kaarten, 49.369 tellingen: 0 afwijkingen** in leden, totaal, tellingen, toonvariant, prijs op de kaart, prijsklasse, sortering, stalen, lege groepen en gekozen waarden. Een eerste melding (240 tellingen) bleek een fout in mijn model: de site laat "&" weg uit het ID ("auto-vliegtuig"), ik maakte er "en" van.
- **`test:filters`:** 537 geslaagd, 0 mislukt (`ruw\test-filters.txt`).
- **Beeld-URL's:** alle 41.951 met HEAD, hoogstens 8 tegelijk: 41.951 keer 200 en een beeldtype.
- **Tabellen in §4:** alle producten.
- **Links:** 78 pagina's en 1.089 interne doelen.
- **Zoeken:** 55 vaste zoekopdrachten.

### 11.2 In de browser (headless Chrome via CDP, productie)

Er was geen browsertool beschikbaar. Desktop 1.366 × 900, mobiel 390 × 844 met touch, tenzij anders vermeld.

- **Filters (`b1`):** desktop 33 stappen, mobiel 36. Eén filter, OF, EN, chip weg, terug, vooruit, sorteren, herladen, wissen, meer tonen, vanaf een gescrolde positie (kort en lang resultaat, behang, sorteren, chip weg, alles wissen), lege staat, lade, zoekveld in een lange lijst (8 waarden, "Toon alle 53", zoeken op "bloem"), Escape, muiswiel boven een open paneel (de pagina scrolt niet, vier keer nagemeten), gemengde lijsten, de mobiele knop "Filters". Wat misging staat in §2: R6-12, -14, -15, -61, -65. Vier meldingen van het script heb ik met de hand nagekeken en geschrapt (`b1c-log.txt`): een klik buiten het venster, een teller die het zoekveld meetelde, het muiswiel naast het paneel, en mijn te strenge eis bij "alles wissen".
- **Breedtes en hoogtes (`b2`):** 24 schermen (320, 359, 360, 390, 414, 639, 640, 767, 768, 820, 1.023, 1.024, 1.279, 1.280, 1.285, 1.289, 1.290, 1.366, 1.440, 1.535, 1.536, 1.920 px, liggend 844 × 390, laag 1.366 × 650) × home, lijst met open paneel of lade, twee productpagina's: **0 px horizontale overflow op alle 96**. Afwijkingen: R6-27 (lade tot 360 px) en R6-66 (paneel onder de rand). Op 1.366 × 650 was de laatste link van de bestelkolom bereikbaar op de twee geteste producten.
- **Kaarten (`b3`, `b3c`):** 14 lijsten op desktop, 7 op mobiel. Alle 572 kaarten op desktop en 336 op mobiel geladen, geen lege kaders. Hover op 111 kaarten. Staal van een andere kleur op 7 lijsten × 2: beeld, link en gekozen staat wisselen 14 keer, de productpagina opent 14 keer op dezelfde kleur en hetzelfde beeld, de kaart verspringt niet. Kaart → pagina → terug: 28 + 14 keer, scrollpositie telkens hersteld. Uitsnede gemeten: kader 271 × 203 px (desktop) en 155 × 116 px (mobiel), `cover` overal behalve bij vloerkleden (`contain`).
- **Toetsenbord en toegankelijkheid (`b4`, `b4b`):** 70 Tab-stops op een lijst en 60 op een productpagina, allemaal met een zichtbare focusring en in beeld. Skiplink werkt. 26 stops tot de eerste filter, 34 tot de eerste kaart. Shift+Tab onder de kleverige balk: 0 van 40 (R5-13 opgelost). Lightbox: Enter opent, pijltjes bladeren, focusval, Escape geeft de focus terug. Optielade idem. Accessibility-tree van 11 pagina's: **0 knoppen, links of velden zonder naam, 0 beelden zonder naam**. `prefers-reduced-motion`: de beweging van de header valt weg, kleurovergangen blijven. Zie §4.14.
- **Productpagina (`b6`):** 13 soorten producten, optielade en variant, `?variant=`, galerij, lightbox, mobiele bestelbalk, het hartje en `/verlanglijst` (bewaart in `localStorage`, "1 product bewaard in deze browser"), de 404-pagina, de lege winkelmand (enkel bekeken).
- **Snelheid (`b5`):** zie §4.13.
- **Console en netwerk:** in alle tests enkel de preload-waarschuwing (R6-60). Geen mislukte verzoeken, geen 4xx of 5xx op beelden. De HEAD-controle liep niet tijdens de browsertests.

### 11.3 Steekproef

- **Productpagina's in de HTML:** 664 (alle vinyl, 16 per merk en type, alle aanbiedingen, alle producten met één foto, de producten uit eerdere bevindingen).
- **Zelf bekeken beelden:** 13 contactbladen met samen 521 beelden. Bekeken: 11 bladen, 424 beelden: de 28 vinylkamers met hun hover, de 68 andere vinylkaarten, 34 paren kaart + hover (twee per merk), 43 vloerkleden, 20 productparen met gelijke bestanden, 6 kleurparen, de 15 koppelingen, 11 Ragolle-paren, 7 gedeelde bestandsnamen, 8 diverse producten. Gemaakt maar niet één voor één beoordeeld: `r6-contact-boras-overig.jpg` en `r6-contact-hover-stroken.jpg` (zelfde beelden als op 03/11, toen wel bekeken). Niet elke van de 41.951 foto's is bekeken.
- **Live beschikbaarheid:** 300 producten.

---

## 12. Beperkingen en niet getest

- **De audit liep in twee delen:** 17:43 tot 18:18 (data, lijsten, zoeken, links) en 21:36 tot 22:36 (HEAD-controle afgewerkt, alle browsertests). Ertussen was ze gepauzeerd. Versie en momentopname waren bij de herstart en aan het einde dezelfde.
- **Geen echte toestellen** (iOS Safari, Android) en **geen schermlezer**. Touch is geëmuleerd. R6-20, R6-21 en R6-59 zijn daarom enkel in Chrome vastgesteld: zie §8.
- **Niet aangeraakt, zoals gevraagd:** winkelmand (niets toegevoegd), kassa, offerte-, opmeting- en contactformulieren, de nieuwsbrief, "Offerte aanvragen voor deze lijst" op de verlanglijst. Hun code is wel gelezen (§4.5): die resultaten dragen het label "enkel in de code gelezen". Het hartje en de verlanglijst zijn wel getest (enkel `localStorage`).
- **Geen git op deze pc.** De commit is afgelezen uit `.git/` (bestanden lezen). Of er lokale wijzigingen van iemand anders in de werkkopie staan, kon ik niet nagaan. Alle bronbestanden dateren van 03/11 23:06 of vroeger, behalve de opdracht zelf.
- **Geen toegang tot Shopify-admin of Vercel.** Webhooks, metafields en of er sinds 03/11 iets in Shopify gewijzigd is: niet zichtbaar (R6-36).
- **Snel klikken** (race tussen filterkeuzes) is deze ronde niet opnieuw getest.
- **De focusval van de filterlade** is niet opnieuw doorlopen, wel Escape en de terugkeer van de focus.
- **Fotolijst in `..\Data\`:** niet opnieuw gelezen. De herkomst in §3.6 steunt op de bestandsnamen en op het rapport van 03/11.
- **Prijzen:** ik kan niet vaststellen of een prijs juist is, enkel of ze geloofwaardig is tegenover de rest.
- **Snelheid:** labwaarden met emulatie, drie metingen per pagina. Geen veldgegevens.
- **Filters Look, Lichtdoorlatendheid, Materiaal, Ruimte, Gebruiksklasse, Plaatsing, Eigenschappen:** niet onafhankelijk nagerekend uit de ruwe data, wel de aantallen en leden tegenover de normalisatie van de site.
- **Tijd:** niets uit de opdracht is stil overgeslagen. Wat smaller getest is dan op 03/11, staat hierboven.

---

## 13. Prioriteitenlijst voor herstel

1. **R6-30:** het antwoord van Brunic over de Senso-prijzen (vraag 1). Tot dan de twee producten op aanvraag zetten is het veiligst.
2. **R6-01:** de vinylkleuren wegschrijven en een nieuwe build. Ligt klaar sinds 02/11. Neem **R6-04** (fotolabels vinyl) in dezelfde build mee.
3. **R6-67 (code, klein):** `sizes` in de galerij en de lightbox. Elke productfoto wordt er scherper van.
4. **R6-02, R6-03:** Boråstapeter en de rest van Behang taggen op kleur, motief en stijl.
5. **R6-05, R6-09, R6-28, R6-32:** de teksten in Shopify: "Beste klanten," weg, u-vorm, rare tekens, de stem van de fabrikant. Wacht deels op vraag 5 en vraag C.
6. **R6-06, R6-07, R6-52 (code):** zoeken: meervoud, volgorde bij "vinyl", lege staat.
7. **R6-65 (code en specificatie):** op mobiel na een filter naar de eerste kaarten.
8. **R6-34, R6-35:** de dubbele tapijten laten bevestigen (vraag A en B), daarna opruimen in Shopify. Neem **R6-08** en **R6-42** (fotokoppelingen) mee.
9. **R6-36:** laten nakijken of de site vanzelf herbouwt na een wijziging in Shopify.
10. **Vóór de livegang:** R6-13 (redirects), R6-19 (artikelnummers), R6-25 (intro's), R6-26 (opmeting bij behang), R6-29 (kopie offline), en `SITE_INDEXEREN` aanzetten.
11. **Afwerking (P3, veel is één regel code):** R6-12, R6-14 tot R6-18, R6-21 tot R6-24, R6-27, R6-46 tot R6-51, R6-55 tot R6-64, R6-66, R6-68, R6-69.

---

## Bijlage A. Alle labels in `brunic.specificaties`

Ruw in de momentopname, voor de producten die op de site staan (168 labels). "Zichtbaar" = het aantal producten waar de site het kenmerk toont. Levertermijn en Levertijd zijn verborgen. De 14 labels van twee verlichtingsproducten die op 03/11 in de lijst stonden, horen bij producten zonder gekoppelde collectie en staan niet op de site.

| Label | Producten (ruw) | Zichtbaar op de site | Verschillende waarden | Meest voorkomend |
|---|---:|---:|---:|---|
| Samenstelling | 2813 | 2811 | 190 | FSC gecertificeerd vliesbehang (1492); 100% polyester (290) |
| Geschikt voor | 2260 | 2260 | 144 | slaapkamer, woonkamer (706); slaapkamer, woonkamer, werkkamer,  (272) |
| Aanbrengen | 2238 | 2238 | 4 | wand inlijmen (2184); zelfklevend, inlijmen niet nodig (34) |
| Afmetingen | 2229 | 2229 | 47 | 53 cm x 10,05 m (1776); 0,53 x 10,05 m (82) |
| Motief | 2221 | 2967 | 161 | bloemen (267); grafisch (153) |
| Patroonaansluiting | 2167 | 2167 | 8 | recht (1013); verspringend (637) |
| Stijl | 2129 | 2875 | 220 | scandinavisch (198); vintage (100) |
| Patroonherhaling | 1681 | 1681 | 35 | 53 cm (1360); 26,5 cm (154) |
| Collectie | 978 | 967 | 84 | Boras Studio (143); Linen (43) |
| Patroonverzet | 641 | 641 | 12 | 26,5 cm (569); 13,25 cm (20) |
| Onderhoud | 625 | 618 | 18 | Fijnwas op 30 °C, Niet bleken, Nie (222); Extra goed afwasbaar (178) |
| Eigenschappen | 598 | 598 | 147 | Heatset-garen (52); Kamerhoog, Wasbaar, Geschikt voor  (37) |
| Stofbreedte | 574 | 572 | 22 | 300 cm (291); 295 cm (55) |
| Gewicht | 460 | 458 | 149 | 1475g/m² (37); 1500 gr/m2 (35) |
| Lichtechtheid | 428 | 391 | 11 | Zeer lichtvast (178); 5 van 8 (109) |
| Vloerverwarming | 362 | 362 | 7 | Ja (185); Geschikt (maximaal 27°C) (71) |
| Transparantie | 357 | 357 | 6 | Semi-transparant (150); Transparant (113) |
| Poolmateriaal | 309 | 309 | 29 | 100% polypropyleen (85); 100% polyamide (54) |
| Poolhoogte | 275 | 275 | 54 | 11 mm (34); 9 mm (27) |
| Collecties | 275 | 275 | 144 | Everybody Bonjour, Walls for Kids  (11); Little Bandits, Walls for Kids XL2 (11) |
| Slijtlaag | 274 | 274 | 16 | 0,25mm (68); 0,2mm (49) |
| Dikte | 274 | 274 | 22 | 2,8mm (71); 2,6mm (37) |
| Totaal gewicht | 263 | 235 | 84 | 3850 g/m² (29); 3.200 g/m² (22) |
| Garantie | 245 | 245 | 10 | 5 jaar (78); 10 jaar residentieel (60) |
| Levertermijn | 243 | 0 | 2 | 3-5 Werkdagen (234); 5-10 Werkdagen (9) |
| Rapport (b × h) | 239 | 239 | 212 | 11 cm × – (5); 63 cm × 300 cm (3) |
| Afwerking | 202 | 202 | 14 | Zandreliëf (84); Matt PU + Houtreliëf (39) |
| Patroon | 197 | 197 | 22 | 100 x 100cm (87); 200 x 150cm (29) |
| Rug | 194 | 194 | 27 | FusionBac (68); Comfortex Plus Feltbac (23) |
| Verwijderen | 183 | 176 | 4 | Nat verwijderbaar (178); Nat verwijderbaar (vermeld bij 2 v (3) |
| Brandklasse (EU) | 183 | 176 | 4 | B-s1, d0 (178); B-s1, d0 (vermeld bij 2 van 3 kleu (3) |
| Producttype | 171 | 143 | 3 | Textiele vloerbedekking (124); Geëxpandeerde (gedempte) poly(viny (37) |
| Productieproces | 162 | 134 | 3 | GETUFT (117); Getuft (44) |
| Totale dikte | 159 | 131 | 64 | 6 mm (40); 6,50 mm (22) |
| Brandklasse | 158 | 130 | 5 | Bfl-s1 (89); Cfl-s1 (51) |
| Installatiemethode | 156 | 128 | 3 | Los gelegd (75); Verlijmd (44) |
| Structuur | 152 | 152 | 18 | Frisé (53); Lussenpool (45) |
| Dichtheid | 151 | 149 | 5 | Inbetween/Transparant (73); Gesloten (60) |
| Breedte | 151 | 123 | 12 | 50 cm (76); 400 cm (54) |
| Krimp | 149 | 147 | 3 | 1% (116); 2% (20) |
| Wasvoorschriften (code) | 149 | 147 | 8 | mHDLU (106); mHELU (26) |
| Geschikt voor vouwgordijnen | 148 | 147 | 2 | Nee (76); Ja (72) |
| Warmteweerstand | 147 | 147 | 29 | 0,11 m²·K/W (20); < 0,15 m²·K/W (14) |
| Formaat | 136 | 108 | 3 | Tegels 50 x 50 cm (76); Rol 4 m (54) |
| Formaattype | 134 | 106 | 2 | Tegel (78); Rol (56) |
| Poolvezel | 132 | 104 | 15 | BCF PA6 (55); BCF PA6 ECONYL (32) |
| Stapelconstructie | 132 | 104 | 5 | Gestructureerde lussenpool (70); Lussenpool (32) |
| Effectieve pooldikte | 131 | 103 | 50 | 2,8 mm (29); 4 mm (8) |
| Totale vezelmassa | 131 | 103 | 62 | 610 g/m² (26); 730 g/m² (11) |
| Prestatieverklaring | 130 | 102 | 16 | 0493-CPR-0002-04 (65); 0493-CPR-0003-01 (21) |
| Geproduceerd in | 130 | 130 | 2 | Europe (96); België (34) |
| Antislipeigenschappen (EN 13893) | 127 | 99 | 1 | Klasse DS (µ ≥ 0,30) (127) |
| Uitzicht | 126 | 126 | 2 | Effen/gespikkeld (96); Structuur/dessin (30) |
| Residentiële gebruiksklasse | 126 | 98 | 2 | 23 Zwaar (123); 22 Algemeen/Medium (3) |
| Verfmethode | 124 | 96 | 6 | In de massa geverfd (77); Stukgeverfd (continu) (28) |
| Totale hoogte | 123 | 123 | 37 | 6,5 mm (10); 5,4 mm (10) |
| Primaire rug | 122 | 94 | 6 | Polyester fleece (73); Polypropylene woven + fleece (27) |
| Patroontype | 122 | 94 | 8 | Structuur (75); Uni (30) |
| Effectieve poolmassa | 120 | 92 | 63 | 355 g/m² (26); 415 g/m² (6) |
| Luxe beoordeling | 119 | 91 | 5 | LC1 (49); LC2 (38) |
| Tuft-dichtheid | 117 | 89 | 39 | 1580 /dm² (69); 1500 /dm² (3) |
| Residentieel gebruik | 116 | 116 | 5 | Normaal: slaapkamer, logeerkamer,  (35); Intensief: slaapkamer, logeerkamer (32) |
| Deling | 116 | 88 | 6 | 1/10" (90); 1/8" (8) |
| Verpakking | 113 | 85 | 3 | 20 tegels per doos, 5 m² per doos (76); 100% recyclebare plastic (35) |
| Keurmerken | 111 | 110 | 1 | OEKOTEX (111) |
| Geschikt voor zwenkwielen | 107 | 79 | 4 | Intensief gebruik (87); Incidenteel gebruik (14) |
| Statische elektrische neiging | 106 | 78 | 1 | Antistatisch (≤ 2 kV) (106) |
| Vezeldichtheid | 104 | 76 | 45 | 0,127 g/cm³ (25); 0,126 g/cm³ (6) |
| Punten per m² | 103 | 103 | 13 | 212.000 (22); 1.000.000 (15) |
| Secundaire rug | 100 | 72 | 6 | EcoBase - 100% recyclable, contain (66); T1 Textile SWB Synthetic (14) |
| Commerciële gebruiksklasse | 97 | 69 | 3 | 33 Intensief (83); 32 Normaal (11) |
| Vermindering van impactgeluid - ∆Lw | 97 | 69 | 11 | 25 dB (41); 24 dB (13) |
| Akoestische absorptie - αw | 96 | 68 | 3 | 0,15 (67); 0,2 (22) |
| Cradle to Cradle® | 96 | 68 | 3 | Zilver (62); Brons (31) |
| Kleurbestendigheid tegen water - Kleuring | 95 | 67 | 2 | ≥ 2-3 (59); ≥ 3-4 (36) |
| Kleurweerstand tegen water - Kleurverandering | 95 | 67 | 1 | ≥ 3-4 (95) |
| Kleurvastheid bij nat wrijving | 95 | 67 | 1 | ≥ 3 (95) |
| Kleurvastheid bij droog wrijving | 95 | 67 | 2 | ≥ 3-4 (91); ≥ 3 (4) |
| Plank Afmeting | 95 | 95 | 26 | 20 x 150cm (18); 12,5 x 100cm (10) |
| Thermische weerstand | 91 | 63 | 40 | 0,066 m²•K/W (24); 0,078 m²•K/W (8) |
| Ftalaatvrij | 89 | 89 | 1 | 100% Ftalaat-vrij (89) |
| GUI Allergy Certificate # | 82 | 54 | 11 | AT 100-111-17 (33); Certificate FST 100-051-08 (21) |
| GUI Fine Dust | 81 | 53 | 2 | Basic (75); Gold + (6) |
| Dimensionele stabiliteit | 80 | 52 | 3 | ≤ 0,20 % (46); Gemiddelde gemeten waarde : ≤ 0,2  (19) |
| Artikelen per doos | 78 | 50 | 2 | 20 (76); 16 (2) |
| Oppervlakte per doos | 78 | 50 | 2 | 5 m² (76); 4 m² (2) |
| Legrichting | 76 | 48 | 13 | HorzA/Quart (41); Mono/Quart/HorzA/VertA (10) |
| Doos per pallet | 76 | 48 | 5 | 44 (32); 40 (32) |
| Oppervlakte per pallet | 76 | 48 | 6 | 220 m² (32); 200 m² (32) |
| Formaldehyde-emissie | 73 | 73 | 1 | E1 (73) |
| Recycleerbaarheid | 73 | 45 | 2 | Ja, vloerafval na gebruik via ReSt (64); Ja – afval na gebruik, alleen gare (9) |
| CO2-voetafdruk (Cradle-to-Gate, EPD Modules A1-A3) | 72 | 44 | 25 | 4,27 kg CO₂e /m² (24); 7,63 kg CO₂e /m² (7) |
| EPD-nummer | 71 | 43 | 24 | S-P-10808 (24); S-P-08639 (8) |
| Tegel Afmeting | 70 | 70 | 20 | Allover (25); 20 x 20cm (10) |
| EPD (Environmental product declarations) | 69 | 41 | 1 | Beschikbaar (69) |
| MHS (Material Health Statement) | 68 | 40 | 1 | Beschikbaar (68) |
| Totale VOS-emissie na 28 dagen | 65 | 65 | 2 | Gold (≤ 100 µg / m³) (41); ≤ 1000 µg / m³ (24) |
| Gebruik | 65 | 65 | 5 | Binnen/Buiten (34); Zwaar gebruik (19) |
| CO2-voetafdruk (EPD Modules A-D) | 63 | 35 | 22 | 1,71 kg CO₂e /m² (24); 1,58 kg CO₂e /m² (6) |
| Lijn | 62 | 62 | 8 | Carpetyourlife (19); Invictus (14) |
| Kwaliteits- en milieucertificaten | 62 | 62 | 2 | ISO 14001 (47); ISO 9001 (15) |
| Carbon Impact over the Entire Product Lifecycle | 62 | 34 | 13 | 1,7071 kg CO₂e /m² (24); 6,44 kg CO₂e /m² (10) |
| Elektrische weerstand | 60 | 32 | 1 | SD (60) |
| Global Green Tag | 60 | 32 | 1 | Level A (60) |
| Slijtvastheid (Martindale) | 48 | 48 | 15 | 55.000 toeren (16); 100.000 toeren (11) |
| Productmateriaal | 45 | 45 | 1 | Getuft (45) |
| Kwaliteitscode | 44 | 44 | 44 | BAO (1); LBLX (1) |
| Commercieel gebruik | 40 | 40 | 3 | Licht: hotelkamer, hotelsuite (22); Normaal: hotelkamer, hotelsuite, b (11) |
| Green Building Certifications Contribution | 36 | 36 | 1 | Ja (36) |
| Rapport | 36 | 36 | 19 | 130 cm (5); Verspringende aansluiting (half dr (4) |
| Samenstelling rug | 35 | 35 | 2 | Antislip-latex (polyester) (34); Natuurlijke antislip-latex (1) |
| Hoogte | 35 | 35 | 1 | 3mm (35) |
| Dessin | 35 | 35 | 18 | Houten Lat (6); All-Over (4) |
| Weefproces | 34 | 34 | 1 | Jacquard, vlakgeweven (34) |
| Certificeringen | 34 | 34 | 1 | OEKO-TEX®, ISO 9001, GRS Certified (34) |
| Ontvlambaarheid | 34 | 34 | 1 | BS4790 CFR1630-FF1-70 (34) |
| UV-test | 34 | 34 | 1 | Blootstelling volgens ISO 4892-3 (34) |
| Wasvoorschriften | 34 | 34 | 1 | Machinewasbaar (30 °C) (34) |
| CRI Green Label Plus Certification | 34 | 34 | 4 | GLP 3372 (25); GLP 1726 (6) |
| Inhoud van pentachloorfenol | 32 | 32 | 1 | DL (32) |
| Productgroep | 31 | 31 | 1 | Vinyl (31) |
| Kleur | 31 | 31 | 14 | Meerderkleurig (7); Grijs (7) |
| Breedte rol | 31 | 31 | 6 | 4 m (19); 2 m (6) |
| Levertijd | 31 | 0 | 2 | 3 – 5 werkdagen (30); 7 werkdagen (1) |
| FDES A1-A3 | 30 | 30 | 7 | 4,19 kg CO₂e /m² (10); 3,64 kg CO₂e /m² (8) |
| Lichtreflectiewaarde (%) | 30 | 2 | 30 | 35,14 (1); 29,36 (1) |
| Rapport (l × b) | 28 | 28 | 10 | 95 × 67/80/100 cm (7); 95 × 100 cm (5) |
| Totaalgewicht | 26 | 26 | 24 | 1900 g/m² (2); 4080 g/m² (2) |
| Poolgewicht | 26 | 26 | 20 | 1300 g/m² (3); 1000 g/m² (3) |
| Minimale afname | 25 | 25 | 3 | 4 m2 (19); 1 doos (5) |
| Pooldichtheid | 23 | 23 | 17 | 250000 punten/m² (3); 189600 punten/m² (2) |
| Steek (gauge) | 23 | 23 | 6 | 1/10 (11); 5/64 (6) |
| Artikelnaam bij ADO | 23 | 23 | 11 | Macrame-Borte (11); Gardine (2) |
| Contactgeluidisolatie | 22 | 22 | 11 | ΔLw 30 dB (4); ΔLw 25 dB (4) |
| Antistatisch | 21 | 21 | 1 | 2kV (21) |
| Geluidsabsorptie | 14 | 14 | 5 | αω 0,25 (4); αω 0,15 (3) |
| Rolbreedte | 13 | 13 | 1 | 4 m (13) |
| Plank afmeting | 10 | 10 | 5 | 20 x 150cm (5); 18 x 150cm (2) |
| Leverbaar tot (volgens leverancier) | 9 | 9 | 1 | 12/26 (9) |
| Rolmaat | 9 | 9 | 1 | 10,05 m × 0,53 m (9) |
| Herhaling Patroon | 9 | 9 | 4 | 100 x 100cm (4); 133,3 x 100cm (3) |
| Antistatische eigenschappen | 9 | 9 | 1 | Ja (9) |
| Anti-slip | 9 | 9 | 1 | Ja (R10) (9) |
| Brandvertragend (norm) | 8 | 8 | 5 | BS 5867 part 2 type C, ISO 6940 69 (2); BS 5867 part 2 type c, ISO 6940 69 (2) |
| Aantal knopen (nr/m2) | 8 | 8 | 7 | 1500 (2); 1580 (1) |
| UPEC-klasse | 7 | 7 | 7 | U3P3E1C0 - 04/070/23 (1); U3SP3E1C0 - 04/084-03/23 (1) |
| Afmeting Dessin | 5 | 5 | 4 | 25 x 133,3cm (2); 10 x 25cm (1) |
| Industriële wasvoorschriften (code) | 3 | 3 | 1 | pHDLU (3) |
| Gerecycleerd materiaal | 3 | 3 | 3 | 64 % (1); 56 % (1) |
| Afmeting | 3 | 3 | 2 | 2,65 × 1,80 m (2); 2,65 × 3,60 m (1) |
| Lengte | 3 | 3 | 3 | 30,5 cm (1); 73 cm (1) |
| Formaatdetails | 3 | 3 | 3 | Vierkante plaat (1); Rechthoekige tegel (1) |
| Beschikbare rolbreedtes | 2 | 2 | 1 | 4 m en 5 m (2) |
| Totaal gerecycleerd materiaal | 2 | 2 | 2 | 46,9 % (1); 46,2 % (1) |
| RTS emissieklasse | 2 | 2 | 1 | M1 (2) |
| Oppervlakte / doos | 2 | 2 | 2 | 1,00 m² (1); 2,22 m² (1) |
| Eenheden / doos | 2 | 2 | 2 | 11 (1); 12 (1) |
| Slijtlaagdikte | 2 | 2 | 2 | 0,08 mm (1); 0,20 mm (1) |
| Installatietype | 2 | 2 | 1 | Zelfklevende installatie (2) |
| Beschikbare hoogtes | 1 | 1 | 1 | 230 / 270 / 320 / 400 cm (1) |
| Fabricagemethode | 1 | 1 | 1 | Jacquard, vlakgeweven (1) |
| Akoestische isolatie | 1 | 1 | 1 | 3 dB (1) |
| Eenheid/doos | 1 | 1 | 1 | 7 (1) |
| Dikte van de slijtlaag | 1 | 1 | 1 | 0,55 mm (1) |
| Installatie systeem (bekleding) | 1 | 1 | 1 | Klik (1) |
| Akoestisch | 1 | 1 | 1 | 21 dB (1) |
| Oppervlakteafwerking | 1 | 1 | 1 | ZUIVER (1) |
| Akoestisch isolatie | 1 | 1 | 1 | 3dB (1) |
