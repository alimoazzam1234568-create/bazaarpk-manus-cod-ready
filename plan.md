# BazaarPK Implementation Plan

## Product scope

BazaarPK is a premium Pakistani e-commerce storefront with a functional demo shopping journey: browsing, search, category filters, product detail views, persistent cart, coupon handling, checkout validation, order confirmation, wishlist, customer account entry point, Urdu/English toggle, and an admin dashboard preview. Demo products and demo checkout mode are clearly labeled until real catalog, payment gateway, courier, and production credentials are connected.

## Implementation approach

Use the initialized React/Vite/Express/tRPC/Drizzle starter. The frontend owns responsive storefront UI, local cart persistence, language direction, filtering/sorting, drawer/modal interactions, product details, and client-side checkout validation. The existing Manus OAuth session and starter tRPC auth router remain the authentication foundation. Add a small catalog domain to the existing tRPC server with typed product/category/order procedures and Drizzle schema tables; seed-safe demo data is defined in the client for resilient preview behavior, while server procedures provide the integration seam for persistent orders and admin updates when the managed database is available.

The first shippable slice prioritizes the customer-facing storefront and a credible admin overview route. Payments are represented honestly as selectable methods with a demo-order state; no fake payment success is shown. COD is the only method that can complete the demo order without external credentials. JazzCash, Easypaisa, bank transfer, and card options are visible as supported placeholders and explain that gateway credentials are required before activation.

### Project structure

- `client/src/pages/Home.tsx`: storefront shell, hero, category rail, product sections, reviews, newsletter, footer.
- `client/src/pages/Shop.tsx`: searchable/filterable product catalog and sorting.
- `client/src/pages/Product.tsx`: product detail route with gallery, options, quantity, cart actions, and related products.
- `client/src/pages/Checkout.tsx`: delivery form, payment method selection, coupon, and order summary.
- `client/src/pages/Account.tsx`: authenticated-state-aware customer account surface, wishlist, order history, saved addresses.
- `client/src/pages/Admin.tsx`: secure-looking operations dashboard UI for catalog, orders, inventory, and sales signals.
- `client/src/components/store/`: reusable header, product card, cart drawer, section heading, badges, and responsive commerce primitives.
- `client/src/lib/store.ts`: demo catalog, categories, cart/wishlist persistence, currency formatting, and typed storefront helpers.
- `server/routers.ts`, `server/db.ts`, `drizzle/schema.ts`: catalog/order/admin persistence seams, preserving the starter auth/session contracts.
- `public/manus-routes.json`: complete page route manifest for `/`, `/shop`, `/product/:id`, `/checkout`, `/account`, `/admin`, and `/404`.

## Design system

### Option set

1. **Lahore atelier / digital bazaar — 0.71**: warm editorial commerce with emerald storefront chrome, ivory surfaces, and saffron-gold details.
2. **Karachi night market — 0.06**: charcoal-first, neon-accented streetwear commerce.
3. **Islamabad gallery — 0.04**: quiet monochrome luxury with mineral green and sparse product framing.

Chosen: **Lahore atelier / digital bazaar**.

- **Design Movement:** Contemporary South Asian editorial retail—craft, texture, and confident negative space translated into a fast digital storefront.
- **Core Principles:** Product-first hierarchy; warm human trust; high-contrast utility; restrained ornament.
- **Color Philosophy:** Emerald communicates reliability and Pakistani identity; ivory keeps the catalog tactile and premium; saffron-gold signals value without discount-store noise; ink anchors legibility.
- **Layout Paradigm:** Offset editorial bands and horizontally scrolling rails rather than repetitive centered grids; hero copy sits beside a visual focal point, and product sections use asymmetric lead cards.
- **Signature Elements:** A split “PKR” price lockup, gold micro-labels, and a subtle woven-line pattern used in cards and the footer.
- **Interaction Philosophy:** Every tap should reveal a clear next action—quick add, inspect, save, or continue shopping. Drawers and toasts make state changes explicit.
- **Animation:** 180–260ms ease-out transitions; product images lift 2–4px on hover; hero text enters once; avoid looping motion that competes with products.
- **Typography System:** `DM Serif Display` for campaign headlines and product storytelling; `Plus Jakarta Sans` for UI, prices, metadata, and forms; Urdu copy uses a graceful system fallback with increased line-height.
- **Brand Essence:** Curated Pakistani style for people who want everyday purchases to feel considered; warm, assured, metropolitan.
- **Brand Voice:** Headlines are direct and evocative; CTAs are practical and specific. Examples: “Wear the season, your way.” and “Add to bag — delivered across Pakistan.”
- **Wordmark & Logo:** A compact emerald “B” monogram inside a rounded saffron lozenge, paired with a custom-looking BazaarPK wordmark; implement as CSS/SVG-like inline mark rather than default plain text.
- **Signature Brand Color:** `#0B5D4B` deep bazaar emerald.

## Data and behavior

Demo products are labeled in UI and use PKR pricing, discounted price, ratings, sizes/colors, and stock signals. Cart state persists under a versioned localStorage key and feeds subtotal, delivery threshold, coupon discount, and total calculations. Search matches product title, category, and tags. Shop supports category, price, and sort controls. Checkout validates name, Pakistani phone format, address, city, and postal code; completion creates a local demo order receipt and clears the cart. Account and admin routes preserve the real Manus OAuth login entry point instead of simulating a signed-in user.

## Setup and delivery

Keep the project on the initialized managed server/database runtime. Add the route manifest before startup. Run `pnpm check`, `pnpm test`, and `pnpm build`; start `pnpm dev` on the configured port for Preview. Inspect at desktop and mobile widths when needed. Commit the completed implementation to `origin/main` for a managed checkpoint. Publication remains separate and is not claimed unless explicitly completed by the platform.
