"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import type { MenuNode } from "@/lib/catalog/menu";
import type { NavItem } from "@/lib/site/navigation";
import { routes } from "@/lib/routes";
import { naarCssPx } from "@/lib/site/zoom";
import { Icon } from "@/components/ui/icon";
import { ServiceBar } from "./service-bar";
import { SearchBox } from "./search-box";
import { HeaderActions } from "./header-actions";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";
import { Logo } from "./logo";

/** Tot hier blijft de header volledig staan. Laag genoeg om één muiswielstap (± 100 px) te laten volstaan. */
const BOVENAAN_PX = 40;

/**
 * Header zoals de referentie: servicebalk · logo + groot zoekveld + winkeliconen ·
 * navigatierij met "Catalogus"-knop (megamenu). Blijft bovenaan kleven. Desktop: alles blijft
 * altijd staan, ook de navigatierij. Mobiel/tablet: servicebalk en logorij blijven staan; het
 * zoekveld klapt weg bij naar beneden scrollen en komt terug bij omhoog scrollen.
 */
export function SiteHeader({ menu, nav }: { menu: MenuNode[]; nav: NavItem[] }) {
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const catalogBtn = useRef<HTMLButtonElement>(null);

  // Menu's sluiten bij navigatie.
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // In-/uitklappen op scrollrichting. Hysterese (48 px in dezelfde richting) + korte
  // vergrendeling na elke wissel, zodat de header niet flikkert bij kleine bewegingen.
  useEffect(() => {
    let last = window.scrollY;
    let travel = 0;
    let lockedUntil = 0;
    let isCollapsed = false;
    const set = (next: boolean) => {
      if (next === isCollapsed) return;
      isCollapsed = next;
      lockedUntil = performance.now() + 350;
      travel = 0;
      setCollapsed(next);
    };
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      last = y;
      // Vóór de vergrendeling: anders blijft de navigatierij weg na snel terugscrollen naar de top.
      if (y < BOVENAAN_PX) return set(false);
      if (performance.now() < lockedUntil) return;
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      if (travel > 48) set(true);
      else if (travel < -48) set(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --header-h: volle hoogte als CSS-variabele (B10/B21). Verandert nooit bij scrollen, dus
  // kleverige elementen (filterbalk, productkolom) en de inhoud verspringen niet.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const meet = () => {
      document.documentElement.style.setProperty("--header-h", `${Math.round(naarCssPx(header.getBoundingClientRect().height))}px`);
    };
    const ro = new ResizeObserver(meet);
    ro.observe(header);
    meet();
    return () => ro.disconnect();
  }, []);

  // Megamenu: sluiten bij klik buiten de header of Escape.
  useEffect(() => {
    if (!megaOpen) return;
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        catalogBtn.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [megaOpen]);

  const isActive = (href: string) =>
    href === routes.catalog() ? pathname.startsWith("/catalogus") || pathname.startsWith("/product") : pathname.startsWith(href);

  // Ingeklapt (enkel mobiel/tablet) = enkel servicebalk en logorij zichtbaar.
  // Met het megamenu open blijft alles staan.
  const ingeklapt = collapsed && !megaOpen;
  useEffect(() => {
    document.documentElement.toggleAttribute("data-header-ingeklapt", ingeklapt);
  }, [ingeklapt]);
  useEffect(() => () => document.documentElement.removeAttribute("data-header-ingeklapt"), []);

  // De header neemt altijd zijn volle hoogte in (niets eronder verspringt). Bij inklappen
  // schuift het mobiele zoekveld met een transform weg achter de logorij;
  // het lege stuk eronder laat klikken door (pointer-events-none) naar de pagina.
  const verborgen = ingeklapt ? "invisible -translate-y-full" : "pointer-events-auto";
  return (
    <header ref={headerRef} className="pointer-events-none sticky top-0 z-50">
      <a href="#inhoud" className="sr-only-focusable pointer-events-auto absolute left-4 top-2 z-[60] rounded-full bg-ink px-4 py-2 text-white">
        Naar de inhoud
      </a>
      {/* Witte achtergrond achter de rijen: bij schermschaal 125%/150% vallen er anders
          halve-pixelnaden tussen de rijen waar de pagina doorschemert. Mobiel enkel achter de
          vaste rijen, want het stuk onder een ingeklapt zoekveld moet doorzichtig blijven. */}
      <div className="lg:bg-white">
        <div className="pointer-events-auto bg-white">
          <ServiceBar />

          {/* Rij 1: logo · zoeken · iconen — blijft altijd zichtbaar */}
          <div className={`relative z-20 bg-white ${ingeklapt ? "shadow-[0_1px_0_var(--color-line)] lg:shadow-none" : ""}`}>
            <div className="shell flex h-[64px] items-center gap-2 lg:h-[76px] lg:gap-6">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="-ml-1 flex min-h-11 min-w-11 flex-col items-center justify-center rounded-lg text-[11px] leading-none lg:hidden"
                aria-label="Menu openen"
                aria-expanded={mobileOpen}
              >
                <Icon name="menu" size={24} />
                <span aria-hidden="true" className="mt-0.5">
                  Menu
                </span>
              </button>
              <Logo />
              <Suspense fallback={<div className="hidden h-[46px] flex-1 lg:block" />}>
                <SearchBox className="hidden max-w-[660px] flex-1 lg:block" />
              </Suspense>
              <div className="ml-auto">
                <HeaderActions />
              </div>
            </div>
          </div>
        </div>

        {/* Rij 2 (mobiel/tablet): zoekveld */}
        <div
          className={`relative z-10 bg-white transition-[transform,visibility] duration-200 motion-reduce:transition-none lg:hidden ${verborgen}`}
          inert={ingeklapt || undefined}
        >
          <div className="shell">
            <Suspense fallback={<div className="h-[58px]" />}>
              <SearchBox className="pb-3" />
            </Suspense>
          </div>
        </div>

        {/* Rij 3 (desktop): hoofdnavigatie — blijft altijd zichtbaar */}
        <div className="pointer-events-auto relative z-10 hidden bg-white lg:block">
          <nav aria-label="Hoofdnavigatie" className="shell">
            <div className="flex h-[64px] items-center justify-between gap-4">
              <ul className="flex items-center gap-1" role="list">
                {nav.filter((item) => !item.enkelMobiel).map((item) =>
                  item.mega ? (
                    <li key={item.key} className="flex items-center">
                      <button
                        ref={catalogBtn}
                        type="button"
                        onClick={() => setMegaOpen((o) => !o)}
                        aria-expanded={megaOpen}
                        aria-controls="megamenu"
                        className={`flex h-11 items-center gap-2 rounded-[var(--radius-pill)] px-3 text-[14px] font-medium text-ink-80 transition-colors hover:bg-mist ${
                          megaOpen || isActive(item.href) ? "bg-mist text-ink" : ""
                        }`}
                      >
                        <Icon name={megaOpen ? "close" : "menu"} size={20} />
                        {item.label}
                      </button>
                      <span aria-hidden="true" className="ml-3 mr-2 h-8 w-px bg-line-strong/30" />
                      {/* In de DOM direct na de knop: Tab gaat meteen het menu in. */}
                      {megaOpen && <MegaMenu menu={menu} onNavigate={() => setMegaOpen(false)} metAanbiedingen={nav.some((n) => n.key === "aanbiedingen")} />}
                    </li>
                  ) : (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={`flex h-11 items-center whitespace-nowrap rounded-[var(--radius-pill)] px-2.5 text-[14px] font-medium transition-colors hover:bg-mist xl:px-4 ${
                          isActive(item.href) ? "bg-mist text-ink" : "text-ink-80"
                        } ${item.accent === "offer" ? "!text-brand-dark" : ""}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
              <Link
                href={routes.measurement()}
                aria-label="Opmeting aanvragen"
                className="btn btn-outline h-12 shrink-0 rounded-[var(--radius-field)] px-3 text-[14px] xl:px-4"
              >
                <Icon name="ruler" size={20} />
                <span className="hidden xl:inline">Opmeting aanvragen</span>
              </Link>
            </div>
          </nav>
        </div>
        <div className={`border-b border-line ${ingeklapt ? "invisible lg:visible" : ""}`} />
      </div>

      <div className="pointer-events-auto">
        <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} menu={menu} nav={nav} />
      </div>
    </header>
  );
}
