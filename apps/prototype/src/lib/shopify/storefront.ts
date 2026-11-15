/**
 * Shopify Storefront API — serverzijdig (kassa-overdracht, zoeken). Een privé-token (shpat_…)
 * gaat mee als Shopify-Storefront-Private-Token, een publieke als X-Shopify-Storefront-Access-Token.
 */
const VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-10";

export type StorefrontOpties = {
  /** Breekt het verzoek af na zoveel ms, zodat een pagina niet eindeloos op Shopify wacht. */
  timeoutMs?: number;
  /**
   * IP-adres van de bezoeker. Gaat enkel met een privé-token mee: Shopify's botbeveiliging telt
   * dan per bezoeker en niet per server. Een publieke token kent deze header niet.
   */
  buyerIp?: string;
};

export async function storefront<T>(query: string, variables: Record<string, unknown> = {}, opties: StorefrontOpties = {}): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_API_TOKEN;
  if (!domain || !token) throw new Error("SHOPIFY_STORE_DOMAIN of SHOPIFY_STOREFRONT_API_TOKEN ontbreekt.");
  const prive = token.startsWith("shpat_");
  const res = await fetch(`https://${domain}/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [prive ? "Shopify-Storefront-Private-Token" : "X-Shopify-Storefront-Access-Token"]: token,
      ...(prive && opties.buyerIp ? { "Shopify-Storefront-Buyer-IP": opties.buyerIp } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    ...(opties.timeoutMs ? { signal: AbortSignal.timeout(opties.timeoutMs) } : {}),
  });
  const json = (await res.json().catch(() => ({}))) as { data?: T; errors?: { message: string }[] };
  if (!res.ok || json.errors?.length || !json.data) {
    throw new Error(`Storefront API: HTTP ${res.status} ${json.errors?.map((e) => e.message).join("; ") ?? ""}`);
  }
  return json.data;
}
