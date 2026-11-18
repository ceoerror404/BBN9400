/**
 * Op desktop staat de hele site op `zoom: 0.9` (--site-zoom in globals.css). Gemeten maten
 * (getBoundingClientRect, innerWidth, scrollY) zijn dan al ingezoomd, CSS-maten nog niet.
 * Wie een gemeten maat in CSS zet, of een CSS-maat met een meting vergelijkt, rekent om.
 */
export function paginaZoom(): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
}

/** Gemeten pixels → CSS-pixels (om in een style of CSS-variabele te zetten). */
export function naarCssPx(gemeten: number): number {
  return gemeten / paginaZoom();
}

/** Hoogte van de kleverige header zoals gemeten (in dezelfde eenheid als getBoundingClientRect). */
export function headerHoogteGemeten(standaard: number): number {
  const css = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) || standaard;
  return css * paginaZoom();
}
