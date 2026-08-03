import { isAdminRequest } from "@/app/admin-auth";
import { getPool } from "@/db";
import { membershipFor } from "@/app/membership";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const search = (url.searchParams.get("search") || "").trim().slice(0, 120);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const values: unknown[] = [];
  const where = search ? (() => { values.push(`%${search}%`); return `WHERE c.name ILIKE $1 OR c.email ILIKE $1 OR c.phone ILIKE $1`; })() : "";
  const pool = getPool();
  const [total, rows, stats] = await Promise.all([
    pool.query(`SELECT count(*)::int AS count FROM customers c ${where}`, values),
    pool.query(`SELECT c.id,c.name,c.email,c.phone,c.lifetime_spend AS "lifetimeSpend",c.created_at AS "createdAt",
      (a.customer_id IS NOT NULL) AS "hasAccount",count(o.id)::int AS "orderCount",max(o.created_at) AS "lastOrderAt"
      FROM customers c LEFT JOIN customer_accounts a ON a.customer_id=c.id LEFT JOIN orders o ON o.customer_id=c.id
      ${where} GROUP BY c.id,a.customer_id ORDER BY c.lifetime_spend DESC,max(o.created_at) DESC NULLS LAST,c.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, (page - 1) * limit]),
    pool.query(`SELECT count(*)::int AS total,
      count(*) FILTER (WHERE EXISTS (SELECT 1 FROM customer_accounts a WHERE a.customer_id=c.id))::int AS registered,
      count(*) FILTER (WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id))::int AS purchasers,
      count(*) FILTER (WHERE c.lifetime_spend>0)::int AS paying
      FROM customers c`),
  ]);
  const count = Number(total.rows[0].count);
  const customers = await Promise.all(rows.rows.map(async row => { const lifetimeSpend = Number(row.lifetimeSpend); const membership = await membershipFor(lifetimeSpend); return { ...row, lifetimeSpend, orderCount: Number(row.orderCount), membership: { level: membership.level, discountPercent: membership.current.discountPercent } }; }));
  return Response.json({ ok: true, customers, stats: stats.rows[0], pagination: { page, limit, total: count, pages: Math.max(1, Math.ceil(count / limit)) } });
}
