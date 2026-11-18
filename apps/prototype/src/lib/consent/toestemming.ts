"use client";

import { useSyncExternalStore } from "react";
import { geldigeKeuze, maakStempel, naarShopify, STEMPEL_SLEUTEL, type Keuze, type ShopifyToestemming } from "./regels";

/**
 * Toestemming voor niet-noodzakelijke cookies — één plek voor de hele site.
 *
 * De keuze leeft in Shopify (Customer Privacy API, window.Shopify.customerPrivacy): die bepaalt
 * of Shopify Analytics mag meten en geeft de keuze door aan de kassa. Hier staat géén eigen
 * ja/nee die daarvan kan afwijken; deze module onthoudt enkel wat Shopify zegt en of de
 * melding open staat. Datum en versie van de keuze bewaren we in Shopify's eigen
 * toestemmingsgegevens (STEMPEL_SLEUTEL), om na 6 maanden opnieuw te vragen.
 *
 * Laadt Shopify's script niet (adblocker, storing), dan is `geladen` false: er wordt niets
 * gemeten en de site werkt gewoon verder.
 */

type PrivacyApi = {
  currentVisitorConsent: () => ShopifyToestemming;
  setTrackingConsent: (toestemming: Record<string, unknown>, klaar?: (resultaat?: { error?: unknown }) => void) => unknown;
  getTrackingConsentMetafield?: (sleutel: string) => unknown;
};

const privacyApi = (): PrivacyApi | undefined => (typeof window === "undefined" ? undefined : (window.Shopify?.customerPrivacy as unknown as PrivacyApi | undefined));

export type Toestand = {
  /** Shopify's privacy-API is geladen en de toestemming is uitgelezen. */
  geladen: boolean;
  /** De geldige keuze, of null zolang er geen is (dan is alles geblokkeerd). */
  keuze: Keuze | null;
  paneel: "dicht" | "melding" | "voorkeuren";
  bezig: boolean;
  fout: string;
};

let toestand: Toestand = { geladen: false, keuze: null, paneel: "dicht", bezig: false, fout: "" };
const SERVER: Toestand = toestand;
const luisteraars = new Set<() => void>();
const zet = (deel: Partial<Toestand>) => {
  toestand = { ...toestand, ...deel };
  luisteraars.forEach((l) => l());
};

/** Wie wacht tot de bezoeker gekozen heeft (Shopify's analytics-bus, zie toestemmingSetup). */
let eersteKeuze: (() => void) | null = null;

function leesUitShopify(): Keuze | null {
  const api = privacyApi();
  if (!api) return null;
  try {
    return geldigeKeuze(api.currentVisitorConsent(), api.getTrackingConsentMetafield?.(STEMPEL_SLEUTEL), new Date());
  } catch {
    return null;
  }
}

/**
 * Koppeling met Shopify's analytics-bus (consent-modus "custom-banner"): Shopify roept dit één
 * keer aan zodra de privacy-API geladen is en houdt alle metingen tegen tot de belofte rond is.
 * Die komt pas rond wanneer er een geldige keuze is: een bewaarde, of de eerste klik in de melding.
 */
export function toestemmingSetup(): Promise<void> {
  const keuze = leesUitShopify();
  if (keuze) {
    zet({ geladen: true, keuze });
    return Promise.resolve();
  }
  zet({ geladen: true, keuze: null, paneel: toestand.paneel === "voorkeuren" ? "voorkeuren" : "melding" });
  return new Promise((klaar) => {
    eersteKeuze = klaar;
  });
}

/** Legt de keuze vast bij Shopify. Enkel na een klik van de bezoeker, nooit automatisch. */
export async function bewaarKeuze(keuze: Keuze): Promise<void> {
  const api = privacyApi();
  if (!api || toestand.bezig) return;
  zet({ bezig: true, fout: "" });
  try {
    await new Promise<void>((klaar, mislukt) => {
      const tijd = setTimeout(() => mislukt(new Error("geen antwoord")), 15_000);
      const resultaat = api.setTrackingConsent({ ...naarShopify(keuze), metafields: [{ key: STEMPEL_SLEUTEL, value: maakStempel(new Date()) }] }, (r) => {
        clearTimeout(tijd);
        if (r && r.error) mislukt(new Error("geweigerd"));
        else klaar();
      });
      // Nieuwere versies geven een Promise terug; een afwijzing mag niet onopgemerkt blijven.
      if (resultaat && typeof (resultaat as Promise<unknown>).then === "function") (resultaat as Promise<unknown>).catch(mislukt);
    });
    // Wat geldt, is wat Shopify nu zegt — niet wat wij vroegen.
    const vastgelegd = leesUitShopify();
    if (!vastgelegd) throw new Error("niet vastgelegd");
    zet({ bezig: false, keuze: vastgelegd, paneel: "dicht" });
    eersteKeuze?.();
    eersteKeuze = null;
  } catch {
    zet({ bezig: false, fout: "Uw keuze kon niet worden bewaard. Probeer het opnieuw; tot dan plaatsen wij geen statistische cookies." });
  }
}

export const openVoorkeuren = () => zet({ paneel: "voorkeuren", fout: "" });
/** Sluiten is geen keuze: zonder geldige keuze komt de melding terug. */
export const sluitVoorkeuren = () => zet({ paneel: toestand.geladen && !toestand.keuze ? "melding" : "dicht", fout: "" });

export function useToestemming(): Toestand {
  return useSyncExternalStore(
    (l) => {
      luisteraars.add(l);
      return () => luisteraars.delete(l);
    },
    () => toestand,
    () => SERVER,
  );
}
