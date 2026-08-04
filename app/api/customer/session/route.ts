import { clearCustomerCookie, customerId, now } from "@/app/customer-auth";
import { membershipFor } from "@/app/membership";
import { getPool } from "@/db";

async function account(request: Request) {
  const id = customerId(request);
  if (!id) return null;
  const result = await getPool().query("SELECT id,name,email,phone,lifetime_spend AS \"lifetimeSpend\",created_at AS \"createdAt\" FROM customers WHERE id=$1", [id]);
  return result.rows[0] || null;
}
export async function GET(request: Request) {
  const customer = await account(request);
  if (!customer) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const pool = getPool();
  const [latest, counts, downloads, tickets, recentSupport, recentTickets, activationRequests] = await Promise.all([
    pool.query(`SELECT o.order_number AS number,o.status,o.payment_method AS payment,o.total,o.created_at AS "createdAt",
      COALESCE(string_agg(DISTINCT oi.name, ', '), '') AS products
      FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id
      WHERE o.customer_id=$1 GROUP BY o.id ORDER BY o.created_at DESC,o.id DESC LIMIT 3`, [customer.id]),
    pool.query(`SELECT COUNT(*)::int AS "orderCount",
      COUNT(*) FILTER (WHERE status='completed')::int AS "completedOrderCount"
      FROM orders WHERE customer_id=$1`, [customer.id]),
    pool.query(`SELECT COUNT(*)::int AS "downloadCount"
      FROM entitlements e JOIN orders o ON o.id=e.order_id
      WHERE e.customer_id=$1 AND e.status='active' AND o.status='completed' AND e.download_url IS NOT NULL AND trim(e.download_url)<>''`, [customer.id]),
    pool.query(`SELECT COUNT(*) FILTER (WHERE status <> 'closed')::int AS "supportTicketCount" FROM support_tickets WHERE customer_id=$1`, [customer.id]),
    pool.query(`SELECT m.id,m.author_type AS "authorType",m.author_name AS "authorName",m.body,m.created_at AS "createdAt",t.subject,o.order_number AS "orderNumber"
      FROM support_ticket_messages m
      JOIN support_tickets t ON t.id=m.ticket_id
      JOIN orders o ON o.id=t.order_id
      WHERE t.customer_id=$1
      ORDER BY m.created_at DESC,m.id DESC LIMIT 3`, [customer.id]),
    pool.query(`SELECT t.id,t.subject,t.status,t.priority,t.updated_at AS "updatedAt",o.order_number AS "orderNumber"
      FROM support_tickets t JOIN orders o ON o.id=t.order_id
      WHERE t.customer_id=$1 ORDER BY t.updated_at DESC,t.id DESC LIMIT 3`, [customer.id]),
    pool.query(`SELECT COUNT(*) FILTER (WHERE status='pending')::int AS "activationRequestCount" FROM activation_requests WHERE customer_id=$1`, [customer.id]),
  ]);
  const summary = counts.rows[0] || { orderCount: 0, completedOrderCount: 0 };
  const recentOrders = latest.rows.map((row) => ({ ...row, total: Number(row.total) }));
  return Response.json({ ok: true, customer, latestOrder: recentOrders[0] || null, recentOrders, recentSupport: recentSupport.rows, recentTickets: recentTickets.rows, dashboard: { orderCount: Number(summary.orderCount || 0), completedOrderCount: Number(summary.completedOrderCount || 0), downloadCount: Number(downloads.rows[0]?.downloadCount || 0), supportTicketCount: Number(tickets.rows[0]?.supportTicketCount || 0), activationRequestCount: Number(activationRequests.rows[0]?.activationRequestCount || 0) }, membership: await membershipFor(Number(customer.lifetimeSpend) || 0) }, { headers: { "Cache-Control": "no-store" } });
}
export async function PATCH(request: Request) {
  const customer = await account(request); if (!customer) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0,100) : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim().slice(0,30) : "";
  if (name.length < 2 || phone.length < 6) return Response.json({ ok: false, error: "Enter a valid name and phone number." }, { status: 400 });
  const result = await getPool().query("UPDATE customers SET name=$1,phone=$2,updated_at=$3 WHERE id=$4 RETURNING id,name,email,phone,lifetime_spend AS \"lifetimeSpend\",created_at AS \"createdAt\"", [name, phone, now(), customer.id]);
  return Response.json({ ok: true, customer: result.rows[0] });
}
export async function DELETE() { return Response.json({ ok: true }, { headers: { "Set-Cookie": clearCustomerCookie() } }); }
