import { customerId } from "@/app/customer-auth";
import { encryptActivationPassword } from "@/app/server/activationCredentials";
import { getPool } from "@/db";
import { adminNotificationEmail, sendSupportTicketEmail } from "@/app/server/mail";

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

export async function GET(request: Request) {
  const customer = customerId(request);
  if (!customer) return Response.json({ ok: false, error: "Sign in to view activation requests." }, { status: 401 });
  const pool = getPool();
  const [orders, requests, history] = await Promise.all([
    pool.query(`SELECT o.id,o.order_number AS "orderNumber",o.status,o.created_at AS "createdAt",COALESCE(string_agg(DISTINCT oi.name, ', '),'') AS products
      FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE o.customer_id=$1 AND o.status NOT IN ('rejected','refunded') GROUP BY o.id ORDER BY o.created_at DESC,o.id DESC`, [customer]),
    pool.query(`SELECT r.id,r.order_id AS "orderId",r.website_login_url AS "websiteLoginUrl",r.username,r.customer_note AS "customerNote",r.admin_note AS "adminNote",r.status,r.created_at AS "createdAt",r.updated_at AS "updatedAt",o.order_number AS "orderNumber",COALESCE(string_agg(DISTINCT oi.name, ', '),'') AS products
      FROM activation_requests r JOIN orders o ON o.id=r.order_id LEFT JOIN order_items oi ON oi.order_id=o.id WHERE r.customer_id=$1 GROUP BY r.id,o.order_number ORDER BY r.created_at DESC,r.id DESC`, [customer]),
    pool.query(`SELECT h.id,h.request_id AS "requestId",h.from_status AS "fromStatus",h.to_status AS "toStatus",h.note,h.actor,h.created_at AS "createdAt" FROM activation_request_history h JOIN activation_requests r ON r.id=h.request_id WHERE r.customer_id=$1 ORDER BY h.created_at DESC,h.id DESC`, [customer]),
  ]);
  return Response.json({ ok: true, orders: orders.rows, requests: requests.rows.map((item) => ({ ...item, history: history.rows.filter((entry) => entry.requestId === item.id) })) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const customer = customerId(request);
  if (!customer) return Response.json({ ok: false, error: "Sign in to request activation." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const orderId = clean(body?.orderId, 120); const loginUrl = clean(body?.loginUrl, 500); const username = clean(body?.username, 254); const password = clean(body?.password, 500); const note = clean(body?.note, 1000);
  if (!orderId || !loginUrl || !username || !password) return Response.json({ ok: false, error: "Order number, website login link, username and password are required." }, { status: 400 });
  try { const parsed = new URL(loginUrl); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); } catch { return Response.json({ ok: false, error: "Enter a valid website login link." }, { status: 400 }); }
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const order = await client.query<{ id: string; order_number: string; name: string }>("SELECT o.id,o.order_number,c.name FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.id=$1 AND o.customer_id=$2 AND o.status NOT IN ('rejected','refunded') FOR UPDATE", [orderId, customer]);
    if (!order.rows[0]) { await client.query("ROLLBACK"); return Response.json({ ok: false, error: "That order is not available for activation." }, { status: 404 }); }
    const now = new Date().toISOString(); const id = crypto.randomUUID();
    await client.query("INSERT INTO activation_requests (id,order_id,customer_id,website_login_url,username,password_encrypted,customer_note,status,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,$8)", [id, orderId, customer, loginUrl, username, encryptActivationPassword(password), note || null, now]);
    await client.query("INSERT INTO activation_request_history (id,request_id,from_status,to_status,note,actor,created_at) VALUES ($1,$2,NULL,'pending',$3,'customer',$4)", [crypto.randomUUID(), id, note || "Website access submitted by customer", now]);
    await client.query("UPDATE orders SET activation_login_url=$1,activation_username=$2,activation_password_encrypted=$3,updated_at=$4 WHERE id=$5", [loginUrl, username, encryptActivationPassword(password), now, orderId]);
    await client.query("COMMIT");
    void adminNotificationEmail().then((adminEmail) => adminEmail ? sendSupportTicketEmail({
      to: adminEmail,
      subject: `Activation request · ${order.rows[0].order_number}`,
      message: `${order.rows[0].name} submitted an activation request for ${order.rows[0].order_number}. Review the website access securely in the admin dashboard.`,
    }).catch(() => undefined) : undefined).catch(() => undefined);
    return Response.json({ ok: true, message: "Website access was sent for activation review." }, { status: 201 });
  } catch (error) { await client.query("ROLLBACK").catch(() => undefined); return Response.json({ ok: false, error: error instanceof Error ? error.message : "Activation request could not be submitted." }, { status: 500 }); } finally { client.release(); }
}
