import { customerId } from "@/app/customer-auth";
import { getPool } from "@/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const customer = customerId(request);
  if (!customer) return Response.json({ ok: false, error: "Sign in to download this product." }, { status: 401 });
  const id = (await context.params).id.trim().slice(0, 120);
  const result = await getPool().query(`SELECT e.download_url FROM entitlements e JOIN orders o ON o.id=e.order_id
    WHERE e.id=$1 AND e.customer_id=$2 AND e.status='active' AND o.status='completed'`, [id, customer]);
  const downloadUrl = String(result.rows[0]?.download_url || "").trim();
  if (!downloadUrl) return Response.json({ ok: false, error: "This download is not available." }, { status: 404 });
  try {
    const target = new URL(downloadUrl, request.url);
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error("Unsafe download URL");
    return Response.redirect(target, 302);
  } catch { return Response.json({ ok: false, error: "This download link is invalid." }, { status: 400 }); }
}
