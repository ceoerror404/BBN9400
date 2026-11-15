import type { CategoryId } from "@/lib/catalog/types";

/**
 * Welk "op maat"-verhaal past bij een afdeling. Enkel waar Brunic die dienst echt levert,
 * spreken we van opmeting, atelier of plaatsing (docs/teksten-en-beloftes.md, 13/11/2026).
 *
 * - stoffen:  gordijnen op maat gebracht in ons eigen atelier, opmeting + plaatsing door
 *             vakmannen (ook raamdecoratie)
 * - tapijten: tapijt op maat (dienst tapijt-op-maat)
 * - vloer:    vasttapijt, gratis opgemeten en gelegd door vakmannen
 * - behang:   stalenboeken in de winkel én gratis opmeting aan huis; geen atelier, geen plaatsing
 * - winkel:   geen maatwerk → stalenboeken en advies in de winkel (gemengde lijsten)
 */
export type Maatwerk = "stoffen" | "tapijten" | "vloer" | "behang" | "winkel";

const PER_AFDELING: Record<CategoryId, Maatwerk> = {
  c05: "stoffen", // Gordijnen & stoffen
  c01: "stoffen", // Raamdecoratie (op maat, zelfde opmeting en plaatsing)
  c02: "behang",
  c03: "tapijten",
  c04: "vloer",
};

/** `rootId` = de hoofdcategorie (eerste element van het kruimelpad). */
export function maatwerkVoor(rootId: CategoryId | undefined): Maatwerk {
  return (rootId && PER_AFDELING[rootId]) || "winkel";
}

/** Maakwerk en plaatsing (atelier, vakmannen): stoffen, tapijt op maat, vasttapijt. Niet bij behang. */
export const isOpMaat = (m: Maatwerk) => m !== "winkel" && m !== "behang";

/** Gratis opmeting aan huis: stoffen, vasttapijt en behang. */
export const metOpmeting = (m: Maatwerk) => m === "stoffen" || m === "vloer" || m === "behang";
