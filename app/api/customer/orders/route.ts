import { customerId } from "@/app/customer-auth";
import { getPool } from "@/db";

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const customer = customerId(request);
  if (!customer) return Response.json({ ok: false, error: "Sign in to view orders." }, { status: 401 });
  const pageValue = Number(new URL(request.url).searchParams.get("page") || "1");
  const page = Number.isFinite(pageValue) ? Math.max(1, Math.floor(pageValue)) : 1;
  const offset = (page - 1) * PAGE_SIZE;
  const pool = getPool();
  const [count, result] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE customer_id=$1", [customer]),
    pool.query(`SELECT o.order_number AS number,o.status,o.payment_method AS payment,o.total,o.created_at AS "createdAt",o.completed_at AS "completedAt",
      COALESCE(string_agg(DISTINCT oi.name, ', '), '') AS products
      FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
      WHERE o.customer_id=$1
      GROUP BY o.id
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT $2 OFFSET $3`, [customer, PAGE_SIZE, offset]),
  ]);
  const total = Number(count.rows[0]?.count || 0);
  return Response.json({ ok: true, orders: result.rows.map((row) => ({ ...row, total: Number(row.total) })), page, pageSize: PAGE_SIZE, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) }, { headers: { "Cache-Control": "no-store" } });
}
