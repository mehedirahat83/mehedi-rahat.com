# Phase A — Locked Product Blueprint

This is the implementation baseline for the fresh Mehedi Rahat platform. It
excludes legacy WordPress data and non-essential plugin features.

## Product boundaries

- Public business website and digital-product storefront
- Customer account, orders, downloads, support, licenses and membership
- Compact admin workspace for orders, customers, products, requests and licenses
- Fresh database; no WordPress content, order or customer migration
- Local development first; VPS deployment only after acceptance

## Sitemap and screens

**Public:** Home, Services, Service Detail, Shop, Category/Search, Product Detail,
Cart, Checkout, Payment Submission, Order Result, About, Contact, FAQ, Policies,
Login, Registration and Password Recovery.

**Customer:** Overview, Orders, Invoice, Downloads, Licenses, Membership Progress,
Requests, Profile, Password and Billing Details.

**Admin:** Overview, Orders, Customers, Products/Variations, Coupons, Unified
Requests, Licenses/Releases, Content/Settings, Admin Users and Audit Log.

## Commerce workflow

1. A visitor selects a variation and adds it to the cart.
2. Pricing applies product price, eligible membership discount and eligible coupon.
3. The customer signs in before completing checkout.
4. The customer chooses a configured manual payment method and submits evidence.
5. Admin verification completes the order and generates its invoice, download
   entitlement, spending entry and membership recalculation.
6. Refunds adjust entitlements and eligible lifetime spending.

The server calculates the final payable amount. Price-affecting facts are stored on
the order so an old invoice never changes when current rules change.

## Membership rules

| Level | Eligible lifetime spending | Discount |
|---|---:|---:|
| Silver | BDT 0–9,999 | 0% |
| Gold | BDT 10,000–49,999 | 10% |
| Diamond | BDT 50,000–99,999 | 20% |
| VIP | BDT 100,000+ | 30% |

- Only completed orders from a logged-in account count.
- Refunded value is deducted.
- Each product controls whether it counts toward spending and whether its price is
  eligible for membership discount.
- Authorized admin corrections require an audit note.

## License workflow

- A completed eligible purchase creates a license entitlement.
- A license has product, owner, status, activation limit, expiry/update window and
  activation records.
- Plugin clients call authenticated activate, deactivate, validate and update
  endpoints.
- Keys are stored as one-way hashes; raw keys are shown only when issued.
- Signed responses contain no customer PII and have short expiry times.
- License mutations and package downloads are rate-limited and audited.
- MR Commerce Pro can be adapted to this API; the legacy WordPress license manager
  will not be installed in the new application.

## Core data model

User, Address, AdminRole, Product, ProductVariation, ProductFile, Category, Cart,
CartItem, Coupon, Order, OrderItem, PaymentSubmission, Refund, Invoice,
DownloadEntitlement, DownloadEvent, MembershipAccount, MembershipLedger, License,
LicenseActivation, ProductRelease, Request, RequestMessage, Attachment, Page,
SiteSetting, EmailTemplate and AuditEvent.

Money is stored as integer poisha. Public IDs are non-sequential. Critical status
changes use transactions and idempotency keys.

## Design system

- Primary `#1E8A8A`; heading `#0F172A`; body `#454F5E`; strong `#33373D`;
  soft teal `#D8E5E5`; surface `#F5F7F9`; white `#FFFFFF`.
- Inter: headings, navigation, buttons and prices. Roboto: body. No third font.
- Compact, information-rich Bangladesh-first layout with readable touch targets.
- Headline keywords may use the primary color.
- Motion is limited to hover lift, reveal and soft ambient movement.
  Reduced-motion preferences disable non-essential animation.

## Performance and acceptance

- Server-rendered public pages with minimal client JavaScript
- Self-hosted fonts and responsive, lazy-loaded media
- Redis for cache, sessions, queues and rate limiting
- Cache/CDN headers for static assets and packages
- Mobile targets: LCP under 2.5s, INP under 200ms, CLS under 0.1 and Lighthouse
  Performance 90+ on key public pages
- Automated coverage for checkout, entitlement, membership and license calculations

## Delivery sequence

1. Phase A: scope, architecture, workflows, design system and homepage prototype
2. Phase B: application foundation, authentication, roles and core database
3. Phase C: catalog, cart, coupons, checkout, orders, payments and invoices
4. Phase D: customer dashboard, downloads, membership and requests
5. Phase E: admin CRM, licensing/update service, security and audit
6. Phase F: content, end-to-end QA, performance hardening and VPS launch

Optional ideas go to a later backlog instead of entering the active phase.
