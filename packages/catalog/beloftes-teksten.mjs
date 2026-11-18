// beloftes-teksten.mjs — de beloftes van Brunic, zoals Alexander ze op 13/11/2026 vastlegde
// (docs/teksten-en-beloftes.md, deel B). Eén tabel voor de code (apps/prototype/src) én voor de
// Shopify-metaobjects, zodat beide hetzelfde zeggen. Gebruikt door set-beloftes-inhoud.mjs.
//
// Woordkeuze (vast, ook voor nieuwe teksten):
// - Plaatsing:  "door vakmannen" (derden). Nooit "onze eigen mensen", "ons team", "eigen plaatsers",
//               "wat wij verkopen, plaatsen we zelf".
// - Atelier:    gordijnen worden "op maat gebracht" in ons eigen atelier. Nooit "gemaakt in ons
//               atelier", "maken we", "eigen stiksters".
// - Onderscheid: "service, kwaliteit en ons eigen atelier".
// - Opmeting:   "gratis opmeting aan huis" blijft, ook voor behang.
// - Reactie:    "nog dezelfde dag". Nooit "binnen 1 à 2 werkdagen".
// - Jaartal:    "sinds 1982". Nooit "al 40 jaar" of "sinds 1992" (behalve "Sinds 1992 is Brunic een nv").
// - Afdelingen: geen verf en geen slaapcomfort.
// - Offerte:    de prijs, de mogelijkheden voor plaatsing en waar nodig de termijn.
// - Levering:   online bestellingen binnen de week, met meteen een bevestiging van de leverdatum.

