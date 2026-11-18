"use client";

import { ShopifyScripts } from "@shopify/hydrogen/react";
import { toestemmingSetup } from "@/lib/consent/toestemming";

/**
 * Shopify's scripts voor metingen en toestemming (docs/analytics-en-cookies.md), één keer in de
 * <head> van de root-layout. Een client-component omdat de consentkoppeling een functie is, en
 * die kan niet van server naar browser.
 *
 * - `consent: custom-banner`: Shopify laadt enkel zijn Customer Privacy API en houdt elke
 *   meting tegen tot onze cookiemelding een geldige keuze doorgeeft (lib/consent/toestemming.ts).
 * - `channel: headless`: de metingen horen bij het verkoopkanaal Headless.
 * - `storefrontId` leeg: zo laadt Shopify's prestatiemeter (perf-kit) niet. Die zou al vóór
 *   elke toestemming cijfers versturen.
 * - `versturen` uit (lokaal, previews): Shopify's eigen analytics-script wordt niet geladen;
 *   de melding en de gebeurtenissen werken wel, er vertrekt alleen niets naar de rapporten.
 */
export function ShopifyRuntime({
  shopId,
  winkelDomein,
  taal,
  land,
  valuta,
  versturen,
}: {
  shopId: string;
  winkelDomein: string;
  taal: string;
  land: string;
  valuta: string;
  versturen: boolean;
}) {
  return (
    <ShopifyScripts
      shop={{ shopId, myshopifyDomain: winkelDomein, storefrontId: "" }}
      i18n={{ language: taal as "EN", country: land as "BE", currency: valuta }}
      analytics={{ channel: "headless" }}
      consent={{ mode: "custom-banner", setup: toestemmingSetup }}
      shopifyAnalytics={versturen}
      webMcp={false}
    />
  );
}
