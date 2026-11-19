# Geschwister site: handoff guide

This guide is for whoever takes over the Geschwister site from here. It covers connecting the site to Shopify so checkout works, deploying it with the Vercel CLI, and pointing a custom domain at it.

Each step has a **prompt** you can paste into Claude Code (Claude desktop app, Code tab). Do the steps marked **You** yourself in a browser, because they need logins, payments or account decisions.

- Repo: https://github.com/Serj-Sxhx/geschwister-site
- Current preview: https://geschwister.vercel.app (on Serj's Vercel account)

---

## 0. What you're working with

The site is plain HTML, CSS and JS ES modules. It has no build step, no framework and no npm install.

| File | What it does |
|---|---|
| `index.html` | Page shell: masthead, nav, `#view`, overlay, radio player. Loads `config.js`, then `src/main.js`. |
| `config.js` | Shopify settings: `shopDomain`, `storefrontToken`, `apiVersion`. If these are empty the site runs in demo mode. |
| `src/main.js` | Hash routes (`#/`, `#/shop`, `#/about`, `#/cart`). Also the home scroll sections, the product overlay, the "Shop this image" overlay, the cart page and the radio player. |
| `src/products.js` | Local catalogue (`PRODUCTS`), editorial links (`EDITORIALS`), `PRESS`, `SHOWS` and `TRACKS`. **Each product `handle` must match a Shopify product handle.** |
| `src/shopify.js` | Storefront API adapter. `hydrate()` loads live price, stock and images from Shopify. `checkoutUrl()` calls `cartCreate` and returns Shopify's hosted checkout URL. |
| `src/cart.js` | Client-side cart, stored in `localStorage` under `gesch.cart.v1`. |
| `src/styles.css` | All styles. |
| `assets/img`, `assets/audio`, `assets/reference` | Site images, radio mp3s, and Saeed's WhatsApp layout mockups. |
| `vercel.json` | `{ "outputDirectory": "." }`, which tells Vercel to serve the repo root as is. |

**How checkout works:**
1. The shopper browses the site and adds items to the cart. The cart lives in the browser.
2. When they click PROCEED TO CHECKOUT, the site sends the cart lines to Shopify's `cartCreate`.
3. Shopify returns a `checkoutUrl` and the site redirects there.
4. Payment, tax, shipping, order emails and inventory decrements all happen on Shopify's side. You don't need a server.

---

## 1. Get the project running locally

**You:** install Git, Python 3 (preinstalled on macOS) and Node 18 or newer, which the Vercel CLI needs. Then open the Claude desktop app, go to the Code tab and pick an empty folder.

**Prompt to Claude Code:**
```text
Clone https://github.com/Serj-Sxhx/geschwister-site into this folder and cd into it.
It's a no-build static site (HTML + ES modules). Read README.md, HANDOFF.md and every file in src/ so you understand the architecture.
Then create .claude/launch.json with a config named "geschwister" that runs `python3 -m http.server 4173` on port 4173, start it with the preview tool, and show me the home page, the shop grid, a product overlay and the cart page.
Don't change any code yet.
```

If you want to push to the original repo, ask Serj to add your GitHub username as a collaborator. Otherwise, fork it and work on your fork.

---

## 2. Set up Shopify (payments + inventory)

### 2a. Store and payments (You)
1. Create or log in to the Shopify store. Note the **`xxxx.myshopify.com`** domain under Settings → Domains.
2. Set the **store currency to GBP** in Settings → Store details → Store currency. The site formats prices as GBP.
3. Turn on payments in Settings → Payments. Use Shopify Payments, or Stripe, which Saeed already has.
4. Set up shipping rates (Settings → Shipping and delivery), taxes, and the refund, privacy and terms policies (Settings → Policies). Checkout uses all of these.

### 2b. Get a Storefront API token (You)
You can do this in either of two ways:

- **Headless channel (recommended).** In Shopify admin, go to Sales channels → add **Headless** → Create storefront. Copy the **public access token**.
- **Custom app.** Go to Settings → Apps and sales channels → Develop apps → Create an app → Configure **Storefront API** scopes, then install the app and copy the **Storefront API access token**.

