# Contentbriefs — r1 (14/11/2026)

Drie briefs voor bestaande URL's. Er komen geen nieuwe pagina's voor synoniemen. Elke brief volgt de regels van de opdrachtgever (`.agents/skills/webshop-qa-audit/SKILL.md` §0): plaatsing "door vakmannen", gratis opmeting aan huis, geen levertermijn per product, geen fabrikantbelofte. Wat Brunic nog moet bevestigen, staat gemarkeerd met **[bevestigen]**.

Voer een brief pas uit nadat de Belgische zoekresultaten en, zodra beschikbaar, de GSC-queries (measurement-plan M2) de hypothese ondersteunen.

**Stand op 14/11/2026 (lokaal, niet gedeployd; zie `docs/agent-work/seo-geo-r1.md`):**
- Brief 1: titel en koopvragen uitgevoerd in de code. Niet uitgevoerd: de intro (Shopify) en de keuzehulp per ruimte als eigen blok; de koopvraag "Welk vasttapijt kies ik voor een trap, een gang of een slaapkamer?" dekt dat deels.
- Brief 2: uitgevoerd voor de vier bevestigde types, met ankers en redirects. Open: de punten met **[bevestigen]**.
- Brief 3: titels en rolverdeling uitgevoerd. Open: "afboorden" (vraag 20).

---

## Brief 1 — Vasttapijt (cluster: tapis plein / vast tapijt / kamerbreed tapijt)

