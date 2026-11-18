"use client";

import { createEmptyCartErrors, EMPTY_CART_DATA, type CartData, type CartState } from "@shopify/hydrogen";
import { useSyncExternalStore } from "react";
import type { CartLine } from "@/lib/catalog/types";

/**
 * De winkelmand in Shopify (Storefront Cart API) — de bron van waarheid, zoals bij elke
 * Shopify-winkel. De browser praat enkel met onze eigen route /api/cart
 * (lib/shopify/winkelmand-handlers.ts); die bewaakt de etalageproducten en zet de `cart`-cookie.
 *
 * Hoe het werkt:
 * - Elke wijziging is een doel per variant ("variant X moet op 3 staan"), geen optelling. Het
 *   scherm toont dat doel meteen; op de achtergrond gaat één verzoek tegelijk naar Shopify.
 *   Meerdere klikken op dezelfde variant vallen samen tot het laatste doel: niets telt dubbel.
 * - Weigert Shopify of valt de verbinding weg, dan valt het scherm terug op wat Shopify
 *   bevestigde en verschijnt een melding. Er wordt niet vanzelf opnieuw geprobeerd.
 * - Metingen (toegevoegd/verwijderd) leidt Shopify's tracker af uit de bevestigde mand
 *   (`analyticsStore`), nooit uit wat het scherm al vooruit toont.
 *
 * Deze store hangt niet af van Shopify's scripts: de mand werkt ook met een adblocker.
 */

const EINDPUNT = "/api/cart";
const kortId = (gid: string) => gid.split("/").pop() ?? gid;
const variantGid = (id: string) => (id.startsWith("gid://") ? id : `gid://shopify/ProductVariant/${id}`);

type Toestand = {
  /** Wat Shopify het laatst bevestigde; null = (nog) geen mand. */
  cart: CartData | null;
  /** Eerste keer geladen (of dat mislukte: dan is de mand leeg met een melding). */
  geladen: boolean;
  /** Doelhoeveelheid per variant (kort ID) die nog niet bevestigd is. 0 = verwijderen. */
  doelen: ReadonlyMap<string, { productId: string; quantity: number }>;
  bezig: boolean;
  fout: string;
};

let toestand: Toestand = { cart: null, geladen: false, doelen: new Map(), bezig: false, fout: "" };
const luisteraars = new Set<() => void>();
/** Luisteraars van Shopify's cart-tracker: krijgen de toestand in Shopify's vorm. */
const analyticsLuisteraars = new Set<(state: CartState) => void>();

function zet(deel: Partial<Toestand>) {
  const bevestigdGewijzigd = "cart" in deel || "bezig" in deel;
  toestand = { ...toestand, ...deel };
  regelsCache = null;
  luisteraars.forEach((l) => l());
  if (bevestigdGewijzigd) {
    const state = analyticsState();
    analyticsLuisteraars.forEach((l) => l(state));
  }
}

/* ---------------- regels zoals de site ze kent ---------------- */

let regelsCache: CartLine[] | null = null;
const LEEG: CartLine[] = [];

function regels(): CartLine[] {
  if (regelsCache) return regelsCache;
  const uit: CartLine[] = [];
  const gezien = new Set<string>();
  for (const line of toestand.cart?.lines.nodes ?? []) {
    if (!line.merchandise) continue;
    const variantId = kortId(line.merchandise.id);
    gezien.add(variantId);
    const doel = toestand.doelen.get(variantId);
    const quantity = doel ? doel.quantity : line.quantity;
    const productId = typeof line.merchandise.product.id === "string" ? kortId(line.merchandise.product.id) : (doel?.productId ?? "");
    if (quantity > 0) uit.push({ productId, variantId, quantity });
  }
  // Nieuwe regels die Shopify nog niet bevestigde.
  for (const [variantId, doel] of toestand.doelen) if (!gezien.has(variantId) && doel.quantity > 0) uit.push({ productId: doel.productId, variantId, quantity: doel.quantity });
  regelsCache = uit.length ? uit : LEEG;
  return regelsCache;
}

/* ---------------- verkeer met /api/cart ---------------- */

type Antwoord = { cart?: CartData | null; userErrors?: { message: string }[]; error?: { code?: string; message?: string } };

