import { NextResponse } from "next/server";
import { storefront } from "@/lib/shopify/storefront";
import { GELDIG_VARIANT_ID, MAX_AANTAL, MAX_REGELS, nietTeKoop, nietTeKoopMelding, variantGid } from "@/lib/shopify/etalage";
import { SHOPIFY_WINKELMAND, shopifyContext } from "@/lib/shopify/hydrogen";
import { mandVoorKassa } from "@/lib/shopify/winkelmand-handlers";
import { meld } from "@/lib/melding";

/**
 * Winkelmand → Shopify-kassa. De winkelmand leeft lokaal in de browser; bij "Afrekenen"
 * maken we hier een Shopify-cart aan en sturen we de klant naar de beveiligde, door
 * Shopify gehoste kassa (levering/afhalen, betaling, bevestiging).
 *
 * Bewaking (de enige afscherming van etalageproducten, zie packages/catalog/README.md): Shopify zelf beschermt niet tegen
 * een etalageproduct met prijs € 0. Daarom controleren we LIVE per variant: niet
 * `brunic.etalage = true`, prijs > 0 en `availableForSale`. Faalt één regel, dan geen kassa.
 *
 * GET ?cart=<id>: is die Shopify-cart afgerekend? Een afgeronde (of vervallen) cart geeft
 * Shopify niet meer terug; de browser maakt dan de lokale winkelmand leeg (kassa-opvolging.tsx).
 */

type Regel = { variantId: string; quantity: number };

const MAAK_CART = /* GraphQL */ `
  mutation MaakCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl }
      userErrors { message }
    }
  }
`;

const CART_STATUS = /* GraphQL */ `
  query CartStatus($id: ID!) {
    cart(id: $id) { id }
  }
`;

const KASSA_FOUT = "De kassa is even niet bereikbaar. Probeer het zo meteen opnieuw of bel ons.";

/**
 * Met de Shopify-winkelmand (lib/store/shopify-cart.ts) bestaat de cart al: ze staat in de
 * `cart`-cookie van de bezoeker. We lezen ze met de cookies van de bezoeker erbij, zodat de
 * kassa-URL dezelfde sessie en toestemming draagt, controleren elke regel opnieuw (een product
 * kan sinds het toevoegen etalage of uitverkocht geworden zijn) en geven dan pas de kassa-URL.
 */
async function kassaVanShopifyCart(req: Request) {
  try {
    const { requestContext, storefrontClient } = shopifyContext(req);
    const cart = await mandVoorKassa(req, storefrontClient);
    const regels = cart?.regels ?? [];
    if (!cart || regels.length === 0) return NextResponse.json({ error: "Uw winkelmand is leeg." }, { status: 400 });
    if (regels.length > MAX_REGELS) return NextResponse.json({ error: `Uw winkelmand telt meer dan ${MAX_REGELS} regels. Reken in twee keer af of bel ons.` }, { status: 400 });
    if (regels.some((l) => l.quantity < 1 || l.quantity > MAX_AANTAL)) {
      return NextResponse.json({ error: `Eén of meer regels in uw winkelmand hebben een ongeldige hoeveelheid. Pas de hoeveelheid aan (max. ${MAX_AANTAL}) en probeer opnieuw.` }, { status: 400 });
    }
    const geweigerd = await nietTeKoop(regels.map((l) => l.variantId));
    if (geweigerd.length > 0) return NextResponse.json({ error: nietTeKoopMelding(geweigerd) }, { status: 409 });
    if (!cart.checkoutUrl) throw new Error("Geen kassa-URL");

    const res = NextResponse.json({ checkoutUrl: cart.checkoutUrl, cartId: cart.id }, { headers: { "Cache-Control": "no-store" } });
    requestContext.applyResponseHeaders(res.headers);
    return res;
  } catch (e) {
    meld("kassa", "Shopify-cart ophalen mislukt — klanten kunnen niet afrekenen", { fout: (e as Error).message });
    return NextResponse.json({ error: KASSA_FOUT }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (SHOPIFY_WINKELMAND) return kassaVanShopifyCart(req);

  const body = (await req.json().catch(() => null)) as { lines?: unknown } | null;
  const ruw = Array.isArray(body?.lines) ? (body.lines as Partial<Regel>[]) : [];
  if (ruw.length === 0) return NextResponse.json({ error: "Uw winkelmand is leeg." }, { status: 400 });
  if (ruw.length > 100) return NextResponse.json({ error: "Uw winkelmand telt meer dan 100 regels. Reken in twee keer af of bel ons." }, { status: 400 });

  // Een ongeldige regel nooit stil laten vallen: dan zou de klant minder afrekenen dan hij denkt.
  const ongeldig = ruw.filter(
    (l) => typeof l?.variantId !== "string" || !GELDIG_VARIANT_ID.test(l.variantId) || !Number.isInteger(l.quantity) || l.quantity! < 1 || l.quantity! > MAX_AANTAL,
  );
  if (ongeldig.length > 0) {
    return NextResponse.json(
      { error: "Eén of meer regels in uw winkelmand hebben een ongeldige hoeveelheid. Pas de hoeveelheid aan (hele aantallen, max. 500) en probeer opnieuw." },
      { status: 400 },
    );
  }
  const lines = ruw as Regel[];

  try {
    const geweigerd = await nietTeKoop(lines.map((l) => l.variantId));
    if (geweigerd.length > 0) return NextResponse.json({ error: nietTeKoopMelding(geweigerd) }, { status: 409 });

    const data = await storefront<{ cartCreate: { cart: { id: string; checkoutUrl: string } | null; userErrors: { message: string }[] } }>(MAAK_CART, {
      input: {
        lines: lines.map((l) => ({ merchandiseId: variantGid(l.variantId), quantity: l.quantity })),
        buyerIdentity: { countryCode: "BE" },
      },
    });
    const cart = data.cartCreate.cart;
    if (!cart?.checkoutUrl) throw new Error(data.cartCreate.userErrors.map((e) => e.message).join("; ") || "Geen kassa-URL");
    return NextResponse.json({ checkoutUrl: cart.checkoutUrl, cartId: cart.id });
  } catch (e) {
    meld("kassa", "Shopify-cart aanmaken mislukt — klanten kunnen niet afrekenen", { regels: lines.length, fout: (e as Error).message });
    return NextResponse.json({ error: KASSA_FOUT }, { status: 502 });
  }
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("cart") ?? "";
  if (!/^gid:\/\/shopify\/Cart\/[A-Za-z0-9?=&_-]+$/.test(id)) return NextResponse.json({ error: "Ongeldig cart-ID." }, { status: 400 });
  try {
    const { cart } = await storefront<{ cart: { id: string } | null }>(CART_STATUS, { id });
    return NextResponse.json({ status: cart ? "open" : "afgerond" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.warn("[kassa] cart-status niet op te vragen:", (e as Error).message);
    return NextResponse.json({ status: "onbekend" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
