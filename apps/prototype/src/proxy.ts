import { NextResponse, type NextRequest } from "next/server";
import oud from "@/data/oude-urls.json";

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
 */
const OUDE_SLUGS = new Set(Object.keys((oud as { producten: Record<string, unknown> }).producten));

export function proxy(request: NextRequest) {
  // Een gewone URL, niet request.nextUrl: die zet de streep bij het opbouwen van het adres terug.
  const url = new URL(request.url);
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

export const config = { matcher: ["/product/:slug", "/(.*)/"] };
