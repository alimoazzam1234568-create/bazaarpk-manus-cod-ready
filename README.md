# BazaarPK — Pakistani Online Shopping

BazaarPK is a Pakistani storefront built with React, Express, tRPC, Drizzle ORM and MySQL, intended to run in its existing Manus project.

## Implemented commerce flow in this package

- The storefront retains its curated starter catalog and shopping-bag UX.
- A database migration seeds nine starter catalog records and two starter coupon codes.
- Checkout submits a real COD order to the authenticated backend.
- The backend looks up product prices and stock from MySQL; it does not trust browser-submitted prices or totals.
- Coupon validation, delivery calculation (free at Rs. 3,000; otherwise Rs. 199), order creation, order-item creation and stock decrement occur in one database transaction.
- Orders receive a server-generated order number and start in `pending`.
- Customers can view their own persisted order history.
- Admin metrics and recent orders are read from the database. Admins can update order status.
- Non-COD payment methods are intentionally not offered. No payment gateway is configured.

## Manus deployment

This source package is prepared for the existing Manus project. It is not directly deployed by this ZIP export. Import/replace the source in the existing Manus workspace, configure the environment, run migrations, then use Manus Preview and Publish.

Required environment configuration is managed by Manus:

- `DATABASE_URL` — MySQL connection string
- `MANUS_PROJECT_ID`
- `MANUS_JWT_SECRET`
- `MANUS_OAUTH_API_URL`
- `MANUS_API_URL`
- `MANUS_API_KEY`
- `OWNER_OPEN_ID` — exact Manus OpenID for the store owner; this account is promoted to admin on sign-in

Do not commit real credentials or paste secrets into source files. Configure them in Manus project secrets/environment settings.

## Setup and verification

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm check
pnpm test
pnpm build
pnpm dev
```

After configuring the database, `pnpm db:migrate` applies the existing schema migrations and `0002_seed_bazaarpk_products.sql`. The migration seeds initial products and coupon codes without resetting stock values on subsequent runs.

## Launch checklist

1. Confirm the Manus production environment has the correct MySQL database and all required environment variables.
2. Set `OWNER_OPEN_ID` to the store owner's actual Manus OpenID before the owner signs in.
3. Run migrations against the intended production database and verify the nine starter products exist.
4. Place a low-value COD test order, verify it appears in the admin dashboard and customer account, and confirm stock decreases exactly once.
5. Test insufficient-stock and invalid-coupon cases; neither should create an order or decrement stock.
6. Confirm delivery coverage, courier contract, customer support contact, return policy and privacy policy before accepting public orders.

## Remaining work before a full commercial launch

- Replace curated sample catalog content with the merchant's real product descriptions, sizes, colors and approved product photography.
- Build full admin product/category/coupon/banner/customer CRUD and product image upload.
- Add verified email/SMS order notifications and courier booking/tracking integration.
- Add operational return/refund, cancellation and customer-support workflows.
- Configure backups, monitoring, rate limiting and production security review.
- Review privacy, terms, returns, shipping charges and applicable business/tax obligations.

Cash on delivery is the only enabled payment method. JazzCash, Easypaisa, bank transfer and card payments must remain disabled until real merchant accounts, server-side verification and provider callbacks are configured.
