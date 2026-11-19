# Problemen voor later

> **Intern.** Problemen die we kennen maar bewust nog niet oplossen: ze blokkeren de livegang niet, of ze wachten op een beslissing. Hoort het bij Brunic om te beslissen, dan staat het in `docs/vragen-aan-brunic.md`. Is het een taak voor het team (code, Shopify, Vercel), dan staat het in `docs/todo.md`. Nummers veranderen nooit, zodat andere documenten ernaar kunnen verwijzen ("probleem 1").
> - **Opgelost?** Zet de status in het overzicht op "Opgelost" met de datum, en schrijf onder het probleem wat er gebeurd is en waar.

Stand van 18/11/2026.

## Overzicht

**1 probleem: 1 open.**

| Nr. | Onderwerp | Status | Wanneer | Uit |
|---:|---|---|---|---|
| [1](#p1) | Levertermijnen van leveranciers in de beschrijving in Shopify | **Open** | Vóór een koppeling met een ander verkoopkanaal | Controle leverbelofte 18/11 |

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
