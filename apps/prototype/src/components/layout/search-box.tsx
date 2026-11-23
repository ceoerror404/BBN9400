"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ImageSlot } from "@/components/ui/image-slot";
import { Price } from "@/components/catalog/price";
import type { Zoeksuggesties } from "@/lib/zoeken/zoeken";
import { routes } from "@/lib/routes";

/** Vanaf zoveel tekens vraagt het veld suggesties op. */
const MIN_TEKENS = 2;
/** Wachttijd na de laatste toetsaanslag (ms): wie doortypt, stuurt geen verzoek per letter. */
const VERTRAGING = 220;

/** Vaste uitnodiging in het veld: voor schermlezers, zonder JavaScript en bij "minder beweging". */
const PLACEHOLDER = "Zoek een product of categorie";
/** In een leeg veld typt de site deze uitnodigingen om de beurt; het gedeelde begin blijft staan. */
const UITNODIGINGEN = ["Zoek een product", "Zoek een categorie"];
/** Tempo van de typende uitnodiging (ms): per getypte letter, per gewiste letter, rust bij een volledige zin. */
const TYPEN = 85;
const WISSEN = 40;
const RUST = 2200;

/**
 * Typende uitnodiging over het lege zoekveld: "Zoek een product", dan "Zoek een categorie", telkens
 * letter per letter. Ze vertrekt van de vaste placeholder, zodat er bij het laden niets verspringt.
 * Puur decoratief (aria-hidden): de echte placeholder blijft onzichtbaar in het veld staan.
 */
function TypendeUitnodiging() {
  const [tekst, setTekst] = useState(PLACEHOLDER);
  const [beurt, setBeurt] = useState(0);
  const doel = UITNODIGINGEN[beurt % UITNODIGINGEN.length];
  const rust = tekst === doel || tekst === PLACEHOLDER;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Eerst wissen tot wat er staat het begin van de volgende zin is, dan verder typen.
    const typen = doel.startsWith(tekst);
    const t = window.setTimeout(
      () => {
        if (tekst === doel) setBeurt((b) => b + 1);
        else setTekst(typen ? doel.slice(0, tekst.length + 1) : tekst.slice(0, -1));
      },
      rust ? RUST : typen ? TYPEN : WISSEN,
    );
    return () => window.clearTimeout(t);
  }, [tekst, doel, rust]);

  return (
    // Zelfde plaats en lettergrootte als de tekst in het veld (rand + pl-12 links, pr-11 rechts).
    <span aria-hidden="true" className="veldtekst pointer-events-none absolute inset-y-0 left-[49px] right-[45px] flex items-center text-sm text-ink-60 motion-reduce:hidden">
      <span className="overflow-hidden text-ellipsis whitespace-pre">{tekst}</span>
      <span className={`ml-px h-[1.2em] w-[1.5px] shrink-0 bg-ink-60 ${rust ? "animate-knipper" : ""}`} />
    </span>
  );
}

/**
 * Groot zoekveld met suggesties tijdens het typen. De suggesties komen van Shopify Predictive
 * Search, via /api/zoeken: producten, en waar Shopify ze geeft ook zoektermen, categorieën en
 * pagina's. Enter of "Bekijk alle resultaten" opent de zoekpagina. Het paneel toont geen aantal:
 * Shopify geeft hier hoogstens tien suggesties, geen totaal.
 */
