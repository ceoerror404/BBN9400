/**
 * Zoeken met Shopify Search (Storefront API: `search` en `predictiveSearch`). Enkel serverzijdig.
 *
 * Shopify bepaalt wat er gevonden wordt en in welke volgorde: de doorzochte velden, tikfouten,
 * woordvormen, en de boosts en filters uit de app Search & Discovery. De site legt daar niets
 * bovenop: geen eigen rangschikking, geen eigen synoniemen, geen eigen tekstvergelijking.
 *
 * Wat Shopify teruggeeft zijn product-ID's. De kaart (beeld, prijs per eenheid, "op aanvraag",
 * samengevoegde ontwerpen) komt uit de catalogus van de site, dezelfde als op elke andere lijst.
 * Een product dat Shopify vindt maar dat niet op de site staat (geen gekoppelde collectie, of
 * nieuwer dan de momentopname), valt weg: het zou ook geen productpagina hebben.
 *
 * Aantallen: Shopify telt Shopify-producten en stopt bij 1000; de site voegt ontwerpen samen
 * (lib/catalog/ontwerpen.ts). Er staat dus enkel een totaal als alle resultaten opgehaald zijn:
 * dan is het het aantal kaarten. Om dezelfde reden tonen de filterwaarden geen aantal.
 *
 * docs/zoeken.md beschrijft de werking, de verschillen met de vroegere zoekfunctie en wat in de
 * Shopify-admin ingesteld wordt.
 */
import { SHOPIFY_HOOFDCOLLECTIE } from "@/data/shopify-bron";
import { PAGE_SIZE, PRICE_BUCKETS, SWATCH_COLORS, waardeId, type Bucket, type FacetGroup, type FacetOption, type Selection, type SortOption } from "@/lib/catalog/filters";
import { toUrlParams, type ListingData, type SearchParamsRecord } from "@/lib/catalog/listing";
import { catalog } from "@/lib/catalog/repository";
import { ancestry, type CategoryTree } from "@/lib/catalog/tree";
import type { Product } from "@/lib/catalog/types";
import { kaartVan, type CardProduct } from "@/lib/catalog/view";
import { routes } from "@/lib/routes";
import { storefront, type StorefrontOpties } from "@/lib/shopify/storefront";
import { paginaVanShopify, type Paginasuggestie } from "./paginas";

/** Shopify Search geeft hoogstens zoveel resultaten, ook bij het pagineren, en telt niet verder. */
const MAX_SHOPIFY = 1000;
/** Het grootste aantal dat Shopify per verzoek geeft. We vragen enkel ID's, dus dat blijft licht. */
const PER_VERZOEK = 250;
const MAX_PAGINA = Math.ceil(MAX_SHOPIFY / PAGE_SIZE);
const TIMEOUT_MS = 8000;
/** Suggesties in het zoekveld. */
const MAX_SUGGESTIES = 6;
export const MAX_ZOEKTERM = 120;

/** De eerste is de standaard. Shopify Search sorteert enkel op relevantie en op prijs. */
export const ZOEK_SORTERINGEN: SortOption[] = [
  { value: "relevantie", label: "Relevantie" },
  { value: "prijs-op", label: "Prijs oplopend" },
  { value: "prijs-af", label: "Prijs aflopend" },
];

/**
 * De zoekterm zoals hij naar Shopify gaat. Een dubbelepunt is in Shopify zoeksyntaxis ("veld:waarde")
 * en schakelt de tikfoutcorrectie uit; een klant die "kleur: 110" plakt, bedoelt gewone woorden.
 */
export function zoekterm(ruw: string | string[] | undefined): string {
  return String((Array.isArray(ruw) ? ruw[0] : ruw) ?? "")
    .replace(/:/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_ZOEKTERM);
}

const kortId = (gid: string) => gid.split("/").pop() ?? gid;

/* ---------------- Shopify ---------------- */

