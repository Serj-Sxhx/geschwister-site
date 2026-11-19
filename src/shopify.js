// Shopify adapter. Cart lives client-side; Shopify owns pricing, inventory and payment.
// Configured => live prices/stock via Storefront API, checkout via cartCreate -> checkoutUrl (Shopify Payments).
// Not configured => demo mode with local catalogue and no checkout.
const cfg = window.GESCH_CONFIG || {};
export const live = Boolean(cfg.shopDomain && cfg.storefrontToken);

async function gql(query, variables) {
  const r = await fetch(`https://${cfg.shopDomain}/api/${cfg.apiVersion}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": cfg.storefrontToken },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors.map((e) => e.message).join("; "));
  return j.data;
}

const PRODUCTS_Q = `{ products(first: 100) { nodes { handle title description
  featuredImage { url } images(first: 6) { nodes { url } }
  variants(first: 50) { nodes { id title availableForSale quantityAvailable price { amount } selectedOptions { name value } } } } } }`;

/** Merge live Shopify data over the local catalogue by handle. Inventory => variant.available. */
export async function hydrate(local) {
  if (!live) return local;
  const { products } = await gql(PRODUCTS_Q);
  const byHandle = new Map(products.nodes.map((p) => [p.handle, p]));
  return local.map((p) => {
    const s = byHandle.get(p.handle);
    if (!s) return p;
    return { ...p, price: Number(s.variants.nodes[0]?.price.amount ?? p.price),
      image: s.featuredImage?.url || p.image,
      variants: s.variants.nodes.map((v) => ({
        size: v.selectedOptions.find((o) => /size/i.test(o.name))?.value ?? v.title,
        available: v.availableForSale && (v.quantityAvailable ?? 1) > 0,
        variantId: v.id })) };
  });
}

/** lines: [{variantId, quantity}] -> Shopify-hosted checkout URL. */
export async function checkoutUrl(lines) {
  const d = await gql(`mutation($lines:[CartLineInput!]!){cartCreate(input:{lines:$lines}){cart{checkoutUrl} userErrors{message}}}`,
    { lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })) });
  const { cart, userErrors } = d.cartCreate;
  if (userErrors.length) throw new Error(userErrors[0].message);
  return cart.checkoutUrl;
}
