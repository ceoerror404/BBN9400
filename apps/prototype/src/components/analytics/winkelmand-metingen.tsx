"use client";

import { trackCartAnalytics } from "@shopify/hydrogen";
import { useEffect } from "react";
import { useToestemming } from "@/lib/consent/toestemming";
import { analyticsStore, useShopifyCart } from "@/lib/store/shopify-cart";

/**
 * Metingen "toegevoegd aan / verwijderd uit winkelmand": Shopify's eigen tracker leidt ze af uit
 * de door Shopify bevestigde mand — nooit uit een klik of uit wat het scherm al vooruit toont.
 * Een mislukte wijziging geeft dus geen meting, en een herhaalde of dubbele klik telt één keer.
 *
 * De tracker start pas wanneer (1) de mand geladen is en (2) de bezoeker statistieken toestaat.
 * Zo is de mand van dat moment het vertrekpunt: wat er vóór de toestemming in gelegd werd, wordt
 * niet achteraf gemeld. Trekt de bezoeker zijn toestemming in, dan stopt de tracker.
 * Enkel met de Shopify-winkelmand (lib/store/stores.ts › SHOPIFY_CART).
 */
export function WinkelmandMetingen() {
  const { hydrated } = useShopifyCart();
  const { keuze } = useToestemming();
  const magMeten = hydrated && keuze?.analytics === true;

  useEffect(() => {
    if (!magMeten || !window.Shopify?.analytics) return;
    try {
      return trackCartAnalytics(analyticsStore);
    } catch (e) {
      console.warn("[metingen] winkelmand niet gevolgd:", e);
    }
  }, [magMeten]);

  return null;
}