type RawWaarde = { id: string; label: string; count: number; input: unknown; swatch: { color: string | null } | null };
type RawFilter = { id: string; label: string; type: "LIST" | "PRICE_RANGE" | "BOOLEAN"; values: RawWaarde[] };
type RawZoek = { totalCount: number; pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: { id?: string }[] };
/** Eén filter in `productFilters` (Storefront API › ProductFilter). */
type ProductFilter = Record<string, unknown>;

const FILTERS = /* GraphQL */ `productFilters { id label type values { id label count input swatch { color } } }`;

const IDS = /* GraphQL */ `
  query ZoekProducten($q: String!, $first: Int!, $after: String, $filters: [ProductFilter!], $sortKey: SearchSortKeys, $reverse: Boolean) {
    search(query: $q, first: $first, after: $after, types: [PRODUCT], productFilters: $filters, sortKey: $sortKey, reverse: $reverse) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes { ... on Product { id } }
    }
  }
`;

const BASIS = /* GraphQL */ `
  query ZoekBasis($q: String!) {
    search(query: $q, first: 1, types: [PRODUCT]) { ${FILTERS} }
  }
`;

/** De filters bij de huidige keuze, en per prijsklasse of ze resultaten heeft (elk een eigen `search`, in één verzoek). */
const FACETTEN = /* GraphQL */ `
  query ZoekFilters($q: String!, $filters: [ProductFilter!]${PRICE_BUCKETS.map((_, i) => `, $p${i}: [ProductFilter!]`).join("")}) {
    search(query: $q, first: 1, types: [PRODUCT], productFilters: $filters) { ${FILTERS} }
    ${PRICE_BUCKETS.map((_, i) => `p${i}: search(query: $q, first: 1, types: [PRODUCT], productFilters: $p${i}) { totalCount }`).join("\n    ")}
  }
`;

/**
 * Collecties en pagina's bij een zoekterm. Pagina's apart van de producten: in één `search` met
 * producten geeft Shopify er hoogstens twee.
 */
const OVERIG = /* GraphQL */ `
  query ZoekOverig($q: String!) {
    predictiveSearch(query: $q, limit: 8, limitScope: EACH, types: [COLLECTION]) { collections { handle } }
    search(query: $q, first: 5, types: [PAGE]) { nodes { ... on Page { handle title } } }
  }
`;

const VOORSPEL = /* GraphQL */ `
  query ZoekSuggesties($q: String!) {
    predictiveSearch(query: $q, limit: 10, limitScope: EACH, types: [PRODUCT, COLLECTION, PAGE, QUERY]) {
      products { id }
      collections { handle }
      pages { handle title }
      queries { text }
    }
  }
`;

/* ---------------- categorieën en pagina's ---------------- */

export type Categoriesuggestie = { id: string; name: string; href: string; trail: string };

/** De categorie van de site achter een Shopify-collectie (src/data/shopify-bron.ts), als ze getoond wordt. */
function categorieVanCollectie(tree: CategoryTree, handle: string): Categoriesuggestie | undefined {
  const hoofd = Object.entries(SHOPIFY_HOOFDCOLLECTIE).find(([, h]) => h === handle)?.[0];
  const node = tree.byId.get(hoofd ?? `s-${handle}`);
  if (!node) return undefined;
  const pad = ancestry(tree, node.id);
  if (pad.some((c) => c.hidden)) return undefined;
  return { id: node.id, name: node.name, href: routes.category(node), trail: pad.slice(0, -1).map((c) => c.name).join(" › ") };
}

function uniek<T>(lijst: (T | undefined)[], sleutel: (x: T) => string): T[] {
  const gezien = new Set<string>();
  return lijst.filter((x): x is T => x !== undefined && !gezien.has(sleutel(x)) && Boolean(gezien.add(sleutel(x))));
}

/** Producten van de site bij Shopify-ID's, in dezelfde volgorde. Een samengevoegd ontwerp komt één keer voor. */
async function productenVan(gids: (string | undefined)[]): Promise<Product[]> {
  const producten = await catalog.getProductsByIds(gids.filter((g): g is string => Boolean(g)).map(kortId));
  return uniek(producten, (p) => p.id);
}

/* ---------------- suggesties in het zoekveld ---------------- */

