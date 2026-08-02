import { hashReceiptToken, loadOrder, receiptToken } from "@/app/server/orderAccess";
import { getPool } from "@/db";

export async function GET(request: Request, context: { params: Promise<{ number: string }> }) {
  const token = receiptToken(request);
  if (token.length < 32) return Response.json({ ok: false, error: "A valid tracking token is required" }, { status: 401 });
  const { number } = await context.params, client = await getPool().connect();
  try { const allowed = await client.query("SELECT 1 FROM orders WHERE order_number=$1 AND receipt_token_hash=$2", [number, hashReceiptToken(token)]); if (!allowed.rows[0]) return Response.json({ ok: false, error: "Order not found" }, { status: 404 }); return Response.json({ ok: true, order: await loadOrder(client, "number", number) }, { headers: { "Cache-Control": "no-store" } }); } finally { client.release(); }
}
