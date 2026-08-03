import { isAdminRequest } from "@/app/admin-auth";
import { isOrderStatus } from "@/app/server/orderAccess";
import { getPool } from "@/db";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url), search = (url.searchParams.get("search") || "").trim().slice(0, 120), status = url.searchParams.get("status") || "";
  if (status && !isOrderStatus(status)) return Response.json({ ok: false, error: "Invalid status" }, { status: 400 });
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 15));
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1), values: unknown[] = [], clauses: string[] = [];
  if (status) { values.push(status); clauses.push(`o.status=$${values.length}`); }
  if (search) { values.push(`%${search}%`); clauses.push(`(o.order_number ILIKE $${values.length} OR c.name ILIKE $${values.length} OR c.email ILIKE $${values.length} OR p.transaction_id ILIKE $${values.length} OR EXISTS (SELECT 1 FROM entitlements e LEFT JOIN license_activations a ON a.entitlement_id=e.id WHERE e.order_id=o.id AND (e.license_id ILIKE $${values.length} OR a.domain ILIKE $${values.length})))`); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const totalResult = await getPool().query(`SELECT count(*)::int AS count FROM orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN payment_submissions p ON p.order_id=o.id ${where}`, values);
  const queryValues = [...values, limit, (page - 1) * limit];
  const result = await getPool().query(`SELECT o.id,o.order_number AS number,o.status,o.total,o.currency,o.payment_method AS payment,o.created_at,c.name AS customer_name,c.email AS customer_email,p.transaction_id,p.status AS payment_status,
    (SELECT string_agg(oi.name,' · ' ORDER BY oi.id) FROM order_items oi WHERE oi.order_id=o.id) AS product_names,
    (SELECT count(*)::int FROM license_activations a JOIN entitlements e ON e.id=a.entitlement_id WHERE e.order_id=o.id AND a.status='active') AS active_domains
    FROM orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN payment_submissions p ON p.order_id=o.id ${where} ORDER BY o.created_at DESC LIMIT $${queryValues.length - 1} OFFSET $${queryValues.length}`, queryValues);
  const counts = await getPool().query("SELECT status,count(*)::int AS count FROM orders GROUP BY status");
  const financialResult = await getPool().query(`SELECT
    COALESCE(sum(total) FILTER (WHERE status='completed'),0)::bigint AS lifetime_revenue,
    COALESCE(sum(total) FILTER (WHERE status='refunded'),0)::bigint AS refunded_total,
    COALESCE(sum(total) FILTER (WHERE status='completed' AND (COALESCE(completed_at,created_at)::timestamptz AT TIME ZONE 'Asia/Dhaka')::date=(now() AT TIME ZONE 'Asia/Dhaka')::date),0)::bigint AS today_revenue,
    COALESCE(sum(total) FILTER (WHERE status='completed' AND date_trunc('week',COALESCE(completed_at,created_at)::timestamptz AT TIME ZONE 'Asia/Dhaka')=date_trunc('week',now() AT TIME ZONE 'Asia/Dhaka')),0)::bigint AS week_revenue,
    COALESCE(sum(total) FILTER (WHERE status='completed' AND date_trunc('month',COALESCE(completed_at,created_at)::timestamptz AT TIME ZONE 'Asia/Dhaka')=date_trunc('month',now() AT TIME ZONE 'Asia/Dhaka')),0)::bigint AS month_revenue,
    count(*) FILTER (WHERE status='completed')::int AS completed_count,
    count(*) FILTER (WHERE status='completed' AND (COALESCE(completed_at,created_at)::timestamptz AT TIME ZONE 'Asia/Dhaka')::date=(now() AT TIME ZONE 'Asia/Dhaka')::date)::int AS today_count,
    count(*) FILTER (WHERE status='completed' AND date_trunc('week',COALESCE(completed_at,created_at)::timestamptz AT TIME ZONE 'Asia/Dhaka')=date_trunc('week',now() AT TIME ZONE 'Asia/Dhaka'))::int AS week_count,
    count(*) FILTER (WHERE status='completed' AND date_trunc('month',COALESCE(completed_at,created_at)::timestamptz AT TIME ZONE 'Asia/Dhaka')=date_trunc('month',now() AT TIME ZONE 'Asia/Dhaka'))::int AS month_count
    FROM orders`);
  const financialRow=financialResult.rows[0],financials={lifetimeRevenue:Number(financialRow.lifetime_revenue),refundedTotal:Number(financialRow.refunded_total),todayRevenue:Number(financialRow.today_revenue),weekRevenue:Number(financialRow.week_revenue),monthRevenue:Number(financialRow.month_revenue),completedCount:Number(financialRow.completed_count),todayCount:Number(financialRow.today_count),weekCount:Number(financialRow.week_count),monthCount:Number(financialRow.month_count)};
  return Response.json({ ok: true, orders: result.rows.map((row) => ({ id: row.id, number: row.number, status: row.status, total: Number(row.total), currency: row.currency, payment: row.payment, createdAt: row.created_at, transactionId: row.transaction_id, paymentStatus: row.payment_status, productNames: row.product_names ? String(row.product_names).split(" · ") : [], activeDomains: Number(row.active_domains), customer: { name: row.customer_name, email: row.customer_email } })), counts: Object.fromEntries(counts.rows.map((row) => [row.status, Number(row.count)])), financials, pagination: { page, limit, total: Number(totalResult.rows[0].count), pages: Math.max(1, Math.ceil(Number(totalResult.rows[0].count) / limit)) } });
}
