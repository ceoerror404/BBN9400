# Vragen aan Brunic

> **Intern, niet meesturen.** Dit is de enige plek voor vragen aan Brunic over de webshop. Elke audit verwijst hiernaar en schrijft haar nieuwe vragen hier bij, met het volgende nummer. Nummers veranderen nooit: andere documenten verwijzen ernaar ("vraag 11").
> - **Invulpagina:** <https://claude.ai/artifact/Egqnqt3MPAggE7nZuj39qF> toont deel 1 en 2 met per vraag een antwoordkader. Wat daar getypt wordt, bewaart de pagina zelf (opslag van het artifact: verzameling `antwoorden`, document `v<nummer>` met `antwoord` en `bijgewerkt`). De pagina is privé tot ze via haar Share-menu gedeeld wordt; wie mag invullen, heeft de rol Contributor nodig.
> - **Antwoorden van de invulpagina naar dit bestand:** vraag Claude "zet de antwoorden uit de invulpagina in vragen-aan-brunic.md". Claude leest de verzameling `antwoorden` (tool ArtifactData) en vult ze hier in volgens de regel hieronder. Dit bestand blijft de bron; de pagina is een afdruk.
> - **Dit bestand gewijzigd** (nieuwe vraag, vraag naar deel 2)? Bouw de pagina opnieuw met `node docs/tools/vragen-artifact/bouw.mjs <uitvoer.html>` en publiceer naar dezelfde link. De getypte antwoorden blijven staan.
> - **Doorsturen:** deel 1 (open vragen) is geschreven voor Brunic en kan zo mee. Deel 2 en 3 zijn voor ons.
> - **Een antwoord binnen?** Vul het in onder "Antwoord", zet de status in het overzicht op "Beantwoord" en verplaats de vraag naar deel 2. Een antwoord is vanaf dan een regel voor elke audit.
> - **Niet hier:** zakelijke vragen (offerte, accounts, domein) staan in het J.A.R.V.I.S-dossier (`clients/brunic/17-losse-eindjes-en-vragenlijst.md`). De juridische teksten en de fotorechten die Brunic nog moet valideren: `apps/prototype/README.md` §4, punten 6 en 7.
> - **Nog niet doorgestuurd** (stand 14/11): de vragen 13, 14 en 17 (uit de controle van 12/11) en 18 tot 23 (SEO, 14/11). De vragen 24 en 25 stonden tot nu als punt A7 en B8 in `teksten-en-beloftes.md`, niet als vraag. De pdf `teksten-beloftes-en-vragen-aan-brunic.pdf` dateert van 13/11 en is dus ouder dan dit bestand.

Stand van 14/11/2026. Deze vragen komen uit de controles van de nieuwe webshop. Het gaat om zaken die alleen Brunic kan beslissen of bevestigen.

## Overzicht

**25 vragen: 16 open, 2 deels beantwoord, 7 beantwoord.**

