/**
 * Shopify Search vindt ook pagina's uit de Shopify-admin (Onlinewinkel › Pagina's). De pagina's van
 * deze site staan in de code (src/data/content.ts), niet in Shopify: een Shopify-pagina verschijnt
 * dus enkel als zoekresultaat wanneer haar handle hier een bestemming heeft. Zo maakt Brunic een
 * dienst vindbaar: een Shopify-pagina met als handle de slug van de dienst (bv. `opmeting-aan-huis`)
 * en in de tekst de woorden waarop klanten zoeken. De bezoeker landt op de pagina van de site.
 */
import { ARTICLES, INFO_PAGES, SERVICES } from "@/data/content";
import { routes } from "@/lib/routes";

export type Paginasuggestie = { href: string; title: string };

/** Shopify-handles die op de site een andere URL hebben. */
const ANDERE_URL: Record<string, string> = {
  contact: routes.store(),
  "winkel-en-contact": routes.store(),
  "op-maat-en-plaatsing": routes.services(),
  "inspiratie-en-advies": routes.inspiration(),
};

/** De pagina op de site achter een Shopify-pagina, of undefined als ze er geen heeft. */
export function paginaVanShopify(handle: string, title: string): Paginasuggestie | undefined {
  const vast = ANDERE_URL[handle];
  if (vast) return { href: vast, title };
  const dienst = SERVICES.find((s) => s.slug === handle);
  if (dienst) return { href: routes.service(dienst.slug), title: dienst.title };
  const info = INFO_PAGES.find((p) => p.slug === handle);
  if (info) return { href: routes.info(info.slug), title: info.title };
  const artikel = ARTICLES.find((a) => a.slug === handle);
  if (artikel) return { href: routes.article(artikel.slug), title: artikel.title };
  return undefined;
}
