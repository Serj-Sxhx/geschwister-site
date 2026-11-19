# Geschwister site

Static, no-build site (HTML + ES modules). Layout follows Saeed's WhatsApp mockups, saved in `assets/reference/`:
book-spread home, SHOP grid, product overlay (grid fades behind, size picker, Add to Cart, ×), "Shop this image"
overlay, cart page, About/Press, "Geschwister Radio" player.

Run: `python3 -m http.server 4173` then open http://localhost:4173

## Shopify (payments + inventory)
Shopify owns price, stock and payment. The cart is client-side; checkout calls Storefront API `cartCreate` and
redirects to Shopify-hosted checkout (Shopify Payments / Stripe as configured in Shopify).
1. Shopify admin > Settings > Apps > Develop apps > create app, enable Storefront API scopes
   `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`.
2. Put `shopDomain` (`xxx.myshopify.com`) and the Storefront token in `config.js` (public token, safe in browser).
3. Create products whose **handles** match `src/products.js`, with a "Size" option. Variants with no stock are disabled automatically.

Without config the site runs in demo mode (local catalogue, checkout disabled).

## Still needed from Saeed
- Clean product/editorial photography and hero spread (the WhatsApp images are screenshots with UI baked in).
- Logo/"G" mark, texture, sword cursor, fonts, mp3 tracks for `TRACKS`, real product list and prices (shown prices are marked illustrative).