/** De `cart`-cookie wijst naar een mand die niet meer bestaat (afgerekend of vervallen): weg ermee, de volgende toevoeging maakt een nieuwe. */
function wisCartCookie() {
  try {
    document.cookie = "cart=; Path=/; SameSite=Lax; Max-Age=0";
  } catch {
    /* cookies geblokkeerd: dan was er ook geen */
  }
}

/**
 * Eenmalig: wie nog een mand uit de vorige opzet heeft (lokaal bewaard, lib/store/stores.ts),
 * krijgt die regels in zijn Shopify-mand. Wat niet online te koop is, weigert de server.
 */
const OUDE_SLEUTEL = "brunic:winkelmand:v1";
function neemLokaleMandOver() {
  try {
    const ruw = window.localStorage.getItem(OUDE_SLEUTEL);
    if (!ruw) return;
    window.localStorage.removeItem(OUDE_SLEUTEL);
    const oud = JSON.parse(ruw) as unknown;
    if (!Array.isArray(oud)) return;
    for (const l of oud.slice(0, 100)) {
      if (l && typeof l.productId === "string" && typeof l.variantId === "string" && typeof l.quantity === "number" && l.quantity >= 1) {
        zetDoel(l.productId, l.variantId, Math.round(l.quantity));
      }
    }
  } catch {
    /* geen lokale opslag: niets over te nemen */
  }
}

async function laad(): Promise<void> {
  try {
    const res = await fetch(EINDPUNT, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as Antwoord;
    if (!data.cart) wisCartCookie();
    zet({ cart: data.cart ?? null, geladen: true });
    if (!data.cart) neemLokaleMandOver();
  } catch {
    // Onbereikbaar: de site blijft bruikbaar; bij de volgende wijziging of terugkeer proberen we opnieuw.
    zet({ geladen: true });
  }
}

let gestart = false;
function start() {
  if (gestart || typeof window === "undefined") return;
  gestart = true;
  void laad();
  // Terug op het tabblad of terug uit de kassa: de mand kan intussen afgerekend of elders gewijzigd zijn.
  const opnieuw = () => {
    if (document.visibilityState === "visible" && !toestand.bezig && toestand.doelen.size === 0) void laad();
  };
  document.addEventListener("visibilitychange", opnieuw);
  window.addEventListener("pageshow", (e) => e.persisted && opnieuw());
}

const ALGEMENE_FOUT = "Uw winkelmand kon niet worden bijgewerkt. Probeer het opnieuw of bel ons.";

let loopt = false;
/** Werkt de doelen één voor één af; nieuwe doelen die intussen binnenkomen, gaan mee in dezelfde ronde. */
async function verwerk() {
  if (loopt) return;
  loopt = true;
  zet({ bezig: true });
  try {
    while (toestand.doelen.size > 0) {
      const [variantId, doel] = toestand.doelen.entries().next().value as [string, { productId: string; quantity: number }];
      const regel = toestand.cart?.lines.nodes.find((l) => l.merchandise && kortId(l.merchandise.id) === variantId);
      const klaar = () => {
        // Enkel dit doel is afgehandeld; kwam er intussen een nieuwer voor dezelfde variant, dan blijft dat staan.
        if (toestand.doelen.get(variantId) !== doel) return;
        const rest = new Map(toestand.doelen);
        rest.delete(variantId);
        zet({ doelen: rest });
      };

      let lines: Record<string, unknown>[] | null = null;
      if (regel && regel.quantity !== doel.quantity) lines = [{ id: regel.id, quantity: doel.quantity }];
      else if (!regel && doel.quantity > 0) lines = [{ merchandiseId: variantGid(variantId), quantity: doel.quantity }];
      if (!lines) {
        klaar();
        continue;
      }

      let data: Antwoord = {};
      let status = 0;
      try {
        const res = await fetch(EINDPUNT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ lines }) });
        status = res.status;
        data = (await res.json().catch(() => ({}))) as Antwoord;
      } catch {
        /* netwerkfout: status blijft 0 */
      }

      if (status === 200 && data.cart) {
        // Shopify kan een deel weigeren (bv. meer dan de voorraad): de mand is dan wat Shopify ervan maakte.
        zet({ cart: data.cart, ...(data.userErrors?.length ? { fout: ALGEMENE_FOUT } : {}) });
        klaar();
        continue;
      }
      // Mislukt: alle openstaande doelen vervallen, het scherm toont weer wat Shopify bevestigde.
      // Onze eigen meldingen (etalage, maximum) zijn Nederlands en mogen getoond worden; de rest krijgt de algemene tekst.
      const eigen = status === 409 || data.error?.code === "te_veel" || data.error?.code === "te_veel_regels" || data.error?.code === "controle_mislukt";
      zet({ doelen: new Map(), fout: (eigen && data.error?.message) || ALGEMENE_FOUT });
      // De mand kan intussen verdwenen zijn (afgerekend): opnieuw ophalen zet alles recht.
      await laad();
    }
  } finally {
    loopt = false;
    zet({ bezig: false });
  }
}

