"use client";

import type { AnalyticsEventMap, StorefrontAnalytics } from "@shopify/hydrogen";
import { GEBEURTENIS, maakOntdubbelaar, paginaSleutel, zonderPersoonsgegevens } from "./payloads";

/**
 * Publiceren op Shopify's analytics-bus (window.Shopify.analytics, aangemaakt door ShopifyScripts
 * in de root-layout). De bus zelf beslist of er iets vertrekt: zolang de bezoeker geen
 * toestemming gaf, houdt hij de gebeurtenissen van deze pagina in het geheugen (max. 500) en
 * levert ze na "accepteren" alsnog af; bij weigeren gooit hij ze weg. Wij bouwen daar geen eigen
 * wachtrij naast.
 *
 * Staan de metingen uit of is het script geblokkeerd, dan bestaat de bus niet en doet dit niets.
 */
const bus = (): StorefrontAnalytics | null => (typeof window === "undefined" ? null : (window.Shopify?.analytics ?? null));

const magOpnieuw = maakOntdubbelaar();

type Weergave = Exclude<keyof typeof GEBEURTENIS, "pagina">;
type PayloadVan<S extends keyof typeof GEBEURTENIS> = Omit<AnalyticsEventMap[(typeof GEBEURTENIS)[S]], "url" | "shop" | "customData">;

/** Fouten in de metingen mogen de winkel nooit raken. */
function veilig(doe: () => void) {
  try {
    doe();
  } catch (e) {
    console.warn("[metingen] gebeurtenis niet gepubliceerd:", e);
  }
}

/**
 * Haalt persoonsgegevens uit de adresbalk vóór er iets gepubliceerd wordt: Shopify's script
 * leest het adres daar zelf. `replaceState` werkt meteen en herlaadt niets; de pagina blijft
 * staan zoals ze is. Mislukt het, dan publiceren we niet (false).
 */
function adresZonderPersoonsgegevens(): boolean {
  try {
    const schoon = zonderPersoonsgegevens(window.location.href);
    if (schoon) window.history.replaceState(window.history.state, "", schoon);
    return true;
  } catch {
    return false;
  }
}

/** Paginabezoek van de pagina die nu getoond wordt. */
export function meldPagina() {
  const b = bus();
  if (!b || !adresZonderPersoonsgegevens()) return;
  // De sleutel komt van het opgeschoonde adres: zo telt de pagina één keer, ook als de adresbalk net werd aangepast.
  if (!magOpnieuw("pagina", paginaSleutel(window.location.pathname, window.location.search), performance.now())) return;
  veilig(() => b.publish(GEBEURTENIS.pagina));
}

/** Product-, collectie- of zoekweergave. `sleutel` onderscheidt wat bekeken wordt. */
export function meldWeergave<S extends Weergave>(soort: S, sleutel: string, payload: PayloadVan<S>) {
  const b = bus();
  if (!b || !adresZonderPersoonsgegevens()) return;
  if (!magOpnieuw(soort, `${sleutel}|${window.location.pathname}`, performance.now())) return;
  // De types per gebeurtenis zijn hierboven afgedwongen; de bus vult de winkel en het adres zelf in.
  veilig(() => (b.publish as (e: string, p: unknown) => void)(GEBEURTENIS[soort], payload));
}
