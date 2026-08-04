import { customerId } from "@/app/customer-auth";
import { getPool } from "@/db";

export async function GET(request: Request) {
  const customer = customerId(request);
  if (!customer) return Response.json({ ok: false, error: "Sign in to view downloads." }, { status: 401 });
  const result = await getPool().query(`SELECT e.id,e.license_id AS "licenseId",e.item_key AS "itemKey",e.variation,e.created_at AS "createdAt",
      oi.name,o.order_number AS "orderNumber",o.completed_at AS "completedAt"
    FROM entitlements e
    JOIN order_items oi ON oi.id=e.order_item_id
    JOIN orders o ON o.id=e.order_id
    WHERE e.customer_id=$1 AND e.status='active' AND o.status='completed' AND e.download_url IS NOT NULL AND trim(e.download_url) <> ''
    ORDER BY o.completed_at DESC NULLS LAST,e.created_at DESC`, [customer]);
  return Response.json({ ok: true, downloads: result.rows }, { headers: { "Cache-Control": "no-store" } });
}
