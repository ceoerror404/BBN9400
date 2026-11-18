"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { ALLES_AAN, ALLES_UIT, CATEGORIEEN, type Keuze } from "@/lib/consent/regels";
import { bewaarKeuze, openVoorkeuren, sluitVoorkeuren, useToestemming } from "@/lib/consent/toestemming";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site/config";

const ACTIEF = CATEGORIEEN.filter((c) => c.actief);

/**
 * Cookiemelding + voorkeurenpaneel. De melding verschijnt zodra Shopify's privacy-API geladen is
 * en er geen geldige keuze is; ze ligt over de pagina (geen verspringende inhoud) en blokkeert
 * niets: wie ze laat staan, wordt niet gemeten. Aanvaarden en weigeren staan naast elkaar en
 * zien er hetzelfde uit; scrollen, sluiten of doorklikken telt niet als toestemming.
 */
export function CookieMelding() {
  const { geladen, keuze, paneel, bezig, fout } = useToestemming();
  const titel = useId();

  return (
    <>
      {paneel === "melding" && (
        <section
          aria-labelledby={titel}
          className="fixed inset-x-0 bottom-0 z-[75] border-t border-line-strong/40 bg-white shadow-[0_-12px_40px_-16px_rgb(19_12_12/0.28)] print:hidden"
        >
          <div className="shell flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:gap-8">
            <div className="min-w-0 text-[14px] leading-relaxed text-ink-80">
              <h2 id={titel} className="text-base font-semibold text-ink">
                Mogen wij cookies gebruiken?
              </h2>
              <p className="mt-1">
                {SITE.legalName} wil met cookies meten hoe deze webshop gebruikt wordt. Dat doen wij enkel met uw toestemming. Weigert u, dan werkt de webshop
                gewoon verder. U kunt uw keuze altijd wijzigen via ‘Cookievoorkeuren’ onderaan elke pagina.{" "}
                <Link href={routes.info("cookies")} className="font-medium text-ink underline underline-offset-2">
                  Lees ons cookiebeleid
                </Link>
                .
              </p>
              {fout && (
                <p role="alert" className="mt-2 text-brand-dark">
                  {fout}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button type="button" disabled={bezig} onClick={() => void bewaarKeuze(ALLES_AAN)} className="btn btn-primary btn-sm">
                Alles accepteren
              </button>
              <button type="button" disabled={bezig} onClick={() => void bewaarKeuze(ALLES_UIT)} className="btn btn-primary btn-sm">
                Niet-noodzakelijke weigeren
              </button>
              <button type="button" disabled={bezig} onClick={openVoorkeuren} className="btn btn-outline btn-sm">
                Voorkeuren instellen
              </button>
            </div>
          </div>
        </section>
      )}

      <Drawer open={paneel === "voorkeuren"} onClose={sluitVoorkeuren} title="Cookievoorkeuren">
        {/* Bij elk openen opnieuw opgebouwd: de schakelaars starten op de vastgelegde keuze (of uit). */}
        {paneel === "voorkeuren" && <Voorkeuren geladen={geladen} start={keuze ?? ALLES_UIT} bezig={bezig} fout={fout} />}
      </Drawer>
    </>
  );
}

function Voorkeuren({ geladen, start, bezig, fout }: { geladen: boolean; start: Keuze; bezig: boolean; fout: string }) {
  const [keuze, setKeuze] = useState<Keuze>(start);

  if (!geladen) {
    return (
      <div className="space-y-3 p-5 text-[14px] leading-relaxed text-ink-80">
        <p>Uw voorkeuren kunnen nu niet worden geladen. Mogelijk blokkeert uw browser of een extensie het script daarvoor.</p>
        <p>Zolang dat zo is, plaatsen wij geen statistische cookies en meten wij uw bezoek niet. De webshop werkt gewoon verder.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 space-y-5 p-5 text-[14px] leading-relaxed text-ink-80">
        <p>
          Kies waarvoor wij cookies mogen gebruiken. U kunt uw keuze op elk moment aanpassen of intrekken; zij geldt 6 maanden, daarna vragen wij het opnieuw.{" "}
          <Link href={routes.info("cookies")} onClick={sluitVoorkeuren} className="font-medium text-ink underline underline-offset-2">
            Cookiebeleid
          </Link>
        </p>

        <div className="rounded-[var(--radius-field)] border border-line p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="font-medium text-ink">Noodzakelijk</p>
            <p className="text-[13px] text-ink-60">Altijd actief</p>
          </div>
          <p className="mt-1">Nodig om de webshop te laten werken: uw winkelmand, uw verlanglijst, de beveiligde kassa en het onthouden van deze keuze.</p>
        </div>

        {ACTIEF.map((c) => (
          <Schakelaar key={c.sleutel} titel={c.titel} uitleg={c.uitleg} aan={keuze[c.sleutel]} onChange={(aan) => setKeuze((k) => ({ ...k, [c.sleutel]: aan }))} />
        ))}

        {fout && (
          <p role="alert" className="text-brand-dark">
            {fout}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 grid gap-2 border-t border-line bg-white p-5">
        <button type="button" disabled={bezig} onClick={() => void bewaarKeuze(keuze)} className="btn btn-primary w-full">
          {bezig ? "Even geduld…" : "Mijn keuze bewaren"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={bezig} onClick={() => void bewaarKeuze(ALLES_AAN)} className="btn btn-outline btn-sm w-full">
            Alles accepteren
          </button>
          <button type="button" disabled={bezig} onClick={() => void bewaarKeuze(ALLES_UIT)} className="btn btn-outline btn-sm w-full">
            Alles weigeren
          </button>
        </div>
      </div>
    </div>
  );
}

function Schakelaar({ titel, uitleg, aan, onChange }: { titel: string; uitleg: string; aan: boolean; onChange: (aan: boolean) => void }) {
  const id = useId();
  return (
    <div className="rounded-[var(--radius-field)] border border-line p-4">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="font-medium text-ink">
          {titel}
        </label>
        <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
          <input
            id={id}
            type="checkbox"
            role="switch"
            checked={aan}
            onChange={(e) => onChange(e.target.checked)}
            aria-describedby={`${id}-uitleg`}
            className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
          />
          <span aria-hidden="true" className="h-7 w-12 rounded-full bg-line-strong/60 transition-colors peer-checked:bg-success peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink motion-reduce:transition-none" />
          <span aria-hidden="true" className="pointer-events-none absolute left-1 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5 motion-reduce:transition-none" />
        </span>
      </div>
      <p id={`${id}-uitleg`} className="mt-1">
        {uitleg} <span className="text-ink-60">{aan ? "Aan" : "Uit"}</span>
      </p>
    </div>
  );
}
