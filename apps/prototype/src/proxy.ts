import { handleShopifyRoutes } from "@shopify/hydrogen";
import { NextResponse, type NextRequest } from "next/server";
import oud from "@/data/oude-urls.json";
import { SHOPIFY_WINKELMAND, shopifyContext, shopifyRoutesAan } from "@/lib/shopify/hydrogen";
import { winkelmandHandlers } from "@/lib/shopify/winkelmand-handlers";

/**
 * 1) Product-URL's van de oude WooCommerce-site (/product/<oude-slug>) → route handler
 *    app/oude-site/product/[slug], die de best passende nieuwe pagina kiest en met een 308
 *    doorstuurt (lib/site/oude-urls.ts).
 *
 *    Waarom niet in de productpagina zelf: permanentRedirect() tijdens de eerste (on-demand
 *    ISR) render gaf twee Location-headers, wat Chrome weigert. Geen enkele oude slug is ook
 *    een nieuwe Shopify-handle (gecontroleerd 20/10/2026), dus deze lijst volstaat om te
 *    beslissen — zonder de catalogus te laden.
 *
 * 2) De schuine streep achteraan (next.config.ts › skipTrailingSlashRedirect). De oude site
 *    schreef elke URL mét streep (/product/x/, /product-categorie/y/). Next haalde die eerst
 *    weg met een eigen 308, en pas de tweede 308 ging naar de bestemming: twee stappen voor
 *    elke oude URL (SEO-nulmeting 14/11/2026, SEO-1-05). Nu beslist deze proxy in één keer:
 *    een oude URL gaat rechtstreeks naar haar handler, elke andere URL met streep krijgt
 *    zoals voorheen een 308 naar dezelfde URL zonder streep.
 *    De gewone pagina's van de oude site (/contact/ …) staan met en zonder streep in
 *    next.config.ts › redirects(); die lopen vóór deze proxy.
 *
 * 3) Shopify-routes (@shopify/hydrogen als bibliotheek, docs/analytics-en-cookies.md): de
 *    Storefront API via ons eigen domein (toestemming en sessie) en /api/cart (de winkelmand).
 *    Bewust een korte lijst en niet alles wat handleShopifyRoutes kan: winkelmandlinks
 *    (/cart/…, /buy/…), /checkout, de AJAX-cart en de MCP-routes zouden om de etalagebewaking
 *    heen een kassa kunnen openen en blijven dus een gewone 404.
 */
const OUDE_SLUGS = new Set(Object.keys((oud as { producten: Record<string, unknown> }).producten));

/** Zelfde patroon als Shopify's SFAPI-proxy: /api/<versie>/graphql.json. */
const SFAPI_PAD = /^\/api\/(unstable|2\d{3}-\d{2})\/graphql\.json$/;

function shopifyRoute(request: NextRequest, pad: string): Promise<Response> | null {
  const isSfapi = SFAPI_PAD.test(pad);
  const isCart = pad === "/api/cart" && SHOPIFY_WINKELMAND;
  if ((!isSfapi && !isCart) || !shopifyRoutesAan()) return null;
  // De Storefront API via ons domein dient enkel de toestemming (Customer Privacy API): geen vrije doorgang.
  if (isSfapi && (request.method !== "POST" || request.headers.get("Shopify-Storefront-Consent-Management") !== "1")) {
    return Promise.resolve(NextResponse.json({ error: "Not Found" }, { status: 404, headers: { "Cache-Control": "no-store" } }));
  }
  const { requestContext, storefrontClient } = shopifyContext(request);
  return handleShopifyRoutes({ request, requestContext, storefrontClient, handlers: isCart ? [winkelmandHandlers] : [] });
}

export function proxy(request: NextRequest) {
  // Een gewone URL, niet request.nextUrl: die zet de streep bij het opbouwen van het adres terug.
  const url = new URL(request.url);

  const shopify = shopifyRoute(request, url.pathname);
  if (shopify) return shopify;

  const metStreep = url.pathname.length > 1 && url.pathname.endsWith("/");
  const pad = metStreep ? url.pathname.replace(/\/+$/, "") : url.pathname;

  if (pad.startsWith("/product/")) {
    let slug = pad.slice("/product/".length);
    try {
      slug = decodeURIComponent(slug);
    } catch {
      /* ongeldige codering: geen oude slug */
    }
    if (OUDE_SLUGS.has(slug)) {
      url.pathname = `/oude-site/product/${encodeURIComponent(slug)}`;
      return NextResponse.rewrite(url);
    }
  }

  if (!metStreep) return NextResponse.next();

  url.pathname = pad || "/";
  // Oude categorie: app/product-categorie/[...pad]/route.ts antwoordt zelf met de 308 naar de bestemming.
  if (pad.startsWith("/product-categorie/")) return NextResponse.rewrite(url);
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: ["/product/:slug", "/(.*)/", "/api/cart", "/api/:versie/graphql.json"] };