The token needs these scopes:
- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`. Without it, the `quantityAvailable` query fails and the whole live catalogue falls back to demo data.
- `unauthenticated_write_checkouts`
- `unauthenticated_read_checkouts`

The **public** Storefront token is designed to sit in browser code, so it's fine in `config.js` and in a public repo. **Never** put an Admin API token (`shpat_…`) in this repo.

> `config.js` currently has a token Saeed supplied but no `shopDomain`. Check that the token belongs to the store you're connecting. If it doesn't, replace it.

### 2c. Create the products (You, or Claude through the Shopify connector if you have it)

Each product in `src/products.js` must exist in Shopify with:
- **The same handle.** Set it in Shopify under the product's "Search engine listing" → URL handle.
- An option named **`Size`** (XS, S, M, L, XL, XXL), or a single variant for one-size items (scarves, belt).
- **Track quantity** turned on, with stock set per size. Sizes with no stock show struck through on the site.
- **Status Active**, and the product **published to the Headless channel or your custom app's channel**. If it isn't, the Storefront API won't return it.
- A price in GBP. If you upload a featured image in Shopify, it replaces the local photo on the site.

These are the handles the site expects right now:
```
signature-6-jersey-white    signature-6-jersey-black    mww-aop-sweatshirt
s1-scarf                    scarf-sepia                 crewneck-white-back-print
crewneck-white              crewneck-white-chest-print  crewneck-black-back-print
crewneck-black              crewneck-black-chest-print  tee-orange
tee-black-boots             tee-aop                     tee-white-sleeve
trousers-orange             trousers-black              belt
```
Names and prices for most of these are still placeholders. Confirm the final range with Saeed first, and edit `src/products.js` to match before you create the products.

### 2d. Connect the site

**Prompt to Claude Code:**
```text
Connect this site to Shopify.
- In config.js set shopDomain to "<STORE>.myshopify.com" and storefrontToken to "<PUBLIC_STOREFRONT_TOKEN>". Keep apiVersion unless it is no longer supported; if so, bump it to the current stable Storefront API version and tell me.
- Use curl to run the PRODUCTS_Q query from src/shopify.js against the Storefront API and show me which handles in src/products.js are missing in Shopify, which have no "Size" option, and any scope errors.
- Fix anything on the code side; list anything I need to fix in Shopify admin.
- Restart the preview, clear localStorage key gesch.cart.v1 (old demo carts have no variant IDs), confirm the "(Illustrative price)" labels are gone, prices/stock come from Shopify, sold-out sizes are disabled, then add an item and click PROCEED TO CHECKOUT and confirm it lands on a checkout.shopify.com / store checkout page. Don't place an order.
```

### 2e. Test a real checkout (You)
1. In Shopify, turn on **test mode** (Shopify Payments → Test mode, or the Bogus Gateway on a dev store).
2. On the site, add an item and check out with Shopify's published test card.
3. Confirm the order appears in Shopify admin and stock goes down. Then turn test mode **off**.
4. Optionally, set Settings → Checkout → "Order status page" / post-purchase redirect back to the site's domain.

---

## 3. Deploy with the Vercel CLI

You have two choices:
- **Deploy to your own Vercel account (simplest).** This creates a new project and a new `*.vercel.app` URL.
- **Take over Serj's existing project.** Ask Serj to invite you to their Vercel team, or to transfer the project to you.

**You:** create a Vercel account at vercel.com, ideally signing up with GitHub.

**Prompt to Claude Code:**
```text
Deploy this site to Vercel with the Vercel CLI.
1. Install the CLI if missing: npm i -g vercel. Run `vercel --version`.
2. Run `vercel login` (I'll complete the browser login), then `vercel whoami`.
3. Delete any existing .vercel/ folder (it points at someone else's project), then run `vercel link` and create a new project named geschwister. It's a static site: no framework, no build command, output directory "." (already set in vercel.json; .vercelignore excludes assets/raw).
4. Run `vercel deploy` for a preview URL, open it in the preview browser, check home, shop, a product overlay, cart and that there are no console errors.
5. If it looks right, run `vercel deploy --prod` and give me the production URL.
6. If the deployment asks for a login when opened in a private window, Vercel Deployment Protection is on; tell me and I'll decide whether to turn it off (Project → Settings → Deployment Protection).
```

### Auto-deploy on every push (recommended)
**Prompt to Claude Code:**
```text
Run `vercel git connect` to connect this Vercel project to the GitHub repo, so pushes to main deploy to production and other branches get preview URLs. Then make a trivial commit on a new branch, push it, and show me the preview deployment URL.
```
You can also do this in the dashboard: Project → Settings → Git → Connect Git Repository.

---

## 4. Custom domain

**You:** buy the domain, for example `geschwister.com`, or use one Saeed already owns. Decide whether the site lives at the apex (`geschwister.com`) or at `www`. Using apex as primary with `www` redirecting is the usual choice.

**Prompt to Claude Code:**
```text
Add my custom domain to the Vercel project.
- Run: vercel domains add <DOMAIN>   and   vercel domains add www.<DOMAIN>
- Run: vercel domains inspect <DOMAIN>  and tell me exactly which DNS records to create at my registrar (use whatever Vercel prints; normally an A record for the apex and a CNAME for www).
- After I say the records are in, poll `vercel domains inspect` until it's verified, then confirm https://<DOMAIN> serves the site with a valid certificate and that www redirects to the apex (set the redirect in Project → Settings → Domains if needed).
```

Typical DNS records (always use the exact values `vercel domains inspect` prints):

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Another option is to move the domain's nameservers to Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`), so Vercel manages all DNS. Only do that if no email or other records live at the current DNS host, or after you copy them over.

### Domain on the Shopify side (optional but nicer)
By default, checkout runs on `<store>.myshopify.com`. To brand it:
1. In Shopify, go to Settings → Domains → Connect existing domain and add a **subdomain** such as `shop.<DOMAIN>` or `checkout.<DOMAIN>`.
2. Add the CNAME Shopify gives you (normally `shops.myshopify.com`) to your DNS. If Vercel manages your DNS, add it with `vercel dns add <DOMAIN> shop CNAME shops.myshopify.com`.
3. **Don't** point the apex or `www` at Shopify. Those stay on Vercel.

---

## 5. Go-live checklist

- [ ] Final product list, names, prices and sizes confirmed with Saeed. `src/products.js` and Shopify match.
- [ ] Every product is Active, published to the storefront channel, and has inventory tracked.
- [ ] Shopify payments are live, test mode is off, and shipping, tax and policies are set.
- [ ] One real low-value order placed and refunded end to end.
- [ ] Custom domain verified on Vercel, HTTPS works, and `www` redirects to the apex.
- [ ] Vercel Deployment Protection is off for production, so the public can see it.
- [ ] Mobile checked: home scroll, shop grid, product overlay, cart and radio player.

## 6. Still open (content and design)

- **Radio:** tracks 4–6 still have to come from Saeed. Add them to `TRACKS` in `src/products.js` and `assets/audio/`.
- **Home page:** the Exhibitions and Information copy (contact email, brand statement) is missing.
- **Photos:** the spec shows a polo shot and OSB flat-lay photos that aren't in the repo yet. The originals are in Saeed's Google Drive "Page Assets" folder. Resize to about 2200px on the long edge before adding them.
- **Design extras:** Saeed asked for a sword cursor and a stronger background texture.
- **Header:** the "Established 2021 | London" line gets cramped at narrow widths.
- **Favicon:** missing. The live site shows a harmless 404 console error for it.

**Prompt for picking any of these up:**
```text
Read HANDOFF.md section 6 and assets/reference/ (Saeed's layout mockups). Pick up "<ITEM>". Keep the no-build static setup, match the existing code style in src/, verify in the preview browser at desktop and mobile widths, then commit on a branch and push.
```