export function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(pathname === routes.search() ? (params.get("q") ?? "") : "");
  const [open, setOpen] = useState(false);
  // Met de focus in het veld staat de uitnodiging stil: de vaste placeholder, zonder getyp naast de cursor.
  const [inVeld, setInVeld] = useState(false);
  // Suggesties en fouten onthouden bij welke zoekterm ze horen: wat niet bij de huidige term hoort, telt als "nog bezig".
  const [resultaat, setResultaat] = useState<{ term: string; data: Zoeksuggesties } | null>(null);
  const [foutBij, setFoutBij] = useState<string | null>(null);
  const [poging, setPoging] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = useId();
  // Escape in het paneel zet de focus terug in het veld: dat mag het paneel niet opnieuw openen.
  const focusZonderOpenen = useRef(false);

  const term = q.trim();
  const zoekt = term.length >= MIN_TEKENS;
  const fout = zoekt && foutBij === term;
  const bezig = zoekt && !fout && resultaat?.term !== term;
  const data = zoekt && !fout ? resultaat?.data : undefined;
  const leeg = Boolean(data) && !bezig && data!.products.length + data!.categories.length + data!.pages.length + data!.queries.length === 0;
  const metZijkolom = Boolean(data) && data!.queries.length + data!.categories.length + data!.pages.length > 0;

  /** Pijltoetsen: van het veld naar de suggesties en ertussen; vanaf de eerste terug naar het veld. */
  const moveFocus = (dir: 1 | -1) => {
    const items = Array.from(panel.current?.querySelectorAll<HTMLElement>("[data-suggestie]") ?? []);
    if (items.length === 0) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i === -1) items[dir === 1 ? 0 : items.length - 1].focus();
    else if (i + dir < 0) input.current?.focus();
    else items[Math.min(items.length - 1, i + dir)].focus();
  };

  // Suggesties ophalen, even na de laatste toetsaanslag. Bij elke nieuwe zoekterm wordt het vorige
  // verzoek afgebroken; een antwoord dat toch nog binnenkomt, wordt genegeerd. Zo overschrijft een
  // traag antwoord op een oudere term nooit de suggesties van een nieuwere.
  useEffect(() => {
    const voor = q.trim();
    if (voor.length < MIN_TEKENS) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      fetch(`/api/zoeken?q=${encodeURIComponent(voor)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? (r.json() as Promise<Zoeksuggesties>) : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((d) => {
          if (ctrl.signal.aborted) return;
          setResultaat({ term: voor, data: d });
          setFoutBij(null);
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setFoutBij(voor);
        });
    }, VERTRAGING);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q, poging]);

  // Sluiten bij klik buiten het veld en bij navigatie.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  useEffect(() => {
    setOpen(false);
    // Op de zoekpagina volgt het veld de actuele zoekterm (bv. na een klik op een suggestie).
    if (pathname === routes.search()) setQ(params.get("q") ?? "");
  }, [pathname, params]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    input.current?.blur();
    router.push(routes.search(term || undefined));
  };

  const showPanel = open && zoekt;
  const typt = !q && !inVeld;
  const melding = !showPanel ? "" : fout ? "De suggesties zijn tijdelijk niet beschikbaar." : bezig ? "Bezig met zoeken." : leeg ? `Geen suggesties voor ${term}.` : "Suggesties beschikbaar. Blader met de pijltjestoetsen.";
  const rij = "block rounded-lg px-3 py-2.5 text-[15px] hover:bg-mist focus-visible:bg-mist";

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <form role="search" onSubmit={submit} className="relative">
        <label htmlFor={`${panelId}-input`} className="sr-only">
          Zoeken in de catalogus
        </label>
        <Icon name="search" size={22} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          ref={input}
          id={`${panelId}-input`}
          type="search"
          value={q}
          maxLength={120}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setInVeld(true);
            if (focusZonderOpenen.current) focusZonderOpenen.current = false;
            else setOpen(true);
          }}
          onBlur={() => setInVeld(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault(); // anders wist de browser het zoekveld
              setOpen(false);
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              const dir = e.key === "ArrowDown" ? 1 : -1;
              if (showPanel) moveFocus(dir);
              else {
                // Het paneel was dicht (na Escape): eerst openen, dan pas staat er iets om naartoe te gaan.
                setOpen(true);
                requestAnimationFrame(() => moveFocus(dir));
              }
            }
          }}
          role="combobox"
          aria-autocomplete="list"
          placeholder={PLACEHOLDER}
          autoComplete="off"
          aria-expanded={showPanel}
          aria-controls={`${panelId}-panel`}
          // Tekstgrootte op aanraakschermen: 16px via globals.css, anders zoomt iOS in bij focus.
          // Terwijl de uitnodiging typt, is de echte placeholder doorzichtig (behalve bij "minder beweging").
          // Bewust geen andere kleur of rand bij focus (vraag Alexander 23/11): de tekstcursor toont de focus.
          className={`h-[46px] w-full text-ellipsis rounded-[var(--radius-field)] border border-line-strong/70 bg-mist pl-12 pr-11 text-sm outline-none [&::-webkit-search-cancel-button]:hidden ${typt ? "motion-safe:placeholder:text-transparent motion-reduce:placeholder:text-ink-60" : "placeholder:text-ink-60"}`}
        />
        {typt && <TypendeUitnodiging />}
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              input.current?.focus();
            }}
            className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full hover:bg-sand"
            aria-label="Zoekterm wissen"
          >
            <Icon name="close" size={18} />
          </button>
        )}
      </form>

      {/* Schermlezers horen wat er in het paneel gebeurt, ook terwijl de focus in het veld blijft. */}
      <p role="status" className="sr-only">
        {melding}
      </p>

      {showPanel && (
        <div
          ref={panel}
          role="region"
          aria-label="Zoeksuggesties"
          aria-busy={bezig}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              moveFocus(e.key === "ArrowDown" ? 1 : -1);
            }
            if (e.key === "Escape") {
              focusZonderOpenen.current = true;
              setOpen(false);
              input.current?.focus();
            }
          }}
          id={`${panelId}-panel`}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[70vh] overflow-y-auto rounded-[var(--radius-tile)] bg-white p-4 shadow-[var(--shadow-pop)] ring-1 ring-line lg:-left-[110px] lg:-right-[260px] lg:p-5"
        >
          {fout ? (
            <div className="py-6 text-center">
              <p className="font-medium">De suggesties zijn tijdelijk niet beschikbaar</p>
              <p className="mt-1 text-ink-60">Probeer het opnieuw, of druk op Enter om te zoeken.</p>
              <button
                type="button"
                data-suggestie
                onClick={() => {
                  setFoutBij(null);
                  setPoging((p) => p + 1);
                }}
                className="btn btn-outline btn-sm mt-4"
              >
                Opnieuw proberen
              </button>
            </div>
          ) : !data ? (
            <p className="py-6 text-center text-ink-60">Bezig met zoeken…</p>
          ) : leeg ? (
            <div className="py-6 text-center">
              <p className="font-medium">Geen suggesties voor “{term}”</p>
              <p className="mt-1 text-ink-60">Probeer een ander woord, bv. rolgordijn, behang of tapijt.</p>
            </div>
          ) : (
            // Tijdens het ophalen blijven de vorige suggesties gedimd staan: het paneel verspringt niet bij elke letter.
            <div className={`grid gap-6 transition-opacity duration-150 motion-reduce:transition-none ${metZijkolom ? "lg:grid-cols-[1fr_1.4fr]" : ""} ${bezig ? "opacity-50" : ""}`}>
              {metZijkolom && (
                <div className="space-y-5">
                  {data.queries.length > 0 && (
                    <div>
                      <p className="mb-2 text-lg font-medium">Suggesties</p>
                      <ul role="list">
                        {data.queries.map((s) => (
                          <li key={s}>
                            <Link href={routes.search(s)} data-suggestie className={`${rij} flex items-center gap-2`}>
                              <Icon name="search" size={16} className="shrink-0 text-ink-60" />
                              {s}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {data.categories.length > 0 && (
                    <div>
                      <p className="mb-2 text-lg font-medium">Categorieën</p>
                      <ul role="list">
                        {data.categories.map((c) => (
                          <li key={c.id}>
                            <Link href={c.href} data-suggestie className={rij}>
                              <span className="font-medium">{c.name}</span>
                              {c.trail && <span className="block text-xs text-ink-60">{c.trail}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {data.pages.length > 0 && (
                    <div>
                      <p className="mb-2 text-lg font-medium">Pagina’s</p>
                      <ul role="list">
                        {data.pages.map((p) => (
                          <li key={p.href}>
                            <Link href={p.href} data-suggestie className={`${rij} font-medium`}>
                              {p.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-lg font-medium">Producten</p>
                  <Link href={routes.search(term)} data-suggestie className="btn btn-outline btn-sm">
                    Bekijk alle resultaten <Icon name="chevronRight" size={16} />
                  </Link>
                </div>
                {data.products.length === 0 && <p className="text-ink-60">Geen producten gevonden.</p>}
                <ul role="list" className="space-y-1">
                  {data.products.map((p) => (
                    <li key={p.id}>
                      <Link href={routes.product(p.slug)} data-suggestie className="flex items-center gap-4 rounded-xl p-2 hover:bg-mist focus-visible:bg-mist">
                        <ImageSlot src={p.image?.src} alt="" sizes="96px" className="aspect-[4/3] w-24 shrink-0 rounded-xl" />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium text-ink-60">{[p.brand ?? "Brunic", p.type].filter(Boolean).join(" · ")}</span>
                          <span className="line-clamp-2 text-sm">{p.title}</span>
                          <Price card={p} size="sm" className="mt-1" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
