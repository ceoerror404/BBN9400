import type { AnalyticsEventName, ProductPayload } from "@shopify/hydrogen";
import type { Product, Variant } from "@/lib/catalog/types";

/**
 * Wat er in een meting staat — zonder browser, dus los te testen (scripts/test-analytics.mjs).
 * Namen en velden zijn die van Shopify's analytics-bus (@shopify/hydrogen, AnalyticsEvent);
 * hier worden er geen bijverzonnen. Versturen gebeurt in lib/analytics/bus.ts.
 */

/** De gebeurtenissen die de site zelf publiceert. De winkelmand-gebeurtenissen leidt Shopify af. */
export const GEBEURTENIS = {
  pagina: "page_viewed",
  product: "product_viewed",
  collectie: "collection_viewed",
  zoeken: "search_viewed",
} as const satisfies Record<string, AnalyticsEventName>;

export const VALUTA = "EUR";

type GidSoort = "Product" | "ProductVariant" | "Collection";
/** De catalogus bewaart korte nummers; Shopify's metingen willen de volledige GID. */
export const gid = (soort: GidSoort, id: string) => (id.startsWith("gid://") ? id : `gid://shopify/${soort}/${id}`);

/**
 * Product in een `product_viewed`. Het product-ID is dat van de gekozen variant in Shopify:
 * bij een samengevoegd ontwerp kan dat een ander product zijn dan dat van de pagina.
 * Prijs op aanvraag (geen online prijs) gaat mee als 0.00 — Shopify slaat een meting zonder prijs over.
 */
export function productPayload(
  product: Pick<Product, "id" | "title" | "brand" | "merkBron">,
  variant: Pick<Variant, "id" | "sku" | "options" | "price" | "bronProductId">,
): ProductPayload {
  return {
    id: gid("Product", variant.bronProductId ?? product.id),
    title: product.title,
    vendor: product.merkBron ?? product.brand ?? "Brunic",
    variantId: gid("ProductVariant", variant.id),
    variantTitle: Object.values(variant.options).join(" / ") || "Default Title",
    price: { amount: (variant.price?.amount.amount ?? 0).toFixed(2), currencyCode: VALUTA },
    quantity: 1,
    sku: variant.sku || null,
  };
}

/** Collectie in een `collection_viewed`; null zolang de momentopname het Shopify-ID niet kent. */
export function collectiePayload(bron: { handle: string; id?: string } | undefined): { collection: { id: string; handle: string } } | null {
  return bron?.id ? { collection: { id: gid("Collection", bron.id), handle: bron.handle } } : null;
}

const LIJKT_OP_EMAIL = /\S+@\S+\.\S+/;
/** Acht of meer cijfers op een rij (spaties, punten, streepjes en haakjes ertussen tellen niet). */
const LIJKT_OP_NUMMER = /(?:\d[\s./()+-]*){8,}/;

/**
 * Vrije zoektekst kan persoonsgegevens bevatten (iemand plakt een e-mailadres of telefoonnummer
 * in het zoekveld). Zo'n term gaat niet naar de metingen: null. Anders ingekort en opgeschoond.
 */
export function schoneZoekterm(ruw: string | null | undefined): string | null {
  const term = (ruw ?? "").replace(/\s+/g, " ").trim();
  if (!term || LIJKT_OP_EMAIL.test(term) || LIJKT_OP_NUMMER.test(term)) return null;
  return term.slice(0, 80);
}

/**
 * Zoekresultaten in een `search_viewed`, of null als de term niet mee mag. Het aantal gaat enkel
 * mee als het gekend is: Shopify Search geeft geen totaal dat met de getoonde kaarten klopt.
 */
export function zoekPayload(ruw: string | null | undefined, aantal: number | null): { searchTerm: string; searchResults?: { totalCount: number } } | null {
  const searchTerm = schoneZoekterm(ruw);
  if (!searchTerm) return null;
  return aantal === null ? { searchTerm } : { searchTerm, searchResults: { totalCount: aantal } };
}

/**
 * Het adres zonder persoonsgegevens, of null als er niets te verwijderen valt.
 *
 * Shopify's analytics-script leest het adres zelf uit de adresbalk (gemeten 16/11/2026: een
 * `url` in de gebeurtenis verandert daar niets aan). Persoonsgegevens moeten dus uit het adres
 * zelf vóór er iets gepubliceerd wordt (lib/analytics/bus.ts doet dat met replaceState):
 * - een zoekterm (`q`) die op een e-mailadres of telefoonnummer lijkt;
 * - elke andere waarde die een e-mailadres is (bv. `?email=…` uit een link in een mailing).
 * Al de rest blijft staan — ook campagnecodes (utm_…, gclid): die zeggen waar een bezoek vandaan komt.
 */
export function zonderPersoonsgegevens(href: string): string | null {
  const url = new URL(href);
  let gewijzigd = false;
  for (const [k, v] of [...url.searchParams]) {
    const weg = k === "q" ? v.trim() !== "" && schoneZoekterm(v) === null : LIJKT_OP_EMAIL.test(v);
    if (weg) {
      url.searchParams.delete(k);
      gewijzigd = true;
    }
  }
  return gewijzigd ? url.toString() : null;
}

/**
 * Sleutel van een paginabezoek: pad + query zonder `variant`. Een andere kleur of maat kiezen op
 * een productpagina past het adres aan, maar is geen nieuw paginabezoek.
 */
export function paginaSleutel(pathname: string, search: string): string {
  const q = new URLSearchParams(search);
  q.delete("variant");
  q.sort();
  const s = q.toString();
  return s ? `${pathname}?${s}` : pathname;
}

/**
 * Houdt dubbels tegen die geen echt bezoek zijn: React Strict Mode en een her-render voeren een
 * effect twee keer kort na elkaar uit. Enkel een onmiddellijke herhaling valt weg: dezelfde
 * sleutel als de vorige gebeurtenis van die soort, binnen het venster. Er is geen blijvend
 * geheugen per adres — pagina A, dan B, dan terug naar A telt drie keer, hoe snel ook.
 */
export function maakOntdubbelaar(vensterMs = 1000) {
  const vorige = new Map<string, { sleutel: string; tijd: number }>();
  return (soort: string, sleutel: string, nu: number): boolean => {
    const v = vorige.get(soort);
    if (v && v.sleutel === sleutel && nu - v.tijd < vensterMs) return false;
    vorige.set(soort, { sleutel, tijd: nu });
    return true;
  };
}