/** Wat het paneel van een product toont: niet de hele kaart naar de browser. */
export type Productsuggestie = Pick<CardProduct, "id" | "slug" | "title" | "brand" | "type" | "image" | "pricing" | "price" | "fromPrice">;

export type Zoeksuggesties = {
  products: Productsuggestie[];
  categories: Categoriesuggestie[];
  pages: Paginasuggestie[];
  /** Zoektermen die Shopify voorstelt (uit de catalogus en uit wat klanten zochten). */
  queries: string[];
};

type RawVoorspel = {
  predictiveSearch: {
    products: { id: string }[];
    collections: { handle: string }[];
    pages: { handle: string; title: string }[];
    queries: { text: string }[];
  } | null;
};

/** Suggesties tijdens het typen (Shopify Predictive Search). Gooit een fout als Shopify niet antwoordt. */
export async function zoekSuggesties(q: string, opties: StorefrontOpties = {}): Promise<Zoeksuggesties> {
  const { predictiveSearch: r } = await storefront<RawVoorspel>(VOORSPEL, { q }, { timeoutMs: TIMEOUT_MS, ...opties });
  if (!r) return { products: [], categories: [], pages: [], queries: [] };
  const tree = await catalog.getTree();
  const producten = await productenVan(r.products.map((p) => p.id));
  return {
    products: producten.slice(0, MAX_SUGGESTIES).map((p) => {
      const { id, slug, title, brand, type, image, pricing, price, fromPrice } = kaartVan(p);
      return { id, slug, title, brand, type, image, pricing, price, fromPrice };
    }),
    categories: uniek(r.collections.map((c) => categorieVanCollectie(tree, c.handle)), (c) => c.id).slice(0, MAX_SUGGESTIES),
    pages: uniek(r.pages.map((p) => paginaVanShopify(p.handle, p.title)), (p) => p.href).slice(0, 4),
    queries: uniek(r.queries.map((s) => s.text.trim()), (s) => s.toLowerCase()).filter((s) => s.toLowerCase() !== q.toLowerCase()).slice(0, 5),
  };
}

/* ---------------- filters ---------------- */

/**
 * Standaardfilters van Shopify. De winkel staat in het Engels, dus Shopify noemt ze "Price" en
 * "Availability"; filters op een metafield of optie dragen de naam uit Search & Discovery.
 */
const STANDAARD: Record<string, { key: string; label: string; waarden?: Record<string, string> }> = {
  "filter.v.price": { key: "prijs", label: "Prijs" },
  "filter.v.availability": { key: "beschikbaarheid", label: "Beschikbaarheid", waarden: { "1": "Op voorraad", "0": "Niet op voorraad" } },
  "filter.p.vendor": { key: "merk", label: "Merk" },
  "filter.p.product_type": { key: "type", label: "Type" },
};

/** Parameters van de zoekpagina die geen filter zijn. */
const GEEN_FILTER = new Set(["q", "sorteer", "pagina"]);

type Bron = {
  id: string;
  /** De URL-parameter: het laatste deel van het Shopify-ID (filter.p.m.brunic.kleurfamilie → kleurfamilie). */
  key: string;
  label: string;
  type: RawFilter["type"];
  /** Waarde-ID (in de URL) → label en de invoer die Shopify voor die waarde verwacht. */
  waarden: Map<string, { label: string; input: ProductFilter }>;
};

const waardeSleutel = (f: RawFilter, v: RawWaarde) => waardeId(v.id.startsWith(`${f.id}.`) ? v.id.slice(f.id.length + 1) : v.label) || waardeId(v.label);

function invoer(input: unknown): ProductFilter | undefined {
  try {
    const v = typeof input === "string" ? (JSON.parse(input) as unknown) : input;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as ProductFilter) : undefined;
  } catch {
    return undefined;
  }
}

