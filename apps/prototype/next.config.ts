import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// Eén .env in de repo-root is de bron van waarheid (lokaal). Op Vercel bestaat dat bestand
// niet en gelden de projectvariabelen; bestaande variabelen worden nooit overschreven.
try {
  for (const regel of fs.readFileSync(path.resolve(process.cwd(), "../../.env"), "utf8").split("\n")) {
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* geen .env — Vercel of CI */
}

/**
 * Content-Security-Policy (B27). Enkel eigen scripts en stijlen; beelden van het Shopify-CDN.
 * 'unsafe-inline' voor scripts is nodig zolang de pagina's statisch/ISR gerenderd worden: Next
 * zet zijn RSC-gegevens in inline scripts, en nonces vereisen volledig dynamische rendering.
 * De kassa is een gewone navigatie naar Shopify en valt niet onder deze policy.
 */
const dev = process.env.NODE_ENV !== "production";
// Metingen en cookiemelding (docs/analytics-en-cookies.md), enkel met de schakelaar aan:
// - scripts van Shopify's CDN (cdn.shopify.com);
// - de metingen zelf naar Shopify's meetserver (monorail-edge), pas na toestemming.
// De toestemming loopt via ons eigen domein. Shopify's eigen scripttelemetrie
// (otlp-http-production.shopifysvc.com) laten we bewust geblokkeerd: niet nodig, en ze vertrekt vóór elke keuze.
const metenAan = process.env.SHOPIFY_ANALYTICS === "1" || process.env.SHOPIFY_ANALYTICS === "test";
const shopifyScripts = metenAan ? " https://cdn.shopify.com" : "";
const shopifyMeetserver = metenAan ? " https://monorail-edge.shopifysvc.com" : "";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${shopifyScripts}${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.shopify.com",
  "font-src 'self' data:",
  `connect-src 'self'${shopifyMeetserver}${dev ? " ws: wss:" : ""}`,
  "frame-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  // De schuine streep achteraan handelt src/proxy.ts af: een oude URL van brunic.be (altijd met
  // streep) gaat dan in één 308 naar haar bestemming, al de rest zoals voorheen naar de URL zonder streep.
  skipTrailingSlashRedirect: true,
  // De catalogus-momentopname (Shopify, zie scripts/voor-build.mjs) wordt at runtime met fs
  // gelezen; zonder deze regel zit ze niet in de serverless-functies op Vercel.
  outputFileTracingIncludes: { "/**": ["./.data/shopify-catalogus.json"] },
  experimental: {
    // Aanvraagformulier met foto's: de browser verkleint ze eerst (max. ±5 × 400 kB).
    serverActions: { bodySizeLimit: "4mb" },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    // Gewone pagina's van de oude WooCommerce-site (brunic.be, page-sitemap 20/10/2026).
    // Producten en categorieën: src/lib/site/oude-urls.ts.
    // Oude typepagina → het blok van dat type op de dienstpagina (ankers: SERVICES › sections in
    // src/data/content.ts). Types die Brunic nog niet bevestigde, landen bovenaan de pagina.
    const raamdecoratie: Record<string, string> = {
      raamdecoratie: "",
      rolgordijnen: "#rolgordijnen",
      duorolgordijnen: "#rolgordijnen",
      "plisse-gordijnen": "#plisses",
      "dubbele-plissegordijnen": "#plisses",
      "verticale-jaloezieen": "#jaloezieen",
      "horizontale-houten-jaloezieen": "#jaloezieen",
      "horizontale-aluminium-jaloezieen": "#jaloezieen",
      vouwgordijnen: "#vouwgordijnen",
      "velux-zonnewering": "",
      shutters: "",
      paneelgordijnen: "",
      "geweven-hout": "",
      "smart-blinds": "",
      sheerlight: "",
    };
    const oudeSite: [string, string][] = [
      ["/webshop", "/catalogus"],
      ["/shop", "/catalogus"],
      ["/product-tag/:pad*", "/catalogus"],
      ["/contact", "/winkel-en-contact"],
      ["/vacatures", "/info/over-ons"],
      ["/sfeerbeelden", "/inspiratie-en-advies"],
      ["/gift-card", "/winkel-en-contact"],
      ["/gift-card-balance", "/winkel-en-contact"],
      ["/stockverkoop", "/aanbiedingen"],
      ["/zomersolden", "/aanbiedingen"],
      ["/tapijten-op-maat", "/op-maat-en-plaatsing/tapijt-op-maat"],
      ["/gordijnen-en-overgordijnen", "/op-maat-en-plaatsing/gordijnen-op-maat"],
      ["/algemene-voorwaarden", "/info/algemene-voorwaarden"],
      ["/privacybeleid", "/info/privacy"],
      ["/privacy-policy", "/info/privacy"],
      ["/cookiebeleid", "/info/cookies"],
      ["/winkelwagen", "/winkelmand"],
      ["/afrekenen", "/winkelmand"],
      ["/mijn-account/:pad*", "/verlanglijst"],
      ["/approval-rejection", "/"],
      ...Object.entries(raamdecoratie).map(([p, anker]): [string, string] => [`/${p}`, `/op-maat-en-plaatsing/raamdecoratie-op-maat${anker}`]),
    ];
    // De oude site schreef elke URL met een schuine streep achteraan (/contact/). Met de variant
    // erbij gaat zo'n URL in één stap naar haar bestemming, niet eerst naar /contact.
    const metSlash = oudeSite.flatMap(([source, destination]): [string, string][] => [
      [source, destination],
      [`${source}/`, destination],
    ]);
    return [
      // Geen klantaccounts: offertes en de verlanglijst werken zonder login.
      { source: "/account", destination: "/verlanglijst", permanent: true },
      { source: "/info/over-dit-prototype", destination: "/info/over-ons", permanent: true },
      // Desso is een merk van Tarkett en heeft geen eigen merkpagina (src/data/merken.ts → MERK_ONDER).
      { source: "/merken/desso", destination: "/merken/tarkett", permanent: true },
      ...metSlash.map(([source, destination]) => ({ source, destination, permanent: true })),
      // Zoeken op de oude site: /?s=behang → /zoeken?q=behang
      { source: "/", has: [{ type: "query" as const, key: "s", value: "(?<zoek>.+)" }], destination: "/zoeken?q=:zoek", permanent: true },
    ];
  },
};

export default nextConfig;