/** [oud, nieuw]: exacte tekst. Langste en meest specifieke eerst. */
export const VERVANGINGEN = [
  // ── Reactietermijn (B3) ──────────────────────────────────────────────
  ["Stuur ons een bericht; we antwoorden doorgaans binnen 1 à 2 werkdagen.", "Stuur ons een bericht; we antwoorden nog dezelfde dag."],
  ["We antwoorden doorgaans binnen 1 à 2 werkdagen.", "We antwoorden nog dezelfde dag."],
  ["binnen 1 à 2 werkdagen contact met u op", "nog dezelfde dag contact met u op"],

  // ── Jaartal (B6) en afdelingen (B7) ──────────────────────────────────
  ["Brunic is een familiebedrijf dat al 40 jaar in Ninove klaarstaat voor wie zijn interieur wil verfraaien. Van gordijnen op maat uit ons eigen atelier tot behang, tapijt en vasttapijt: wij adviseren, meten op, maken en plaatsen.",
   "Brunic is een familiebedrijf dat sinds 1982 in Ninove klaarstaat voor wie zijn interieur wil verfraaien. Van gordijnen op maat uit ons eigen atelier tot behang, tapijt en vasttapijt: wij adviseren, meten op en zorgen dat alles vakkundig geplaatst wordt."],
  ["Brunic is al 40 jaar een vertrouwd adres in Ninove en de Denderstreek. Als familiebedrijf helpen wij u met alles wat een woning warm en persoonlijk maakt: gordijnen en stoffen, raamdecoratie, behang, vasttapijt, tapijten, verf en slaapcomfort.",
   "Brunic is sinds 1982 een vertrouwd adres in Ninove en de Denderstreek. Als familiebedrijf helpen wij u met alles wat een woning warm en persoonlijk maakt: gordijnen en stoffen, raamdecoratie, behang, vasttapijt en tapijten."],
  ["Als familiebedrijf dat al 40 jaar in Ninove gevestigd is", "Als familiebedrijf dat sinds 1982 in Ninove gevestigd is"],
  ["Brunic is een familiebedrijf uit Ninove en al 40 jaar uw adres voor interieurdecoratie.", "Brunic is een familiebedrijf uit Ninove en sinds 1982 uw adres voor interieurdecoratie."],
  ["Al 40 jaar uw partner voor interieurdecoratie", "Sinds 1982 uw partner voor interieurdecoratie"],
  ["Familiebedrijf, al 40 jaar in Ninove", "Familiebedrijf sinds 1982 in Ninove"],
  ["Al 40 jaar in Ninove", "Sinds 1982 in Ninove"],
  ["Familiebedrijf sinds 1992", "Familiebedrijf sinds 1982"],
  ["In onze winkel in Ninove ziet u gordijnstoffen, behang, tapijten en verf naast elkaar", "In onze winkel in Ninove ziet u gordijnstoffen, behang en tapijten naast elkaar"],
  ["kunt u gordijnstoffen, behang, tapijten en verf samen bekijken", "kunt u gordijnstoffen, behang en tapijten samen bekijken"],
  ["fotobehang op maat, tapijten op maat, verf die in een door u gekozen kleur aangemaakt wordt, en stof", "fotobehang op maat, tapijten op maat, en stof"],

  // ── Atelier: op maat gebracht, niet gemaakt (B4) ─────────────────────
  ["Wat ons onderscheidt, is ons eigen atelier. Gordijnen op maat worden bij ons gemaakt door onze eigen stiksters, op de maten die wij bij u thuis opmeten. Dat geeft korte lijnen tussen winkel, atelier en plaatsing,",
   "Wat ons onderscheidt, zijn service, kwaliteit en ons eigen atelier. Daar brengen we gordijnen op maat, op de maten die wij bij u thuis opmeten. Dat geeft korte lijnen tussen winkel en atelier,"],
  ["Wat Brunic onderscheidt, is ons eigen atelier. Uw gordijnen worden gemaakt door onze eigen stiksters, op de maten die wij bij u thuis hebben opgemeten. Dat geeft korte lijnen: wie opmeet, weet wat er in het atelier gebeurt, en wie plaatst, weet hoe het gordijn gemaakt is.",
   "Wat Brunic onderscheidt, zijn service, kwaliteit en ons eigen atelier. In dat atelier brengen we uw gordijnen op maat, op de maten die wij bij u thuis hebben opgemeten. Dat geeft korte lijnen: wie opmeet, weet wat er in het atelier gebeurt."],
  ["Zo krijgt u gordijnen die echt voor uw woning gemaakt zijn.", "Zo krijgt u gordijnen die echt bij uw woning passen."],
  ["Wij adviseren u in de winkel of bij u thuis, meten gratis op en laten uw gordijnen maken door onze eigen stiksters in ons eigen atelier. Nadien hangen onze eigen mensen ze bij u op.",
   "Wij adviseren u in de winkel of bij u thuis, meten gratis op en brengen uw gordijnen op maat in ons eigen atelier. Nadien hangen vakmannen ze bij u op."],
  ["Onze eigen stiksters werken uw gordijnen af in ons atelier, op de exacte maten van uw ramen.", "In ons eigen atelier brengen we uw gordijnen op maat, op de exacte maten van uw ramen."],
  ["Onze eigen stiksters maken uw gordijnen in ons atelier; raamdecoratie en vasttapijt voorzien we op uw exacte maten.", "In ons eigen atelier brengen we uw gordijnen op maat; raamdecoratie en vasttapijt voorzien we op uw exacte maten."],
  ["Onze stiksters maken de gordijnen in ons atelier en onze eigen mensen plaatsen alles volgens de afgesproken planning.", "In ons eigen atelier brengen we de gordijnen op maat, en vakmannen plaatsen alles volgens de afgesproken planning."],
  ["Onze eigen stiksters maken de gordijnen in ons atelier en onze eigen mensen zorgen voor de plaatsing.", "De gordijnen brengen we op maat in ons eigen atelier, en vakmannen zorgen voor de plaatsing."],
  ["Wij combineren het advies van een interieurzaak met een eigen atelier en eigen plaatsers, zodat u één partner hebt voor stoffen, gordijnen en vloerbekleding.",
   "Wij combineren het advies van een interieurzaak met een eigen atelier en vakmannen voor de plaatsing, zodat u één aanspreekpunt hebt voor stoffen, gordijnen en vloerbekleding."],
  ["Na uw akkoord gaat de bestelling naar ons eigen atelier. Onze stiksters snijden de stof op maat, werken de zomen af en brengen de plooien aan, precies zoals afgesproken.",
   "Na uw akkoord gaat de bestelling naar ons eigen atelier. Daar brengen we uw gordijnen op maat: de lengte, de zomen en de plooien, precies zoals afgesproken."],
  ["Wie opmeet, weet wat het atelier nodig heeft, en wie plaatst, weet hoe de gordijnen gemaakt zijn.", "Wie opmeet, weet wat het atelier nodig heeft."],
  ["Hoe worden gordijnen op maat bij Brunic gemaakt?", "Hoe brengt Brunic gordijnen op maat?"],
  ["Gordijnen op maat maken we in ons eigen atelier, door onze eigen stiksters. Wij komen gratis opmeten bij u thuis, adviseren over stof, plooi en afwerking, en plaatsen alles met onze eigen mensen",
   "Gordijnen brengen we op maat in ons eigen atelier. Wij komen gratis opmeten bij u thuis, adviseren over stof, plooi en afwerking, en laten alles plaatsen door vakmannen"],
  ["Van advies in de winkel tot opmeting, maakwerk en plaatsing bij u thuis. Gordijnen maken we in ons eigen atelier, door onze eigen stiksters; opmeten en plaatsen doen onze eigen mensen.",
   "Van advies in de winkel tot opmeting en plaatsing bij u thuis. Gordijnen brengen we op maat in ons eigen atelier; wij meten op en vakmannen plaatsen."],
  ["Gordijnstoffen en maakwerk uit ons eigen atelier", "Gordijnstoffen, op maat gebracht in ons eigen atelier"],
  ["maken onze eigen stiksters uw gordijnen in ons atelier en hangen onze eigen mensen ze bij u op", "brengen we uw gordijnen op maat in ons eigen atelier en hangen vakmannen ze bij u op"],
  ["Van ADO, Artelux en Loft79 — gemaakt in ons atelier", "Stoffen van ADO, Artelux en Loft79, op maat gebracht in ons atelier"],
  ["Gordijnen op maat, door eigen stiksters", "Gordijnen op maat gebracht in ons atelier"],
  ["Wij meten gratis op bij u thuis, maken uw gordijnen in ons eigen atelier en plaatsen alles met onze eigen mensen.", "Wij meten gratis op bij u thuis, brengen uw gordijnen op maat in ons eigen atelier en laten alles plaatsen door vakmannen."],
  ["Gemaakt in ons atelier, geplaatst door ons team.", "Op maat gebracht in ons atelier, geplaatst door vakmannen."],
  ["Wij meten op, maken in ons atelier en plaatsen met onze eigen mensen.", "Wij meten op, brengen op maat in ons atelier en laten plaatsen door vakmannen."],
  ["Veel producten maken of plaatsen we op maat", "Veel producten krijgt u op maat, met plaatsing als u dat wenst"],
  ["Maakwerk in ons atelier", "Op maat in ons atelier"],
  ["Hoe lang duurt het maken van gordijnen op maat?", "Hoe lang duurt het voor uw gordijnen op maat klaar zijn?"],

  // ── Plaatsing door vakmannen (B1, B5) ────────────────────────────────
  ["Wat wij verkopen, plaatsen we ook zelf. Gordijnen, raamdecoratie en vasttapijt worden bij u thuis geleverd en geplaatst door onze eigen mensen.",
   "Gordijnen, raamdecoratie en vasttapijt worden bij u thuis geleverd en geplaatst door vakmannen. Wij plannen alles met u en blijven uw aanspreekpunt."],
  ["Daarom gebeuren de levering en de plaatsing bij Brunic door onze eigen mensen. Zij kennen onze producten, weten hoe de stukken in het atelier gemaakt zijn en werken met de maten die we bij de opmeting genomen hebben. Dat geeft u één aanspreekpunt, van het eerste advies tot de laatste afwerking.",
   "Daarom laat Brunic de levering en de plaatsing over aan vakmannen. Zij werken met de maten die we bij de opmeting genomen hebben. Voor u blijft Brunic het aanspreekpunt, van het eerste advies tot de laatste afwerking."],
  ["Waar nodig bevestigen onze mensen de rails of roeden", "Waar nodig bevestigen de plaatsers de rails of roeden"],
  ["Na het maakwerk komen onze eigen mensen de gordijnen bij u ophangen.", "Zijn uw gordijnen klaar, dan komen vakmannen ze bij u ophangen."],
  ["Na de bestelling plaatsen onze eigen mensen de raamdecoratie bij u thuis.", "Na de bestelling plaatsen vakmannen de raamdecoratie bij u thuis."],
  ["Onze eigen mensen brengen de gordijnen bij u thuis en hangen ze op, zodat ze meteen mooi vallen.", "Vakmannen brengen de gordijnen bij u thuis en hangen ze op, zodat ze meteen mooi vallen."],
  ["Onze eigen mensen brengen de gordijnen bij u thuis, hangen ze op en verdelen de plooien", "Vakmannen brengen de gordijnen bij u thuis, hangen ze op en verdelen de plooien"],
  ["Onze eigen mensen plaatsen alles netjes en tonen u hoe de bediening werkt.", "Vakmannen plaatsen alles netjes en tonen u hoe de bediening werkt."],
  ["Onze eigen mensen hangen gordijnen en raamdecoratie op en leggen het vasttapijt, netjes afgewerkt.", "Vakmannen hangen gordijnen en raamdecoratie op en leggen het vasttapijt, netjes afgewerkt."],
  ["Onze eigen mensen leveren en plaatsen alles vakkundig, met oog voor detail en respect voor uw woning.", "Vakmannen leveren en plaatsen alles, met oog voor detail en respect voor uw woning."],
  ["Onze eigen mensen leggen het tapijt strak en werken randen, naden en overgangen netjes af.", "Vakmannen leggen het tapijt strak en werken randen, naden en overgangen netjes af."],
  ["Het leggen zelf gebeurt door onze eigen mensen.", "Het leggen zelf gebeurt door vakmannen."],
  ["Uw tapijt wordt op maat gemaakt en door onze eigen mensen bij u thuis geleverd.", "Uw tapijt wordt op maat gemaakt en bij u thuis geleverd."],
  ["Wanneer uw tapijt klaar is, leveren onze eigen mensen het bij u thuis af.", "Wanneer uw tapijt klaar is, leveren we het bij u thuis af."],
  ["Wij meten gratis op en onze eigen mensen leggen het tapijt bij u thuis.", "Wij meten gratis op en vakmannen leggen het tapijt bij u thuis."],
  ["dan meten wij gratis bij u thuis op en leggen onze eigen mensen het tapijt.", "dan meten wij gratis bij u thuis op en leggen vakmannen het tapijt."],
  ["daarna meten wij gratis bij u thuis op en leggen onze eigen mensen het tapijt.", "daarna meten wij gratis bij u thuis op en leggen vakmannen het tapijt."],
  ["Wij meten gratis bij u thuis op en onze eigen mensen leggen het tapijt.", "Wij meten gratis bij u thuis op en vakmannen leggen het tapijt."],
  ["wij meten gratis op bij u thuis en onze eigen mensen leggen het tapijt.", "wij meten gratis op bij u thuis en vakmannen leggen het tapijt."],
  ["en onze eigen mensen plaatsen alles vakkundig.", "en vakmannen plaatsen alles vakkundig."],
  ["het maakwerk gebeurt in ons eigen atelier en onze eigen mensen zorgen voor de levering en de plaatsing.", "gordijnen brengen we op maat in ons eigen atelier en vakmannen zorgen voor de levering en de plaatsing."],
  ["Ja. Gordijnen, raamdecoratie en vasttapijt worden bij u thuis geleverd en geplaatst door onze eigen mensen.", "Ja. Gordijnen, raamdecoratie en vasttapijt worden bij u thuis geleverd en geplaatst door vakmannen."],
  ["Plaatst Brunic ook zelf?", "Zorgt Brunic ook voor de plaatsing?"],
  ["U bekijkt en kiest ze in onze winkel of bij u thuis; wij meten op en plaatsen.", "U bekijkt en kiest ze in onze winkel of bij u thuis; wij meten op en laten ze plaatsen door vakmannen."],
  ["U bekijkt en kiest ze in onze winkel of bij u thuis, waarna wij opmeten en plaatsen.", "U bekijkt en kiest ze in onze winkel of bij u thuis, waarna wij opmeten en vakmannen ze plaatsen."],
  ["Plaatsing door onze eigen mensen", "Plaatsing door vakmannen"],
  ["Gelegd door onze eigen mensen", "Gelegd door vakmannen"],
  ["Gelegd door ons team", "Gelegd door vakmannen"],
  ["Door onze eigen mensen, bij u thuis.", "Vakkundig gelegd, bij u thuis."],
  ["Wij meten op, adviseren en plaatsen met onze eigen mensen", "Wij meten op, adviseren en laten plaatsen door vakmannen"],
  ["Gratis opmeting en plaatsing door onze eigen mensen.", "Gratis opmeting en plaatsing door vakmannen."],
  ["Brunic adviseert, meet gratis op en plaatst met eigen mensen.", "Brunic adviseert, meet gratis op en laat plaatsen door vakmannen."],
  ["; plaatsen doen onze eigen mensen.", "; de plaatsing gebeurt door vakmannen."],
  ["en bezorgen u een duidelijke prijs, met maakwerk en plaatsing als u dat wenst.", "en bezorgen u een duidelijke offerte: de prijs, de mogelijkheden voor plaatsing en waar nodig de termijn."],

  // ── Opmeting, ook voor behang (B2) ───────────────────────────────────
  ["Wij komen gratis bij u thuis opmeten en bekijken ter plaatse wat uw ramen of vloeren nodig hebben.", "Wij komen gratis bij u thuis opmeten en bekijken ter plaatse wat uw ramen, wanden of vloeren nodig hebben."],
  ["vertel kort om welke ruimtes en welke ramen of vloeren het gaat", "vertel kort om welke ruimtes en welke ramen, wanden of vloeren het gaat"],
  ["geven ter plaatse advies over stoffen, raamdecoratie of vloerbekleding.", "geven ter plaatse advies over stoffen, raamdecoratie, behang of vloerbekleding."],
  ["Op basis van de afmetingen van uw wanden berekenen we hoeveel rollen u nodig hebt.", "Op basis van de afmetingen van uw wanden, die we ook gratis bij u thuis kunnen opmeten, berekenen we hoeveel rollen u nodig hebt."],
  ["Breng de maten van uw wanden mee naar de winkel, of beschrijf uw project in het aanvraagformulier.", "Breng de maten van uw wanden mee naar de winkel, vraag een gratis opmeting aan huis aan of beschrijf uw project in het aanvraagformulier."],

  // ── Offerte na opmeting (B9) ─────────────────────────────────────────
  ["Na de opmeting krijgt u een offerte die precies aangeeft wat er gemaakt, geleverd en geplaatst wordt, met een indicatie van de termijn.",
   "Na de opmeting krijgt u een offerte die precies aangeeft wat de prijs is en welke mogelijkheden er zijn voor de plaatsing, met waar nodig de termijn."],
  ["Gaat u akkoord, dan blijft uw project in dezelfde handen: onze eigen stiksters maken uw gordijnen in ons atelier, en onze eigen mensen komen ze nadien plaatsen. Wie bij u opmeet, kent dus ook het vervolg.",
   "Gaat u akkoord, dan volgen wij uw project verder op: uw gordijnen brengen we op maat in ons eigen atelier, en vakmannen komen ze nadien plaatsen."],
  ["Op basis daarvan maken we uw offerte, met een indicatie van de termijn.", "Op basis daarvan maken we uw offerte, met de prijs, de mogelijkheden voor plaatsing en waar nodig de termijn."],

  // ── Levering (vraag 7) ───────────────────────────────────────────────
  ["Maatwerk leveren en plaatsen wij met onze eigen mensen. Andere bestellingen laat u leveren of haalt u af in onze winkel in Ninove.",
   "Online bestellingen leveren wij binnen de week, of u haalt ze af in onze winkel in Ninove. Maatwerk wordt geleverd en geplaatst door vakmannen."],
  // 18/11/2026: "binnen de week" nooit zonder het voorbehoud. Het voorbehoud vooraan, zodat het ook in een ingekorte meta description staat.
  ["Online bestellingen leveren wij binnen de week, of u haalt ze af in onze winkel in Ninove. Maatwerk wordt geleverd en geplaatst door vakmannen.",
   "Online bestellingen leveren wij binnen de week; moet het product nog bij de leverancier besteld worden, dan kan het langer duren. U kunt ook afhalen in onze winkel in Ninove. Maatwerk wordt geleverd en geplaatst door vakmannen."],
  ["Maatwerk: levering en plaatsing door onze eigen mensen", "Maatwerk: levering en plaatsing door vakmannen"],
  ["Gordijnen op maat, raamdecoratie, vasttapijt en tapijten op maat leveren wij bij u thuis met onze eigen mensen.", "Gordijnen op maat, raamdecoratie, vasttapijt en tapijten op maat worden bij u thuis geleverd door vakmannen."],
  ["Bestelt u een product rechtstreeks online, dan ziet u bij het afrekenen welke leveringsmogelijkheden er zijn, wat ze eventueel kosten en wanneer u uw bestelling mag verwachten, nog voor u de bestelling bevestigt.",
   "Bestelt u een product rechtstreeks online, dan leveren wij binnen de week. U krijgt meteen een bevestiging van wanneer we kunnen leveren. Moet het product nog bij de leverancier besteld worden, dan kan het langer duren; ook dat laten we u dan meteen weten. Bij het afrekenen ziet u welke leveringsmogelijkheden er zijn en wat ze eventueel kosten, nog voor u de bestelling bevestigt."],
];

