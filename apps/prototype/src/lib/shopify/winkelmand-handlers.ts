import { createCartCookie, createShopifyRouteHandler, parseCartRequest, type CartData, type ShopifyRouteHandlerContext, type ShopifyRouteHandlerResult, type StorefrontClient } from "@shopify/hydrogen";
import { GELDIG_VARIANT_ID, MAX_AANTAL, MAX_REGELS, nietTeKoop, nietTeKoopMelding } from "./etalage";
import { meld } from "@/lib/melding";

/**
 * /api/cart — de Shopify-winkelmand (Storefront Cart API), geregistreerd bij handleShopifyRoutes
 * (src/proxy.ts). De aanvragen lopen via Shopify's aanvraag-gebonden client: die stuurt de
 * cookies van de bezoeker mee en neemt Shopify's cookies over, zodat de kassa dezelfde sessie en
 * toestemming kent.
 *
 * Eigen queries in plaats van Shopify's kant-en-klare handlers (createCartServerHandlers): die
 * vragen altijd `sellingPlanAllocation` op, en daarvoor heeft de token van deze winkel geen recht
 * (unauthenticated_read_selling_plans). Abonnementen verkoopt Brunic niet.
 *
 * Bewust smal:
 * - enkel JSON van onze eigen winkelmand (lib/store/shopify-cart.ts);
 * - enkel regels toevoegen, wijzigen en verwijderen — kortingscodes en notities lopen via de kassa;
 * - de mand is die uit de `cart`-cookie van de bezoeker, geen andere;
 * - de kassa-URL zit niet in het antwoord: die geeft enkel /api/kassa, na een nieuwe controle.
 *   Samen met de controle bij elk toevoegen komt een etalageproduct zo nooit in de kassa.
 */

type Ctx = Omit<ShopifyRouteHandlerContext, "sessionManager">;

const MAND = /* GraphQL */ `
  fragment Mand on Cart {
    id
    updatedAt
    totalQuantity
    attributes { key value }
    discountCodes { applicable code }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      checkoutChargeAmount { amount currencyCode }
    }
    lines(first: 250) {
      nodes {
        id
        quantity
        cost {
          totalAmount { amount currencyCode }
          subtotalAmount { amount currencyCode }
          amountPerQuantity { amount currencyCode }
          compareAtAmountPerQuantity { amount currencyCode }
        }
        merchandise { ... on ProductVariant { id title sku product { id title handle vendor productType } } }
      }
    }
  }
`;
const CONTEXT = "$country: CountryCode, $language: LanguageCode";
const IN_CONTEXT = "@inContext(country: $country, language: $language)";

const LEES = `query Mand($id: ID!, ${CONTEXT}) ${IN_CONTEXT} { cart(id: $id) { ...Mand } } ${MAND}`;
const MAAK = `mutation MandMaak($input: CartInput!, ${CONTEXT}) ${IN_CONTEXT} { cartCreate(input: $input) { cart { ...Mand } userErrors { code field message } } } ${MAND}`;
const VOEG_TOE = `mutation MandVoegToe($cartId: ID!, $lines: [CartLineInput!]!, ${CONTEXT}) ${IN_CONTEXT} { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...Mand } userErrors { code field message } } } ${MAND}`;
const WIJZIG = `mutation MandWijzig($cartId: ID!, $lines: [CartLineUpdateInput!]!, ${CONTEXT}) ${IN_CONTEXT} { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...Mand } userErrors { code field message } } } ${MAND}`;
const VERWIJDER = `mutation MandVerwijder($cartId: ID!, $lineIds: [ID!]!, ${CONTEXT}) ${IN_CONTEXT} { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...Mand } userErrors { code field message } } } ${MAND}`;

type UserError = { code?: string | null; field?: string[] | null; message: string };
type Uitkomst = { cart: CartData | null; userErrors: UserError[] };

/** Voert een query uit met Shopify's aanvraag-gebonden client; GraphQL-fouten worden een exception. */
async function vraag<T>(client: StorefrontClient, doc: string, variables: Record<string, unknown>): Promise<T> {
  const graphql = client.graphql as unknown as (doc: string, opties: { variables: Record<string, unknown> }) => Promise<{ data?: T | null; errors?: { message: string }[] }>;
  const res = await graphql(doc, { variables });
  if (res.errors?.length || !res.data) throw new Error(res.errors?.map((e) => e.message).join("; ") || "Geen antwoord van de Storefront API");
  return res.data;
}

const CART_GID = "gid://shopify/Cart/";
/** De mand van de bezoeker: uit de `cart`-cookie (de token zonder GID-voorvoegsel), nergens anders. */
function cartIdUitCookie(request: Request): string | null {
  const m = /(?:^|;\s*)cart=([^;]*)/.exec(request.headers.get("cookie") ?? "");
  if (!m?.[1]) return null;
  try {
    const token = decodeURIComponent(m[1]);
    return token ? (token.startsWith(CART_GID) ? token : CART_GID + token) : null;
  } catch {
    return null;
  }
}

const VERLOPEN_COOKIE = "cart=; Path=/; SameSite=Lax; Max-Age=0";
const kop = (cookie?: string) => {
  const h = new Headers({ "Cache-Control": "private, no-store, max-age=0, must-revalidate" });
  if (cookie) h.append("set-cookie", cookie);
  return h;
};

const KASSA = `query MandKassa($id: ID!, ${CONTEXT}) ${IN_CONTEXT} { cart(id: $id) { id checkoutUrl lines(first: 250) { nodes { quantity merchandise { ... on ProductVariant { id } } } } } }`;

