---
name: webshop-qa-audit
description: QA-audit (alleen lezen) van de Brunic-webshop — filters, zoeken, productfoto's en hoverbeelden, productkaarten, productpagina's en navigatie op desktop, tablet en mobiel, plus vindbaarheid, consistentie tussen afdelingen, beloftes, prijzen en eenheden, beeldherkomst, links, snelheid en de vergelijking met de vorige ronde. Levert een auditrapport met bevestigde fouten, te verifiëren punten en verbeterpunten. Wijzigt niets aan code, data, beelden of Shopify.
disable-model-invocation: true
---

# Webshop-QA-audit — filters, beelden, kaarten, navigatie

Je bent een ervaren e-commerce QA-specialist. Controleer de webshop op de werking van filters, productafbeeldingen, productkaarten en productnavigatie. Beoordeel of de webshop professioneel en gebruiksvriendelijk werkt op desktop en mobiel.

**Deze opdracht is uitsluitend een audit. Je rapporteert problemen en stelt verbeteringen voor, maar voert geen wijzigingen uit.**

## 0. Brunic-context (lees dit eerst)

**Wat je test**
- Productie: https://brunic.vercel.app (elke push naar `master`). Standaard test je hier.
- Lokaal mag ook: `pnpm --filter @brunic/prototype dev` → http://localhost:3100.
- Vermeld in het rapport welke omgeving en welke versie je testte: de commit (`git log -1 --oneline`) als git beschikbaar is, anders de momentopname uit `/api/status` en, als je het kunt afleiden, het deployment-ID van Vercel. Git staat niet op elke pc van het team. De site toont zelf geen commit, dus zeg erbij wanneer de versie afgeleid is.
- Noteer de versie aan het begin én aan het einde. Elke push naar `master` is een nieuwe productie. Verandert de site tijdens je audit, herhaal dan de controles die ervan afhangen, of zeg per resultaat bij welke versie het hoort.
- Afdelingen (`apps/prototype/src/data/categories.ts`): Gordijnen & stoffen (`/catalogus/gordijnen-en-stoffen`), Behang (`/catalogus/behang`), Vloerbekleding (`/catalogus/vloerbekleding`), Tapijten (`/catalogus/tapijten`). Raamdecoratie, Verf en Slapen & wonen hebben (nog) geen producten. Controleer wel of ze netjes verborgen of leeg zijn.
- Gemengde lijsten met hun eigen filterprofiel: `/zoeken?q=…`, `/aanbiedingen`, `/nieuw-binnen`, `/merken/<merk>`.
- Productpagina: `/product/<slug>`, met variant `/product/<slug>?variant=<id>`.
- Vaste pagina's: home, `/op-maat-en-plaatsing/…`, `/info/…`, `/inspiratie-en-advies/…`, `/winkel-en-contact`. Die toets je op links, beloftes en taal (§5), niet op ontwerp.

**Waartegen je toetst**
- `docs/filtersysteem.md` is de specificatie van het filtergedrag: OF binnen een filter, EN tussen filters, EN binnen Eigenschappen, aantallen, chips, URL-formaat, geschiedenis, scrollen, mobiele lade, lege staat, toegankelijkheid. Ook de filtermatrix per afdeling, de bewuste keuzes ("Bewust geen filter") en de bekende beperkingen staan daar.
- Een afwijking van die specificatie is een fout. Gedrag dat er als **bekende beperking** of **bewuste keuze** staat, is geen nieuwe fout. Label het als "bekend (filtersysteem.md)" en neem het alleen op als het de klant echt hindert. Voorbeeld: Rolbreedte is een productfilter, geen variantfilter.
- `apps/prototype/TODO.md` is de lijst met bekende punten (B-nummers), de lanceringschecklist en wat bewust uitstaat in de testfase. Een punt dat daar open staat, label je "bekend (TODO Bxx)".
- Prijzen: ga niet uit van een vaste regel per afdeling. Op 03/11/2026 hadden 2.229 van de 2.724 behangen een prijs, en 305 producten in Vloerbekleding en 36 tapijten van Louis De Poortere niet. Een product zonder prijs staat op aanvraag ("Advies en offerte in de winkel"). Dat is correct zolang de tekst erbij past. Een prijs heeft altijd een eenheid (per m², per rol, per stuk). Zet in het rapport per type en merk hoeveel producten een prijs hebben, en meld wat verschoof tegenover de vorige ronde.

