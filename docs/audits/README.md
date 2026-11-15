# Audits van de Brunic-webshop — index

Begin hier. Laatst bijgewerkt op 14/11/2026.

## Snel naar

| Ik zoek… | Ga naar |
|---|---|
| **De vragen voor Brunic** (open en beantwoord, één lijst) | [`../vragen-aan-brunic.md`](../vragen-aan-brunic.md) |
| Het recentste oordeel over de webshop | [QA 12/11, §1](2026-11-12-webshop-qa/rapport.md) |
| Wat er nog open staat uit de webshop-controles | [QA 12/11, §6 (status per punt) en §13 (prioriteiten)](2026-11-12-webshop-qa/rapport.md) |
| Wat er nog open staat voor SEO en de overstap van brunic.be | [`2026-11-14-seo-geo/issues.csv`](2026-11-14-seo-geo/issues.csv), samengevat in [`audit-summary.md`](2026-11-14-seo-geo/audit-summary.md) |
| Wat er op de dag van de livegang moet gebeuren | [`2026-11-14-seo-geo/measurement-plan.md`](2026-11-14-seo-geo/measurement-plan.md) en [`apps/prototype/README.md`](../../apps/prototype/README.md) §4 |
| Wat Brunic beslist heeft over teksten en beloftes | [`../teksten-en-beloftes.md`](../teksten-en-beloftes.md) §D |
| Wat er na een audit gewijzigd is, en door wie | [`../agent-work/`](../agent-work/) (zie de kolom "Opvolging" hieronder) |
| Bekende bugs en de lanceringschecklist | [`apps/prototype/TODO.md`](../../apps/prototype/TODO.md) |

## Alle audits, nieuwste eerst