/** De filters van Shopify, elk met zijn URL-parameter. Botst een naam, dan het volledige ID. */
function bronnenVan(filters: RawFilter[]): Bron[] {
  const gebruikt = new Set(GEEN_FILTER);
  return filters.map((f) => {
    const vast = STANDAARD[f.id];
    let key = vast?.key ?? waardeId(f.id.split(".").pop() ?? f.id);
    if (!key || gebruikt.has(key)) key = waardeId(f.id.replace(/^filter\./, ""));
    gebruikt.add(key);
    const waarden: Bron["waarden"] = new Map();
    for (const v of f.values) {
      const input = invoer(v.input);
      const id = waardeSleutel(f, v);
      if (input && !waarden.has(id)) waarden.set(id, { label: vast?.waarden?.[id] ?? v.label, input });
    }
    return { id: f.id, key, label: vast?.label ?? f.label, type: f.type, waarden };
  });
}

/** Prijsklasse van de site → het prijsbereik voor Shopify (beide grenzen inbegrepen). "Op aanvraag" staat in Shopify als € 0. */
function prijsBereik(b: Bucket): { min: number; max?: number } {
  if (Number.isNaN(b.min)) return { min: 0, max: 0 };
  return { min: Math.max(b.min, 0.01), ...(Number.isFinite(b.max) ? { max: b.max - 0.01 } : {}) };
}

/** De keuze uit de URL, enkel met filters en waarden die Shopify voor deze zoekterm kent. */
function leesKeuze(params: URLSearchParams, bronnen: Bron[]): { selection: Selection; inputs: ProductFilter[]; prijs?: Bucket } {
  const selection: Selection = {};
  const inputs: ProductFilter[] = [];
  let prijs: Bucket | undefined;
  for (const b of bronnen) {
    const gevraagd = [...new Set((params.get(b.key) ?? "").split(",").map(waardeId).filter(Boolean))];
    if (gevraagd.length === 0) continue;
    if (b.type === "PRICE_RANGE") {
      // Shopify kent één prijsbereik: bij meerdere telt enkel het eerste.
      prijs = PRICE_BUCKETS.find((k) => k.value === gevraagd[0]);
      if (prijs) selection[b.key] = [prijs.value];
      continue;
    }
    const geldig = gevraagd.filter((id) => b.waarden.has(id));
    if (geldig.length === 0) continue;
    selection[b.key] = geldig;
    inputs.push(...geldig.map((id) => b.waarden.get(id)!.input));
  }
  return { selection, inputs, prijs };
}

/**
 * De filtergroepen voor de lijst, in de volgorde van Search & Discovery. Een waarde zonder
 * resultaten verdwijnt, een gekozen waarde blijft staan. Een filter verschijnt enkel als hij de
 * lijst kan verkleinen (minstens twee waarden): zo valt "Beschikbaarheid" weg zolang Shopify geen
 * voorraad volgt en alles "op voorraad" staat.
 */
function bouwGroepen(filters: RawFilter[], bronnen: Bron[], selection: Selection, klasseHeeftResultaten: boolean[]): FacetGroup[] {
  const groepen: FacetGroup[] = [];
  for (const f of filters) {
    const bron = bronnen.find((b) => b.id === f.id);
    if (!bron) continue;
    const gekozen = selection[bron.key] ?? [];
    let options: FacetOption[];
    if (f.type === "PRICE_RANGE") {
      options = PRICE_BUCKETS.filter((k, i) => klasseHeeftResultaten[i] || gekozen.includes(k.value)).map((k) => ({ value: k.value, label: k.label }));
    } else {
      options = f.values
        .map((v) => ({ v, id: waardeSleutel(f, v) }))
        .filter(({ v, id }) => bron.waarden.has(id) && (v.count > 0 || gekozen.includes(id)))
        .map(({ v, id }) => {
          const label = bron.waarden.get(id)!.label;
          const swatch = v.swatch?.color ?? SWATCH_COLORS[label];
          return { value: id, label, ...(swatch ? { swatch } : {}) };
        });
      // Een gekozen waarde die Shopify bij deze combinatie niet meer teruggeeft, blijft afvinkbaar.
      for (const id of gekozen) if (!options.some((o) => o.value === id)) options.push({ value: id, label: bron.waarden.get(id)?.label ?? id });
    }
    if (options.length < 2 && gekozen.length === 0) continue;
    if (f.type === "PRICE_RANGE") {
      groepen.push({ def: { key: bron.key, label: bron.label, kind: "bucket", buckets: PRICE_BUCKETS, enkel: true }, options });
      continue;
    }
    // Kleurbolletjes enkel als elke waarde een kleur is: "Naturel" bij Materiaal is er geen.
    const kleuren = options.every((o) => o.swatch);
    groepen.push({
      def: { key: bron.key, label: bron.label, kind: kleuren ? "swatch" : "list" },
      options: kleuren ? options : options.map(({ value, label }) => ({ value, label })),
    });
  }
  return groepen;
}