/**
 * De mand van de bezoeker mét kassa-URL, enkel voor /api/kassa (die elke regel opnieuw
 * controleert vóór ze de URL doorgeeft). null = geen mand of ze bestaat niet meer.
 */
export async function mandVoorKassa(request: Request, client: StorefrontClient): Promise<{ id: string; checkoutUrl: string | null; regels: { variantId: string; quantity: number }[] } | null> {
  const id = cartIdUitCookie(request);
  if (!id) return null;
  const { cart } = await vraag<{ cart: { id: string; checkoutUrl: string | null; lines: { nodes: { quantity: number; merchandise: { id?: string } | null }[] } } | null }>(client, KASSA, { id });
  if (!cart) return null;
  return { id: cart.id, checkoutUrl: cart.checkoutUrl, regels: cart.lines.nodes.flatMap((l) => (l.merchandise?.id ? [{ variantId: l.merchandise.id, quantity: l.quantity }] : [])) };
}

const fout = (code: string, message: string, status = 400): ShopifyRouteHandlerResult => ({ type: "error", status, error: { code, message }, headers: kop() });
const ONGELDIG = () => fout("invalid_cart_request", "Ongeldige winkelmandaanvraag.");

export const winkelmandHandlers = {
  get: createShopifyRouteHandler("/api/cart", "GET", async ({ request, storefrontClient }: Ctx) => {
    const id = cartIdUitCookie(request);
    if (!id) return { type: "json", data: { cart: null }, headers: kop() };
    const { cart } = await vraag<{ cart: CartData | null }>(storefrontClient, LEES, { id });
    // Afgerekend of vervallen: de cookie wijst nergens meer naar.
    return { type: "json", data: { cart }, headers: kop(cart ? undefined : VERLOPEN_COOKIE) };
  }),

  post: createShopifyRouteHandler("/api/cart", "POST", async ({ request, storefrontClient }: Ctx) => {
    if (!request.headers.get("content-type")?.includes("application/json")) return fout("invalid_cart_request", "Enkel JSON.", 415);

    let parsed: Awaited<ReturnType<typeof parseCartRequest>>;
    try {
      parsed = await parseCartRequest(request);
    } catch {
      return ONGELDIG();
    }
    const { action } = parsed;
    // De mand hoort bij de cookie van de bezoeker; een andere cart aanwijzen kan niet.
    if (parsed.cartId !== null) return ONGELDIG();
    if (action.intent !== "add" && action.intent !== "update" && action.intent !== "remove") return fout("invalid_cart_request", "Deze wijziging loopt via de kassa.");

    if (action.intent !== "remove") {
      if (action.lines.length > MAX_REGELS) return fout("te_veel_regels", `Uw winkelmand kan maximaal ${MAX_REGELS} regels bevatten.`);
      if (action.lines.some((l) => l.quantity < 1 || l.quantity > MAX_AANTAL)) return fout("te_veel", `U kunt maximaal ${MAX_AANTAL} stuks per product online bestellen.`);
      if (action.lines.some((l) => l.attributes?.length || l.sellingPlanId)) return ONGELDIG();

      // Elke variant die in de mand komt (nieuw of gewisseld) moet online te koop zijn.
      const ids = action.lines.map((l) => l.merchandiseId).filter((id): id is string => Boolean(id));
      if (ids.some((id) => !GELDIG_VARIANT_ID.test(id))) return ONGELDIG();
      if (ids.length > 0) {
        try {
          const geweigerd = await nietTeKoop(ids);
          if (geweigerd.length > 0) return fout("niet_te_koop", nietTeKoopMelding(geweigerd), 409);
        } catch (e) {
          // Zonder controle geen toevoeging: liever even geen mand dan een etalageproduct in de kassa.
          meld("winkelmand", "Controle op etalageproducten mislukt — toevoegen aan de winkelmand geweigerd", { fout: (e as Error).message });
          return fout("controle_mislukt", "De winkelmand is even niet bereikbaar. Probeer het zo meteen opnieuw of bel ons.", 502);
        }
      }
    }

    const cartId = cartIdUitCookie(request);
    let uitkomst: Uitkomst | null = null;
    let nieuweCookie: string | undefined;

    if (action.intent === "add") {
      const lines = action.lines.map((l) => ({ merchandiseId: l.merchandiseId, quantity: l.quantity }));
      if (cartId) uitkomst = (await vraag<{ cartLinesAdd: Uitkomst | null }>(storefrontClient, VOEG_TOE, { cartId, lines })).cartLinesAdd;
      // Geen mand, of de mand uit de cookie bestaat niet meer (afgerekend, vervallen): een nieuwe.
      if (!uitkomst?.cart) {
        uitkomst = (await vraag<{ cartCreate: Uitkomst | null }>(storefrontClient, MAAK, { input: { lines, buyerIdentity: { countryCode: "BE" } } })).cartCreate;
        if (uitkomst?.cart?.id) nieuweCookie = createCartCookie(uitkomst.cart.id);
      }
    } else {
      if (!cartId) return fout("missing_cart", "Er is nog geen winkelmand.");
      uitkomst =
        action.intent === "update"
          ? (await vraag<{ cartLinesUpdate: Uitkomst | null }>(storefrontClient, WIJZIG, { cartId, lines: action.lines.map((l) => ({ id: l.id, quantity: l.quantity })) })).cartLinesUpdate
          : (await vraag<{ cartLinesRemove: Uitkomst | null }>(storefrontClient, VERWIJDER, { cartId, lineIds: action.lineIds })).cartLinesRemove;
    }

    if (!uitkomst) throw new Error("Lege uitkomst van de winkelmandmutatie");
    return { type: "json", data: { cart: uitkomst.cart, userErrors: uitkomst.userErrors }, headers: kop(nieuweCookie) };
  }),
};
