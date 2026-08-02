import { isAdminRequest } from "@/app/admin-auth";
import { isOrderStatus, loadOrder } from "@/app/server/orderAccess";
import { getPool } from "@/db";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params, client = await getPool().connect();
  try { const order = await loadOrder(client, "id", id, true); return order ? Response.json({ ok: true, order }) : Response.json({ ok: false, error: "Order not found" }, { status: 404 }); } finally { client.release(); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params, body = await request.json().catch(() => null) as { action?: unknown; note?: unknown } | null, action = body?.action;
  const target = action === "approve" ? "completed" : action === "hold" ? "on_hold" : action === "reject" ? "rejected" : action === "refund" ? "refunded" : action;
  if (!isOrderStatus(target)) return Response.json({ ok: false, error: "Invalid order action" }, { status: 400 });
  const note = String(body?.note || "").trim().slice(0, 1000) || `Payment ${String(action)}`, client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const current = await client.query<{ status: string; customer_id: string }>("SELECT status,customer_id FROM orders WHERE id=$1 FOR UPDATE", [id]);
    if (!current.rows[0]) { await client.query("ROLLBACK"); return Response.json({ ok: false, error: "Order not found" }, { status: 404 }); }
    const fromStatus = current.rows[0].status;
    if (action === "refund" && fromStatus !== "completed") { await client.query("ROLLBACK"); return Response.json({ ok: false, error: "Only a completed order can be refunded." }, { status: 409 }); }
    if (fromStatus === "refunded" && target !== "refunded") { await client.query("ROLLBACK"); return Response.json({ ok: false, error: "A refunded order cannot be reopened." }, { status: 409 }); }
    if (fromStatus !== target) {
      const now = new Date().toISOString();
      await client.query("UPDATE orders SET status=$2,updated_at=$3,completed_at=CASE WHEN $2='completed' THEN COALESCE(completed_at,$3) ELSE completed_at END WHERE id=$1", [id, target, now]);
      await client.query("UPDATE payment_submissions SET status=$2,verified_by='admin',verified_at=$3 WHERE order_id=$1", [id, target === "completed" ? "approved" : target === "rejected" ? "rejected" : target === "refunded" ? "refunded" : "held", now]);
      await client.query("INSERT INTO order_status_history (id,order_id,from_status,to_status,note,actor,created_at) VALUES ($1,$2,$3,$4,$5,'admin',$6)", [crypto.randomUUID(), id, fromStatus, target, note, now]);
      if (target === "completed") {
        await client.query(`INSERT INTO entitlements (id,customer_id,order_id,order_item_id,item_key,variation,license_id,activation_limit,status,download_url,created_at)
          SELECT gen_random_uuid()::text,o.customer_id,o.id,oi.id,oi.item_key,oi.variation,NULL,COALESCE(pv.activation_limit,1)*oi.quantity,'active',p.download_url,$2
          FROM orders o JOIN order_items oi ON oi.order_id=o.id LEFT JOIN products p ON p.id=oi.item_key LEFT JOIN product_variations pv ON pv.product_id=oi.item_key AND pv.label=oi.variation WHERE o.id=$1
          ON CONFLICT (order_item_id) DO UPDATE SET status='active',download_url=EXCLUDED.download_url,activation_limit=EXCLUDED.activation_limit`, [id, now]);
      } else {
        await client.query("UPDATE entitlements SET status='revoked' WHERE order_id=$1", [id]);
        await client.query(`INSERT INTO license_activation_history (id,activation_id,from_status,to_status,note,actor,created_at)
          SELECT gen_random_uuid()::text,a.id,a.status,'revoked',$2,'admin',$3 FROM license_activations a JOIN entitlements e ON e.id=a.entitlement_id WHERE e.order_id=$1 AND a.status<>'revoked'`, [id, target === "refunded" ? "Order refunded; activation revoked" : `Order changed to ${target}; activation revoked`, now]);
        await client.query("UPDATE license_activations SET status='revoked',updated_at=$2 WHERE entitlement_id IN (SELECT id FROM entitlements WHERE order_id=$1) AND status<>'revoked'", [id, now]);
      }
      await client.query("UPDATE customers SET lifetime_spend=(SELECT COALESCE(sum(total),0) FROM orders WHERE customer_id=$1 AND status='completed'),updated_at=$2 WHERE id=$1", [current.rows[0].customer_id, now]);
    }
    await client.query("COMMIT");
    return Response.json({ ok: true, order: await loadOrder(client, "id", id, true) });
  } catch (error) { await client.query("ROLLBACK").catch(() => undefined); return Response.json({ ok: false, error: error instanceof Error ? error.message : "Order update failed" }, { status: 500 }); } finally { client.release(); }
}