| Nr. | Onderwerp | Status | Wanneer nodig | Uit |
|---:|---|---|---|---|
| [1](#v1) | Prijs van twee Senso-vloeren | Beantwoord 18/11 | Dringend: online te bestellen | QA 03/11 (R5-28, R6-30) |
| [2](#v2) | Producten zonder prijs | **Open** | Vóór de livegang | QA 03/11 (R5-33, R6-45) |
| [3](#v3) | Twee tapijtprijzen die opvallen | **Open** | Dringend: online te bestellen | QA 03/11 (R5-38, R6-41) |
| [4](#v4) | Garantie bij vinyl | Beantwoord 13/11 | – | QA 03/11 (R5-29) |
| [5](#v5) | Tekst bij Louis De Poortere | Beantwoord 13/11 | – | QA 03/11 (R5-30) |
| [6](#v6) | Beloftes van Brunic op de site | Beantwoord 13/11 | – | QA 03/11 (R5-35) |
| [7](#v7) | Levertermijnen | Beantwoord 13/11 | – | QA 03/11 (R5-10, R5-34) |
| [8](#v8) | Rechten op drie foto's | Deels: Prime uit de webshop 18/11, **Trude open** | Vóór de livegang | QA 03/11 (R5-31, R6-33) |
| [9](#v9) | Betere of ontbrekende foto's | **Open** | Kan daarna | QA 03/11 (R5-36 e.a.) |
| [10](#v10) | Artikelnummers van Lalee en Ragolle | **Open** | Kan daarna | QA 03/11 (R5-20, R6-19) |
| [11](#v11) | Merken in de inleidende teksten | Deels: behang beantwoord, **tapijten open** | Kan daarna | QA 03/11 (R5-27, R6-25) |
| [12](#v12) | Productnamen van Boråstapeter | **Open** | Kan daarna | QA 03/11 (R5-39, R6-40) |
| [13](#v13) | Twee tapijten met dezelfde foto's, andere prijs | **Open** | Dringend: online te bestellen | QA 12/11 (R6-34, vraag A) |
| [14](#v14) | Producten die er op de foto's hetzelfde uitzien | **Open** | Kan daarna | QA 12/11 (R6-35, vraag B) |
| [15](#v15) | "Beste klanten," bij vinyl | Beantwoord 13/11 | – | QA 12/11 (R6-05, vraag C) |
| [16](#v16) | Afdelingen in "Over Brunic" | Beantwoord 13/11 | – | QA 12/11 (R6-39, vraag D) |
| [17](#v17) | Volgorde in de lijsten | **Open** | Kan daarna | QA 12/11 (R6-53, vraag E) |
| [18](#v18) | Gordijnlint en haakjes | **Open** | Vóór de livegang | SEO 14/11 (SEO-1-02, V1) |
| [19](#v19) | Rolgordijnen en raamdecoratie | **Open** | Vóór de livegang | SEO 14/11 (SEO-1-03, V2) |
| [20](#v20) | Tapijt afboorden | **Open** | Vóór de livegang | SEO 14/11 (SEO-1-07, V3) |
| [21](#v21) | AI-zoekassistenten | **Open** | Kan daarna | SEO 14/11 (SEO-1-11, V4) |
| [22](#v22) | Toegang tot Google Search Console | **Open** | Vóór de livegang | SEO 14/11 (SEO-1-01, V5) |
| [23](#v23) | Meten waar aanvragen vandaan komen | **Open** | Kan daarna | SEO 14/11 (SEO-1-10, V6) |
| [24](#v24) | Keurmerken van leveranciers | **Open** | Kan daarna | Teksten en beloftes, A7 |
| [25](#v25) | Zin over projectinrichting | **Open** | Kan daarna | Teksten en beloftes, B8 |

---

# Deel 1 — Open vragen

## A. Dringend: een klant kan dit vandaag al online bestellen

<a id="v3"></a>
### 3. Twee tapijtprijzen die opvallen (R5-38)

- **Mehari 0474:** rond Ø 200 cm kost € 80, terwijl 120 × 170 cm € 129 kost.
- **Rampur 0600:** rond Ø 120 cm kost € 86,99 en Ø 160 cm € 159,60, terwijl de andere maten ronde bedragen hebben. Aanvulling van 12/11 (R6-41): rond Ø 160 cm kost € 159,60, € 159 of € 179 naargelang de kleur.

**Kloppen deze prijzen?**

Antwoord:

<a id="v13"></a>
### 13. Twee tapijten met dezelfde foto's en een andere prijs (R6-34)

Mehari 0098 en Rampur 0098 van Ragolle hebben dezelfde foto's, dezelfde kleuren (6727, 6747, 9332) en dezelfde kenmerken. De prijs verschilt bij de kleine maten:

| Maat | Mehari 0098 | Rampur 0098 |
|---|---:|---:|
| 80 × 150 cm | € 79 | € 89 |
| 120 × 170 cm | € 129 | € 149 |
| 133 × 195 cm | € 159 | € 189 |
| 160 × 230 cm en groter | gelijk | gelijk |

- **Is dit hetzelfde tapijt? Zo ja: welke naam en welke prijs klopt?**
- **Zo neen: hebt u de juiste foto's van het andere tapijt?**

Antwoord:

## B. Nodig vóór de webshop live gaat

<a id="v2"></a>
### 2. Producten zonder prijs (R5-33)

Deze producten staan nu met "Prijs op aanvraag" en "Advies en offerte in de winkel":

- alle gordijnstoffen en passementen (592)
- vasttapijt, tapijttegels en lopers (305)
- alle tapijten van Louis De Poortere (36)
- alle behang van Boråstapeter (495)

**Klopt het dat deze producten geen vaste prijs op de site krijgen? Zo niet: welke wel, en waar vinden we de prijzen?**

Antwoord:

- **Boråstapeter, 18/11/2026 (Alexander):** het behang krijgt de Belgische winkelprijs per rol van borastapeter.com (prijs incl. btw zoals een bezoeker uit België ze ziet, bv. Elm Tree € 84,90). Bij outletkleuren de volle prijs, niet de actieprijs van Boråstapeter. De murals in Behang (Florence, Wild Forest, Marion's, Nightingale Garden) ook per rol. **Doorgevoerd op 18/11/2026** met `packages/catalog/set-boras-prijzen.mjs`: 867 kleuren geprijsd, 349 van de 366 behangen online te koop. De 17 behangen waarvan niet elke kleur een prijs kreeg (24 kleuren staan niet meer op borastapeter.com) staan sinds 18/11/2026 op draft in Shopify, niet meer op aanvraag (log: `..\Data\BORAS_DRAFT_LOG_2026-11-18.json`). Fotobehang op maat (143) blijft op aanvraag. Pushlog: `..\Data\BORAS_PRIJZEN_SHOPIFY_PUSH_LOG_2026-11-18T13-30-37.json`.
- **De andere groepen** (gordijnstoffen, vasttapijt, Louis De Poortere): nog geen antwoord.

<a id="v8"></a>
### 8. Rechten op drie foto's (R5-31)

Deze foto's komen van de oude site. Hun bestandsnamen wijzen op Amazon en Facebook:

- **Prime Zelfklevend 1m²:** 2 foto's
- **Kindervinyl Trude:** 1 foto, de enige van dit product. Het staat ook bij de aanbiedingen.

**Weet u waar deze foto's vandaan komen, en mogen we ze gebruiken? Zo niet, kan u andere foto's bezorgen of opvragen bij de leverancier?**

Antwoord:

- **Prime Zelfklevend 1m², 18/11/2026 (Alexander):** product uit de webshop gehaald, staat op draft in Shopify (de foto's zelf zijn niet verwijderd). Oude URL's vallen terug op Vinylvloeren. Log: `..\Data\SENSO_PRIME_LOG_2026-11-18.json`.
- **Kindervinyl Trude:** nog geen antwoord.

<a id="v22"></a>
### 22. Toegang tot Google Search Console (SEO-1-01)

Google Search Console is de gratis dienst waarin Google toont via welke zoekwoorden mensen vandaag op brunic.be terechtkomen. Die cijfers hebben we nodig vóór de overstap. Zonder kunnen we achteraf niet zien of de nieuwe webshop bezoekers wint of verliest.

- **Heeft Brunic, of uw vorige webbouwer, een Search Console-account voor brunic.be? Wie beheert het?**
- **Kan die persoon ons als gebruiker toevoegen?** Het account blijft van Brunic. Wij bezorgen het e-mailadres.

Antwoord:

<a id="v19"></a>
### 19. Rolgordijnen en raamdecoratie (SEO-1-03)

Op de huidige website staan tien kant-en-klare rolgordijnen met een prijs (€ 22,69 tot € 73,35) en een aparte pagina per soort. In de nieuwe webshop staat één pagina "Raamdecoratie op maat", met rolgordijnen, plissés, jaloezieën en vouwgordijnen. Wie nu via Google op een rolgordijn van de oude site terechtkomt, landt straks op die pagina.

- **Klopt het dat u kant-en-klare rolgordijnen niet meer online verkoopt?**
- **Welke soorten levert u op maat?** De oude site noemt: rolgordijnen, duo-rolgordijnen, plissés en dubbele plissés, vouwgordijnen, jaloezieën (hout, aluminium, verticaal), shutters, paneelgordijnen, geweven hout, Velux-zonwering, smart blinds en Sheerlight. Wat u bevestigt, zetten we op de pagina.
- **Welke merken mogen we daarbij noemen?**

Antwoord:

<a id="v18"></a>
### 18. Gordijnlint en haakjes (SEO-1-02)

Op de huidige website verkoopt u gordijnlint, fronslint en haakjes, bijvoorbeeld "Gordijnlint Wit 2,5 cm" aan € 1,40 per meter. In de nieuwe webshop staan ze niet. Wie nu via Google op zo'n product terechtkomt, landt straks op een pagina met passementen, zonder linten.

**Verkoopt u linten en haakjes nog? Online, enkel in de winkel, of niet meer?**

Antwoord:

<a id="v20"></a>
### 20. Tapijt afboorden (SEO-1-07)

Op de huidige website staat: "Al ons tapijt kan op maat afgeboord worden." Op de nieuwe site staat "tapijt op maat", zonder het woord afboorden.

- **Biedt u afboorden nog aan?**
- **Voor elk tapijt, of enkel voor bepaalde kwaliteiten? Ook in ronde of bijzondere vormen?**

Antwoord:

## C. Kan daarna

<a id="v9"></a>
### 9. Betere of ontbrekende foto's (R5-36, R5-37, R5-40, R5-41, R5-42)

**Hebt u deze foto's, of kan u ze opvragen bij de leverancier?**

- **Scherpere foto's:** Lalee (80 van de 84 tapijten) en Boråstapeter (337 van de 495 producten). Ze zijn scherp genoeg op de kaart, maar zacht op de productpagina.
- **Rechte foto van het tapijt:** Ravenna 0174 (Ragolle) heeft enkel een schuine close-up. Ook de eerste foto's van Rampur 0445 en 0477 ogen wat vaag.
- **Kleuren zonder foto:** Uni 3173 (kleur 55), Uni 3174 (kleur 20), Boord 4625 (kleur 12), Macramé 4624 (kleur 12), Macramé 4794 (kleur 12), Zen (Heather 1 061), Toscana B592 (kleur 710).
- **Duidelijkere foto:** Samira 38743 oogt op de foto bijna wit.

Op een deel van de foto's van ESTAhome en Origin staat ook het logo van de leverancier op het dessin. **Stoort u dat, of mag dat blijven?**

Antwoord:

<a id="v10"></a>
### 10. Artikelnummers van Lalee en Ragolle (R5-20)

Bij deze 136 tapijten (1.089 maten en kleuren) staat nu een technisch nummer als "Art.nr.".

**Hebt u de echte artikelnummers? Zo niet, dan laten we de regel weg.**

Antwoord:

<a id="v11"></a>
### 11. Merken in de inleidende teksten (R5-27)

- **Behang** noemt nu Arte (met de collecties Flamant en Missoni Home) en Boråstapeter. Arte staat niet in de webshop, terwijl ESTAhome (1.600 producten) en Origin (591) niet genoemd worden.
- **Tapijten** noemt enkel Louis De Poortere, niet Lalee en Ragolle.

**Welke merken wilt u in deze teksten zien?**

Antwoord:

- **Behang, 13/11/2026 (Alexander):** Arte wordt niet aangeboden door de winkel. Elke vermelding van Arte (en van de Arte-collecties Flamant en Missoni Home) moet weg. **Opgelost op 13/11/2026:** de zes Shopify-metaobjects die Arte nog noemden, zijn gelijkgezet met de standaardteksten in de code: Categorie Behang en Behang › Effen, home-tegel "Behang met karakter", dienst "Behangadvies & fotobehang op maat", artikels "Behang kiezen voor een kleine ruimte" en "Fotobehang en panoramisch behang". Ze noemen nu ESTAhome, Origin en Boråstapeter. Een scan van alle metaobjects, collecties en pagina's vond daarna niets meer. De 895 Arte-producten in Shopify blijven offline (0 actief). Een audit meldt elke nieuwe vermelding van Arte als fout, niet als open vraag.
- **Tapijten:** nog geen antwoord.

<a id="v12"></a>
### 12. Productnamen van Boråstapeter (R5-39)

Deze namen lijken Zweedse of Franse tekens te missen: Noras ang, Skogsstjarna, Solangen, Tradgardsfrojd, Poeme d'amour.

**Hebt u de juiste schrijfwijze, bijvoorbeeld uit de catalogus van de leverancier?**

Antwoord:

<a id="v14"></a>
### 14. Producten die er op de foto's hetzelfde uitzien (R6-35)

- **Associated Weavers:** 28 vasttapijten in 11 groepen tonen dezelfde foto's, bijvoorbeeld Liris, Orinoco, Verdant, Lustre, Parana, Rubico en Rio Grande. **Zijn dat dezelfde kleuren in een andere kwaliteit (gewicht, poolhoogte)? Mogen we dat verschil op de kaart tonen?**
- **Lalee, Liski DAM 213:** de kleuren Lichttaupe en Taupe hebben dezelfde vier foto's. **Zijn het twee kleuren?**
- **Ragolle, Rampur 0500:** de kleuren 4258 en 6258 hebben dezelfde productfoto, maar een andere prijs. **Klopt de foto?**
- **Lalee, Laos PMO 901 en 902:** zelfde eerste foto. **Klopt dat?**

Antwoord:

<a id="v17"></a>
### 17. Volgorde in de lijsten (R6-53)

In Behang staan nu eerst 48 producten van Boråstapeter zonder prijs, terwijl 2.229 behangen een prijs hebben en online te bestellen zijn.

**Wilt u producten die online te koop zijn vooraan?**

Antwoord:

<a id="v21"></a>
### 21. AI-zoekassistenten (SEO-1-11)

Zoekassistenten zoals ChatGPT lezen websites om twee redenen: om bij een vraag naar een winkel te verwijzen, en om hun eigen systeem te trainen. Het eerste raden wij aan en laten we toe: zo kan een assistent Brunic aanbevelen.

**Mogen AI-bedrijven uw website ook gebruiken om hun systemen te trainen, of liever niet?**

Antwoord:

<a id="v23"></a>
### 23. Meten waar aanvragen vandaan komen (SEO-1-10)

Op de nieuwe website staat nu: "geen statistieken". Daardoor weten we niet via welke pagina's of zoekopdrachten een aanvraag voor een offerte of een opmeting binnenkomt.

**Wilt u dat meten?** Er zijn drie mogelijkheden:

- Google Analytics. De bezoeker krijgt dan een venster waarin hij toestemming geeft.
- Een eenvoudige telling zonder cookies, met een aangepaste privacytekst.
- Niet meten, zoals nu.

Antwoord:

<a id="v24"></a>
### 24. Keurmerken van leveranciers (teksten en beloftes, A7)

Bij een deel van de producten staan keurmerken als kenmerk, overgenomen van de leverancier: OEKO-TEX (110 producten), ISO 14001 en 9001 (62), GUI Allergy Certificate (54), Green Building (36), CRI Green Label Plus (34), "OEKO-TEX®, ISO 9001, GRS" (34) en Cradle to Cradle. Wij hebben ze niet nagekeken.

**Mogen die keurmerken op de site blijven staan zoals de leverancier ze opgeeft?**

Antwoord:

<a id="v25"></a>
### 25. Zin over projectinrichting (teksten en beloftes, B8)

Op de pagina Projectinrichting staat: "Voor hotels, restaurants, zorginstellingen en andere projecten leveren wij brandvertragende en brandvrije stoffen, gordijnen uit ons eigen atelier en vasttapijt of tapijttegels, afgestemd op intensief gebruik." Deze zin is op 13/11 niet mee bevestigd.

**Klopt deze zin?**

Antwoord:

---

# Deel 2 — Beantwoord

Deze antwoorden gelden als regel. Ze zijn uitgevoerd in de code en in Shopify; details in `docs/teksten-en-beloftes.md` §D.

<a id="v1"></a>
### 1. Prijs van twee Senso-vloeren (R5-28)

| Product | Wat de site toonde | Inhoud van de doos | Prijs per m² als het bedrag voor de doos geldt |
|---|---|---|---|
| Senso Wallstreet Light Urban | € 55,48 per m² | 2,22 m² | ± € 24,99 |
| Senso Premium Grey Marble | € 48,90 per m² | 7 tegels, samen 2,04 m² | ± € 24 |

Bij Senso Wallstreet stond ook "enkel verkocht per doos", maar de klant kon op de site 1 m² bestellen.

- **Is dit bedrag de prijs per doos of per m²?**
- **Verkoopt u deze producten enkel per doos?**

Antwoord (18/11/2026, Alexander): **vinyl in dozen wordt altijd per doos verkocht, en het bedrag is de prijs per doos.** Dat geldt voor de Gerflor-tegels (Senso Premium Grey Marble, Senso Wallstreet Light Urban, Prime Zelfklevend). Het rolvinyl (274 producten van Beauflor, Tarkett en Gerflor, gesneden op 2, 3 of 4 m breed) blijft per m².

**Doorgevoerd op 18/11/2026:** de keuzelijst van `brunic.verkoop_eenheid` kreeg "Per doos" erbij, en de drie tegels staan op "Per doos". Grey Marble kreeg het kenmerk "Oppervlakte / doos: 2,04 m²" (7 tegels van 73 × 39,9 cm). De site kent de eenheid doos: "€ 48,90 / doos", en op de productpagina ook de prijs per m² (Grey Marble ± € 23,97, Wallstreet ± € 24,99). Log: `..\Data\SENSO_PRIME_LOG_2026-11-18.json`. Regel voor elke audit: een product in dozen zonder eenheid "Per doos" is een fout.

<a id="v4"></a>
### 4. Garantie bij vinyl (R5-29)

Bij 245 vinylproducten (Beauflor 197, Tarkett 37, Gerflor 11) staat een garantietermijn bij de kenmerken, tussen 3 en 20 jaar. Die termijnen komen van de leveranciers.

**Mogen we die termijnen tonen, en staat Brunic daarachter? Zo niet, dan halen we ze weg.**

Antwoord (via Alexander, 13/11/2026): geen label met de garantie. De termijn staat enkel in de beschrijving, als garantie van de fabrikant: "Beauflor geeft op deze vloer 10 jaar fabrieksgarantie bij residentieel gebruik." **Uitgevoerd:** het kenmerk is verborgen (`IS_LEVERBELOFTE` in `shopify-adapter.ts`), de zin komt in de beschrijving via `packages/catalog/set-leveranciersteksten.mjs`. Details: `docs/teksten-en-beloftes.md` §D.

<a id="v5"></a>
### 5. Tekst bij Louis De Poortere (R5-30)

Bij alle 36 tapijten staat tekst die de fabrikant zelf schreef. Op de site van Brunic lijkt het alsof Brunic dit belooft:

- "geproduceerd in onze eigen fabriek in België en rechtstreeks bij u thuis geleverd, met snelle levering in heel Europa"
- "Scan dan de QR-code … Wij halen het gratis op."
- "ons Take Care-programma" en "ons eigen R&D-team"

We stellen voor de tekst te herschrijven, met de fabrikant als afzender en zonder leverbelofte.

- **Gaat u daarmee akkoord?**
- **Geldt het gratis ophalen ook voor wie het tapijt bij Brunic koopt?**

Antwoord (via Alexander, 13/11/2026): herschrijven, akkoord. Dat geldt voor de teksten van alle fabrikanten: de fabrikant in de derde persoon, met zijn naam, en zonder zijn leverbeloftes. "Wij halen het gratis op" valt weg. Aanvulling 14/11/2026: het terugname- en ophaalprogramma (Take Care) deelt Brunic mee aan de klant bij de levering. Het staat nergens op de site, ook niet bij andere merken (Restart® van Tarkett). **Uitgevoerd.**

<a id="v6"></a>
### 6. Beloftes van Brunic op de site (R5-35)

**Kan u bevestigen dat deze zinnen kloppen?**

- [ ] "Gratis opmeting aan huis". Dit staat nu op elke pagina, ook bij producten waar Brunic geen opmeting doet, zoals behang. Moet het daar weg?
- [ ] "Wij nemen binnen 1 à 2 werkdagen contact met u op" na een aanvraag voor een opmeting
- [ ] "Eigen atelier"
- [ ] "Al 40 jaar"

Antwoord (via Alexander, 13/11/2026):

- [x] **Gratis opmeting aan huis:** blijft. Ook bij behang: opmeting kan.
- [x] **Reactietermijn:** "nog dezelfde dag" in plaats van "binnen 1 à 2 werkdagen". Dat geldt ook voor een aanvraag op zondag (bevestigd 14/11/2026).
- [x] **Atelier:** gordijnen worden niet gemaakt, maar in het eigen atelier op maat gebracht. Wat Brunic onderscheidt: service, kwaliteit en het eigen atelier.
- [x] **Plaatsing:** gebeurt door vakmannen (derden), niet door "onze eigen mensen". "Wat wij verkopen, plaatsen we ook zelf" klopt niet en is weg.
- [x] **Leeftijd:** Brunic bestaat sinds 1982. "Al 40 jaar" en "sinds 1992" zijn vervangen door "sinds 1982". "Sinds 1992 is Brunic een nv" blijft staan.
- [x] **Offerte na opmeting:** vermeldt de prijs, de mogelijkheden voor plaatsing en waar nodig de termijn.

**Uitgevoerd** in de code en in de Shopify-metaobjects. Woordkeuze en wat niet meer mag: `packages/catalog/beloftes-teksten.mjs`. Details: `docs/teksten-en-beloftes.md` §D.

<a id="v7"></a>
### 7. Levertermijnen (R5-10, R5-34)

Brunic toont geen levertermijnen, omdat er geen koppeling met het voorraadsysteem is. Daarom hebben we ze bij 276 producten verborgen. Twee vermeldingen staan er nog:

- **Goodnight (Artelux):** "Deze stof heeft een korte levertijd."
- **9 producten van Boråstapeter, collectie Nordic Folk:** "Leverbaar tot (volgens leverancier): 12/26."

- **Mogen die twee vermeldingen weg?**
- **Wilt u de levertermijnen ooit terug op de site?**

Antwoord (via Alexander, 13/11/2026): de leverbeloftes van de merken gaan weg (Goodnight, "Leverbaar tot", en bij Louis De Poortere "rechtstreeks bij u thuis geleverd"). Brunic heeft een eigen levertermijn: **online bestellingen binnen de week**, met meteen een bevestiging van wanneer er geleverd kan worden. Moet het product nog bij de leverancier besteld worden, dan kan het langer duren. **Uitgevoerd:** op `/info/levering`, in de FAQ en in het accordeon "Levering & afhalen" van producten met een prijs. Nergens per product.

Bevestigd op 14/11/2026: "Indien uit voorraad kan het langer duren", gelezen als "is het product niet meer in voorraad". Op de site staat: "Moet het product nog bij de leverancier besteld worden, dan kan het langer duren."

<a id="v15"></a>
### 15. "Beste klanten," bij vinyl (R6-05)

Bij 274 vinylvloeren begon de beschrijving met "Beste klanten, Heeft u graag dat uw vloerbekleding geplaatst wordt of vindt u niet de geschikte afmeting die u wenst? Neem contact met ons op via mail info@brunic.be". **Mogen we die tekst vervangen door één zin zonder aanhef, of weglaten?**

Antwoord (via Alexander, 13/11/2026): weglaten. De brief verdwijnt uit de 274 vinylbeschrijvingen via `packages/catalog/set-leveranciersteksten.mjs`. De productpagina heeft al het blok "Hulp nodig bij uw keuze?".

<a id="v16"></a>
### 16. Afdelingen in "Over Brunic" (R6-39)

De pagina noemde raamdecoratie, verf en slaapcomfort, terwijl daarvan geen producten in de webshop staan. **Verkoopt Brunic die in de winkel?**

Antwoord (via Alexander, 13/11/2026): verf en slaapcomfort gaan helemaal weg van de site. Raamdecoratie blijft. **Uitgevoerd** in de code en in Shopify (de twee metaobjects `categorie_inhoud` voor verf en slapen-wonen zijn verwijderd, met back-up in de pushlog).

---

# Deel 3 — Intern: geen vraag voor Brunic (niet meesturen)

## Waar staat de rest?

| Wat | Waar |
|---|---|
| Alle audits, met oordeel en telling | `docs/audits/README.md` |
| Open punten van de laatste webshop-controle (12/11) | `docs/audits/2026-11-12-webshop-qa/rapport.md` §6 en §13 |
| Open punten SEO en migratie (14/11) | `docs/audits/2026-11-14-seo-geo/issues.csv` |
| Beslissingen van 13/11 en hoe ze uitgevoerd zijn | `docs/teksten-en-beloftes.md` §D |
| Bekende bugs en de lanceringschecklist | `apps/prototype/TODO.md` |

## Stand van het rapport van 03/11

De rest van het rapport van 03/11 kan zonder Brunic verder. Details en voorstellen per punt: `docs/audits/2026-11-03-webshop-qa/rapport.md`. Deze lijst is sinds 03/11 niet punt per punt bijgewerkt; de stand per punt op 12/11 staat in `docs/audits/2026-11-12-webshop-qa/rapport.md` §6.

**Aangepast in de code, nog niet gepusht:** R5-04, R5-05, R5-06, R5-08.

**Shopify-data:**

- **R5-01:** vinyltags wegschrijven en een nieuwe build. Eerst pushen, zie `docs/agent-work/r4-en-vinylkleuren-2026-11-03.md`.
- **R5-02, R5-03:** kleur, motief en stijl taggen voor Boråstapeter en de rest van behang.
- **R5-07:** fotolabels vinyl. Wacht op de klaarmelding van Alexander.
- **R5-09, R5-42:** fotokoppelingen nakijken. Ontbrekende foto's staan in vraag 9.
- **R5-10:** de zin bij Goodnight weghalen na vraag 7.
- **R5-11:** vendor van 3 Desso-producten rechtzetten.
- **R5-26, R5-57:** titels van Loft79 en dubbele titels.
- **R5-56, R5-59:** schrijfwijze van kenmerken en overlap tussen filterwaarden.

**Vóór livegang:** R5-14 (redirects) en `SITE_INDEXEREN` aanzetten. Hangt ook af van vraag 10 (R5-20) en vraag 11 (R5-27).

**Proces en documentatie:**

- **R5-32:** iemand met toegang tot Shopify kijkt na of de webhooks aan staan.
- **R5-58:** `docs/filtersysteem.md` en de opdracht van de audit bijwerken. De antwoorden op vraag 2 horen daarbij.

**Code, prioriteit P2:** R5-43 (kleverige filterknop op mobiel).

**Code, afwerking (P3):**

- R5-12, R5-13, R5-15 t/m R5-19
- R5-21 (`site-header.tsx` staat lokaal in wijziging)
- R5-22 t/m R5-25
- R5-44 t/m R5-54
- R5-55 (tekst bij tapijten met vaste maten, hangt af van vraag 2)
