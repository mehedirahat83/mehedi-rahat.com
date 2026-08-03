import { customerId } from "@/app/customer-auth";
import { loadOrder } from "@/app/server/orderAccess";
import { getPool } from "@/db";
type RouteContext = { params: Promise<{ number: string }> };
export async function GET(request: Request, context: RouteContext) {
  const customer = customerId(request); if (!customer) return Response.json({ ok: false, error: "Sign in to view your order." }, { status: 401 });
  const number = decodeURIComponent((await context.params).number).trim().slice(0, 80);
  const client = await getPool().connect();
  try { const allowed = await client.query("SELECT 1 FROM orders WHERE order_number=$1 AND customer_id=$2", [number, customer]); if (!allowed.rows[0]) return Response.json({ ok: false, error: "Order not found." }, { status: 404 }); return Response.json({ ok: true, order: await loadOrder(client, "number", number) }, { headers: { "Cache-Control": "no-store" } }); } finally { client.release(); }
}
