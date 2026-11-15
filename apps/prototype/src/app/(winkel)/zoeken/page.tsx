import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { catalog } from "@/lib/catalog/repository";
import type { SearchParamsRecord } from "@/lib/catalog/listing";
import { meld } from "@/lib/melding";
import { routes } from "@/lib/routes";
import { zoekResultaten, zoekterm, type Zoekresultaat } from "@/lib/zoeken/zoeken";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { ProductListing } from "@/components/catalog/product-listing";
import { CategoryTile } from "@/components/catalog/category-tile";
import { categoryImage } from "@/lib/catalog/imagery";

type Props = { searchParams: Promise<SearchParamsRecord> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = zoekterm((await searchParams).q);
  // Zoekresultaten horen niet in de index (dunne, eindeloos variërende pagina's).
  return { title: q ? `Zoeken: ${q}` : "Zoeken", robots: { index: false, follow: true } };
}

const SUGGESTIES = ["verduisterend", "linnen", "fotobehang", "bloemen", "vasttapijt", "vloerkleed", "brandvrij"];

/**
 * Zoekresultaten uit Shopify Search (lib/zoeken/zoeken.ts). Zoekterm, filters, sortering en
 * pagina staan in de URL; de lijst is dezelfde component als op elke andere productlijst.
 */
export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = zoekterm(sp.q);
  const tree = await catalog.getTree();

  let resultaat: Zoekresultaat | null = null;
  let mislukt = false;
  if (q) {
    try {
      const buyerIp = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
      resultaat = await zoekResultaten(q, sp, { buyerIp });
    } catch (e) {
      mislukt = true;
      // Geen zoekterm in de melding: die kan persoonsgegevens bevatten.
      meld("zoeken", "Shopify Search antwoordt niet", { fout: (e as Error).message.slice(0, 200) });
    }
  }
  const listing = resultaat?.listing;
  const toonLijst = Boolean(listing && (listing.items.length > 0 || resultaat?.gefilterd));
  const links = resultaat ? [...resultaat.categories.map((c) => ({ ...c, soort: "categorie" as const })), ...resultaat.pages.map((p) => ({ id: p.href, name: p.title, href: p.href, trail: "", soort: "pagina" as const }))] : [];
  const roots = toonLijst ? [] : await Promise.all(tree.roots.map(async (r) => ({ node: r, image: await categoryImage(r) })));

  return (
    <div className="shell-inset">
      <Breadcrumbs items={[{ label: "Zoeken" }]} />
      <div className="py-3">
        <h1 className="font-display text-[34px] leading-tight lg:text-[44px]">{q ? <>Resultaten voor “{q}”</> : "Zoeken"}</h1>
      </div>

      {links.length > 0 && (
        <nav aria-label="Gevonden categorieën en pagina’s" className="mt-4">
          <ul role="list" className="flex flex-wrap gap-2">
            {links.map((l) => (
              <li key={l.id}>
                <Link href={l.href} className="flex min-h-10 max-w-full flex-wrap items-center gap-x-2 rounded-full border border-line-strong/50 px-4 py-2 text-[14px] leading-snug hover:border-ink">
                  <span className="text-ink-60">{l.soort === "pagina" ? "Pagina ›" : l.trail ? `${l.trail} ›` : "Categorie ›"}</span>
                  <span className="font-medium">{l.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {toonLijst && listing && (
        <div className="mt-6">
          <Suspense>
            <ProductListing data={listing} showOffersToggle={false} />
          </Suspense>
        </div>
      )}

      {!toonLijst && (
        <div className="mt-6">
          <div className="rounded-[var(--radius-tile)] bg-cloud px-6 py-12 text-center">
            <Icon name="search" size={36} className="mx-auto text-ink-60" />
            {mislukt ? (
              <>
                <p className="mt-4 text-lg font-medium">Zoeken lukt even niet</p>
                <p className="mt-1 text-ink-80">Er ging iets mis bij het ophalen van de resultaten. Probeer het over enkele ogenblikken opnieuw, of blader door onze afdelingen.</p>
                <Link href={routes.search(q)} className="btn btn-primary mt-6">
                  Opnieuw proberen
                </Link>
              </>
            ) : (
              <>
                <p className="mt-4 text-lg font-medium">{q ? `Geen producten gevonden voor “${q}”` : "Waar bent u naar op zoek?"}</p>
                <p className="mt-1 text-ink-80">{q ? "Controleer de spelling of probeer een algemener woord." : "Typ een zoekterm in het zoekveld bovenaan, of kies een suggestie."}</p>
                <ul role="list" className="mt-6 flex flex-wrap justify-center gap-2">
                  {SUGGESTIES.map((s) => (
                    <li key={s}>
                      <Link href={routes.search(s)} className="flex min-h-10 items-center rounded-full bg-white px-4 text-[14px] ring-1 ring-line hover:ring-ink">
                        {s}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <h2 className="section-title mt-14">Of blader door onze afdelingen</h2>
          <div className="mt-8 grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-6">
            {roots.map(({ node, image }, i) => (
              <CategoryTile key={node.id} href={routes.category(node)} title={node.name} image={image} tone={i} className="aspect-[4/5]" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