**Begin bij de vorige ronde**
- Lees het recentste rapport in `docs/audits/` volledig. Test elk punt dat daar open staat opnieuw, met de reproductiestappen uit dat rapport. Test ook wat als opgelost gemeld is: een fout kan terugkomen.
- Lees de overdrachten in `docs/agent-work/` die jonger zijn dan dat rapport. Daar staan nieuwe regels, bewuste keuzes, lijstjes "Niet doen" en open ontwerpkeuzes. Voorbeeld: het rapport van 03/11/2026 stelde `scroll-padding-top` op `html` voor. `scrollgedrag-2026-11-03.md` zegt dat net dat geprobeerd is en nieuwe problemen gaf.
- Lees `docs/vragen-aan-brunic.md`: wat al aan Brunic gevraagd is, per bevinding. Een antwoord dat daar staat, is een regel. Een vraag zonder antwoord meld je als "gevraagd, nog geen antwoord" en stel je niet opnieuw.

**Regels van de opdrachtgever** (een afwijking is een fout, ook als de code doet wat ze moet doen)
- Een sfeerfoto komt nooit eerst, tenzij die kleur niets anders heeft. Dat geldt voor kaart en productpagina, met en zonder filter.
- Geen voorraadtekst en geen levertermijn: er is geen ERP gekoppeld. Levertermijnen staan nog in de Shopify-data, maar horen niet zichtbaar te zijn op de site. Brunic moet ze eerst bevestigen. Wel toegelaten: "Online te bestellen" op de kaart, "Tijdelijk uitverkocht", en "zolang de voorraad strekt" op `/aanbiedingen` (een actievoorwaarde).
- Desso valt onder Tarkett, en zoeken op "Desso" blijft werken. Teksten die "Desso en Tarkett" naast elkaar noemen en slugs met `-desso` zijn bewust.
- Een kleurstaal is in elke afdeling de vlakke foto van die kleur. Enkel een kleur zonder vlakke foto krijgt een bolletje.
- De site belooft een dienst (opmeting, plaatsing, atelier) enkel waar Brunic die levert. `apps/prototype/src/lib/site/maatwerk.ts` zegt waar: stoffen, tapijten en vloer wel, behang niet.
- Alles wat de klant leest, is nl-BE in de u-vorm.
- Een oplossing mag geen nieuw conflict geven. Dat geldt ook voor wat jij voorstelt (§7).
- `noindex` en `Disallow: /` zijn bewust tot de livegang (`SITE_INDEXEREN`). Vermeld de stand, het is geen bevinding.

**Waar de logica zit** (voor de oorzaak, niet om te wijzigen)
- Kaart: `apps/prototype/src/components/catalog/product-card.tsx`. Het beeld is: gekozen kleurstaal → anders hoverbeeld bij hover → anders `image`. Een klik op een staal wisselt het beeld, de prijs en de link (`?variant=`).
- Beeldkeuze zonder filter: `apps/prototype/src/lib/catalog/view.ts` (`toCard`) en `product.ts`:
  - `image` = het eerste beeld op de productpagina van de standaardvariant (`standaardVariant`, `imagesForVariant`);
  - `hoverImage` = een foto in dezelfde kleur, liefst een sfeerfoto (`hoverVoor`).
- Toonvariant met filter: `apps/prototype/src/lib/catalog/listing.ts` (`metToonvariant`), zie §Toonvariant in `docs/filtersysteem.md`. Elk staal heeft daar zijn eigen beeld, prijs en link.
- Soort foto en staal: `apps/prototype/src/lib/catalog/shopify-adapter.ts` (`fotoSoort`, `options`).
- Galerij en varianten op de productpagina: `apps/prototype/src/components/product/product-view.tsx`, `product-info.tsx` en `gallery.tsx`.
- Filters: `src/lib/catalog/filters.ts` (register `FACETS`), `listing.ts` (server: filteren, tellen, sorteren, pagineren), `facet-normalisatie.ts`, `src/data/filterprofielen.ts`, UI in `src/components/catalog/product-listing.tsx`.
- Titel, metabeschrijving en structured data: `src/lib/site/seo.ts`.
- Winkelmand, kassa en formulieren (enkel om te lezen, zie §1): `src/components/commerce/cart-view.tsx`, `src/app/api/kassa/route.ts`, `src/lib/leads/`.