- **Doel-URL:** `/catalogus/vloerbekleding/vasttapijt` (categorie, bestaat). Tekst in Shopify-metaobject `categorie_inhoud`.
- **Zoekintentie:** commercieel onderzoek en aankoop van vasttapijt, met plaatsing. In Vlaanderen zeggen veel mensen "tapis plein" (HYPOTHESE; te toetsen in de Belgische SERP).
- **Primaire cluster:** vasttapijt. **Ondersteunend:** tapis plein, kamerbreed tapijt, vasttapijt slaapkamer, vasttapijt trap.
- **Ondersteunende vragen:** Welke kwaliteit voor slaapkamer, living of trap? Wol of synthetisch? Hoe breed is een rol en hoeveel heb ik nodig? Wie legt het?
- **Behouden:** de bestaande intro (merken AW, Desso, Lano, Balsan, Tarkett; velours tot lussen; wol, synthetisch, sisal); de filters; de link naar de dienst vasttapijt-en-vloeren.
- **Ontbreekt:** de term "tapis plein" (0×); uitleg over rolbreedte (1×) en hoe de prijs per m² werkt; een korte keuzehulp per ruimte.
- **Benodigde productbronnen:** rolbreedtes per kwaliteit (Shopify-specificaties); geschiktheid per ruimte enkel waar de fabrikant die opgeeft.
- **Titelvoorstel:** `Vasttapijt (tapis plein) · gratis opmeting · Brunic Ninove` (≤ 60 tekens). **H1:** blijft "Vasttapijt".
- **Opbouw:** intro (2–3 zinnen, met "tapis plein" één keer natuurlijk) → producten → "Welk vasttapijt voor welke ruimte?" (3 korte alinea's) → "Opmeting en plaatsing" (gratis opmeting aan huis; vakmannen leggen het tapijt) → 3 FAQ's (bestaande Accordion, voorstel uit seo-groei.md).
- **Interne links:** `/op-maat-en-plaatsing/vasttapijt-en-vloeren`, `/op-maat-en-plaatsing/opmeting-aan-huis`, 2 artikels uit `/inspiratie-en-advies` als die over vloeren gaan.
- **Conversie:** "Vraag een gratis opmeting aan".
- **Acceptatie:** titel ≤ 60 tekens; "tapis plein" 1–2× in zichtbare tekst; geen VERBODEN-formulering (`set-beloftes-inhoud.mjs --controle`); BreadcrumbList blijft geldig.

## Brief 2 — Raamdecoratie op maat (cluster: lichtdoorlatend rolgordijn / witte rolgordijnen)

- **Doel-URL:** `/op-maat-en-plaatsing/raamdecoratie-op-maat` (dienst, bestaat). Hier landen 26 oude URL's.
- **Zoekintentie:** gemengd. Kant-en-klaar kopen kan niet meer (bewuste keuze, **[bevestigen]** vraag 19). De advies- en maatwerkvraag kan de pagina wel bedienen.
- **Primaire cluster:** rolgordijnen op maat. **Ondersteunend:** lichtdoorlatend vs. verduisterend rolgordijn, duo-rolgordijn, plissé, jaloezieën, vouwgordijn.
- **Ondersteunende vragen:** Wat is het verschil tussen lichtdoorlatend, verduisterend en duo? Welke kleur geeft overdag privacy (wit, ecru, grijs)? Hoe verloopt de opmeting? Hoe komt de prijs tot stand?
- **Behouden:** "Zo verloopt het", "Welke producten?", de bestaande uitleg dat raamdecoratie niet in de webshop staat.
- **Ontbreekt:** per type een korte sectie met een anker (`#rolgordijnen`, `#duo-rolgordijnen`, `#plisse`, `#jaloezieen`, `#vouwgordijnen`). Uitleg over lichtdoorlatend vs. verduisterend (nu 1×). Kleuren en stalen in de winkel ("wit" 0×).
- **Benodigde bronnen:** welke types en merken Brunic echt levert **[bevestigen]** (vraag 19). De plaatsing door vakmannen is al bevestigd: `maatwerk.ts` rekent raamdecoratie bij "stoffen" (opmeting en plaatsing door vakmannen). *(Gecorrigeerd op 14/11: een eerdere versie noemde dit onbevestigd.)*
- **Titelvoorstel:** `Rolgordijnen, plissés & jaloezieën op maat · Brunic Ninove`.
- **Opbouw:** intro → "Lichtdoorlatend, verduisterend of duo?" (kleine vergelijkingstabel: licht, privacy, gebruik) → secties per type met anker → "Kleuren en stalen" → "Zo verloopt het" (bestaand) → offerte-CTA.
- **Interne links:** `/catalogus/gordijnen-en-stoffen/isolerend-verduisterend` (als alternatief met stof), `/op-maat-en-plaatsing/gordijnen-op-maat`, `/op-maat-en-plaatsing/opmeting-aan-huis`.
- **Redirects (code, na de brief):** de oude typepagina's (`/rolgordijnen`, `/plisse-gordijnen` …) naar het passende anker in `next.config.ts`. Een anker zit niet in een redirect die Google indexeert, maar het helpt de bezoeker.
- **Acceptatie:** de vier vragen beantwoord; geen prijs, termijn of merk dat niet bevestigd is; geen "eigen mensen".

## Brief 3 — Tapijt op maat (dienst en collectie)

- **Doel-URL's:** dienst `/op-maat-en-plaatsing/tapijt-op-maat` (hoe het werkt, offerte) en collectie `/catalogus/tapijten/op-maat` (welke kwaliteiten). Ze bestaan allebei en linken naar elkaar.
- **Zoekintentie:** "tapijt op maat" betekent meestal een vloerkleed in een eigen maat (HYPOTHESE, sluit aan bij de huidige diensttekst). Een deel zoekt vasttapijt op maat: verwijs dan naar brief 1.
- **Rolverdeling (voorstel):** de dienst richt zich op "tapijt op maat laten maken" (stappen, maat en vorm, afwerking, offerte, niet terug te nemen). De collectie richt zich op "tapijten op maat" als productaanbod (kwaliteiten van Desso, Tarkett e.a.). Titels en intro's mogen niet dezelfde zin openen.
- **Ontbreekt:** het woord "afboorden" en wat het betekent. De oude site beloofde "Al ons tapijt kan op maat afgeboord worden". **[bevestigen]** vraag 20: biedt Brunic dit nog aan, voor welke kwaliteiten en vormen?
- **Ondersteunende vragen:** Welke maten en vormen zijn mogelijk? Welke afwerking (afboorden, omvouwen)? Hoe meet ik zelf op? Waarom geen retour?
- **Titelvoorstel dienst:** `Tapijt op maat laten maken en afboorden · Brunic Ninove` (enkel als vraag 20 = ja). **Collectie:** `Tapijten op maat: kwaliteiten · Brunic Ninove`.
- **Interne links:** collectie ↔ dienst (bestaat), vasttapijt (brief 1), `/catalogus/tapijten` voor standaardmaten.
- **Conversie:** offerte aanvragen met maat en vorm.
- **Acceptatie:** na 8 weken in GSC (M2 als basis) per query één dominante URL, of een verschil dat te verklaren is.
