"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SHOPIFY_CART, useCart } from "@/lib/store/stores";
import { WinkelmandMetingen } from "@/components/analytics/winkelmand-metingen";
import { CartDrawer } from "./cart-drawer";
import { KassaOpvolging } from "./kassa-opvolging";

type Toevoeging = { productId: string; variantId: string; quantity: number; max?: number };

export type ToevoegUitkomst =
  /** Bevestigd; het winkelmandpaneel staat open met de bevestiging. */
  | { status: "toegevoegd" }
  /** De bovengrens van het product is bereikt; `quantity` = wat er nu in de mand zit. */
  | { status: "maximum"; quantity: number }
  /** Shopify weigerde of was onbereikbaar; `melding` is een zin voor de klant. De mand is ongewijzigd. */
  | { status: "fout"; melding: string }
  /** Er liep al een toevoeging: deze klik deed niets. */
  | { status: "bezig" };

type CartUi = {
  /** Legt een product in de mand en opent het paneel zodra dat bevestigd is. Wie aanroept, toont zelf de fout of het maximum. */
  voegToe: (t: Toevoeging) => Promise<ToevoegUitkomst>;
  /** De variant die nu toegevoegd wordt (knoppen tonen "Even geduld…"), of null. */
  bezigMet: string | null;
  /** Opent het winkelmandpaneel (winkelmandicoon in de header). */
  openMand: () => void;
  /** De productgegevens van de mand alvast ophalen (de klant wijst het icoon aan). */
  voorlaad: () => void;
};

const Ctx = createContext<CartUi>({ voegToe: async () => ({ status: "bezig" }), bezigMet: null, openMand: () => {}, voorlaad: () => {} });

export function useCartUi() {
  return useContext(Ctx);
}

/** Zo lang blijft "Toegevoegd aan uw winkelmand" zichtbaar. */
const BEVESTIGING_MS = 5000;

/**
 * Het winkelmandpaneel van de site (één voor alle pagina's) en de weg ernaartoe.
 *
 * "In winkelmand" loopt altijd via `voegToe`: eerst de wijziging in de mand, dan wachten tot ze
 * bevestigd is (bij de Shopify-mand: door Shopify), en pas dan het paneel met "Toegevoegd aan uw
 * winkelmand". Mislukt het, dan opent er niets en krijgt de aanroeper de melding terug. Zolang
 * een toevoeging loopt, doet een tweede klik niets: zo telt een dubbelklik nooit dubbel.
 */
export function CartUiProvider({ children }: { children: ReactNode }) {
  const { add, bevestigd, wisFout } = useCart();
  const [open, setOpen] = useState(false);
  const [toegevoegd, setToegevoegd] = useState<{ variantId: string; vers: boolean } | null>(null);
  const [bezigMet, setBezigMet] = useState<string | null>(null);
  const [voorladen, setVoorladen] = useState(false);
  const loopt = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const voegToe = useCallback(
    async (t: Toevoeging): Promise<ToevoegUitkomst> => {
      if (loopt.current) return { status: "bezig" };
      const res = add(t.productId, t.variantId, t.quantity, t.max);
      if (res.capped) return { status: "maximum", quantity: res.quantity };

      loopt.current = true;
      setBezigMet(t.variantId);
      setVoorladen(true);
      const fout = await bevestigd(t.variantId);
      loopt.current = false;
      setBezigMet(null);
      if (fout) return { status: "fout", melding: fout };

      window.clearTimeout(timer.current);
      setToegevoegd({ variantId: t.variantId, vers: true });
      setOpen(true);
      timer.current = window.setTimeout(() => setToegevoegd((s) => (s ? { ...s, vers: false } : s)), BEVESTIGING_MS);
      return { status: "toegevoegd" };
    },
    [add, bevestigd],
  );

  const voorlaad = useCallback(() => setVoorladen(true), []);

  const openMand = useCallback(() => {
    // Een melding van een eerdere, mislukte wijziging hoort niet bij deze opening.
    wisFout();
    window.clearTimeout(timer.current);
    setToegevoegd(null);
    setVoorladen(true);
    setOpen(true);
  }, [wisFout]);

  const close = useCallback(() => {
    window.clearTimeout(timer.current);
    setOpen(false);
    setToegevoegd(null);
    wisFout();
  }, [wisFout]);

  // Terug/vooruit in de browser: het paneel hoort bij de pagina waarop het openging.
  useEffect(() => {
    if (!open) return;
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, [open, close]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo(() => ({ voegToe, bezigMet, openMand, voorlaad }), [voegToe, bezigMet, openMand, voorlaad]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <KassaOpvolging />
      {SHOPIFY_CART && <WinkelmandMetingen />}
      <CartDrawer open={open} voorladen={voorladen} toegevoegd={toegevoegd} onClose={close} />
    </Ctx.Provider>
  );
}
