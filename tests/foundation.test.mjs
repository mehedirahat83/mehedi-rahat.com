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
