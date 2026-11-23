import type { Metadata, Viewport } from "next";
import { Fraunces, Poppins } from "next/font/google";
import { Suspense } from "react";
import { ShopifyRuntime } from "@/components/analytics/shopify-runtime";
import { PaginaTracker } from "@/components/analytics/trackers";
import { CartUiProvider } from "@/components/commerce/cart-ui";
import { CookieMelding } from "@/components/consent/cookie-melding";
import { analyticsStand, SHOPIFY_VALUTA, shopifyI18n } from "@/lib/shopify/hydrogen";
import { VloeiendeAnkers } from "@/components/ui/vloeiende-ankers";
import { SITE } from "@/lib/site/config";
import { BEELD } from "@/data/beelden";
import "./globals.css";

// next/font host de fonts zelf mee in de build: geen runtime-request naar Google.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-poppins" });
const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], display: "swap", variable: "--font-fraunces" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Brunic Ninove — gordijnen op maat, behang, vinyl, vasttapijt & tapijten", template: "%s · Brunic Ninove" },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "nl_BE",
    siteName: SITE.name,
    images: [{ url: `${BEELD.hero.src}&width=1200`, width: 1200, alt: BEELD.hero.alt }],
  },
  // Indexeren staat enkel aan op productie (SITE_INDEXEREN=1), zodat previews en de
  // dev-store-versie nooit in Google belanden.
  robots: process.env.SITE_INDEXEREN === "1" ? { index: true, follow: true } : { index: false, follow: false },
  icons: { icon: "/brand/mascotte.png", apple: "/brand/mascotte.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

/**
 * Metingen en cookiemelding (docs/analytics-en-cookies.md) staan enkel aan met SHOPIFY_ANALYTICS
 * én een shop-ID. Naar Shopify's rapporten versturen gebeurt alleen op productie, zodat lokaal
 * en previewverkeer de cijfers niet vervuilen ("test" dwingt het af om te verifiëren).
 */
function metingen() {
  const stand = analyticsStand();
  const shopId = process.env.SHOPIFY_SHOP_ID;
  const winkelDomein = process.env.SHOPIFY_STORE_DOMAIN;
  if (stand === "uit" || !shopId || !winkelDomein) return null;
  return { shopId, winkelDomein, versturen: stand === "test" || process.env.VERCEL_ENV === "production" };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const meten = metingen();
  const { language, country } = shopifyI18n.defaultLocale;
  return (
    <html lang="nl-BE" className={`${poppins.variable} ${fraunces.variable}`}>
      {meten && (
        <head>
          <ShopifyRuntime shopId={meten.shopId} winkelDomein={meten.winkelDomein} taal={language} land={country} valuta={SHOPIFY_VALUTA} versturen={meten.versturen} />
        </head>
      )}
      <body>
        {/* Vooraan in de pagina: toetsenbord en schermlezer komen de melding eerst tegen. */}
        {meten && <CookieMelding />}
        {meten && (
          <Suspense fallback={null}>
            <PaginaTracker />
          </Suspense>
        )}
        <VloeiendeAnkers />
        <CartUiProvider>{children}</CartUiProvider>
      </body>
    </html>
  );
}