/** [oud, nieuw]: enkel als het hele veld (of de hele tekstknoop in rich text) exact zo luidt. */
export const VELDEN_EXACT = [
  ["Maakwerk", "Atelier"], // staptitel bij Gordijnen op maat
  ["Ons eigen atelier", "Wat ons onderscheidt"], // kop op Over Brunic
];

/**
 * Wat na de vervangingen nergens meer mag staan (code, metaobjects, en de site zelf). De audit
 * gebruikt dezelfde lijst (.agents/skills/webshop-qa-audit/SKILL.md, regel "Beloftes van Brunic").
 */
export const VERBODEN = [
  /eigen mensen/i,
  /(?<!van )ons team\b/i, // "tips van ons team" (inspiratie) is geen plaatsingsbelofte
  /eigen plaatsers/i,
  /stikster/i,
  /plaatsen we (ook )?zelf/i,
  /1 à 2 werkdagen/i,
  /40 jaar/i,
  /sinds 1992(?! is Brunic een nv)/i,
  /\bslaapcomfort\b/i,
  /\bverf\b/i,
  /gemaakt in ons atelier|maken we in ons|maken onze|gemaakt door onze/i,
  // Leverbelofte zonder voorbehoud (audit 18/11/2026): het voorbehoud moet in dezelfde tekst staan.
  /binnen de week(?!.*leverancier)/i,
];
