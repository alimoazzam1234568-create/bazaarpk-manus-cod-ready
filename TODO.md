# BazaarPK production TODO

## Implemented in this update
- [x] Database seed migration for the nine starter products and two starter coupons.
- [x] Authenticated COD checkout backed by MySQL.
- [x] Server-side product price and stock verification; browser totals are not trusted.
- [x] Transactional order and order-item persistence with stock decrement.
- [x] Coupon validation and server-side delivery/discount calculation.
- [x] Customer order history from persisted records.
- [x] Admin-only live metrics, recent orders and order-status updates.
- [x] Restore stock transactionally when an order is cancelled.
- [x] Remove fake order confirmations and hard-coded admin sales/order figures.

## Required before opening the store publicly
- [ ] Import this source into the existing Manus project and publish it there.
- [ ] Configure production MySQL and Manus environment secrets.
- [ ] Set the correct OWNER_OPEN_ID and verify admin access.
- [ ] Run database migrations in Manus and verify the seeded catalog/coupons.
- [ ] Replace sample products with actual sellable inventory, accurate sizes/colors, and authorized images.
- [ ] Connect storefront catalog reads and admin product/category CRUD to the database.
- [ ] Add product image upload and inventory editing in the admin UI.
- [ ] Add real customer notification and courier booking/tracking integrations.
- [ ] Add cancellation/refund policy, return workflow, privacy policy, terms and support contact.
- [ ] Run a complete COD test from sign-in through delivery status, including stock and coupon edge cases.
- [ ] Run dependency installation, type-check, tests and production build in Manus CI/runtime.
- [ ] Configure database backups, monitoring, rate limits and operational access controls.

## Payments
- [x] Cash on delivery only.
- [ ] Do not enable JazzCash, Easypaisa, bank transfer or card payments until provider merchant accounts, server-side verification and callback/webhook handling are implemented and tested.