/* ---------------- resultaten ---------------- */

type Fase = { filters: ProductFilter[]; sortKey: "RELEVANCE" | "PRICE"; reverse: boolean };

/**
 * Haalt producten op tot er `nodig` zijn of tot Shopify er geen meer heeft, met de paginering van
 * Shopify (cursor). `volledig`: alle resultaten zijn opgehaald. `afgekapt`: Shopify stopte bij zijn
 * maximum, er bestaan dus mogelijk meer resultaten dan hij geeft.
 */
async function haalProducten(q: string, fasen: Fase[], nodig: number, opties: StorefrontOpties): Promise<{ producten: Product[]; volledig: boolean; afgekapt: boolean }> {
  const producten: Product[] = [];
  const gezien = new Set<string>();
  let afgekapt = false;
  let verzoeken = 0;
  for (const [i, fase] of fasen.entries()) {
    // Een volgende fase enkel als er nog producten nodig zijn, of als ze het totaal goedkoop compleet maakt.
    if (i > 0 && producten.length >= nodig && verzoeken >= 2) return { producten, volledig: false, afgekapt };
    let after: string | null = null;
    do {
      const { search }: { search: RawZoek } = await storefront<{ search: RawZoek }>(
        IDS,
        { q, first: PER_VERZOEK, after, filters: fase.filters, sortKey: fase.sortKey, reverse: fase.reverse },
        opties,
      );
      verzoeken++;
      if (search.totalCount >= MAX_SHOPIFY) afgekapt = true;
      for (const p of await productenVan(search.nodes.map((n) => n.id))) {
        if (gezien.has(p.id)) continue;
        gezien.add(p.id);
        producten.push(p);
      }
      after = search.pageInfo.hasNextPage ? search.pageInfo.endCursor : null;
    } while (after && producten.length < nodig);
    if (after) return { producten, volledig: false, afgekapt };
  }
  return { producten, volledig: true, afgekapt };
}

export type Zoekresultaat = {
  listing: ListingData;
  /** Is er een filter gekozen? Zonder producten toont de pagina dan de lijst (met "filters wissen") en niet de lege staat. */
  gefilterd: boolean;
  categories: Categoriesuggestie[];
  pages: Paginasuggestie[];
};

type RawOverig = { predictiveSearch: { collections: { handle: string }[] } | null; search: { nodes: { handle?: string; title?: string }[] } };

/** Categorieën en pagina's bij de zoekterm. Bijzaak: lukt dit niet, dan toont de pagina gewoon de producten. */
async function zoekOverig(q: string, opties: StorefrontOpties): Promise<Pick<Zoekresultaat, "categories" | "pages">> {
  try {
    const [r, tree] = await Promise.all([storefront<RawOverig>(OVERIG, { q }, opties), catalog.getTree()]);
    return {
      categories: uniek((r.predictiveSearch?.collections ?? []).map((c) => categorieVanCollectie(tree, c.handle)), (c) => c.id),
      pages: uniek(r.search.nodes.map((p) => (p.handle ? paginaVanShopify(p.handle, p.title ?? p.handle) : undefined)), (p) => p.href),
    };
  } catch (e) {
    console.warn("[zoeken] categorieën en pagina's niet opgehaald:", (e as Error).message);
    return { categories: [], pages: [] };
  }
}

