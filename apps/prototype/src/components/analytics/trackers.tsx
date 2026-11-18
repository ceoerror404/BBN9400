"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { meldPagina, meldWeergave } from "@/lib/analytics/bus";
import { collectiePayload, paginaSleutel, zoekPayload } from "@/lib/analytics/payloads";

/**
 * Paginabezoek bij het laden en bij elke navigatie in de browser (ook terug/vooruit). Staat één
 * keer in de root-layout, in een Suspense (useSearchParams). Prefetchen telt niet mee: dit
 * draait enkel voor de pagina die echt getoond wordt.
 */
export function PaginaTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const sleutel = paginaSleutel(pathname, search?.toString() ?? "");

  // `sleutel` bepaalt wannéér er gemeld wordt; wát er gemeld wordt, leest meldPagina uit de adresbalk.
  useEffect(() => meldPagina(), [sleutel]);

  // Terug uit de kassa of een andere site via de terugknop (bfcache): de pagina wordt opnieuw
  // getoond zonder dat React iets merkt. Dat is wel een nieuw bezoek.
  useEffect(() => {
    const terug = (e: PageTransitionEvent) => {
      if (e.persisted) meldPagina();
    };
    window.addEventListener("pageshow", terug);
    return () => window.removeEventListener("pageshow", terug);
  }, []);

  return null;
}

/** Categoriepagina bekeken. Filters wijzigen de collectie niet: één meting per bezoek aan de categorie. */
export function CollectieTracker({ bron }: { bron?: { handle: string; id?: string } }) {
  const handle = bron?.handle;
  const id = bron?.id;
  useEffect(() => {
    const payload = collectiePayload(handle ? { handle, id } : undefined);
    if (payload) meldWeergave("collectie", payload.collection.id, payload);
  }, [handle, id]);
  return null;
}

/**
 * Zoekresultaten bekeken: op de resultatenpagina, niet bij elke toets in het zoekveld. Een term
 * die op een e-mailadres of telefoonnummer lijkt, gaat niet mee (lib/analytics/payloads.ts).
 */
export function ZoekTracker({ term, aantal }: { term: string; aantal: number | null }) {
  useEffect(() => {
    const payload = zoekPayload(term, aantal);
    if (payload) meldWeergave("zoeken", payload.searchTerm, payload);
  }, [term, aantal]);
  return null;
}