function zetDoel(productId: string, variantId: string, quantity: number) {
  const doelen = new Map(toestand.doelen);
  doelen.set(variantId, { productId, quantity });
  zet({ doelen, fout: "" });
  void verwerk();
}

const huidig = (variantId: string) => regels().find((l) => l.variantId === variantId);

/* ---------------- wat de site gebruikt ---------------- */

export const shopifyCart = {
  /** @returns de nieuwe regelhoeveelheid en of de bovengrens bereikt werd (zoals de lokale mand). */
  add(productId: string, variantId: string, quantity: number, max = Number.POSITIVE_INFINITY) {
    const wanted = Math.round((huidig(variantId)?.quantity ?? 0) + quantity);
    const next = Math.min(max, wanted);
    zetDoel(productId, variantId, next);
    return { quantity: next, capped: wanted > max };
  },
  setQuantity(variantId: string, quantity: number) {
    const regel = huidig(variantId);
    if (!regel) return;
    zetDoel(regel.productId, variantId, Math.max(0, Math.round(quantity)));
  },
  remove(variantId: string) {
    const regel = huidig(variantId);
    if (regel) zetDoel(regel.productId, variantId, 0);
  },
  clear() {
    const doelen = new Map(toestand.doelen);
    for (const l of regels()) doelen.set(l.variantId, { productId: l.productId, quantity: 0 });
    zet({ doelen, fout: "" });
    void verwerk();
  },
  wisFout: () => zet({ fout: "" }),
  /** Opnieuw ophalen, bv. na "terug" uit de kassa. */
  ververs: () => laad(),
};

const subscribe = (l: () => void) => {
  start();
  luisteraars.add(l);
  return () => luisteraars.delete(l);
};

const SERVER = { lines: LEEG, hydrated: false, bezig: false, fout: "" };

export function useShopifyCart() {
  const lines = useSyncExternalStore(subscribe, regels, () => SERVER.lines);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => toestand.geladen,
    () => SERVER.hydrated,
  );
  const bezig = useSyncExternalStore(
    subscribe,
    () => toestand.bezig,
    () => SERVER.bezig,
  );
  const fout = useSyncExternalStore(
    subscribe,
    () => toestand.fout,
    () => SERVER.fout,
  );
  return { lines, hydrated, bezig, fout, count: lines.length, ...shopifyCart };
}

/* ---------------- voor Shopify's cart-tracker ---------------- */

/** De bevestigde mand in de vorm van Shopify's cart store. Zolang er een wijziging loopt, wacht de tracker (pending.cost). */
function analyticsState(): CartState {
  return {
    data: toestand.cart ?? EMPTY_CART_DATA,
    loading: !toestand.geladen,
    pending: { lines: new Set(), discountCodes: new Set(), note: false, attributes: false, cost: toestand.bezig },
    revalidating: false,
    errors: createEmptyCartErrors(),
  };
}

/** Voor `trackCartAnalytics(analyticsStore)` (components/analytics/winkelmand-metingen.tsx). */
export const analyticsStore = {
  getState: analyticsState,
  subscribe(listener: (state: CartState) => void) {
    analyticsLuisteraars.add(listener);
    return () => analyticsLuisteraars.delete(listener);
  },
};

/** De bevestigde mand, of null (voor de meting "winkelmand bekeken" en om te weten of er een mand is). */
export const bevestigdeCart = () => toestand.cart;
