import { createShopifyRequestContext, createStorefrontClient, defineShopifyI18n, type StorefrontClient } from "@shopify/hydrogen";

/**
 * Shopify als bibliotheek (@shopify/hydrogen) binnen Next.js: de aanvraag-gebonden Storefront
 * API-client. Anders dan lib/shopify/storefront.ts stuurt deze client de cookies en het
 * privacysignaal van de bezoeker mee naar Shopify en neemt hij Shopify's cookies over. Dat is
 * nodig voor de winkelmand, de toestemming en de overgang naar de kassa (docs/analytics-en-cookies.md).
 *
 * Enkel op de server: de token komt nooit in de browser.
 */

/**
 * Markt en taal zoals de winkel ze vandaag kent: enkel België, enkel Engels (nagekeken 16/11/2026
 * via `localization`). Komt Nederlands erbij in Shopify, dan wordt `language` hier "NL".
 */
export const shopifyI18n = defineShopifyI18n({ defaultLocale: { language: "EN", country: "BE" } });

export const SHOPIFY_VALUTA = "EUR";

/** Staat de Shopify-winkelmand aan? Zelfde schakelaar als in de browser (lib/store/stores.ts). */
export const SHOPIFY_WINKELMAND = process.env.NEXT_PUBLIC_SHOPIFY_WINKELMAND === "1";

/**
 * Metingen en cookiemelding: uit · "1" = aan, versturen naar Shopify enkel op productie ·
 * "test" = aan en ook lokaal/preview versturen (om te verifiëren, nooit op Vercel zetten).
 */
export function analyticsStand(): "uit" | "aan" | "test" {
  const v = process.env.SHOPIFY_ANALYTICS;
  return v === "test" ? "test" : v === "1" ? "aan" : "uit";
}

/** Heeft de proxy Shopify-routes af te handelen? */
export const shopifyRoutesAan = () => SHOPIFY_WINKELMAND || analyticsStand() !== "uit";

/** IP van de bezoeker zoals Vercel het doorgeeft (eerste adres); lokaal ontbreekt het. */
const bezoekerIp = (request: Request) => request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;

export function shopifyContext(request: Request): { requestContext: StorefrontClient["requestContext"]; storefrontClient: StorefrontClient } {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
  if (!storeDomain || !token) throw new Error("SHOPIFY_STORE_DOMAIN of SHOPIFY_STOREFRONT_API_TOKEN ontbreekt.");
  const apiVersion = process.env.SHOPIFY_API_VERSION || undefined;

  // Een privé-token (shpat_…) vereist het IP van de bezoeker: Shopify's botbeveiliging telt dan per bezoeker.
  const buyerIp = bezoekerIp(request);
  if (token.startsWith("shpat_") && buyerIp) {
    const requestContext = createShopifyRequestContext({ request, i18n: shopifyI18n, buyerIp });
    const storefrontClient = createStorefrontClient({ type: "private", requestContext, config: { storeDomain, privateStorefrontToken: token, apiVersion } });
    return { requestContext, storefrontClient };
  }
  if (token.startsWith("shpat_")) throw new Error("Privé-token zonder bezoekers-IP: de Shopify-aanvraag kan niet veilig worden doorgestuurd.");

  const requestContext = createShopifyRequestContext({ request, i18n: shopifyI18n });
  const storefrontClient = createStorefrontClient({ type: "public", requestContext, config: { storeDomain, publicStorefrontToken: token, apiVersion } });
  return { requestContext, storefrontClient };
}
