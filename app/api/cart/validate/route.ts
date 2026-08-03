import { calculateOrderTotals, resolveCheckoutItems } from "@/app/server/orderCatalog";
import { customerId } from "@/app/customer-auth";
import { membershipFor } from "@/app/membership";
import { getPool } from "@/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    items?: unknown;
    couponCode?: unknown;
    paymentMethod?: unknown;
  } | null;
  try {
    const items = await resolveCheckoutItems(
      Array.isArray(body?.items) ? body.items : [],
      0,
    );
    const id = customerId(request); const profile = id ? await getPool().query<{ lifetime_spend:number }>('SELECT lifetime_spend FROM customers WHERE id=$1',[id]) : null;
    const membership = await membershipFor(Number(profile?.rows[0]?.lifetime_spend || 0));
    const totals = calculateOrderTotals(
      items,
      String(body?.couponCode ?? ""),
      String(body?.paymentMethod ?? ""), membership.current.discountPercent,
    );
    return Response.json({ ok: true, items, totals }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : "The cart could not be validated.",
    }, { status: 400 });
  }
}
