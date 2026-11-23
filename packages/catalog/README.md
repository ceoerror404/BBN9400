# packages/catalog — de catalogus-pipeline (PIM-light)

**Bron van waarheid voor alle productdata.** Shopify is het publicatiekanaal, de AI-chatbot een tweede afnemer — beiden lezen uit wat hier gebouwd wordt (beslissing 08/07, zie `docs/architectuur.md`).

## Pipeline-stadia (te bouwen)
```
1. ingest     ERP-exports + Woo-export inlezen (data/) → genormaliseerde catalog-DB (SQLite)
2. trechter   selectie launch-set (v2 gedraaid 08/07 → data/trechter/trechter-v2-shortlist.csv)
3. verrijk    attributen per categorie: scraping leveranciers (poolhoogte, kleur, design,
              materiaal, patroon…) + ERP-joins + nette titels + eenheden-normalisatie
4. media      foto-mapping: Woo-URL's + gescrapete beelden → staging data/media/
              (artikelnummer-genaamd, bron+licentie gelogd) → herschalen ~2048px
5. review     CSV-export per categorie → Sandra/Aga vinken af → terug inlezen
              (de sheet is een interface, nooit de bron)
6. publish    Shopify bulk-sync via GraphQL productSet (JSONL): producten + varianten
              + metafields + beelden + collections. Veld-eigenaarschap: pipeline-owned
              (attributen/metafields/beelden/titels) vs admin-owned (prijs, status, voorraad)
7. ai-export  kennisbank voor de chatbot: attributen als filter-tools + teksten voor retrieval
```
Elke stap idempotent en her-runbaar (trechter-principe: correctieronde = her-run, geen handwerk).

## `trechter_v3.py` — dé trechter (✅ eerste echte run 22/08, gereconcilieerd)
Draait volledig op de Excels (geen PDF/pypdf meer; dependency: `openpyxl`) en heeft de v2-selectielogica in code: **shortlist = (verkocht ∪ voorraad) − consignatie − uitgefaseerd (`***`, regel 14/07)**. Inputs (zie `data/README.md` voor de bestandsnamen — hernoemd 22/08, oude namen worden als fallback herkend): prijzenlijst 14/07 + verkoop-per-artikel 08/07 + voorraad 08/07 + crediteurenlijst + Woo-export (.csv of .xlsx). Outputs in `data/trechter/`, telkens in **twee formaten**: `.xlsx` voor mensen (vaste vette kopregel, filterknoppen, kolombreedtes, echte getallen — sorteren werkt) én `.csv` voor de pipeline: `trechter-v3-shortlist` (verrijkt: prijs/per-rol — prijs 0 = sentinel, telt als ontbrekend —, leveranciersnaam via `440`+LLL, `bron`, `etalage` op raamdecoratie, maat-parsing volgens de domeinregels hieronder, woo-match, omzet 12m), `-geclassificeerd` (alle artikelen, gededupt), `-prijsloos` (vraaglijst Sandra), `-woo-niet-in-erp`. Flags: `--categorieen "…"` (deelscope) en `--uitsluiten verhuur,coupon-outlet,op-bestelling` (strenger schiften; standaard blijven die ín de set, gemarkeerd in `status`, voor vergelijkbaarheid met v2).

**Run 22/08 (eerste op echte data): shortlist 12.734** — reconciliatie met de baselines klopt: prijsdekking exact 98,7% (170 prijsloos ≈ de gedocumenteerde 169), Woo-niet-in-ERP exact 1.145, categorie-aantallen ≈ design-brief (Tapijten 2.257, Raamdecoratie 323, Vasttapijt 177 exact). Verschil met de v2-baseline (12.765) = de 25 nieuw-uitgefilterde `***`-artikelen + 16 niet-numerieke unie-rijen. Artikelbestand: 64.859 = v1's 65.314 minus de 455 bekende duplicaten, exact — daarmee is de PDF-route (v1, `trechter.py`) geverifieerd overbodig en op 22/08 verwijderd (staat in git-historie; v1-outputs `erp-geclassificeerd.csv`/`woo-only.csv` blijven historisch in `data/trechter/`).

