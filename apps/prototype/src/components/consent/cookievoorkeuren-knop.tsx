"use client";

import { openVoorkeuren } from "@/lib/consent/toestemming";

/** Vaste link onderaan elke pagina: keuze bekijken, aanpassen of intrekken. */
export function CookievoorkeurenKnop({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openVoorkeuren} className={className}>
      Cookievoorkeuren
    </button>
  );
}
