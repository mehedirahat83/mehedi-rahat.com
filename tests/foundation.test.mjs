import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const projectRoot = new URL("../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, projectRoot), "utf8");
}

const checks = [
  ["the storefront has shared recovery and not-found experiences", async () => {
    const [layout, errorPage, notFoundPage] = await Promise.all([
      read("app/layout.tsx"),
      read("app/error.tsx"),
      read("app/not-found.tsx"),
    ]);

    assert.match(layout, /import\s+["']\.\/globals\.css["']/);
    assert.match(layout, /import\s+["']\.\/system\.css["']/);
    assert.match(errorPage, /onClick=\{reset\}/);
    assert.match(notFoundPage, /href=["']\/["']/);
  }],
  ["admin routes are protected by the signed session boundary", async () => {
    const [auth, sessionRoute, adminLayout, proxy] = await Promise.all([
      read("app/admin-auth.ts"),
      read("app/api/admin/session/route.ts"),
      read("app/admin/layout.tsx"),
      read("proxy.ts"),
    ]);

    assert.match(auth, /signaturesMatch/);
    assert.match(auth, /ADMIN_SESSION_SECRET/);
    assert.match(auth, /Secure/);
    assert.match(sessionRoute, /export\s+async\s+function\s+POST/);
    assert.match(sessionRoute, /export\s+async\s+function\s+DELETE/);
    assert.match(adminLayout, /fetch\(["']\/api\/admin\/session["']/);
    assert.match(
      adminLayout,
      /window\.location\.replace\(["']\/admin\/login["']\)/,
    );
    assert.match(proxy, /isAdminRequest/);
    assert.match(proxy, /\/admin\/:path\*/);
  }],
  [
    "enquiry writes remain public while reads and status changes require admin auth",
    async () => {
      const enquiryRoute = await read("app/api/enquiries/route.ts");

      assert.match(enquiryRoute, /export\s+async\s+function\s+POST/);
      assert.match(enquiryRoute, /export\s+async\s+function\s+GET/);
      assert.match(enquiryRoute, /export\s+async\s+function\s+PATCH/);
      assert.ok(
        (enquiryRoute.match(/isAdminRequest/g) ?? []).length >= 2,
        "GET and PATCH should both enforce admin authentication",
      );
      assert.doesNotMatch(enquiryRoute, /CREATE\s+TABLE/i);
      assert.match(enquiryRoute, /getPool/);
    },
  ],
  ["database schema and migration define enquiry query indexes", async () => {
    const [schema, migration] = await Promise.all([
      read("db/schema.ts"),
      read("drizzle/0000_demonic_justin_hammer.sql"),
    ]);

    assert.match(schema, /enquiries_created_at_idx/);
    assert.match(schema, /enquiries_status_idx/);
    assert.match(migration, /CREATE INDEX "enquiries_created_at_idx"/);
    assert.match(migration, /CREATE INDEX "enquiries_status_idx"/);
  }],
  ["product catalog schema is normalized and production constrained", async () => {
    const [schema, migration] = await Promise.all([
      read("db/schema.ts"),
      read("drizzle/0001_spooky_warstar.sql"),
    ]);

    assert.match(schema, /export const productCategories/);
    assert.match(schema, /export const products/);
    assert.match(schema, /export const productVariations/);
    assert.match(schema, /export const productInformation/);
    assert.match(schema, /products_category_status_sort_idx/);
    assert.match(schema, /products_status_check/);
    assert.match(schema, /products_license_check/);
    assert.match(schema, /homepageFeatured/);
    assert.match(schema, /products_homepage_featured_idx/);
    assert.match(schema, /product_variations_product_label_uidx/);
    assert.match(schema, /onDelete:\s*["']cascade["']/);
    assert.match(migration, /CREATE TABLE "product_categories"/);
    assert.match(migration, /CREATE TABLE "products"/);
    assert.match(migration, /CREATE TABLE "product_variations"/);
    assert.match(migration, /CREATE TABLE "product_information"/);
    assert.match(migration, /CONSTRAINT "products_status_check"/);
    assert.match(migration, /ON DELETE cascade/);
    assert.match(migration, /CREATE UNIQUE INDEX "products_slug_uidx"/);
  }],
  ["products API separates public reads from authenticated catalog writes", async () => {
    const [collectionRoute, detailRoute, shared] = await Promise.all([
      read("app/api/products/route.ts"),
      read("app/api/products/[id]/route.ts"),
      read("app/api/products/shared.ts"),
    ]);

    assert.match(collectionRoute, /export\s+async\s+function\s+GET/);
    assert.match(collectionRoute, /export\s+async\s+function\s+POST/);
    assert.match(detailRoute, /export\s+async\s+function\s+GET/);
    assert.match(detailRoute, /export\s+async\s+function\s+PATCH/);
    assert.match(detailRoute, /export\s+async\s+function\s+DELETE/);
    assert.ok(
      (collectionRoute.match(/isAdminRequest/g) ?? []).length >= 2,
      "draft listing and product creation must require admin authentication",
    );
    assert.ok(
      (detailRoute.match(/isAdminRequest/g) ?? []).length >= 3,
      "draft details, product updates and deletes must require admin authentication",
    );
    assert.match(shared, /p\.status='published'/);
    assert.match(shared, /validateProductInput/);
    assert.match(shared, /statuses\.has/);
    assert.match(shared, /licenses\.has/);
    assert.match(shared, /isSafeResourceUrl/);
    assert.match(collectionRoute, /client\.query\(["']BEGIN["']\)/);
    assert.match(detailRoute, /client\.query\(["']BEGIN["']\)/);
    assert.match(detailRoute, /DELETE FROM products WHERE id=\$1 OR slug=\$1/);
    assert.match(shared, /listHomepageProducts/);
    assert.match(shared, /o\.status='completed'/);
    assert.match(shared, /orderByCompletedSales/);
  }],
  ["admin products use the authenticated API and the catalog is seeded", async () => {
    const [adminProducts, seedMigration, journal, productValidation] = await Promise.all([
      read("app/admin/AdminProducts.tsx"),
      read("drizzle/0002_seed_product_catalog.sql"),
      read("drizzle/meta/_journal.json"),
      read("app/api/products/shared.ts"),
    ]);

    assert.match(adminProducts, /\/api\/products\?include=drafts/);
    assert.match(
      adminProducts,
      /method:\s*editing\s*\?\s*["']PATCH["']\s*:\s*["']POST["']/,
    );
    assert.match(adminProducts, /method:\s*["']DELETE["']/);
    assert.doesNotMatch(adminProducts, /loadProducts|saveProducts|localStorage/);
    assert.match(adminProducts, /uploadProductImage/);
    assert.match(adminProducts, /type="file"/);
    assert.match(adminProducts, /Catalog feature image/);
    assert.match(productValidation, /data:image\\\//);
    assert.match(adminProducts, /homepageFeatured/);
    assert.match(adminProducts, /Homepage Popular Tools/);
    assert.match(seedMigration, /INSERT INTO "product_categories"/);
    assert.match(seedMigration, /INSERT INTO "products"/);
    assert.match(seedMigration, /INSERT INTO "product_variations"/);
    assert.match(seedMigration, /INSERT INTO "product_information"/);
    assert.match(journal, /0002_seed_product_catalog/);
  }],
  ["public catalog and product details use the published products API", async () => {
    const [catalog, details, header, api] = await Promise.all([
      read("app/products/page.tsx"),
      read("app/product/page.tsx"),
      read("app/MainHeader.tsx"),
      read("app/productApi.ts"),
    ]);

    assert.match(catalog, /fetchPublishedProducts/);
    assert.match(details, /fetchPublishedProduct/);
    assert.match(details, /fetchPublishedProducts/);
    assert.match(header, /fetchPublishedProducts/);
    assert.doesNotMatch(catalog, /loadProducts|localStorage/);
    assert.doesNotMatch(details, /loadProducts|loadProductFaq/);
    assert.match(api, /\/api\/products\?limit=100/);
    assert.doesNotMatch(api, /include=drafts/);
  }],
  ["homepage products are explicitly selected and ranked by completed sales", async () => {
    const [homepage, productApi, migration] = await Promise.all([
      read("app/HomePopularTools.tsx"),
      read("app/productApi.ts"),
      read("drizzle/0008_homepage_featured_products.sql"),
    ]);
    assert.match(homepage, /fetchHomepageProducts/);
    assert.match(homepage, /product\.imageUrl/);
    assert.match(homepage, /\/product\/\$\{product\.slug\}/);
    assert.match(productApi, /homepage=featured/);
    assert.match(migration, /homepage_featured/);
    assert.match(migration, /homepage_sort_order/);
  }],
  ["product resell links are managed through the product editor", async () => {
    const [adminProducts, productPage, migration] = await Promise.all([
      read("app/admin/AdminProducts.tsx"),
      read("app/product/page.tsx"),
      read("drizzle/0009_product_resell_links.sql"),
    ]);
    assert.match(adminProducts, /Resell Our Tools link/);
    assert.match(adminProducts, /name="resellUrl"/);
    assert.match(productPage, /product\.resellUrl/);
    assert.match(migration, /resell_url/);
  }],
  ["product permalinks use slugs and permanently redirect legacy query URLs", async () => {
    const [productPage, productRoute, catalog, header, adminProducts, proxy] = await Promise.all([
      read("app/product/page.tsx"),
      read("app/product/[slug]/page.tsx"),
      read("app/products/page.tsx"),
      read("app/MainHeader.tsx"),
      read("app/admin/AdminProducts.tsx"),
      read("proxy.ts"),
    ]);

    assert.match(productRoute, /ProductPage identifier=\{slug\}/);
    assert.match(productPage, /routeIdentifier/);
    assert.match(catalog, /\/product\/\$\{encodeURIComponent\(product\.slug\)\}/);
    assert.match(header, /\/product\/\$\{encodeURIComponent\(item\.slug\)\}/);
    assert.match(adminProducts, /\/product\/\$\{encodeURIComponent\(product\.slug\)\}/);
    assert.match(proxy, /request\.nextUrl\.pathname === "\/product"/);
    assert.match(proxy, /"elementor-pro": "elementor-pro-license-key"/);
    assert.match(proxy, /NextResponse\.redirect\(destination, 308\)/);
  }],
  ["cart and checkout use server-validated pricing and persistent orders", async () => {
    const [cartApi, ordersApi, cartPage, checkoutPage, catalog] = await Promise.all([
      read("app/api/cart/validate/route.ts"),
      read("app/api/orders/route.ts"),
      read("app/cart/page.tsx"),
      read("app/checkout/page.tsx"),
      read("app/server/orderCatalog.ts"),
    ]);
    assert.match(cartApi, /resolveCheckoutItems/);
    assert.match(ordersApi, /INSERT INTO orders/);
    assert.match(ordersApi, /INSERT INTO order_items/);
    assert.match(ordersApi, /INSERT INTO payment_submissions/);
    assert.match(ordersApi, /idempotency_key/);
    assert.match(ordersApi, /nextval\('order_number_seq'\)/);
    assert.match(catalog, /p\.status='published'/);
    assert.match(catalog, /product_variations/);
    assert.match(cartPage, /validateCart/);
    assert.match(checkoutPage, /fetch\(["']\/api\/orders["']/);
    assert.doesNotMatch(checkoutPage, /const\s+subtotal\s*=\s*useMemo/);
  }],
  ["phase 3 order management is authenticated, audited and customer-account scoped", async () => {
    const [adminList, adminDetail, customerTracking, access, adminUi, migration, schema] = await Promise.all([
      read("app/api/admin/orders/route.ts"), read("app/api/admin/orders/[id]/route.ts"),
      read("app/api/orders/[number]/route.ts"), read("app/server/orderAccess.ts"),
      read("app/admin/AdminPortal.tsx"), read("drizzle/0003_order_management.sql"), read("db/schema.ts"),
    ]);
    assert.match(adminList, /isAdminRequest/);
    assert.match(adminList, /ILIKE/);
    assert.match(adminDetail, /FOR UPDATE/);
    assert.match(adminDetail, /INSERT INTO order_status_history/);
    assert.match(adminDetail, /INSERT INTO entitlements/);
    assert.match(adminDetail, /ON CONFLICT \(order_item_id\) DO UPDATE/);
    assert.match(adminDetail, /status='revoked'/);
    assert.match(customerTracking, /customerId\(request\)/);
    assert.match(customerTracking, /Cache-Control/);
    assert.match(access, /license_activations/);
    assert.match(adminUi, /api\/admin\/orders/);
    assert.doesNotMatch(adminUi, /localStorage|updateStoredOrderStatus/);
    assert.match(migration, /entitlements_order_item_uidx/);
    assert.match(schema, /orders_status_check/);
  }],
  ["manual license activations enforce limits and support domain order search", async () => {
    const [schema, activationApi, licenseApi, orderListApi, orderAccess, migration, adminUi] = await Promise.all([
      read("db/schema.ts"), read("app/api/admin/orders/[id]/activations/route.ts"),
      read("app/api/admin/orders/[id]/license/route.ts"),
      read("app/api/admin/orders/route.ts"), read("app/server/orderAccess.ts"),
      read("drizzle/0004_license_activations.sql"), read("app/admin/AdminPortal.tsx"),
    ]);
    assert.match(schema, /export const licenseActivations/);
    assert.match(schema, /license_activations_entitlement_domain_uidx/);
    assert.match(schema, /activationLimit/);
    assert.match(activationApi, /isAdminRequest/);
    assert.match(activationApi, /normalizeDomain/);
    assert.match(activationApi, /Activation limit reached/);
    assert.match(activationApi, /license_activation_history/);
    assert.match(licenseApi, /isAdminRequest/);
    assert.match(licenseApi, /UPDATE entitlements SET license_id/);
    assert.match(orderListApi, /a\.domain ILIKE/);
    assert.match(orderListApi, /e\.license_id ILIKE/);
    assert.match(orderListApi, /product_names/);
    assert.match(orderListApi, /active_domains/);
    assert.match(orderAccess, /license_activations/);
    assert.match(migration, /UPDATE "product_variations"/);
    assert.match(migration, /UPDATE "entitlements"/);
    assert.match(adminUi, /License Summary/);
    assert.match(adminUi, /Add domain/);
  }],
  ["product reviews are database-backed and require admin approval", async () => {
    const [schema, migration, route, productPage, adminProducts] = await Promise.all([
      read("db/schema.ts"), read("drizzle/0010_product_reviews.sql"),
      read("app/api/products/[id]/reviews/route.ts"), read("app/product/page.tsx"),
      read("app/admin/AdminProducts.tsx"),
    ]);
    assert.match(schema, /export const productReviews/);
    assert.match(migration, /CREATE TABLE "product_reviews"/);
    assert.match(route, /isAdminRequest/);
    assert.match(route, /status='approved'/);
    assert.match(route, /review_count/);
    assert.match(route, /product_review_submissions/);
    assert.match(route, /Too many review submissions/);
    assert.match(productPage, /submitted for approval/);
    assert.match(adminProducts, /Customer reviews/);
    assert.match(adminProducts, /moderateReview/);
  }],
  ["customer review directory lists approved reviews newest first with pagination", async () => {
    const [route, page, footer] = await Promise.all([
      read("app/api/reviews/route.ts"), read("app/customer-reviews/page.tsx"),
      read("app/SiteFooter.tsx"),
    ]);
    assert.match(route, /status='approved'/);
    assert.match(route, /ORDER BY r\.created_at DESC/);
    assert.match(route, /const PAGE_SIZE = 20/);
    assert.match(page, /api\/reviews\?page=/);
    assert.match(page, /Purchased/);
    assert.match(page, /Page \{page\} of \{pages\}/);
    assert.match(footer, /customer-reviews/);
  }],
  ["public pages use the shared footer without legacy hidden copies", async () => {
    const [home, legacyProduct, styles] = await Promise.all([
      read("app/page.tsx"), read("app/products/elementor-pro/page.tsx"), read("app/globals.css"),
    ]);
    assert.match(home, /<SiteFooter\s*\/>/);
    assert.match(legacyProduct, /<SiteFooter\s*\/>/);
    assert.doesNotMatch(home, /premium-footer-grid/);
    assert.doesNotMatch(legacyProduct, /legacy-footer/);
    assert.doesNotMatch(styles, /\.legacy-footer/);
  }],
  ["the production target is standard Next.js standalone", async () => {
    const [packageJson, nextConfig] = await Promise.all([
      read("package.json"),
      read("next.config.ts"),
    ]);

    assert.match(packageJson, /"dev": "next dev"/);
    assert.match(packageJson, /"build": "next build"/);
    assert.match(packageJson, /"start": "next start"/);
    assert.doesNotMatch(packageJson, /vinext|wrangler|@cloudflare/);
    assert.match(nextConfig, /output:\s*["']standalone["']/);
  }],
];

for (const [name, check] of checks) {
  await check();
  console.log(`✓ ${name}`);
}