## Metafield-schema (stap 3/6 — vast te klikken vóór de bulk-import)
Alle definities filterable via Search & Discovery; namespace-voorstel `brunic`.
| Veld | Type | Niveau | Categorieën |
|---|---|---|---|
| `breedte_cm` / `lengte_cm` | number_integer | **variant** | tapijten, vasttapijt, jaloezieën (maatfilter = bucket-UI, zie architectuur.md) |
| `poolhoogte_mm` + `poolklasse` (hoog/laag) | number_integer + text | product | tapijten, vasttapijt |
| `materiaal` | text (lijst) | product | alle |
| `kleurfamilie` | text, 1 waarde (keuzelijst) | product + **variant** | alle — de site telt product- én variantwaarden voor de kleurfilter (variant = kleur van die kleurvariant) |
| `accentkleuren` | list.single_line_text_field (keuzelijst = die van kleurfamilie, max. 2) | **variant** | tapijten (✅ 22/10); gordijnstoffen (✅ 28/10) — samen met de variant-`kleurfamilie` het kleurbolletje op de site |
| `motief` | list.single_line_text_field (keuzelijst, max. 2) | product | tapijten (✅ 22/10: 172 vloerkleden, `set-tapijt-tags.mjs`); gordijnstoffen (✅ 28/10: 576 stoffen, zelfde keuzelijst, `export-tagreview.mjs` + `set-tapijt-tags.mjs --type Gordijnstof,Passement`); behang na opschoning van zijn motieven |
| `stijl` | list.single_line_text_field (keuzelijst, max. 2) | product | idem; `stijl_design` (1 waarde) blijft ongemoeid |
| `stijl_design` | text (lijst) | product | tapijten, behang, stoffen |
| `patroon` | text | product | behang, stoffen (effen/bloemen/streep/tekening — draagt de subcollecties) |
| `vorm` | text | product | tapijten (rond/vierkant/speciaal — draagt de vorm-subcollecties) |
| `look` | text | product | click vinyl (parket/uniform/tegel — filter, geen subcategorie) |
| `toepassing` | text | product | tapijten (binnen/buiten), vloerbekleding |
| `brandvertragend_norm` | text | product | projectstoffen, tapijten (B2B-filter) |
| `rolbreedte_cm` | number_integer | product | behang (53), wasdoek, vasttapijt, kamerhoogte-stoffen (270/320) |
| `etalage` | boolean | product | alle (true = tonen-niet-verkopen; front-end verbergt prijs/koopknop, chatbot noemt geen prijs) |
| `erp_familie` | text | product | alle (herkomst-koppeling `LLL FFF`) |
| `verkoop_eenheid` | text | product | alle — keuzelijst `Per stuk` / `Per lopende meter` / `Per rol` / `Per m²` / `Per doos` (doos sinds 18/11/2026: de site toont dan ook de prijs per m² uit het kenmerk "Oppervlakte / doos") (vervangt het eerdere `verkoop_per_meter`-voorstel; UX per-meter-verkoop nog open) |

## Domeinregels (vastgelegd 09/07/2026, uit de data geverifieerd)
- **`breedte = min(a, b)`, `lengte = max(a, b)`** — bronnamen zijn niet consistent georiënteerd (Woo: "Herati 141x72", "Tosserkhan 230x140"). Het maatfilter draait op breedte, dus normaliseren is verplicht.
- **Rolmaten verwerpen.** `... LOPER 2862 GRIJS / ANTIVUIL 100X25M ...` is een rol van 100 cm × **25 m**, geen tapijt van 100×25 cm. Een `M`-suffix (of lengte ≫ breedte) = rol → geen breedte/lengte-metafield, wél `verkoop_per_meter`.
- **Matten ≠ karpetten.** Voetmatten/badmatten/knoeimatten/lopers (breedte < 80 cm) horen in een eigen webcategorie. Mét die matten zit 55% van de tapijten in één maat-bucket; zónder klopt de bucket-indeling uit het design (19/44/30/7%). Zie decisions/log.md 2026-07-09.
- **Etalage-producten** krijgen `price 0.00` + `brunic.etalage = true`; de storefront onderdrukt prijs en koopknop. Prijs 0 is dus géén geldige prijs, maar een "nog geen prijs"-sentinel tot de prijzen-export landt.
  > ⚠️ **Shopify beschermt dit NIET.** Een etalageproduct met prijs €0 is in Shopify zelf niet afgeschermd. De bescherming zit uitsluitend in onze eigen kassa-route (`apps/prototype/src/app/api/kassa/route.ts`), die live de etalage-vlag, `price > 0` en `availableForSale` controleert. **Een import die `brunic.etalage` vergeet te zetten op een prijsloos product maakt dat product afrekenbaar.** Zet de vlag altijd expliciet, ook op `false`.
