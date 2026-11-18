import { storefront } from "./storefront";

/**
 * Bewaking van etalageproducten — de enige afscherming (zie packages/catalog/README.md): Shopify
 * zelf beschermt niet tegen een etalageproduct met prijs € 0. Daarom controleren we LIVE per
 * variant: niet `brunic.etalage = true`, prijs > 0 en `availableForSale`.
 *
 * Gebruikt door de kassa (app/api/kassa) en, met de Shopify-winkelmand, bij elk toevoegen
 * (lib/shopify/winkelmand-handlers.ts): zo komt een etalageproduct nooit in een Shopify-cart.
 */

const CONTROLE = /* GraphQL */ `
  query Controle($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        availableForSale
        price { amount }
        product { title etalage: metafield(namespace: "brunic", key: "etalage") { value } }
      }
    }
  }
`;

type Node = { id: string; availableForSale: boolean; price: { amount: string }; product: { title: string; etalage: { value: string } | null } } | null;

/** Variant-ID's komen als kort nummer of als volledige GID van een ProductVariant. */
export const GELDIG_VARIANT_ID = /^(\d+|gid:\/\/shopify\/ProductVariant\/\d+)$/;
export const variantGid = (id: string) => (id.startsWith("gid://") ? id : `gid://shopify/ProductVariant/${id}`);

/** Bovengrenzen van de winkelmand: gelijk in de browser, bij het toevoegen en in de kassa. */
export const MAX_REGELS = 100;
export const MAX_AANTAL = 500;

/** Titels van de varianten die niet online te koop zijn ("een product" als Shopify ze niet kent). Leeg = alles mag. */
export async function nietTeKoop(variantIds: string[]): Promise<string[]> {
  if (variantIds.length === 0) return [];
  const { nodes } = await storefront<{ nodes: Node[] }>(CONTROLE, { ids: variantIds.map(variantGid) });
  return nodes
    .filter((n) => !n || !n.availableForSale || !(Number(n.price.amount) > 0) || n.product.etalage?.value === "true")
    .map((n) => n?.product.title ?? "een product");
}

export const nietTeKoopMelding = (titels: string[]) =>
  `Niet online te koop of intussen niet meer beschikbaar: ${titels.join(", ")}. Verwijder het uit uw winkelmand of vraag er een offerte voor aan.`;