**Data voor controles op de volledige catalogus**
- `apps/prototype/.data/shopify-catalogus.json` is de lokale momentopname. Lees dit bestand met een eigen script. Wijzig het nooit.
- Productie bouwt haar eigen momentopname, en die kan nieuwer zijn dan de lokale. Op 03/11/2026 was de lokale een dag ouder. Vergelijk daarom eerst: de datum in `/api/status` met die van het lokale bestand, en de kaarten uit `/api/producten?slugs=…` (hoogstens 100 slugs per verzoek) met wat de code op het lokale bestand berekent. Zijn er verschillen, dan telt productie voor wat de klant ziet en zet je de verschillen in het rapport.
- `pnpm --filter @brunic/prototype test:filters` mag je draaien. Het leest alleen en controleert elke filterwaarde op de echte catalogus.
- **Niet draaien:** `sync`, `build`/`prebuild`, scripts in `packages/catalog` en alles wat naar Shopify schrijft (`graphql_mutation`, `set-*.mjs`).
- De ruwe klantdata staat niet in de repo (`data/` bevat enkel een README). Bij Alexander staat ze een map hoger, in `..\Data\`: fotolijsten (`fotos-index*.csv`), tag-exports en push-logs. Je mag ze lokaal lezen, bijvoorbeeld voor de herkomst van een foto. Stuur ze nooit naar een externe dienst.

## 1. Grenzen van je opdracht

- Wijzig geen code, instellingen, productgegevens, filters of collecties.
- Wijzig, vervang, verwijder of herschik geen afbeeldingen.
- Pas geen koppelingen tussen afbeeldingen, producten en varianten aan.
- Upload geen nieuwe afbeeldingen en genereer geen vervangende beelden.
- Installeer niets (ook geen npm-pakketten zoals Playwright of Puppeteer), voer geen datamigraties uit en publiceer niets. Commit en push niets.
- Plaats geen bestellingen en verstuur geen offerte-, opmeting- of contactaanvragen. Zet niets in de winkelmand en start geen checkout.
- Verschijnen er tijdens de audit lokale wijzigingen van iemand anders, blijf er dan af en vermeld ze in het rapport.

Je mag de website bezoeken, filters bedienen, productvarianten selecteren, tussen pagina's navigeren en screenshots maken. Het hartje en `/verlanglijst` bewaren enkel in de browser (`localStorage`) en mag je testen. De verlanglijst als offerte versturen mag niet. Je mag beschikbare code en productgegevens lezen om de oorzaak van een probleem te onderzoeken.

**Wat je niet mag aanraken, lees je in de code.** Winkelmand, kassa en formulieren test je niet in de browser. Lees wel hun code en toets ze aan de regels van de opdrachtgever en aan je eigen bevindingen: staat er voorraadtekst, klopt de eenheid, wat gebeurt er met een product waarvan prijs en eenheid niet bij elkaar horen? Label elk resultaat "enkel in de code gelezen". In het rapport van 03/11/2026 stond de winkelmand enkel bij "niet getest", ook voor de regel over voorraad.

**Enige plekken waar je schrijft:**
- Je hulpscripts en ruwe uitvoer gaan naar `$env:TEMP\brunic-qa\r<ronde>\`, de scripts in de submap `scripts\`. Nooit in de repo, en niet in een scratchpad die na de sessie verdwijnt: de volgende ronde moet ze kunnen terugvinden (§6).
- Het rapport en de screenshots gaan naar `docs/audits/<JJJJ-MM-DD>-webshop-qa/`: het rapport als `rapport.md`, de screenshots in `screenshots/`. Enkel `screenshots/` is gitignored. Bestaat de map van vandaag al, neem dan `-2`, `-3`. Een ouder rapport overschrijf of wijzig je nooit.

**Ruim op wat je start.** Geef elke Chrome die je start een eigen `--user-data-dir` in je rondemap. Sluit hem af als je klaar bent, enkel de processen die je zelf startte, en verwijder die profielmappen aan het einde. Logs en JSON laat je staan: dat is bewijs. Op 12/11/2026 stond er 3,9 GB van vorige rondes, vooral Chrome-profielen.

Ook bij een overduidelijke fout blijft je taak: vaststellen, documenteren en een oplossing voorstellen.

## 2. Controleer alle webshopfilters

Onderzoek iedere hoofdcategorie en alle aanwezige filtergroepen.

Controleer onder andere:

- Passen de filters bij de productcategorie?
- Komen filterwaarden overeen met de werkelijke productgegevens?
- Verschijnen uitsluitend producten die aan de geselecteerde criteria voldoen?
- Werken meerdere waarden binnen één filtergroep en combinaties van verschillende filtergroepen logisch samen?
- Verwijzen gecombineerde variantfilters naar een daadwerkelijk bestaande variant?
- Wordt de volledige relevante catalogus gefilterd, inclusief producten die nog niet geladen zijn?
- Kloppen resultaataantallen en beschikbare filteropties?
- Werken sortering, paginering en "meer laden" samen met de actieve filters?
- Zijn actieve filters zichtbaar, individueel verwijderbaar en volledig te wissen?
- Is de melding bij nul resultaten duidelijk?
- Blijven filters correct werken na vernieuwen, terugnavigeren en het openen van een gedeelde URL?
- Ontstaan er fouten wanneer je snel verschillende filters selecteert?
- Ziet de klant het resultaat na elke actie?

Controleer prijsfilters alleen waar deze aanwezig zijn en let op correcte bedragen, eenheden en ontbrekende prijzen.

Tip: leg getoonde aantallen naast een eigen telling op de momentopname. Zo test je "volledige catalogus" en "aantallen kloppen" zonder alles in de browser te laden.

**Test ook vanaf een gescrolde positie.** Filteren, sorteren, een chip verwijderen en alles wissen test je ver in een lange lijst, met een lang en met een kort resultaat. Controleer telkens wat in beeld staat: de eerste kaart, de filterbalk, de knoppen van het open paneel. Dat de klant na een filterkeuze bij de footer belandde, kwam pas in de vijfde ronde boven (R5-04).

**Zoeken** is voor de klant ook een filter. Stel uit de momentopname een vaste reeks van minstens 30 zoekopdrachten samen en bewaar ze bij je scripts, zodat de volgende ronde dezelfde gebruikt:
- een exacte productnaam, en een deel ervan;
- een merk, een merk zonder speciale tekens (Borastapeter), en een merk dat onder een ander valt (Desso);
- een kleurnaam, een kleurcode (901D) en een collectie;
- een type in enkelvoud en in meervoud;
- een tikfout, en een woord dat nergens voorkomt.

Noteer per zoekopdracht of het verwachte product bij de eerste tien staat, of het aantal in de kop gelijk is aan dat van de lijst, en of de lege staat de klant een uitweg biedt.

## 3. Controleer productfoto's en hoverbeelden

Gebruik het volgende gewenste gedrag als beoordelingskader:

- **Standaard op de productkaart:** een duidelijke productfoto, productstaal of detailbeeld waarop product, kleur en structuur herkenbaar zijn.
- **Bij hover op desktop:** een passende interieur- of sfeerfoto van hetzelfde product en, waar relevant, dezelfde kleurvariant.
- **Na hover:** de oorspronkelijke productfoto verschijnt opnieuw.
- **Zonder geschikte interieurfoto:** de productfoto blijft zichtbaar.

Controleer visueel of:

- De standaardfoto werkelijk geschikt is als eerste productbeeld.
- Het hoverbeeld een relevante interieurfoto is.
- Beide beelden bij hetzelfde product en de geselecteerde variant horen.
- Kleurstalen de juiste afbeeldingen oproepen.
- Productkaarten en productdetailpagina's met elkaar overeenkomen.
- Afbeeldingen ontbreken, dubbel voorkomen, onscherp zijn, verkeerd uitsnijden of niet laden.
- De overgang flikkert of de kaart doet verspringen.

Ga niet automatisch uit van een fout omdat bestandsnamen of de volgorde van afbeeldingen vreemd lijken. Gebruik beschikbare productinformatie en visuele aanwijzingen. **Bekijk de screenshots en beelden zelf** (open het PNG/JPG-bestand). Oordeel nooit alleen op URL of alt-tekst.

Veel beelden bekijk je het snelst op een contactblad: een eigen HTML-pagina met een raster van genummerde beelden, die je in headless Chrome als screenshot bewaart en daarna zelf opent. Bewaar de legenda erbij (nummer → product, kleur, URL).

**Meet de uitsnede en de scherpte, schat ze niet.** Vergelijk voor elke kaart en voor de eerste foto op de productpagina de afmetingen van het bestand (`naturalWidth`, `naturalHeight`) met het kader waarin het staat en met de manier van passen (`object-fit`). Reken uit welk deel van het beeld wegvalt en of het bestand kleiner is dan het kader. Geef per afdeling en merk het aandeel kaarten dat meer dan een kwart van het beeld verliest. Bij vloerkleden viel de helft van het tapijt weg, en ook dat kwam pas in de vijfde ronde boven (R5-06).

**Zoek hetzelfde beeld op twee plaatsen.** Zoek op de hele momentopname naar één beeldbestand bij twee kleuren van hetzelfde product, en bij twee verschillende producten. Geeft de HEAD-controle een ETag of Content-Length, zoek daarmee ook gelijke bestanden met een andere naam. Dat bewijst geen fout: bekijk de beelden zelf en label wat je niet kunt beslissen "te verifiëren". Zo kwamen eerder een foto van een ander tapijt en twee kleuren met dezelfde foto boven.

**Kun je niet betrouwbaar vaststellen of een afbeelding bij het juiste product of de juiste kleur hoort, vermeld dan "te verifiëren". Presenteer een vermoeden niet als een bevestigde fout.**

Vermeld per fotoprobleem het product, de variant, de pagina en de betrokken afbeeldingen. Voeg waar mogelijk een screenshot en de afbeeldings-URL's toe. Verander zelf niets aan de beelden of hun koppelingen.

## 4. Controleer desktop en mobiel

Beoordeel:

- Consistentie en leesbaarheid van productkaarten.
- Correcte productnamen, prijzen en prijseenheden.
- Links naar het juiste product en de juiste variant.
- Mobiele filters: openen, sluiten, scrollen, selecteren en wissen.
- Productnavigatie op touchscreens zonder afhankelijkheid van hover.
- Toegankelijkheid van extra beelden via de productgalerij.
- Overlappende elementen, horizontale overflow en onbereikbare knoppen.
- Toetsenbordbediening en zichtbare focus.

**Breedtes en hoogtes.** De twee vaste schermen uit §6 volstaan niet: een overflow van 7 px bestond enkel tussen 1.280 en 1.289 px breed, en op een scherm van 650 px hoog viel de laatste link van de bestelkolom onder de rand. Controleer horizontale overflow en bedekte of onbereikbare knoppen op 320, 360, 390, 414, 768, 820, 1.024, 1.280, 1.366, 1.440 en 1.920 px breed, op een liggende telefoon (844 × 390) en op een laag scherm (1.366 × 650). Doe dat telkens op home, op een lijst met een open filterpaneel en op een productpagina. Lees de breekpunten in de code en test ook net erboven en eronder.

**Toegankelijkheid die je kunt meten.** Knoppen, links en velden zonder toegankelijke naam (`Accessibility.getFullAXTree`), tikdoelen kleiner dan 24 × 24 px, de volgorde van de koppen, en beweging bij `prefers-reduced-motion` (`Emulation.setEmulatedMedia`). Een schermlezer kun je niet vervangen: zet dat bij de beperkingen.

**Snelheid en server-HTML.**
- Meet op mobiel (390 × 844, `Emulation.setCPUThrottlingRate` 4, een trage 4G via `Network.emulateNetworkConditions`) de LCP, de CLS en de lange taken met een `PerformanceObserver`. Doe dat voor home, één lijst per afdeling en drie productpagina's, drie keer per pagina. De middelste meting telt.
- Vergelijk met de tabel "Metingen" in `apps/prototype/TODO.md` en met de vorige ronde. Het zijn labwaarden: een duidelijke achteruitgang is een bevinding, het absolute cijfer niet.
- Haal dezelfde pagina's ook op zonder JavaScript (een gewone GET) en controleer of de h1, de prijs en de eerste kaarten in de HTML staan. Dat ze ontbraken, was ooit de zwaarste fout van de site (TODO B02), en een test in de browser ziet dat niet.

## 5. Controleer ook wat er niet staat

Een test op wat de site toont, ziet niet wat ontbreekt. Reken deze punten altijd na op de hele momentopname en zet de tabellen in het rapport, ook als er geen fout uit volgt.

**Vindbaarheid**
- Maak per type en merk een tabel: aantal kleuren, hoeveel zonder kleurfamilie, hoeveel met enkel een code als naam (zoals 901D).
- Een kleur die enkel een code heet en geen kleurfamilie heeft, kan een klant niet vinden. Dat is een bevinding, ook al werkt de filter.
- Verdwijnt een filter uit het profiel omdat de data ontbreekt, dan is dat geen geslaagde test maar een bevinding. Voorbeeld: vinyl had op 02/11/2026 geen filter Kleur. "Geen lege filtergroep" klopte, maar de klant kon niet op kleur zoeken.
- Neem ook de dekking van Maat, Vorm, Motief en Stijl mee. `test:filters` drukt ze af.

**Consistentie tussen afdelingen**
- Zet de vier afdelingen naast elkaar: soort staal (foto of bolletje), aandeel kleuren met een eigen vlakke foto, aandeel kaarten met een hoverbeeld, regels op de kaart en kenmerken op de productpagina.
- Een verschil zonder reden in `docs/filtersysteem.md` is een bevinding.

**Beloftes**
- Zoek niet op vaste woorden. Maak eerst een lijst van alle labels in het veld `specificaties`, met hun aantal, en lees die hele lijst. Op 02/11/2026 telde een zoekopdracht op "Levertijd" 31 producten, terwijl er 276 waren: bij de meeste heet het veld "Levertermijn".
- Zoek daarna in de beschrijvingen op levertijd, levertermijn, leverbaar, werkdagen, voorraad, garantie en gratis levering.
- Toets wat de klant echt ziet op de site, want de site verbergt een deel van de data.
- Staat een belofte op de site en is ze niet bevestigd door Brunic, zoals een garantietermijn, dan label je ze "te verifiëren", met het aantal producten.
- Lees ook de vaste pagina's: gratis opmeting, een termijn om terug te bellen, eigen atelier, "al 40 jaar".

**Productpagina-inhoud**
- Lees de beschrijving en de kenmerken zoals de site ze toont, niet het ruwe veld. Zoek op de hele momentopname naar:
  - een tabel die als één lopende zin verschijnt (reeksen "label waarde label waarde" zonder leestekens);
  - HTML-resten en entiteiten;
  - een aanhef of mededeling die niet voor de klant bedoeld is ("Beste klanten,");
  - twee keer hetzelfde kenmerk, of hetzelfde kenmerk in twee schrijfwijzen;
  - een beschrijving van minder dan 100 tekens, en één tekst die bij tientallen producten staat.
- Lees per merk minstens vijf beschrijvingen volledig. Tekst in de stem van de fabrikant ("onze eigen fabriek", "wij halen het gratis op") leest op de site van Brunic als een belofte van Brunic.
- Past de vaste tekst bij het product? Voorbeelden van 03/11/2026: "De prijs hangt af van uw maten" bij tapijten met vaste maten, een opmeting aan huis bij behang, een keuzeknop met maar één waarde.

**Prijs en eenheid**
- Of een prijs juist is, kun je niet weten. Of ze geloofwaardig is wel. Zet per type en merk de prijzen per eenheid naast elkaar en bekijk de uitschieters: meer dan het dubbele of minder dan de helft van de mediaan, een grotere maat die goedkoper is dan een kleinere, één bedrag met centen tussen ronde bedragen.
- Vergelijk de eenheid met de tekst en de kenmerken: "per doos", de inhoud per doos of rol, de minimale afname. Op 03/11/2026 stond een doosprijs vermoedelijk als prijs per m² (R5-28).
- Reken uit wat het per eenheid zou zijn en label het "te verifiëren", met de vraag voor Brunic. Lees in de code wat de winkelmand met zo'n product doet (§1).

**Taal**
- Zoek in de zichtbare tekst van de vaste pagina's, de interface en de productdata naar je, jij, jouw en jullie, en naar Engels, Frans of Zweeds dat geen product- of merknaam is.
- Lees de treffers. Een woordenlijst alleen geeft vals alarm: "gemini" en "dalle" bleken productnamen.

**Links en vaste pagina's**
- Volg vanaf home alle interne links in het menu, de footer, de tegels, de landingspagina's van de afdelingen, de dienst- en infopagina's en de artikels (GET, hoogstens 8 tegelijk). Elke link eindigt op 200. Een 308 is in orde als hij bewust is. Meld elke 404 met de pagina waarop de link staat.
- Een tegel of uitgelicht product verwijst naar iets dat bestaat en toont een beeld dat laadt. Eerder verwees een tegel op home naar een product dat niet in de catalogus zat.
- De intro van een afdeling of merk noemt wat er echt staat. Op 03/11/2026 noemde Behang een merk zonder producten en verzweeg het de twee grootste.

**Wat machines lezen**
- Vergelijk voor de productpagina's in je steekproef de titel, de metabeschrijving, de canonical, `og:image` en de structured data met wat de klant ziet: dezelfde naam, hetzelfde eerste beeld, dezelfde prijs met dezelfde eenheid.
- De regels van de opdrachtgever gelden ook hier: geen voorraad en geen levertermijn in de structured data of in de pagina-data.

**Beeldlabels en herkomst**
- Tel per merk de foto's zonder label (soort `overig`). De code kan die niet rangschikken, dus een kamerfoto kan vooraan staan. Bekijk zelf elke kaart die met zo'n foto begint.
- Zoek in de bestandsnamen naar sporen van herkomst: `_AC_SX…` of `_AC_SY…` (Amazon), `…_n.jpg` met lange cijferreeksen (Facebook of Instagram), stockbureaus, Pinterest, WhatsApp, screenshots.
- Label die "te verifiëren (beeldrechten)", met product en bestand. Rechten kun je niet zelf vaststellen, en een vreemde bestandsnaam alleen bewijst geen fout.

**Namen**
- Zoek afgekapte of verminkte productnamen: weggevallen letters zoals "Olivtr d", ontbrekende speciale tekens, namen in kleine letters. Vergelijk titel, slug en alt-tekst.
- Controleer hernoemde producten ook op de oude URL.
- Tel de titels die binnen één merk bij meer dan één product staan: de klant ziet het verschil dan enkel op de foto.

**Versheid**
- Vermeld hoe oud de momentopname is (`/api/status`) tegenover het moment van de audit. Wijzigingen in Shopify komen pas na een nieuwe build op de site.
- Of die build automatisch start (webhooks), kun je zelf niet zien, want `packages/catalog` is verboden terrein. Vermeld het als "te verifiëren door iemand met toegang tot Shopify".
- `/api/producten?slugs=…&live=1` geeft de beschikbaarheid live. Wijkt die in een steekproef af van de momentopname, meld dat dan.

## 6. Test daadwerkelijk in de browser

Test alle hoofdcategorieën, iedere filtergroep en representatieve combinaties. Neem producten met één afbeelding, meerdere afbeeldingen, kleurvarianten en ontbrekende beelden mee. Zoek die producten vooraf op in de momentopname, zodat je steekproef bewust gekozen is.

Controleer waar mogelijk de volledige catalogus op ontbrekende beeldverwijzingen en filtergegevens. Vermeld duidelijk welke controles volledig zijn uitgevoerd en welke op een steekproef berusten.

**Browser:**
- Is er een browsertool beschikbaar (Claude in Chrome, de ingebouwde browser), gebruik die en laad eerst de bijhorende skill.
- Anders gebruik je headless Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`, `--headless=new --remote-debugging-port=…`) via het Chrome DevTools Protocol. Schrijf daarvoor een eigen Node-script met de ingebouwde `WebSocket` van Node 24, zonder pakketten te installeren.
  - Desktop: 1366×900. Hover via `Input.dispatchMouseEvent` (`mouseMoved`) op de kaart, daarna de muis weg.
  - Mobiel: 390×844, met `Emulation.setDeviceMetricsOverride` (`mobile: true`) en `Emulation.setTouchEmulationEnabled`. Tik via `Input.dispatchTouchEvent`.
  - Toetsenbord: `Input.dispatchKeyEvent` (Tab, Enter, Escape). Controleer daarna `document.activeElement` en of de focusring zichtbaar is.
  - Lees ook consolefouten, mislukte netwerkverzoeken (`Network.loadingFailed`, 4xx/5xx op beelden) en `scrollWidth > clientWidth` voor horizontale overflow.
