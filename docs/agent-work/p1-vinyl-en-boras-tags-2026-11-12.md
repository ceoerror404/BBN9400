# P1 uit de audit van 12/11: vinylkleuren en tags voor Boråstapeter

Overdracht van 12/11/2026 (Alexander met Claude). Het auditrapport staat in `docs/audits/2026-11-12-webshop-qa/rapport.md`. Het gaat om R6-01 (vinyl zonder filter Kleur), R6-02 (Boråstapeter niet te vinden met de filters) en R6-30 (Senso-prijzen).

## Huidige toestand

| Punt | Stand |
|---|---|
| R6-01 vinyl | **Nog niet in Shopify.** De proefrun klopt (1.924 nieuwe velden, 0 anders, 0 problemen). De schrijfstap met `--go` werd in de Claude-sessie tegengehouden door de permissie-instellingen. Alexander draait hem zelf. |
| R6-02 Boråstapeter | Voorstellen voor alle 506 producten en 1.147 kleuren staan op een reviewpagina. **Wacht op het nakijken door Alexander.** Er is niets naar Shopify geschreven. |
| R6-30 Senso | Ongewijzigd. Wacht op het antwoord van Brunic (vraag 1 in `docs/vragen-aan-brunic.md`). Of de twee producten intussen op aanvraag gaan, is niet beslist. |

## Vinyl: wat nog moet

Vanuit de repo-root:

```
node packages/catalog/set-tapijt-tags.mjs ../Data/BRUNIC_VINYL_TAGS_2026-11-02.json --type Vinylvloer --go
```

Daarna pushen naar `master`: de build haalt de catalogus opnieuw op, en dan heeft vinyl de filter Kleur.

## Boråstapeter: wat er gemaakt is

- **Reviewpagina:** https://claude.ai/artifact/GH1Y4bF6TLJciim3J7X17x (privé, zelfde werking als de reviewpagina van vinyl). De beoordelingen komen in de collectie `beoordelingen` van die pagina.
- **Voorstellen, buiten de repo:** `../Data/BORAS_TAGREVIEW_2026-11-12/voorstellen/<handle>.json` (506 bestanden), met de rubriek die de taggers volgden in `rubriek.md`.
- **Bron:** de lokale momentopname van 02/11 (`apps/prototype/.data/shopify-catalogus.json`). Per kleur is de variantfoto bekeken op contactbladen.
- **Per kleur:** een hoofdkleur en 0 tot 2 accentkleuren. **Per product:** 1 of 2 motieven en 1 of 2 stijlen.
- **Twijfel:** 46 producten dragen het label Twijfel (zekerheid laag bij het product of bij een kleur). Bij 198 producten en 567 kleuren stond de zekerheid op middel: die hebben geen label, maar de opmerking van de tagger staat op de kaart.

### Keuzes die de nakijker moet kennen

- **Kleur, 15 families in plaats van 20.** De voorstellen gebruiken enkel de kleurfamilies die behang al heeft (Wit, Beige, Grijs, Zwart, Bruin, Blauw, Turquoise, Groen, Geel, Oranje, Rood, Roze, Paars, Goud/metallic, Multicolor). Ecru, Naturel, Taupe en Antraciet zijn niet voorgesteld: anders staat een crème behang van Boråstapeter onder een kleur waar geen enkel ander behang onder staat. De reviewpagina biedt wel alle 20 aan.
- **Motief en stijl volgen de behangfilter.** De waarden zijn die van ESTAhome en Origin (uit de leveranciersspecificaties), zodat Boråstapeter onder dezelfde filterwaarden valt. Nieuw in de keuzelijst van Shopify bij het wegschrijven: 14 motieven (o.a. Linnen, Barok, Toile de Jouy, Bos, Landschap) en 7 stijlen (Romantisch, Botanisch, Basics, Art deco, Tropisch, Japans, Maritiem).
- **34 kleuren hadden al een kleurfamilie** (uit de kleurnaam, bv. "Groen 5801"). Die blijft het voorstel. Bij 11 ervan oogt de foto anders: dat staat in de toelichting op de kaart.
- **Zonder motief (3):** Space Adventure, Up In The Sky en Light Books. Geen enkele waarde paste.
- **Ruimte en Materiaal** zijn niet getagd: die zijn niet van een foto af te lezen.

### Aangepast in de code

`packages/catalog/set-tapijt-tags.mjs`:

- `--merk <vendor>` beperkt de vergelijking tot één merk.
- De lijsten voor motief en stijl bevatten nu ook de behangwaarden.
- Waarden uit de export die de keuzelijst in Shopify nog niet kent, komen er bij `--go` eerst bij (`metafieldDefinitionUpdate`). De proefrun meldt welke.

## Verificatie

- Proefrun vinyl met het aangepaste script: zelfde uitkomst als vóór de aanpassing (1.924 nieuw, 0 anders).
- Proefrun Boråstapeter met een voorlopige export van alle voorstellen: 3.382 velden te schrijven (kleurfamilie 1.619, motief 503, stijl 506, accentkleuren 754), 34 ongewijzigd, 0 anders. De merkfilter vindt 511 producten.
- Samenvoegen van de tags: 0 ontbrekende tegels, 0 waarden buiten de lijsten.
- Twee contactbladen (01 en 16) zelf naast de voorstellen gelegd: in orde.
- Reviewpagina: het script is op syntax gecontroleerd en de collectie `beoordelingen` is leesbaar en leeg.

**Niet getest:**

- De reviewpagina is niet in een browser bekeken na de publicatie.
- Het uitbreiden van de keuzelijsten kan een proefrun niet uitvoeren. De vorm van de mutatie is nagekeken in de documentatie van Shopify, niet tegen de winkel.
- De 38 andere contactbladen zijn niet zelf nagekeken: dat is het werk van de review.

## Open punten

- **5 producten staan in Shopify maar niet in de momentopname**, dus ze hebben geen voorstel: Cornelia, Strawberry Field, Malibu, Ink Forest en My Feldt Trädgårdskrasse. Vermoedelijk niet gepubliceerd op het Headless-kanaal: nakijken.
- **"Rose Magnifique (kopie)"** (R6-29) heeft een voorstel gekregen, maar hoort offline.
- **Fotolabels vinyl** (R6-04) wachten nog op de klaarmelding van Alexander.
- **Senso** (R6-30): zie hierboven.

## Volgende actie

1. Alexander: het vinylcommando draaien en pushen.
2. Alexander: de reviewpagina nakijken, te beginnen bij Twijfel.
3. Daarna, in een nieuwe sessie:
   - de beoordelingen ophalen uit de reviewpagina naar `../Data/BORAS_TAGREVIEW_2026-11-12/beoordelingen/` (ArtifactData `list` met `out_dir`);
   - `node packages/catalog/export-tagreview.mjs ../Data/BORAS_TAGREVIEW_2026-11-12 ../Data/BRUNIC_BORAS_TAGS_<datum>.json`
   - proefrun: `node packages/catalog/set-tapijt-tags.mjs ../Data/BRUNIC_BORAS_TAGS_<datum>.json --type "Behang,Fotobehang op maat" --merk "Boråstapeter"`
   - zelfde commando met `--go`, daarna pushen voor een nieuwe build.
