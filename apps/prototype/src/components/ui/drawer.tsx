"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { vergrendelPagina } from "@/lib/site/scroll";
import { Icon } from "./icon";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

/**
 * Zijpaneel (filters, varianten, mobiel menu, winkelmand).
 * Toegankelijk: role=dialog + aria-modal, benoemd via de titel, focus gaat naar het
 * paneel en terug naar de opener, Escape en klik op de achtergrond sluiten, de pagina
 * scrolt niet mee, Tab en Shift+Tab blijven binnen het paneel.
 *
 * Opbouw: kop (vast) · inhoud (scrolt) · voet (vast). Het paneel is altijd zo hoog als het
 * zichtbare scherm: de kop en de voet blijven in beeld, hoe lang de inhoud ook is.
 */
export function Drawer({
  open,
  onClose,
  title,
  status,
  side = "right",
  children,
  footer,
  width = "w-[min(100vw,440px)]",
  closeLabel = "Sluiten",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Korte melding onder de titel (bv. "Toegevoegd aan uw winkelmand"); wordt mee voorgelezen bij het openen. */
  status?: ReactNode;
  side?: "left" | "right";
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  closeLabel?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const titleId = useId();
  const statusId = useId();
  const closeRef = useRef(onClose);
  const geopendOp = useRef(0);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    geopendOp.current = performance.now();
    opener.current = document.activeElement;
    const ontgrendel = vergrendelPagina();
    const t = window.setTimeout(() => panel.current?.focus(), 10);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === "Tab" && panel.current) {
        const focusables = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        // Focus op het paneel zelf (net geopend) of erbuiten: terug naar begin/einde.
        const inside = active instanceof HTMLElement && active !== panel.current && panel.current.contains(active);
        if (e.shiftKey && (!inside || active === first)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (!inside || active === last)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      ontgrendel();
      document.removeEventListener("keydown", onKey);
      if (opener.current instanceof HTMLElement) opener.current.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    // overflow-hidden: het inschuivende paneel staat even naast het scherm en mag geen scrollbalk geven.
    <div className="fixed inset-0 z-[80] overflow-hidden">
      <div
        className="absolute inset-0 bg-ink/40 motion-safe:animate-dim"
        // De tweede klik van een dubbelklik op de knop die het paneel opende, valt op deze achtergrond: die sluit niet.
        onClick={() => performance.now() - geopendOp.current > 400 && onClose()}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title !== undefined ? titleId : undefined}
        aria-describedby={status !== undefined ? statusId : undefined}
        tabIndex={-1}
        // Hoogte: het vaste kader (inset-0) volgt het zichtbare scherm, ook als de adresbalk van een
        // telefoon in- of uitschuift. De bovengrens van 100dvh is gedeeld door de sitezoom: op desktop
        // staat de site op zoom 0.9 (globals.css) en een kale 100dvh kwam daardoor maar tot 90% van het scherm.
        className={`absolute inset-y-0 flex h-full max-h-[calc(100dvh/var(--site-zoom,1))] flex-col bg-white outline-none ${width} ${
          side === "right"
            ? "right-0 shadow-[var(--shadow-drawer)] motion-safe:animate-lade-rechts"
            : "left-0 shadow-[12px_0_40px_-12px_rgb(19_12_12/0.25)] motion-safe:animate-lade-links"
        }`}
      >
        {title !== undefined && (
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {status !== undefined && (
                <div id={statusId} role="status" className="mt-0.5 min-h-5 text-[13px] leading-5">
                  {status}
                </div>
              )}
            </div>
            <button type="button" onClick={onClose} className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-mist" aria-label={closeLabel}>
              <Icon name="close" />
            </button>
          </div>
        )}
        <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${footer ? "" : "pb-[env(safe-area-inset-bottom)]"}`}>{children}</div>
        {footer && <div className="shrink-0 border-t border-line bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