- Wees zuinig met de Shopify-CDN. Controleer beeld-URL's van de hele catalogus met HEAD-verzoeken en hoogstens 8 tegelijk. Laat die controle niet lopen terwijl je in de browser test: dat gaf netwerkfouten die niets met de site te maken hadden.

**Scripts:**
- Begin van de scripts van de vorige ronde als ze nog in `$env:TEMP\brunic-qa\` staan. Lees ze eerst, want de site en het datamodel kunnen veranderd zijn. Zo blijven de tellingen van ronde tot ronde vergelijkbaar. Staan ze er niet, schrijf ze dan opnieuw.
- Je eigen rekenmodel staat los van `filters.ts` en `listing.ts`. Een model dat de code van de site aanroept, vindt haar fouten niet.
- Wantrouw je meetinstrument. Bekijk van elke soort afwijking minstens één geval met de hand in de browser, met een screenshot, voor je ze telt. Op 03/11/2026 bleek een eerste melding een fout in het eigen script.
- Laat scripts hun uitvoer naar een bestand schrijven en druk enkel een samenvatting af. Schrijf elk hoofdstuk van het rapport naar een eigen bestand in je rondemap zodra het klaar is, en voeg ze aan het einde samen. Zo gaat er niets verloren als de sessie afbreekt.

**Raakt je tijd op,** sla dan niets stil over. Deze volgorde gaat voor: de punten van de vorige ronde, de regels van de opdrachtgever, vindbaarheid, prijs en eenheid, beloftes, filters, beelden, en dan de rest. Wat je niet haalde, staat met naam bij de beperkingen.

Als toegang ontbreekt, rapporteer dan wat je niet kon controleren. Claim geen succesvolle test zonder die uitgevoerd te hebben.

## 7. Lever een concreet auditrapport op

Schrijf het rapport in het Nederlands (nl-BE) naar `docs/audits/<JJJJ-MM-DD>-webshop-qa/rapport.md`, met bovenaan de datum, de geteste omgeving en de versie (§0).

Begin met een kort oordeel over de bruikbaarheid van de webshop en de belangrijkste problemen. Zet daar meteen de stand tegenover de vorige ronde onder: wat opgelost is, wat open blijft, wat teruggekomen is.

Gebruik daarna een tabel met:

| Prioriteit | Pagina/product/variant | Probleem | Verwacht gedrag | Vastgesteld gedrag | Bewijs en reproductiestappen | Voorgestelde oplossing |
|---|---|---|---|---|---|---|

Onderscheid:
- **Bevestigde fouten:** daadwerkelijk waargenomen en reproduceerbaar.
- **Te verifiëren:** onvoldoende bewijs, bijvoorbeeld een onzekere fotokoppeling.
- **Verbeterpunten:** de werking is correct, maar kan gebruiksvriendelijker.

Prioriteit: **P1** = blokkeert kopen/vinden of toont foute informatie · **P2** = duidelijk storend · **P3** = afwerking. Verwijs bij een oorzaak in code naar `bestand:regel`. Gaat het om data, noem dan het product en het veld in Shopify.

Zet bij elke bevinding, in de kolom Prioriteit:
- een vast nummer `R<ronde>-<volgnummer>`. De ronde is het aantal mappen in `docs/audits/` plus één: op 12/11/2026 staan er vijf, dus de volgende is R6;
- de status: nieuw, bekend (met het oude nummer) of teruggekomen;
- wie het oplost: code, Shopify-data, inhoud, navragen bij Brunic of proces.

**Toets elk voorstel voor je het opschrijft.** Het mag niet botsen met de specificatie, met een regel van de opdrachtgever of met een andere bevinding, en het mag niet onder "Niet doen" staan in een overdracht. Zeg erbij wat het voorstel nog raakt. Weet je dat niet, stel dan voor het te onderzoeken in plaats van het te doen.

Geef fotoproblemen een apart overzicht zodat ik per product kan beoordelen wat eventueel aangepast moet worden. Per regel: product (titel + slug), variant/kleur, pagina-URL, standaardbeeld-URL, hoverbeeld-URL, screenshot, oordeel (fout / te verifiëren) en voorstel.

Neem de tabellen uit §5 op in een eigen hoofdstuk.

Neem ook deze hoofdstukken op:
- **Regels van de opdrachtgever:** één tabel met per regel de meting en het oordeel.
- **Status per eerdere bevinding:** elk punt van het vorige rapport, met opgelost, open of bekend, en of je het opnieuw testte.
- **Vragen aan Brunic:** alles wat enkel Brunic kan beantwoorden in één lijst, klaar om door te sturen. Wat al in `docs/vragen-aan-brunic.md` staat, herhaal je niet: verwijs ernaar.
- **Zelf na te kijken:** hoogstens tien stappen voor iemand met een echte iPhone en een Android-toestel, voor wat je enkel kon emuleren. Per stap de URL, de handeling en wat er hoort te gebeuren.
- **Opdracht en specificatie bijwerken:** wat in deze opdracht, in `docs/filtersysteem.md` of in `TODO.md` niet meer klopt met de site.
- **Telling:** het aantal bevindingen per soort en prioriteit, en hoeveel er nieuw zijn.

Sluit af met de geteste onderdelen, eventuele beperkingen en een prioriteitenlijst voor later herstel.

**Stop na het auditrapport. Ook de voorgestelde oplossingen voer je pas uit na een expliciete vervolgopdracht.** Geef als laatste bericht: het pad naar het rapport, het oordeel in drie zinnen, het aantal bevindingen per soort en prioriteit, en wat je niet kon testen.