- **Publiceren op het Headless-kanaal is verplicht** (stap 6). Een product of collection dat niet op de publication **`Brunic Headless`** staat, is *onzichtbaar* voor de Storefront API — `collection(handle:…)` geeft dan gewoon `null`, zónder foutmelding. `productSet` publiceert **niet** automatisch: elke import moet `publishablePublish(id, { publicationId })` meenemen, anders bouwt de site een lege catalogus. (Geverifieerd 10/07: 10 producten waren admin-zijdig correct maar Storefront-zijdig onzichtbaar tot publicatie.)
- **Metafield-filters bestaan pas na Search & Discovery.** `access: { storefront: PUBLIC_READ }` op de definitie maakt de *waarde* leesbaar, maar niet filterbaar: het filter zelf (`filter.v.m.brunic.breedte_cm`) verschijnt pas als het in de S&D-app is toegevoegd én opgeslagen.

## ⚠️ Open probleem dat de 13.9k-import blokkeert: **product-groepering**
Het ERP houdt **één artikel per maat** aan; `architectuur.md` §Datamodel eist **één product per design/kleur met maten als varianten**. Die hergroepering is nog niet opgelost:
- 2.024 tapijt-artikelen met maat → naïef groeperen (maat wegstrippen) geeft **1.848 groepen, waarvan slechts 103 met >1 maat**.
- Oorzaak: `omschrijving` is **vast-breed afgekapt** (`… / BRUNIC DE` vs `… / BRUNIC DEC`), dus het staartstuk verschilt per maat.
- De WooCommerce-export kan niet bijspringen: **1.478 van de 1.824 variaties (81%) hebben geen `_parent_sku`** en zijn dus wees.
Stap 3 (`verrijk`) moet hiervoor een expliciete groeperingssleutel krijgen (ERP-familiecode `LLL FFF` + design/kleurcode), niet de vrije tekst.

## Open beslissingen (zie ook docs/architectuur.md §Datamodel)
Per-meter-verkoopmodel (0,1m-increment vs lengte-invoer; minimale afname + snij-stap nog bij Sandra ophalen) · ERP-sync-cadans na livegang · scraping-bronnen: leverancierslijst ✅ 14/07 (crediteur = `440`+LLL, geverifieerd) en beeldrechten als dealer ✅ — dealersportaal-toegang nog te ontvangen.

**Beslist 14/07 (antwoorden Bruno, zie J.A.R.V.I.S doc 20):** prijzen **incl. btw** importeren zoals geleverd · alles koopbaar **behalve raamdecoratie** (`etalage = true` op die hele webcategorie) · eenheden: stoffen per lopende meter, behang per rol (10 m × 0,53 m, `PER ROL`-prijskolom), vloer per m² · `***` in omschrijving = **uitgefaseerd** → uitfilteren in trechter v3 · consignatie blijft eruit.

**Doorgevoerd 02/08 (subcategorie-conventies, zie J.A.R.V.I.S doc 11 §v3):** hoofdcollecties hernoemd (**Vloerbekleding** `vloerbekleding`, **Tapijten** `tapijten`) · **29 subcollecties** aangemaakt in de dev-store, handle-conventie **`<hoofdprefix>-<sub>`** (`stoffen-effen` … `behang-baby`; gedeeld: `logotapijt` onder Tapijten én Vloerbekleding), allemaal gepubliceerd op **Brunic Headless** · metafield-definities `patroon, stijl_design, vorm, look, toepassing, rolbreedte_cm, verkoop_eenheid` aangemaakt (PUBLIC_READ; ⚠️ S&D-filters nog handmatig aanzetten in de app) · aanvulling eenheden: stoffen ook per **kamerhoogte** (rol 2,70/3,20 m) — verkoopmodel bij Sandra ophalen (doc 20 punt 8). De import (stap 6) moet elk product behalve aan de hoofd- ook aan de juiste **subcollectie(s)** toevoegen; tapijt-subs mogen overlappen. ⚠️ De front leidt het kruimelpad af uit de collecties van het product: staat een product **enkel** in een subcollectie en niet in zijn hoofdcategorie, dan verdwijnt het van de categoriepagina. Zet dus altijd **beide**. De boom volgt in de site (`apps/prototype/src/data/shopify-bron.ts`) uit het handle-voorvoegsel — een nieuwe subcategorie = enkel de collectie in Shopify (handle `<hoofdprefix>-<sub>`, publiceren op Brunic Headless); een sub zonder voorvoegsel (zoals `logotapijt`) komt in `SHOPIFY_SUB_EXTRA`.

