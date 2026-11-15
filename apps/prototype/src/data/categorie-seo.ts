/**
 * Zoekgerichte aanvullingen per categorie, in de code (niet in Shopify):
 * - `CATEGORIE_TITEL`: een eigen paginatitel (<title>) waar de categorienaam de zoekvraag niet dekt.
 *   De h1 blijft de categorienaam; ondertitel en intro blijven uit Shopify komen
 *   ("Categorie | Tekst en foto", lib/inhoud/categorie.ts).
 * - `CATEGORIE_VRAGEN`: koopvragen onder de productlijst. Een afdeling toont haar vragen enkel op
 *   haar eigen landingspagina; een subcategorie enkel als ze hier eigen vragen heeft (geen
 *   herhaalde standaardtekst op elke lijst).
 *
 * Enkel feiten die al op de site staan en door Brunic bevestigd zijn (content.ts,
 * categorie-teksten.ts, docs/teksten-en-beloftes.md). Woordkeuze: packages/catalog/beloftes-teksten.mjs.
 * Geen levertermijn hier: die zin staat enkel op /info/levering, in de algemene FAQ en bij
 * producten met een prijs.
 *
 * Aanleiding: SEO/GEO-nulmeting 14/11/2026 (docs/audits/2026-11-14-seo-geo, SEO-1-06 en SEO-1-07).
 */
import type { CategoryId } from "@/lib/catalog/types";
import { routes } from "@/lib/routes";
import { FAQ } from "./content";

export type CategorieVraag = { q: string; a: string; link?: { href: string; label: string } };

/** Titel zonder " · Brunic Ninove" (dat voegt het sjabloon in app/layout.tsx toe); samen hoogstens 60 tekens. */
export const CATEGORIE_TITEL: Record<CategoryId, string> = {
  // "Tapis plein" is in Vlaanderen de gangbare naam voor vasttapijt.
  "s-vloerbekleding-vasttapijt": "Vasttapijt (tapis plein) met gratis opmeting",
  // De dienstpagina heet "Tapijt op maat laten maken"; deze lijst toont de kwaliteiten.
  "s-tapijten-op-maat": "Tapijten op maat: kies uw kwaliteit",
};

/** Een vraag uit de algemene FAQ hergebruiken: één tekst, één plaats om ze aan te passen. */
function uitFaq(begin: string): CategorieVraag {
  const f = FAQ.find((x) => x.q.startsWith(begin));
  if (!f) throw new Error(`categorie-seo.ts: geen FAQ-vraag die begint met "${begin}" (content.ts gewijzigd?)`);
  return f;
}

const MAAT_VUISTREGEL =
  "De juiste maat vertrekt van de meubels. Als vuistregel staan ofwel alle meubels van de zithoek volledig op het tapijt, ofwel enkel de voorpoten van de zetel en de fauteuils. Rond het tapijt laat u best 20 tot 40 cm vrije vloer tot aan de muur. Onder een eettafel rekent u op ongeveer 60 à 70 cm extra rondom, zodat de stoelen niet van de rand glijden.";

const NIET_TERUG =
  "Omdat een tapijt op maat speciaal voor u wordt gemaakt, kan het niet worden teruggenomen zoals een standaardartikel. Daarom nemen we de tijd om de maat en de kwaliteit samen met u goed te bepalen.";

