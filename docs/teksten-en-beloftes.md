# Teksten en beloftes op de webshop

Stand van 12/11/2026. Bron: `docs/audits/2026-11-12-webshop-qa/rapport.md` (§1 punt 3, §4.3, §4.4, §4.6, R6-05, R6-09, R6-10, R6-26, R6-31, R6-32, R6-37, R6-38, R6-39) en de ruwe logs van die audit (`a3-log.txt`, `a6-log.txt`). Getallen gelden voor productie (4.070 producten, 78 vaste pagina's).

Twee delen:

- **A.** Tekst en beloftes die niet van Brunic zijn: ze komen uit de leveranciersdata in Shopify.
- **B.** Beloftes die Brunic zelf maakt: ze staan op de vaste pagina's, in de code.

De vragen verwijzen naar `docs/vragen-aan-brunic.md` (1–12) en naar de nieuwe vragen in §7 van het rapport (A–E). Sinds 14/11/2026 staan alle vragen in die ene lijst: A tot E zijn daar vraag 13 tot 17, de keurmerken (A7) vraag 24 en de zin over projectinrichting (B8) vraag 25.

---

## A. Tekst en beloftes die niet van Brunic zijn

### A1. Louis De Poortere: de fabrikant spreekt in de wij-vorm

R6-32 · vraag 5 · alle 36 tapijten, telkens dezelfde zinnen · oplossing in Shopify

- [ ] "Elk tapijt wordt geproduceerd in onze eigen fabriek in België en rechtstreeks bij u thuis geleverd, met snelle levering in heel Europa."
- [ ] "Bent u klaar met uw tapijt, scan dan de QR-code op de achterkant. Wij halen het gratis op."
- [ ] "…recycleerbaar is via ons Take Care-programma…"
- [ ] "Een techniek ontwikkeld door ons eigen R&D-team in Moeskroen."
- [ ] "Ons gebruik van rPET en de strikte scheiding van gerecycleerde garens worden geauditeerd door OEKO-TEX®."
- [ ] "Onze milieuwinst is gedocumenteerd … vooruitgang die je kunt nagaan, geen vage groene belofte." (ook je-vorm)
- [ ] "…voor intensief gebruik raden we een speciale antislipmat aan (apart verkrijgbaar)."
- [ ] "Wevers uit 1929 … Louis De Poortere is een familiebedrijf, inmiddels in de vierde generatie."

Oplossing: zie C2. De volledige tekst is herschreven.

### A2. Garantietermijnen bij vinyl

R6-31 · vraag 4 · 245 producten (Beauflor 197, Tarkett 37, Gerflor 11) · kenmerk "Garantie"

- [ ] "5 jaar" (78)
- [ ] "10 jaar residentieel" (60)
- [ ] "7 jaar" (46)
- [ ] "7 jaar residentieel" (22)
- [ ] "8 jaar" (12)
- [ ] "10 jaar" (12)
- [ ] "15 Jaar" (9)
- [ ] "15 jaar residentieel" (4)
- [ ] "3 jaar" (1)
- [ ] "20 Jaar" (1)

Mag het niet blijven staan: label "Garantie" toevoegen aan `IS_LEVERBELOFTE` (`shopify-adapter.ts:145`).

### A3. Levertermijnen

Vraag 7

- [ ] **Goodnight (Artelux):** "Deze stof heeft een korte levertijd". Staat ook in de structured data (R6-10).
- [ ] **9 Boråstapeter-behangen uit Nordic Folk:** "Leverbaar tot (volgens leverancier): 12/26" (R6-37). Het gaat om Noras ang, Skogsstjarna, Nyponros, Isolde, Hedda, Idun, Tuva, Solangen en Arboretum.

In orde, geen actie nodig: "Levertermijn" (243 producten, "3-5 Werkdagen") en "Levertijd" (31) staan in de data, maar de site verbergt ze al.

### A4. Boråstapeter: de fabrikant spreekt

Geen eigen vraag (valt onder dezelfde regel als vraag 5) · oplossing in Shopify

- [ ] "Wij hebben de eer gekregen om de meest stijlvolle ontwerpen te selecteren…" (11 keer)
- [ ] "Creëer de sfeer voor een vredige nachtrust en zoete dromen met ons Newbie kinderbehang." (5 keer)
- [ ] "Met trots presenteren we de volgende collectielancering van Borastapeter: Graphics." (2 keer)
- [ ] "…is ons Jungle Wall-ontwerp een van de meest complexe ontwerpen die we ooit hebben gemaakt." (en de variant bij Jungle Wall – Animals)
- [ ] "ons Krusenberg-behang", "ons ultrarealistische behang Brick Wall", "Ons Madagascar Leaves behang"
- [ ] **Nieuw, niet in de audit:** in totaal zijn er ±79 verschillende wij-zinnen, vooral "Ons [naam] behang …" bij de linnen- en zandbehangen.
- [ ] **Nieuw, niet in de audit:** "U kunt ook uw dichtstbijzijnde retailer in het VK (of over de hele wereld) vinden met behulp van onze tool voor winkellocator." Deze zin stuurt de klant naar andere winkels.

### A5. Tarkett, Balsan, Lano en Artelux: losse zinnen van de fabrikant

Oplossing in Shopify

- [ ] Tarkett: "Deze collectie maakt deel uit van onze Circular Selection." (23 keer)
- [ ] Tarkett: "…bieden we de garantie op een lage circulaire CO2-voetafdruk…" (3 keer)
- [ ] Tarkett: "In het kader van het verminderen van onze CO2-voetafdruk lanceren we nu een nieuwe en verbeterde EcoBase®-tapijtrug…" (3 keer)
- [ ] Balsan: "onze tapijttegels zijn voor 100% van Frans fabrikaat!"
- [ ] Balsan: "…is ons bedrijf het resultaat van een ware worteling in het milieu."
- [ ] Balsan: "…de creatieve rondreizen van onze designers."
- [ ] Balsan: "adviseren we om deze niet te leggen in ruimtes die intensief belopen worden."
- [ ] Lano: "We verkleinen onze koolstofvoetafdruk in elke fase van de levenscyclus."
- [ ] Artelux: "Ook deze klassieker hebben we dit jaar een moderne optiek gegeven door de kleuren te vernieuwen."

### A6. Je-vorm in plaats van u-vorm

R6-09 · 104 producten (Boråstapeter 47, Louis De Poortere 36, Tarkett 20, ESTAhome 1) · oplossing in Shopify

- [ ] "Hang het in je woonkamer, eetkamer of keuken voor een moderne en elegante look."
- [ ] "Het behang 'In the Clouds' wordt … op maat gemaakt voor jouw muur."
- [ ] "Hoe zou Jungle Wall passen bij de kamer van je kind?"
- [ ] "Laat je creativiteit de vrije loop!"
- [ ] "De afmetingen van dit behang worden aangepast aan je muur."
- [ ] De overige zinnen staan in `a3-log.txt` (JE/JIJ).

Bij Louis De Poortere samen met A1 aanpakken.

### A7. Keurmerken en certificaten

Niet nagekeken · zichtbaar als kenmerk

- [ ] OEKOTEX (110)
- [ ] ISO 14001 en 9001 (62)
- [ ] GUI Allergy Certificate (54)
- [ ] CRI Green Label Plus (34)
- [ ] Certificeringen: OEKO-TEX®, ISO 9001, GRS (34)
- [ ] Green Building (36)
- [ ] Cradle to Cradle

Dit zijn claims van de leveranciers. Beslissen of Brunic ze mag tonen zoals ze zijn. → Vraag 24 in `docs/vragen-aan-brunic.md`.

### A8. Randgeval: "Beste klanten," bij vinyl

R6-05 · nieuwe vraag C · 274 producten (Beauflor 212, Tarkett 53, Gerflor 9)

- [ ] "Beste klanten, Heeft u graag dat uw vloerbekleding geplaatst wordt of vindt u niet de geschikte afmeting die u wenst? Neem contact met ons op via mail info@brunic.be"

Hier spreekt Brunic wel zelf: "ons" is Brunic. Het probleem is de vorm, want het is een brief en geen productbeschrijving. Bij 205 producten is dit de hele beschrijving. Voorstel: één zin zonder aanhef, of weglaten. De pagina heeft al een blok "Hulp nodig bij uw keuze?".

---

## B. Beloftes die Brunic zelf maakt

Vraag 6 · vaste pagina's en blokken in de code · nog niet bevestigd door Brunic

### B1. Gratis opmeting aan huis

R6-38, R6-69

- [ ] 39 zinnen op 21 pagina's, en de band bovenaan elke pagina: "Gordijnen op maat uit eigen atelier — gratis opmeting aan huis".
- [ ] "Wij komen gratis bij u thuis opmeten en bekijken ter plaatse wat uw ramen of vloeren nodig hebben."
- [ ] FAQ en contact: "Is de opmeting aan huis echt gratis?"
- [ ] Productpagina vinyl (277): "Gelegd door onze eigen mensen? Vraag een gratis opmeting aan huis aan".

### B2. Opmeting aangeboden bij behang

R6-26 · fout volgens `maatwerk.ts` (geen opmeting bij behang)

- [ ] `/inspiratie-en-advies/behang-kleine-ruimte`, `/fotobehang-panoramisch` en `/warme-tinten`: "Kom langs in onze winkel of vraag een opmeting aan huis aan." met de knop "Opmeting aanvragen".

Oplossing in de code: `inspiratie-en-advies/[slug]/page.tsx:96-102`, het slot per afdeling kiezen.

### B3. Binnen 1 à 2 werkdagen contact

R6-38 · 9 pagina's

- [ ] "Wij nemen binnen 1 à 2 werkdagen contact met u op."
- [ ] Pagina's: `/winkel-en-contact`, `/info/veelgestelde-vragen`, `/op-maat-en-plaatsing/opmeting-aan-huis`, `…/gordijnen-op-maat`, `…/raamdecoratie-op-maat`, `…/behang-en-fotobehang`, `…/plaatsing`, `…/vasttapijt-en-vloeren` en `…/projectinrichting`.

### B4. Eigen atelier en eigen stiksters

R6-38 · ±20 pagina's

- [ ] Home: "Gordijnen op maat, uit eigen atelier" en "Van ADO, Artelux en Loft79 — gemaakt in ons atelier".
- [ ] "Gordijnen maken we in ons eigen atelier, door onze eigen stiksters."
- [ ] Over Brunic: "Wat ons onderscheidt, is ons eigen atelier."

### B5. Levering en plaatsing door eigen mensen

- [ ] "Wat wij verkopen, plaatsen we ook zelf."
- [ ] "Gordijnen, raamdecoratie en vasttapijt worden bij u thuis geleverd en geplaatst door onze eigen mensen."
- [ ] `/info/levering`: "Gordijnen op maat, raamdecoratie, vasttapijt en tapijten op maat leveren wij bij u thuis met onze eigen mensen."

### B6. Leeftijd van het bedrijf

R6-38

- [ ] Over Brunic: "Brunic is een familiebedrijf dat al 40 jaar in Ninove klaarstaat…" en "Sinds 1992 is Brunic een nv."
- [ ] Home: "Familiebedrijf sinds 1992".
- [ ] **Tegenstrijdig, niet in het rapport opgenomen:** "al 40 jaar" komt uit op ±1986, en 1992 is het jaar van de nv. Eén jaartal kiezen.

### B7. Afdelingen zonder producten online

R6-39 · nieuwe vraag D

- [ ] Over Brunic en FAQ: "…gordijnen en stoffen, raamdecoratie, behang, vasttapijt, tapijten, verf en slaapcomfort." Raamdecoratie, verf en slaapcomfort hebben geen producten in de webshop. Als Brunic ze in de winkel verkoopt: "in onze winkel" toevoegen.

### B8. Projectinrichting

Niet mee beslist op 13/11 (§D) → vraag 25 in `docs/vragen-aan-brunic.md`.

- [ ] "Voor hotels, restaurants, zorginstellingen en andere projecten leveren wij brandvertragende en brandvrije stoffen, gordijnen uit ons eigen atelier en vasttapijt of tapijttegels voor intensief gebruik."

### B9. Offerte na opmeting

- [ ] "Na de opmeting krijgt u een offerte die precies aangeeft wat er gemaakt, geleverd en geplaatst wordt, met een indicatie van de termijn."

### B10. Verwijzing naar de winkel bij behang

In orde volgens het rapport

- [x] Behang per rol: "Liever eerst in het echt zien? Bekijk de stalenboeken in onze winkel".
- [x] Boråstapeter: "De afmetingen en de hoeveelheid die u nodig hebt, bekijken we graag samen met u in onze winkel."

### B11. Wettelijk en toegelaten

Geen vraag voor Brunic

- [x] 14 dagen herroeping, 2 jaar wettelijke garantie, levering uiterlijk binnen 30 dagen.
- [x] `/aanbiedingen`: "De doorstreepte prijs is de laagste prijs die in de 30 dagen vóór de actie gold." en "De actie loopt zolang de voorraad strekt".
- [ ] Accordeon "Retourneren" op elke productpagina: "op maat gesneden stoffen, behang of vasttapijt vallen daar wettelijk niet onder". Nog juridisch te toetsen (TODO B17).

---

## C. Oplossing: uniforme leveranciersteksten

Beslist door Alexander op 13/11/2026.

De beschrijvingen komen van de websites van de leveranciers, via scraping. Daardoor spreekt de fabrikant in de wij-vorm en belooft hij dingen die niet op de werking van Brunic gebaseerd zijn, zoals levering, ophalen en termijnen. Op de site van Brunic leest de klant dat alsof Brunic het zegt.

### C1. Huisregels voor elke leverancierstekst

1. **Brunic is altijd de afzender.** "Wij", "we", "ons" en "onze" staan enkel in een tekst als Brunic bedoeld is, zoals "Neem contact met ons op via info@brunic.be".
2. **De fabrikant komt in de derde persoon, met zijn naam.** Dus "Louis De Poortere produceert…", "de Circular Selection van Tarkett", "het Newbie-kinderbehang van Boråstapeter". Lukt dat niet vlot, dan schrijven we "de fabrikant".
3. **Geen beloftes van de leverancier over levering, levertermijn, verzending, ophalen, voorraad of service.** Levering volgt enkel de regels van Brunic (`/info/levering`). Zinnen zoals "rechtstreeks bij u thuis geleverd" en "snelle levering in heel Europa" gaan eruit. Ook terugname-, ophaal- en inzamelprogramma's van de fabrikant (Take Care van Louis De Poortere, Restart® van Tarkett) staan niet op de site: Brunic deelt dat mee aan de klant bij de levering (beslist 14/11/2026). Dat het product recycleerbaar is, mag blijven: dat is een productfeit.
4. **Geen verwijzingen naar diensten of tools van de leverancier**, zoals een winkellocator, andere verkooppunten of de eigen webshop van de leverancier.
5. **Feiten over het product blijven staan**: materiaal, herkomst, techniek, certificaten en gebruiksadvies. We brengen ze als informatie van de fabrikant ("volgens Louis De Poortere…" waar nodig).
6. **Altijd de u-vorm** (R6-09).
7. **Geen aanhef en geen brief** (R6-05).
8. **Geen tijdgebonden zinnen** zoals "dit jaar", "nu lanceren we" of "volgende collectielancering".
9. **Marketingproza zonder informatie mag weg** ("Kom, laten we ontdekken!", "Meer dan ooit hebben we behoefte aan…").

### C2. Louis De Poortere: nieuwe tekst

Het gaat om 36 tapijten. De vijf alinea's onder de titels zijn bij alle 36 dezelfde. De alinea "Het ontwerp" is bij elk product anders en bevat geen wij-vorm, dus die blijft staan.

**Gemaakt voor het dagelijks leven**

> Gebruik hem binnen of buiten. Was hem in de machine wanneer hij vuil is. De kleuren blijven jarenlang helder. Geschikt voor vloerverwarming. De achterzijde heeft een grip-coating — handig, maar geen volwaardig antislipsysteem; voor intensief gebruik raadt Louis De Poortere een aparte antislipmat aan. Gemaakt om echte slijtage te doorstaan zonder te verliezen waarom u hem koos.

Gewijzigd: "raden we … aan (apart verkrijgbaar)" werd "raadt Louis De Poortere … aan". "Apart verkrijgbaar" valt weg, want dat zou betekenen dat Brunic die mat verkoopt.

**Een dun tapijt**: ongewijzigd, want daar staat geen wij-vorm en geen belofte in.

**Circulair van ontwerp**

> Gemaakt uit één enkel materiaal: polyester, 70 % gerecycleerd (rPET). Dat percentage stijgt elk jaar — 20 % in 2023, 40 % in 2025, 70 % in 2026 — met 100 % als doelstelling voor 2030. Het gebruik van rPET en de strikte scheiding van gerecycleerde garens worden geauditeerd door OEKO-TEX®. Omdat het tapijt uit één materiaal bestaat, is het aan het einde van zijn leven volledig recycleerbaar, zonder de onderdelen te moeten scheiden. Die techniek werd ontwikkeld door het eigen onderzoeksteam van Louis De Poortere in Moeskroen. De milieuwinst is gedocumenteerd in een levenscyclusanalyse van twee onafhankelijke organisaties: Centexbel en de Universiteit van Luik.

Gewijzigd: "Ons gebruik", "ons eigen R&D-team" en "Onze milieuwinst" staan nu in de derde persoon. "Via ons Take Care-programma" valt weg (regel 3, 14/11/2026). "Vooruitgang die je kunt nagaan, geen vage groene belofte" valt weg (je-vorm, marketing).

**Ontworpen om terug te keren**: hele alinea geschrapt (14/11/2026). Het terugnameprogramma (QR-code, gratis ophalen, doorverkoop) deelt Brunic mee bij de levering, niet op de site (regel 3).

**Erfgoed met een toekomst**

> Louis De Poortere weeft tapijten sinds 1929 en is een familiebedrijf in de vierde generatie. Elk tapijt wordt geproduceerd in de eigen fabriek van Louis De Poortere in België.

Gewijzigd: "onze eigen fabriek" werd "de eigen fabriek van Louis De Poortere". De naam van het merk is duidelijker dan "hun" op een productpagina van Brunic. "En rechtstreeks bij u thuis geleverd, met snelle levering in heel Europa" valt weg (regel 3).

### C3. Andere merken: voorbeelden van de omzetting

| Merk | Nu | Wordt |
|---|---|---|
| Boråstapeter (13×) | "Wij hebben de eer gekregen om de meest stijlvolle ontwerpen te selecteren – gecreëerd door de grootste designers van de moderne tijd – en deze als exclusief behang nieuw leven in te blazen." | "Boråstapeter selecteerde stijlvolle ontwerpen van grote designers uit de moderne tijd en brengt ze opnieuw uit als exclusief behang." |
| Boråstapeter (5×) | "…met ons Newbie kinderbehang." | "…met het Newbie-kinderbehang van Boråstapeter." |
| Boråstapeter (2×) | "Met trots presenteren we de volgende collectielancering van Borastapeter: Graphics." | "Dit behang hoort bij de collectie Graphics van Boråstapeter." |
| Boråstapeter | "…is ons Jungle Wall-ontwerp een van de meest complexe ontwerpen die we ooit hebben gemaakt." | "…is Jungle Wall een van de meest complexe ontwerpen die Boråstapeter ooit maakte." |
| Boråstapeter (±60×) | "Ons Dreamy Tree behang, gekleurd in…" | "Het behang Dreamy Tree, gekleurd in…" |
| Boråstapeter | "U kunt ook uw dichtstbijzijnde retailer in het VK (of over de hele wereld) vinden met behulp van onze tool voor winkellocator." | Schrappen (regel 4) |
| Boråstapeter | "Kom, laten we ontdekken!" / "We weten niet wanneer of hoe het wordt gedrukt, maar…" | Schrappen (regel 9) |
| Tarkett (23×) | "Deze collectie maakt deel uit van onze Circular Selection." | "Deze collectie maakt deel uit van de Circular Selection van Tarkett." |
| Tarkett (3×) | "…bieden we de garantie op een lage circulaire CO2-voetafdruk…" | "…heeft de collectie volgens Tarkett een lage circulaire CO2-voetafdruk…" |
| Tarkett (3×) | "In het kader van het verminderen van onze CO2-voetafdruk lanceren we nu een nieuwe en verbeterde EcoBase®-tapijtrug…" | "Om zijn CO2-voetafdruk te verkleinen, ontwikkelde Tarkett de EcoBase®-tapijtrug…" |
| Balsan | "onze tapijttegels zijn voor 100% van Frans fabrikaat!" | "De tapijttegels van Balsan worden volledig in Frankrijk gemaakt." |
| Balsan | "…adviseren we om deze niet te leggen in ruimtes die intensief belopen worden." | "…raadt Balsan af om dit tapijt te leggen in ruimtes die intensief belopen worden." |
| Balsan | "…de creatieve rondreizen van onze designers." | "…de creatieve reizen van de designers van Balsan." |
| Balsan | "…is ons bedrijf het resultaat van een ware worteling in het milieu." / "Meer dan ooit hebben we behoefte aan…" / "…beuren ons op…" | Schrappen (regel 9) |
| Lano | "We verkleinen onze koolstofvoetafdruk in elke fase van de levenscyclus." | "Lano verkleint zijn koolstofvoetafdruk in elke fase van de levenscyclus." |
| Artelux | "Ook deze klassieker hebben we dit jaar een moderne optiek gegeven door de kleuren te vernieuwen." | "Artelux gaf deze klassieker een moderne optiek met vernieuwde kleuren." |

Je-vorm (A6, 104 producten) wordt in dezelfde ronde u-vorm: "Hang het in je woonkamer" wordt "Hang het in uw woonkamer".

### C4. Uitvoering

- **Waar:** in de pipeline die de leveranciersteksten ophaalt en naar Shopify schrijft, als vaste stap na de scraping, en daarna in Shopify. Als de aanpassing enkel in Shopify gebeurt, kan een volgende scraping of sync de oude tekst terugzetten. Het scrape-script staat niet op de pc van Alexander: dit nakijken met Jeroen.
- **Niet in de front:** de site toont wat in Shopify staat. Teksten herschrijven in de code van de site zou dezelfde fout verbergen in plaats van ze op te lossen.
- **Omvang:** Louis De Poortere 36 producten (één vaste tekst, één keer herschrijven), Boråstapeter ±89 producten en ±79 zinnen, Tarkett ±30, Balsan 4, Lano 1, Artelux 1, je-vorm 104. Bij Boråstapeter is een zinsgewijze omzetting nodig, met nalezen.
- **Controle achteraf:** opnieuw zoeken naar wij, we, ons, onze, je, jij, jouw en "levering" in alle beschrijvingen, zoals in `a3-log.txt`. Doel: enkel nog zinnen waarin Brunic de afzender is.
- **Opnemen in de audit:** regels C1 als vaste controle toevoegen aan `.agents/skills/webshop-qa-audit/SKILL.md`, zodat de volgende ronde dit meet.

---

## D. Beslissingen van 13/11/2026 en uitvoering

Beslist door Alexander op 13/11/2026, voor Brunic. Uitgevoerd dezelfde dag, in de code en in Shopify (dev-store `brunic-3`).

| Punt | Beslissing | Uitgevoerd | Waar |
|---|---|---|---|
| A2 | Garantie niet als kenmerk, enkel in de beschrijving | Kenmerk "Garantie" verborgen. In 245 vinylbeschrijvingen een zin "{Merk} geeft op deze vloer N jaar fabrieksgarantie (bij residentieel gebruik)." | `IS_LEVERBELOFTE` in `shopify-adapter.ts` · `set-leveranciersteksten.mjs` |
| A3 | Leverbeloftes van de merken weg | Goodnight: "korte levertijd" weg. "Leverbaar tot (volgens leverancier)" verborgen. Louis De Poortere: levering en gratis ophalen weg | Idem |
| A3 (14/11) | Terugname- en ophaalprogramma's van fabrikanten staan nergens: Brunic deelt dat mee bij de levering | Louis De Poortere (36): alinea "Ontworpen om terug te keren" geschrapt, "via het Take Care-programma" weg. Tarkett Enlaced (1): "via het Restart®-programma" weg. "Recycleerbaar" blijft als productfeit. De controle zoekt er voortaan naar (soort `terugname`) | Idem, pushlog `LEVERANCIERSTEKSTEN_SHOPIFY_PUSH_LOG_2026-11-14-15-03-47.json` |
| A1, A4, A5 | Elke leverancierstekst vanuit de winkel: de fabrikant in de derde persoon, met zijn naam ("de Circular Selection van Tarkett") | 232 producten herschreven, 6 met geschrapte zinnen. Mapping per merk | `packages/catalog/leveranciersteksten.json` |
| A6 | Overal de u-vorm | Mee herschreven | Idem |
| A8 | "Beste klanten," weglaten | De brief is weg bij 274 vinylproducten. Bij 17 (Beauflor 7, Tarkett 10, zonder garantie) blijft er geen beschrijving over | Idem |
| B1 | Gratis opmeting blijft. Plaatsing "door vakmannen" (derden), niet "onze eigen mensen" | In alle vaste teksten, banden, menu, productpagina ("Gelegd door vakmannen?") en metaobjects | `packages/catalog/beloftes-teksten.mjs` |
| B2 | Opmeting bij behang kan | `maatwerk.ts`: nieuwe soort `behang` (opmeting wel, atelier en plaatsing niet). Productpagina, promoband, megamenu, merkpagina en de dienstpagina behang bieden de opmeting aan | `maatwerk.ts`, `product-view.tsx`, `product-info.tsx`, `promo-banner.tsx`, `menu-data.ts` |
| B3 | Reactie nog dezelfde dag, ook bij een aanvraag op zondag (bevestigd 14/11) | Overal "nog dezelfde dag", zonder voorbehoud | Tabel |
| B4 | Gordijnen worden in het atelier op maat gebracht, niet gemaakt. Stoffen van ADO, Artelux en Loft79. Onderscheid: service, kwaliteit en eigen atelier | Tabel. Geen "eigen stiksters" meer | Tabel |
| B5 | Brunic plaatst niet zelf | "Wat wij verkopen, plaatsen we ook zelf" is weg | Tabel |
| B6 | Brunic bestaat sinds 1982 | "Sinds 1982" overal, ook `foundingDate` in de structured data. "Sinds 1992 is Brunic een nv" blijft | Tabel, `config.ts` |
| B7 | Verf en slaapcomfort helemaal weg. Raamdecoratie blijft | Uit alle teksten. De teksten voor de lege categorieën zijn weg, ook de twee metaobjects in Shopify (back-up in de pushlog) | `categorie-teksten.ts` |
| B9 | Offerte: de prijs, de mogelijkheden voor plaatsing en waar nodig de termijn | Dienst opmeting, artikel atelier, productpagina | Tabel |
| Vraag 7 | Online bestellingen binnen de week, met meteen een bevestiging van de leverdatum. "Indien uit voorraad kan het langer duren" (Alexander, 14/11): gelezen als "is het product niet meer in voorraad" | `/info/levering`, nieuwe FAQ, accordeon "Levering & afhalen" bij producten met een prijs. Op de site: "Moet het product nog bij de leverancier besteld worden, dan kan het langer duren", zodat "uit voorraad" niet als "uit de voorraad geleverd" gelezen wordt | `content.ts`, `product-info.tsx` |
| Vraag 7 (18/11) | Audit: op de productpagina's stond "binnen de week" zonder het voorbehoud. Regel: de belofte staat nooit zonder "Moet het product nog bij de leverancier besteld worden, dan kan het langer duren" | Accordeon "Levering & afhalen" op elke productpagina met een prijs aangevuld. Intro van `/info/levering` aangevuld, in de code én in Shopify (metaobject `infopagina/levering`, pushlog `BELOFTES_INHOUD_SHOPIFY_PUSH_LOG_2026-11-18T13-01-50.json`). `VERBODEN` vangt nu "binnen de week" zonder "leverancier" in dezelfde tekst. De controle op de productbeschrijvingen zoekt ook naar werkdagen, "binnen … dagen/week", verzending en voorraad | `product-info.tsx`, `content.ts`, `beloftes-teksten.mjs`, `set-leveranciersteksten.mjs` |

**Terugzetten:** elke schrijfopdracht naar Shopify heeft een pushlog met de oude waarden in `..\Data\`: `BELOFTES_INHOUD_SHOPIFY_PUSH_LOG_2026-11-13T16-45-19.json` (37 metaobjects bijgewerkt, 2 verwijderd) en `LEVERANCIERSTEKSTEN_SHOPIFY_PUSH_LOG_2026-11-13-16-50-41.json` (510 producten). Beide scripts hebben `--rollback <log>`.

**Controle:** `node packages/catalog/set-beloftes-inhoud.mjs --controle` en `node packages/catalog/set-leveranciersteksten.mjs --controle` geven allebei 0 treffers (13/11/2026, 16:51). De audit (`.agents/skills/webshop-qa-audit/SKILL.md`) meet dit vanaf nu elke ronde, met dezelfde lijst van verboden formuleringen.

**Nog niet op de site:** productie toont de momentopname van 03/11. De nieuwe beschrijvingen komen pas na een nieuwe build, en de codewijzigingen pas na een push naar `master`.

**Nog open:**

- 17 vinylproducten hebben geen beschrijving meer (R6-54).
- Een nieuwe import of scraping van de leveranciersteksten zet de oude tekst terug. De herschrijving moet in die pipeline een vaste stap worden (§C4). Tot dan: na elke import `set-leveranciersteksten.mjs` opnieuw draaien (dry-run, nalezen, `--apply`).
- De nieuwe FAQ over de levertermijn staat enkel in de code. In Shopify is er nog geen `onderdeel_faq` voor, want de FAQ is daar nog niet gekoppeld.

---

## Stand

| Vraag | Onderwerp | Delen van deze lijst | Status op 13/11 |
|---|---|---|---|
| 4 | Garantie bij vinyl | A2 | Beslist en uitgevoerd (§D) |
| 5 | Tekst Louis De Poortere | A1 (en A4, A5 naar analogie) | Herschreven (§D). Het terugnameprogramma staat niet op de site: Brunic meldt het bij de levering (14/11) |
| 6 | Beloftes van Brunic | B1–B6, B9 | Beslist en uitgevoerd (§D) |
| 7 | Levertermijnen | A3 | Beslist en uitgevoerd (§D) |
| C (nieuw) | "Beste klanten," bij vinyl | A8 | Weggelaten (§D) |
| D (nieuw) | Afdelingen in "Over Brunic" | B7 | Verf en slaapcomfort weg (§D) |
| – | Je-vorm | A6 | Uitgevoerd (§D) |
| 24 (sinds 14/11) | Keurmerken | A7 | Nog te beslissen |
| 25 (sinds 14/11) | Zin over projectinrichting | B8 | Nog te bevestigen |