## `set-leveranciersteksten.mjs` — productbeschrijvingen volgens de huisregels (13/11/2026)
Past de gescrapete leveranciersteksten in Shopify aan volgens `docs/teksten-en-beloftes.md` §C1: Brunic is de enige "wij", de fabrikant staat in de derde persoon met zijn naam, geen lever-/ophaal-/termijnbeloftes van de fabrikant, geen winkellocator, altijd de u-vorm. Drie stappen per actief product: (1) de vinylbrief ("Beste klanten, … Neem contact met ons op via mail info@brunic.be") weg bij Beauflor, Tarkett en Gerflor; (2) het kenmerk `Garantie` als zin achteraan ("Beauflor geeft op deze vloer 10 jaar fabrieksgarantie bij residentieel gebruik.") — het kenmerk blijft, de site verbergt het label; (3) de zinnen uit **`leveranciersteksten.json`** (per vendor: oude tekst → nieuwe tekst, `""` = schrappen; Desso en Tarkett delen hun zinnen) vervangen, ook als er tags of entiteiten in de zin staan. Herhaalbaar.
```
node packages/catalog/set-leveranciersteksten.mjs                  # dry-run → ..\Data\LEVERANCIERSTEKSTEN_REVIEW_<tijd>.md + _PLAN_<tijd>.json
node packages/catalog/set-leveranciersteksten.mjs --apply <plan>   # schrijft naar Shopify, pushlog met oude + nieuwe HTML
node packages/catalog/set-leveranciersteksten.mjs --rollback <log> # zet de oude HTML terug
node packages/catalog/set-leveranciersteksten.mjs --controle       # live: wij/je-vorm, aanhef, leverbeloftes, winkellocator, "??", garantiezin — doel 0
```
De dry-run meldt "niet herschreven" (zinnen die na de mapping nog tegen de regels ingaan) en mappingzinnen die nergens gevonden zijn. Een nieuwe scraping of sync kan de oude tekst terugzetten: draai dan opnieuw, en vul de mapping aan voor nieuwe zinnen. Na `--apply` pas zichtbaar op de site na een nieuwe build (momentopname).

## `set-boras-prijzen.mjs` — Boråstapeter-behang per rol (18/11/2026)
Zet de Belgische winkelprijs per rol van borastapeter.com op het Boråstapeter-behang (`productType` Behang; fotobehang op maat blijft op aanvraag). Koppeling: variant-SKU = artikelnummer. Borastapeter.com toont de prijs per land van de bezoeker en remt scripts sterk af (429), dus de prijzen komen uit een browserscript dat iemand in België zelf in de console van borastapeter.com plakt (`boras-prijzen-browser.js` is het sjabloon).
```
node packages/catalog/set-boras-prijzen.mjs --browserscript                 # → ..\Data\BORAS_PRIJZEN_<datum>\prijzen-ophalen.js
node packages/catalog/set-boras-prijzen.mjs "<boras-prijzen-BE.json>"       # dry-run: verdeling, uitschieters, deels geprijsde producten
node packages/catalog/set-boras-prijzen.mjs "<…json>" --verkoopbaar --go    # schrijven + etalage uit; pushlog in ..\Data\
node packages/catalog/set-boras-prijzen.mjs --rollback "<pushlog>" --go     # terugzetten
```
Gewone prijs incl. btw (bij een actie op hun site de doorgestreepte). Enkel een product met een prijs voor élke kleur gaat online te koop; de rest blijft op aanvraag.

