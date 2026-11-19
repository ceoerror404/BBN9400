import type { Metadata } from "next";
import Link from "next/link";
import { getBrands } from "@/lib/catalog/brands";
import { productCount } from "@/lib/catalog/product";
import { routes } from "@/lib/routes";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CategoryHeader } from "@/components/catalog/category-header";
import { BrandTile } from "@/components/catalog/brand-tile";

export const metadata: Metadata = {
  title: "Onze merken",
  description: "De merken van Brunic: gordijnstoffen, behang, vasttapijt en tapijten van onze vaste leveranciers.",
  alternates: { canonical: routes.brands() },
};

/** Alle merken (leveranciers) uit de catalogus, met een sfeerfoto uit hun eigen collectie. */
export default async function BrandsPage() {
  const brands = await getBrands();
  return (
    <div className="shell-inset">
      <Breadcrumbs items={[{ label: "Merken" }]} />
      <CategoryHeader
        title="Onze merken"
        intro="Wij werken met leveranciers die we al jaren kennen en vertrouwen. Hieronder vindt u hun collecties in onze webshop; veel stalen en stalenboeken kunt u ook in de winkel in Ninove bekijken."
      />
      <ul role="list" className="mt-6 grid grid-cols-2 gap-x-1 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {brands.map((b, i) => (
          <li key={b.slug}>
            <BrandTile href={routes.brand(b.slug)} name={b.name} image={b.image} logo={b.logo} tone={i} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="aspect-[4/5]" />
            {/* Onderschrift: merknaam + aantal, de belangrijkste producttypes als labels (stijl van de artikelkaarten).
                Zelfde bestemming als de tegel: buiten de tabvolgorde en verborgen voor schermlezers, de tegel draagt de link. */}
            <Link href={routes.brand(b.slug)} tabIndex={-1} aria-hidden="true" className="group mt-3 block px-1">
              {/* Smalle kolommen (gsm): het aantal onder de naam, zodat de naam niet afgekapt wordt. */}
              <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <span className="text-[15px] font-medium leading-snug text-ink group-hover:underline sm:truncate">{b.name}</span>
                <span className="shrink-0 text-[13px] tabular-nums text-ink-60">{productCount(b.count)}</span>
              </span>
              {b.types.length > 0 && (
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {b.types.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full bg-sand px-2.5 py-0.5 text-[12px] text-ink-80">
                      {t}
                    </span>
                  ))}
                  {b.types.length > 3 && <span className="px-1 py-0.5 text-[12px] text-ink-60">+{b.types.length - 3}</span>}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
