import Link from "next/link";
import type { CategorieVraag } from "@/data/categorie-seo";
import { Accordion } from "@/components/ui/accordion";

/**
 * Koopvragen onder de productlijst van een categorie (src/data/categorie-seo.ts).
 * <details>: de antwoorden staan in de server-HTML, ook dichtgeklapt.
 */
export function CategoryFaq({ naam, vragen }: { naam: string; vragen: CategorieVraag[] }) {
  if (vragen.length === 0) return null;
  return (
    <section aria-labelledby="categorie-vragen" className="mx-auto mt-16 max-w-[860px]">
      <h2 id="categorie-vragen" className="text-xl font-medium lg:text-2xl">
        Veelgestelde vragen over {naam.toLowerCase()}
      </h2>
      <div className="mt-4">
        {vragen.map((v) => (
          <Accordion key={v.q} title={v.q} variant="line">
            <p>{v.a}</p>
            {v.link && (
              <p className="mt-3">
                <Link href={v.link.href} className="font-medium text-ink underline underline-offset-2">
                  {v.link.label}
                </Link>
              </p>
            )}
          </Accordion>
        ))}
      </div>
    </section>
  );
}