| Datum | Soort | Ronde | Getest op | Oordeel in één zin | Bevindingen | Rapport | Opvolging |
|---|---|---|---|---|---|---|---|
| 14/11/2026 | SEO en GEO | SEO r1 | brunic.be (oude site) en brunic.vercel.app, commit `ea59bbd` | De overstap is technisch sterk (alle 2.060 oude URL's komen goed terecht), maar drie zoekwoorden van de oude site gaan over aanbod dat de nieuwe webshop niet meer heeft. Gedeeltelijke audit: geen Search Console | 11 issues (SEO-1-01 t.e.m. -11): 2 × P1, 6 × P2, 3 × P3 | [audit-summary.md](2026-11-14-seo-geo/audit-summary.md) | [seo-geo-r1.md](../agent-work/seo-geo-r1.md): 4 issues lokaal opgelost of deels opgelost, niet gedeployd |
| 12/11/2026 | Webshop-QA | R6 | productie, momentopname 03/11 | Technisch goed en beter dan op 03/11; wat de klant tegenhoudt, zit in de data | 71: 3 × P1, 13 × P2, 55 × P3 (19 nieuw; 7 van de vorige ronde opgelost) | [rapport.md](2026-11-12-webshop-qa/rapport.md) | [p1-vinyl-en-boras-tags-2026-11-12.md](../agent-work/p1-vinyl-en-boras-tags-2026-11-12.md) · [teksten-en-beloftes.md](../teksten-en-beloftes.md) |
| 03/11/2026 | Webshop-QA | R5 | productie, commit `c31c200` | Technisch goed; grote delen van de catalogus zijn niet te vinden op kleur of motief | 59: 3 × P1, 13 × P2, 43 × P3 (22 nieuw) | [rapport.md](2026-11-03-webshop-qa/rapport.md) | [r4-en-vinylkleuren-2026-11-03.md](../agent-work/r4-en-vinylkleuren-2026-11-03.md) · [scrollgedrag-2026-11-03.md](../agent-work/scrollgedrag-2026-11-03.md) |
| 02/11/2026 | Webshop-QA | R4 | productie, commit `7484cc0` | Negen van de tien nagekeken punten opgelost; nieuwe fouten op kaarten met een filter, vooral bij tapijten | zie rapport §4 | [rapport.md](2026-11-02-webshop-qa/rapport.md) | [r4-en-vinylkleuren-2026-11-03.md](../agent-work/r4-en-vinylkleuren-2026-11-03.md) |
| 31/10/2026 (21:05) | Webshop-QA | R3 | productie, commit `82ba1b0` | Het filtersysteem werkt inhoudelijk correct; problemen bij toetsenbord in de filterlade, prijsfilter tapijten en beelden | zie rapport §2 | [rapport.md](2026-10-31-webshop-qa-3/rapport.md) | [p2-audit-2026-10-31.md](../agent-work/p2-audit-2026-10-31.md) |
| 31/10/2026 (20:15) | Webshop-QA, heraudit | R2 | productie, commit `82ba1b0` | Productie draait nu het filtersysteem uit de specificatie en dat werkt betrouwbaar; de beeld- en kaartproblemen blijven | zie rapport §2 en §3 | [rapport.md](2026-10-31-webshop-qa-2/rapport.md) | opgenomen in R3 |
| 31/10/2026 (18:53) | Webshop-QA | R1 | productie (`8806232`) en lokaal (`5fa16a5`) | De filterlogica is betrouwbaar op de lokale versie; productie loopt achter op code en catalogus | zie rapport §2 | [rapport.md](2026-10-31-webshop-qa/rapport.md) | opgenomen in R3 |

De bevindingen van R1 en R2 kregen in R3 een nieuw nummer. Wie de geschiedenis van één punt zoekt, begint dus bij het recentste rapport en volgt de oude nummers terug.

### Oudere controles, buiten deze map

| Datum | Wat | Waar |
|---|---|---|
| 03/11/2026 | Scrollgedrag: audit en oplossingen | [`../agent-work/scrollgedrag-2026-11-03.md`](../agent-work/scrollgedrag-2026-11-03.md) |
| 24/10/2026 | Filtersysteem: audit en optimalisatie | [`../agent-work/filtersysteem.md`](../agent-work/filtersysteem.md), specificatie in [`../filtersysteem.md`](../filtersysteem.md) |
| 20/10/2026 | SEO-, AI-search- en conversie-audit, met verbeteringen | [`../agent-work/seo-groei.md`](../agent-work/seo-groei.md) |
| 20/10/2026 | Audit vóór "productieklaar": het werk dat eruit volgde | [`../agent-work/productieklaar.md`](../agent-work/productieklaar.md). Schermafbeeldingen van 21/10 staan buiten de repo, in de map `audit-2026-10-21` naast de repo-map |
| 30/09/2026 | Code-audit van het prototype (B-nummers) | [`apps/prototype/TODO.md`](../../apps/prototype/TODO.md) |

## Wat staat waar in een rapport

**Webshop-QA** (`<datum>-webshop-qa/rapport.md`, opdracht: `.agents/skills/webshop-qa-audit/SKILL.md`)

| Hoofdstuk (R6) | Inhoud |
|---|---|
| §1 Oordeel | Samenvatting, de zwaarste punten, de stand tegenover de vorige ronde |
| §2 Bevindingen | De tabel met alle punten: prioriteit, bewijs, voorstel |
| §3 Fotoproblemen per product | Per product wat er met de foto's scheelt |
| §4 Wat er niet staat | Tellingen op de hele catalogus: vindbaarheid, beloftes, prijzen, taal |
| §5 Regels van de opdrachtgever | Per regel de meting en het oordeel |
| §6 Status per eerdere bevinding | Elk punt van de vorige ronde: opgelost, open of bekend |
| §7 Vragen aan Brunic | Enkel de nieuwe vragen; de volledige lijst staat in `../vragen-aan-brunic.md` |
| §8 Zelf na te kijken | Stappen voor een echte iPhone en Android |
| §10 Telling | Aantal bevindingen per soort en prioriteit |
| §11 en §12 | Wat getest is, en wat niet |
| §13 Prioriteitenlijst | Wat eerst hersteld moet worden |

De oudere rapporten hebben minder hoofdstukken; de nummering verschilt per ronde. Schermafbeeldingen staan in `screenshots/` in elke map. Die map zit niet in git: ze bestaat enkel op de pc waar de audit liep.

**SEO en GEO** (`<datum>-seo-geo/`, opdracht: `.agents/skills/seo-geo-audit/SKILL.md`)

| Bestand | Inhoud |
|---|---|
| `audit-summary.md` | Het rapport: oordeel, top-acties, wat er na de audit uitgevoerd is |
| `issues.csv` | Alle punten met status, bewijs, actie en acceptatiecheck |
| `keyword-opportunities.csv` | De zoekwoordclusters, met bewijslabel |
| `content-briefs.md` | Tekstopdrachten per pagina, met de stand |
| `measurement-plan.md` | Wat te meten vóór, op en na de livegang |
| `url-inventory.csv` | Elke oude URL van brunic.be met haar bestemming |
| `source-register.csv` | Welke bronnen er waren en welke ontbraken |
| `geo-panel.csv` | De 20 vragen voor AI-assistenten (nog niet gemeten) |

## Nummering

| Nummer | Betekenis | Voorbeeld |
|---|---|---|
| `R<ronde>-<nr>` | Bevinding uit een webshop-QA-ronde. R1 = 31/10 (18:53) … R6 = 12/11 | R6-34 |
| `SEO-<ronde>-<nr>` | Punt uit een SEO/GEO-ronde | SEO-1-06 |
| `B<nr>` | Bevinding uit de code-audit van 30/09, in `TODO.md` | B17 |
| Vraag `<nr>` | Vraag aan Brunic in `../vragen-aan-brunic.md`. In het rapport van 12/11 heetten 13 tot 17 nog A tot E; in dat van 14/11 heetten 18 tot 23 nog V1 tot V6 | vraag 11 |

## Afspraken voor een nieuwe audit

1. Een nieuwe map `<JJJJ-MM-DD>-webshop-qa/` of `<JJJJ-MM-DD>-seo-geo/`. Bestaat de map van vandaag al: `-2`, `-3`. Een ouder rapport wordt nooit overschreven.
2. De ronde van een webshop-QA telt enkel de mappen `*-webshop-qa*` (zes op 14/11/2026, de volgende is R7). Een SEO-ronde telt enkel de mappen `*-seo-geo*`.
3. Nieuwe vragen voor Brunic komen in `../vragen-aan-brunic.md`, met het volgende nummer. Het rapport verwijst ernaar.
4. Voeg de audit toe aan de tabel hierboven: datum, oordeel in één zin, telling, link.
5. Werk dat uit een audit volgt, krijgt een overdracht in `../agent-work/` en een link in de kolom "Opvolging".