/**
 * De zoekresultaten voor /zoeken: zoekterm, filters, sortering en pagina uit de URL. Gooit een fout
 * als Shopify niet antwoordt; de pagina toont dan een foutmelding.
 *
 * Verzoeken naar Shopify: staat er een mogelijke filter in de URL, dan eerst de filters van de
 * zoekterm (de URL bevat waarde-ID's, Shopify verwacht zijn eigen invoer per waarde). Daarna
 * tegelijk: de product-ID's, de filters bij de keuze, en de categorieën en pagina's.
 */
export async function zoekResultaten(q: string, searchParams: SearchParamsRecord, opties: StorefrontOpties = {}): Promise<Zoekresultaat> {
  const o: StorefrontOpties = { timeoutMs: TIMEOUT_MS, ...opties };
  const params = toUrlParams(searchParams);
  const sort = ZOEK_SORTERINGEN.find((s) => s.value === params.get("sorteer"))?.value ?? ZOEK_SORTERINGEN[0].value;
  const page = Math.min(MAX_PAGINA, Math.max(1, Number.parseInt(params.get("pagina") ?? "1", 10) || 1));

  const overig = zoekOverig(q, o);
  const kanFilterZijn = [...params.keys()].some((k) => !GEEN_FILTER.has(k));
  const basis = kanFilterZijn ? bronnenVan((await storefront<{ search: { productFilters: RawFilter[] } }>(BASIS, { q }, o)).search.productFilters) : [];
  const { selection, inputs, prijs } = leesKeuze(params, basis);
  const alle = prijs ? [...inputs, { price: prijsBereik(prijs) }] : inputs;

  // Prijs oplopend: Shopify zet producten op aanvraag (€ 0) vooraan. Op de site staan die bij een
  // prijssortering achteraan (zoals op elke lijst), dus eerst de producten met een prijs, dan de rest.
  // Beide delen sorteert en pagineert Shopify zelf.
  const fasen: Fase[] =
    sort === "prijs-af"
      ? [{ filters: alle, sortKey: "PRICE", reverse: true }]
      : sort === "prijs-op"
        ? prijs
          ? [{ filters: alle, sortKey: "PRICE", reverse: false }]
          : [
              { filters: [...inputs, { price: { min: 0.01 } }], sortKey: "PRICE", reverse: false },
              { filters: [...inputs, { price: { min: 0, max: 0 } }], sortKey: "RELEVANCE", reverse: false },
            ]
        : [{ filters: alle, sortKey: "RELEVANCE", reverse: false }];

  const klassen = Object.fromEntries(PRICE_BUCKETS.map((k, i) => [`p${i}`, [...inputs, { price: prijsBereik(k) }]]));
  type RawFacetten = { search: { productFilters: RawFilter[] } } & Record<string, { totalCount: number }>;
  // Eén kaart meer dan getoond: zo weten we zeker of er nog een volgende is.
  const [gevonden, facetten, rest] = await Promise.all([
    haalProducten(q, fasen, page * PAGE_SIZE + 1, o),
    storefront<RawFacetten>(FACETTEN, { q, filters: alle, ...klassen }, o),
    overig,
  ]);

  const filters = facetten.search.productFilters;
  const bronnen = basis.length ? basis : bronnenVan(filters);
  const items = gevonden.producten.slice(0, page * PAGE_SIZE).map(kaartVan);
  const meer = gevonden.producten.length > items.length;
  return {
    listing: {
      items,
      total: gevonden.volledig && !gevonden.afgekapt ? gevonden.producten.length : null,
      // Voorbij de laatste pagina die Shopify kan geven is er geen "meer tonen".
      hasMore: meer && page < MAX_PAGINA,
      afgekapt: gevonden.afgekapt || (meer && page >= MAX_PAGINA),
      groups: bouwGroepen(filters, bronnen, selection, PRICE_BUCKETS.map((_, i) => (facetten[`p${i}`]?.totalCount ?? 0) > 0)),
      state: { selection, sort, offersOnly: false, page },
      hasOffers: false,
      sorts: ZOEK_SORTERINGEN,
    },
    gefilterd: Object.keys(selection).length > 0,
    ...rest,
  };
}
