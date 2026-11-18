/**
 * De regels achter de cookiemelding, zonder browser: zo zijn ze los te testen
 * (scripts/test-analytics.mjs). De toestand zelf leeft in Shopify (lib/consent/toestemming.ts).
 */

/** Wat de bezoeker kiest. Noodzakelijke opslag (winkelmand, verlanglijst) staat hier los van. */
export type Keuze = { analytics: boolean; marketing: boolean };

/**
 * Categorieën in de melding. Enkel wat de site echt gebruikt staat `actief`: vandaag alleen
 * statistieken (Shopify Analytics). Marketing komt erbij wanneer er advertenties starten
 * (Google Ads): zet `actief` op true, vul de cookiepagina aan en verhoog BELEID_VERSIE — dan
 * krijgt elke bezoeker de vraag opnieuw, want toestemming geldt enkel voor wat hij toen wist.
 */
export const CATEGORIEEN: { sleutel: keyof Keuze; titel: string; uitleg: string; actief: boolean }[] = [
  {
    sleutel: "analytics",
    titel: "Statistieken",
    uitleg: "Wij meten welke pagina’s en producten bekeken worden en of een bezoek tot een bestelling leidt (Shopify Analytics). Zo verbeteren wij onze webshop.",
    actief: true,
  },
  {
    sleutel: "marketing",
    titel: "Advertenties",
    uitleg: "Wij meten of een advertentie tot een bezoek of bestelling leidt.",
    actief: false,
  },
];

/** Versie van het cookiebeleid waarvoor toestemming gevraagd wordt. Verhogen = opnieuw vragen. */
export const BELEID_VERSIE = 1;

/**
 * Hoe lang een keuze geldt. De Gegevensbeschermingsautoriteit noemt 6 maanden "in beginsel
 * redelijk" voor het onthouden van cookievoorkeuren (thema Cookies, bijgewerkt 17/11/2023).
 * Geldt voor aanvaarden én weigeren.
 */
export const GELDIG_DAGEN = 183;

/** Sleutel in Shopify's toestemmingsgegevens (max. 25 tekens); de waarde is `versie|jjjj-mm-dd`. */
export const STEMPEL_SLEUTEL = "brunic_keuze";

export const maakStempel = (nu: Date, versie = BELEID_VERSIE) => `${versie}|${nu.toISOString().slice(0, 10)}`;

export function leesStempel(waarde: unknown): { versie: number; datum: Date } | null {
  if (typeof waarde !== "string") return null;
  const m = /^(\d{1,4})\|(\d{4}-\d{2}-\d{2})$/.exec(waarde);
  if (!m) return null;
  const datum = new Date(`${m[2]}T00:00:00Z`);
  return Number.isNaN(datum.getTime()) ? null : { versie: Number(m[1]), datum };
}

/** Shopify geeft per doel "yes", "no" of "" (nog geen keuze). */
export type ShopifyToestemming = Partial<Record<"analytics" | "marketing" | "preferences" | "sale_of_data", unknown>>;

/**
 * De vastgelegde keuze, of null als er (nog) geen geldige is: niets gekozen, een oudere versie
 * van het beleid, of ouder dan GELDIG_DAGEN. Bij null blijft alles geblokkeerd en komt de melding.
 */
export function geldigeKeuze(toestemming: ShopifyToestemming | null | undefined, stempel: unknown, nu: Date): Keuze | null {
  if (!toestemming) return null;
  const ja = (v: unknown) => v === "yes";
  const gekozen = (v: unknown) => v === "yes" || v === "no";
  // Elk actief doel moet een uitdrukkelijk antwoord hebben.
  if (!CATEGORIEEN.filter((c) => c.actief).every((c) => gekozen(toestemming[c.sleutel]))) return null;
  const s = leesStempel(stempel);
  if (!s || s.versie !== BELEID_VERSIE) return null;
  const dagen = (nu.getTime() - s.datum.getTime()) / 86_400_000;
  if (dagen < -1 || dagen > GELDIG_DAGEN) return null;
  return { analytics: ja(toestemming.analytics), marketing: ja(toestemming.marketing) };
}

/**
 * Onze keuze → de vier doelen van Shopify's Customer Privacy API. Een doel dat niet actief is,
 * staat altijd uit. "Voorkeuren" gebruiken wij niet; doorverkoop/delen volgt marketing.
 */
export function naarShopify(keuze: Keuze): { analytics: boolean; marketing: boolean; preferences: boolean; sale_of_data: boolean } {
  const aan = (sleutel: keyof Keuze) => Boolean(keuze[sleutel]) && CATEGORIEEN.some((c) => c.sleutel === sleutel && c.actief);
  return { analytics: aan("analytics"), marketing: aan("marketing"), preferences: false, sale_of_data: aan("marketing") };
}

export const ALLES_AAN: Keuze = { analytics: true, marketing: true };
export const ALLES_UIT: Keuze = { analytics: false, marketing: false };
