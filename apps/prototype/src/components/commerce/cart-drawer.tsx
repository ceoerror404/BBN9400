"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Icon } from "@/components/ui/icon";
import { ImageSlot } from "@/components/ui/image-slot";
import { Spinner } from "@/components/ui/spinner";
import { QuantityStepper } from "@/components/product/quantity-input";
import { formatMoney, lineTotal, UNIT_SUFFIX } from "@/lib/catalog/product";
import { routes } from "@/lib/routes";
import { useAfrekenen, useMand, type MandRij } from "@/lib/store/use-mand";

/**
 * De winkelmand als zijpaneel: opent na "In winkelmand" (met een korte bevestiging) en via het
 * winkelmandicoon in de header. Kop en voet staan vast, enkel de productlijst scrolt.
 *
 * Geen eigen toestand voor de mand: regels, bedragen en afrekenen komen uit dezelfde bron als de
 * winkelmandpagina (lib/store/use-mand.ts). Een wijziging staat meteen op het scherm; mislukt ze
 * bij Shopify, dan valt de lijst terug op wat Shopify bevestigde en verschijnt de melding in de voet.
 */
export function CartDrawer({
  open,
  voorladen,
  toegevoegd,
  onClose,
}: {
  open: boolean;
  /** Productgegevens al ophalen vóór het paneel opent (er wordt net iets toegevoegd). */
  voorladen: boolean;
  /** De variant die net toegevoegd werd; `vers` zolang de bevestiging zichtbaar is. */
  toegevoegd: { variantId: string; vers: boolean } | null;
  onClose: () => void;
}) {
  const { cart, rijen, geldig, geblokkeerd, subtotaal, laden } = useMand(open || voorladen);
  const kassa = useAfrekenen();
  const inhoud = useRef<HTMLDivElement>(null);
  const [verwijderd, setVerwijderd] = useState("");

  // Het net toegevoegde product moet meteen in beeld staan, ook onderaan een lange lijst.
  const nieuw = toegevoegd?.variantId;
  useEffect(() => {
    if (!open || !nieuw || laden) return;
    inhoud.current?.querySelector(`[data-variant="${CSS.escape(nieuw)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, nieuw, laden]);

  const verwijder = (rij: MandRij) => {
    cart.remove(rij.line.variantId);
    setVerwijderd(`${rij.p?.card.title ?? "Het product"} is verwijderd uit uw winkelmand.`);
    // De knop verdwijnt mee met de regel: de focus gaat naar de lijst, niet verloren.
    inhoud.current?.focus();
  };

  const leeg = cart.hydrated && cart.lines.length === 0;
  const melding = kassa.fout || cart.fout;
  // Loopt er daarna iets mis (een wijziging of de kassa), dan staat er geen "Toegevoegd" meer naast de foutmelding.
  const bevestiging = Boolean(toegevoegd?.vers) && !melding;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      // 460 px zichtbaar op desktop: de site staat daar op zoom 0.9 (globals.css), dus delen door de zoom.
      width="w-[min(100vw,calc(460px/var(--site-zoom,1)))]"
      closeLabel="Winkelmand sluiten"
      title={cart.hydrated ? `Mijn winkelmand (${cart.count})` : "Mijn winkelmand"}
      status={
        toegevoegd ? (
          // Verdwijnt na enkele seconden, maar houdt zijn plaats: de lijst eronder verspringt niet.
          <span
            aria-hidden={!bevestiging}
            className={`flex items-center gap-1.5 font-medium transition-opacity duration-300 motion-reduce:transition-none ${bevestiging ? "opacity-100" : "opacity-0"}`}
          >
            <Icon name="checkCircle" size={18} className="shrink-0 text-success" /> Toegevoegd aan uw winkelmand
          </span>
        ) : undefined
      }
      footer={
        leeg ? undefined : (
          <div>
            {/* Op een laag scherm (telefoon dwars) valt deze toelichting weg: elke regel zegt zelf al waarom ze niet te koop is. */}
            {geblokkeerd.length > 0 && (
              <p role="note" className="mb-3 rounded-[var(--radius-field)] bg-mist p-3 text-[13px] text-ink-80 [@media(max-height:520px)]:hidden">
                {geblokkeerd.length === 1 ? "Eén product is" : `${geblokkeerd.length} producten zijn`} niet online te koop (prijs op aanvraag of uitverkocht). Verwijder{" "}
                {geblokkeerd.length === 1 ? "het" : "ze"} om te kunnen afrekenen.
              </p>
            )}
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-base font-semibold">
                Subtotaal <span className="text-[13px] font-normal text-ink-60">incl. btw</span>
              </p>
              {laden ? (
                <span className="h-6 w-24 rounded bg-mist motion-safe:animate-pulse" aria-hidden="true" />
              ) : (
                // Dimt even terwijl Shopify de wijziging bevestigt; het bedrag zelf staat er al.
                <p aria-live="polite" aria-busy={cart.bezig} className={`text-lg font-semibold tabular-nums transition-opacity motion-reduce:transition-none ${cart.bezig ? "opacity-60" : ""}`}>
                  {geldig.length ? formatMoney(subtotaal) : "Op aanvraag"}
                </p>
              )}
            </div>
            <p className="mt-1 text-[13px] text-ink-60 [@media(max-height:520px)]:hidden">Levering of afhalen kiest u bij het afrekenen; daar ziet u ook de eventuele verzendkosten.</p>
            {melding && (
              <p role="alert" className="mt-3 text-[13px] text-brand-dark">
                {melding}
              </p>
            )}
            {/* Op een laag scherm (telefoon dwars) staan de knoppen naast elkaar, zodat de lijst ruimte houdt. */}
            <div className="mt-4 grid gap-2 [@media(max-height:520px)]:mt-3 [@media(max-height:520px)]:grid-cols-2">
              <button
                type="button"
                onClick={kassa.afrekenen}
                disabled={laden || geblokkeerd.length > 0 || geldig.length === 0}
                // Tijdens het doorsturen blijft de knop focusbaar; een tweede klik doet niets (useAfrekenen).
                aria-disabled={kassa.bezig || undefined}
                className="btn btn-primary w-full aria-disabled:cursor-progress [@media(max-height:520px)]:order-2 [@media(max-height:520px)]:px-3"
              >
                {kassa.bezig ? (
                  <>
                    <Spinner /> Even geduld…
                  </>
                ) : (
                  "Verder naar afrekenen"
                )}
              </button>
              <button type="button" onClick={onClose} className="btn btn-outline w-full [@media(max-height:520px)]:px-3">
                Verder winkelen
              </button>
            </div>
            <Link
              href={routes.cart()}
              onClick={onClose}
              className="mx-auto mt-1 flex min-h-11 w-fit items-center text-[13px] text-ink-80 underline underline-offset-2 hover:text-ink [@media(max-height:520px)]:hidden"
            >
              Volledige winkelmand bekijken
            </Link>
          </div>
        )
      }
    >
      <div ref={inhoud} tabIndex={-1} className="min-h-full outline-none">
        <p role="status" className="sr-only">
          {verwijderd}
        </p>

        {laden ? (
          <div aria-busy="true">
            <p className="sr-only">Uw winkelmand wordt geladen…</p>
            <ul role="list" aria-hidden="true" className="divide-y divide-line">
              {Array.from({ length: Math.min(Math.max(cart.lines.length, 1), 4) }, (_, i) => (
                <li key={i} className="flex gap-4 px-5 py-4 motion-safe:animate-pulse">
                  <div className="aspect-square w-20 shrink-0 rounded-2xl bg-mist sm:w-24" />
                  <div className="flex-1 py-1">
                    <div className="h-4 w-3/4 rounded bg-mist" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-mist" />
                    <div className="mt-5 h-11 w-32 rounded-[var(--radius-field)] bg-mist" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : leeg ? (
          <div className="flex flex-col items-center px-8 py-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-mist">
              <Icon name="bag" size={28} />
            </span>
            <p className="mt-5 text-lg font-semibold">Uw winkelmand is leeg</p>
            <p className="mt-2 max-w-xs text-ink-80">
              Veel van ons assortiment is maatwerk met een prijs op aanvraag. Bewaar wat u mooi vindt op uw verlanglijst en vraag er in één keer een offerte voor aan.
            </p>
            <button type="button" onClick={onClose} className="btn btn-primary mt-6">
              Verder winkelen
            </button>
            <Link href={routes.wishlist()} onClick={onClose} className="mt-2 flex min-h-11 items-center text-[14px] font-medium underline underline-offset-2">
              Naar mijn verlanglijst
            </Link>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-line">
            {rijen.map((rij) => {
              const { line, p, v, unit, bedrag } = rij;
              if (!p || !v) {
                return (
                  <li key={line.variantId} className="flex items-center justify-between gap-4 px-5 py-4 text-ink-60">
                    Dit product is niet meer beschikbaar.
                    <button type="button" onClick={() => verwijder(rij)} className="btn btn-outline btn-sm">
                      Verwijderen
                    </button>
                  </li>
                );
              }
              const href = routes.product(p.card.slug, v.id);
              const net = bevestiging && toegevoegd?.variantId === line.variantId;
              // De eenheidsprijs staat er enkel als ze iets zegt: bij meer dan één stuk, of bij meter, m², rol, doos.
              // Bij één stuk houdt ze onzichtbaar haar plaats: zo zakt de +-knop niet weg onder de vinger
              // wanneer de klant van 1 naar 2 gaat.
              const toonEenheidsprijs = line.quantity !== 1 || unit !== "stuk";
              return (
                <li
                  key={line.variantId}
                  data-variant={line.variantId}
                  className={`flex gap-4 px-5 py-4 transition-colors duration-500 motion-reduce:transition-none ${net ? "bg-cloud" : ""}`}
                >
                  <Link href={href} onClick={onClose} tabIndex={-1} aria-hidden="true" className="shrink-0">
                    <ImageSlot src={v.image ?? p.card.image?.src} alt="" sizes="96px" className="aspect-square w-20 rounded-2xl bg-mist sm:w-24" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={href} onClick={onClose} className="line-clamp-2 font-medium leading-snug hover:underline">
                          {p.card.title}
                        </Link>
                        {p.variants.length > 1 && <p className="mt-0.5 text-[13px] text-ink-60">{v.label}</p>}
                      </div>
                      {rij.aanvraag || !bedrag ? (
                        <p className="shrink-0 text-right text-[13px] font-medium text-ink-80">Prijs op aanvraag</p>
                      ) : (
                        // Vaste minimumbreedte: een breder bedrag laat de productnaam niet opnieuw afbreken.
                        <div className="min-w-[6.5rem] shrink-0 text-right tabular-nums">
                          <p className="font-semibold">
                            <span className="sr-only">Regeltotaal </span>
                            {formatMoney(bedrag.totaal)}
                          </p>
                          {bedrag.vergelijk !== null && bedrag.vergelijk > bedrag.perEenheid && (
                            <s className="block text-[13px] text-ink-60">
                              <span className="sr-only">in plaats van </span>
                              {formatMoney(lineTotal(bedrag.vergelijk, line.quantity))}
                            </s>
                          )}
                          <p aria-hidden={!toonEenheidsprijs} className={`text-[13px] text-ink-60 ${toonEenheidsprijs ? "" : "invisible"}`}>
                            {formatMoney(bedrag.perEenheid)} {UNIT_SUFFIX[unit] || "/ stuk"}
                          </p>
                        </div>
                      )}
                    </div>

                    {rij.aanvraag && (
                      <p className="mt-1 text-[13px] text-ink-80">
                        Niet online te koop.{" "}
                        <Link href={routes.quote({ product: p.card.slug, variant: v.id })} onClick={onClose} className="font-medium underline underline-offset-2">
                          Vraag een offerte aan
                        </Link>
                      </p>
                    )}
                    {rij.uitverkocht && <p className="mt-1 text-[13px] text-brand-dark">Deze uitvoering is intussen uitverkocht.</p>}

                    <div className="mt-2 flex items-center justify-between gap-3">
                      {rij.aanvraag ? <span /> : <QuantityStepper unit={unit} rule={p.quantity} value={line.quantity} onChange={(q) => cart.setQuantity(line.variantId, q)} naam={p.card.title} />}
                      <button
                        type="button"
                        onClick={() => verwijder(rij)}
                        className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-60 hover:bg-mist hover:text-ink"
                        aria-label={`${p.card.title} verwijderen`}
                      >
                        <Icon name="trash" size={20} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