## `set-aw-prijzen.mjs` — Associated Weavers vasttapijt per m² (23/11/2026)
Zet de **RRP-kolom** (adviesverkoopprijs, € per m²) uit `Data\Associated Weavers\BENELUX - Elsie - Pricelist tool AW Rolls 2026 - 2026-01-27.pdf` op elk AW-product (alle kleuren dezelfde prijs), haalt de tag `prijs-ontbreekt` weg en zet `brunic.etalage = false`. AW-producten zonder RRP in die lijst (enkel rol-/snitprijs, runners, Kids, niet in de lijst) gaan op **DRAFT**. De koppeling productnaam → RRP staat in `Data\Associated Weavers\AW-prijzen-shopify-plan-<datum>.csv` (handmatig uit de pdf; Orion/Secret/Sensation = "… NEW" in de lijst).
```
node packages/catalog/set-aw-prijzen.mjs "<plan.csv>"                 # dry-run
node packages/catalog/set-aw-prijzen.mjs "<plan.csv>" --go            # schrijven; pushlog in ..\Data\
node packages/catalog/set-aw-prijzen.mjs --rollback "<pushlog>" --go  # prijzen, tag, etalage en status terugzetten
```
Eerste run 23/11/2026: 65 geprijsd (1.589 varianten), 64 op draft — log `Data\AW_PRIJZEN_SHOPIFY_PUSH_LOG_2026-11-23T20-30-32.json`.

**Voorstelprijzen (23/11/2026, `--tag=prijs-voorstel`):** voor de 38 kwaliteiten met enkel een rol- en/of snitprijs een eigen prijs volgens het patroon in de AW-lijst: RRP ≈ 2,18 × snitprijs (R² 0,97 op 96 kwaliteiten); zonder snitprijs eerst snit ≈ rol + € 4,57 (R² 0,94). Afgerond op € X,95 (onder € 30) of op AW's eigen prijspunten. Producten weer actief, tag `prijs-voorstel` (= geen AW-RRP; vervangen zodra AW een RRP geeft). Berekening per product: `Data\Associated Weavers\AW-voorstelprijzen-2026-11-23.csv`; log `Data\AW_PRIJZEN_SHOPIFY_PUSH_LOG_2026-11-23T21-14-42.json`. Nog op draft: 16 runners + 10 niet in de lijst (Durata, Galatea, Hydra, Livia, Numicus, Pisces, Pontus, Rubico, Liris, Tibet).

## `novilon-ophalen.mjs` + `novilon-import.mjs` — Forbo Novilon-rolvinyl (19/11/2026)
50 dessins in drie lijnen (Basic 10, Viva 20, Traffic 20) uit de dessinlijst `Forbo_Novilon_dessins.xlsx` (een tabblad per lijn, met links naar forbo.com/nl-be). Model zoals het andere rolvinyl (Tarkett): één product per dessin, titel = lijn + dessin ("Basic Light Timber"), vendor **Novilon**, `productType` Vinylvloer, optie **Breedte** (2/3/4 m; Traffic 2/4 m), SKU `NOV-<dessinnummer van die breedte>`, per m², collecties `vloerbekleding` + `vloerbekleding-vinyl`, gepubliceerd op Brunic Headless. Kenmerken (`brunic.specificaties`) uit de Forbo-pagina's: dikte, slijtlaag, rolmaten, gebruiksklassen, brandklasse, 17 dB, R10, LRV (Traffic ook NCS en 18 % gerecycleerd). Kleurfamilie en uitzicht per dessin staan in `DESSIN` in het importscript (nagekeken op de foto's). Prijs 0 bij de import = op aanvraag tot de prijs er is.
```
node packages/catalog/novilon-ophalen.mjs "<Forbo_Novilon_dessins.xlsx>"   # pagina's + foto's → ..\Data\Novilon\<Lijn Dessin>\<nr>\ + NOVILON_BRON.json
node packages/catalog/novilon-import.mjs                                   # dry-run → ..\Data\Novilon\NOVILON_IMPORT_REVIEW_<tijd>.md
node packages/catalog/novilon-import.mjs --go [--alleen <handle>]           # aanmaken (bestaande handles worden overgeslagen); pushlog in ..\Data\
node packages/catalog/novilon-import.mjs --rollback "<pushlog>" --go       # aangemaakte producten verwijderen
```
Let op: Viva Dark Grey bestaat enkel in 4 en 3 m; het 3 m-nummer is 73622 (wijkt af van Forbo's gewone reeks, waar …2 = 2 m).
