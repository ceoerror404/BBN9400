"use client";

import { useEffect, useRef, useState } from "react";
import type { CartLine, SalesUnit } from "@/lib/catalog/types";
import { lineTotal } from "@/lib/catalog/product";
import { SITE } from "@/lib/site/config";
import { lopendeKassa, SHOPIFY_CART, useCart } from "./stores";
import { useProducts, type LiteProduct, type LiteVariant } from "./use-products";

/** Bedragen van één regel, in euro incl. btw. */
export type MandBedrag = { perEenheid: number; vergelijk: number | null; totaal: number };

export type MandRij = {
  line: CartLine;
  /** Ontbreekt het product of de variant, dan kent de catalogus ze niet meer. */
  p?: LiteProduct;
  v?: LiteVariant;
  unit: SalesUnit;
  /** Niet online te koop: prijs op aanvraag (B25). */
  aanvraag: boolean;
  uitverkocht: boolean;
  /** null = geen prijs (op aanvraag of onbekend product). */
  bedrag: MandBedrag | null;
};

/**
 * De winkelmand zoals de schermen ze tonen: de winkelmandpagina (cart-view.tsx) en het
 * zijpaneel (cart-drawer.tsx) rekenen met dezelfde regels en hetzelfde subtotaal.
 *
 * - Regels en hoeveelheden komen uit de mand (useCart: Shopify of lokaal).
 * - Naam, foto, eenheid en beschikbaarheid komen uit de catalogus, beschikbaarheid live uit Shopify.
 * - Bedragen: zodra Shopify een regel bevestigd heeft, tonen we wat Shopify aanrekent (dat is wat
 *   de kassa toont). Loopt het scherm nog vooruit op Shopify, of leeft de mand lokaal, dan rekenen
 *   we met de catalogusprijs.
 *
 * `actief = false`: nog geen productgegevens ophalen (het zijpaneel is nog nooit geopend).
 */
export function useMand(actief = true) {
  const cart = useCart();
  // Beschikbaarheid live uit Shopify: een intussen uitverkochte uitvoering ziet de klant hier al.
  const { map, loading } = useProducts(actief ? cart.lines.map((l) => l.productId) : [], { live: true });

  const rijen: MandRij[] = cart.lines.map((line) => {
    const p = map.get(line.productId);
    const v = p?.variants.find((x) => x.id === line.variantId);
    let bedrag: MandBedrag | null = null;
    if (p && v?.price) {
      const shopify = cart.kosten.get(line.variantId);
      bedrag =
        shopify && shopify.quantity === line.quantity
          ? { perEenheid: shopify.perEenheid, vergelijk: shopify.vergelijk, totaal: shopify.totaal }
          : { perEenheid: v.price.amount.amount, vergelijk: v.price.compareAt?.amount ?? null, totaal: lineTotal(v.price.amount.amount, line.quantity) };
    }
    return {
      line,
      p,
      v,
      unit: v?.price?.unit ?? p?.unit ?? "stuk",
      aanvraag: Boolean(p && v && (p.pricing === "on-request" || !v.price)),
      uitverkocht: v?.availability === "uitverkocht",
      bedrag,
    };
  });

  const geldig = rijen.filter((r) => r.bedrag);
  // Producten op aanvraag (geen prijs) of uitverkocht kunnen niet naar de kassa (B25).
  const geblokkeerd = rijen.filter((r) => r.aanvraag || r.uitverkocht);
  // Elke regel is al afgerond op de cent; optellen in centen, zonder zwevendekommafouten.
  const subtotaal = geldig.reduce((cents, r) => cents + Math.round(r.bedrag!.totaal * 100), 0) / 100;
  const besparing =
    geldig.reduce((cents, r) => {
      const b = r.bedrag!;
      return cents + Math.round((lineTotal(b.vergelijk ?? b.perEenheid, r.line.quantity) - lineTotal(b.perEenheid, r.line.quantity)) * 100);
    }, 0) / 100;

  return { cart, rijen, geldig, geblokkeerd, subtotaal, besparing, laden: !cart.hydrated || (loading && cart.lines.length > 0) };
}

/**
 * "Afrekenen": vraagt bij /api/kassa de kassa-URL van de mand op (daar wordt elke regel opnieuw
 * gecontroleerd op etalage, prijs en beschikbaarheid) en stuurt door naar de beveiligde
 * Shopify-kassa. Eén verzoek tegelijk: een tweede klik doet niets.
 */
export function useAfrekenen() {
  const cart = useCart();
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const loopt = useRef(false);

  // Met "terug" uit de Shopify-kassa (bfcache) stond de knop nog op "Even geduld…".
  useEffect(() => {
    const terug = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      loopt.current = false;
      setBezig(false);
    };
    window.addEventListener("pageshow", terug);
    return () => window.removeEventListener("pageshow", terug);
  }, []);

  const afrekenen = async () => {
    if (loopt.current) return;
    loopt.current = true;
    setBezig(true);
    setFout("");
    try {
      // Shopify-mand: eerst wachten tot de laatste wijziging bevestigd is, anders rekent de klant een
      // oudere mand af. Mislukte die wijziging, dan staat de melding in cart.fout en gaat de klant niet door.
      const wijzigingMislukt = await cart.bevestigd();
      if (!wijzigingMislukt) {
        const lines = cart.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }));
        const res = await fetch("/api/kassa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines }),
        });
        const data = (await res.json()) as { checkoutUrl?: string; cartId?: string; error?: string };
        if (data.checkoutUrl) {
          // Lokale mand: onthouden welke cart naar de kassa ging; na betaling verdwijnen die regels
          // (kassa-opvolging.tsx). De Shopify-mand verdwijnt vanzelf zodra ze afgerekend is.
          if (data.cartId && !SHOPIFY_CART) lopendeKassa.start(data.cartId, lines);
          window.location.href = data.checkoutUrl;
          // De knop blijft op "Even geduld…" tot de kassa geladen is.
          return;
        }
        setFout(data.error ?? "Afrekenen lukte niet.");
      }
    } catch {
      setFout(`Afrekenen lukte niet. Probeer opnieuw of bel ons op ${SITE.phone.display}.`);
    }
    loopt.current = false;
    setBezig(false);
  };

  return { afrekenen, bezig, fout };
}
