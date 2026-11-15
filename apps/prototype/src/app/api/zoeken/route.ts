import { NextResponse } from "next/server";
import { meld } from "@/lib/melding";
import { zoekSuggesties, zoekterm, type Zoeksuggesties } from "@/lib/zoeken/zoeken";

const LEEG: Zoeksuggesties = { products: [], categories: [], pages: [], queries: [] };

/**
 * Suggesties voor het zoekveld in de header: een dunne doorgang naar Shopify Predictive Search
 * (lib/zoeken/zoeken.ts). De token blijft op de server; de browser praat enkel met deze route.
 */
export async function GET(req: Request) {
  const q = zoekterm(new URL(req.url).searchParams.get("q") ?? undefined);
  if (q.length < 2) return NextResponse.json(LEEG);
  try {
    const buyerIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    return NextResponse.json(await zoekSuggesties(q, { buyerIp }), {
      // Dezelfde term van een andere bezoeker komt een minuut lang uit de CDN-cache.
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    // Geen zoekterm in de melding: die kan persoonsgegevens bevatten.
    meld("zoeken", "Shopify Predictive Search antwoordt niet", { fout: (e as Error).message.slice(0, 200) });
    return NextResponse.json({ error: "De suggesties zijn tijdelijk niet beschikbaar." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