export const CATEGORIE_VRAGEN: Record<CategoryId, CategorieVraag[]> = {
  /* ── Gordijnen & stoffen ──────────────────────────────────────────── */
  c05: [
    {
      q: "Hoe verloopt gordijnen op maat bij Brunic?",
      a: "U kiest een stof in onze winkel in Ninove. Wij komen gratis bij u thuis opmeten en bespreken ter plaatse de ophanging, de plooi en de lengte. In ons eigen atelier brengen we uw gordijnen op maat, en vakmannen hangen ze bij u op.",
      link: { href: routes.service("gordijnen-op-maat"), label: "Gordijnen op maat: zo verloopt het" },
    },
    {
      q: "Hoe worden gordijnstoffen verkocht?",
      a: "Gordijnstoffen worden per lopende meter verkocht. Veel stoffen zijn kamerhoog geweven, tot 300 cm breed, zodat een gordijn zonder naden over de volledige breedte van een raam loopt. Wij rekenen voor u uit hoeveel stof er nodig is, rekening houdend met de plooi en met de herhaling van het patroon.",
    },
    uitFaq("Is de opmeting aan huis echt gratis"),
    uitFaq("Hoe lang duurt het voor uw gordijnen"),
    uitFaq("Kan ik stoffen en stalen"),
    { ...uitFaq("Verkoopt u raamdecoratie"), link: { href: routes.service("raamdecoratie-op-maat"), label: "Rolgordijnen, plissés en jaloezieën op maat" } },
  ],

  /* ── Behang ───────────────────────────────────────────────────────── */
  c02: [
    {
      q: "Hoeveel rollen behang heb ik nodig?",
      a: "Dat hangt af van de afmetingen van uw wanden en van de patroonherhaling. Breng de maten van uw wanden mee naar de winkel of vraag een gratis opmeting aan huis aan: wij berekenen hoeveel rollen u nodig hebt, met een kleine reserve.",
      link: { href: routes.service("behang-en-fotobehang"), label: "Behangadvies en fotobehang op maat" },
    },
    {
      q: "Wat is het verschil tussen behang en fotobehang?",
      a: "Behang wordt per rol verkocht en herhaalt zijn motief over de wand. Fotobehang of panoramisch behang loopt als één groot beeld over de wand, zonder dat het motief zich herhaalt; het wordt per stuk verkocht of op maat van uw wand. Bij Boråstapeter kunt u fotobehang op maat laten maken.",
    },
    {
      q: "Kan ik behang eerst in het echt bekijken?",
      a: "Ja. In onze winkel in Ninove bladert u door de stalenboeken en voelt u de materialen. Wij helpen u kiezen op basis van de ruimte, het licht en de stijl van uw interieur.",
    },
    uitFaq("Is de opmeting aan huis echt gratis"),
    uitFaq("Kan ik mijn bestelling afhalen"),
  ],

  /* ── Vloerbekleding ───────────────────────────────────────────────── */
  c04: [
    {
      q: "Wat is het verschil tussen vasttapijt, tapijttegels en vinyl?",
      a: "Vasttapijt, in Vlaanderen ook tapis plein genoemd, wordt van muur tot muur gelegd en maakt een ruimte warm en stil. Tapijttegels, bij ons van Desso en Balsan, zijn bedoeld voor kantoren en projecten: een tegel kunt u afzonderlijk vervangen. Vinyl kan tegen vocht en is daardoor ook geschikt voor keuken en badkamer.",
    },
    {
      q: "Komt Brunic opmeten en wie legt het vasttapijt?",
      a: "Wij meten gratis bij u thuis op en bekijken de ondergrond, de dorpels en de overgangen naar andere vloeren. Het leggen gebeurt door vakmannen. Wat er bij het leggen komt kijken, staat duidelijk in uw offerte.",
      link: { href: routes.service("vasttapijt-en-vloeren"), label: "Vasttapijt laten leggen: zo verloopt het" },
    },
    {
      q: "Hoe wordt vloerbekleding verkocht?",
      a: "Vloerbekleding wordt per vierkante meter verkocht. Bij de gratis opmeting bepalen we hoe de banen het best liggen; zo weet u vooraf hoeveel vierkante meter u nodig hebt.",
    },
    uitFaq("Waarom staat er bij de producten"),
    uitFaq("Kan ik stoffen en stalen"),
  ],
  "s-vloerbekleding-vasttapijt": [
    {
      q: "Is vasttapijt hetzelfde als tapis plein?",
      a: "Ja. Tapis plein is de naam die in Vlaanderen vaak gebruikt wordt voor vasttapijt, ook kamerbreed tapijt genoemd: tapijt dat van muur tot muur wordt gelegd, op maat van de ruimte. Bij Brunic kiest u uit vasttapijt van Associated Weavers, Desso, Lano, Balsan en Tarkett.",
    },
    {
      q: "Komt Brunic opmeten en wie legt het vasttapijt?",
      a: "Wij meten gratis bij u thuis op. We bekijken de ondergrond, de deuren, de dorpels en de overgangen naar andere vloeren, en bepalen hoe de banen het best liggen, met zo weinig mogelijk naden op zichtbare plaatsen. Het leggen gebeurt door vakmannen. Wat er bij het leggen komt kijken, staat duidelijk in uw offerte.",
      link: { href: routes.service("vasttapijt-en-vloeren"), label: "Vasttapijt laten leggen: zo verloopt het" },
    },
    {
      q: "Welk vasttapijt kies ik voor een trap, een gang of een slaapkamer?",
      a: "Polyamide is sterk en veerkrachtig, en daardoor geschikt voor plaatsen waar veel gelopen wordt, zoals een gang of een trap. Polypropyleen is kleurvast en eenvoudig te onderhouden. Wol is een natuurlijke, veerkrachtige vezel met een warme uitstraling. Sisal geeft een stevige, natuurlijke structuur, maar is minder geschikt voor vochtige ruimtes. In onze winkel in Ninove voelt en vergelijkt u de stalen.",
      link: { href: routes.article("vasttapijt-kiezen"), label: "Vasttapijt kiezen: waar let u op?" },
    },
    {
      q: "Hoe wordt vasttapijt verkocht?",
      a: "Vasttapijt wordt per vierkante meter verkocht. Bij de gratis opmeting bepalen we hoe de banen het best liggen; zo weet u vooraf hoeveel vierkante meter u nodig hebt.",
    },
    uitFaq("Kan ik maatwerk terugsturen"),
  ],

  /* ── Tapijten ─────────────────────────────────────────────────────── */
  c03: [
    {
      q: "Welke maat vloerkleed heb ik nodig?",
      a: MAAT_VUISTREGEL,
      link: { href: routes.article("tapijtmaat-bepalen"), label: "De juiste tapijtmaat bepalen" },
    },
    {
      q: "Kan ik een tapijt op maat laten maken?",
      a: "Ja. Past geen enkele standaardmaat bij uw ruimte of uw meubels, dan kiest u voor een tapijt op maat, onder meer in kwaliteiten van Desso en Tarkett. U bepaalt zelf de afmetingen en krijgt vooraf een offerte.",
      link: { href: routes.service("tapijt-op-maat"), label: "Tapijt op maat: zo verloopt het" },
    },
    {
      q: "Zijn er vloerkleden voor buiten?",
      a: "Ja. Bij Louis De Poortere vindt u vloerkleden voor gebruik binnen én buiten: in de veranda, op het terras of onder de overkapping. Volg voor het onderhoud en het bewaren in de winter de richtlijnen van de fabrikant.",
    },
    uitFaq("Hoe onderhoud ik mijn gordijnen of tapijt"),
  ],
  "s-tapijten-op-maat": [
    {
      q: "Hoe bestel ik een tapijt op maat?",
      a: "U kiest een kwaliteit en een kleur, op deze pagina of in onze winkel in Ninove. Wij noteren de gewenste maat en vorm en bespreken de afwerking van de randen. U krijgt vooraf een offerte. Wanneer uw tapijt klaar is, leveren we het bij u thuis af.",
      link: { href: routes.service("tapijt-op-maat"), label: "Tapijt op maat: zo verloopt het" },
    },
    {
      q: "Welke maat kies ik voor een tapijt op maat?",
      a: MAAT_VUISTREGEL,
      link: { href: routes.article("tapijtmaat-bepalen"), label: "De juiste tapijtmaat bepalen" },
    },
    { q: "Kan een tapijt op maat teruggenomen worden?", a: NIET_TERUG },
  ],
};
